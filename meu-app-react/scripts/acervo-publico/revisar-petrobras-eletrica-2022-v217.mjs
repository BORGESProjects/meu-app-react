import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-petrobras-eletrica-2022-v217',doc='e6ea69eded342472'
const prova='https://cdn.cebraspe.org.br/concursos/PETROBRAS_21_NS/arquivos/658_PETROBRAS_011_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/GAB_DEFINITIVO_658_PETROBRAS_011_01.PDF'
const concurso='PETROBRAS 2021 — Ênfase 11: Engenharia de Equipamentos — Elétrica — Cargo 11'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70||catalog.arquivo!=='658_PETROBRAS_011_01.PDF')throw Error('Caderno Petrobras Cargo 11 divergente do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-uneal-direito-2026-v216'))
if(start<0)throw Error('Base anterior v216 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const wanted=new Set(catalog.questoes.map(x=>x.id)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){active.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(active.size!==70||wanted.size)throw Error(`Esperados 70 itens Petrobras; encontrados ${active.size}; ausentes ${wanted.size}`)

const temas={
51:['Física','Eletrostática: linhas de campo entre cargas pontuais'],52:['Física','Eletrostática: condutores em equilíbrio e campo elétrico interno'],53:['Física','Eletromagnetismo: onda plana uniforme e propagação de campo elétrico'],
54:['Circuitos Elétricos','Circuitos resistivos: potência em associação série e paralelo'],55:['Circuitos Elétricos','Circuitos resistivos: divisão de tensão em resistores'],56:['Circuitos Elétricos','Circuito RLC série: frequência de ressonância'],57:['Circuitos Elétricos','Circuitos RLC: corrente máxima na ressonância'],58:['Circuitos Elétricos','Circuitos trifásicos: impedância complexa e fator de potência'],59:['Circuitos Elétricos','Circuitos trifásicos: tensões de fase em carga desequilibrada'],60:['Circuitos Elétricos','Circuitos trifásicos: relação entre corrente de linha e de fase'],
61:['Máquinas Elétricas','Transformadores ideais: relação de espiras e tensão'],62:['Máquinas Elétricas','Transformadores: impedância refletida ao primário'],63:['Máquinas Elétricas','Transformadores: potência ativa na carga'],64:['Máquinas Elétricas','Máquinas síncronas: torque de partida'],65:['Máquinas Elétricas','Máquinas síncronas: enrolamentos do rotor'],66:['Máquinas Elétricas','Máquinas síncronas: correção do fator de potência'],67:['Máquinas Elétricas','Motores de indução: potência de entrada e rendimento'],68:['Máquinas Elétricas','Motores de indução: ligação e tensão de alimentação'],69:['Máquinas Elétricas','Motores de indução: fator de serviço e capacidade de sobrecarga'],70:['Máquinas Elétricas','Motores de indução: frequência do rotor e escorregamento'],71:['Máquinas Elétricas','Máquinas de corrente contínua: gerador com excitação independente'],
72:['Sistemas Elétricos de Potência','Sistema por unidade: tensão-base em transformador'],73:['Sistemas Elétricos de Potência','Sistema por unidade: impedância-base'],74:['Sistemas Elétricos de Potência','Sistema por unidade: bases em barras conectadas por transformador'],75:['Sistemas Elétricos de Potência','Sistema por unidade: reatância de linha de transmissão'],76:['Sistemas Elétricos de Potência','Curto-circuito: especificação de para-raios e coordenação de proteção'],77:['Sistemas Elétricos de Potência','Curto-circuitos assimétricos: falta entre fases'],78:['Sistemas Elétricos de Potência','Curto-circuitos: falta trifásica para a terra'],79:['Subestações','Arranjos de barramento: continuidade de serviço e falha em barramento'],80:['Subestações','Arranjos de subestação: chaves seccionadoras'],81:['Subestações','Arranjos de subestação: barramento duplo radial'],82:['Instalações Elétricas','Comandos de motores: tensão nominal e ligação dos terminais'],83:['Instalações Elétricas','Motores trifásicos: esquema de ligação dos enrolamentos'],84:['Instalações Elétricas','Sinalização de comando: indicação de limite de corrente ou temperatura'],85:['Máquinas Elétricas','Partida de motores: comparação entre partida direta e indireta'],
86:['Instalações Elétricas','Instalações prediais: interruptores paralelos e comando de luminárias'],87:['Instalações Elétricas','Proteção de circuitos: curva de disjuntor para ar-condicionado'],88:['Instalações Elétricas','Medição de corrente e instrumentos em diagramas elétricos'],89:['Instalações Elétricas','Eletrodutos metálicos: aterramento e equipotencialização'],90:['Proteção de Sistemas Elétricos','Disjuntores a SF₆: características e limitações térmicas'],91:['Proteção de Sistemas Elétricos','Transformadores: relé Buchholz e pressão do óleo'],92:['Proteção de Sistemas Elétricos','Para-raios de óxido de zinco e gaps de centelhamento'],
93:['Eletrônica Analógica','Amplificador operacional: ganho em malha fechada'],94:['Eletrônica Analógica','Amplificador operacional: configuração inversora e não inversora'],95:['Eletrônica Analógica','Amplificador operacional: circuito integrador'],96:['Eletrônica Analógica','Amplificador operacional: somador ponderado'],97:['Eletrônica de Potência','Inversores de frequência: controle de vazão e economia de energia'],98:['Eletrônica de Potência','Inversores: unidade de processamento e acionamento de IGBT'],99:['Eletrônica de Potência','Acionamento de bombas: substituição de válvula por inversor'],
100:['Cálculo Vetorial','Teorema de Gauss: fluxo elétrico e cargas pontuais'],101:['Cálculo Vetorial','Integração de campo elétrico em região polar com densidade de carga'],102:['Cálculo Vetorial','Integral de linha: carga elétrica em fio parametrizado'],103:['Equações Diferenciais','Circuito RL: resposta da corrente a tensão senoidal'],104:['Equações Diferenciais','Circuito RLC: equação de segunda ordem e amortecimento'],105:['Álgebra Linear','Matriz nilpotente: inversibilidade da matriz I − A'],106:['Álgebra Linear','Sistemas lineares: solução geral do sistema não homogêneo'],107:['Álgebra Linear','Transformações lineares: representação e diagonalização'],108:['Sistemas de Controle','Transformada de Laplace de função periódica'],109:['Sistemas de Controle','Sistema de segunda ordem: amortecimento e resposta ao degrau'],110:['Sistemas de Controle','Função de transferência e estabilidade de malha fechada'],111:['Estatística','Inferência para média: erro padrão da média amostral'],112:['Estatística','Teste de hipóteses: p-valor e nível de significância'],113:['Estatística','Distribuição t de Student: variância com amostra pequena'],
114:['Termodinâmica','Compressores adiabáticos: eficiência e consumo energético'],115:['Termodinâmica','Ciclos de turbinas: processo termodinâmico e irreversibilidade'],116:['Termodinâmica','Resfriamento de compressores e potência de acionamento'],117:['Máquinas Térmicas','Turbinas de ação: expansão do vapor no rotor'],118:['Máquinas de Fluxo','Compressores alternativos: classificação como máquina de deslocamento positivo'],119:['Máquinas de Fluxo','Seleção de bombas para água e bombas rotativas'],120:['Mecânica dos Fluidos','Equação de energia: carga manométrica e bomba']
}
if(Object.keys(temas).length!==70)throw Error('A classificação não cobre os 70 itens')
// Gabarito definitivo por grupos, transcrito do PDF oficial (51–120).
const key51_70=['E','C','X','C','E','E','C','E','E','E','C','E','E','C','E','C','X','C','E','E']
const key71_90=['C','C','E','C','E','C','C','E','C','E','E','X','E','E','C','E','C','E','C','E']
const key91_110=['C','E','C','E','C','E','E','C','C','E','C','C','E','C','C','C','X','E','C','E']
const key111_120=['C','E','C','E','E','C','C','E','E','C']
const officialAnswers=[...key51_70,...key71_90,...key91_110,...key111_120]
if(officialAnswers.length!==70)throw Error('Gabarito não contém 70 respostas')
const answerDigest=hashRevisao(officialAnswers.join(','))
const pageOf=n=>catalog.questoes.find(q=>q.numero===n)?.pagina
const img=p=>`paginas/${doc}-${String(p).padStart(4,'0')}.webp`
for(let p=1;p<=4;p++)await fs.access(`public/acervo-extraido/${img(p)}`)
const corrections={
53:'Considere que uma onda plana uniforme se propaga na direção z, sentido negativo, e tem uma componente do campo elétrico na direção x. Nesse caso, a variação do campo elétrico no tempo t pode ser representada por E(z,t) = E₀ cos(ωt − βz) aₓ, em que ω e β são constantes.',
56:'Se R = 10 Ω, L = 10 H e C = 10 F, a frequência de ressonância do circuito será igual a 1,0 Hz.',
58:'Se Z₁ = Z₂ = Z₃ = 6 − j8 Ω, a corrente na carga estará atrasada em relação à tensão aplicada.',
75:'A reatância da linha de transmissão (LT), em p.u., é inferior a j × 0,03 Ω.',
100:'Suponha que nos pontos (1, 1, 1/2), (2, 2, −1) e (2/3, 1/4, 5/2) haja três cargas pontuais e estacionárias de valor q coulombs. Nessa situação, o fluxo do campo elétrico E através da superfície de uma esfera de raio 2 centrada na origem é 3q/ε₀, em que ε₀ é a constante de permissividade elétrica no vácuo.',
101:'Suponha que a região D = {(r, θ): −π/2 ≤ θ ≤ π/2 e a ≤ r ≤ b}, com b > a > 0, tenha densidade de carga elétrica constante de ρ coulombs por metro quadrado. Nesse caso, a força líquida F sobre uma partícula de carga Q, em coulombs, localizada na origem é F = kρQ ln(b²/a²).',
102:'Dada uma curva r(t) = (cos t, sen t, cos² t), em metros, para 0 ≤ t ≤ π/4, representando um fio, se a densidade de carga elétrica nesse fio é δ(x, y, z) = 2xy(z − y²) nC/m, então a carga elétrica total no fio é (1/6)(2³ − 1) nC.',
103:'Sabe-se que a equação diferencial para a corrente elétrica i(t) num circuito com indutor e resistor sujeita a uma tensão E(t) = E₀ cos(ωt) pode ser escrita como L di/dt + Ri = E₀ cos(ωt). Supondo-se i(0) = 0, então a função da corrente elétrica é dada por i(t) = [E₀(R cos(ωt) + ωL sen(ωt))]/(R² + L²ω²) − [E₀R/(R² + L²ω²)]e^(−Rt/L).',
104:'Suponha que q(t) seja a carga elétrica num circuito dado pela equação diferencial ordinária L d²q/dt² + R dq/dt + q/C = 0, sendo L, R e C constantes positivas representando, respectivamente, indutância, resistência e capacitância. Nesse caso, se R > √(4L/C), então as soluções linearmente independentes da equação diferencial são ambas decrescentes.',
105:'Se A é uma matriz quadrada nilpotente de índice n, então pode-se afirmar que a matriz I − A é inversível com inversa (I − A)⁻¹ = I + A + A² + ··· + Aⁿ⁻¹.',
106:'Considere as matrizes Aₙ×ₙ, bₙ×₁, Bₙ×₁ e suponha que o sistema linear Ax = b seja possível e indeterminado. Nessa situação, é correto afirmar que o conjunto solução do sistema é da forma S = {x₀ + x : Ax = 0}, em que x₀ é uma solução qualquer do problema não homogêneo.',
107:'A transformação linear T(x, y, z) = (x − z, y − z, x + y + z) é diagonalizável.',
108:'Se f: ℝ⁺ → ℝ é uma função tal que existe menor T positivo satisfazendo f(t) = f(t + T), para todo t ≥ 0, então a transformada de Laplace da função f(t) é dada por ℒ{f(t)} = [∫₀ᵀ e⁻ˢᵗ f(t) dt]/(1 − e⁻ˢᵀ).',
109:'Dado um sistema de 2.ª ordem com função de transferência F(s) = K/(τ²s² + 2ζτs + 1), em que τ é o período natural de oscilação do sistema, K é o ganho estático e ζ é o fator de amortecimento, é correto afirmar que, se ζ ≥ 1, então a resposta ao degrau do sistema será estável e monótona.',
110:'A função de transferência de uma malha fechada F(s) = (s + 2)/(2s³ + 3s² + 2s + 4) não possui polos com parte real positiva e, portanto, o sistema é estável.',
111:'Considere H₀: μ = 100 versus H₁: μ ≠ 100, em que μ denota a média de uma população normal com variância desconhecida. Supondo que X̄ denote a média amostral e S o desvio padrão amostral referente a uma amostra aleatória simples de tamanho n = 20, julgue os itens seguintes: se S² = 8.000, então a estimativa do erro padrão de X̄ é igual a 20.',
112:'No teste de hipóteses H₀: μ = 100 versus H₁: μ ≠ 100, se o p-valor for 0,05 e o nível de significância estabelecido for α = 1%, então a conclusão do teste é pela rejeição da hipótese nula.',
113:'No teste H₀: μ = 100 versus H₁: μ ≠ 100, a estatística √20(X̄ − 100)/S segue uma distribuição cuja variância é superior a 1.'
}
const shared={
 72:'Figura de sistema elétrico de potência: barra 1 ligada a transformador 23 kV/230 kV e barra 2, com bases de 25 MVA e reatância da linha indicada no diagrama.',
79:'Diagrama de arranjo de subestação com barramentos e chaves seccionadoras.',
82:'Diagrama de ligação de motor trifásico com doze terminais e terminais identificados de 1 a 12.',
86:'Diagrama da instalação elétrica de uma sala de reuniões, tensão local de 220 V, com circuitos, luminárias e ponto de instrumento.',
93:'Diagrama de amplificador operacional com entradas V1 e V2, elementos A e B na entrada, C em realimentação e saída Vsaída.',
119:'Diagrama de escoamento com máquina entre as regiões 1 e 2; as grandezas de carga devem ser interpretadas no sentido do fluxo.',
}
const getSupport=n=>n>=72&&n<=75?shared[72]:n>=79&&n<=81?shared[79]:n>=82&&n<=83?shared[82]:n>=86&&n<=89?shared[86]:n>=93&&n<=96?shared[93]:n>=119?shared[119]:''
const decisions=catalog.questoes.map(e=>{
 const q=active.get(e.id),n=e.numero,[materia,conteudo]=temas[n],page=pageOf(n),key=officialAnswers[n-51]
 if(!q?.enunciado||!materia||!conteudo||!page||!key)throw Error(`Item ${n}: campo essencial ausente`)
 let stem=corrections[n]||q.enunciado.replace(/CEBRASPE\s*[|–-]\s*PETROBRAS\s*[–-]\s*Edital:\s*2021/gi,'').replace(/\s+/g,' ').trim()
 if(stem.length<30||/\/g\d{2,}|PETROBRAS\s*[–|]/.test(stem))throw Error(`Item ${n}: fórmula/OCR não resolvido: ${stem.slice(0,180)}`)
 const anulada=key==='X',apoio=getSupport(n)||q.texto_apoio||''
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,concurso,numero_original:n,pagina:page,
  dificuldade:[53,56,58,60,62,63,67,68,70,73,75,77,78,80,81,83,87,88,90,92,93,95,96,100,101,102,103,104,105,106,107,108,109,110,112,113,114,115,118,119].includes(n)?'Difícil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade matemática, elétrica, normativa ou de engenharia; a banca não publica dificuldade psicométrica por item.',
  enunciado:stem,opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:apoio,resposta_correta:anulada?null:key==='C'?0:1,anulada,
  gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'GAB_DEFINITIVO_658_PETROBRAS_011_01.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da transcrição ordenada dos 70 gabaritos do PDF oficial definitivo; não representa hash criptográfico do PDF.',criterio:'Gabarito definitivo CEBRASPE — PETROBRAS 2021, Ênfase 11 — Engenharia de Equipamentos, Elétrica.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do enunciado, do bloco temático e da página oficial; fórmulas transcritas dos originais renderizados.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:`Página ${page} do caderno original associada ao item ${n}; mantém diagramas, fórmulas e elementos gráficos de contexto.`},
  motivo:`Revisão v217 do item ${n}: matéria e conteúdo específicos, ano/cargo, estimativa de dificuldade, transcrição de fórmula quando necessário e gabarito definitivo.`}
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_revisados:70,gabarito_anulados:[53,67,82,107],formulas_transcritas:Object.keys(corrections).map(Number),paginas_visuais:4},null,2))
