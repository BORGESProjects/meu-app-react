# Provas completas e treinos CPOR/NPOR

A aba Simulados separa dois usos:

- **Edições completas:** somente cadernos dos lotes oficiais já conferidos. O catálogo fixa os IDs e a quantidade original de posições. A edição só aparece quando todos os registros da configuração escolhida estão carregados e publicáveis. Anuladas contam na conferência de completude, mas ficam fora da correção. Coleções parciais continuam no banco de questões.
- **Treino CPOR/NPOR:** nova seleção de 40 questões a cada início, com 10 de Português, 10 de Geografia, 10 de História e 10 de Matemática. Prioriza CPOR/NPOR e depois outras provas militares; completa com questões válidas do acervo se necessário. Não é apresentado como caderno oficial ou como reprodução de um edital específico. Aceita alternativas únicas de quatro ou cinco opções e exclui anuladas, somatórias, Certo/Errado e itens marcados como incompletos.

O idioma e as específicas UEM são configurados antes de iniciar. O simulado mantém uma cópia da seleção durante a tentativa: novas etapas do carregamento não inserem ou removem questões já iniciadas. Respostas e resultado continuam no fluxo de progresso existente da conta.

## Manutenção

`node scripts/catalogar-provas-completas.mjs` reconstrói `src/data/provasCompletas.json` a partir das fontes canônicas explicitamente aceitas no script. Há 104 cadernos/configurações registrados; a lista exibida pode ser menor por idioma, quarentena ou deduplicação que impeça recuperar todos os IDs. Não reduzir a quantidade esperada para fazer um caderno incompleto aparecer. Novas provas exigem conferir o caderno, o gabarito e a quantidade original antes de ampliar o catálogo.

Validação: `node --test scripts/simulados.test.mjs`, `node --test scripts/*.test.mjs` e compilação Vite. Os testes cobrem a ausência de posições e anuladas, idiomas, específicas, identidade de cargos e a composição exata dos treinos.

## Foco e prática personalizada

Quatro preferências: Concursos públicos, Concursos militares, Vestibulares e Sem preferência de estudo (padrão). O foco é salvo em `auth.users.user_metadata.foco_estudo`, pela sessão do próprio usuário. Não participa da autorização de administrador. Em falha de gravação, a seleção funciona na página, mas há aviso explícito e opção de tentar salvar; não se afirma que foi sincronizada. Trocar de foco não exclui histórico, horas, edital ou tarefas.

A escolha restringe os filtros do banco e os cadernos completos às categorias reconhecidas. Questões de assimilação continuam disponíveis nos perfis, para treino por matéria; instituições não identificadas ficam disponíveis em Sem preferência. O filtro é uma classificação de navegação, não uma decisão sobre validade das questões.

O criador geral permite quantidade de 1 a 120, banca/instituição, matérias e prática equilibrada, inéditas, erros da última tentativa ou revisão sugerida. Recusa a seleção insuficiente em vez de gerar um lote menor silenciosamente. Perfis militares mantêm o atalho CPOR/NPOR de 40 questões; vestibulares têm um treino de 40, dez por área (Linguagens, Humanas, Natureza, Matemática), que não é uma reprodução da matriz do ENEM nem calcula nota TRI. Sem preferência reúne os dois atalhos e todos os cadernos. Concursos públicos têm o criador geral e seus cadernos, incluindo Certo/Errado quando houver no acervo.

A tentativa conserva seleção e horário inicial, apresenta contagem de respostas e tempo decorrido pelo relógio, inclusive ao ficar em segundo plano. A correção permite consultar cada gabarito, ver alternativas visuais e repetir erros/questões não respondidas. Explicações só são exibidas quando já existem no registro; não se inventa resolução. O envio é protegido contra entrega dupla na mesma tentativa.

## Referências de produto e de aprendizagem

- [Fênix Concursos Militares](https://fenixconcursosmilitares.com.br/): organização por objetivo militar, banco de questões e simulados. Consultada somente a oferta pública, sem copiar layout, conteúdo restrito ou alegar equivalência dos serviços.
- [Qconcursos: Central de Preparação](https://suporte.qconcursos.com/pt-BR/collections/13448274-central-de-preparacao-e-portal) e [Simulados](https://www.qconcursos.com/simulados): referência para cadernos, personalização e correção de desempenho. Não há integração com a conta do Qconcursos.
- [Dunlosky et al. (2013), Improving Students’ Learning With Effective Learning Techniques](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html): evidências para prática de recuperação e estudo distribuído. A fila de revisão usa a última tentativa válida e uma regra prática de 1 dia após erro e 1/3/7/14/30 dias após acertos consecutivos. Esses intervalos são heurísticos; o artigo não prescreve essa sequência como ideal universal nem garante aprovação.

Testes adicionais: `scripts/foco-estudo.test.mjs` cobre separação de perfis, Sem preferência, composição de simulados, insuficiência, últimas tentativas, datas de revisão e salvamento de preferências sem alteração de credenciais.
