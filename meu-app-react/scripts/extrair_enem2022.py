"""Reproduz o acervo ENEM 2022 a partir dos PDFs e do cache de posições revisado.

Recortes em ordem de leitura preservam fórmulas e gráficos; nenhuma chamada de IA.
"""
import json
import re
import shutil
from pathlib import Path
import pdfplumber
from pdfplumber.utils import extract_text
import pypdfium2 as pdfium
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/acervo/enem-2022'
SOURCE = Path('C:/Users/BORGES/Downloads/Documents/Acervo ENEM')
ASSETS.mkdir(parents=True, exist_ok=True)
all_questions = []
audit = []
classification = {}
for line in (ROOT/'scripts/enem2022-classificacao.txt').read_text(encoding='utf-8').splitlines():
    if line and not line.startswith('#'):
        number, subject, topic, level = line.split('|')
        classification[int(number)] = (subject, topic, {'F':'Fácil','M':'Média','D':'Difícil'}[level])

for day, booklet in [(1, 1), (2, 7)]:
    source = SOURCE / f'2022_PV_impresso_D{day}_CD{booklet}.pdf'
    shutil.copyfile(source, ASSETS / f'prova-dia{day}.pdf')
    cache = ROOT / f'tmp/enem2022/d{day}-pages.json'
    if not cache.exists():
        cache.parent.mkdir(parents=True, exist_ok=True)
        pages = []
        with pdfplumber.open(source) as doc:
            for pn, original in enumerate(doc.pages):
                page = original.filter(lambda o:o.get('object_type')!='char' or o.get('upright',True))
                pages.append(dict(page=pn+1, heads=page.search(r'QUESTÃO\s+\d+',return_chars=False),
                                  chars=[{k:c[k] for k in ['text','x0','x1','top','bottom','fontname','size']} for c in page.chars]))
        cache.write_text(json.dumps(pages,ensure_ascii=False),encoding='utf-8')
    pages = json.loads(cache.read_text(encoding='utf-8'))
    for page in pages:
        for char in page['chars']:
            char.update(upright=True, doctop=char['top'], height=char['bottom']-char['top'], width=char['x1']-char['x0'])
    render = pdfium.PdfDocument(str(source))
    rendered = {}
    with pdfplumber.open(ASSETS / f'gabarito-dia{day}.pdf') as key:
        rows = key.pages[0].extract_text().splitlines()
    answers = {}
    for row in rows:
        cells = row.split()
        if not cells or not cells[0].isdigit():
            continue
        n = int(cells[0])
        if day == 1 and n <= 5:
            answers[(n, 'Inglês')] = cells[1]
            answers[(n, 'Espanhol')] = cells[2]
            answers[(int(cells[3]), '')] = cells[4]
        elif len(cells) == 4:
            answers[(n, '')] = cells[1]
            answers[(int(cells[2]), '')] = cells[3]
    assert len(answers) == (95 if day == 1 else 90)
    columns = []
    for page in pages:
        # Capa, proposta de redação e contracapa não são questões objetivas.
        if not page['heads']:
            continue
        full_width = page['page'] in ({15} if day == 1 else {3,8,12,15,22,24,25})
        for column in range(1 if full_width else 2):
            left, right = (29,537) if full_width else (29, 278.5) if column == 0 else (287, 537)
            heads = sorted([h for h in page['heads'] if full_width or (h['x0'] > 280) == bool(column)], key=lambda h:h['top'])
            columns.append(dict(page=page, left=left, right=right, heads=heads))
    starts = [(ci, h) for ci, col in enumerate(columns) for h in col['heads']]
    for index, (ci, head) in enumerate(starts):
        n = int(head['text'].split()[-1])
        lang = ('Inglês' if index < 5 else 'Espanhol') if day == 1 and n <= 5 else ''
        ident = f'enem-2022-d{day}-c{booklet}-{n:03}' + ({'Inglês':'-en','Espanhol':'-es'}.get(lang, ''))
        end_ci, next_head = starts[index+1] if index+1 < len(starts) else (len(columns)-1, None)
        # Não juntar os cabeçalhos da nova área/opção de língua à questão anterior.
        if (day == 1 and n in (5, 45, 90)) or n == 135:
            end_ci = ci
            next_head = None
        chunks, snippets, regions = [], [], []
        for current in range(ci, end_ci+1):
            col = columns[current]
            top = head['top']-3 if current == ci else 66
            bottom = next_head['top']-5 if current == end_ci and next_head else 735
            if bottom <= top:
                continue
            chars = [c for c in col['page']['chars'] if c['x0'] >= col['left'] and c['x1'] <= col['right']+1 and c['top'] >= top and c['bottom'] <= bottom and c['size'] >= 3]
            text = extract_text(chars, x_tolerance=2, y_tolerance=3) if chars else ''
            if not text.strip():
                continue
            snippets.append(text)
            pn = col['page']['page']
            regions.append([pn, col['left'], top, col['right'], bottom])
            if pn not in rendered:
                rendered[pn] = render[pn-1].render(scale=2.5).to_pil().convert('RGB')
            crop = rendered[pn].crop(tuple(round(v*2.5) for v in [col['left'], top, col['right'], bottom]))
            ink = ImageChops.invert(crop).convert('L').point(lambda p:255 if p>50 else 0).getbbox()
            if ink:
                crop = crop.crop((0, max(0,ink[1]-5), crop.width, min(crop.height,ink[3]+6)))
            chunks.append(crop)
        assert chunks, ident
        canvas = Image.new('RGB', (max(c.width for c in chunks), sum(c.height for c in chunks)+12*(len(chunks)-1)), 'white')
        y = 0
        for chunk in chunks:
            canvas.paste(chunk, (0,y)); y += chunk.height+12
        canvas.save(ASSETS / f'{ident}.webp', 'WEBP', quality=92)
        text = '\n'.join(snippets)
        text = re.sub(r'^QUESTÃO\s+\d+\s*', '', text)
        # Alternativas visuais e notação bidimensional são respondidas pela imagem fiel.
        answer = answers[(n,lang)]
        subject = lang or ('Português' if n<=45 else 'Ciências Humanas' if n<=90 else 'Ciências da Natureza' if n<=135 else 'Matemática')
        q = dict(id=ident, ano=2022, numero_original=n, modelo=f'Azul · Caderno {booklet}', dia=day, idioma=lang,
                 materia=subject, conteudo='Interpretação de texto' if lang or n<=45 else subject,
                 banca='ENEM', concurso=f'ENEM 2022 — {day}º dia — Caderno {booklet} Azul'+(f' — {lang}' if lang else ''),
                 dificuldade='Média', dificuldade_estimada=True, enunciado=text,
                 opcoes=[f'Alternativa {l} — conforme a imagem' for l in 'ABCDE'],
                 resposta_correta=None if answer=='Anulado' else 'ABCDE'.index(answer), anulada=answer=='Anulado',
                 pagina=columns[ci]['page']['page'], imagem_original=f'/acervo/enem-2022/{ident}.webp', apoio=[],
                 fonte_pdf=f'/acervo/enem-2022/prova-dia{day}.pdf', fonte_gabarito=f'/acervo/enem-2022/gabarito-dia{day}.pdf',
                 origem='Inep — ENEM 2022, aplicação regular, prova impressa e gabarito oficial')
        if lang:
            q['conteudo'] = 'Interpretação de texto' if n != 3 else 'Interpretação e recursos expressivos'
            q['dificuldade'] = 'Fácil' if n in (1,3) else 'Média'
        else:
            q['materia'],q['conteudo'],q['dificuldade'] = classification[n]
        markers = list(re.finditer(r'(?m)^([A-E])\1\s+', text))
        visual_options = {95,96,103,106,108,117,129,137,141,143,148,155,156,157,159,160,180}
        if n not in visual_options and [m.group(1) for m in markers] == list('ABCDE'):
            opts = [text[m.end():markers[i+1].start() if i<4 else len(text)].strip() for i,m in enumerate(markers)]
            if all(opts):
                q['opcoes'] = opts
                q['enunciado'] = text[:markers[0].start()].strip()
        all_questions.append(q)
        audit.append(dict(id=ident,regioes=regions,texto=text))
assert len(all_questions)==185
assert sum(q['anulada'] for q in all_questions)==1
(ROOT/'src/data/enem2022.json').write_text(json.dumps(all_questions, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
(ROOT/'tmp/enem2022/audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2),encoding='utf-8')
print('185 questões extraídas; 184 corrigíveis; 1 anulada.')
