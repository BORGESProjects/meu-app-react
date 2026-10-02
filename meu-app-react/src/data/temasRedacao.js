const criteriosEnem = 'Cinco competências do ENEM, de 0 a 200 pontos cada: norma-padrão; compreensão do tema e repertório; organização dos argumentos; coesão; proposta de intervenção que respeite os direitos humanos.'
const criteriosFuvest = 'Critérios da FUVEST: desenvolvimento do tema e organização do texto dissertativo-argumentativo; coerência e articulação; correção gramatical e adequação vocabular. Nota de 10 a 50 pontos.'

export const temasRedacao = [
  { id: 'enem-2024', banca: 'ENEM', ano: 2024, tema: 'Desafios para a valorização da herança africana no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2023', banca: 'ENEM', ano: 2023, tema: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2022', banca: 'ENEM', ano: 2022, tema: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2021', banca: 'ENEM', ano: 2021, tema: 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2020', banca: 'ENEM', ano: 2020, tema: 'O estigma associado às doenças mentais na sociedade brasileira', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2019', banca: 'ENEM', ano: 2019, tema: 'Democratização do acesso ao cinema no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2018', banca: 'ENEM', ano: 2018, tema: 'Manipulação do comportamento do usuário pelo controle de dados na internet', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2017', banca: 'ENEM', ano: 2017, tema: 'Desafios para a formação educacional de surdos no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2016', banca: 'ENEM', ano: 2016, tema: 'Caminhos para combater a intolerância religiosa no Brasil', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'enem-2015', banca: 'ENEM', ano: 2015, tema: 'A persistência da violência contra a mulher na sociedade brasileira', tipo: 'Dissertativo-argumentativo', criterios: criteriosEnem },
  { id: 'fuvest-2025', banca: 'FUVEST', ano: 2025, tema: 'As relações sociais por meio da solidariedade', tipo: 'Dissertação em prosa', criterios: criteriosFuvest },
  { id: 'fuvest-2024', banca: 'FUVEST', ano: 2024, tema: 'Educação básica e formação profissional: entre a multitarefa e a reflexão', tipo: 'Dissertação em prosa', criterios: criteriosFuvest },
].map(item => ({
  ...item,
  instrucoes: item.banca === 'ENEM'
    ? 'Defenda um ponto de vista com argumentos consistentes e apresente uma proposta de intervenção social que respeite os direitos humanos.'
    : 'Exponha seu ponto de vista em uma dissertação em prosa, desenvolvendo o tema com argumentação, coerência, coesão e domínio da norma-padrão.',
  fonte: item.banca === 'ENEM'
    ? 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos'
    : `https://www.fuvest.br/acervo-vestibular-${item.ano}/`,
}))

export const bancasRedacao = [...new Set(temasRedacao.map(item => item.banca))]
