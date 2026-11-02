import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-codevasf-2021-geologia-cargo12-pendencias-v398'
const doc='e1b893adbf26e5ee'
const prova='https://cdn.cebraspe.org.br/concursos/codevasf_20/arquivos/CARGO_12__REA__GEOLOGIA.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/codevasf_20/arquivos/GAB_DEFINITIVO_MATRIZ_567_CODEVASF_012_00.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))

const answers={
  51:'E',52:'E',53:'C',54:'C',55:'E',56:'C',57:'E',58:'C',59:'C',60:'C',61:'C',62:'C',63:'E',64:'C',65:'E',66:'E',67:'E',68:'E',69:'C',70:'E',
  71:'C',72:'E',73:'C',74:'E',75:'E',76:'C',77:'E',78:'C',79:'E',80:'C',81:'C',82:'C',83:'E',84:'C',85:'E',86:'E',87:'C',88:'C',89:'C',90:'E',
  91:'C',92:'C',93:'E',94:'C',95:'C',96:'C',97:'E',98:'C',99:'C',100:'E',101:'C',102:'E',103:'C',104:'C',105:'C',106:'E',107:'E'
}

const topics={
  51:['Geologia','Petrologia sedimentar: composição, gênese e usos de calcários e dolomitos'],
  52:['Geologia','Petrologia ígnea: classificação de granitos e rochas carbonáticas'],
  53:['Geologia','Sedimentologia: gênese química e orgânica do calcário'],
  54:['Geologia','Sedimentologia e paleontologia: estruturas carbonáticas e estromatólitos'],
  55:['Geologia','Petrologia metamórfica: transformação do calcário em mármore'],
  56:['Geologia','Geologia do Pré-Cambriano: rochas ultramáficas e evolução inicial da Terra'],
  57:['Geologia','Petrologia ígnea: associação vulcânica dos terrenos granito-greenstone'],
  58:['Geologia','Estratigrafia e petrologia: sequências supracrustais arqueanas'],
  59:['Geologia','Geocronologia: unidades vulcanossedimentares paleoarqueanas'],
  60:['Geologia','Geologia regional: blocos arqueanos da Província São Francisco'],
  61:['Geologia','Geologia regional: idade e ocorrência de greenstone belts'],
  62:['Geologia','Petrologia ígnea: complexos granito-gnáissicos e suítes TTG'],
  63:['Geologia Estrutural','Tectônica de placas: subducção, colisão e interação de placas'],
  64:['Geologia Regional','Província e Cráton do São Francisco: limites e evolução tectônica'],
  65:['Geologia','Metamorfismo regional: terrenos de médio e alto grau na Bahia'],
  66:['Geologia Regional','Neoproterozoico: paleogeografia e conexão entre crátons'],
  67:['Geologia Estrutural','Falhas inversas e de empurrão: geometria e mergulho'],
  68:['Geologia Estrutural','Regime de tensões em falhas inversas'],
  69:['Geologia Estrutural','Deformação das rochas: esforço, temperatura e pressão'],
  70:['Geologia Estrutural','Dobras atectônicas e processos gravitacionais superficiais'],
  71:['Geologia de Engenharia','Investigação de sítio: geomorfologia e implantação de barragens'],
  72:['Geologia de Engenharia','Estudos de viabilidade de barragens: prospecção e ensaios de pedreira'],
  73:['Geologia de Engenharia','Fundações de barragens: dobras, estabilidade e percolação'],
  74:['Geologia de Engenharia','Barragens de concreto: tratamento das ombreiras e fundações'],
  75:['Geologia de Engenharia','Barragens de enrocamento: cortina de injeção e controle de percolação'],
  76:['Geomorfologia','Processos endógenos e evolução do relevo'],
  77:['Geomorfologia','Intemperismo e dinâmica exógena do relevo'],
  78:['Geomorfologia','Compartimentação do relevo brasileiro: depressões interplanálticas'],
  79:['Geologia','Bacias sedimentares e escudos cristalinos: origem e idade relativa'],
  80:['Geologia','Lateritas e intemperismo em chapadões tropicais'],
  81:['Geofísica','Eletrorresistividade aplicada à investigação hidrogeológica'],
  82:['Geofísica','Método MASW e caracterização elástica do subsolo'],
  83:['Geofísica','Sísmica rasa: frequência, comprimento de onda e resolução'],
  84:['Geofísica','Radar de penetração no solo (GPR) e detecção de estruturas enterradas'],
  85:['Geofísica','Gravimetria: métodos potenciais e investigação indireta'],
  86:['Geoprocessamento','Sistemas de Informação Geográfica: dados espaciais e alfanuméricos'],
  87:['Geoprocessamento','SPRING: processamento de dados georreferenciados'],
  88:['Geoprocessamento','Sistemas globais de navegação por satélite: Galileo e coordenadas'],
  89:['Geoprocessamento','Análise espacial de dados geográficos'],
  90:['Cartografia Geológica','Representação de redes em mapas geológico-geotécnicos'],
  91:['Cartografia Geotécnica','Cartas clinométricas e representação da declividade'],
  92:['Cartografia Geotécnica','Cartas de risco geológico e planejamento territorial'],
  93:['Cartografia Geológica','Mapas como representação interpretativa do meio físico'],
  94:['Cartografia Geológica','Atributos qualitativos e quantitativos de sistemas geológicos'],
  95:['Cartografia Geotécnica','Cartas geotécnicas genéricas no planejamento do uso do solo'],
  96:['Legislação Mineral e Ambiental','Pesquisa e lavra mineral em terras indígenas: competência legislativa'],
  97:['Legislação Mineral e Ambiental','Fechamento de mina: plano de recuperação de áreas degradadas'],
  98:['Legislação Mineral e Ambiental','Direito de participação do proprietário do solo nos resultados da lavra'],
  99:['Legislação Mineral e Ambiental','Regime de concessão: comprovação de recursos para o aproveitamento econômico'],
  100:['Engenharia de Minas','Barragens de rejeitos: métodos de alteamento e segurança'],
  101:['Engenharia de Minas','Fechamento de mina e planejamento de uso futuro da área'],
  102:['Hidrogeologia Ambiental','Vulnerabilidade de aquíferos e transporte de contaminantes'],
  103:['Hidrogeologia Ambiental','Nitrato em águas subterrâneas: fontes e contaminação difusa'],
  104:['Hidrogeologia Ambiental','Vazamento de combustíveis e migração de fase líquida não aquosa'],
  105:['Hidrogeologia Ambiental','Atenuação de microrganismos por filtração no solo e aquífero'],
  106:['Hidrogeologia Ambiental','Contaminantes BTEX e migração entre zonas não saturada e saturada'],
  107:['Hidrogeologia Ambiental','Fraturas e xistosidade como caminhos de fluxo de contaminantes']
}

const contexts={
  carbonatos:'Texto-base: calcários e dolomitos ocorrem na Bacia do Rio São Francisco. O bloco aborda gênese, classificação, estruturas de crescimento, usos e transformação metamórfica de rochas carbonáticas.',
  craton:'Contexto: terrenos arqueanos do Cráton/Província São Francisco, incluindo associações granito-greenstone, complexos TTG, unidades vulcanossedimentares, metamorfismo e evolução paleogeográfica.',
  tectonica:'Comando: itens de geologia estrutural sobre esforços tectônicos, falhas, dobras e condições de deformação das rochas.',
  barragens:'Comando: análise geológico-geotécnica para seleção de sítio, viabilidade, fundações, ombreiras, estabilidade e controle de percolação em barragens.',
  relevo:'Comando: julgue proposições sobre processos endógenos e exógenos, intemperismo, formas do relevo brasileiro e laterização.',
  geofisica:'Texto-base: geofísica como ferramenta multidisciplinar para estudos geológicos e geotécnicos. Itens sobre eletrorresistividade, MASW, sísmica rasa, GPR e gravimetria.',
  geoprocessamento:'Comando: conceitos e tecnologias de geoprocessamento, SIG, SPRING, GNSS, coordenadas, análise espacial e representação de redes.',
  cartografia:'Texto-base: cartografia aplicada à obtenção de dados para plantas e cartas geológico-geotécnicas. Itens sobre declividade, risco, atributos e planejamento de uso do solo.',
  leiMineral:'Comando: legislação mineral e ambiental brasileira, regimes de aproveitamento mineral, responsabilidade, fechamento de mina e barragens de rejeitos.',
  hidro:'Comando: hidrogeologia ambiental e transporte de contaminantes em solos e águas subterrâneas, vulnerabilidade de aquíferos, nitrato, combustíveis, BTEX e microrganismos.'
}
function context(n){if(n<=55)return contexts.carbonatos;if(n<=66)return contexts.craton;if(n<=70)return contexts.tectonica;if(n<=75)return contexts.barragens;if(n<=80)return contexts.relevo;if(n<=85)return contexts.geofisica;if(n<=90)return contexts.geoprocessamento;if(n<=95)return contexts.cartografia;if(n<=101)return contexts.leiMineral;return contexts.hidro}

if(records.length!==57||new Set(records.map(q=>q.numero)).size!==57)throw Error(`Esperados 57 itens distintos; recebidos ${records.length}.`)
if(records.some(q=>q.resposta!=null))throw Error('Há resposta preexistente; revisão interrompida para evitar sobrescrita.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=topics[n],answer=answers[n]
  if(!topic||!answer)throw Error(`Item ${n}: classificação ou gabarito definitivo não mapeado.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}.`)
  const stem=q.enunciado.trim().split(/\n\s*(?:Espaço livre|CEBRASPE\s*[–—-]\s*CODEVASF)/i)[0].trim()
  return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:context(n),materia:topic[0],conteudo:topic[1],ano:2021,concurso:'CODEVASF 2021 — Analista em Desenvolvimento Regional — Área Geologia — Cargo 12',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 31/01/2021',cargo:'Analista em Desenvolvimento Regional — Área Geologia — Cargo 12',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[51,54,56,59,60,62,63,64,65,66,67,68,69,70,71,72,73,74,75,78,82,83,85,87,91,92,94,95,96,97,98,99,100,101,102,103,104,105,106,107].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade geológica, geofísica, normativa ou hidrogeológica; não é nível publicado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 12; classificação temática específica definida pelo conteúdo técnico efetivamente avaliado.`,resposta_correta:answer==='C'?0:1,anulada:false,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:gabarito.split('/').at(-1),prova,numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 12 — Analista em Desenvolvimento Regional, Área Geologia.'},apta_resolucao:true}
})
if(decisions.some(d=>!d.texto_apoio||!d.materia||!d.conteudo||d.ano!==2021))throw Error('Há item sem contexto ou filtros completos.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,porMateria:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),semContexto:decisions.filter(d=>!d.texto_apoio).map(d=>d.numero),semGabarito:decisions.filter(d=>!d.gabarito_oficial).map(d=>d.numero),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — CODEVASF 2021 — Geologia — Cargo 12',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabarito,publicado:false,nota:'57 registros pendentes especializados foram classificados por Geologia, Geologia Estrutural, Geologia de Engenharia, Geofísica, Geoprocessamento, Cartografia Geotécnica, legislação mineral, Engenharia de Minas e Hidrogeologia Ambiental. Respostas conferidas no gabarito definitivo do Cargo 12; imagens originais de página preservadas. Dificuldade estimada editorialmente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — CODEVASF 2021 — Geologia, Cargo 12 — revisão v398\n\n- 57 itens pendentes reclassificados em Geologia, Geologia Estrutural, Geologia de Engenharia, Geomorfologia, Geofísica, Geoprocessamento, Cartografia, Legislação Mineral e Ambiental, Engenharia de Minas e Hidrogeologia Ambiental.\n- Gabarito oficial definitivo do Cargo 12 conferido item a item; filtros de ano, órgão, área e cargo foram registrados.\n- Contextos compartilhados da Bacia do São Francisco, Província São Francisco, barragens, métodos geofísicos, cartografia, legislação mineral e contaminação de aquíferos foram associados aos itens correspondentes; imagens originais foram preservadas.\n- Dificuldade indicada como estimativa editorial.\n- Fontes: [caderno oficial do Cargo 12](${prova}) e [gabarito definitivo do Cargo 12](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify({...report,classificadas:result.classificadas,disponiveis:result.disponiveis,pendentes:result.pendentes},null,2))
