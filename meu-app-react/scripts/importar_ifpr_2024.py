"""Importa o caderno oficial definitivo do Processo Seletivo IFPR 2024.

O PDF contém duas opções de língua estrangeira, com cinco questões cada,
e 45 questões comuns. O acervo publica os 55 itens disponíveis no caderno.
"""
from __future__ import annotations
import json, re
from dataclasses import dataclass
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/"tmp/ifpr-2024-graduacao-oficial.pdf"
DESTINO=ROOT/"public/acervo/ifpr-2024"
IMAGENS=DESTINO/"imagens"
ESCALA=2.0; TOPO=38.0; FUNDO=805.0
FONTE="https://servicos.nc.ufpr.br/documentos/ifpr2024/provas/definitivo/geral_graduacao.pdf"

@dataclass(frozen=True)
class Marcador:
    numero:int; pagina:int; top:float; modelo:str

def limpar(texto):
    texto=texto.replace("\u00ad","").replace("►","").replace("�","")
    texto=re.sub(r"(?<=\w)-\s*\n\s*(?=\w)","",texto)
    texto=re.sub(r"[ \t]+"," ",texto)
    return re.sub(r"\n{3,}","\n\n",texto).strip()

def juntar(imagens):
    imagens=[i for i in imagens if i.width>2 and i.height>2]
    largura=max(i.width for i in imagens)
    saida=Image.new("RGB",(largura,sum(i.height for i in imagens)+12*(len(imagens)-1)),"white")
    y=0
    for imagem in imagens:
        saida.paste(imagem,(0,y)); y+=imagem.height+12
    return saida

def salvar(imagem,caminho):
    caminho.parent.mkdir(parents=True,exist_ok=True)
    if imagem.width>1180:
        imagem=imagem.resize((1180,round(imagem.height*1180/imagem.width)),Image.Resampling.LANCZOS)
    imagem.save(caminho,"WEBP",quality=88,method=6)

def url(caminho): return "/"+caminho.relative_to(ROOT/"public").as_posix()

def materia(numero,modelo):
    if modelo=="Espanhol": return "Língua Espanhola"
    if modelo=="Inglês": return "Língua Inglesa"
    return next(nome for limite,nome in [(15,"Língua Portuguesa"),(19,"Física"),(23,"Química"),(27,"Biologia"),(38,"Matemática"),(41,"História"),(44,"Geografia"),(47,"Filosofia"),(50,"Sociologia")] if numero<=limite)

def gerar():
    if not PDF.exists(): raise FileNotFoundError(f"Caderno oficial não encontrado: {PDF}")
    DESTINO.mkdir(parents=True,exist_ok=True); IMAGENS.mkdir(parents=True,exist_ok=True)
    prova=pdfplumber.open(PDF); documento=pdfium.PdfDocument(PDF); cache={}
    def render(pagina):
        if pagina not in cache: cache[pagina]=documento[pagina].render(scale=ESCALA).to_pil().convert("RGB")
        return cache[pagina]
    def recortes(inicio,fim,x0=23.0):
        imagens=[]
        for pagina in range(inicio[0],fim[0]+1):
            y0=inicio[1] if pagina==inicio[0] else TOPO
            y1=fim[1] if pagina==fim[0] else FUNDO
            if y1>y0+2: imagens.append(render(pagina).crop((int(x0*ESCALA),int(y0*ESCALA),int(573*ESCALA),int(y1*ESCALA))))
        return imagens
    def texto_faixa(inicio,fim,x0=23.0):
        partes=[]
        for pagina in range(inicio[0],fim[0]+1):
            y0=inicio[1] if pagina==inicio[0] else TOPO
            y1=fim[1] if pagina==fim[0] else FUNDO
            if y1>y0+2: partes.append(prova.pages[pagina].crop((x0,y0,573,y1)).extract_text(x_tolerance=2,y_tolerance=3) or "")
        return limpar("\n".join(partes))
    palavras={pagina:prova.pages[pagina].extract_words(x_tolerance=2,y_tolerance=3) for pagina in range(2,13)}
    marcadores=[]
    for pagina,modelo in [(2,"Espanhol"),(3,"Inglês")]:
        encontrados=[Marcador(int(p["text"]),pagina,float(p["top"]),modelo) for p in palavras[pagina] if float(p["x0"])<50 and re.fullmatch(r"0[1-5]",p["text"])]
        if [m.numero for m in encontrados]!=list(range(1,6)): raise ValueError(f"Marcadores de {modelo} inválidos: {encontrados}")
        marcadores.extend(encontrados)
    comuns=[]; esperado=6
    for pagina in range(4,13):
        for p in palavras[pagina]:
            if float(p["x0"])<50 and re.fullmatch(r"\*?(?:0[6-9]|[1-4][0-9]|50)",p["text"]):
                numero=int(p["text"].lstrip("*"))
                if numero==esperado:
                    comuns.append(Marcador(numero,pagina,float(p["top"]),"Prova geral")); esperado+=1
    if [m.numero for m in comuns]!=list(range(6,51)): raise ValueError(f"Questões comuns localizadas: {[m.numero for m in comuns]}")
    marcadores.extend(comuns)
    grupos=[marcadores[:5],marcadores[5:10],marcadores[10:]]
    questoes=[]; respostas=[]
    for grupo in grupos:
        for indice,marcador in enumerate(grupo):
            proximo=grupo[indice+1] if indice+1<len(grupo) else None
            fim=((proximo.pagina,proximo.top-3) if proximo and proximo.pagina==marcador.pagina else (marcador.pagina,FUNDO))
            if marcador.modelo=="Prova geral" and marcador.numero in {19:498.0,23:569.0,27:261.0,38:662.0,41:636.0,44:374.0}: fim=(marcador.pagina,{19:498.0,23:569.0,27:261.0,38:662.0,41:636.0,44:374.0}[marcador.numero])
            if marcador.modelo=="Inglês" and marcador.numero==2: fim=(marcador.pagina,312.0)
            inicio=(marcador.pagina,marcador.top)
            alternativas=[(p["text"],marcador.pagina,float(p["top"]),float(p["x1"])) for p in palavras[marcador.pagina] if inicio[1]<=float(p["top"])<fim[1] and 40<float(p["x0"])<80 and re.fullmatch(r"►?[a-d]\)",p["text"])]
            if [a[0][-2] for a in alternativas]!=list("abcd"): raise ValueError(f"Questão {marcador.modelo} {marcador.numero}: alternativas {alternativas}")
            corretas=[i for i,a in enumerate(alternativas) if a[0].startswith("►")]
            anulada=marcador.modelo=="Prova geral" and marcador.numero==35
            if anulada:
                if corretas: raise ValueError("A questão 35 anulada não deveria ter resposta marcada.")
                resposta=None
            else:
                if len(corretas)!=1: raise ValueError(f"Questão {marcador.modelo} {marcador.numero}: gabarito {corretas}")
                resposta=corretas[0]; respostas.append("ABCD"[resposta])
            inicio_alts=(alternativas[0][1],alternativas[0][2]-3)
            sufixo={"Espanhol":"esp","Inglês":"ing","Prova geral":"geral"}[marcador.modelo]
            base=f"q{marcador.numero:02d}-{sufixo}"
            caminho_enun=IMAGENS/f"{base}-enunciado.webp"
            salvar(juntar(recortes((marcador.pagina,marcador.top-4),inicio_alts)),caminho_enun)
            opcoes=[]; opcoes_imagens=[]
            for i,(rotulo,pagina,top,x1) in enumerate(alternativas):
                fim_alt=((alternativas[i+1][1],alternativas[i+1][2]-2) if i<3 else fim)
                letra=rotulo[-2]; caminho_op=IMAGENS/f"{base}-{letra}.webp"
                # O recorte começa após o rótulo, removendo o triângulo do gabarito.
                salvar(juntar(recortes((pagina,top-2),fim_alt,x0=x1+3.0)),caminho_op)
                texto=re.sub(rf"^►?{letra}\)\s*","",texto_faixa((pagina,top),fim_alt))
                opcoes.append(texto or f"Alternativa {letra.upper()} — consulte o recorte oficial.")
                opcoes_imagens.append(url(caminho_op))
            enunciado=re.sub(rf"^\*?{marcador.numero:02d}\s*-\s*","",texto_faixa(inicio,inicio_alts))
            disciplina=materia(marcador.numero,marcador.modelo)
            questoes.append({"id":f"ifpr-2024-{sufixo}-{marcador.numero:02d}","ano":2024,"numero_original":marcador.numero,"modelo":marcador.modelo,"materia":disciplina,"conteudo":disciplina,"banca":"IFPR","concurso":"Processo Seletivo IFPR 2024 - Cursos de Graduação","dificuldade":"Média","dificuldade_estimada":True,"enunciado":enunciado,"opcoes":opcoes,"resposta_correta":resposta,"anulada":anulada,"pagina":marcador.pagina+1,"fonte_pdf":FONTE,"fonte_gabarito":FONTE,"imagem_original":url(caminho_enun),"imagem_sem_alternativas":True,"opcoes_imagens":opcoes_imagens,"apoio":[],"texto_extraido_corrompido":True,"opcoes_texto_corrompido":[True]*4,"duplicata_oficial":marcador.modelo in {"Espanhol","Inglês"}})
    apoios=[
        (("Espanhol",range(1,4)),(2,63.0),(2,174.0),"apoio-espanhol-q01-q03.webp"),
        (("Inglês",range(1,3)),(3,62.0),(3,174.0),"apoio-ingles-q01-q02.webp"),
        (("Inglês",range(3,5)),(3,322.0),(3,439.0),"apoio-ingles-q03-q04.webp"),
        (("Prova geral",range(6,14)),(4,62.0),(4,415.0),"apoio-portugues-q06-q13.webp"),
        (("Prova geral",range(16,20)),(6,62.0),(6,120.0),"apoio-fisica-q16-q19.webp"),
    ]
    for (modelo,numeros),inicio,fim,nome in apoios:
        caminho=IMAGENS/nome; salvar(juntar(recortes(inicio,fim)),caminho)
        apoio={"imagem":url(caminho),"texto":texto_faixa(inicio,fim)}
        for questao in questoes:
            if questao["modelo"]==modelo and questao["numero_original"] in numeros: questao["apoio"]=[apoio]
    if len(questoes)!=55 or len({q["id"] for q in questoes})!=55: raise ValueError("Lote IFPR 2024 incompleto.")
    if sum(q["anulada"] for q in questoes)!=1: raise ValueError("A questão 35 anulada não foi preservada corretamente.")
    print("Gabaritos detectados (sem a anulada):","".join(respostas))
    return questoes

if __name__=="__main__":
    lote=gerar(); arquivo=DESTINO/"questoes.json"
    arquivo.write_text(json.dumps(lote,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print(f"IFPR 2024: {len(lote)} questões oficiais gravadas em {arquivo}")







