# Integridade e cobertura do acervo — 25/10/2026

## Conclusão

O acervo publicado contém muitas questões estruturadas, mas **não é possível certificar que cada PDF remanescente foi extraído integralmente, revisado e incorporado como questão pronta**. A coleta documental, a extração de questões e a publicação no banco são etapas diferentes. Os registros e manifestos atuais mostram lacunas em cada uma delas.

## O que foi verificado

### PDFs locais restantes

- O inventário inicial leu **331 PDFs locais diretos**, totalizando 452.286.889 bytes e 3.794 páginas. Foram identificadas 3.387 páginas com camada de texto, 11 com texto parcial e 396 sem texto pesquisável.
- Após limpeza e triagem por OCR, **18 PDFs** continuam sinalizados para conferência de conteúdo. As páginas de baixa leitura do Colégio Naval/EAM foram visualizadas e estavam em branco; os PDFs completos foram mantidos porque suas páginas com questões são legíveis e ainda não foram comparadas ao banco. OCR não substitui revisão de fórmulas, gráficos ou alternativas.
- Três arquivos com extensão `.pdf` não eram PDFs: seus conteúdos começavam como HTML/JavaScript. Eram tentativas de baixar a prova EAM 2004, uma prova EEAR 2013 e um espelho ESA 2019; foram removidos como downloads inválidos. Um PDF comprovadamente em branco também foi removido.
- Dois duplicados exatos foram removidos após confirmar cópia idêntica preservada e questões no site: uma cópia ESA 2025 (50 questões estruturadas) e uma cópia UFPR Inglês 2021 (60 questões estruturadas). Também foram removidos 44 PDFs e os arquivos temporários da pasta EsPCEx 2017–2026 após conferir o acervo publicado: 1.000 questões, 100 por edição anual, 998 respostas e duas anuladas; todas as referências visuais existem. Os testes de integridade também passaram para UFRGS 2022–2025, UFPR 2019–2025, UTFPR 2023–2025, IFPR, UEM 2023–2025 e CFN 2020–2025; por isso, foram removidas 43 fontes temporárias e 141 arquivos de apoio desses conjuntos. Permanecem **238 PDFs diretos (222.881.231 bytes)**. Dois gabaritos UFRGS 2025 idênticos foram mantidos porque ainda não se confirmou se cobrem os dois dias ou se há associação errada.
- A auditoria está listada em `docs/acervo/manifesto-auditoria-pdfs-2026-10-25.csv`. Ela cobre PDFs soltos em `tmp/`, `output/`, `public/` e `native/`; não certifica PDFs guardados dentro de ZIPs nem que cada prova tenha sido associada à edição correta no site.
- O inventário atualizado tem 220 PDFs restantes com camada de texto legível e 18 marcados para conferência. “Texto legível” confirma leitura do arquivo, não comprova que todas as questões foram estruturadas e publicadas.
- As duas cópias duplicadas liberaram **7.126.666 bytes** (aprox. 6,8 MiB). A pasta temporária EsPCEx e os arquivos inválidos/em branco liberaram **168.560.168 bytes** (aprox. 160,7 MiB); os conjuntos universitários e seus temporários liberaram mais **133.256.602 bytes** (aprox. 127,1 MiB). Ao todo, foram removidos **308.943.436 bytes** desde a primeira auditoria. JSONs e imagens usados pelo site foram preservados.
- Seis PDFs foram mantidos na pasta pública porque a interface oferece links diretos para as provas e gabaritos do ENEM 2022 e da ESA 2025. Os demais PDFs de origem sem extração/correspondência confirmada também foram mantidos para não eliminar fonte única.
- A pesquisa nas páginas oficiais SSPM confirmou a existência de cadernos e gabaritos recentes do Colégio Naval (2021–2026) e provas EAM listadas para 2020–2026, com alguns anos ausentes da página atual. As tentativas de abrir os anexos diretos oficiais retornaram erro 502 nesta sessão. Logo, a página de catálogo confirma a edição anunciada, mas não substitui a leitura e a comparação do arquivo original. Não preenchi texto de questão, gráfico ou fórmula por suposição.
- A leitura OCR foi aplicada aos 32 PDFs antes da segunda rodada de limpeza: reconheceu texto em 580 de 608 páginas; 28 páginas deram pouco texto. As amostras visuais dessas páginas eram folhas em branco/capas ou folhas de gabarito, não páginas de prova que justificassem apagar o arquivo inteiro. Um leitor PDF falhou tecnicamente em UTFPR 2023; a leitura textual original ainda tinha conteúdo em 26 de 27 páginas, portanto o arquivo foi mantido.

### Site publicado

- A página pública exibiu **193.574 questões disponíveis** durante a leitura em 25/10/2026.
- Esse total corresponde exatamente a **25.495 questões do banco principal + 168.079 questões** do pacote objetivo classificado mais recente encontrado no projeto. Isso é evidência de que a versão publicada usa esse total; não é uma conferência dos objetos privados do R2 um a um.
- Não foi feito envio ou publicação nesta etapa. A limpeza foi apenas local.
- Após a limpeza, os **36 testes de integridade do acervo passaram**, incluindo os conjuntos universitários e militares mencionados acima; eles verificam totais cadastrados, IDs únicos, gabaritos, publicabilidade e existência dos recursos visuais.

### Pacote objetivo mais recente

Arquivo de referência: `tmp/classificacao-acervo-upload-revisado-final/acervo-extraido/manifesto.json`.

- **168.079 questões** em **3.871 lotes**, distribuídas entre sete bancas.
- Todas são marcadas como objetivas; não há questões marcadas como discursivas nesse pacote.
- A leitura dos lotes encontrou 168.079 registros, sem IDs repetidos ou ausentes, lotes faltantes, enunciados vazios ou registros sem referência visual.
- Foram conferidas **28.669 referências de páginas**. Todas apontam para arquivos existentes no armazenamento local `public/acervo-extraido/paginas/`.
- **853 registros não têm ano identificado** e **16.045 classificações** estão marcadas como de baixa confiança.
- O próprio manifesto registra **zero gabaritos vinculados** e zero questões elegíveis para correção automática. As questões podem ser respondidas como exercício, mas não recebem nota automática confiável.
- Há alertas em **3.588** transcrições por possível corrupção de caracteres, **1.660** por alternativas incompletas ou atípicas, **110** por possível mistura com questões vizinhas e **27** por figuras/diagramas que precisam de conferência. Esses grupos podem se sobrepor.

### Cópia local do pacote publicado

O diretório `public/acervo-extraido/` inicialmente estava desatualizado: o manifesto antigo declarava 170.020 questões em 540 lotes, mas só havia 169.895 registros legíveis e um lote declarado ausente. Sincronizei a cópia local com o pacote classificado que coincide com o total público: atualizei o manifesto e os 3.871 lotes, preservei as 34.410 páginas visuais e guardei o manifesto anterior em `tmp/manifesto-acervo-local-anterior-2026-10-25.json` para reversão.

Depois da sincronização, a auditoria leu **168.079 questões**, com **168.079 IDs únicos**, zero lotes ausentes/corrompidos, zero enunciados vazios, zero itens sem página visual e zero referências visuais ausentes entre as 28.669 páginas referenciadas. Arquivos antigos não referenciados foram mantidos localmente; não foram enviados nem removidos do Cloudflare.

### PDFs e arquivo documental

- O catálogo documental em `docs/acervo/catalogo-provas-publicas.md` registra **27.017 PDFs** coletados no arquivo geral. A extração de texto encontrou conteúdo em 26.621; um ficou parcial, 283 não tinham texto pesquisável e 112 tiveram falha. Não foi aplicado OCR nesse catálogo.
- O manifesto estruturado disponível considera 10.437 documentos candidatos; 5.796 não produziram questões reconstruíveis. Isso inclui documentos que podem ser gabaritos, editais, duplicatas, cadernos sem estrutura compatível ou provas ainda não extraídas. A contagem não demonstra que todos tenham sido verificados individualmente.
- A extração incremental da ESA tem 70 PDFs: 65 com texto pesquisável, cinco sem camada textual e apenas 44 questões reconstruídas. O resumo registra 47 documentos sem questões reconstruíveis. Esse conjunto ainda não pode ser declarado completo.
- A revisão militar anterior confirma como completa e conferida apenas a EsPCEx 2017–2026. ESA/EsSA, EEAR, EAM, CFN, Colégio Naval, Escola Naval, IME e demais concursos permanecem parciais ou sem comparação integral com os cadernos e gabaritos.
- Há **22 PDFs militares únicos** preservados na pasta de trabalho que não aparecem no ZIP militar revisado. Eles não devem ser apagados nem tratados como incorporados sem mapear cada prova à edição e ao lote correspondente.
- O PDF oficial EAM 2025 consta no catálogo atual do SSPM; o pacote local é uma digitalização de 23 páginas. O catálogo oficial da EEAR foi encontrado em manutenção durante a consulta; o arquivo local EEAR 2013 que deveria ser PDF é HTML. A edição não foi substituída por um espelho não oficial sem comparar edição, código e gabarito.
- A consulta web desta continuação localizou o caderno oficial do Colégio Naval 2021 e sua página oficial de gabarito, além dos catálogos de provas/gabaritos EAM e CN. Os downloads dos anexos falharam com HTTP 502; portanto, nenhum conteúdo foi acrescentado com base apenas em resumo de busca.

## Estado por critério

| Critério | Resultado |
|---|---|
| Total anunciado no site | 193.574, observado na página pública |
| Questões do pacote objetivo publicado | 168.079; coincide com o total exibido somado ao banco principal de 25.495 |
| Integridade estrutural dos lotes classificados | 168.079 lidos; IDs únicos; sem enunciados vazios ou erros de lote |
| Páginas visuais relacionadas | 28.669 referências verificadas contra os arquivos locais; nenhuma ausente |
| Discursivas no pacote classificado | 0 |
| Classificações sem matéria ou conteúdo | 0 no pacote classificado |
| Ano ausente / baixa confiança | 853 / 16.045 |
| Gabaritos vinculados / correção automática | 0 / 0 |
| Questões com alertas de transcrição/visual | 3.588 corrupção possível; 1.660 alternativas; 110 mistura possível; 27 visuais |
| PDFs com prova de extração completa e revisão por edição | Não certificado para o conjunto; somente EsPCEx 2017–2026 tem essa conferência registrada |

## Próximas correções necessárias

1. Revisar os alertas de transcrição comparando-os às páginas originais; manter em revisão, sem correção automática, o que não puder ser confirmado.
2. Obter e associar gabaritos oficiais por edição antes de habilitar pontuação automática.
3. Mapear cada PDF remanescente para instituição, edição, caderno, páginas e gabarito; registrar explicitamente duplicatas, documentos auxiliares e provas sem questões extraíveis.
4. Conferir os 18 PDFs ainda sinalizados, especialmente as provas ESA antigas e as provas CN 2021/EAM 2025 que ainda não foram mapeadas ao acervo.
5. Continuar validando os lotes restantes contra os cadernos integrais antes de marcá-los como completos. **A limpeza segue parcial:** 238 PDFs diretos permanecem, e os PDFs dentro de ZIPs não fazem parte desta conferência.

## Evidências locais

- `docs/acervo/relatorio-limpeza-arquivos-2026-10-25.md`
- `docs/acervo/relatorio-cobertura-militar-1997-2026.md`
- `docs/acervo/levantamento-portais-militares-2006-2026.md`
- `docs/acervo/catalogo-provas-publicas.md`
- `output/esa-questoes-incremental-20261024/resumo-extracao.json`
- `output/esa-questoes-incremental-20261024/manifesto-questoes-extraidas.json`
- `scripts/acervo-publico/auditar_corpus_estruturado.py`
- `docs/acervo/manifesto-auditoria-pdfs-2026-10-25.csv`

## Fontes online verificadas nesta continuação

- [SSPM — Colégio Naval: provas e gabaritos](https://www.marinha.mil.br/sspm/colegionaval/colegio_princ) — a página lista provas e gabaritos de 2021–2026; os anexos diretos não foram baixados porque retornaram erro 502 nesta sessão.
- [SSPM — Escola de Aprendizes-Marinheiros: provas e gabaritos](https://www.marinha.mil.br/sspm/escola-aprendizes/a-eam-provag) — a página lista cadernos de 2020–2026, incluindo 2025; os anexos diretos não foram baixados porque retornaram erro 502 nesta sessão.
- [SSPM — gabarito do Colégio Naval](https://www.marinha.mil.br/sspm/gabarito/cn) — catálogo oficial de gabaritos, incluindo 2021–2026.
