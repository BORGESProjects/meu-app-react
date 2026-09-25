# Publicar a API

A configuracao esta pronta para Render + Vercel, com PostgreSQL persistente.
O render.yaml fica na raiz do repositorio Git, um nivel acima desta pasta.

1. Envie as alteracoes deste projeto e o render.yaml ao GitHub.
2. No Render, escolha New > Blueprint e conecte BORGESProjects/meu-app-react.
3. Preencha os campos solicitados:
   - FRONTEND_URL ja esta preenchida com o endereco informado. Se o dominio mudar, atualize esse campo no Render.
   - GEMINI_API_KEY: sua chave do Google AI Studio.
   - DATABASE_URL: URL JDBC do PostgreSQL. Para o Supabase, use o Session pooler
     (porta 5432) exibido em Connect, por exemplo:
     jdbc:postgresql://HOST:5432/postgres?sslmode=require
   - DATABASE_USERNAME: usuario mostrado no Session pooler.
   - DATABASE_PASSWORD: senha do banco (nao a chave anon do Supabase).
4. Quando o Render exibir Live, copie a URL HTTPS do servico.
5. O frontend ja usa https://aprovado-api.onrender.com em producao. VITE_API_URL e opcional e permite substituir esse endereco. Publique as alteracoes do frontend na Vercel.
   Mantenha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY configuradas.

Depois da primeira configuracao, os novos commits acionam o deploy do backend.
O frontend acompanha os commits se o projeto Vercel estiver conectado ao GitHub.
O plano free do Render pode suspender a API por inatividade e demorar ao reabrir.

## Verificacao
Abra ENDERECO_DA_API/api/health: deve retornar {"status":"ok"}.
No site, teste carregar o edital e enviar uma redacao.
O perfil prod exige PostgreSQL; nao utiliza o H2 temporario.
Dados antigos do H2 nao sao migrados automaticamente.
A disponibilidade do modelo Gemini e a validade da chave dependem da sua conta.

## Desenvolvimento local
O frontend usa localhost:8080 quando VITE_API_URL nao esta definida.
A configuracao local anterior foi preservada, quando havia uma chave, em
backend/application-local.properties, ignorado pelo Git e pelo Docker.
Execute o Java a partir de backend para carregar esse arquivo.
Se a chave antiga foi enviada ao GitHub, revogue-a e gere outra antes de publicar.
Nao coloque senhas ou a chave Gemini em variaveis VITE_.

A API atual nao possui login ou autorizacao: o CORS restringe os navegadores,
mas nao impede chamadas diretas. Os editais sao compartilhados e as rotas de
alteracao e IA ficam publicas. Antes de uso publico, adicione autenticacao.
