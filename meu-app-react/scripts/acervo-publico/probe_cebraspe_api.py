from __future__ import annotations
import json, sys
from urllib.request import Request, urlopen
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
def read(url):
    req=Request(url,headers={"User-Agent":"Mozilla/5.0","Accept":"application/json"})
    with urlopen(req,timeout=30) as r: return json.loads(r.read().decode("utf-8"))
base="https://apis.cebraspe.org.br/cebraspe"
listing=read(base+"/eventos/tipo/concursos/")
print("listing phase count",len(listing))
for phase in listing:
    print(phase.get("faseEvento"),len(phase.get("eventos",[])))
for slug in ("PGE_AL_26", "ABIN_17"):
    d=read(base+"/eventos/"+slug)
    print("DETAIL",slug, "keys",list(d.keys()))
    for item in (d.get("arquivosGabarito") or []):
        desc=item.get("descricaoArquivo","")
        if any(x in desc.lower() for x in ("prova","gabarito","quest","resposta")):
            name=item.get("nomeArquivo","")
            url="https://cdn.cebraspe.org.br/concursos/"+slug+"/arquivos/"+name
            print(json.dumps({"item":item,"url":url},ensure_ascii=False))
            if slug=="PGE_AL_26":
                try:
                    req=Request(url,headers={"User-Agent":"Mozilla/5.0"})
                    with urlopen(req,timeout=20) as r:
                        print("DOWNLOAD PROBE",r.status,r.headers.get("Content-Type"),r.headers.get("Content-Length"))
                except Exception as e:
                    print("DOWNLOAD ERROR",e)
                break
