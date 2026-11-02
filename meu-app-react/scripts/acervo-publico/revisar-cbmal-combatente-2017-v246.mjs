import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='7d188636be59b178',fonte='https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/340_CBMAL_CB2_01.pdf'
const edital='https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/ED_1_2017_CBM_AL_17_COMBATENTE_ABERTURA.PDF'
const concurso='CBM/AL 2017 — Soldado Combatente — Caderno CB2'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==67||catalog.url!==fonte)throw Error('Catálogo oficial CBM/AL 2017 divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-tcepa-arquitetura-2016-v245'))
if(start<0)throw Error('Base v245 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==67)throw Error(`Esperados 67 registros do caderno, encontrados ${active.size}`)
const entries=catalog.questoes
const duplicates=new Map(entries.slice(10,15).map((e,i)=>[e.id,entries[i].id]))
for(const e of entries.slice(15,19)){const original=entries.slice(5,10).find(x=>x.numero===e.numero);if(!original)throw Error(`Não consegui parear cópia de idioma inglês ${e.id}`);duplicates.set(e.id,original.id)}
const topic=n=>{
 if(n>=6&&n<=18)return ['Português','Leitura e interpretação do texto sobre monocultura açucareira no Nordeste; vocabulário, sintaxe, coesão, inferência e gênero argumentativo.']
 if(n>=19&&n<=23)return ['Direitos Humanos','Conceito, historicidade, universalidade, dignidade humana e garantias constitucionais dos direitos humanos.']
 if(n>=24&&n<=27)return ['Ética','Ética policial militar, cidadania, dever funcional, decoro e responsabilidade profissional.']
 if(n>=28&&n<=32)return ['Atualidades','Tecnologia e sociedade: saúde, redes sociais, eficiência energética, desenvolvimento econômico e biocombustíveis.']
 if(n>=33&&n<=35)return ['Sociologia','Gênero, participação feminina na cultura e política e enfrentamento da violência contra a mulher.']
 if(n>=36&&n<=40)return ['Informática','Computação em nuvem, firewall e malware, proteção antivírus, privacidade no navegador e edição de apresentações.']
 if(n===41||n===42)return ['Matemática','Progressão aritmética: termo geral e soma de quantidades em chamadas mensais.']
 if(n>=43&&n<=45)return ['Matemática','Geometria analítica e plana: coordenadas cartesianas, distância, área, proporção e avanço de frente de incêndio.']
 if(n>=46&&n<=47)return ['Estatística','Leitura de gráfico de setores, frequência relativa e associação entre ângulos e contagens.']
 if(n>=48&&n<=50)return ['Raciocínio Lógico','Lógica proposicional: condicional, negação, equivalência e avaliação de proposições.']
 return null
}
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']
for(const page of new Set(entries.map(e=>e.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const decisions=[...active.values()].map(q=>{
 const idx=entries.findIndex(e=>e.id===q.id),e=entries[idx],n=Number(q.numero_original),page=e?.pagina
 if(!e||!page)throw Error(`Questão sem referência de catálogo: ${q.id}`)
 let materia,conteudo
 if(idx<5){materia='Espanhol';conteudo='Compreensão leitora em espanhol: conectores, coesão, inferência, vocabulário e interpretação do texto sobre comunicação digital.'}
 else if(idx<10){materia='Inglês';conteudo='Compreensão leitora em inglês: inferência, vocabulário, conectores e ideia central de texto sobre atividade física e aprendizagem.'}
 else if(duplicates.has(q.id)){
  const canonical=entries.find(x=>x.id===duplicates.get(q.id)),canonicalIndex=entries.indexOf(canonical)
  materia=canonicalIndex<5?'Espanhol':'Inglês';conteudo=canonicalIndex<5?'Compreensão leitora em espanhol: conectores, coesão, inferência, vocabulário e interpretação do texto sobre comunicação digital.':'Compreensão leitora em inglês: inferência, vocabulário, conectores e ideia central de texto sobre atividade física e aprendizagem.'
 }
 else if(page===3&&n>=1&&n<=5){materia='Português';conteudo='Semântica e lexicografia: acepções de tecnologia, relações entre definição de dicionário e uso contextual.'}
 else [materia,conteudo]=topic(n)||(()=>{throw Error(`Tópico ausente: ${q.id} (${n})`)})()
 const stem=String(q.enunciado||'').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<20||/�|\ufffd/.test(stem))throw Error(`Texto OCR suspeito em ${q.id}`)
 const img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,context=(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial com texto-base, gráfico ou figura associada.'}))
 const duplicate=duplicates.has(q.id)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2017,concurso,numero_original:n,pagina:page,dificuldade:[13,15,20,21,22,23,26,27,29,31,35,41,43,44,45,46,48,49,50].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade de leitura, conceitos e operações; não publicada pelo Cebraspe.',classificacao_fonte:fonte,motivo:`Cebraspe, CBM/AL 2017, Soldado Combatente, Caderno CB2, questão ${n}, página ${page}. Aplicação e matéria identificadas pelo caderno oficial; tópico derivado do texto e do comando.`,visual:{pagina:page,imagem:img,texto_apoio:q.texto_apoio||'',motivo:'Página original preservada, incluindo texto-base, itens, figura ou gráfico.'},...(context.length?{imagens_contexto:context}:{}),...(duplicate?{apta_resolucao:false,duplicada_de:duplicates.get(q.id),inelegibilidade_motivo:'Cópia OCR repetida da mesma versão linguística; a versão canônica permanece disponível.'}:{apta_resolucao:true,remover_pendencias:removable})}
})
if(decisions.length!==67||new Set(decisions.map(x=>x.id)).size!==67||duplicates.size!==9)throw Error('Contagem ou deduplicação inconsistente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:67,variantes:10,duplicatasOCR:9,questoesUnicas:58,novasClassificacoes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length])),paginas:[...new Set(decisions.map(x=>x.pagina))].length,fonte,edital},null,2));process.exit(0)}
const name='revisao-cbmal-combatente-2017-v246'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,registros:67,variantes:10,duplicatasOCR:9,questoesUnicas:58,porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length])),paginas:[...new Set(decisions.map(x=>x.pagina))].length,fonte,edital,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão CBM/AL 2017 — Soldado Combatente — v246\n\n- Reclassifiquei os 67 recortes do caderno: Espanhol e Inglês; Português; Direitos Humanos; Ética; Atualidades; Informática; Matemática; Estatística; e Raciocínio Lógico, com conteúdos específicos em cada questão. As duas versões de língua estrangeira do caderno foram mantidas como aplicações alternativas legítimas.\n- A inspeção da página 1 mostrou nove recortes OCR repetidos (cinco cópias da versão espanhola e quatro da inglesa). Marquei apenas essas cópias como inelegíveis e mantive os registros canônicos. Os enunciados, texto-base sobre comunicação digital, leitura sobre monocultura açucareira, figura do incêndio e gráfico de setores seguem vinculados às páginas originais.\n- Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações, nove cópias sinalizadas, ${result.contextos_visuais} referências visuais; ${result.total} itens no banco, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno CB2](https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/340_CBMAL_CB2_01.pdf), [edital do concurso](https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/ED_1_CBMAL_17_ABERTURA.PDF), [página oficial](https://www.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE).\n`)
console.log(JSON.stringify(out,null,2))
