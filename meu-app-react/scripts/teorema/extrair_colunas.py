"""Geometry-based extraction of the Teorema PDFs. Never use the CSV answer key.

Coordinates remain in PDF points. Each column is a separate reading region;
numerators above numbered lines and shared passages are retained explicitly.
Outputs are private review candidates, never automatically published.
"""
from pathlib import Path
import collections
import concurrent.futures
import hashlib
import json
import re
import sys

import pdfplumber

from auditar_pacote import WORK, ROOT, read_rows, fold

VERSION = 9
Q_START = re.compile(r'^\s*(\d{1,3})(?:\s*[.)]\s*|\s*[-–]\s+|\s+(?=\())(.*)$')
OPT = re.compile(r'\[([A-Ea-e])\]|([A-Ea-e])\)')
REPLY = re.compile(r'^\s*Resposta\s+(?:da|à)\s+quest[aã]o\s+(\d{1,3})\s*:', re.I)
KEY_HEADING = re.compile(r'^\s*GABARITO(?:S)?\s*[:;]?\s*', re.I)
KEY_PAIR = re.compile(r'(?<!\d)(\d{1,3})\s*[-–—.)]\s*\[?([A-Ea-e])\]?\b')
CONTEXT = re.compile(r'^(?:TEXTOS?\s+PARA\s+(?:AS?\s+)?(?:PR[OÓ]XIMAS?\s+)?(?:\d+\s+)?QUEST(?:[AÃ]O|[OÕƠ]ES)|(?:Leia|Considere|Observe)\s+(?:o|os|a|as)\s+textos?.*\bquest[oõ]es\b)', re.I)
LEVEL = re.compile(r'^N[IÍ]VEL\s*(\d)', re.I)


def is_math_line(line):
    text = line['text'].strip()
    return bool(len(text) < 90 and (re.search(r'[\d\uE000-\uF8FF=√∑π∫α-ωΑ-Ω]|\b(?:sen|sin|cos|tan|tg|cotg|log|ln)\b', text) or re.fullmatch(r'[A-Za-zα-ωΑ-Ω]{1,3}',text)) and not re.search(r'[A-Za-zÀ-ú]{4,}\s+[A-Za-zÀ-ú]{3,}', text))


def read_layout(path):
    result, regions = [], []
    with pdfplumber.open(path) as pdf:
        double = False
        for page in pdf.pages[:min(3, len(pdf.pages))]:
            words = page.extract_words(x_tolerance=1.5)
            if any(re.fullmatch(r'\d{1,3}[.)]', w['text']) and page.width * .49 < w['x0'] < page.width * .64 and w['top'] > 70 for w in words):
                double = True
            # A short worksheet may put all questions on the left and only
            # its key on the right. The empty gutter proves the separation.
            right_key = any(re.match(r'(?i)^GABARITO',w['text']) and page.width*.49 < w['x0'] < page.width*.7 and w['top'] > 70 for w in words)
            gutter_words = sum(w['x0'] < page.width/2+7 and w['x1'] > page.width/2-7 and w['top'] > 73 for w in words)
            if right_key and gutter_words < 3:
                double = True
        for p, page in enumerate(pdf.pages):
            bounds = [(24, page.width/2-3), (page.width/2+3, page.width-24)] if double else [(25, page.width-25)]
            for col, (left, right) in enumerate(bounds):
                region = len(regions)
                body_top, body_bottom = 73, page.height-28
                regions.append({'pagina': p, 'coluna': col, 'bbox': [left, body_top, right, body_bottom]})
                cropped = page.crop((left, body_top, right, body_bottom))
                for line in cropped.extract_text_lines(x_tolerance=1.5, y_tolerance=2, strip=True):
                    chars = line.get('chars', [])
                    joined = ''.join(c['text'] for c in chars)
                    anchors = []
                    for match in OPT.finditer(joined):
                        if match.start() and joined[match.start()-1].isalpha():
                            continue
                        c = chars[match.start()]
                        anchors.append({'label': (match[1] or match[2]).upper(), 'x': c['x0'], 'top': c['top'], 'bottom': c['bottom']})
                    result.append({'text': line['text'], 'x0': line['x0'], 'x1': line['x1'], 'top': line['top'], 'bottom': line['bottom'], 'region': region, 'anchors': anchors})
            page.close()
    return result, regions, double


def shifted_start(lines, index):
    """A floating numerator belongs to the following label, not the previous item."""
    first = index
    while first > 0:
        before, current = lines[first-1], lines[index]
        if before['region'] != current['region'] or current['top'] - before['top'] > 25:
            break
        if before['x0'] <= current['x0'] + 10 or not is_math_line(before):
            break
        previous_label = next((l for l in reversed(lines[:first-1]) if l['region']==current['region'] and (l['anchors'] or Q_START.match(l['text']))),None)
        # A denominator is closer to the preceding label; a floating numerator
        # is closer to the following one. Do not steal the previous fraction.
        if previous_label and 0 < before['top']-previous_label['top'] < current['top']-before['top']:
            break
        first -= 1
    return first


def range_rects(regions, start, end):
    """Half-open reading range, across columns and pages (never through the gutter)."""
    a, top = start
    b, bottom = end
    rects = []
    for r in range(a, b+1):
        x0, y0, x1, y1 = regions[r]['bbox']
        if r == a:
            y0 = max(y0, top)
        if r == b:
            y1 = min(y1, bottom)
        if y1-y0 > .2:
            rects.append({'pagina': regions[r]['pagina'], 'coluna': regions[r]['coluna'], 'bbox': [x0, y0, x1, y1]})
    return rects


def position(lines, i):
    return lines[i]['region'], lines[i]['top']-.4


def text_in_rects(lines, rects, regions):
    chunks = []
    for rect in rects:
        x0, y0, x1, y1 = rect['bbox']
        region = next(i for i, r in enumerate(regions) if r['pagina'] == rect['pagina'] and r['coluna'] == rect['coluna'])
        for line in lines:
            if line['region'] == region and y0 <= line['top'] < y1 and line['x0'] < x1 and line['x1'] > x0:
                chunks.append(line['text'])
    return '\n'.join(chunks)


def parse_keys(lines, first_key, by_level=False):
    answers = collections.defaultdict(set)
    evidence = collections.defaultdict(list)
    table_lines = []
    in_table = False
    level = None
    def key(n):
        return (level,n) if by_level else n
    for i in range(first_key, len(lines)):
        line = lines[i]
        if KEY_HEADING.match(line['text']):
            in_table = True
            section = re.search(r'N[IÍ]VEL\s*(\d)',line['text'],re.I)
            level = int(section[1]) if section else None
        reply = REPLY.match(line['text'])
        if reply:
            in_table = False
            nearby = '\n'.join(l['text'] for l in lines[i:i+4])
            match = re.search(r':\s*\n?\s*(?:Resposta\s*:\s*)?(?:\[([A-E])\]|([A-E])\b)', nearby, re.I)
            if match:
                n, answer = int(reply[1]), (match[1] or match[2]).upper()
                answers[key(n)].add(answer); evidence[key(n)].extend(range(i,min(i+2,len(lines))))
            elif re.search(r':\s*\n?\s*(?:Questão\s+)?(?:ANULADA|ANULADO)', nearby, re.I):
                n = int(reply[1]); answers[key(n)].add('ANULADA'); evidence[key(n)].append(i)
        # Only actual key-table lines, not calculations in the solution prose.
        text = KEY_HEADING.sub('', line['text']).strip()
        if re.match(r'(?i)^Quest[oõ]es\s+de\s+SOMA',text):
            in_table = False
        if in_table and (KEY_HEADING.match(line['text']) or re.match(r'^\d{1,3}\s*[-–—.) ]',text) or re.match(r'^[A-Ea-e]\s*;',text)):
            table_lines.append((i,text,level))
        pairs = list(KEY_PAIR.finditer(text))
        remainder = KEY_PAIR.sub('', text).strip(' \t;,:|[]–—-')
        if in_table and pairs and not re.search(r'[A-Za-zÀ-ú]', remainder):
            for m in pairs:
                n, answer = int(m[1]), m[2].upper()
                answers[key(n)].add(answer); evidence[key(n)].append(i)
        # Some compact tables place the answer below the question number.
        if in_table and re.fullmatch(r'\d{1,3}[.)-]?', text) and i+1 < len(lines):
            next_text = lines[i+1]['text'].strip()
            if re.fullmatch(r'\[?[A-E]\]?', next_text, re.I):
                n = int(re.sub(r'\D', '', text)); answers[key(n)].add(next_text.strip('[]').upper()); evidence[key(n)].append(i)
    # Compact tables may wrap an answer onto the next line, omit one hyphen,
    # or include a V/F answer among letter answers. Do not lose the other keys.
    compact = re.compile(r'(?<!\d)(\d{1,3})\s*[-–—.)]?\s*\[?([A-Ea-e])\]?\b')
    for section_level in {x[2] for x in table_lines}:
        level=section_level
        section=[(i,text) for i,text,lev in table_lines if lev==level]
        combined=' '.join(text for _,text in section)
        for m in compact.finditer(combined):
            n,answer=int(m[1]),m[2].upper()
            answers[key(n)].add(answer)
            evidence[key(n)].extend(i for i,text in section if re.search(r'(?<!\d)'+str(n)+r'(?!\d)',text))
        for m in re.finditer(r'(?<!\d)(\d{1,3})\s*[-–—.) ]\s*ANULAD[AO]',combined,re.I):
            answers[key(int(m[1]))].add('ANULADA')
    return answers, evidence


def reference_at_start(text):
    first, *rest = text.split('\n')
    first = Q_START.sub(lambda m: m[2], first, count=1)
    text = '\n'.join([first, *rest]).strip()
    if not text.startswith('('):
        return None, text
    depth = 0
    for i, char in enumerate(text[:180]):
        if char == '(':
            depth += 1
        elif char == ')':
            depth -= 1
            if depth == 0:
                ref = text[1:i].strip()
                if ref.casefold() in {'aq','um','n','x','y','z','s','l','g'}:
                    break
                # A leading mathematical condition is not an institution.
                if re.search(r'(?i)\b(?:adaptad[ao]|in[eé]dita|modelo|G1|S1|[A-ZÀ-Ú]{2,})\b', ref) and not re.search(r'[=<>√]', ref):
                    return ref, text[i+1:].strip()
                break
    return None, text


def extract_document(path):
    lines, regions, double = read_layout(path)
    key_start = next((i for i, l in enumerate(lines) if KEY_HEADING.match(l['text']) or REPLY.match(l['text'])), None)
    if key_start is None:
        raise ValueError('gabarito explícito não localizado')
    answers, key_evidence = parse_keys(lines, key_start, by_level=True)
    starts, contexts, sections = [], [], []
    level = None
    for i, line in enumerate(lines[:key_start]):
        if m := LEVEL.match(line['text']):
            level = int(m[1])
            sections.append(i)
        if CONTEXT.match(line['text']):
            contexts.append(i)
        if m := Q_START.match(line['text']):
            if not m[2].strip() and (i+1>=len(lines) or not lines[i+1]['text'].lstrip().startswith('(')):
                continue
            region_left = regions[line['region']]['bbox'][0]
            if line['x0'] <= region_left + (45 if double else 90):
                starts.append({'line': i, 'start': shifted_start(lines, i), 'numero': int(m[1]), 'nivel': level})
    if not starts:
        raise ValueError('questões numeradas não localizadas')
    questions = collections.defaultdict(list)
    for k, item in enumerate(starts):
        qnum, start = item['numero'], item['start']
        end = starts[k+1]['start'] if k+1 < len(starts) else key_start
        next_sections = [c for c in contexts + sections if start < c < end]
        if next_sections:
            end = min(next_sections)
        answer_key=(item['nivel'],qnum)
        if not answers[answer_key] and (None,qnum) in answers:
            answer_key=(None,qnum)
        if len(answers[answer_key]) != 1:
            questions[qnum].append({'pendencia': 'gabarito ausente ou divergente no PDF', 'numero': qnum}); continue
        anchors = []
        for i in range(start, end):
            for anchor in lines[i]['anchors']:
                anchors.append(anchor | {'line': i, 'region': lines[i]['region']})
        # Inline references such as (a) in statements are not alternatives.
        # Require a single complete, consecutive trailing sequence A…D/E.
        sequences = []
        for j, a in enumerate(anchors):
            if a['label'] != 'A':
                continue
            seq = anchors[j:]
            if [x['label'] for x in seq] in [list('ABCDE'), list('ABCD')]:
                sequences.append(seq)
        if len(sequences) != 1:
            questions[qnum].append({'pendencia': 'alternativas não isoladas em sequência única', 'numero': qnum}); continue
        opts = sequences[0]
        for a in opts:
            a['shift'] = shifted_start(lines, a['line'])
            a['y'] = min(a['top']-.3, lines[a['shift']]['top']-.3)
        statement_end = (opts[0]['region'], opts[0]['y'])
        statement = range_rects(regions, position(lines, start), statement_end)
        if not statement:
            questions[qnum].append({'pendencia': 'enunciado sem recorte verificável', 'numero': qnum}); continue
        parts = [{'texto': '\n'.join(l['text'] for l in lines[start:opts[0]['shift']]), 'recortes': statement}]
        horizontal = any(a['region'] == b['region'] and abs(a['top']-b['top']) < 4 for a, b in zip(opts, opts[1:]))
        if horizontal:
            # Each row can contain several alternatives; do not crop an entire
            # column and repeat the other answers in every button.
            rows = []
            for a in opts:
                if rows and rows[-1][0]['region'] == a['region'] and abs(rows[-1][0]['top']-a['top']) < 4:
                    rows[-1].append(a)
                else:
                    rows.append([a])
            if any(a['region'] != opts[0]['region'] for a in opts):
                questions[qnum].append({'pendencia': 'alternativas horizontais continuam em outra coluna', 'numero': qnum}); continue
            r = opts[0]['region']
            for row_index, row in enumerate(rows):
                y0 = min(a['y'] for a in row)
                next_row = rows[row_index+1] if row_index+1 < len(rows) else None
                y1 = min(a['y'] for a in next_row) if next_row else (lines[end]['top']-.4 if lines[end]['region'] == r else regions[r]['bbox'][3])
                for j, a in enumerate(row):
                    x0 = a['x']-.5
                    x1 = row[j+1]['x']-.5 if j+1 < len(row) else regions[r]['bbox'][2]
                    rects = [{'pagina': regions[r]['pagina'], 'coluna': regions[r]['coluna'], 'bbox': [x0, y0, x1, y1]}]
                    # Text on the complete row would repeat other alternatives.
                    line_text = lines[a['line']]['text']
                    all_matches = list(OPT.finditer(line_text))
                    matching = next((m for m in all_matches if (m[1] or m[2]).upper() == a['label']), None)
                    next_match = next((m for m in all_matches if matching and m.start() > matching.start()), None)
                    text = line_text[matching.end():next_match.start() if next_match else None].strip() if matching else ''
                    parts.append({'texto': text, 'recortes': rects, 'horizontal': True})
        else:
            for j, a in enumerate(opts):
                next_pos = (opts[j+1]['region'], opts[j+1]['y']) if j+1 < len(opts) else position(lines, end)
                rects = range_rects(regions, (a['region'], a['y']), next_pos)
                stop_line = opts[j+1]['shift'] if j+1 < len(opts) else end
                text = '\n'.join(l['text'] for l in lines[a['shift']:stop_line])
                # Remove just the option marker, retaining numerator lines.
                text = OPT.sub('', text, count=1).strip()
                parts.append({'texto': text, 'recortes': rects})
        ref, enunciado = reference_at_start(parts[0]['texto'])
        # Numerators can precede the numbered line. Remove the label/reference
        # on its own line without throwing away those preceding formula tokens.
        numbered = lines[item['line']]['text']
        ref_numbered, clean_numbered = reference_at_start(numbered)
        if ref is None and item['line'] != start:
            ref = ref_numbered
            enunciado = parts[0]['texto'].replace(numbered, clean_numbered, 1)
        apoios = []
        marker = next((c for c in reversed(contexts) if c < item['line']), None)
        if marker is not None:
            first_after = next((s for s in starts if s['line'] > marker), None)
            if first_after:
                context_text = lines[marker]['text']
                count_match = re.search(r'(\d+)\s+QUEST', context_text, re.I)
                singular = bool(re.search(r'PR[OÓ]XIMA\s+QUEST[AÃ]O\b', context_text, re.I))
                qpos = starts.index(first_after)
                scope = int(count_match[1]) if count_match else (1 if singular else None)
                belongs = scope is None or k < qpos + scope
                if belongs:
                    rects = range_rects(regions, position(lines, marker), position(lines, first_after['start']))
                    text = '\n'.join(l['text'] for l in lines[marker:first_after['start']])
                    apoios.append({'texto': text, 'recortes': rects})
        # Never reuse a previous passage for a question outside its declared scope.
        dependent = re.search(r'(?i)according to (?:the )?text|de acordo com o texto|the underlined|from the text|do texto|no texto|o autor|the author|the poem', enunciado)
        inline_context = len(enunciado) >= 350 and enunciado.count('\n') >= 3
        if dependent and not apoios and not inline_context:
            questions[qnum].append({'pendencia': 'texto-base não associado de forma verificável', 'numero': qnum}); continue
        answer = next(iter(answers[answer_key]))
        if answer != 'ANULADA' and ord(answer)-65 >= len(opts):
            questions[qnum].append({'pendencia': 'gabarito fora das alternativas', 'numero': qnum}); continue
        questions[qnum].append({'numero': qnum, 'nivel': item['nivel'], 'enunciado': enunciado,
                               'referencia': ref, 'opcoes': [p['texto'] for p in parts[1:]],
                               'resposta_correta': None if answer == 'ANULADA' else ord(answer)-65, 'anulada': answer == 'ANULADA',
                               'partes': parts, 'apoios': apoios, 'contexto_no_enunciado': bool(dependent and inline_context and not apoios), 'pagina': regions[lines[start]['region']]['pagina']+1,
                               'gabarito_linhas': [lines[i]['text'] for i in key_evidence[answer_key]], 'duas_colunas': double,
                               'marcadores_opcoes': [{key:a[key] for key in ['label','region','top','bottom','x','y']} for a in opts],
                               'regioes_recorte': [{'indice':r,**regions[r]} for r in range(lines[start]['region'],lines[end]['region']+1)],
                               'fim_recorte': {'region':lines[end]['region'],'y':lines[end]['top']-.4}})
    return dict(questions)


def worker(task):
    filename, path, output = task
    try:
        qs = extract_document(path)
        result = {'versao': VERSION, 'arquivo': filename, 'questoes': qs}
    except Exception as error:
        result = {'versao': VERSION, 'arquivo': filename, 'erro': type(error).__name__ + ': ' + str(error)}
    Path(output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    return {'arquivo': filename, 'questoes': sum(not q.get('pendencia') for values in result.get('questoes', {}).values() for q in values), 'erro': result.get('erro')}


def main():
    sources = json.loads((WORK/'fontes.json').read_text(encoding='utf-8'))
    already = {q['id'] for q in json.loads((ROOT/'public/acervo/teorema-180/questoes.json').read_text(encoding='utf-8'))}
    # A CSV may repeat an incorrect original number for two different items.
    # Reconcile each row against the actual text/options before deciding it is
    # already published; do not skip it just because that number exists.
    needed = {row['arquivo_origem'] for row in read_rows()}
    cache = WORK/'documentos-colunas'; cache.mkdir(exist_ok=True)
    tasks = []
    limit = int(sys.argv[1]) if len(sys.argv)>1 else None
    for filename in sources:
        if filename not in needed or len(sources[filename]) != 1:
            continue
        output = cache/(hashlib.sha256(filename.encode()).hexdigest()[:16]+'.json')
        if output.exists() and json.loads(output.read_text(encoding='utf-8')).get('versao') == VERSION:
            continue
        tasks.append((filename, sources[filename][0], str(output)))
    if limit:
        tasks = tasks[:limit]
    with concurrent.futures.ProcessPoolExecutor(max_workers=6) as pool:
        for result in pool.map(worker, tasks):
            print(json.dumps(result, ensure_ascii=True), flush=True)


if __name__ == '__main__':
    main()
