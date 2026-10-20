"""Remove isolated personal watermark draw operations, leaving question ink.

Original PDFs are never edited. Painting a white rectangle over a watermark
would hide the question below it, so only the isolated email/CPF text operation
is removed. Pending redaction outlines are hidden after the watermark is gone.
"""
import hashlib
import json
import re
from auditar_pacote import WORK

EMAIL=re.compile(r'[^\s@]+@[^\s@]+\.[^\s@]+')
CPF=re.compile(r'\d{3}\.\d{3}\.\d{3}-\d{2}')


def watermark(args,operation):
    if operation not in [b'Tj',b'TJ',b"'",b'"']:
        return False
    values=args[0] if operation==b'TJ' else args
    text=''.join(str(v) for v in values if isinstance(v,str)).strip()
    return len(text)<180 and bool(EMAIL.fullmatch(text) or CPF.fullmatch(text))


def main():
    import ctypes
    import pypdfium2 as pdfium
    original=WORK/'fontes-originais.json'
    if not original.exists():
        original.write_bytes((WORK/'fontes.json').read_bytes())
    sources=json.loads(original.read_text(encoding='utf8'))
    output=WORK/'fontes-higienizadas';output.mkdir(exist_ok=True)
    prior=WORK/'higienizacao.json'
    only={r['arquivo'] for r in json.loads(prior.read_text(encoding='utf8')) if r['operacoes_pessoais_removidas']} if prior.exists() else None
    result={};report=[]
    for name,paths in sources.items():
        removed=0
        if only is None or name in only:
            doc=pdfium.PdfDocument(paths[0])
            for page in doc:
                textpage=page.get_textpage();targets=[]
                for obj in page.get_objects(filter=[pdfium.raw.FPDF_PAGEOBJ_TEXT]):
                    size=pdfium.raw.FPDFTextObj_GetText(obj,textpage,None,0)
                    if size<=2 or size>360:
                        continue
                    buffer=(ctypes.c_ushort*(size//2))()
                    pdfium.raw.FPDFTextObj_GetText(obj,textpage,buffer,size)
                    text=bytes(buffer).decode('utf-16-le').rstrip('\0').strip()
                    if EMAIL.fullmatch(text) or CPF.fullmatch(text):
                        targets.append(obj)
                textpage.close()
                for obj in targets:
                    page.remove_obj(obj);obj.close();removed+=1
                if targets:
                    page.gen_content()
                page.close()
            if removed:
                clean=output/(hashlib.sha256(name.encode()).hexdigest()[:16]+'.pdf')
                doc.save(str(clean))
                result[name]=[str(clean.resolve())]
            doc.close()
        if not removed:
            result[name]=paths
        report.append({'arquivo':name,'operacoes_pessoais_removidas':removed})
    for name,data in [('fontes.json',result),('higienizacao.json',report)]:
        (WORK/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'fontes':len(result),'documentos_higienizados':sum(r['operacoes_pessoais_removidas']>0 for r in report),'operacoes_removidas':sum(r['operacoes_pessoais_removidas'] for r in report)}))


if __name__=='__main__':
    main()
