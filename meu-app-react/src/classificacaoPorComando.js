// A tarefa cobrada prevalece sobre palavras do texto usado como contexto.
// Ex.: um texto sobre tecnologia pode ser objeto de interpretação de Português.
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/\s+/gu,' ')
const regras=[
 ['Língua Portuguesa','Ortografia',/\b(?:erro de grafia|grafia (?:correta|incorreta)|incorrecao ortografica|ortograficamente (?:correta|incorreta))\b/u],
 ['Língua Portuguesa','Pontuação',/\b(?:uso|emprego|funcao|ausencia|presenca|supressao) d[aeo] (?:virgula|pontuacao)|\bvirgula (?:separa|isola|marca)\b/u],
 ['Língua Portuguesa','Sintaxe',/\b(?:analise morfossintatica|funcao sintatica|sujeito (?:simples|composto|indeterminado)|oracao subordinada|oracoes coordenadas)\b/u],
 ['Língua Portuguesa','Concordância verbal e nominal',/\b(?:concordancia verbal|concordancia nominal)\b/u],
 ['Língua Portuguesa','Regência verbal e nominal',/\b(?:regencia verbal|regencia nominal)\b/u],
 ['Língua Portuguesa','Figuras de linguagem',/\b(?:figuras? de linguagem|figura de sintaxe|figura de pensamento)\b/u],
 ['Língua Portuguesa','Interpretação e compreensão de textos',/\b(?:ideia (?:central|principal) do texto|intencao do autor|objetivo do autor|de acordo com o texto|com base no texto|infere-se do texto|depreende-se do texto|sentido da expressao)\b/u],
 ['Matemática','Polinômios',/\b(?:raizes d[eo] (?:um |o )?polinomio|raizes do polinomio|coeficientes do polinomio|divisao de polinomios)\b/u],
 ['Matemática','Função quadrática',/\b(?:funcao quadratica|arco parabolico|vertice da parabola|funcao do segundo grau)\b/u],
 ['Matemática','Função logarítmica',/\b(?:funcao logaritmica|equacao logaritmica|inequacao logaritmica)\b/u],
 ['Matemática','Estatística: média, moda e mediana',/\bmedia\b.*\bmoda\b.*\bmediana\b/u],
 ['Matemática','Análise combinatória',/\b(?:quantos anagramas|numero de anagramas|de quantas maneiras diferentes|permutacoes com repeticao)\b/u],
 ['Direito Administrativo','Atos administrativos',/\b(?:atos? administrativos?|vicio de forma|motivacao dos atos)\b/u],
 ['Direito Administrativo','Poder regulamentar',/\b(?:poder regulamentar|exorbitou de seu poder regulamentar)\b/u],
 ['Direito Ambiental','Responsabilidade civil e administrativa ambiental',/\b(?:responsabilidade civil ambiental|responsabilidade administrativa ambiental)\b/u],
 ['Direito Econômico','Infrações à ordem econômica',/\b(?:mercado relevante|abuso de posicao dominante|abusiva posicao dominante|infracoes a ordem economica)\b/u],
 ['Administração Financeira e Orçamentária','Despesa pública: empenho, liquidação e pagamento',/\b(?:empenho (?:por estimativa|global|ordinario)|anulacao de empenho|pagamento da despesa|liquidacao da despesa)\b/u],
]
export function classificarPeloComando(q){
 const texto=norm(q.enunciado)
 // O comando em outra língua requer classificação própria, não tradução por similaridade.
 if(/\b(?:according to|choose the|read the text|choose a|mark the correct)\b/u.test(texto))return null
 const candidatos=regras.filter(([, , regex])=>regex.test(texto))
 const materias=new Set(candidatos.map(([materia])=>materia))
 if(materias.size!==1)return null
 const [materia,conteudo,regex]=candidatos[0]||[]
 if(!materia)return null
 if(materia==='Direito Administrativo'&&/\b(?:entidade contabil|patrimonio|escrituracao|plano de contas|fato permutativo|impacto permutativo)\b/u.test(texto))return null
 // Um documento normativo também pode conter "texto"; não confundir leitura da lei com interpretação linguística.
 if(materia==='Língua Portuguesa'&&conteudo.startsWith('Interpretação')&&/\b(?:constitucional|legal|normativo|lei|decreto|artigo|art\.)\b/u.test(texto))return null
 return {materia,conteudo,confianca:0.85,metodo:'comando ou objeto disciplinar explícito no enunciado; classificação automática auditável',evidencia:texto.match(regex)?.[0]}
}
