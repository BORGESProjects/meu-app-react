# Publicar o acervo extraído no Supabase

O acervo principal de 25.495 questões continua na tabela `questoes`. Os 171.317 registros extraídos ficam separados em lotes compactados no Storage privado e são carregados quando uma edição é escolhida.

## Uso no plano Free

Os lotes compactados ocupam aproximadamente 57 MiB. O pacote completo de 34.192 imagens renderizadas ocupa cerca de 2,67 GiB e não cabe no Storage Free de 1 GB. O envio padrão guarda até 795 páginas referenciadas por questões sem PDF direto ou com fonte em pacote ZIP, além de todos os lotes e índices. As outras páginas continuam ligadas ao documento de origem informado pela questão. A transferência estimada do pacote padrão é de aproximadamente 132 MiB; confirme espaço disponível no projeto antes do envio.

## Preparar o bucket privado

1. No painel do Supabase, abra o SQL Editor e execute `backend/src/main/resources/acervo-extraido-storage.sql`. A política permite leitura somente a contas autenticadas.
2. Abra um PowerShell na pasta do projeto e defina a URL do projeto e a chave administrativa somente no ambiente local. A URL pública pode ser lida de `.env.local`; a chave secreta `service_role`/`sb_secret_` não deve ser colocada em variáveis `VITE_`, no código do app, no Git ou nesta conversa.
3. Execute `npm run acervo:enviar:supabase`. O script cria o bucket privado se necessário, valida os 524 lotes, envia os lotes e as imagens necessárias e publica o manifesto por último. Se uma conexão cair, pode ser executado novamente.
4. Publique a aplicação na Vercel. A compilação exclui a pasta local de 2,8 GB e serve os arquivos do Storage sob demanda.

Para informar a chave no PowerShell, use `$env:SUPABASE_SERVICE_ROLE_KEY` ou `$env:SUPABASE_SECRET_KEY`. O script lê `VITE_SUPABASE_URL` de `.env.local` quando `SUPABASE_URL` não está definida. Remova as variáveis do ambiente ao terminar.

## Limites conhecidos

- O total exibido soma 25.495 questões existentes e 171.317 extraídas; não houve deduplicação cruzada entre os acervos.
- O gabarito das questões extraídas não foi conferido. Elas não recebem nota automática.
- Páginas não enviadas como imagem própria dependem do PDF ou pacote de origem e de o endereço continuar disponível.
- O Storage exige o SQL de leitura acima; a chave administrativa é usada apenas pelo script de publicação e nunca pelo navegador ou aplicativo desktop.
