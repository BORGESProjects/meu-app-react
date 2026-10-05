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

export function chaveCampoFiltro(campo, valor) {
  const chave = chaveFiltro(valor)
  if (campo === 'dificuldade' && chave === 'medio') return 'media'
  return chave
}

const gruposConteudo = [
  ['Interpretação de textos', /interpretacao|compreensao|leitura|inferenc|tese|pressupost|parafrase/],
  ['Gêneros e funções da linguagem', /genero|funcao da linguagem|linguagem verbal|tipologia textual|finalidade do texto/],
  ['Coesão, coerência e argumentação', /coesao|coerencia|argument|conectiv|operadores discursivos|progressao textual/],
  ['Semântica e vocabulário', /semant|sentido|signific|sinonim|antonim|polissem|vocabulario|lexico/],
  ['Figuras de linguagem e estilística', /figura de linguagem|estilistic|recursos expressivos|ironia|metalinguagem/],
  ['Fonética, ortografia e acentuação', /fonetic|fonolog|ortograf|acentua|silab|hiato|ditongo|encontro consonantal/],
  ['Morfologia e classes de palavras', /morfolog|classe de palavra|substantiv|adjetiv|pronome|artigo|numeral|adverb|preposic|conjunc|verbo|formacao de palavra|estrutura e formacao/],
  ['Sintaxe e análise sintática', /sintax|orac(?:ao|oes)|periodo composto|termos da oracao|sujeito|predicado|complemento nominal|adjunto|aposto|vocativo/],
  ['Concordância verbal e nominal', /concordancia/],
  ['Regência e crase', /regencia|crase/],
  ['Pontuação', /pontuacao|virgula/],
  ['Literatura brasileira e portuguesa', /literatura|romantismo|realismo|modernismo|simbolismo|parnasianismo|barroco|arcadismo|quinhentismo|maneirismo|machado de assis/],
  ['Aritmética e números', /aritmet|numero(?:s)? (?:natural|inteiro|racional|real|primo)|divisibilidade|mdc|mmc|fracao|razao|proporcao|porcentagem|regra de tres|expressoes numericas/],
  ['Álgebra, equações e inequações', /algebr|equac|inequac|sistema linear|expressoes algebricas/],
  ['Funções e gráficos', /funcao|funcoes|dominio de funcao|grafico de funcao/],
  ['Logaritmos e exponenciais', /logarit|exponencial/],
  ['Geometria plana', /geometria plana|triangulo|quadrilatero|poligono|circunferencia|circulo|teorema de tales|pitagor|semelhanca/],
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
  ['Estequiometria e soluções', /estequiometr|solucao|concentracao|diluicao|mistura/],
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

export function grupoConteudo(valor, materia = '') {
  const original = limparValorFiltro(valor)
  const chave = chaveFiltro(original)
  if (!chave) return { value: '', label: '' }
  const chaveMateria = chaveFiltro(materia)
  if (/ingles|lingua inglesa|espanhol/.test(chaveMateria)) {
    if (/interpretacao|compreensao|leitura|texto|comic strip/.test(chave)) {
      return { value: 'interpretacao em lingua estrangeira', label: 'Interpretação em língua estrangeira' }
    }
    if (/vocabulario|lexico|express/.test(chave)) {
      return { value: 'vocabulario em lingua estrangeira', label: 'Vocabulário em língua estrangeira' }
    }
    return { value: 'gramatica em lingua estrangeira', label: 'Gramática em língua estrangeira' }
  }
  const grupo = [...gruposConteudoPrioritarios, ...gruposConteudo].find(([, padrao]) => padrao.test(chave))
  if (grupo) return { value: chaveFiltro(grupo[0]), label: grupo[0] }

  const base = original
    .split(/\s+(?:[—–]|\/)\s+|\s+-\s+/)[0]
    .replace(/\s+(?:I{1,3}|IV|V|VI{0,3})$/i, '')
    .trim()
  const rotulo = base || original || limparValorFiltro(materia) || 'Outros conteúdos'
  return { value: chaveFiltro(rotulo), label: rotulo.charAt(0).toLocaleUpperCase('pt-BR') + rotulo.slice(1) }
}

export function chaveConteudoFiltro(valor, materia) {
  return grupoConteudo(valor, materia).value
}

export function opcoesConteudo(questoes) {
  const grupos = new Map()
  for (const questao of questoes) {
    const grupo = grupoConteudo(questao?.conteudo, questao?.materia)
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
    const valor = limparValorFiltro(questao?.[campo])
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
