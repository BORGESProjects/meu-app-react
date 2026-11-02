import concurrent.futures
import hashlib
import io
import json
import logging
import re
import time
import urllib.request
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/acervo/revisao-profissional'
RESULT=OUT/'gabaritos-conferidos.jsonl'
logging.getLogger('pypdf').setLevel(logging.ERROR)

def parse_table(text):
    lines=[line.strip() for line in text.splitlines() if line.strip()]
    answers={};conflicts=[];rows=0
    for i,line in enumerate(lines):
        if not re.match(r'^(?:Item|Quest[aã]o|Quest[oõ]es)\b',line,re.I):continue
        numbers=re.sub(r'^(?:Item|Quest[aã]o|Quest[oõ]es)\s*','',line,flags=re.I).strip()
        if not re.fullmatch(r'[\d\s]+',numbers):continue
        following=lines[i+1:i+4]
        keyline=next((value for value in following if re.match(r'^Gabarito\b',value,re.I)),None)
        if not keyline:continue
        values=re.sub(r'^Gabarito\s*','',keyline,flags=re.I).strip()
        if not re.fullmatch(r'[A-EXN\s*]+',values):continue
        keys=re.findall(r'[A-EXN]',values)
        if len(keys)<5:continue
        ns=[int(v) for v in numbers.split()]
        if len(ns)!=len(keys):
            digits=re.sub(r'\s','',numbers)
            starts=[n for n in range(1,501) if ''.join(str(j)for j in range(n,n+len(keys)))==digits]
            if len(starts)!=1:continue
            ns=list(range(starts[0],starts[0]+len(keys)))
        if not all(b==a+1 for a,b in zip(ns,ns[1:])):continue
        for n,key in zip(ns,keys):
            if n in answers and answers[n]!=key:conflicts.append(n)
            answers[n]=key
        rows+=1
    if conflicts:raise ValueError('Mais de um gabarito para os mesmos números: modelos ambíguos')
    return answers,rows

def inspect(doc):
    result={**doc,'status':'pendente'}
    try:
        url=doc['gabarito_url']
        if url.startswith('http://'):url='https://'+url[7:]
        if not url.startswith('https://'):raise ValueError('Gabarito sem URL HTTPS')
        if 'cebraspe' in url and not re.search(r'definitiv|retific|final',doc['tipo']+' '+doc['arquivo_gabarito'],re.I):raise ValueError('Publicação não identificada como definitiva')
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/pdf'})
        with urllib.request.urlopen(req,timeout=25)as response:data=response.read(8*1024*1024+1)
        if len(data)>8*1024*1024 or not data.lstrip().startswith(b'%PDF-'):raise ValueError('Gabarito não é um PDF de tamanho compatível')
        reader=PdfReader(io.BytesIO(data),strict=False)
        if len(reader.pages)>20:raise ValueError('Documento extenso; necessário separar modelos antes de usar')
        text='\n'.join(page.extract_text(extraction_mode='layout')or'' for page in reader.pages)
        answers,rows=parse_table(text)
        if not answers:raise ValueError('Tabela de gabarito não reconhecida de forma inequívoca')
        result.update(status='tabela_lida',sha256=hashlib.sha256(data).hexdigest(),respostas=answers,linhas=rows)
    except Exception as error:result.update(status='requer_conferencia',erro=str(error)[:300])
    return result

def main():
    queue=json.loads((OUT/'gabaritos-candidatos.json').read_text(encoding='utf-8'));done={}
    if RESULT.exists():
        for line in RESULT.read_text(encoding='utf-8').splitlines():
            value=json.loads(line);done[value['documento_id']]=value
    start=time.monotonic()
    with RESULT.open('a',encoding='utf-8')as output,concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:
        for index,result in enumerate(pool.map(inspect,[d for d in queue if d['documento_id']not in done]),1):
            done[result['documento_id']]=result;output.write(json.dumps(result,ensure_ascii=False)+'\n');output.flush()
            if index%40==0:print(json.dumps({'gabaritos':len(done),'total':len(queue),'tabelas_lidas':sum(v['status']=='tabela_lida'for v in done.values()),'segundos':round(time.monotonic()-start)}),flush=True)
    summary={'gabaritos':len(done),'tabelas_lidas':sum(v['status']=='tabela_lida'for v in done.values()),'respostas_extraidas':sum(len(v.get('respostas',{}))for v in done.values())}
    (OUT/'resultado-gabaritos.json').write_text(json.dumps(summary,indent=2),encoding='utf-8');print(json.dumps(summary),flush=True)

if __name__=='__main__':main()
