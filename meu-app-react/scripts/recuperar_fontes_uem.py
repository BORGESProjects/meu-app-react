"""Recupera Unicode de fontes sem ToUnicode comparando contornos, sem OCR/IA.

Requer fonttools (pip install fonttools). As imagens do PDF continuam canônicas.
O mapa é apenas um auxílio à segmentação e classificação, nunca altera o PDF.
"""
import io
import json
import sys
from pathlib import Path
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tmp/vendor'))
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen

def outlines(tt):
    gs=tt.getGlyphSet()
    for i,name in enumerate(tt.getGlyphOrder()):
        pen=DecomposingRecordingPen(gs);gs[name].draw(pen)
        yield i,name,repr(pen.value)

def main():
    refs={}
    for filename in ['times.ttf','timesbd.ttf','timesi.ttf','timesbi.ttf','arial.ttf','arialbd.ttf','ariali.ttf','arialbi.ttf','symbol.ttf']:
        path=Path('C:/Windows/Fonts')/filename
        if not path.exists():continue
        tt=TTFont(path);names={name:chr(code) for code,name in (tt.getBestCmap() or {}).items() if code<10000}
        for _,name,key in outlines(tt):
            if name in names:refs.setdefault(key,names[name])
    result={}
    for path in (ROOT/'tmp/pdfs/uem-historico/in19').glob('P*.pdf'):
        maps={};reader=PdfReader(path)
        for p in reader.pages:
            for ref in p['/Resources']['/Font'].values():
                f=ref.get_object()
                if not f.get('/BaseFont'):continue
                name=str(f['/BaseFont']).lstrip('/')
                if name in maps or f.get('/ToUnicode') or f.get('/Encoding')!='/Identity-H':continue
                desc=f.get('/DescendantFonts',[f])[0].get_object();fd=desc.get('/FontDescriptor')
                if not fd:continue
                stream=fd.get_object().get('/FontFile2')
                if not stream:continue
                try:
                    tt=TTFont(io.BytesIO(stream.get_object().get_data()))
                    maps[name]={str(i):refs[key] for i,_,key in outlines(tt) if key in refs}
                except Exception as exc:
                    print(path.name,name,type(exc).__name__,flush=True)
                    maps[name]={}
        result[path.name]=maps
        print(path.name,sum(len(m) for m in maps.values()),flush=True)
    (ROOT/'tmp/uem-fontmaps.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')

if __name__=='__main__':main()
