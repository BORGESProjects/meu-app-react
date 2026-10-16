"""UTFPR Verão 2026: 36 itens comuns e quatro por idioma, com recortes oficiais."""
import hashlib
import json
import re
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'tmp/pdfs/utfpr-2026/prova.pdf'
KEY = PDF.with_name('gabarito-retificado.pdf')
OUT = ROOT / 'public/acervo/utfpr-2026'
BASE = 'https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/edicoes/2026-1/provas-e-gabaritos/'
SOURCE = BASE + 'prova-vestibular-utfpr-verao-2026.pdf/@@display-file/file'
ANSWER = BASE + 'gabarito_vest_definitivo_311225.pdf/@@download/file'
COMMON = dict(enumerate('CECBE DBA'.replace(' ', ''), 1))
COMMON.update(dict(zip(range(13, 41), 'EDBAAAECBE CBDCBE DE AADXC ADBDE'.replace(' ', ''))))
LANG = {'Inglês': dict(zip(range(9, 13), 'DABC')), 'Espanhol': dict(zip(range(9, 13), 'BCED'))}
CONTENTS = {
    1:'Prosa e romance',2:'Prosa e romance',3:'Interpretação de textos',4:'Figuras de linguagem',
    5:'Interpretação de textos',6:'Sintaxe',7:'Sintaxe',8:'Funções da linguagem',
    13:'Teoria da História',14:'Teoria da História',15:'Geopolítica',16:'Meio ambiente',
    17:'Teoria do conhecimento',18:'Estratificação social',19:'Genética e biotecnologia',
    20:'Ecologia',21:'Ciclos biogeoquímicos',22:'Ecologia',23:'Ligações químicas',
    24:'Química orgânica',25:'Isomeria',26:'Estrutura atômica',27:'Química inorgânica',
    28:'Cinética química',29:'Análise combinatória e sequências',30:'Matrizes e determinantes',
    31:'Trigonometria',32:'Funções',33:'Geometria espacial',34:'Polinômios',
    35:'Cinemática',36:'Física moderna',37:'Óptica',38:'Trabalho, energia e potência',
    39:'Termodinâmica',40:'Eletromagnetismo',
}


def subject(n, lang):
    if 9 <= n <= 12:
        return 'Língua Inglesa' if lang == 'Inglês' else 'Língua Espanhola'
    return next(s for limit, s in [(2, 'Literatura'), (8, 'Língua Portuguesa'), (14, 'História'),
        (16, 'Geografia'), (17, 'Filosofia'), (18, 'Sociologia'), (22, 'Biologia'),
        (28, 'Química'), (34, 'Matemática'), (40, 'Física')] if n <= limit)


def clean(text):
    text = re.sub(r'(?<=\w)-\s*\n\s*(?=\w)', '', text.replace('\u00ad', ''))
    return re.sub(r'\n{3,}', '\n\n', text).strip()


def generate():
    with pdfplumber.open(KEY) as key_doc:
        key_text = key_doc.pages[0].extract_text()
        for n, answer in COMMON.items():
            assert re.search(rf'(?m)^{n} {"ANULADA" if answer == "X" else answer}$', key_text), n
        for n in range(9, 13):
            assert f"{n} {LANG['Inglês'][n]} {LANG['Espanhol'][n]}" in key_text
    OUT.mkdir(parents=True, exist_ok=True)
    images = OUT / 'imagens'
    images.mkdir(exist_ok=True)
    with pdfplumber.open(PDF) as doc:
        # Reaction diagrams extend beyond the regular text margins.
        flow = [(pg, x, right) for pg in range(3, 18) for x, right in ((25., 302.), (309., 580.))]
        words = []
        markers = []
        for pi, (pg, x, right) in enumerate(flow):
            ws = [w for w in doc.pages[pg].extract_words(extra_attrs=['size'])
                  if x <= w['x0'] < right and 50 < w['top'] < 812]
            words.append(ws)
            for w in ws:
                if re.fullmatch(r'\d{2}', w['text']) and 15.9 < w['size'] < 16.1:
                    markers.append((pi, w['top'], int(w['text'])))
        assert [n for _, _, n in markers] == [*range(1, 13), *range(9, 41)]
        render = pdfium.PdfDocument(PDF)
        cache = {}

        def segments(start, end):
            for pi in range(start[0], end[0]+1):
                y0 = start[1] if pi == start[0] else 52
                y1 = end[1] if pi == end[0] else 812
                if y1 > y0 + 2:
                    yield pi, y0, y1

        def crop(start, end, name):
            pieces = []
            for pi, y0, y1 in segments(start, end):
                pg, x, right = flow[pi]
                if pg not in cache:
                    cache[pg] = render[pg].render(scale=2).to_pil().convert('RGB')
                pieces.append(cache[pg].crop((round(x*2), round(y0*2), round(right*2), round(y1*2))))
            assert pieces, (start, end, name)
            out = Image.new('RGB', (max(p.width for p in pieces), sum(p.height for p in pieces)+12*(len(pieces)-1)), 'white')
            y = 0
            for p in pieces:
                out.paste(p, (0, y)); y += p.height+12
            target = images / (name + '.webp')
            out.save(target, 'WEBP', quality=90, method=6)
            return '/' + target.relative_to(ROOT/'public').as_posix()

        def text(start, end):
            return clean('\n'.join(doc.pages[flow[pi][0]].crop((flow[pi][1], y0, flow[pi][2], y1)).extract_text(x_tolerance=2, y_tolerance=3) or '' for pi, y0, y1 in segments(start, end)))

        # Shared supports occupy physical columns independently of question order.
        supports = {
            'poema': crop((1, 104), (1, 397), 'apoio-portugues'),
            'games': crop((3, 350), (4, 229), 'apoio-ingles-9-10'),
            'who': crop((5, 181), (5, 790), 'apoio-ingles-11-12'),
            'quiroga': crop((8, 52), (8, 794), 'apoio-espanhol-11-12'),
        }
        # Ends before a shared text or a new discipline, never include another item.
        ends = {1: (0, 801), 7: (3, 280), 9: (5, 172), 11: (6, 433),
                13: (7, 801), 15: (9, 478), 17: (11, 477), 19: (13, 544),
                21: (15, 615), 25: (19, 398), 31: (24, 391), 37: (26, 479)}
        result = []
        for idx, (pi, top, n) in enumerate(markers):
            lang = ('Inglês' if idx < 12 else 'Espanhol') if 9 <= n <= 12 else None
            key = f'q{n:02d}' + ('-en' if lang == 'Inglês' else '-es' if lang else '')
            nxt = markers[idx+1] if idx+1 < len(markers) else (29, 300, 0)
            end = ends.get(idx, (nxt[0], nxt[1]-5))
            # Last option ends at its last printed line, not at the next heading.
            alts = [(w['text'][0], k, w['top']) for k, y0, y1 in segments((pi, top-2), end)
                    for w in words[k] if y0 <= w['top'] < y1 and re.fullmatch(r'[a-e]\)', w['text']) and w['x0'] < flow[k][1]+30]
            assert [a for a, _, _ in alts] == list('abcde'), (key, alts, end)
            # Fraction numerators are four points above the option label.
            if n == 31:
                alts = [(letter, k, y-4) for letter, k, y in alts]
            last = alts[-1]
            last_words = [(k, w) for k, y0, y1 in segments((last[1], last[2]), end)
                          for w in words[k] if y0 <= w['top'] < y1]
            assert last_words
            end = max((k, w['bottom']+4) for k, w in last_words)
            stem_end = (alts[0][1], alts[0][2]-3)
            stem = crop((pi, top-2), stem_end, key+'-enunciado')
            options, option_images = [], []
            for i, (letter, k, y) in enumerate(alts):
                stop = (alts[i+1][1], alts[i+1][2]-2) if i < 4 else end
                option_images.append(crop((k, y-2), stop, key+'-'+letter))
                options.append(re.sub(r'^[a-e]\)\s*', '', text((k, y-1), stop)))
            support = 'poema' if 3 <= n <= 8 else 'games' if lang == 'Inglês' and n <= 10 else 'who' if lang == 'Inglês' else 'quiroga' if lang == 'Espanhol' and n >= 11 else None
            answer = LANG[lang][n] if lang else COMMON[n]
            proofs = [f'Vestibular de Verão UTFPR 2026 — {l}' for l in ([lang] if lang else LANG)]
            result.append(dict(id='utfpr-2026-'+key[1:], ano=2026, edicao=2026, data_aplicacao='2025-11-23',
                numero_original=n, materia=subject(n, lang), conteudo=CONTENTS.get(n, 'Interpretação de textos' if n in (11,12) or lang == 'Inglês' and n == 9 else 'Gramática'), banca='UTFPR',
                concurso=proofs[0], provas=proofs, idioma=lang, dificuldade='Média', dificuldade_estimada=True,
                enunciado=re.sub(r'^\d{2}\s*', '', text((pi, top-1), stem_end)), opcoes=options,
                resposta_correta=None if answer == 'X' else ord(answer)-65, gabarito_oficial=answer, anulada=answer == 'X',
                imagem_original=stem, imagem_sem_alternativas=True, opcoes_imagens=option_images,
                texto_extraido_corrompido=True, opcoes_texto_corrompido=[True]*5,
                apoio=[dict(imagem=supports[support], texto='Texto-base oficial compartilhado.')] if support else [],
                pagina=flow[pi][0]+1, fonte_pdf=SOURCE, fonte_gabarito=ANSWER))
        assert len(result) == 44
        (OUT/'questoes.json').write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
        manifest = dict(instituicao='UTFPR', edicao=2026, aplicacao='2025-11-23', itens_unicos=44,
            questoes_por_idioma=40, corrigiveis_por_idioma=39, anuladas=[34],
            gabarito='Definitivo retificado em 31/12/2025', fonte_pdf=SOURCE, fonte_gabarito=ANSWER,
            sha256_pdf=hashlib.sha256(PDF.read_bytes()).hexdigest(), sha256_gabarito=hashlib.sha256(KEY.read_bytes()).hexdigest())
        (OUT/'manifesto.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        print('UTFPR 2026: 44 itens; 40 por idioma; 39 corrigiveis por idioma.')


if __name__ == '__main__':
    generate()
