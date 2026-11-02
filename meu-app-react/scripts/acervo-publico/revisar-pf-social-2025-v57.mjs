import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='46b45b561fe51afe'
const url='https://cdn.cebraspe.org.br/concursos/PF_25_ADM/arquivos/094_PF_002_01.pdf'
const secoes=[
  [[51,55],'Serviço Social','Fundamentos históricos e teórico-metodológicos: perfil profissional, reconceituação e transformações do trabalho'],
  [[56,58],'Serviço Social','Política Nacional de Saúde Mental, cuidado comunitário, internação e Rede de Atenção Psicossocial'],
  [[59,62],'Serviço Social','Saúde do trabalhador: atribuições profissionais, vigilância e atuação nos serviços de referência'],
  [[63,70],'Serviço Social','Código de Ética Profissional: sigilo, autonomia, informação, deveres e conflitos institucionais'],
  [[71,74],'Serviço Social','Dimensão investigativa, planejamento e intervenção profissional'],
  [[75,80],'Serviço Social','Dimensão técnico-operativa, instrumentalidade, documentação e trabalho em equipe'],
  [[81,86],'Serviço Social','Questão social, cidadania, seguridade, política social e sistemas de proteção no Brasil'],
  [[87,95],'Serviço Social','Políticas sociais e legislação de direitos: pessoa idosa, criança e adolescente e pessoa com deficiência'],
  [[96,96],'Serviço Social','Direitos da pessoa com transtorno do espectro autista'],
  [[97,103],'Serviço Social','Política sobre drogas (SISNAD): cuidado, prevenção, atenção psicossocial e reinserção social'],
  [[104,107],'Serviço Social','Projeto ético-político do Serviço Social: marcos normativos, formação e desafios contemporâneos'],
  [[108,110],'Serviço Social','Programa Federal de Prevenção e Enfrentamento do Assédio e da Discriminação'],
  [[111,115],'Serviço Social','Saúde mental relacionada ao trabalho: sofrimento, adoecimento e condições laborais'],
  [[116,118],'Serviço Social','Avaliação biopsicossocial da deficiência e modelo social de direitos'],
  [[119,120],'Serviço Social','Readaptação funcional de servidor público por limitação física ou mental'],
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
    if(q.ano&&Number(q.ano)!==2025)throw Error(`Ano divergente no item ${q.numero_original}: ${q.ano}`)
    if(q.banca!=='CEBRASPE')throw Error(`Banca divergente no item ${q.numero_original}: ${q.banca}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
      motivo:`Item ${n}: conteúdo e disciplina identificados pelo comando do bloco e pelo enunciado do caderno oficial PF/Área Administrativa 2025, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Comando temático do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==70)throw Error(`Esperadas 70 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v57-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v57',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'Polícia Federal — Área Administrativa — Serviço Social — 2025'}))
