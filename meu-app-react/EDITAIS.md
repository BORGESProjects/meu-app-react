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

## Importação local de PDF

No concurso selecionado, abrir “Importar e verticalizar um PDF de edital”. O PDF.js lê o arquivo no navegador, procura uma seção de conteúdo programático e sugere o intervalo de páginas. O usuário pode corrigir o intervalo, visualizar uma página original e extrair os tópicos. O algoritmo usa posição dos textos para separar colunas e tabelas, incluindo matérias centralizadas verticalmente ao lado de listas. Tópicos continuam entre linhas e páginas; cabeçalhos repetidos e bibliografias são separados dos conteúdos. Matérias não identificadas com segurança exigem ajuste do texto em vez de inventar agrupamentos.

OCR em português é executado em um Web Worker local com Tesseract.js, sem Gemini ou envio do documento a servidores de OCR. Há reconhecimento automático de páginas com pouco texto/caracteres problemáticos e opção para forçar OCR num intervalo. Tabelas divididas em duas colunas são reconhecidas separadamente. O resultado sempre sinaliza páginas de OCR e confiança baixa. Não há garantia de transcrição perfeita em scans ruins: a prévia permite corrigir nomes, títulos, excluir itens da seleção e reprocessar texto manualmente. A confirmação na interface acrescenta somente os itens selecionados, reutilizando matérias equivalentes, sem mudar etapas, notas ou prioridades anteriores.

Limites: PDF de até 20 MB e 300 páginas; até 20 páginas de OCR por lote. Documentos protegidos por senha precisam de cópia sem proteção. PDF, worker e OCR são liberados ao sair do importador; a operação pode ser cancelada. A referência de arquivo, SHA-256, páginas de origem, uso de OCR e ajuste manual acompanha cada tópico salvo; o binário do PDF não vai para o banco. A nova função não exige migração adicional do banco.

As dependências e workers são carregados apenas ao abrir o importador. `scripts/preparar-leitor-edital.mjs` copia os recursos das versões fixadas no lockfile para o próprio site antes do desenvolvimento e da compilação. O modelo português é versionado em `public/leitura-editais`; os demais recursos são gerados e ignorados pelo Git. Bibliotecas e modelo usam Apache-2.0; atribuição e licença estão na mesma pasta.

Testes reais reproduzíveis em `scripts/edital-pdf.test.mjs`, com documentos e hashes oficiais em `scripts/fixtures/editais`: 41 tópicos em Português/Matemática num edital com colunas e 20 tópicos em Engenharia Civil/Logística numa tabela de duas páginas. Também há regressões de hierarquia, bibliografia, caracteres ilegíveis, referências e preservação do progresso. Esses documentos são fixtures de teste e não são importados nas contas dos usuários.

Validação da importação: 97 testes aprovados; compilação de produção e verificação estática aprovadas. No navegador, leitura nativa e OCR da página de duas colunas recuperaram os 17 tópicos de Português e 24 de Matemática. A inclusão de teste manteve as duas matérias existentes e suas duas marcações estudadas (de 5 para 46 conteúdos), incluindo origem por página; o cancelamento seguinte não gravou novos itens. Todos esses passos usaram uma conta simulada local. Colunas sem título identificável ficam separadas com nome pendente, que precisa ser corrigido antes de salvar, em vez de misturar disciplinas. A auditoria das dependências de produção não apontou vulnerabilidades.
