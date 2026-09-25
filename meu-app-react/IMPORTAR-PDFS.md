# Importar provas pelo site

Na aba **Importar PDF**, entre com a conta autorizada (`nickbr613@gmail.com`). No primeiro acesso, crie sua conta nessa aba, confirme o e-mail recebido e volte para entrar com a senha. O projeto Supabase deve manter a confirmação de e-mail habilitada. A senha pertence ao Supabase Auth; ela não é enviada à API Java nem guardada no código.

1. Selecione prova e gabarito definitivo, ambos em PDF sem senha, até 6 MB e 100 páginas cada.
2. Informe ano da aplicação, banca, nome da prova, modelo do caderno e quantidade de questões objetivas (1–150, numeradas de 1 em diante).
3. Clique em **Extrair questões**. Os PDFs são enviados ao Gemini pelo servidor em lotes de cinco questões. O processamento pode levar vários minutos e consumir a cota da conta Gemini.
4. Reabra a importação para acompanhar. Em caso de indisponibilidade da IA ou reinício do servidor, **Continuar extração** retoma os lotes concluídos.
5. Confira e corrija as questões usando os PDFs originais. Textos compartilhados devem estar completos. Marque a opção de imagem quando figuras ou tabelas forem necessárias; o site exibirá a página original inteira. A leitura automática não substitui a conferência de fórmulas e gabaritos.
6. Confirme a revisão de cada questão e **Salve o rascunho**. Só é possível publicar com todas as questões, alternativas, páginas e respostas válidas. Anuladas ficam disponíveis para consulta e fora dos simulados.
7. Clique em **Publicar questões**. Elas aparecem no site sem novo deploy. A publicação é idempotente, e PDFs idênticos do mesmo modelo reabrem a importação existente.

## Operação

- API: `/api/importacoes/**` exige token de usuário validado pelo Supabase Auth, e-mail confirmado e e-mail igual a `ADMIN_EMAIL`. O header `X-Supabase-Key` contém somente a chave pública já utilizada pelo frontend; o servidor consulta exclusivamente o projeto definido em `SUPABASE_URL`.
- Persistência: tabela `acervo_privado.importacoes_pdf`, com documentos originais, rascunho, progresso e metadados. O esquema privado não deve ser incluído nos esquemas expostos pelo PostgREST. O usuário do banco deve poder criar esse esquema. Nenhuma tabela existente é removida.
- Leitura pública: `/api/acervo`, PDFs e imagens exclusivamente de importações publicadas. Rascunhos e arquivos de importações não publicadas não são acessíveis por essas rotas.
- Limites: uma extração ativa e duas na fila por instância. O serviço foi preparado para a instância única atual do Render; múltiplas réplicas precisam de uma fila compartilhada antes de escalar.
- Configuração existente: `GEMINI_API_KEY` e conexão PostgreSQL. Valores opcionais: `ADMIN_EMAIL`, `SUPABASE_URL` e `GEMINI_IMPORT_MODEL` (mesmo modelo atualmente usado na redação por padrão). A chave Gemini permanece exclusivamente no backend.
- O conjunto ESA já publicado continua no frontend. O novo acervo é agregado aos registros anteriores sem apagá-los.
- A conta autorizada precisa ser criada/confirmada pelo próprio administrador; o deploy não cria uma senha nem uma conta automaticamente.

## Validação

`npm run build`, `npm run lint`, `node --test scripts/acervo.test.mjs` e `mvn verify` no backend.
Os testes da API cobrem acesso não autenticado, e-mails não autorizados/não confirmados, arquivos inválidos, rascunho privado, publicação idempotente, duplicação de documentos, revisão obrigatória, anuladas e retomada após falha da IA. As chamadas de IA nesses testes são simuladas para não consumir cota nem depender da disponibilidade do provedor.
