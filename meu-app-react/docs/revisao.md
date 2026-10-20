# Central de revisão

Resumo e mapa mental são duas visualizações do mesmo material pessoal. Os tópicos usam uma linha por nó e dois espaços por nível de subtópico, até 100 nós e cinco níveis. A organização automática transforma parágrafos e frases do resumo em tópicos, preservando o texto; não gera explicações novas nem chama provedores de IA. A prévia permite conferir antes de salvar.

O estudante pode ocultar o material para tentar lembrar os conceitos, revelar para conferir e agendar a próxima revisão em 1, 3 ou 7 dias. Esses intervalos são escolhas práticas, não uma promessa de retenção ou um algoritmo que mede domínio. As revisões são registradas por material. Há busca, filtro por matéria, visualização integrada ou separada, edição e exportação em texto. O acesso às questões aplica a matéria e o grupo de conteúdo do acervo no foco atual; o botão fica indisponível se não houver itens compatíveis.

## Armazenamento

Os materiais usam o fluxo já existente e autenticado de `progresso_usuario`, na coleção JSON de planejamento `tarefas`, com discriminador `tipo: material_revisao` e identificadores `revisao:UUID`. Isso permite sincronização por conta sem migração de banco, novos endpoints ou dependência da API de IA. O cronograma filtra esses registros e mantém suas tarefas e contagens intactas. O protocolo de operações por ID preserva alterações concorrentes nos outros materiais e tarefas. A política de acesso por usuário permanece a do progresso existente.

O editor só envia alterações ao progresso quando o aluno salva. O estado de sincronização no topo indica gravação remota ou cópia pendente no navegador. Trocar de aba sem salvar descarta somente a edição ainda não salva; há aviso no formulário. Materiais já salvos permanecem na conta independentemente do foco selecionado. A cópia local e a fila de operações são isoladas por usuário pelo mecanismo existente.

Limites: título 160 caracteres, resumo 12.000 e tópicos 16.000. Texto é renderizado como texto React, sem HTML. O mapa usa árvore responsiva com ramificações e não carrega bibliotecas gráficas externas. O componente é carregado sob demanda.

`scripts/revisao.test.mjs` verifica hierarquia, preservação do texto, limites, agendamento e compatibilidade com a sincronização sem alterar tarefas.
