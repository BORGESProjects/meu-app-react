# Importador local de provas

O importador processa os PDFs no computador do administrador. O PDFBox extrai o texto e separa as questões; o Ollama executa o modelo `qwen3:4b-instruct` localmente para sugerir matéria, conteúdo e dificuldade. Nenhum PDF ou texto de questão é enviado ao Gemini ou a outro provedor de IA.

## Primeira configuração no Windows

1. Clique com o botão direito em `configurar-importador-local.ps1` e escolha **Executar com PowerShell**.
2. O assistente instala o Ollama e baixa o modelo local de aproximadamente 2,5 GB.
3. Informe a conexão PostgreSQL usada pelo site. Esses dados são gravados somente em `backend/application-local.properties`, arquivo ignorado pelo Git.
4. Execute `iniciar-importador-local.ps1`. O importador abre em `http://127.0.0.1:41731`, diretamente na aba de importação.
5. Entre com a conta administrativa `nickbr613@gmail.com`.

Para encerrar os processos locais, execute `parar-importador-local.ps1`.

## Fluxo de trabalho

1. Envie a prova e o gabarito, informe ano, banca, concurso, modelo e quantidade.
2. Aguarde a extração local. Em seguida, o programa classifica automaticamente todas as questões em lotes de até dez e salva o rascunho no banco do site.
3. A tela destaca classificações de baixa confiança, alternativas incompletas e respostas sem gabarito. O botão **Classificar pendentes** serve apenas para repetir lotes que tenham falhado.
4. Confira os itens sinalizados. Use **Aprovar questões completas em lote** para confirmar de uma só vez os demais itens.
5. Salve o rascunho.
6. Publique. As questões aparecem no acervo sem novo deploy.

Os botões **Exportar JSON** e **Exportar SQL** criam cópias portáteis do lote. A publicação direta é a opção normal; use os arquivos para backup ou recuperação.

## Limites e segurança

- PDF sem senha, até 6 MB e 100 páginas; prova com até 150 questões.
- Somente o usuário confirmado cujo e-mail coincide com `ADMIN_EMAIL` pode importar e publicar.
- O modelo local apenas classifica. A extração estrutural e o gabarito usam regras determinísticas, e a publicação exige revisão humana.
- A correção de redação continua separada e pode usar o Gemini. O importador de questões não depende dele.

## Validação do projeto

Execute `npm run build`, `npm run lint` e `mvn test` dentro de `backend`.
