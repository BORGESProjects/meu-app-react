# Coleta e triagem do material autorizado — 21/10/2026

Foram processados os inventários de todos os volumes e frentes das sete matérias solicitadas. Dos 348 capítulos, 347 foram capturados com os recursos originais disponíveis. Um capítulo permanece impedido na origem: o card **Troncos e esfera**, Matemática / Frente B / Volume 2, abre **Inequações produto e quociente**. A abertura foi repetida e o índice do leitor confirmou o conteúdo incorreto. O registro está em `pendencias-livros.json`; não foi feita substituição silenciosa.

| Matéria | Capítulos capturados | Registros | Aproveitáveis | Separados | Duplicados |
|---|---:|---:|---:|---:|---:|
| Química | 52/52 | 1.824 | 995 | 797 | 32 |
| Biologia | 54/54 | 1.384 | 952 | 398 | 34 |
| Física | 52/52 | 1.821 | 1.059 | 713 | 49 |
| Matemática | 67/68 | 3.062 | 1.662 | 1.338 | 62 |
| História | 48/48 | 969 | 685 | 223 | 61 |
| Geografia | 48/48 | 937 | 643 | 274 | 20 |
| Português | 26/26 | 455 | 304 | 127 | 24 |
| **Total** | **347/348** | **10.452** | **6.300** | **3.870** | **282** |

O lote novo contém **6.172 questões**; as 128 dos cinco lotes anteriores foram preservadas. Cada registro capturado tem um destino auditável: publicado, duplicado ou separado com motivo. Não há registros capturados aguardando essa triagem. Isso não significa que todos os exercícios da coleção tenham sido publicados.

Os itens separados incluem atividades discursivas, somatórias, ausência de marcação objetiva única, referências institucionais a conferir, alternativas repetidas, conflitos de gabarito, imagens ausentes na própria fonte e estruturas matemáticas ainda não suportadas. Não foram inventadas respostas, reconstruídas fórmulas por adivinhação nem convertidos subitens discursivos em alternativas. Os relatórios `estudo-*-colecao.json` conservam o motivo por ID.

Os dados publicados preservam parágrafos, tabelas, destaques, imagens, fórmulas MathML e a quantidade original de alternativas. Controles e marcações de resposta do livro são removidos dos blocos renderizados. A classificação usa a instituição e o ano explicitamente citados; sem identificação, usa **Questões de assimilação**, sem atribuir o ano do livro à prova.

## Limites da validação

A conferência automatizada verifica estrutura, contagens, marcação única da resposta, divergência quando a resolução declara uma letra, recursos locais, caracteres, referências e deduplicação. Foram inspecionados casos de texto-base, questões contíguas, fórmulas e imagens para ajustar a extração. Isso **não equivale à resolução independente das 6.300 questões**, nem à comparação de todas com cadernos oficiais. O gabarito e a identificação de origem continuam atribuídos ao material autorizado.

O estado detalhado está em `estado-importacao-livros.json`: `inventario_processado` e `triagem_concluida` são verdadeiros; `concluido` permanece falso para não ocultar as pendências da fonte e da quarentena. Os dados intermediários locais permitem revisar essas pendências sem recolher os capítulos novamente.

## Reprodução e verificações

Com as capturas locais em `tmp/sae-importacao`, executar `node scripts/sae/publicar-colecao-livros.mjs` e `node scripts/sae/estado-acervo.mjs`. O catálogo `src/data/livrosComplementares.json` registra contagem e hash de cada lote. O carregador rejeita falhas HTTP, contagem incompleta e IDs repetidos, sem tratá-los como acervo vazio.

Os testes de integração conferem as sete matérias, conservação dos destinos, hashes dos arquivos, estrutura dos blocos, respostas dentro das alternativas e sobrevivência dos IDs na união do acervo. A auditoria geral verifica também as fontes anteriores e os snapshots locais do banco; suas pendências antigas não são tratadas como questões novas aprovadas.

Validação desta entrega: 215 testes aprovados, compilação de produção aprovada e análise estática dos módulos novos aprovada. A auditoria geral encontrou zero arquivos locais ausentes; as 37.942 imagens referenciadas foram integralmente decodificadas, sem falhas. Nenhuma questão dos sete lotes novos foi sinalizada pelas regras estruturais da auditoria. Esses resultados não substituem a conferência pedagógica independente indicada acima.
