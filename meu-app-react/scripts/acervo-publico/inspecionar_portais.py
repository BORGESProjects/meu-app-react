from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

URLS = [
    "https://conhecimento.fgv.br/concursos",
    "https://www.funatec.org.br/concursos/encerrados",
    "https://concursos.pessoal.ufrj.br/index.php/concursos-concluidos",
    "https://www.cesgranrio.org.br/page_category/concluidos/",
    "https://idecan.org.br/",
    "https://concursos.ibfc.org.br/index/3/",
    "https://concursos.fundep.ufmg.br/site/site/AnexosConcursos.aspx",
    "https://www.cebraspe.org.br/concursos/",
    "https://www.vunesp.com.br/busca/concurso/encerrados",
]
H = {"User-Agent": "Mozilla/5.0 (compatible; PublicExamArchive/1.0)"}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.href = None
        self.label = []
        self.items = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            src = dict(attrs).get("src")
            if src:
                self.scripts.append(src)
        if tag == "a":
            self.href = dict(attrs).get("href")
            self.label = []

    def handle_data(self, data):
        if self.href is not None:
            self.label.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.href is not None:
            self.items.append((self.href, " ".join(" ".join(self.label).split())))
            self.href = None

for url in URLS:
    try:
        req = Request(url, headers=H)
        with urlopen(req, timeout=30) as res:
            body = res.read()
            status = res.status
        p = Links()
        p.feed(body.decode("utf-8", "replace"))
        print(f"\n### {status} {len(body)} {url}")
        if "ibfc" in url or "cebraspe" in url:
            print("SCRIPTS:")
            for src in p.scripts:
                print(src)
            for href, label in p.items:
                if href and label:
                    print(f"{label[:110]}\t{href}")
    except Exception as e:
        print(f"\n### ERROR {url}: {e}")
