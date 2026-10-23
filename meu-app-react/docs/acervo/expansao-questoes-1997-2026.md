# Expansão do acervo por fontes públicas — 1997 a 2026

**Inventário em 22/10/2026.** A janela dos últimos 30 anos foi considerada de 1997 a 2026, inclusive. O manifesto do acervo local registra 25.495 questões. As contagens abaixo agrupam os registros pela banca informada e usam o ano da questão ou o ano identificado no nome do concurso; são uma fotografia do banco local, não uma contagem dos arquivos existentes nos sites oficiais.

## Cobertura encontrada

| Fonte ou grupo | Questões datadas dentro da janela | Anos com registros na janela | Observação |
|---|---:|---|---|
| ENEM / Inep | 1.916 | 17 anos: 2004, 2009, 2010 e 2012–2025 | Mais 131 sem ano identificado. O catálogo oficial apresenta provas de 1998 a 2025; o banco atual não cobre todos esses anos. |
| Enade / Inep | 0 | Nenhum | O acervo local ainda não tem questões classificadas como Enade. |
| Encceja / Inep | 0 | Nenhum | O acervo local ainda não tem questões classificadas como Encceja. |
| Saeb / Inep | 0 | Nenhum | O Inep mantém materiais de edições antigas; nenhum item está classificado como Saeb no banco local. |
| FGV | 174 | 15 anos: 1999–2023, com lacunas | Mais 59 sem ano identificado. Os arquivos oficiais são publicados nas páginas de cada concurso/exame. |
| Fuvest | 421 | 20 anos: 1998–2025, com lacunas | Mais 81 sem ano e 1 registro de 1996. O acervo oficial mantém provas desde antes do período solicitado. |
| PUC, todos os campi cadastrados | 427 | 17 anos: 2001–2025, com lacunas | Mais 76 sem ano identificado. As instituições PUC mantêm repositórios separados por campus. |
| Cebraspe/CESPE | 0 | Nenhum | Ainda não há registros classificados com esses nomes no acervo local. |
| Vunesp | 2 | 2020 e 2021 | Mais 19 sem ano identificado. Cobertura atual muito pequena. |
| ESA, EsPCEx e questões rotuladas como Exército | 2.155 | Todos os 30 anos, 1997–2026 | Mais 335 sem ano e 50 fora da janela. Há registros em todos os anos, sem afirmar cobertura de todos os concursos/provas. |
| Grupo militar selecionado¹ | 5.613 | Todos os 30 anos, 1997–2026 | Mais 462 sem ano e 62 fora da janela. Inclui Exército, Aeronáutica e Marinha; sobrepõe as linhas acima. |

Os grupos podem se sobrepor. Não some as linhas para obter o total geral. As contagens acima incluem somente questões com ano verificável dentro de 1997–2026. No seletor da interface, o número junto à banca conta todos os registros carregados daquela banca, inclusive os sem ano; ao escolher um ano, o resultado mostra apenas os compatíveis com a seleção. As contagens se atualizam conforme os outros filtros.

## Fontes oficiais de consulta

- [Inep — provas e gabaritos do ENEM](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos). A página lista edições de 1998 a 2025.
- [Inep — provas e gabaritos do Enade](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos), [Encceja](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos) e [materiais de edições antigas do Saeb](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb/documentos-edicoes-antigas).
- [Fuvest — acervo do vestibular](https://www.fuvest.br/acervo-vestibular/). O acervo inclui provas históricas e cadernos recentes.
- [FGV Conhecimento — concursos](https://conhecimento.fgv.br/concursos). Cadernos e gabaritos são publicados nas páginas dos certames.
- [Cebraspe — página de concurso com provas e gabaritos](https://www.cebraspe.org.br/concursos/telebras_25). Os materiais ficam distribuídos por concurso.
- [Vunesp — portal oficial](https://www.vunesp.com.br/). Provas e gabaritos ficam nas páginas de cada processo seletivo.
- [PUC-Rio — repositório de provas e gabaritos](https://puc-rio.br/vestibular/repositorio/) e [PUC Minas — provas e gabaritos](https://www.pucminas.br/formas-ingresso/vestibular/Paginas/provas-e-gabaritos.aspx). Há outros repositórios por instituição.
- [EsPCEx](https://www.espcex.eb.mil.br/) e [ESA](https://www.esa.eb.mil.br/) — portais oficiais do Exército.

## Critério de ingestão

O RIEP/Inep dá acesso aberto a registros e arquivos. Isso não equivale automaticamente a uma licença aberta para redistribuir o texto, imagens e diagramação de cada caderno. A ficha do [caderno ENEM 2025 no repositório do Inep](https://riep.inep.gov.br/items/ca4bcb51-f523-495b-8b49-704c0f155ba8/full) informa “Acesso aberto” e apresenta uma licença específica do item, mas não expõe ali uma permissão geral de republicação. O Ministério da Cultura descreve reprodução e inclusão em bases de dados entre usos que, em regra, dependem de autorização prévia, ressalvadas as exceções legais.

O fluxo extrai enunciados, alternativas e textos de apoio dos arquivos locais e os grava em `public/acervo-extraido/`, separados do banco principal. Cada questão aponta às páginas do PDF renderizadas para consulta offline, preservando imagens, tabelas, gráficos e formatação. Páginas com texto ausente ou danificado recebem OCR complementar em português. Os itens continuam sem gabarito associado e sem correção automática. A extração está documentada em `docs/acervo/questoes-extraidas.md`.

Os textos extraídos não foram publicados externamente. Como os lotes em `public/` são incluídos na compilação do site, verifique a licença ou autorização de cada fonte antes de hospedar ou redistribuir o aplicativo com esses enunciados. O uso pessoal local não altera o estado de revisão: gabaritos e conteúdos visuais só devem entrar no banco corrigível depois de conferidos.

¹ Grupo militar calculado com as bancas EEAR, EsPCEx, ESA, CFN, Colégio Naval, EAM, CPOR, EFOMM, EPCAR, AFA, IME, Escola Naval, EsFCEx e Exército.

## Referências sobre direitos e metadados

- [Ficha do ENEM 2025 no RIEP/Inep](https://riep.inep.gov.br/items/ca4bcb51-f523-495b-8b49-704c0f155ba8/full)
- [Ministério da Cultura — perguntas frequentes sobre direitos autorais](https://www.gov.br/cultura/pt-br/assuntos/direitos-autorais/perguntas-frequentes/perguntas-frequentes)
