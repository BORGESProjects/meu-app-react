import { readFile, writeFile, mkdir } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const template = JSON.parse(await readFile(new URL('src/data/cpnu-2024-bloco-7-manha-gerais.json', root), 'utf8'))[0]
const pdf = 'https://www.gov.br/gestao/pt-br/concursonacional/caderno-de-provas/tarde/prova-11-gabarito-1-ambiental-agrario-e-biologicas-tarde.pdf'
const key = 'https://www.gov.br/gestao/pt-br/concursonacional/gabaritos-finais/cpnu2024_gabaritosoficiais_todos-os-blocos-tarde.pdf'
const labels = ['A', 'B', 'C', 'D', 'E']
const rows = [
  {
    n: 46, page: 13, answer: null, annulled: true,
    subject: 'Agroecologia', topic: 'Sistemas orgânicos de produção',
    stem: 'Um Sistema Orgânico de Produção Agropecuária é aquele em que se utilizam recursos naturais e socioeconômicos disponíveis, com respeito à integridade cultural das comunidades rurais, tendo em vista a sustentabilidade econômica, ecológica e os benefícios sociais, assim como a proteção do meio ambiente. Existem diferentes correntes de produção orgânica, sendo que todas elas têm em comum o modo de produção agrícola que não utiliza produtos químicos sintéticos (fertilizantes e pesticidas) nem organismos geneticamente modificados (OGMs), respeitando o meio ambiente e a biodiversidade.\n\nAssocie essas diferentes correntes de produção orgânica, com suas respectivas características apresentadas a seguir.\n\nI — Sistema Agroflorestal (SAF)\nII — Agricultura Biológica\nIII — Agricultura Biodinâmica\n\nP — Primeiro movimento do gênero reconhecido nos tempos atuais, com desenvolvimento na década de 1920 a partir das ideias de Rudolf Steiner (1861–1925), mesclando conhecimentos químicos, geológicos e astronômicos, e usando preparados homeopáticos e calendário astronômico.\n\nQ — Conjunto de princípios agrícola e social de design baseado em padrões e características observados em ecossistemas naturais, desenvolvido por David Holmgren e Bill Mollison, em 1978, que usa o termo “permacultura” para se referir à “agricultura e cultura permanentes”.\n\nR — Forma de uso e manejo dos recursos naturais, na qual árvores, arbustos, trepadeiras e herbáceas são utilizadas em associação deliberada com cultivos agrícolas e/ou com animais na mesma área, de maneira simultânea ou em sequência temporal, com o objetivo de conciliar o aumento da produtividade e a rentabilidade econômica com a proteção ambiental e a qualidade de vida.\n\nS — Abordagem estabelecida por Masanobu Fukuoka (1913–2008), agricultor e filósofo japonês que criou um modo de produção que evita insumos e equipamentos fabricados, trabalhando, dessa forma, junto com a biodiversidade natural e estimulando a complexidade dos organismos vivos.\n\nAs associações corretas são:',
    options: ['I — P, II — Q, III — R', 'I — P, II — R, III — S', 'I — Q, II — S, III — P', 'I — R, II — S, III — P', 'I — S, II — P, III — R']
  },
  {
    n: 47, page: 14, answer: 'B', subject: 'Mudanças Climáticas', topic: 'Emissões de gases de efeito estufa na rizicultura',
    stem: 'Segundo o Painel Intergovernamental sobre Mudanças Climáticas (IPCC, 2023), em 2019, 22% das emissões globais de gases de efeito estufa (GEE) vieram das atividades de Agricultura, Floresta e Outros Usos da Terra (AFOLU, sigla em inglês). Por outro lado, essas atividades são muito impactadas pelas mudanças do clima, pois respondem de forma direta e indireta às variações meteorológicas de temperatura, radiação solar, chuva, umidade do ar e velocidade do vento. Uma das atividades de AFOLU é o plantio de arroz irrigado por inundação. O arroz é considerado o produto de maior importância econômica em muitos países em desenvolvimento, constituindo alimento básico para cerca de 2,4 bilhões de pessoas, e desempenhando papel estratégico tanto em nível econômico quanto social para os povos das nações mais populosas da Ásia, África e América Latina.\n\nNo que diz respeito à mudança do clima, a cultura de arroz irrigado por inundação contribui principalmente para emissão direta de',
    options: ['dióxido de carbono (CO₂).', 'metano (CH₄).', 'óxido nitroso (N₂O).', 'clorofluorcarbonetos (CFCs).', 'ozônio (O₃).']
  },
  {
    n: 48, page: 14, answer: 'D', subject: 'Agricultura Sustentável', topic: 'Práticas agrossilvipastoris',
    stem: 'A agricultura brasileira é um setor econômico altamente competitivo, que gera empregos, alimentos, bioenergia, riqueza e superávits primários, contribuindo para o crescimento do PIB nacional. Entretanto, a atividade agropecuária pode trazer uma série de impactos para o meio ambiente em termos de depleção e degradação da base de recursos naturais e de poluição das águas, solos e ar. Tendo em vista que esse setor é essencial para produção de alimentos, devem ser adotadas práticas adequadas de gestão para minimização dos danos ambientais.\n\nUma prática adequada de gestão ambiental, visando a minimizar os danos ambientais do setor agrícola, é o(a)',
    options: ['uso do sistema de irrigação por pivô central, em substituição ao sistema por gotejamento.', 'uso da agricultura comercial (moderna) intensiva de larga escala, em substituição à agricultura familiar extensiva orgânica.', 'uso de fertilizantes químicos para condicionamento do solo, em substituição aos adubos orgânicos.', 'adoção de práticas agrossilvipastoris em médias propriedades, em substituição a práticas agrícolas do tipo monocultura em grandes propriedades.', 'adoção de práticas de queimadas e desmatamentos de novas áreas, em substituição aos recondicionamentos de áreas existentes.']
  },
  {
    n: 49, page: 14, answer: 'C', subject: 'Agronomia', topic: 'Água disponível e classificação de solos',
    stem: 'O Decreto nº 9.841/2019 dispõe sobre o Programa Nacional de Zoneamento Agrícola de Risco Climático (ZARC), a fim de disponibilizar informações de avaliação, quantificação e monitoramento de riscos agroclimáticos à sociedade. O ZARC é uma ferramenta de análise do risco que auxilia a tomada de decisão no campo, considerando a probabilidade de ocorrência de adversidades baseada em séries históricas de dados climáticos e em características da cultura e do solo. Atualmente, o ZARC tem adotado um novo sistema de classificação de solos que deixa de utilizar o tradicional sistema de solos “Tipo 1”, “Tipo 2” e “Tipo 3” e passa a adotar uma nova metodologia que define seis classes de água disponível (AD1, AD2, AD3, AD4, AD5, AD6). Dessa forma, a água disponível (AD) do solo é estimada para cada área de produção, a partir da sua composição textural determinada por análise de solo padrão. A estimativa é feita através do uso de uma equação (função de pseudotransferência), devidamente ajustada para os distintos solos brasileiros. Calculada a AD, é definido o enquadramento em uma classe de AD. No caso de um cultivo de sequeiro, ao se considerar uma classe e a profundidade efetiva média do sistema radicular do cultivar, é possível verificar se a necessidade de água do cultivar é atendida pela classe de solo.\n\nBuscando avaliar o risco agroclimático do cultivo da soja no Mato Grosso do Sul, um agrônomo colheu amostras de um solo, determinou a composição granulométrica e, ao aplicar os teores percentuais na função de pseudotransferência, obteve um valor de AD de 0,75 mm/cm.\n\nDessa forma, o agrônomo classificou esse solo como',
    options: ['AD1.', 'AD2.', 'AD3.', 'AD4.', 'AD5.']
  },
  {
    n: 50, page: 14, answer: 'E', subject: 'Gestão Ambiental', topic: 'Conservação e uso sustentável dos ecossistemas',
    stem: 'A responsabilidade humana na conservação de nosso habitat tem se tornado cada vez mais importante, evidenciando a conexão entre a disponibilidade de recursos naturais, a produção e o consumo de bens e o reaproveitamento de materiais como fator essencial para a manutenção do aporte de bens e serviços à população ao longo dos próximos anos. Conceitualmente, do ponto de vista da gestão ambiental, a conservação é uma estratégia desenvolvida para o uso e aproveitamento de determinados ecossistemas, mantendo-os ativos e com capacidade de recomposição.\n\nDiante disso, os ecossistemas que se enquadram nesse conceito de conservação são os',
    options: ['parques nacionais e os cultivos orgânicos.', 'parques nacionais e as florestas sob exploração sustentável.', 'parques nacionais e as áreas de proteção ambiental.', 'cultivos orgânicos e as áreas de proteção ambiental.', 'cultivos orgânicos e as florestas sob exploração sustentável.']
  }
]

const questions = rows.map(row => {
  const question = structuredClone(template)
  const answerIndex = row.answer ? labels.indexOf(row.answer) : null
  const official = { verificada: true, url: key, pdf_url: pdf, numero: row.n, resposta: row.annulled ? 'Anulada' : row.answer, anulada: Boolean(row.annulled) }
  Object.assign(question, {
    id: `cpnu-2024-bloco-3-tarde-eixo-5-q${row.n}`,
    ano: 2024, ano_concurso: 2024, ano_aplicacao: 2024,
    numero: row.n, numero_original: row.n, modelo: 'Gabarito 1', banca: 'CPNU', organizadora: 'Fundação Cesgranrio',
    concurso: 'CPNU 2024 — Bloco 3, Ambiental, Agrário e Biológicas (tarde)',
    cargo: 'Bloco 3 — Ambiental, Agrário e Biológicas', aplicacao: '18/08/2024 — prova objetiva oficial',
    materia: row.subject, conteudo: row.topic, dificuldade: 'Média', dificuldade_estimada: true,
    dificuldade_metodo: 'estimativa editorial pela complexidade conceitual e de interpretação exigida',
    enunciado: row.stem, enunciado_antes_apoio: '', texto_apoio: '',
    opcoes: row.options, rotulos_opcoes: labels, resposta_correta: answerIndex,
    anulada: Boolean(row.annulled), tipo_resposta: 'alternativa', tipo: 'objetiva',
    provas: ['CPNU 2024 — Prova 11 — Gabarito 1 — Bloco 3 — tarde'],
    documento_id: 'cpnu-2024-prova-11-gabarito-1-bloco-3-tarde',
    documento_origem: 'prova-11-gabarito-1-ambiental-agrario-e-biologicas-tarde.pdf',
    arquivo_origem: 'prova-11-gabarito-1-ambiental-agrario-e-biologicas-tarde.pdf',
    pagina: row.page, paginas_origem: [row.page], fonte_pdf: pdf, fonte_gabarito: key,
    apoio: [], gabarito_oficial: official,
    origens_provas: [{ concurso: 'CPNU 2024 — Bloco 3 — tarde', aplicacao: '18/08/2024', modelo: 'Gabarito 1', numero_original: row.n, pagina: row.page, arquivo_origem: 'prova-11-gabarito-1-ambiental-agrario-e-biologicas-tarde.pdf', fonte_pdf: pdf, fonte_gabarito: key, resposta_correta: answerIndex, anulada: Boolean(row.annulled), gabarito_oficial: official }],
    classificacao_revisada: true, classificacao_pendente: false, classificacao_confianca: 1,
    classificacao_metodo: 'classificação editorial pelo conceito diretamente cobrado no caderno oficial',
    classificacao_evidencia: `Caderno oficial CPNU 2024, Prova 11 Gabarito 1, página ${row.page}; gabarito final oficial da tarde, Bloco 3`,
    integridade_profissional: { verificada_individualmente: true, apta_resolucao: !row.annulled, pendencias: row.annulled ? ['Questão anulada no gabarito definitivo oficial.'] : [], fontes_verificadas: true, questao_completa: true },
    elegibilidade: { elegivel_para_resolucao: !row.annulled, elegivel_para_correcao_automatica: !row.annulled, apontamentos: row.annulled ? ['Anulada oficialmente'] : [] },
    origem: 'Caderno oficial CPNU 2024 — Prova 11 — Bloco 3 — tarde'
  })
  return question
})

if (questions.length !== 5 || questions.some((q, index) => q.numero_original !== index + 46 || q.opcoes.length !== 5 || !q.gabarito_oficial.verificada || q.gabarito_oficial.anulada !== q.anulada || (!q.anulada && labels[q.resposta_correta] !== rows[index].answer) || (q.anulada && q.resposta_correta !== null) || !q.enunciado.trim() || q.opcoes.some(option => !option.trim()))) {
  throw new Error('Validação estrutural ou gabarito CPNU Bloco 3 q46–50 falhou')
}

const output = new URL('src/data/cpnu-2024-bloco-3-tarde-eixo-5-lote-2.json', root)
const directory = new URL('public/acervo/cpnu-2024-bloco-3-tarde-eixo-5-lote-2/', root)
await mkdir(directory, { recursive: true })
await writeFile(output, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(new URL('questoes.json', directory), `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log('Generated CPNU Block 3 afternoon questions 46–50; question 46 is marked annulled per definitive answer key.')
