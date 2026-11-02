import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-abin-eletronica-2018-v83'
const base = 'tmp/revisao-profissional/revisao-funpresp-auditoria-investimentos-v82/acervo-extraido'
const doc = '79963e01489e5ef4'
const prova = 'https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_010_01.PDF'
const pendentes = JSON.parse(await fs.readFile('tmp/pendentes-abin-2018-especificos.json', 'utf8'))
const qs = pendentes.filter(q => q.materia === 'Conhecimentos Específicos' && q.conteudo === 'Conteúdos gerais de Conhecimentos Específicos')

const temas = {
  61: ['Física', 'Termologia: condução e dissipação de calor em componentes eletrônicos'],
  62: ['Eletrônica', 'Capacitores: capacitância, dielétricos e permissividade elétrica'],
  63: ['Circuitos Elétricos', 'Resistência elétrica: resistividade, comprimento e área da seção transversal'],
  64: ['Eletrônica', 'Semicondutores: polarização de junções em transistor bipolar NPN'],
  65: ['Eletrônica', 'Semicondutores: estrutura e dopagem de transistor bipolar NPN'],
  66: ['Eletrônica', 'Semicondutores: portadores majoritários em transistor bipolar PNP'],
  67: ['Eletrônica', 'Transistores de efeito de campo: estrutura de transistor NMOS de depleção'],
  68: ['Eletrônica', 'Diodos semicondutores: polarização direta e reversa de junção PN'],
  69: ['Eletrônica', 'Semicondutores: dopagem de silício e portadores majoritários'],
  70: ['Circuitos Elétricos', 'Análise de circuitos: equivalente de Thévenin'],
  72: ['Circuitos Elétricos', 'Análise de circuitos: correntes de malha e leis de Kirchhoff'],
  73: ['Circuitos Elétricos', 'Análise de circuitos: equações de malha e lei de Kirchhoff das tensões'],
  74: ['Eletrônica', 'Circuitos RC: função de transferência no domínio de Laplace'],
  75: ['Eletrônica', 'Filtros analógicos: filtro RC passa-baixas e frequência de corte'],
  76: ['Eletrônica', 'Fontes de alimentação: retificação, filtragem e tensão de ondulação'],
  77: ['Eletrônica', 'Fontes de alimentação: tensão média em retificador com filtro capacitivo'],
  78: ['Eletrônica', 'Amplificadores com transistor bipolar: ganho de tensão e variação de componentes'],
  79: ['Eletrônica', 'Amplificadores com transistor bipolar: capacitores de bypass e polarização'],
  80: ['Eletrônica', 'Amplificadores com transistor bipolar: configuração emissor comum'],
  81: ['Eletrônica Digital', 'Família lógica TTL: compatibilidade entre subfamílias e níveis de entrada/saída'],
  82: ['Eletrônica Digital', 'Família lógica TTL: níveis lógicos e tensão de entrada'],
  83: ['Eletrônica Digital', 'Família lógica TTL: entradas não utilizadas e polarização'],
  84: ['Eletrônica Digital', 'Família lógica TTL: fator de carga (fan-out)'],
  85: ['Eletrônica Digital', 'Flip-flops JK: entradas assíncronas preset e clear'],
  86: ['Eletrônica Digital', 'Contadores assíncronos: propagação e temporização de transições'],
  87: ['Eletrônica Digital', 'Flip-flops: tabela de estados e equivalência entre tipos JK e D'],
  88: ['Eletrônica Digital', 'Circuitos sequenciais síncronos: temporização pelo pulso de clock'],
  89: ['Metrologia', 'Calibração e aferição: determinação do erro de indicação'],
  90: ['Metrologia', 'Exatidão e precisão: comparação entre medições e valor de referência'],
  91: ['Metrologia', 'Resolução de instrumentos de medição e precisão'],
  92: ['Instrumentação', 'Sensores e transdutores: conversão e transmissão de sinais'],
  94: ['Arquitetura de Computadores', 'Memórias: características de memórias EPROM e retenção de dados'],
  95: ['Arquitetura de Computadores', 'Memórias: acesso sequencial e tempo de acesso'],
  96: ['Arquitetura de Computadores', 'Memórias: refresh de memórias dinâmicas (DRAM)'],
  97: ['Telecomunicações', 'Modulação FM: pré-ênfase e resposta espectral da mensagem'],
  98: ['Telecomunicações', 'Amostragem de sinais: aliasing e subamostragem'],
  99: ['Telecomunicações', 'Meios de transmissão: imunidade da fibra óptica a interferências eletromagnéticas'],
  100: ['Telecomunicações', 'Modulação AM: sobremodulação e detecção de envoltória'],
  101: ['Sistemas de Controle', 'Sistemas de aquisição de dados: multiplexação e interface de aquisição'],
  102: ['Sistemas de Controle', 'Sistemas de controle: interface de distribuição e atuadores'],
  104: ['Sistemas de Controle', 'Aquisição de sinais: filtro antialiasing antes da conversão A/D'],
  105: ['Instrumentação', 'Condicionamento de sinais: ponte de deflexão reativa e alimentação'],
  106: ['Instrumentação', 'Condicionamento de sinais: conversor tensão-corrente e impedâncias'],
  107: ['Instrumentação', 'Amplificadores de instrumentação: rejeição de modo comum (CMRR)'],
  108: ['Instrumentação', 'Sensores resistivos: condicionamento por ponte de deflexão'],
  109: ['Sistemas de Controle', 'Sistemas lineares: resposta em frequência e diagramas de Bode'],
  110: ['Sistemas de Controle', 'Sistemas lineares: ganho estático e regime permanente'],
  111: ['Sistemas de Controle', 'Representação em espaço de estados: autovalores e estabilidade'],
  113: ['Microcontroladores', 'Interrupções: pilha e salvamento de contexto do programa'],
  114: ['Microcontroladores', 'Comunicação serial SPI: sinais MISO, MOSI e SCK'],
  115: ['Microcontroladores', 'Ferramentas de desenvolvimento: formato de arquivo Intel HEX'],
  116: ['Microcontroladores', 'Modulação por largura de pulso (PWM) e filtragem passa-baixas'],
  117: ['Física', 'Sistema Internacional de Unidades: expressão de grandezas e unidades'],
  119: ['Física', 'Eletromagnetismo: unidade SI do campo elétrico'],
  120: ['Física', 'Eletricidade: unidades derivadas de tensão e força eletromotriz'],
  121: ['Redes de Computadores', 'Comutação de pacotes e roteamento em redes de circuitos virtuais'],
  122: ['Telecomunicações', 'Modulação digital: comparação entre QAM, ASK e FSK'],
  124: ['Redes de Computadores', 'Transmissão de dados: largura de banda de sinais analógicos e digitais'],
  125: ['Redes de Computadores', 'Camada de enlace: enquadramento de quadros e bit stuffing'],
}

const blocos = [
  [61, 63, 'Contexto: comportamento de campos elétricos e magnéticos na matéria e propriedades térmicas da matéria.'],
  [64, 69, 'Contexto: teoria dos materiais semicondutores e componentes construídos com esses materiais.'],
  [70, 73, 'Contexto: circuito resistivo com fontes E1=10 V e E2=2 V, resistores R1=R2=4 kΩ e R3=R4=2 kΩ; analisar o equivalente visto nos pontos A e B. O diagrama está na imagem da página original.'],
  [74, 75, 'Contexto: circuito RC série alimentado por vi(t), com saída vo(t) medida no capacitor; diagrama e expressões estão na imagem da página original.'],
  [76, 77, 'Contexto: fonte não regulada com transformador, ponte retificadora, capacitor de 2.000 μF e carga RL; tensão RMS secundária de 12 V. O diagrama está na imagem da página original.'],
  [78, 80, 'Contexto: amplificador bipolar polarizado na região ativa, com resistores de polarização e capacitores de acoplamento/bypass; o circuito está na imagem da página original.'],
  [81, 84, 'Contexto: características elétricas da família lógica TTL (transistor-transistor logic).'],
  [85, 88, 'Contexto: sistemas digitais e circuitos sequenciais.'],
  [89, 92, 'Contexto: sistemas de medição, aferição, precisão e sensores/transdutores.'],
  [94, 96, 'Contexto: computadores digitais e memórias principais de microprocessadores.'],
  [97, 100, 'Contexto: tecnologias de comunicação para transmissão de sinais de informação.'],
  [101, 104, 'Contexto: sistema de controle digital de processo físico analógico, com interfaces de aquisição e distribuição.'],
  [105, 108, 'Contexto: sensores e circuitos de condicionamento de sinal usados em sistemas de controle digital.'],
  [109, 112, 'Contexto: sistema dinâmico linear com função de transferência G(s)=25/(s²+12s+25), entrada R(s) e saída C(s). A função está impressa na imagem da página original.'],
  [113, 116, 'Contexto: microcontroladores em automação e controle digital, com processador, memórias e periféricos.'],
  [117, 120, 'Contexto: unidades de medida e grandezas fundamentais e derivadas no Sistema Internacional.'],
  [121, 125, 'Contexto: fundamentos de redes de computadores e comunicação de dados.'],
]
const difíceis = new Set([62, 63, 70, 72, 73, 74, 75, 76, 77, 78, 79, 84, 90, 91, 97, 98, 101, 104, 106, 107, 109, 110, 111, 122])
const ids = new Set()
const decisoes = []
if (qs.length !== 59) throw new Error(`Esperados 59 itens do grupo genérico; encontrados ${qs.length}`)

for (const q of qs) {
  const n = Number(q.numero_original)
  const classificacao = temas[n]
  if (!classificacao) throw new Error(`Item ${n} sem classificação específica`)
  if (ids.has(q.id)) throw new Error(`ID repetido: ${q.id}`)
  ids.add(q.id)
  const [materia, conteudo] = classificacao
  const pagina = Number(q.pagina)
  const imagem = `paginas/${doc}-${String(pagina).padStart(4, '0')}.webp`
  const texto_apoio = blocos.find(([a, b]) => n >= a && n <= b)?.[2] || ''
  const dificuldade = difíceis.has(n) ? 'Difícil' : 'Média'
  decisoes.push({
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo,
    ano: 2018, dificuldade, dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pela complexidade conceitual e técnica do item; não representa taxa oficial de acerto.',
    classificacao_fonte: prova,
    motivo: `ABIN — Oficial Técnico de Inteligência, Cargo 2, Área 6, aplicação 2018; item ${n}. Tópico conferido no enunciado e no bloco da prova.`,
    visual: { pagina, imagem, texto_apoio, motivo: 'Página oficial do caderno conferida visualmente; fórmulas, circuitos e contexto compartilhado preservados pela imagem da página.' },
  })
}

const relatorio = await aplicarRevisoesIndividuais({ nome, base, decisoes })
const detalhe = {
  ...relatorio,
  banca: 'CEBRASPE', concurso: 'ABIN — Oficial Técnico de Inteligência, Cargo 2, Área 6', ano: 2018,
  documento: '378_ABIN_010_01.PDF', fonte: prova,
  paginas_origem_conferidas: [1, 2, 3],
  observacao: 'Classificação específica dos 59 itens antes agrupados como Conhecimentos Específicos genéricos. Contextos comuns foram restituídos por bloco; os circuitos, gráficos e fórmulas permanecem disponíveis na imagem legível da página original vinculada a cada item. Os gabaritos oficiais já estavam associados aos registros e foram preservados; não foi alterada a correção.',
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(detalhe, null, 2))
console.log(JSON.stringify(detalhe))
