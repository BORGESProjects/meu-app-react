# Filtros relacionados do acervo

As opções são derivadas do índice do acervo carregado no foco de estudo atual. Não há lista fixa de matérias permitidas por concurso: se uma edição válida introduzir uma disciplina, a opção passa a aparecer quando suas questões forem carregadas.

Cada lista considera as seleções dos **outros** campos. Dentro de um campo, a multisseleção forma uma união (OU); entre campos, aplica-se a interseção (E). Exemplo: CPOR + ENEM oferece as matérias presentes em pelo menos uma dessas bancas. O próprio filtro de banca continua permitindo ampliar a seleção, limitado pelos outros filtros ativos.

Ano, matéria, conteúdo, banca e dificuldade seguem a mesma regra. Conteúdos mostram a contagem no contexto dos demais campos. O cálculo usa uma passada no índice e armazena rótulos normalizados por versão do índice, sem reclassificar textos a cada clique.

Ao editar um filtro, a alteração mais recente tem prioridade. As demais seleções compatíveis são mantidas; escolhas sem correspondência são removidas com aviso, para evitar seleções ocultas ou combinações vazias. Apenas a ação do estudante reconcilia seleções: carregamentos parciais ou falhas de rede não as apagam automaticamente.

Os menus recebem uma chave por foco e contexto dos outros campos. Isso limpa buscas antigas ao mudar de contexto e preserva a busca ao marcar mais opções dentro do mesmo filtro. O cronograma mantém sua lista de matérias independente desses filtros.

A aba permanece vazia sem seleção, como antes. Os filtros alteram a navegação; não removem questões, progresso, tarefas ou classificações do banco.

Validação: `node --test scripts/filtros-relacionados.test.mjs scripts/desempenho.test.mjs` e a suíte geral. Os testes cobrem CPOR sem Química, ESA sem Filosofia, inclusão automática de uma matéria nova, multisseleção, contagens, limpeza de incompatibilidades, carregamento parcial e comparação das contagens otimizadas com uma implementação direta.
