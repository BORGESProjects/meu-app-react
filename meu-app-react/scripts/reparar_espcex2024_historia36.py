"""Restaura a questão 36, cuja alternativa C tinha um recorte vazio."""
import json
import subprocess
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ARQUIVO=ROOT/'public/acervo/espcex-2017-2026/questoes.json'
PDF=ROOT/'tmp/espcex-2017-2026/2024/prova-dia2.pdf'
PREFIXO=ROOT/'tmp/espcex-2017-2026/q36-revisao-2024'
subprocess.run(['pdftoppm','-f','17','-l','17','-scale-to','1800','-png','-singlefile',str(PDF),str(PREFIXO)],check=True)
img=Image.open(str(PREFIXO)+'.png').convert('RGB')
if img.size!=(1341,1800):raise ValueError('Dimensões diferentes da página conferida')
DESTINO=ARQUIVO.parent/'imagens/reparadas'
regioes={'enunciado':(100,1455,1240,1598),'A':(170,1602,720,1637),'B':(737,1602,1238,1637),'C':(170,1638,720,1674),'D':(737,1638,1238,1674),'E':(170,1675,720,1710)}
caminhos={}
for parte,box in regioes.items():
 nome=f'espcex-2024-d2-36-revisada-{parte}.webp'
 img.crop(box).save(DESTINO/nome,'WEBP',quality=94)
 caminhos[parte]='/acervo/espcex-2017-2026/imagens/reparadas/'+nome
qs=json.loads(ARQUIVO.read_text(encoding='utf-8'))
q=next(q for q in qs if q['id']=='espcex-2024-d2-36')
if q['resposta_correta']!=2:raise ValueError('Chave diferente da revisão anterior')
q['enunciado']='Ao longo da História, houve diversas divisões entre os seguidores do Cristianismo Católico. Uma delas espalhou-se por diversas regiões da Europa Ocidental, dando origem a correntes locais, como, por exemplo, a dos huguenotes (na França), a dos puritanos (na Inglaterra) e a dos presbiterianos (na Escócia). Trata-se, aqui, do(a)'
q['opcoes']=['Luteranismo (ou Doutrina Luterana).','Contrarreforma (ou Reforma Católica).','Calvinismo (ou Reforma Calvinista).','Anglicanismo (ou Reforma Anglicana).','Cisma do Ocidente.']
q['imagem_original']=caminhos['enunciado'];q['opcoes_imagens']=[caminhos[l] for l in 'ABCDE'];q['imagem_sem_alternativas']=True
ARQUIVO.write_text(json.dumps(qs,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('EsPCEx 2024: enunciado integral e cinco alternativas recuperados, mantendo a chave C.')
