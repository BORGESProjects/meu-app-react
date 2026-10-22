# AP Aprovado para Windows e Android

As duas versões usam o mesmo React do site com Tauri 2. As telas, filtros, provas, tipos de resposta, tesourinha, revisão, redação, tarefas, sessão de estudo, desempenho e áreas administrativas são reaproveitados. O build web continua separado.

## Acervo instalado

O pacote inicial contém 25.495 questões, 38.654 referências visuais verificadas por SHA-256 e aproximadamente 695 MiB de texto e imagens antes da compactação. Inclui figuras originalmente carregadas pela API e por outros servidores públicos. Fórmulas disponibilizadas com extensão `.latex`, mas cujo conteúdo real é GIF, são preservadas como GIF.

O manifesto está em `native/acervo/manifesto.json`; os dados, em `native/acervo/questoes.json`. O aplicativo só abre o pacote se a assinatura e a contagem conferirem. O empacotamento verifica cada imagem e interrompe se algum recurso faltar. Os PDFs completos acessados por links de consulta continuam externos; os recortes e textos usados para resolver as questões estão incluídos.

As edições iniciais incluem todo o acervo, não apenas uma janela remota do site. Novas questões publicadas posteriormente exigem uma nova edição do pacote. Esta versão ainda não tem atualização incremental por matéria.

## Com e sem internet

É necessário entrar na conta com conexão pelo menos uma vez em cada instalação. Depois disso a identificação local permite retomar o estudo offline; não contém token adicional, senha ou privilégio administrativo. Sair da conta remove essa identificação. Em um computador compartilhado, use contas separadas do sistema operacional e saia ao terminar.

Questões, filtros, resolução, simulados, tarefas, materiais de revisão, cronômetro, rascunhos de redação e editais pessoais têm suporte local. Respostas, horas e tarefas ficam na fila da conta e se somam ao servidor na reconexão. Editais pessoais usam uma fila própria e comparação de versão: um conflito não sobrescreve silenciosamente outro aparelho. A cópia local pode ser exportada para conferência. Preferências de estudo também ficam pendentes quando não há rede.

Cadastro, confirmação de e-mail, primeiro login, correção por Gemini, publicação/importação administrativa e consulta a fontes externas exigem internet. O aplicativo não inclui o servidor Spring Boot nem um modelo de IA local.

Os dados locais de Windows, Android e navegador são separados. São associados pelo mesmo usuário na sincronização. Não limpe os dados do aplicativo ou o desinstale antes de sincronizar/exportar alterações pendentes.

## Compilação

- `npm run app:preparar`: compila o React nativo e inclui somente recursos usados no acervo e no leitor PDF/OCR.
- `npm run app:windows`: gera instalador NSIS do Windows, com Rust, MSVC e SDK instalados.
- `npm run app:android:iniciar`: gera o projeto Android usando o SDK/NDK configurado.
- `npm run app:android`: gera APK de produção, que requer configuração de assinatura.
- `npm run tauri -- android build --debug --apk --target aarch64 --ci`: APK de teste para Android ARM64.
- `npm run app:testar`: verifica dados, recursos, isolamento de contas e filas offline.

A configuração em `native/config.public.json` contém somente o endereço e a chave pública anon do Supabase, já usados no site. A autorização dos dados continua dependendo das políticas do servidor. Nunca coloque senha do banco, chave service_role ou segredo do Gemini no aplicativo.

A rotina `.github/workflows/aplicativos.yml` prepara as ferramentas na nuvem e publica os instaladores como artefatos da execução. A cópia em `native/compilar-apps.yml` documenta a configuração. O APK inicial é de teste; a publicação na Play Store requer assinatura permanente e adaptação do acervo a pacotes de download, pois o tamanho completo excede os limites usuais do pacote base. Não substitua a assinatura entre versões de produção.

O Windows usa WebView2. No Android é necessário manter o Android System WebView atualizado, especialmente para o leitor PDF, MathML e recursos modernos do JavaScript. A conferência em navegador e os testes automatizados não substituem o teste do instalador em um Windows e um Android reais.

Referências oficiais: [Tauri — pré-requisitos](https://v2.tauri.app/start/prerequisites/), [permissões](https://v2.tauri.app/security/capabilities/), [arquivos e diálogos](https://v2.tauri.app/plugin/dialog/), [distribuição Android](https://v2.tauri.app/distribute/google-play/).
