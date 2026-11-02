"""Reconfere PDFs de origem em memória; salva evidências, nunca declara revisão visual completa."""
import concurrent.futures
import hashlib
import gzip
import io
import json
import logging
import re
import subprocess
import sys
import time
import unicodedata
import urllib.request
from pypdf import PdfReader
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/acervo/revisao-profissional'
QUEUE=json.loads((OUT/'fontes-documentais.json').read_text(encoding='utf-8'))
RESULT=OUT/'conferencia-fontes-pdf.jsonl'
ALLOWED={'cdn.cebraspe.org.br','www.gov.br','www.ime.eb.mil.br','esa.eb.mil.br','conhecimento.fgv.br','acervo.fuvest.br','www.fuvest.br','fs.ibfc.org.br','www2.ibfc.org.br','anexos.cdn.selecao.net.br','download.inep.gov.br','public.inep.gov.br','riep.inep.gov.br'}
ALLOWED.update({'www.funatec.org.br','funatec.org.br','hdocurso.com.br','provasantigas.onlineespecifico.com.br'})
LIMIT=32*1024*1024
logging.getLogger('pypdf').setLevel(logging.ERROR)

def norm(s):
    s=''.join(c for c in unicodedata.normalize('NFD',str(s)) if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()

SUBJECTS=['Língua Portuguesa','Português','Literatura','Língua Inglesa','Inglês','Língua Espanhola','Espanhol','Matemática','Raciocínio Lógico','Estatística','Física','Química','Biologia','História','Geografia','Filosofia','Sociologia','Direito Constitucional','Direito Administrativo','Direito Civil','Direito Penal','Direito Processual Civil','Direito Processual Penal','Direito Tributário','Direito Previdenciário','Direito do Trabalho','Direito Eleitoral','Direito Ambiental','Direito Internacional','Direitos Humanos','Legislação Especial','Legislação de Trânsito','Ética no Serviço Público','Administração Pública','Administração','Contabilidade','Contabilidade Pública','Auditoria','Economia','Informática','Arquivologia','Biblioteconomia','Medicina','Enfermagem','Odontologia','Psicologia','Pedagogia','Serviço Social','Engenharia Civil','Engenharia Elétrica','Engenharia Mecânica','Educação Física']
LOOKUP={norm(s):s for s in SUBJECTS}

def headings(text):
    found=[]
    for m in re.finditer(r'(?m)^([^\n]{3,130})$',text):
        raw=m.group(1).strip()
        # Cabeçalho de seção, não uma expressão em uma frase ou alternativa.
        clean=norm(raw)
        clean=re.sub(r'^(?:nocoes de|conhecimentos de|conhecimentos basicos de) ','',clean)
        if clean in LOOKUP and (raw.upper()==raw or len(raw.split())<=5):found.append((m.start(),LOOKUP[clean]))
        elif clean in ('conhecimentos basicos','conhecimentos gerais','conhecimentos especificos','conhecimento especifico'):found.append((m.start(),None))
    return found

def inspect(doc,pdf_data=None):
    result={'documento_id':doc['id'],'url':doc['url'],'questoes':len(doc['questoes']),'status':'pendente','evidencias':[]}
    url=doc['url']
    if url.startswith('http://') and urlparse(url).hostname in ALLOWED:url='https://'+url[7:]
    result['url']=url
    if pdf_data is None and re.search(r'\.(?:rar|zip)(?:\?|$)',url,re.I):
        result['status']='fonte_em_arquivo_compactado';return result
    if not url.startswith('https://') or urlparse(url).hostname not in ALLOWED:
        result['status']='origem_sem_url_oficial_verificavel';return result
    try:
        data=pdf_data
        if data is None:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; acervo-estudo/1.0)','Accept':'application/pdf'})
            with urllib.request.urlopen(req,timeout=25) as response:
                if urlparse(response.url).hostname not in ALLOWED:raise ValueError('Redirecionamento fora das fontes oficiais conhecidas')
                data=response.read(LIMIT+1)
        if len(data)>LIMIT:raise ValueError('PDF acima de 32 MiB; necessário processamento separado')
        if not data.lstrip().startswith(b'%PDF-'):raise ValueError('A origem retornou HTML ou outro formato')
        result['sha256']=hashlib.sha256(data).hexdigest();result['bytes']=len(data)
        reader=PdfReader(io.BytesIO(data),strict=False)
        relevant={0,1}
        for question in doc['questoes']:
            p=int(question.get('pagina') or 0)-1
            relevant.update((p-1,p,p+1))
            relevant.update(int(n)-1 for n in question.get('paginas',[]) if isinstance(n,int))
        pages=[(page.extract_text()or'') if i in relevant else '' for i,page in enumerate(reader.pages)]
        result['paginas_textuais_extraidas']=[i+1 for i,t in enumerate(pages) if t]
        result['escopo']='capa, instruções, páginas de todos os registros existentes e páginas adjacentes'
        cache=ROOT/'tmp/revisao-profissional/fontes-texto'
        cache.mkdir(parents=True,exist_ok=True)
        (cache/(doc['id']+'.json.gz')).write_bytes(gzip.compress(json.dumps(pages,ensure_ascii=False).encode('utf-8'),compresslevel=6))
        result['metodo_extracao']='pypdf-plain-v2'
        result['paginas']=len(pages)
        header='\n'.join(pages[:2])
        year=re.search(r'(?:aplica[cç][aã]o|ENADE|ENEM|REVALIDA|ENAMED|VESTIBULAR)\s*[:—–-]?\s*((?:19|20)\d{2})\b',header,re.I)
        if year:result['ano_cabecalho']=int(year.group(1))
        previous=None
        for page_number,text in enumerate(pages,1):
            if not text:
                previous=None
                continue
            sections=headings(text)
            relevant=[q for q in doc['questoes'] if q['pagina']==page_number]
            normalized=norm(text)
            for q in relevant:
                tokens=norm(q.get('trecho','')).split()
                if len(tokens)<7:continue
                position=-1
                for count in (12,10,8,6):
                    prefix=' '.join(tokens[:min(count,len(tokens))])
                    if len(prefix)<24:continue
                    candidate=normalized.find(prefix)
                    if candidate>=0 and normalized.find(prefix,candidate+1)<0:
                        position=candidate;break
                if position<0:continue
                # Calcula posições no mesmo espaço normalizado para não usar offsets
                # de acentos e espaços do texto original.
                chosen=previous
                for offset,subject in sections:
                    if len(norm(text[:offset]))<=position:chosen=subject
                evidence={'id':q['id'],'pagina':page_number,'texto_localizado':True}
                if chosen:evidence['materia_cabecalho']=chosen
                result['evidencias'].append(evidence)
            if sections:previous=sections[-1][1]
        result['status']='pdf_lido';result['texto_localizado']=len(result['evidencias'])
        result['disciplinas_confirmadas_por_cabecalho']=sum('materia_cabecalho'in e for e in result['evidencias'])
        return result
    except Exception as error:
        result['status']='fonte_indisponivel_ou_ilegivel';result['erro']=str(error)[:350];return result

def main():
    done={}
    if RESULT.exists():
        for line in RESULT.read_text(encoding='utf-8').splitlines():
            try:
                value=json.loads(line)
                if '[WinError 2]' not in value.get('erro',''):done[value['documento_id']]=value
            except Exception:pass
    def needs(d):
        old=done.get(d['id'])
        if not old:return True
        expected=('https://'+d['url'][7:]) if d['url'].startswith('http://') and urlparse(d['url']).hostname in ALLOWED else d['url']
        if expected and expected!=old.get('url'):return True
        return '--repor-cache' in sys.argv and old['status']=='pdf_lido' and not (ROOT/'tmp/revisao-profissional/fontes-texto'/(d['id']+'.json.gz')).exists()
    pending=[d for d in QUEUE if not re.search(r'\.(?:rar|zip)$',d['url'],re.I) and needs(d)]
    # Ordem determinística; retomar não repete downloads já registrados.
    start=time.monotonic()
    workers=8 if '--oito-leituras' in sys.argv else 4
    with RESULT.open('a',encoding='utf-8') as output,concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures={pool.submit(inspect,d):d['id'] for d in pending}
        for index,future in enumerate(concurrent.futures.as_completed(futures),1):
            result=future.result();done[result['documento_id']]=result
            output.write(json.dumps(result,ensure_ascii=False)+'\n');output.flush()
            if index%20==0:
                print(json.dumps({'conferidos':len(done),'documentos':len(QUEUE),'pdfs_lidos':sum(v['status']=='pdf_lido' for v in done.values()),'segundos':round(time.monotonic()-start)},ensure_ascii=False),flush=True)
    summary={'documentos':len(done),'pdfs_lidos':sum(v['status']=='pdf_lido'for v in done.values()),'indisponiveis':sum(v['status']!='pdf_lido'for v in done.values()),'questoes_localizadas':sum(v.get('texto_localizado',0)for v in done.values()),'disciplinas_por_cabecalho':sum(v.get('disciplinas_confirmadas_por_cabecalho',0)for v in done.values())}
    (OUT/'resultado-fontes-pdf.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
