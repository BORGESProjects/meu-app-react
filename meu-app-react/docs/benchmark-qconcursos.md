# Benchmark funcional: Qconcursos

**Levantamento público em 22/10/2026.** A análise considerou a página pública e a Central de Ajuda do Qconcursos; não inclui áreas que exigem uma conta autenticada.

## O que o Qconcursos divulga

A página pública anuncia mais de **1,8 milhão de questões**, mais de 200 mil comentários de professores e mais de 8 mil videoaulas. Também apresenta resolução de questões, gabaritos comentados, comunidade, simulados, cadernos, guias de estudo e estatísticas.

No fluxo de questões, a Central de Ajuda documenta filtros por palavra-chave ou código, disciplina/assunto, banca, nível, cargo, ano, órgão, formação, atuação, leis, modalidade e dificuldade. Também descreve estados de resolução, exclusões, filtros salvos, cadernos e simulados personalizados. Cadernos podem ser gerados de um filtro ou receber questões individuais. Simulados personalizados permitem selecionar disciplinas, quantidade e duração.

## Comparação com o projeto atual

| Área | Já existe no projeto | Lacuna para aproximar a experiência |
|---|---|---|
| Banco e resolução | Questões com alternativas, correção, metadados, provas históricas e importação de PDFs; enunciados com MathML, imagens, tabelas e toolbar de símbolos Unicode no cadastro | Ampliar cobertura e padronizar metadados de banca, órgão e cargo |
| Busca e filtros | Ano, matéria, conteúdo, banca e dificuldade; opções relacionadas se ajustam à seleção; busca por palavra-chave/código; filtros salvos; situação não resolvida/resolvida/certa/errada/favorita | Órgão, cargo, modalidade e busca no servidor para acervos de milhões; os filtros salvos são locais a este dispositivo |
| Cadernos | Cadernos pessoais locais, caderno vazio ou criado a partir dos resultados, inclusão em lote ou por questão, favoritos e anotações pessoais | Sincronização dos cadernos entre dispositivos; ações em lote mais avançadas |
| Simulados | Provas completas e treinos personalizados, cronômetro, revisão dos erros e histórico local dos últimos 50 resultados | Salvar configurações de simulados personalizados e ampliar composição por edital; o histórico fica no dispositivo |
| Desempenho | Horas, questões, acertos, taxa geral e conteúdos a melhorar | Recortes persistentes por banca, matéria, assunto e período, com histórico visual |
| Planejamento | Leitura de edital, plano verticalizado, revisão e cronograma semanal | Conectar os tópicos do edital a cobertura/questões disponíveis e mostrar lacunas |
| Comunidade e explicações | Não identifiquei comentários sociais por questão na interface atual | Comentários moderados e explicações autorais/licenciadas, com denúncia e revisão |
| Aulas e cursos | Oficina de redação e materiais de revisão | Catálogo de cursos/aulas, sujeito a produção ou licenciamento de conteúdo |

## Escala do acervo

O manifesto local em `native/acervo/manifesto.json` registra **25.495 questões**. A diferença para o número divulgado pelo Qconcursos é principalmente uma questão de aquisição e preparação de conteúdo: código pode processar e servir um banco grande, mas não cria legitimamente milhões de questões reais nem comentários de professores.

Para crescer, o sistema deve aceitar questões próprias, conteúdo com licença compatível ou conteúdo cujo uso tenha sido autorizado. Cada registro precisa guardar origem, prova, ano, banca, órgão/cargo quando aplicável, disciplina/assunto, gabarito, explicação e situação de direitos. Não copiar banco, comentários, cursos ou dados privados do Qconcursos.

Há fontes oficiais que publicam cadernos e gabaritos, como a página histórica de provas do [Inep](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos) e páginas de concursos de organizadoras como o [Cebraspe](https://www.cebraspe.org.br/concursos/telebras_25). A publicação para consulta não confirma, sozinha, autorização para republicar o conteúdo em outro produto. Esses materiais são candidatos para análise de licença e ingestão autorizada, não uma licença presumida.

Na escala de milhões, a lista não deve ser baixada inteira para o navegador. A próxima arquitetura precisa usar busca paginada no servidor, índices por metadados e texto, importação em lotes com deduplicação e contagem calculada do acervo realmente publicado.

A busca por palavra-chave/código foi adicionada ao projeto como primeiro passo. Ela pesquisa o acervo já carregado no navegador e aceita combinar texto com os filtros atuais; isso atende o tamanho local atual, enquanto a etapa de escala precisa transferir essa consulta para o servidor.

O seletor de banca e ano agora mostra contagens dinâmicas do acervo carregado. O levantamento da cobertura pública de 1997–2026 e as lacunas por banca estão em [expansão do acervo por fontes públicas](acervo/expansao-questoes-1997-2026.md).

## Ordem sugerida de implementação

1. **Acervo e busca:** contrato de metadados, importador em lote, contagem real, filtros ampliados e pesquisa textual/código paginada no servidor.
2. **Ferramentas pessoais:** filtros, cadernos e histórico recente de simulados já estão disponíveis no dispositivo; sincronizar esses dados entre dispositivos e persistir configurações de simulados por conta.
3. **Análise de aprendizagem:** estatísticas por banca/disciplina/assunto/período e ligação com o edital do aluno.
4. **Conteúdo e comunidade:** comentários, explicações e aulas com autoria, licenças e moderação definidos.

## Fontes públicas

- [Página de questões e funcionalidades do Qconcursos](https://www.qconcursos.com/questoes-de-concursos/)
- [Como usar os filtros de questões](https://suporte.qconcursos.com/pt-BR/articles/12118570-como-usar-os-filtros-de-questoes)
- [Como criar um caderno de questões](https://suporte.qconcursos.com/pt-BR/articles/11655308-como-criar-um-caderno-de-questoes)
- [Como criar um simulado personalizado](https://suporte.qconcursos.com/pt-BR/articles/11655126-como-criar-um-simulado-personalizado)
