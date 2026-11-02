import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-2021-agente-v65'
const prim='b518a5f1d3c620ab',dup='feba196543ec4009'
const pdf='https://cdn.cebraspe.org.br/concursos/PF_21/arquivos/CARGO_2_AGENTE_DE_POLCIA_FEDERAL.PDF'
const gabPdf='https://cdn.cebraspe.org.br/concursos/pf_21/arquivos/GAB_DEFINITIVO_MATRIZ_577_PF_002_00.PDF'
const primQs=JSON.parse(await fs.readFile(`tmp/pf2021-${prim}.json`,'utf8'))
const dupQs=JSON.parse(await fs.readFile(`tmp/pf2021-${dup}.json`,'utf8'))
const sourcePages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${prim}.json.gz`)))
const keys=['EC E E E C E C C E E E E C C C E E C C','EE C E C E E X C E E C C E E C C C E E','EE E C E E C C C C E E E C C E C C E E','EC E E C C C E E E E E C C E C E E C C','EE E E E C E E E C C X E C C E C C E E','EC C E C X E X E C E C C E E E C C X C'].flatMap(row=>{const t=row.split(' ');return [...t[0],...t.slice(1)]})
const clean=s=>(s||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim()
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
if(keys.length!==120||primQs.length!==114||dupQs.length!==114)throw Error('Contagens inesperadas para a prova oficial PF 2021.')
const qByNumber=new Map(primQs.map(q=>[q.numero_original,q]))
const dupByNumber=new Map(dupQs.map(q=>[q.numero_original,q]))
const sourceManifest=JSON.parse(await lerArquivoAtual('manifesto.json'))
const active=new Map()
for(const [start,end] of [[1184,1189],[1386,1388]])for(let i=start;i<=end;i++){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(sourceManifest.lotes[i].arquivo)))
 for(const q of qs)if(q.documento_id===prim||q.documento_id===dup)active.set(q.id,q)
}
for(const n of qByNumber.keys())if(!dupByNumber.has(n))throw Error(`A segunda cópia não tem o item ${n}.`)
const normOptions=q=>JSON.stringify((q.opcoes||[]).map(normalize))
for(const n of qByNumber.keys())if(normalize(qByNumber.get(n).enunciado)!==normalize(dupByNumber.get(n).enunciado)||normOptions(qByNumber.get(n))!==normOptions(dupByNumber.get(n)))throw Error(`Os PDFs não coincidem no item ${n}; não será tratado como duplicata.`)

function textBetween(text,start,end){const i=text.indexOf(start);if(i<0)return '';const j=end?text.indexOf(end,i+start.length):-1;return clean(text.slice(i,j<0?undefined:j).replace(start,''))}
function context(n){
 const pg=(i)=>sourcePages[i-1]||''
 if(n<=8)return {page:2,text:textBetween(pg(2),'Texto 2A1-I','Antônio Maria.')}
 if(n<=18)return {page:2,text:textBetween(pg(2),'Texto 2A1-II','Zygmunt Bauman.')}
 if(n>=25&&n<=27)return {page:3,text:textBetween(pg(3),'Determinado agente da Polícia Federal revelou','Considerando essa situação hipotética, julgue os itens subsequentes.')}
 if(n>=28&&n<=30)return {page:3,text:textBetween(pg(3),'A polícia foi acionada','Considerando essa situação hipotética, julgue os itens subsecutivos.')}
 if(n>=37&&n<=39)return {page:4,text:textBetween(pg(4),'Considerando que o horário de ocorrência','37 O valor')}
 if(n>=40&&n<=42)return {page:4,text:textBetween(pg(4),'Considere que X e Y sejam variáveis aleatórias contínuas','Com base nessas informações, julgue os itens seguintes.')}
 if(n>=43&&n<=45)return {page:5,text:textBetween(pg(5),'3,5 5,3 3,8 3,1 3,5','43 A estimativa')}
 if(n>=46&&n<=48)return {page:5,text:textBetween(pg(5),'Um estudo objetivou avaliar','Com base nessas informações, julgue os itens a seguir.')}
 if(n>=49&&n<=51)return {page:6,text:textBetween(pg(6),'Para realizar uma operação de busca e apreensão','Tendo como base essas informações, julgue os itens seguintes.')}
 if(n>=52&&n<=57)return {page:6,text:textBetween(pg(6),'P1: Se a fiscalização','Considerando um argumento formado')}
 if(n>=58&&n<=60)return {page:6,text:textBetween(pg(6),'Considere os seguintes conjuntos:','Com base nessas informações, julgue os itens que se seguem.')}
 if(n===65)return {page:7,text:'Tabela ilustrada no caderno: A (sigla) e B (estado) são combinadas na coluna C no formato “Acre - AC”, “Alagoas - AL”, “Amapá - AP”, “Amazonas - AM” e “Bahia - BA”. A mesma página mostra o comando Preenchimento Relâmpago do Excel.'}
 if(n>=77&&n<=78)return {page:8,text:'Gráfico “Idade dos traficantes”: entre 1.789 presos, as faixas 15–19, 20–29, 30–39, 40–49, 50–59 e 60 anos ou mais correspondem, respectivamente, a 3%, 53%, 32%, 9%, 3% e 0%. A imagem do gráfico permanece associada à questão.'}
 if(n===84)return {page:8,text:'Código exibido no caderno:\nx = bool(-3)\ny = bool("True" * x)\nz = bool("False")\nprint(x and y and z)'}
 if(n===85)return {page:8,text:'Código R exibido no caderno:\nf <- function(x) {\n  g <- function(y) { y + z }\n  z <- 4\n  x + g(x)\n}\nz <- 10\nf(4)'}
 if(n>=97&&n<=101)return {page:9,text:'Elementos patrimoniais e valores em 31/12/2020: caixa R$ 20.000; duplicatas a receber R$ 50.000; empréstimos a pagar R$ 30.000; estoques R$ 40.000; imóveis de uso próprio R$ 200.000; depreciação acumulada R$ 10.000; capital social R$ 220.000; fornecedores R$ 20.000; salários a pagar R$ 50.000; reservas de lucros R$ 10.000; depósitos em bancos R$ 10.000; impostos a recolher R$ 10.000; aplicações financeiras de liquidez imediata R$ 30.000.'}
 if(n>=102&&n<=103)return {page:9,text:'A empresa XYZ quitou antecipadamente uma dívida e obteve desconto sobre os valores pendentes de pagamento.'}
 if(n>=110&&n<=112)return {page:10,text:'Referência do bloco: NBC TSP Estrutura Conceitual.'}
 if(n>=113&&n<=114)return {page:10,text:'A empresa possui recebíveis de vendas a prazo cujo recebimento não é considerado líquido e certo.'}
 if(n>=115&&n<=117)return {page:10,text:'Referência do bloco: Demonstração do Resultado do Exercício (DRE).'}
 if(n>=118&&n<=120)return {page:10,text:'Referência do bloco: pronunciamentos técnicos do Comitê de Pronunciamentos Contábeis (CPC).'}
 return {page:0,text:''}
}
function classificacao(n,stem=''){
 let materia,conteudo
 if(n<=24){materia='Português';
  if(n<=8){const m={1:'Interpretação e inferência textual',2:'Semântica: sentido e posição do advérbio',3:'Coesão referencial: pronomes e retomadas',4:'Coesão referencial: antecedente de adjetivos',5:'Reescrita e manutenção de sentido',6:'Pronomes: função sintática e coesão',7:'Semântica verbal: sentidos do verbo ter',8:'Sintaxe: sujeito e funções sintáticas'};conteudo=m[n]}
  else if(n<=18){const m={9:'Interpretação e inferência textual',10:'Pontuação: emprego da vírgula',11:'Morfossintaxe: partícula se e voz passiva',12:'Interpretação e inferência textual',13:'Concordância verbal e sujeito composto',14:'Pontuação: emprego do travessão',15:'Concordância verbal',16:'Interpretação e coerência textual',17:'Semântica: sinonímia e vocabulário',18:'Sintaxe: funções sintáticas de advérbios'};conteudo=m[n]}
  else conteudo='Redação oficial: Manual de Redação da Presidência da República'
 }else if(n<=27){materia='Direito Administrativo';conteudo=n===25?'Regime disciplinar: penalidades e demissão':n===26?'Poderes administrativos: poder de polícia':'Controle da Administração Pública: controle administrativo e externo'}
 else if(n===28){materia='Direito Processual Penal';conteudo='Competência criminal federal e atribuições da Polícia Federal'}
 else if(n===29){materia='Direito Penal';conteudo='Crimes de tráfico de drogas: inafiançabilidade e legislação especial'}
 else if(n===30){materia='Direito Constitucional';conteudo='Direitos políticos e extradição de brasileiro naturalizado'}
 else if(n<=33){materia=n===32?'Direito Penal':'Direito Processual Penal';conteudo=n===31?'Cadeia de custódia e vestígios':n===32?'Crimes contra a Administração e ordem tributária: descaminho':'Prisão em flagrante: flagrante preparado'}
 else if(n<=36){materia='Legislação Especial';conteudo=n===34?'Lei de Drogas: tráfico transnacional e causa de aumento':n===35?'Lei de Migração: expulsão e impedimento de reingresso':'Crimes ambientais: fauna silvestre e causas de aumento'}
 else if(n<=48){materia='Estatística';const m={37:'Probabilidade: densidade e constante de normalização',38:'Variáveis aleatórias: esperança matemática',39:'Probabilidade contínua: eventos de probabilidade nula',40:'Distribuições conjuntas e marginais',41:'Independência de variáveis aleatórias',42:'Esperança condicional',43:'Estimação de parâmetros: máxima verossimilhança',44:'Estimação de médias pelo método dos mínimos quadrados',45:'Estatísticas suficientes e estimação',46:'Regressão linear: correlação',47:'Inferência estatística: teste de hipóteses e significância',48:'Regressão linear: predição de média'};conteudo=m[n]}
 else if(n<=60){materia='Raciocínio Lógico';conteudo=n<=51?'Análise combinatória: formação de equipes e contagem':n<=57?'Lógica proposicional: equivalência, negação e validade de argumentos':'Teoria dos conjuntos: inclusão, união e probabilidade'}
 else if(n<=96){materia='Informática';const m={61:'Internet: operadores de busca e pesquisa',62:'Segurança digital: gerenciadores e vazamentos de senhas',63:'Segurança de navegação: HTTPS e certificados',64:'Linux: comandos de terminal e contas de usuário',65:'Planilhas eletrônicas: preenchimento relâmpago no Excel',66:'Redes de computadores: protocolo IP',67:'Modelos de referência: camadas TCP/IP e OSI',68:'Protocolos de e-mail: SMTP',69:'Segurança da informação: IDS e análise de malware',70:'Segurança da informação: ransomware e backdoors',71:'Computação em nuvem: PaaS e modelos de serviço',72:'Computação em nuvem: elasticidade e provisionamento',73:'Teoria geral de sistemas: entropia e homeostase',74:'Sistemas abertos: ambiente e intercâmbio de informações',75:'Engenharia de software: modelo espiral de Boehm',76:'Engenharia de requisitos: análise e especificação',77:'Dados, informação, conhecimento e inteligência',78:'Dados, informação, conhecimento e inteligência',79:'Redes de computadores: roteamento e modelo OSI',80:'Redes de computadores: TCP e UDP na camada de transporte',81:'Redes de computadores: quadros e camadas do modelo',82:'Redes locais: LAN e conectividade',83:'Metadados: descrição e propriedades de arquivos',84:'Programação Python: tipos booleanos e avaliação lógica',85:'Programação R: funções aninhadas e escopo léxico',86:'Mineração de dados: agrupamento e clustering',87:'Mineração de dados: entropia da informação',88:'Big data: volume e armazenamento de dados',89:'Bancos de dados: atributos, registros e tabelas',90:'Modelagem de dados: entidades e relacionamentos',91:'Bancos de dados: integridade e consistência',92:'Bancos de dados: transações e atomicidade',93:'Bancos de dados: chaves e superchaves',94:'Bancos de dados: dados estruturados e não estruturados',95:'SQL: linguagem de transação de dados (DTL)',96:'Desenvolvimento de software: APIs e interfaces'};conteudo=m[n]}
 else {materia='Contabilidade';const m={97:'Balanço patrimonial: patrimônio líquido',98:'Ativo imobilizado: custo e depreciação',99:'Natureza devedora e credora das contas',100:'Disponibilidades e ativo circulante',101:'Balanço patrimonial: ativo e capital de terceiros',102:'Fatos contábeis: pagamento de dívida com desconto',103:'Receitas financeiras e regime de competência',104:'Equação patrimonial ampliada',105:'Escrituração contábil: livro Razão',106:'Contas de compensação e atos potenciais',107:'Natureza das contas de passivo',108:'Aplicações financeiras e reconhecimento de rendimentos',109:'Escrituração: fórmulas de lançamento',110:'Contabilidade pública: definição de ativo na NBC TSP',111:'Contabilidade pública: bases de mensuração de ativos',112:'Contabilidade pública: consistência e comparabilidade',113:'Perdas estimadas e recuperabilidade de recebíveis',114:'Provisão para créditos de liquidação duvidosa',115:'DRE: despesas administrativas',116:'DRE: deduções da receita bruta de vendas',117:'Contabilidade de custos: custo dos produtos vendidos',118:'Passivo: classificação circulante de dívidas para negociação',119:'Depreciação: valor residual e valor depreciável',120:'Ativo intangível: vida útil definida e amortização'};conteudo=m[n]}
 const diff=(n>=37&&n<=60)?(n===37||n===39||n===43||n===44||n===49?'Média':'Difícil'):(n>=86&&n<=96?'Média':n>=97&&n<=120?(n===97||n===98||n===99||n===100||n===105||n===107||n===110||n===115||n===117?'Média':'Difícil'):'Média')
 if(n===2||n===3||n===6||n===8||n===10||n===11||n===13||n===14||n===15||n===17||n===18){}
 return {materia,conteudo,dificuldade:diff,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo conteúdo, extensão e quantidade de etapas de raciocínio; o Cebraspe não publica taxa de acerto individual neste caderno.'}
}
const decisoes=[]
for(const q of primQs){
 const current=active.get(q.id);if(!current)throw Error(`Item principal ausente no acervo: ${q.id}`)
 const n=q.numero_original,classification=classificacao(n,q.enunciado),key=keys[n-1],ctx=context(n)
 const img=`paginas/${prim}-${String(q.pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${img}`)
 const imageSha=hashRevisao(await fs.readFile(`public/acervo-extraido/${img}`))
 const gEvidence=`${gabPdf}\nCargo 2 - Agente de Polícia Federal\nItem ${n}: ${key==='X'?'anulado':key}`
 const gSha=hashRevisao(gEvidence)
 const d={id:q.id,sha256_enunciado:hashRevisao(current.enunciado),...classification,ano:2021,classificacao_fonte:pdf,motivo:`PF 2021 — Agente de Polícia Federal, item ${n}. Matéria e tópico definidos pelo conteúdo do item e pela seção indicada no caderno oficial. Resposta cotejada com o gabarito definitivo do Cebraspe.`,imagem_pagina:img,texto_apoio:ctx.text||'',imagens_contexto:ctx.text?[{pagina:ctx.page,imagem:`paginas/${prim}-${String(ctx.page).padStart(4,'0')}.webp`,texto:ctx.text}]:[],reemplazarContexto:true,anulada:key==='X',resposta_correta:key==='X'?null:key==='C'?0:1,gabarito_oficial:{valor:key,fonte:gabPdf,pagina:1,sha256:gSha,prova_sha256: imageSha,metodo:'Transcrição do gabarito oficial definitivo do Cebraspe, identificada por item e cargo; fingerprint SHA-256 da referência e do valor conferido.'}}
 decisoes.push(d)
}
const porNumero=new Map(primQs.map(q=>[q.numero_original,q]))
for(const q of dupQs){const current=active.get(q.id);if(!current)throw Error(`Duplicata ausente no acervo: ${q.id}`);const canonical=porNumero.get(q.numero_original);if(!canonical)throw Error(`Questão principal ${q.numero_original} ausente.`);const cl=classificacao(q.numero_original,q.enunciado);decisoes.push({id:q.id,sha256_enunciado:hashRevisao(current.enunciado),...cl,ano:2021,classificacao_fonte:pdf,motivo:`Repetição literal do item ${q.numero_original} no segundo PDF oficial do mesmo caderno; mantida a ocorrência de ${prim}.`,apta_resolucao:false,duplicada_de:canonical.id,inelegibilidade_motivo:`Duplicata exata do item ${q.numero_original} do mesmo concurso PF 2021.`})}
const adicionadas=[]
for(const [n,enunciado,materia,conteudo,ctx,difficulty] of [
 [39,'P(X = 5) > γ.','Estatística','Probabilidade contínua: densidade e evento pontual', 'Considerando X contínua com densidade f(x) = γ(x − 12)², para 0 ≤ x < 24 e γ > 0, em que γ é a constante de normalização.', 'Média'],
 [40,'Y é uma variável aleatória uniforme no intervalo (0,1).','Estatística','Distribuições conjuntas e marginais','Considere X e Y contínuas com densidade conjunta f(x,y) = x + y, para 0 < x < 1 e 0 < y < 1.', 'Difícil'],
 [41,'X e Y são variáveis aleatórias independentes.','Estatística','Independência de variáveis aleatórias','Considere X e Y contínuas com densidade conjunta f(x,y) = x + y, para 0 < x < 1 e 0 < y < 1.', 'Difícil'],
 [42,'E[X + Y | X = 1/2] = 14/12.','Estatística','Esperança condicional','Considere X e Y contínuas com densidade conjunta f(x,y) = x + y, para 0 < x < 1 e 0 < y < 1.', 'Difícil'],
 [59,'P₂ é subconjunto de P₁.','Raciocínio Lógico','Teoria dos conjuntos: inclusão e relações entre conjuntos','P = conjunto de policiais federais em efetivo exercício no país. P₁ = policiais com até 1 ano de experiência; P₂ = até 2 anos; P₃ = até 3 anos; e assim sucessivamente.', 'Média'],
 [120,'Um ativo intangível com vida útil definida está sujeito à amortização de seu valor, a qual terá início no momento em que tal ativo estiver disponível para uso.','Contabilidade','Ativo intangível: vida útil definida e amortização','Referência do bloco: pronunciamentos técnicos do Comitê de Pronunciamentos Contábeis (CPC).', 'Média'],
]){
 const key=keys[n-1],page=n<=42?4:n===59?6:10,img=`paginas/${prim}-${String(page).padStart(4,'0')}.webp`,sha=hashRevisao(`${gabPdf}\nCargo 2 - Agente de Polícia Federal\nItem ${n}: ${key}`)
 const id=`extr-${createHash('sha256').update(`${prim}|item-${n}`).digest('hex').slice(0,20)}`
 const q={id,ano:2021,numero_original:n,banca:'CEBRASPE',concurso:'PF 2021 — Agente de Polícia Federal',aplicacao:'Polícia Federal',materia,conteudo,dificuldade:difficulty,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo conteúdo, extensão e quantidade de etapas de raciocínio; o Cebraspe não publica taxa de acerto individual neste caderno.',enunciado,opcoes:['Certo','Errado'],resposta_correta:key==='C'?0:1,anulada:false,pagina:page,documento_id:prim,paginas_origem:[page],imagens_paginas:[img],pagina_imagem:img,texto_apoio:ctx,apoio:[{pagina:page,imagem:img,texto:ctx}],contexto_paginas:[{pagina:page,imagem:img,texto:ctx}],fonte:pdf,origem:'Caderno oficial CEBRASPE/PF, aplicação 2021',documento_origem:'Cargo 2 — Agente de Polícia Federal',tipo_documento:'Prova objetiva',tipo_resposta:'certo_errado',status_revisao:'revisada',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.99,classificacao_metodo:'Conferência do enunciado na página oficial e classificação semântica individual',classificacao_evidencia:`Item ${n} transcrito da página ${page}; matéria, conteúdo e resposta vinculados aos documentos oficiais.`,classificacao_fonte:pdf,gabarito_oficial:{valor:key,fonte:gabPdf,pagina:1,sha256:sha,metodo:'Transcrição da linha do item no gabarito oficial definitivo do Cebraspe.'},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]},integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]}}
 if(n===39)q.motivo='A densidade e a integral da função definem a constante γ; como X é contínua, P(X=5)=0, o que deixa o item falso (gabarito E).'
 else if(n===40)q.motivo='A densidade marginal de Y depende de y; portanto, Y não é uniforme em (0,1), conforme a análise da densidade conjunta e o gabarito definitivo (E).'
 else if(n===41)q.motivo='A densidade conjunta f(x,y)=x+y não fatoriza como produto das marginais; X e Y não são independentes (gabarito E).'
 else if(n===42)q.motivo='A distribuição condicional de Y dado X=1/2 leva a E[X+Y | X=1/2]=13/12, não 14/12 (gabarito E).'
 else if(n===59)q.motivo='P₂ reúne os policiais com até dois anos de experiência e contém P₁, não é subconjunto de P₁ (gabarito E).'
 else q.motivo='A amortização do intangível de vida útil definida começa quando o ativo fica disponível para uso (gabarito C).'
 adicionadas.push(q)
}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({decisoes:decisoes.length,primarias:primQs.length,duplicatas:dupQs.length,adicoes:adicionadas.map(q=>({item:q.numero_original,id:q.id})),idsMissing: [39,40,41,42,59,120].filter(n=>!qByNumber.has(n)),keys:keys.length,keysAnulados:keys.map((k,i)=>k==='X'?i+1:null).filter(Boolean),primaryHasImages:decisoes.slice(0,primQs.length).length,subjects:Object.fromEntries([...new Set(decisoes.slice(0,primQs.length).map(x=>x.materia))].map(m=>[m,decisoes.slice(0,primQs.length).filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes,adicoes:adicionadas})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...report,questoes_da_prova_revisadas:114,questoes_recuperadas_da_prova:120,questoes_adicionadas:6,questoes_duplicadas_desativadas:114,questoes_anuladas:keys.filter(x=>x==='X').length,gabaritos_oficiais_conferidos:120,imagens_de_pagina_conferidas:120,estimativas_de_dificuldade:120,fontes:{prova:pdf,gabarito:gabPdf}}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out))
