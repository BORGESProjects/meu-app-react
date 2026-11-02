# AP Aprovado — produtos e publicações

Este repositório contém dois produtos web separados e o protótipo do aplicativo de estudos. O banco de questões existente serve de base para o futuro software instalável para Windows e Android; ele não substitui a página comercial nem o portal do estudante.

## Site público na Vercel

- `index.html` é a página comercial e permanece na raiz (`/`).
- `estudar.html` abre o app original do banco de questões e funciona como protótipo de estudo e referência para os futuros aplicativos nativos.
- A aba Editais e o catálogo de modelos oficiais ficam no app do banco. O portal comercial não recebe esse catálogo por reaproveitar componentes internos.
- `npm run build` prepara esses dois caminhos para a Vercel sem trocar a página inicial pelo app.

## Página comercial e portal do estudante

- O portal comercial existente continua separado e é publicado no Cloudflare Pages pelo projeto `ap-aprovado`.
- `portal/aluno.html`, `portal/main.js` e `portal/style.css` são a fonte do portal do estudante; a página mantém seus próprios indicadores e ferramentas de organização.
- `npm run pages:prepare` monta e confere o pacote comercial em `public-page/`. `npm run pages:deploy` publica esse pacote no Cloudflare Pages.
- A publicação da Vercel não substitui nem remove os arquivos ou funções do portal comercial. A publicação no Cloudflare não altera o app do banco.

## Aplicativos futuros

O código do banco de questões permanece a referência funcional para os aplicativos Tauri (`src-tauri/`). Os comandos `npm run app:windows` e `npm run app:android` geram instaladores de desenvolvimento/produção conforme a configuração local e as ferramentas disponíveis; os produtos nativos ainda devem ser tratados como trabalho separado dos dois sites web.

## Regra de manutenção

Implemente recursos do banco de questões em `src/` e na rota `/estudar.html`. Implemente recursos da página comercial ou do portal do estudante em `index.html` e `portal/`. Não mova funcionalidades entre essas áreas sem instrução explícita. Os catálogos e dados pessoais devem respeitar o escopo próprio de cada produto.
