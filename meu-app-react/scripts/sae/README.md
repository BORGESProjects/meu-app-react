# Importação autorizada dos livros digitais

O usuário declarou possuir autorização para reprodução e publicação em 18/10/2026.
Escopo: todos os volumes de Química, Biologia, Física, Matemática, História, Geografia e Português.

## Classificação solicitada

- Exercícios sem identificação de prova: **Questões de assimilação**, sem ano de aplicação inventado.
- Exercícios identificados: banca/instituição e ano da referência original, quando indicados.
- Ano da edição do livro, datas históricas e datas bibliográficas não definem o ano da prova.
- Manter as indicações de adaptação e as atribuições que integram textos e imagens.
- Registrar livro, volume, capítulo, seção, número e referência de resolução separadamente para auditoria; não usar SAE como banca ou concurso.

`classificacao.mjs` implementa essa regra. O texto original não é alterado.
O resultado é uma classificação de origem, não uma confirmação independente da aplicação ou do gabarito.
Antes de publicar: conferir cada gabarito, preservar textos de apoio, fórmulas e imagens, separar alternativas e deduplicar o acervo.
Exercícios discursivos ou sem resposta verificável permanecem separados para revisão.

Validação: `node --test scripts/sae/classificacao.test.mjs`.

## Lote publicado: Modelos atômicos

`public/acervo/estudo-quimica-modelos/questoes.json` contém 29 questões conferidas do primeiro capítulo de Química. As sete figuras são recursos originais locais, sem alternativas embutidas. Tabelas são transcritas por linhas e colunas; subscritos/sobrescritos são preservados em Unicode quando necessários. A referência institucional é a declarada no exercício, não uma alegação de conferência do caderno oficial.

Dos 39 exercícios capturados neste capítulo, oito permanecem em quarentena (cinco sem resposta objetiva única e três com contradições no enunciado/gabarito) e duas cópias já presentes no acervo foram excluídas. A auditoria em `docs/acervo/estudo-quimica-modelos.json` registra IDs, recursos e motivos. Não republicar esses IDs nos próximos lotes. O restante dos 52 capítulos de Química ainda requer revisão; Biologia, Física, Matemática, História, Geografia e Português permanecem no escopo autorizado.

Os recortes antigos de `tmp/sae-importacao/paginas` apresentaram desalinhamento entre coordenadas e captura. Não os publicar sem nova conferência. Este lote usa os elementos e recursos originais preservados em `assets`, não esses recortes.

Reconstrução auditável: `node scripts/sae/publicar-modelos-atomicos.mjs` (exige os dados intermediários locais). Validação do resultado publicado: `node --test scripts/sae-lote-modelos.test.mjs`.

## Lote de Biologia: Seres vivos e taxonomia

`public/acervo/estudo-biologia-taxonomia/questoes.json` contém 18 questões revisadas, com 15 recursos visuais, inclusive cladogramas separados em cada alternativa. Dos 23 exercícios capturados no capítulo, quatro ficaram em quarentena (três sem resposta objetiva única e um com marcação incompatível com a grafia das alternativas) e uma cópia ENEM já publicada foi excluída. Auditoria: `docs/acervo/estudo-biologia-taxonomia.json`.

O formato `blocos_enunciado`/`blocos_opcoes` preserva a ordem dos parágrafos, imagens, ênfases, subscritos, sobrescritos e tabelas com células mescladas. A normalização elimina controles, links de resolução e atributos de marcação do gabarito. O site renderiza somente elementos de uma lista permitida, sem HTML executável, scripts ou imagens externas. Texto simples continua presente para busca e deduplicação; alternativas compostas apenas de diagramas recebem rótulos acessíveis.

Os quatro capítulos da primeira frente do Volume 1 de Biologia foram capturados (98 exercícios, 76 marcações únicas de gabarito). Esta publicação cobre apenas o primeiro capítulo. Vírus e fungos, bactérias e arqueas, algas e protozoários ainda precisam de revisão. Não confundir captura com publicação.

Reconstrução: `node scripts/sae/publicar-taxonomia.mjs`. Testes: `node --test scripts/sae-taxonomia.test.mjs`.

## Lote de Biologia: microrganismos

`public/acervo/estudo-biologia-microorganismos/questoes.json` reúne 48 questões: 15 de Vírus e fungos, 18 de Bactérias e arqueas e 15 de Algas e protozoários. Dos 75 registros, 26 ficam em quarentena e uma questão ENEM já existente é excluída como duplicata. A auditoria registra todos os IDs e os motivos, inclusive mistura de exercícios, alternativas repetidas, erros no gabarito e formatos não objetivos. Não inferir chaves ou apagar essas pendências.

O fluxograma do ENEM 2024 é recurso original local, com hash conferido. Tabelas mantêm células, linhas, subscritos e textos; `colgroup` vazio de conteúdo, que define apenas larguras, pode ser descartado sem eliminar dados. UTFPR, UCPel, ACAFE, FMP e FALBE são reconhecidas a partir da identificação explícita no exercício. O gabarito continua atribuído ao material de estudo autorizado, sem falsa alegação de validação em caderno oficial.

Reconstrução: `node scripts/sae/publicar-microorganismos.mjs`. Testes: `node --test scripts/sae-microorganismos.test.mjs`. Os quatro capítulos da Frente A / Volume 1 de Biologia ficam contabilizados: 98 registros, 66 publicados, 30 em quarentena e dois duplicados. Isso não conclui os demais volumes e matérias do escopo.

## Lote de História e recursos matemáticos

`public/acervo/estudo-historia-antiga/questoes.json`: 19 questões de Introdução à História e Civilizações da Antiguidade. Os 24 registros de origem ficam contabilizados com quatro pendências e uma duplicata UFPR já existente. Chaves contraditórias e informações históricas a conferir não foram alteradas por inferência. O texto integral sobre o IHGB permanece em seus parágrafos originais, com referência e comando; o marcador `apoio_integrado` é declarado apenas para esse item conferido. QR codes de resolução e contadores da interface são removidos sem apagar o conteúdo didático. Auditoria: `docs/acervo/estudo-historia-antiga.json`.

`publicar-lote.mjs` concentra a preparação e validação dos próximos lotes; cada configuração de publicação ainda exige revisão de conteúdo. O site preserva MathML semântico de uma lista permitida, inclusive frações, radicais e expoentes, recuperando apenas a fórmula semântica única dos contêineres MathJax. Fórmulas sem representação única, elementos não suportados ou recursos ausentes ficam separados. Imagens de frações permanecem na linha. A deduplicação considera a estrutura matemática, as tabelas e os hashes das figuras para não confundir expressões distintas com texto auxiliar idêntico.

`estado-acervo.mjs` consolida o inventário das sete matérias em `docs/acervo/estado-importacao-livros.json`. Captura, publicação, duplicata, quarentena e revisão pendente são contadas separadamente; o relatório não marca o escopo como concluído enquanto faltarem capítulos ou revisões. Capturas antigas sem recursos originais exigem recuperação. Recalcular após cada lote; não tratar a captura dos primeiros volumes como conclusão de todas as matérias.
