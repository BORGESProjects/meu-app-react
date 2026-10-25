const semAcentos = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase('pt-BR')

const disciplinas = [
  ['Língua Portuguesa', [/interpretacao (?:de )?texto|compreensao (?:de )?texto|gramatica|crase|concordancia verbal|concordancia nominal|regencia verbal|regencia nominal|colocacao pronominal|pontuacao|ortografia|coesao|coerencia|figuras de linguagem|tipologia textual|genero textual|acentuacao|lingua culta|norma culta|variacao linguistica|variedade linguistica|linguagem formal|linguagem informal|sentido figurado|texto literario|texto poetico/gu]],
  ['Raciocínio Lógico', [/logica proposicional|proposicao logica|tabela verdade|equivalencia logica|argumentacao logica|conjuntos numericos|analise combinatoria|probabilidade|sequencia logica|raciocinio logico/gu]],
  ['Matemática', [/matematica|equacao|funcao afim|funcao quadratica|geometria|porcentagem|razao e proporcao|regra de tres|juros simples|juros compostos|area do triangulo|volume do|estatistica|media aritmetica/gu]],
  ['Direito Constitucional', [/constituicao federal|direitos fundamentais|direitos e garantias|controle de constitucionalidade|poder constituinte|organizacao dos poderes|supremo tribunal federal|emenda constitucional|constituicao da republica|artigo 5[ºo]|art\. 5[ºo]|constitucionalismo|constituicoes promulgadas|constituicoes outorgadas|classificacao das constituicoes|competencias legislativas|competencia legislativa|competencia dos estados-membros|reparticao de competencias|controle difuso|controle concentrado|acao direta de inconstitucionalidade|adi\b|adc\b|adpf\b|mandado de seguranca|mandado de injuncao|acao popular|direitos sociais|nacionalidade brasileira|direitos politicos|organizacao federativa|estado de defesa|estado de sitio/gu]],
  ['Direito Administrativo', [/direito administrativo|ato administrativo|licitac|contrato administrativo|convenio administrativo|registro de precos|agente publico|servidor publico|responsabilidade civil do estado|poder de policia|processo administrativo|improbidade administrativa|lei 14\.133|lei 8\.112|lei 8\.666|administracao publica direta|concessao de servico publico|permissao de servico publico|concurso publico|estagio probatorio|sindicancia|processo disciplinar|desapropriacao|bens publicos|consorcio publico|controle externo|tribunal de contas|dispensa de licit|nulidade de contrato|convenios|licitacoes/gu]],
  ['Direito Penal', [/codigo penal|direito penal|tipicidade|ilicitude|culpabilidade|dolo e culpa|crime consumado|concurso de crimes|pena privativa|crimes contra a administracao|crimes contra o patrimonio|furto qualificado|roubo majorado|extincao da punibilidade|prescricao penal|legitima defesa|estado de necessidade|erro de tipo|erro de proibicao|concurso de pessoas|peculato|concusso|corrupcao passiva|lavagem de dinheiro/gu]],
  ['Processo Penal', [/codigo de processo penal|processo penal|inquerito policial|acao penal|prisao preventiva|prova testemunhal|cadeia de custodia|competencia penal|flagrante delito|habeas corpus/gu]],
  ['Direito Civil', [/codigo civil|direito civil|negocio juridico|responsabilidade civil|obrigacoes|contrato de|direito das sucessoes|direito de familia|propriedade e posse|prescricao e decadencia|capacidade civil|pessoa juridica|usucapiao|condominio|locacao|inadimplemento contratual|dano moral|dano material|regime de bens/gu]],
  ['Processo Civil', [/codigo de processo civil|processo civil|tutela provisoria|coisa julgada|peticao inicial|agravo de instrumento|cumprimento de sentenca|execucao civil|recurso especial/gu]],
  ['Direito Tributário', [/direito tributario|codigo tributario nacional|credito tributario|lancamento tributario|imposto sobre|obrigacao tributaria|competencia tributaria|taxa e contribuicao|restituicao de tributo|repeticao de ind[eé]bito|imunidade tributaria|isencao tributaria|substituicao tributaria|prescricao tributaria|decadencia tributaria|iptu|icms|issqn|imposto de renda|execucao fiscal/gu]],
  ['Direito do Trabalho', [/direito do trabalho|consolidacao das leis do trabalho|relacao de emprego|jornada de trabalho|ferias trabalhistas|verbas rescisorias|fundo de garantia|fgts|salario e remuneracao/gu]],
  ['Processo do Trabalho', [/processo do trabalho|justica do trabalho|reclamacao trabalhista|recurso ordinario trabalhista|execucao trabalhista|dissidio coletivo/gu]],
  ['Direito Previdenciário', [/direito previdenciario|seguridade social|beneficio previdenciario|aposentadoria|regime geral de previdencia|contribuicao previdenciaria|auxilio por incapacidade|previdencia complementar|entidade fechada de previdencia|regime de previdencia complementar|cnpc|previc/gu]],
  ['Direito Empresarial', [/direito empresarial|sociedade anonima|sociedade limitada|recuperacao judicial|falencia|titulo de credito|codigo comercial|quota social|quotas sociais|quotas da sociedade|capital social|socio administrador|participacao societaria|responsabilidade dos socios/gu]],
  ['Direito Internacional', [/direito internacional|extradicao|extraditando|dupla incriminacao|cooperacao juridica internacional|tratado internacional|imunidade diplomatica|visto diplomatico|naturalizacao|nacionalidade de estrangeiro|estatuto de roma|tribunal penal internacional|relacoes diplomaticas/gu]],
  ['Direito Eleitoral', [/direito eleitoral|codigo eleitoral|justica eleitoral|propaganda eleitoral|registro de candidatura|partido politico|sufragio/gu]],
  ['Direito Ambiental', [/direito ambiental|licenciamento ambiental|impacto ambiental|codigo florestal|unidade de conservacao|crimes ambientais/gu]],
  ['Contabilidade', [/contabilidade|balanco patrimonial|demonstracao do resultado|ativo circulante|passivo circulante|depreciacao|escrituracao contabil|receita e despesa|empenho da despesa|liquidacao da despesa|restos a pagar|plano de contas|variacao patrimonial|balanco orcamentario|balanco financeiro|demonstracao das variacoes patrimoniais|mcasp|contabilidade aplicada ao setor publico|creditos adicionais/gu]],
  ['Auditoria', [/auditoria|evidencia de auditoria|risco de auditoria|controle interno|parecer do auditor|amostragem de auditoria/gu]],
  ['Administração Pública', [/administracao publica|gestao publica|politica publica|governanca publica|planejamento estrategico|gestao de pessoas|organizacao administrativa|controle da administracao|ciclo de politicas publicas|indicadores de desempenho|gestao por resultados|orcamento publico|ppa|lei de diretrizes orcamentarias|ldo|lei orcamentaria anual|loa|receita publica|despesa publica|empenho|liquidacao|pagamento da despesa|lei de responsabilidade fiscal|lrf|transparencia publica|acesso a informacao|lei 12\.527|lei 4\.320|controle social|accountability|federalismo fiscal|estado de bem-estar social|cidadania regulada|planejamento governamental|plano de beneficios/gu]],
  ['Logística', [/logistica|modal de transporte|transporte ferroviario|transporte rodoviario|transporte hidroviario|transporte aeroviario|transporte dutoviario|armazenagem|armazenamento de produtos|gestao de estoque|cadeia de suprimentos|movimentacao de cargas|carga fracionada|layout de deposito|leiaute de deposito/gu]],
  ['Informática', [/informatica|tecnologia da informacao|suporte em ti|sistema operacional|banco de dados|crud|rede de computadores|seguranca da informacao|criptografia|software|hardware|tcp\b|tcp\/ip|camada de transporte|flag rst|roteador|mascara de rede|mps\.br|engenharia de software|computacao em nuvem|javascript|typescript|html|css|java\b|python|linguagem de programacao|estrutura de dados|algoritmo|programacao orientada a objetos|xml|soap|wsdl|servico web|web service|linux|windows|planilha eletronica|excel|protocolo de rede/gu]],
  ['Economia', [/economia|produto interno bruto|politica monetaria|inflacao|taxa de cambio|oferta e demanda|mercado financeiro|politica fiscal|elasticidade-preco|curva de demanda|curva de oferta|monopolio|oligopolio|concorrencia perfeita|custo marginal|receita marginal|balanca comercial|taxa selic|multiplicador keynesiano/gu]],
  ['Direito Econômico', [/direito economico|ordem economica|defesa da concorrencia|abuso de poder economico|conselho administrativo de defesa economica|cade\b|lei antitruste|lei 12\.529|concorrencia desleal|cartel economico/gu]],
  ['Direito do Consumidor', [/codigo de defesa do consumidor|direito do consumidor|relacao de consumo|fornecedor e consumidor|responsabilidade pelo fato do produto|vicio do produto|pratica abusiva|clausula abusiva|inversao do onus da prova/gu]],
  ['Direito Processual', [/processo administrativo tributario|processo legislativo|competencia jurisdicional|onus da prova|tutela de urgencia|recurso de apelacao|recurso em sentido estrito|embargos de declaracao|recurso de revista/gu]],
  ['Física', [/fisica|velocidade media|aceleracao|forca resultante|forcas|reacoes de apoio|reacoes maximas|dobradicas|equilibrio mecanico|torque|energia cinetica|termodinamica|circuito eletrico|resistencia eletrica|ondas eletromagneticas|potencia eletrica|transformacao de energia|usina hidreletrica|eletricidade/gu]],
  ['Química', [/quimica|reacao quimica|ligacao covalente|tabela periodica|solucao aquosa|estequiometria|ph da solucao|composto organico/gu]],
  ['Biologia', [/biologia|celula|ecossistema|fotossintese|genetica|evolucao biologica|cadeia alimentar|organismo|biodiversidade|sistema imunologico|ciclo hidrologico|ciclo da agua|transpiracao vegetal|evaporacao|precipitacao|vegetacao/gu]],
  ['História', [/historia do brasil|revolucao francesa|revolucao industrial|periodo colonial|escravidao|republica brasileira|idade media|guerra mundial|imperio brasileiro/gu]],
  ['Geografia', [/geografia|regionalizacao|clima tropical|relevo brasileiro|urbanizacao|globalizacao|bacia hidrografica|populacao brasileira|geopolitica|cartografia/gu]],
  ['Filosofia', [/filosofia|aristoteles|platao|kant|etica aristotelica|contrato social|existencialismo|teoria do conhecimento/gu]],
  ['Sociologia', [/sociologia|desigualdade social|movimento social|estratificacao social|cultura e sociedade|durkheim|weber|marxismo|estado de bem-estar social|cidadania regulada|universalismo protetor|mercantilizacao da politica social/gu]],
  ['Língua Inglesa', [/english|according to the text|the author states|choose the correct|text suggests|reading comprehension/gu]],
  ['Língua Espanhola', [/espanol|segun el texto|de acuerdo con el texto|el autor afirma|comprension lectora/gu]],
  ['Medicina', [/medicina|diagnostico|quadro clinico|paciente|tratamento|sinais vitais|anamnese|conduta terapeutica|exame fisico|tireoideopatia|globulina|tiroxina|t3 e t4|incontinencia urinaria|distocia|gestacao|gravidez|pre-natal|placenta|glomerular|neuroanatomia|semiologia neurologica|parasitoses|ascaridiase|hipolactasia|enterobius|necator americanus|transtorno mental|psicofarmaco|psiquiatria|sindrome de|cancer de mama/gu]],
  ['Enfermagem', [/enfermagem|processo de enfermagem|diagnostico de enfermagem|cuidado de enfermagem|administracao de medicamentos|assistencia ao trabalho de parto|pre-natal|cuidados de saude/gu]],
  ['Odontologia', [/odontologia|odontologico|odontologica|dente|dental|faceta estetica|lente de contato dental|resina composta|cimentacao|acido fluoridrico|silano|remanescente dental|tecido dentario/gu]],
  ['Educação', [/educacao|pedagogia|aprendizagem|curriculo|didatica|avaliacao escolar|educacao inclusiva|lei de diretrizes e bases|ldb|professor|coordenacao pedagogica|tendencias pedagogicas|acao educativa|pratica docente|formacao continuada/gu]],
  ['Saúde Coletiva', [/saude coletiva|saude publica|epidemiologia|prevencao primaria|promocao da saude|taxa de incidencia|taxa de mortalidade|vigilancia epidemiologica|determinantes sociais da saude|saneamento basico e saude|controle de endemias|criadores de mosquitos|criadouros de mosquitos/gu]],
  ['Administração', [/teoria geral da administracao|processo administrativo|planejamento estrategico|organizacao administrativa|organizacao do trabalho|direcao e controle|gestao de projetos|gestao por processos|gestao da qualidade|comportamento organizacional|estrutura organizacional|escola de administracao|burocracia weberiana/gu]],
  ['Arquivologia', [/arquivologia|gestao documental|arquivo corrente|arquivo intermediario|arquivo permanente|tabela de temporalidade|classificacao arquivistica|protocolo de documentos|documento arquivistico/gu]],
  ['Biblioteconomia', [/biblioteconomia|biblioteca|classificacao decimal universal|cdu|cutter-sanborn|catalogacao|notacao bibliografica|indexacao|servico de referencia|desenvolvimento de colecoes/gu]],
  ['Engenharia Civil', [/engenharia civil|estruturas de concreto|concreto armado|fundacoes|instalacoes prediais|mecanica dos solos|topografia|orçamento de obras|orçamento de obras|norma abnt|nbr \d|patologia das construcoes|pavimentacao/gu]],
  ['Engenharia Elétrica', [/engenharia eletrica|instalacoes eletricas|sistemas de potencia|maquinas eletricas|transformador|circuito trifasico|protecao eletrica|nr ?10|eletrotecnica/gu]],
  ['Engenharia Mecânica', [/engenharia mecanica|termodinamica aplicada|mecanica dos fluidos|elementos de maquinas|processos de fabricacao|resistencia dos materiais|transferencia de calor/gu]],
  ['Engenharia Ambiental', [/engenharia ambiental|saneamento|tratamento de agua|tratamento de efluentes|residuos solidos|licenciamento ambiental|impacto ambiental/gu]],
  ['Estatística', [/estatistica|distribuicao de probabilidade|variavel aleatoria|regressao linear|intervalo de confianca|teste de hipotese|amostragem|desvio padrao|mediana|media aritmetica/gu]],
  ['Psicologia', [/psicologia|psicologico|psicologica|psicodiagnostico|teoria de piaget|freud|vygotsky|behaviorismo|desenvolvimento cognitivo|saude mental/gu]],
  ['Serviço Social', [/servico social|assistente social|questao social|seguridade social|politica de assistencia social|suas|loas|sus e suas/gu]],
  ['Educação Física', [/educacao fisica|atividade fisica|aptidao fisica|treinamento esportivo|fisiologia do exercicio|esporte|atividade motora/gu]],
  ['Agronomia', [/agronomia|fitotecnia|cultivo|solo agricola|manejo de culturas|pragas agricolas|irrigacao|fertilizante|agropecuaria/gu]],
  ['Segurança do Trabalho', [/seguranca do trabalho|saude ocupacional|equipamento de protecao|epi|epc|nr ?[0-9]{1,2}\b|acidente de trabalho|risco ocupacional/gu]],
  ['Legislação e normas', [/lei federal|decreto|portaria|resolucao normativa|regimento interno|estatuto dos servidores|lei complementar|codigo de etica|legislacao aplicavel/gu]],
  ['Ciências da Natureza', [/ciencias da natureza|fenomeno natural|meio ambiente|materia e energia|seres vivos|ambiente natural/gu]],
  ['Ciências Humanas', [/ciencias humanas|processo historico|organizacao do espaco|relacoes sociais|cidadania e democracia|sociedade brasileira/gu]],
]

const conteudos = [
  ['Interpretação e compreensão textual', /interpretacao|compreensao|ideia central|sentido do texto|inferir do texto/gu],
  ['Gramática e norma-padrão', /gramatica|crase|concordancia|regencia|pontuacao|ortografia|pronominal|acentuacao/gu],
  ['Constitucionalismo e teoria da Constituição', /constitucionalismo|constituicoes promulgadas|constituicoes outorgadas|classificacao das constituicoes|poder constituinte|emenda constitucional/gu],
  ['Direito internacional e relações diplomáticas', /extradicao|extraditando|dupla incriminacao|cooperacao juridica internacional|tratado internacional|imunidade diplomatica|visto diplomatico|naturalizacao|estatuto de roma|tribunal penal internacional|relacoes diplomaticas/gu],
  ['Previdência complementar', /previdencia complementar|entidade fechada de previdencia|regime de previdencia complementar|cnpc|previc|plano de beneficios/gu],
  ['Biblioteconomia e organização do conhecimento', /biblioteconomia|biblioteca|classificacao decimal universal|cdu|cutter-sanborn|catalogacao|notacao bibliografica|indexacao/gu],
  ['Logística, transportes e armazenagem', /logistica|modal de transporte|transporte ferroviario|transporte rodoviario|transporte hidroviario|transporte aeroviario|transporte dutoviario|armazenagem|gestao de estoque|cadeia de suprimentos|movimentacao de cargas|layout de deposito|leiaute de deposito/gu],
  ['Epidemiologia e promoção da saúde', /epidemiologia|prevencao primaria|promocao da saude|taxa de incidencia|taxa de mortalidade|vigilancia epidemiologica|criadouros de mosquitos/gu],
  ['Saúde da mulher e obstetrícia', /gestacao|gravidez|pre-natal|placenta|trabalho de parto|distocia|tireoideopatia|incontinencia urinaria/gu],
  ['Odontologia restauradora e materiais dentários', /odontologia|dental|faceta estetica|lente de contato dental|resina composta|cimentacao|acido fluoridrico|silano|remanescente dental/gu],
  ['Psicopatologia e avaliação psicológica', /tdah|simulacao|entrevistador|psicofarmaco|transtorno mental|neurotransmissor|metilfenidato|esquizofrenia|autismo|prader-willi/gu],
  ['Direitos fundamentais', /direitos fundamentais|garantias fundamentais|artigo 5|art\. 5/gu],
  ['Orçamento e finanças públicas', /orcamento publico|ppa|ldo|loa|receita publica|despesa publica|empenho|liquidacao|restos a pagar|credito adicional|lei 4\.320|responsabilidade fiscal|lrf|mcasp|balanco orcamentario/gu],
  ['Processo e controle administrativo', /processo administrativo|processo disciplinar|sindicancia|controle externo|tribunal de contas|controle interno|recurso administrativo|lei 9\.784|tomada de contas/gu],
  ['Responsabilidade e sanções administrativas', /improbidade|responsabilidade civil do estado|responsabilidade objetiva|processo disciplinar|sancao administrativa|poder disciplinar|lei 8\.429/gu],
  ['Concorrência e regulação econômica', /defesa da concorrencia|abuso de poder economico|cade\b|cartel|antitruste|monopolio|oligopolio|lei 12\.529/gu],
  ['Direito do consumidor', /codigo de defesa do consumidor|relacao de consumo|fornecedor|vicio do produto|pratica abusiva|clausula abusiva|onus da prova/gu],
  ['Sociedades e atividade empresarial', /sociedade limitada|sociedade anonima|quotas sociais|capital social|socio|administrador da sociedade|recuperacao judicial|falencia/gu],
  ['Restituição e extinção do crédito tributário', /restituicao|repeticao de ind[eé]bito|pagamento indevido|extincao do credito tributario|compensacao tributaria/gu],
  ['Organização do Estado e dos Poderes', /organizacao do estado|organizacao dos poderes|competencia da uniao|poder legislativo|poder executivo|poder judiciario/gu],
  ['Atos, poderes e agentes administrativos', /ato administrativo|poder de policia|agente publico|servidor publico|processo administrativo|responsabilidade civil do estado|nulidade de contrato/gu],
  ['Licitações, contratos e convênios públicos', /licitac|contrato administrativo|convenio|registro de precos|dispensa de licit|lei 14\.133|lei 8\.666/gu],
  ['Programação e linguagens de desenvolvimento', /javascript|typescript|html|css|java\b|python|linguagem de programacao|estrutura de dados|algoritmo|programacao orientada a objetos/gu],
  ['Arquitetura e serviços web', /xml|soap|wsdl|soa|servico web|web service|arquitetura orientada a servicos/gu],
  ['Crimes e teoria do delito', /tipicidade|ilicitude|culpabilidade|crime doloso|crime culposo|tipo penal|pena privativa|concurso de crimes/gu],
  ['Processo, provas e recursos', /inquerito policial|acao penal|recurso especial|recurso extraordinario|recurso ordinario|tutela provisoria|coisa julgada|cadeia de custodia/gu],
  ['Tributos e crédito tributário', /tributo|imposto|credito tributario|lancamento tributario|obrigacao tributaria|competencia tributaria/gu],
  ['Contabilidade geral e demonstrações', /balanco patrimonial|demonstracao do resultado|ativo circulante|passivo circulante|depreciacao|escrituracao contabil|receita e despesa/gu],
  ['Saúde, diagnóstico e conduta clínica', /quadro clinico|diagnostico diferencial|conduta terapeutica|sinais vitais|anamnese|exame fisico/gu],
  ['Fármacos e interações medicamentosas', /farmaco|medicamento|interacao medicamentosa|dose terapeutica|nivel plasmatico|nivel serico|prescricao/gu],
  ['Ecologia e meio ambiente', /ecossistema|biodiversidade|cadeia alimentar|impacto ambiental|conservacao/gu],
  ['Mecânica e energia', /velocidade|aceleracao|forca|energia|movimento|termodinamica/gu],
  ['Química e transformações da matéria', /reacao quimica|estequiometria|solucao|ligacao|composto|ph/gu],
  ['História do Brasil', /brasil|colonial|imperio|republica|escravidao/gu],
  ['Espaço, população e geopolítica', /urbanizacao|populacao|territorio|globalizacao|geopolitica|clima|relevo/gu],
  ['Lógica e argumentação', /proposicao|tabela verdade|argumento|equivalencia logica|raciocinio/gu],
  ['Probabilidade e estatística', /probabilidade|estatistica|media|mediana|desvio padrao|amostra/gu],
]

const contar = (texto, regex) => {
  regex.lastIndex = 0
  return regex.test(texto) ? 1 : 0
}
const normalizarAno = valor => {
  const ano = Number(valor)
  return Number.isInteger(ano) && ano >= 1990 && ano <= new Date().getFullYear() ? ano : null
}

function materiaINEP(q) {
  const pistas = semAcentos([q.concurso, q.documento_origem, q.tipo_documento, q.origem, q.fonte].join(' '))
  if (/\benem\b/u.test(pistas)) {
    const n = Number(q.numero_original)
    const ano = normalizarAno(q.ano)
    if (ano >= 2009 && n >= 1 && n <= 180) {
      if (n <= 45) return 'Linguagens e suas Tecnologias'
      if (n <= 90) return 'Ciências Humanas e suas Tecnologias'
      if (n <= 135) return 'Ciências da Natureza e suas Tecnologias'
      return 'Matemática e suas Tecnologias'
    }
  }
  if (/\bsaeb\b/u.test(pistas)) {
    if (/biologia/u.test(pistas)) return 'Biologia'
    if (/matematica/u.test(pistas)) return 'Matemática'
    if (/lingua.portuguesa|portugues/u.test(pistas)) return 'Língua Portuguesa'
    if (/ciencias.naturais/u.test(pistas)) return 'Ciências da Natureza'
  }
  if (/\bencceja\b/u.test(pistas)) {
    if (/matematica/u.test(pistas)) return 'Matemática'
    if (/historia|geografia|ciencias.humanas/u.test(pistas)) return 'Ciências Humanas'
    if (/ciencias.naturais|biologia|quimica|fisica/u.test(pistas)) return 'Ciências da Natureza'
    if (/lingua.portuguesa|linguagens/u.test(pistas)) return 'Linguagens e Códigos'
  }
  if (/\b(enamed|revalida)\b/u.test(pistas)) return 'Medicina'
  if (/\benade\b/u.test(pistas)) {
    if (/formacao.geral/u.test(pistas)) return 'Formação Geral'
    const cursos = new Map([['terapia ocupacional','Terapia Ocupacional'],['medicina','Medicina'],['enfermagem','Enfermagem'],['odontologia','Odontologia'],['direito','Direito'],['pedagogia','Pedagogia'],['engenharia civil','Engenharia Civil'],['engenharia eletrica','Engenharia Elétrica'],['ciencias contabeis','Ciências Contábeis'],['administracao','Administração'],['psicologia','Psicologia'],['fisioterapia','Fisioterapia'],['nutricao','Nutrição'],['farmacia','Farmácia'],['arquitetura','Arquitetura'],['servico social','Serviço Social']])
    for (const [chave, nome] of cursos) if (new RegExp(`\\b${chave}\\b`, 'u').test(pistas)) return nome
  }
  if (/\bpnd\b/u.test(pistas)) return 'Formação de Professores'
  return ''
}

function classificacaoESA(q) {
  if (q.banca !== 'Exército Brasileiro' || !/\besa\b/u.test(semAcentos(q.concurso))) return null
  const n = Number(q.numero_original)
  if (!Number.isInteger(n)) return null
  const ano = Number(q.ano || inferirAnoQuestaoExtraida(q))
  const texto = semAcentos([q.enunciado, ...(q.opcoes || [])].join(' '))
  if (ano >= 2021) {
    if (n <= 14) return {materia: 'Matemática', conteudo: conteudoESA(texto, 'Matemática'), confianca: 0.9, metodo: 'ordem oficial das partes da prova ESA e evidência do enunciado'}
    if (n <= 28) return {materia: 'Português', conteudo: conteudoESA(texto, 'Português'), confianca: 0.9, metodo: 'ordem oficial das partes da prova ESA e evidência do enunciado'}
    if (n <= 40) {
      const humanas = conteudoESA(texto, 'História e Geografia do Brasil')
      const materia = /historia|revolucao|colonial|imperio|republica|guerra|independencia/u.test(texto) ? 'História'
        : /territorio|clima|relevo|bacia|populacao|urbanizacao|vegetacao|cartografia|globalizacao|geopolitica/u.test(texto) ? 'Geografia'
          : 'História e Geografia do Brasil'
      return {materia, conteudo: humanas, confianca: materia === 'História e Geografia do Brasil' ? 0.72 : 0.88, metodo: 'ordem oficial das partes da prova ESA e evidência do enunciado'}
    }
    return {materia: 'Inglês', conteudo: conteudoESA(texto, 'Inglês'), confianca: 0.9, metodo: 'ordem oficial das partes da prova ESA e evidência do enunciado'}
  }
  if (n <= 13) return {materia: 'Matemática', conteudo: conteudoESA(texto, 'Matemática'), confianca: 0.78, metodo: 'sequência da prova ESA e evidência do enunciado'}
  if (n <= 25) return {materia: 'Português', conteudo: conteudoESA(texto, 'Português'), confianca: 0.78, metodo: 'sequência da prova ESA e evidência do enunciado'}
  if (n <= 34) {
    const materia = /historia|revolucao|colonial|imperio|republica|guerra|independencia/u.test(texto) ? 'História'
      : /territorio|clima|relevo|bacia|populacao|urbanizacao|vegetacao|cartografia|globalizacao|geopolitica/u.test(texto) ? 'Geografia'
        : 'História e Geografia do Brasil'
    return {materia, conteudo: conteudoESA(texto, 'História e Geografia do Brasil'), confianca: materia === 'História e Geografia do Brasil' ? 0.68 : 0.78, metodo: 'sequência da prova ESA e evidência do enunciado'}
  }
  return {materia: 'Inglês', conteudo: conteudoESA(texto, 'Inglês'), confianca: 0.78, metodo: 'sequência da prova ESA e evidência do enunciado'}
}

function conteudoESA(texto, materia) {
  const regras = materia === 'Matemática' ? [
    ['Funções e gráficos', /funcao|grafico|dominio|imagem|logarit|exponencial/u],
    ['Álgebra e equações', /equacao|inequacao|polinomio|raiz|sistema linear|expressao algebrica/u],
    ['Geometria plana', /triangulo|quadrado|retangulo|circunferencia|poligono|area|perimetro|angul/u],
    ['Geometria espacial', /cilindro|cone|esfera|prisma|piramide|volume|paralelepipedo/u],
    ['Probabilidade e análise combinatória', /probabilidade|anagrama|permutacao|combinatoria|arranjo|urna|baralho/u],
    ['Estatística e análise de dados', /media|mediana|moda|frequencia|tabela|grafico/u],
    ['Trigonometria', /seno|cosseno|tangente|trigonometr|radian/u],
    ['Sequências e progressões', /progressao|\bpa\b|\bpg\b|sequencia/u],
    ['Aritmética e números', /frac|porcent|razao|proporc|divis|numero|inteiro|primo/u],
  ] : materia === 'Português' ? [
    ['Interpretação e compreensão textual', /texto|autor|trecho|ideia|sentido|infer|compreens|interpreta/u],
    ['Gramática e norma-padrão', /gramat|acentu|ortograf|regencia|concordancia|pronome|verbo|oracao|sintax|pontuacao|classe gramatical/u],
    ['Literatura brasileira e portuguesa', /literatur|romantismo|realismo|barroco|modernismo|poema|poesia|machado de assis|simbolismo/u],
  ] : materia === 'Inglês' ? [
    ['Interpretação em língua inglesa', /according to|text|passage|author|read the|correct alternative|meaning/u],
    ['Gramática em língua inglesa', /verb|tense|pronoun|preposition|plural|sentence|grammar/u],
  ] : [
    ['História do Brasil', /historia|colonial|imperio|republica|escrav|guerra|independencia|vargas|revolucao|brasil/u],
    ['Geografia do Brasil', /geografia|territorio|clima|relevo|bacia|populacao|urbanizacao|vegetacao|cartografia|bioma|globalizacao/u],
  ]
  return regras.find(([, regra]) => regra.test(texto))?.[0] || `Conteúdo geral de ${materia}`
}

function contextoLocalDaPagina(q) {
  const paginas = q.transcricoes_ocr || []
  const atual = paginas.find(item => Number(item.pagina) === Number(q.pagina)) || paginas[0]
  const texto = semAcentos(atual?.texto || '').replace(/[^a-z0-9]+/gu, ' ').trim()
  if (!texto) return ''
  const pergunta = semAcentos(q.enunciado || '').replace(/[^a-z0-9]+/gu, ' ').trim()
  const busca = pergunta.split(' ').slice(0, 24).join(' ')
  const indiceTexto = busca.length >= 24 ? texto.indexOf(busca) : -1
  if (indiceTexto >= 0) return texto.slice(Math.max(0, indiceTexto - 450), Math.min(texto.length, indiceTexto + busca.length + 450))
  const numero = Number(q.numero_original)
  if (!Number.isInteger(numero)) return ''
  const marcadores = [...texto.matchAll(new RegExp(`(?:^|\\s)${numero}\\s+(?=[a-z])`, 'gu'))]
  const marcador = marcadores.at(-1)
  return marcador ? texto.slice(Math.max(0, marcador.index - 450), marcador.index + 900) : ''
}

function inferirDisciplina(q) {
  const esa = classificacaoESA(q)
  if (esa) return esa
  const explicita = q.banca === 'INEP' ? materiaINEP(q) : ''
  const textoPrincipal = semAcentos([q.enunciado, ...(q.opcoes || []), q.texto_apoio].join(' '))
  const textoClassificacao = semAcentos(`${textoPrincipal} ${q.tipo_documento || ''} ${q.cargo || ''} ${q.area || ''} ${q.especialidade || ''}`)
  const conteudo = conteudos.map(([nome, regra]) => ({nome, pontos: contar(textoPrincipal, regra)})).filter(item => item.pontos > 0).sort((a, b) => b.pontos - a.pontos)[0]?.nome || ''
  if (explicita) return {materia: explicita, conteudo: conteudo || 'Conteúdo específico da edição', confianca: 0.95, metodo: 'metadados da edição'}
  const pontuar = base => disciplinas.map(([materia, regras]) => ({materia, pontos: regras.reduce((soma, regra) => soma + contar(base, regra), 0)})).filter(item => item.pontos > 0).sort((a, b) => b.pontos - a.pontos)
  let base = textoClassificacao
  let evidencias = pontuar(base)
  if (!evidencias.length) {
    base = semAcentos(`${textoClassificacao} ${contextoLocalDaPagina(q)}`)
    evidencias = pontuar(base)
  }
  if (!evidencias.length) {
    const pistasProva = semAcentos([q.tipo_documento, q.concurso, q.texto_apoio].join(' '))
    const materia = /conhecimentos especificos|conhecimentos especificos/u.test(pistasProva) ? 'Conhecimentos Específicos'
      : /conhecimentos basicos|conhecimentos gerais/u.test(pistasProva) ? 'Conhecimentos Gerais'
        : q.banca === 'INEP' && /enem/u.test(pistasProva) ? 'Ciências Humanas e suas Tecnologias'
          : 'Conhecimentos Gerais'
    return {materia, conteudo: `Conteúdos gerais de ${materia}`, confianca: 0.25, metodo: 'bloco da prova e contexto; requer conferência do tópico'}
  }
  const primeiro = evidencias[0], segundo = evidencias[1]?.pontos || 0
  const confianca = Math.min(0.98, 0.52 + primeiro.pontos * 0.1 + (primeiro.pontos > segundo ? 0.12 : 0))
  const topico = conteudos.map(([nome, regra]) => ({nome, pontos: contar(textoPrincipal, regra)})).filter(item => item.pontos > 0).sort((a, b) => b.pontos - a.pontos)[0]?.nome || `Tema específico de ${primeiro.materia}`
  return {materia: primeiro.materia, conteudo: topico, confianca: Math.round(confianca * 100) / 100, metodo: 'enunciado, alternativas e página da prova'}
}

export function modalidadeQuestaoExtraida(q = {}) {
  return 'objetiva'
}

export function auditarElegibilidadeQuestaoExtraida(q = {}) {
  // Preserve tags and symbols used as exam content (for example <br>, <>, and HTML/XML).
  const enunciado = String(q.enunciado || '').trim()
  const opcoes = Array.isArray(q.opcoes) ? q.opcoes.map(opcao => String(opcao ?? '').trim()) : []
  const semOpcoesVazias = opcoes.length >= 2 && opcoes.every(Boolean)
  const apontamentos = []
  if (enunciado.length < 8) apontamentos.push('enunciado ausente ou curto demais')
  if (!semOpcoesVazias) apontamentos.push('alternativas ausentes ou incompletas')
  if (!q.materia || !q.conteudo) apontamentos.push('classificação incompleta')
  return {
    elegivel_para_resolucao: enunciado.length >= 8 && semOpcoesVazias,
    elegivel_para_correcao_automatica: enunciado.length >= 8 && semOpcoesVazias && (q.resposta_correta != null || q.resposta_soma != null),
    apontamentos,
  }
}

export function inferirAnoQuestaoExtraida(q = {}) {
  const anoAtual = normalizarAno(q.ano)
  if (anoAtual) return anoAtual
  const anosDaFonte = [q.documento_origem, q.tipo_documento, q.concurso, q.fonte]
    .join(' ').match(/(?:19|20)\d{2}/gu)?.map(normalizarAno).filter(Boolean) || []
  return anosDaFonte.find(valor => valor <= new Date().getFullYear()) || null
}

export function enriquecerQuestaoExtraida(q = {}) {
  const ano = inferirAnoQuestaoExtraida(q)
  const classificacao = inferirDisciplina({...q, ano})
  const tipo_resposta = modalidadeQuestaoExtraida(q)
  const paginas = [...new Set([...(q.paginas_origem || []), ...(q.pagina_imagem ? [q.pagina] : [])].map(Number).filter(Number.isInteger))].sort((a, b) => a - b)
  const imagens_paginas = [...new Set([...(q.imagens_paginas || []), ...(q.pagina_imagem ? [q.pagina_imagem] : [])].filter(Boolean))]
  const textoPorPagina = new Map((q.transcricoes_ocr || []).map(item => [Number(item.pagina), String(item.texto || '')]))
  const imagemPorPagina = new Map(imagens_paginas.map((imagem, indice) => {
    const paginaDoNome = Number(String(imagem).match(/-(\d{4})\.webp$/u)?.[1])
    return [paginaDoNome || paginas[indice] || Number(q.pagina) || indice + 1, imagem]
  }))
  const paginasContexto = [...new Set([...paginas, ...imagemPorPagina.keys(), ...textoPorPagina.keys()])].sort((a, b) => a - b)
    .map(pagina => ({pagina, imagem: imagemPorPagina.get(pagina) || ''}))
  const enriquecida = {
    ...q,
    ano,
    materia: classificacao.materia,
    conteudo: classificacao.conteudo || 'Revisão necessária',
    classificacao_confianca: classificacao.confianca,
    classificacao_metodo: classificacao.metodo,
    tipo_resposta,
    paginas_origem: paginas.length ? paginas : q.paginas_origem || [],
    imagens_paginas,
    pagina_imagem: q.pagina_imagem || imagens_paginas[0] || '',
    contexto_paginas: paginasContexto,
  }
  enriquecida.elegibilidade = auditarElegibilidadeQuestaoExtraida(enriquecida)
  return enriquecida
}
