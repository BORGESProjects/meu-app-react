# Limpeza intensiva do projeto — 25/10/2026

## Resultado

Por autorização do usuário, foram removidas as pastas de trabalho `output/` e `tmp/`, incluindo arquivos-fonte únicos, PDFs/ZIPs de pesquisa, pacotes de instalação Windows/Android, extrações intermediárias, imagens de auditoria e resultados temporários.

- `output/`: 12.310 arquivos inventariados, **8.066.416.586 bytes**.
- `tmp/`: 52.368 arquivos inventariados, **2.822.128.697 bytes**.
- Total removido: **10.888.545.283 bytes** (aprox. **10,14 GiB**).
- As duas pastas não existem mais no projeto.
- A auditoria depois da limpeza encontrou 36 testes do acervo aprovados e nenhuma falha.

A remoção inclui o arquivo `output/acervo-bancas-1996-2026.zip` (3,01 GiB) e arquivos de instalação em `output/aplicativos/`. O catálogo desse ZIP indicava 27.017 PDFs, dos quais 5.796 ainda não tinham questões reconstruídas. Esses originais não estão mais disponíveis nesta pasta para futuras extrações.

## Conteúdo preservado

- Código do site em `src/`, `backend/` e `scripts/`, dependências locais e o build existente `dist/`.
- Questões, imagens e recursos presentes em `public/acervo/`.
- `public/acervo-extraido/`, com **38.332 arquivos e 2.956.440.888 bytes**. O conteúdo foi mantido por ser a cópia local de lotes/páginas e não haver confirmação de integridade objeto a objeto no Cloudflare R2.
- Os seis PDFs diretamente ligados na interface: prova e gabaritos do ENEM 2022 e prova e gabarito definitivo da ESA 2025. Também permanecem dois PDFs pequenos usados como fixtures de editais nos testes.

## Espaço local após a limpeza

As pastas principais somam aproximadamente **4,67 GiB**: `public/` 3,48 GiB, `dist/` 0,73 GiB, `node_modules/` 0,23 GiB, `native/` e `dist-native/` aproximadamente 0,18 GiB, e `backend/` aproximadamente 0,05 GiB. O número pode variar levemente com arquivos ocultos e metadados do sistema.

## Limites

A limpeza foi local; não enviei alterações ao site público, Supabase ou Cloudflare. O código e o build de produção não foram alterados. A confirmação dos 36 testes valida os conjuntos do acervo cobertos por eles; não comprova que os 27.017 PDFs do ZIP removido tenham sido incorporados ao banco.
