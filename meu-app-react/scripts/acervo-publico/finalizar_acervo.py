from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
ORIG = OUT / "originais"
TEXTS = OUT / "textos"
DOCUMENT_EXTENSIONS = {".pdf", ".zip", ".rar", ".doc", ".docx", ".odt", ".rtf", ".txt", ".png", ".jpg", ".jpeg", ".tif", ".tiff"}
SKIP_MANIFESTS = {"manifesto-geral.csv", "manifesto-extracao.csv"}
BOARD_LABELS = {
    "CEBRASPE": "Cebraspe", "EXERCITO": "Exército Brasileiro", "FGV": "FGV",
    "FUNATEC": "FUNATEC", "FUVEST": "Fuvest", "IBFC": "IBFC",
    "INEP": "INEP", "UFRJ": "UFRJ",
}


def read_csv(path: Path) -> list[dict[str, str]]:
    try:
        with path.open(encoding="utf-8-sig", newline="") as f:
            return list(csv.DictReader(f))
    except (OSError, UnicodeError, csv.Error):
        return []


def local_path(value: str | None) -> Path | None:
    if not value:
        return None
    path = Path(value)
    if not path.is_absolute():
        path = OUT / path
    return path


def row_url(row: dict[str, str]) -> str:
    return row.get("url_origem") or row.get("origem") or ""


def row_local(row: dict[str, str]) -> str:
    return row.get("caminho_local") or row.get("arquivo_local") or row.get("arquivo_pdf") or ""


def infer_board(path: Path) -> str:
    parts = path.relative_to(ORIG).parts
    return BOARD_LABELS.get(parts[0].upper(), parts[0] if parts else "Desconhecida")


def infer_year(row: dict[str, str], contest: str) -> str:
    for key in ("ano", "data_publicacao"):
        value = row.get(key, "")
        match = re.search(r"(?:19|20)\d{2}", value)
        if match:
            return match.group(0)
    match = re.search(r"(?:19|20)\d{2}", contest)
    return match.group(0) if match else ""


def reconcile_cebraspe() -> None:
    full_path = OUT / "manifesto-cebraspe-completo.csv"
    pfprf_path = OUT / "manifesto-cebraspe-pf-prf.csv"
    if not full_path.exists() or not pfprf_path.exists():
        return
    pfprf = {row_url(row): row for row in read_csv(pfprf_path) if row_url(row)}
    rows = read_csv(full_path)
    fields = list(rows[0]) if rows else []
    changed = False
    for row in rows:
        url = row_url(row)
        if url and url in pfprf and not row.get("caminho_local"):
            reference = pfprf[url]
            row["caminho_local"] = reference.get("caminho_local", "")
            row["bytes"] = reference.get("bytes", "0")
            row["status"] = "já presente no acervo PF/PRF"
            row["erro"] = ""
            changed = True
    if changed:
        with full_path.open("w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)


def make_manifest() -> tuple[list[dict], list[dict]]:
    manifests = [p for p in OUT.glob("manifesto-*.csv") if p.name not in SKIP_MANIFESTS]
    metadata_by_path: dict[str, dict[str, str]] = {}
    metadata_by_zip_name: dict[str, dict[str, str]] = {}
    source_rows: list[tuple[Path, dict[str, str]]] = []
    for manifest in manifests:
        for row in read_csv(manifest):
            source_rows.append((manifest, row))
            local = local_path(row_local(row))
            if local is not None:
                try:
                    key = str(local.resolve()).casefold()
                    if local.is_file():
                        metadata_by_path[key] = row
                except OSError:
                    pass
            if manifest.name in {"manifesto-ibfc.csv", "manifesto-ibfc-pacotes-zip.csv"}:
                url = row_url(row)
                name = Path(url.split("?", 1)[0].rstrip("/")).name.casefold()
                if name:
                    metadata_by_zip_name[Path(name).stem.casefold()] = row

    files: list[dict] = []
    url_to_local: dict[str, list[str]] = defaultdict(list)
    for path in ORIG.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(OUT)
        try:
            meta = metadata_by_path.get(str(path.resolve()).casefold(), {})
            if not meta and "_extraidos_zip" in path.parts:
                for parent in path.parents:
                    if parent.name.casefold() in metadata_by_zip_name:
                        meta = metadata_by_zip_name[parent.name.casefold()]
                        break
            relative_text = Path("textos") / path.relative_to(ORIG).with_suffix(".txt") if path.suffix.lower() == ".pdf" else None
            text_file = OUT / relative_text if relative_text else None
            text_rel = relative_text.as_posix() if text_file is not None and text_file.is_file() else ""
            contest = meta.get("concurso") or meta.get("prova") or (path.relative_to(ORIG).parts[1] if len(path.relative_to(ORIG).parts) > 1 else "")
            year = infer_year(meta, contest)
            url = row_url(meta)
            if url:
                url_to_local[url].append(relative.as_posix())
            status = meta.get("status", "")
            if not status:
                status = "extraído de pacote ZIP; origem direta não registrada" if "_extraidos_zip" in path.parts else "arquivo local preservado"
            files.append({
                "banca": meta.get("banca") or infer_board(path), "concurso": contest,
                "ano": year, "tipo": meta.get("tipo") or meta.get("documento") or "",
                "nome_arquivo": meta.get("nome_arquivo") or path.name,
                "url_origem": url, "pagina_origem": meta.get("pagina_origem") or meta.get("pagina_edicao") or "",
                "caminho_local": relative.as_posix(), "caminho_texto": text_rel,
                "extensao": path.suffix.lower(), "bytes": path.stat().st_size,
                "status": status, "erro": meta.get("erro", ""),
            })
        except OSError:
            continue

    unresolved: list[dict] = []
    seen_unresolved: set[tuple[str, str]] = set()
    resolved_urls = set(url_to_local)
    for manifest, row in source_rows:
        local_value = row_local(row)
        path = local_path(local_value)
        exists = False
        if path is not None:
            try:
                exists = path.is_file()
            except OSError:
                exists = False
        if exists:
            continue
        url = row_url(row)
        if url and url in resolved_urls:
            continue
        status = row.get("status", "")
        key = (row.get("banca", manifest.stem), url or f"{manifest.name}:{row.get('concurso','')}:{row.get('tipo','')}:{row.get('nome_arquivo','')}")
        if key in seen_unresolved:
            continue
        seen_unresolved.add(key)
        if not status and not url and not row.get("pagina_origem") and not row.get("pagina_edicao"):
            continue
        contest = row.get("concurso") or row.get("prova") or ""
        error = row.get("erro", "")
        if local_value and not exists and not error:
            error = "O manifesto aponta para um arquivo que não existe no pacote final."
            status = "arquivo não encontrado"
        unresolved.append({
            "banca": row.get("banca", ""), "concurso": contest,
            "ano": infer_year(row, contest), "tipo": row.get("tipo") or row.get("documento") or "",
            "nome_arquivo": row.get("nome_arquivo", ""), "url_origem": url,
            "pagina_origem": row.get("pagina_origem") or row.get("pagina_edicao") or "",
            "caminho_local": "", "caminho_texto": "", "extensao": "", "bytes": 0,
            "status": status or "sem arquivo local", "erro": error,
        })
    files.sort(key=lambda r: (r["banca"].casefold(), r["concurso"].casefold(), r["caminho_local"].casefold()))
    unresolved.sort(key=lambda r: (r["banca"].casefold(), r["concurso"].casefold(), r["url_origem"].casefold()))
    fields = ["banca", "concurso", "ano", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "caminho_texto", "extensao", "bytes", "status", "erro"]
    with (OUT / "manifesto-geral.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(files)
        writer.writerows(unresolved)
    return files, unresolved


def main() -> None:
    reconcile_cebraspe()
    files, unresolved = make_manifest()
    pdfs = [r for r in files if r["extensao"] == ".pdf"]
    by_board: dict[str, dict[str, int]] = defaultdict(lambda: {"arquivos": 0, "pdfs": 0, "bytes": 0})
    for row in files:
        stats = by_board[row["banca"]]
        stats["arquivos"] += 1
        stats["bytes"] += int(row["bytes"])
        if row["extensao"] == ".pdf":
            stats["pdfs"] += 1
    text_files = list(TEXTS.rglob("*.txt"))
    extraction = {}
    try:
        extraction = json.loads((OUT / "resumo-extracao.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        pass
    ibfc = read_csv(OUT / "manifesto-ibfc.csv")
    ibfc_zip = read_csv(OUT / "manifesto-ibfc-pacotes-zip.csv")
    cebraspe = read_csv(OUT / "manifesto-cebraspe-completo.csv")
    fgv = read_csv(OUT / "manifesto-fgv.csv")
    inep_counts = {p.stem.removeprefix("manifesto-inep-"): len(read_csv(p)) for p in OUT.glob("manifesto-inep-*.csv")}
    summary = {
        "data_coleta": date.today().isoformat(), "periodo_consultado": "1996–2026",
        "pdfs_locais": len(pdfs), "arquivos_locais": len(files),
        "bytes_originais": sum(int(r["bytes"]) for r in files), "arquivos_texto": len(text_files),
        "pendencias_registradas": len(unresolved), "por_banca": dict(sorted(by_board.items())),
        "inep_manifestos_por_programa": inep_counts,
        "cebraspe": {"registros": len(cebraspe), "eventos_com_anexos_identificados": len({r.get("identificador", "") for r in cebraspe if r.get("identificador")}),
                     "eventos_listados_na_api": 499, "paginas_detalhe_sem_resposta": 34,
                     "baixados_novos": sum(r.get("status") == "baixado" for r in cebraspe),
                     "falhas": sum(r.get("status") == "falha" for r in cebraspe)},
        "fgv": {"registros": len(fgv), "baixados": sum(r.get("status") == "baixado" for r in fgv),
                "falhas": sum(r.get("status") == "falha" for r in fgv)},
        "ibfc": {"registros": len(ibfc), "pdfs_locais": by_board.get("IBFC", {}).get("pdfs", 0),
                "zips_identificados": len(ibfc_zip), "zips_extraidos": sum(r.get("status") == "baixado e extraído" for r in ibfc_zip),
                "zips_falhos": sum(r.get("status") == "falha" for r in ibfc_zip)},
        "extracao_texto": extraction,
        "observacao": "A contagem de arquivos não deduplica cópias com conteúdo idêntico. A extração usa a camada textual existente e não aplica OCR.",
    }
    (OUT / "resumo-acervo.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    funatec_count = by_board.get("FUNATEC", {}).get("pdfs", 0)
    rows = [
        {"banca": "FGV", "concursos_listados": len({r.get("concurso", "") for r in fgv}), "pdfs_locais": by_board.get("FGV", {}).get("pdfs", 0), "itens_falhos": sum(r.get("status") == "falha" for r in fgv), "observacao": "Portal de conhecimento; links de 352 registros de concurso analisados."},
        {"banca": "Fuvest", "concursos_listados": 31, "pdfs_locais": by_board.get("FUVEST", {}).get("pdfs", 0), "itens_falhos": 1, "observacao": "Acervo histórico e provas anuais 1996–2026."},
        {"banca": "Cebraspe", "concursos_listados": 499, "pdfs_locais": by_board.get("Cebraspe", {}).get("pdfs", 0), "itens_falhos": sum(r.get("status") == "falha" for r in cebraspe), "observacao": "Anexos identificados em 424 eventos; 34 páginas de detalhe sem resposta válida."},
        {"banca": "VUNESP", "concursos_listados": 0, "pdfs_locais": by_board.get("VUNESP", {}).get("pdfs", 0), "itens_falhos": 1, "observacao": "Listagem de encerrados retornou HTTP 403."},
        {"banca": "INEP", "concursos_listados": 0, "pdfs_locais": by_board.get("INEP", {}).get("pdfs", 0), "itens_falhos": 0, "observacao": "ENEM, ENCCEJA, ENADE, REVALIDA, SAEB, ENAMED e PND; alguns programas só liberam parte dos cadernos."},
        {"banca": "Exército Brasileiro", "concursos_listados": 1, "pdfs_locais": by_board.get("Exército Brasileiro", {}).get("pdfs", 0), "itens_falhos": 0, "observacao": "Somente IME CFG; não inclui ESA, EsPCEx ou outros processos militares."},
        {"banca": "IBFC", "concursos_listados": 350, "pdfs_locais": by_board.get("IBFC", {}).get("pdfs", 0), "itens_falhos": sum(r.get("status") == "falha" for r in ibfc), "observacao": "Anexos PDF e ZIP; os pacotes ZIP foram extraídos quando baixáveis."},
        {"banca": "IDECAN", "concursos_listados": 0, "pdfs_locais": by_board.get("IDECAN", {}).get("pdfs", 0), "itens_falhos": 2, "observacao": "Portal atual retornou HTTP 403 e o portal legado está desativado."},
        {"banca": "FUNDEP", "concursos_listados": 0, "pdfs_locais": by_board.get("FUNDEP", {}).get("pdfs", 0), "itens_falhos": 0, "observacao": "FAQ oficial diz que a banca não mantém arquivo após homologação."},
        {"banca": "UFRJ", "concursos_listados": 65, "pdfs_locais": by_board.get("UFRJ", {}).get("pdfs", 0), "itens_falhos": 26, "observacao": "Listagem de concursos concluídos; dois registros baixados não ficaram no diretório final."},
        {"banca": "CESGRANRIO", "concursos_listados": 35, "pdfs_locais": by_board.get("CESGRANRIO", {}).get("pdfs", 0), "itens_falhos": 0, "observacao": "API oficial listou concursos, mas não expôs PDFs de prova/gabarito nas páginas consultadas."},
        {"banca": "FUNATEC", "concursos_listados": 22, "pdfs_locais": funatec_count, "itens_falhos": 0, "observacao": "O índice expôs 229 links candidatos; coletas posteriores expiraram antes de criar um manifesto completo."},
    ]
    (OUT / "cobertura-portais.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    pdf_gb = sum(int(r["bytes"]) for r in pdfs) / (1024 ** 3)
    text_summary = extraction or {"pdfs": len(pdfs), "arquivos_texto": len(text_files)}
    readme = f"""# Acervo de provas públicas — 1996–2026

Pacote local reunido em 22/10/2026 a partir de páginas e arquivos públicos consultados. Contém **{len(pdfs):,} arquivos PDF** ({pdf_gb:.2f} GiB), organizados por banca e concurso, e **{len(text_files):,} arquivos TXT** com o texto pesquisável extraído dos PDFs.

## Como usar

- `originais/` contém os PDFs baixados, arquivos ZIP originais e documentos extraídos dos pacotes.
- `textos/` contém a extração textual dos PDFs, com marcador `===== PÁGINA N =====` para cada página.
- `manifesto-geral.csv` lista arquivos locais e pendências de download, com endereço de origem quando foi preservado.
- `manifesto-extracao.csv` e `resumo-extracao.json` mostram o resultado da extração de texto.
- `cobertura-portais.json` e `resumo-acervo.json` resumem a cobertura e as limitações por fonte.

## Cobertura materializada

| Fonte | PDFs locais | Escopo e observações |
|---|---:|---|
| Cebraspe | {by_board.get('Cebraspe', {}).get('pdfs', 0):,} | 499 eventos listados; anexos identificados em 424 eventos. 42 anexos falharam e 34 páginas de detalhe não responderam. |
| IBFC | {by_board.get('IBFC', {}).get('pdfs', 0):,} | 350 concursos; 6.215 anexos, 989 links sem PDF aproveitável, 265 ZIPs extraídos e 22 ZIPs com falha. Há arquivos repetidos entre pacotes. |
| FGV | {by_board.get('FGV', {}).get('pdfs', 0):,} | 3.463 arquivos candidatos em 352 registros de concurso; 352 downloads falharam. |
| INEP | {by_board.get('INEP', {}).get('pdfs', 0):,} | ENEM, ENCCEJA, ENADE, REVALIDA, SAEB, ENAMED e PND. O órgão publica apenas parte dos cadernos de alguns programas. |
| Fuvest | {by_board.get('FUVEST', {}).get('pdfs', 0):,} | Vestibulares USP de 1996 a 2026. |
| Exército — IME CFG | {by_board.get('Exército Brasileiro', {}).get('pdfs', 0):,} | Provas do IME CFG de 1996/1997 a 2025/2026. Não inclui ESA, EsPCEx ou outros concursos militares. |
| UFRJ | {by_board.get('UFRJ', {}).get('pdfs', 0):,} | Concursos concluídos; 26 arquivos de candidatos não foram obtidos e dois registros não apareceram no diretório final. |
| FUNATEC | {funatec_count:,} | O portal listou 229 links candidatos em 22 concursos; a conexão expirou durante as coletas seguintes. |
| VUNESP | {by_board.get('VUNESP', {}).get('pdfs', 0):,} | A listagem de concursos encerrados retornou HTTP 403. |
| IDECAN | {by_board.get('IDECAN', {}).get('pdfs', 0):,} | O portal atual retornou HTTP 403; o endereço legado informou que está desativado. |
| FUNDEP | {by_board.get('FUNDEP', {}).get('pdfs', 0):,} | A FAQ oficial diz que a banca não mantém arquivo histórico após a homologação. |
| CESGRANRIO | {by_board.get('CESGRANRIO', {}).get('pdfs', 0):,} | A API oficial listou 35 concursos, mas as páginas consultadas não expuseram links diretos de provas ou gabaritos. |

## Limite de cobertura

Este é o conjunto mais amplo que foi possível materializar nesta coleta. **Não é possível afirmar que contém todas as provas de todos os concursos das doze bancas**, porque alguns sites não mantêm o histórico, outros negaram acesso à listagem e vários anexos expiraram ou não foram publicados como PDF. O limite de cada fonte está no manifesto e no arquivo `cobertura-portais.json`.

O Saeb não libera imediatamente os cadernos após a aplicação e direciona a consulta a exemplos de itens de edições antigas. A FUNDEP informa oficialmente que provas, gabaritos e editais ficam no site até a homologação e que não mantém arquivo das provas anteriores. O INEP também distingue entre cadernos de algumas edições e gabaritos de todas as aplicações em determinados exames.

## Extração de texto

{text_summary.get('com_texto', 0):,} PDFs têm texto extraído; {text_summary.get('sem_texto_pesquisavel', 0):,} não apresentaram camada textual; {text_summary.get('falhas', 0):,} tiveram falha de leitura. A extração usa o texto incorporado ao PDF e **não aplica OCR**; PDFs escaneados como imagem podem não ser pesquisáveis. Consulte `manifesto-extracao.csv` para ver o resultado por arquivo.

{text_summary.get('parciais', 0):,} PDF foi extraído parcialmente.

## Manifestos relevantes

- `manifesto-cebraspe-completo.csv` — eventos do Cebraspe e anexos identificados.
- `manifesto-ibfc.csv`, `manifesto-ibfc-pacotes-zip.csv` e `manifesto-ibfc-documentos-extraidos.csv` — anexos diretos e pacotes do IBFC.
- `manifesto-fgv.csv`, `manifesto-fuvest.csv`, `manifesto-ufrj.csv` e `manifesto-funatec.csv` — coletas por banca.
- `manifesto-inep-*.csv` — ENEM, ENCCEJA, ENADE, REVALIDA, SAEB, ENAMED e PND.
- `manifesto-vunesp.csv`, `manifesto-idecan.csv`, `manifesto-fundep.csv` e `manifesto-cesgranrio.csv` — tentativas e limitações de acesso ou retenção.
- `manifesto-exercito-ime.csv` — arquivos do IME CFG.
"""
    (OUT / "LEIA-ME.md").write_text(readme, encoding="utf-8")
    print(json.dumps({"pdfs": len(pdfs), "arquivos_locais": len(files), "pendencias": len(unresolved), "txt": len(text_files), "por_banca": by_board}, ensure_ascii=False))


if __name__ == "__main__":
    main()
