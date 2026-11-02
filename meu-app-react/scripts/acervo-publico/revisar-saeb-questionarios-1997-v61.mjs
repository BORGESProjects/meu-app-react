import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'

const sha=x=>createHash('sha256').update(x).digest('hex')
const fontes={
 '41e274e2557fc3f0':{arquivo:'tmp/revisao-profissional/fontes-texto/41e274e2557fc3f0.json.gz',url:'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_1997_matematica_8_serie_do_ensino_fundamental_cadernos.pdf'},
 '3a0a61c29b9f1633':{arquivo:'tmp/revisao-profissional/fontes-texto/3a0a61c29b9f1633.json.gz',url:'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_1997_biologia_3_serie_ensino_medio_cadernos_prova.pdf'},
 '877d6d814f940810':{arquivo:'tmp/revisao-profissional/fontes-texto/877d6d814f940810.json.gz',url:'https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_1997_ciencias_8_serie_do_ensino_fundamental_cadernos_de_prova.pdf'},
}
const norm=s=>String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase()
const paginas={}
for(const [id,f] of Object.entries(fontes))paginas[id]=JSON.parse(zlib.gunzipSync(await fs.readFile(f.arquivo))).map(norm)
function formulario(q,textos){
 const num=Number(q.numero_original),p=Number(q.pagina)-1
 if(!Number.isInteger(num)||num<1||num>40||!Number.isInteger(p))return false
 const nearby=[textos[p-1]||'',textos[p]||'',textos[p+1]||''].join(' ')
 if(!nearby.includes('questionario')||!nearby.includes('aluno'))return false
 const s=norm(q.enunciado)
 const consulta=/\b(qual|quais|que idade|como|quanto|quantas|quantos|em que|com quem|caso voce|voce|seu|sua|seus|suas)\b/.test(s)
 const contexto=/professor|desempenho|gosta|costuma|aulas|escola|casa|pai|mae|familia|nascimento|idade|trabalho|faltas|estuda|computador|televisao/.test(s)
 return consulta&&contexto
}
const base=raizesAtuais[0],inicio=raizesAtuais.indexOf(base)
const bases=raizesAtuais.slice(inicio),destino='tmp/revisao-profissional/revisao-saeb-questionarios-v61/acervo-extraido'
const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),facetas=criarIndiceFacetas(),historico=[]
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
let total=0,disponiveis=0,pendentes=0,lotesMudados=0,bytes=0
const contagens=Object.fromEntries(Object.keys(fontes).map(id=>[id,0]))
for await(const {indice,questoes,lote} of lotesAtuais(bases)){
 let mudou=false
 for(const q of questoes){
  total++
  const id=q.documento_id
  if(fontes[id]&&q.integridade_profissional?.apta_resolucao!==false&&formulario(q,paginas[id])){
   assert.ok(q.enunciado?.trim());assert.ok(Number(q.ano)===1997)
   const antes=structuredClone(q),fonte=fontes[id],pagina=Number(q.pagina),imagem=q.pagina_imagem||`paginas/${id}-${String(pagina).padStart(4,'0')}.webp`
   await fs.access(path.join('public/acervo-extraido',imagem))
   const motivo='Questionário de contexto/opinião do aluno, identificado pelo cabeçalho Questionário de Aluno na página original e pela pergunta autorreferencial. Não mede conhecimento curricular e não apresenta resposta correta para prática; preservado para rastreabilidade, mas excluído da resolução.'
   q.integridade_profissional={...q.integridade_profissional,apta_resolucao:false,correcao_automatica:false,verificada_individualmente:true,pendencias:[...new Set([...(q.integridade_profissional?.pendencias||[]),'questionario_de_contexto_sem_gabarito'])]}
   q.elegibilidade={...q.elegibilidade,elegivel_para_resolucao:false,elegivel_para_correcao_automatica:false,apontamentos:[...new Set([...(q.elegibilidade?.apontamentos||[]),'questionario_de_contexto_sem_gabarito'])]}
   q.revisao_elegibilidade={motivo,metodo:'Leitura da pergunta e conferência do cabeçalho do formulário na página original',documento:id,pagina,url:fonte.url,imagem,sha256_imagem:sha(await fs.readFile(path.join('public/acervo-extraido',imagem)))}
   historico.push({id:q.id,antes,depois:structuredClone(q)});mudou=true;contagens[id]++
  }
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
  if(q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false&&!q.classificacao_revisada)pendentes++
 }
 facetas.adicionar(indice,questoes)
 if(mudou){const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});const arquivo=`lotes/saeb-formulario-${indice}-${sha(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),b);m.lotes[indice].arquivo=arquivo;lotesMudados++;bytes+=b.length}
}
const alteradas=Object.values(contagens).reduce((a,b)=>a+b,0)
assert.ok(alteradas>=450&&alteradas<=550,`Quantidade inesperada de formulários: ${alteradas}`)
assert.equal(total,m.questoes_extraidas_unicas)
assert.equal(disponiveis,m.questoes_disponiveis_resolucao-alteradas)
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),arquivo=`lotes/filtros-saeb-formularios-${sha(fb).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,arquivo),fb);m.indice_facetas={arquivo,sha256:sha(fb),versao:1};m.questoes_disponiveis_resolucao=disponiveis;m.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const relatorio={gerado_em:m.gerado_em,total,questionarios_excluidos_da_resolucao:alteradas,por_documento:contagens,disponiveis,pendentes,lotes_alterados:lotesMudados,bytes,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-saeb-questionarios-v61.json',JSON.stringify(relatorio,null,2));await fs.writeFile('docs/acervo/revisao-profissional/revisao-saeb-questionarios-v61-alteracoes.json.gz',zlib.gzipSync(JSON.stringify(historico),{level:9}));console.log(JSON.stringify(relatorio))
