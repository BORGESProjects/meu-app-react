import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='ce340ae096cd94ff'
const prova='https://cdn.cebraspe.org.br/concursos/ANS_25_CF/arquivos/36388AA5D656DCE4B3AE0CCB961FA43756DDCBB404A530BA729FA9CFC699B879.pdf'
const duplicateOf=new Map([
 ['extr-72fa4137892d49dc5ebc','extr-a5f7a2967221e5eee182'],
 ['extr-4e39870da7a1cf3aaf9f','extr-c3e49a2e8a94e6648168'],
 ['extr-fcecc9743e01c1c0eb0c','extr-7edaa91df06a1b1ee376'],
 ['extr-93393fca33e34a47f671','extr-d6e3adca653349a92a29'],
 ['extr-d9d700f473e7658a560a','extr-c21fe27fd33eb2c2c254'],
 ['extr-e104248361fa8324a1c9','extr-b7205dabdb3ac7ac7817'],
 ['extr-c5ec364784aa7b400fad','extr-3ac288c4284d5bb13fc4'],
 ['extr-845dae898e607931072f','extr-d0f45b2ac602dc6d4307'],
 ['extr-c8d7edc8cf1dcd846ac0','extr-ca5e743c3065640c732f'],
 ['extr-6b90e402c193926ce35f','extr-dfaa4e38cf75d8bffef3'],
 ['extr-d0fef188c9bb22fd071a','extr-21d96b05b74fdee73adb']
])
const start=raizesAtuais.findIndex(r=>r.includes('revisao-ans-formacao-2025-v172'))
if(start<0)throw Error('Base v172 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==111||catalog.url!==prova)throw Error('Catálogo ANS segundo caderno divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==111)throw Error(`Esperados 111 registros ANS segundo caderno, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const topics=new Map([
 [1,['Saúde Coletiva','Evolução histórica do sistema de saúde e universalização da cobertura']],
 [2,['Saúde Coletiva','Reforma Sanitária: financiamento da saúde antes da criação do SUS']],
 [3,['Saúde Coletiva','SUS, saúde complementar e participação do setor privado']],
 [4,['Saúde Coletiva','Transição do seguro social para a seguridade social e direito à saúde']],
 [5,['Saúde Coletiva','Universalização do SUS e adesão aos planos privados de assistência']],
 [6,['Geografia','Distribuição regional da cobertura de planos privados de saúde']],
 [7,['Saúde Coletiva','Segmentação assistencial e migração entre modalidades de plano']],
 [8,['Administração Pública','Criação da ANS e evolução da regulação de operadoras']],
 [9,['Saúde Coletiva','Modelo de atenção à saúde suplementar e organização assistencial']],
 [10,['Saúde Coletiva','Promoção da saúde e programas de prevenção da ANS']],
 [11,['Estatística','Epidemiologia: incidência e prevalência como indicadores de saúde']],
 [12,['Geografia','Transição demográfica e perfis de saúde e doença da população']],
 [13,['Geografia','Pirâmide etária brasileira e estrutura da população']],
 [14,['Saúde Coletiva','Classificação epidemiológica de doenças transmissíveis e crônicas']],
 [15,['Direito do Consumidor','Doença ou lesão preexistente e contraprestação em plano de saúde']],
 [16,['Economia','Regulação de índices de reajuste de planos coletivos e individuais']],
 [17,['Direito Administrativo','Sanções administrativas e cumulação de penalidades na ANS']],
 [18,['Direito Administrativo','Processo administrativo sancionador: intimações e notificações']],
 [19,['Direito Administrativo','Prescrição da pretensão punitiva da agência reguladora']],
 [20,['Direito Administrativo','Reparação Voluntária e Eficaz (RVE) e notificação regulatória']],
 [21,['Direito Administrativo','Revisão administrativa e fatos novos no processo sancionador']],
 [22,['Direito Administrativo','Desconto de multa por reconhecimento e cumprimento de requisitos']],
 [23,['Direito Administrativo','Recurso administrativo e impugnação de ressarcimento ao SUS']],
 [24,['Contabilidade','Inscrição e cobrança de débito de ressarcimento ao SUS']],
 [25,['Administração Pública','Competências da ANS para ressarcimento ao SUS']],
 [26,['Administração Pública','Processo decisório da ANS e deliberação da Diretoria Colegiada']],
 [27,['Saúde Coletiva','Integração entre saúde suplementar e SUS']],
 [28,['Administração Pública','Programa Parceiros da Cidadania e informação ao consumidor']],
 [29,['Direito do Consumidor','Código de Defesa do Consumidor e marco legal dos planos de saúde']],
 [30,['Direito Administrativo','Processo administrativo disciplinar: rito sumário e acumulação de cargos']],
 [31,['Administração Pública','Planejamento estratégico da ANS e compatibilidade com o PPA']],
 [32,['Economia','Racionalidade limitada e tomada de decisão']],
 [33,['Economia','Economia comportamental e influências psicológicas e sociais nas escolhas']],
 [34,['Administração Pública','Ciência comportamental aplicada ao desenho de políticas públicas']],
 [35,['Administração Pública','Avaliação de Impacto Regulatório conforme Decreto nº 10.411/2020']],
 [36,['Administração Pública','Definição de objetivos antes da escolha de alternativas regulatórias']],
 [37,['Economia','Economias de escopo e integração vertical no setor de saúde suplementar']],
 [38,['Economia','Estruturas de mercado e concorrência na saúde suplementar']],
 [39,['Economia','Intervenção estatal e regulação econômica de operadoras de saúde']],
 [40,['Economia','Mercado relevante: dimensão geográfica e área de deslocamento']],
 [41,['Direito do Consumidor','Suspensão de plano de saúde e inclusão de novo dependente']],
 [42,['Direito do Consumidor','Contrato de plano de saúde como prestação continuada de serviços']],
 [43,['Direito do Consumidor','Planos antigos e direitos assegurados pela Lei nº 9.656/1998']],
 [44,['Economia','Rateio e formação de preço da assistência à saúde']],
 [45,['Saúde Coletiva','Cobertura assistencial e acomodação hospitalar em enfermaria']],
 [46,['Saúde Coletiva','Cobertura de urgência e emergência em plano ambulatorial']],
 [47,['Direito do Consumidor','Coparticipação em internação psiquiátrica']],
 [48,['Administração Pública','Canais de reclamação da ANS e geração de Notificação de Intermediação Preliminar']],
 [49,['Administração Pública','Evolução da NIP e mediação entre operadoras e beneficiários']],
 [50,['Administração Pública','Reabertura de demanda de reclamação na ANS']],
 [51,['Direito do Consumidor','Reembolso de atendimento realizado fora da rede credenciada']],
 [52,['Administração Pública','Disque ANS, contratação de atendimento e supervisão institucional']],
 [53,['Administração Pública','Subtemas de demandas de cobertura de planos de saúde']],
 [54,['Economia','Reajuste anual por variação de custos em planos coletivos']],
 [55,['Contabilidade','Regulação prudencial: capital, ativos e garantias financeiras']],
 [56,['Contabilidade','Nota Técnica de Registro de Produto (NTRP) e formação de preços']],
 [57,['Direito do Consumidor','Reajuste por faixa etária e mudança de contraprestação']],
 [58,['Economia','Agrupamento de contratos coletivos com menos de 30 beneficiários']],
 [59,['Administração Pública','Consolidação do mercado de planos de saúde e regulação estatal']],
 [60,['Economia','Risco moral e assimetria de informação na saúde suplementar']],
 [61,['Economia','Falhas de mercado: assimetria de informação e seleção adversa']],
 [62,['Contabilidade','Ativos garantidores registrados na ANS e limites de alienação']],
 [63,['Contabilidade','Capital regulatório e patrimônio líquido ajustado das operadoras']],
 [64,['Contabilidade','Receitas públicas e estágios da arrecadação']],
 [65,['Administração Pública','Registro de operadora e autorização para comercialização de planos']],
 [66,['Administração Pública','Objeto social e atividade exclusiva de operadoras de saúde']],
 [67,['Administração Pública','Autorização de funcionamento e supervisão de operadoras']],
 [68,['Contabilidade','Monitoramento econômico-financeiro e fontes de informação contábil']],
 [69,['Contabilidade','Indicadores econômico-financeiros das operadoras de planos de saúde']],
 [70,['Contabilidade','Receitas, despesas e variações do patrimônio líquido']],
 [71,['Contabilidade','Normas internacionais de contabilidade e pronunciamentos técnicos']],
 [72,['Saúde Coletiva','Rol de Procedimentos e Eventos em Saúde e cobertura mínima obrigatória']],
 [73,['Saúde Coletiva','Análise técnica de propostas de atualização do Rol da ANS']],
 [74,['Saúde Coletiva','Avaliação de tecnologias e incorporação ao Rol de procedimentos']],
 [75,['Administração Pública','Plano de Recuperação Assistencial e medidas corretivas da operadora']],
 [76,['Saúde Coletiva','QUALISS: qualificação e avaliação de prestadores de serviços de saúde']],
 [77,['Economia','Reajuste de remuneração de prestadores e negociação contratual']],
 [78,['Saúde Coletiva','Cuidado baseado em valor e alinhamento de incentivos entre operadora e prestador']],
 [79,['Direito Administrativo','Competências e limites da fiscalização da ANS']],
 [80,['Direito Administrativo','Infrações à Lei nº 9.656/1998 e responsabilidade de administradores']],
 [81,['Direito Administrativo','Poder sancionador da ANS e aplicação de penalidades']],
 [82,['Direito Administrativo','Ações planejadas de fiscalização e níveis de complexidade']],
 [83,['Direito Administrativo','Termo de Compromisso de Ajustamento de Conduta e cobrança de obrigações']],
 [84,['Direito Administrativo','Fiscalização preventiva e procedimento sumário']],
 [85,['Direito Administrativo','Programa de Intervenção Fiscalizatória e correção de falhas']],
 [86,['Informática','LGPD: anonimização e tratamento de dados pessoais']],
 [87,['Estatística','Dados ausentes e mecanismos de não resposta em conjuntos de dados']],
 [88,['Informática','Sistema de Informações de Beneficiários (SIB) e atualização de dados']],
 [89,['Informática','Sistemas de informação: dados, organização e funcionalidades']],
 [90,['Informática','Controle de acesso a sistemas da ANS e gestão de permissões']],
 [91,['Informática','Interoperabilidade entre sistemas de saúde e Rede Nacional de Dados em Saúde']],
 [92,['Administração Pública','Governança de dados como exercício de autoridade e controle']],
 [93,['Informática','Padrão TISS e intercâmbio eletrônico de dados em saúde suplementar']],
 [94,['Administração Pública','Transformação digital e redesenho de processos de trabalho']],
 [95,['Administração Pública','Transformação digital e mudança da entrega de valor público']],
 [96,['Administração Pública','Digitalização de processos e transformação de serviços públicos']],
 [97,['Administração Pública','Programa de Gestão e Desempenho e gestão por resultados']],
 [98,['Estatística','Variância: cálculo e interpretação de medida de dispersão']],
 [99,['Estatística','Amostragem aleatória simples e métodos de seleção de amostras']],
 [100,['Estatística','Classificação de variáveis quantitativas e qualitativas']]
])
if(topics.size!==100)throw Error(`Mapa temático deveria cobrir 100 itens, contém ${topics.size}`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const entry=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=pages.get(q.id),topic=topics.get(n),dup=duplicateOf.get(q.id)
 if(!entry||!page||!topic)throw Error(`Questão sem número, página ou assunto: ${q.id}`)
 const stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(!dup&&(stem.length<25||/�|\ufffd/.test(stem)))throw Error(`Enunciado suspeito em ${q.id}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2025,concurso:'ANS 2025 — Curso de Formação, prova objetiva, Caderno 2',numero_original:n,pagina:page,dificuldade:[17,19,20,21,22,23,24,25,26,29,30,32,35,36,37,38,40,47,49,51,54,55,56,60,61,62,63,64,67,68,69,70,71,73,74,75,76,78,80,81,82,83,86,87,91,92,94,96,98,99].includes(n)?'Difícil':[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,27,28,31,33,34,39,41,42,43,44,45,46,48,50,52,53,57,58,59,65,66,72,77,79,84,85,88,89,90,93,95,97,100].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial com base na complexidade jurídico-regulatória, econômica, contábil ou estatística; não publicada pela banca.',...(dup?{}:{enunciado:stem}),classificacao_fonte:prova,motivo:`Questão ${n}, página ${page}, Caderno 2 do Curso de Formação da ANS; assunto selecionado conforme o objeto efetivamente avaliado.`,visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial associada ao item para preservar enunciado, fórmulas e elementos visuais.'},apta_resolucao:!dup,remover_pendencias:removable,...(dup?{inelegibilidade_motivo:`Duplicata OCR do item ${n}; cópia canônica ${dup} permanece apta.`,duplicada_de:dup}:{})}
})
const valid=decisions.filter(d=>d.apta_resolucao!==false),present=new Set(valid.map(d=>d.numero_original)),missing=[...Array(100)].map((_,i)=>i+1).filter(n=>!present.has(n))
if(decisions.length!==111||valid.length!==100||missing.length||duplicateOf.size!==11)throw Error(`Cobertura divergente: registros=${decisions.length}, válidos=${valid.length}, duplicatas=${duplicateOf.size}, ausentes=${missing}`)
for(let p=1;p<=5;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,validas:valid.length,duplicatas:[...duplicateOf].map(([id,canonical])=>({id,canonical})),ausentes:missing,pendentesAntes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,porMateria:Object.fromEntries([...new Set(valid.map(d=>d.materia))].map(m=>[m,valid.filter(d=>d.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-ans-formacao-caderno2-2025-v173'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,registros_revistos:111,questoes_validas:100,duplicatas_quarentenadas:[...duplicateOf].map(([id,duplicada_de])=>({id,duplicada_de})),lacunas_finais:[],paginas_originais:[...new Set(pages.values())],correcao_automatica_nao_alterada:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
