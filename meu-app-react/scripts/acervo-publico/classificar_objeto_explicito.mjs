const normalizar=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/\s+/gu,' ')
// Regras restritas ao objeto cobrado, nunca ao cargo ou ao texto da página inteira.
const regras=[
 ['Português','Reescrita de frases e substituição de palavras',/\b(?:correcao gramatical|correcao e (?:a )?coerencia|correcao gramatical e os sentidos|prejuizo (?:da|para a) correcao)\b/],
 ['Português','Concordância verbal e nominal',/\bforma verbal\b.{0,180}\b(?:concorda|concordar|concordancia)|\b(?:verbo|forma verbal)\b.{0,100}\bflexionad[oa]\b.{0,100}\b(?:singular|plural)\b/],
 ['Português','Coesão e referenciação',/\b(?:pronome|expressao|vocabulo|termo)\b.{0,100}\b(?:retoma|retomam|referente|refere-se|referem-se|antecedente)\b|\b(?:coesao textual|referenciacao textual|elemento coesivo)\b/],
 ['Português','Semântica: sentido das palavras e expressões',/\b(?:palavra|vocabulo|expressao|termo)\b.{0,100}\b(?:sentido|significado|sinonimo|antonimo|interpretad[oa]|polissemia)\b/],
 ['Português','Crase',/\b(?:sinal indicativo de crase|acento indicativo de crase|emprego da crase|uso da crase|ocorrencia de crase)\b/],
 ['Português','Colocação pronominal',/\b(?:colocacao pronominal|proclise|enclise|mesoclise)\b/],
 ['Português','Acentuação gráfica',/\b(?:acentuacao grafica|acentuad[oa]s? graficamente|acento grafico|regra de acentuacao)\b/],
 ['Português','Verbos: tempos, modos e vozes verbais',/\b(?:voz passiva|voz ativa|locucao verbal|preterito perfeito|preterito imperfeito|futuro do preterito|modo subjuntivo)\b/],
 ['Português','Classes de palavras: conjunções e relações de sentido',/\b(?:conjuncao|locucao conjuntiva)\b.{0,120}\b(?:causa|causal|concess|condic|conclus|advers|aditiv|temporal|finalidade)\w*/],
 ['Português','Redação oficial: formas de tratamento',/\b(?:pronome de tratamento|pronomes de tratamento|vossa excelencia|vossa senhoria)\b.{0,160}\b(?:vocativo|correspondencia|empregado|emprego|tratamento)\b/],
 ['Informática','Engenharia de software: testes e validação',/\b(?:testes? unitarios?|testes? de (?:aceitacao|integracao|regressao|software)|validacao de software)\b/],
 ['Informática','Engenharia de software: qualidade e modelos de maturidade',/\b(?:mps\.br|cmmi|maturidade de software|qualidade de software)\b/],
 ['Informática','Interação humano-computador e usabilidade',/\b(?:usabilidade|interface humano.computador|interacao humano.computador)\b/],
 ['Informática','Programação orientada a objetos',/\b(?:orienta(?:da|do|cao) a objetos|heranca multipla|polimorfismo|encapsulamento|hierarquia entre objetos)\b/],
 ['Informática','Bancos de dados: modelo relacional e SQL',/\b(?:bancos? de dados? relaciona(?:l|is)|algebra relacional|normalizacao de (?:tabelas|dados)|comando sql|linguagem sql|chave primaria|chave estrangeira)\b/],
 ['Informática','Bancos de dados: índices e organização de arquivos',/\b(?:arquivos? hash|funcoes? hash|arvores?.b\+|acesso indexado)\b.{0,180}\b(?:registros?|disco|arquivo|indice)|\bregistros?\b.{0,120}\bfuncoes? hash\b/],
 ['Informática','Redes de computadores: protocolos de comunicação',/\b(?:protocolo (?:tcp|udp|http|https|ftp|smtp|snmp|dhcp|dns)|protocolos tcp|modelo osi|pilha tcp\/ip|protocolo de roteamento)\b/],
 ['Informática','Segurança da informação: criptografia e certificação digital',/\b(?:criptografia (?:simetrica|assimetrica)|chave publica|chave privada|certificado digital|assinatura digital)\b/],
 ['Informática','Segurança da informação: ameaças e proteção',/\b(?:ransomware|phishing|cavalo de troia|ataque de negacao de servico|injecao de sql)\b/],
 ['Administração','Gestão da qualidade: ferramentas e melhoria contínua',/\b(?:ferramenta de gestao da qualidade|diagrama de ishikawa|ciclo pdca|diagrama de pareto|gestao da qualidade total)\b/],
 ['Administração','Gestão de pessoas: liderança',/\b(?:lideranca nas organizacoes|estilos? de lideranca|lideranca (?:situacional|transformacional|transacional|estrategica))\b/],
 ['Administração','Gestão de pessoas: cultura e clima organizacional',/\b(?:cultura organizacional|clima organizacional|rituais culturais)\b/],
 ['Administração','Gestão de pessoas: recrutamento e seleção',/\b(?:recrutamento (?:interno|externo)|selecao de pessoas|selecao de pessoal)\b/],
 ['Economia','Macroeconomia: inflação e índices de preços',/\b(?:igp-m|ipca|indice de precos ao consumidor|inflacao de demanda|inflacao de custos)\b/],
 ['Economia','Macroeconomia: mercado cambial',/\b(?:ptax|regime de cambio|taxa de cambio (?:real|nominal)|cambio flutuante|cambio fixo)\b/],
 ['Serviço Social','Instrumentos e técnicas: estudo, laudo e parecer social',/\b(?:laudo social|parecer social|estudo social|pericia social)\b/],
 ['Biblioteconomia','Representação descritiva: catalogação',/\b(?:aacr2|marc ?21|catalogacao descritiva|catalogacao na fonte)\b/],
 ['Arquivologia','Gestão documental: classificação e temporalidade',/\b(?:tabela de temporalidade|plano de classificacao de documentos|ciclo vital dos documentos|teoria das tres idades)\b/],
]
export function classificarObjetoExplicito(q){
 const t=normalizar(q.enunciado)
 if(t.length>2500||/\b(?:according to|choose the|read the text)\b/.test(t))return null
 // Um comando para os próximos itens no fim costuma pertencer à questão seguinte.
 if(/\bjulgue (?:os|o) (?:proximos|itens|item)|\bjulgue os itens (?:subsequentes|seguintes)\b/.test(t))return null
 // O tema aparece de forma inequívoca no próprio objeto cobrado, sem depender
 // de classificações anteriores ou de texto de apoio de outra questão.
 if(/\bnosql\b/.test(t)&&/banco de dados|dados/i.test(t))return {materia:'Informática',conteudo:'Bancos de dados: modelos NoSQL e distribuídos',classificacao_confianca:0.96,classificacao_metodo:'Modelo NoSQL explicitamente comparado no enunciado',classificacao_evidencia:'NoSQL'}
 if(/\b(?:pmo|pmbok)\b/.test(t)&&/\b(?:tailoring|adapta(?:cao|do|da))\b/.test(t))return {materia:'Administração',conteudo:'Gestão de projetos: adaptação e tailoring',classificacao_confianca:0.96,classificacao_metodo:'Adaptação do PMO/PMBOK explicitamente cobrada',classificacao_evidencia:t.match(/\b(?:tailoring|adapta(?:cao|do|da))\b/)?.[0]}
 const candidatos=regras.filter(([, ,regex])=>regex.test(t))
 if(!candidatos.length)return null
 const portugues=candidatos.filter(([m])=>m==='Português')
 const escolhidos=portugues.length?portugues:candidatos
 if(new Set(escolhidos.map(([m])=>m)).size!==1)return null
 let [materia,conteudo,re]=escolhidos[0]
 if(materia==='Informática'&&conteudo==='Programação orientada a objetos'&&!/\b(?:classe|classes|metodo|metodos|objetos|programacao|heranca multipla|java|c\+\+)\b/.test(t))return null
 if(materia==='Administração'&&conteudo.includes('cultura e clima')&&/\bplanejamento estrategico\b/.test(t))conteudo='Planejamento estratégico: análise dos ambientes interno e externo'
 if(materia==='Economia'&&conteudo.includes('inflação')&&/gastos federais|limite de despesa|teto de gastos|remuneracao dos agentes publicos/.test(t))return null
 if(materia==='Português'&&conteudo.startsWith('Reescrita')&&/\bvirgulas?\b/.test(t))conteudo='Pontuação: emprego da vírgula'
 if(materia==='Administração'&&conteudo.includes('cultura e clima')&&/\brecrutamento\b/.test(t))conteudo='Gestão de pessoas: recrutamento e seleção'
 // Termos linguísticos citados dentro de uma norma não bastam para classificá-la.
 if(materia==='Português'&&/\b(?:termo juridico|expressao legal|interpretacao da lei)\b/.test(t))return null
 if(materia!=='Português'&&/\b(?:no texto|do texto|autor|narrador|poema|sentido figurado)\b/.test(t))return null
 return {materia,conteudo,classificacao_confianca:0.9,classificacao_metodo:'Objeto disciplinar explícito no enunciado; regra delimitada, sem usar cargo ou página inteira',classificacao_evidencia:t.match(re)?.[0],classificacao_pendente:false}
}
