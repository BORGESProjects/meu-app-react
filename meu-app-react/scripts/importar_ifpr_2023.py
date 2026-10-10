"""Importa os dois cadernos oficiais definitivos do Processo Seletivo IFPR 2023."""
from __future__ import annotations
import json,re
from dataclasses import dataclass
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PDFS={"ing":ROOT/"tmp/ifpr-2023-ingles-oficial.pdf","esp":ROOT/"tmp/ifpr-2023-espanhol-oficial.pdf"}
FONTES={"ing":"https://servicos.nc.ufpr.br/documentos/ifpr2023/provas/definitivo/802.pdf","esp":"https://servicos.nc.ufpr.br/documentos/ifpr2023/provas/definitivo/803.pdf"}
DESTINO=ROOT/"public/acervo/ifpr-2023"; IMAGENS=DESTINO/"imagens"
ESCALA=2.0; TOPO=38.0; FUNDO=805.0

@dataclass(frozen=True)
class Marcador:
    numero:int; pagina:int; top:float; modelo:str; pdfkey:str

def limpar(t):
    t=t.replace("\u00ad","").replace("►","").replace("�","")
    t=re.sub(r"(?<=\w)-\s*\n\s*(?=\w)","",t); t=re.sub(r"[ \t]+"," ",t)
    return re.sub(r"\n{3,}","\n\n",t).strip()

def juntar(imgs):
    imgs=[i for i in imgs if i.width>2 and i.height>2]; largura=max(i.width for i in imgs)
    out=Image.new("RGB",(largura,sum(i.height for i in imgs)+12*(len(imgs)-1)),"white"); y=0
    for img in imgs: out.paste(img,(0,y)); y+=img.height+12
    return out

def salvar(img,caminho):
    caminho.parent.mkdir(parents=True,exist_ok=True)
    if img.width>1180: img=img.resize((1180,round(img.height*1180/img.width)),Image.Resampling.LANCZOS)
    img.save(caminho,"WEBP",quality=88,method=6)

def url(c): return "/"+c.relative_to(ROOT/"public").as_posix()

def materia(n,modelo):
    if modelo=="Espanhol": return "Língua Espanhola"
    if modelo=="Inglês": return "Língua Inglesa"
    return next(nome for limite,nome in [(15,"Língua Portuguesa"),(19,"Física"),(23,"Química"),(27,"Biologia"),(38,"Matemática"),(41,"História"),(44,"Geografia"),(47,"Filosofia"),(50,"Sociologia")] if n<=limite)

def gerar():
    for caminho in PDFS.values():
        if not caminho.exists(): raise FileNotFoundError(caminho)
    DESTINO.mkdir(parents=True,exist_ok=True); IMAGENS.mkdir(parents=True,exist_ok=True)
    provas={k:pdfplumber.open(v) for k,v in PDFS.items()}; documentos={k:pdfium.PdfDocument(v) for k,v in PDFS.items()}; cache={}
    palavras={k:{pg:provas[k].pages[pg].extract_words(x_tolerance=2,y_tolerance=3) for pg in range(2,13)} for k in PDFS}
    def render(k,pg):
        if (k,pg) not in cache: cache[(k,pg)]=documentos[k][pg].render(scale=ESCALA).to_pil().convert("RGB")
        return cache[(k,pg)]
    def recortes(k,inicio,fim,x0=23.0):
        imgs=[]
        for pg in range(inicio[0],fim[0]+1):
            y0=inicio[1] if pg==inicio[0] else TOPO; y1=fim[1] if pg==fim[0] else FUNDO
            if y1>y0+2: imgs.append(render(k,pg).crop((int(x0*ESCALA),int(y0*ESCALA),int(573*ESCALA),int(y1*ESCALA))))
        return imgs
    def texto_faixa(k,inicio,fim,x0=23.0):
        partes=[]
        for pg in range(inicio[0],fim[0]+1):
            y0=inicio[1] if pg==inicio[0] else TOPO; y1=fim[1] if pg==fim[0] else FUNDO
            if y1>y0+2: partes.append(provas[k].pages[pg].crop((x0,y0,573,y1)).extract_text(x_tolerance=2,y_tolerance=3) or "")
        return limpar("\n".join(partes))
    marcadores=[]
    for k,modelo in [("esp","Espanhol"),("ing","Inglês")]:
        encontrados=[Marcador(int(p["text"]),2,float(p["top"]),modelo,k) for p in palavras[k][2] if float(p["x0"])<50 and re.fullmatch(r"0[1-5]",p["text"])]
        if [m.numero for m in encontrados]!=list(range(1,6)): raise ValueError(f"Marcadores {modelo}: {encontrados}")
        marcadores.extend(encontrados)
    comuns=[]; esperado=6
    for pg in range(3,13):
        for p in palavras["ing"][pg]:
            if float(p["x0"])<50 and re.fullmatch(r"\**(?:0[6-9]|[1-4][0-9]|50)",p["text"]):
                n=int(p["text"].lstrip("*"))
                if n==esperado: comuns.append(Marcador(n,pg,float(p["top"]),"Prova geral","ing")); esperado+=1
    if [m.numero for m in comuns]!=list(range(6,51)): raise ValueError(f"Comuns: {[m.numero for m in comuns]}")
    marcadores.extend(comuns); grupos=[marcadores[:5],marcadores[5:10],marcadores[10:]]
    especiais={12:532.0,15:195.0,18:783.0,19:144.0,23:283.0,38:483.0,41:206.0,44:642.0,47:352.0,50:279.0}
    questoes=[]; gabaritos={"esp":[],"ing":[],"geral":[]}
    for grupo in grupos:
        for idx,m in enumerate(grupo):
            prox=grupo[idx+1] if idx+1<len(grupo) else None
            fim=((prox.pagina,prox.top-3) if prox and prox.pagina==m.pagina else (m.pagina,FUNDO))
            if m.modelo=="Prova geral" and m.numero in especiais: fim=(m.pagina,especiais[m.numero])
            if m.modelo=="Espanhol" and m.numero in {1:180.0,3:363.0}: fim=(m.pagina,{1:180.0,3:363.0}[m.numero])
            inicio=(m.pagina,m.top); alts=[]
            for p in palavras[m.pdfkey][m.pagina]:
                top=float(p["top"])
                if inicio[1]<=top<fim[1] and 40<float(p["x0"])<80 and re.fullmatch(r"►?[a-d]\)",p["text"]):
                    alts.append((p["text"],m.pagina,top,float(p["x1"])))
            if [a[0][-2] for a in alts]!=list("abcd"): raise ValueError(f"{m.modelo} {m.numero}: alternativas {alts}")
            corretas=[i for i,a in enumerate(alts) if a[0].startswith("►")]
            if len(corretas)!=1: raise ValueError(f"{m.modelo} {m.numero}: resposta {corretas}")
            resposta=corretas[0]; gabaritos["geral" if m.modelo=="Prova geral" else m.pdfkey].append("ABCD"[resposta])
            inicio_alts=(alts[0][1],alts[0][2]-3); sufixo={"Espanhol":"esp","Inglês":"ing","Prova geral":"geral"}[m.modelo]; base=f"q{m.numero:02d}-{sufixo}"
            enun_path=IMAGENS/f"{base}-enunciado.webp"; salvar(juntar(recortes(m.pdfkey,(m.pagina,m.top-4),inicio_alts)),enun_path)
            opcoes=[]; opcoes_imagens=[]
            for i,(rotulo,pg,top,x1) in enumerate(alts):
                fim_alt=((alts[i+1][1],alts[i+1][2]-2) if i<3 else fim); letra=rotulo[-2]; op_path=IMAGENS/f"{base}-{letra}.webp"
                salvar(juntar(recortes(m.pdfkey,(pg,top-2),fim_alt,x0=x1+3)),op_path)
                texto=re.sub(rf"^►?{letra}\)\s*","",texto_faixa(m.pdfkey,(pg,top),fim_alt))
                opcoes.append(texto or f"Alternativa {letra.upper()} — consulte o recorte oficial."); opcoes_imagens.append(url(op_path))
            enunciado=re.sub(rf"^\**{m.numero:02d}\s*-\s*","",texto_faixa(m.pdfkey,inicio,inicio_alts))
            disc=materia(m.numero,m.modelo)
            questoes.append({"id":f"ifpr-2023-{sufixo}-{m.numero:02d}","ano":2023,"numero_original":m.numero,"modelo":m.modelo,"materia":disc,"conteudo":disc,"banca":"IFPR","concurso":"Processo Seletivo IFPR 2023 - Cursos de Graduação","dificuldade":"Média","dificuldade_estimada":True,"enunciado":enunciado,"opcoes":opcoes,"resposta_correta":resposta,"anulada":False,"pagina":m.pagina+1,"fonte_pdf":FONTES[m.pdfkey],"fonte_gabarito":FONTES[m.pdfkey],"imagem_original":url(enun_path),"imagem_sem_alternativas":True,"opcoes_imagens":opcoes_imagens,"apoio":[],"texto_extraido_corrompido":True,"opcoes_texto_corrompido":[True]*4,"duplicata_oficial":m.modelo in {"Espanhol","Inglês"}})
    apoios=[
      (("ing","Inglês",range(1,4)),(2,62.0),(2,174.0),"apoio-ingles-q01-q03.webp"),
      (("esp","Espanhol",range(2,4)),(2,183.0),(2,232.0),"apoio-espanhol-q02-q03.webp"),
      (("esp","Espanhol",range(4,6)),(2,366.0),(2,497.0),"apoio-espanhol-q04-q05.webp"),
      (("ing","Prova geral",range(6,11)),(3,62.0),(3,328.0),"apoio-portugues-q06-q10.webp"),
      (("ing","Prova geral",range(13,15)),(4,534.0),(4,644.0),"apoio-portugues-q13-q14.webp"),
      (("ing","Prova geral",range(16,20)),(5,198.0),(5,278.0),"apoio-fisica-q16-q19.webp"),
    ]
    for (k,modelo,numeros),inicio,fim,nome in apoios:
        caminho=IMAGENS/nome; salvar(juntar(recortes(k,inicio,fim)),caminho); apoio={"imagem":url(caminho),"texto":texto_faixa(k,inicio,fim)}
        for q in questoes:
            if q["modelo"]==modelo and q["numero_original"] in numeros: q["apoio"]=[apoio]
    if len(questoes)!=55 or len({q["id"] for q in questoes})!=55: raise ValueError("Lote incompleto")
    print("Gabaritos:",{k:"".join(v) for k,v in gabaritos.items()})
    return questoes

if __name__=="__main__":
    lote=gerar(); arq=DESTINO/"questoes.json"; arq.write_text(json.dumps(lote,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8"); print(f"IFPR 2023: {len(lote)} questões em {arq}")



