# Auditoria dos arquivos restantes — 25/10/2026

## Conclusão

A pasta somava aproximadamente **4,67 GiB** na auditoria inicial. Nem tudo era indispensável ao site público: havia um build duplicado, dependências de desenvolvimento e arquivos do app nativo. O build regenerável foi removido após uma compilação bem-sucedida. Agora as pastas restantes somam aproximadamente **3,94 GiB**. O maior item, `public/acervo-extraido`, é relacionado ao banco de questões e serve como fallback local e origem para o painel de envio ao R2; contudo, a configuração exclui esse diretório do build publicado. Não foi possível validar, objeto por objeto, se o R2 tem cópia integral equivalente, então a cópia local foi mantida.

## Inventário por uso

| Caminho | Tamanho | Avaliação |
|---|---:|---|
| `public/acervo-extraido/` | 2.956.440.888 bytes; 38.332 arquivos | Lotes e imagens do acervo extraído. O frontend tenta R2, depois Supabase e por fim o caminho local. O Vite exclui esta pasta do build. Serve para fallback e painel de envio; não apagar antes de conferir a cópia remota. |
| `public/acervo/` | 738.677.630 bytes; 40.649 arquivos | Questões, imagens e PDFs estáticos carregados pelo site e cobertos pelos testes. Necessário para as edições locais. |
| `dist/` | Removido; antes eram 786.289.908 bytes e 40.890 arquivos | Build Vite regenerável, com 40.649 cópias dos arquivos de `public/acervo/` (704,5 MiB). A compilação foi verificada com sucesso antes da remoção. Não é fonte nem necessário ao build/deploy Vercel; pode ser recriado com `npm run build` para `vite preview`. |
| `node_modules/` | 242.490.798 bytes; 3.719 arquivos | Dependências para desenvolver e compilar localmente; não são enviadas como arquivos do site. |
| `native/` + `dist-native/` | 190.022.315 bytes | Fontes e saída do app nativo/offline. Não são necessárias ao site web; foram mantidas por pertencerem às versões desktop/Android do projeto. |
| `backend/` | 53.000.297 bytes no total; `target/` tem 52.827.933 bytes e `src/` tem 146.524 bytes | `target/` é saída compilada do serviço; o código-fonte é `backend/src/`. O backend de produção está hospedado separadamente. |
| `public/leitura-editais/` | 31.391.799 bytes | Visualizador e arquivos de apoio usados pelo recurso de editais; também presentes no build. |
| `public/acervo-provas/` | 12.428.294 bytes | Dados públicos de provas usados pela seção correspondente; também presentes no build. |
| `docs/`, `scripts/`, `src/` e `src-tauri/` | menos de 10 MiB somados | Documentação, código, testes e configuração do projeto. |

## Itens sem referência atual

A varredura de referências feita no acervo encontrou **2.635 imagens (40.978.660 bytes, aprox. 39,1 MiB)** sob `public/acervo/federais-em-revisao/` sem vínculo encontrado em JSON de questões nem referência estática no código/build. Elas não são necessárias para as questões atualmente mapeadas, mas podem ser material-fonte para recuperação futura; foram preservadas.

## PDFs e arquivos compactados

Fora de dependências, não foram encontrados ZIP/7z/RAR restantes. Permanecem seis PDFs que a interface abre diretamente (ENEM 2022 e ESA 2025), cópias deles no build, e dois PDFs pequenos usados como fixtures de testes.

## Verificação do build

`npm run build` concluiu sem erro e transformou 154 módulos. O Vite gerou `dist`; a cópia dos assets levou mais tempo por causa dos cerca de 40 mil arquivos estáticos. Depois da compilação, `dist/` foi removido por ser gerado e duplicar recursos públicos. `dist/acervo-extraido/` não foi criado, confirmando que os 2,96 GB do cache local não entram no pacote de build.

## Limitação de armazenamento remoto

As pastas restantes somam **4.232.861.417 bytes (3,94 GiB)**. A implementação prefere o R2, usa o Supabase como alternativa e tenta arquivos locais quando não consegue obter o objeto remoto. Esta auditoria confirmou o comportamento no código e a exclusão da cópia local no build, mas não consultou a lista remota de objetos nem comparou checksums com o R2. Portanto, não certifica que a cópia local seja dispensável.


