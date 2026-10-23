from __future__ import annotations
import re, sys
from urllib.request import Request, urlopen
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
urls = [
"https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/encceja/provas-e-gabaritos",
"https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos",
"https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/revalida/provas-e-gabaritos",
"https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb/documentos-edicoes-antigas",
]
for url in urls:
    print("\n###",url)
    with urlopen(Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=35) as r:
        b=r.read(); charset=r.headers.get_content_charset() or "utf-8"
    s=b.decode(charset,"replace")
    print("size",len(s),"charset",charset)
    for term in ("2026","2009","accordion","collapse","download.inep.gov.br","fieldname-text","provas-e-gabaritos"):
        inds=[m.start() for m in re.finditer(re.escape(term),s,re.I)]
        print("TERM",term,"COUNT",len(inds))
        for i in inds[-2:]:
            chunk=re.sub(r"\s+"," ",s[max(0,i-180):i+350])
            print(chunk[:500])
