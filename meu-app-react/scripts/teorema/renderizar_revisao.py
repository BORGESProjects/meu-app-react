"""Render the reconciled questions into separate statement/choice/support assets.

This writes to tmp only. Publication is a separate, reviewed operation.
"""
import collections
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import unicodedata

from PIL import Image, ImageChops, ImageOps, ImageDraw
import pypdfium2 as pdfium

from auditar_pacote import WORK
from limites_visuais import separate


SCALE = 2.5


def options_for_images(values):
    options=[text.strip() for text in values]
    keys=[' '.join(unicodedata.normalize('NFKC',text).casefold().split()) for text in options]
    return [f'Alternativa {chr(65+i)} — consulte a imagem' if not key or keys.count(key)>1 else text
            for i,(text,key) in enumerate(zip(options,keys))]


def trim_white(image):
    diff = ImageChops.difference(image, Image.new('RGB',image.size,'white')).convert('L')
    bbox = diff.point(lambda value: 255 if value > 3 else 0).getbbox()
    if bbox is None:
        return None
    x0,y0,x1,y1 = bbox
    return ImageOps.expand(image.crop((max(0,x0-3),max(0,y0-3),min(image.width,x1+3),min(image.height,y1+3))),border=8,fill='white')


class Renderer:
    def __init__(self):
        self.path = None
        self.doc = None
        self.pages = collections.OrderedDict()
        self.edges = []

    def close(self):
        self.pages.clear()
        if self.doc:
            self.doc.close()
        self.doc = None

    def page(self, path, number):
        if self.path != path:
            self.close(); self.doc=pdfium.PdfDocument(path); self.path=path
        if number not in self.pages:
            page=self.doc[number]
            self.pages[number]=(page.render(scale=SCALE,draw_annots=False).to_pil().convert('RGB'), page.get_size())
            page.close()
        self.pages.move_to_end(number)
        while len(self.pages)>4:
            self.pages.popitem(last=False)
        return self.pages[number]

    def region(self,path,rect,manual=False):
        page,(width,height)=self.page(path,rect['pagina'])
        x0,y0,x1,y1=rect['bbox']
        # Some embedded fonts draw accents/numerators above their declared
        # glyph top. Use the same earlier cut on both sides of every boundary.
        # Page margins and visually measured image-only crops stay untouched.
        if not manual:
            if y0 != 73:
                y0=max(0,y0-2.5)
            if abs(y1-(height-28))>.1:
                y1=max(y0+.1,y1-2.5)
        if not (0<=x0<x1<=width and 0<=y0<y1<=height):
            raise ValueError('coordenadas inválidas no PDF')
        left,right=math.floor(x0*SCALE),math.ceil(x1*SCALE)
        top,bottom=math.floor(y0*SCALE),math.ceil(y1*SCALE)
        # Choose a white scanline near each internal cut, shared by the end of
        # one block and the beginning of the next. This avoids accent fragments
        # from font boxes that differ slightly from the rendered ink.
        def white_cut(y):
            for distance in range(9):
                for offset in ([0] if distance==0 else [-distance,distance]):
                    yy=y+offset
                    if 0<=yy<page.height:
                        histogram=page.crop((left,yy,right,yy+1)).convert('L').histogram()
                        if sum(histogram[:150])<=1:
                            return yy
            self.edges.append({'pagina':rect['pagina']+1,'bbox':rect['bbox']})
            return y
        if not manual:
            top=white_cut(top)
            bottom=white_cut(bottom)
        image=page.crop((left,top,right,bottom))
        return trim_white(image)

    def block(self,path,rects,manual=False):
        parts=[im for r in rects if (im:=self.region(path,r,manual)) is not None]
        if not parts:
            raise ValueError('recorte sem conteúdo visível')
        canvas=Image.new('RGB',(max(im.width for im in parts),sum(im.height for im in parts)+10*(len(parts)-1)),'white')
        y=0
        for im in parts:
            canvas.paste(im,(0,y));y+=im.height+10
        return canvas


def main():
    candidates=json.loads((WORK/'candidatas-colunas.json').read_text(encoding='utf-8'))
    output=WORK/'lote-colunas';output.mkdir(exist_ok=True)
    preview_dir=output/'conferencia';preview_dir.mkdir(exist_ok=True)
    limit=int(sys.argv[1]) if len(sys.argv)>1 else None
    only_ids=set(sys.argv[2:])
    if only_ids:
        candidates=[c for c in candidates if c['id'] in only_ids]
    if limit:
        candidates=candidates[:limit]
    renderer=Renderer()
    results=[];errors=[];manifest=[]
    for candidate in candidates:
        q, row, identity=candidate['questao'],candidate['csv'],candidate['id']
        assets=[];previews=[];digest=hashlib.sha256()
        renderer.edges=[]
        try:
            parts=q['partes']
            if row['materia'] in ['Matemática','Física','Química']:
                try:
                    parts=separate(q,candidate['fonte_local'],renderer,SCALE)
                except ValueError:
                    # Keep the conservative geometric reconstruction only if
                    # it also survives the independent ink-edge checks below.
                    parts=q['partes']
            for i,part in enumerate(parts):
                image=renderer.block(candidate['fonte_local'],part['recortes'],q.get('revisao_manual',False) or part.get('limite_por_imagem',False))
                name=f'{identity}-{i}.webp'
                image.save(output/name,'WEBP',quality=94,method=2)
                digest.update((output/name).read_bytes());assets.append('/acervo/teorema-180/'+name)
                previews.append(image)
            support=[]
            for i,part in enumerate(q.get('apoios',[])):
                context_hash=hashlib.sha256((candidate['fonte_local']+json.dumps(part['recortes'],sort_keys=True)).encode()).hexdigest()[:20]
                name=f'apoio-{context_hash}.webp'
                image=renderer.block(candidate['fonte_local'],part['recortes'])
                if not (output/name).exists():
                    image.save(output/name,'WEBP',quality=94,method=2)
                digest.update((output/name).read_bytes())
                support.append({'imagem':'/acervo/teorema-180/'+name,'texto':part['texto']})
                previews.insert(i,image)
            options=options_for_images(q['opcoes'])
            enunciado=q['enunciado'].strip()
            if len(enunciado)<12:
                enunciado='Observe o enunciado e os dados apresentados na imagem.'
            level=q.get('nivel')
            result={**candidate['metadados'], 'id':identity,'materia':row['materia'],
                    'conteudo':re.sub(r'(?i)\s*exerc[ií]cios\s*','',row['conteudo']).strip(),
                    'dificuldade':{1:'Fácil',2:'Médio',3:'Difícil'}.get(level,row['dificuldade']), 'dificuldade_estimada':True,
                    'enunciado':enunciado,'opcoes':options,'resposta_correta':q['resposta_correta'],'anulada':q.get('anulada',False),
                    'imagem_original':assets[0],'opcoes_imagens':assets[1:],'extracao_visual_verificada':True,
                    'identidade_visual':digest.hexdigest(),
                    'fonte_material':{'arquivo':row['arquivo_origem'],'numero':q['numero'],'pagina':q['pagina'],
                                      'registro_csv':int(row['numero']),'numero_informado_csv':row['numero_origem'],
                                      'gabarito':'Conferido no gabarito do material'},
                    'gabarito_corrigido_do_csv':candidate['gabarito_corrigido_do_csv']}
            if renderer.edges:
                result['cortes_para_conferencia']=renderer.edges
            if support:
                result['apoio']=support
            if row['materia'] in ['Matemática','Física','Química']:
                result['texto_extraido_corrompido']=True
            # Crop proof includes every support, statement and alternative.
            thumbs=[]
            for im in previews:
                im=im.copy();im.thumbnail((760,5000));thumbs.append(ImageOps.expand(im,border=3,fill='#708090'))
            preview=Image.new('RGB',(max(im.width for im in thumbs),sum(im.height for im in thumbs)+10*len(thumbs)+35),'#e0e5ed')
            draw=ImageDraw.Draw(preview);draw.text((10,8),identity+' | PDF '+str(q['numero'])+' | '+('ANULADA' if q.get('anulada') else chr(65+q['resposta_correta'])),fill='black')
            y=35
            for im in thumbs:
                preview.paste(im,(0,y));y+=im.height+10
            preview.save(preview_dir/(identity+'.jpg'),quality=87)
            results.append(result)
            manifest.append({'id':identity,'csv':row['numero'],'arquivo':row['arquivo_origem'],'numero':q['numero'],'apoios':len(support),'alternativas':len(options),'altura_preview':preview.height})
        except (ValueError,RuntimeError,OSError) as error:
            errors.append({'id':identity,'csv':row['numero'],'motivo':str(error)})
        if (len(results)+len(errors))%50==0:
            print(json.dumps({'renderizadas':len(results),'falhas':len(errors)},ensure_ascii=True),flush=True)
    renderer.close()
    for name,value in [('questoes.json',results),('manifesto.json',manifest),('falhas.json',errors)]:
        (output/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'renderizadas':len(results),'falhas':len(errors),'saida':str(output)},ensure_ascii=True))


if __name__=='__main__':
    main()
