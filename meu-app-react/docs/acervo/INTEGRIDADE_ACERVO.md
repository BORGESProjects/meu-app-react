# Revisão de integridade — 20/10/2026

Foram percorridos 25.594 registros: 15.100 do Supabase, 908 da central de importações e os arquivos publicados com o frontend. Há cópias e sobreposições entre fontes; esse número não é o total de questões distintas do site.

## Alterações

- Bloqueio, no carregamento comum de todo o site, de resoluções e gabaritos vazados nas alternativas, comandos extraídos como alternativas, respostas explicativas no lugar das opções e apoios/destaques necessários ausentes.
- 534 questões antes exibidas passam a ficar fora do acervo selecionável e dos novos simulados. Os registros originais permanecem armazenados: não foram apagados nem receberam gabaritos presumidos.
- 22 ocorrências de títulos editoriais isolados no final das alternativas são removidas somente na representação usada pelo site. Não são cortadas resoluções para disfarçar questões ou respostas possivelmente deslocadas.
- Recuperação visual de duas questões de Física da UFRGS 2023 (26 e 27 do segundo dia), com circuito, tabela e trajetória. Os dados da tabela da questão 26 foram retirados da última alternativa da questão 27.
- Recuperação de 18 questões da EsPCEx com destaques tipográficos perdidos. Enunciados e alternativas foram recortados separadamente nos cadernos existentes; gabaritos preservados.
- Recuperação integral da questão 36 do segundo dia da EsPCEx 2024, cujo enunciado estava truncado e cuja alternativa C tinha imagem vazia. Restaurados o final do enunciado e as cinco opções no caderno.
- 32.519 imagens locais referidas pelo acervo verificadas quanto à existência e assinatura de formato; oito imagens públicas da API responderam corretamente. A verificação de decodificação dos pixels é registrada separadamente no relatório.

## Limites e continuidade necessária

A auditoria estrutural não resolve automaticamente cada questão, não confirma todos os gabaritos e não verifica semanticamente cada recorte. As regras são conservadoras e os motivos ficam registrados em `auditoria-integridade.json`. Há 253 ocorrências adicionais para conferência de contexto/destaque tipográfico; a triagem não prova que todas estejam erradas e não autoriza apagar esses registros.

As questões bloqueadas devem ser recuperadas a partir do documento original e do gabarito confiável. Casos observados incluem resolução inteira como alternativa, uma alternativa ocupada pelo comando e gabarito que contradiz o cálculo ou o próprio comentário. A simples exclusão do comentário não recupera esses itens. Esta entrega não representa conclusão da revisão manual de cada prova do acervo.

## Reprodução

Os snapshots de leitura estão em `tmp/banco-auditoria.json` e `tmp/acervo-publico-auditoria.json`; não contêm credenciais e não são publicados no Git. Os hashes no relatório permitem identificar a versão auditada. Executar `node scripts/auditar-integridade-acervo.mjs tmp/banco-auditoria.json tmp/acervo-publico-auditoria.json` reproduz a inspeção estrutural. `scripts/verificar_imagens_acervo.py` decodifica os recursos listados para identificar arquivos quebrados. Os scripts de recuperação da UFRGS e EsPCEx referenciam os cadernos preservados em `tmp`.
