import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='0d57246842961e52'
const url='https://cdn.cebraspe.org.br/concursos/CPNUJE_24/arquivos/988_CPNUJE_016_01.PDF'
const secoes=[
  [[51,52],'Serviço Social','Atuação em equipe multiprofissional e resoluções do CFESS sobre opinião técnica e delimitação profissional'],
  [[53,55],'Serviço Social','Lei n.º 8.662/1993: competências e atribuições privativas do assistente social'],
  [[56,58],'Serviço Social','Projeto de intervenção profissional: diagnóstico institucional, participação dos usuários e planejamento'],
  [[59,60],'Serviço Social','Movimento de reconceituação: vertentes modernizadora e marxista'],
  [[61,64],'Serviço Social','Fundamentos teórico-metodológicos: mediação, matrizes de conhecimento e conservadorismo profissional'],
  [[65,66],'Serviço Social','Planejamento de planos, programas e projetos: dimensões política, teórico-metodológica e ético-política'],
  [[67,69],'Serviço Social','Dimensão técnico-operativa, instrumentais, procedimentos e competências profissionais'],
  [[70,74],'Serviço Social','Procedimentos socioassistenciais: trabalho com famílias, visita domiciliar, ação socioeducativa, entrevista e acolhimento'],
  [[75,78],'Serviço Social','Documentação profissional: estudo social, relatório, laudo e perícia social'],
  [[79,80],'Serviço Social','Trabalho em equipe multiprofissional e interdisciplinaridade'],
  [[81,82],'Serviço Social','Questão social, direitos de cidadania e políticas sociais'],
  [[83,93],'Direito da Criança e do Adolescente','ECA: adoção, guarda, apadrinhamento, família substituta, Conselho Tutelar e proteção contra violência'],
  [[94,97],'Seguridade Social','Constituição Federal: objetivos da assistência social, saúde e organização da seguridade social'],
  [[98,100],'Legislação Educacional','Plano Nacional de Educação (Lei n.º 13.005/2014): escolaridade, universalização e educação em tempo integral'],
  [[101,102],'Serviço Social','Lei n.º 8.662/1993: atribuições privativas, competências e organização profissional'],
  [[103,104],'Legislação Educacional','Lei de Diretrizes e Bases da Educação Nacional: educação bilíngue de surdos e educação física'],
  [[105,107],'Legislação Especial','Lei Maria da Penha: assistência, proteção, trabalho e direitos da mulher em situação de violência'],
  [[108,112],'Serviço Social','Resoluções do CFESS: sigilo, nome social, direitos profissionais e desagravo público'],
  [[113,115],'Serviço Social','Código de Ética Profissional: competência, privacidade documental e deveres com usuários'],
  [[116,117],'Direitos Humanos','Princípios Orientadores de Riad: prevenção da delinquência juvenil e socialização de crianças e jovens'],
  [[118,120],'Direitos Humanos','SINASE: comunidade socioeducativa, participação, gestão e comunicação sobre adolescentes a quem se atribuem atos infracionais'],
]
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=Number(q.numero_original),regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${q.numero_original}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    if(q.ano&&Number(q.ano)!==2024)throw Error(`Ano divergente no item ${q.numero_original}: ${q.ano}`)
    if(q.banca!=='CEBRASPE')throw Error(`Banca divergente no item ${q.numero_original}: ${q.banca}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
      motivo:`Item ${n}: disciplina e conteúdo conferidos pelo comando do bloco e pelo enunciado do caderno oficial CPNUJE 2024, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Comando temático e enunciado do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==67)throw Error(`Esperadas 67 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v58-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v58',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'CPNUJE — área judiciária — Serviço Social — 2024',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
