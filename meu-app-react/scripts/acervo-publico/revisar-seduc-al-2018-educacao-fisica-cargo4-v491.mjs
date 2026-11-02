import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2018-educacao-fisica-cargo4-v491'
const documento='ed5dd4637c6fb6e8'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL004__PAG_4.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL004.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/SEDUC_AL_17_JUSTIFICATIVAS_DE_ALTERA____ES_DE_GABARITO.PDF'
const concurso='SEDUC/AL — Concurso para Professor — Cargo 4: Educação Física (edital 2017; prova aplicada em 2018)'
const cargo='Professor — Especialidade: Educação Física — Cargo 4'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const nums=pendentes.map(q=>Number(q.numero)).sort((a,b)=>a-b)
assert.equal(pendentes.length,43)
assert.deepEqual(nums,[51,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,91,93,95,96,97,99,100,101,102,103,105,106,107,108,109,111,112,113,115,116,117,118,119,120])

// Transcrito do gabarito oficial definitivo CEBRASPE para o caderno do Cargo 4.
const respostas={51:'E',71:'E',72:'E',73:'C',74:'E',75:'C',76:'C',77:'E',78:'X',79:'E',80:'E',81:'C',82:'C',83:'C',84:'E',85:'E',86:'E',87:'E',88:'C',91:'E',93:'E',95:'C',96:'E',97:'C',99:'E',100:'E',101:'C',102:'C',103:'E',105:'C',106:'E',107:'C',108:'E',109:'C',111:'C',112:'C',113:'E',115:'E',116:'C',117:'E',118:'E',119:'C',120:'C'}
assert.equal(Object.keys(respostas).length,43)
const hashGabarito=hashRevisao(Object.entries(respostas).sort(([a],[b])=>Number(a)-Number(b)).map(([n,r])=>`${n}:${r}`).join('|'))

const temas={
51:['Educação Física','História da Educação Física no Brasil: higienismo e organização profissional','Difícil'],
71:['Educação Física','Esporte, sociedade e educação: hegemonia e ascensão social','Média'],72:['Educação Física','Esporte, sociedade e educação: alienação e crítica social','Média'],73:['Educação Física','Esporte como direito social e cultura corporal','Fácil'],74:['Educação Física','Pedagogia crítica do esporte e rendimento','Média'],75:['Educação Física','Esporte, pedagogia social e formação','Média'],
76:['Educação Física','Avaliação da aptidão cardiorrespiratória: teste de Cooper','Fácil'],77:['Educação Física','Avaliação da aptidão física: interpretação do teste de Cooper','Média'],78:['Educação Física','Atividade física, composição corporal e obesidade','Média'],79:['Educação Física','Índice de Massa Corporal e classificação do sobrepeso','Fácil'],
80:['Educação Física','Aprendizagem motora: estágios cognitivo, associativo e autônomo','Média'],81:['Educação Física','Aprendizagem motora: características da fase associativa','Média'],82:['Educação Física','Métodos global e parcial no ensino de habilidades motoras','Média'],83:['Educação Física','Método parcial e aprendizagem de habilidades complexas','Média'],84:['Educação Física','Seleção de métodos de ensino e participação discente','Média'],85:['Educação Física','Métodos de ensino de habilidades motoras','Média'],86:['Educação Física','Feedback extrínseco e aprendizagem da bandeja no basquetebol','Média'],87:['Educação Física','Feedback extrínseco e autonomia na aprendizagem motora','Média'],88:['Educação Física','Feedback prescritivo na aprendizagem esportiva','Média'],
91:['Educação Física','Avaliação escolar: domínios cognitivo, afetivo e motor','Média'],93:['Educação Física','Currículo desenvolvimentista: metas afetivas','Média'],95:['Educação Física','Estilos de ensino: produção divergente e descoberta','Média'],96:['Educação Física','Estilos de ensino: comando e reprodução','Média'],97:['Educação Física','Jogos cooperativos: objetivos comuns e interação','Fácil'],
99:['Educação Física','Sociologia do esporte: competição e cooperação','Média'],100:['Educação Física','Esporte, fair play e crítica social','Média'],101:['Educação Física','Cultura corporal: gênero e transformação cultural','Fácil'],102:['Educação Física','Cultura corporal: capoeira e transformação cultural','Média'],103:['Educação Física','Cultura corporal e linguagem','Difícil'],105:['Educação Física','Cultura corporal, diversidade e práticas escolares','Média'],
106:['Educação Física','Políticas educacionais: Parâmetros Curriculares Nacionais','Média'],107:['Educação Física','História da Educação Física escolar no Brasil','Média'],108:['Educação Física','Educação Física escolar durante o regime militar','Média'],109:['Educação Física','História da ginástica escolar: higienismo e militarismo','Média'],
111:['Educação Física','Competências e habilidades no ensino médio: jogos e autonomia','Média'],112:['Educação Física','Competências e habilidades: conhecimento corporal e saúde','Média'],113:['Educação Física','Ginástica e práticas corporais de relaxamento e alongamento','Média'],115:['Educação Física','Lutas como conteúdo escolar e práticas pedagógicas','Média'],116:['Educação Física','Esportes coletivos: interação, competição e cooperação','Fácil'],117:['Educação Física','Regras esportivas, ética e valores pedagógicos','Média'],118:['Educação Física','Esportes individuais e coletivos: competição e cooperação','Média'],119:['Educação Física','Princípio da não exclusão e jogos cooperativos','Média'],120:['Educação Física','Jogos cooperativos e crítica à competição individualista','Média']
}

const stems={
51:'O pensamento médico-higienista no Brasil produziu significativo impacto no campo profissional da educação física, fato que impulsionou o movimento político corporativo da área e a consequente criação dos conselhos regionais de educação física (CREF).',
71:'A ênfase do esporte como conteúdo hegemônico nas aulas de educação física justifica-se em função de seu potencial de contribuir para a ascensão social das camadas menos favorecidas da sociedade.',
72:'Na sociedade atual, é inerente ao esporte como fenômeno social a reprodução de processos que se desdobrem em mecanismos de alienação de seus praticantes, fato que deve ser combatido nas aulas de educação física.',
73:'As aulas de educação física, em uma perspectiva crítica, devem possibilitar aos alunos espaços de formação que tematizem o esporte como um direito social.',
74:'O trato pedagógico crítico destinado ao esporte como conteúdo de aulas de educação física na escola sugere a compreensão de que a excelência do treinamento esportivo é fator determinante na produção de atletas não manipuláveis.',
75:'A expressão “pedagogia social” à qual o autor se refere traz implícitas as potencialidades da instituição esportiva como uma possibilidade legítima para o desenvolvimento educativo e de formação.',
76:'O teste de doze minutos, conhecido como teste de Cooper, objetiva verificar o nível da condição cardiorrespiratória dos alunos durante uma corrida ou caminhada.',
77:'O teste de doze minutos, conhecido como teste de Cooper, objetiva fazer os alunos correrem a maior distância possível, a fim de avaliar suas condições musculares.',
78:'A prática regular de atividades físicas contribui para a melhoria da composição corporal uma vez que promove perda da gordura subcutânea e visceral e preserva a massa muscular magra da gordura visceral.',
79:'Considerando o Índice de Massa Corporal (IMC), são classificados com sobrepeso aqueles indivíduos com IMC ≥ 30 kg/m².',
80:'Na fase intermediária, ou associativa, da aprendizagem de novas habilidades motoras, o aluno apresenta dificuldade de identificar, por si, seus erros, razão por que executa os movimentos de forma inconsistente.',
81:'Na fase intermediária, ou associativa, da aprendizagem de novas habilidades motoras, o aluno apresenta maior capacidade de economizar tempo e energia, maior confiança e diminuição da quantidade de erros.',
82:'O método parcial é adequado para exercícios que envolvam habilidades de alta complexidade.',
83:'A adoção do método parcial contribui para a redução da dificuldade do aluno em executar habilidades complexas.',
84:'Na escolha do método — global ou parcial —, o professor deve priorizar a opinião dos alunos, a fim de respeitar seus interesses.',
85:'Ainda que o professor decida pela alternância dos métodos, ele deve sempre dar prioridade ao método parcial nas atividades com os alunos, especialmente na primeira fase de aprendizagem.',
86:'No basquetebol, a bandeja é uma habilidade simples; contudo, o professor deve informar aos alunos que aguardem até a segunda fase de aprendizagem para executá-la.',
87:'O professor deve prestar feedback extrínseco apenas se os alunos o solicitarem, a fim de possibilitar que solucionem de maneira independente os problemas motores relacionados à bandeja.',
88:'Uma boa estratégia de ensino, nesse caso, é oferecer informação prescritiva sobre a habilidade, com o objetivo de orientar os alunos quanto aos erros cometidos e à forma de modificar a ação nas próximas tentativas.',
91:'Os padrões A e C relacionam-se ao domínio motor, e o padrão B, ao domínio afetivo.',
93:'A criação de um ambiente em que as crianças sejam estimuladas a se tornar fisicamente ativas é uma meta referente à área afetiva.',
95:'Nessa situação, o professor adotou um estilo de ensino de produção divergente, o qual envolve as crianças na descoberta de novas e diferentes respostas.',
96:'Nessa situação, o professor adotou um estilo de ensino de comando, pois determinou que a atividade fosse executada sem, no entanto, indicar o número de vezes que os alunos deveriam repeti-la.',
97:'O jogo descrito, em que dois grupos usam lençóis para manter a bola em jogo e realizar arremessos, caracteriza-se como cooperativo, porque prioriza a aproximação dos jogadores na busca de objetivos comuns.',
99:'Conforme a perspectiva do texto sobre esporte e sociedade, é imperiosa a eliminação da competitividade nos esportes para que eles se tornem mais cooperativos.',
100:'Depreende-se da afirmação de que o esporte pode formar pessoas preocupadas com o fair play uma clara crítica à sociedade capitalista.',
101:'A participação feminina na prática do futebol brasileiro, antes reduto exclusivamente masculino, põe em evidência uma transformação cultural pela qual passa a sociedade atual.',
102:'A capoeira, que passou de prática reprimida pelo poder público no início do século XX a modalidade esportiva praticada por pessoas de diferentes classes sociais, exemplifica o rompimento de uma tradição pela transformação da cultura.',
103:'A cultura corporal, por designar um vasto e rico campo da cultura, com abrangência da produção de práticas expressivo-comunicativas fundadas na subjetividade e externalizadas pela expressão do corpo, afasta-se das configurações próprias de uma linguagem.',
105:'Dado o vasto patrimônio cultural do país, a educação física nas escolas brasileiras, como prática cultural, permite a vivência de diferentes atividades corporais — jogos, esportes, danças, lutas, ginásticas e atividades rítmicas — de variadas origens étnicas, sociais e regionais.',
106:'Os Parâmetros Curriculares Nacionais estão inseridos no tema de políticas públicas porque foram estabelecidos por lei ordinária.',
107:'A inserção da educação física nas escolas como disciplina obrigatória vem fazendo parte das determinações governamentais ao longo da história no Brasil a partir do século XIX.',
108:'Na época dos governos militares, a educação física tornou-se atividade escolar regular obrigatória, voltada para a iniciação desportiva, a partir da 7.ª série.',
109:'Nos primeiros anos da República, foi incluída em alguns estados brasileiros a ginástica nas escolas, espelhada em métodos europeus de linha higienista e militarista, que buscavam a higiene física e moral e preparavam os indivíduos fisicamente para o combate militar.',
111:'A utilização de jogos nas aulas do ensino médio pode promover autonomia nas discussões entre os estudantes e gerar ou transformar regras para o desenvolvimento da atividade.',
112:'No aspecto da investigação e da compreensão, o conhecimento do corpo, da aptidão física e da saúde relaciona-se à capacidade de análise crítica dos programas de atividades físicas e pode desenvolver conceitos de esforço e intensidade aplicáveis às próprias práticas corporais.',
113:'Por ser uma atividade de caráter individualizado, a ginástica, como técnica de trabalho corporal, deve ser evitada na preparação para práticas como relaxamento e alongamento.',
115:'Como conteúdo de ensino, as lutas devem enfatizar apenas as ações de ataque para que o oponente seja subjugado com técnicas e estratégias de desequilíbrio, contusão e imobilização.',
116:'Nas aulas de educação física, os esportes coletivos levam os alunos a vivenciar situações de competição e cooperação, com interação com os adversários da equipe oposta e integração com os companheiros da própria equipe.',
117:'Ao adotar regras esportivas institucionalizadas durante as aulas de educação física, o professor estará impondo uma vivência competitiva e desvinculada de valores éticos e morais.',
118:'As atividades e os esportes distinguem-se por características específicas: nos individuais, como o alpinismo, enfatiza-se a competição entre participantes; nos coletivos, como o remo em uma mesma embarcação, a ênfase recai sobre a cooperação.',
119:'O princípio da não exclusão, que propaga o direito à participação de todos os estudantes, torna importante a utilização dos jogos cooperativos nas aulas de educação física.',
120:'Os jogos cooperativos surgiram em oposição à tradição esportiva centrada no individualismo e na competição, que tende a encaminhar o estudante na direção oposta à idealizada no processo educativo.'
}

const apoios={
 '51-51':'Comando: De acordo com a história da Educação Física brasileira, julgue o item.',
 '71-75':'Texto-base adaptado: reflexão de M. Murad sobre o esporte como fenômeno cultural, seus usos sociais e seu potencial de resistência e de pedagogia social. Referência indicada no caderno: Sociologia e educação física: diálogos, linguagens do corpo, esportes (2009).',
 '76-77':'Situação-problema: em uma escola de ensino médio, o professor aplicou o teste de Cooper de 12 minutos três vezes no semestre para avaliar a aptidão física relacionada à saúde. Julgue as finalidades atribuídas ao teste.',
 '78-79':'Comando: julgue os itens sobre sobrepeso, obesidade e atividade física regular na prevenção, no controle e no tratamento dessas condições.',
 '80-81':'Texto-base: a aprendizagem de novas habilidades motoras é descrita em três fases — inicial/cognitiva, intermediária/associativa e final/autônoma. Julgue a característica atribuída à fase intermediária.',
 '82-85':'Comando: julgue os itens referentes aos métodos global (todo) e parcial (partes) no ensino de habilidades motoras.',
 '86-88':'Situação-problema: alunos iniciantes praticam basquetebol e recebem feedback extrínseco sobre acertos e erros. Os itens tratam do feedback durante a aprendizagem da bandeja.',
 '91-91':'Padrões de conteúdo: A — demonstra competência em muitas formas de movimento; B — exibe estilo de vida fisicamente ativo; C — alcança e mantém melhoria da aptidão física. A prova relaciona esses padrões aos domínios cognitivo, afetivo e motor.',
 '93-93':'Comando: metas de currículos desenvolvimentistas de Educação Física para crianças relacionam-se às áreas motora, cognitiva e afetiva.',
 '95-96':'Situação-problema: o professor pergunta às crianças quantas maneiras diferentes existem de equilibrar um bambolê e, em seguida, pede que pratiquem. Os itens identificam o estilo de ensino.',
 '97-97':'Situação-problema: dois grupos em lados opostos de uma quadra usam lençóis para lançar a bola de um lado a outro, mantendo-a em jogo e buscando prolongar os arremessos.',
 '99-100':'Texto-base adaptado: reflexão de P. Parlebas sobre o fato de o esporte não ter efeito social automático e poder favorecer tanto comportamentos antidesportivos quanto o fair play. Referência do caderno: M. Betti, Educação e sociedade (1991).',
 '101-105':'Texto-base adaptado: a diversidade humana envolve escolhas culturais e modos históricos de resolver problemas; o caderno relaciona essa ideia à cultura corporal. Referência indicada: M. Neira e M. Nunes, Pedagogia da cultura corporal (2006).',
 '106-110':'Comando: julgue os itens sobre política educacional e história da Educação Física escolar no Brasil.',
 '111-115':'Comando: julgue as competências e habilidades a desenvolver no ensino da Educação Física no ensino médio.',
 '116-120':'Comando: julgue os itens referentes à competição e à cooperação no esporte.'
}
const faixa=n=>Object.keys(apoios).find(k=>{const [a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),tema=temas[n],key=respostas[n]
 assert.ok(tema&&key&&stems[n],`Item ${n} sem revisão`)
 const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const anulada=key==='X',enunciado=stems[n],texto_apoio=apoios[faixa(n)]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 1º/4/2018',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:tema[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo o domínio de conteúdo, a interpretação pedagógica e a articulação de conceitos; não corresponde a estatística oficial de desempenho.',resposta_correta:anulada?null:(key==='C'?0:1),anulada,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_376_SEDUCAL004.PDF — Cargo 4: Professor, Educação Física',sha256:hashGabarito,numero:n,resposta:key,criterio:'Gabarito oficial definitivo do mesmo cargo/caderno; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Item ${n}: matéria e conteúdo definidos pelo enunciado e pelo comando da seção. Identificação do cargo, data e banca conferida nas fontes oficiais; dificuldade estimada.`,enunciado,texto_apoio,imagem_pagina:imagem,visual:{pagina:q.pagina,imagem,enunciado,texto_apoio,motivo:`Página ${q.pagina} do caderno oficial conferida visualmente; contexto textual associado ao item e imagem original preservada.`},apta_resolucao:true,remover_pendencias:remover})
}
assert.equal(decisoes.length,43);assert.equal(new Set(decisoes.map(x=>x.id)).size,43)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:43,itens_unicos:43,aptas:43,anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero),paginas_conferidas:[1,2,3,4],gabarito_definitivo_oficial:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,justificativas,concurso,registros_revisados:43,itens_unicos:43,questoes_aptas:43,itens_anulados:decisoes.filter(x=>x.anulada).map(x=>x.numero),paginas_conferidas:[1,2,3,4],gabarito_definitivo_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2018 — Professor de Educação Física, Cargo 4 — revisão v491\n\n- Revisei 43 itens únicos que estavam pendentes, cobrindo história da Educação Física, esporte e sociedade, pedagogia e aprendizagem motora, avaliação, cultura corporal, políticas educacionais e práticas cooperativas.\n- Corrigi enunciados com texto-base ou comandos de questões vizinhas incorporados; os contextos necessários foram separados e as páginas originais vinculadas.\n- Vinculei o gabarito definitivo oficial; o item 78 está anulado e permanece sem correção automática.\n- Dificuldades indicadas como estimativas editoriais. Pacote local validado, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${gabarito}), [justificativas oficiais](${justificativas}).\n`)
console.log(JSON.stringify(relatorio,null,2))
