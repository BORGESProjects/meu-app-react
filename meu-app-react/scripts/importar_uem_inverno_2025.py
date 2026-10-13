"""Importação do caderno oficial, incluindo questões que continuam na outra coluna."""
import json
import re
import io
import os
import time
from collections import OrderedDict
from pathlib import Path
import pdfplumber
from PIL import Image
from completar_uem_2025 import ajustar_limite

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/acervo/uem-2025-inverno'
PDF=ROOT/'tmp/pdfs/uem-in25/prova.pdf'
KEY=[15,11,31,25,23,27,15,13,10,24,None,None,None,None,23,13,27,31,27,23,14,21,27,15,7,21,23,19,5,27,20,26,15,4,16,11,18,13,27,3,5,28,3,19,3,21,23,19,29,28]
LANG={'Espanhol':[18,21,24,3],'Francês':[10,11,26,21],'Inglês':[13,24,11,17]}
MIRROR=False
TRIMS={(7,True,4):289}
CONTINUATIONS={(15,False),(17,False)}
SKIP_SIDES=set()
LANG_START=11
ID_EXTRA=''
AUTO_CONTINUATIONS=False
IMAGE_CACHE=OrderedDict()

def image(parts,name):
    images=[]
    for p,box in parts:
        if p not in IMAGE_CACHE:
            rendered=p.to_image(resolution=190)
            IMAGE_CACHE[p]=(rendered.original.convert('RGB'),rendered.scale)
            if len(IMAGE_CACHE)>12:IMAGE_CACHE.popitem(last=False)
        IMAGE_CACHE.move_to_end(p)
        original,scale=IMAGE_CACHE[p]
        images.append(original.crop(tuple(int(value*scale) for value in box)))
    canvas=Image.new('RGB',(max(i.width for i in images),sum(i.height for i in images)+10*(len(images)-1)),'white')
    y=0
    for im in images: canvas.paste(im,(0,y)); y+=im.height+10
    encoded=io.BytesIO()
    canvas.save(encoded,'WEBP',quality=92,method=2)
    target=DEST/(name+'.webp')
    temporary=target.with_suffix('.webp.tmp')
    for attempt in range(3):
        try:
            temporary.write_bytes(encoded.getvalue())
            os.replace(temporary,target)
            break
        except OSError:
            if attempt==2:raise
            time.sleep(0.15)
    return '/acervo/'+DEST.name+'/'+name+'.webp'

def col(page,left):
    a,b=(34,301) if left else (318,580)
    if MIRROR and page.page_number % 2 == 0: a-=17; b-=17
    crop=page.crop((a,22,b,795))
    words=crop.extract_words(x_tolerance=2,y_tolerance=3)
    heads=[(int(words[i+1]['text'].split('/')[0]),w['top']) for i,w in enumerate(words[:-1]) if w['text']=='Questão' and re.fullmatch(r'\d{2}(?:/\d{2})?',words[i+1]['text'])]
    return a,b,words,heads

def questions(pdf,pages,idioma=None):
    records=[]; current=None
    for pn in pages:
        p=pdf.pages[pn-1]
        footer=[r['top']-2 for r in p.rects if r['top']>760 and 15<r['width']<35 and 18<r['height']<30 and r.get('non_stroking_color') in (0.878,0.87843)]
        pagebottom=min([795,*footer])
        for left in (True,False):
            if (pn,left) in SKIP_SIDES: continue
            a,b,words,heads=col(p,left)
            # Antes do primeiro título só existe continuação nas questões 17 e 27.
            segments=[]
            orphan_markers=any(re.fullmatch(r'(01|02|04|08|16)\)',w['text']) and w['x0']<a+12 and w['top']<(heads[0][1] if heads else pagebottom) for w in words)
            if current and ((pn,left) in CONTINUATIONS or AUTO_CONTINUATIONS and orphan_markers) and (not heads or heads[0][1]>100):
                segments.append((None,22,heads[0][1]-5 if heads else pagebottom))
            for i,(n,top) in enumerate(heads):
                end=heads[i+1][1]-5 if i+1<len(heads) else pagebottom
                end=TRIMS.get((pn,left,n),end)
                segments.append((n,top-2,end))
            for n,start,end in segments:
                if n is not None:
                    if current: records.append(current)
                    current=dict(n=n,pagina=pn,stem=[],options=[[] for _ in range(5)],text=['' for _ in range(6)],index=-1)
                ws=[w for w in words if start<=w['top']<end]
                markers=[w for w in ws if re.fullmatch(r'(01|02|04|08|16)\)',w['text']) and w['x0']<a+12]
                # A extração de palavras pode juntar uma fórmula da linha anterior ao rótulo.
                # Reconstrua os rótulos pela linha e pela fonte original, sem alterar a imagem.
                groups={}
                for c in p.chars:
                    if a<=c['x0']<a+20 and start<=c['top']<end:
                        groups.setdefault((round(c['top'],1),c['fontname']),[]).append(c)
                for chars in groups.values():
                    text=''.join(c['text'] for c in sorted(chars,key=lambda c:c['x0'])).replace(' ','')
                    m=re.match(r'^(01|02|04|08|16)\)',text)
                    if m and not any(w['text']==m[0] and abs(w['top']-chars[0]['top'])<3 for w in markers):
                        markers.append(dict(text=m[0],top=chars[0]['top'],x0=min(c['x0'] for c in chars)))
                markers.sort(key=lambda w:w['top'])
                if not current: continue
                bounds=[(start,current['index'])]
                for m in markers:
                    idx=['01)','02)','04)','08)','16)'].index(m['text'])
                    bounds.append((ajustar_limite(p,a,b,m['top']-1),idx))
                objects=[*p.chars,*p.images,*p.curves,*p.rects,*p.lines]
                maxbottom=max((c['bottom'] for c in objects if c['x1']>a and c['x0']<b and start<=c['top']<end and c['bottom']<=end),default=end)
                finish=min(end,maxbottom+3)
                for i,(top,idx) in enumerate(bounds):
                    bottom=bounds[i+1][0] if i+1<len(bounds) else finish
                    if bottom<=top+1: continue
                    box=(a,top,b,bottom)
                    parts=current['stem'] if idx==-1 else current['options'][idx]
                    parts.append((p,box))
                    current['text'][idx+1]+='\n'+(p.within_bbox(box).extract_text() or '')
                current['index']=bounds[-1][1]
    if current: records.append(current)
    out=[]
    for r in records:
        n=r['n']; suffix='-'+{'Inglês':'en','Espanhol':'es','Francês':'fr'}[idioma] if idioma else ''
        ident=f'{DEST.name}{ID_EXTRA}-{n:02d}'+suffix
        assert all(r['options']),ident
        resposta=LANG[idioma][n-LANG_START] if idioma else KEY[n-1]
        materia=('Língua '+{'Inglês':'Inglesa','Espanhol':'Espanhola','Francês':'Francesa'}[idioma]) if idioma else ('Língua Portuguesa' if n<=7 else 'Literatura' if n<=10 else 'Arte' if n<=17 else 'Educação Física' if n<=20 else 'Filosofia' if n<=24 else 'Sociologia' if n<=25 else 'História' if n<=28 else 'Geografia' if n<=30 else 'Matemática' if n<=40 else 'Biologia' if n<=44 else 'Química' if n<=47 else 'Física')
        textos=[re.sub(r'^\s*(01|02|04|08|16)\)\s*','',t.strip()) or f'Afirmação {2**i:02d}: consulte a imagem oficial.' for i,t in enumerate(r['text'][1:])]
        # Matrizes e outras fontes matemáticas podem desaparecer na extração textual.
        # Os recortes são a fonte visual; nunca trate textos incompletos iguais como opções iguais.
        for i, texto in enumerate(textos[:]):
            if textos.count(texto) > 1 or len(texto.strip()) < 3:
                textos[i] = f'Afirmação {2**i:02d}: consulte a imagem oficial.'
        enunciado=r['text'][0].strip()
        q=dict(id=ident,ano=2025,banca='UEM',concurso='Vestibular de Inverno UEM 2025',numero_original=n,materia=materia,
               conteudo={'Língua Portuguesa':'Interpretação de textos','Literatura':'Literatura brasileira','Arte':'Arte e cultura','Educação Física':'Saúde e cultura corporal','Filosofia':'Filosofia política','Sociologia':'Sociedade e cultura','História':'História do Brasil','Geografia':'Geografia física','Matemática':'Matemática','Biologia':'Biologia','Química':'Química','Física':'Física'}.get(materia,'Interpretação de textos'),
               dificuldade='Médio',dificuldade_estimada=True,enunciado=enunciado,opcoes=textos,
               texto_extraido_corrompido=True,opcoes_texto_corrompido=[True]*5,
               imagem_original=image(r['stem'],ident+'-enunciado'),opcoes_imagens=[image(parts,ident+'-'+str(2**i).zfill(2)) for i,parts in enumerate(r['options'])],
               imagem_sem_alternativas=True,rotulos_opcoes=['01','02','04','08','16'],valores_opcoes=[1,2,4,8,16],tipo_resposta='somatoria',resposta_soma=resposta,resposta_correta=resposta,
               fonte_pdf='https://www.vestibular.uem.br/provas/in25/P1.pdf',fonte_gabarito='https://www.vestibular.uem.br/provas/in25/gabdef.pdf',pagina=r['pagina'])
        if idioma: q['idioma']=idioma
        out.append(q)
    return out

def main():
    DEST.mkdir(parents=True,exist_ok=True)
    with pdfplumber.open(PDF) as pdf:
        records=questions(pdf,[6,7,8,9])+questions(pdf,list(range(15,24)))
        text1=[(pdf.pages[5],(34,22,301,795))]
        text2=[(pdf.pages[6],(34,293,301,795)),(pdf.pages[6],(318,22,580,182))]
        supports={1:[dict(imagem=image(text1,'texto1'),texto='Texto 1 integral')],2:[dict(imagem=image(text2,'texto2'),texto='Texto 2 integral')]}
        for q in records:
            if q['numero_original']<=4: q['apoio']=supports[1]
            elif q['numero_original']<=6: q['apoio']=supports[2]
            elif q['numero_original']==7: q['apoio']=supports[1]+supports[2]
        for idioma,first,last in [('Espanhol',9,10),('Francês',11,12),('Inglês',13,14)]:
            parts=[(pdf.pages[first-1],(318,22,580,795))]
            if idioma=='Inglês': parts.append((pdf.pages[13],(34,22,301,137)))
            apoio=[dict(imagem=image(parts,'apoio-'+idioma),texto='Texto-base completo de '+idioma)]
            itens=questions(pdf,[last],idioma)
            assert len(itens)==4
            for q in itens: q['apoio']=apoio
            records.extend(itens)
        for n in [2,3,24]:
            p=pdf.pages[n-1]; url=image([(p,(20,20,p.width-20,p.height-30))],'formulario-'+str(n))
            for q in records:
                if q['materia']=={2:'Física',3:'Matemática',24:'Química'}[n]: q.setdefault('apoio',[]).append(dict(imagem=url,texto='Material de consulta fornecido no caderno'))
    assert len(records)==58,len(records)
    assert len(set(q['id'] for q in records))==58
    (DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('Inverno 2025: 58 registros completos')

if __name__=='__main__': main()
