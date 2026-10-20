# Oficina de redação

O formulário tem perfis ENEM, FUVEST histórica e concurso/tema livre. As notas são estimativas pedagógicas. ENEM usa cinco competências de 0 a 200 (passos de 40); FUVEST histórica usa normalização 40/30/30 em 100, sem afirmar equivalência à nota oficial. O perfil geral usa 30/30/20/20, sem exigir intervenção social.

## Fluxo e persistência

- O componente é carregado apenas quando a aba é aberta.
- Tema, texto e instruções são salvos a cada edição, no armazenamento local do navegador, com chave separada por usuário autenticado. Até cinco relatórios ficam nesse mesmo dispositivo; não há sincronização de redações entre dispositivos nesta versão. Há exportação de rascunho e relatório em texto.
- O envio exige sessão Supabase válida com e-mail confirmado, inclusive no backend. Não exige privilégio de administrador.
- A redação é enviada ao Google Gemini somente ao solicitar correção. Os prompts separam instruções do sistema e os dados do estudante.
- Limites técnicos: tema 3–500 caracteres, texto 80–20.000 caracteres e instruções até 3.000 caracteres. O mínimo técnico não representa o mínimo de linhas de uma prova.
- O servidor valida critérios, pontuação e citações literais, calcula a soma e rejeita respostas incompletas. Trechos que não constem literalmente no original são omitidos com aviso. A validação estrutural não garante a exatidão pedagógica da avaliação por IA.

## Eficiência e falhas

O histórico local reaproveita a mesma versão sem enviar novamente. No servidor, cache em memória de 15 minutos e até 64 relatórios, separado por usuário, modelo e solicitação, evita chamadas repetidas; o cache desaparece em reinicializações. Requisições idênticas em andamento compartilham o resultado. Há uma análise diferente simultânea por conta e até três no processo.

O provedor tem prazo de conexão de 8 segundos e leitura de 40 segundos. Há uma única retentativa para HTTP 500/502/503/504, com espera de 1,2 segundo; não há retentativa automática para quota HTTP 429 ou timeout de rede. O cliente encerra a espera após 150 segundos. Cancelar no navegador encerra a espera, mas uma geração já recebida pelo servidor pode continuar. Mensagens do provedor e credenciais não são repassadas ao aluno como relatório.

`GEMINI_REDACAO_MODEL` configura o modelo específico da redação; padrão preservado `gemini-3.6-flash`. Usa a chave `GEMINI_API_KEY` já configurada. Não altera os modelos de extração de PDF. `GET /api/ia/redacao/status` identifica a versão do protocolo, sem invocar a IA; não é uma verificação da disponibilidade ou quota do provedor.

## Verificação

`scripts/redacao.test.mjs` cobre validação, falhas, cancelamento e isolamento do rascunho. `RedacaoTests` cobre soma, critérios, citações, autenticação, cache por conta e retentativas. Os testes do provedor usam respostas simuladas e não consomem créditos nem enviam redações reais.

Referências: [cartilha INEP 2025](https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/redacao-do-enem-2025-cartilha-do-a-participante/), [guia FUVEST 2025](https://www.fuvest.br/wp-content/uploads/fuvest_2025_guia_respostas.pdf), [respostas estruturadas Gemini](https://ai.google.dev/gemini-api/docs/structured-output).
