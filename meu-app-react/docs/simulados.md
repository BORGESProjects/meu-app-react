# Provas completas e treinos CPOR/NPOR

A aba Simulados separa dois usos:

- **Edições completas:** somente cadernos dos lotes oficiais já conferidos. O catálogo fixa os IDs e a quantidade original de posições. A edição só aparece quando todos os registros da configuração escolhida estão carregados e publicáveis. Anuladas contam na conferência de completude, mas ficam fora da correção. Coleções parciais continuam no banco de questões.
- **Treino CPOR/NPOR:** nova seleção de 40 questões a cada início, com 10 de Português, 10 de Geografia, 10 de História e 10 de Matemática. Prioriza CPOR/NPOR e depois outras provas militares; completa com questões válidas do acervo se necessário. Não é apresentado como caderno oficial ou como reprodução de um edital específico. Aceita alternativas únicas de quatro ou cinco opções e exclui anuladas, somatórias, Certo/Errado e itens marcados como incompletos.

O idioma e as específicas UEM são configurados antes de iniciar. O simulado mantém uma cópia da seleção durante a tentativa: novas etapas do carregamento não inserem ou removem questões já iniciadas. Respostas e resultado continuam no fluxo de progresso existente da conta.

## Manutenção

`node scripts/catalogar-provas-completas.mjs` reconstrói `src/data/provasCompletas.json` a partir das fontes canônicas explicitamente aceitas no script. Há 104 cadernos/configurações registrados; a lista exibida pode ser menor por idioma, quarentena ou deduplicação que impeça recuperar todos os IDs. Não reduzir a quantidade esperada para fazer um caderno incompleto aparecer. Novas provas exigem conferir o caderno, o gabarito e a quantidade original antes de ampliar o catálogo.

Validação: `node --test scripts/simulados.test.mjs`, `node --test scripts/*.test.mjs` e compilação Vite. Os testes cobrem a ausência de posições e anuladas, idiomas, específicas, identidade de cargos e a composição exata dos treinos.
