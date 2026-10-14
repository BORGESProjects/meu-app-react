"""Completa o caderno IFPR 2020 preservando colunas, imagens e dois idiomas."""
import json,re
from pathlib import Path
import pdfplumber
from PIL import Image
from completar_uem_2025 import ajustar_limite
from importar_ifpr_2020 import clean,SOURCE,KEY_SOURCE,ROOT,DEST

EN=list('CBCDA'); ES=list('ACBBD')

def main():
 with pdfplumber.open(ROOT/'tmp/ifpr2020-gabarito.pdf') as keypdf:
  t=keypdf.pages[0].extract_text()
  assert 'DEFINITIVO' in t and 'ENSINO SUPERIOR' in t
  common={int(n):l for n,l in re.findall(r'\b(\d{2})\s+([A-D])\b',t) if int(n)<=45}
  assert len(common)==45
 with pdfplumber.open(ROOT/'tmp/ifpr2020-graduacao.pdf') as doc:
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
   return '/acervo/ifpr-2020/'+name+'.webp'
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
  assert [m[0] for m in markers]==list(range(1,51))+list(range(46,51))
  # Shared supports are excluded from the preceding question.
  stop={22:(17,720),7:(9,445),8:(10,760),10:(12,739),33:(21,315),45:(27,634),50:(29,450)}
  # English q50 and Spanish q48 require separate boundaries.
  support={}
  for name,nums,parts in [
   ('poema-em-linha-reta',range(1,5),[(3,box(3,0,92,733))]),
   ('apoio-portugues-09-10',[9,10],[(6,box(6,0,43,254))]),
   ('apoio-ingles-46-50',range(46,51),[(14,box(14,0,247,678))]),
   ('apoio-espanhol-46-48',range(46,49),[(14,box(14,1,503,805)),(15,box(15,0,45,214))]),
   ('apoio-espanhol-49-50',[49,50],[(15,box(15,1,183,374))])]:
   support[name]={'imagem':save(parts,name),'texto':text(parts),'nums':list(nums)}
  records=[]
  for idx,(n,sid,y) in enumerate(markers):
   idioma='Inglês' if n>=46 and idx<50 else 'Espanhol' if idx>=50 else None
   nextstart=(markers[idx+1][1],markers[idx+1][2]-3) if idx+1<len(markers) else (31,660)
   if n==50 and idioma=='Inglês':end=(29,450)
   elif n==48 and idioma=='Espanhol':end=(31,175)
   elif n in stop and not idioma:end=stop[n]
   else:end=nextstart
   selected=[a for a in alts if (sid,y)<=(a[1],a[2])<end]
   assert [a[0] for a in selected]==list('ABCD'),(n,idioma,selected)
   if n==19:
    selected=[(l,as_id,ay-4 if l in 'AC' else ay) for l,as_id,ay in selected]
   if n in [27,29] or (n==32):
    adjusted=[]
    for letter,as_id,ay in selected:
     delta=18 if n==27 else 14 if n==29 else 14 if letter in 'CD' else 4
     pg=as_id//2; x0,x1=bounds(pg,as_id%2)
     adjusted.append((letter,as_id,ajustar_limite(doc.pages[pg],x0,x1,ay-delta)))
    selected=adjusted
   if n==8:
    stem=[(5,(32,45,548,90))]
    opts=[[(5,(32,a,548,b))] for a,b in [(90,237),(238,401),(405,561),(565,760)]]
   else:
    stem=ranges((sid,y),(selected[0][1],selected[0][2]))
    opts=[ranges((a[1],a[2]),(selected[j+1][1],selected[j+1][2]) if j<3 else end) for j,a in enumerate(selected)]
   if n==19:
    stem=[(8,(46,363,297,483)),(8,(46,491,155,582)),(8,(155,480,297,610))]
    opts=[[(pg,(b[0],b[1],150,b[3])) for pg,b in parts] for parts in opts]
   ident='ifpr-2020-'+( ('ing-' if idioma=='Inglês' else 'esp-') if idioma else '')+f'{n:02d}'
   materia= ('Língua Inglesa' if idioma=='Inglês' else 'Língua Espanhola') if idioma else next(s for lim,s in [(10,'Língua Portuguesa'),(15,'Biologia'),(18,'Química'),(22,'Física'),(33,'Matemática'),(36,'Geografia'),(39,'História'),(43,'Filosofia'),(45,'Sociologia')] if n<=lim)
   content={5:'Concordância nominal',6:'Concordância verbal',7:'Variação linguística',8:'Intertextualidade',9:'Coesão e coerência',10:'Regência',11:'Ecologia',12:'Metabolismo celular',13:'Evolução',14:'Biotecnologia',15:'Equilíbrio químico',16:'Ligações químicas',17:'Química orgânica',18:'Química orgânica',19:'Estática',20:'Gravitação',21:'Calorimetria',22:'Dinâmica',23:'Geometria espacial',24:'Trigonometria',25:'Funções',26:'Geometria plana',27:'Geometria analítica',28:'Sistemas lineares',29:'Matrizes',30:'Função exponencial',31:'Progressões',32:'Trigonometria',33:'Estatística'}.get(n,'Interpretação de textos' if materia.startswith('Língua') else materia)
   if n==15:materia='Química'
   opcoes=[re.sub(r'^[A-D]\)\s*','',text(p)) or f'Alternativa {chr(65+j)} — consulte a imagem.' for j,p in enumerate(opts)]
   if n==19:opcoes=['50√3 N.','50 N.','100√3 N.','150 N.']
   if n==8:opcoes=[f'Tirinha {chr(65+j)} — consulte a imagem.' for j in range(4)]
   chosen=[]
   for name,s in support.items():
    match=(name=='poema-em-linha-reta' and n<=4) or (name=='apoio-portugues-09-10' and n in [9,10]) or (name=='apoio-ingles-46-50' and idioma=='Inglês') or (name=='apoio-espanhol-46-48' and idioma=='Espanhol' and n<=48) or (name=='apoio-espanhol-49-50' and idioma=='Espanhol' and n>=49)
    if match:chosen.append({k:v for k,v in s.items() if k!='nums'})
   answer=(EN[n-46] if idioma=='Inglês' else ES[n-46]) if idioma else common[n]
   records.append(dict(id=ident,ano=2020,banca='IFPR',concurso='Processo Seletivo IFPR 2020 — Graduação',numero_original=n,materia=materia,conteudo=content,dificuldade='Médio',dificuldade_estimada=True,enunciado=text(stem),opcoes=opcoes,resposta_correta=ord(answer)-65,imagem_original=save(stem,ident+'-enunciado'),opcoes_imagens=[save(p,ident+'-'+chr(65+j)) for j,p in enumerate(opts)],imagem_sem_alternativas=True,texto_extraido_corrompido=True,opcoes_texto_corrompido=[True]*4,apoio=chosen,fonte_pdf=SOURCE,fonte_gabarito=KEY_SOURCE,pagina=sid//2+1,organizadora='FUNTEF-PR',data_aplicacao='2019-10-20',**({'idioma':idioma,'modelo':idioma,'duplicata_oficial':True} if idioma else {})))
  assert len(records)==55
  (DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
  print('IFPR 2020 completo: 55 registros')
if __name__=='__main__':main()
