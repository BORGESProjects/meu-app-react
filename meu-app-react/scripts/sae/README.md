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
