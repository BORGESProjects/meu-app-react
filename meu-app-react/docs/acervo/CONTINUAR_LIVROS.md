# Importação autorizada dos livros

Escopo: todos os volumes e frentes de Química, Biologia, Física, Matemática, História, Geografia e Português. O usuário confirmou autorização de reprodução e publicação. Não retomar tarefas antigas de concursos nesta execução.

## Publicados

- Modelos atômicos: 29.
- Taxonomia: 18.
- Microrganismos: 48.
- História antiga: 19.
- Introdução à Geografia: 14.

Total desta sequência: 128 questões. Os relatórios `estudo-*.json` discriminam publicadas, duplicadas, quarentena e recursos. `estado-importacao-livros.json` distingue captura de revisão/publicação. O trabalho não está concluído.

## Retomada

As capturas originais e filas persistentes estão em `tmp/sae-importacao`: `inventario.json`, `capitulos`, `assets`, `fila-<materia>.json` e `coordenacao.json`. Os IDs de abas são temporários; devem ser conferidos no inventário do navegador antes de reutilizar. `scripts/sae/coordenacao.mjs` executa rodadas limitadas e sequenciais usando apenas a interface autorizada. Não paralelizar cliques, não usar requisições autenticadas fora do navegador e não considerar captura como publicação.

Preferir recursos nativos. Os antigos recortes de página inteira estão desalinhados e não devem ser publicados. A recuperação opcional via downloadMedia está desativada: pode travar, e arquivos 404 não se recuperam assim.

## Matemática com recursos ausentes

O usuário informou que não tem PDF de Matemática, Frente A, Volume 2. Recuperar questões identificadas em cadernos oficiais; manter as demais incompletas em quarentena.

A fórmula da questão 33 do livro, identificada como Fuvest 2020, foi conferida visualmente na página 7 do caderno V, questão 20, e a resposta A no gabarito oficial. A substituição exata, com verificações de alternativas e recurso, está em `recuperacoes-oficiais.mjs`. A recuperação estará disponível para o futuro lote de Matemática; esse lote ainda não foi publicado. Os PDFs e páginas renderizadas de conferência estão em `tmp/pdfs/sae-recuperacao`.

Não inferir fórmulas, gabaritos ou anos. Não converter referência desconhecida em assimilação por falha de reconhecimento. Há referências adicionais ainda a mapear, e questões somatórias/discursivas ainda exigem tratamento específico.
