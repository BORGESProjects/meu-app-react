# Revisão de integridade — 21/10/2026

Foram percorridos 25.594 registros: 15.100 do Supabase, 908 da central de importações e os arquivos publicados com o frontend. Há cópias e sobreposições entre fontes; esse número não é o total de questões distintas do site.

## Alterações

- Bloqueio, no carregamento comum de todo o site, de resoluções e gabaritos vazados nas alternativas, comandos extraídos como alternativas, respostas explicativas no lugar das opções e apoios/destaques necessários ausentes.
- 657 questões antes exibidas passam a ficar fora do acervo selecionável e dos novos simulados. A união das fontes auditadas resulta em 19.198 questões exibíveis, contra 19.855 sem essa proteção. Os registros originais permanecem armazenados: não foram apagados nem receberam gabaritos presumidos.
- Bloqueio adicional de alternativas representadas apenas por rótulos como “consulte o recorte original”, sem uma imagem ou representação matemática correspondente. Restam 123 registros da EsPCEx nessa condição, identificados em `espcex-alternativas-pendentes.json`. Os simulados com posições pendentes não são oferecidos como provas completas.
- 22 ocorrências de títulos editoriais isolados no final das alternativas são removidas somente na representação usada pelo site. Não são cortadas resoluções para disfarçar questões ou respostas possivelmente deslocadas.
- Recuperação visual de duas questões de Física da UFRGS 2023 (26 e 27 do segundo dia), com circuito, tabela e trajetória. Os dados da tabela da questão 26 foram retirados da última alternativa da questão 27.
- Recuperação de 18 questões da EsPCEx com destaques tipográficos perdidos. Enunciados e alternativas foram recortados separadamente nos cadernos existentes; gabaritos preservados.
- Recuperação integral da questão 36 do segundo dia da EsPCEx 2024, cujo enunciado estava truncado e cuja alternativa C tinha imagem vazia. Restaurados o final do enunciado e as cinco opções no caderno.
- Recuperação da questão 49 do primeiro dia da UFRGS 2022: fórmula logarítmica e cinco alternativas com frações e potência, em recortes separados conferidos visualmente. Recuperação das questões 38 e 44 do segundo dia da EsPCEx 2024: enunciados sem as alternativas no recorte e opções reais selecionáveis, preservando o gabarito armazenado.
- 32.524 imagens locais referidas pelo acervo verificadas quanto à existência, formato e decodificação integral dos pixels, sem arquivos inválidos; oito imagens públicas da API responderam corretamente. Isso não comprova, por si só, que cada recorte contenha toda a informação necessária: essa conferência depende do documento original.

## Limites e continuidade necessária

A auditoria estrutural não resolve automaticamente cada questão, não confirma todos os gabaritos e não verifica semanticamente cada recorte. As regras são conservadoras e os motivos ficam registrados em `auditoria-integridade.json`. Há 253 ocorrências adicionais para conferência de contexto/destaque tipográfico; a triagem não prova que todas estejam erradas e não autoriza apagar esses registros.

As questões bloqueadas devem ser recuperadas a partir do documento original e do gabarito confiável. Casos observados incluem resolução inteira como alternativa, uma alternativa ocupada pelo comando e gabarito que contradiz o cálculo ou o próprio comentário. A simples exclusão do comentário não recupera esses itens. Esta entrega não representa conclusão da revisão manual de cada prova do acervo.

## Reprodução

Os snapshots de leitura estão em `tmp/banco-auditoria.json` e `tmp/acervo-publico-auditoria.json`; não contêm credenciais e não são publicados no Git. Os hashes no relatório permitem identificar a versão auditada. Executar `node scripts/auditar-integridade-acervo.mjs tmp/banco-auditoria.json tmp/acervo-publico-auditoria.json` reproduz a inspeção estrutural. `scripts/verificar_imagens_acervo.py` decodifica os recursos listados para identificar arquivos quebrados. Os scripts de recuperação da UFRGS e EsPCEx referenciam os cadernos preservados em `tmp`.
