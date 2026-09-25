"""Extração revisável da prova ESA Geral A 2025; não escreve no banco remoto."""
import json
import re
import sys
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium
from PIL import ImageChops

ROOT = Path(__file__).resolve().parents[1]
pdf_path = Path(sys.argv[1])
doc = pdfplumber.open(pdf_path)
render = pdfium.PdfDocument(str(pdf_path))
assets = ROOT / 'public/acervo/esa-2025'
assets.mkdir(parents=True, exist_ok=True)
letters = 'ⒶⒷⒸⒹⒺ'
# Gabarito definitivo, página 1, modelo A; conferido visualmente.
answers = [None,'C','A',None,'A','A','A','E','D',None,
           'B','D','B','B','B','B','D','B','C','D',
           'A','C','B','C','B','E','A','E','A','C',
           'C','E','C','D','E','B','E','A','A','E',
           'A','E','B','E','E','B','C','E','B','C']
topics = [
 'Funções — domínio','Números inteiros — paridade','Geometria analítica — distância de ponto a reta',
 'Estatística — média, moda e mediana','Equação do segundo grau','Sistemas lineares',
 'Conjuntos e probabilidade','Lógica proposicional','Progressão geométrica e perímetros',
 'Binômio de Newton e sistemas','Equações logarítmicas','Matrizes e determinantes',
 'Análise combinatória','Geometria plana — quadrados',
 'Orações subordinadas substantivas','Semântica — polissemia','Análise sintática',
 'Interpretação de tirinhas','Adjunto adnominal e predicativo','Interpretação — pressupostos',
 'Análise sintática — predicativo','Verbos impessoais','Tempos verbais',
 'Pronome relativo e função sintática','Interpretação de texto','Classes de palavras',
 'Literatura brasileira — Simbolismo','Literatura brasileira — Simbolismo',
 'Brasil pré-colonial — exploração do pau-brasil','Brasil colonial — pecuária',
 'Brasil colonial — escravidão','Brasil colonial — invasões francesas','Era Vargas — política trabalhista',
 'Brasil colonial — organização militar','Industrialização brasileira','Regionalização do Brasil',
 'Urbanização — Estatuto da Cidade','Domínios morfoclimáticos — faixas de transição',
 'Matriz energética brasileira','Unidades de conservação',
 'Coesão e compreensão textual','Adjetivos — comparativos e superlativos','Compreensão textual',
 'Interpretação de tirinhas','Compreensão textual','Advérbios e ordem das palavras',
 'Gramática — gerúndio e infinitivo','Tempos verbais','Preposições','Substantivos — gênero']
easy = {2,5,12,16,18,21,22,23,26,27,29,38,47,50}
hard = {6,7,9,11,13,14,15,17,24,28,31,34,41,48}
images = {}
def picture(page, top, bottom, name):
    if page not in images:
        images[page] = render[page-1].render(scale=2).to_pil()
    bounds = (34*2, max(0,round(top*2)), 562*2, min(images[page].height,round(bottom*2)))
    cropped = images[page].crop(bounds)
    ink = ImageChops.invert(cropped.convert('RGB')).convert('L').point(lambda p: 255 if p > 35 else 0).getbbox()
    if ink:
        cropped = cropped.crop((0,0,cropped.width,min(cropped.height,ink[3]+8)))
    cropped.save(assets / name, 'WEBP', quality=92)
    return '/acervo/esa-2025/' + name

support_regions = {
 'texto1': [(6,133,405)], 'texto2': [(7,165,351)],
 'texto3': [(7,577,829),(8,76,228)], 'texto4': [(9,76,521)],
 'texto5': [(10,352,678)], 'ingles1': [(20,526,829),(21,76,177)]}
supports = {}
for key, regions in support_regions.items():
    supports[key] = [dict(imagem=picture(p,t,b,f'{key}-{i+1}.webp'),
        texto=doc.pages[p-1].crop((35,t,561,b)).extract_text() or '', pagina=p)
        for i,(p,t,b) in enumerate(regions)]

def clean(s):
    return re.sub(r'[ \t]+', ' ', s).strip()

result = []
for pi in range(1,22):
    pg = doc.pages[pi]
    words = pg.extract_words()
    nums = [w for w in words if w['x0']<60 and re.fullmatch(r'\d{2}',w['text']) and 1<=int(w['text'])<=49]
    if pi == 21:
        nums = [dict(text='50',top=87)]
    nums.sort(key=lambda w:w['top'])
    headings = [w['top'] for w in words if w['text'] in ['TEXTO','TEXT','QUESTÃO']]
    for j,w in enumerate(nums):
        n=int(w['text']); top=w['top']-9
        end=nums[j+1]['top']-11 if j+1<len(nums) else pg.height-12
        later_headings=[h-6 for h in headings if h>w['top'] and h-6<end]
        if later_headings: end=min(later_headings)
        markers = [c for c in pg.chars if c['text'] in letters and top<c['top']<end]
        assert len(markers)==5,(n,len(markers))
        first=min(c['top'] for c in markers)
        # Colunas são delimitadas pelas posições dos marcadores A–E.
        columns=[]
        for m in sorted(markers,key=lambda m:m['x0']):
            if not columns or abs(m['x0']-columns[-1])>20: columns.append(m['x0'])
        opts={}
        for m in markers:
            col=min(range(len(columns)),key=lambda i:abs(columns[i]-m['x0']))
            next_y=[c['top']-1 for c in markers if abs(c['x0']-columns[col])<20 and c['top']>m['top']+5]
            right=columns[col+1]-2 if col+1<len(columns) else 561
            bottom=min(next_y) if next_y else end
            opts[m['text']]=clean(pg.crop((m['x1']+1,m['top']-2,right,bottom)).extract_text() or '')
        sem_numero=pg.filter(lambda c: not (c.get('object_type')=='char' and c['x0']<60 and abs(c['top']-w['top'])<15))
        enunciado=clean(sem_numero.crop((40,top,561,first-1)).extract_text() or '')
        enunciado=re.sub(r'^'+str(n).zfill(2)+r'\s*','',enunciado)
        if n==50: enunciado=enunciado.replace('5 0','').strip()
        supportkey=('texto1' if 15<=n<=17 else 'texto2' if 18<=n<=19 else
                    'texto3' if 20<=n<=24 else 'texto4' if 25<=n<=26 else
                    'texto5' if n==28 else 'ingles1' if 48<=n<=49 else None)
        materia='Matemática' if n<=14 else 'Português' if n<=28 else 'História' if n<=34 else 'Geografia' if n<=40 else 'Inglês'
        result.append(dict(id=f'esa-2025-a-{n:02}',ano=2025,numero_original=n,modelo='A',
            materia=materia,conteudo=topics[n-1],banca='ESA',concurso='ESA 2025 — CFGS 2026/27 — Geral — Tipo A',
            dificuldade='Fácil' if n in easy else 'Difícil' if n in hard else 'Média',dificuldade_estimada=True,
            enunciado=enunciado,opcoes=[opts[l] for l in letters],
            resposta_correta=letters.index(chr(ord('Ⓐ')+ord(answers[n-1])-65)) if answers[n-1] else None,
            anulada=answers[n-1] is None,pagina=pi+1,
            imagem_original=picture(pi+1,top,end,f'questao-{n:02}.webp'),
            apoio=supports.get(supportkey,[]),origem='ESA — prova e gabarito definitivo enviados pelo usuário'))

# Frações e expressões que perdem a disposição bidimensional na extração de texto.
result[0]['opcoes']=['D = {x ∈ ℝ | x ≥ 1 e x ≠ 4}', 'D = {x ∈ ℝ | −1 ≤ x ≤ 4}', 'D = {x ∈ ℝ | −4 < x < 4}', 'D = {x ∈ ℝ | x < 1 e x ≠ −4}', 'D = {x ∈ ℝ | −4 < x ≤ −1 e x > 4}']
result[13]['opcoes']=['√2 / 2','5√2 / 2','5 / 2','2 / 5','1 / 2']
assert [q['numero_original'] for q in result]==list(range(1,51))
assert sum(q['anulada'] for q in result)==3
assert all(len(q['opcoes'])==5 and all(q['opcoes']) for q in result)
path=ROOT/'src/data/esa2025.json'
path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(result)} questões extraídas; 47 válidas e 3 anuladas. {sum(p.stat().st_size for p in assets.iterdir())/1024/1024:.1f} MB de imagens.')
