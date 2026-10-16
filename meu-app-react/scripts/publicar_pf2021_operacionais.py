"""Reúne os três cadernos PF 2021 revisados sem perder suas origens."""
import copy
import hashlib
import json
import re
import shutil
from importar_cebraspe import ROOT, gabarito

NOMES = ['pf-2021-agente', 'pf-2021-escrivao', 'pf-2021-papiloscopista']
DESTINO = ROOT/'public/acervo/pf-2021-operacionais'

def normalizar(texto):
    texto = texto.translate(str.maketrans({'“':'"','”':'"','‘':"'",'’':"'"}))
    texto = re.sub(r'(?m)^\s*BLOCO [IVX]+\s*$', '', texto)
    texto = re.sub(r'(?<=[A-Za-z])\s+(?=\()', '', texto)
    return re.sub(r'\s+', ' ', texto).strip()

def classificar(nome, numero):
    if numero <= 24: return 'Língua Portuguesa', 'Interpretação e língua portuguesa'
    if numero <= 27: return 'Direito Administrativo', 'Processo administrativo disciplinar'
    if numero in [29,30]: return 'Direito Constitucional', 'Direitos fundamentais'
    if numero == 32: return 'Direito Penal', 'Crimes contra a administração pública'
    if numero <= 33: return 'Direito Processual Penal', 'Investigação e prova penal'
    if numero <= 36: return 'Legislação penal especial', 'Legislação penal especial'
    if numero <= 48: return 'Matemática', 'Estatística'
    if numero <= 51: return 'Matemática', 'Análise combinatória'
    if numero <= 57: return 'Matemática', 'Raciocínio lógico'
    if numero <= 60: return 'Matemática', 'Conjuntos'
    if numero <= 96: return 'Informática', 'Informática'
    if nome.endswith('papiloscopista'):
        if numero <= 104: return 'Biologia', 'Biologia celular e genética'
        if numero <= 112: return 'Física', 'Ondulatória, óptica e eletrostática'
        return 'Química', 'Química geral e físico-química'
    if nome.endswith('escrivao') and numero >= 115: return 'Arquivologia', 'Gestão de documentos'
    return 'Contabilidade', 'Contabilidade geral'

def preparar():
    DESTINO.mkdir(parents=True, exist_ok=True)
    grupos = {}
    manifestos = []
    for nome in NOMES:
        itens = json.loads((ROOT/f'tmp/{nome}-questoes-revisar.json').read_text(encoding='utf8'))
        respostas = gabarito(ROOT/f'tmp/federais/{nome}-gabarito.pdf')
        assert [q['numero_original'] for q in itens] == list(range(1,121))
        assert sorted(respostas) == list(range(1,121))
        for q in itens:
            n = q['numero_original']
            letra = respostas[n]
            assert q['resposta_correta'] == (None if letra == 'X' else 0 if letra == 'C' else 1)
            q['materia'],q['conteudo'] = classificar(nome,n)
            q['rotulos_opcoes'] = ['C','E']
            q['gabarito_oficial'] = letra
            # Each proof retains its own crop, page, wording and question number.
            for registro,campo in [(q,'imagem_original')]+[(a,'imagem') for a in q['apoio']]:
                origem = ROOT/'public'/registro[campo].lstrip('/')
                novo = DESTINO/nome/origem.name
                novo.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(origem,novo)
                registro[campo] = '/'+novo.relative_to(ROOT/'public').as_posix()
            for a in q['apoio']:
                a['texto'] = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', a['texto'])
            texto = normalizar(re.sub(r'^\d+\s*', '', q['enunciado']))
            contexto = normalizar('\n'.join(a['texto'] for a in q['apoio']))
            chave = hashlib.sha256(('PF2021|'+texto+'|'+contexto).encode()).hexdigest()
            origem = {campo:copy.deepcopy(q[campo]) for campo in ['concurso','cargo','numero_original','fonte_pdf','fonte_gabarito','pagina','imagem_original','apoio','enunciado','recortes_pdf']}
            origem['id_original'] = q['id']
            if chave not in grupos:
                item = copy.deepcopy(q)
                item['id'] = 'pf-2021-operacionais-'+chave[:20]
                item['chave_oficial'] = chave
                item['provas'] = []
                item['origens_provas'] = []
                grupos[chave] = item
            item = grupos[chave]
            assert item['gabarito_oficial'] == letra, ('Conflito de gabarito',nome,n)
            assert q['concurso'] not in item['provas'], ('Colisão dentro do caderno',nome,n)
            item['provas'].append(q['concurso'])
            item['origens_provas'].append(origem)
        manifestos.append(dict(caderno=nome,concurso=itens[0]['concurso'],itens=120,corrigiveis=sum(l!='X' for l in respostas.values()),anuladas=[n for n,l in respostas.items() if l=='X'],respostas=''.join(respostas[n] for n in range(1,121)),fonte_pdf=itens[0]['fonte_pdf'],fonte_gabarito=itens[0]['fonte_gabarito'],sha256_pdf=hashlib.sha256((ROOT/f'tmp/federais/{nome}.pdf').read_bytes()).hexdigest(),sha256_gabarito=hashlib.sha256((ROOT/f'tmp/federais/{nome}-gabarito.pdf').read_bytes()).hexdigest()))
    itens = list(grupos.values())
    assert len(itens) == 153, len(itens)
    assert sum(len(q['origens_provas']) for q in itens) == 360
    for m in manifestos:
        origens = [o for q in itens for o in q['origens_provas'] if o['concurso'] == m['concurso']]
        assert sorted(o['numero_original'] for o in origens) == list(range(1,121))
    (DESTINO/'questoes.json').write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    (DESTINO/'manifesto.json').write_text(json.dumps(dict(itens_unicos=len(itens),posicoes_originais=360,cadernos=manifestos),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PF 2021: 153 itens únicos, 360 posições originais; corrigíveis por prova:',[m['corrigiveis'] for m in manifestos])

if __name__ == '__main__': preparar()
