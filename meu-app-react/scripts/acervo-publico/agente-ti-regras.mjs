const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/\s+/gu,' ')
const regras=[
 ['Informática','Sistemas operacionais: Windows e gerenciamento de arquivos',/\b(?:windows (?:7|8|10|11|server)|explorador de arquivos|windows explorer|gerenciador de tarefas do windows|lixeira do windows)\b/],
 ['Informática','Sistemas operacionais: Linux e comandos de terminal',/\b(?:sistema operacional linux|linux|distribuicao ubuntu|distribuicao debian|shell bash|comando (?:chmod|chown|sudo|grep|mkdir))\b/],
 ['Informática','Editores de texto: Microsoft Word',/\b(?:microsoft word|word 20\d\d|word 365|ms.word)\b/],
 ['Informática','Planilhas eletrônicas: Microsoft Excel',/\b(?:microsoft excel|excel 20\d\d|excel 365|no excel|do excel|ms.excel)\b/],
 ['Informática','Suítes de escritório: LibreOffice e OpenOffice',/\b(?:libreoffice|openoffice|br\.office|broffice)\b/],
 ['Informática','Apresentações: Microsoft PowerPoint',/\b(?:powerpoint|power point)\b/],
 ['Informática','Correio eletrônico: ferramentas e funcionamento',/\b(?:microsoft outlook|outlook 20\d\d|mozilla thunderbird|campo cco|copia oculta)\b/],
 ['Informática','Navegadores e mecanismos de busca',/\b(?:google chrome|mozilla firefox|microsoft edge|internet explorer|navegacao anonima|navegacao privativa)\b/],
 ['Informática','Bancos de dados: consultas SQL',/\b(?:sentenca sql|consulta sql|sql seguinte|select\b.{0,500}\bfrom\b|inner join|left (?:outer )?join|group by|having|order by)\b/],
 ['Informática','Bancos de dados: transações e controle de concorrência',/\b(?:propriedades acid|transacoes acid|isolamento de transacoes|atomicidade|serializabilidade|escalonamento serializavel|controle de concorrencia)\b/],
 ['Informática','Bancos de dados: NoSQL e armazenamento distribuído',/\b(?:nosql|mongodb|cassandra|couchdb|neo4j)\b/],
 ['Informática','Inteligência de negócios: data warehouse, OLAP e ETL',/\b(?:data warehouses?|data marts?|staging area|olap|esquema estrela|esquema floco de neve|extract transform load)\b/],
 ['Informática','Engenharia de software: requisitos',/\b(?:requisitos funcionais|requisitos nao funcionais|engenharia de requisitos|elicitacao de requisitos|rastreabilidade dos requisitos)\b/],
 ['Informática','Engenharia de software: UML e modelagem',/\b(?:uml|diagrama de classes|diagrama de casos de uso|diagrama de sequencia|diagrama de atividades)\b/],
 ['Informática','Engenharia de software: métodos ágeis e Scrum',/\b(?:scrum|product backlog|sprint backlog|scrum master|daily scrum|extreme programming)\b/],
 ['Informática','Desenvolvimento de sistemas: controle de versão com Git',/\b(?:git (?:commit|merge|rebase|clone|branch|pull|push)|comando git|repositorio git|sistema de controle de versao git)\b/],
 ['Informática','Programação: linguagem Python',/\b(?:linguagem python|em python|python 3|biblioteca pandas|biblioteca numpy|dataframe)\b/],
 ['Informática','Programação: linguagem Java',/\b(?:linguagem java|em java|java se|java ee|java virtual machine|jvm)\b/],
 ['Informática','Programação web: JavaScript e DOM',/\b(?:javascript|document object model|arvore dom)\b/],
 ['Informática','Programação web: HTML e CSS',/\b(?:html5?|css3?|folhas de estilo em cascata)\b/],
 ['Informática','Governança e gestão de TI: ITIL',/\bitil\b/],
 ['Informática','Governança e gestão de TI: COBIT',/\bcobit\b/],
 ['Informática','Computação em nuvem: modelos de serviço',/\b(?:infrastructure as a service|platform as a service|software as a service|iaas|paas|saas)\b/],
 ['Informática','Virtualização e contêineres',/\b(?:docker|kubernetes|hipervisores?|hypervisor|maquinas virtuais|conteineres? docker)\b/],
 ['Informática','Redes de computadores: endereçamento IP e sub-redes',/\b(?:ipv4|ipv6|mascara de sub.rede|enderecamento ip|endereco ip|enderecos ip|cidr)\b/],
 ['Informática','Redes de computadores: redes sem fio',/\b(?:ieee 802\.11|wpa2?|wep|wi.fi|wifi)\b/],
 ['Informática','Redes de computadores: roteamento',/\b(?:ospf|bgp|rip v2|protocolo rip|roteamento estatico|roteamento dinamico)\b/],
 ['Informática','Segurança da informação: cópias de segurança e recuperação',/\b(?:backup incremental|backup diferencial|backup completo|copias? de seguranca|backup full)\b/],
 ['Informática','Segurança da informação: controles de rede e firewall',/\b(?:firewall|sistema de deteccao de intrusao|sistema de prevencao de intrusao)\b/],
 ['Informática','Segurança da informação: gestão de riscos e normas ISO',/\b(?:iso\/?iec 2700[125]|iso 2700[125]|sistema de gestao de seguranca da informacao)\b/],
 ['Administração','Gestão de projetos: PMBOK, escopo e ciclo de vida',/\b(?:pmbok|gerente de projetos?|gerenciamento de projetos?|gestao de projetos?|ciclo de vida do projeto|escopo do projeto|termo de abertura do projeto)\b/],
 ['Administração','Planejamento estratégico: análise SWOT e diagnóstico organizacional',/\b(?:analise swot|matriz swot|matriz fofa|analise fofa)\b/],
 ['Administração','Gestão estratégica: Balanced Scorecard',/\b(?:balanced scorecard|balance scorecard)\b/],
 ['Administração','Gestão de processos: BPM, modelagem e redesenho',/\b(?:bpmn|business process management|business process model|gestao por processos|gestao de processos|processo redesenhado|redesenho de processos)\b/],
 ['Administração','Gestão de pessoas: avaliação de desempenho',/\b(?:avaliacao de desempenho|avaliacao 360 graus|avaliacao de 360 graus)\b/],
 ['Administração','Gestão de pessoas: remuneração e recompensas',/\b(?:remuneracao por competencias|remuneracao variavel|plano de cargos e salarios|politica salarial|equilibrio salarial)\b/],
 ['Administração','Comportamento organizacional: teorias da motivação',/\b(?:teoria dos dois fatores|hierarquia das necessidades de maslow|teoria da expectativa|teoria da expectancia|teoria de herzberg|teoria de maslow|teoria x e y|teorias x e y)\b/],
 ['Administração','Teorias da administração: escolas e modelos organizacionais',/\b(?:administracao cientifica|teoria classica da administracao|teoria burocratica|teoria contingencial|escola das relacoes humanas|teoria das relacoes humanas)\b/],
 ['Administração','Gestão de pessoas: gestão por competências',/\b(?:gestao por competencias|mapeamento de competencias|lacunas de competencias)\b/],
 ['Administração','Gestão da qualidade: Lean e Six Sigma',/\b(?:metodologia lean|producao enxuta|seis sigma|six sigma|lean manufacturing|lean six sigma)\b/],
 ['Arquivologia','Gestão documental: arquivos correntes, intermediários e permanentes',/\b(?:arquivos? correntes?|arquivos? intermediarios?|arquivos? permanentes?|massa documental acumulada)\b/],
 ['Arquivologia','Documentos digitais: SIGAD, e-ARQ e preservação',/\b(?:sigad|e.arq brasil|e.arq|repositorio arquivistico digital|documento arquivistico digital|documentos arquivisticos digitais)\b/],
 ['Arquivologia','Princípios arquivísticos: proveniência e organicidade',/\b(?:principio da proveniencia|principio da organicidade|principio da ordem original|respeito aos fundos|fundo arquivistico|fundos arquivisticos)\b/],
 ['Arquivologia','Descrição arquivística: normas e instrumentos de pesquisa',/\b(?:isad\(?g\)?|isaar\(?cpf\)?|nobrade|descricao arquivistica|instrumentos de pesquisa arquivistica)\b/],
 ['Arquivologia','Legislação arquivística e política nacional de arquivos',/\b(?:conarq|politica nacional de arquivos|sistema nacional de arquivos|proname)\b/],
 ['Biblioteconomia','Organização do conhecimento: classificação bibliográfica',/\b(?:classificacao decimal universal|classificacao decimal de dewey|notacao da cdu|notacao da cdd|tabelas auxiliares da cdu)\b/],
 ['Biblioteconomia','Serviços de informação: estudo de usuários',/\b(?:estudos? de usuarios?|estudos? dos usuarios?)\b/],
 ['Biblioteconomia','Serviços de informação: referência e atendimento',/\b(?:servico de referencia|entrevista de referencia|bibliotecario de referencia|servicos de referencia)\b/],
 ['Biblioteconomia','Organização do conhecimento: tesauros e indexação',/\b(?:tesauro|tesauros|linguagens documentarias|linguagem documentaria|politica de indexacao|indexacao bibliografica)\b/],
 ['Biblioteconomia','Desenvolvimento de coleções: seleção, aquisição e avaliação',/\b(?:desenvolvimento de colecoes|politica de desenvolvimento de colecoes|selecao bibliografica|desbastamento de colecoes)\b/],
 ['Biblioteconomia','Representação descritiva: RDA e modelos conceituais',/\b(?:rda|resource description and access|frbr|frad|ifla lrm)\b/],
 ['Biblioteconomia','Informação jurídica: LexML e fontes especializadas',/\b(?:lexml|bdjur|documentacao juridica|bibliotecario juridico)\b/],
 ['Biblioteconomia','Comunicação científica: bibliometria e indicadores',/\b(?:bibliometria|bibliometrico|bibliometricos|lei de bradford|lei de lotka|lei de zipf|fator de impacto)\b/],
]
export function classificarTI(q){
 const raw=String(q.enunciado||''),t=norm(raw)
 if(/^\s*[A-E][).]\s+\S/mu.test(raw)||/questao\s*\d|estao\s*\d|\uFFFD|\uFFFE/u.test(t))return null
 if(t.length<20||t.length>1800)return null
 if(/\b(?:julgue|justificativa|gabarito|conhecimentos basicos|conhecimentos especificos|according to|choose the|read the text)\b/.test(t))return null
 if(/\b(?:correcao gramatical|sentido original|sentidos do texto|no trecho|do texto|no texto|narrador|eu lirico|verbo|pronome|reescrito|reescrita)\b/.test(t))return null
 if(/^\s*\d{1,3}\s+\S/mu.test(raw))return null
 const matches=regras.filter(([, ,re])=>re.test(t))
 if(matches.length!==1)return null
 const [materia,conteudo,re]=matches[0]
 if(conteudo.includes('HTML e CSS')&&!/\b(?:elemento|tag|linguagem|codigo|pagina web|atributo|seletor|estilo|html5|css|marcacao)\b/.test(t))return null
 if(conteudo.includes('Linux')&&/apache|htpasswd|htaccess/.test(t))return null
 if(conteudo.includes('Informação jurídica')&&!/lexml|bdjur|bibliotec|base de dados|bases de dados|fontes de informacao/.test(t))return null
 if(conteudo.includes('avaliação de desempenho')&&/rentabilidade|divisoes|lucro|retorno sobre/.test(t))return null
 if(conteudo.includes('remuneração')&&/contratada|instrumento convocatorio|licitacao/.test(t))return null
 if(conteudo.includes('teorias da motivação')&&/psicologia humanista/.test(t))return null
 if(conteudo.includes('roteamento')&&/zuul|microservico|microsservico|api gateway/.test(t))return null
 if(conteudo.includes('requisitos')&&/sigads?|arquivistic/.test(t))return null
 if(conteudo.includes('requisitos')&&/analises? de cargos|postos de trabalho|caracteristicas comportamentais/.test(t))return null
 if(conteudo.includes('classificação bibliográfica')&&/poder executivo|documentos arquivisticos|plano de classificacao de documentos/.test(t))return null
 if(conteudo.includes('avaliação de desempenho')&&/psicossociais|carga de trabalho|magisterio|carreira do magisterio/.test(t))return null
 if(conteudo.includes('endereçamento IP')&&/ipsec|security association|encapsulating security payload/.test(t))return null
 if(conteudo.includes('requisitos')&&/pontos de funcao|estimativa|estimacao|medicao|metricas/.test(t))return null
 if(conteudo.includes('endereçamento IP')&&/\bdns\b|root server|resolucao de nomes/.test(t))return null
 if(conteudo.includes('análise SWOT')&&/riscos em projetos|risco do projeto/.test(t))return null
 if(conteudo.includes('avaliação de desempenho')&&/estagio probatorio|estabilidade|progressao funcional|lei n/.test(t))return null
 if(conteudo.includes('avaliação de desempenho')&&/\b(?:equipamentos?|sistemas?|processadores?|computadores?|servidores de rede|bancos? de dados?|algoritmos?)\b/.test(t))return null
 if(conteudo.includes('gestão por competências')&&/\b(?:licitacao|tribunal|competencia legislativa|jurisdicional)\b/.test(t))return null
 if(conteudo.includes('modelos conceituais')&&!/\b(?:catalog|bibliotec|aacr|recurso|regras|descricao|frbr|frad|ifla|resource description)/.test(t))return null
 if(conteudo.includes('transações e controle')&&!/\b(?:banco|bancos|dados|transacao|transacoes|sgbd|sql)\b/.test(t))return null
 if(conteudo.includes('estudo de usuários')&&!/bibliotec|informacao|bibliograf|coleco|acervo|documentario|leitor/.test(t))return null
 return {materia,conteudo,classificacao_pendente:false,classificacao_confianca:0.9,classificacao_metodo:'Objeto técnico explícito no enunciado; regras auditadas por amostra de grupo',classificacao_evidencia:t.match(re)[0]}
}
