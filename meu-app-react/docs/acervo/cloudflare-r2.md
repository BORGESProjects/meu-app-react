# Armazenamento do acervo no Cloudflare R2

O painel **Armazenamento do acervo · Cloudflare** aparece na página de questões extraídas para a conta administradora. Ele mede todos os objetos que já existem no bucket e aplica um teto fixo de **10.000.000.000 bytes** (10 GB decimais) antes de aceitar cada lote. O limite inclui arquivos de qualquer origem presentes no bucket, não apenas os enviados por este app.

## Envio pelo site

1. Publique no Render a versão do backend que contém `/api/acervo/r2/status`, `/api/acervo/r2/preflight` e `/api/acervo/r2/objetos`, mantendo as credenciais R2 somente nas variáveis privadas do serviço. Se `R2_BUCKET_NAME` não for definido, o backend usa `acervo-extraido`.
2. Publique a versão do frontend com o painel. Entre no site com a conta administradora.
3. Em **Questões extraídas**, selecione a pasta local `public/acervo-extraido`.
4. O painel compara o pacote selecionado com o acervo auditado: 34.718 arquivos e 2.928.448.054 bytes. Antes de iniciar, o backend confere o espaço líquido que será necessário, considerando também os arquivos com as mesmas chaves que já estejam no bucket. Se não couber, não envia nenhum arquivo.
5. O envio segue em lotes de até 10 MB, confirma o tamanho de cada objeto e publica `manifesto.json` por último. O status atualizado do bucket aparece no painel.

O backend também repete a checagem de tamanho antes de cada lote, conta objetos com a API S3 do R2 e serializa os envios recebidos por sua instância. O antigo endpoint de URLs de escrita assinadas foi removido, para que o navegador não possa contornar a trava. Se uma conexão cair, os lotes já concluídos podem ser reenviados: a pré-conferência calcula somente o espaço adicional necessário para substituir ou acrescentar esses arquivos.

## Limites operacionais

- Este painel envia somente o corpus estruturado em `public/acervo-extraido`, não os PDFs brutos de 19 GB.
- A trava cobre as gravações feitas pela aplicação. Escritas manuais no painel Cloudflare ou por outras chaves de acesso ficam fora do controle do app; para preservar o teto, mantenha essas gravações no mesmo limite.
- O app não apaga arquivos do bucket durante o envio.
- O acervo foi auditado estruturalmente, mas os alertas de OCR/transcrição e os gabaritos ainda exigem revisão; o envio não transforma conteúdo não conferido em conteúdo validado.
