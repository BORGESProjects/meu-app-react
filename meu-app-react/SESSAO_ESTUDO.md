# Sessão de estudo

O cronômetro calcula a diferença entre o horário atual e o início da sessão, somando os trechos anteriores à pausa. O intervalo serve somente para atualizar a tela, sem somar segundos por callback. Ao voltar à página, receber foco ou restaurar a página, a exibição é atualizada imediatamente. Não depende da frequência de execução em segundo plano.

O componente mantém o estado e suas atualizações isolados do acervo e dos filtros. A sessão em andamento fica no sessionStorage da aba, em chave específica da conta, permitindo trocar de seção e recarregar a mesma aba. Uma aba fechada não tem recuperação garantida: a interface pede para encerrar e registrar antes de fechá-la. As horas encerradas continuam usando a sincronização de progresso existente no Supabase.

Pausar conserva os milissegundos acumulados; retomar inicia um novo trecho. Encerrar calcula o tempo novamente no clique e registra a duração exata em horas, além dos segundos, sem arredondar sessões curtas para seis minutos. A duração mínima de dez segundos permanece. O ID da sessão acompanha o registro. Os dados de outras contas não são restaurados.

Validação: 101 testes aprovados e compilação de produção concluída. Testes específicos cobrem uma hora sem callbacks, pausas e retomadas, restauração por conta, dados inválidos, relógio atrasado e formatação com horas. No navegador, a troca de seção recuperou o tempo, a recarga preservou uma sessão pausada em 22 segundos e o encerramento gerou somente um registro de 34 segundos no ambiente local de teste. Nenhum registro de estudo foi criado na conta real durante essa conferência.
