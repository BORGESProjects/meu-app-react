# Levantamento de fontes militares oficiais — 2006–2026

**Conferência:** 25/10/2026. Intervalo de 20 anos considerado: 2006–2026, inclusive.

## Resultado desta etapa

Este levantamento não contém PDFs novos baixados nem questões novas integradas. Os portais foram consultados e comparados ao banco local; a tentativa de download dos arquivos oficiais não completou neste ambiente. A conexão de saída do terminal foi bloqueada e os links diretos de PDF da Marinha retornaram erro/visualização em branco no navegador.

## O que os portais exibem atualmente

| Concurso | Arquivos de prova exibidos no portal consultado | Observações |
|---|---|---|
| EEAR | Catálogo dinâmico de provas anteriores; a página indexada mostra edições recentes e entradas de CFS/EAGS com cadernos e gabaritos | A página não expôs uma lista estática completa que permita certificar os 20 anos nesta conferência. |
| EAM | 2020–2026 | A página disponibiliza arquivos de prova de 2020 a 2026; a seção separada de gabaritos apresenta 2021–2026. O ZIP de 2026 não foi baixado nem aberto. |
| CFN | 2021–2026 | O catálogo separa os concursos de Soldado e Músico. Há edições recentes com gabaritos em PDF e em ODS. |
| Colégio Naval | 2021–2026 | A página lista arquivos anuais de prova, alguns empacotados em ZIP. |
| Escola Naval | 2020–2026 | A página lista arquivos anuais de prova, alguns empacotados em ZIP. |

Essas listas demonstram disponibilidade das edições indicadas nas páginas consultadas, não a existência de uma prova para cada ano nem a cobertura integral de 2006–2026.

## Registros já existentes no banco local

Contagem por nome de banca ou concurso nos 25.495 registros de `native/acervo/questoes.json`. Registros sem ano são separados porque não permitem atribuir uma edição com segurança.

| Concurso | Total encontrado | Com ano identificável | Anos identificáveis | Sem ano |
|---|---:|---:|---|---:|
| EEAR | 1.897 | 275 | 2006–2020, 2022–2023 | 1.622 |
| EAM | 315 | 27 | 2008–2009, 2012, 2016–2019, 2022 | 288 |
| CFN | 356 | 308 | 2006, 2017–2025 | 48 |
| Colégio Naval | 325 | 46 | 1997, 2004, 2009–2011, 2014–2020, 2022 | 279 |
| Escola Naval | 87 | 84 | 2012–2020 | 3 |

Esses totais não certificam edições completas: parte substancial dos registros não tem ano atribuído, e não foi possível comparar cada caderno com seu gabarito nesta etapa.

## Materiais de origem já existentes no projeto

- Foram localizados pacotes do CFN para 2019–2025 em `tmp/fontes-cfn/`.
- O lote carregado pela aplicação em `public/acervo/cfn-2020-2025/questoes.json` contém 300 itens (50 por ano, de 2020 a 2025).
- O material de 2019 tem caderno ODS, gabarito ODS e imagens digitalizadas. O extrator existente falha ao localizar a questão 11 após a questão 10. Além disso, a numeração das páginas OCR não coincide com a numeração impressa nas imagens conferidas. Assim, o texto não pode ser associado com segurança às páginas de apoio e o ano de 2019 ainda não foi integrado.
- Não encontrei arquivos de prova locais identificáveis para EEAR, EAM, Colégio Naval ou Escola Naval nas pastas de origem examinadas. O acervo de 19 GB em D: tampouco trouxe arquivos correspondentes a esses cinco concursos.

Não acrescentei o lote de 2019 à aplicação porque a extração interrompe antes de produzir as 50 questões completas. Também não publiquei novos arquivos. O portal do CFN declara CC BY-ND 3.0, que não autoriza distribuir uma versão adaptada; isso deve ser resolvido antes de disponibilizar questões convertidas no site público.

## Licença e publicação no site

O portal do CFN declara licença **Creative Commons BY-ND 3.0**. A licença permite redistribuir o material sob atribuição, mas não permite distribuir material modificado. Converter cadernos em questões estruturadas, separar enunciados e alternativas ou ajustar textos é uma adaptação; não publique esse conteúdo convertido sem uma autorização que cubra a adaptação. Os demais portais da Marinha remetem a uma licença institucional, mas a página aberta não esclarece os termos aplicáveis aos PDFs. O portal da EEAR também não expôs uma licença específica dos cadernos consultados.

Para integrar questões e gabaritos na versão pública do AP Aprovado, é necessário obter os arquivos e confirmar uma licença/autorização que cubra a extração e a redistribuição em formato de banco de questões. Até lá, a alternativa segura é manter apenas metadados e links para as páginas oficiais, sem copiar o conteúdo dos cadernos para produção.

## Fontes oficiais

- [EEAR — provas anteriores](https://ingresso.eear.fab.mil.br/SOO/home/provas_anteriores.php)
- [SSPM — Escola de Aprendizes-Marinheiros](https://www.marinha.mil.br/sspm/escola-aprendizes/eam_princ)
- [CPesFN — provas anteriores](https://www.marinha.mil.br/cpesfn/provas-anteriores)
- [SSPM — Colégio Naval](https://www.marinha.mil.br/sspm/colegionaval/a-cn-provag)
- [SSPM — Escola Naval](https://www.marinha.mil.br/sspm/node/95)
- [Creative Commons BY-ND 3.0 — termos resumidos](https://creativecommons.org/licenses/by-nd/3.0/deed.pt_BR)
