from __future__ import annotations

import concurrent.futures
import argparse
import csv
import html
import json
import os
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, unquote, urljoin, urlparse
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
ORIG = OUT / "originais"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"
DOC_RE = re.compile(r"(?i)(prova|quest(?:ao|ões|oes)|caderno|gabarito|espelho|padr[aã]o.{0,12}resposta|avalia[cç][aã]o|cart[aã]o.{0,8}resposta|enunciado)")


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self._href = attrs.get("href") or attrs.get("data-href")
            self._text = []
        elif tag in ("iframe", "embed", "source"):
            src = attrs.get("src") or attrs.get("data-src")
            if src:
                self.links.append((src, attrs.get("title", "")))

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self._href is not None:
            self.links.append((self._href, " ".join(" ".join(self._text).split())))
            self._href = None


def get(url: str, timeout: int = 35) -> tuple[bytes, str, str]:
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/pdf,*/*"})
    with urlopen(req, timeout=timeout) as res:
        data = res.read()
        ctype = res.headers.get("Content-Type", "")
        charset = res.headers.get_content_charset() or "utf-8"
        final = res.geturl()
    return data, ctype, charset + "|" + final


def decode_page(data: bytes, charset: str) -> str:
    return data.decode(charset.split("|")[0], "replace")


def parse_page(url: str):
    data, ctype, meta = get(url)
    charset, final = meta.split("|", 1)
    body = decode_page(data, charset)
    parser = PageParser()
    parser.feed(body)
    return final, body, parser.links, ctype


def canonical(url: str) -> str:
    p = urlparse(url)
    return p._replace(fragment="").geturl()


def slug(s: str) -> str:
    s = unquote(s).strip()
    s = re.sub(r"[^\w.-]+", "_", s, flags=re.UNICODE).strip("_.-")
    return (s[:105] or "arquivo")


def page_links(url: str):
    try:
        final, body, links, ctype = parse_page(url)
        return final, body, links, ctype, ""
    except Exception as e:
        return url, "", [], "", str(e)


def anchored_candidates(links, base: str, rule) -> list[tuple[str, str]]:
    out = []
    for href, label in links:
        absolute = canonical(urljoin(base, html.unescape(href.strip())))
        if rule(absolute, label):
            out.append((absolute, label.strip()))
    return out


def same_host(url: str, host: str) -> bool:
    return urlparse(url).hostname == host


def collect_board(board: str, seeds: list[str], page_rule, detail_rule, max_list_pages=35):
    print(f"\n[{board}] varrendo índices", flush=True)
    pages: list[str] = []
    seen_pages: set[str] = set()
    list_urls = list(seeds)
    list_data = []
    while list_urls and len(seen_pages) < max_list_pages:
        url = list_urls.pop(0)
        url = canonical(url)
        if url in seen_pages:
            continue
        seen_pages.add(url)
        final, body, links, ctype, error = page_links(url)
        if error:
            print(f"  índice indisponível: {url} ({error[:150]})", flush=True)
            continue
        list_data.append((final, body, links))
        pages.append(final)
        for href, label in links:
            candidate = canonical(urljoin(final, html.unescape(href.strip())))
            if page_rule(candidate, label, final) and candidate not in seen_pages and candidate not in list_urls:
                list_urls.append(candidate)
    details: dict[str, str] = {}
    for base, body, links in list_data:
        for url, label in anchored_candidates(links, base, lambda u, t: detail_rule(u, t, base)):
            details.setdefault(url, label or url)
    print(f"  páginas de índice: {len(pages)}; concursos localizados: {len(details)}", flush=True)

    targets: dict[str, dict] = {}
    # Also inspect index pages: some portals list direct archives without a detail page.
    for base, body, links in list_data:
        for href, label in links:
            absolute = canonical(urljoin(base, html.unescape(href.strip())))
            if DOC_RE.search(label) and (".pdf" in urlparse(absolute).path.lower() or "arquivo" in absolute.lower()):
                targets.setdefault(absolute, {"concurso": slug(label or urlparse(base).path), "label": label, "pagina": base})

    def fetch_detail(item):
        url, name = item
        return page_links(url)

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(fetch_detail, item): item for item in details.items()}
        for future in concurrent.futures.as_completed(futures):
            url, name = futures[future]
            final, body, links, ctype, error = future.result()
            if error:
                continue
            contest = slug(name if name and len(name) < 120 else urlparse(final).path.split("/")[-1])
            for href, label in links:
                absolute = canonical(urljoin(final, html.unescape(href.strip())))
                path = urlparse(absolute).path.lower()
                looks_file = bool(re.search(r"\.(pdf|docx?|zip)(?:$|/)", path)) or any(t in path for t in ("/arquivos/", "/files/", "/download/", "@@download"))
                if looks_file and DOC_RE.search((label or "") + " " + path):
                    targets.setdefault(absolute, {"concurso": contest, "label": label, "pagina": final})
            # Catch embedded direct PDF paths accompanied by relevant text in page source.
            if DOC_RE.search(body):
                for match in re.finditer(r"(?i)(?:href|src|data-src)\s*=\s*[\"']([^\"']+)[\"']", body):
                    absolute = canonical(urljoin(final, html.unescape(match.group(1))))
                    path = urlparse(absolute).path.lower()
                    if re.search(r"\.(pdf|docx?|zip)(?:$|/)", path) and ("gabar" in path or "prova" in path or "quest" in path or "caderno" in path):
                        targets.setdefault(absolute, {"concurso": contest, "label": "arquivo associado à página", "pagina": final})

    print(f"  arquivos de prova/gabarito mapeados: {len(targets)}", flush=True)
    return targets, len(details), len(pages)


def save_board(board: str, targets: dict[str, dict]):
    folder = ORIG / board.upper()
    folder.mkdir(parents=True, exist_ok=True)
    rows = []

    def download(item):
        url, meta = item
        try:
            contest = meta["concurso"]
            p = urlparse(url)
            filename = unquote(p.path.rstrip("/").split("/")[-1])
            if not filename.lower().endswith(".pdf"):
                filename = slug(meta["label"]) + ".pdf"
            filename = slug(filename)
            dest_dir = folder / contest
            dest = dest_dir / filename
            if dest.exists():
                try:
                    with dest.open("rb") as existing:
                        if existing.read(5) == b"%PDF-":
                            return {"banca": board, "concurso": contest, "tipo": meta["label"], "nome_arquivo": dest.name,
                                    "url_origem": url, "pagina_origem": meta["pagina"], "caminho_local": str(dest.relative_to(OUT)),
                                    "bytes": dest.stat().st_size, "status": "já baixado", "erro": ""}
                except OSError:
                    pass
            data, ctype, info = get(url, timeout=12)
            if len(data) < 500 or not (data.startswith(b"%PDF-") or "pdf" in ctype.lower() or urlparse(url).path.lower().endswith(".pdf")):
                raise ValueError(f"resposta não parece PDF ({ctype}, {len(data)} bytes)")
            if not data.startswith(b"%PDF-"):
                raise ValueError("servidor não entregou arquivo PDF")
            dest_dir.mkdir(parents=True, exist_ok=True)
            if dest.exists() and dest.stat().st_size != len(data):
                dest = dest_dir / f"{slug(meta['label'])}_{filename}"
            dest.write_bytes(data)
            return {"banca": board, "concurso": contest, "tipo": meta["label"], "nome_arquivo": dest.name,
                    "url_origem": url, "pagina_origem": meta["pagina"], "caminho_local": str(dest.relative_to(OUT)),
                    "bytes": len(data), "status": "baixado", "erro": ""}
        except Exception as e:
            return {"banca": board, "concurso": meta["concurso"], "tipo": meta["label"], "nome_arquivo": "",
                    "url_origem": url, "pagina_origem": meta["pagina"], "caminho_local": "", "bytes": 0,
                    "status": "falha", "erro": str(e)[:300]}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(download, item) for item in targets.items()]
        for f in concurrent.futures.as_completed(futures):
            rows.append(f.result())
    rows.sort(key=lambda x: (x["concurso"], x["nome_arquivo"], x["url_origem"]))
    manifest = OUT / f"manifesto-{board.lower()}.csv"
    with manifest.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]) if rows else ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"  baixados: {sum(r['status']=='baixado' for r in rows)}; falhas: {sum(r['status']=='falha' for r in rows)}", flush=True)
    return rows


def url_page(base, n, kind):
    if kind == "fgv":
        return base if n == 0 else base + f"?page={n}"
    if kind == "cesgranrio":
        return base if n == 1 else base.rstrip("/") + f"/page/{n}/"
    if kind == "funatec":
        return base if n == 1 else base.rstrip("/") + f"/page/{n}?q="
    return base


def fgv_page_rule(u, label, base):
    return ("conhecimento.fgv.br" in u and re.search(r"\?page=\d+", u) is not None)

def fgv_detail_rule(u, label, base):
    p = urlparse(u).path
    return "conhecimento.fgv.br" in u and (p.startswith("/concursos/") or p.startswith("/processoseletivo/")) and p != "/concursos/nosso-portfolio"

def ces_page_rule(u, label, base):
    return "cesgranrio.org.br/page_category/concluidos/page/" in u

def ces_detail_rule(u, label, base):
    return "cesgranrio.org.br/concurso/" in u

def fun_page_rule(u, label, base):
    return "funatec.org.br/concursos/encerrados/page/" in u

def fun_detail_rule(u, label, base):
    return "funatec.org.br/concursos/" in u and re.search(r"/concursos/\d+", u) is not None and "/encerrados" not in u

def ibfc_page_rule(u, label, base):
    return "concursos.ibfc.org.br/index/" in u and re.search(r"/index/\d+", u) is not None

def ibfc_detail_rule(u, label, base):
    return "concursos.ibfc.org.br/informacoes/" in u

def ufrj_page_rule(u, label, base):
    return False

def ufrj_detail_rule(u, label, base):
    return "concursos.pessoal.ufrj.br/index.php/" in u and ("edital" in u.lower() or re.search(r"id=\d+:", u) is not None)

def idecan_page_rule(u, label, base):
    return "concurso.idecan.org.br/editais" in u and ("page=" in u or "pagina=" in u or re.search(r"/editais/\d+$", u) is None)

def idecan_detail_rule(u, label, base):
    return "concurso.idecan.org.br/editais/" in u and re.search(r"/editais/\d+", u) is not None

def main():
    sources = [
        ("FGV", ["https://conhecimento.fgv.br/concursos"] + [f"https://conhecimento.fgv.br/concursos?page={n}" for n in range(1, 15)], fgv_page_rule, fgv_detail_rule, 20),
        ("IBFC", [f"https://concursos.ibfc.org.br/index/3/?&ord=&dir=&pg={n}&q=&pp=20" for n in range(1, 18)], ibfc_page_rule, ibfc_detail_rule, 20),
        ("UFRJ", ["https://concursos.pessoal.ufrj.br/index.php/concursos-concluidos"], ufrj_page_rule, ufrj_detail_rule, 1),
        ("CESGRANRIO", ["https://www.cesgranrio.org.br/page_category/concluidos/"] + [f"https://www.cesgranrio.org.br/page_category/concluidos/page/{n}/" for n in range(2, 4)], ces_page_rule, ces_detail_rule, 8),
        ("FUNATEC", ["https://www.funatec.org.br/concursos/encerrados"] + [f"https://www.funatec.org.br/concursos/encerrados/page/{n}?q=" for n in range(2, 6)], fun_page_rule, fun_detail_rule, 12),
        ("IDECAN", ["https://concurso.idecan.org.br/editais", "https://site-idecan-antigo.azurewebsites.net/getConc.aspx?key=bxdbMAISNtYp4="], idecan_page_rule, idecan_detail_rule, 30),
    ]
    ap = argparse.ArgumentParser()
    ap.add_argument("--boards", nargs="*", help="Lista de bancas a processar")
    selected = {b.upper() for b in ap.parse_args().boards or []}
    if selected:
        sources = [s for s in sources if s[0].upper() in selected]
    all_rows = []
    coverage = []
    for board, seeds, page_rule, detail_rule, max_pages in sources:
        targets, contest_n, page_n = collect_board(board, seeds, page_rule, detail_rule, max_pages)
        rows = save_board(board, targets)
        all_rows.extend(rows)
        coverage.append({"banca": board, "paginas_indice": page_n, "concursos": contest_n,
                         "arquivos_identificados": len(targets), "baixados": sum(r["status"] == "baixado" for r in rows),
                         "falhas": sum(r["status"] == "falha" for r in rows)})
    (OUT / "cobertura-portais.json").write_text(json.dumps(coverage, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\nRESUMO:")
    print(json.dumps(coverage, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
