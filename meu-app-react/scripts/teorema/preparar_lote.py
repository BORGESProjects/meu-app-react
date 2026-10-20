"""Build a review batch from cached, unambiguous source blocks, not CSV crops."""
from pathlib import Path
import hashlib
import json
import re
import subprocess

from PIL import Image, ImageOps, ImageDraw
import pypdfium2 as pdfium

from auditar_pacote import ROOT, WORK, read_rows, fold, OPTION


def normalized(text):
    return fold(re.sub(r'(?<=\w)-\s*\n(?=\w)', '', str(text or '')))


def main():
    output = WORK / 'lote-em-revisao'
    output.mkdir(exist_ok=True)
    rows = read_rows()
    sources = json.loads((WORK / 'fontes.json').read_text(encoding='utf-8'))
    files = subprocess.check_output(['git', 'ls-files', 'public/acervo/*/questoes.json', 'src/data/*.json'], cwd=ROOT, text=True).splitlines()
    files += [str(p.relative_to(ROOT)).replace('\\', '/') for p in WORK.glob('acervo-existente-*.json')]
    existing = []
    for name in files:
        data = json.loads((ROOT / name).read_text(encoding='utf-8-sig'))
        if isinstance(data, list):
            existing.extend(data)
    identities = {normalized(q.get('enunciado')) for q in existing if len(normalized(q.get('enunciado'))) > 80}
    prefixes = {normalized(q.get('enunciado'))[:120] for q in existing if len(normalized(q.get('enunciado'))) >= 120}
    candidates, excluded = [], []
    doc_cache = {}
    for row in rows:
        filename = row['arquivo_origem']
        cache = WORK / 'documentos-conferidos' / (hashlib.sha256(filename.encode()).hexdigest()[:16] + '.json')
        if not cache.exists():
            continue
        document = json.loads(cache.read_text(encoding='utf-8'))
        source = document.get(row['numero_origem'])
        if not source:
            continue
        key = normalized(source['enunciado'])
        if key in identities or key[:120] in prefixes:
            excluded.append({'numero_csv': row['numero'], 'motivo': 'conteúdo idêntico ou muito semelhante já no acervo'})
            continue
        if source['referencia']:
            if not fold(source['referencia']).startswith(fold(row['banca'])) or row['banca'] in ['G1', 'S1', 'MODELO', 'Fac.', 'U.']:
                excluded.append({'numero_csv': row['numero'], 'motivo': 'identificação da banca requer conferência'})
                continue
            bank = re.sub(r'[/ -]+(?:19|20)\d{2}.*$', '', row['banca'])
            if re.match(r'(?i)^col[eé]gio naval', source['referencia']):
                bank = 'Colégio Naval'
            bank = re.sub(r'-(?:SP|RS|MG|RJ|PR|SC|PE|CE|BA|AM)$', '', bank)
            contest = source['referencia']
            year = re.search(r'\b(?:19|20)\d{2}\b', contest)
            year = int(year[0]) if year else None
        else:
            bank, contest, year = 'Questões de assimilação', 'Questões de assimilação', None
        if len(set(source['opcoes'])) != len(source['opcoes']) or source['resposta_correta'] >= len(source['opcoes']):
            excluded.append({'numero_csv': row['numero'], 'motivo': 'alternativas ou resposta ambíguas'})
            continue
        identities.add(key)
        identity = 'teorema-' + hashlib.sha256((filename + ':' + row['numero_origem']).encode()).hexdigest()[:16]
        path = sources[filename][0]
        if path not in doc_cache:
            doc_cache[path] = pdfium.PdfDocument(path)
        doc = doc_cache[path]
        assets = []
        preview_parts = []
        for i, part in enumerate(source['partes']):
            crops = []
            for rect_index, rect in enumerate(part['recortes']):
                page = doc[rect['pagina']]
                rendered = page.render(scale=2).to_pil()
                x0, y0, x1, y1 = rect['bbox']
                # Start at the actual text boundary; the old 3pt padding
                # sometimes picked up descenders from the preceding block.
                y0 += 2.5
                if rect_index > 0:
                    y0 = 73 if row['materia'] == 'Geografia' else 65
                if i + 1 < len(source['partes']) and rect_index == len(part['recortes']) - 1:
                    following = source['partes'][i+1]['recortes'][0]
                    if following['pagina'] == rect['pagina']:
                        y1 = following['bbox'][1] + 3 - .5
                    elif following['pagina'] > rect['pagina']:
                        y1 = page.get_height() - 45
                if not (0 <= x0 < x1 <= page.get_width() and 0 <= y0 < y1 <= page.get_height()):
                    raise ValueError('Recorte fora do PDF: ' + identity)
                crop = rendered.crop((int(x0*2), int(y0*2), int(x1*2), int(y1*2))).convert('RGB')
                crops.append(crop)
                page.close()
            canvas = Image.new('RGB', (max(c.width for c in crops), sum(c.height for c in crops)+12*(len(crops)-1)), 'white')
            top = 0
            for c in crops:
                canvas.paste(c, (0, top)); top += c.height+12
            asset = f'{identity}-{i}.webp'
            canvas.save(output / asset, 'WEBP', quality=92)
            assets.append('/acervo/teorema-180/' + asset)
            preview_parts.append(ImageOps.expand(canvas, border=6, fill='#a0aec0'))
        preview = Image.new('RGB', (max(p.width for p in preview_parts), sum(p.height for p in preview_parts)+20*len(preview_parts)), 'white')
        y = 0
        for part in preview_parts:
            preview.paste(part, (0, y)); y += part.height+20
        preview.thumbnail((1100, 4000))
        preview.save(output / (identity+'-conferencia.jpg'), quality=88)
        q = {'id': identity, 'banca': bank, 'concurso': contest, 'ano': year, 'materia': row['materia'],
             'conteudo': re.sub(r'(?i)\s*exerc[ií]cios\s*', '', row['conteudo']).strip(),
             'dificuldade': row['dificuldade'], 'dificuldade_estimada': True,
             'enunciado': source['enunciado'], 'opcoes': source['opcoes'],
             'resposta_correta': source['resposta_correta'], 'imagem_original': assets[0], 'opcoes_imagens': assets[1:],
             'fonte_material': {'arquivo': filename, 'numero': int(row['numero_origem']), 'pagina': source['pagina'], 'gabarito': 'Conferido no gabarito do material'},
             'gabarito_corrigido_do_csv': row['resposta_correta'] != chr(65+source['resposta_correta'])}
        candidates.append(q)
        if q['id'] == 'teorema-08d665fbefc1781b':
            q['conteudo'] = 'Geopolítica'
    for doc in doc_cache.values():
        doc.close()
    (output / 'questoes.json').write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding='utf-8')
    (output / 'excluidas-duplicatas-ou-pendencias.json').write_text(json.dumps(excluded, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'candidatas_a_revisao_visual': len(candidates), 'duplicatas_ou_pendencias': len(excluded), 'gabaritos_corrigidos': sum(q['gabarito_corrigido_do_csv'] for q in candidates)}, ensure_ascii=True))


if __name__ == '__main__':
    main()
