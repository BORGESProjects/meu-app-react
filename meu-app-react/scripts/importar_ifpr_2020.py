"""Primeiro lote IFPR 2020: questões 1–4 com o poema integral e gabarito definitivo."""
import json,re
from pathlib import Path
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/acervo/ifpr-2020'
SOURCE='https://arquivos.qconcursos.com/prova/arquivo_prova/77667/funtef-pr-2019-if-pr-vestibular-cursos-superiores-prova.pdf'
KEY_SOURCE='https://arquivos.qconcursos.com/prova/arquivo_gabarito/77667/funtef-pr-2019-if-pr-vestibular-cursos-superiores-gabarito.pdf'

def clean(s):
    return re.sub(r'(?<=\w)[\u0002\u00ad-]\n(?=\w)','',s).replace('\u0002','').strip()

def main():
    DEST.mkdir(parents=True,exist_ok=True)
    with pdfplumber.open(ROOT/'tmp/ifpr2020-gabarito.pdf') as pdf:
        text=pdf.pages[0].extract_text()
        assert 'DEFINITIVO' in text and 'ENSINO SUPERIOR' in text
        answers={int(n):letter for n,letter in re.findall(r'\b(\d{2})\s+([A-D])\b',text)}
        assert [answers[n] for n in range(1,5)]==list('CDBD')
    with pdfplumber.open(ROOT/'tmp/ifpr2020-graduacao.pdf') as pdf:
        p=pdf.pages[3]
        def save(box,name):
            p.crop(box).to_image(resolution=190).original.convert('RGB').save(DEST/(name+'.webp'),'WEBP',quality=92)
            return f'/acervo/ifpr-2020/{name}.webp'
        apoio=save((32,92,283,733),'poema-em-linha-reta')
        words=p.crop((296,43,548,805)).extract_words(x_tolerance=2,y_tolerance=3)
        heads=[(int(words[i+1]['text']),w['top']-3) for i,w in enumerate(words[:-1]) if w['text']=='QUESTÃO' and words[i+1]['text'].isdigit()]
        assert [n for n,_ in heads]==[2,3,4]
        records=[]
        for n in range(1,5):
            ident=f'ifpr-2020-{n:02d}'
            if n==1:
                stem=(32,735,283,767)
                markers=[w for w in words if w['text'] in ['B)','C)','D)']][:3]
                limits=[w['top']-0.7 for w in markers]
                boxes=[(32,767,283,808),*( (296,top,548,limits[i+1] if i<2 else heads[0][1]-3) for i,top in enumerate(limits))]
            else:
                start=next(y for num,y in heads if num==n)
                end=next((y-3 for num,y in heads if num==n+1),805)
                markers=[w for w in words if w['text'] in ['A)','B)','C)','D)'] and start<w['top']<end]
                assert [w['text'] for w in markers]==['A)','B)','C)','D)'],n
                limits=[w['top']-0.7 for w in markers]
                finish=min(end,max(c['bottom'] for c in p.chars if 296<=c['x0']<548 and limits[-1]<=c['top']<end)+3)
                stem=(296,start,548,limits[0])
                boxes=[(296,top,548,limits[i+1] if i<3 else finish) for i,top in enumerate(limits)]
            options=[re.sub(r'^[A-D]\)\s*','',clean(p.within_bbox(box).extract_text() or '')) for box in boxes]
            assert all(len(s)>10 for s in options),(n,options)
            records.append(dict(id=ident,ano=2020,banca='IFPR',concurso='Processo Seletivo IFPR 2020 — Graduação',numero_original=n,materia='Língua Portuguesa',conteudo='Semântica' if n==2 else 'Interpretação de textos',dificuldade='Médio',dificuldade_estimada=True,
                enunciado=clean(p.within_bbox(stem).extract_text()),opcoes=options,resposta_correta=ord(answers[n])-ord('A'),prova_incompleta=True,
                imagem_original=save(stem,ident+'-enunciado'),opcoes_imagens=[save(box,ident+'-'+chr(65+i)) for i,box in enumerate(boxes)],imagem_sem_alternativas=True,texto_extraido_corrompido=True,opcoes_texto_corrompido=[True]*4,
                apoio=[dict(imagem=apoio,texto='Poema em linha reta, Álvaro de Campos; texto integral compartilhado pelas questões 1–4')],fonte_pdf=SOURCE,fonte_gabarito=KEY_SOURCE,pagina=4,organizadora='FUNTEF-PR',data_aplicacao='2019-10-20'))
    (DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('IFPR 2020: 4 questões conferidas')

if __name__=='__main__':main()
