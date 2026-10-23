from __future__ import annotations

import re
import sys
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
urls = [
    "https://concursos.ibfc.org.br/index/3/",
    "https://concursos.ibfc.org.br/informacoes/407/",
    "https://www.cebraspe.org.br/concursos/",
    "https://concurso.idecan.org.br/editais",
    "https://site-idecan-antigo.azurewebsites.net/getConc.aspx?key=bxdbMAISNtYpV4=",
    "https://concursos.fundep.ufmg.br/site/site/AnexosConcursos.aspx",
    "https://www.cebraspe.org.br/wp-sitemap.xml",
    "https://www.cebraspe.org.br/wp-json/wp/v2/types",
    "https://www.cebraspe.org.br/concursos/static/js/main.4bdb8f79.chunk.js",
    "https://www.vunesp.com.br/",
    "https://www.cesgranrio.org.br/concurso/caixa-economica-federal-caixa-01-2025/",
]
for url in urls:
    print(f"\n### {url}")
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=30) as r:
            b = r.read()
            charset = r.headers.get_content_charset() or "utf-8"
            print("STATUS", r.status, "SIZE", len(b), "TYPE", r.headers.get("Content-Type"))
        s = b.decode(charset, "replace")
        if "chunk.js" in url:
            matches = re.findall(r"(?i).{0,100}(?:api|graphql|concursos|provas|gabaritos|ajax).{0,160}", s)
            for x in matches[:60]:
                print(x[:280])
            continue
        for pattern in [r"(?is)<script[^>]*>.*?</script>", r"(?is)<form[^>]*>.*?</form>"]:
            for m in re.finditer(pattern, s):
                chunk = re.sub(r"\s+", " ", m.group(0))
                print(chunk[:1600])
        for line in re.findall(r"(?im)^.{0,100}(?:prova|quest|gabarito|ajax|api|informacoes|concursos|pagina|page|pdf).{0,100}$", s):
            if line.strip():
                print(re.sub(r"\s+", " ", line)[:350])
    except Exception as e:
        print("ERROR", e)
