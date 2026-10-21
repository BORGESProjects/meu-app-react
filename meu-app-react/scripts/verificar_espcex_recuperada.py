"""Confere imagens e fontes da recuperação EsPCEx sem alterar o acervo.

Uso: python scripts/verificar_espcex_recuperada.py [--fontes]
O manifesto guarda as caixas e máscaras conferidas no caderno renderizado
com pdftoppm -scale-to 2200. As fontes PDF ficam em tmp, fora da publicação.
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def verificar():
    manifesto = json.loads((ROOT / 'docs/acervo/espcex-recuperacao-integral.json').read_text(encoding='utf-8'))
    questoes = {q['id']: q for q in json.loads((ROOT / 'public/acervo/espcex-2017-2026/questoes.json').read_text(encoding='utf-8'))}
    assert len(questoes) == 1000
    assert len(manifesto['questoes']) == 248
    assert len(manifesto['pendentes_recuperadas']) == 123
    for registro in manifesto['questoes']:
        q = questoes[registro['id']]
        assert len(q['opcoes_imagens']) == 5
        assert q['resposta_correta'] == registro['resposta_correta']
        assert q['pagina'] == registro['pagina']
        assert q['imagem_sem_alternativas']
    for registro in manifesto['arquivos']:
        arquivo = (ROOT / 'public' / registro['url'].lstrip('/')).resolve()
        assert arquivo.is_relative_to((ROOT / 'public').resolve())
        assert hashlib.sha256(arquivo.read_bytes()).hexdigest() == registro['sha256'], registro['url']
        with Image.open(arquivo) as im:
            im.load()
            assert list(im.size) == registro['dimensoes']
    if '--fontes' in sys.argv:
        for fonte in manifesto['fontes']:
            arquivo = ROOT / fonte['arquivo']
            assert hashlib.sha256(arquivo.read_bytes()).hexdigest() == fonte['sha256'], str(arquivo)
    print(f"248 questões, 123 pendências recuperadas e {len(manifesto['arquivos'])} imagens conferidas.")


if __name__ == '__main__':
    verificar()
