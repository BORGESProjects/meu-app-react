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
  }),
  modelo('FUVEST/USP — Vestibular 2027', '2027', 'Universidade de São Paulo', 'https://www.fuvest.br/wp-content/uploads/fuvest2027-programa-vestibular.pdf', 'Programa oficial FUVEST 2027. A primeira fase tem 80 questões; a segunda fase varia conforme a carreira. Confira a lista vigente de leituras obrigatórias e o Guia de Provas.', {
    'Língua Portuguesa':['Interpretação, gêneros e efeitos de sentido','Norma-padrão, morfossintaxe e pontuação','Coesão, coerência e argumentação'],
    'Literatura':['Leitura das nove obras obrigatórias de 2027','Gêneros, escolas literárias e contexto histórico-cultural'],
    'Língua Inglesa':['Leitura e interpretação de textos','Vocabulário e recursos linguísticos em contexto'],
    'Matemática':['Números, álgebra e funções','Geometria, trigonometria e grandezas','Estatística, combinatória e probabilidade'],
    'Biologia':['Células, metabolismo e genética','Evolução, biodiversidade e fisiologia','Ecologia, saúde e ambiente'],
    'Física':['Mecânica e energia','Termologia, ondas e óptica','Eletricidade, magnetismo e física moderna'],
    'Química':['Matéria, estrutura e propriedades','Reações, estequiometria e soluções','Energia, equilíbrio e química orgânica'],
    'História':['Antiguidade, mundo medieval e moderno','Brasil: Colônia, Império e República','Mundo contemporâneo e relações internacionais'],
    'Geografia':['Cartografia e representações espaciais','Natureza, população e ambiente','Economia, território e geopolítica'],
    'Filosofia':['Conhecimento, ética e política','Filosofia antiga, moderna e contemporânea'],
    'Sociologia':['Cultura, sociedade e identidade','Trabalho, desigualdade, poder e cidadania'],
    'Arte e Educação Física':['Leitura de linguagens artísticas e patrimônio cultural','Práticas corporais, cultura e sociedade'],
    'Redação':['Leitura da proposta e planejamento','Tese, argumentação, coesão e revisão']
  }),
  modelo('UFRJ — Acesso 2026 via SiSU/ENEM', '2026', 'Universidade federal', 'https://acessograduacao.ufrj.br/periodo-2026-1/editais-acesso-2026', 'A UFRJ utiliza notas do ENEM/SiSU e, para alguns cursos, Teste de Habilidade Específica. Este modelo é um roteiro de preparação para o ENEM, não um vestibular próprio da UFRJ; consulte o edital e os pesos do curso escolhido.', {
    'Linguagens e suas Tecnologias':['Interpretação de textos verbais e multissemióticos','Gêneros, coesão, argumentação e variação linguística','Literatura, artes, cultura corporal e língua estrangeira'],
    'Matemática e suas Tecnologias':['Números, proporcionalidade e matemática financeira','Geometria, grandezas e medidas','Funções, álgebra e gráficos','Estatística, tabelas e probabilidade'],
    'Ciências da Natureza e suas Tecnologias':['Biologia celular, genética, evolução e ecologia','Física: mecânica, energia, ondas e eletricidade','Química: matéria, reações, soluções e equilíbrio'],
    'Ciências Humanas e Sociais Aplicadas':['História, cultura, cidadania e direitos','Geografia, território, cartografia e ambiente','Trabalho, economia, política e globalização','Filosofia, ética, sociologia e diversidade'],
    'Redação':['Compreensão do tema e do gênero dissertativo-argumentativo','Projeto de texto, repertório e argumentação','Coesão, norma escrita e proposta de intervenção']
  }),
  modelo('UFMG — SiSU 2026 (preparação ENEM)', '2026', 'Universidade federal', 'https://www.ufmg.br/sisu/edital/', 'A seleção regular da UFMG ocorre pelo SiSU com notas do ENEM. O roteiro acompanha as quatro áreas e a redação da matriz do Inep; pesos e notas mínimas variam por curso e estão no edital/termo de adesão da UFMG.', {
    'Linguagens e suas Tecnologias':['Leitura, interpretação e gêneros textuais','Língua portuguesa, literatura e variação linguística','Artes, educação física e língua estrangeira'],
    'Matemática e suas Tecnologias':['Aritmética, razão, proporção e porcentagem','Álgebra, funções e leitura de gráficos','Geometria, estatística e probabilidade'],
    'Ciências da Natureza e suas Tecnologias':['Biologia celular, genética, evolução e ecologia','Mecânica, termologia, ondas e eletricidade','Química geral, orgânica, soluções e reações'],
    'Ciências Humanas e Sociais Aplicadas':['História do Brasil e história geral','Geografia física, humana e cartografia','Filosofia, sociologia, cidadania e política'],
    'Redação':['Interpretação da proposta','Planejamento e desenvolvimento argumentativo','Coesão, norma escrita e revisão']
  }),
  modelo('UFRGS — Vestibular 2027', '2027', 'Universidade federal', 'https://www.ufrgs.br/coperse/concurso-vestibular/', 'Modelo para o Vestibular UFRGS 2027, conforme a página oficial da COPERSE e o programa de provas da edição. Inclui disciplinas objetivas e redação; consulte a lista oficial de leituras e eventuais retificações.', {
    'Língua Portuguesa':['Interpretação e análise linguística','Gêneros, coesão, sintaxe e semântica'],
    'Literatura em Língua Portuguesa':['Leitura das obras indicadas para 2027','Gêneros literários, escolas e análise textual'],
    'Língua Estrangeira':['Compreensão de textos no idioma escolhido','Vocabulário e estruturas em contexto'],
    'Matemática':['Aritmética, álgebra e funções','Geometria e trigonometria','Estatística, combinatória e probabilidade'],
    'Biologia':['Citologia, genética e evolução','Fisiologia, biodiversidade e ecologia'],
    'Física':['Mecânica e conservação','Termologia, ondas e óptica','Eletricidade e magnetismo'],
    'Química':['Estrutura da matéria e ligações','Estequiometria, soluções e equilíbrio','Química orgânica e transformações'],
    'História':['História antiga, medieval e moderna','História do Brasil','Mundo contemporâneo'],
    'Geografia':['Cartografia, natureza e ambiente','População, economia e espaço geográfico'],
    'Redação':['Leitura do tema','Organização, desenvolvimento e revisão do texto']
  }),
  modelo('PRF — Policial Rodoviário Federal 2021 (último edital)', '2021', 'Concurso público federal', 'https://www.gov.br/prf/pt-br/concurso-2021/etapa1/provas/edital-verticalizado-1.pdf', 'Referência do último edital de abertura da carreira policial localizado no portal oficial da PRF. Não há novo edital policial publicado no momento; confira atualizações oficiais antes de usar como edital vigente.', {
    'Língua Portuguesa':['Compreensão, interpretação e gêneros textuais','Ortografia, coesão e reescrita','Morfossintaxe, pontuação, concordância, regência e crase','Redação oficial'],
    'Raciocínio Lógico-Matemático':['Lógica proposicional e argumentação','Conjuntos, contagem e probabilidade','Razões, proporções e problemas quantitativos'],
    'Informática':['Sistemas operacionais e ferramentas de escritório','Redes, internet e segurança da informação'],
    'Física':['Grandezas, unidades e mecânica','Energia, movimento e fenômenos ondulatórios'],
    'Ética e Cidadania':['Ética no serviço público','Direitos humanos, cidadania e diversidade'],
    'Geopolítica Brasileira':['Território, população e dinâmica socioeconômica','Desenvolvimento, meio ambiente e espaço geográfico'],
    'Língua Estrangeira':['Compreensão de textos em inglês ou espanhol'],
    'Legislação de Trânsito':['Código de Trânsito Brasileiro e legislação correlata','Normas de circulação, conduta, sinalização e infrações'],
    'Direito Administrativo':['Administração pública, atos e poderes administrativos','Agentes públicos, responsabilidade e controle'],
    'Direito Constitucional':['Direitos e garantias fundamentais','Organização do Estado e segurança pública'],
    'Direito Penal e Processual Penal':['Teoria do crime, crimes em espécie e legislação penal','Inquérito, provas, prisão e procedimentos'],
    'Legislação Especial':['Legislação aplicada à atividade policial rodoviária federal']
  }),
  modelo('PF — Agente de Polícia Federal 2025', '2025', 'Concurso público federal', 'https://www.gov.br/pf/pt-br/acesso-a-informacao/servidores/concursos/edital/carreira-policial-2025/editais/edital-no-1_2025-dgp-pf.pdf', 'Baseado no edital oficial PF 2025 para Agente. O certame também teve outros cargos e conteúdos específicos próprios; este modelo não substitui os anexos dos cargos de Escrivão, Papiloscopista, Delegado ou Perito.', {
    'Língua Portuguesa':['Interpretação, tipologia e gêneros textuais','Coesão, coerência, sintaxe e reescrita'],
    'Raciocínio Lógico':['Lógica proposicional e argumentação','Conjuntos, contagem e probabilidade'],
    'Estatística':['Estatística descritiva e análise de dados','Probabilidade e distribuições'],
    'Informática':['Sistemas, redes e segurança da informação','Dados, bancos de dados e tecnologias digitais'],
    'Contabilidade Geral':['Patrimônio, contas e demonstrações contábeis','Escrituração e análise de balanços'],
    'Direito Administrativo':['Organização administrativa, atos e poderes','Agentes públicos, responsabilidade e licitações'],
    'Direito Constitucional':['Direitos fundamentais e organização do Estado','Administração pública e segurança pública'],
    'Direito Penal':['Princípios, aplicação da lei e teoria do delito','Crimes em espécie e legislação penal especial'],
    'Direito Processual Penal':['Inquérito policial, ação penal e competência','Provas, prisões, medidas cautelares e procedimentos'],
    'Legislação Especial':['Leis penais e normas indicadas no Anexo I do edital PF 2025'],
    'Direitos Humanos':['Sistemas de proteção e tratados aplicáveis','Direitos humanos na atividade policial']
  }),
  modelo('IBGE — Agente de Pesquisas e Mapeamento 2025', '2025', 'Processo seletivo federal', 'https://ftp.ibge.gov.br/edital/PSS_Censo_2022/PSS_Complementar_Censo_2022/01_2025/Edital%2001-2025-Retificado-em-07-02-2025.pdf', 'Programa do edital oficial retificado de 2025 para Agente de Pesquisas e Mapeamento. O IBGE possui seleções diferentes por função; este roteiro é especificamente para APM.', {
    'Língua Portuguesa':['Interpretação e compreensão','Gêneros, coesão, coerência e organização textual','Norma culta, sintaxe, pontuação e reescrita'],
    'Geografia':['Cartografia, orientação e representação espacial','Território brasileiro, população e regionalização','Espaço urbano e rural, economia e meio ambiente'],
    'Raciocínio Lógico-Matemático':['Números, operações e proporções','Porcentagem e resolução de problemas','Leitura de tabelas, gráficos e dados'],
    'Informática':['Noções de sistemas e ferramentas digitais','Internet, segurança e uso de aplicativos'],
    'Ética no Serviço Público':['Ética, deveres e conduta no serviço público','Código de Ética do IBGE']
  }),
  modelo('Banco do Brasil — Agente Comercial 2022', '2022', 'Concurso público — instituição financeira', 'https://www.bb.com.br/docs/portal/dipes/EditalSelExtern2022001.pdf', 'Seleção Externa 2022/001, edital oficial do Banco do Brasil. É uma referência histórica; o próprio BB informa que esse foi seu último concurso externo divulgado. Conteúdo do Agente Comercial, não do Agente de Tecnologia.', {
    'Língua Portuguesa':['Compreensão, interpretação e tipologia textual','Ortografia, gramática, pontuação e reescrita'],
    'Língua Inglesa':['Vocabulário fundamental e gramática para compreensão de textos'],
    'Matemática':['Números, proporção, porcentagem e medidas','Funções, equações e matemática financeira','Contagem, probabilidade e estatística básica'],
    'Atualidades do Mercado Financeiro':['Sistema financeiro, bancos e meios de pagamento','Transformação digital, fintechs e open finance'],
    'Conhecimentos Bancários':['Sistema Financeiro Nacional e produtos bancários','Mercado de crédito, câmbio, capitais e seguros'],
    'Informática':['Segurança digital, internet e ferramentas de escritório'],
    'Vendas e Negociação':['Atendimento, relacionamento e experiência do cliente','Técnicas de vendas, negociação e ética comercial']
  }),
  modelo('ESA — CFGS Área Geral (matrícula 2026)', '2026', 'Concurso militar — Exército', 'https://concursocfgs.esa.eb.mil.br/', 'Referência para o concurso de admissão aos Cursos de Formação e Graduação de Sargentos, Área Geral, regido pelo edital de 2025 para matrícula em 2026. O edital anual pode alterar matérias e pesos; consulte a página oficial da ESA.', {
    'Língua Portuguesa':['Interpretação de textos e gêneros','Gramática, sintaxe, pontuação e literatura'],
    'Matemática':['Números, álgebra e funções','Geometria, trigonometria e medidas','Análise combinatória e probabilidade'],
    'Língua Inglesa':['Interpretação de textos','Vocabulário e estruturas gramaticais'],
    'História do Brasil':['Brasil Colônia, Império e República','Formação política e conflitos históricos'],
    'Geografia do Brasil':['Território, população e regionalização','Economia, urbanização e meio ambiente'],
    'Redação':['Compreensão do tema','Estrutura dissertativo-argumentativa e norma escrita']
  }),
  modelo('EsPCEx — Concurso de Admissão 2026/2027', '2026', 'Concurso militar — Exército', 'https://www.vunesp.com.br/EPCE2601', 'Concurso de Admissão à EsPCEx 2026/27, com documentos e prova publicados pela organizadora oficial VUNESP. Roteiro baseado nas matérias do exame intelectual; consulte o edital e suas retificações.', {
    'Língua Portuguesa':['Interpretação e análise de textos','Gramática, sintaxe, literatura e redação'],
    'Matemática':['Álgebra, funções e equações','Geometria, trigonometria e geometria analítica','Combinatória, probabilidade e estatística'],
    'Física':['Mecânica, energia e gravitação','Termologia, ondas e óptica','Eletricidade e magnetismo'],
    'Química':['Estrutura da matéria e tabela periódica','Ligações, reações, estequiometria e soluções','Química orgânica e equilíbrio'],
    'História':['História geral e mundo contemporâneo','História do Brasil e formação nacional'],
    'Geografia':['Geografia física, cartografia e ambiente','Geografia humana, econômica e do Brasil'],
    'Língua Inglesa':['Interpretação de textos','Vocabulário e estruturas em contexto'],
    'Redação':['Planejamento e desenvolvimento do texto','Argumentação, coesão e norma escrita']
  }),
  modelo('PMESP/APMBB — Cadete PM 2026', '2026', 'Concurso militar estadual — São Paulo', 'https://concursos.policiamilitar.sp.gov.br/concursos/edital-dp-2-321-26-concurso-para-cadete-pm/', 'Edital oficial DP-2/321/26 para Cadete PM, curso realizado na Academia de Polícia Militar do Barro Branco. O programa inclui componentes do ensino médio e conhecimentos específicos de administração pública e informática; confirme o edital completo.', {
    'História':['Antiguidade, mundo medieval e moderno','Mundo contemporâneo e história do Brasil'],
    'Sociologia':['Cultura, diversidade e desigualdades','Trabalho, violência, cidadania e organização política'],
    'Geografia':['Sociedade, natureza e recursos naturais','Economia mundial, população e espaço brasileiro'],
    'Língua Portuguesa':['Norma ortográfica e morfossintaxe','Interpretação, coesão, pontuação e significação','Literatura brasileira e portuguesa'],
    'Língua Inglesa e Língua Espanhola':['Compreensão global e específica de textos','Vocabulário e elementos linguísticos em contexto'],
    'Matemática':['Conjuntos, números e sequências','Polinômios, equações e funções','Estatística, combinatória e probabilidade','Matrizes, sistemas, geometria e trigonometria'],
    'Física':['Movimentos, leis de Newton e energia','Termologia e eletricidade'],
    'Química':['Matéria, átomos e tabela periódica','Ligações, funções inorgânicas e reações'],
    'Biologia':['Classificação e diversidade dos seres vivos','Plantas, animais e fundamentos de biologia'],
    'Noções de Administração Pública':['Constituição Federal e Constituição do Estado de São Paulo','Administração pública, servidores e segurança pública','Acesso à informação'],
    'Noções Básicas de Informática':['Windows e aplicativos de escritório','Word, Excel, arquivos e ferramentas digitais']
  }),
  modelo('CPOR/BH — Seleção Complementar 2027 (ficha de orientação)', '2027', 'Formação militar — CPOR/BH', '', 'Transcrito da ficha de orientação enviada pelo usuário. É um roteiro de estudo da unidade para 2027; confirme a versão vigente com o CPOR/BH antes de usar como edital oficial.', {
    'História do Brasil':['Invasões holandesas na América Portuguesa','Economia mineradora no Brasil colonial','Revoltas nativistas nos séculos XVII e XVIII','Constituições brasileiras de 1824 e 1891','Leis sobre a escravidão no Império do Brasil','Período Regencial','Evolução da economia brasileira no século XIX e produtos de exportação','Conflitos da Primeira República: Revolta da Armada, Revolução Federalista, Canudos, Contestado, Chibata, Vacina, Cangaço e Tenentismo','Estado Novo e governo Getúlio Vargas'],
    'Geografia':['Categorias geográficas','Orientação geográfica','Elementos do mapa','Escala cartográfica','Leitura de mapas','Elementos, fatores e fenômenos climáticos','Bacias hidrográficas','Energia renovável e não renovável','Conferências do Meio Ambiente','População brasileira','Agropecuária do Brasil','Modais de transporte do Brasil'],
    'Matemática':['Teoria dos conjuntos','Trigonometria no triângulo retângulo','Função do primeiro grau','Função exponencial','Logaritmos','Progressão aritmética','Geometria espacial','Probabilidade','Geometria plana','Regra de três simples e composta'],
    'Língua Portuguesa':['Interpretação de textos multimodais, efeitos de sentido, humor, escolhas lexicais e figuras de linguagem','Classes de palavras','Frase, oração e período','Termos da oração','Período simples e composto por coordenação e subordinação','Crase','Acordo Ortográfico da Língua Portuguesa'],
    'Produção Textual':['Domínio da modalidade formal escrita','Macro e microestrutura do texto dissertativo-argumentativo','Coesão, coerência e progressão textual']
  }),
  modelo('CPOR/NPOR — Roteiro de estudos geral (ficha sem unidade e ano)', '', 'Formação militar — referência não identificada', '', 'Conteúdos transcritos de ficha enviada pelo usuário sem cabeçalho de unidade, edição ou fonte oficial. Use como roteiro auxiliar e confirme o programa com o CPOR/NPOR escolhido.', {
    'Geografia':['Noções espaciais e cartografia','Complexos regionais brasileiros','Fluxos migratórios internacionais','Blocos internacionais de poder','Infraestrutura no Brasil','Fontes de energia','Industrialização e urbanização no Brasil','Movimentos migratórios no Brasil','Problemas e questões ambientais globais','Hidrografia do Brasil'],
    'História do Brasil':['Colonização do Brasil','Sistema escravista','Independência do Brasil','Período Regencial','Primeiro e Segundo Reinados','Guerra do Paraguai','Primeira República','Estado Novo','Segunda Guerra Mundial','Industrialização brasileira','Força Expedicionária Brasileira','Guerra Fria'],
    'Língua Portuguesa':['Morfologia e classes gramaticais','Acentuação gráfica e crase','Ortografia','Estrutura e formação das palavras','Concordância verbal e nominal','Pontuação','Interpretação textual','Regência verbal','Redação: tema da atualidade, apresentação, coesão, gramática e adequação ao tema'],
    'Matemática':['Análise combinatória e probabilidade','Raciocínio lógico','Geometria plana e espacial','Porcentagem','Progressões aritmética e geométrica','Geometria analítica','Ângulos','Funções elementares e aritmética','Funções trigonométricas','Números e medidas']
  }),
  modelo('CPOR/NPOR — Roteiro ampliado (ficha sem unidade e ano)', '', 'Formação militar — referência não identificada', '', 'Roteiro transcrito de ficha enviada pelo usuário. A ficha não identifica unidade, edição nem caráter oficial; confira o programa local antes de estudar por esta lista.', {
    'Matemática':['Noções de conjuntos','Conjunto dos números','Funções','Funções linear, afim e quadrática','Função modular','Função exponencial','Função logarítmica','Trigonometria','Contagem e análise combinatória','Probabilidade','Matrizes, determinantes e sistemas lineares','Sequências numéricas e progressões','Geometria espacial de posição','Geometria espacial métrica','Geometria analítica plana','Geometria plana','Polinômios','Equações polinomiais','Noções de lógica'],
    'Língua Portuguesa':['Leitura, interpretação e análise de textos','Fonética, ortografia e pontuação','Morfologia','Morfossintaxe','Noções de versificação','Teoria da linguagem e semântica','Introdução à literatura','Literatura brasileira','Redação'],
    'História':['Povos indígenas brasileiros','Período pré-colonial e Brasil Colônia','Consolidação territorial','Rebeliões nativistas','Movimentos pró-independência','Período Joanino','Independência do Brasil','Primeiro Reinado','Período Regencial','Segundo Reinado','Primeira República','Era Vargas','República entre 1945 e 1985','Nova República a partir de 1985'],
    'Geografia':['Espaço natural, recursos estratégicos e impactos ambientais','Espaço econômico','Espaço político','Espaço humano']
  })
]

export const linhasModelosEditais = modelosEditaisOficiais.flatMap(item => item.itens)
