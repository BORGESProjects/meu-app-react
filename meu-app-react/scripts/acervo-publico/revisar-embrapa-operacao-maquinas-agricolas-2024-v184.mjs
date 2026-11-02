import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='f50a8aaaccb8ad1a'
const prova='https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/044_EMBRAPA_003_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/Gab_Definitivo_044_EMBRAPA_003_01.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==64)throw Error('Catálogo EMBRAPA, Opção 40000035, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-tbg-instrumentacao-eletrica-2023-v183'))
if(start<0)throw Error('Base v183 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==64)throw Error(`Esperados 64 registros; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q])),idsPorNumero=new Map()
for(const e of catalog.questoes)idsPorNumero.set(e.numero,[...(idsPorNumero.get(e.numero)||[]),e.id])
const duplicateIds=new Set([...idsPorNumero.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1)))
const groups={
 'Mecânica de Veículos e Máquinas Agrícolas':[41,42,43,44,45,46,47,48,49,50,51],
 'Operação e Manutenção de Máquinas Agrícolas':[52,53,54,55,56,57,58,59,60,61,62,63],
 'Mecanização Agrícola e Distribuição de Insumos':[64,65,66,67,68],
 'Plantio e Semeadura Mecanizados':[69,70,71,72],
 'Colheita Mecanizada':[73,74,75],
 'Manejo Mecanizado de Pastagens':[76,77],
 'Regulagem de Implementos Agrícolas':[78,79,80],
 'Segurança em Máquinas e Equipamentos — NR 12':[81,82,83,84,85,86,87,88,89,90],
 'Segurança e Saúde no Trabalho Rural — NR 31':[91,92,93,94,95,96,97,98,99,100]
}
const topics=new Map()
for(const [subject,nums] of Object.entries(groups))for(const n of nums)topics.set(n,subject)
const gline=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`))
const gabs=gline?JSON.parse(gline):null
if(!gabs?.sha256||Object.keys(gabs.respostas||{}).length!==60)throw Error('Gabarito definitivo sem hash ou cobertura completa')
const contexts=new Map([
 [41,'Julgue os itens a seguir, referentes à mecânica de veículos automotores e de máquinas agrícolas.'],
 [46,'Com relação à manutenção, preparação e operação de máquinas agrícolas movidas a óleo diesel, julgue os itens.'],
 [52,'Julgue os itens seguintes relativos a procedimentos de manutenção, inspeção e lubrificação de máquinas agrícolas.'],
 [58,'Durante a execução de tarefa em campo, luzes indicadoras acenderam no painel do trator enquanto o motor estava em funcionamento; julgue os itens com base nas figuras 1 e 2 da página original.'],
 [60,'Com base no Código de Trânsito Brasileiro, julgue o item a seguir.'],
 [61,'Em relação à operação de tratores, colheitadeiras e máquinas utilizadas em operações agrícolas, julgue os itens.'],
 [64,'A respeito da distribuição de adubos e corretivos, julgue os itens subsequentes.'],
 [69,'Julgue os itens a seguir relativos ao plantio mecanizado em linha e a lanço.'],
 [73,'Acerca da colheita mecanizada de grãos e de forragens, julgue os itens.'],
 [76,'Acerca da roçagem e limpeza mecanizadas de pastagens, julgue os itens.'],
 [78,'No que diz respeito à calibração e regulagem de implementos agrícolas, julgue os itens subsequentes.'],
 [81,'Considerando os preceitos estabelecidos na NR 12 para a segurança no trabalho com máquinas e equipamentos, julgue os itens seguintes.'],
 [91,'Com base nos preceitos estabelecidos pela NR 31 para segurança e saúde no trabalho na agricultura, pecuária, silvicultura, exploração florestal e aquicultura, julgue os itens seguintes.']
])
const contextFor=n=>{const keys=[...contexts.keys()].filter(k=>k<=n);return contexts.get(keys.at(-1))||''}
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=gabs.respostas[String(n)]
 if(!topics.has(n)||!answer||!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Registro inconsistente: ${id}`)
 await fs.access(`public/acervo-extraido/${image}`)
 const duplicated=duplicateIds.has(id),difficulty=[44,47,53,54,58,63,64,70,72,74,79,81,84,85,86,88,89,94,95,97,100].includes(n)?'Difícil':[41,42,43,45,46,49,50,52,55,56,59,60,62,65,66,68,69,71,73,76,77,78,80,82,83,87,90,91,92,93,96,98,99].includes(n)?'Fácil':'Média'
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n),conteudo:`${topics.get(n)}: conhecimento e aplicação técnica do item ${n}`,ano:2024,concurso:'EMBRAPA 2024 — Assistente, Operador de Máquinas Agrícolas e Veículos — Opção 40000035',numero_original:n,pagina:page,dificuldade:difficulty,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade operacional, mecânica ou normativa; o CEBRASPE não publica dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação pelo tema expresso no enunciado e pelo conteúdo programático da opção 40000035.`,resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{valor:answer,fonte:gabarito,sha256:gabs.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo oficial CEBRASPE para a Opção 40000035.'},visual:{pagina:page,imagem:image,texto_apoio:contextFor(n),motivo:'Página original conferida visualmente; figuras de sinalização do painel preservadas e associadas aos itens 58–59.'},...(id==='extr-8326adde066d8e83cb05'?{enunciado:'A tomada de potência de um trator é utilizada para acoplar implementos acionados de forma hidráulica.'}:{}),apta_resolucao:!duplicated,...(duplicated?{inelegibilidade_motivo:'Registro OCR duplicado; cópia canônica mantida para resolução.'}:{})})
}
const unique=new Set(decisions.filter(d=>d.apta_resolucao).map(d=>d.numero_original)),allNumbers=new Set(decisions.map(d=>d.numero_original))
if(decisions.length!==64||duplicateIds.size!==4||allNumbers.size!==60||unique.size!==60||![...Array(60)].every((_,i)=>allNumbers.has(i+41)))throw Error(`Cobertura/duplicatas divergentes: ${decisions.length}/${unique.size}/${duplicateIds.size}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itensUnicos:unique.size,duplicatas:duplicateIds.size,anuladas:0,paginas:[1,2,3],cobertura:[41,100],corrigidoOCR:decisions.some(d=>d.id==='extr-8326adde066d8e83cb05'&&d.enunciado?.includes('implementos')),pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-embrapa-operacao-maquinas-agricolas-2024-v184'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:64,itens_numerados:60,itens_elegiveis:60,duplicatas_inelegiveis:4,cobertura_numerica:'41–100 sem lacunas',paginas_originais_conferidas:[1,2,3],gabarito_sha256:gabs.sha256,corrigidos_ocr:1,prova,gabarito,publicado:false,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
