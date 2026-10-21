"""Recupera os apoios e separa a tabela das alternativas da página 13."""
import json
import subprocess
from pathlib import Path
import pdfplumber
from PIL import Image
from importar_ufrgs_2023 import GABARITO_DIA_2

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'tmp/ufrgs-2023/prova-dia2.pdf'
ARQUIVO=ROOT/'public/acervo/ufrgs-2023/questoes.json'
DESTINO=ARQUIVO.parent/'imagens/reparadas'
PREFIXO=ROOT/'tmp/ufrgs-2023/revisao-p13'
subprocess.run(['pdftoppm','-f','13','-l','13','-scale-to','1800','-png','-singlefile',str(PDF),str(PREFIXO)],check=True)
pagina=pdfplumber.open(PDF).pages[12]
imagem=Image.open(str(PREFIXO)+'.png').convert('RGB')
sx,sy=imagem.width/pagina.width,imagem.height/pagina.height
questoes=json.loads(ARQUIVO.read_text(encoding='utf-8'))
for numero,topo,fundo in [(26,85,325),(27,395,654)]:
 q=next(q for q in questoes if q['id']==f'ufrgs-2023-d2-{numero}')
 resposta=ord(GABARITO_DIA_2[numero-1])-ord('A')
 if q['resposta_correta']!=resposta:raise ValueError('Gabarito anterior diverge do oficial')
 nome=f'ufrgs-2023-d2-{numero}-enunciado.webp'
 imagem.crop((round(65*sx),round(topo*sy),round(560*sx),round(fundo*sy))).save(DESTINO/nome,'WEBP',quality=92)
 q.update(imagem_original='/acervo/ufrgs-2023/imagens/reparadas/'+nome,imagem_sem_alternativas=True,pagina=13,texto_extraido_corrompido=True)
 if numero==27:q['opcoes']=['1,00 r.','2,00 r.','0,71 r.','1,41 r.','0,50 r.']
ARQUIVO.write_text(json.dumps(questoes,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('Dois enunciados completos recuperados; tabela mantida na questão 26 e alternativas da 27 separadas.')
