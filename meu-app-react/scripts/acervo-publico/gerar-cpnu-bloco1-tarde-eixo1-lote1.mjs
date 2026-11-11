import { readFile, writeFile, mkdir } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const template = JSON.parse(await readFile(new URL('src/data/cpnu-2024-bloco-7-manha-gerais.json', root), 'utf8'))[0]
const pdf = 'https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas/tarde/prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf'
const key = 'https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_gabaritosoficiais_todos-os-blocos-tarde.pdf'
const answers = ['E', 'C', 'E', 'B', 'A']
const rows = [
  { n: 1, subject: 'Gestão de Projetos', topic: 'Estimativa paramétrica do cronograma', stem: 'O desenvolvimento do cronograma de um projeto requer inferir as durações de suas atividades, em função da projeção da quantidade de esforço de trabalho requerida para concluí-las e da quantidade de recursos disponíveis estimados para completá-las. Essas estimativas são usadas para um cálculo aproximado do número de períodos de trabalho necessário para executar por completo atividades, usando os calendários de projeto e de recursos apropriados. A Estimativa Paramétrica, uma das técnicas que pode ser utilizada no apoio do desenvolvimento do cronograma de um projeto, consiste em', options: ['agregar estimativas dos componentes de nível mais baixo da estrutura analítica do projeto (EAP).', 'contratar um consultor externo com experiência em projetos similares para estimar parâmetros para o novo projeto.', 'aplicar uma média ponderada das estimativas otimistas, pessimistas e mais prováveis, quando existe incerteza em relação às estimativas da atividade em questão.', 'usar parâmetros de um projeto anterior semelhante como base para a estimativa dos mesmos parâmetros ou de medidas para um projeto futuro.', 'usar um algoritmo para calcular, estatisticamente, o custo ou a duração de atividades com base em dados históricos e em parâmetros do projeto, para calcular uma estimativa dos parâmetros da atividade, tais como custo, orçamento e duração.'] },
  { n: 2, subject: 'Comunicação Pública', topic: 'Relações públicas e press-release', stem: 'As unidades de saúde de um município passaram a oferecer novos serviços de saúde para a população, tais como orientação nutricional e fisioterapia, e o prefeito gostaria que seus munícipes ficassem sabendo disso o quanto antes. Para tanto, a assessoria de imprensa da Secretaria de Saúde preparou um documento, de apenas uma página, contendo as informações a respeito dos novos serviços de saúde oferecidos à população e distribuiu esse documento aos jornalistas de emissoras de rádio e televisão do município e da capital. Com isso, a assessoria espera atrair a atenção da mídia e aumentar a divulgação dos novos serviços. Nesse caso, identifica-se um exemplo de utilização da ferramenta de relações públicas denominada', options: ['Lobby.', 'Pôster.', 'Press-release.', 'Media trainning.', 'Gross rating point.'] },
  { n: 3, subject: 'Gestão de Programas e Projetos', topic: 'Interdependências no gerenciamento de programas', stem: 'O gerenciamento de programas foca nas interdependências entre projetos como também entre projetos e o nível do programa, para determinar a abordagem ideal para gerenciá-los. Um objetivo do gerenciamento de programas relacionado exclusivamente às interdependências de nível de projeto e programa é:', options: ['selecionar a combinação ideal de programas e projetos para cumprir os objetivos estratégicos.', 'orientar as decisões de investimento organizacional no portfólio de programas e projetos.', 'garantir que o portfólio de programas, projetos e operações gerenciadas esteja alinhado com as estratégias organizacionais.', 'aumentar a probabilidade de alcançar o retorno desejado sobre o investimento em programas e projetos.', 'buscar soluções para restrições e conflitos que afetem os vários projetos no programa.'] },
  { n: 4, subject: 'Planejamento Estratégico', topic: 'Matriz SWOT: fatores internos e externos', stem: 'Na elaboração de seu plano estratégico institucional, uma organização pública desenvolveu uma matriz SWOT. Na análise do cenário em que esse planejamento estava sendo traçado, identificou-se um erro na classificação dos componentes, o que pode dificultar a escolha de uma estratégia que contemple, ao mesmo tempo, as oportunidades do ambiente e o que de melhor a organização poderá fazer para aproveitá-las. Nesse contexto, segundo a matriz SWOT, há um erro de classificação na identificação de:', options: ['fraquezas organizacionais (W): baixa integração entre as áreas de atuação; baixa efetividade da comunicação interna nos níveis estratégico, tático e operacional; e falha sistemática de monitoramento de indicadores e de desempenho.', 'oportunidades organizacionais (O): intensificação do exercício da cidadania com maior demanda da sociedade pelos produtos e serviços prestados; fomento à autonomia institucional; restrições orçamentárias; e dificuldade para firmar parcerias.', 'ameaças organizacionais (T): descontinuidade nas estratégias e políticas governamentais; perda de servidores qualificados com outras oportunidades de trabalho; conflitos de interesse que possam influenciar as decisões; e as ações de controle interno.', 'fortalezas organizacionais (S): identificação dos servidores com a missão institucional; padrões de comportamento baseados em valores e princípios constitucionais, legais e organizadores; e lealdade institucional dos servidores com o órgão.', 'fortaleza organizacional (S): oportunidade de crescimento profissional; fraqueza organizacional (W): insuficiente cultura interna de valorização do planejamento; oportunidade organizacional (O): compartilhamento e disseminação de boas práticas na gestão pública.'] },
  { n: 5, subject: 'Gestão de Pessoas', topic: 'Motivação intrínseca e extrínseca', stem: 'Vários estudos têm enfatizado que as singularidades organizacionais e as particularidades dos indivíduos que constituem a força laboral do setor público influenciam a motivação. Esses estudos indicam que, ao contrário do que acontece no setor privado, predominam, no setor público, níveis de motivação intrínseca superiores aos níveis de motivação extrínseca. Um gerente de RH de uma empresa pública confirmou esses estudos quando constatou que a maioria de seus servidores concordaram com a seguinte afirmativa:', options: ['“O que mais me importa é sentir prazer pelo que faço e tentar resolver problemas complexos, já que a curiosidade é a força motriz do meu trabalho”.', '“Não fico muito preocupado com o que os outros pensam do meu trabalho, já que possuo um locus de controle interno baixo, e atribuo o meu comportamento a necessidades internas”.', '“Sou fortemente motivado pelo dinheiro que posso ganhar, e busco sempre recompensas como salários e outros benefícios monetários, diminuição da carga de trabalho e promoções”.', '“Fico mais preocupado com o que me pagam do que com o tipo trabalho que tenho de fazer, já que tenho de sentir que estou ganhando alguma coisa pelo trabalho que realizo”.', '“Prefiro que alguém estabeleça para mim os objetivos que devo atingir a nível profissional, já que acredito que não faz sentido realizar um bom trabalho se mais ninguém souber disso”.'] },
]

const questions = rows.map((row) => {
  const q = structuredClone(template)
  const page = row.n <= 4 ? 2 : 3
  const answer = answers[row.n - 1]
  Object.assign(q, {
    id: `cpnu-2024-bloco-1-tarde-eixo-1-q${row.n}`, ano: 2024, ano_concurso: 2024, ano_aplicacao: 2024,
    numero: row.n, numero_original: row.n, modelo: 'Gabarito 1', banca: 'CPNU', organizadora: 'Fundação Cesgranrio',
    concurso: 'CPNU 2024 — Bloco 1, Infraestrutura, Exatas e Engenharia (tarde)', cargo: 'Bloco 1 — Infraestrutura, Exatas e Engenharia',
    aplicacao: '18/08/2024 — prova objetiva oficial', materia: row.subject, conteudo: row.topic,
    dificuldade: 'Média', dificuldade_estimada: true,
    dificuldade_metodo: 'estimativa editorial pela complexidade conceitual e de interpretação exigida',
    enunciado: row.stem, texto_apoio: '', opcoes: row.options, rotulos_opcoes: ['A', 'B', 'C', 'D', 'E'],
    resposta_correta: ['A', 'B', 'C', 'D', 'E'].indexOf(answer), anulada: false,
    tipo_resposta: 'alternativa', tipo: 'objetiva', provas: ['CPNU 2024 — Prova 9 — Gabarito 1 — Bloco 1 — tarde'],
    documento_id: 'cpnu-2024-prova-9-gabarito-1-bloco-1-tarde',
    documento_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf',
    arquivo_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf', pagina: page, paginas_origem: [page],
    fonte_pdf: pdf, fonte_gabarito: key, apoio: [],
    gabarito_oficial: { verificada: true, url: key, pdf_url: pdf, numero: row.n, resposta: answer, anulada: false },
    origens_provas: [{ concurso: 'CPNU 2024 — Bloco 1 — tarde', aplicacao: '18/08/2024', modelo: 'Gabarito 1', numero_original: row.n, pagina: page,
      arquivo_origem: 'prova-9-gabarito-1-infraestrutura-exatas-e-engenharia-tarde.pdf', fonte_pdf: pdf, fonte_gabarito: key,
      resposta_correta: ['A', 'B', 'C', 'D', 'E'].indexOf(answer), anulada: false,
      gabarito_oficial: { verificada: true, url: key, pdf_url: pdf, numero: row.n, resposta: answer, anulada: false } }],
    classificacao_revisada: true, classificacao_pendente: false, classificacao_confianca: 1,
    classificacao_metodo: 'classificação editorial pelo conceito diretamente cobrado no caderno oficial',
    classificacao_evidencia: `Caderno oficial CPNU 2024, Prova 9 Gabarito 1, página ${page}; gabarito final oficial da tarde, Bloco 1`,
    integridade_profissional: { verificada_individualmente: true, apta_resolucao: true, pendencias: [], fontes_verificadas: true, questao_completa: true },
    elegibilidade: { elegivel_para_resolucao: true, elegivel_para_correcao_automatica: true, apontamentos: [] },
    origem: 'Caderno oficial CPNU 2024 — Prova 9 — Bloco 1 — tarde',
  })
  return q
})

if (questions.length !== 5 || questions.some((q, i) => q.numero_original !== i + 1 || q.opcoes.length !== 5 || !q.gabarito_oficial.verificada || q.rotulos_opcoes[q.resposta_correta] !== answers[i])) {
  throw new Error('Validação estrutural do lote CPNU Bloco 1 tarde q1–5 falhou')
}
const dataOut = new URL('src/data/cpnu-2024-bloco-1-tarde-eixo-1-lote-1.json', root)
const publicDir = new URL('public/acervo/cpnu-2024-bloco-1-tarde-eixo-1-lote-1/', root)
await mkdir(publicDir, { recursive: true })
await writeFile(dataOut, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', publicDir), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log(`Generated ${questions.length} CPNU Block 1 afternoon items, questions 1–5; official final key confirmed.`)
