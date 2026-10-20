"""Audit a course CSV against its original PDFs, without publishing unverified data.

The CSV is an index, never a source of truth for answer keys or crop boundaries.
Only unambiguous single-column documents are reconstructed here. Other layouts
remain in quarantine for a layout-specific extractor.
"""
from pathlib import Path
import collections
import csv
import hashlib
import json
import re
import unicodedata

import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'tmp/teorema-180-revisao'
PACKAGE = WORK / 'teorema_180_extracao'
QUESTION = re.compile(r'^(\d{1,3})\s*[.)]\s+(?![A-Ea-e]\s*$)(\S.*)')
OPTION = re.compile(r'^(?:\[([A-Ea-e])\]|([A-Ea-e])\))\s*')
KEY = re.compile(r'\b(\d{1,3})\s*[-–—.)]\s*([A-Ea-e])\b')


def fold(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())


def read_rows():
    with (PACKAGE / 'questoes_teorema_180_completo.csv').open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def parse_document(path):
    lines = []
    sizes = []
    with pdfplumber.open(path) as pdf:
        if len(pdf.pages) > 30:
            raise ValueError('documento extenso exige revisão de contextos compartilhados')
        for number, page in enumerate(pdf.pages):
            if number < 3:
                words = page.extract_words(x_tolerance=2)
                if any(re.fullmatch(r'\d{1,3}[.)]', w['text']) and page.width * .45 < w['x0'] < page.width * .65 and w['top'] > 65 for w in words):
                    raise ValueError('layout em colunas requer segmentação própria')
            sizes.append([page.width, page.height])
            for line in page.extract_text_lines(x_tolerance=2, y_tolerance=3, strip=True):
                # Preserve the body, removing only page furniture. Documents
                # with questions outside these bounds fail the coverage check.
                if 65 <= line['top'] < page.height - 45:
                    lines.append({k: line[k] for k in ['text', 'x0', 'x1', 'top', 'bottom']} | {'pagina': number})
    key_start = next((i for i, l in enumerate(lines) if re.match(r'^GABARITO\s*[:;]?\s*', l['text'], re.I)), None)
    if key_start is None:
        raise ValueError('gabarito explícito não localizado')
    answers = collections.defaultdict(set)
    for line in lines[key_start:]:
        for m in KEY.finditer(line['text']):
            answers[int(m[1])].add(m[2].upper())
    body = lines[:key_start]
    starts = [(i, int(m[1])) for i, line in enumerate(body) if (m := QUESTION.match(line['text']))]
    if not starts or [n for _, n in starts] != list(range(1, len(starts) + 1)):
        raise ValueError('numeração não sequencial ou leitura de colunas ambígua')
    if any(body[i]['x0'] > sizes[body[i]['pagina']][0] * .28 for i, _ in starts):
        raise ValueError('layout em colunas requer segmentação própria')
    if not all(len(answers[n]) == 1 for _, n in starts):
        raise ValueError('gabarito incompleto ou ambíguo')
    questions = {}
    for index, (start, n) in enumerate(starts):
        end = starts[index + 1][0] if index + 1 < len(starts) else key_start
        block = lines[start:end]
        opts = [(i, (m[1] or m[2]).upper()) for i, line in enumerate(block) if (m := OPTION.match(line['text']))]
        if [label for _, label in opts] not in [list('ABCDE'), list('ABCD')]:
            continue
        if not opts[0][0]:
            continue
        boundaries = [0] + [i for i, _ in opts] + [len(block)]
        parts = []
        for a, b in zip(boundaries, boundaries[1:]):
            ls = block[a:b]
            next_line = block[b] if b < len(block) else lines[end]
            rects = []
            for p in range(ls[0]['pagina'], ls[-1]['pagina'] + 1):
                relevant = [l for l in ls if l['pagina'] == p]
                if not relevant:
                    raise ValueError('continuação sem texto detectável')
                top = relevant[0]['top'] - 3 if p == ls[0]['pagina'] else 65
                bottom = relevant[-1]['bottom'] + 5
                # Include all space (and figures) between consecutive text
                # blocks, but never the following alternative/question/key.
                if next_line['pagina'] == p:
                    if next_line['top'] <= relevant[-1]['bottom']:
                        raise ValueError('blocos sobrepostos ou alternativas na mesma linha')
                    bottom = next_line['top'] - .5
                elif p < ls[-1]['pagina']:
                    bottom = sizes[p][1] - 45
                if next_line['pagina'] == p and bottom >= next_line['top']:
                    raise ValueError('recorte invade bloco seguinte')
                rects.append({'pagina': p, 'bbox': [25, top, sizes[p][0] - 25, bottom]})
            parts.append({'texto': '\n'.join(l['text'] for l in ls), 'recortes': rects})
        text = QUESTION.sub(lambda m: m[2], parts[0]['texto'], count=1)
        ref = re.match(r'^\(([^)]+)\)\s*', text)
        reference = ref[1] if ref else None
        if ref:
            text = text[ref.end():]
        options = [OPTION.sub('', part['texto'], count=1) for part in parts[1:]]
        # Shared supporting passages before the numbered block need a separate
        # context extractor. Never pretend that the block is self-contained.
        context = re.search(r'(?i)texto (?:acima|anterior|a seguir)|text[os]? (?:below|above)|de acordo com o texto|according to the text|textos? para as? pr[oó]ximas?', text)
        if context:
            continue
        questions[n] = {'enunciado': text, 'opcoes': options, 'resposta_correta': ord(next(iter(answers[n]))) - 65,
                        'referencia': reference, 'partes': parts, 'pagina': block[0]['pagina'] + 1}
    return questions


def main():
    rows = read_rows()
    sources = json.loads((WORK / 'fontes.json').read_text(encoding='utf-8'))
    grouped = collections.defaultdict(list)
    for row in rows:
        grouped[row['arquivo_origem']].append(row)
    reconstructed, quarantine, documents = [], [], []
    cache = WORK / 'documentos-conferidos'
    cache.mkdir(exist_ok=True)
    for filename, batch in grouped.items():
        matches = sources.get(filename, [])
        try:
            if len(matches) != 1:
                raise ValueError('PDF original não localizado de forma única')
            qs = parse_document(matches[0])
            (cache / (hashlib.sha256(filename.encode()).hexdigest()[:16] + '.json')).write_text(json.dumps(qs, ensure_ascii=False), encoding='utf-8')
            documents.append({'arquivo': filename, 'reconstruidas': len(qs)})
            for r in batch:
                q = qs.get(int(r['numero_origem']))
                if not q:
                    quarantine.append({'numero_csv': r['numero'], 'arquivo': filename, 'motivo': 'bloco, contexto ou alternativas requerem revisão visual'})
                    continue
                identity = hashlib.sha256((filename + ':' + r['numero_origem']).encode()).hexdigest()[:16]
                reconstructed.append({'id': 'teorema-' + identity, 'csv': r, 'fonte_local': matches[0], 'questao': q,
                                      'gabarito_csv_divergente': r['resposta_correta'] != chr(65 + q['resposta_correta'])})
        except (ValueError, OSError) as error:
            documents.append({'arquivo': filename, 'motivo': str(error)})
            quarantine.extend({'numero_csv': r['numero'], 'arquivo': filename, 'motivo': str(error)} for r in batch)
        print(json.dumps(documents[-1], ensure_ascii=True), flush=True)
    summary = {'total_csv': len(rows), 'reconstruidas_para_revisao': len(reconstructed), 'quarentena': len(quarantine),
               'gabaritos_corrigidos_no_pdf': sum(q['gabarito_csv_divergente'] for q in reconstructed),
               'publicadas': 0, 'documentos': documents}
    for name, data in [('reconstruidas.json', reconstructed), ('quarentena.json', quarantine), ('auditoria.json', summary)]:
        (WORK / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in summary.items() if k != 'documentos'}, ensure_ascii=True))


if __name__ == '__main__':
    main()
