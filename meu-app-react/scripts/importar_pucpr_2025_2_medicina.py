"""Importa as 60 questões da prova branca de Medicina da PUCPR 2025/2."""
from __future__ import annotations
import json, re
from dataclasses import dataclass
from pathlib import Path
import pdfplumber
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PDF_PROVA=ROOT/'tmp/pucpr-2025-2-branca-limpa.pdf'
PDF_GABARITO=ROOT/'tmp/pucpr-2025-2-branca-gabarito.pdf'
DESTINO=ROOT/'public/acervo/pucpr-2025-2-medicina'
IMAGENS=DESTINO/'imagens'
ESCALA=2.0
FONTE_PROVA='https://cliquevestibular.com.br/wp-content/uploads/2025/05/BRANCA-MEDICINA.pdf'
FONTE_GABARITO='https://estude.pucpr.br/editais/gabarito-definitivo-medicina-prova-branca/'
PAGINAS=range(2,32); TOPO=55.0; FUNDO=790.0
FINS_ESPECIAIS={9:(6,320.),12:(7,432.),20:(12,474.),28:(17,595.),37:(20,58.),42:(22,407.),47:(26,58.),52:(28,58.),54:(28,443.)}

@dataclass(frozen=True)
class Marcador:
    numero:int; pagina:int; top:float

def materia(n):
    return next(nome for limite,nome in [(9,'Língua Portuguesa'),(12,'Literatura'),(20,'Biologia'),(28,'Química'),(37,'Matemática'),(42,'Física'),(47,'História'),(52,'Geografia'),(54,'Filosofia'),(60,'Língua Inglesa')] if n<=limite)

def limpar(t):
    t=t.replace('\u00ad','').replace('�','')
    t=re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',t)
    t=re.sub(r'[ \t]+',' ',t)
    return re.sub(r'\n{3,}','\n\n',t).strip()

def juntar(imgs):
    imgs=[i for i in imgs if i.width>2 and i.height>2]
    largura=max(i.width for i in imgs)
    out=Image.new('RGB',(largura,sum(i.height for i in imgs)+12*(len(imgs)-1)),'white')
    y=0
    for img in imgs:
        out.paste(img,(0,y)); y+=img.height+12
    return out

def salvar(img,caminho):
    caminho.parent.mkdir(parents=True,exist_ok=True)
    if img.width>1180: img=img.resize((1180,round(img.height*1180/img.width)),Image.Resampling.LANCZOS)
    img.save(caminho,'WEBP',quality=87,method=6)

def url(c): return '/'+c.relative_to(ROOT/'public').as_posix()

def remover_destaque(img):
    pixels=img.load()
    for y in range(img.height):
        for x in range(img.width):
            r,g,b=pixels[x,y]
            if r<170 and g>145 and b>145 and abs(g-b)<85:
                pixels[x,y]=(255,255,255)
            elif g>r+8 and b>r+8:
                pixels[x,y]=(r,r,r)
    return img

def gerar():
    if not PDF_PROVA.exists() or not PDF_GABARITO.exists(): raise FileNotFoundError('Baixe o caderno limpo e a versão corrigida em tmp antes de importar.')
    DESTINO.mkdir(parents=True,exist_ok=True); IMAGENS.mkdir(parents=True,exist_ok=True)
    prova=pdfplumber.open(PDF_PROVA); gabarito=pdfplumber.open(PDF_GABARITO)
    try:
        normalizar=lambda t:re.sub(r'\s+','',t).replace('�','')
        texto_prova=''.join((p.extract_text() or '') for p in PdfReader(PDF_PROVA).pages)
        texto_gabarito=''.join((p.extract_text() or '') for p in PdfReader(PDF_GABARITO).pages)
        if normalizar(texto_prova)!=normalizar(texto_gabarito): raise ValueError('O gabarito não corresponde exatamente ao caderno branco.')
        palavras={pg:[p for p in prova.pages[pg].extract_words(x_tolerance=2,y_tolerance=3) if TOPO<=float(p['top'])<=FUNDO] for pg in PAGINAS}
        candidatos=[]
        for pg in PAGINAS:
            for p in palavras[pg]:
                if float(p['x0'])<40 and re.fullmatch(r'(?:[1-9]|[1-5][0-9]|60)\.',p['text']): candidatos.append(Marcador(int(p['text'][:-1]),pg,float(p['top'])))
        marcadores=[]; esperado=1
        for m in candidatos:
            if m.numero==esperado: marcadores.append(m); esperado+=1
        if [m.numero for m in marcadores]!=list(range(1,61)): raise ValueError(f'Questões localizadas: {[m.numero for m in marcadores]}')
        render_prova=pdfium.PdfDocument(PDF_PROVA); render_gabarito=pdfium.PdfDocument(PDF_GABARITO); cache_prova={}; cache_gabarito={}
        def render(documento,cache,pg):
            if pg not in cache: cache[pg]=documento[pg].render(scale=ESCALA).to_pil().convert('RGB')
            return cache[pg]
        def recortes(inicio,fim):
            imgs=[]
            for pg in range(inicio[0],fim[0]+1):
                y0=inicio[1] if pg==inicio[0] else TOPO; y1=fim[1] if pg==fim[0] else FUNDO
                if y1>y0+2:
                    im=render(render_prova,cache_prova,pg); imgs.append(im.crop((int(22*ESCALA),int(y0*ESCALA),int(573*ESCALA),int(y1*ESCALA))))
            return imgs
        def texto_faixa(inicio,fim):
            partes=[]
            for pg in range(inicio[0],fim[0]+1):
                y0=inicio[1] if pg==inicio[0] else TOPO; y1=fim[1] if pg==fim[0] else FUNDO
                if y1>y0+2: partes.append(prova.pages[pg].crop((22,y0,573,y1)).extract_text(x_tolerance=2,y_tolerance=3) or '')
            return limpar('\n'.join(partes))
        questoes=[]; respostas=[]
        for idx,m in enumerate(marcadores):
            fim=((marcadores[idx+1].pagina,marcadores[idx+1].top-3) if idx<59 else (31,FUNDO)); fim_e=FINS_ESPECIAIS.get(m.numero,fim); inicio=(m.pagina,m.top); alts=[]
            for pg in range(m.pagina,fim[0]+1):
                for p in palavras[pg]:
                    pos=(pg,float(p['top']))
                    if inicio<=pos<fim and 60<float(p['x0'])<80 and re.fullmatch(r'[A-E]\)',p['text']): alts.append((p['text'][0],pg,float(p['top'])))
            if [a[0] for a in alts]!=list('ABCDE'): raise ValueError(f'Questão {m.numero}: alternativas {[a[0] for a in alts]}')
            contagens=[]
            for i,(_,pg,top) in enumerate(alts):
                prox=((alts[i+1][1],alts[i+1][2]-2) if i<4 else fim_e); im=render(render_gabarito,cache_gabarito,pg); y1=prox[1] if prox[0]==pg else FUNDO
                faixa=im.crop((int(55*ESCALA),int((top-2)*ESCALA),int(560*ESCALA),int(y1*ESCALA))); contagens.append(sum(1 for r,g,b in faixa.getdata() if r<80 and g>170 and b>170))
            resposta=max(range(5),key=contagens.__getitem__)
            if contagens[resposta]<250 or sorted(contagens)[-1]<sorted(contagens)[-2]*2: raise ValueError(f'Questão {m.numero}: destaque ambíguo {contagens}')
            respostas.append(chr(65+resposta)); inicio_a=(alts[0][1],alts[0][2]-3); enun_path=IMAGENS/f'q{m.numero:02d}-enunciado.webp'; salvar(juntar(recortes((m.pagina,m.top-4),inicio_a)),enun_path)
            opcoes=[]; opcoes_imagens=[]
            for i,(letra,pg,top) in enumerate(alts):
                fim_alt=((alts[i+1][1],alts[i+1][2]-2) if i<4 else fim_e); op_path=IMAGENS/f'q{m.numero:02d}-{letra.lower()}.webp'; imagem_opcao=juntar(recortes((pg,top-2),fim_alt)); remover_destaque(imagem_opcao); salvar(imagem_opcao,op_path)
                txt=re.sub(rf'^{letra}\)\s*','',texto_faixa((pg,top),fim_alt)); opcoes.append(txt or f'Alternativa {letra} — consulte o recorte oficial.'); opcoes_imagens.append(url(op_path))
            enunciado=re.sub(rf'^{m.numero}\.\s*','',texto_faixa(inicio,inicio_a))
            questoes.append({'id':f'pucpr-2025-2-med-{m.numero:02d}','ano':2025,'numero_original':m.numero,'modelo':'Prova branca','materia':materia(m.numero),'conteudo':materia(m.numero),'banca':'PUC-PR','concurso':'Vestibular de Inverno PUCPR 2025/2 - Medicina','dificuldade':'Média','dificuldade_estimada':True,'enunciado':enunciado,'opcoes':opcoes,'resposta_correta':resposta,'anulada':False,'pagina':m.pagina+1,'fonte_pdf':FONTE_PROVA,'fonte_gabarito':FONTE_GABARITO,'imagem_original':url(enun_path),'imagem_sem_alternativas':True,'opcoes_imagens':opcoes_imagens,'apoio':[],'texto_extraido_corrompido':True,'opcoes_texto_corrompido':[True]*5,'duplicata_oficial':False})
        if len(questoes)!=60 or len({q['id'] for q in questoes})!=60: raise ValueError('Lote PUC-PR 2025/2 incompleto')
        print('Gabarito detectado:',''.join(respostas)); return questoes
    finally: prova.close(); gabarito.close()

if __name__=='__main__':
    lote=gerar(); arq=DESTINO/'questoes.json'; arq.write_text(json.dumps(lote,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8'); print(f'PUC-PR 2025/2 Medicina: {len(lote)} questões gravadas em {arq}')
