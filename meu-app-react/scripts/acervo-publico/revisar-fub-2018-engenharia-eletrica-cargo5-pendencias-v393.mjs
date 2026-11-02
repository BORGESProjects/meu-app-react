import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-fub-2018-engenharia-eletrica-cargo5-pendencias-v393'
const doc='e4b0db093b738278'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_18/arquivos/MATRIZ_433_FUB005__PAG_5.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_18/arquivos/17.GAB_DEFINITIVO_MATRIZ_433_FUB005__PAG_5.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)).toString('utf8'))
const source=new Map()
for(const page of pages){
  let current=null,parts=[]
  const save=()=>{if(current!==null)source.set(current,parts.join(' ').replace(/\s+/g,' ').trim())}
  for(const raw of page.split(/\r?\n/)){
    const line=raw.trim(),m=line.match(/^\s*(5[1-9]|[6-9]\d|1[01]\d|120)\s+(.+)$/)
    if(m){save();current=Number(m[1]);parts=[m[2]];continue}
    if(current!==null&&/^(?:Na figura|No circuito|O circuito|A partir|Considerando|Julgue|Com relação|Com base|De acordo|A respeito|Acerca|Tendo como|J\. F\.|Niskier|CESPE\s*[|–—-]|Espaço livre)/i.test(line)){save();current=null;parts=[];continue}
    if(current!==null&&line)parts.push(line)
  }
  save()
}
const rows=[
  [51,'C E X C E E E C E C E C C C E E C C E E'],
  [71,'C C E E C E C C E E C C X E C E E C C C'],
  [91,'E E C C E E C E E C C E C C E E C E C E'],
  [111,'E C C E C C E C C C']
]
const answers=new Map()
for(const [start,row] of rows){const values=row.split(/\s+/),count=start===111?10:20;if(values.length!==count||values.some(x=>!['C','E','X'].includes(x)))throw Error(`Gabarito oficial inválido no bloco ${start}`);values.forEach((x,i)=>answers.set(start+i,x))}
const T={
52:['Circuitos elétricos','Regime senoidal, fase de correntes e circuitos lineares'],54:['Circuitos elétricos','Função de transferência e resposta em frequência de filtros'],55:['Circuitos elétricos','Quadripolos e admitância de entrada em curto-circuito'],
56:['Circuitos elétricos','Circuito RL: resposta transitória a degrau'],57:['Circuitos elétricos','Continuidade de corrente no indutor e resposta transitória'],58:['Eletromagnetismo','Indução eletromagnética e energia armazenada em indutores'],59:['Eletromagnetismo','Relutância magnética, fluxo e número de espiras'],60:['Eletromagnetismo','Força magnética e movimento de núcleo ferromagnético'],61:['Circuitos elétricos','Equivalentes de Thévenin e Norton em circuitos com indutores'],
62:['Eletromagnetismo','Capacitor de placas paralelas e capacitância'],63:['Eletromagnetismo','Campo elétrico e densidade de fluxo elétrico em dielétricos'],64:['Eletromagnetismo','Força elétrica em cargas entre placas paralelas'],65:['Circuitos elétricos','Equivalentes de Norton e impedância de entrada'],66:['Circuitos elétricos','Capacitor em regime senoidal e susceptância'],67:['Circuitos elétricos','Relação entre correntes em resistor e capacitor'],
68:['Telecomunicações','Tráfego telefônico e unidade Erlang'],69:['Telecomunicações','Tráfego oferecido e tráfego total em centrais telefônicas'],70:['Eletrônica analógica e digital','Conversores analógico-digitais: conversão de peso binário'],71:['Eletrônica analógica e digital','Conversor flash: arquitetura, custo e complexidade'],72:['Eletrônica analógica e digital','Conversor por aproximações sucessivas'],73:['Eletrônica analógica e digital','Conversores de rampa simples e dupla integração'],
74:['Eletrônica digital','Famílias TTL: fan-out e capacidade de acionamento'],75:['Eletrônica digital','Margem de ruído em circuitos TTL'],76:['Eletrônica digital','Atraso, potência e produto velocidade-potência'],77:['Eletrônica digital','Compatibilidade elétrica entre famílias TTL'],78:['Eletrônica digital','Lógica CMOS e portas NAND'],79:['Eletrônica digital','Tecnologia MOS: impedância de entrada e dissipação'],80:['Eletrônica digital','Transistores PMOS e operação de portas CMOS'],81:['Eletrônica digital','Análise de estados de condução em portas CMOS'],
82:['Telecomunicações','Modulação por código de pulsos: filtragem antialiasing'],83:['Telecomunicações','Amostragem e quantização em sistemas PCM'],84:['Telecomunicações','Amostragem de sinais e erro de reconstrução'],85:['Telecomunicações','Codificação de linha e componente contínua'],
86:['Informática','Arquitetura de computadores: Harvard e Von Neumann'],87:['Informática','Arquitetura CISC e microprogramação'],88:['Informática','Circuitos sequenciais e máquinas de estados de Mealy'],89:['Informática','Sistemas operacionais e multitarefa cooperativa'],
90:['Sistemas de controle','Critério de estabilidade de Routh-Hurwitz'],91:['Sistemas de controle','Estabilidade de sistemas em malha fechada'],92:['Sistemas de controle','Estabilidade de sistemas com parâmetro variável'],93:['Sistemas de controle','Representação em espaço de estados e polos'],94:['Processamento de sinais','Filtros FIR: estrutura não recursiva e estabilidade'],
95:['Materiais elétricos','Materiais diamagnéticos e permeabilidade magnética'],96:['Eletromagnetismo','Dipolo elétrico e distribuição de cargas'],97:['Materiais elétricos','Resposta dos materiais diamagnéticos a campos externos'],
98:['Máquinas elétricas','Máquinas de relutância e ímãs permanentes'],99:['Máquinas elétricas','Velocidade síncrona e frequência de alimentação'],100:['Máquinas elétricas','Motor de indução trifásico e máquina assíncrona'],101:['Máquinas elétricas','Motor de corrente contínua shunt'],102:['Eletrônica','Classificação de componentes ativos e passivos'],103:['Eletromagnetismo','Lei de Lenz e sentido da força eletromotriz induzida'],
104:['Instalações elétricas','Terminação de cabos de média tensão e controle do campo elétrico'],105:['Instalações elétricas','Transformadores de potencial em subestações'],106:['Instalações elétricas','Manobra e sequência segura de desligamento de subestações'],107:['Proteção de sistemas elétricos','Relés primários de ação direta'],108:['Proteção de sistemas elétricos','Proteção contra sobretensões atmosféricas'],109:['Proteção de sistemas elétricos','Proteção contra sobrecorrente em instalações'],110:['Transformadores','Transformador de corrente e espiras secundárias'],111:['Aterramento','Interligação de malhas de terra em instalações industriais'],112:['Aterramento','Tensão de passo e camada superficial de brita'],
115:['Máquinas elétricas','Motores trifásicos e desequilíbrio de cargas'],116:['Proteção de motores','Relé térmico e circuito de força de motores'],117:['Curto-circuito','Componentes simétrica e assimétrica da corrente de curto-circuito'],118:['Curto-circuito','Componente contínua da corrente de curto-circuito']
}
const contexts={
network:'Os itens tratam do circuito linear mostrado na imagem original da página, composto por elementos passivos, fonte independente, tensões e correntes indicadas e nós identificados por letras. Consulte o diagrama preservado junto à questão.',
inductor:'O circuito de referência contém uma fonte independente em série com resistor e indutor de núcleo ferromagnético toroidal. A representação original está preservada na imagem da página.',
capacitor:'O bloco refere-se ao circuito com fonte independente de corrente, dois resistores e capacitor de placas paralelas com dielétrico linear e isotrópico. A figura e as grandezas do circuito permanecem na imagem original da página.',
traffic:'Uma central telefônica realiza 100 chamadas com duração média de 3 minutos e recebe 150 chamadas com duração média de 2 minutos. Os itens pedem a intensidade de tráfego gerado e total, em Erlangs.',
adc:'Os itens avaliam arquiteturas e características de conversores analógico-digitais, incluindo resolução, dependência de temperatura, conversores flash, aproximação sucessiva e integração por rampa.',
ttl:'Tabela transcrita da página original — parâmetros nas colunas 74, 74LS e 74AS: atraso de propagação (ns): 9; 9,5; 1,7. Dissipação (mW): 10; 2; 8. Produto velocidade-potência (pJ): 90; 19; 13,6. Clock máximo (MHz): 35; 45; 200. Fan-out da mesma série: 10; 20; 40. VOH mínimo: 2,4; 2,7; 2,5 V. VOL máximo: 0,4; 0,5; 0,5 V. VIH mínimo: 2,0 V nas três. VIL máximo: 0,8 V nas três.',
logic:'Os itens referem-se à topologia lógica mostrada na imagem original da página, com transistores CMOS e entradas A e B. A figura da porta foi preservada junto ao item.',
pcm:'Considere o diagrama de blocos do transmissor PCM reproduzido na imagem original da página; os itens avaliam filtragem antialiasing, amostragem, quantização e codificação.',
computer:'Julgue os itens sobre arquitetura de computadores, máquinas sequenciais e sistemas operacionais.',
control:'Os itens abordam estabilidade e processamento de sinais; expressões matemáticas e diagramas que não foram recuperados como texto permanecem na imagem original da página.',
materials:'Julgue os itens a respeito das propriedades de materiais condutores, isolantes e magnéticos.',
machines:'Julgue os itens relativos a máquinas elétricas, princípios de funcionamento, velocidades e classificação de motores.',
installation:'A instalação elétrica industrial está representada no diagrama unifilar da imagem original da página, com componentes numerados. Consulte a figura preservada para identificar os elementos citados.',
tc:'Considere os princípios de construção e operação de transformadores de corrente (TC).',
ground:'Os itens tratam de malhas de aterramento em subestações e instalações industriais.',
motor:'Considere uma rede trifásica equilibrada e um motor especificado para 380/220 V e 60 Hz.',
relay:'O diagrama de força do motor assíncrono trifásico com capacitor está preservado na imagem da página; o item menciona os contatos do relé térmico.',
fault:'A imagem original apresenta componentes de uma corrente de curto-circuito, identificados numericamente; mantenha o gráfico junto aos itens para distinguir as parcelas.',
ethics:'Julgue os itens com base no Código de Ética Profissional do Sistema Confea/Crea.'
}
const contextFor=n=>n<=55?contexts.network:n<=61?contexts.inductor:n<=67?contexts.capacitor:n<=69?contexts.traffic:n<=73?contexts.adc:n<=77?contexts.ttl:n<=81?contexts.logic:n<=85?contexts.pcm:n<=89?contexts.computer:n<=94?contexts.control:n<=97?contexts.materials:n<=103?contexts.machines:n<=109?contexts.installation:n===110?contexts.tc:n<=112?contexts.ground:n===115?contexts.motor:n===116?contexts.relay:n<=118?contexts.fault:contexts.ethics
const date='Prova objetiva aplicada em 16/12/2018'
if(records.length!==62)throw Error(`Esperados 62 itens pendentes, recebidos ${records.length}`)
if(records.some(q=>q.resposta!=null))throw Error('Há respostas prévias; compare antes de sobrescrevê-las.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=T[n],answer=answers.get(n),stem=source.get(n)
  if(!topic||!answer||!stem)throw Error(`Item ${n}: classificação, resposta oficial ou texto de origem ausente.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
  const anulada=answer==='X'
  return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:contextFor(n),materia:(n>=86&&n<=89)?'Informática':'Engenharia Elétrica',conteudo:topic[1],ano:2018,concurso:'FUB 2018 — Engenheiro — Área Elétrica — Cargo 5',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:date,cargo:'Engenheiro — Área Elétrica — Cargo 5',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[55,60,61,63,64,65,66,72,73,82,83,84,85,88,90,91,92,93,94,104,106,107,108,109,111,112,117,118].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e matemática; não é classificação publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial FUB 2018, Cargo 5; tema e subtema classificados pelo conceito técnico avaliado.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'17.GAB_DEFINITIVO_MATRIZ_433_FUB005__PAG_5.PDF',prova:'MATRIZ_433_FUB005',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito definitivo oficial assinala X; item anulado.':'Gabarito definitivo oficial específico do Cargo 5 — Engenheiro/Área Elétrica.'}}
})
const list=[...records].map(q=>Number(q.numero)).sort((a,b)=>a-b)
for(const n of list)if(!answers.has(n)||!T[n])throw Error(`Item ${n} não está coberto por gabarito e classificação.`)
if(decisions.some(d=>!d.texto_apoio))throw Error('Questão sem contexto textual associado.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,anulados:decisions.filter(d=>d.anulada).map(d=>d.numero),semTexto:decisions.filter(d=>!d.enunciado).map(d=>d.numero),itensSemFonte:list.filter(n=>!source.has(n)),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — FUB 2018 — Engenheiro/Área Elétrica — Cargo 5',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabarito,publicado:false,nota:'62 pendências classificadas por disciplina e conteúdo específico. A tabela TTL foi transcrita; textos-base e descrições dos diagramas foram associados, mantendo-se as imagens originais de circuitos, PCM, máquinas, instalação unifilar e curto-circuito. Item 83 anulado conforme gabarito definitivo.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — FUB 2018 — Engenheiro/Área Elétrica, Cargo 5 — revisão v393\n\n- 62 questões classificadas em Engenharia Elétrica e Informática, com conteúdo técnico específico, ano, aplicação, cargo e dificuldade editorial estimada.\n- A tabela de famílias TTL foi transcrita para texto; os demais contextos de circuito, PCM, instalação, motor e curto-circuito foram reassociados e as imagens originais preservadas.\n- Gabarito definitivo oficial vinculado item a item; item 83 anulado.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
