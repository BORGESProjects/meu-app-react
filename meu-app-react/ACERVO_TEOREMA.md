# Importação do pacote Teorema Militar

## Material recebido

O CSV contém 2.345 registros vinculados a 154 nomes de PDFs, além de 717
imagens antigas. O relatório de origem declara 180 PDFs recebidos e 179 únicos;
nem todos produziram registros neste CSV. Os 154 PDFs referenciados foram
localizados. Os arquivos originais foram preservados.

A importação direta fornecida no pacote foi descartada por misturar questões,
alternativas e gabaritos. As imagens publicadas foram reconstruídas dos PDFs,
com enunciado separado das alternativas, na quantidade original de quatro ou
cinco opções. Nenhuma chave de serviço ou senha foi adicionada à publicação.

## Primeiro lote — 19/10/2026

Foram publicadas 102 questões de Geografia, com 602 imagens, 20 gabaritos do
CSV corrigidos e 11 questões de assimilação. Commits f775bf10 e f0f8027d.
O lote permanece preservado, incluindo seus identificadores e progresso.

## Revisão dos 2.242 pendentes — 20/10/2026

- 2.053 novas questões aprovadas e incorporadas ao acervo público.
- 22 registros repetidos não adicionados.
- 167 registros retidos para revisão individual; não foram publicados.
- 1.018 respostas divergentes do CSV corrigidas pelo gabarito do material.
- 309 novas questões sem instituição identificada agrupadas como questões de assimilação, sem ano fictício.
- 11.964 novas imagens WebP verificadas; total do lote público: 2.155 questões.

Foram conferidos a associação entre CSV e PDF por texto e alternativas,
numerações repetidas por nível, respostas, quantidade de opções, arquivos
visuais e aceitação pela interface. Fórmulas, gráficos, tabelas e textos-base
são preservados em recortes. Houve amostragem visual, incluindo frações,
potências, raízes, estruturas químicas, continuações entre colunas e páginas.
Limites visuais não comprovados continuam retidos. Essa conferência estrutural
não equivale à leitura manual integral de todos os itens nem à validação de
cada resposta em um gabarito oficial externo: a referência é o gabarito do
material fornecido.

A camada com identificação pessoal encontrada em um PDF foi removida de uma
cópia local antes da renderização, preservando o conteúdo das questões. Os
originais não foram alterados. PDFs completos e arquivos privados não fazem
parte da publicação.

O resultado de cada registro está no relatório local
`output/revisao-2242-teorema.csv`. O resumo e os casos retidos estão em
`docs/teorema-revisao-2242.json`. Os arquivos intermediários ficam em
`tmp/teorema-180-revisao/`, fora da publicação.

## Integração e continuidade

O lote está em `public/acervo/teorema-180/questoes.json`, carregado junto aos
demais arquivos do acervo. Não houve inserção duplicada na tabela Supabase.
O carregamento exige a contagem completa do lote e a união distingue fórmulas
visualmente diferentes, mesmo quando seu texto auxiliar é igual.

Os scripts novos em `scripts/teorema/` separam extração, reconciliação,
renderização, validação e preparação da publicação. Dependências locais:
pdfplumber, pypdf, pypdfium2, Pillow e NumPy. Os scripts antigos de coluna
única são históricos; não devem substituir o lote público atual.

Uma continuação deve partir dos 167 registros retidos, sem refazer as questões
publicadas. A reconciliação preserva identificadores já vinculados aos registros
CSV. Nova publicação exige revisão e testes; gerar imagens por si só não
aprova um registro. A automação antiga de ampliação do acervo segue pausada.
