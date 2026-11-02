import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'
const base='tmp/revisao-profissional/revisao-hub-fisioterapia-2017-v110/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-43b61ec4fe774527.json','utf8'))
const grupos=[];const definir=(a,b,materia,conteudo,contexto)=>grupos.push({a,b,materia,conteudo,contexto})
definir(1,5,'Direito Administrativo','Princípios da administração pública, regime jurídico-administrativo, fontes e sentidos da administração','Seção da prova: Direito Administrativo — princípios constitucionais, regime jurídico e fontes.')
definir(6,10,'Direito Administrativo','Organização administrativa e atos administrativos','Seção da prova: Direito Administrativo — organização administrativa, delegação, atos, entidades e agências.')
definir(11,15,'Direito Administrativo','Processo administrativo, poderes administrativos, serviços públicos e concessões','Seção da prova: Direito Administrativo — processo administrativo, poderes, serviços e concessão pública.')
definir(16,20,'Direito Administrativo','Intervenção do Estado na propriedade, licitações, contratos e desapropriação','Seção da prova: Direito Administrativo — intervenção estatal, licitações e contratos administrativos.')
definir(21,27,'Direito Administrativo','Controle da administração pública, improbidade administrativa e responsabilização de agente público','Contexto da seção: servidor comissionado da Procuradoria de Fortaleza preso em flagrante por fraude em licitação; os itens relacionados tratam do controle da Administração e da Lei de Improbidade.')
definir(28,30,'Direito Administrativo','Responsabilidade civil do Estado, bens públicos e uso de bens de uso comum','Seção da prova: Direito Administrativo — responsabilidade estatal e uso/aquisição de bens públicos.')
definir(31,44,'Direito Constitucional','Controle de constitucionalidade, direitos fundamentais, foro de prefeitos, federalismo e organização do Estado','Seção da prova: Direito Constitucional — controle de constitucionalidade, direitos fundamentais, prefeitos e modelo federativo.')
definir(45,48,'Direito Constitucional','Direitos sociais à saúde e à educação; competências federativas','Comando original da seção: saúde e educação na Constituição Federal.')
definir(49,52,'Direito Constitucional','Funções essenciais à Justiça: Defensoria Pública, Ministério Público e advocacia pública','Comando original da seção: funções essenciais à Justiça, conforme a Constituição Federal.')
definir(53,60,'Direito Constitucional','Tributação e finanças públicas na Constituição; servidores públicos e jurisprudência constitucional','Comando original: tributação e finanças públicas, disposições constitucionais e jurisprudência do STF; itens finais sobre servidores públicos e precedentes dos tribunais superiores.')
definir(61,64,'Direito Civil','LINDB, pessoas naturais e jurídicas, bens e constituição de pessoas jurídicas','Comando original: Lei de Introdução às Normas do Direito Brasileiro, pessoas naturais e jurídicas e bens.')
definir(65,68,'Direito Civil','Atos e negócios jurídicos, obrigações e contratos','Comando original: ato e negócio jurídicos, obrigações e contratos.')
definir(69,71,'Direito Civil','Enriquecimento sem causa, responsabilidade civil e preferências creditórias','Comando original: atos unilaterais, responsabilidade civil e preferências e privilégios creditórios.')
definir(72,75,'Direito Civil','Direitos reais, locação, parcelamento do solo e registros públicos','Comando original: direitos reais, parcelamento do solo urbano, locação e registros públicos.')
definir(76,85,'Direito Processual Civil','Recursos e meios de impugnação, competência, sujeitos processuais, atos e negócios processuais','Seção da prova: Direito Processual Civil. Itens iniciais sobre meios de impugnação e atos processuais, conforme CPC e jurisprudência.')
definir(86,100,'Direito Processual Civil','Procedimento comum, tutela provisória, saneamento, reconvenção, provas, intervenção de terceiros e ação civil pública','Comando original: procedimento comum, ordem dos processos e incidentes; preserve hipóteses e relações processuais descritas nos enunciados.')
definir(101,105,'Direito Processual Civil','Mandado de segurança, cumprimento de sentença, execução e incidentes nos tribunais','Seção de Processo Civil: efeitos de decisões, cumprimento/execução e incidentes de competência originária dos tribunais.')
definir(106,115,'Direito do Trabalho','Direitos constitucionais trabalhistas, remuneração, FGTS, aviso-prévio, férias, jornada, rescisão e direito coletivo','Seção da prova: Direito do Trabalho — direitos constitucionais, insalubridade, remuneração, FGTS, aviso-prévio, férias, jornada e extinção do contrato.')
definir(116,121,'Direito Processual do Trabalho','Procedimentos individuais, representação, jus postulandi, competência e provas','Comando original: processo do trabalho, dissídios individuais, reclamação, jus postulandi, partes e procuradores; itens sobre competência e prova.')
definir(122,125,'Direito Processual do Trabalho','Recursos, execução, mandado de segurança e ação rescisória trabalhista','Comando original: recursos, execução, mandado de segurança e ação rescisória no processo do trabalho.')
definir(126,135,'Direito Financeiro','Orçamento público, princípios orçamentários, ciclo orçamentário e créditos','Seção da prova: Direito Financeiro — orçamento e princípios orçamentários na Constituição e na Lei n.º 4.320/1964.')
definir(136,145,'Direito Financeiro','Lei de Responsabilidade Fiscal, endividamento, dívida pública, receitas e despesas','Comandos originais: endividamento, receita e despesa públicas; limites fiscais e dívida pública.')
definir(146,156,'Direito Tributário','Sistema tributário constitucional, competências, imunidades, princípios e limitações ao poder de tributar','Seção da prova: Direito Tributário — Constituição, sistema tributário e jurisprudência do STF.')
definir(157,170,'Direito Tributário','Legislação tributária no CTN, vigência, interpretação, integração, obrigação, responsabilidade e crédito tributário','Comandos originais do CTN: legislação, vigência, aplicação, interpretação e integração; obrigações e crédito tributário.')
definir(171,172,'Direito Tributário','Processo judicial tributário, execução fiscal e medida cautelar fiscal','Comando original: processo judicial tributário e jurisprudência do STJ.')
definir(173,175,'Direito Tributário','ICMS, ISS, IPI e seletividade tributária','Comando original: impostos discriminados na Constituição Federal.')
definir(176,184,'Direito Ambiental','Princípios ambientais, proteção da fauna e flora, recursos hídricos e controle da poluição','Seção da prova: Direito Ambiental — princípios, recursos naturais, flora/fauna, política hídrica e controle da poluição.')
definir(185,188,'Direito Ambiental','Infrações, sanções, licenciamento e instrumentos de política urbana com interface ambiental','Comando original: política urbana, responsabilidade e licenciamento ambiental; item 188 trata do direito de preempção municipal.')
definir(189,199,'Direito Urbanístico','Plano diretor, função social da propriedade, direito de construir, concessão de uso e parcelamento do solo','Seção da prova: Direito Urbanístico — normas urbanísticas, plano diretor, propriedade urbana, concessões e parcelamento.')
const duplicada=pendentes.find(q=>q.numero_original===2&&q.enunciado.includes('|;'))
if(!duplicada)throw Error('Não localizei a cópia OCR contaminada do item 2')
const decisoes=[]
for(const q of pendentes){const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b);if(!g)throw Error(`Sem classificação temática para item ${n}`)
 let enunciado=q.enunciado.replace(/\s*\|\|[^\n]*(?:\n|$)[\s\S]*$/,'').replace(/\s*Espaço livre\s*[\s\S]*$/i,'').replace(/\s*CESPE\s*\|\s*CEBRASPE[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 if(q.id===duplicada.id)enunciado=q.enunciado
 const common={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g.materia,conteudo:g.conteudo,ano:2017,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de complexidade jurídica e jurisprudencial; a prova não informa dificuldade oficial.',motivo:`Classificação pelo número e pela seção temática do caderno oficial da Procuradoria-Geral do Município de Fortaleza, aplicado em 2017.`,...(enunciado!==q.enunciado?{enunciado}:{})}
 if(q.id===duplicada.id){decisoes.push({...common,apta_resolucao:false,inelegibilidade_motivo:'Registro duplicado do item 2, com OCR mesclado: o texto da questão seguinte foi inserido no meio do enunciado. A versão íntegra do mesmo item foi mantida.',duplicada_de:pendentes.find(x=>x.numero_original===2&&x.id!==q.id)?.id});continue}
 const visual={pagina:q.pagina,imagem:`paginas/${q.documento_id||'43b61ec4fe774527'}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Página do caderno oficial vinculada; seção e comando do bloco associados aos respectivos itens.'}
 decisoes.push({...common,visual})
}
if(decisoes.length!==119)throw Error(`Esperadas 119 decisões, encontradas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-pgm-fortaleza-procurador-2017-v111',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pgm-fortaleza-procurador-2017-v111/acervo-extraido')
