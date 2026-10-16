"""Consolida os cinco blocos revistos dos três cargos operacionais PF 2025."""
import copy
import hashlib
import json
import shutil
from importar_cebraspe import ROOT, extrair, gabarito
from publicar_pf2021_operacionais import normalizar

BLOCOS = {
    'pf-2025-comum-bloco1': [1,9,11,17,19,23,26,28,29,33,35,40,45,49,53,57],
    'pf-2025-comum-bloco2': [61,64,66,69,73,79,85,89,91,93],
    'pf-2025-cargo-15': [97,99,105,108,111,116],
    'pf-2025-cargo-16': [97,102,107,111,114,118],
    'pf-2025-cargo-17': [97,99,101,103,105,110,113,117],
}
DESTINO = ROOT / 'public/acervo/pf-2025-operacionais'


def classificar(nome, n):
    if n <= 10: return 'Língua Portuguesa', 'Interpretação e língua portuguesa'
    if n <= 16: return 'Direito Administrativo', 'Direito Administrativo'
    if n == 20: return 'Direito Ambiental', 'Responsabilidade ambiental'
    if n <= 22: return 'Direito Constitucional', 'Direito Constitucional'
    if n <= 25 or n == 28: return 'Direito Penal', 'Direito Penal'
    if n <= 27: return 'Direito Processual Penal', 'Inquérito policial'
    if n <= 34: return 'Direitos Humanos', 'Direitos Humanos'
    if n <= 44: return 'Legislação penal especial', 'Legislação penal especial'
    if n <= 52: return 'Matemática', 'Estatística'
    if n <= 60: return 'Matemática', 'Raciocínio lógico'
    if n <= 96: return 'Informática', 'Informática'
    if nome.endswith('17'):
        if n <= 104: return 'Biologia', 'Biologia celular e genética'
        if n <= 112: return 'Física', 'Ondulatória, óptica e eletricidade'
        return 'Química', 'Química geral e físico-química'
    if nome.endswith('15') and n >= 111: return 'Arquivologia', 'Gestão de documentos'
    return 'Contabilidade', 'Contabilidade geral'


def preparar(reextrair=False):
    metas = json.loads((ROOT/'tmp/federais-manifesto-2025-prf.json').read_text(encoding='utf8'))
    grupos = {}; manifestos = []; provas = {}
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nome, inicios in BLOCOS.items():
        meta = next(m for m in metas if m['id'] == nome)
        if nome == 'pf-2025-comum-bloco1': meta['itens_sem_divisao'] = [54,55,60]
        if reextrair:
            itens = extrair(meta, ROOT/'public/acervo/federais-em-revisao')
            (ROOT/f'tmp/{nome}-questoes-revisar.json').write_text(json.dumps(itens,ensure_ascii=False,indent=2),encoding='utf8')
        else:
            itens = json.loads((ROOT/f'tmp/{nome}-questoes-revisar.json').read_text(encoding='utf8'))
        comandos = json.loads((ROOT/f'tmp/{nome}-comandos-revisar.json').read_text(encoding='utf8'))
        assert [c['antes_de'] for c in comandos] == inicios, nome
        respostas = gabarito(ROOT/f"tmp/federais/{meta['gabarito_local']}.pdf")
        assert sorted(respostas) == [q['numero_original'] for q in itens]
        for q in itens:
            n=q['numero_original']; letra=respostas[n]
            comando=next(c for c in reversed(comandos) if c['antes_de']<=n)
            apoio=[a for a in q['apoio'] if a['texto']==comando['texto']]
            assert len(apoio)==1,(nome,n)
            q['apoio']=copy.deepcopy(apoio)
            q['materia'],q['conteudo']=classificar(nome,n)
            q['rotulos_opcoes']=['C','E'];q['gabarito_oficial']=letra
            assert q['resposta_correta']==(None if letra=='X' else 0 if letra=='C' else 1)
            assert q['opcoes']==['Certo','Errado']
            for registro,campo in [(q,'imagem_original')]+[(a,'imagem') for a in q['apoio']]:
                origem=ROOT/'public'/registro[campo].lstrip('/')
                novo=DESTINO/nome/origem.name;novo.parent.mkdir(parents=True,exist_ok=True)
                shutil.copyfile(origem,novo)
                registro[campo]='/'+novo.relative_to(ROOT/'public').as_posix()
            # Inclui o contexto na comparação: frases curtas de casos diferentes não se fundem.
            texto=normalizar(q['enunciado'].removeprefix(str(n)).strip())
            contexto=normalizar('\n'.join(a['texto'] for a in q['apoio']))
            chave=hashlib.sha256(('PF2025|'+texto+'|'+contexto).encode()).hexdigest()
            if chave not in grupos:
                item=copy.deepcopy(q);item['id']='pf-2025-operacionais-'+chave[:20]
                item['chave_oficial']=chave;item['provas']=[];item['origens_provas']=[]
                grupos[chave]=item
            item=grupos[chave]
            assert item['gabarito_oficial']==letra,(nome,n,'Conflito de resposta')
            for concurso in q['provas']:
                assert concurso not in item['provas'],(nome,n,'Duplicata dentro da prova')
                origem={k:copy.deepcopy(q[k]) for k in ['numero_original','fonte_pdf','fonte_gabarito','pagina','imagem_original','apoio','enunciado','recortes_pdf']}
                origem.update(concurso=concurso,cargo=concurso.split(' — ')[-1],id_original=q['id'])
                item['provas'].append(concurso);item['origens_provas'].append(origem)
                provas.setdefault(concurso,[]).append((n,letra))
        manifestos.append(dict(caderno=nome,numeros=sorted(respostas),respostas=''.join(respostas[n] for n in sorted(respostas)),
                              provas=itens[0]['provas'],fonte_pdf=meta['fonte_pdf'],fonte_gabarito=meta['fonte_gabarito'],
                              sha256_pdf=hashlib.sha256((ROOT/f"tmp/federais/{meta['prova_local']}.pdf").read_bytes()).hexdigest(),
                              sha256_gabarito=hashlib.sha256((ROOT/f"tmp/federais/{meta['gabarito_local']}.pdf").read_bytes()).hexdigest()))
    itens=list(grupos.values())
    assert sum(len(q['origens_provas']) for q in itens)==360
    assert len(provas)==3
    cadernos=[]
    for concurso,ns in provas.items():
        ns.sort();assert [n for n,l in ns]==list(range(1,121)),concurso
        cadernos.append(dict(concurso=concurso,itens=120,corrigiveis=sum(l!='X' for n,l in ns),anuladas=[n for n,l in ns if l=='X'],respostas=''.join(l for n,l in ns)))
    (DESTINO/'questoes.json').write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    (DESTINO/'manifesto.json').write_text(json.dumps(dict(itens_unicos=len(itens),posicoes_originais=360,blocos=manifestos,cadernos=cadernos),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PF 2025 operacionais:',len(itens),'itens únicos; 360 posições;',[(m['concurso'],m['corrigiveis']) for m in cadernos])


if __name__=='__main__':
    import sys
    preparar('--reextrair' in sys.argv)
