"""Extrai itens C/E de cadernos Cebraspe; gera revisão dos comandos compartilhados."""
import json,re,statistics
from pathlib import Path
import pdfplumber
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]


def gabarito(path):
 with pdfplumber.open(path) as doc:
  t='\n'.join(p.extract_text() or '' for p in doc.pages)
 assert 'DEFINITIV' in t.upper(),path
 answer={}
 lines=t.splitlines()
 for i,line in enumerate(lines[:-1]):
  if re.match(r'^Item\s+\d',line):
   ns=[int(n) for n in line.split()[1:]]
   nxt=lines[i+1]
   assert nxt.startswith('Gabarito'),(path,line,nxt)
   ls=nxt.split()[1:];assert len(ns)==len(ls)
   answer.update({n:l for n,l in zip(ns,ls) if n and l in ['C','E','X']})
 assert answer,path
 return answer


def extrair(meta, destino):
 name=meta['id'];answers=gabarito(ROOT/'tmp/federais'/(meta.get('gabarito_local',name+'-gabarito')+'.pdf'))
 path=ROOT/'tmp/federais'/(meta.get('prova_local',name)+'.pdf')
 dest=destino/name;dest.mkdir(parents=True,exist_ok=True)
 with pdfplumber.open(path) as doc:
  cache={};events=[];found=[];report=[]
  def save(pg,box,label):
   if pg not in cache:
    cache[pg]=doc.pages[pg].to_image(resolution=170).original.convert('RGB')
    if len(cache)>5:cache.pop(next(iter(cache)))
   im=cache[pg];sx=im.width/doc.pages[pg].width;sy=im.height/doc.pages[pg].height
   im=im.crop((round(box[0]*sx),round(box[1]*sy),round(box[2]*sx),round(box[3]*sy)))
   ink=im.convert('L').point(lambda p:255 if p<235 else 0).getbbox()
   if ink:im=im.crop((max(0,ink[0]-3),max(0,ink[1]-3),min(im.width,ink[2]+3),min(im.height,ink[3]+3)))
   out=dest/(label+'.webp');im.save(out,'WEBP',quality=90)
   return '/'+out.relative_to(ROOT/'public').as_posix()
  def texto(pg,b):
   cs=[c for c in doc.pages[pg].chars if b[0]<=(c['x0']+c['x1'])/2<b[2] and b[1]<=(c['top']+c['bottom'])/2<b[3]]
   return pdfplumber.utils.extract_text(cs) or ''
  def support(pg,x0,x1,lo,hi):
   if hi<=lo+3:return None
   t=texto(pg,(x0,lo,x1,hi)).strip()
   t=re.sub(r'\(cid:\d+\)','',t)
   if len(t)<12 or re.fullmatch(r'Espaço livre\s*',t,re.I):return None
   return {'pagina':pg+1,'box':[x0,lo,x1,hi],'texto':t}
  for pg,p in enumerate(doc.pages):
   if 'PROVA DISCURSIVA' in (p.extract_text() or '')[:200] and pg>1:continue
   ws=p.extract_words(extra_attrs=['size'])
   ms=[w for w in ws if w['text'].isdigit() and int(w['text']) in answers and abs(w['size']-9)<.15 and (26<=w['x0']<=33 or 301<=w['x0']<=309)]
   if not ms:continue
   first=min(w['top'] for w in ms)
   bars=[r['bottom'] for r in p.rects if r['width']>480 and r['height']>5 and r['bottom']<first and r['top']>65]
   start=max(bars)+3 if bars else 45
   titles=[w['bottom'] for w in ws if w['text'] in ['BÁSICOS','ESPECÍFICOS'] and w['size']>11 and w['bottom']<first]
   if titles:start=max(start,max(titles)+4)
   # Some final PF pages switch to a single full-width column. Body glyphs
   # in the normal gutter distinguish them from the two-column layout.
   single=all(w['x0']<300 for w in ms) and any(293<c['x0']<302 and first-3<c['top']<max(w['top'] for w in ms)+15 and c['size']>8 for c in p.chars)
   columns=[(27,568)] if single else [(27,293),(302,568)]
   for col,(x0,x1) in enumerate(columns):
    markers=sorted([w for w in ms if x0<=w['x0']<x1],key=lambda w:w['top'])
    if not markers:
     prefix=support(pg,x0,x1,start,815.8)
     if prefix:events.append(('support',prefix))
     continue
    lo=start; prefix=support(pg,x0,x1,lo,markers[0]['top']-2)
    if prefix:events.append(('support',prefix))
    for idx,m in enumerate(markers):
     n=int(m['text']);top=m['top']-2;end=markers[idx+1]['top']-2 if idx+1<len(markers) else 815.8
     words=[w for w in ws if x0<=w['x0']<x1 and m['top']-3<=w['top']<end]
     lines=[]
     for w in sorted(words,key=lambda w:(round(w['top']/2),w['x0'])):
      if not lines or abs(w['top']-lines[-1][0]['top'])>3:lines.append([w])
      else:lines[-1].append(w)
     cutoff=end
     # Body continuations are indented; independent commands return to the column margin.
     for j,line in enumerate(lines):
      t=' '.join(w['text'] for w in sorted(line,key=lambda w:w['x0']))
      prev=lines[j-1] if j else []
      gap=min(w['top'] for w in line)-max(w['bottom'] for w in prev) if prev else 0
      independent=min(w['x0'] for w in line)<m['x0']+9
      if re.match(r'^[a-záéíóúç]',t):continue
      if j and gap>8 and (independent or min(w['x0'] for w in line)<x0+40 or re.match(r'^(?:Julgue|Acerca|Com (?:base|relação)|Considerando|A respeito|No que|Em relação|Quanto|Texto\s)',t)):
       cutoff=min(w['top'] for w in line)-2
       break
     separators=[r['top'] for r in p.rects if r.get('fill') and r['width']>240 and r['height']<5 and abs(r['x0']-x0)<3 and top+10<r['top']<end-3]
     if separators:cutoff=min(cutoff,min(separators))
     headers=[w['top']-3 for w in ws if w['text']=='BLOCO' and w['size']>11 and top+10<w['top']<end]
     if headers:cutoff=min(cutoff,min(headers))
     b=[x0,top,x1,cutoff]
     itemtext=texto(pg,b).strip()
     if len(itemtext)<12:itemtext=f'Item {n}: julgue a afirmação apresentada no recorte oficial.'
     events.append(('item',{'n':n,'pagina':pg+1,'box':b,'texto':itemtext}))
     found.append(n)
     if cutoff<end:
      pre=support(pg,x0,x1,cutoff,end)
      if pre:events.append(('support',pre))
  assert sorted(found)==sorted(answers),(name,'marcadores',sorted(set(answers)-set(found)),[n for n in found if found.count(n)>1])
  # A statement can continue at the top of the next column/page. Its
  # continuation belongs to that statement, never to the next question's support.
  merged=[]
  for typ,event in events:
   if typ=='support' and merged and merged[-1][0]=='item' and re.match(r'^[a-záéíóúç]',event['texto']) and not re.search(r'[.!?;:]\s*$',merged[-1][1]['texto']):
    previous=merged[-1][1]
    previous['texto']+='\n'+event['texto']
    previous.setdefault('continuacoes',[]).append(event)
   else:merged.append((typ,event))
  events=merged
  active=[];records=[];seen={}
  for event_index,(typ,event) in enumerate(events):
   if typ=='support':
    adjacent_support=event_index>0 and events[event_index-1][0]=='support' and events[event_index-1][1]['pagina']==event['pagina']
    t=event['texto']; continuation=bool(re.search(r'texto\s+(?:\w[\w.-]*|apresentado|precedente|anterior)|text (?:above|below|preceding)|figura|situação (?:hipotética|apresentada)|caso (?:apresentado|hipotético)',t,re.I))
    # Referenced texts and scenarios may continue from the previous column.
    if not adjacent_support and not continuation and not re.match(r'^(?:Ainda|[a-záéíóúç])',t):active=[]
    if not adjacent_support and len(t)>450 and not re.match(r'^(?:Ainda|Julgue|Com|A respeito|Considerando|[a-záéíóúç])',t):active=[]
    active=active+[event]
    report.append({'antes_de':next((e['n'] for tp,e in events[events.index((typ,event))+1:] if tp=='item'),None),'pagina':event['pagina'],'texto':t})
    continue
   n=event['n'];qid=f'{name}-{n:03d}';apoios=[]
   for a in active:
    key=(a['pagina'],tuple(a['box']))
    if key not in seen:seen[key]=save(a['pagina']-1,a['box'],'apoio-'+str(len(seen)+1))
    apoios.append({'imagem':seen[key],'texto':a['texto']})
   itemimage=save(event['pagina']-1,event['box'],f'q{n:03d}')
   if event.get('continuacoes'):
    paths=[itemimage]+[save(a['pagina']-1,a['box'],f'q{n:03d}-continuacao-{i}') for i,a in enumerate(event['continuacoes'])]
    imgs=[Image.open(ROOT/'public'/p.lstrip('/')).convert('RGB') for p in paths]
    combined=Image.new('RGB',(max(im.width for im in imgs),sum(im.height for im in imgs)+10*(len(imgs)-1)),'white');y=0
    for im in imgs:combined.paste(im,(0,y));y+=im.height+10
    combined.save(ROOT/'public'/itemimage.lstrip('/'),'WEBP',quality=90)
   ans=answers[n]
   records.append(dict(id=qid,ano=meta['ano'],banca=meta['banca'],concurso=meta['concurso'],numero_original=n,materia=meta.get('materia','Conhecimentos específicos'),conteudo=meta.get('conteudo','Conhecimentos específicos'),dificuldade='Médio',dificuldade_estimada=True,tipo_resposta='certo_errado',enunciado=event['texto'],opcoes=['Certo','Errado'],resposta_correta=None if ans=='X' else 0 if ans=='C' else 1,anulada=ans=='X',imagem_original=itemimage,imagem_sem_alternativas=True,texto_extraido_corrompido=True,apoio=apoios,fonte_pdf=meta['fonte_pdf'],fonte_gabarito=meta['fonte_gabarito'],pagina=event['pagina'],organizadora='Cebraspe',**{k:v for k,v in meta.items() if k in ['idioma','cargo','provas']}))
  (ROOT/'tmp'/f'{name}-comandos-revisar.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  (ROOT/'tmp'/f'{name}-eventos-revisar.json').write_text(json.dumps(events,ensure_ascii=False,indent=2),encoding='utf8')
  return records
