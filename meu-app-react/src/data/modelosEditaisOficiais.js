// Modelos resumidos a partir de programas/edital oficiais. São cópias pessoais
// de estudo; sempre confira retificações e o documento da edição/unidade escolhida.
const modelo = (concurso, ano, categoria, fonte, observacao, grupos) => ({
  concurso, ano, categoria, fonte, observacao,
  itens: Object.entries(grupos).flatMap(([materia, conteudos]) =>
    conteudos.map(conteudo => ({concurso, materia, conteudo}))
  )
})

export const modelosEditaisOficiais = [
  modelo('UFPR — Vestibular 2027', '2027', 'Universidade federal', 'https://servicos.nc.ufpr.br/PortalNC/Concurso?edital=9363', 'Matriz vigente publicada pelo Núcleo de Concursos. O formato foi alterado para fase única; este roteiro cobre os componentes indicados no programa oficial.', {
    'Língua Portuguesa':['Compreensão e interpretação de textos','Gêneros textuais, coesão e coerência','Recursos linguísticos e efeitos de sentido','Norma padrão: morfologia, sintaxe, concordância, regência e pontuação','Compreensão e produção de textos'],
    'Literatura Brasileira':['Leitura e análise das obras da lista oficial 2027','Gêneros literários, contexto histórico e recursos estéticos'],
    'Língua Estrangeira':['Leitura e interpretação','Vocabulário em contexto','Estruturas gramaticais aplicadas à compreensão'],
    'Matemática':['Números e operações','Funções e gráficos','Sequências e progressões','Contagem, probabilidade e estatística','Matrizes, determinantes e sistemas lineares','Trigonometria','Polinômios e equações algébricas','Geometria plana, espacial e analítica'],
    'Física':['Grandezas, unidades e análise dimensional','Mecânica e gravitação','Fluidos e hidrostática','Termologia e termodinâmica','Ondas e acústica','Eletricidade e magnetismo','Óptica e física moderna'],
    'Química':['Matéria, medidas e modelos atômicos','Tabela periódica e ligações','Funções inorgânicas e reações','Estequiometria e gases','Soluções e propriedades coligativas','Termoquímica e cinética','Equilíbrio químico e iônico','Eletroquímica','Química orgânica'],
    'Biologia':['Biologia celular e bioquímica','Genética e biotecnologia','Evolução','Diversidade dos seres vivos','Fisiologia humana','Ecologia e meio ambiente'],
    'História':['Antiguidade e mundo medieval','Idade Moderna e colonização','História do Brasil: Colônia, Império e República','Mundo contemporâneo: revoluções, guerras e relações internacionais'],
    'Geografia':['Cartografia e representação espacial','Natureza, clima, relevo e meio ambiente','População e dinâmica demográfica','Espaço agrário, urbano e industrial','Geopolítica e globalização','Brasil: território, sociedade e economia'],
    'Filosofia':['Mito, conhecimento e verdade','Ética e política','Filosofia antiga, moderna e contemporânea'],
    'Sociologia':['Cultura e sociedade','Trabalho, desigualdade e classes sociais','Poder, política, cidadania e movimentos sociais']
  }),
  modelo('UTFPR — Vestibular 2027', '2027', 'Universidade federal tecnológica', 'https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/guia-do-candidato', 'Programa oficial de provas 2027. A página da UTFPR disponibiliza o PDF integral do programa e os documentos da edição.', {
    'Matemática':['Conjuntos numéricos e operações','Funções, equações e inequações','Sequências e progressões','Combinatória, probabilidade e estatística','Matrizes, determinantes e sistemas','Trigonometria','Polinômios e equações algébricas','Geometria plana, espacial e analítica'],
    'Física':['Grandezas, unidades e medidas','Mecânica, dinâmica, energia e gravitação','Fluidos e hidrostática','Termologia e termodinâmica','Ondulatória e acústica','Eletromagnetismo','Óptica e física moderna'],
    'Química':['Fundamentos, matéria e separação de misturas','Estrutura atômica e tabela periódica','Ligações, geometria e forças intermoleculares','Funções e reações químicas','Estequiometria e gases','Soluções e propriedades coligativas','Termoquímica e cinética','Equilíbrio químico, ácido-base e solubilidade','Eletroquímica e química orgânica'],
    'Biologia':['Citologia e metabolismo','Genética, evolução e biotecnologia','Biodiversidade e classificação','Fisiologia vegetal e animal','Ecologia, saúde e ambiente'],
    'Geografia':['Cartografia e escalas','Geografia física e ambiental','População, urbanização e redes','Agricultura, indústria e economia','Geopolítica e organização do espaço'],
    'História':['História antiga, medieval e moderna','Brasil colonial, imperial e republicano','Revoluções e formação do mundo contemporâneo','História e cultura afro-brasileira e indígena'],
    'Língua Portuguesa':['Leitura, interpretação e gêneros','Coesão, coerência e argumentação','Gramática e usos da língua em contexto'],
    'Literatura Brasileira':['Obras e autores indicados no programa 2027','Análise literária, contexto e gêneros'],
    'Língua Estrangeira':['Leitura e compreensão de textos','Vocabulário e estruturas linguísticas em contexto'],
    'Filosofia e Sociologia':['Temas e conceitos de filosofia e sociologia do Ensino Médio','Ética, política, cultura e sociedade'],
    'Redação':['Texto dissertativo-argumentativo','Leitura da proposta, tese, argumentação e coesão','Norma escrita e revisão']
  }),
  modelo('UFSC/IFC — Vestibular Unificado 2027', '2027', 'Universidade federal e instituto federal', 'https://vestibularunificado2027.ufsc.br/programa/', 'Programa oficial das disciplinas do Vestibular Unificado. Inclui conteúdos e obras literárias indicadas para essa edição.', {
    'Língua Portuguesa e Literatura':['Interpretação e análise de textos','Estudo das obras literárias indicadas para 2027','Gêneros, linguagem e contexto sociocultural'],
    'Matemática':['Números, álgebra e funções','Geometria e trigonometria','Estatística, probabilidade e análise de dados'],
    'Biologia':['Célula, metabolismo e genética','Diversidade, evolução e fisiologia','Ecologia, saúde e ambiente'],
    'Física':['Mecânica e energia','Termologia e ondas','Eletricidade, magnetismo e óptica'],
    'Química':['Matéria e estrutura atômica','Ligações, reações e estequiometria','Soluções, energia e equilíbrio'],
    'História':['História do Brasil e das Américas','História geral e contemporânea','Sociedades, cultura e cidadania'],
    'Geografia':['Cartografia e espaço geográfico','Natureza e ambiente','População, economia e geopolítica'],
    'Filosofia e Sociologia':['Conhecimento, ética e política','Cultura, trabalho e relações sociais'],
    'Língua Estrangeira':['Compreensão leitora no idioma escolhido','Vocabulário e recursos linguísticos em contexto'],
    'Redação':['Produção textual conforme proposta da prova','Planejamento, argumentação, coesão e revisão']
  }),
  modelo('FURG — Vestibular 2027', '2027', 'Universidade federal', 'https://coperse.furg.br/vestibular', 'Baseado no Programa de Prova oficial 2027, que inclui Artes e Educação Física, além das disciplinas tradicionais.', {
    'Língua Portuguesa':['Interpretação de gêneros textuais','Semântica, coesão e relações entre textos','Norma padrão: concordância, regência, ortografia e pontuação'],
    'Literatura':['Leitura integral e análise das obras indicadas','Gêneros, contexto cultural e história literária'],
    'Produção de Textos':['Adequação ao tema e ao gênero','Argumentação, coerência e coesão','Norma escrita e revisão'],
    'Língua Estrangeira':['Leitura de textos em inglês ou espanhol','Ideias centrais, informações específicas e pontos de vista'],
    'Biologia':['Biologia celular e bioquímica','Seres vivos, genética e evolução','Ecologia, saúde e saneamento'],
    'Filosofia':['Mito e filosofia; teoria do conhecimento','Ética, política e filosofia da ciência','Estética e arte'],
    'Física':['Grandezas e medidas; mecânica','Termologia, ondas e eletromagnetismo','Óptica e física moderna'],
    'Geografia':['Terra, natureza e ambiente','População e estrutura socioespacial','Economia, produção, urbanização e geopolítica'],
    'História':['História antiga, medieval e moderna','Brasil: colônia, império e república','Mundo contemporâneo e relações sociais'],
    'Matemática':['Aritmética, álgebra e funções','Geometria, trigonometria e medidas','Estatística, combinatória e probabilidade'],
    'Química':['Matéria, estrutura e propriedades','Transformações, estequiometria e soluções','Termoquímica, cinética, equilíbrio e eletroquímica'],
    'Sociologia':['Cultura, sociedade e identidade','Trabalho, desigualdade e política'],
    'Artes':['Linguagens artísticas e leitura de imagens','Arte, cultura e contextos históricos'],
    'Educação Física':['Corpo, movimento e práticas corporais','Saúde, esporte e sociedade']
  }),
  modelo('ENEM — Matriz de Referência 2026', '2026', 'Exame nacional', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'Organizado pela matriz de referência oficial do Inep (2026): competências, habilidades e objetos de conhecimento por área. Não substitui o edital anual.', {
    'Linguagens e suas Tecnologias':['Leitura e interpretação de textos verbais e multissemióticos','Gêneros, funções da linguagem e variação linguística','Argumentação, coesão e efeitos de sentido','Literatura, artes, cultura corporal e tecnologias de comunicação','Língua estrangeira: leitura e compreensão'],
    'Matemática e suas Tecnologias':['Conhecimentos numéricos e proporcionalidade','Geometria, grandezas e medidas','Álgebra, funções e gráficos','Estatística, tabelas e probabilidade','Modelagem e resolução de situações-problema'],
    'Ciências da Natureza e suas Tecnologias':['Matéria, energia e transformações','Mecânica, eletricidade, ondas e termodinâmica','Química, soluções, reações e equilíbrio','Biologia celular, genética, evolução e ecologia','Saúde, ambiente, tecnologia e impactos sociais'],
    'Ciências Humanas e Sociais Aplicadas':['Tempo histórico, cultura, cidadania e direitos','Território, cartografia, população e ambiente','Trabalho, produção, economia e globalização','Política, poder, conflitos e movimentos sociais','Filosofia, ética, sociologia e diversidade'],
    'Redação':['Compreensão da proposta','Seleção e organização de argumentos','Coesão e domínio da escrita formal','Proposta de intervenção respeitando direitos humanos']
  }),
  modelo('IFSP — Técnico Integrado 2027', '2027', 'Instituto federal', 'https://www.ifsp.edu.br/index.php/editais-daest/17-ultimas-noticias/6110-ifsp-publica-edital-com-4-504-vagas-em-cursos-tecnicos-integrados-ao-ensino-medio', 'Edital 166/2026 para ingresso em 2027: prova objetiva de Língua Portuguesa e Matemática, 15 itens por área, conteúdos de referência do 6º ao 9º ano do Ensino Fundamental.', {
    'Língua Portuguesa':['Leitura e interpretação de textos e gêneros','Localização de informações e inferências','Coesão, coerência e relações de sentido','Classes de palavras e efeitos de uso','Pontuação, ortografia e convenções da escrita'],
    'Matemática':['Números naturais, inteiros, racionais e reais','Operações, frações, razão, proporção e porcentagem','Expressões, equações e sistemas simples','Geometria, medidas, perímetro, área e volume','Leitura de tabelas e gráficos','Estatística e probabilidade básica']
  }),
  modelo('CPOR/RJ — Exame Intelectual (modelo oficial 2018)', '2018', 'Formação militar — CPOR', 'https://www.cporrj.eb.mil.br/images/downloads/modeloprova2018.pdf', 'Modelo histórico oficial do CPOR/RJ: 40 itens (10 por disciplina) e redação. É referência de formato, não edital atual nem matriz nacional; confirme a seleção da sua unidade.', {
    'Língua Portuguesa':['Interpretação de textos','Gramática e norma escrita','Produção de redação'],
    'Matemática':['Aritmética e razão/proporção','Álgebra e equações','Geometria e medidas','Leitura de gráficos e problemas'],
    'Geografia':['Cartografia e localização','Geografia física do Brasil','População, economia e espaço brasileiro'],
    'História':['História do Brasil','Formação política e social brasileira','História geral conforme o edital local'],
    'Redação':['Planejamento e organização textual','Argumentação e clareza']
  }),
  modelo('NPOR/19º BC — seleção complementar (referência oficial 2022)', '2022', 'Formação militar — NPOR', 'https://19bc.eb.mil.br/images/Informativos/NPOR/1_Informativo__NPOR_FEV.pdf', 'Informativo oficial do 19º Batalhão confirma exame objetivo de Matemática, Português, Geografia e História, além de redação. A publicação não traz o programa detalhado; use como checklist-base e confirme o edital da unidade.', {
    'Matemática':['Aritmética, porcentagem e proporcionalidade','Álgebra e equações','Geometria e medidas','Interpretação de tabelas e gráficos'],
    'Língua Portuguesa':['Interpretação de textos','Gramática aplicada ao texto','Redação'],
    'Geografia':['Cartografia e orientação','Geografia do Brasil','População, economia e território'],
    'História':['História do Brasil','História geral e contemporânea'],
    'Redação':['Compreensão do tema','Organização de ideias e argumentação']
  })
]

export const linhasModelosEditais = modelosEditaisOficiais.flatMap(item => item.itens)
