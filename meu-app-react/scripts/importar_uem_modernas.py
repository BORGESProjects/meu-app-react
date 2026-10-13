"""Cadernos 2023/2024, com gabaritos definitivos e apoios conferidos por edição."""
import json
import re
from pathlib import Path
import pdfplumber
import importar_uem_inverno_2025 as engine

ROOT=Path(__file__).resolve().parents[1]
CONFIG={
 've24':dict(mirror=False,common=[7,8,9,*range(13,22)],langs=[('Espanhol',10),('Francês',11),('Inglês',12)],continuations={(10,False)},
             supports=[(range(1,8),[(6,True,22,795),(6,False,22,795)])],
             lang_support={'Espanhol':[(10,True,22,680)],'Francês':[(11,True,22,795),(11,False,22,127)],'Inglês':[(12,True,22,795)]}),
 'in24':dict(mirror=True,common=[6,7,8,*range(12,22)],langs=[('Espanhol',9),('Francês',10),('Inglês',11)],continuations={(8,False),(9,False)},
             supports=[(range(1,8),[(6,True,22,795)])],
             lang_support={'Espanhol':[(9,True,22,658)],'Francês':[(10,True,22,795)],'Inglês':[(11,True,22,795)]}),
 've23':dict(mirror=True,common=[6,7,8,*range(12,20)],langs=[('Espanhol',9),('Francês',10),('Inglês',11)],continuations=set(),
             supports=[(range(1,8),[(6,True,22,795),(6,False,22,375)])],
             lang_support={'Espanhol':[(9,True,22,795)],'Francês':[(10,True,22,795)],'Inglês':[(11,True,22,795)]}),
 'in23':dict(mirror=True,common=[6,7,8,9,14,*range(15,24)],langs=[('Espanhol',10),('Francês',12),('Inglês',14)],continuations={(7,False),(8,False),(10,False),(12,False)},
             supports=[(range(1,8),[(6,True,22,795),(6,False,22,544)])],
             lang_support={'Espanhol':[(9,False,22,795)],'Francês':[(11,False,22,795)],'Inglês':[(13,False,22,795)]}),
}
OVERRIDES={
 've24':{23:'Sociologia',24:'Sociologia'},
 'in24':{23:'Sociologia',24:'Sociologia',28:'Geografia'},
 've23':{22:'Sociologia',24:'Sociologia',25:'História',26:'Geografia',28:'Geografia'},
 'in23':{22:'Sociologia',23:'Sociologia',24:'História',25:'História',27:'Geografia',28:'Geografia'},
}

def conteudo(q):
    texto=(q['enunciado']+' '+ ' '.join(q['opcoes'])).lower()
    regras={
      'Matemática':[('matriz|determinante|sistema linear','Sistemas lineares e matrizes'),('triângulo|cilindro|cone|quadrado|círculo|circunferência','Geometria'),('probabilidade|sorteio|bola|bolinha','Probabilidade'),('média|mediana|moda','Estatística'),('lucro|porcentagem|preço|imposto','Porcentagem e matemática financeira'),('logarit|log ','Logaritmos'),('trigon|seno|cosseno','Trigonometria'),('função|funções','Funções')],
      'Física':[('fenda|luz|espelho|refração','Óptica'),('carga|elétric|tensão|corrente','Eletricidade'),('calor|temperatura|termodin|ciclo','Termodinâmica'),('força|movimento|velocidade|partícula','Mecânica')],
      'Química':[('oxida|redução|pilha|bateria','Eletroquímica'),('bohr|átomo|atômic','Estrutura atômica'),('carbono|orgânic|aminoácido','Química orgânica'),('ligação|ligações','Ligações químicas'),('mol|estequi','Estequiometria')],
      'Geografia':[('energia|energétic','Fontes de energia'),('paraná','Geografia do Paraná'),('rocha|relevo','Geografia física'),('representação|mapa|cartogra','Cartografia'),('globaliza','Globalização')],
      'Filosofia':[('conhecimento|kant|hume|paradigma','Teoria do conhecimento'),('ética|moral|utilitar','Ética'),('estado|política|direitos','Filosofia política')],
      'História':[('escravid|escraviza','História do Brasil'),('idade média|medieval','Idade Média'),('renascimento','Renascimento'),('paraná','História do Paraná')],
      'Biologia':[('ecossistema|ecologia|bioma|trófic|cadeia alimentar','Ecologia'),('gene|cromossomo|dna','Genética'),('fung|vírus|bactéri|levedura','Microbiologia'),('membrana|célul','Citologia'),('sistema nervoso|hormônio|respiração|digestão','Fisiologia humana')],
    }
    for padrao,nome in regras.get(q['materia'],[]):
        if re.search(padrao,texto): return nome
    return {'Língua Portuguesa':'Interpretação de textos','Literatura':'Literatura brasileira','Arte':'Arte e cultura','Educação Física':'Saúde e cultura corporal','Filosofia':'Filosofia política','Sociologia':'Sociedade e cultura','História':'História geral','Geografia':'Geografia humana','Matemática':'Matemática','Biologia':'Biologia','Química':'Química','Física':'Física','Conhecimentos gerais':'Atualidades e conhecimentos gerais'}.get(q['materia'],'Interpretação de textos')

def support(pdf,specs,name):
    parts=[]
    for pn,left,top,bottom in specs:
        p=pdf.pages[pn-1]; a,b,_,heads=engine.col(p,left)
        assert not any(top<=y<bottom for _,y in heads),(name,pn,'o apoio inclui uma questão')
        parts.append((p,(a,top,b,bottom)))
    return dict(imagem=engine.image(parts,name),texto='Texto de apoio integral do caderno oficial')

def key(code):
    text=(ROOT/f'tmp/pdfs/uem-historico/{code}/key.txt').read_text(encoding='utf8')
    assert 'DEFINITIVO' in text
    rows=[]
    for line in text.splitlines():
        m=re.match(r'^(\d{2})\*?\s+(\d{1,2}\*?|ANULADA)\s*(.*)$',line)
        if m:
            n=int(m[1]); resposta=None if m[2]=='ANULADA' else int(m[2].rstrip('*'))
            if resposta is not None:
                valores=[int(v) for v in re.findall(r'\d{2}',m[3])]
                assert sum(valores)==resposta,(code,n,line)
            rows.append((n,resposta))
    assert len(rows)==58,(code,len(rows))
    assert [n for n,_ in rows[:10]]==list(range(1,11))
    langs={lang:[r for _,r in rows[10+i*4:14+i*4]] for i,lang in enumerate(['Espanhol','Francês','Inglês'])}
    common=rows[:10]+rows[22:]
    assert [n for n,_ in common]==[*range(1,11),*range(15,51)]
    return dict(common),langs

def run(code):
    cfg=CONFIG[code]; ano=2000+int(code[-2:]); temporada='Verão' if code.startswith('ve') else 'Inverno'
    engine.DEST=ROOT/f'public/acervo/uem-{ano}-{code[:2]}'
    engine.DEST.mkdir(parents=True,exist_ok=True)
    respostas,engine.LANG=key(code)
    engine.KEY=[respostas.get(n) for n in range(1,51)]
    engine.MIRROR=cfg['mirror']; engine.TRIMS={}; engine.CONTINUATIONS=cfg['continuations']
    engine.SKIP_SIDES={(14,True)} if code=='in23' else set()
    with pdfplumber.open(ROOT/f'tmp/pdfs/uem-historico/{code}/P1.pdf') as pdf:
        records=engine.questions(pdf,cfg['common'])
        assert len(records)==46,(code,'common',len(records))
        for nums,parts in cfg['supports']:
            apoio=support(pdf,parts,'apoio-portugues')
            for q in records:
                if q['numero_original'] in nums: q.setdefault('apoio',[]).append(apoio)
        for lang,pn in cfg['langs']:
            engine.SKIP_SIDES={(14,False)} if code=='in23' and lang=='Inglês' else set()
            itens=engine.questions(pdf,[pn],lang)
            assert len(itens)==4,(code,lang,len(itens))
            apoio=support(pdf,cfg['lang_support'][lang],'apoio-'+lang)
            for q in itens: q['apoio']=[apoio]
            records.extend(itens)
        for q in records:
            q.update(ano=ano,concurso=f'Vestibular de {temporada} UEM {ano}',fonte_pdf=f'https://www.vestibular.uem.br/provas/{code}/P1.pdf',fonte_gabarito=f'https://www.vestibular.uem.br/provas/{code}/gabdef.pdf')
            q['anulada']=q['resposta_soma'] is None
            q['materia']=OVERRIDES.get(code,{}).get(q['numero_original'],q['materia'])
            q['conteudo']=conteudo(q)
        for pn,materia in [(2,'Física'),(3,'Matemática'),(len(pdf.pages),'Química')]:
            p=pdf.pages[pn-1]
            if materia=='Química' and 'TABELA PERI' not in (p.extract_text() or ''): continue
            apoio=dict(imagem=engine.image([(p,(20,20,p.width-20,p.height-30))],'formulario-'+str(pn)),texto='Material de consulta fornecido no caderno')
            for q in records:
                if q['materia']==materia: q.setdefault('apoio',[]).append(apoio)
    (engine.DEST/'questoes.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(code,len(records),flush=True)
    return records

if __name__=='__main__':
    import sys
    for code in sys.argv[1:] or CONFIG: run(code)
