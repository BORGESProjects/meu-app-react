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
