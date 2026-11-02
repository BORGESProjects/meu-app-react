import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-trf6-2025-engenharia-eletrica-v543'
const doc='c0c1bfa23ad08e8a'
const base='tmp/revisao-profissional/revisao-fnde-curso-formacao-4-turma-2026-v542/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/trf6_24/arquivos/034_TRF6_009_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/trf6_24/arquivos/GAB_DEFINITIVO_034_TRF6_009_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)

// Gabarito oficial definitivo do caderno 034_TRF6_009_01, cargo 9.
const answers=['X','X','E','C','E','C','E','E','E','C','C','C','C','C','C','E','E','E','C','E','E','E','C','C','E','C','C','C','E','E','C','E','E','E','C','E','C','E','E','E','C','C','C','E','E','E','E','E','E','C','C','E','E','E','E','E','C','C','C','C','E','E','C','C','E','C','E','E','C','E']
assert.equal(answers.length,70)
const key=new Map(answers.map((a,i)=>[i+51,a]))

const taxonomy={
  51:['Engenharia Elétrica','Circuitos elétricos: equivalentes de Thévenin'],52:['Engenharia Elétrica','Circuitos elétricos: equivalentes de Norton'],53:['Engenharia Elétrica','Circuitos elétricos: princípio da superposição'],54:['Engenharia Elétrica','Circuitos elétricos: análise de correntes em malhas'],55:['Engenharia Elétrica','Circuitos elétricos: lei de Kirchhoff das malhas'],
  56:['Eletromagnetismo','Campo eletrostático e potencial elétrico entre placas paralelas'],57:['Eletromagnetismo','Ondas eletromagnéticas: onda plana TEM'],58:['Eletromagnetismo','Campo magnetostático e força entre condutores'],
  59:['Eletrônica Analógica','Circuitos RC ativos: filtro passa-alta e frequência de corte'],60:['Eletrônica Analógica','Função de transferência de amplificadores operacionais'],61:['Eletrônica Analógica','Transistores bipolares: amplificador coletor comum e impedância de entrada'],62:['Circuitos Elétricos','Quadripolos e amplificadores operacionais: parâmetros de impedância'],
  63:['Eletrônica Digital','Lógica combinacional: minimização de funções booleanas'],64:['Eletrônica Digital','Lógica combinacional: implementação com multiplexadores'],65:['Eletrônica de Potência','Fontes lineares: retificação, filtragem e regulação com diodo Zener'],66:['Eletrônica Digital','Conversores analógico-digitais: resolução e tensão de quantização'],67:['Telecomunicações','Redes e sistemas de comunicação: largura de banda e comutação de pacotes'],68:['Informática','Memória principal: características da memória RAM'],
  69:['Sistemas de Controle','Transformada Z: unilateralidade e unicidade da transformada inversa'],70:['Sistemas de Controle','Sistemas lineares: homogeneidade, aditividade e decomposição'],71:['Sistemas de Controle','Diagramas de blocos e função de transferência'],72:['Sistemas de Controle','Estabilidade: critério de Nyquist'],
  73:['Materiais Elétricos','Materiais ferroelétricos e polarização espontânea'],74:['Materiais Elétricos','Materiais magnéticos permanentes: ligas de alnico'],75:['Materiais Elétricos','Materiais dielétricos: fator de perda dielétrica'],
  76:['Máquinas Elétricas','Motores de indução: força magnetomotriz do rotor'],77:['Máquinas Elétricas','Motores de corrente contínua: motor série e funcionamento sem carga'],78:['Máquinas Elétricas','Transformadores reais: capacitâncias e transitórios'],79:['Máquinas Elétricas','Máquinas síncronas: ensaio de curto-circuito'],80:['Conversão Eletromecânica de Energia','Princípio dos trabalhos virtuais e conversão de energia'],
  81:['Sistemas Elétricos de Potência','Subestações: potência aparente em sistema trifásico'],82:['Proteção de Sistemas Elétricos','Relés de proteção e proteção diferencial'],83:['Sistemas Elétricos de Potência','Subestações: malha de aterramento e camada de brita'],84:['Proteção de Sistemas Elétricos','Disjuntores de média e alta tensão'],85:['Proteção de Sistemas Elétricos','Relés de distância e grandezas de operação'],86:['Proteção de Sistemas Elétricos','Para-raios e aterramento de subestações'],
  87:['Sistemas Elétricos de Potência','Curto-circuito assimétrico: componente contínua'],88:['Sistemas Elétricos de Potência','Curto-circuito bifásico e componentes simétricas'],89:['Sistemas Elétricos de Potência','Sistemas trifásicos: sequência de fases'],90:['Sistemas Elétricos de Potência','Sistemas trifásicos equilibrados: potência reativa por fase'],
  91:['Segurança em Instalações Elétricas','NR-10: prontuário de instalações elétricas'],92:['Segurança em Instalações Elétricas','Dispositivo diferencial-residual (DR) e proteção contra choque'],93:['Segurança em Instalações Elétricas','EPI em ambientes úmidos e risco de choque elétrico'],94:['Segurança em Instalações Elétricas','Procedimentos de manutenção em subestações'],
  95:['Instalações Elétricas','Instalações prediais: circuitos e cabos multipolares'],96:['Instalações Elétricas','NBR 5410: limites de queda de tensão'],97:['Instalações Elétricas','Proteção de circuitos de iluminação e curva de disjuntores'],98:['Instalações Elétricas','Esquemas de aterramento TN-C-S'],
  99:['Máquinas Elétricas','Partida de motores de indução: estrela-triângulo'],100:['Máquinas Elétricas','Partida de motores: série-paralela e tensões nominais'],101:['Máquinas Elétricas','Partida direta de motores e queda de tensão'],102:['Máquinas Elétricas','Partida de motores com chave compensadora'],103:['Sistemas Elétricos de Potência','Sistema por unidade (pu): relações de transformação'],104:['Sistemas Elétricos de Potência','Sistema por unidade (pu): bases de tensão e potência'],
  105:['Legislação Aplicada a Obras Públicas','Resolução CJF n.º 523/2019: planejamento e fiscalização de obras'],106:['Legislação Aplicada a Obras Públicas','Plano de Obras do Judiciário: acompanhamento orçamentário'],107:['Legislação Aplicada a Obras Públicas','Resolução CJF n.º 523/2019: priorização de obras'],108:['Legislação Aplicada a Obras Públicas','Resolução CNJ n.º 114/2010: planejamento e fiscalização de obras'],109:['Legislação Aplicada a Obras Públicas','Resolução CJF n.º 244/2013: comitês técnicos de obras'],110:['Gestão e Fiscalização de Obras','Responsabilidade técnica na elaboração de projetos e orçamentos'],111:['Gestão e Fiscalização de Obras','Termo de referência e projeto básico: requisitos e terreno'],
  112:['Desenho Técnico','AutoCAD: projeção isométrica e vistas ortográficas'],113:['Desenho Técnico','AutoCAD e topografia: planimetria e altimetria'],114:['Eficiência Energética','Eficiência energética: equipamentos, uso e ciclos de trabalho'],115:['Sistemas Fotovoltaicos','Geração distribuída fotovoltaica e medição de energia'],116:['Sistemas Fotovoltaicos','Geração distribuída: sincronização com a rede elétrica'],117:['Segurança Contra Incêndio','Sistemas de detecção de fumaça'],118:['Manutenção','Segurança e sinalização durante manutenção de elevadores'],119:['Manutenção','Manutenção preditiva e preventiva'],120:['Manutenção','Manutenção corretiva e manutenção programada']
}
const duplicateKeep={51:'extr-6868534da003a6389e82',52:'extr-1e06b91be4f8947994b7',53:'extr-4cdcfb4a4e7ac043a08f',54:'extr-99eeeee70db3da6572d3'}
const originalText={
  51:'Para o circuito apresentado, o equivalente de Thévenin é composto por uma fonte de tensão de 10 V em série com uma resistência de 1,5 kΩ.',
  52:'O equivalente de Norton para o circuito em análise é composto por uma fonte de corrente de 6 mA, em paralelo com uma resistência de 1,5 kΩ.',
  53:'Conforme o teorema da superposição, a tensão sobre a resistência R_L, devida apenas à ação da fonte de corrente I_1, portanto, desconsiderados os efeitos das fontes V_1 e V_2, é igual a 4 V.',
  54:'O módulo da corrente I_2 que passa no resistor R_L, conectado entre os pontos C e D, é igual a 3 mA.',
  55:'A equação V_1 + R(I_2 + I_1) − R I_2 + V_2 − R_L I_2 = 0 reflete a aplicação correta da Lei de Kirchhoff das malhas para o circuito e permite determinar a corrente I_2, que percorre o resistor R_L.',
  60:'A função de transferência, H(s), do circuito no domínio da transformada de Laplace é H(s) = −(R_2/R_1) × 1/(1 + sR_2C).',
  61:'O amplificador apresentado está na configuração coletor comum e tem ganho unitário; sua impedância de entrada, efetivamente vista pelo sinal senoidal v_g após o capacitor de acoplamento, é inferior a 5 kΩ.',
  62:'Para o circuito, V_3 = 10(V_2 − V_1).',
  63:'A expressão lógica mínima que implementa, na forma soma de produtos, a tabela verdade é S = A·B + C·D.',
  65:'A tensão de saída V_S sobre o resistor de carga R_L é inferior a 12 V.',
  66:'A menor variação de tensão (V_LSB) que pode ser detectada pelo conversor analógico-digital é igual a 1,22 mV.',
  69:'Na análise de uma transformada Z, é conveniente considerá-la unilateral, uma vez que a transformada bilateral pode não apresentar unicidade da transformada inversa.',
  70:'A propriedade da decomposição em sistemas lineares é a combinação das propriedades da homogeneidade e da aditividade.',
  71:'O diagrama de blocos a seguir representa corretamente o sistema linear em questão.',
  72:'O contorno de Nyquist para o sistema linear apresentado é representado corretamente a seguir.',
  73:'Os materiais ferroelétricos têm dipolos permanentes, que fazem com que eles se polarizem espontaneamente, mesmo sem um campo elétrico aplicado.',
  74:'As ligas de alnico (alumínio, níquel e cobalto) são caracterizadas por um alto produto de energia, alta indução remanescente e coercividade moderada.',
  75:'O fator de perda dielétrica é dado por k − sen(δ), em que k é a constante dielétrica do material, e δ é o ângulo de perda dielétrica.'
}
const contextFor=n=>{
  if(n<=55)return 'No circuito mostrado na página original, as fontes são I_1 = 10 mA, V_1 = 3 V e V_2 = 1 V; os resistores têm R = 1 kΩ e R_L = 2 kΩ. Todos os componentes são ideais. Os itens 51 a 55 referem-se ao mesmo circuito; o diagrama original está preservado na imagem da página.'
  if(n<=58)return 'Com relação às propriedades e características dos campos eletrostático e magnetostático em diferentes condições, bem como às ondas TEM, julgue os itens. A página original da prova está preservada para consulta.'
  if(n<=60)return 'No circuito amplificador operacional ilustrado na página original, os componentes são ideais, R_1 = 1 kΩ, R_2 = 10 kΩ e C = 100 nF. Julgue os itens sobre resposta em frequência e função de transferência.'
  if(n===61)return 'No circuito ilustrado, R_G = 600 Ω, R_1 = R_2 = 10 kΩ, R_L = 10 kΩ, R_E = 4,3 kΩ e V_CC = 10 V. A entrada v_g é senoidal, com amplitude de 1 V de pico; β = 200. Para a faixa de frequências considerada, os capacitores podem ser tratados como impedâncias aproximadamente nulas.'
  if(n===62)return 'Considere o circuito de amplificadores operacionais ilustrado, com R_1 = 1 kΩ, R_2 = 10 kΩ e componentes ideais. A saída é relacionada às entradas V_1 e V_2; o diagrama original está preservado na imagem da página.'
  if(n===63||n===64)return 'Tabela verdade do circuito combinacional (entradas A, B, C, D; saída S): 0000→0; 0001→0; 0010→0; 0011→1; 0100→0; 0101→0; 0110→0; 0111→1; 1000→0; 1001→0; 1010→0; 1011→1; 1100→1; 1101→1; 1110→1; 1111→1. A tabela e a página original estão preservadas.'
  if(n===65)return 'A figura da página original mostra uma fonte regulada com transformador de 220 V RMS, redução 18:1, diodo retificador D_1, capacitor C_1 = 1.000 μF, diodo Zener D_Z de 12 V, R_S = 200 Ω, R_L = 100 Ω e transistor com h_FE = 100. A figura está preservada para análise do circuito.'
  if(n===66)return 'Considere um conversor A/D de 10 bits para sinal com faixa dinâmica de 0 a 5 V.'
  if(n===67)return 'Cenário I: sinal analógico transmitido por canal de largura de banda limitada e filtro passa-baixa para atenuar altas frequências. Cenário II: sinal digital transmitido por comutação de pacotes; dados segmentados e enviados por diferentes caminhos.'
  if(n===68)return 'Em relação a componentes usados em microcomputadores, julgue o item subsequente.'
  if(n<=72)return 'Considere o sistema linear com função de transferência G(s) = 3/[s(s + 2)]. Os itens referem-se à transformada Z, propriedades de sistemas lineares, diagrama de blocos e contorno de Nyquist. Diagramas originais preservados na imagem da página.'
  if(n<=75)return 'Em relação à ciência dos materiais, julgue os itens a seguir.'
  if(n<=80)return 'Acerca de máquinas elétricas e conversão eletromecânica de energia, julgue os itens.'
  if(n<=86)return 'Uma subestação transformadora em edificação industrial utiliza transformador trifásico para abaixar a tensão de 13,8 kV para 400 V e fornece corrente de 100 A. Considere √3 = 1,7.'
  if(n<=90)return 'A respeito dos sistemas trifásicos, julgue os itens seguintes.'
  if(n<=94)return 'Considere uma instalação elétrica energizada com carga instalada de 180 kW. Os itens tratam dos procedimentos e equipamentos de segurança necessários à intervenção de manutenção.'
  if(n<=98)return 'Acerca do projeto de instalações elétricas prediais e industriais, julgue os itens subsequentes.'
  if(n<=102)return 'Em relação aos métodos de partida dos motores de indução, julgue os itens a seguir.'
  if(n<=104)return 'Julgue os itens relativos ao sistema por unidade (pu).'
  if(n<=109)return 'Com relação às Resoluções do Conselho Nacional de Justiça (CNJ) e do Conselho da Justiça Federal (CJF), julgue os itens a seguir.'
  if(n<=111)return 'A respeito do controle de execução de obras e serviços e da elaboração de termos de referência e projetos básicos, julgue os itens a seguir.'
  if(n<=113)return 'Com base nas funcionalidades do AutoCAD, julgue os itens subsequentes.'
  if(n<=116)return 'A partir dos conceitos de eficiência energética e do emprego de fontes de geração de energia, julgue os itens. O item 116 também depende da condição de sincronismo com a rede elétrica indicada no enunciado.'
  if(n===117)return 'Acerca da prevenção e do combate a incêndios, julgue o item.'
  return 'Com relação à gestão dos tipos de manutenção, julgue os itens subsequentes.'
}
const difficultyEasy=new Set([56,57,61,66,68,69,70,73,74,76,77,79,80,82,83,84,86,89,91,92,93,94,95,97,98,99,100,101,102,112,113,114,117,118,119,120])
const difficultyHard=new Set([51,52,53,54,55,58,59,60,62,63,64,65,71,72,81,87,88,90,96,103,104,105,106,107,108,109,110])
const duplicateCount=Object.keys(duplicateKeep).length
const decisions=[]
for(const q of raw){
  const n=Number(q.numero),[materia,conteudo]=taxonomy[n]||[]
  assert.ok(materia&&conteudo,`Sem classificação para item ${n}`)
  const answer=key.get(n);assert.ok(answer,`Sem chave oficial para item ${n}`)
  const duplicate=Object.hasOwn(duplicateKeep,n)&&q.id!==duplicateKeep[n]
  let enunciado=originalText[n]||String(q.enunciado||'').trim()
  if(!originalText[n]){
    enunciado=enunciado.replace(/\r/g,'').replace(/\s+/g,' ').trim()
    const nextBlock=/(?:\b(?:Espaço livre|CEBRASPE\s*[–-]|A respeito de|Acerca de|Em relação a|No que se refere|Com relação a|A partir dos conceitos)\b)/i
    const stop=enunciado.search(nextBlock)
    if(stop>55)enunciado=enunciado.slice(0,stop).trim()
    enunciado=enunciado.replace(/\bresistor de carta\b/gi,'resistor de carga').replace(/\bkQ\b/g,'kΩ').replace(/\bR i\b/g,'R_i').replace(/\bR L\b/g,'R_L')
  }
  assert.ok(enunciado.length>20,`Enunciado incompleto ${n} (${q.id})`)
  const annulled=answer==='X',page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  const difficulty=difficultyEasy.has(n)?'Fácil':difficultyHard.has(n)?'Difícil':'Média'
  decisions.push({
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,banca:'CEBRASPE',organizadora:'CEBRASPE',
    concurso:'Tribunal Regional Federal da 6ª Região — 1º concurso público para Analista Judiciário e Técnico Judiciário',
    cargo:'Analista Judiciário — Área: Apoio Especializado — Especialidade: Engenharia Elétrica (Cargo 9)',
    aplicacao:'19/01/2025',numero_original:n,dificuldade:difficulty,dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial pela quantidade de etapas de raciocínio, uso de fórmulas e especificidade normativa; a banca não divulga dificuldade individual.',
    classificacao_fonte:prova,motivo:`Item ${n} comparado ao caderno oficial do Cargo 9 e ao gabarito oficial definitivo; matéria e conteúdo delimitados pelo assunto efetivamente cobrado.`,
    tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,
    gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — caderno 034_TRF6_009_01 — Cargo 9',item:n,resposta:annulled?'Anulada':answer,aplicacao:'19/01/2025',fonte:'CEBRASPE'},
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada'],
    enunciado,texto_apoio:contextFor(n),pagina:page,
    visual:{pagina:page,imagem:image,motivo:'Página original do caderno, com diagramas, tabelas e gráficos associados ao item, preservada para resolução e conferência.'},
    apta_resolucao:!annulled&&!duplicate,correcao_automatica:!annulled&&!duplicate,
    ...(duplicate?{inelegibilidade_motivo:'duplicata_de_extracao_ocr',duplicada_de:duplicateKeep[n]}:{})
  })
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.anulada&&!x.inelegibilidade_motivo).map(x=>x.numero_original),[51,52])
assert.equal(decisions.filter(x=>x.inelegibilidade_motivo==='duplicata_de_extracao_ocr').length,duplicateCount)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,concurso:'TRF da 6ª Região — cargo 9, Analista Judiciário — Engenharia Elétrica',edital:'2024',aplicacao:'19/01/2025',nota:'71 registros confrontados com o caderno e o gabarito definitivo oficiais. Quatro duplicatas de OCR dos itens 51 a 54 mantidas como inelegíveis e vinculadas à versão canônica; itens 51 e 52 anulados pela banca. Fórmulas e textos de contexto recompostos a partir da prova oficial; gráficos, circuitos e tabela verdade permanecem na imagem original da página.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_analisados:71,duplicatas_inelegiveis:duplicateCount,anuladas:[51,52],prova_oficial:prova,gabarito_oficial:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
