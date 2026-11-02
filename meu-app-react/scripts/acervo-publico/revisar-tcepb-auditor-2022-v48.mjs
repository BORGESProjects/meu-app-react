import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='f6a0ac918099fe12'
const url='https://cdn.cebraspe.org.br/concursos/TCE_PB_22_AUDITOR/arquivos/723_TCEPB_AUDITOR_001_01.PDF'
const secoes=[
  [[1,4],'Português','Compreensão e interpretação de texto sobre tributação internacional'],
  [[5,10],'Português','Interpretação, coesão e análise linguística do texto'],
  [[11,12],'Ética no Serviço Público','Ética e padrões de conduta na administração pública'],
  [[13,15],'Direito Administrativo','Improbidade administrativa: tipificação e sanções'],
  [[16,18],'Legislação Especial','Lei Anticorrupção: responsabilização de pessoas jurídicas e acordo de leniência'],
  [[19,23],'Informática','Windows, pesquisa na Internet, computação em nuvem e segurança contra malware'],
  [[24,31],'Direito Administrativo','Controle da administração pública, improbidade e controle jurisdicional'],
  [[32,39],'Legislação Institucional','Natureza, competências, organização e regimento interno do TCE/PB'],
  [[40,41],'Direito Administrativo','Regime jurídico dos servidores públicos civis da Paraíba'],
  [[42,51],'Direito Financeiro','Orçamento público: princípios, créditos adicionais, receita, despesa e restos a pagar'],
  [[52,61],'Administração Pública','Evolução da administração pública, governança, accountability e transparência'],
  [[62,70],'Direito Administrativo','Controle, licitações e contratos, organização, atos e poderes administrativos'],
  [[71,74],'Direito Constitucional','Direitos fundamentais, organização do Estado, Ministério Público e controle externo'],
  [[75,78],'Direito Constitucional','Ordem social, competências, tributação e princípios da atividade econômica'],
  [[79,88],'Direito Financeiro','Competência financeira, PPA, LDO, precatórios, receitas e princípios orçamentários'],
  [[89,94],'Direito Previdenciário','Regime Geral e regimes próprios: contributividade, benefícios, prescrição e acumulação'],
  [[95,100],'Direito Penal','Crimes contra as finanças públicas, administração pública e fé pública'],
  [[101,118],'Contabilidade Pública','Reconhecimento de receitas, ativos, depreciação, provisões, custos e pronunciamentos CPC'],
  [[119,123],'Auditoria Governamental','Sistema de Controle Interno federal: auditoria, fiscalização e convênios'],
  [[124,125],'Direito Administrativo','Licitações, pregão eletrônico e responsabilização por superfaturamento'],
  [[126,128],'Auditoria Governamental','Metodologia, finalidade e avaliação dos controles internos governamentais'],
  [[129,130],'Administração Pública','Convênios e transferências voluntárias: plano de trabalho e execução'],
  [[131,140],'Direito Empresarial','Empresário, nome e marca, títulos de crédito, sociedades e recuperação judicial'],
  [[141,150],'Direito Tributário','Limitações ao poder de tributar, espécies, obrigações tributárias e execução fiscal'],
]

const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=q.numero_original,regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${n}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${n}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,
      motivo:`Item ${n}: matéria e conteúdo definidos pelo comando temático do caderno oficial TCE/PB Auditor 2022, itens ${de}–${ate}, página ${q.pagina}.`,
      classificacao_fonte:{materia:`Cabeçalho temático oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==95)throw Error(`Esperadas 95 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v48-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v48',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'TCE/PB Auditor 2022',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
