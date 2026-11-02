// Vocabulário didático próprio. Cada assunto pertence explicitamente à matéria;
// uma palavra encontrada em outra disciplina não desloca a questão de área.
const familias=[
 [/administrativo/u,[
  ['Organização administrativa',/autarquia|fundacao publica|empresa publica|sociedade de economia mista|descentraliza|desconcentra|orgao publico/gu],
  ['Atos administrativos',/ato administrativo|portaria|motivacao|anulacao|revogacao|discricionar|autoexecutoriedade|presuncao de legitimidade/gu],
  ['Agentes e servidores públicos',/servidor|agente publico|estagio probatorio|cargo publico|acumulacao de cargos|lei 8.?112/gu],
  ['Licitações e contratos administrativos',/licitac|pregao|concorrencia|dispensa|inexigibilidade|contrato administrativo|lei 14.?133|lei 8.?666/gu],
  ['Responsabilidade civil do Estado',/responsabilidade civil do estado|risco administrativo|acao regressiva|dano causado por agente/gu],
  ['Improbidade e processo disciplinar',/improbidade|processo disciplinar|sindicancia|enriquecimento ilicito/gu],
  ['Serviços e bens públicos',/servico publico|concessao|permissao|bens publicos|desapropriacao/gu],
 ]],
 [/constitucional/u,[
  ['Direitos e garantias fundamentais',/direitos fundamentais|mandado de seguranca|mandados de seguranca|habeas corpus|habeas data|direito de reuniao|liberdade de expressao|inviolabilidade/gu],
  ['Controle de constitucionalidade',/constitucionalidade|acao direta|adpf|sumula vinculante|controle difuso|controle concentrado/gu],
  ['Organização dos Poderes',/congresso nacional|senado federal|camara dos deputados|supremo tribunal federal|poder judiciario|poder executivo/gu],
  ['Organização do Estado e competências',/competencia da uniao|competencia privativa|competencia concorrente|entes federativos|intervencao federal|federalismo/gu],
  ['Poder constituinte e processo legislativo',/poder constituinte|emenda constitucional|processo legislativo|medida provisoria|iniciativa legislativa/gu],
 ]],
 [/processo penal|processual penal/u,[
  ['Investigação e ação penal',/inquerito policial|acao penal|denuncia|indiciamento|investigacao criminal/gu],
  ['Prisões e medidas cautelares',/prisao preventiva|prisao temporaria|flagrante|medida cautelar|liberdade provisoria/gu],
  ['Provas no processo penal',/cadeia de custodia|prova pericial|interceptacao|busca e apreensao|prova testemunhal/gu],
  ['Competência e recursos penais',/competencia|recurso|apelacao|tribunal do juri|sentenca penal/gu],
 ]],
 [/direito penal/u,[
  ['Teoria do crime',/tipicidade|ilicitude|culpabilidade|dolo|culpa|tentativa|crime impossivel|legitima defesa|erro de tipo|erro de proibicao/gu],
  ['Penas e punibilidade',/pena|prescricao|punibilidade|concurso de crimes|dosimetria|livramento condicional/gu],
  ['Crimes contra a Administração Pública',/peculato|concusso|corrupcao|prevaricacao|desacato/gu],
  ['Crimes contra o patrimônio',/furto|roubo|estelionato|apropriacao indebita|receptacao|extorsao/gu],
 ]],
 [/direito civil/u,[
  ['Pessoas e negócios jurídicos',/capacidade civil|pessoa juridica|negocio juridico|nulidade|anulabilidade|personalidade/gu],
  ['Obrigações e contratos',/obrigacao|contrato|inadimplemento|mora|cessao de credito|compensacao/gu],
  ['Responsabilidade civil',/responsabilidade civil|dano moral|dano material|indenizacao|nexo causal/gu],
  ['Direitos reais',/usucapiao|posse|propriedade|condominio|usufruto|servidao/gu],
  ['Família e sucessões',/casamento|uniao estavel|regime de bens|alimentos|sucessao|heranca|testamento/gu],
 ]],
 [/processo civil|processual civil|direito processual$/u,[
  ['Atos processuais e tutela jurisdicional',/tutela|peticao inicial|citacao|contestacao|prazo processual|competencia/gu],
  ['Provas, sentença e coisa julgada',/prova|sentenca|coisa julgada|onus probatorio|pericia/gu],
  ['Recursos e execução',/agravo|apelacao|recurso especial|recurso extraordinario|embargos|execucao|cumprimento de sentenca/gu],
 ]],
 [/previdenciario/u,[
  ['Regimes e custeio da Previdência',/rgps|rpps|regime geral|regime proprio|contribuicao previdenciaria|segurado|dependente/gu],
  ['Benefícios previdenciários',/aposentadoria|pensao|auxilio|salario maternidade|carencia/gu],
  ['Previdência complementar',/previdencia complementar|entidade fechada|efpc|previc|cnpc|plano de beneficios|patrocinador/gu],
 ]],
 [/tributario/u,[
  ['Tributos e competência tributária',/tributo|imposto|taxa|contribuicao|competencia tributaria|imunidade|isencao/gu],
  ['Obrigação e crédito tributário',/lancamento|credito tributario|sujeito passivo|obrigacao tributaria|decadencia|prescricao|compensacao/gu],
 ]],
 [/contabilidade/u,[
  ['Patrimônio e demonstrações contábeis',/ativo|passivo|patrimonio liquido|balanco|demonstracao|escrituracao|debito|credito/gu],
  ['Mensuração e recuperabilidade de ativos',/recuperabilidade|impairment|valor recuperavel|depreciacao|amortizacao|exaustao|valor justo/gu],
  ['Custos e análise contábil',/custo|custeio|margem de contribuicao|ponto de equilibrio|indice de liquidez/gu],
  ['Contabilidade aplicada ao setor público',/mcasp|variacao patrimonial|balanco orcamentario|contabilidade publica|pcasp|restos a pagar/gu],
 ]],
 [/administracao publica|financeiro/u,[
  ['Orçamento público e responsabilidade fiscal',/orcamento|ppa|ldo|loa|receita publica|despesa publica|lrf|empenho|liquidacao|credito adicional/gu],
  ['Governança e políticas públicas',/governanca|politica publica|accountability|controle social|transparencia|gestao por resultados/gu],
  ['Planejamento e gestão pública',/planejamento|indicador|gestao de pessoas|gestao estrategica|organizacao administrativa/gu],
 ]],
 [/informatica|computacao/u,[
  ['Redes e protocolos de comunicação',/tcp|udp|ip|dns|http|protocolo|roteador|sub-rede|ethernet|firewall/gu],
  ['Segurança da informação',/criptografia|autenticacao|malware|ransomware|assinatura digital|seguranca da informacao|confidencialidade/gu],
  ['Bancos de dados',/banco de dados|sql|sgbd|normalizacao|transacao|chave primaria|relacional/gu],
  ['Programação e estruturas de dados',/algoritmo|programacao|python|javascript|java|recursividade|estrutura de dados|orientacao a objetos/gu],
  ['Engenharia e arquitetura de software',/engenharia de software|requisito|uml|scrum|teste de software|soa|soap|xml|wsdl/gu],
  ['Sistemas operacionais e aplicativos',/linux|windows|sistema operacional|planilha|excel|word|libreoffice|sistema de arquivos/gu],
 ]],
 [/medicina|enfermagem|saude coletiva/u,[
  ['Cardiologia e saúde cardiovascular',/cardiaco|insuficiencia cardiaca|infarto|arritmia|hipertensao arterial|eletrocardiograma/gu],
  ['Pneumologia e doenças respiratórias',/pneumonia|asma|dpoc|insuficiencia respiratoria|ventilacao mecanica|tuberculose/gu],
  ['Infectologia e imunização',/infeccao|antibiotico|vacina|hiv|sepse|dengue|hepatite/gu],
  ['Neurologia e psiquiatria',/neurolog|epilepsia|acidente vascular|esquizofrenia|depressao|transtorno|psiquiatr/gu],
  ['Saúde da mulher e obstetrícia',/gestacao|gestante|gravidez|pre natal|placenta|parto|puerperio|pre eclampsia/gu],
  ['Pediatria e saúde da criança',/recem nascido|neonato|pediatr|lactente|crescimento infantil|aleitamento/gu],
  ['Endocrinologia e metabolismo',/diabetes|glicemia|insulina|tireoide|hipotireoidismo|hipertireoidismo|cortisol/gu],
  ['Nefrologia e equilíbrio hidroeletrolítico',/insuficiencia renal|hemodialise|glomerular|sodio|potassio|acidose|alcalose/gu],
  ['Epidemiologia e saúde coletiva',/incidencia|prevalencia|mortalidade|epidemiologia|sus|vigilancia|saude coletiva|atencao primaria/gu],
  ['Assistência e processo de enfermagem',/processo de enfermagem|diagnostico de enfermagem|cuidado de enfermagem|sistematizacao da assistencia|nanda|cofen/gu],
 ]],
 [/odontologia/u,[
  ['Dentística e materiais restauradores',/resina|restaurac|adesivo|cimentacao|material dentario|faceta/gu],
  ['Endodontia',/endodont|canal radicular|polpa|pulpar|periapical/gu],
  ['Periodontia',/periodont|gengiv|biofilme|placa bacteriana/gu],
  ['Cirurgia e radiologia odontológica',/exodont|cirurgia|radiograf|tomograf|anestesia/gu],
  ['Saúde bucal e prevenção',/saude bucal|carie|fluor|prevencao|odontopediatria/gu],
 ]],
 [/educacao|pedagogia|professores/u,[
  ['Didática, currículo e avaliação',/didatica|curriculo|avaliacao|planejamento escolar|projeto politico pedagogico/gu],
  ['Desenvolvimento e aprendizagem',/aprendizagem|piaget|vygotsky|wallon|desenvolvimento cognitivo|construtivismo/gu],
  ['Legislação e políticas educacionais',/ldb|lei de diretrizes|bncc|plano nacional de educacao|diretrizes curriculares/gu],
  ['Educação inclusiva',/inclusao|educacao inclusiva|atendimento educacional especializado|deficiencia|acessibilidade/gu],
 ]],
]
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase()
export function assuntoEspecifico(materia,texto){
 const chave=norm(materia),base=norm(texto),candidatos=[]
 for(const [padrao,assuntos] of familias)if(padrao.test(chave))for(const [label,regex]of assuntos){
  const sinais=new Set([...base.matchAll(regex)].filter(m=>!/[a-z0-9]/u.test(base[m.index-1]||'')&&(m[0].length>4||!/[a-z0-9]/u.test(base[m.index+m[0].length]||''))).map(m=>m[0]))
  const score=[...sinais].reduce((n,s)=>n+(s.includes(' ')?3:1),0)
  if(score)candidatos.push({label,score,sinais:[...sinais]})
 }
 return candidatos.sort((a,b)=>b.score-a.score||b.label.length-a.label.length)[0]||null
}
