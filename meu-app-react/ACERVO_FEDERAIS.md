# Acervo PF e PRF — cadernos conferidos

Este registro diferencia cadernos publicados de extrações ainda em revisão.

| Caderno | Itens no acervo | Anuladas | Itens corrigíveis |
| --- | ---: | ---: | ---: |
| PRF 2019 — Policial Rodoviário Federal | 120 | 12 | 108 |
| PF 2021 — Delegado de Polícia Federal | 120 | 4 | 116 |
| PRF 2021 — núcleo comum + Inglês e Espanhol | 128 | 11 | 117 |
| PF 2021 — Agente, Escrivão e Papiloscopista (sem duplicatas) | 153 | 7 | 146 |
| PF 2025 - Delegado de Polícia Federal | 120 | 6 | 114 |
| PF 2025 - Agente, Escrivão e Papiloscopista (sem duplicatas) | 168 | 12 | 156 |
| PF 2025 - Perito Criminal Federal - Área 1 Contábil-Financeira | 120 | 10 | 110 |
| PF 2025 - Perito Criminal Federal - Área 2 Engenharia Elétrica/Eletrônica | 120 | 4 | 116 |
| PF 2025 - Perito Criminal Federal - Área 3 Informática Forense | 120 | 5 | 115 |
| PF 2025 - Perito Criminal Federal - Área 5 Geologia Forense | 120 | 8 | 112 |
| PF 2025 - Perito Criminal Federal - Área 7 Engenharia Civil | 120 | 7 | 113 |
| PF 2025 - Perito Criminal Federal - Área 11 Engenharia Cartográfica | 120 | 6 | 114 |
| PF 2025 - Perito Criminal Federal - Área 12 Medicina Legal | 120 | 6 | 114 |
| PF 2025 - Perito Criminal Federal - Área 16 Física Forense | 120 | 7 | 113 |
| PF 2025 - Perito Criminal Federal - Área 17 Engenharia de Minas | 120 | 5 | 115 |

A prova PRF vinculada ao edital de 2018 foi aplicada em 03/02/2019. O acervo usa o ano da aplicação. Não são cadernos administrativos nem cursos internos.

Cada diretório público contém `manifesto.json`, com endereço dos PDFs oficiais, resumos SHA-256 dos arquivos consultados e sequência de respostas do gabarito definitivo. Os itens anulados permanecem para consulta e são excluídos dos simulados. As alternativas são as duas respostas originais: Certo e Errado.

Os 240 enunciados e os comandos/textos/figuras compartilhados foram conferidos em recortes separados. Os itens PRF 24–26 preservam as vistas do sólido; 35–37, o desenho do tiro ao alvo; 45–46, o mapa rodoviário; 82–85, as figuras dos veículos. A área de rascunho foi descartada. Os limites das matérias foram revisados para esses dois cadernos.

## Reprodução

O extrator `scripts/importar_cebraspe.py` lê o PDF e seu gabarito definitivo e gera dados em quarentena. Ele distingue as duas colunas usuais de páginas finais com coluna única e preserva continuações entre colunas. `scripts/publicar_lotes_federais.py` prepara somente os cadernos expressamente aprovados na revisão. As entradas estão em `tmp/federais` e os resultados intermediários em `tmp/*-questoes-revisar.json`; os PDFs não são versionados.

## Ainda não concluído

As outras 4 áreas de Perito Criminal Federal PF 2025 estão extraídas em `public/acervo/federais-em-revisao`, mas NÃO fazem parte destes lotes publicados. Precisam de revisão visual, conferência de contextos, classificação e associação aos cadernos antes da integração. Delegado, Agente, Escrivão, Papiloscopista e Perito Áreas 1 Contábil-Financeira, 2 Engenharia Elétrica/Eletrônica , 3 Informática Forense, 5 Geologia , 7 Engenharia Civil, 11 Engenharia Cartográfica , 12 Medicina Legal, 16 Física e 17 Engenharia de Minas estão concluídos nos lotes descritos abaixo. Não contar as extrações em quarentena como acervo disponível no site. Ao reunir itens comuns a cargos diferentes, preservar cada associação e número original; não fundir afirmações curtas de casos diferentes.

Verificação desta entrega: 61 testes aprovados, incluindo as contagens, respostas, anuladas, arquivos de imagem e preservação dos 240 registros na união do acervo.

## PRF 2021 completa

São 112 itens comuns (9–120), 8 de Inglês e 8 de Espanhol (1–8). O acervo guarda 128 itens, sem duplicar os 112 comuns. Cada idioma forma uma prova de 120 itens, com 10 anuladas e 110 corrigíveis. As anuladas comuns são 39, 45, 67, 69, 76, 83, 89, 98 e 99; o item 1 é anulado em cada idioma.

Os três cadernos e gabaritos definitivos são do CDN oficial Cebraspe, concurso PRF_21. O manifesto registra cada bloco com números, respostas e resumos SHA-256 dos PDFs consultados. O texto-base de Inglês foi mantido integralmente na coluna esquerda, acompanhado do comando na direita. Em Espanhol, o texto ocupa a coluna esquerda e continua na direita; ambas as partes estão vinculadas aos oito itens. Os itens de Física 43–44 preservam o desenho do sistema projétil/bloco/mola. As opções originais são Certo e Errado, com rótulos C/E.

A seleção de idioma do simulado evita juntar as duas versões das questões 1–8. Testes verificam as contagens e a numeração 1–120 para ambos os idiomas, as respostas, a existência dos recortes e a presença do início e do final dos textos-base. Total após esta entrega: 63 testes aprovados.

## PF 2021 — Agente, Escrivão e Papiloscopista

Os três cadernos completos têm 120 itens cada: 115 corrigíveis para Agente, 115 para Escrivão e 116 para Papiloscopista. O acervo guarda 153 questões únicas e 360 associações às posições originais. Não há conflito entre os gabaritos dos itens compartilhados. Os recortes, páginas e enunciados de cada origem são preservados em `origens_provas`. O simulado recupera esses dados pela prova escolhida; por exemplo, a questão 102 de Agente corresponde à 97 de Escrivão, com recortes e números próprios. A seleção mantém um mesmo identificador de questão para o progresso do usuário.

A deduplicação compara afirmação e contexto completos; ignora somente a numeração inicial, quebras de linha, aspas tipográficas equivalentes, espaço antes de parêntese e o título de bloco. Casos distintos das questões 34–36 de Papiloscopista permanecem separados. Nenhuma questão é fundida com base somente no texto curto de sua afirmação.

Foram preservados os dois textos de Português; as tabelas e fórmulas de Estatística; o gráfico de faixas etárias (77–78); os códigos Python/R; a tabela patrimonial de Agente; o texto de genética e as figuras de óptica e reação química de Papiloscopista. Os numeradores da questão 42 passaram a ser incluídos integralmente sem vazar para a 41. A continuação da questão 108 de Agente (103 de Escrivão) foi unida à afirmação. Novos casos hipotéticos não herdam comandos de matérias anteriores.

O manifesto registra os três cadernos e gabaritos definitivos oficiais da Polícia Federal, as sequências de respostas e os resumos SHA-256. `scripts/publicar_pf2021_operacionais.py` reproduz o lote a partir dos resultados intermediários revisados. Os testes verificam cada posição, resposta, anulada, recorte, associação, ordem e regra de deduplicação.

## PF 2025 - Delegado

O lote `pf-2025-delegado` preserva os 120 itens originais em Certo/Errado, dos quais 114 são corrigíveis. Os itens 2, 3, 10, 14, 35 e 78 foram anulados no gabarito definitivo e ficam fora dos simulados. Foram conferidas as seis páginas oficiais, os 120 recortes individuais e os 38 comandos e textos compartilhados. A mudança de página entre os itens 63 e 64 não interrompe o comando do grupo. Os casos de Caetano/Ana, da investigação com relatório do COAF, da licença em restinga e da apreensão de produtos florestais mantêm o texto integral, sem herdar comandos de matérias anteriores.

As matérias seguem os blocos conferidos no caderno, incluindo Direitos Humanos (25–34) e Direito Ambiental (113–120). O manifesto contém os endereços oficiais PF, hashes dos PDFs, gabarito completo e anuladas. Os dois PDFs foram novamente consultados na origem oficial e seus hashes conferem com os utilizados. O publicador `scripts/publicar_pf2025_delegado.py` mantém as decisões específicas de associação dos comandos. Validação: 69 testes aprovados, incluindo posições por simulado, deduplicação, respostas e integridade das associações de casos hipotéticos.

## PF 2025 - Agente, Escrivão e Papiloscopista

O lote `pf-2025-operacionais` guarda 168 itens únicos, 96 compartilhados pelos três cargos e 24 específicos de cada cargo. São 360 posições oficiais, sem duplicar o núcleo comum no banco. Escrivão e Papiloscopista têm 112 itens corrigíveis cada; Agente tem 110. As 12 anuladas únicas ficam para consulta e fora dos simulados. O manifesto traz os cinco cadernos/blocos oficiais, os gabaritos definitivos, hashes e respostas por cargo. Os dez PDFs foram novamente conferidos diretamente nas fontes oficiais da PF.

Foram revisadas as 11 páginas e os 168 recortes, incluindo texto literário integral, tabela-verdade do item 53, listas/conclusões dos itens 54, 55 e 60, fórmulas de Estatística, SQL dos itens 91–92, lançamentos contábeis, balancete de Agente, ponte de resistores e expressões de Física, além da página final de Química em coluna única. Instruções gerais da capa não integram mais o texto-base. Cada grupo recebe somente seu comando revisado; casos de alto-mar e estatística não herdam comandos anteriores. Os três cargos recuperam numeração, imagem, apoio e fonte em `origens_provas`.

Reprodução: `scripts/publicar_pf2025_operacionais.py --reextrair`. As exceções de segmentação dos itens 54,55,60 estão explícitas e verificadas em testes. A associação de comandos segue os limites conferidos no PDF. O extrator reconhece cabeçalhos menores (9,96 pt), preserva enumerações internas nesses itens e encerra recortes antes da área de rascunho.

## PF 2025 - Perito: Área 1 Contábil-Financeira

A primeira área completa de Perito reúne os 50 conhecimentos básicos e os 70 específicos: 120 itens, dos quais 110 corrigíveis. Anuladas: 18,19,31,38,53,67,80,82,94,114. O lote cumulativo `pf-2025-peritos` só associa o núcleo comum às áreas específicas efetivamente revisadas. As demais áreas não aparecem como simulados incompletos de 50 itens.

Foram conferidas as sete páginas e os 120 recortes. Incluem-se o texto de Português sobre IA, casos independentes de processo penal, proposições lógicas, gráfico de juros simples/compostos, boxplot, modelo de regressão, tabela de frequências e Python completo com a saída indicada na prova. Casos de SAC, desconto de duplicata, boxplot e JSON foram desvinculados de comandos anteriores. Os quatro PDFs oficiais (básicos/específicos e respectivos gabaritos) foram novamente comparados por SHA-256.

O publicador `scripts/publicar_pf2025_peritos.py` contém a lista explícita de áreas aprovadas e suas fronteiras de comandos e matérias. Adições futuras ampliam essa mesma coleção e as associações do núcleo comum, sem duplicá-lo. A seleção por cargo, gabarito oficial, não duplicação do núcleo comum e regressões de contextos, gráficos e código são verificadas em testes.

## PF 2025 - Perito: Áreas 2 e 3

Engenharia Elétrica/Eletrônica e Informática Forense completas: 120 posições por prova, incluindo o núcleo comum de 50 itens, sem replicá-lo no acervo. O lote cumulativo contém 260 questões únicas e três provas completas. Engenharia Elétrica tem 116 itens corrigíveis; Informática segue o gabarito definitivo registrado no manifesto. Foram revisadas as sete páginas específicas e os 140 recortes. Preservadas as frações de sistemas discretos, o contexto da teoria da decisão, PHP/SQL, a sequência de permissões Linux e o diagrama Diffie-Hellman. Corrigidos os cortes internos nos itens 82, 93 e 98 de Informática e os fragmentos de linhas vizinhas em ambas as áreas. Fontes e hashes constam no manifesto; reprodução: `scripts/publicar_pf2025_peritos.py --reextrair`.

## PF 2025 - Perito: Geologia e Engenharia Civil

Mais duas provas completas com 120 posições cada, mantendo os 50 itens comuns compartilhados. O lote cumulativo passa a 400 questões únicas em cinco provas completas. Revisadas as seis páginas específicas, 140 recortes e os limites dos contextos: Formação Serra Geral, caracterização dos minerais, aterro com dados de volume/peso/umidade e contrato de reforma da PF. A classificação específica usa Geologia e Engenharia Civil, com agrupamentos por assunto. Eliminados fragmentos de linhas anteriores em sete recortes.

## PF 2025 - Perito: Engenharia Cartográfica e Medicina Legal

Duas provas adicionais completas de 120 posições. O núcleo de 50 itens permanece compartilhado, totalizando 540 questões únicas para sete áreas. Revisadas as seis páginas e os 140 recortes, incluindo a imagem de satélite do item 112 e a matriz de classificação de 430 pixels dos itens 117–120 de Cartográfica. Em Medicina Legal, os itens 63–64 continuam associados ao comando 59 e os 115–116 ao comando 112, apesar da mudança de coluna. Corrigidos nove recortes com fragmentos da linha anterior. Gabaritos definitivos e hashes no manifesto.

## PF 2025 - Perito: Física e Engenharia de Minas

Mais duas provas completas: 120 posições por área. O lote cumulativo possui 672 questões únicas em nove áreas, após reunir oito afirmações de legislação idênticas entre Geologia e Minas. Cada uma preserva em `origens_provas` o número, imagem, comando e caderno de origem; os simulados recuperam a numeração própria. Não foram fundidas fórmulas ou casos apenas semelhantes. Revisadas as oito páginas específicas e os 140 recortes, os diagramas eletromagnéticos e termodinâmico, projeção estereográfica, convergência/confinamento, tabela de fragmentos e perfil de solo. Física mantém as frações e a página final de coluna inteira.
