# Editais pessoais e verticalização

A aba Edital usa a conta conectada. Cada concurso tem título, edição, unidade/local e data opcional. Matérias e tópicos são independentes por edital. Não há substituição de matérias ao incluir novos conteúdos.

## Uso

1. Criar um concurso, por exemplo CPOR, edição e unidade desejadas.
2. Abrir “Acrescentar matérias e conteúdos”. Para uma matéria, informar seu nome e colar um tópico por linha ou separado por ponto e vírgula. Para várias, colocar cada título em uma linha terminada por dois-pontos ou entre colchetes.
3. Conferir a prévia e acrescentar. Repetições na mesma matéria são ignoradas; tópicos existentes mantêm etapa, prioridade e anotações.
4. Marcar estudado pelo checkbox ou escolher Não iniciado, Em estudo, Revisar ou Estudado. Usar prioridade alta e anotações para organizar revisões.

Os exemplos da interface explicam a organização; não são programas oficiais de concursos. O usuário deve incluir os conteúdos do edital de sua aplicação.

## Persistência e preservação

- `public.editais_usuario` guarda um documento por concurso com UUID e proprietário. O frontend usa o Supabase autenticado. RLS restringe SELECT/INSERT/UPDATE/DELETE ao próprio `auth.uid()`. Permissões padrão de tabela são revogadas, inclusive TRUNCATE; acesso anônimo não é permitido.
- A migração idempotente está em `backend/src/main/resources/acervo-security.sql`, já executado na inicialização do perfil de produção. A estrutura também foi aplicada e conferida diretamente no banco antes da publicação.
- Alterações usam o ID, usuário e versão `updated_at`. Uma gravação sobre uma versão desatualizada falha em vez de sobrescrever alterações de outra aba. O formulário conserva o rascunho para nova tentativa.
- Falhas de rede não aplicam marcações otimistas falsas. A confirmação aparece somente após o retorno do banco.
- `edital_itens` permanece intacta. A consulta de modelos anteriores é opcional e somente leitura. Uma cópia pessoal agrupa por concurso e matéria, sem herdar marcações compartilhadas como se fossem progresso pessoal.
- Nenhuma informação é adicionada às tarefas ou ao histórico de respostas; o acervo de questões permanece separado. A aba carrega seu módulo somente ao ser aberta.
- “Baixar cópia” exporta o edital selecionado em JSON para backup.

## Validação

Testes de inclusão não destrutiva, normalização de repetições, isolamento de alterações, parsing, filtros, cópia de modelos e configuração de persistência em `scripts/editais.test.mjs`. Suíte completa: 90 testes aprovados. Compilação de produção aprovada. Fluxos de criação, inclusão de uma/várias matérias, marcação, troca de concurso e recarga conferidos no navegador com dados de teste, incluindo largura de 390 px. No PostgreSQL, leitura e alteração próprias, bloqueio de operações sobre outra conta, acesso anônimo e TRUNCATE foram conferidos; todos os registros temporários foram revertidos e as contagens dos registros legados/progresso permaneceram iguais.
