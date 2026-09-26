"""Separa enunciados e alternativas diretamente das coordenadas do PDF original."""
import json
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/acervo/enem-2022'

def separar():
    questions = json.loads((ROOT/'src/data/enem2022.json').read_text(encoding='utf-8'))
    audits = {q['id']:q for q in json.loads((ROOT/'tmp/enem2022/audit.json').read_text(encoding='utf-8'))}
    pages = {d:json.loads((ROOT/f'tmp/enem2022/d{d}-pages.json').read_text(encoding='utf-8')) for d in (1,2)}
    docs = {d:pdfium.PdfDocument(str(ASSETS/f'prova-dia{d}.pdf')) for d in (1,2)}
    rendered = {}
    def picture(day, regions, name, compact=False):
        chunks = []
        for pn,left,top,right,bottom in regions:
            if bottom <= top: continue
            key = day,pn
            if key not in rendered:
                rendered[key] = docs[day][pn-1].render(scale=2.5).to_pil().convert('RGB')
            crop = rendered[key].crop(tuple(round(v*2.5) for v in (left,top,right,bottom)))
            ink = ImageChops.invert(crop).convert('L').point(lambda p:255 if p>50 else 0).getbbox()
            if ink:
                chunks.append(crop.crop((max(0,ink[0]-6) if compact else 0,max(0,ink[1]-5),min(crop.width,ink[2]+6) if compact else crop.width,min(crop.height,ink[3]+6))))
        assert chunks,name
        image = Image.new('RGB',(max(c.width for c in chunks),sum(c.height for c in chunks)+12*(len(chunks)-1)),'white')
        y=0
        for chunk in chunks:
            image.paste(chunk,(0,y)); y+=chunk.height+12
        image.save(ASSETS/name,'WEBP',quality=92)
        return '/acervo/enem-2022/'+name
    review=[]
    text_options={
        108:['1,8 g L⁻¹','2,4 g L⁻¹','3,6 g L⁻¹','4,8 g L⁻¹','9,6 g L⁻¹'],
        117:['H₂','O₂','CO₂','CO','Cl₂'],
        129:['N₂','NH₃','NH₄⁺','NO₂⁻','NO₃⁻'],
        137:['35/64','40/64','42/64','44/64','52/64'],
        141:['1/46 + 1/45','1/46 + 2/(46 × 45)','1/46 × 8/(46 × 45)','1/46 × 43/(46 × 45)','1/46 × 49/(46 × 45)'],
        148:['Lₑ = L𝒻/2','Lₑ = L𝒻/4','Lₑ = L𝒻','Lₑ = 4L𝒻','Lₑ = 8L𝒻'],
        155:['9 × 6!/(6 − 2)!','9 × 6!/[(6 − 2)! × 2!]','9 × 4!/[(4 − 2)! × 2!]','9 × 2!/[(2 − 2)! × 2!]','9 × {8!/[(8 − 2)! × 2!] − 1}'],
        157:['S(q) = 675 + 12q','S(q) = 325 + 12q','S(q) = 675 + 7q','S(q) = 625 + 5q, se q ≤ 50; 925 + 7q, se q > 50','S(q) = 625 + 5q, se q ≤ 50; 575 + 7q, se q > 50'],
        159:['T₃ R T₄ R R T₅ R.','R T₃ R T₄ R R T₅.','R T₄ R R T₅ R T₁.','R R T₅ R T₁ R R.','R T₅ R T₁ R R T₂.'],
    }
    for q in questions:
        regions=audits[q['id']]['regioes']
        markers=[]
        for ri,(pn,left,top,right,bottom) in enumerate(regions):
            for c in pages[q['dia']][pn-1]['chars']:
                if 'Bundesbahn' in c['fontname'] and c['text'] in 'ABCDE' and left<=c['x0']<right and top<=c['top']<bottom:
                    markers.append(dict(c,region=ri))
        markers=list({(m['text'],m['region'],round(m['top'],1),round(m['x0'],1)):m for m in markers}.values())
        assert sorted(m['text'] for m in markers)==list('ABCDE'),(q['id'],markers)
        # Letras ficam centralizadas ao lado de figuras e frações. Limites revistos no PDF,
        # em pontos acima da letra; não cortar pelo topo da letra nesses casos.
        offsets={95:66,96:18,103:85,106:25,137:7,141:9,143:26,148:8,155:13,156:60,160:22,180:30}
        for m in markers:
            offset=offsets.get(q['numero_original'],3) if q['dia']==2 else 3
            if q['numero_original']==96 and m['text']=='E': offset=37
            if q['numero_original']==103 and m['text']=='D': offset=78
            m['crop_top']=max(regions[m['region']][2],m['top']-offset)
        first=min(markers,key=lambda m:(m['region'],m['crop_top']))
        enunciado=[r[:] for r in regions[:first['region']+1]]
        enunciado[-1][-1]=first['crop_top']
        q['imagem_original']=picture(q['dia'],enunciado,q['id']+'-enunciado.webp')
        q['imagem_sem_alternativas']=True
        if q['dia']==2 and q['numero_original'] in text_options:
            q['opcoes']=text_options[q['numero_original']]
            q.pop('opcoes_imagens',None)
        if q.get('opcoes_imagens') or any('conforme a imagem' in op for op in q['opcoes']):
            q['opcoes_imagens']=[]
            for letter in 'ABCDE':
                m=next(m for m in markers if m['text']==letter)
                ri=m['region']; pn,left,top,right,bottom=regions[ri]
                # Alternativas podem ocupar duas colunas mesmo numa questão de largura inteira.
                following_columns=[o['x0']-6 for o in markers if o['region']==ri and o['x0']>m['x0']+40]
                right=min(following_columns,default=right)
                below=[o['crop_top']-2 for o in markers if o['region']==ri and abs(o['x0']-m['x0'])<20 and o['top']>m['top']+5]
                bottom=min(below,default=bottom)
                bounds=[pn,m['x1']+3,m['crop_top'],right,bottom]
                q['opcoes_imagens'].append(picture(q['dia'],[bounds],q['id']+'-'+letter+'.webp',compact=True))
            q['opcoes']=['Alternativa '+letter for letter in 'ABCDE']
        # O texto acessível também termina antes das alternativas, inclusive nas questões visuais.
        import re
        q['enunciado']=re.split(r'(?m)^AA\s*',q['enunciado'],maxsplit=1)[0].strip()
        review.append(dict(id=q['id'],enunciado=enunciado,marcadores=markers))
    (ROOT/'src/data/enem2022.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'tmp/enem2022/recortes.json').write_text(json.dumps(review,ensure_ascii=False),encoding='utf-8')
    print('185 enunciados separados; alternativas visuais nos botões de resposta.')

if __name__=='__main__': separar()
