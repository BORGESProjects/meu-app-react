from __future__ import annotations

import concurrent.futures
import csv
import json
import re
import sys
import threading
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
BASE = "https://apis.cebraspe.org.br/cebraspe"
CDN = "https://cdn.cebraspe.org.br/concursos"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"
REL = re.compile(r"(?i)(prova|quest(?:ao|ões|oes)|caderno|gabarito|padr[aã]o.{0,12}resposta|espelho.{0,10}resposta)")
YEAR = re.compile(r"(?:19|20)\d{2}")
LOCK = threading.Lock()


def get(url: str, timeout=40):
    req = Request(url, headers={"User-Agent": UA, "Accept": "application/json,application/pdf,*/*"})
    with urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers.get("Content-Type", ""), r.geturl()


def safe(s: str, limit=110):
    s = re.sub(r"[^\w.-]+", "_", s.strip(), flags=re.UNICODE).strip("_.-")
    return (s[:limit] or "evento")


def as_year(e):
    try:
        return int(e.get("eventoAno") or 0)
    except (TypeError, ValueError):
        match = YEAR.search(str(e.get("eventoNomeAbreviado", "")))
        return int(match.group()) if match else 0


def json_get(url):
    b, c, _ = get(url)
    return json.loads(b.decode("utf-8", "replace"))


def existing_urls():
    found = set()
    manifest = OUT / "manifesto-cebraspe-pf-prf.csv"
    if manifest.exists():
        with manifest.open("r", newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                found.add(row.get("url_origem", ""))
    return found


def main():
    print("Consultando o catálogo de concursos do Cebraspe...", flush=True)
    phases = json_get(BASE + "/eventos/tipo/concursos/")
    events = []
    seen = set()
    for phase in phases:
        for event in phase.get("eventos", []):
            slug = event.get("eventoURL")
            year = as_year(event)
            if slug and 1996 <= year <= 2026 and slug not in seen:
                events.append((year, event))
                seen.add(slug)
    events.sort(key=lambda x: (x[0], x[1].get("eventoURL", "")))
    print(f"Eventos no período 1996–2026: {len(events)}; fases: {len(phases)}", flush=True)

    archives = []
    api_failures = []
    def detail(pair):
        year, event = pair
        slug = event["eventoURL"]
        try:
            return year, event, json_get(BASE + "/eventos/" + quote(slug, safe="_-")), ""
        except Exception as exc:
            return year, event, None, str(exc)[:300]

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(detail, e) for e in events]
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            year, event, doc, err = future.result()
            if err:
                api_failures.append({"evento": event.get("eventoURL"), "ano": year, "erro": err})
            elif doc:
                slug = event["eventoURL"]
                for item in doc.get("arquivosGabarito") or []:
                    name = str(item.get("nomeArquivo", ""))
                    desc = str(item.get("descricaoArquivo", ""))
                    if not name.lower().endswith(".pdf") or not REL.search(desc):
                        continue
                    encoded_slug = quote(slug, safe="_-")
                    encoded_name = quote(name, safe="_.-()")
                    url = f"{CDN}/{encoded_slug}/arquivos/{encoded_name}"
                    archives.append({"banca": "Cebraspe", "ano": year,
                                     "concurso": event.get("eventoNomeAbreviado") or slug,
                                     "identificador": slug, "tipo": desc, "data_publicacao": item.get("dataArquivo", ""),
                                     "nome_arquivo": name, "url_origem": url,
                                     "pagina_origem": f"https://www.cebraspe.org.br/concursos/{slug}"})
            if i % 100 == 0:
                print(f"  detalhes consultados: {i}/{len(events)}; arquivos mapeados: {len(archives)}", flush=True)

    dedup = {a["url_origem"]: a for a in archives}
    archives = list(dedup.values())
    print(f"PDFs de prova/gabarito mapeados: {len(archives)}; páginas sem resposta: {len(api_failures)}", flush=True)

    prior = existing_urls()
    folder = OUT / "originais" / "CEBRASPE"
    folder.mkdir(parents=True, exist_ok=True)
    rows = []
    for item in archives:
        slug = safe(item["identificador"], 90)
        contest_dir = folder / slug
        dest = contest_dir / safe(item["nome_arquivo"], 125)
        item["caminho_local"] = str(dest.relative_to(OUT))

    def download(item):
        dest = OUT / item["caminho_local"]
        if item["url_origem"] in prior:
            return {**item, "bytes": 0, "status": "já incluído em PF/PRF", "erro": ""}
        if dest.exists():
            try:
                with dest.open("rb") as f:
                    if f.read(5) == b"%PDF-":
                        return {**item, "bytes": dest.stat().st_size, "status": "já baixado", "erro": ""}
            except OSError:
                pass
        try:
            data, ctype, _ = get(item["url_origem"], timeout=60)
            if len(data) < 500 or not data.startswith(b"%PDF-"):
                raise ValueError(f"resposta não é PDF (tipo={ctype}, bytes={len(data)})")
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            return {**item, "bytes": len(data), "status": "baixado", "erro": ""}
        except Exception as exc:
            return {**item, "bytes": 0, "status": "falha", "erro": str(exc)[:300]}

    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        futures = [pool.submit(download, item) for item in archives]
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            rows.append(future.result())
            if i % 250 == 0:
                print(f"  arquivos processados: {i}/{len(archives)}", flush=True)

    rows.sort(key=lambda r: (r["ano"], r["identificador"], r["nome_arquivo"]))
    manifest = OUT / "manifesto-cebraspe-completo.csv"
    fields = ["banca", "ano", "concurso", "identificador", "tipo", "data_publicacao", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"]
    with manifest.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    summary = {
        "eventos_1996_2026": len(events), "pdfs_identificados": len(archives),
        "baixados": sum(r["status"] == "baixado" for r in rows),
        "ja_incluidos": sum(r["status"].startswith("já") for r in rows),
        "falhas_download": sum(r["status"] == "falha" for r in rows),
        "falhas_api": api_failures,
    }
    (OUT / "resumo-cebraspe.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in summary.items() if k != "falhas_api"}, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
