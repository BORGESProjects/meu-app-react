"""Aplica apenas as alternativas conferidas; mantém recortes como fonte de auditoria."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def aplicar():
    arquivo = ROOT / 'public/acervo/espcex-2017-2026/questoes.json'
    itens = json.loads(arquivo.read_text(encoding='utf-8'))
    por_id = {q['id']: q for q in itens}
    manifesto = json.loads((ROOT / 'docs/acervo/espcex-alternativas-transcritas.json').read_text(encoding='utf-8'))
    assert len(por_id) == 1000
    for registro in manifesto['questoes']:
        q = por_id[registro['id']]
        assert q['resposta_correta'] == registro['resposta_correta']
        assert len(registro['opcoes']) == len(registro['fontes']) == 5
        assert all(t.strip() and 'consulte o recorte' not in t for t in registro['opcoes'])
        for indice, fonte in enumerate(registro['fontes']):
            assert fonte['imagem'] == q['opcoes_imagens'][indice]
            caminho = (ROOT / 'public' / fonte['imagem'].lstrip('/')).resolve()
            assert caminho.is_relative_to((ROOT / 'public').resolve())
            assert hashlib.sha256(caminho.read_bytes()).hexdigest() == fonte['sha256']
        q['opcoes'] = registro['opcoes']
        q['opcoes_em_texto'] = [True] * 5
        q['opcoes_texto_corrompido'] = [False] * 5
        for campo in ['blocos_opcoes', 'duplicata_oficial']:
            if campo in registro:
                q[campo] = registro[campo]
    arquivo.write_text(json.dumps(itens, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f"{len(manifesto['questoes'])} questões com cinco alternativas em texto; gabaritos preservados.")


if __name__ == '__main__':
    aplicar()
