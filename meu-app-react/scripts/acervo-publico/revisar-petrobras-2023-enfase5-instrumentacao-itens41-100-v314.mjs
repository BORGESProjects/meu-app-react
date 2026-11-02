import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2d8f17c9dcaf4560'
const prova='https://cdn.cebraspe.org.br/concursos/PETROBRAS_23_NM/arquivos/822_PETROBRAS_23_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_23_nm/arquivos/GAB_DEFINITIVO_822_PETROBRAS_23_005_01.PDF'
const concurso='PETROBRAS 2023 — Profissional de Nível Técnico Júnior — Ênfase 5: Manutenção – Instrumentação'
const cargo='Profissional Petrobras de Nível Técnico Júnior — Ênfase 5: Manutenção – Instrumentação'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==64)throw Error('Caderno PETROBRAS divergente do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const selected=records.filter(q=>q.numero>=41&&q.numero<=100)
if(selected.length!==64||new Set(selected.map(q=>q.numero)).size!==60)throw Error(`Esperados 60 itens e 4 duplicatas, recebidos ${selected.length}`)

const stems={
41:'Incerteza expandida corresponde ao intervalo dentro do qual se espera encontrar, com uma certeza de 75%, a componente aleatória dos erros de um processo de medição.',
42:'Os erros sistemáticos e aleatórios podem ser apresentados em uma curva de calibração, na qual é possível observar os valores dos erros em relação aos valores indicados pelo instrumento.',
43:'O certificado de calibração do instrumento apresenta os valores da incerteza de medição, juntamente com os erros de medição ou correções a serem aplicadas.',
44:'A unidade de medida de pressão é uma grandeza secundária do Sistema Internacional de Unidades, pois está relacionada ao metro, ao quilograma e ao segundo.',
45:'A medição de temperatura com um termopar é obtida a partir da variação do comprimento do sensor, devido à variação da temperatura, em contato com o meio em que se deseja efetuar as medições.',
46:'Na medição de temperatura com um termômetro de bulbo de mercúrio, a leitura dos valores sobre a escala do instrumento pode ser feita imediatamente após o posicionamento do instrumento no local ou ambiente desejado.',
47:'No manômetro de Bourdon, a pressão medida é proporcional à diferença de potencial elétrico gerada no circuito que o compõe.',
48:'No termômetro de tira bimetálica, a variação de temperatura é determinada a partir da expansão ou contração térmica linear de dois materiais metálicos diferentes.',
49:'Os medidores de vazão encontrados em postos de gasolina são geralmente do tipo deslocamento positivo, como os medidores de lóbulo rotativo.',
50:'A calibração de medidores de turbina pode ser corretamente realizada por meio do emprego de anemômetros colocados em série em uma mesma tubulação.',
51:'A verificação do nível de óleo no cárter de motores de automóveis pode ser corretamente realizada observando-se a altura da marca de óleo na vareta de uma régua graduada.',
52:'A medição da velocidade de um fluido pode ser corretamente efetivada usando-se um rotâmetro, instrumento de baixo custo e alta precisão, no qual podem ser observadas a altura de um flutuador e sua posição em relação à escala vertical.',
53:'O controle dos níveis de líquido em um reservatório pode ser corretamente executado inserindo-se um objeto flutuante conectado a uma alavanca, o qual permite abrir ou fechar a válvula de entrada do fluido.',
54:'As válvulas de controle permitem direcionar o fluxo de um fluido em uma tubulação, podendo ser acionadas por meio hidráulico, pneumático ou elétrico.',
55:'Válvulas solenoides são acionadas eletricamente, o que é desvantajoso, dada a necessidade de impulsos elétricos para a movimentação de um núcleo no interior de uma bobina.',
56:'As válvulas de controle dispensam o emprego de componentes acessórios, o que facilita a automação.',
57:'Segundo a norma ISA 5.1, a primeira letra de identificação de um instrumento se refere à grandeza ou à variável que se deseja medir; assim, os símbolos P, Q e R se referem à pressão, à quantidade e à radioatividade, respectivamente.',
58:'A aplicabilidade da norma ISA 5.1 restringe-se à representação de diagramas funcionais de processos das indústrias químicas e petrolíferas.',
59:'Um sensor de proximidade é o dispositivo mais adequado para medir a velocidade de aproximação entre determinado ponto do estator de um motor elétrico e determinado ponto giratório do rotor desse motor.',
60:'A densidade de um líquido pode ser medida em kg/m³, por um densímetro.',
61:'O dinamômetro pode ser utilizado para medir o peso de um objeto.',
62:'Um transdutor de torque instalado entre o motor e a carga mecânica acionada por ele permite a medição direta do torque nesse eixo.',
63:'A medição de velocidade de rotação em um eixo pode ser feita por tacômetros mecânicos, eletromagnéticos e ópticos; entretanto, estes últimos, apesar de sua tecnologia ser conhecida, ainda não estão disponíveis comercialmente para uso na indústria.',
64:'As vibrações, um fenômeno muito importante para as máquinas rotativas, estão divididas em apenas dois tipos relevantes: o aleatório e o transiente, que devem ser considerados na medição das vibrações.',
65:'A instrumentação analítica pode fazer parte de um processo automático de controle tanto para otimizar a qualidade do produto final quanto para manter a segurança das pessoas e(ou) do patrimônio.',
66:'Apesar de apresentar enormes benefícios, a instrumentação analítica de processos industriais aplica-se apenas a amostras gasosas.',
67:'A análise de vibrações e o monitoramento de ruídos são exemplos de atividades de rotina de manutenção preditiva.',
68:'Nos mancais de um eixo rotativo, a troca de óleo cujo prazo de validade esteja vencido constitui exemplo de atividade de manutenção corretiva.',
69:'O comissionamento industrial pode ser adequadamente definido como o processo cuja finalidade é garantir que uma instalação esteja de acordo com os requisitos e necessidades do proprietário ou cliente, o que inclui atividades de testes e operação, entre outras.',
70:'A análise das condições de um óleo lubrificante é exemplo de manutenção preventiva.',
71:'A figura representa um programa em ladder, linguagem de programação de CLP.',
72:'Ao se energizar I0.0, Q0.0 não será ativada, pois I0.1 está bloqueada.',
73:'Q0.0 representa uma saída cujo estado é normalmente aberto.',
74:'Para ativar o bloco de saída Q0.0, é necessário energizar a entrada I0.0 e a entrada I0.1.',
75:'Na figura, os blocos I0.0 e I0.1 estão em paralelo; ou seja, caso se energize qualquer um dos referidos blocos, o bloco Q0.0 também será energizado.',
76:'Nos sistemas de controle de processo, o valor de determinada variável é constantemente medido e comparado a um valor de referência previamente estabelecido.',
77:'O acúmulo do erro em uma malha dispara o modo de controle integral de um controlador PID.',
78:'Proporcional, invertido e definido são os modos básicos de controle de um controlador PID.',
79:'Controladores PID são sistemas de controle de malha aberta.',
80:'O modo de controle proporcional de um controlador PID produz uma ação de controle proporcional à taxa de variação do erro.',
81:'PROFIBUS é um protocolo de comunicação industrial de padrão aberto, ou seja, compatível com diferentes componentes de diferentes fabricantes.',
82:'É possível utilizar a fibra óptica como meio físico de transmissão para o padrão PROFIBUS, apesar de este ser um protocolo antigo.',
83:'PROFINET é um protocolo de rede industrial baseado no padrão Ethernet e utiliza a arquitetura TCP/IP para comunicação entre os equipamentos da rede industrial.',
84:'Os controladores e os sensores são componentes obrigatórios em uma rede industrial do tipo AS-Interface.',
85:'PROFINET é uma evolução do protocolo PROFIBUS, de modo que os componentes conectados a uma destas redes se comunicam com componentes conectados à outra rede, sem a necessidade de um conversor.',
86:'O transistor é um dispositivo eletrônico que pode ser utilizado tanto para amplificação de sinais quanto para chaveamento de circuitos.',
87:'Um circuito elétrico é formado por elementos passivos e ativos; os elementos ativos não possuem a capacidade de amplificar o sinal elétrico.',
88:'O diodo é um componente eletrônico que permite a passagem de corrente elétrica em apenas um sentido.',
89:'O flip-flop D é um circuito digital que pode armazenar um bit de informação.',
90:'A porta lógica XOR é utilizada em circuitos aritméticos para a realização da operação de multiplicação.',
91:'A tecnologia CMOS é amplamente utilizada em circuitos digitais devido ao seu baixo consumo de energia.',
92:'Em um circuito em série, a corrente elétrica é a mesma em todos os elementos do circuito.',
93:'A corrente elétrica, convencionalmente, flui do polo positivo para o polo negativo da fonte de energia.',
94:'O valor da resistência elétrica de um condutor aumenta proporcionalmente ao aumento da sua temperatura.',
95:'A válvula solenoide é um tipo de atuador hidráulico que converte a energia elétrica em energia mecânica para controlar a vazão de fluido em um sistema hidráulico.',
96:'O controlador lógico programável (CLP) é um dispositivo eletrônico utilizado em sistemas hidráulicos para processar informações digitais; todavia, ele é inadequado para processar comandos síncronos de variáveis como pressão ou temperatura.',
97:'A pressão de trabalho dos componentes pneumáticos deve ser escolhida de acordo com a pressão de ar disponível na rede de ar comprimido da empresa.',
98:'O sensor de pressão é um componente fundamental do sistema hidráulico, pois opera o controle da direção, da vazão e da pressão do fluido em diferentes pontos do sistema.',
99:'Os sistemas pneumáticos podem ser utilizados em ambientes com altas temperaturas, pois o ar comprimido não é inflamável e não apresenta risco de explosão.',
100:'Os atuadores pneumáticos, como cilindros e motores, são muito versáteis e, portanto, aplicáveis a processos que exigem alta velocidade e precisão, tendo como vantagem competitiva não possuir limitação quanto a essas variáveis.'
}
const topics={
41:['Metrologia','Calibração: incerteza de medição e incerteza expandida','Média'],42:['Metrologia','Calibração: erros sistemáticos e aleatórios','Média'],43:['Metrologia','Certificado de calibração: incerteza, erro e correção','Fácil'],
44:['Metrologia','Sistema Internacional de Unidades: grandezas derivadas e pressão','Fácil'],45:['Instrumentação Industrial','Medição de temperatura: termopares e princípios de transdução','Média'],46:['Instrumentação Industrial','Medição de temperatura: termômetros de líquido em vidro','Fácil'],47:['Instrumentação Industrial','Medição de pressão: manômetro de Bourdon','Fácil'],48:['Instrumentação Industrial','Medição de temperatura: termômetros bimetálicos','Fácil'],
49:['Instrumentação Industrial','Medição de vazão: medidores de deslocamento positivo','Média'],50:['Metrologia','Calibração de medidores de vazão tipo turbina','Média'],51:['Instrumentação Industrial','Medição de nível: régua graduada e nível de óleo','Fácil'],52:['Instrumentação Industrial','Medição de vazão: rotâmetros e área variável','Média'],53:['Instrumentação Industrial','Controle de nível: boia e válvula de entrada','Fácil'],54:['Instrumentação Industrial','Válvulas de controle: tipos de acionamento','Fácil'],55:['Instrumentação Industrial','Válvulas solenoides: princípio de acionamento','Média'],56:['Instrumentação Industrial','Válvulas de controle e componentes acessórios de automação','Média'],
57:['Instrumentação Industrial','Simbologia ISA 5.1: identificação de instrumentos','Média'],58:['Instrumentação Industrial','Norma ISA 5.1: simbologia e diagramas de processo','Média'],59:['Instrumentação Industrial','Sensores de proximidade e medição de velocidade relativa','Média'],60:['Metrologia','Medição de densidade e massa específica de líquidos','Fácil'],61:['Física','Medição de força e peso: dinamômetros','Fácil'],62:['Instrumentação Industrial','Medição de torque: transdutores em eixos rotativos','Média'],63:['Instrumentação Industrial','Medição de rotação: tacômetros mecânicos, eletromagnéticos e ópticos','Média'],64:['Instrumentação Industrial','Medição e análise de vibrações em máquinas rotativas','Média'],65:['Instrumentação Analítica','Analisadores de processo e controle automático','Média'],66:['Instrumentação Analítica','Análise de processos: fases e amostragem','Média'],
67:['Manutenção Industrial','Manutenção preditiva: análise de vibrações e monitoramento de ruído','Fácil'],68:['Manutenção Industrial','Manutenção corretiva e substituição de lubrificante','Fácil'],69:['Manutenção Industrial','Comissionamento: testes, requisitos e entrega de instalações','Média'],70:['Manutenção Industrial','Manutenção preventiva: análise de óleo lubrificante','Fácil'],
71:['Automação Industrial','Controladores lógicos programáveis: linguagem ladder','Fácil'],72:['Automação Industrial','Ladder: contatos normalmente abertos e fechados e lógica de saída','Média'],73:['Automação Industrial','CLP: bobinas e estado lógico de saída','Fácil'],74:['Automação Industrial','Ladder: contatos em série e condição de energização','Média'],75:['Automação Industrial','Ladder: lógica de contatos em série e paralelo','Média'],
76:['Sistemas de Controle','Controle de processos: variável controlada, medição e referência','Fácil'],77:['Sistemas de Controle','Controladores PID: ação integral e acumulação do erro','Média'],78:['Sistemas de Controle','Controladores PID: ações proporcional, integral e derivativa','Fácil'],79:['Sistemas de Controle','Controle em malha aberta e malha fechada','Fácil'],80:['Sistemas de Controle','Controladores PID: ação proporcional e taxa de variação do erro','Média'],
81:['Automação Industrial','Redes industriais: protocolo PROFIBUS e interoperabilidade','Fácil'],82:['Automação Industrial','Redes industriais: meios físicos e fibra óptica no PROFIBUS','Média'],83:['Automação Industrial','Redes industriais: PROFINET, Ethernet e TCP/IP','Média'],84:['Automação Industrial','Redes industriais: sensores, atuadores e AS-Interface','Média'],85:['Automação Industrial','Redes industriais: interconexão PROFIBUS e PROFINET','Média'],
86:['Eletrônica','Transistores: amplificação e chaveamento','Fácil'],87:['Eletrônica','Circuitos eletrônicos: elementos ativos e ganho','Fácil'],88:['Eletrônica','Diodos semicondutores: condução e retificação','Fácil'],89:['Eletrônica Digital','Flip-flops: armazenamento de um bit','Fácil'],90:['Eletrônica Digital','Portas lógicas: XOR e circuitos aritméticos','Média'],91:['Eletrônica Digital','Tecnologia CMOS e consumo de energia','Fácil'],
92:['Circuitos Elétricos','Circuitos em série: corrente elétrica','Fácil'],93:['Eletrotécnica','Corrente elétrica convencional e polaridade da fonte','Fácil'],94:['Circuitos Elétricos','Resistência elétrica e variação de temperatura','Média'],
95:['Automação Industrial','Válvulas solenoides: atuação eletromecânica em sistemas hidráulicos','Média'],96:['Automação Industrial','CLP em sistemas hidráulicos: sinais digitais e variáveis de processo','Média'],97:['Automação Industrial','Pneumática: pressão de trabalho e rede de ar comprimido','Fácil'],98:['Automação Industrial','Hidráulica: sensores de pressão e controle do sistema','Média'],99:['Automação Industrial','Pneumática: segurança e aplicação em ambientes de alta temperatura','Média'],100:['Automação Industrial','Atuadores pneumáticos: velocidade, precisão e limites operacionais','Média']
}
if(Object.keys(stems).length!==60||Object.keys(topics).length!==60)throw Error('Transcrição ou taxonomia incompleta')

const answers='ECCCEEECCE|CECCEECEEC|CCEECECECX|CECEECCEEE|CCCXECECXX|CCXXXEEXEE'.replaceAll('|','')
if(answers.length!==60)throw Error(`A tabela definitiva contém ${answers.length} respostas para 60 itens`)
const keyMap=new Map(Array.from({length:60},(_,i)=>[i+41,answers[i]]))
const answerDigest=hashRevisao([...keyMap].map(([n,a])=>`${n}:${a}`).join('\n'))
const contexts={
41:{p:1,t:'Acerca de calibração de instrumentos e dos conceitos de metrologia e do Vocabulário Internacional de Metrologia (VIM), julgue os itens seguintes.'},
44:{p:1,t:'No que diz respeito à medição de pressão e temperatura, julgue os itens a seguir.'},
49:{p:1,t:'Julgue os itens seguintes relativos à medição de vazão e nível.'},
54:{p:1,t:'Julgue os itens subsequentes relacionados às válvulas de controle e seus acessórios.'},
57:{p:1,t:'Julgue os itens subsecutivos no que se refere à simbologia da norma ISA 5.1.'},
59:{p:1,t:'Em relação à medição de grandezas, julgue os itens a seguir.'},
65:{p:1,t:'Acerca da instrumentação analítica, julgue os itens seguintes.'},
67:{p:1,t:'A respeito de manutenção e comissionamento, julgue os próximos itens.'},
71:{p:2,t:'Com base no diagrama ladder apresentado na página original, julgue os itens. A figura contém dois contatos de entrada identificados como I0.0 e I0.1, ligados em série, e uma bobina de saída Q0.0.'},
76:{p:2,t:'No que se refere ao controle de processos, julgue os itens seguintes.'},
81:{p:2,t:'Tendo em vista os protocolos de comunicação em redes industriais, julgue os itens subsequentes.'},
86:{p:2,t:'Julgue os itens a seguir, relativos à eletrônica analógica.'},
89:{p:2,t:'Em relação à eletrônica digital, julgue os próximos itens.'},
92:{p:2,t:'A respeito de circuitos elétricos, julgue os itens seguintes.'},
95:{p:2,t:'Julgue os itens subsequentes relativos à automação hidráulica e à automação pneumática.'}
}
const duplicates=new Map([
 ['extr-f47414ae9a6abc2990a6','extr-4e4f861b1117511d2fff'],
 ['extr-c38f6b39d79b171c156b','extr-d7864341415bbfaf93bc'],
 ['extr-ae557e1f8dcd7f26a8f8','extr-9b2cde71b8cebf90ae06'],
 ['extr-ec1af0a0a91a549c61f1','extr-7fb018fe0890f24a3a9e']
])
const decisions=selected.map(q=>{
 const n=Number(q.numero),topic=topics[n],key=keyMap.get(n)
 if(!stems[n]||!topic||!key)throw Error(`Item ${n} ausente do mapa`)
 const ctx=[...Object.entries(contexts)].reverse().find(([start])=>n>=Number(start))?.[1]
 const page=n<=70?1:2,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,duplicate=duplicates.get(q.id),isAnulada=key==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2023,concurso,cargo,organizadora:'CEBRASPE',aplicacao:'PETROBRAS — Ênfase 5 — Manutenção – Instrumentação',numero_original:n,pagina:page,enunciado:stems[n],opcoes:['Certo','Errado'],resposta_correta:isAnulada?null:key==='C'?0:1,anulada:isAnulada,dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade técnica e conceitual; não é faixa oficial publicada pela banca.',classificacao_fonte:prova,motivo:`CEBRASPE — PETROBRAS/PSP RH 2023.1, Ênfase 5: Manutenção – Instrumentação, item ${n}; classificação por conteúdo e comando do bloco.`,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_822_PETROBRAS_23_005_01.PDF',prova:'822_PETROBRAS_23_005_01.PDF',sha256:answerDigest,sha256_tipo:'sha256_da_transcricao_canonica_dos_60_itens; nao_e_hash_do_pdf',hash_metodo:'SHA-256 da sequência canônica item:resposta da tabela do gabarito oficial definitivo; não representa o hash do PDF.',numero:n,pagina:1,resposta:key,criterio:isAnulada?'Gabarito oficial definitivo identifica o item como anulado (X).':'Gabarito oficial definitivo do CEBRASPE para a Ênfase 5: Manutenção – Instrumentação.'},apta_resolucao:!duplicate,...(!duplicate?{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}:{inelegibilidade_motivo:'Cópia OCR do mesmo item e caderno, com numeração idêntica; removida da resolução para evitar questão repetida.',duplicada_de:duplicate}),texto_apoio:ctx.t,reemplazarContexto:true,imagens_contexto:[{pagina:ctx.p,imagem:`paginas/${doc}-${String(ctx.p).padStart(4,'0')}.webp`,texto:ctx.t}],visual:{pagina:page,imagem:image,texto_apoio:ctx.t,motivo:`Página ${page} do caderno oficial conferida; enunciado, numeração, diagrama (quando aplicável) e contexto associados ao item ${n}.`}}
})
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(decisions.length!==64||decisions.filter(d=>!d.apta_resolucao).length!==4)throw Error('Contagem de registros ou duplicatas divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:64,itensUnicos:60,duplicatas:4,anuladas:[...keyMap].filter(([,a])=>a==='X').map(([n])=>n),respostasDefinitivas:true,paginas:[1,2],publicado:false},null,2));process.exit(0)}

const name='revisao-petrobras-2023-enfase5-instrumentacao-itens41-100-v314'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const anuladas=[...keyMap].filter(([,a])=>a==='X').map(([n])=>n)
const report={...result,documento:doc,edicao:concurso,cargo,registrosRevistos:64,itensUnicos:60,duplicatasDesativadas:4,itensAnulados:anuladas,paginasConferidas:[1,2],gabaritoDefinitivo:gabarito,publicado:false,observacao:'As oito anulações e respostas foram mapeadas a partir da tabela oficial definitiva. O campo SHA-256 armazena o digest de uma transcrição canônica item/resposta, não o hash do PDF.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## PETROBRAS 2023 — Ênfase 5, Manutenção – Instrumentação — itens 41–100 — v314\n\n- Revisei os 60 itens únicos da prova objetiva e os classifiquei por matéria e tópico em metrologia, instrumentação industrial e analítica, manutenção, automação e CLPs, controle de processos, redes industriais, eletrônica, circuitos elétricos e pneumática/hidráulica.\n- Corrigi a transcrição dos enunciados conforme as duas páginas originais, vinculei o diagrama ladder e os contextos dos blocos e preenchi o concurso, cargo, aplicação e ano.\n- Localizei o gabarito oficial definitivo: registrei as respostas e marquei como anulados os itens ${anuladas.join(', ')}.\n- Desativei quatro registros OCR duplicados (itens 58, 60, 66 e 67), preservando uma versão resolvível de cada.\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo oficial](<${gabarito}>), [edital oficial e conteúdo programático](<https://cdn.cebraspe.org.br/concursos/petrobras_23_nm/arquivos/ED_1_PETROBRAS_PSP_1_23_ABERTURA.PDF>).\n`)
console.log(JSON.stringify(report,null,2))
