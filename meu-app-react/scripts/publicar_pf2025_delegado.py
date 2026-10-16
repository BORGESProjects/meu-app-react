"""Publica o caderno de Delegado PF 2025 após revisão das seis páginas."""
import copy
import hashlib
import json
import re
import shutil
from importar_cebraspe import ROOT, gabarito

NOME = 'pf-2025-cargo-1'
DESTINO = ROOT / 'public/acervo/pf-2025-delegado'

# Blocos e comandos conferidos no caderno oficial, não inferidos por palavras-chave.
LIMITES = [(12, 'Direito Administrativo'), (24, 'Direito Constitucional'),
           (34, 'Direitos Humanos'), (38, 'Direito Civil'),
           (42, 'Direito Processual Civil'), (45, 'Direito Empresarial'),
           (51, 'Direito Internacional'), (73, 'Direito Penal'),
           (96, 'Direito Processual Penal'), (100, 'Criminologia'),
           (106, 'Direito Previdenciário'), (109, 'Direito Financeiro'),
           (112, 'Direito Tributário'), (120, 'Direito Ambiental')]
COMANDOS = [1, 4, 9, 13, 17, 21, 23, 25, 29, 31, 33, 35, 39, 41,
            43, 46, 50, 52, 55, 58, 61, 66, 69, 74, 79, 84, 88, 93,
            97, 99, 101, 105, 107, 110, 113, 116, 118, 119]


def preparar():
    meta = next(m for m in json.loads((ROOT / 'tmp/federais-manifesto-2025-prf.json').read_text(encoding='utf8')) if m['id'] == NOME)
    itens = json.loads((ROOT / f'tmp/{NOME}-questoes-revisar.json').read_text(encoding='utf8'))
    comandos = json.loads((ROOT / f'tmp/{NOME}-comandos-revisar.json').read_text(encoding='utf8'))
    assert [c['antes_de'] for c in comandos] == COMANDOS
    assert [q['numero_original'] for q in itens] == list(range(1, 121))
    respostas = gabarito(ROOT / f"tmp/federais/{meta['gabarito_local']}.pdf")
    assert sorted(respostas) == list(range(1, 121))
    DESTINO.mkdir(parents=True, exist_ok=True)
    for q in itens:
        n = q['numero_original']
        comando = next(c for c in reversed(comandos) if c['antes_de'] <= n)
        # Cada grupo deste caderno tem um único comando autossuficiente.
        # Remove herança indevida de casos/matérias anteriores, mantendo a imagem original.
        apoio = [a for a in q['apoio'] if a['texto'] == comando['texto']]
        assert len(apoio) == 1, (n, 'Comando ausente ou ambíguo')
        q['apoio'] = copy.deepcopy(apoio)
        q['materia'] = next(m for limite, m in LIMITES if n <= limite)
        q['conteudo'] = q['materia']
        q['rotulos_opcoes'] = ['C', 'E']
        q['gabarito_oficial'] = respostas[n]
        assert q['resposta_correta'] == (None if respostas[n] == 'X' else 0 if respostas[n] == 'C' else 1)
        assert q['opcoes'] == ['Certo', 'Errado']
        q['chave_oficial'] = hashlib.sha256(f'pf-2025-delegado|{n}'.encode()).hexdigest()
        for registro, campo in [(q, 'imagem_original')] + [(a, 'imagem') for a in q['apoio']]:
            origem = ROOT / 'public' / registro[campo].lstrip('/')
            novo = DESTINO / origem.name
            shutil.copyfile(origem, novo)
            registro[campo] = '/' + novo.relative_to(ROOT / 'public').as_posix()
        for a in q['apoio']:
            a['texto'] = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', a['texto'])
    manifesto = dict(caderno='pf-2025-delegado', concurso=itens[0]['concurso'], itens=120,
                     corrigiveis=sum(l != 'X' for l in respostas.values()),
                     anuladas=[n for n, l in respostas.items() if l == 'X'],
                     respostas=''.join(respostas[n] for n in range(1, 121)),
                     fonte_pdf=meta['fonte_pdf'], fonte_gabarito=meta['fonte_gabarito'],
                     sha256_pdf=hashlib.sha256((ROOT / f"tmp/federais/{meta['prova_local']}.pdf").read_bytes()).hexdigest(),
                     sha256_gabarito=hashlib.sha256((ROOT / f"tmp/federais/{meta['gabarito_local']}.pdf").read_bytes()).hexdigest())
    (DESTINO / 'questoes.json').write_text(json.dumps(itens, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf8')
    (DESTINO / 'manifesto.json').write_text(json.dumps(manifesto, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('PF 2025 Delegado:', len(itens), 'itens;', manifesto['corrigiveis'], 'corrigíveis')


if __name__ == '__main__':
    preparar()
