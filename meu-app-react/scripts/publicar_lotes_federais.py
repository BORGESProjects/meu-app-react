import hashlib,json,re,shutil
from pathlib import Path
from importar_cebraspe import ROOT,gabarito
APROVADOS=['prf-2019','pf-2021-delegado']
def classificar(nome,n):
 if nome=='prf-2019':
  limites=[(20,'Língua Portuguesa'),(28,'Matemática'),(34,'Informática'),(40,'Física'),(44,'Ética no serviço público'),(48,'Geografia'),(50,'História da PRF'),(90,'Legislação de trânsito'),(95,'Direito Administrativo'),(100,'Direito Constitucional'),(102,'Direito Penal'),(105,'Direito Processual Penal'),(108,'Direito Penal'),(110,'Direito Processual Penal'),(115,'Legislação penal especial'),(120,'Direitos Humanos')]
 else:
  limites=[(15,'Direito Administrativo'),(30,'Direito Constitucional'),(33,'Direito Civil'),(36,'Direito Processual Civil'),(39,'Direito Empresarial'),(43,'Direito Internacional'),(85,'Direito Penal'),(102,'Direito Processual Penal'),(105,'Criminologia'),(113,'Direito Previdenciário'),(115,'Direito Financeiro'),(120,'Direito Tributário')]
 return next(m for lim,m in limites if n<=lim)
def preparar(nome):
 assert nome in APROVADOS,'Caderno ainda não aprovado na revisão visual'
 itens=json.loads((ROOT/f'tmp/{nome}-questoes-revisar.json').read_text(encoding='utf8'))
 respostas=gabarito(ROOT/f'tmp/federais/{nome}-gabarito.pdf')
 assert sorted(respostas)==list(range(1,121))
 assert [q['numero_original'] for q in itens]==list(range(1,121))
 destino=ROOT/f'public/acervo/{nome}';destino.mkdir(parents=True,exist_ok=True)
 for q in itens:
  n=q['numero_original'];resp=respostas[n]
  assert q['resposta_correta']==(None if resp=='X' else 0 if resp=='C' else 1)
  assert q['opcoes']==['Certo','Errado']
  q['materia']=classificar(nome,n);q['conteudo']=q['materia']
  q['apoio']=[a for a in q['apoio'] if not re.fullmatch(r'Espaço livre\s*(?:TEXTO)?',a['texto'],re.I)]
  for registro,campo in [(q,'imagem_original')]+[(a,'imagem') for a in q['apoio']]:
   origem=ROOT/'public'/registro[campo].lstrip('/');novo=destino/origem.name
   shutil.copyfile(origem,novo);registro[campo]='/'+novo.relative_to(ROOT/'public').as_posix()
  for a in q['apoio']:a['texto']=re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]','',a['texto'])
  q['chave_oficial']=hashlib.sha256(f'{nome}|{n}'.encode()).hexdigest();q['gabarito_oficial']=resp
 (destino/'questoes.json').write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
 manifesto=dict(caderno=nome,itens=len(itens),corrigiveis=sum(not q['anulada'] for q in itens),anuladas=[q['numero_original'] for q in itens if q['anulada']],fonte_pdf=itens[0]['fonte_pdf'],fonte_gabarito=itens[0]['fonte_gabarito'],sha256_pdf=hashlib.sha256((ROOT/f'tmp/federais/{nome}.pdf').read_bytes()).hexdigest(),sha256_gabarito=hashlib.sha256((ROOT/f'tmp/federais/{nome}-gabarito.pdf').read_bytes()).hexdigest(),respostas=''.join(respostas[n] for n in range(1,121)))
 (destino/'manifesto.json').write_text(json.dumps(manifesto,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(nome,manifesto['itens'],manifesto['corrigiveis'])
if __name__=='__main__':
 for nome in APROVADOS:preparar(nome)
