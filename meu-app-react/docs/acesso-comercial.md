# Cadastro, assinaturas e recebimentos

## Preparação da integração — 26/10/2026

- Workspace Render autorizado: `My Workspace` (`tea-daqs4t2d0e5s73di9ii0`).
- Serviço: `aprovado-api` (`srv-daqsjc3ncjis73b7hr70`).
- Administrador financeiro definido pelo titular: `guiborg08@gmail.com`.
- Aplicação Mercado Pago: `AP Aprovados`, Client ID `8389737324004435`.
- Salvos no Render: `ADMIN_EMAIL`, `MERCADO_PAGO_CLIENT_ID`,
  `PAYMENT_OAUTH_REDIRECT_URI`, `PAYMENT_RETURN_URL` e `PAYMENT_ADMIN_RETURN_URL`.
- Código publicado no GitHub: `b8c5b63d683c8cb67831c93325f834b1a3d5d6c8`.
  Deploy iniciado automaticamente: `dep-dbfnsnk9v7es73bn15hg`.
- Verificação pública posterior: saúde e lista de seis planos retornam HTTP 200;
  recebimentos e status da conta Mercado Pago retornam HTTP 401 sem autenticação.
- Backend preparado em cópia isolada da branch remota, preservando alterações
  locais não relacionadas. A publicação utiliza `pagamentos-schema.sql` separado
  das migrações do acervo. As tabelas financeiras não concedem acesso aos alunos.
- Verificação Maven: 43 testes, zero falhas, um teste opcional de PDF ignorado.
  Inclui assinatura inválida de webhook, valores enviados como texto, recorrência
  mensal e associação da compra ao aluno autenticado independentemente do e-mail
  usado para pagar. Nenhuma cobrança real executada.
- Callback OAuth salvo pelo titular e conferido após reabrir as configurações:
  `https://aprovado-api.onrender.com/api/acesso/mercado-pago/oauth/callback`,
  com PKCE ativado. Webhook de produção salvo para eventos de planos e assinaturas
  em `https://aprovado-api.onrender.com/api/acesso/webhook/mercado-pago`.
- Segredos transferidos, conforme autorização, exclusivamente às variáveis privadas
  do Render: `MERCADO_PAGO_CLIENT_SECRET`, `PAYMENT_WEBHOOK_SECRET` e
  `PAYMENT_TOKEN_ENCRYPTION_KEY` (32 bytes aleatórios em Base64).
  Atualização iniciada: `dep-dbfo2j4s728c738fje30`.
- Verificação após atualização: saúde e planos HTTP 200; recebimentos sem sessão
  HTTP 401; webhook sem assinatura HTTP 401 (antes faltava configuração).
- Conta recebedora conectada via OAuth à conta administrativa `guiborg08@gmail.com`
  (vendedor Mercado Pago `1597237016`). O portal confirma a conexão após retorno
  ao callback; tokens OAuth são guardados criptografados no banco.
- Corrigida e publicada no Cloudflare Pages a busca de planos: o carregamento
  público agora sobrevive à restauração da sessão do aluno. A página ativa mostra
  os seis planos, inclusive Básica mensal por R$ 9,90.
- Nenhuma cobrança real foi executada. A conta está vinculada e pronta para
  iniciar o checkout quando um estudante escolher um plano.
  Ainda não considerar cobranças ou recebimentos operacionais. Nenhuma cobrança
  real foi executada.

O site público publica apenas `public-page/index.html`, `public-page/aluno.html`
e os arquivos compilados do portal. O app de estudos e o banco de questões não
fazem parte deste deploy.

## Cadastro do estudante

O portal usa Supabase Auth para cadastro, confirmação de e-mail, login e saída.
O checkout e o estado da assinatura só podem ser usados por uma sessão validada
com e-mail confirmado. A URL de confirmação é `/aluno.html` no mesmo domínio do
site; permita esse endereço em **Supabase → Authentication → URL Configuration
→ Redirect URLs**. Cadastre também o domínio definitivo depois que ele for
registrado.

O frontend usa `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_API_URL` no
build do portal. A chave `anon` é pública e deve continuar protegida por RLS; não
coloque chaves `service_role`, segredo OAuth, senha do banco ou token de vendedor
no HTML, no Pages ou no Git.

## Preços configuráveis

Os valores iniciais correspondem ao HTML de marketing e podem ser alterados no
backend sem recompilar o site:

| Plano | Mensal | Trimestral | Anual |
| --- | ---: | ---: | ---: |
| Básica | R$ 9,90 | R$ 20,70 | R$ 58,80 |
| Premium | R$ 19,90 | R$ 41,70 | R$ 118,80 |

Configure os valores no serviço privado do backend:

- `PAYMENT_PRICE_BASIC_MONTHLY_BRL`
- `PAYMENT_PRICE_BASIC_QUARTERLY_BRL`
- `PAYMENT_PRICE_BASIC_ANNUAL_BRL`
- `PAYMENT_PRICE_PREMIUM_MONTHLY_BRL`
- `PAYMENT_PRICE_PREMIUM_QUARTERLY_BRL`
- `PAYMENT_PRICE_PREMIUM_ANNUAL_BRL`

O endpoint público `GET /api/acesso/planos` apresenta os seis preços. O
`POST /api/acesso/checkout` exige sessão Supabase confirmada; a frequência e o
valor enviados ao Mercado Pago são escolhidos no servidor. O webhook consulta a
assinatura e a fatura diretamente na API do provedor e só então libera o acesso.

## Conectar a conta recebedora do Mercado Pago

Crie uma aplicação OAuth no Mercado Pago Developers e cadastre como URI de
retorno a URL pública do backend:

`https://aprovado-api.onrender.com/api/acesso/mercado-pago/oauth/callback`

No serviço privado do backend, configure:

- `MERCADO_PAGO_CLIENT_ID`
- `MERCADO_PAGO_CLIENT_SECRET`
- `PAYMENT_OAUTH_REDIRECT_URI`: a mesma URL cadastrada na aplicação.
- `PAYMENT_TOKEN_ENCRYPTION_KEY`: chave aleatória de 32 bytes codificada em Base64.
- `PAYMENT_WEBHOOK_SECRET`: segredo de assinatura informado pelo Mercado Pago.
- `PAYMENT_RETURN_URL`: `https://ap-aprovado.pages.dev/aluno.html?pagamento=retorno`.
- `PAYMENT_ADMIN_RETURN_URL`: `https://ap-aprovado.pages.dev/aluno.html#recebimentos`.
- `ADMIN_EMAIL`: o e-mail confirmado da única conta administradora.
- `FRONTEND_URL`: mantenha a origem atual do serviço e inclua `https://ap-aprovado.pages.dev` separada por vírgula. O backend já permite essa origem do Pages.

No portal do administrador, **Recebimentos → Conectar Mercado Pago** inicia
OAuth com `state` de uso único e PKCE S256. Os tokens de acesso e renovação são
cifrados com AES-GCM no PostgreSQL e renovados no servidor.

Cadastre os webhooks `subscription_preapproval` e
`subscription_authorized_payment` em:

`https://aprovado-api.onrender.com/api/acesso/webhook/mercado-pago`

O webhook valida a assinatura, consulta os dados atuais no Mercado Pago,
confere valor, ciclo e moeda, evita duplicação de eventos e registra aprovações,
estornos e contestações. O saldo exibido subtrai estornos e contestações, antes
das tarifas do provedor.

## Restrição do painel financeiro

Os endpoints `/api/acesso/admin/*` validam a sessão diretamente no Supabase e
comparam o e-mail confirmado com `ADMIN_EMAIL` no backend. Os recebimentos e
credenciais não concedem leitura aos papéis `anon` ou `authenticated` do
Supabase. O frontend só mostra o painel após obter autorização do servidor.

## Domínio

O Pages está disponível em `https://ap-aprovado.pages.dev/`. `apaprovado.com`
precisa ser registrado pelo titular; depois, associe-o ao projeto Cloudflare
Pages e atualize `FRONTEND_URL`, `PAYMENT_RETURN_URL`,
`PAYMENT_ADMIN_RETURN_URL` e a lista de redirecionamentos do Supabase para o
domínio definitivo.
