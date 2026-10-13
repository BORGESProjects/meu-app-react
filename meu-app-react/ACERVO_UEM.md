# Cobertura dos vestibulares regulares UEM: 2019–2025

As questões são transcritas dos cadernos e gabaritos oficiais da [CVU-UEM](https://www.vestibular.uem.br/provas-gabaritos.html). A edição é identificada pelo nome oficial do concurso, mesmo quando a aplicação foi adiada para o ano seguinte.

| Edição | Registros no acervo | Estrutura |
| --- | ---: | --- |
| Verão 2019 | 220 | Provas 1 e 2, três idiomas e dez específicas |
| Inverno 2019 | 220 | Provas 1 e 2, três idiomas e dez específicas |
| Vestibular 2020 | 220 | Provas 1 e 2, três idiomas e dez específicas |
| Vestibular 2021 | 140 | Núcleo comum, três idiomas e dez específicas |
| Vestibular 2022 | 140 | Núcleo comum, três idiomas e dez específicas |
| Verão 2023 | 58 | 46 comuns e quatro por idioma |
| Inverno 2023 | 58 | 46 comuns e quatro por idioma |
| Verão 2024 | 58 | 46 comuns e quatro por idioma |
| Inverno 2024 | 58 | 46 comuns e quatro por idioma |
| Verão 2025 | 58 | 46 comuns e quatro por idioma |
| Inverno 2025 | 58 | 46 comuns e quatro por idioma |
| **Total** | **1.288** | Todos os idiomas e blocos disponíveis |

## Edições anuais e gabaritos

- O Inverno 2020 foi cancelado. A UEM realizou um vestibular anual reunindo as vagas. [Informação oficial da SETI](https://www.seti.pr.gov.br/Noticia/Universidades-estaduais-adiam-vestibulares-para-o-ano-que-vem).
- Em 2021 e 2022, o arquivo oficial também apresenta concursos anuais, sem cadernos separados de Verão e Inverno. [Vestibular 2021](https://www.vestibular.uem.br/evento_27.html), [Vestibular 2022](https://www.vestibular.uem.br/evento_30.html), [histórico oficial](https://www.cvu.uem.br/eventos-anteriores.html).
- O arquivo `ve19/gabdef.pdf` conserva no cabeçalho a palavra “provisório”, mas a [página oficial do Verão 2019](https://www.vestibular.uem.br/evento_22.html) o publica como **Gabarito Definitivo**, em 17/12/2019. Ele inclui as respostas retificadas; foi utilizado esse arquivo, não o gabarito inicial.
- Questões anuladas permanecem disponíveis para consulta e são excluídas da correção dos simulados. No Verão 2025, a questão 11 de Inglês está anulada.

## Preservação e uso no site

Enunciados e afirmações têm recortes independentes. Textos compartilhados, vocabulários, fórmulas e tabelas de consulta são preservados. Cada questão mantém o número original e links para o caderno e o gabarito da respectiva edição. Os valores 01, 02, 04, 08 e 16 continuam selecionáveis em somatória.

Os cadernos de 2019/2020 somam 90 questões por candidato: 40 na prova 1 e 50 na prova 2, após escolher um idioma e duas específicas. Em 2021/2022, a seleção produz 50 questões. De 2023 a 2025, são 50 por idioma; a quantidade corrigível diminui quando há anulação.

Dificuldade é uma estimativa de estudo, não uma classificação oficial da UEM. Este levantamento abrange os cadernos objetivos dos vestibulares regulares; PAS, EAD, PcD, vagas remanescentes e testes práticos de habilidade específica são processos distintos.

## Reprodução da importação

Os arquivos originais ficam em `tmp/pdfs/uem-historico/{ve19,in19,ve20,ve21,ve22,ve23,in23,ve24,in24}` e nos diretórios já utilizados para 2025. Os scripts `importar_uem_2019_2020.py`, `importar_uem_anuais.py` e `importar_uem_modernas.py` validam a sequência do gabarito, a soma de cada resposta e a quantidade de questões antes de gravar o lote.

`uem_fontes_in19.json` recupera os rótulos e o texto auxiliar de fontes sem Unicode em dois PDFs de Inverno 2019. Ele foi obtido por comparação exata dos contornos com fontes locais, sem OCR ou IA; caracteres matemáticos não recuperados continuam representados pela imagem oficial.

Validação: `node --test scripts/*.test.mjs` e `npm run build`. Os testes verificam a estrutura, idiomas, específicas, imagens e permanência dos registros ao unir o acervo.
