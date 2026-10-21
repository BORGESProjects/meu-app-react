# Revisão de integridade — 21/10/2026

Foram percorridos 25.594 registros: 15.100 do Supabase, 908 da central de importações e os arquivos publicados com o frontend. Há cópias e sobreposições entre fontes; esse número não é o total de questões distintas do site.

## Alterações

- Bloqueio, no carregamento comum de todo o site, de resoluções e gabaritos vazados nas alternativas, comandos extraídos como alternativas, respostas explicativas no lugar das opções e apoios/destaques necessários ausentes.
- 534 questões antes exibidas permanecem fora do acervo selecionável e dos novos simulados. Após as recuperações, a união das fontes auditadas resulta em 19.323 questões exibíveis, contra 19.857 sem essa proteção. Os registros originais permanecem armazenados: não foram apagados nem receberam gabaritos presumidos.
- Bloqueio adicional de alternativas representadas apenas por rótulos como “consulte o recorte original”, sem uma imagem ou representação matemática correspondente. As 123 pendências da EsPCEx foram recuperadas nesta etapa; `espcex-alternativas-pendentes.json` está vazio. A proteção continua aplicada a qualquer outra questão incompleta.
- 22 ocorrências de títulos editoriais isolados no final das alternativas são removidas somente na representação usada pelo site. Não são cortadas resoluções para disfarçar questões ou respostas possivelmente deslocadas.
- Recuperação visual de duas questões de Física da UFRGS 2023 (26 e 27 do segundo dia), com circuito, tabela e trajetória. Os dados da tabela da questão 26 foram retirados da última alternativa da questão 27.
- Recuperação de 18 questões da EsPCEx com destaques tipográficos perdidos. Enunciados e alternativas foram recortados separadamente nos cadernos existentes; gabaritos preservados.
- Recuperação integral da questão 36 do segundo dia da EsPCEx 2024, cujo enunciado estava truncado e cuja alternativa C tinha imagem vazia. Restaurados o final do enunciado e as cinco opções no caderno.
- Recuperação da questão 49 do primeiro dia da UFRGS 2022: fórmula logarítmica e cinco alternativas com frações e potência, em recortes separados conferidos visualmente. Recuperação das questões 38 e 44 do segundo dia da EsPCEx 2024: enunciados sem as alternativas no recorte e opções reais selecionáveis, preservando o gabarito armazenado.
- Reconstrução de 248 questões da EsPCEx: as 123 pendências e a revisão integral dos 200 itens digitalizados de 2023 e 2024 (75 pertenciam às pendências). Corrigida a associação entre número e recorte; restaurados dez textos compartilhados de Português e Inglês e uma questão com continuação na página seguinte. As 1.000 questões de 2017 a 2026 sobrevivem à união do acervo e os 20 dias aparecem como provas completas.
- Comparação das 1.000 respostas com os vinte PDFs de gabarito preservados: nenhuma divergência. O manifesto `espcex-recuperacao-integral.json` registra os endereços públicos de obtenção, incluindo espelhos públicos, hashes das fontes, caixas dos recortes e hashes das imagens. Não se atribui aos espelhos caráter de publicação oficial.
- A deduplicação dos recortes EsPCEx conferidos usa a identidade das imagens, preservando fórmulas distintas mesmo quando o texto auxiliar é semelhante. Modelo do primeiro dia de 2026 corrigido para Versão 1.
- 33.158 imagens locais referidas pelo acervo verificadas quanto à existência, formato e decodificação integral dos pixels, sem arquivos inválidos; oito imagens públicas da API responderam corretamente. Isso não comprova, por si só, que cada recorte contenha toda a informação necessária: essa conferência depende do documento original.

## Limites e continuidade necessária

### Alternativas em texto — 21/10/2026

As cinco alternativas de 257 questões EsPCEx foram transcritas, totalizando 1.285 opções. A interface usa o texto conferido no banco de questões, nos simulados e na revisão, mantendo os recortes arquivados como evidência. Frações, sinais, expoentes, índices e numeração romana foram conferidos; os destaques necessários de Português são elementos de texto formatado. As nove questões cujas alternativas são gráficos, mapas ou estruturas químicas permanecem visuais. Distratores incorretos e erros impressos do caderno não foram transformados em respostas corretas. A duplicação das alternativas A e E da questão 21 do segundo dia de 2024 foi conservada e registrada como duplicação do original.

O manifesto `espcex-alternativas-transcritas.json` registra as transcrições, os destaques, os hashes dos recortes usados como fonte e o gabarito preservado. `python scripts/aplicar_transcricoes_espcex.py` reaplica somente esse conjunto conferido. Os 206 testes passaram, incluindo preservação das 1.000 questões e das 20 provas completas.

A auditoria estrutural não resolve automaticamente cada questão, não confirma todos os gabaritos e não verifica semanticamente cada recorte. As regras são conservadoras e os motivos ficam registrados em `auditoria-integridade.json`. Há 253 ocorrências adicionais para conferência de contexto/destaque tipográfico; a triagem não prova que todas estejam erradas e não autoriza apagar esses registros.

As questões bloqueadas devem ser recuperadas a partir do documento original e do gabarito confiável. Casos observados incluem resolução inteira como alternativa, uma alternativa ocupada pelo comando e gabarito que contradiz o cálculo ou o próprio comentário. A simples exclusão do comentário não recupera esses itens. Esta entrega não representa conclusão da revisão manual de cada prova do acervo.

## Reprodução

Os snapshots de leitura estão em `tmp/banco-auditoria.json` e `tmp/acervo-publico-auditoria.json`; não contêm credenciais e não são publicados no Git. Os hashes no relatório permitem identificar a versão auditada. Executar `node scripts/auditar-integridade-acervo.mjs tmp/banco-auditoria.json tmp/acervo-publico-auditoria.json` reproduz a inspeção estrutural. `scripts/verificar_imagens_acervo.py` decodifica os recursos listados para identificar arquivos quebrados. Os scripts de recuperação da UFRGS e EsPCEx referenciam os cadernos preservados em `tmp`. `python scripts/verificar_espcex_recuperada.py --fontes` confere os 1.498 novos recursos, os registros recuperados e os hashes dos PDFs. Validação desta etapa: 203 testes e compilação aprovados.
