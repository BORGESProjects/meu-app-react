"""Publica somente as áreas de Perito cujos recortes e comandos foram revisados."""
import copy
import hashlib
import json
import shutil
from importar_cebraspe import ROOT, gabarito
from publicar_pf2021_operacionais import normalizar

# Cargo Cebraspe -> limites dos comandos específicos conferidos nas páginas oficiais.
APROVADOS = {
    2: [51,54,58,61,63,65,69,74,77,80,83,85,91,93,97,99,101,103,105,110,113,114,116,118],
    3: [51,55,57,61,65,69,71,73,75,77,80,83,87,92,96,100,104,109,113,117],
    4: [51,55,57,60,62,65,67,69,72,74,76,79,81,83,85,87,89,91,93,95,97,100,102,104,106,110,114,117],
}
COMUM = [1,9,13,15,21,23,25,29,31,32,35,37,40,46]
DESTINO = ROOT/'public/acervo/pf-2025-peritos'


def classificar(cargo,n):
    if n<=12:return 'Língua Portuguesa','Interpretação e língua portuguesa'
    if n<=20:return 'Informática','Informática'
    if n<=24:return 'Direito Administrativo','Direito Administrativo'
    if n<=28:return 'Direito Constitucional','Direito Constitucional'
    if n<=30:return 'Direito Penal','Direito Penal'
    if n<=34:return 'Direito Processual Penal','Investigação e prova penal'
    if n<=39:return 'Criminalística','Vestígios e perícia criminal'
    if n<=45:return 'Direitos Humanos','Direitos Humanos'
    if n<=50:return 'Matemática','Raciocínio lógico'
    if cargo==4:
        if n<=56:return 'Informática','Arquitetura de computadores e armazenamento'
        if n<=64:return 'Informática','Bancos de dados'
        if n<=68:return 'Informática','Segurança da informação'
        if n<=78:return 'Informática','Programação e desenvolvimento de sistemas'
        if n<=94:return 'Informática','Redes e segurança da informação'
        if n<=101:return 'Informática','Sistemas operacionais'
        if n<=103:return 'Informática','Governança de tecnologia da informação'
        if n<=105:return 'Informática','Inteligência artificial'
        return 'Informática','Perícia digital'
    if cargo==3:
        if n<=68:return 'Engenharia Elétrica','Sinais e processamento digital'
        if n<=86:return 'Informática','Inteligência artificial'
        if n<=95:return 'Engenharia Elétrica','Telecomunicações'
        if n<=103:return 'Engenharia Elétrica','Eletrônica e circuitos elétricos'
        return 'Informática','Algoritmos e processamento multimídia'
    assert cargo==2,'Classificação específica ainda não revisada'
    if n<=60:return 'Contabilidade','Contabilidade geral e custos'
    if n<=64:return 'Direito Administrativo','Licitações e contratos'
    if n<=68:return 'Direito Tributário','Imposto de renda'
    if n<=73:return 'Direito Penal','Crimes financeiros e tributários'
    if n<=76:return 'Direito Processual Penal','Investigação e prova penal'
    if n<=90:return 'Conhecimentos Bancários','Sistema financeiro e investigação financeira'
    if n<=96:return 'Direito Previdenciário','Regimes previdenciários'
    if n<=104:return 'Matemática','Matemática financeira'
    if n<=112:return 'Matemática','Estatística'
    return 'Informática','Bancos de dados e ciência de dados'


def preparar():
    metas=json.loads((ROOT/'tmp/federais-manifesto-2025-prf.json').read_text(encoding='utf8'))
    aprovadas=[next(m for m in metas if m['id']==f'pf-2025-cargo-{cargo}') for cargo in APROVADOS]
    nomes=[m['provas'][0].replace(' - ',' — ',1) for m in aprovadas]
    # O núcleo comum só se associa às áreas completas já aprovadas, evitando simulados de 50 itens.
    blocos=[next(m for m in metas if m['id']=='pf-2025-comum-peritos')]+aprovadas
    itens=[];manifestos=[];DESTINO.mkdir(parents=True,exist_ok=True)
    for meta in blocos:
        nome=meta['id'];comum=nome.endswith('comum-peritos');cargo=None if comum else int(nome.split('-')[-1])
        qs=json.loads((ROOT/f'tmp/{nome}-questoes-revisar.json').read_text(encoding='utf8'))
        comandos=json.loads((ROOT/f'tmp/{nome}-comandos-revisar.json').read_text(encoding='utf8'))
        assert [c['antes_de'] for c in comandos]==(COMUM if comum else APROVADOS[cargo]),nome
        respostas=gabarito(ROOT/f"tmp/federais/{meta['gabarito_local']}.pdf")
        assert [q['numero_original'] for q in qs]==sorted(respostas)
        for q in qs:
            n=q['numero_original'];letra=respostas[n]
            comando=next(c for c in reversed(comandos) if c['antes_de']<=n)
            apoio=[a for a in q['apoio'] if a['texto']==comando['texto']]
            assert len(apoio)==1,(nome,n)
            q['apoio']=copy.deepcopy(apoio)
            q['materia'],q['conteudo']=classificar(cargo,n)
            q['rotulos_opcoes']=['C','E'];q['gabarito_oficial']=letra
            q['provas']=nomes if comum else [q['provas'][0]]
            assert q['resposta_correta']==(None if letra=='X' else 0 if letra=='C' else 1)
            for registro,campo in [(q,'imagem_original')]+[(a,'imagem') for a in q['apoio']]:
                origem=ROOT/'public'/registro[campo].lstrip('/')
                novo=DESTINO/nome/origem.name;novo.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(origem,novo)
                registro[campo]='/'+novo.relative_to(ROOT/'public').as_posix()
            texto=normalizar(q['enunciado'].removeprefix(str(n)).strip())
            contexto=normalizar('\n'.join(a['texto'] for a in q['apoio']))
            q['chave_oficial']=hashlib.sha256(('PF2025|'+texto+'|'+contexto).encode()).hexdigest()
            q['origens_provas']=[]
            for concurso in q['provas']:
                origem={k:copy.deepcopy(q[k]) for k in ['numero_original','fonte_pdf','fonte_gabarito','pagina','imagem_original','apoio','enunciado','recortes_pdf']}
                origem.update(concurso=concurso,cargo=concurso.split(' — ')[-1],id_original=q['id'])
                q['origens_provas'].append(origem)
            itens.append(q)
        manifestos.append(dict(caderno=nome,numeros=sorted(respostas),respostas=''.join(respostas[n] for n in sorted(respostas)),
                              fonte_pdf=meta['fonte_pdf'],fonte_gabarito=meta['fonte_gabarito'],
                              sha256_pdf=hashlib.sha256((ROOT/f"tmp/federais/{meta['prova_local']}.pdf").read_bytes()).hexdigest(),
                              sha256_gabarito=hashlib.sha256((ROOT/f"tmp/federais/{meta['gabarito_local']}.pdf").read_bytes()).hexdigest()))
    # Nenhuma duplicata pode apagar o vínculo de uma prova já publicada.
    existentes=json.loads((ROOT/'public/acervo/pf-2025-operacionais/questoes.json').read_text(encoding='utf8'))
    assert not ({q['chave_oficial'] for q in itens}&{q['chave_oficial'] for q in existentes})
    assert len({q['chave_oficial'] for q in itens})==len(itens)
    provas=[]
    for concurso in nomes:
        qs=sorted([q for q in itens if concurso in q['provas']],key=lambda q:q['numero_original'])
        assert [q['numero_original'] for q in qs]==list(range(1,121)),concurso
        provas.append(dict(concurso=concurso,itens=120,corrigiveis=sum(not q['anulada'] for q in qs),
                           anuladas=[q['numero_original'] for q in qs if q['anulada']],respostas=''.join(q['gabarito_oficial'] for q in qs)))
    (DESTINO/'questoes.json').write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    (DESTINO/'manifesto.json').write_text(json.dumps(dict(itens_unicos=len(itens),blocos=manifestos,cadernos=provas),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PF 2025 Peritos:',len(itens),'itens;',len(provas),'áreas completas')


if __name__=='__main__':
    import sys
    if '--reextrair' in sys.argv:
        from importar_cebraspe import extrair
        metas=json.loads((ROOT/'tmp/federais-manifesto-2025-prf.json').read_text(encoding='utf8'))
        for cargo,opcoes in {3:{'topos_itens':{58:371.0,105:110.0}},4:{'itens_sem_divisao':[82,93,98],'topos_itens':{118:119.0,119:153.1,120:187.2}}}.items():
            meta=next(m for m in metas if m['id']==f'pf-2025-cargo-{cargo}')
            meta.update(opcoes)
            qs=extrair(meta,ROOT/'public/acervo/federais-em-revisao')
            (ROOT/f"tmp/{meta['id']}-questoes-revisar.json").write_text(json.dumps(qs,ensure_ascii=False,indent=2),encoding='utf8')
    preparar()
