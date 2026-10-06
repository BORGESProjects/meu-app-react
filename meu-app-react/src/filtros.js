export const TODOS = '__todos__'

export function limparValorFiltro(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ')
}

export function chaveFiltro(valor) {
  return limparValorFiltro(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

const BANCAS_CANONICAS = new Map([
  ['acafe', 'ACAFE'], ['afa', 'AFA'], ['cfn', 'CFN'], ['cftce', 'CFTCE'], ['cftmg', 'CFTMG'],
  ['cm', 'Colégio Militar'], ['cmrj', 'CMRJ'],
  ['colegio naval', 'Colégio Naval'], ['cpor', 'CPOR'], ['cpor/sp', 'CPOR'], ['cpor-sp', 'CPOR'], ['cpor sp', 'CPOR'],
  ['eam', 'EAM'], ['eear', 'EEAR'], ['efomm', 'EFOMM'], ['efomm 2019', 'EFOMM'], ['enem', 'ENEM'],
  ['epcar', 'EPCAR'], ['esa', 'ESA'], ['esc. naval', 'Escola Naval'], ['escola naval', 'Escola Naval'],
  ['esfcex', 'EsFCEx'], ['espcex', 'EsPCEx'], ['espm', 'ESPM'], ['fgv', 'FGV'], ['fn', 'CFN'],
  ['fuzileiro naval', 'CFN'], ['fuzileiros navais', 'CFN'], ['fuvest', 'FUVEST'], ['ifal', 'IFAL'],
  ['ifpe', 'IFPE'], ['ifsc', 'IFSC'], ['ifsul', 'IFSUL'], ['ime', 'IME'], ['inedita', 'Questões inéditas'],
  ['insper', 'Insper'], ['ita', 'ITA'], ['pucrj', 'PUC-Rio'], ['puc-rio', 'PUC-Rio'], ['pucrs', 'PUCRS'],
  ['smv', 'SMV'], ['udesc', 'UDESC'], ['uece', 'UECE'], ['uefs', 'UEFS'], ['uepb', 'UEPB'], ['uern', 'UERN'],
  ['uespi', 'UESPI'], ['ufc', 'UFC'], ['ufg', 'UFG'], ['ufjf', 'UFJF'], ['ufpr', 'UFPR'], ['ufrgs', 'UFRGS'],
  ['ufu', 'UFU'], ['unesp', 'UNESP'], ['unicamp', 'UNICAMP'], ['upf', 'UPF'], ['utfpr', 'UTFPR'],
  ['exercicio', 'Questões de estudo'],
])

const BANCAS_INVALIDAS = new Set(['g', 'esc', 'fac', 'fonte nao informada'])

export function normalizarBanca(valor, concurso = '') {
  const original = limparValorFiltro(valor)
  const chave = chaveFiltro(original)
  const chaveConcurso = chaveFiltro(concurso)
  if (!chave || BANCAS_INVALIDAS.has(chave)) return ''
  if (chave === 'marinha' && /\bsmv\b/.test(chaveConcurso)) return 'SMV'
  if (chave === 'estrategia militares') {
    if (/espcex/.test(chaveConcurso)) return 'EsPCEx'
    if (/\besa\b/.test(chaveConcurso)) return 'ESA'
    if (/\beear\b/.test(chaveConcurso)) return 'EEAR'
    if (/fuzileir/.test(chaveConcurso)) return 'CFN'
    if (/\beam\b/.test(chaveConcurso)) return 'EAM'
    if (/\bcn\b|colegio naval/.test(chaveConcurso)) return 'Colégio Naval'
    if (/inedit|questao inedita/.test(chaveConcurso)) return 'Questões inéditas'
  }
  return BANCAS_CANONICAS.get(chave) || original
}

export function normalizarMateria(valor, conteudo = '') {
  const original = limparValorFiltro(valor)
  const chave = chaveFiltro(original)
  const chaveConteudo = chaveFiltro(conteudo)
  if (/^fisica$/.test(chave) && /potenciacao|radiciacao|produtos? notaveis?|fatoracao|fracoes?/.test(chaveConteudo)) return 'Matemática'
  if (/^(?:lingua )?portuguesa?$|^portugues$/.test(chave)) return 'Português'
  if (/^(?:lingua )?inglesa?$|^ingles$/.test(chave)) return 'Inglês'
  if (/^(?:lingua )?espanhola?$|^espanhol$/.test(chave)) return 'Espanhol'
  const canonicas = new Map([
    ['matematica', 'Matemática'], ['fisica', 'Física'], ['quimica', 'Química'],
    ['historia', 'História'], ['geografia', 'Geografia'], ['biologia', 'Biologia'],
    ['filosofia', 'Filosofia'], ['sociologia', 'Sociologia'], ['literatura', 'Literatura'],
  ])
  return canonicas.get(chave) || original
}

export function chaveCampoFiltro(campo, valor) {
  const chave = chaveFiltro(campo === 'banca' ? normalizarBanca(valor) : valor)
  if (campo === 'dificuldade' && chave === 'medio') return 'media'
  return chave
}

const gruposConteudo = [
  ['Interpretação de textos', /interpretacao|compreensao|leitura|inferenc|tese|pressupost|parafrase/],
  ['Gêneros e funções da linguagem', /genero|funcao da linguagem|teoria da linguagem|linguagem verbal|tipologia textual|tipos? de discurso|finalidade do texto/],
  ['Coesão, coerência e argumentação', /coesao|coerencia|argument|conectiv|operadores discursivos|progressao textual/],
  ['Semântica e vocabulário', /semant|sentido|signific|sinonim|antonim|polissem|vocabulario|lexico/],
  ['Figuras de linguagem e estilística', /figuras? de linguagem|estilistic|recursos expressivos|ironia|metalinguagem/],
  ['Fonética, ortografia e acentuação', /fonetic|fonolog|ortograf|acentua|silab|hiato|ditongo|encontro consonantal/],
  ['Morfologia e classes de palavras', /morfolog|classes? de palavras?|substantiv|adjetiv|pronome|artigo|numerais?|adverb|preposic|conjunc|verbo|conjugacao verbal|tempos? verbais|palavras denotativas|colocacao pronominal|formacao de palavra|estrutura e formacao/],
  ['Sintaxe e análise sintática', /sintax|sintat|orac(?:ao|oes)|periodo composto|termos da oracao|sujeito|predicado|predicativ|complemento nominal|adjunto|aposto|vocativo/],
  ['Variação linguística', /variacao linguistica/],
  ['Concordância verbal e nominal', /concordancia/],
  ['Regência e crase', /regencia|crase/],
  ['Pontuação', /pontuacao|virgula/],
  ['Literatura brasileira e portuguesa', /literatura|romantismo|realismo|modernismo|simbolismo|parnasianismo|barroco|arcadismo|quinhentismo|maneirismo|machado de assis/],
  ['Aritmética e números', /aritmet|numero(?:s)? (?:natural|inteiro|racional|real|primo)|divisibilidade|mdc|mmc|frac(?:ao|oes)|razao|proporc|potenciacao|sistema decimal|porcentagem|regra de tres|expressoes numericas/],
  ['Álgebra, equações e inequações', /algebr|equac|inequac|sistemas? lineares?|binomio de newton|expressoes algebricas/],
  ['Funções e gráficos', /funcao|funcoes|dominio de funcao|grafico de funcao/],
  ['Logaritmos e exponenciais', /logarit|exponencial/],
  ['Geometria plana', /geometria plana|geometria e medidas|area de figuras|areas e unidades|triangulo|quadrilatero|poligono|circunferencia|circulo|teorema de tales|pitagor|semelhanca/],
  ['Geometria espacial', /geometria espacial|prisma|piramide|cilindro|cone|esfera|paralelepipedo|volume/],
  ['Geometria analítica', /geometria analitica|equacao da reta|distancia entre pontos|baricentro|plano cartesiano/],
  ['Trigonometria', /trigonom|seno|cosseno|tangente/],
  ['Probabilidade e análise combinatória', /probabilidade|combinator|permutac|arranjo|principio multiplicativo|contagem/],
  ['Estatística e análise de dados', /estatistic|media aritmetica|media ponderada|mediana|moda|frequencia|analise de dados/],
  ['Matrizes e determinantes', /matri(?:z|zes)|determinante/],
  ['Sequências e progressões', /progressao|sequencia|pa e pg/],
  ['Matemática financeira', /matematica financeira|juros|desconto|capitalizacao/],
  ['Conjuntos e lógica', /conjunto|logica proposicional|diagrama de venn/],
  ['Cinemática', /cinematica|movimento uniforme|mruv|lancamento vertical|lancamento obliquo/],
  ['Dinâmica, trabalho e energia', /dinamica|leis? de newton|trabalho e energia|forca centripeta|impulso|quantidade de movimento|colis/],
  ['Estática e hidrostática', /estatica|hidrostat|empuxo|principio de pascal|equilibrio de corpos/],
  ['Termologia e termodinâmica', /termolog|termodinam|calorimetr|dilatacao|temperatura|gases/],
  ['Ondas e acústica', /ondulator|onda|acustica|efeito doppler|nivel sonoro/],
  ['Óptica', /optica|espelho|lente|refracao|reflexao da luz/],
  ['Eletricidade e circuitos', /eletrostat|eletrodinam|circuito|corrente eletrica|resistencia eletrica|capacitor|gerador|kirchhoff/],
  ['Eletromagnetismo', /eletromagnet|campo magnetico|inducao eletromagnetica|carga em campo magnetico/],
  ['Gravitação', /gravitacao|gravitacional|leis? de kepler/],
  ['Física moderna', /fisica moderna|efeito fotoeletrico|quantica|relatividade|reacao nuclear|radioatividade|fotons/],
  ['Cartografia, escalas e fusos', /cartograf|escala|coordenada geografica|fuso horario|projecao cartografica/],
  ['Clima e atmosfera', /clima|climatolog|massa de ar|inversao termica|anomalia climatica/],
  ['Biomas e vegetação', /bioma|vegetacao|amazonia|caatinga|cerrado|mata atlantica|araucaria|morfoclimatico/],
  ['Relevo, geologia e solos', /geomorfolog|geolog|relevo|solo|tecton|vulcan|tsunami/],
  ['Hidrografia', /hidrograf|bacia hidro|rio|aguas subterraneas|aquifero/],
  ['População e demografia', /demograf|populac|migrac|exodo rural|transicao demografica/],
  ['Urbanização', /urbaniz|geografia urbana|cidade|rede urbana/],
  ['Espaço agrário e agropecuária', /agrar|agricultur|agropecuar|estrutura fundiaria|pecuaria/],
  ['Indústria, trabalho e economia', /industriali|industria|trabalho|economia|mercado de trabalho|infraestrutura economica/],
  ['Globalização e geopolítica', /globaliz|geopolit|bloco economico|mercosul|territorio e estado|hegemonia/],
  ['Energia e recursos naturais', /energia|matriz energetica|recurso mineral|petroleo/],
  ['Meio ambiente', /meio ambiente|ambiental|desmatamento|queimada|biodiversidade|sustentabilidade|poluicao/],
  ['Brasil Colônia', /brasil colonia|colonial|capitania|governo-geral|acucareira|bandeira|entrada|invasao holandesa|invasao francesa|pau-brasil/],
  ['Brasil Império', /brasil imperio|imperial|primeiro reinado|segundo reinado|regencial|regencia|constituicao de 1824|guerra do paraguai|abolici|escravidao/],
  ['Brasil República', /brasil republica|republica brasileira|era vargas|estado novo|governo (?:dutra|collor|fhc|figueiredo|geisel|itamar|janio|juscelino|medici|sarney)|plano real|ditadura militar|regime militar/],
  ['Revoltas e independência do Brasil', /independencia do brasil|inconfidencia|conjuracao|confederacao do equador|balaiada|revolta/],
  ['História Antiga', /antiguidade|grecia antiga|roma antiga|egito antigo|mesopotamia/],
  ['Idade Média', /idade media|medieval|feudal/],
  ['Idade Moderna', /idade moderna|renascimento|reforma protestante|absolutismo|mercantilismo|expansao maritima|iluminismo/],
  ['Idade Contemporânea', /idade contemporanea|revolucao francesa|revolucao industrial|imperialismo|guerra mundial|guerra fria|nazifascismo/],
  ['Ecologia e meio ambiente', /ecolog|cadeia alimentar|relacao ecologica|ciclo biogeoquimico|especie exotica|controle biologico/],
  ['Citologia e bioquímica', /citolog|celul|organel|bioquim|enzim|osmose|membrana plasmatica/],
  ['Genética e biotecnologia', /genetic|hereditar|dna|rna|biotecnolog|pcr|terapia genica/],
  ['Evolução', /evolucao|selecao natural|darwin/],
  ['Fisiologia e anatomia humana', /fisiolog|anatom|hormon|sistema (?:digestorio|respiratorio|circulatorio|nervoso)|coagulacao|visao/],
  ['Botânica', /botan|vegetal|fotossintese/],
  ['Zoologia', /zoolog|animal|invertebrado|vertebrado/],
  ['Microbiologia e imunologia', /microbiolog|imunolog|virus|bacteria|fungo|protozo/],
  ['Química geral e estrutura atômica', /estrutura atomica|atomo|tabela periodica|ligacao quimica|quimica geral/],
  ['Estequiometria e soluções', /estequiometr|\bsolucoes?\b|concentracao|diluicao|mistura/],
  ['Físico-química', /termoquim|cinetica quimica|equilibrio quimico|eletroquim|pilha|corrosao/],
  ['Química orgânica', /organica|hidrocarboneto|funcao organica|isomer|polimero/],
  ['Ácidos, bases e pH', /acido|base|ph|ionizacao/],
  ['Gramática inglesa', /grammar|gramatica|articles|conditionals|comparatives|superlatives|word order|verb tense|modal|preposition|gerund|infinitive/],
  ['Interpretação em língua estrangeira', /comic strip|ingles|espanhola|spanish|english|foreign language/],
  ['Filosofia', /filosof|estoic|arendt|maquiavel|sofista|conhecimento sensivel/],
  ['Sociologia e cidadania', /sociolog|cidadania|desigualdade|cultura e saberes|estado de direito|interseccionalidade/],
  ['Artes e linguagens visuais', /arte|linguagens visuais|ready-made|instalacao/],
]

const gruposConteudoPrioritarios = [
  ['Concordância verbal e nominal', /concordancia/],
  ['Regência e crase', /regencia|crase/],
  ['Pontuação', /pontuacao|virgula/],
  ['Matemática financeira', /matematica financeira|juros|desconto|capitalizacao/],
  ['Logaritmos e exponenciais', /logarit|exponencial/],
  ['Geometria analítica', /geometria analitica|equacao da reta|distancia entre pontos|baricentro|plano cartesiano/],
  ['Geometria espacial', /geometria espacial|prisma|piramide|cilindro|cone|esfera|paralelepipedo|volume/],
]

const gruposQuimica = [
  ['Termoquímica', /termoquim|entalpia|lei de hess|calor de (?:formacao|combustao|reacao)|energia de ligacao|reacao (?:exo|endo)termica|exoterm|endoterm/],
  ['Equilíbrio iônico', /equilibrio ionico|produto de solubilidade|\bkps\b|solucao tampao|hidrolise salina|\bph\b|\bpoh\b|\bka\b|\bkb\b|acido (?:forte|fraco)|base (?:forte|fraca)|ionizacao de acidos/],
  ['Equilíbrio químico', /equilibrio quimico|principio de le chatelier|le chatelier|constante de equilibrio|\bkc\b|\bkp\b|deslocamento do equilibrio/],
  ['Cinética química', /cinetica quimica|velocidade da reacao|energia de ativacao|ordem da reacao|lei de velocidade|catalisador/],
  ['Eletroquímica', /eletroquim|pilha|eletrolise|eletrodo|potencial (?:padrao|de reducao)|corrosao|celula galvanica|oxidacao e reducao|oxirreducao|numero de oxidacao|\bnox\b/],
  ['Soluções', /\bsolucoes?\b|concentracao (?:comum|molar)|molaridade|molalidade|diluicao|solubilidade|mistura de solucoes|titulo em massa/],
  ['Estequiometria', /estequiometr|calculo estequiometrico|rendimento da reacao|reagente limitante|pureza de reagente|volume molar/],
  ['Química orgânica', /quimica organica|hidrocarbon|funcao organica|isomer|polimero|cadeia carbonica|nomenclatura organica|reacao organica|\balcool|aldeido|cetona|\bester\b|\beter\b|\bfenol|\bamina|\bamida/],
  ['Funções inorgânicas', /funcoes? inorganicas?|acidos?, bases?, sais?|oxidos?|nomenclatura inorganica/],
  ['Reações químicas', /reacoes? quimicas?|balanceamento|equacao quimica|reacao de (?:sintese|decomposicao|deslocamento|dupla troca)/],
  ['Ligações químicas', /ligacoes? quimicas?|ligacao (?:ionica|covalente|metalica)|geometria molecular|polaridade|forcas? intermoleculares?|hibridizacao/],
  ['Atomística e tabela periódica', /atomistic|estrutura atomica|tabela periodica|propriedade periodica|modelo atomico|distribuicao eletronica|configuracao eletronica|numero (?:atomico|de massa)|isotop/],
  ['Matéria, misturas e separação', /materia e transform|misturas?|separacao de misturas|mudancas? de estado|estado fisico|substancia (?:simples|composta|pura)|propriedades? da materia/],
  ['Gases', /estudo dos gases|lei dos gases|equacao de clapeyron|gas ideal|transformacao (?:isotermica|isobarica|isocorica)/],
  ['Propriedades coligativas', /propriedades? coligativas?|tonoscopia|ebulioscopia|crioscopia|osmoscopia|pressao osmotica/],
  ['Radioatividade', /radioativ|decaimento nuclear|meia-vida|fissao nuclear|fusao nuclear|emissao alfa|emissao beta/],
]

function grupoQuimica(valor, contexto = '') {
  const texto = `${chaveFiltro(valor)} ${chaveFiltro(contexto)}`
  const grupo = gruposQuimica.find(([, padrao]) => padrao.test(texto))
  const label = grupo?.[0] || 'Fundamentos de Química'
  return { value: chaveFiltro(label), label }
}

const classificadoresMateria = [
  {
    materia: /matematica/,
    fallback: 'Fundamentos de Matemática',
    grupos: [
      ['Logaritmos e exponenciais', /logarit|exponencial/],
      ['Geometria analítica', /geometria analitica|equacao da reta|distancia entre pontos|plano cartesiano|conicas?/],
      ['Geometria espacial', /geometria espacial|prisma|piramide|cilindro|cone|esfera|paralelepipedo|volume de solido/],
      ['Geometria plana', /geometria plana|poligono|triangulo|quadrilatero|circunferencia|circulo|teorema de tales|pitagor|semelhanca|area de figur/],
      ['Trigonometria', /trigonom|seno|cosseno|tangente/],
      ['Probabilidade e análise combinatória', /probabilidade|combinator|permutac|arranjo|principio multiplicativo|contagem/],
      ['Estatística e análise de dados', /estatistic|media aritmetica|media ponderada|mediana|moda|frequencia|desvio padrao|analise de dados/],
      ['Matrizes e determinantes', /matri(?:z|zes)|determinante/],
      ['Sequências e progressões', /progressao|sequencia|\bpa\b|\bpg\b/],
      ['Matemática financeira', /matematica financeira|juros|desconto|capitalizacao/],
      ['Números complexos', /numeros? complexos?|plano de argand/],
      ['Polinômios', /polinom/],
      ['Conjuntos e lógica', /teoria (?:elementar )?dos conjuntos|conjuntos? numericos?|logica proposicional|diagrama de venn/],
      ['Funções e gráficos', /funcoes?|funcao (?:afim|quadratica|modular)|dominio|imagem de uma funcao|grafico/],
      ['Álgebra, equações e inequações', /algebr|equac|inequac|sistema linear|binomio de newton|produtos? notaveis?|fatoracao|radiciacao|potenciacao/],
      ['Aritmética, medidas e proporcionalidade', /aritmet|sistema metrico|fracoes?|divisibilidade|\bmdc\b|\bmmc\b|razao|proporc|porcentagem|regra de tres|unidades? de medida/],
    ],
  },
  {
    materia: /fisica/,
    fallback: 'Fundamentos de Física',
    grupos: [
      ['Cinemática', /cinematica|movimento uniforme|movimento uniformemente variado|\bmru\b|\bmruv\b|lancamento (?:vertical|obliquo)|movimento circular/],
      ['Dinâmica, trabalho e energia', /dinamica|leis? de newton|trabalho,? energia|energia (?:cinetica|potencial|mecanica)|potencia mecanica|impulso|quantidade de movimento|colis/],
      ['Estática e hidrostática', /estatica|hidrostat|empuxo|principio de pascal|equilibrio de corpos|momento de uma forca/],
      ['Gravitação', /gravitacao|gravitacional|leis? de kepler/],
      ['Termologia e termodinâmica', /termolog|termodinam|calorimetr|dilatacao|temperatura|gases?|transformacao termica/],
      ['Ondas e acústica', /ondulator|ondas?|acustica|efeito doppler|nivel sonoro/],
      ['Óptica', /optica|espelho|lentes?|refracao|reflexao da luz/],
      ['Eletrostática', /eletrostat|lei de coulomb|campo eletrico|potencial eletrico/],
      ['Eletricidade e circuitos', /eletrodinam|eletricidade|circuito|corrente eletrica|resistencia eletrica|capacitor|gerador|receptor|kirchhoff/],
      ['Eletromagnetismo', /eletromagnet|magnetismo|campo magnetico|inducao eletromagnetica/],
      ['Física moderna', /fisica moderna|efeito fotoeletrico|quantica|relatividade|reacao nuclear|radioatividade|fotons/],
      ['Mecânica', /mecanica/],
    ],
  },
  {
    materia: /historia/,
    fallback: 'Fundamentos de História',
    grupos: [
      ['Brasil Colônia', /brasil colonia|colonial|periodo pre-colonial|capitania|governo-geral|acucareira|mineracao|entradas? e bandeiras?|invasoes? (?:holandesas?|francesas?)|pau-brasil|sistema colonial/],
      ['Independência e Brasil Império', /independencia do brasil|periodo joanino|brasil imperio|primeiro reinado|segundo reinado|periodo regencial|regenciais|constituicao de 1824|guerra do paraguai|abolicion|escravidao/],
      ['Brasil República', /brasil republica|republica brasileira|primeira republica|era vargas|estado novo|ditadura militar|regime militar|governo (?:dutra|collor|fhc|figueiredo|geisel|itamar|janio|juscelino|medici|sarney)|plano real|constituicao de 1988/],
      ['Revoltas e movimentos sociais no Brasil', /revoltas?|inconfidencia|conjuracao|confederacao do equador|balaiada|cabanagem|farroupilha|canudos|contestad/],
      ['História Antiga', /antiguidade|grecia antiga|roma antiga|egito antigo|mesopotamia/],
      ['Idade Média', /idade media|medieval|feudal|cruzadas/],
      ['Idade Moderna', /idade moderna|renascimento|reforma protestante|absolutismo|mercantilismo|expansao maritima|iluminismo/],
      ['Idade Contemporânea', /idade contemporanea|revolucao francesa|revolucao industrial|imperialismo|guerra mundial|guerra fria|nazifascismo|socialismo|revolucao russa/],
      ['História da América', /historia da america|america (?:espanhola|latina)|independencia dos estados unidos|revolucao americana|civilizacoes? pre-colombianas?/],
      ['História da África e da Ásia', /historia da africa|historia da asia|africa pre-colonial|descolonizacao afro-asiatica/],
    ],
  },
  {
    materia: /geografia/,
    fallback: 'Fundamentos de Geografia',
    grupos: [
      ['Cartografia, escalas e fusos', /cartograf|escala|coordenada geografica|fusos? horarios?|projecao cartografica/],
      ['Clima e atmosfera', /clima|climatolog|massa de ar|frentes?|precipitac|tipos? de chuva|inversao termica|anomalia climatica/],
      ['Biomas e vegetação', /bioma|vegetacao|floresta amazonica|amazonia|caatinga|cerrado|mata atlantica|araucaria|morfoclimatico/],
      ['Relevo, geologia e solos', /geomorfolog|geolog|relevo|solos?|tecton|vulcan|tsunami/],
      ['Hidrografia', /hidrograf|bacia hidro|\brios?\b|aguas subterraneas|aquifero/],
      ['População e demografia', /demograf|populac|migrac|exodo rural|transicao demografica/],
      ['Urbanização', /urbaniz|geografia urbana|cidades?|rede urbana/],
      ['Espaço agrário e agropecuária', /agrar|agricultur|agropecuar|estrutura fundiaria|pecuaria|fronteira agricola|sojicultura/],
      ['Indústria, trabalho e economia', /industriali|industria|mercado de trabalho|geografia economica|infraestrutura economica/],
      ['Globalização e geopolítica', /globaliz|geopolit|bloco economico|mercosul|hegemonia|ordem mundial/],
      ['Energia e recursos naturais', /energia|matriz energetica|recurso mineral|petroleo/],
      ['Meio ambiente', /meio ambiente|ambiental|desmatamento|queimada|sustentabilidade|poluicao|degradacao/],
      ['Território e regiões do Brasil', /formacao territorial|fronteiras? do territorio|regiao (?:norte|nordeste|centro-oeste|sudeste|sul)|regionalizacao|integracao regional/],
      ['Transportes e redes', /transportes?|integracao intermodal|rede de transportes|logistica/],
    ],
  },
  {
    materia: /(?:lingua )?portuguesa?|portugues/,
    fallback: 'Fundamentos de Língua Portuguesa',
    grupos: [
      ['Interpretação de textos', /interpretacao|compreensao|leitura|inferenc|tese|pressupost|parafrase/],
      ['Gêneros e funções da linguagem', /genero|funcao da linguagem|teoria da linguagem|tipologia textual|tipos? de discurso|finalidade do texto/],
      ['Coesão, coerência e argumentação', /coesao|coerencia|argument|conectiv|operadores discursivos|progressao textual/],
      ['Semântica e vocabulário', /semant|sentido|signific|sinonim|antonim|polissem|vocabulario|lexico/],
      ['Figuras de linguagem e estilística', /figuras? de linguagem|estilistic|recursos expressivos|ironia|metalinguagem/],
      ['Fonética, ortografia e acentuação', /fonetic|fonolog|ortograf|acentua|silab|hiato|ditongo|encontro consonantal/],
      ['Concordância verbal e nominal', /concordancia/],
      ['Regência e crase', /regencia|crase/],
      ['Pontuação', /pontuacao|virgula/],
      ['Sintaxe e análise sintática', /sintax|sintat|oracoes?|periodo composto|termos da oracao|sujeito|predicado|predicativ|transitividade|complemento nominal|adjunto|aposto|vocativo/],
      ['Morfologia e classes de palavras', /morfolog|classes? de palavras?|substantiv|adjetiv|pronome|artigo|numerais?|adverb|preposic|conjunc|verbo|colocacao pronominal|formacao de palavras?/],
      ['Literatura brasileira e portuguesa', /literatura|romantismo|realismo|modernismo|simbolismo|parnasianismo|barroco|arcadismo|quinhentismo/],
      ['Variação linguística', /variacao linguistica/],
    ],
  },
  {
    materia: /biologia/,
    fallback: 'Fundamentos de Biologia',
    grupos: [
      ['Ecologia e meio ambiente', /ecolog|cadeia alimentar|relacao ecologica|ciclo biogeoquimico|especie exotica|controle biologico/],
      ['Citologia e bioquímica', /citolog|celul|organel|bioquim|enzim|osmose|membrana plasmatica|metabolismo celular/],
      ['Genética e biotecnologia', /genetic|hereditar|\bdna\b|\brna\b|biotecnolog|\bpcr\b|terapia genica/],
      ['Evolução', /evolucao|selecao natural|darwin|lamarck/],
      ['Fisiologia e anatomia humana', /fisiolog|anatom|hormon|sistema (?:digestorio|respiratorio|circulatorio|nervoso|excretor|reprodutor)|coagulacao/],
      ['Botânica', /botan|vegetal|fotossintese|plantas?|briofitas?|pteridofitas?|gimnospermas?|angiospermas?/],
      ['Zoologia', /zoolog|animais?|invertebrado|vertebrado/],
      ['Microbiologia e imunologia', /microbiolog|imunolog|virus|bacteria|fungos?|protozo/],
      ['Taxonomia e diversidade dos seres vivos', /taxonom|classificacao dos seres vivos|reinos? biologicos?|filogen/],
    ],
  },
  {
    materia: /filosofia/,
    fallback: 'Fundamentos de Filosofia',
    grupos: [
      ['Filosofia antiga', /filosofia antiga|pre-socratic|socrates|platao|aristoteles|sofistas?|estoic|epicur/],
      ['Ética e moral', /etica|moral|virtude|bioetica/],
      ['Filosofia política', /filosofia politica|estado|poder|justica|maquiavel|hobbes|locke|rousseau/],
      ['Teoria do conhecimento e ciência', /epistemolog|teoria do conhecimento|conhecimento sensivel|racionalismo|empirismo|metodo cientifico/],
      ['Filosofia moderna', /filosofia moderna|descartes|kant|hegel|iluminismo/],
      ['Filosofia contemporânea', /filosofia contemporanea|existencial|nietzsche|foucault|arendt|sartre/],
    ],
  },
  {
    materia: /sociologia/,
    fallback: 'Fundamentos de Sociologia',
    grupos: [
      ['Teorias sociológicas', /teoria sociologica|durkheim|weber|marx|comte|bourdieu/],
      ['Cultura e identidade', /cultura|identidade|etnocentr|diversidade cultural|industria cultural/],
      ['Trabalho e sociedade', /trabalho|capitalismo|divisao social|modo de producao/],
      ['Desigualdades sociais', /desigualdade|classe social|racismo|genero|interseccionalidade|estratificacao/],
      ['Política, cidadania e movimentos sociais', /cidadania|estado de direito|democracia|movimentos? sociais?|participacao politica|direitos humanos/],
      ['Globalização e sociedade', /globalizacao|sociedade em rede|modernidade liquida/],
    ],
  },
  {
    materia: /literatura/,
    fallback: 'Fundamentos de Literatura',
    grupos: [
      ['Escolas literárias', /quinhentismo|barroco|arcadismo|romantismo|realismo|naturalismo|parnasianismo|simbolismo|modernismo/],
      ['Gêneros e teoria literária', /generos? literarios?|teoria literaria|narrador|poesia|prosa|drama/],
      ['Literatura brasileira e portuguesa', /literatura brasileira|literatura portuguesa|machado de assis|clarice lispector|fernando pessoa|camoes/],
      ['Interpretação de textos literários', /interpretacao|analise do texto|trecho|poema|romance|conto/],
    ],
  },
  {
    materia: /^(?:arte|artes)$/,
    fallback: 'Fundamentos de Arte',
    grupos: [
      ['História da arte', /historia da arte|renascimento|barroco|modernismo|vanguarda/],
      ['Artes visuais', /artes? visuais?|pintura|escultura|fotografia|cinema|instalacao|ready-made/],
      ['Música', /musica|ritmo|melodia|harmonia/],
      ['Teatro e dança', /teatro|danca|performance|dramaturgia/],
      ['Arte contemporânea', /arte contemporanea|contemporaneidade/],
    ],
  },
]

function grupoDaMateria(materia, valor, contexto = '') {
  const classificador = classificadoresMateria.find(item => item.materia.test(materia))
  if (!classificador) return null
  const conteudo = chaveFiltro(valor)
  const grupoConteudo = classificador.grupos.find(([, padrao]) => padrao.test(conteudo))
  const grupo = grupoConteudo || classificador.grupos.find(([, padrao]) => padrao.test(`${conteudo} ${chaveFiltro(contexto)}`))
  const label = grupo?.[0] || classificador.fallback
  return { value: chaveFiltro(label), label }
}

export function grupoConteudo(valor, materia = '', contexto = '') {
  const original = limparValorFiltro(valor)
  const chave = chaveFiltro(original)
  if (!chave) return { value: '', label: '' }
  const chaveMateria = chaveFiltro(materia)
  if (/\bquimica\b/.test(chaveMateria)) return grupoQuimica(original, contexto)
  if (/ingles|lingua inglesa|espanhol/.test(chaveMateria)) {
    const texto = `${chave} ${chaveFiltro(contexto)}`
    if (/interpretacao|compreensao|leitura|texto|comic strip|according to|read the|passage/.test(texto)) {
      return { value: 'interpretacao em lingua estrangeira', label: 'Interpretação em língua estrangeira' }
    }
    if (/vocabulario|lexico|express|meaning|synonym|word/.test(texto)) {
      return { value: 'vocabulario em lingua estrangeira', label: 'Vocabulário em língua estrangeira' }
    }
    return { value: 'gramatica em lingua estrangeira', label: 'Gramática em língua estrangeira' }
  }
  const grupoEspecifico = grupoDaMateria(chaveMateria, original, contexto)
  if (grupoEspecifico) return grupoEspecifico
  const grupo = [...gruposConteudoPrioritarios, ...gruposConteudo].find(([, padrao]) => padrao.test(chave))
  if (grupo) return { value: chaveFiltro(grupo[0]), label: grupo[0] }
  if (chave === chaveMateria || chave.startsWith(`${chaveMateria} `)) {
    const nomeMateria = limparValorFiltro(materia)
    const label = `Conhecimentos gerais de ${nomeMateria}`
    return { value: chaveFiltro(label), label }
  }

  const base = original
    .split(/\s+(?:[—–]|\/)\s+|\s+-\s+/)[0]
    .replace(/\s+(?:I{1,3}|IV|V|VI{0,3})$/i, '')
    .trim()
  const rotulo = base || original || limparValorFiltro(materia) || 'Outros conteúdos'
  return { value: chaveFiltro(rotulo), label: rotulo.charAt(0).toLocaleUpperCase('pt-BR') + rotulo.slice(1) }
}

export function chaveConteudoFiltro(valor, materia, contexto = '') {
  return grupoConteudo(valor, materia, contexto).value
}

export function opcoesConteudo(questoes) {
  const grupos = new Map()
  for (const questao of questoes) {
    const contexto = `${questao?.enunciado || ''} ${(questao?.opcoes || []).join(' ')}`
    const grupo = grupoConteudo(questao?.conteudo, questao?.materia, contexto)
    if (!grupo.value) continue
    if (!grupos.has(grupo.value)) grupos.set(grupo.value, { ...grupo, quantidade: 0 })
    grupos.get(grupo.value).quantidade++
  }
  return [...grupos.values()]
    .map(grupo => ({ value: grupo.value, label: `${grupo.label} (${grupo.quantidade})` }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }))
}

function rotuloPreferido(chave, contagens, campo) {
  const valores = [...contagens.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
  if (campo === 'dificuldade') return ({ facil: 'Fácil', media: 'Média', dificil: 'Difícil' })[chave] || valores[0][0]
  if (campo === 'banca') {
    const sigla = valores.find(([valor]) => valor.length <= 10 && valor === valor.toLocaleUpperCase('pt-BR'))
    if (sigla) return sigla[0]
  }
  const rotulo = valores[0][0]
  return rotulo.charAt(0).toLocaleUpperCase('pt-BR') + rotulo.slice(1)
}

export function opcoesFiltro(questoes, campo) {
  const grupos = new Map()
  for (const questao of questoes) {
    const valor = campo === 'banca'
      ? normalizarBanca(questao?.[campo], questao?.concurso)
      : campo === 'materia'
        ? normalizarMateria(questao?.[campo], questao?.conteudo)
        : limparValorFiltro(questao?.[campo])
    const chave = chaveCampoFiltro(campo, valor)
    if (!chave) continue
    if (!grupos.has(chave)) grupos.set(chave, new Map())
    const contagens = grupos.get(chave)
    contagens.set(valor, (contagens.get(valor) || 0) + 1)
  }
  const ordemDificuldade = { facil: 0, media: 1, dificil: 2 }
  return [...grupos.entries()].map(([chave, contagens]) => ({
    value: chave,
    label: rotuloPreferido(chave, contagens, campo),
  })).sort((a, b) => campo === 'dificuldade'
    ? (ordemDificuldade[a.value] ?? 99) - (ordemDificuldade[b.value] ?? 99)
    : a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }))
}
