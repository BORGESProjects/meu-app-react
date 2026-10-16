# Acervo PF e PRF — cadernos conferidos

Este registro diferencia cadernos publicados de extrações ainda em revisão.

| Caderno | Itens no acervo | Anuladas | Itens corrigíveis |
| --- | ---: | ---: | ---: |
| PRF 2019 — Policial Rodoviário Federal | 120 | 12 | 108 |
| PF 2021 — Delegado de Polícia Federal | 120 | 4 | 116 |
| PRF 2021 — núcleo comum + Inglês e Espanhol | 128 | 11 | 117 |

A prova PRF vinculada ao edital de 2018 foi aplicada em 03/02/2019. O acervo usa o ano da aplicação. Não são cadernos administrativos nem cursos internos.

Cada diretório público contém `manifesto.json`, com endereço dos PDFs oficiais, resumos SHA-256 dos arquivos consultados e sequência de respostas do gabarito definitivo. Os itens anulados permanecem para consulta e são excluídos dos simulados. As alternativas são as duas respostas originais: Certo e Errado.

Os 240 enunciados e os comandos/textos/figuras compartilhados foram conferidos em recortes separados. Os itens PRF 24–26 preservam as vistas do sólido; 35–37, o desenho do tiro ao alvo; 45–46, o mapa rodoviário; 82–85, as figuras dos veículos. A área de rascunho foi descartada. Os limites das matérias foram revisados para esses dois cadernos.

## Reprodução

O extrator `scripts/importar_cebraspe.py` lê o PDF e seu gabarito definitivo e gera dados em quarentena. Ele distingue as duas colunas usuais de páginas finais com coluna única e preserva continuações entre colunas. `scripts/publicar_lotes_federais.py` prepara somente os cadernos expressamente aprovados na revisão. As entradas estão em `tmp/federais` e os resultados intermediários em `tmp/*-questoes-revisar.json`; os PDFs não são versionados.

## Ainda não concluído

Os demais cargos PF 2021 e todos os cargos policiais PF 2025 (incluindo Delegado e as 13 áreas de Perito) estão extraídos em `public/acervo/federais-em-revisao`, mas NÃO fazem parte destes lotes publicados. Precisam de revisão visual, conferência de contextos, classificação e associação aos cadernos antes da integração. Não contar essas extrações como acervo disponível no site. Ao reunir itens comuns a cargos diferentes, preservar cada associação e número original; não fundir afirmações curtas de casos diferentes.

Verificação desta entrega: 61 testes aprovados, incluindo as contagens, respostas, anuladas, arquivos de imagem e preservação dos 240 registros na união do acervo.

## PRF 2021 completa

São 112 itens comuns (9–120), 8 de Inglês e 8 de Espanhol (1–8). O acervo guarda 128 itens, sem duplicar os 112 comuns. Cada idioma forma uma prova de 120 itens, com 10 anuladas e 110 corrigíveis. As anuladas comuns são 39, 45, 67, 69, 76, 83, 89, 98 e 99; o item 1 é anulado em cada idioma.

Os três cadernos e gabaritos definitivos são do CDN oficial Cebraspe, concurso PRF_21. O manifesto registra cada bloco com números, respostas e resumos SHA-256 dos PDFs consultados. O texto-base de Inglês foi mantido integralmente na coluna esquerda, acompanhado do comando na direita. Em Espanhol, o texto ocupa a coluna esquerda e continua na direita; ambas as partes estão vinculadas aos oito itens. Os itens de Física 43–44 preservam o desenho do sistema projétil/bloco/mola. As opções originais são Certo e Errado, com rótulos C/E.

A seleção de idioma do simulado evita juntar as duas versões das questões 1–8. Testes verificam as contagens e a numeração 1–120 para ambos os idiomas, as respostas, a existência dos recortes e a presença do início e do final dos textos-base. Total após esta entrega: 63 testes aprovados.
