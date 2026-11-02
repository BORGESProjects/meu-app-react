import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='0840713b8b4740a5'
const prova='https://cdn.cebraspe.org.br/concursos/inss_22/arquivos/MATRIZ_075_INSSCF_001_00.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/inss_22/arquivos/Gab_Definitivo_MATRIZ_075_INSSCF_001_00.PDF'
const canonical18='extr-733805c737d0c5c34b81'
const contaminado18='extr-d7d9826e3fb3af534c05'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-serpro-ciencia-dados-2021-v168'))
if(start<0)throw Error('Base v168 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start)
const manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==121)throw Error('Catálogo do INSS Curso de Formação divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==121)throw Error(`Esperados 121 registros do INSS Curso de Formação, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const topics=[
 [1,3,'Atendimento ao cidadão e canais remotos do INSS'],
 [4,7,'Benefícios por incapacidade temporária e auxílio-acidente'],
 [8,11,'Aposentadoria por incapacidade permanente'],
 [12,19,'Seguridade social, RGPS, filiação, dependentes e qualidade de segurado'],
 [20,21,'Segurado facultativo: filiação e manutenção da qualidade de segurado'],
 [22,24,'Acidente do trabalho: CAT, reabilitação profissional e auxílio-acidente'],
 [25,28,'Segurados do RGPS, salário de contribuição e salário-família'],
 [29,33,'Acidente do trabalho: CAT, nexo técnico, doença ocupacional e cobertura'],
 [34,36,'Aposentadoria programada: carência, requisitos e cálculo'],
 [37,39,'Tempo de contribuição: contagem, tempo fictício e contagem recíproca'],
 [40,42,'Aposentadoria programada do professor: requisitos e cálculo'],
 [43,45,'Tempo de contribuição do professor: contagem e conversão'],
 [46,51,'Aposentadoria rural: idade, segurado especial e prova da atividade'],
 [52,57,'Aposentadoria especial: exposição, transição, PPP e períodos especiais'],
 [58,63,'Aposentadoria da pessoa com deficiência: avaliação, cálculo e revisão'],
 [64,68,'Salário-maternidade: carência, acumulação e titularidade'],
 [69,72,'Salário-família: requisitos, pagamento, cotas e acumulação'],
 [73,78,'Pensão por morte: dependentes, cotas, duração e cessação'],
 [79,81,'Auxílio-reclusão: segurados, requisitos e cálculo'],
 [82,83,'Abono anual previdenciário'],
 [84,86,'Benefício de prestação continuada (BPC): requisitos, acumulação e suspensão'],
 [87,89,'Pensões especiais: Caruaru, ex-combatentes e anistiados políticos'],
 [90,93,'Benefícios assistenciais e pensões especiais: renda, titularidade e critérios'],
 [94,96,'BPC à pessoa com deficiência: avaliação e revisão'],
 [97,98,'Pensão especial da síndrome de talidomida'],
 [99,100,'Seguro-desemprego do pescador artesanal (seguro-defeso)'],
 [101,103,'CNIS: dados, pesquisa externa e atualização cadastral'],
 [104,106,'Certidão de tempo de contribuição (CTC) e contagem recíproca'],
 [107,108,'Compensação previdenciária entre RGPS e RPPS'],
 [109,111,'Revisão de benefícios: procedimento, requerimento e garantias'],
 [112,114,'Processo administrativo previdenciário e recursos ao CRPS'],
 [115,117,'Acordos internacionais de previdência social e organismos de ligação'],
 [118,120,'Programa de Educação Previdenciária (PEP)']
]
const topicFor=n=>topics.find(([a,b])=>n>=a&&n<=b)?.[2]||'Seguridade social e Regime Geral de Previdência Social'
const difficultyFor=n=>[8,10,11,34,36,37,39,42,44,45,49,51,53,54,57,59,60,61,62,63,76,77,80,85,88,89,92,93,98,103,105,106,108,113,114,116,117].includes(n)?'Difícil':[1,2,3,5,6,9,12,13,16,20,21,24,28,29,31,33,35,38,40,46,47,50,64,67,69,70,71,73,79,82,83,84,86,91,94,95,96,99,101,109,110,112,118,119,120].includes(n)?'Fácil':'Média'
const support22='Situação hipotética do caderno: Carla, empregada de uma indústria têxtil, sofreu acidente de trabalho ao operar máquina de corte, teve lesões graves na mão direita e perícia constatou incapacidade permanente para a função habitual. Os itens 22 a 24 devem ser julgados com base nesse caso.'
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const n=Number(q.numero_original),pg=pages.get(q.id)
 if(!Number.isInteger(n)||n<1||n>120||!pg)throw Error(`Item sem número/página no catálogo: ${q.id}`)
 const isCorrupt=q.id===contaminado18
 let stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(q.id===canonical18)stem='Para que a companheira de segurado tenha direito à pensão por morte, ela deverá comprovar a existência de relação de dependência econômica com ele.'
 // O OCR anexou um cabeçalho seguinte ao item 28; preserva somente a sentença do item.
 if(n===28)stem=stem.split(/\s+Julgue os seguintes itens, referentes a acidente do trabalho\./i)[0].trim()
 if(!isCorrupt&&(stem.length<25||/�|\ufffd/.test(stem)))throw Error(`Item ${n} com possível corrupção textual (${q.id})`)
 const apoio=n>=22&&n<=24?support22:(q.texto_apoio||'')
 return {
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Direito Previdenciário',conteudo:topicFor(n),ano:2025,
  concurso:'INSS — Técnico do Seguro Social, Curso de Formação (3ª turma), Edital 2022; prova aplicada em 06/04/2025',
  numero_original:n,pagina:pg,dificuldade:difficultyFor(n),dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pelo número de conceitos e etapas normativas exigidas; não corresponde a nível oficial publicado pela banca.',
  ...(isCorrupt?{}:{enunciado:stem}),
  classificacao_fonte:prova,
  motivo:`Item ${n}, página ${pg}, classificado pelo comando temático e pelo conteúdo jurídico do caderno oficial do Curso de Formação do INSS.`,
  visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:'Página original da prova oficial vinculada para conferência visual do enunciado e do contexto.'},
  apta_resolucao:!isCorrupt,remover_pendencias:removable,
  ...(isCorrupt?{inelegibilidade_motivo:'Registro OCR duplicado: mistura o item 18 com trechos de outros itens; a cópia íntegra foi preservada no registro canônico extr-733805c737d0c5c34b81.',duplicada_de:canonical18}:{}),
  resposta_correta:n===66||n===67?null:q.resposta_correta,
  anulada:n===66||n===67,
 }
})
const nums=new Set(decisions.filter(d=>d.apta_resolucao!==false).map(d=>d.numero_original))
const missing=[...Array(120)].map((_,i)=>i+1).filter(n=>!nums.has(n))
if(decisions.length!==121||missing.length||decisions.filter(d=>d.apta_resolucao===false).length!==1)throw Error(`Cobertura divergente: registros=${decisions.length}; itens ausentes=${missing}; inaptos=${decisions.filter(d=>d.apta_resolucao===false).length}`)
if(decisions.filter(d=>d.anulada).map(d=>d.numero_original).join(',')!=='66,67')throw Error('Anulações não coincidem com o gabarito oficial')
if(process.argv.includes('--dry-run')){
 console.log(JSON.stringify({registros:decisions.length,itens_validos:nums.size,itens_ausentes:missing,duplicata_quarentenada:contaminado18,classificacoes_pendentes_antes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,anuladas:[66,67],por_materia:{'Direito Previdenciário':120},por_assunto:Object.fromEntries(topics.map(([a,b,t])=>[t,decisions.filter(d=>d.apta_resolucao!==false&&d.numero_original>=a&&d.numero_original<=b).length])),paginas_origem:[...new Set([...pages.values()])],prova,gabarito},null,2));process.exit(0)
}
const name='revisao-inss-formacao-3turma-2025-v169'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,gabarito,registros_revistos:121,itens_validos:120,itens_ausentes:[],duplicata_quarentenada:contaminado18,anuladas:[66,67],gabarito_respostas:'Não aplicadas automaticamente nesta revisão para evitar associar resposta sem verificação do arquivo oficial bruto e checksum.',integridade_visual:'Seis páginas originais vinculadas por item; texto-base do caso Carla preservado nos itens 22–24.',publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
