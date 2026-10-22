# Revisão técnica de segurança e desempenho — 22/10/2026

## Correções

- As alterações da API legada de editais (`POST`, `PATCH`, `DELETE`) exigem a mesma autenticação de administrador já usada na importação. Antes, as rotas acessavam diretamente o repositório sem validar login. Os editais pessoais continuam separados em `editais_usuario`.
- O script de segurança de produção também revoga escrita e TRUNCATE de `anon` e `authenticated` na tabela compartilhada `edital_itens`, mantendo sua leitura. Isso fecha a alternativa de escrever pelo PostgREST em vez da API Java. As políticas de propriedade dos editais e do progresso pessoais foram preservadas.
- Spring Boot passou de 3.2.5 para 3.5.16, versão de manutenção confirmada no [metadado oficial do Maven Central](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/maven-metadata.xml). A API continua compilando em Java 17.
- A auditoria npm encontrou avisos em `follow-redirects`, `source-map-js` e Vite. Foram atualizadas as versões compatíveis pelo lockfile. Auditoria final, incluindo desenvolvimento: **zero avisos conhecidos no npm**. Isso não constitui uma auditoria de todas as dependências Java.
- Adicionados cabeçalhos de segurança no Vercel: política de conteúdo sem execução de scripts inline, bloqueio de enquadramento por outros sites, proibição de plugins, prevenção de MIME sniffing e restrição de câmera/microfone/geolocalização. Mantidos os recursos necessários a autenticação, API, fontes, PDF/OCR e workers locais.
- O endpoint de saúde informa a revisão disponibilizada pelo Render, permitindo distinguir uma API antiga da versão recém-publicada sem expor configuração ou credenciais.

## Desempenho e preservação dos dados

A união, deduplicação e indexação dos filtros passam a ocorrer em um Web Worker. O worker recebe somente questões públicas; sessões, tokens e progresso do usuário não são enviados. A interface fica disponível durante o processamento. Uma nova carga cancela a anterior; respostas de cargas antigas e de uma sessão encerrada não substituem o estado atual. Uma falha mantém o acervo anterior e oferece a tentativa já existente na interface.

Foi removida uma segunda validação completa de registros que já tinham passado pelas mesmas verificações para entrar no mapa do acervo. As validações originais de conteúdo, alternativas, gabarito, imagens e fórmulas continuam ativas.

Medição local sobre 31.531 registros de entrada, usando os mesmos arquivos e comparação profunda dos resultados:

| Medida | Antes | Depois |
|---|---:|---:|
| União e deduplicação | 5.438 ms | 3.714 ms |
| Preparação do índice | Na interface | 2.954 ms em segundo plano |
| Questões finais | 25.495 | 25.495 |

A redução de aproximadamente 32% se refere à etapa de união nesta medição, não a todo o tempo de abertura do site. Rede, início do servidor gratuito e dispositivo continuam influenciando a carga. A indexação também foi retirada da interface, sem alegação de que ficou 32% mais rápida.

## Verificações executadas

- **218 testes do site aprovados**, incluindo preservação dos lotes, filtros, simulados, isolamento do progresso, retomada da sincronização e cancelamento/erro do worker.
- **33 testes da API executados**, sem falhas ou erros; um teste foi ignorado por condição de disponibilidade do OCR local. Os demais 32 passaram. As rotas de edição dos templates retornaram HTTP 401 nos testes sem login, sem acessar o banco.
- Compilação de produção do frontend e compilação/testes da API aprovados. Na verificação local do frontend foi omitida apenas a recópia dos arquivos públicos já existentes; a configuração de publicação permanece a normal.
- Análise estática sem erros, com dois avisos já existentes sobre atualização de estado em efeitos do App.
- Varredura de 149 arquivos de código/configuração rastreados não encontrou os padrões de chaves privadas, chaves Google e tokens GitHub procurados. Não foram impressos valores de credenciais. Essa busca não prova inexistência de qualquer tipo de segredo nem cobre todo o histórico Git.
- Consultas anônimas de leitura com `limit=0` às tabelas `progresso_usuario` e `editais_usuario` retornaram **401**, sem obter registros pessoais. O cabeçalho OPTIONS do PostgREST é genérico e não foi usado como prova de permissões de escrita.

## Limites

Esta entrega é uma revisão do código e verificações funcionais/estruturais, não um teste de invasão completo. Não foram enviados ataques de carga, alterados dados de alunos, nem testadas escritas anônimas no banco de produção. A conexão administrativa PostgreSQL não estava configurada no arquivo local consultado; portanto as políticas reais por proprietário não foram auditadas novamente via SQL nesta execução. As restrições SQL novas são aplicadas pela inicialização da API de produção e o respectivo script permanece versionado.

Não há alteração intencional do conteúdo das questões, do histórico de respostas, das horas estudadas ou dos editais particulares.
