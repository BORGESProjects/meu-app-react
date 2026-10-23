from __future__ import annotations

import concurrent.futures
import csv
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
BASE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"
RELEVANT = re.compile(r"(?i)(prova|quest(?:ao|ões|oes)|caderno|gabarito|item|avalia[cç][aã]o|padr[aã]o.{0,12}resposta|cart[aã]o.{0,8}resposta)")


class Anchors(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.items = []
        self.href = None
        self.text = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.href = attrs.get("href")
            self.text = []
    def handle_data(self, data):
        if self.href is not None:
            self.text.append(data)
    def handle_endtag(self, tag):
        if tag == "a" and self.href is not None:
            self.items.append((self.href, " ".join(" ".join(self.text).split())))
            self.href = None


def fetch(url, timeout=35):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/pdf,*/*"})
    with urlopen(req, timeout=timeout) as r:
        body = r.read()
        ctype = r.headers.get("Content-Type", "")
        charset = r.headers.get_content_charset() or "utf-8"
        final = r.geturl()
    return body, ctype, charset, final


def slug(s, maximum=100):
    s = re.sub(r"[^\w.-]+", "_", s, flags=re.UNICODE).strip("_.-")
    return s[:maximum] or "documento"


SOURCES = [
    ("ENCCEJA", f"{BASE}/encceja/provas-e-gabaritos"),
    ("ENADE", f"{BASE}/enade/provas-e-gabaritos"),
    ("REVALIDA", f"{BASE}/revalida/provas-e-gabaritos"),
    ("SAEB", f"{BASE}/saeb/documentos-edicoes-antigas"),
    ("ENAMED", f"{BASE}/enamed/provas-e-gabaritos"),
    ("PND", f"{BASE}/prova-nacional-docente/provas-e-gabaritos"),
]


def main():
    all_rows = []
    for exam, page in SOURCES:
        print(f"\n[{exam}] {page}", flush=True)
        try:
            body, ctype, charset, final = fetch(page)
            parser = Anchors()
            parser.feed(body.decode(charset, "replace"))
        except Exception as e:
            print(f"  página indisponível: {e}", flush=True)
            all_rows.append({"banca": "INEP", "prova": exam, "nome_arquivo": "", "url_origem": page,
                             "pagina_origem": page, "caminho_local": "", "bytes": 0, "status": "índice indisponível", "erro": str(e)[:300]})
            continue
        print(f"  links na página: {len(parser.items)}", flush=True)
        candidates = {}
        queue = [(final, 0)]
        visited = set()
        scope = urlparse(final).path.rstrip("/") + "/"
        while queue and len(visited) < 120:
            current, depth = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            try:
                if current == final:
                    page_body = body.decode(charset, "replace")
                    page_links = parser.items
                else:
                    child_body, _, child_charset, current_final = fetch(current)
                    page_body = child_body.decode(child_charset, "replace")
                    child_parser = Anchors()
                    child_parser.feed(page_body)
                    page_links = child_parser.items
                    current = current_final
            except Exception:
                continue
            for href, label in page_links:
                url = urljoin(current, html.unescape(href.strip()))
                parsed = urlparse(url)
                path = parsed.path.lower()
                host = parsed.hostname or ""
                if not RELEVANT.search(label + " " + path):
                    continue
                if path.endswith(".pdf") or "download.inep.gov.br" in host or "/resolveuid/" in path:
                    candidates[url] = {"label": label, "page": current}
            for data_url in re.findall(r"(?i)data-url=[\"']([^\"']+)[\"']", page_body):
                next_url = urljoin(current, html.unescape(data_url))
                next_path = urlparse(next_url).path
                if (urlparse(next_url).hostname == urlparse(final).hostname and next_path.startswith(scope)
                        and next_url not in visited and depth < 3):
                    queue.append((next_url, depth + 1))
        print(f"  PDFs oficiais identificados: {len(candidates)}", flush=True)
        folder = OUT / "originais" / "INEP" / exam
        def download(entry):
            url, meta = entry
            label = meta["label"]
            try:
                body, ctype, _, final_url = fetch(url, timeout=90)
                if len(body) < 500 or not body.startswith(b"%PDF-"):
                    raise ValueError(f"resposta não é PDF ({ctype}; {len(body)} bytes)")
                name = unquote(urlparse(final_url).path.rstrip("/").split("/")[-1])
                if not name.lower().endswith(".pdf"):
                    name = slug(label) + ".pdf"
                dest = folder / slug(label) / slug(name, 120)
                if len(str(dest.resolve())) > 240:
                    dest = folder / slug(name, 120)
                if dest.exists():
                    with dest.open("rb") as f:
                        if f.read(5) == b"%PDF-":
                            return {"banca": "INEP", "prova": exam, "tipo": label, "nome_arquivo": dest.name,
                                    "url_origem": url, "pagina_origem": meta["page"], "caminho_local": str(dest.relative_to(OUT)),
                                    "bytes": dest.stat().st_size, "status": "já baixado", "erro": ""}
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(body)
                return {"banca": "INEP", "prova": exam, "tipo": label, "nome_arquivo": dest.name,
                        "url_origem": url, "pagina_origem": meta["page"], "caminho_local": str(dest.relative_to(OUT)),
                        "bytes": len(body), "status": "baixado", "erro": ""}
            except Exception as e:
                return {"banca": "INEP", "prova": exam, "tipo": label, "nome_arquivo": "", "url_origem": url,
                        "pagina_origem": meta["page"], "caminho_local": "", "bytes": 0, "status": "falha", "erro": str(e)[:300]}
        rows = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            futures = [pool.submit(download, item) for item in candidates.items()]
            for f in concurrent.futures.as_completed(futures):
                rows.append(f.result())
        print(f"  baixados: {sum(r['status']=='baixado' for r in rows)}; falhas: {sum(r['status']=='falha' for r in rows)}", flush=True)
        manifest = OUT / f"manifesto-inep-{exam.lower()}.csv"
        with manifest.open("w", encoding="utf-8-sig", newline="") as f:
            fields = ["banca", "prova", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"]
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            w.writerows(rows)
        all_rows.extend(rows)
    print(f"\nTotal de PDFs adicionais baixados: {sum(r['status']=='baixado' for r in all_rows)}", flush=True)


if __name__ == "__main__":
    main()
