"""Todos os cadernos das provas 1 e 2 UEM 2019/2020, incluindo específicas."""
import json
import re
from pathlib import Path
import pdfplumber
import importar_uem_inverno_2025 as engine
from importar_uem_anuais import SUBJECTS, classify_general, set_key
from importar_uem_modernas import support, conteudo

ROOT=Path(__file__).resolve().parents[1]
GENERAL_SUBJECTS={
 've19':['Arte','Arte','História','Geografia','Filosofia','História','Filosofia','Geografia','História','Geografia','Geografia','História','Geografia','Geografia','Biologia','Matemática','Química','Biologia','Química','Biologia','Biologia','Biologia','Biologia','Biologia','Geografia','Matemática','Física','Física','Física','Física','Física','Química','Física','Geografia','Geografia','Geografia','Química','Química','Química','Química'],
 'in19':['Arte','Arte','Sociologia','História','Filosofia','Sociologia','Filosofia','História','História','História','Geografia','Geografia','Geografia','Geografia','Biologia','Física','Química','Biologia','Biologia','Química','Biologia','Matemática','Matemática','Biologia','Matemática','Física','Física','Matemática','Física','Física','Química','Química','Física','Geografia','Geografia','Biologia','Química','Química','Matemática','Química'],
 've20':['Arte','Arte','História','Sociologia','Filosofia','História','Filosofia','História','Sociologia','História','Geografia','História','Biologia','Geografia','Física','Biologia','Biologia','Química','Biologia','Biologia','Matemática','Biologia','Biologia','Biologia','Geografia','Matemática','Física','Matemática','Matemática','Matemática','Física','Química','Física','Química','Geografia','Matemática','Química','Química','Química','Química'],
}
CONFIG={
 've19':dict(portuguese=[(2,True,22,790),(2,False,22,122)],commonpages=[2,3,4,5,6],
             langs={'Espanhol':([7],[(6,False,22,790),(7,True,22,215)]),'Francês':([9],[(8,True,22,790),(8,False,22,790)]),'Inglês':([11],[(10,True,22,790),(10,False,22,790)])}),
 'in19':dict(portuguese=[(2,True,22,790),(2,False,22,277)],commonpages=[2,3,4,5,6],
             langs={'Espanhol':([7],[(6,False,22,790),(7,True,22,177)]),'Francês':([9],[(8,True,22,790),(8,False,22,790),(9,True,22,236)]),'Inglês':([11],[(10,True,22,790),(10,False,22,790)])}),
 've20':dict(portuguese=[(3,True,22,790),(3,False,22,790)],commonpages=[4,5,6,7],
             langs={'Espanhol':([8,9],[(8,True,22,790),(8,False,22,192)]),'Francês':([10,11],[(10,True,22,790)]),'Inglês':([12,13],[(12,True,22,790)])}),
}

def restore_unicode(pdf,filename):
    file=ROOT/'scripts/uem_fontes_in19.json'
    if not file.exists():file=ROOT/'tmp/uem-fontmaps.json'
    if not file.exists():raise RuntimeError('Execute recuperar_fontes_uem.py antes de importar Inverno 2019')
    maps=json.loads(file.read_text(encoding='utf8')).get(filename,{})
    for p in pdf.pages:
        for c in p.chars:
            m=re.fullmatch(r'\(cid:(\d+)\)',c['text'])
            if m:c['text']=maps.get(c['fontname'],{}).get(m[1],c['text'])

def key_rows(code):
    text=(ROOT/f'tmp/pdfs/uem-historico/{code}/key.txt').read_text(encoding='utf8')
    # ve19/gabdef.pdf tem título editorial "provisório", mas é o arquivo ligado
    # como DEFINITIVO pela página oficial evento_22.html (17/12/2019), com retificações.
    assert 'DEFINITIVO' in text or code=='ve19' and '* Resposta retificada' in text
    rows=[]
    for line in text.splitlines():
        m=re.match(r'^(\d{2})(?:/\d{2})?\*?\s+(\d{1,2}\*?|ANULADA)\s*(.*)$',line)
        if m:
            n=int(m[1]);a=None if m[2]=='ANULADA' else int(m[2].rstrip('*'))
            if a is not None:assert sum(map(int,re.findall(r'\d{2}',m[3])))==a,(code,line)
            rows.append((n,a))
    assert len(rows)==220,(code,len(rows))
    assert [n for n,_ in rows[:40]]==list(range(1,41))
    assert [n for n,_ in rows[40:55]]==list(range(1,16))
    languages={lang:rows[55+5*i:60+5*i] for i,lang in enumerate(['Espanhol','Francês','Inglês'])}
    for lang,values in languages.items():assert [n for n,_ in values]==list(range(16,21)),lang
    blocks={name:rows[70+15*i:85+15*i] for i,name in enumerate(SUBJECTS)}
    for name,values in blocks.items():assert len(set(n for n,_ in values))==15,name
    return dict(rows[:40]),dict(rows[40:55]),languages,blocks

def open_pdf(code,filename):
    pdf=pdfplumber.open(ROOT/f'tmp/pdfs/uem-historico/{code}/{filename}')
    if code=='in19':restore_unicode(pdf,filename)
    return pdf

def metadata(records,code,filename,dia):
    year=2000+int(code[-2:]);season='Verão' if code=='ve19' else 'Inverno' if code=='in19' else None
    for q in records:
        q.update(ano=year,concurso=f'Vestibular de {season} UEM {year}' if season else f'Vestibular UEM {year}',dia=dia,
                 fonte_pdf=f'https://www.vestibular.uem.br/provas/{code}/{filename}',fonte_gabarito=f'https://www.vestibular.uem.br/provas/{code}/gabdef.pdf',anulada=q['resposta_soma'] is None)
        q['conteudo']=conteudo(q)

def run(code):
    cfg=CONFIG[code];year=2000+int(code[-2:]);general,common,langs,blocks=key_rows(code)
    engine.DEST=ROOT/f'public/acervo/uem-{year}-{code[:2] if year==2019 else "anual"}'
    engine.DEST.mkdir(parents=True,exist_ok=True)
    engine.MIRROR=True;engine.TRIMS={};engine.CONTINUATIONS=set();engine.AUTO_CONTINUATIONS=True;engine.SKIP_SIDES=set()
    engine.LANG_START=16;engine.ID_EXTRA='-p1'
    engine.LANG={lang:[a for _,a in values] for lang,values in langs.items()}
    set_key(general.items());filename='P1.pdf' if code=='ve20' else 'P1G1.pdf'
    with open_pdf(code,filename) as pdf:
        pages=[p.page_number for p in pdf.pages if p.page_number>=5 and p.height>795]
        items=engine.questions(pdf,pages)
        assert [q['numero_original'] for q in items]==list(range(1,41)),(code,'p1',len(items))
        for q in items:q['materia']=GENERAL_SUBJECTS[code][q['numero_original']-1] if code in GENERAL_SUBJECTS else classify_general(q)
    metadata(items,code,filename,1);records=items
    filename='P2_lli.pdf' if code=='ve20' else 'P2G1-LLI.pdf'
    engine.ID_EXTRA='-p2';set_key(common.items());engine.SKIP_SIDES={(6,False)} if code!='ve20' else set()
    if code!='ve20':engine.SKIP_SIDES.add((2,True))
    with open_pdf(code,filename) as pdf:
        items=engine.questions(pdf,cfg['commonpages'])
        assert [q['numero_original'] for q in items]==list(range(1,16)),(code,'lli',len(items))
        apoio=support(pdf,cfg['portuguese'],'apoio-portugues')
        for q in items:
            q['materia']='Língua Portuguesa' if q['numero_original']<=10 else 'Literatura'
            if q['numero_original']<=10:q['apoio']=[apoio]
        for lang,(pages,parts) in cfg['langs'].items():
            engine.SKIP_SIDES={(pages[0],True)} if code=='ve20' and lang!='Espanhol' else set()
            entries=engine.questions(pdf,pages,lang)
            assert [q['numero_original'] for q in entries]==list(range(16,21)),(code,lang,len(entries))
            apoio=support(pdf,parts,'apoio-'+lang)
            for q in entries:q['apoio']=[apoio]
            items.extend(entries)
    metadata(items,code,filename,2);records.extend(items)
    for subject in SUBJECTS:
        filename=f'P2_{subject}.pdf' if code=='ve20' else f'P2G1-{subject.upper()}.pdf'
        engine.ID_EXTRA='-p2-'+subject;set_key(blocks[subject]);engine.SKIP_SIDES=set()
        with open_pdf(code,filename) as pdf:
            pages=[p.page_number for p in pdf.pages if p.height>795 and any(engine.col(p,side)[3] for side in (True,False))]
            items=engine.questions(pdf,pages)
            assert [q['numero_original'] for q in items]==[n for n,_ in blocks[subject]],(code,subject,len(items))
            for q in items:q['materia']=SUBJECTS[subject];q['bloco_especifico']=SUBJECTS[subject]
            for p in pdf.pages:
                txt=p.extract_text() or ''
                if 'FORMUL' in txt.upper() or 'TABELA PERI' in txt.upper():
                    if p.height>795 and any(engine.col(p,side)[3] for side in (True,False)):continue
                    apoio=dict(imagem=engine.image([(p,(18,18,p.width-18,p.height-25))],subject+'-consulta-'+str(p.page_number)),texto='Material de consulta do caderno oficial')
                    for q in items:q.setdefault('apoio',[]).append(apoio)
        metadata(items,code,filename,2);records.extend(items)
    assert len(records)==220
    assert len({q['id'] for q in records})==220
    (engine.DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(code,len(records),flush=True)
    engine.ID_EXTRA='';engine.LANG_START=11;engine.AUTO_CONTINUATIONS=False

if __name__=='__main__':
    import sys
    for code in sys.argv[1:] or CONFIG:run(code)
