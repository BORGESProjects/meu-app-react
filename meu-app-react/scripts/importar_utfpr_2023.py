"""Importa as 60 questões oficiais do Vestibular de Inverno UTFPR 2023 (modelo Inglês)."""
from __future__ import annotations
import json, re
from dataclasses import dataclass
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'tmp/utfpr-2023/prova.pdf'
DESTINO=ROOT/'public/acervo/utfpr-2023'
IMAGENS=DESTINO/'imagens'
ESCALA=2.0
FONTE_PROVA='https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/edicoes/2023-2/provas-e-gabaritos/caderno-de-provas.pdf/@@display-file/file'
FONTE_GABARITO='https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/edicoes/2023-2/provas-e-gabaritos/gabarito-definitivo.pdf/@@display-file/file'
LIMITES_ESPECIAIS={8:(5,686.0),14:(9,655.0),18:(12,535.0)}
GABARITO={1:'B',2:'A',3:'D',4:'D',5:'E',6:'D',7:'D',8:'C',9:'D',10:'A',11:'D',12:'E',13:'B',14:'C',15:'A',16:'A',17:'D',18:'D',19:'D',20:'C',21:'D',22:'B',23:'D',24:'C',25:'C',26:'A',27:'C',28:'D',29:'C',30:'C',31:'D',32:'E',33:'A',34:'B',35:'C',36:'D',37:'E',38:'D',39:'E',40:'C',41:'C',42:'E',43:'A',44:'E',45:'B',46:'C',47:'E',48:'D',49:'C',50:'D',51:'E',52:'B',53:'C',54:'A',55:'C',56:'B',57:'D',58:'X',59:'C',60:'E'}

@dataclass(frozen=True)
class Painel:
    pagina:int; x0:float; x1:float
@dataclass
class Marcador:
    numero:int; painel:int; top:float

def materia(n):
    return next(nome for limite,nome in [(4,'Literatura'),(12,'Língua Portuguesa'),(18,'Língua Inglesa'),(22,'História'),(26,'Geografia'),(28,'Filosofia'),(30,'Sociologia'),(36,'Biologia'),(44,'Química'),(52,'Matemática'),(60,'Física')] if n<=limite)

def limpar(t):
    t=t.replace('\u00ad','').replace('�','')
    t=re.sub(r'(?<=\w)-\s*\n\s*(?=\w)','',t)
    t=re.sub(r'[ \t]+',' ',t)
    return re.sub(r'\n{3,}','\n\n',t).strip()

def paineis():
    paginas=[*range(3,10),*range(12,27)]
    return [Painel(pg,x0,x1) for pg in paginas for x0,x1 in ((15.,296.),(297.,580.))]

def palavras_painel(pagina,painel):
    return [p for p in pagina.extract_words(x_tolerance=2,y_tolerance=3) if painel.x0<=float(p['x0'])<painel.x1 and 43<=float(p['top'])<=pagina.height-25]

def texto_faixa(pagina,painel,topo,fundo):
    return limpar(pagina.crop((painel.x0,topo,painel.x1,fundo)).extract_text(x_tolerance=2,y_tolerance=3) or '')

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
    img.save(caminho,'WEBP',quality=86,method=6)

def url(c): return '/'+c.relative_to(ROOT/'public').as_posix()

def gerar():
    DESTINO.mkdir(parents=True,exist_ok=True); IMAGENS.mkdir(parents=True,exist_ok=True)
    fluxo=paineis()
    with pdfplumber.open(PDF) as pdf:
        palavras=[palavras_painel(pdf.pages[p.pagina],p) for p in fluxo]
        todos=[]
        for pi,lista in enumerate(palavras):
            for p in lista:
                if len(p['text'])==3 and p['text'][:2].isdigit() and p['text'].endswith('.') and float(p['x0']) < fluxo[pi].x0 + 20:
                    n=int(p['text'][:2])
                    if 1<=n<=60: todos.append(Marcador(n,pi,float(p['top'])))
        selecionados=[]; vistos=set()
        for m in todos:
            if m.numero not in vistos: selecionados.append(m); vistos.add(m.numero)
        selecionados.sort(key=lambda m:m.numero)
        if [m.numero for m in selecionados]!=list(range(1,61)): raise ValueError(f'Questões localizadas: {[m.numero for m in selecionados]}')
        render=pdfium.PdfDocument(PDF); cache={}
        def render_pg(i):
            if i not in cache: cache[i]=render[i].render(scale=ESCALA).to_pil().convert('RGB')
            return cache[i]
        def proximo(atual):
            ps=[m for m in todos if (m.painel,m.top)>(atual.painel,atual.top)]
            return min(ps,key=lambda m:(m.painel,m.top),default=None)
        def segmentos(atual,seg):
            fim=seg.painel if seg else atual.painel; out=[]
            for pi in range(atual.painel,fim+1):
                y0=atual.top-4 if pi==atual.painel else 43.
                y1=seg.top-3 if seg and pi==seg.painel else pdf.pages[fluxo[pi].pagina].height-25
                if y1>y0+2: out.append((pi,y0,y1))
            return out
        def recortes_entre(inicio,fim,margem_intermediaria=25):
            imgs=[]
            for pi in range(inicio[0],fim[0]+1):
                painel=fluxo[pi]; pagina=pdf.pages[painel.pagina]
                y0=inicio[1] if pi==inicio[0] else 43.; y1=fim[1] if pi==fim[0] else pagina.height-margem_intermediaria
                if y1>y0+2:
                    im=render_pg(painel.pagina)
                    imgs.append(im.crop((int(painel.x0*ESCALA),int(y0*ESCALA),int(painel.x1*ESCALA),int(y1*ESCALA))))
            return imgs
        questoes=[]
        for m in selecionados:
            seg=proximo(m); partes=segmentos(m,seg); alts=[]
            for pi,y0,y1 in partes:
                for p in palavras[pi]:
                    if y0<=float(p['top'])<y1 and re.fullmatch(r'\([A-E]\)',p['text']): alts.append((p['text'][1],pi,float(p['top'])))
            if [x[0] for x in alts]!=list('ABCDE'): raise ValueError(f'Questão {m.numero}: alternativas {[x[0] for x in alts]}')
            limites=[(pi,top) for _,pi,top in alts]
            fim_bloco=(seg.painel,seg.top-3) if seg else (partes[-1][0],partes[-1][2])
            cabecalho=re.compile(r'^(?:L.ngua|Hist.ria|Geografia|Sociologia|Biologia|Qu.mica|Matem.tica|F.sica|Ingl.s)$')
            candidatos=[]
            ultimo_pi,ultimo_top=alts[-1][1],alts[-1][2]
            for pi,y0,y1 in partes:
                if pi < ultimo_pi: continue
                for palavra in palavras[pi]:
                    if (pi,float(palavra['top']))>(ultimo_pi,ultimo_top) and cabecalho.fullmatch(palavra['text']):
                        candidatos.append((pi,float(palavra['top'])-3))
            if candidatos: fim_bloco=min([fim_bloco,*candidatos])
            if m.numero in LIMITES_ESPECIAIS: fim_bloco=LIMITES_ESPECIAIS[m.numero]
            enun_path=IMAGENS/f'q{m.numero:02d}-enunciado.webp'
            limite_enunciado=(limites[0][0],limites[0][1]-3)
            salvar(juntar(recortes_entre((m.painel,m.top-4),limite_enunciado)),enun_path)
            textos=[]; imagens=[]
            for i,(letra,pi,top) in enumerate(alts):
                fim=limites[i+1] if i<4 else fim_bloco
                op_path=IMAGENS/f'q{m.numero:02d}-{letra.lower()}.webp'
                salvar(juntar(recortes_entre((pi,top-2),fim)),op_path); imagens.append(url(op_path))
                partes_txt=[]
                for k in range(pi,fim[0]+1):
                    painel=fluxo[k]; y0=top if k==pi else 43.; y1=fim[1]-2 if k==fim[0] else pdf.pages[painel.pagina].height-25
                    partes_txt.append(texto_faixa(pdf.pages[painel.pagina],painel,y0,y1))
                txt=limpar('\n'.join(partes_txt)); textos.append(re.sub(rf'^\({letra}\)\s*','',txt) or f'Alternativa {letra} — consulte o recorte oficial.')
            en_parts=[]
            for k in range(m.painel,limites[0][0]+1):
                painel=fluxo[k]; y0=m.top if k==m.painel else 43.; y1=limites[0][1]-3 if k==limites[0][0] else pdf.pages[painel.pagina].height-25
                en_parts.append(texto_faixa(pdf.pages[painel.pagina],painel,y0,y1))
            enunciado=re.sub(rf'^{m.numero:02d}\.\s*','',limpar('\n'.join(en_parts)))
            if m.numero==1 and len(textos[0])>500:
                textos[0]='Alternativa A — consulte o recorte oficial.'
            apoio=[]
            if m.numero in (9,10):
                apoio_path=IMAGENS/'apoio-q09-q10.webp'
                if not apoio_path.exists():
                    salvar(juntar(recortes_entre((5,687.0),(6,658.0))),apoio_path)
                apoio=[{'imagem':url(apoio_path),'texto':'Texto oficial “Latim em pó”, utilizado nas questões 9 e 10.'}]
            elif m.numero in (13,14):
                apoio_path=IMAGENS/'apoio-q13-q14.webp'
                if not apoio_path.exists():
                    salvar(juntar(recortes_entre((8,174.0),(8,816.0))),apoio_path)
                apoio=[{'imagem':url(apoio_path),'texto':'Texto oficial sobre golpes associados ao ChatGPT, utilizado nas questões 13 e 14.'}]
            elif m.numero in (15,16):
                apoio_path=IMAGENS/'apoio-q15-q16.webp'
                if not apoio_path.exists():
                    salvar(juntar(recortes_entre((9,656.0),(10,643.0))),apoio_path)
                apoio=[{'imagem':url(apoio_path),'texto':'Regras oficiais do jogo Go, utilizadas nas questões 15 e 16.'}]
            resp=GABARITO[m.numero]
            questoes.append({'id':f'utfpr-2023-{m.numero:02d}','ano':2023,'numero_original':m.numero,'modelo':'Inglês','materia':materia(m.numero),'conteudo':materia(m.numero),'banca':'UTFPR','concurso':'Vestibular de Inverno UTFPR 2023','dificuldade':'Média','dificuldade_estimada':True,'enunciado':enunciado,'opcoes':textos,'resposta_correta':0 if resp=='X' else ord(resp)-ord('A'),'anulada':resp=='X','pagina':fluxo[m.painel].pagina+1,'fonte_pdf':FONTE_PROVA,'fonte_gabarito':FONTE_GABARITO,'imagem_original':url(enun_path),'imagem_sem_alternativas':True,'opcoes_imagens':imagens,'apoio':apoio,'texto_extraido_corrompido':True,'opcoes_texto_corrompido':[True]*5,'duplicata_oficial':False})
    if len(questoes)!=60 or len({q['id'] for q in questoes})!=60: raise ValueError('Lote UTFPR 2023 incompleto')
    return questoes

if __name__=='__main__':
    lote=gerar(); arq=DESTINO/'questoes.json'; arq.write_text(json.dumps(lote,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8'); print(f'UTFPR 2023: {len(lote)} questões gravadas em {arq}')












