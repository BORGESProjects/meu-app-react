"""Vestibulares anuais 2021/2022: núcleo comum, três idiomas e dez provas específicas."""
import json
import re
from pathlib import Path
import pdfplumber
import importar_uem_inverno_2025 as engine
from importar_uem_modernas import conteudo, support

ROOT=Path(__file__).resolve().parents[1]
SUBJECTS={'art':'Arte','bio':'Biologia','edf':'Educação Física','fil':'Filosofia','fis':'Física','geo':'Geografia','his':'História','mat':'Matemática','qui':'Química','soc':'Sociologia'}
COMMON_SUBJECTS={
 've21':['Arte','Sociologia','História','Geografia','Educação Física','Biologia','Geografia','Física','Matemática','Química'],
 've22':['Arte','História','História','Geografia','Educação Física','Química','Biologia','Matemática','Matemática','Química'],
}
CONFIG={
 've21':dict(blocks={'art':[18,19,20],'bio':[21,22,23],'edf':[24,25,26],'fil':[27,28,29],'fis':[31,32],'geo':[33,34,35],'his':[36,37,38],'mat':[40,41],'qui':[42,43,44],'soc':[45,46,47]},
             continuations={(11,True),(12,True),(31,False),(32,False)},
             portuguese=[(7,False,22,795),(8,True,22,525)],
             languages={'Espanhol':[(12,False,22,795),(13,True,22,196)],'Francês':[(14,True,22,795),(14,False,22,795)],'Inglês':[(16,True,22,795),(16,False,22,795),(17,True,22,178)]},
             formularios={'Física':30,'Matemática':39,'Química':48}),
 've22':dict(blocks={'art':[18,19],'bio':[20,21],'edf':[22,23],'fil':[24,25,26,27],'fis':[29,30,31],'geo':[32,33],'his':[34,35],'mat':[37,38,39],'qui':[40,41],'soc':[42,43]},
             continuations={(34,False),(35,False)},
             portuguese=[(7,False,22,795),(8,True,22,529)],
             languages={'Espanhol':[(12,False,22,795)],'Francês':[(14,True,22,795),(14,False,22,795)],'Inglês':[(16,True,22,795),(16,False,22,795)]},
             formularios={'Física':28,'Matemática':36,'Química':44}),
}

def key_rows(code):
    text=(ROOT/f'tmp/pdfs/uem-historico/{code}/key.txt').read_text(encoding='utf8')
    assert 'DEFINITIVO' in text
    rows=[]
    for line in text.splitlines():
        m=re.match(r'^(\d{2})(?:/\d{2})?\*?\s+(\d{1,2}\*?|ANULADA)\s*(.*)$',line)
        if m:
            n=int(m[1]); answer=None if m[2]=='ANULADA' else int(m[2].rstrip('*'))
            if answer is not None: assert sum(map(int,re.findall(r'\d{2}',m[3])))==answer,(code,line)
            rows.append((n,answer))
    assert len(rows)==140,(code,len(rows))
    assert [n for n,_ in rows[:25]]==list(range(1,26))
    languages={lang:rows[25+5*i:30+5*i] for i,lang in enumerate(['Espanhol','Francês','Inglês'])}
    for lang,values in languages.items():assert [n for n,_ in values]==list(range(26,31)),lang
    blocks={name:rows[40+10*i:50+10*i] for i,name in enumerate(SUBJECTS)}
    for name,values in blocks.items():assert len(set(n for n,_ in values))==10,name
    return dict(rows[:25]),languages,blocks

def classify_general(q):
    text=(q['enunciado']+' '+' '.join(q['opcoes'])).lower()
    patterns={'Arte':r'\barte\b|artíst|pintura|escultura|teatro|cinema|patrimônio',
              'Filosofia':r'platão|aristóteles|filosó|pensamento filos|epistem',
              'Sociologia':r'soció|sociol|durkheim|weber',
              'História':r'colonial|revolução|império|imperial|escravid|república|história',
              'Geografia':r'clima|relevo|território|geográf|globaliza|população|região',
              'Biologia':r'célula|dna|ecologia|organismo|genét|espécie|respiração|vírus',
              'Química':r'átomo|molécula|química|ácido|base|reação|mol|oxigênio',
              'Física':r'força|energia|elétrica|movimento|partícula|velocidade',
              'Matemática':r'função|equação|matriz|logarit|probabilidade|circunferência',
              'Educação Física':r'esporte|atividade física|exercício físico|educação física'}
    scores={mat:len(re.findall(pattern,text)) for mat,pattern in patterns.items()}
    return max(scores,key=scores.get) if max(scores.values()) else 'Conhecimentos gerais'

def set_key(rows):
    answers=dict(rows)
    engine.KEY=[answers.get(n) for n in range(1,51)]

def run(code):
    cfg=CONFIG[code];year=2000+int(code[-2:]);common,langs,blocks=key_rows(code)
    engine.DEST=ROOT/f'public/acervo/uem-{year}-anual';engine.DEST.mkdir(parents=True,exist_ok=True)
    engine.MIRROR=True;engine.TRIMS={};engine.LANG_START=26;engine.ID_EXTRA=''
    engine.CONTINUATIONS=cfg['continuations'];engine.SKIP_SIDES={(7,False),(12,False)}
    engine.LANG={lang:[answer for _,answer in values] for lang,values in langs.items()}
    set_key(common.items())
    with pdfplumber.open(ROOT/f'tmp/pdfs/uem-historico/{code}/P1.pdf') as pdf:
        records=engine.questions(pdf,list(range(5,13)))
        assert [q['numero_original'] for q in records]==list(range(1,26)),(code,'common')
        apoio=support(pdf,cfg['portuguese'],'apoio-portugues')
        for q in records:
            n=q['numero_original']
            q['materia']='Língua Portuguesa' if 11<=n<=20 else 'Literatura' if n>=21 else COMMON_SUBJECTS[code][n-1]
            if 11<=n<=20:q['apoio']=[apoio]
        for lang,pn in [('Espanhol',13),('Francês',15),('Inglês',17)]:
            engine.SKIP_SIDES=set()
            items=engine.questions(pdf,[pn],lang)
            assert [q['numero_original'] for q in items]==list(range(26,31)),(code,lang)
            apoio=support(pdf,cfg['languages'][lang],'apoio-'+lang)
            for q in items:q['apoio']=[apoio]
            records.extend(items)
        for subject,pages in cfg['blocks'].items():
            engine.ID_EXTRA='-'+subject;set_key(blocks[subject]);engine.SKIP_SIDES=set()
            items=engine.questions(pdf,pages)
            assert [q['numero_original'] for q in items]==[n for n,_ in blocks[subject]],(code,subject,len(items))
            for q in items:q['materia']=SUBJECTS[subject];q['bloco_especifico']=SUBJECTS[subject]
            records.extend(items)
        for materia,pn in cfg['formularios'].items():
            p=pdf.pages[pn-1]
            apoio=dict(imagem=engine.image([(p,(20,20,p.width-20,p.height-25))],'formulario-'+str(pn)),texto='Material de consulta do caderno oficial')
            for q in records:
                if q['materia']==materia:q.setdefault('apoio',[]).append(apoio)
    for q in records:
        q.update(ano=year,concurso=f'Vestibular UEM {year}',fonte_pdf=f'https://www.vestibular.uem.br/provas/{code}/P1.pdf',fonte_gabarito=f'https://www.vestibular.uem.br/provas/{code}/gabdef.pdf',anulada=q['resposta_soma'] is None)
        q['conteudo']=conteudo(q)
    assert len(records)==140
    assert len({q['id'] for q in records})==140
    (engine.DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(code,len(records),flush=True)
    engine.ID_EXTRA='';engine.LANG_START=11

if __name__=='__main__':
    import sys
    for code in sys.argv[1:] or CONFIG:run(code)
