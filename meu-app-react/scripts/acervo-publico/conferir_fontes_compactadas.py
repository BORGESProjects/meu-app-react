"""Reabre arquivos oficiais uma vez e lê só os PDFs identificados sem extrair pastas."""
import collections
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from urllib.parse import urlparse
from conferir_fontes_pdf import ROOT, OUT, QUEUE, ALLOWED, inspect
RESULT=OUT/'conferencia-fontes-compactadas.jsonl'

UNRAR=Path('C:/Program Files/WinRAR/UnRAR.exe')
groups=collections.defaultdict(list)
for doc in QUEUE:
    if re.search(r'\.(?:rar|zip)$',doc['url'],re.I): groups[doc['url']].append(doc)
cache=ROOT/'tmp/revisao-profissional/arquivos-temporarios'
cache.mkdir(parents=True,exist_ok=True)

def choose(doc,names):
    filename=doc['arquivo'].replace('\\','/').split('/')[-1].lower()
    matches=[n for n in names if n.replace('\\','/').split('/')[-1].lower()==filename]
    if len(matches)==1:return matches[0]
    year=str(doc.get('ano_catalogo') or '')
    narrowed=[n for n in matches if year and re.search(r'(?<!\d)'+year+r'(?!\d)',n)]
    return narrowed[0] if len(narrowed)==1 else None

with RESULT.open('a',encoding='utf-8') as output:
    for index,(url,docs) in enumerate(groups.items(),1):
        if urlparse(url).hostname not in ALLOWED:continue
        temporary=None
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; acervo-estudo/1.0)'})
            digest=hashlib.sha256();total=0
            with urllib.request.urlopen(req,timeout=45) as response, tempfile.NamedTemporaryFile(dir=cache,suffix=Path(url).suffix,delete=False) as target:
                temporary=Path(target.name)
                if urlparse(response.url).hostname not in ALLOWED:raise ValueError('Redirecionamento fora das fontes conhecidas')
                while True:
                    chunk=response.read(1024*1024)
                    if not chunk:break
                    total+=len(chunk)
                    if total>256*1024*1024:raise ValueError('Compactado excede 256 MiB')
                    digest.update(chunk);target.write(chunk)
            archive=zipfile.ZipFile(temporary) if temporary.suffix.lower()=='.zip' else None
            try:
                names=archive.namelist() if archive else subprocess.run([str(UNRAR),'lb','-c-','-p-',str(temporary)],capture_output=True,check=True).stdout.decode('utf-8','replace').splitlines()
                for doc in docs:
                    member=choose(doc,names)
                    if not member:
                        result={'documento_id':doc['id'],'url':url,'status':'membro_compactado_ausente_ou_ambiguo','arquivo':doc['arquivo']}
                    else:
                        if archive:
                            info=archive.getinfo(member)
                            if info.file_size>32*1024*1024:raise ValueError('PDF interno excede 32 MiB')
                            data=archive.read(member)
                        else:
                            data=subprocess.run([str(UNRAR),'p','-inul','-p-',str(temporary),member],capture_output=True,check=True,timeout=60).stdout
                        result=inspect(doc,data)
                        result.update({'arquivo_interno':member,'sha256_compactado':digest.hexdigest()})
                    output.write(json.dumps(result,ensure_ascii=False)+'\n');output.flush()
            finally:
                if archive:archive.close()
            print(json.dumps({'compactados':index,'total':len(groups),'documentos':len(docs),'bytes':total}),flush=True)
        except Exception as error:
            print(json.dumps({'url':url,'erro':str(error)[:240]}),flush=True)
        finally:
            if temporary and temporary.parent.resolve()==cache.resolve():temporary.unlink(missing_ok=True)
