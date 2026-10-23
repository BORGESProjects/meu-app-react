from __future__ import annotations
import json,re,sys
from html.parser import HTMLParser
from urllib.request import Request,urlopen
sys.stdout.reconfigure(encoding="utf-8",errors="replace")
class A(HTMLParser):
 def __init__(self): super().__init__(); self.x=[]; self.h=None; self.t=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a': self.h=dict(attrs).get('href'); self.t=[]
 def handle_data(self,d):
  if self.h is not None:self.t.append(d)
 def handle_endtag(self,tag):
  if tag=='a' and self.h is not None:self.x.append((self.h,' '.join(' '.join(self.t).split())));self.h=None
def get(url):
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/json,text/html,*/*'}),timeout=30) as r:return r.read(),dict(r.headers),r.geturl()
url='https://www.cesgranrio.org.br/wp-json/wp/v2/concurso?per_page=100&_embed'
b,h,_=get(url); print('LIST',len(b),h.get('X-WP-Total'),h.get('X-WP-TotalPages'))
posts=json.loads(b)
for p in posts[:5]:
 title=re.sub('<.*?>','',p.get('title',{}).get('rendered',''))
 content=p.get('content',{}).get('rendered','')
 print('\nPOST',p.get('id'),title,p.get('link'),'CONTENT',len(content),content[:500])
 parser=A();parser.feed(content)
 for href,label in parser.x:
  if '.pdf' in href.lower() or any(x in (href+' '+label).lower() for x in ('prova','gabarito','quest','caderno','arquivo')):
   print('LINK',label[:100],href[:250])
 b2,h2,final=get(p.get('link'))
 s=b2.decode('utf-8','replace'); parser=A();parser.feed(s)
 print('HTML',final,len(b2),'anchors',len(parser.x),'pdf-hrefs',sum('.pdf' in x[0].lower() for x in parser.x))
 for href,label in parser.x:
  if '.pdf' in href.lower() or any(x in (href+' '+label).lower() for x in ('prova','gabarito','quest','caderno')):
   print('HTML-LINK',label[:100],href[:250])
 if p.get('id')==1930:
  for href,label in parser.x:
   if href and 'wp-content' not in href and 'facebook' not in href and 'instagram' not in href:
    print('ALLLINK',label[:80],href[:220])
  for term in ('prova','gabarito','quest','documento','concurso.cesgranrio','download','iframe','pdf'):
   inds=[m.start() for m in re.finditer(term,s,re.I)]
   print('TERM',term,len(inds))
   for i in inds[:4]: print(re.sub(r'\s+',' ',s[max(0,i-180):i+350])[:500])
