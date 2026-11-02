# Página comercial no Cloudflare Pages

## Última publicação confirmada — 26/10/2026

- Produção: `https://ap-aprovado.pages.dev/`.
- Área do aluno: `https://ap-aprovado.pages.dev/aluno` (`/aluno.html` redireciona para esse endereço).
- Publicação: `aa48c4b9`, na ramificação de produção `main`.
- Inclui reenvio de confirmação de cadastro para `/aluno`, mensagens de e-mail
  não confirmado e link expirado, e confirmação de sucesso consultada no Supabase.
  Reenvio e tratamento de falhas verificados com respostas simuladas, inclusive no
  site publicado. A confirmação da conta real do titular ainda não foi observada.
- A página inicial mantém a identidade visual do HTML original, com ajustes
  responsivos para celular. O portal usa as mesmas cores,
  fontes Inter/Space Grotesk, marca e botões.
- HTML e assets públicos conferidos contra o build local. Navegação, alternância
  de login/cadastro e layout móvel verificados no endereço público. Desempenho,
  ranking, proteção contra HTML em apelidos e saída foram exercitados com dados
  fictícios em navegador isolado; nenhum cadastro real foi criado.
- A conexão OAuth temporária do Wrangler foi encerrada após a publicação.
- Cabeçalho e menu adaptados a telas estreitas; cartões sem corte lateral;
  janelas com rolagem e controle de foco; campos e botões ajustados ao toque.
  Testes no site público passaram em oito tamanhos de tela em navegador isolado
  (320, 360, 390, 430, 768, 844, 1024 e 1440 pixels de largura), incluindo
  orientação horizontal. Verificados menu, planos, janela de cadastro, FAQ,
  demonstração, navegação e alternância entre login e cadastro. Serviços externos
  de autenticação e pagamentos foram simulados nesses testes; nenhum e-mail ou
  cobrança real foi enviado. Isso não substitui testes em aparelhos físicos.

Atualização do backend em 26/10/2026: `/api/acesso/planos` retorna 200 e seis
planos; endpoints financeiros recusam visitantes sem login com 401. A conexão
Mercado Pago e os segredos ainda estão pendentes, conforme `acesso-comercial.md`.
Na verificação anterior, `perfil_ranking_usuario` não existia na API do Supabase;
essa pendência de ranking não foi revalidada nesta atualização. O painel de progresso carrega
independentemente da disponibilidade da API de assinaturas.

O projeto `ap-aprovado` publica a página de marketing do HTML fornecido, a área
comercial do aluno e os arquivos do portal. Não inclui o app de estudos, banco
de questões, ferramentas de administração do acervo ou backend Java.

## Publicar atualização

Na raiz do repositório, execute:

```powershell
npm run pages:deploy
```

O preparo compila somente `portal/aluno.html` com o cliente Supabase e valida
que a pasta publicada contém `index.html`, `aluno.html` e `assets/portal/*`.
O Wrangler publica usando `public-page` como diretório de trabalho, isolando a
pasta `functions` do app de estudos.

## Endereço

O endereço ativo é <https://ap-aprovado.pages.dev/>. A área do aluno fica em
<https://ap-aprovado.pages.dev/aluno.html>.

O Cloudflare informou que `apaprovado.com` não está registrado. Após o titular
registrar o domínio, associe-o em **Workers & Pages → ap-aprovado → Custom
domains**, conclua os registros DNS e atualize os endereços de retorno do
backend e do Supabase. A documentação oficial descreve os requisitos do domínio
raiz: <https://developers.cloudflare.com/pages/configuration/custom-domains/>.

## Configuração externa necessária

O cadastro usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em tempo de build;
o portal assume `https://aprovado-api.onrender.com` quando `VITE_API_URL` não é
informada. Em Supabase, permita a URL de confirmação em
`https://ap-aprovado.pages.dev/aluno.html`. O backend, as credenciais de OAuth,
os webhooks e o e-mail administrador são configurados separadamente conforme
[`acesso-comercial.md`](acesso-comercial.md).
