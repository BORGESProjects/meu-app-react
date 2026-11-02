import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='127c3afa5a662e06'
const prova='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/13_449_SLUDF_013_00_COM_JUST.PDF'
const concurso='SLU/DF 2019 — Analista de Gestão de Resíduos Sólidos — Cargo 13: Engenharia Elétrica'
const cargo='Cargo 13 — Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Elétrica'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==70)throw Error('Caderno SLU divergente do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(records.length!==70||new Set(records.map(q=>Number(q.numero))).size!==70||records[0].numero!==51||records.at(-1).numero!==120)throw Error('Esperados os 70 itens únicos 51–120')

// Gabarito CERTO/ERRADO transcrito das justificativas oficiais no caderno publicado.
const key='CCECCECECE|CECCEEECEE|CEE ECCCECE|EECECECCCE|ECCEECCCCE|ECEECCEEEC|CECEECCCEE'.replaceAll(' ','')
const answers=key.replaceAll('|','').split('')
if(answers.length!==70)throw Error(`Gabarito canônico tem ${answers.length}, esperado 70`)
const answerDigest=hashRevisao(answers.map((a,i)=>`${i+51}:${a}`).join('\n'))

const classifications={
51:['Circuitos Elétricos','Equivalentes de Thévenin: tensão de circuito aberto','Média'],52:['Circuitos Elétricos','Equivalentes de Thévenin e corrente de curto-circuito','Média'],53:['Circuitos Elétricos','Equivalentes de Thévenin: cálculo da resistência equivalente','Média'],54:['Circuitos Elétricos','Teorema de Thévenin e corrente de curto-circuito','Média'],
55:['Eletromagnetismo','Campo elétrico e força sobre carga pontual','Fácil'],56:['Eletromagnetismo','Campo eletrostático: potencial e trabalho em trajetória fechada','Média'],57:['Eletromagnetismo','Correntes de condução e de convecção','Média'],58:['Eletromagnetismo','Linhas de campo elétrico e magnético','Média'],
59:['Circuitos Elétricos','Circuitos senoidais: regime permanente e frequência nula','Média'],60:['Circuitos Elétricos','Potência complexa em circuitos de corrente alternada','Difícil'],61:['Circuitos Elétricos','Fasores: relação de fase entre tensão e corrente em resistor','Fácil'],62:['Circuitos Elétricos','Impedâncias em paralelo e fasores','Difícil'],63:['Circuitos Elétricos','Transformação de fontes e análise de malhas','Média'],
64:['Circuitos Elétricos','Leis de Kirchhoff e divisão de corrente em rede resistiva','Média'],65:['Circuitos Elétricos','Equivalente de Thévenin em rede resistiva','Média'],66:['Circuitos Elétricos','Resistência de Thévenin com fonte ideal independente','Média'],67:['Circuitos Elétricos','Redes resistivas: associação série-paralelo e divisão de tensão','Média'],68:['Circuitos Elétricos','Equivalente de Thévenin de fonte e resistência','Média'],
69:['Eletrônica','Elementos de circuito: memristor e memória resistiva','Média'],70:['Eletrônica','Transistores como chave: corte e saturação','Fácil'],71:['Eletromagnetismo','Modos de propagação TEM em guias de onda','Média'],72:['Eletromagnetismo','Refração e velocidade de propagação de ondas','Fácil'],
73:['Sistemas de Controle','Ação integral e erro em regime permanente','Média'],74:['Sistemas de Controle','Ação derivativa e associação de controladores','Média'],75:['Sistemas de Controle','Ação derivativa e antecipação do erro','Média'],76:['Sistemas de Controle','Controlador proporcional e ganho ajustável','Fácil'],
77:['Máquinas Elétricas','Transformadores de transmissão e distribuição: perfil de carga','Média'],78:['Máquinas Elétricas','Transformadores: ensaio de curto-circuito','Média'],79:['Máquinas Elétricas','Transformadores: ensaio a vazio e perdas no núcleo','Média'],80:['Máquinas Elétricas','Rendimento de transformadores e máquinas rotativas','Fácil'],
81:['Máquinas Elétricas','Máquinas de corrente contínua: excitação independente e composta','Média'],82:['Máquinas Elétricas','Controle de velocidade em máquinas de corrente contínua','Média'],83:['Máquinas Elétricas','Máquina de corrente contínua série: torque de partida e aplicações','Média'],84:['Máquinas Elétricas','Máquinas CC: ligação série e paralela dos enrolamentos','Fácil'],
85:['Materiais Elétricos','Materiais ferromagnéticos: anisotropia magnética','Média'],86:['Materiais Elétricos','Ligas magnéticas: envelhecimento do ferrossilício','Média'],87:['Materiais Elétricos','Condutores de alumínio e cobre: corrosão galvânica','Média'],88:['Eletromagnetismo','Efeito corona e ruptura dielétrica do ar','Fácil'],
89:['Sistemas Elétricos de Potência','Subestações: disjuntores e suportabilidade dielétrica','Média'],90:['Sistemas Elétricos de Potência','Subestações: para-raios de válvula e sobretensões','Média'],91:['Sistemas Elétricos de Potência','Subestações: chave fusível e manobra de circuitos','Fácil'],92:['Sistemas Elétricos de Potência','Transformadores a óleo: relé Buchholz e proteção','Média'],
93:['Instalações Elétricas','Instalações de baixa tensão: tomada de uso específico e dimensionamento','Fácil'],94:['Instalações Elétricas','Dimensionamento de condutores: fatores de correção e capacidade de corrente','Difícil'],95:['Segurança do Trabalho','NR-10: qualificação, capacitação e autorização em instalações elétricas','Média'],96:['Segurança do Trabalho','NR-10: prevenção e combate a incêndio em instalações elétricas','Fácil'],
97:['Instalações Elétricas','Comandos elétricos: botoeiras e partida estrela-triângulo','Fácil'],98:['Instalações Elétricas','Comandos elétricos: intertravamento de contatores','Média'],99:['Instalações Elétricas','Comandos elétricos: relé temporizador em partida estrela-triângulo','Média'],100:['Instalações Elétricas','Comandos elétricos: sequência estrela-triângulo e contatores','Difícil'],101:['Instalações Elétricas','Comandos elétricos: contatos temporizados normalmente abertos e fechados','Média'],
102:['Sistemas Elétricos de Potência','Circuitos trifásicos equilibrados: conversão delta-estrela e corrente de linha','Difícil'],103:['Sistemas Elétricos de Potência','Circuitos trifásicos: tensão de linha na carga','Difícil'],104:['Sistemas Elétricos de Potência','Circuitos trifásicos: impedância e fator de potência','Média'],105:['Sistemas Elétricos de Potência','Potência ativa em sistemas trifásicos equilibrados','Difícil'],106:['Sistemas Elétricos de Potência','Potência reativa em linhas e cargas trifásicas','Difícil'],107:['Sistemas Elétricos de Potência','Curto-circuito trifásico: cálculo em por unidade','Difícil'],108:['Sistemas Elétricos de Potência','Curto-circuito trifásico: impedância equivalente e corrente','Difícil'],
109:['Eletrônica','Diodos semicondutores: dependência da tensão com a temperatura','Média'],110:['Eletrônica','Transistores MOS e integração com sistemas MEMS','Média'],111:['Eletrônica','Isoladores ópticos: associação Darlington','Média'],112:['Eletrônica','Retificadores: meia onda e corrente de pico nos diodos','Média'],
113:['Eletrônica de Potência','Inversores PWM: tempo morto e comutação dos transistores','Média'],114:['Eletrônica de Potência','Conversores PWM e conexão a redes de média tensão','Média'],115:['Eletrônica de Potência','Inversores trifásicos: topologias de meia ponte e ponte completa','Média'],116:['Eletrônica de Potência','UPS: topologia de dupla conversão e alimentação da carga','Média'],
117:['Informática','Sistemas operacionais: gerenciamento do sistema de arquivos','Fácil'],118:['Informática','Arquitetura de computadores: interrupções e barramentos','Média'],119:['Informática','Sistemas operacionais: preempção e multitarefa','Fácil'],120:['Informática','Arquitetura de computadores: memória cache e memória RAM','Fácil']
}
if(Object.keys(classifications).length!==70)throw Error('Classificação incompleta')

const contexts=new Map()
const add=(start,end,p,text)=>{for(let n=start;n<=end;n++)contexts.set(n,{pagina:p,text})}
add(51,54,1,'Considerando que, no circuito representado na página original, todos os elementos sejam ideais e c seja o nó de referência, com tensão igual a zero, julgue os itens a seguir.')
add(59,63,1,'No circuito representado na página original, todos os elementos são ideais; as tensões e correntes são valores eficazes; α e β são constantes; e I₀e^(jθ) é uma fonte senoidal de frequência ω. Julgue os itens.')
add(64,68,2,'No circuito resistivo representado na página original, os elementos são ideais, b é o nó de referência (0 V), e VF e R são constantes. Julgue os itens.')
add(81,84,3,'Os gráficos I e II da página original apresentam curvas de torque em função da rotação para máquinas de corrente contínua. Julgue os itens.')
add(93,96,4,'Situação-problema: churrasqueira elétrica de 3.300 W em rede de 220 V; condutores isolados de cobre em eletroduto aparente de PVC circular, compartilhado com outros dois circuitos monofásicos; temperatura ambiente de 35 °C. As tabelas de correção térmica e capacidade de corrente necessárias estão na imagem da página original.')
add(97,98,4,'O diagrama de comando da página original representa a partida estrela-triângulo de motor de indução trifásico. Contatos auxiliares de K1, K2 e K3 não desenhados são normalmente abertos; as proteções estão funcionais. A legenda do diagrama informa que D1 atua cinco segundos após ser energizado.')
add(99,101,5,'O diagrama de comando da página original representa a partida estrela-triângulo de motor de indução trifásico. Contatos auxiliares de K1, K2 e K3 não desenhados são normalmente abertos; as proteções estão funcionais. A legenda do diagrama informa que D1 atua cinco segundos após ser energizado.')
add(102,106,5,'Sistema trifásico equilibrado: gerador ideal ligado em estrela, tensão de fase Vφ = 240 V; linha com impedância ZL = j20√2 Ω por fase; carga simétrica ligada em triângulo, com impedância Zφ = (30√2 − j30√2) Ω por ramo. O diagrama está na página original.')
add(107,108,5,'Um curto-circuito trifásico simétrico ocorreu no ponto F1 ou F2 da linha do diagrama unifilar mostrado na página original. Dados nominais: G1 = 20√3 MVA, 20 kV, X = 0,20 p.u.; transformador = 20√3 MVA, relação 10/100 kV, X = 0,05 p.u.; linha no lado de 100 kV.')

const stemFix={
51:'A tensão de Thévenin vista a partir dos terminais b–c é igual a Va.',
52:'Se for conectado um fio de resistência zero entre os terminais b e c, a corrente que passará pelos nós a, b e c terá módulo igual ao módulo da tensão Va.',
53:'Para determinar a resistência de Thévenin vista dos terminais b–c, basta colocar as fontes independentes em curto-circuito e calcular a associação em paralelo das três resistências de 1 Ω.',
54:'Se for efetuado um curto-circuito entre os terminais b e c, a corrente entre esses terminais poderá ser calculada dividindo-se a tensão de Thévenin pela resistência de Thévenin.',
59:'Se ω = 0, então a tensão V₀ será igual a V₁/α.',
60:'A potência complexa fornecida pela fonte βI₁ é igual a |V₁|²/R₂.',
62:'Se o fasor da corrente I₁ for |I₁|e^(jθ₁), então V₁ = βR₂|I₁|e^(jθ₁).',
63:'A expressão V₀ = R₁I₀e^(jθ) − R₁I₁ está correta para o circuito em questão.',
65:'Considerando-se a resistência equivalente vista a partir dos nós 1 e b como carga, a tensão de Thévenin vista desses nós será igual a V_F/2.',
66:'Para calcular a resistência de Thévenin vista a partir dos nós a e b, é necessário substituir a fonte V_F por um curto-circuito.',
67:'A tensão no nó 2 é igual a V_F/8.',
69:'O denominado memristor é um elemento eletrônico ativo capaz de reter o último valor de sua resistência quando a excitação de energia é removida.',
71:'Ondas transversoeletromagnéticas (TEM) não se propagam em guias de ondas retangulares.',
72:'Quando ocorre refração, a velocidade de propagação das ondas de luz mantém-se inalterada, pois essa característica depende exclusivamente da fonte.',
74:'O controle derivativo é utilizado de forma isolada no sistema, o que implica a redução do custo do controle desse sistema.',
81:'O gráfico I refere-se a uma máquina de corrente contínua com esquema de ligação de excitação composta.',
82:'A alteração observada no gráfico I corresponde à mudança do controle do campo para o controle da armadura.',
84:'Na máquina a que se refere o gráfico II, o enrolamento de campo fica em paralelo com o enrolamento da armadura.',
87:'A utilização de alumínio como condutor, quando em contato com cobre em ambiente úmido, apresenta como desvantagem a corrosão galvânica.',
90:'Os para-raios do tipo válvula, quando ocorre um surto de tensão, passam da condição de condutores para a de isolantes.',
94:'Caso o método de instalação utilizado seja B1 e o fator de correção de agrupamento para três circuitos monofásicos em condutores fechados seja 0,7, o condutor de menor seção que atende às especificações para a instalação da churrasqueira elétrica será o de 1,50 mm².',
95:'Conforme a normatização pertinente, somente profissional habilitado com registro no competente conselho de classe deverá ser autorizado a intervir na instalação elétrica da referida área de lazer.',
96:'Conforme a normatização pertinente, para que esteja autorizado a trabalhar no projeto elétrico da área de lazer mencionada, o profissional deve estar apto a operar e manusear equipamentos de prevenção e combate a incêndio existentes nas instalações elétricas.',
98:'As bobinas dos contatores K1 e K2 podem estar energizadas simultaneamente.',
100:'Caso o motor em questão parta em estrela e assuma a configuração em triângulo somente após o relé temporizador atuar, a função de ligar os terminais em estrela será de K3, enquanto a função de ligar os terminais em triângulo será de K1.',
101:'Quando o sistema atinge o seu estado final, o contato D1’ do relé temporizador está aberto.',
102:'Em cada linha de transmissão, o módulo da corrente de linha é 12 A.',
103:'O módulo da tensão de linha na carga é inferior a 360 V.',
104:'O fator de potência da carga está adiantado em 60°.',
105:'A potência real dissipada pela carga é superior a 4 kW.',
106:'A potência reativa armazenada na linha de transmissão é o dobro da potência reativa armazenada na carga.',
107:'Caso o curto-circuito tenha ocorrido no ponto F1 da linha, a corrente de curto-circuito calculada será inferior a 8 kA.',
108:'Caso o curto-circuito tenha ocorrido no ponto F2 da linha, a corrente de curto-circuito calculada será inferior a 600 A.',
109:'O diodo não é indicado para a utilização em termômetros digitais, devido à baixa dependência de sua tensão com a temperatura ambiente.',
110:'Uma das vantagens dos transistores MOS é a sua integração com a tecnologia MEMS (microelectromechanical systems).',
111:'Em isoladores ópticos, pode-se utilizar a associação de dois transistores bipolares de junção para aumentar o ganho total de corrente do isolador.',
112:'O reduzido pico de corrente no diodo é uma das vantagens da utilização de um retificador de meia onda com diodos.',
113:'No inversor que utiliza modulação por largura de pulso (MLP), deve-se prever um atraso nas bordas de subida em todas as comutações do sinal modulado.',
114:'Uma das vantagens do conversor que utiliza modulação por largura de pulso é a possibilidade de conexão direta com a rede de média tensão, sem a necessidade de um transformador.',
115:'No inversor trifásico que utiliza um arranjo de semiponte, é empregado o dobro de transistores de um inversor em ponte completa.',
116:'Na configuração em dupla conversão, a carga sempre é alimentada pelo inversor, estando, portanto, isolada da rede.',
118:'Quando um controlador de periférico tem informação a ser fornecida ao processador, ele poderá notificá-lo por meio do barramento de controle.',
119:'Uma das características dos sistemas preemptivos é o fato de eles serem monotarefa.',
120:'As memórias cache consomem menos energia e são mais lentas que as memórias RAM.'
}

const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/13_449_SLUDF_013_00_COM_JUST.PDF'
const decisions=records.map(q=>{
 const n=Number(q.numero),[materia,conteudo,dificuldade]=classifications[n],ctx=contexts.get(n),pagina=n===101?5:Number(q.pagina)
 if(!materia||!ctx&&![55,56,57,58,69,70,71,72,73,74,75,76,77,78,79,80,85,86,87,88,89,90,91,92,109,110,111,112,113,114,115,116,117,118,119,120].includes(n))throw Error(`Classificação/contexto ausente no item ${n}`)
 const imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 return {
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,concurso,cargo,organizadora:'CEBRASPE',aplicacao:'SLU/DF 2019',numero_original:n,pagina,
  dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, matemática e normativa; não é faixa publicada pela banca.',
  classificacao_fonte:prova,motivo:`CEBRASPE — SLU/DF 2019, Cargo 13 (Engenharia Elétrica), item ${n}. Matéria e tópico determinados pelo enunciado e pelo bloco temático do caderno oficial; ano e cargo conferidos no edital oficial.`,
  ...(stemFix[n]?{enunciado:stemFix[n]}:{}),opcoes:['Certo','Errado'],resposta_correta:answers[n-51]==='C'?0:1,anulada:false,
  gabarito_oficial:{fonte:gabaritoUrl,arquivo:'13_449_SLUDF_013_00_COM_JUST.PDF',prova:'13_449_SLUDF_013_00_COM_JUST.PDF',sha256:answerDigest,sha256_tipo:'sha256_da_transcricao_canonica_das_70_justificativas_oficiais; nao_e_hash_do_pdf',hash_metodo:'SHA-256 da sequência canônica item:resposta transcrita das justificativas CERTO/ERRADO no caderno oficial; não representa hash do arquivo PDF.',numero:n,pagina,resposta:answers[n-51],criterio:'Justificativa individual publicada no caderno oficial pelo CEBRASPE; CERTO mapeado à opção 0 e ERRADO à opção 1.'},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente','ano_sem_evidencia'],
  ...(ctx?{texto_apoio:ctx.text,reemplazarContexto:true,imagens_contexto:[{pagina:ctx.pagina,imagem:`paginas/${doc}-${String(ctx.pagina).padStart(4,'0')}.webp`,texto:ctx.text}]}:{texto_apoio:'',reemplazarContexto:true}),
  visual:{pagina,imagem,texto_apoio:ctx?.text||'',motivo:`Página ${pagina} do caderno oficial vinculada ao item ${n}; imagem conferida para a numeração, o enunciado e os elementos visuais necessários.`}
 }
})
if(decisions.length!==70||new Set(decisions.map(d=>d.id)).size!==70)throw Error('Esperados 70 registros revisados e únicos')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const ineligible=records.filter(q=>q.integridade_profissional?.apta_resolucao===false).map(q=>q.numero)
if(ineligible.length!==3||!ineligible.includes(60)||!ineligible.includes(62)||!ineligible.includes(101))throw Error(`Registros inelegíveis divergentes: ${ineligible}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:records.length,itens:70,paginasConferidas:[1,2,3,4,5,6],itensAntesInelegiveis:ineligible,anos:[2019],gabaritoOficialComJustificativa:true,publicado:false},null,2));process.exit(0)}

const name='revisao-slu-2019-cargo13-eletrica-v312'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,cargo,registrosOCR:records.length,itensUnicos:70,itensClassificados:70,itensComGabaritoOficial:70,itensComContextoOuImagemDePagina:70,paginasConferidas:[1,2,3,4,5,6],itensInelegiveisRecuperados:ineligible,publicado:false,observacao:'Respostas mapeadas das justificativas CERTO/ERRADO do caderno oficial. O SHA-256 armazenado identifica uma transcrição canônica das 70 respostas, não o PDF. A página do item 101 foi corrigida de 4 para 5 conforme conferência visual do caderno.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SLU/DF 2019 — Cargo 13, Engenharia Elétrica — v312\n\n- Revisei individualmente os 70 itens objetivos, números 51–120, e classifiquei cada um em Circuitos Elétricos, Eletromagnetismo, Eletrônica, Sistemas de Controle, Máquinas Elétricas, Materiais Elétricos, Sistemas Elétricos de Potência, Instalações Elétricas, Segurança do Trabalho ou Informática, com tópico específico, ano, cargo e dificuldade estimada.\n- Recuperei os itens 60, 62 e 101, antes bloqueados por suspeita de OCR. Corrigi a notação dos enunciados e ajustei a página do item 101, cuja figura original está na página 5.\n- Vinculei as páginas originais, gráficos, circuitos e os textos de contexto necessários. Os contextos das questões com diagramas/tabelas foram reconstruídos a partir do caderno oficial.\n- Mapeei os 70 gabaritos CERTO/ERRADO pelas justificativas publicadas junto ao caderno. O campo SHA-256 corresponde à sequência canônica das respostas, não ao hash do PDF.\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial com justificativas](<${prova}>), [edital oficial e conteúdo do Cargo 13](<https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/ED_1_SLU_DF__ABT.PDF>).\n`)
console.log(JSON.stringify(report,null,2))
