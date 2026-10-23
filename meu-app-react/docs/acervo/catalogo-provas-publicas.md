# Catálogo de provas públicas no site

O menu **Acervo de provas** consulta o pacote gerado em `public/acervo-provas/`. Ele reúne os metadados dos PDFs coletados na extração de 22/10/2026, com busca por instituição, ano, concurso, tipo de documento e nome do arquivo. Os cartões abrem o PDF ou a página de origem registrada no manifesto.

## Cobertura registrada

- Período consultado: 1996–2026.
- 27.017 PDFs em oito instituições com arquivos: Cebraspe, Exército/IME, FGV, FUNATEC, Fuvest, IBFC, INEP e UFRJ.
- O INEP inclui ENEM, Encceja, Enade, Revalida, Saeb, Enamed e PND.
- Quatro fontes aparecem no painel de cobertura sem arquivo local nesta coleta: CESGRANRIO, FUNDEP, IDECAN e VUNESP.
- A extração de texto identificou conteúdo em 26.621 PDFs, ficou parcial em um, não encontrou camada textual em 283 e falhou em 112. Não foi aplicado OCR.

Os totais representam arquivos e podem contar duplicatas presentes em mais de um pacote. As observações por fonte registram as lacunas de coleta; por exemplo, bloqueios HTTP, documentos indisponíveis e arquivos históricos que a própria instituição não mantém.

## Regenerar os dados do site

Após atualizar os manifestos em `output/acervo-bancas-1996-2026/`, execute:

```powershell
python scripts/acervo-publico/publicar_catalogo_site.py
```

O gerador verifica o total de PDFs contra `resumo-acervo.json` e grava arquivos JSON separados por instituição, mais `resumo.json`. Os PDFs e textos integrais não são copiados para `public/`: o pacote local ocupa cerca de 17,2 GiB, e os cartões apontam para as fontes registradas. A versão nativa copia apenas esse catálogo leve.

O catálogo é um índice documental, não uma coleção de questões prontas para correção. A extração não separa com segurança enunciados, alternativas e gabaritos. Questões só devem entrar no banco corrigível depois de estruturadas e conferidas. Acesso público a uma página ou PDF não concede licença geral para republicar seu conteúdo.
