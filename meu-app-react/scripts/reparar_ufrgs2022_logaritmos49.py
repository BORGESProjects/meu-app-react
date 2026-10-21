"""Recupera a questão 49 na página 26; coordenadas proporcionais ao render."""
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
arquivo = ROOT / 'public/acervo/ufrgs-2022/questoes.json'
prefixo = ROOT / 'tmp/ufrgs-2022/revisao-p26'
subprocess.run(['pdftoppm', '-f', '26', '-l', '26', '-scale-to', '2000',
                '-png', '-singlefile', str(ROOT / 'tmp/ufrgs-2022/prova-dia1.pdf'), str(prefixo)], check=True)
imagem = Image.open(str(prefixo) + '.png').convert('RGB')
destino = arquivo.parent / 'imagens/reparadas'
destino.mkdir(exist_ok=True)
def recortar(sufixo, caixa):
    nome = f'ufrgs-2022-d1-49-{sufixo}.webp'
    imagem.crop(tuple(round(v * (imagem.width if i % 2 == 0 else imagem.height))
                      for i, v in enumerate(caixa))).save(destino / nome, 'WEBP', quality=94)
    return '/acervo/ufrgs-2022/imagens/reparadas/' + nome

questoes = json.loads(arquivo.read_text(encoding='utf-8'))
q = next(q for q in questoes if q['id'] == 'ufrgs-2022-d1-49')
assert q['resposta_correta'] == 0  # Gabarito já armazenado; não inferir outra resposta.
q.update(enunciado='Se log₂ x + (log₂ x)² = 12, então o valor de x é',
         opcoes=['8 ou 1/16.', '1/8 ou 16.', '−4 ou 3.', '4 ou −3.', '2¹².'],
         imagem_original=recortar('enunciado-revisado', (.115, .104, .505, .145)),
         opcoes_imagens=[recortar(chr(65+i)+'-revisada', (.15, topo, .31, base))
                         for i, (topo, base) in enumerate([
                             (.166, .202), (.208, .244), (.253, .273),
                             (.278, .298), (.303, .324)])],
         imagem_sem_alternativas=True, texto_extraido_corrompido=True,
         opcoes_texto_corrompido=[True]*5)
arquivo.write_text(json.dumps(questoes, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
print('UFRGS 2022, questão 49: fórmula e cinco alternativas recuperadas.')
