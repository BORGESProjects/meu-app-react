import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='caff55d819bdcc2e'
const prova='https://cdn.cebraspe.org.br/concursos/ANS_25_CF/arquivos/062_ANS_CF_001_01.pdf'
const duplicateOf=new Map([
 ['extr-57af5ffb183185aa0a41','extr-661faa33a2f905d61e2b'],
 ['extr-15d78c504a75a16b93fb','extr-8b6e8d2a7700f7036a28'],
 ['extr-d93c3963fb8f6bf670da','extr-946202eb29a55c96c9c9']
])
const start=raizesAtuais.findIndex(r=>r.includes('revisao-fuvest-2026-fase1-v171'))
if(start<0)throw Error('Base v171 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==103||catalog.url!==prova)throw Error('Catálogo ANS 2025 CF divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==103)throw Error(`Esperados 103 registros ANS 2025 CF, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const topics=new Map([
 [1,['Saúde Coletiva','História das políticas de saúde no Brasil: assistência hospitalar antes da Constituição de 1988']],
 [2,['Saúde Coletiva','Modelo médico-hospitalar e organização da assistência à saúde']],
 [3,['Saúde Coletiva','Reforma Sanitária e documentos fundadores do direito universal à saúde']],
 [4,['Saúde Coletiva','Seguridade social e evolução das políticas públicas de saúde']],
 [5,['Saúde Coletiva','Implantação do SUS, financiamento e organização público-privada']],
 [6,['Economia','Regulação econômica da saúde suplementar e correção de falhas de mercado']],
 [7,['Administração Pública','Regulação estatal e garantias de usuários e trabalhadores na saúde suplementar']],
 [8,['Saúde Coletiva','Relação entre SUS, prestadores privados e organização da assistência']],
 [9,['Administração Pública','Planos coletivos empresariais e formas de contratação na saúde suplementar']],
 [10,['Economia','Reajuste de planos de saúde e regulação de preços']],
 [11,['Saúde Coletiva','Segmentação assistencial e cobertura do plano de referência']],
 [12,['Direito do Consumidor','Contrato individual de plano de saúde: prazo e vigência']],
 [13,['Administração Pública','Estrutura organizacional e competências da Secretaria-Executiva da ANS']],
 [14,['Administração Pública','Participação social e órgãos consultivos da saúde suplementar']],
 [15,['Administração Pública','Transparência regulatória, indicadores de qualidade e inteligência de dados']],
 [16,['Administração Pública','Análise de Impacto Regulatório (AIR): finalidade e natureza do relatório']],
 [17,['Administração Pública','Avaliação de Resultado Regulatório (ARR): impacto e efetividade']],
 [18,['Economia','Captura regulatória e independência da agência reguladora']],
 [19,['Economia','Poder de mercado e relações econômicas entre operadoras e agentes']],
 [20,['Economia','Economias de escala e custo médio de produção']],
 [21,['Administração Pública','Regulação responsiva e gradação da resposta ao comportamento do regulado']],
 [22,['Administração Pública','Direção técnica e recuperação de operadoras em risco assistencial ou financeiro']],
 [23,['Economia','Economia comportamental aplicada à regulação da saúde suplementar']],
 [24,['Saúde Coletiva','Nudges e desenho de escolhas em políticas de saúde pública']],
 [25,['Economia','Padrões de decisão e vieses comportamentais na economia comportamental']],
 [26,['Administração Pública','Redimensionamento de rede hospitalar e proteção ao beneficiário']],
 [27,['Saúde Coletiva','Prazos máximos de atendimento e acesso a serviços assistenciais']],
 [28,['Saúde Coletiva','Suficiência e adequação da rede assistencial de planos de saúde']],
 [29,['Direito do Consumidor','Portabilidade de carências e requisitos de migração de plano']],
 [30,['Administração Pública','Registro de produtos de saúde suplementar perante a ANS']],
 [31,['Saúde Coletiva','Atualização do Rol de Procedimentos e Eventos em Saúde e cobertura assistencial']],
 [32,['Administração Pública','Direção técnica e plano de recuperação de operadora']],
 [33,['Saúde Coletiva','Cobertura assistencial e fornecimento de medicamentos']],
 [34,['Economia','Índices de reajuste de planos de saúde e metodologia de cálculo']],
 [35,['Administração Pública','Agrupamento de contratos coletivos e cálculo de reajuste']],
 [36,['Direito do Consumidor','Reajuste por faixa etária em contratos anteriores à Lei nº 9.656/1998']],
 [37,['Economia','Painel de precificação de planos de saúde: dados e indicadores']],
 [38,['Economia','Reajustes de planos coletivos e transparência de preços']],
 [39,['Estatística','Testes diagnósticos: sensibilidade e especificidade para hepatite B']],
 [40,['Estatística','Estudos epidemiológicos para estimar prevalência de hepatite B']],
 [41,['Saúde Coletiva','Qualidade do cuidado em saúde e eficiência assistencial']],
 [42,['Saúde Coletiva','Determinantes sociais da saúde: comportamento, estilo de vida e condições sociais']],
 [43,['Saúde Coletiva','Qualidade de prestadores e indicadores de remuneração']],
 [44,['Administração Pública','Transparência e divulgação de informações sobre a qualidade dos prestadores']],
 [45,['Saúde Coletiva','Modelos de remuneração baseados em valor e qualificação dos prestadores']],
 [46,['Administração Pública','Autogestão e modalidades de operadoras de planos de saúde']],
 [47,['Administração Pública','Operadoras filantrópicas e requisitos institucionais']],
 [48,['Administração Pública','Registro e autorização de funcionamento de operadoras']],
 [49,['Administração Pública','Autorização de funcionamento e prazo de validade regulatório']],
 [50,['Administração Pública','Objeto social e limites de atividade econômica das operadoras']],
 [51,['Administração Pública','Alterações de rede credenciada e deveres das operadoras']],
 [52,['Contabilidade','Índice combinado e análise de receitas e despesas de operadoras']],
 [53,['Contabilidade','Reconhecimento contábil de receitas de contraprestações por competência']],
 [54,['Contabilidade','Ativo: potencial de geração de benefícios econômicos e consumo']],
 [55,['Contabilidade','Provisões técnicas e bens garantidores perante a ANS']],
 [56,['Contabilidade','Aplicações financeiras de operadoras e composição de ativos garantidores']],
 [57,['Contabilidade','Provisão para Eventos/Sinistros a Liquidar (PESL) e ressarcimento ao SUS']],
 [58,['Administração Pública','Competências de articulação institucional da Diretoria de Fiscalização da ANS']],
 [59,['Direito Administrativo','Relatório de análise conclusiva em processo fiscalizatório']],
 [60,['Direito Administrativo','Processo administrativo sancionador contra operadoras e prestadores']],
 [61,['Direito Administrativo','Reparação voluntária e eficaz (RVE): comprovação de contato com o beneficiário']],
 [62,['Direito Administrativo','Notificação de demanda à operadora e medidas para solução da reclamação']],
 [63,['Direito Administrativo','Notificação de demanda preliminar e fase eletrônica de resposta']],
 [64,['Informática','Inteligência artificial e automação da análise de demandas na ANS']],
 [65,['Auditoria','Auditoria da classificação de demandas NIP e controle de qualidade']],
 [66,['Direito Administrativo','Notificação de Intermediação Preliminar (NIP) e mediação assistencial']],
 [67,['Direito Administrativo','Fase prévia à instauração do processo administrativo sancionador']],
 [68,['Direito Administrativo','Infração regulatória e reajuste de plano em desacordo com as normas']],
 [69,['Direito Administrativo','Fiscalização proativa e identificação de falhas de mercado']],
 [70,['Direito Administrativo','Indicadores de reclamações e limiares de desempenho regulatório']],
 [71,['Direito Administrativo','Fiscalização planejada e regulação responsiva']],
 [72,['Direito Administrativo','Termo de Ajuste de Conduta (TAC): comprovação e encerramento']],
 [73,['Direito Administrativo','Cessação da prática e reparação de irregularidade em processo sancionador']],
 [74,['Direito Administrativo','Termo de Compromisso de Ajustamento de Conduta (TCAC) e regulação responsiva']],
 [75,['Direito do Consumidor','Conflito entre o marco regulatório da saúde suplementar e as normas consumeristas']],
 [76,['Direito Constitucional','Direito do consumidor como direito fundamental na Constituição']],
 [77,['Direito do Consumidor','Aplicação do Código de Defesa do Consumidor aos contratos de plano de saúde']],
 [78,['Direito do Consumidor','Tutela individual e coletiva nas relações de consumo']],
 [79,['Administração Pública','Articulação da ANS com Defensoria Pública e órgãos de proteção do consumidor']],
 [80,['Direito Administrativo','Ressarcimento ao SUS por atendimentos prestados a beneficiários de planos']],
 [81,['Contabilidade','Metodologia de cálculo e valoração do ressarcimento ao SUS']],
 [82,['Direito Constitucional','Constitucionalidade do ressarcimento ao SUS segundo a jurisprudência do STF']],
 [83,['Contabilidade','Recolhimento de recursos públicos e entrega na rede bancária']],
 [84,['Informática','Interoperabilidade em saúde digital: integração dos padrões TISS e FHIR']],
 [85,['Informática','Padrão TISS e intercâmbio eletrônico de dados na saúde suplementar']],
 [86,['Informática','Segurança da informação e orientação institucional na ANS']],
 [87,['Informática','Sistema de Registro de Planos de Saúde (RPS) e cadastro de produtos']],
 [88,['Informática','Protocolo eletrônico e comprovação de envio e recebimento de documentos']],
 [89,['Informática','RPS: registro de produtos e compatibilidade de rede assistencial']],
 [90,['Informática','Segurança da telemedicina: criptografia e proteção de dados']],
 [91,['Estatística','Estatística descritiva: valores discrepantes (outliers) e observações atípicas']],
 [92,['Estatística','Distribuição de variável qualitativa por gráfico de setores']],
 [93,['Estatística','Medidas de posição e dispersão: adequação ao tipo de variável']],
 [94,['Estatística','Classificação de variáveis: quantitativas, qualitativas, ordinais e nominais']],
 [95,['Administração Pública','Plano de Transformação Digital da ANS e integração de canais de serviço']],
 [96,['Informática','Transformação digital, segurança da informação e privacidade']],
 [97,['Informática','Sistema Eletrônico de Informações (SEI) e digitalização de processos administrativos']],
 [98,['Redação Oficial','Produção de textos governamentais digitais e uso de hiperlinks']],
 [99,['Direito Administrativo','Processo disciplinar e apuração de acumulação ilegal de cargos públicos']],
 [100,['Administração Pública','Ética profissional do servidor público federal']]
])
if(topics.size!==100)throw Error(`Mapa temático deveria cobrir 100 números, contém ${topics.size}`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const entry=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=pages.get(q.id),topic=topics.get(n),dup=duplicateOf.get(q.id)
 if(!entry||!page||!topic)throw Error(`Questão sem número, página ou assunto: ${q.id}`)
 const stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(!dup&&(stem.length<30||/�|\ufffd/.test(stem)))throw Error(`Enunciado suspeito em ${q.id}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2025,concurso:'ANS 2025 — Curso de Formação, prova objetiva, Cargo 1',numero_original:n,pagina:page,dificuldade:[6,16,18,19,21,22,23,25,31,32,39,40,45,52,53,54,55,56,57,59,60,61,63,64,65,67,68,71,74,75,76,77,78,81,82,83,84,85,90,91,93,94,96,99,100].includes(n)?'Difícil':[1,2,3,4,5,8,9,11,12,13,14,20,24,27,28,29,30,34,36,38,41,42,46,47,48,49,50,58,62,66,69,70,72,73,79,80,86,87,88,89,92,95,97,98].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo domínio regulatório, jurídico, econômico, contábil ou técnico exigido; não é classificação oficial da banca.',...(dup?{}:{enunciado:stem}),classificacao_fonte:prova,motivo:`Item ${n}, página ${page}, Curso de Formação da ANS. Tema específico identificado pelo conteúdo do enunciado e do bloco da prova oficial.`,visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial associada ao item para conferência do enunciado, tabelas e elementos gráficos.'},apta_resolucao:!dup,remover_pendencias:removable,...(dup?{inelegibilidade_motivo:`Duplicata OCR do item ${n}; cópia canônica ${dup} permanece apta.`,duplicada_de:dup}:{})}
})
const valid=decisions.filter(d=>d.apta_resolucao!==false),present=new Set(valid.map(d=>d.numero_original)),missing=[...Array(100)].map((_,i)=>i+1).filter(n=>!present.has(n))
if(decisions.length!==103||valid.length!==100||missing.length||duplicateOf.size!==3)throw Error(`Cobertura divergente: registros=${decisions.length}, válidos=${valid.length}, ausentes=${missing}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,validas:valid.length,duplicatas:[...duplicateOf],ausentes:missing,pendentesAntes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,porMateria:Object.fromEntries([...new Set(valid.map(d=>d.materia))].map(m=>[m,valid.filter(d=>d.materia===m).length])),paginas:[...new Set(pages.values())]},null,2));process.exit(0)}
const name='revisao-ans-formacao-2025-v172'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,registros_revistos:103,questoes_validas:100,duplicatas_quarentenadas:[...duplicateOf].map(([id,duplicada_de])=>({id,duplicada_de})),lacunas_finais:[],paginas_originais:[...new Set(pages.values())],correcao_automatica_nao_alterada:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
