# Limpeza de arquivos locais — 25/10/2026

## Resultado

- Removidos **488 PDFs duplicados** em diretórios temporários de saída, liberando **350,9 MiB**.
- Cada arquivo removido teve seu SHA-256 comparado com uma cópia preservada. Os 339 PDFs removidos da pasta temporária militar também foram comparados diretamente com o ZIP militar revisado.
- A verificação final confirmou **zero hashes sem cópia restante**.
- Permanecem 22 PDFs únicos na pasta de trabalho militar, que não estão no ZIP revisado; foram mantidos para não descartar a única cópia local.

## Escopo

A limpeza retirou apenas cópias redundantes de:

- `output/.military-archive-work-20261024-121018/`
- `output/militar-source-sample/`

## Itens preservados

- Os PDFs publicados que o site abre diretamente, como os arquivos da ESA 2025.
- `public/acervo/`, `public/acervo-extraido/` e `native/acervo/`. São dados ativos do aplicativo; não foi comprovado neste trabalho que todo o conteúdo local esteja armazenado integralmente na nuvem.
- Os ZIPs finais de provas e os instaladores Windows/Android. Alguns ZIPs anteriores ainda contêm arquivos que não aparecem no pacote revisado, então não foram considerados seguramente descartáveis.
- PDFs únicos em `tmp/` que servem como fonte de extração ou são referenciados por scripts de revisão.

Nenhum banco de questões foi alterado, nenhum arquivo foi removido de `public/` e nenhuma publicação foi feita.
