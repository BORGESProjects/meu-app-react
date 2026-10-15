"""Completa o caderno IFPR 2019 preservando colunas, imagens e dois idiomas."""
import json,re
from pathlib import Path
import pdfplumber
from PIL import Image
from completar_uem_2025 import ajustar_limite
from importar_ifpr_2020 import clean,ROOT
SOURCE='https://arquivos.qconcursos.com/prova/arquivo_prova/59352/funtef-pr-2018-if-pr-vestibular-prova.pdf'
KEY_SOURCE='https://arquivos.qconcursos.com/prova/arquivo_gabarito/59352/funtef-pr-2018-if-pr-vestibular-gabarito.pdf'
DEST=ROOT/'public/acervo/ifpr-2019' 



def main():
 DEST.mkdir(parents=True,exist_ok=True)
 with pdfplumber.open(ROOT/'tmp/ifpr2019-gabarito.pdf') as keypdf:
  t=keypdf.pages[0].extract_text()
  assert 'DEFINITIVO' in t and 'ENSINO SUPERIOR' in t
  answers={int(n):l for n,l in re.findall(r'\b(\d{1,2})\s+([A-D])\b',t)}
  assert len(answers)==55
 with pdfplumber.open(ROOT/'tmp/ifpr2019-graduacao.pdf') as doc:
  cache={}
  def bounds(pg,col):
   shift=14.1 if (pg+1)%2 else 0
   return (32+shift,283+shift) if col==0 else (296+shift,548+shift)
  def box(pg,col,y0,y1):
   x0,x1=bounds(pg,col)
   return (x0,y0,x1,y1)
  def img(pg,b):
   if pg not in cache:cache[pg]=doc.pages[pg].to_image(resolution=190).original.convert('RGB')
   im=cache[pg]; sx=im.width/doc.pages[pg].width; sy=im.height/doc.pages[pg].height
   return im.crop((round(b[0]*sx),round(b[1]*sy),round(b[2]*sx),round(b[3]*sy)))
  def save(parts,name):
   ims=[img(pg,b) for pg,b in parts if b[3]>b[1]+1]
   trimmed=[]
   for im in ims:
    ink=im.convert('L').point(lambda p:255 if p<235 else 0).getbbox()
    if ink:im=im.crop((max(0,ink[0]-3),max(0,ink[1]-3),min(im.width,ink[2]+3),min(im.height,ink[3]+3)))
    trimmed.append(im)
   ims=trimmed
   canvas=Image.new('RGB',(max(i.width for i in ims),sum(i.height for i in ims)+10*(len(ims)-1)),'white'); y=0
   for im in ims:canvas.paste(im,(0,y));y+=im.height+10
   canvas.save(DEST/(name+'.webp'),'WEBP',quality=92)
   return '/acervo/ifpr-2019/'+name+'.webp'
  def text(parts):
   texts=[]
   for pg,b in parts:
    chars=[c for c in doc.pages[pg].chars if b[0]<=(c['x0']+c['x1'])/2<b[2] and b[1]<=(c['top']+c['bottom'])/2<b[3]]
    texts.append(pdfplumber.utils.extract_text(chars) or '')
   return clean('\n'.join(texts))
  def ranges(start,end):
   sid,y0=start; eid,y1=end; out=[]
   for sid2 in range(sid,eid+1):
    pg=sid2//2;col=sid2%2
    lo=y0 if sid2==sid else 45
    hi=y1 if sid2==eid else 808
    if hi>lo+1:out.append((pg,box(pg,col,lo,hi)))
   return out
  markers=[];alts=[]
  for pg in range(3,16):
   for col in range(2):
    x0,x1=bounds(pg,col);ws=doc.pages[pg].crop((x0,43,x1,807)).extract_words()
    for j,w in enumerate(ws):
     if w['text']=='QUESTÃO' and j+1<len(ws) and ws[j+1]['text'].isdigit():markers.append((int(ws[j+1]['text']),pg*2+col,w['top']-3))
     if w['text'] in ['A)','B)','C)','D)']:alts.append((w['text'][0],pg*2+col,w['top']-.7))
  markers.sort(key=lambda m:(m[1],m[2]));alts.sort(key=lambda m:(m[1],m[2]))
  assert [m[0] for m in markers]==list(range(1,56))
  # Shared supports are excluded from the preceding question.
  stop={2:(7,680),6:(10,450),10:(12,600),22:(18,337),33:(22,550),45:(27,412),50:(29,765)}
  support={}
  for name,nums,parts in [
   ('apoio-portugues-01-02',[1,2],[(3,box(3,0,114,805))]),
   ('apoio-portugues-03-04',[3,4],[(4,box(4,0,43,284))]),
   ('apoio-portugues-07-10',range(7,11),[(5,box(5,0,450,805)),(5,box(5,1,45,460))]),
   ('apoio-ingles-46-50',range(46,51),[(14,box(14,0,89,616))]),
   ('apoio-espanhol-51-55',range(51,56),[(15,box(15,0,78,808)),(15,box(15,1,45,119))])]:
   support[name]={'imagem':save(parts,name),'texto':text(parts),'nums':list(nums)}
  records=[]
  for idx,(n,sid,y) in enumerate(markers):
   idioma='Inglês' if 46<=n<=50 else 'Espanhol' if n>=51 else None
   nextstart=(markers[idx+1][1],markers[idx+1][2]-3) if idx+1<len(markers) else (31,808)
   end=stop.get(n,nextstart)
   selected=[a for a in alts if (sid,y)<=(a[1],a[2])<end]
   assert [a[0] for a in selected]==list('ABCD'),(n,idioma,selected)
   if n in [26,31]:
    adjusted=[]
    for letter,as_id,ay in selected:
     delta=22 if n==26 else 14 if letter in 'AB' else 4
     pg=as_id//2; x0,x1=bounds(pg,as_id%2)
     adjusted.append((letter,as_id,ajustar_limite(doc.pages[pg],x0,x1,ay-delta)))
    selected=adjusted
   stem=ranges((sid,y),(selected[0][1],selected[0][2]))
   opts=[ranges((a[1],a[2]),(selected[j+1][1],selected[j+1][2]) if j<3 else end) for j,a in enumerate(selected)]
   if n==14:
    stem=[(7,(32,223,283,284)),(7,(32,284,184,370)),(7,(185,284,283,384))]
    opts=[[(pg,(b[0],b[1],180,b[3])) for pg,b in parts] for parts in opts]
   ident='ifpr-2019-'+( ('ing-' if idioma=='Inglês' else 'esp-') if idioma else '')+f'{n:02d}'
   materia=('Língua Inglesa' if idioma=='Inglês' else 'Língua Espanhola') if idioma else next(s for lim,s in [(10,'Língua Portuguesa'),(14,'Física'),(18,'Química'),(22,'Biologia'),(33,'Matemática'),(36,'Geografia'),(40,'História'),(42,'Sociologia'),(45,'Filosofia')] if n<=lim)
   content={3:'Variação linguística',4:'Interpretação de textos',5:'Gêneros textuais',6:'Interpretação de textos',7:'Interpretação de textos',8:'Intertextualidade',9:'Interpretação de textos',10:'Gêneros literários',11:'Termologia',12:'Eletricidade',13:'Cinemática',14:'Óptica',15:'Química orgânica',16:'Tabela periódica',17:'Cinética química',18:'Equilíbrio iônico',19:'Ciclos biogeoquímicos',20:'Genética',21:'Imunologia',22:'Citologia',23:'Geometria espacial',24:'Equações',25:'Geometria plana',26:'Matrizes',27:'Função exponencial',28:'Trigonometria',29:'Geometria plana',30:'Geometria espacial',31:'Trigonometria',32:'Progressões',33:'Matemática financeira'}.get(n,'Interpretação de textos' if materia.startswith('Língua') else materia)
   opcoes=[re.sub(r'^[A-D]\)\s*','',text(p)) or f'Alternativa {chr(65+j)} — consulte a imagem.' for j,p in enumerate(opts)]
   if n==31:opcoes=['1 − √3/2','2 − 2√3/3','2 − √3','1']
   chosen=[{k:v for k,v in sup.items() if k!='nums'} for sup in support.values() if n in sup['nums']]
   answer=answers[n]
   records.append(dict(id=ident,ano=2019,banca='IFPR',concurso='Processo Seletivo IFPR 2019 — Graduação',numero_original=n,materia=materia,conteudo=content,dificuldade='Médio',dificuldade_estimada=True,enunciado=text(stem),opcoes=opcoes,resposta_correta=ord(answer)-65,imagem_original=save(stem,ident+'-enunciado'),opcoes_imagens=[save(p,ident+'-'+chr(65+j)) for j,p in enumerate(opts)],imagem_sem_alternativas=True,texto_extraido_corrompido=True,opcoes_texto_corrompido=[True]*4,apoio=chosen,fonte_pdf=SOURCE,fonte_gabarito=KEY_SOURCE,pagina=sid//2+1,organizadora='FUNTEF-PR',data_aplicacao='2018-10-14',**({'idioma':idioma,'modelo':idioma,'duplicata_oficial':True} if idioma else {})))
  assert len(records)==55
  (DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
  print('IFPR 2019 completo: 55 registros')
if __name__=='__main__':main()
