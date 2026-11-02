import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tcerj-2021-cargo2-v297',doc='3dd033ea30e9aa36'
const prova='https://cdn.cebraspe.org.br/concursos/TCE_RJ_20/arquivos/CARGO_2.PDF'
const gabaritoBasico='https://cdn.cebraspe.org.br/concursos/tce_rj_20/arquivos/GAB_DEFINITIVO_MATRIZ_524_TCERJCB1__PAG_5.PDF'
const gabaritoEspecifico='https://cdn.cebraspe.org.br/concursos/tce_rj_20/arquivos/GAB_DEFINITIVO_MATRIZ_524_TCERJ002__PAG_5.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const base=raizesAtuais.find(x=>x.includes('revisao-slu-2019-economia-v296'))
if(!catalog||catalog.arquivo!=='CARGO_2.PDF'||catalog.questoes.length!==69)throw Error('Caderno TCE/RJ Cargo 2 divergente')
if(!base)throw Error('Base local v296 não encontrada')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==41||new Set(records.map(q=>q.numero)).size!==41)throw Error('Esperados 41 itens únicos')
const answers={100:'C',150:'E',151:'C',153:'C',154:'C',157:'E',158:'E',159:'C',160:'C',161:'C',163:'E',164:'E',166:'E',167:'C',168:'E',169:'E',171:'E',172:'E',173:'E',176:'C',177:'C',178:'E',181:'C',183:'C',184:'C',185:'E',186:'E',187:'E',188:'C',189:'E',190:'C',191:'C',192:'C',193:'C',194:'E',195:'E',196:'C',197:'E',198:'C',199:'C',200:'E'}
const subjects={
100:['Tecnologia da Informação','Data warehouse e data marts: dados históricos e sistemas transacionais'],
150:['Contabilidade Pública','Receitas orçamentárias e ingressos extraorçamentários: efeito patrimonial'],
151:['Direito Constitucional','Controle externo: competências dos Poderes e dos Tribunais de Contas'],
153:['Direito Administrativo','Poderes administrativos: autotutela e tutela sobre a administração indireta'],
154:['Direito Constitucional','Tribunais de Contas dos Municípios: entendimento do STF e organização estadual'],
157:['Legislação Institucional','Constituição do Estado do Rio de Janeiro: composição e garantias do TCE/RJ'],
158:['Legislação Institucional','Responsabilização e perda do cargo de conselheiro do TCE/RJ'],
159:['Legislação Institucional','Prestação anual de contas do TCE/RJ à Assembleia Legislativa'],
160:['Controle Externo','Competências recursais dos Tribunais de Contas sobre multas administrativas'],
161:['Controle Externo','Registro de atos de pessoal: aposentadorias, reformas, reservas e pensões'],
163:['Legislação Institucional','Regimento Interno do TCE/RJ: recursos e meios de impugnação'],
164:['Controle Externo','Parecer prévio sobre contas de governo e irrecorribilidade'],
166:['Legislação Institucional','Organização administrativa e órgãos do TCE/RJ'],
167:['Legislação Institucional','Sessões presenciais e virtuais do TCE/RJ e sustentação oral'],
168:['Legislação Institucional','Processo no TCE/RJ: capacidade processual e representação por advogado'],
169:['Legislação Institucional','Ministério Público junto ao TCE/RJ: representação nas sessões plenárias'],
171:['Licitações e Contratos','Lei n.º 8.666/1993: duração contratual e vigência dos créditos orçamentários'],
172:['Licitações e Contratos','Pregão: manifestação de intenção de recurso e prazo recursal'],
173:['Licitações e Contratos','Edital com locais distintos: propostas diferenciadas por região'],
176:['Licitações e Contratos','Lei n.º 8.666/1993: garantia contratual em obras e serviços de grande vulto'],
177:['Direito Penal','Crimes em licitações: causa de aumento de pena para agente público'],
178:['Licitações e Contratos','Convocação de licitantes remanescentes e condições da proposta'],
181:['Licitações e Contratos','Extinção contratual: caso fortuito ou força maior comprovados'],
183:['Licitações e Contratos','Alienação de bens públicos: doação com encargo e licitação'],
184:['Parcerias Público-Privadas','Fundo Garantidor de PPP: patrimônio de afetação e vinculação da garantia'],
185:['Concessões de Serviços Públicos','Lei n.º 8.987/1995: contratação de terceiros e atividades delegadas'],
186:['Licitações e Contratos','Lei n.º 8.666/1993: limites de acréscimos e supressões em reformas'],
187:['Governança de Dados','Dados e informações: características, obtenção e mensuração'],
188:['Governança de Dados','Inteligência: julgamento e tomada de decisão baseada em conhecimento'],
189:['Análise de Dados','Análise exploratória: escalas de mensuração e tipos de variáveis'],
190:['Dados Abertos','Princípios de dados abertos: acesso, reúso e participação universal'],
191:['Banco de Dados','Lógica booleana e operadores AND, OR e NOT em consultas SQL'],
192:['Banco de Dados','Modelagem conceitual: modelo entidade-relacionamento, entidades e associações'],
193:['Banco de Dados','Modelo relacional: superchaves e chaves primárias'],
194:['Banco de Dados','Modelos relacional, orientado a objetos e multidimensional: processamento transacional'],
195:['Mineração de Dados','CRISP-DM: compreensão do negócio e compreensão dos dados'],
196:['Mineração de Dados','CRISP-DM: avaliação do modelo e implantação'],
197:['Mineração de Dados','KDD: etapas do processo de descoberta de conhecimento'],
198:['Mineração de Dados','Mineração preditiva: aprendizado com dados históricos e previsão'],
199:['Mineração de Dados','Regras de associação e identificação de padrões de consumo'],
200:['Big Data','Dimensões do Big Data: volume, variedade, velocidade e veracidade']
}
const contextFor=n=>n===100?'Item de conhecimentos básicos situado ao fim do bloco comum; conceito de data warehouse, data mart e bancos transacionais.':n===150?'Itens de orçamento e contabilidade pública.':n<=161?'Itens de controle externo, Constituição do Estado do Rio de Janeiro e organização do Tribunal de Contas.':n<=169?'Itens do Regimento Interno do TCE/RJ, competências, sessões, representação e Ministério Público de Contas.':n<=186?'Itens de licitações, contratos administrativos, concessões e parcerias público-privadas.':n<=194?'Itens de gestão da informação, dados abertos, análise de dados, lógica e modelagem de bancos de dados.':'Itens de CRISP-DM, KDD, mineração preditiva, regras de associação e Big Data.'
const difficulty=n=>[100,150,151,153,159,160,161,164,166,171,172,173,177,178,181,183,185,186,187,188,190,191,192,193,195,196,197,198,199,200].includes(n)?'Fácil':[154,157,158,163,167,168,169,176,184,189,194].includes(n)?'Difícil':'Média'
const corrections={
100:'Enquanto os depósitos de dados e seus subconjuntos, data marts, são bancos estáticos, ou seja, não sofrem mudanças depois de seus dados serem agrupados, formatados e armazenados em um repositório, os bancos de dados típicos mudam constantemente, sendo dinâmicos por natureza.',
150:'Em geral, os ingressos extraorçamentários trazem reflexos no patrimônio líquido das entidades governamentais.',
159:'O TCE/RJ prestará suas contas, anualmente, à Assembleia Legislativa, no prazo de sessenta dias da abertura da sessão legislativa.',
169:'Nas sessões do Plenário, o Ministério Público será representado pelo terceiro subprocurador-geral da Justiça, ou por seu substituto.',
178:'Se o convocado não assinar o termo de contrato ou não aceitar ou retirar o instrumento equivalente no prazo e nas condições estabelecidos, será facultado à administração pública convocar os licitantes remanescentes, na ordem de classificação, para fazê-lo em igual prazo e nas mesmas condições propostas por cada um dos licitantes no certame licitatório, inclusive quanto ao preço.',
186:'No caso específico de reforma de edifício ou de equipamento, o contratado fica obrigado a aceitar, nas mesmas condições contratuais, acréscimos ou supressões que se fizerem até o limite de 50%.',
189:'No nível de mensuração da análise exploratória de dados, as variáveis são classificadas como dependentes e independentes.',
190:'As três normas fundamentais que compõem o conceito de dados abertos são: disponibilidade e acesso; reúso e distribuição; e participação universal.',
200:'Em Big Data, a premissa volume refere-se à capacidade de processar, em um ambiente computacional, diferentes tipos e formatos de dados, como fotos, vídeos e geolocalização.'
}
const decisions=records.map(q=>{
 const n=Number(q.numero),topic=subjects[n],answer=answers[n],pagina=Number(q.pagina)
 if(!topic||!answer)throw Error(`Falta classificação ou gabarito do item ${n}`)
 let enunciado=corrections[n]||q.enunciado.split(/\|\|Matriz_[^\n]*(?:\n|$)/)[0].trim().replace(/\s+/g,' ')
 enunciado=enunciado.replace(/\s+Espaço livre\s*$/i,'').replace(/\s+CONHECIMENTOS ESPECÍFICOS\s*$/i,'').replace(/\s+Considerando as disposições do Regimento Interno[\s\S]*$/i,'').replace(/\s+De acordo com a Lei Estadual n\.º 4\.787\/2006[\s\S]*$/i,'').replace(/\s+Com base nas Leis n\.º 8\.666\/1993 e n\.º 13\.303\/2016[\s\S]*$/i,'').replace(/\s+Com relação aos conceitos de análise de dados e informações[\s\S]*$/i,'').replace(/\s+Com relação a noções de mineração de dados e Big Data[\s\S]*$/i,'').trim()
 if(enunciado.length<30)throw Error(`Enunciado incompleto no item ${n}`)
 const keyUrl=n===100?gabaritoBasico:gabaritoEspecifico,keyFile=n===100?'GAB_DEFINITIVO_MATRIZ_524_TCERJCB1__PAG_5.PDF':'GAB_DEFINITIVO_MATRIZ_524_TCERJ002__PAG_5.PDF'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2021,concurso:'TCE/RJ 2021 — Analista de Controle Externo — Área Controle Externo (Cargo 2)',numero_original:n,pagina,dificuldade:difficulty(n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a extensão normativa ou técnica do conteúdo e os conceitos mobilizados; não é classificação publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial CARGO_2, aplicação em 06/02/2021; assunto e matéria identificados pelo enunciado e pelo bloco temático.`,enunciado,resposta_correta:answer==='C'?0:1,anulada:false,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:keyUrl,arquivo:keyFile,prova:catalog.arquivo,numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do CEBRASPE; para o item 100 foi usado o gabarito de conhecimentos básicos e, para os itens 150–200, o gabarito definitivo do Cargo 2.'}}
})
if(decisions.length!==41||new Set(decisions.map(x=>x.numero_original)).size!==41)throw Error('Contagem final divergente')
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/'+nome+'/acervo-extraido')
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Analista de Controle Externo — Área Controle Externo (Cargo 2)',ano_catalogo:2020,ano_aplicacao:2021,registros_revistos:41,questoes_unicas_classificadas:41,duplicatas_inelegiveis:0,questoes_anuladas:[],paginas_relevantes_referenciadas:[...new Set(records.map(q=>Number(q.pagina)))].sort((a,b)=>a-b),prova,gabarito_basico:gabaritoBasico,gabarito_especifico:gabaritoEspecifico,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão TCE/RJ 2021 — Analista de Controle Externo, Cargo 2 — v297\n\n- Revisei 41 itens pendentes: classifiquei o item 100 em Tecnologia da Informação; itens 150–169 em Contabilidade Pública, Direito Constitucional e Administrativo, Controle Externo e legislação institucional do TCE/RJ; itens 171–186 em licitações, contratos, concessões e PPP; itens 187–200 em governança de dados, análise de dados, bancos de dados, mineração de dados e Big Data.\n- Limpei cabeçalhos e trechos de itens vizinhos nos enunciados; os itens deste lote são textuais e mantêm o número da página e o caderno oficial como referência. As imagens de página não estão disponíveis na cópia local. Apliquei o gabarito definitivo de conhecimentos básicos ao item 100 e o gabarito definitivo do Cargo 2 aos itens específicos.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendentes. Não publicado na nuvem.\n- Fontes oficiais: [caderno Cargo 2](${prova}); [gabarito definitivo — conhecimentos básicos](${gabaritoBasico}); [gabarito definitivo — Cargo 2](${gabaritoEspecifico}); [página do concurso](https://www.cebraspe.org.br/concursos/TCE_RJ_20).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
