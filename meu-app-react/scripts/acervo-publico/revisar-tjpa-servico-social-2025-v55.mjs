import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='6f22aaffec3a9555'
const url='https://cdn.cebraspe.org.br/concursos/TJ_PA_25_SERVIDOR/arquivos/E12A9D602EF5537DCE56A90D81DF389C2B6C007AACF001499A12F69C86114E2C.pdf'
const secoes=[
  [[51,53],'Serviço Social','Lei n.º 8.662/1993: competências e atribuições privativas do assistente social'],
  [[54,57],'Serviço Social','Código de Ética Profissional do Assistente Social: direitos, deveres, sigilo e fiscalização profissional'],
  [[58,61],'Serviço Social','Movimento de reconceituação: crítica ao tradicionalismo, pluralismo e dimensão política da profissão'],
  [[62,63],'Serviço Social','Planejamento e formulação de projetos de intervenção profissional'],
  [[64,65],'Serviço Social','Projeto ético-político profissional: construção histórica e direção social'],
  [[66,72],'Serviço Social','Questão social, políticas sociais, dimensão técnico-operativa e mudanças no trabalho profissional'],
  [[73,74],'Serviço Social','Concepções atuais de família e configurações familiares no direito social'],
  [[75,76],'Serviço Social','Interdisciplinaridade e atuação profissional em equipes multiprofissionais'],
  [[77,78],'Serviço Social','Avaliação biopsicossocial da deficiência e modelo social de direitos'],
  [[79,84],'Serviço Social','Lei Orgânica da Assistência Social (LOAS): proteção social, benefícios e organização da assistência'],
  [[85,88],'Serviço Social','Política Nacional de Saúde Mental e Rede de Atenção Psicossocial'],
  [[89,92],'Serviço Social','Saúde do trabalhador: política, vigilância, prevenção e atuação profissional'],
  [[93,94],'Serviço Social','Lei Maria da Penha: prevenção, proteção e avaliação do risco de violência doméstica'],
  [[95,99],'Serviço Social','Lei Brasileira de Inclusão: direitos, acessibilidade, saúde, educação e trabalho da pessoa com deficiência'],
  [[100,103],'Serviço Social','Aposentadoria da pessoa com deficiência no RGPS: Lei Complementar n.º 142/2013'],
  [[104,106],'Serviço Social','Lei n.º 12.764/2012: direitos da pessoa com transtorno do espectro autista'],
  [[107,109],'Serviço Social','Lei n.º 7.853/1989: direitos, inclusão e educação da pessoa com deficiência'],
  [[110,111],'Serviço Social','Decreto n.º 3.298/1999: Política Nacional para a Integração da Pessoa com Deficiência'],
  [[112,118],'Serviço Social','Questão social, direitos e políticas sociais no Brasil e dimensão técnico-operativa do Serviço Social'],
  [[119,120],'Serviço Social','Benefício de Prestação Continuada (BPC): conceito de idoso, critérios e acesso ao benefício'],
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
      motivo:`Item ${n}: disciplina e assunto conferidos pelo comando do bloco e pelo enunciado no caderno oficial TJ/PA 2025, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Comando temático e enunciados do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==69)throw Error(`Esperadas 69 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v55-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v55',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'TJ/PA — Servidor — Serviço Social — 2025'}))
