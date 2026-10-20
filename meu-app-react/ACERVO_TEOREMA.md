# Importação do pacote Teorema Militar

## Lote 1 — 19/10/2026

O pacote recebido contém 2.345 registros de 154 PDFs distintos referenciados no
CSV completo, além de 717 imagens. O relatório de origem declara 180 PDFs
recebidos e 179 únicos processados; esses números não equivalem à quantidade
de arquivos com questões efetivamente presentes no CSV.

A importação direta do script fornecido no pacote foi descartada: há questões
misturadas, respostas divergentes do gabarito e recortes de coluna que cortam
texto ao meio. Os arquivos originais do pacote permanecem intactos.

Foram localizados de forma única 152 dos 154 PDFs referenciados, em uma pasta
local do usuário. Nenhuma chave de serviço foi solicitada ou enviada ao site.

### Publicação

- 102 questões de Geografia reconstruídas a partir dos PDFs originais.
- 602 imagens WebP: enunciado separado de cada alternativa; quantidade original
  de quatro ou cinco alternativas preservada.
- 20 respostas do CSV corrigidas pelo gabarito do material. Não se afirma que
  esses gabaritos de apostila foram todos confrontados com provas oficiais.
- 11 questões sem identificação agrupadas em “Questões de assimilação”, sem
  ano fictício; as demais mantêm a instituição e somente o ano explicitado.
- Uma questão semelhante já existente não foi adicionada.
- Nove identificações de banca divergentes permanecem para conferência.

Os recortes foram conferidos visualmente, inclusive continuações entre páginas,
mapas, tabelas, fontes e alternativas. O lote é servido junto ao acervo estático
existente, em `public/acervo/teorema-180/questoes.json`; não foi inserido novamente
na tabela Supabase, evitando duas cópias do mesmo lote.

### Pendências — não publicar automaticamente

Dos 2.345 registros, 2.233 não passaram pela reconstrução conservadora de coluna
única. Precisam de extração específica para colunas, textos compartilhados,
alternativas na mesma linha ou gabaritos em outros formatos. Somados às nove
identificações pendentes, são 2.242 registros ainda em revisão; a duplicata é
contabilizada separadamente. Não presumir que todos sejam defeituosos: o
extrator deliberadamente rejeita estruturas que não consegue comprovar.

O diagnóstico detalhado, as fontes locais, o CSV e as imagens de conferência
ficam em `tmp/teorema-180-revisao/`, fora da publicação. Scripts de conferência:
`scripts/teorema/auditar_pacote.py` e `scripts/teorema/preparar_lote.py`.

Reexecutar a preparação exige nova revisão visual antes de substituir o lote
público; a geração de imagens por si só não autoriza sua publicação.
