import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='reconciliacao-pf-medicina-legal-copia-portal-v241',oficial='6e979c4f094638c0',copia='8243beb2dc62e04e'
const fontes=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8'))
const canon=fontes.find(x=>x.id===oficial),mirror=fontes.find(x=>x.id===copia)
if(canon?.questoes.length!==70||mirror?.questoes.length!==70)throw Error('Esperados 70 itens nos dois documentos')
const i=raizesAtuais.findIndex(x=>x.includes('revisao-pf-medicina-legal-2025-v240'));if(i<0)throw Error('Base v240 ausente')
const base=raizesAtuais[i],bases=raizesAtuais.slice(i),ids=new Set([...canon.questoes,...mirror.questoes].map(x=>x.id)),byId=new Map()
for await(const lote of lotesAtuais(bases))for(const q of lote.questoes)if(ids.has(q.id)){byId.set(q.id,q);ids.delete(q.id)}
if(ids.size)throw Error(`Registros ausentes: ${ids.size}`)
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR'),officialByNumber=new Map(canon.questoes.map(x=>[x.numero,x]))
const decisoes=[]
for(const e of mirror.questoes){const o=officialByNumber.get(e.numero),q=byId.get(e.id),oq=byId.get(o?.id)
 if(!o||!oq||norm(q.enunciado)!==norm(oq.enunciado))throw Error(`Não confirmou duplicata idêntica na questão ${e.numero}`)
 const img=`paginas/${copia}-${String(e.pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${img}`)
 decisoes.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:oq.materia,conteudo:oq.conteudo,ano:2025,concurso:oq.concurso,numero_original:e.numero,pagina:e.pagina,
  dificuldade:oq.dificuldade||'Média',dificuldade_estimada:oq.dificuldade_estimada===true,dificuldade_evidencia:oq.dificuldade_evidencia,
  classificacao_fonte:{documento:mirror.arquivo,prova:mirror.url,fonte_canonica:canon.url,metodo:'Comparação literal normalizada dos 70 enunciados com o caderno oficial Cebraspe; correspondência integral por número.'},
  visual:{pagina:e.pagina,imagem:img,motivo:'Página do espelho hospedado no portal da PF; texto integralmente coincidente com a questão canônica do caderno oficial Cebraspe.'},
  texto_apoio:oq.texto_apoio,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],apta_resolucao:false,
  duplicada_de:o.id,inelegibilidade_motivo:`Cópia integral do item ${e.numero}; questão canônica elegível ${o.id}, do caderno oficial Cebraspe, permanece no acervo.`})
}
const out=await aplicarRevisoesIndividuais({nome,base,decisoes})
console.log(JSON.stringify({...out,documento:mirror.arquivo,registros_comparados:70,coincidencias_exatas:70,duplicatas_sinalizadas:70,paginas_vinculadas:70,publicado:false},null,2))
