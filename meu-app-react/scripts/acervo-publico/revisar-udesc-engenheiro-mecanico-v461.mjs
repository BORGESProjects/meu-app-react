import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-udesc-2026-engenheiro-mecanico-cargo5-lote-v461'
const doc='05b4ff97512635dc'
const prova='https://cdn.cebraspe.org.br/concursos/udesc_26/arquivos/8F28299497CE95E94BE2737B790002E1A39CEA072D020FFC0084EF68891F105A.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/udesc_26/arquivos/5F3F03237B5EC7BCD3041CA32F5BCB9D7E23E448BAFE534A49EEFA457D799A02.pdf'
const concurso='UDESC 2026 — Técnico Universitário de Desenvolvimento — Engenheiro Mecânico'
const cargo='Técnico Universitário de Desenvolvimento — Função: Engenheiro Mecânico (Cargo 5); caderno 170_UDESC_005_01'
const blocos=[
 'C E E E E C C C C E E C E E C C C C C C',
 'E C E C C E E E C E C C E E C E E C E C',
 'E C C E E E E C E C C E E E E C X E C E',
 'C E C C E E C E C E'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))
const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'170_UDESC_005_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'UDESC_26_GABARITO_DEFINITIVO_CARGO_5.pdf',tipo:'Gabarito oficial definitivo — Cargo 5: Engenheiro Mecânico',criterio:'Caderno 170_UDESC_005_01; prova aplicada em 29/03/2026',status:'tabela_lida',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
51:['Mecânica dos Sólidos','Sistema massa-mola: amortecimento crítico e tempo de retorno'],52:['Dinâmica dos Corpos Rígidos','Momento de inércia, energia e velocidade angular de um satélite'],53:['Mecânica dos Sólidos','Colisões perfeitamente elásticas e conservação do momento'],54:['Estática','Forças em plano inclinado com atrito'],55:['Teoria das Máquinas','Mecanismos de quatro barras, inversão e manivela-balancim'],56:['Elementos de Máquinas','Trens de engrenagens e razão de velocidades'],57:['Resistência dos Materiais','Transmissão de potência, torque e dimensionamento de eixos'],58:['Resistência dos Materiais','Critério de falha de Coulomb-Mohr para ferro fundido'],59:['Materiais de Construção Mecânica','Diagrama ferro-carbono e transformação eutetoide'],60:['Materiais de Construção Mecânica','Encruamento e início da estricção em ensaio de tração'],61:['Metrologia','Repetitividade e dispersão de resultados de medição'],62:['Metrologia','Tolerâncias dimensionais, ajustes e acoplamento'],63:['Sistemas de Controle','Controle de temperatura e diferença entre malha aberta e fechada'],64:['Instrumentação Industrial','Transmissor de pressão, faixa, exatidão e saída 4–20 mA'],65:['Processos de Fabricação','Modelos de fundição e sobremetal para contração e acabamento'],66:['Usinagem','Equação de Taylor, vida da ferramenta e velocidades de corte'],67:['Materiais de Construção Mecânica','Curvas tensão-deformação e conformabilidade para estampagem'],68:['Psicrometria','Resfriamento evaporativo adiabático e estado psicrométrico'],69:['Psicrometria','Efetividade de resfriadores evaporativos e limite de resfriamento'],70:['Psicrometria','Relação entre bulbo úmido, bulbo seco e umidade relativa'],71:['Psicrometria','Interpolação de tabelas psicrométricas'],72:['Refrigeração','Ciclo de compressão de vapor e aplicações com bomba de calor'],73:['Refrigeração','Diagrama pressão-entalpia e trabalho do compressor'],74:['Refrigeração','Mudança de fase nos processos de condensação e evaporação'],75:['Refrigeração','Coeficiente de desempenho de ciclos de compressão de vapor'],76:['Mecânica dos Fluidos','Gases ideais, pressão em recipientes e manômetro diferencial'],77:['Mecânica dos Fluidos','Comparação de pressões em vasos conectados a manômetro'],78:['Transferência de Calor','Balanço de energia e calor específico em trocadores'],79:['Refrigeração','Vazão mássica e calor latente de condensação'],80:['Transferência de Calor','Temperaturas de entrada e saída em condensador'],81:['Transferência de Calor','Convecção forçada e taxa de condensação'],82:['Transferência de Calor','Balanço térmico e vazão mássica de água'],83:['Mecânica dos Fluidos','Equação de Bernoulli, manometria e variação de pressão'],84:['Mecânica dos Fluidos','Continuidade e velocidade em redução de seção'],85:['Projeto Mecânico','Fator de segurança e incertezas de projeto'],86:['Projeto Mecânico','Tensão de escoamento, tensão admissível e carregamento'],87:['Resistência dos Materiais','Critérios de Goodman e Soderberg para fadiga'],88:['Elementos de Máquinas','Soldas em filete submetidas a cisalhamento'],89:['Elementos de Máquinas','Juntas parafusadas, pré-carga e fadiga'],90:['Elementos de Máquinas','Embreagens cônicas, torque e autotravamento'],91:['Elementos de Máquinas','Dimensionamento de eixos por tensão e deflexão'],92:['Máquinas de Elevação e Transporte','Plataformas elevatórias para pessoas com mobilidade reduzida'],93:['Máquinas de Elevação e Transporte','Limitador de velocidade e freio de segurança em elevadores'],94:['Máquinas de Elevação e Transporte','Detecção de sobrecarga em elevadores'],95:['Segurança do Trabalho','Exposição ocupacional a ruído e limites da NR-15'],96:['Segurança do Trabalho','NR-10, risco elétrico e procedimento de bloqueio e etiquetagem'],97:['Segurança do Trabalho','PGR, inventário de riscos e plano de ação'],98:['Segurança do Trabalho','Espaços confinados, monitoramento e permissão de entrada'],99:['Segurança do Trabalho','Proteção contra incêndio e extintores em equipamentos elétricos'],100:['Segurança do Trabalho','Explosivos e segurança em mineração: NR-22'],101:['Segurança do Trabalho','Líquidos inflamáveis, classificação e controles da NR-20'],102:['Segurança do Trabalho','Inspeção de vasos de pressão conforme NR-13'],103:['Máquinas de Fluxo','Bombas de engrenagem e lubrificação'],104:['Máquinas de Fluxo','Máquinas de deslocamento positivo e condições de operação'],105:['Turbinas a Vapor','Equação de Euler e variação da velocidade tangencial'],106:['Turbinas a Vapor','Turbinas de ação e de reação'],107:['Turbinas a Vapor','Palhetas simétricas em turbina de impulso — item anulado'],108:['Motores de Combustão Interna','Ignição por compressão, razão de compressão e ciclo diesel'],109:['Motores de Combustão Interna','Motores Otto a gás e razão de equivalência'],110:['Compressores','Eficiência volumétrica em compressores alternativos'],111:['Compressores','Etapas de admissão, compressão e descarga em compressores'],112:['Refrigeração e Ar-Condicionado','Ventilação evaporativa e resfriamento do ar'],113:['Compressores','Dados de placa de compressores herméticos'],114:['Manutenção Industrial','Gestão estratégica da manutenção e tomada de decisão'],115:['Manutenção Industrial','Manutenção detectiva e falhas ocultas'],116:['Manutenção Industrial','Estruturas centralizada e híbrida de manutenção'],117:['Manutenção Industrial','FMEA: análise de modos e efeitos de falha'],118:['Manutenção Industrial','Manutenção produtiva total (TPM)'],119:['Manutenção Industrial','Auditoria estrutural e produtividade da manutenção'],120:['Máquinas Elétricas','Motor trifásico e ligações estrela e triângulo']
}
const fontes={
55:'Diagrama de mecanismo plano de quatro barras identificado pelos elos 1, 2, 3 e 4, conforme a figura da página 1.',
59:'O diagrama ferro-carbono da página 1 identifica regiões de fases e o ponto A; mantenha a figura original para leitura do diagrama.',
62:'Desenho de duas peças cilíndricas com cotas nominais de 75 mm e tolerâncias dimensionais; figura integral na página 2.',
64:'Tabela do instrumento PT-41205: faixa de medição −0,5 a 2,5 kgf/cm²; saída 4 a 20 mA; exatidão ±0,75% do alcance.',
67:'Gráfico tensão σ versus deformação ε para os materiais A, B e C, com deformações ε₁ e ε₂ e pontos de falha indicados; figura na página 2.',
68:'Resfriador evaporativo adiabático: ar entra a 28 °C e 53% de umidade relativa; na saída, considera-se umidade relativa de 80%. A figura da página 3 mostra o fluxo de ar e a água.',
69:'Resfriador evaporativo adiabático com aumento da área e do tempo de contato entre ar e água; mantenha a figura da página 3 como referência.',
70:'Dados psicrométricos para temperatura de bulbo úmido constante em 21 °C: bulbo seco/umidade relativa — 30 °C/45%; 28 °C/53%; 25 °C/70%; 22,2 °C/90%.',
71:'Dados psicrométricos para temperatura de bulbo seco de 28 °C: bulbo úmido/umidade relativa — 16,5 °C/30%; 20,4 °C/50%; 23,8 °C/70%; 26,7 °C/90%. A água tem a mesma temperatura do ar na entrada.',
72:'O gráfico pressão × entalpia da página 3 mostra os ciclos de compressão a vapor 1–2–3–4–1 e 1–2′–3–4–1.',
73:'O gráfico pressão × entalpia da página 3 mostra os ciclos de compressão a vapor 1–2–3–4–1 e 1–2′–3–4–1.',
74:'O gráfico pressão × entalpia da página 3 mostra os ciclos de compressão a vapor 1–2–3–4–1 e 1–2′–3–4–1.',
75:'O gráfico pressão × entalpia da página 3 mostra os ciclos de compressão a vapor 1–2–3–4–1 e 1–2′–3–4–1.',
76:'Dois recipientes A e B, de volumes iguais, contêm gases ideais distintos e estão conectados ao manômetro da figura na página 3. A razão entre as densidades dos líquidos 2 e 1 é ρ₂/ρ₁ = 1,2; a diferença indicada é 0,2x.',
77:'Dois recipientes A e B, de volumes iguais, contêm gases ideais distintos e estão conectados ao manômetro da figura na página 3. A razão entre as densidades dos líquidos 2 e 1 é ρ₂/ρ₁ = 1,2; a diferença indicada é 0,2x.',
78:'Trocador de calor: refrigerante entra como vapor saturado e sai como líquido saturado; potência térmica 5,04 kW; calor específico da água a pressão constante 4,2 kJ/(kg·K); calor latente de vaporização 200 kJ/kg. A figura esquemática está na página 4.',
79:'Trocador de calor: refrigerante entra como vapor saturado e sai como líquido saturado; potência térmica 5,04 kW; calor latente de vaporização 200 kJ/kg. A figura esquemática está na página 4.',
80:'Trocador de calor: refrigerante entra como vapor saturado e sai como líquido saturado; potência térmica 5,04 kW. A figura esquemática está na página 4.',
81:'Para substituição por trocador a ar: temperatura do ar de entrada 28 °C; área externa do tubo 0,3 m²; temperatura superficial 52 °C; coeficiente convectivo 140 W/(m²·K); calor latente do refrigerante 200 kJ/kg.',
82:'Trocador de calor com água: potência térmica 5,04 kW; calor específico da água a pressão constante 4,2 kJ/(kg·K); diferença entre entrada e saída do ar/água conforme figura da página 4.',
83:'Manômetro em tubo horizontal com água em regime permanente e sem atrito: líquido manométrico de densidade 1.250 kg/m³; diferença de altura x = 5 cm; relação entre áreas A₂ = A₁/√2; g = 10 m/s²; densidade da água 1.000 kg/m³.',
84:'Manômetro em tubo horizontal com água em regime permanente e sem atrito: líquido manométrico de densidade 1.250 kg/m³; diferença de altura x = 5 cm; relação entre áreas A₂ = A₁/√2; g = 10 m/s²; densidade da água 1.000 kg/m³.'
}
const contextos=[
 [51,54,'Considerando os princípios e conceitos da mecânica dos sólidos, julgue os itens seguintes.'],
 [55,56,'Com base nos princípios e conceitos de teoria das máquinas, julgue os itens seguintes.'],
 [57,60,'Com base nos princípios e conceitos da mecânica dos materiais, julgue os itens seguintes.'],
 [61,62,'No que se refere à metrologia, julgue os itens subsecutivos.'],
 [63,64,'A respeito de sistemas de controle e instrumentação industrial, julgue os itens.'],
 [65,66,'Acerca de processos de fabricação e usinagem, julgue os itens a seguir.'],
 [67,67,'Considere as curvas tensão-deformação dos materiais A, B e C apresentadas no gráfico.'],
 [68,71,'Um resfriador evaporativo adiabático opera com fluxo de ar constante; utilize a figura e os dados psicrométricos indicados.'],
 [72,75,'Considere o gráfico pressão × entalpia com ciclos de compressão a vapor dos equipamentos.'],
 [76,77,'Considere o manômetro conectado a dois recipientes de mesmo volume contendo gases ideais distintos.'],
 [78,82,'Considere o trocador de calor empregado na condensação do refrigerante, com os dados de operação fornecidos.'],
 [83,84,'Considere o escoamento permanente e sem atrito no tubo horizontal conectado ao manômetro.'],
 [85,87,'Julgue os itens sobre projeto mecânico, fator de segurança, confiabilidade e fadiga.'],
 [88,91,'Julgue os itens relativos ao funcionamento e dimensionamento de elementos de máquinas.'],
 [92,94,'Julgue os itens sobre operação e projeto de máquinas de elevação e transporte.'],
 [95,98,'Julgue os itens relativos à engenharia de segurança do trabalho.'],
 [99,102,'Julgue os itens sobre prevenção, proteção à saúde, segurança ocupacional e meio ambiente.'],
 [103,104,'Acerca de máquinas de fluxo e bombas de engrenagem, julgue os itens.'],
 [105,107,'A respeito de turbinas a vapor, julgue os itens seguintes.'],
 [108,109,'Em relação a motores de combustão interna, julgue os itens a seguir.'],
 [110,111,'Julgue os itens seguintes, acerca de compressores.'],
 [112,113,'Acerca de sistemas de refrigeração, ventilação e ar-condicionado, julgue os itens a seguir.'],
 [114,119,'No que se refere à manutenção, julgue os itens seguintes.'],
 [120,120,'Acerca de motores elétricos, julgue o item a seguir.']
]
const contexto=n=>{const base=contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||'';return fontes[n]?`${base}\n\n${fontes[n]}`:base}
const canonicas=new Map([[52,'extr-d216e492ec8a19bb638b'],[53,'extr-1efff4ecfc05d669e9e6'],[54,'extr-a43cbec9aa3b445462c8'],[55,'extr-a469b8d678b427d0df66'],[56,'extr-55c7853914d07b1ce029'],[58,'extr-54d87c3c343097ff9293'],[59,'extr-d74988c9c705d3953913']])
const exportado=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>Number(q.numero))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const faceis=new Set([51,53,54,56,59,61,63,65,69,70,71,72,74,76,77,82,83,84,85,86,92,93,94,95,99,100,101,103,104,106,108,110,112,113,114,117,118,120])
const dificeis=new Set([52,55,57,58,60,62,64,66,67,68,73,75,78,79,81,87,88,89,90,91,96,97,98,102,105,107,109,111,115,116,119])
const correcoes={
 52:'Considere um satélite artificial esférico, de raio r, massa m e momento de inércia I = (2/5)·m·r², que orbita a Terra e gira em torno de seu eixo com velocidade angular ω₀. Para aumentar essa velocidade de rotação, seus motores são acionados momentaneamente, fornecendo energia E. Nessa situação, a velocidade angular após o acionamento é expressa por ω = (1/5)·m·r²·E + ω₀.',
 53:'Suponha que duas esferas de massas iguais a m, feitas do mesmo material perfeitamente elástico, estejam sobre um plano. Se uma delas for lançada com velocidade vᵢ contra a outra e ocorrer uma colisão, ambas se deslocarão, após o impacto, com velocidade final v_f = vᵢ/4.',
 54:'Considere um bloco de peso P sobre um plano inclinado a um ângulo α em relação à horizontal. Se o coeficiente de atrito entre o plano e o bloco for μ, a força F, paralela ao plano, necessária para deslocar o bloco para cima é F = P[cos(α) + μ·sen(α)].',
 56:'Em um trem formado por seis engrenagens A, B, C, D, E e F, com 20, 60, 30, 80, 25 e 75 dentes, respectivamente, a razão entre as velocidades da engrenagem movida F e da motora A é 1/24.',
 58:'Considere um componente mecânico de ferro fundido ASTM 30 com resistência à ruptura por tração Sᵤₜ = 250 MPa e resistência à ruptura por compressão Sᵤ꜀ = 750 MPa. Pela teoria de falha de Coulomb–Mohr, se o componente estiver submetido a estado plano de tensões com tensões principais σ₁ = 150 MPa e σ₂ = −150 MPa, ele não sofrerá ruptura.',
 59:'No diagrama ferro-carbono, o ponto A, denominado ponto eutetoide, representa a transformação da austenita em uma microestrutura composta por lamelas alternadas de ferrita e cementita.',
 60:'Em um corpo de prova de ensaio de tração de aço dúctil, a condição para o início da estricção é que a deformação verdadeira ε assuma o valor ε = ln(1 − n), em que n é o coeficiente de encruamento.',
 64:'Em um sistema de controle de planta-piloto, um instrumento de medição de pressão identificado como PT-41205 possui as características técnicas mostradas na tabela de apoio. Para pressão de 1,0 kgf/cm², o valor desejado da corrente de saída deverá ser menor que 10 mA.',
 66:'O intervalo de velocidades de corte que proporciona máxima eficiência no torneamento está entre as velocidades de máxima produção, v_c,máx, e de mínimo custo, v_c,min, calculadas com base na relação de Taylor v_c·Tⁿ = C, em que T é a vida da ferramenta e n e C são constantes que dependem dos materiais da peça e da ferramenta.',
 67:'Entre os materiais A, B e C, cujas curvas tensão-deformação são mostradas no gráfico, deseja-se selecionar um material para confeccionar placas de automóveis por estampagem de chapas. Nesse caso, o material C não é indicado para esse fim.',
 77:'A pressão do gás no recipiente B é maior que a pressão do gás no recipiente A.',
 98:'Os trabalhos em espaços confinados, conforme a NR-33, requerem vigilância externa com comunicação contínua e análise gasométrica, com concentração de oxigênio entre 19,5% e 23,5%, sendo vedado o trabalho isolado mesmo com Permissão de Entrada e Trabalho (PET) emitida.',
 111:'O processo de compressão em sistemas alternativos controlados por válvulas automáticas de admissão e descarga ocorre em três fases: estabelecimento de diferencial de pressão para admissão do gás no cilindro; compressão politrópica; e estabelecimento de novo diferencial de pressão para transferir o gás comprimido ao coletor de descarga.',
 119:'Para melhorar a produtividade da manutenção, é essencial realizar uma auditoria estrutural que avalie, entre outros fatores, dimensionamento e políticas de pessoal, treinamento gerencial, planejamento e programação das ordens de serviço, controle de estoques, materiais e ferramentas, e sistema de informação.'
}
const anulados=new Set([107])
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const pagina=n<=60?1:n<=67?2:n<=77?3:n<=84?4:n<=98?5:6
 let enunciado=correcoes[n]||q.enunciado
 if(!correcoes[n])enunciado=enunciado.split(/\n(?=Espaço livre|CEBRASPE – UDESC|Acerca de|No que se refere|A respeito de|Julgue os itens|Julgue os próximos|Com base nos princípios|Em relação a)/)[0].replace(/\s+/g,' ').trim()
 const anulada=anulados.has(n)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2026,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 29/03/2026; edital publicado em 2026',numero_original:n,numero:n,pagina,dificuldade:dificeis.has(n)?'Difícil':faceis.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência de cálculo, interpretação de diagramas e normas técnicas; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo assunto e pelo caderno oficial 170_UDESC_005_01, Cargo 5.`,enunciado,texto_apoio:contexto(n),imagem_pagina:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:true,resposta_correta:anulada?null:g==='C'?0:1,anulada,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'UDESC_26_GABARITO_DEFINITIVO_CARGO_5.pdf',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito oficial definitivo do Cargo 5, itens 51 a 120.',numero:n,resposta:g,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.apta_resolucao=false;d.inelegibilidade_motivo='Duplicata OCR do mesmo número e caderno; preservada a versão mais íntegra.';d.duplicada_de=manter.get(n)}
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2026,aplicacao:'29/03/2026',cargo:5,registros_brutos:77,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[...anulados],duplicatas:7,paginas_origem_conferidas:[1,2,3,4,5,6],recursos_visuais_preservados:['mecanismo de quatro barras','diagrama ferro-carbono','tolerâncias dimensionais','curvas tensão-deformação','resfriador evaporativo e tabelas psicrométricas','ciclos P-h','manômetros','trocador de calor'],formulas_reconstruidas:[52,54,58,60,66,81,105],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
