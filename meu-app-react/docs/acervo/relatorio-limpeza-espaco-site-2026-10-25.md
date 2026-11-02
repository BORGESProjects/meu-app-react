# Limpeza de espaço do site — 25/10/2026

## Resultado desta rodada

- Removidas **1.154 imagens** de `public/acervo/` que não tinham referência em código, dados de questões ou build atual. A lista e os hashes SHA-256 estão em `docs/acervo/manifesto-imagens-obsoletas-2026-10-25.csv`.
- As **1.154 cópias em `dist/acervo/`** também foram removidas porque cada uma tinha hash idêntico à imagem pública correspondente. `dist/` é saída gerada e poderá ser reconstruída pelo processo de build.
- Removidos **12 ZIPs comprovadamente duplicados**, somente depois de comparar SHA-256 com outra cópia preservada.
- Espaço liberado nesta rodada: **296.184.534 bytes** (aprox. **282,5 MiB**): 66.507.916 bytes de imagens e 229.676.618 bytes de ZIPs.
- Removido o script temporário usado para identificar as imagens; o manifesto de auditoria foi mantido.

## O que foi preservado

- As imagens em `public/acervo/federais-em-revisao/`: são fontes visuais ainda sem ligação confiável com questão e não foram descartadas.
- As imagens usadas por questões, PDFs públicos ainda vinculados à interface e PDFs únicos que servem como fontes ainda não comprovadamente extraídas por completo.
- A cópia local `public/acervo-extraido/`: o projeto ainda não tem comprovação objeto a objeto de que o Cloudflare R2 possui todas as páginas e lotes equivalentes; remover a cópia local poderia eliminar dados necessários ao fallback.
- Pacotes de instalação e arquivos de acervo não duplicados.

## PDFs restantes

A auditoria anterior registra **238 PDFs diretos, 222.881.231 bytes**, incluindo seis PDFs ligados diretamente pela interface e documentos cuja extração/associação ainda não foi comprovada. Portanto, nesta rodada nenhum PDF foi excluído por mera suposição. PDFs de extração validada, arquivos inválidos, arquivo em branco e duplicatas já constam como removidos no manifesto `docs/acervo/manifesto-auditoria-pdfs-2026-10-25.csv`.

O catálogo dentro do ZIP de 19 GB e os demais arquivos-fonte ainda contêm material sem mapeamento completo. Não é seguro declarar toda essa massa obsoleta ou afirmar que todas as provas foram incorporadas: a auditoria geral registra documentos ainda sem questões reconstruídas e edições militares incompletas. Esses dados únicos foram mantidos para evitar perda de questões.

## Verificação

- `node --test scripts/acervo.test.mjs`: **36 testes passaram, 0 falhas** após a remoção de imagens e cópias.
- A validação cobre estrutura, gabaritos, referências visuais e lotes de questões presentes nos conjuntos implementados. Ela não prova a extração integral de cada PDF nem a sincronização objeto a objeto com o R2.
- Esta foi uma limpeza local. Nenhuma alteração foi enviada ao site público, Supabase ou Cloudflare.
