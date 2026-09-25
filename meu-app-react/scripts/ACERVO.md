# Acervo ESA 2025

Prova da área Geral, modelo A, aplicada em 2025 para o CFGS 2026/27. Os PDFs foram fornecidos pelo responsável pelo site. O gabarito definitivo de 14/10/2025, página 1 (modelo A), foi conferido visualmente.

- 50 questões: 14 de Matemática, 14 de Português, 6 de História, 6 de Geografia e 10 de Inglês.
- Questões 1, 4 e 10 anuladas: aparecem para consulta, sem correção e fora dos simulados.
- Ano 2025 corresponde à aplicação da prova. Dificuldade e conteúdo são classificações editoriais; a interface identifica a dificuldade como estimada.
- Imagens preservam fórmulas, tirinhas e diagramação. Textos de apoio compartilhados acompanham as questões. O texto extraído é uma alternativa de leitura, com a imagem original como referência.
- Os PDFs completos ficam disponíveis para download, incluindo a proposta de redação.

O conjunto `src/data/esa2025.json` é publicado com o frontend e combinado com os registros existentes do Supabase por `src/acervo.js`. Esta entrega não grava registros nem altera o esquema do banco. O filtro de ano usa o campo `ano`, ou o ano presente no nome do concurso; registros sem ano continuam disponíveis em “Não informado”.

Para regenerar, execute `python scripts/extrair_esa2025.py CAMINHO_DA_PROVA.pdf` com pdfplumber, pypdfium2 e Pillow instalados. O script grava os dados e imagens no projeto. Os PDFs originais em `public/acervo/esa-2025/` devem ser preservados. Ao trocar a prova, revise manualmente recortes, textos compartilhados e gabarito antes de publicar.

Validação: `node --test scripts/acervo.test.mjs` e `npm run build`. O teste verifica numeração, alternativas, imagens, distribuição por disciplina, gabarito e preservação dos registros existentes.
