"""Completa o caderno Verão 2025 com recortes oficiais independentes."""
import json
import re
from pathlib import Path

import pdfplumber
from PIL import ImageStat

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/acervo/uem-2025'
PDF = ROOT / 'tmp/pdfs/uem-2025/prova.pdf'
RESPOSTAS = dict(zip(range(31, 51), [19,17,14,18,15,25,28,12,18,13,19,14,26,20,27,20,28,22,10,15]))
IDIOMAS = {'Espanhol': [13,24,25,14], 'Francês': [25,23,29,28], 'Inglês': [None,30,19,25]}
RENDER_CACHE={}
TOPICOS = {
31: ('Matemática','Trigonometria'),32: ('Matemática','Geometria plana'),33: ('Matemática','Geometria espacial'),
34: ('Matemática','Análise combinatória'),35: ('Matemática','Logaritmos'),36: ('Matemática','Equações'),
37: ('Matemática','Sistemas lineares'),38: ('Matemática','Geometria analítica'),39: ('Matemática','Geometria analítica'),
40: ('Matemática','Porcentagem'),41: ('Biologia','Ecologia'),42: ('Biologia','Ecologia'),43: ('Biologia','Biologia celular'),
44: ('Química','Química orgânica'),45: ('Química','Estequiometria'),46: ('Química','Química ambiental'),
47: ('Física','Eletricidade'),48: ('Química','Eletroquímica'),49: ('Física','Mecânica'),50: ('Física','Termodinâmica'),
}

def limpar(s):
    return re.sub(r'[ \t]+',' ',s).strip()

def salvar(page, box, nome):
    destino = DEST / (nome + '.webp')
    page.crop(box).to_image(resolution=190).original.convert('RGB').save(destino, 'WEBP', quality=92)
    return '/acervo/uem-2025/' + destino.name

def ajustar_limite(page,x0,x1,y):
    """Encontra separação em branco, preservando radicais e índices acima da linha."""
    if page not in RENDER_CACHE:
        RENDER_CACHE[page]=page.to_image(resolution=144).original.convert('L')
    image=RENDER_CACHE[page]
    candidates=[]
    for linha in range(max(1,int((y-9)*2)),min(image.height-2,int((y+5)*2))):
        faixa=image.crop((int(x0*2),linha,int(x1*2),linha+2))
        if ImageStat.Stat(faixa).extrema[0][0]>245:
            candidates.append(linha/2)
    return min(candidates,key=lambda pos:abs(pos-y)) if candidates else y

def segmentos(page, esquerda):
    x0, x1 = (34,300) if esquerda else (318,580)
    col = page.crop((x0,22,x1,790))
    words = col.extract_words(x_tolerance=2,y_tolerance=3)
    headers=[]
    for i,w in enumerate(words):
        if w['text']=='Questão' and i+1<len(words) and words[i+1]['text'].isdigit():
            headers.append((int(words[i+1]['text']),w['top']))
    for i,(n,top) in enumerate(headers):
        end=headers[i+1][1]-5 if i+1<len(headers) else 785
        ws=[w for w in words if top<w['top']<end]
        ms=[w for w in ws if re.fullmatch(r'(01|02|04|08|16)\)',w['text']) and w['x0']<x0+12]
        if [m['text'] for m in ms]!=['01)','02)','04)','08)','16)']:
            raise ValueError(f'Questão {n}: marcadores incorretos')
        last=max((c['bottom'] for c in col.chars if ms[-1]['top']<=c['top']<end),default=end)
        yield n, top, min(end,last+4), ms, x0, x1

def extrair(page,pagina,idioma=None):
    out=[]
    for esquerda in (True,False):
        for n,top,end,ms,x0,x1 in segmentos(page,esquerda):
            if not (31<=n<=50 or idioma and 11<=n<=14):
                continue
            ident=f'uem-2025-{n:02d}' + ('-'+{'Espanhol':'es','Francês':'fr','Inglês':'en'}[idioma] if idioma else '')
            limites=[ajustar_limite(page,x0,x1,m['top']-3) for m in ms]+[end]
            enbox=(x0,top-2,x1,limites[0])
            enunciado=limpar(page.crop(enbox).extract_text() or f'Questão {n} do caderno oficial UEM 2025.')
            imagens=[]
            opcoes=[]
            for i,m in enumerate(ms):
                box=(x0,limites[i],x1,limites[i+1])
                imagens.append(salvar(page,box,ident+'-'+m['text'][:2]))
                texto=limpar(page.crop(box).extract_text() or '')
                texto=re.sub(r'^(01|02|04|08|16)\)\s*','',texto)
                opcoes.append(texto or f'Afirmação {m["text"][:2]}: consulte a imagem oficial.')
            resposta=IDIOMAS[idioma][n-11] if idioma else RESPOSTAS[n]
            materia,conteudo=('Língua '+{'Inglês':'Inglesa','Francês':'Francesa','Espanhol':'Espanhola'}[idioma], 'Interpretação de textos') if idioma else TOPICOS[n]
            q=dict(id=ident,ano=2025,banca='UEM',concurso='Vestibular de Verão UEM 2025',numero_original=n,
                materia=materia,conteudo=conteudo,dificuldade='Médio',dificuldade_estimada=True,enunciado=enunciado,
                opcoes=opcoes,opcoes_imagens=imagens,imagem_original=salvar(page,enbox,ident+'-enunciado'),
                imagem_sem_alternativas=True,rotulos_opcoes=['01','02','04','08','16'],tipo_resposta='somatoria',
                valores_opcoes=[1,2,4,8,16],resposta_soma=resposta,resposta_correta=resposta,anulada=resposta is None,
                fonte_pdf='https://www.vestibular.uem.br/provas/ve25/P1.pdf',fonte_gabarito='https://www.vestibular.uem.br/provas/ve25/gabdef.pdf',pagina=pagina)
            if idioma: q['idioma']=idioma
            out.append(q)
    return out

def main():
    base=json.loads((DEST/'questoes.json').read_text(encoding='utf-8'))
    base=[q for q in base if q['numero_original']<=30 and not q.get('idioma')]
    with pdfplumber.open(PDF) as pdf:
        for idioma,inicio,fim in [('Espanhol',9,10),('Francês',11,12),('Inglês',13,14)]:
            p=pdf.pages[fim-1]
            col=p.crop((34,22,294,790))
            headers=[w for w in col.extract_words() if w['text']=='Questão']
            apoio=[dict(imagem=salvar(pdf.pages[inicio-1],(318,22,576,785),'apoio-'+idioma+'-1'),texto='Texto-base oficial '+idioma)]
            if headers and headers[0]['top']>100:
                apoio.append(dict(imagem=salvar(p,(34,22,300,headers[0]['top']-5),'apoio-'+idioma+'-2'),texto='Continuação do texto-base'))
            itens=extrair(p,fim,idioma)
            assert len(itens)==4,(idioma,len(itens))
            for q in itens: q['apoio']=apoio
            base.extend(itens)
        for pagina in range(19,24): base.extend(extrair(pdf.pages[pagina-1],pagina))
        # Formulários e tabela periódica fornecidos no próprio caderno.
        for q in base:
            if q['numero_original']>=31:
                paginas=[3] if q['materia']=='Matemática' else [2] if q['materia']=='Física' else [24] if q['materia']=='Química' else []
                q['apoio']=[dict(imagem=salvar(pdf.pages[n-1],(20,20,pdf.pages[n-1].width-20,pdf.pages[n-1].height-30),'formulario-'+str(n)),texto='Material de consulta fornecido na prova') for n in paginas]
    assert len(base)==58,len(base)
    assert len({q['id'] for q in base})==58
    (DEST/'questoes.json').write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('58 questões: 46 comuns e 12 dos três idiomas; Inglês 11 anulada.')

if __name__=='__main__': main()
