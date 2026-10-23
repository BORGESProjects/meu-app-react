from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.src = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            src = dict(attrs).get("src")
            if src:
                self.src.append(src)

def fetch(url):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=30) as r:
        return r.read(), r.geturl()

page = "https://www.cebraspe.org.br/concursos/"
data, _ = fetch(page)
p = Scripts()
p.feed(data.decode("utf-8", "replace"))
for src in p.src:
    src = src if src.startswith("http") else "https://www.cebraspe.org.br" + (src if src.startswith("/") else "/" + src)
    if "/concursos/static/js/" not in src:
        continue
    b, final = fetch(src)
    s = b.decode("utf-8", "replace")
    print("\n###", final, len(b))
    seen = set()
    if "main." in final:
        for term in ("apis.cebraspe", "cebraspe/eventos", "/eventos", "eventoURL", "apiLink", "mostrarEncerrados", "mostrarTudo", "N.a.ajax"):
            pos = 0
            while True:
                pos = s.lower().find(term.lower(), pos)
                if pos < 0:
                    break
                print("CTX", s[max(0, pos - 220):pos + 500])
                pos += len(term)
    for match in re.finditer(r"(?i)(?:https?://[^\"']+|/[^\"']+|[A-Za-z_$][\w$]*\.(?:get|post)\([^)]{0,150}\))", s):
        x = match.group(0)
        if any(k in x.lower() for k in ("api", "concurs", "event", "prova", "gabar", "s3", "firebase")):
            x = x[:300]
            if x not in seen:
                seen.add(x)
                print(x)
