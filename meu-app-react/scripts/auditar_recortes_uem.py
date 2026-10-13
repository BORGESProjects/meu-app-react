"""Verifica todos os WebP/links e gera folhas de conferência dos recortes UEM."""
import json
import sys
from pathlib import Path
from PIL import Image,ImageDraw

ROOT=Path(__file__).resolve().parents[1]

def run(folder, sheets=False):
    path=ROOT/'public/acervo'/folder
    records=json.loads((path/'questoes.json').read_text(encoding='utf8'))
    urls={url for q in records for url in [q.get('imagem_original'),*(q.get('opcoes_imagens') or []),*(a['imagem'] for a in q.get('apoio',[]))] if url}
    for url in urls:
        file=ROOT/'public'/url.lstrip('/')
        with Image.open(file) as image:
            image.verify()
        with Image.open(file) as image:
            assert image.width>10 and image.height>2,(folder,url,image.size)
    print(folder,len(records),len(urls),'imagens válidas',flush=True)
    if not sheets:return
    dest=ROOT/'tmp/auditoria-uem'/folder;dest.mkdir(parents=True,exist_ok=True)
    for start in range(0,len(records),5):
        panels=[]
        for q in records[start:start+5]:
            images=[Image.open(ROOT/'public'/url.lstrip('/')).convert('RGB') for url in [q['imagem_original'],*(q.get('opcoes_imagens') or [])]]
            scale=310/max(image.width for image in images)
            panel=Image.new('RGB',(330,30+sum(round(image.height*scale)+8 for image in images)),'#dddddd')
            ImageDraw.Draw(panel).text((3,3),q['id'],fill='black');y=30
            for image in images:
                image=image.resize((round(image.width*scale),round(image.height*scale)))
                panel.paste(image,(5,y));y+=image.height+8
            panels.append(panel)
        sheet=Image.new('RGB',(330*len(panels),max(panel.height for panel in panels)),'#dddddd')
        for i,panel in enumerate(panels):sheet.paste(panel,(330*i,0))
        sheet.save(dest/f'{start:03d}.png')

if __name__=='__main__':
    args=sys.argv[1:];sheets='--folhas' in args
    folders=[arg for arg in args if arg!='--folhas'] or [p.name for p in (ROOT/'public/acervo').glob('uem-*') if (p/'questoes.json').exists()]
    for folder in folders:run(folder,sheets)
