# AP Aprovado — produtos e publicações

Este repositório mantém dois produtos separados. O app com banco de questões é o modelo do futuro software instalável para Windows e Android. A página comercial e o portal do estudante são publicados em outro projeto, no Cloudflare Pages.

## Site público na Vercel

- A raiz da Vercel (`/`) abre o app original com banco de questões.
- `/estudar.html` também abre o app do banco de questões e permanece como rota de compatibilidade.
- A aba Editais e o catálogo de modelos oficiais ficam no app do banco. O portal comercial não recebe esse catálogo por reaproveitar componentes internos.
- `npm run build` compila o app e configura sua entrada na raiz da Vercel.

## Página comercial e portal do estudante

- A página comercial e o portal do estudante continuam separados e são publicados no Cloudflare Pages pelo projeto `ap-aprovado`; nesse projeto, `index.html` permanece sendo a página comercial.
- `portal/aluno.html`, `portal/main.js` e `portal/style.css` são a fonte do portal do estudante; a página mantém seus próprios indicadores e ferramentas de organização.
- `npm run pages:prepare` monta e confere o pacote comercial em `public-page/`. `npm run pages:deploy` publica esse pacote no Cloudflare Pages.
- A publicação da Vercel não substitui nem remove os arquivos ou funções do portal comercial. A publicação no Cloudflare não altera o app do banco.

## Aplicativos futuros

O código do banco de questões permanece a referência funcional para os aplicativos Tauri (`src-tauri/`). Os comandos `npm run app:windows` e `npm run app:android` geram instaladores de desenvolvimento/produção conforme a configuração local e as ferramentas disponíveis; os produtos nativos ainda devem ser tratados como trabalho separado dos dois sites web.

## Regra de manutenção

Implemente recursos do banco de questões em `src/`; esse é o app publicado na raiz da Vercel. Implemente recursos da página comercial ou do portal do estudante em `index.html` e `portal/`, publicados no Cloudflare Pages. Não mova funcionalidades entre essas áreas sem instrução explícita. Os catálogos e dados pessoais devem respeitar o escopo próprio de cada produto.
