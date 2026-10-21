"""Decodifica as imagens referidas pelo acervo, sem alterar os arquivos."""
import json
import hashlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=(ROOT/'public').resolve()
manifesto=(ROOT/'tmp/imagens-auditoria.json').read_bytes()
arquivos=json.loads(manifesto)
def verificar(url):
 arquivo=(PUBLIC/('.'+url)).resolve()
 if not arquivo.is_relative_to(PUBLIC):return {'url':url,'erro':'Caminho fora de public'}
 try:
  with Image.open(arquivo) as imagem:
   imagem.load()
   if imagem.width<2 or imagem.height<2:raise ValueError('Imagem sem área útil')
 except Exception as erro:return {'url':url,'erro':str(erro)}
 return None
with ThreadPoolExecutor(max_workers=4) as executor:
 erros=[r for r in executor.map(verificar,arquivos) if r]
resultado={'verificadas':len(arquivos),'manifesto_sha256':hashlib.sha256(manifesto).hexdigest(),'invalidas':erros,'metodo':'Decodificação integral dos pixels; não é conferência semântica do recorte.'}
(ROOT/'tmp/auditoria-pixels.json').write_text(json.dumps(resultado,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(resultado,ensure_ascii=False))
if erros:raise SystemExit(1)
