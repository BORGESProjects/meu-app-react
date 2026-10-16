# Acervo PF e PRF — cadernos conferidos

Este registro diferencia cadernos publicados de extrações ainda em revisão.

| Caderno | Itens no acervo | Anuladas | Itens corrigíveis |
| --- | ---: | ---: | ---: |
| PRF 2019 — Policial Rodoviário Federal | 120 | 12 | 108 |
| PF 2021 — Delegado de Polícia Federal | 120 | 4 | 116 |

A prova PRF vinculada ao edital de 2018 foi aplicada em 03/02/2019. O acervo usa o ano da aplicação. Não são cadernos administrativos nem cursos internos.

Cada diretório público contém `manifesto.json`, com endereço dos PDFs oficiais, resumos SHA-256 dos arquivos consultados e sequência de respostas do gabarito definitivo. Os itens anulados permanecem para consulta e são excluídos dos simulados. As alternativas são as duas respostas originais: Certo e Errado.

Os 240 enunciados e os comandos/textos/figuras compartilhados foram conferidos em recortes separados. Os itens PRF 24–26 preservam as vistas do sólido; 35–37, o desenho do tiro ao alvo; 45–46, o mapa rodoviário; 82–85, as figuras dos veículos. A área de rascunho foi descartada. Os limites das matérias foram revisados para esses dois cadernos.

## Reprodução

O extrator `scripts/importar_cebraspe.py` lê o PDF e seu gabarito definitivo e gera dados em quarentena. Ele distingue as duas colunas usuais de páginas finais com coluna única e preserva continuações entre colunas. `scripts/publicar_lotes_federais.py` prepara somente os cadernos expressamente aprovados na revisão. As entradas estão em `tmp/federais` e os resultados intermediários em `tmp/*-questoes-revisar.json`; os PDFs não são versionados.

## Ainda não concluído

Os demais cargos PF 2021, todos os cargos policiais PF 2025 (incluindo Delegado e as 13 áreas de Perito) e PRF 2021 com Inglês/Espanhol estão extraídos em `public/acervo/federais-em-revisao`, mas NÃO fazem parte destes lotes publicados. Precisam de revisão visual, conferência de contextos, classificação e associação aos cadernos antes da integração. Não contar essas extrações como acervo disponível no site. Ao reunir itens comuns a cargos diferentes, preservar cada associação e número original; não fundir afirmações curtas de casos diferentes.

Verificação desta entrega: 61 testes aprovados, incluindo as contagens, respostas, anuladas, arquivos de imagem e preservação dos 240 registros na união do acervo.
