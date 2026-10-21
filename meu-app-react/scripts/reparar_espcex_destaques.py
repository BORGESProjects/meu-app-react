"""Preserva tipografia de questões e alternativas diretamente no caderno."""
import json
import re
import subprocess
from pathlib import Path
import pdfplumber
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ARQUIVO=ROOT/'public/acervo/espcex-2017-2026/questoes.json'
DESTINO=ARQUIVO.parent/'imagens/reparadas'
IDS={
 'espcex-2017-d1-03','espcex-2018-d1-08','espcex-2019-d1-08','espcex-2019-d1-12',
 'espcex-2020-d1-12','espcex-2020-d1-15','espcex-2021-d1-09','espcex-2021-d1-12',
 'espcex-2021-d1-15','espcex-2021-d1-16','espcex-2022-d1-08','espcex-2022-d1-12',
 'espcex-2022-d1-13','espcex-2022-d1-16','espcex-2025-d1-06','espcex-2025-d1-07',
 'espcex-2025-d1-12','espcex-2025-d1-14',
}
questoes=json.loads(ARQUIVO.read_text(encoding='utf-8'))
cache={};recortes=[]
for q in [q for q in questoes if q['id'] in IDS]:
 ano,dia,numero,pagina=q['ano'],q['dia'],q['numero_original'],q['pagina']
 pdf=ROOT/f'tmp/espcex-2017-2026/{ano}/prova-dia{dia}.pdf'
 chave=(ano,dia,pagina)
 if chave not in cache:
  p=pdfplumber.open(pdf).pages[pagina-1]
  prefixo=ROOT/f'tmp/espcex-2017-2026/destaques-{ano}-{dia}-{pagina}'
  subprocess.run(['pdftoppm','-f',str(pagina),'-l',str(pagina),'-scale-to','2200','-png','-singlefile',str(pdf),str(prefixo)],check=True)
  cache[chave]=(p,Image.open(str(prefixo)+'.png').convert('RGB'))
 p,img=cache[chave];sx,sy=img.width/p.width,img.height/p.height
 palavras=p.extract_words(x_tolerance=2,y_tolerance=3)
 candidatos=[w for w in palavras if w['x0']<65 and re.fullmatch(rf'0?{numero}',w['text'].lstrip('*'))]
 if len(candidatos)!=1:raise ValueError(f"Marcador ambíguo: {q['id']}")
 inicio=candidatos[0]['top']
 proximas=[w['top'] for w in palavras if w['x0']<65 and w['top']>inicio+10 and re.fullmatch(rf'0?{numero+1}',w['text'].lstrip('*'))]
 fundo=min(proximas,default=p.height-28)-4
 alts=[w for w in palavras if inicio<=w['top']<fundo and re.fullmatch(r'(?:\[[A-E]\]|\([A-E]\)|[A-E]\))',w['text'])]
 alts.sort(key=lambda w:(w['top'],w['x0']))
 if [re.sub(r'[^A-E]','',w['text']) for w in alts]!=list('ABCDE'):raise ValueError(f"Alternativas ambíguas: {q['id']}")
 esquerda,direita=25,p.width-22
 def salvar(nome,topo,base,x0=esquerda,x1=direita):
  if base<=topo:raise ValueError('Recorte vazio')
  img.crop((round(x0*sx),round(topo*sy),round(x1*sx),round(base*sy))).save(DESTINO/nome,'WEBP',quality=92)
  return '/acervo/espcex-2017-2026/imagens/reparadas/'+nome
 q['imagem_original']=salvar(q['id']+'-destaques-enunciado.webp',inicio-4,alts[0]['top']-3)
 imagens=[]
 for i,a in enumerate(alts):
  linha=[w for w in alts if abs(w['top']-a['top'])<3]
  seguintes=[w for w in alts if w['top']>a['top']+3]
  base=min([w['top']-0.5 for w in seguintes],default=fundo)
  x0,x1=esquerda,direita
  if len(linha)>1:
   x0=a['x0']-3
   x1=min([w['x0']-4 for w in linha if w['x0']>a['x0']],default=direita)
  linhas=[w['bottom'] for w in palavras if a['top']-1<=w['top'] and w['bottom']<base and x0<=w['x0']<x1]
  if linhas:base=min(base,max(linhas)+3)
  imagens.append(salvar(q['id']+f'-destaques-{chr(65+i)}.webp',a['top']-2,base,x0,x1))
 q['opcoes_imagens']=imagens
 q['imagem_sem_alternativas']=True;q['texto_extraido_corrompido']=True
 q['opcoes_texto_corrompido']=[True]*5
 recortes.append({'id':q['id'],'pagina':pagina,'enunciado':q['imagem_original'],'alternativas':q['opcoes_imagens']})
if len(recortes)!=len(IDS):raise ValueError('Faltam questões')
ARQUIVO.write_text(json.dumps(questoes,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
(ROOT/'docs/acervo/reparacao-destaques-espcex.json').write_text(json.dumps(recortes,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(recortes)} questões recuperadas com enunciado e cinco alternativas separados.')
