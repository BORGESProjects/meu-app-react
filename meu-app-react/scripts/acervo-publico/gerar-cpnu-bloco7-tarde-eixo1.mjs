import { readFile, writeFile, mkdir } from 'node:fs/promises'
const root = new URL('../../', import.meta.url)
const template = JSON.parse(await readFile(new URL('src/data/cpnu-2024-bloco-7-manha-gerais.json', root), 'utf8'))[0]
const pdf = 'https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas/tarde/prova-15-gabarito-1-gestao-governamental-e-administracao-publica-tarde.pdf'
const key = 'https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_gabaritosoficiais_todos-os-blocos-tarde.pdf'
const labels = ['A','B','C','D','E']
const answers = ['E', null, 'C', 'A', 'B']
const rows = [
 {n:1,subject:'Gestão de Pessoas',topic:'Negociação e gestão de conflitos',stem:'Um grupo de secretárias de uma organização que depende da mesma dotação orçamentária de escritório começou a barganhar entre si para saber quem iria adquirir novos equipamentos de informática e quem teria de continuar com o equipamento existente. Na decisão de quais interesses conflitantes seriam satisfeitos, as secretárias consideraram que os interesses do grupo são importantes, mas não merecem a desordem provocada por estilos mais assertivos. Assim sendo, as secretárias optaram pela abordagem da transigência na negociação, que',options:['promove os interesses de um membro do grupo à custa dos interesses dos outros, muitas vezes pelo recurso à autoridade.','permite que as outras partes satisfaçam seus interesses à custa dos interesses de um membro do grupo.','requer a permanência dos membros do grupo na neutralidade a todo custo ou a sua recusa em assumir um papel ativo nos procedimentos de resolução do conflito.','tenta satisfazer a todos mediante a consideração das diferenças e a busca de solução que resulte em ganho para todos os interessados.','procura a satisfação parcial de todos mediante a troca e o sacrifício, decidindo mais pela resolução aceitável do que pela resolução ótima.']},
 {n:2,subject:'Gestão Estratégica',topic:'Objetivos e resultados-chave (OKR)',stem:'Uma empresa pública da área de desenvolvimento e inovação decidiu utilizar em seu planejamento a ferramenta para aumentar o foco e o engajamento através de objetivos e resultado-chave (OKR, na sigla em inglês) que representam os resultados mais importantes para o negócio e para os clientes. Nesse sentido, é relevante para toda a organização, porém monitorado pelo time de gestão de pessoas, o seguinte OKR:',options:['ampliar a interação com setor produtivo para superação de barreiras técnicas; aumento do número de demandas do setor produtivo.','aprimorar a gestão e governança com foco em políticas públicas; percentual de elaboração do orçamento participativo.','estruturar relacionamento com setor produtivo para pesquisa e desenvolvimento; aumento da captação de recursos para projetos de extensão tecnológica.','promover soluções para apoio à economia verde e descarbonização; quantidade de soluções entregues sobre quantidade das consultas.','tornar a autarquia mais atrativa para captar e reter servidores; relação entre quantidade de entradas de servidores versus saídas da autarquia.'], anulada:true},
 {n:3,subject:'Saúde e Segurança do Trabalho',topic:'Fatores humanos na segurança do trabalho',stem:'O sucesso de um programa de segurança está diretamente relacionado a sua estruturação em comitês formados por especialistas, trabalhadores e gestores, com as finalidades de investigar os riscos e definir políticas e normas de segurança. Para cumprir tais finalidades, é necessário reconhecer que fatores como o trabalho em si, as condições de trabalho e a natureza do trabalhador influenciam na segurança e na saúde de trabalhadores. A esse respeito, fatores relacionados à natureza da pessoa trabalhadora estão exemplificados a seguir:',options:['manejo de substâncias tóxicas, contaminantes ou inflamáveis.','carência de equipamentos de proteção e/ou falhas de sinalização.','impulsividade, agressividades e dificuldade psicomotora ou perceptiva.','jornadas extensas, ruídos elevados ou iluminação inadequada.','máquinas mal projetadas ou equipamentos malconservados.']},
 {n:4,subject:'Gestão de Pessoas',topic:'Liderança transformacional',stem:'O fenômeno da liderança nas organizações é multidimensional e multifacetado, havendo diferenças entre as várias definições. Em determinada situação de trabalho, por exemplo, pode ocorrer de um líder constantemente pautar sua ação em elevar o seu moral, a motivação e o moral dos seus seguidores, em detrimento dos próprios interesses (seus e dos seguidores) para o bem da organização, dando atenção e aconselhamento individual, construindo uma resolução conjunta de problemas e tomada de decisão. O exemplo acima descreve uma liderança do tipo',options:['transformacional.','transacional.','carismática.','autocrática.','liberal.']},
 {n:5,subject:'Gestão de Pessoas',topic:'Educação corporativa e instrução programada',stem:'Um ministério decidiu capacitar seus colaboradores por meio de trilhas de conhecimento. No ambiente virtual de aprendizagem foram organizados tematicamente textos, vídeos e podcasts, em uma sequência de passos estruturados a serem seguidos pelo colaborador. Após o estudo do material, o participante responde a questões autoadministráveis e recebe feedback imediato de forma a permitir a reavaliação do aprendizado. A estratégia de capacitação desenvolvida pela empresa baseia-se na noção de',options:['dinâmica de grupo.','instrução programada.','mentoria e orientação.','oficina de trabalho.','rotação de trabalho.']}
]
const questions = rows.map((row) => {
 const answer = answers[row.n - 1], answerIndex = answer == null ? null : labels.indexOf(answer)
 const q = structuredClone(template)
 const page = row.n <= 5 ? 2 : 3
 Object.assign(q, {
  id:`cpnu-2024-bloco-7-tarde-eixo-1-q${row.n}`, ano:2024, ano_concurso:2024, ano_aplicacao:2024,
  numero:row.n, numero_original:row.n, modelo:'Gabarito 1', banca:'CPNU', organizadora:'Fundação Cesgranrio',
  concurso:'CPNU 2024 — Bloco 7, Gestão Governamental e Administração Pública (tarde)', cargo:'Bloco 7 — Gestão Governamental e Administração Pública',
  aplicacao:'18/08/2024 — prova objetiva oficial', materia:row.subject, conteudo:row.topic, dificuldade:'Média',
  dificuldade_estimada:true, dificuldade_metodo:'estimativa editorial pela complexidade conceitual e de interpretação exigida',
  enunciado:row.stem, texto_apoio:'', opcoes:row.options, rotulos_opcoes:labels, resposta_correta:answerIndex,
  anulada:Boolean(row.anulada), tipo_resposta:'alternativa', tipo:'objetiva',
  provas:['CPNU 2024 — Prova 15 — Gabarito 1 — Bloco 7 — tarde'],
  documento_id:'cpnu-2024-prova-15-gabarito-1-bloco-7-tarde',
  documento_origem:'prova-15-gabarito-1-gestao-governamental-e-administracao-publica-tarde.pdf',
  arquivo_origem:'prova-15-gabarito-1-gestao-governamental-e-administracao-publica-tarde.pdf',
  pagina:page, paginas_origem:[page], fonte_pdf:pdf, fonte_gabarito:key,
  gabarito_oficial:{verificada:true,url:key,pdf_url:pdf,numero:row.n,resposta:answer,anulada:Boolean(row.anulada)},
  origens_provas:[{concurso:'CPNU 2024 — Bloco 7 — tarde',aplicacao:'18/08/2024',modelo:'Gabarito 1',numero_original:row.n,pagina:page,arquivo_origem:'prova-15-gabarito-1-gestao-governamental-e-administracao-publica-tarde.pdf',fonte_pdf:pdf,fonte_gabarito:key,resposta_correta:answerIndex,anulada:Boolean(row.anulada),gabarito_oficial:{verificada:true,url:key,pdf_url:pdf,numero:row.n,resposta:answer,anulada:Boolean(row.anulada)}}],
  classificacao_revisada:true, classificacao_pendente:false, classificacao_confianca:1,
  classificacao_metodo:'classificação editorial pela seção e pelo conceito diretamente cobrado no caderno oficial',
  classificacao_evidencia:`Caderno oficial CPNU 2024, Prova 15 Gabarito 1, página ${page}; gabarito final oficial da tarde, Bloco 7`,
  integridade_profissional:{verificada_individualmente:true,apta_resolucao:true,pendencias:[],fontes_verificadas:true,questao_completa:true},
  elegibilidade:{elegivel_para_resolucao:!row.anulada,elegivel_para_correcao_automatica:!row.anulada,apontamentos:row.anulada?['Questão anulada no gabarito definitivo oficial.']:[]},
  origem:'Caderno oficial CPNU 2024 — Prova 15 — Bloco 7 — tarde', apoio:[]
 })
 return q
})
if (questions.length!==5 || questions.some((q,i)=>q.numero_original!==i+1 || q.opcoes.length!==5 || !q.gabarito_oficial.verificada || (q.anulada ? q.resposta_correta!==null : q.rotulos_opcoes[q.resposta_correta]!==answers[i]))) throw new Error('Validação estrutural do lote CPNU 7 tarde q1–5 falhou')
const dataOut=new URL('src/data/cpnu-2024-bloco-7-tarde-eixo-1.json',root)
const publicDir=new URL('public/acervo/cpnu-2024-bloco-7-tarde-eixo-1/',root)
await mkdir(publicDir,{recursive:true})
await writeFile(dataOut,`${JSON.stringify(questions,null,2)}\n`,'utf8')
await writeFile(new URL('questoes.json',publicDir),`${JSON.stringify(questions,null,2)}\n`,'utf8')
console.log(`Generated ${questions.length} CPNU Block 7 afternoon official items, questions 1–5; q2 is explicitly marked annulled.`)
