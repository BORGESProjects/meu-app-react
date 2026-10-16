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
    5: [51,54,59,63,67,70,74,79,82,85,87,90,92,94,104,107,109,111,116],
    6: [51,57,68,71,74,78,83,85,90,95,100,103,107,111,113,117],
    7: [51,54,57,60,62,65,68,73,81,85,90,94,97,103,105,108,111,114,117],
    8: [51,55,59,65,68,73,79,83,88,98,101,102,104,112,117],
    9: [51,54,57,61,65,66,70,73,76,79,83,86,88,91,98,103,106,111,117,119],
    10: [51,56,61,63,64,65,67,70,74,77,81,83,85,87,90,93,97,99,101,107,113,117],
    11: [51,55,60,64,69,74,77,82,85,87,91,95,99,104,107,110,113],
    12: [51,54,56,60,63,65,67,71,76,83,87,91,95,97,99,101,105,109,115,118],
    13: [51,56,62,65,68,70,75,81,85,89,92,95,102,105,109,113,118],
    14: [51,56,58,65,70,72,75,77,80,84,87,89,93,97,105,109,113,117,119],
}
COMUM = [1,9,13,15,21,23,25,29,31,32,35,37,40,46]
SOBREPOSICOES_CONFERIDAS = {(111,115),(112,113),(114,114),(115,116),(116,118),(117,120),(119,119),(120,117)}
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
    if cargo==13:
        if n<=67:return 'Medicina Legal','Antropologia forense e osteologia'
        if n<=80:return 'Criminalística','Cadeia de custódia e arqueologia forense'
        if n<=84:return 'Medicina Legal','Entomologia forense'
        if n<=104:return 'Medicina Legal','Antropologia forense e identificação humana'
        if n<=108:return 'Medicina Legal','Traumatologia forense'
        return 'Criminalística','Identificação de vítimas e direitos humanos'
    if cargo==14:
        if n<=57:return 'Biologia','Fisiologia e anatomia vegetal'
        if n<=64:return 'Geografia','Solos e domínios morfoclimáticos'
        if n<=74:return 'Biologia','Ecologia'
        if n<=88:return 'Engenharia Ambiental','Gestão ambiental e conservação florestal'
        if n<=96:return 'Engenharia Ambiental','Qualidade ambiental e ecotoxicologia'
        if n<=104:return 'Engenharia Ambiental','Geoprocessamento e sensoriamento remoto'
        if n<=112:return 'Direito Agrário','Regularização fundiária e registros de imóveis'
        return 'Direito Ambiental','Legislação ambiental'
    if cargo==11:
        if n<=68:return 'Biologia','Genética molecular'
        if n<=73:return 'Biologia','Genética de populações'
        if n<=86:return 'Biologia','Genética forense'
        if n<=103:return 'Matemática','Probabilidade e estatística'
        return 'Criminalística','Genética forense e gestão de laboratórios'
    if cargo==12:
        if n<=55:return 'Biologia','Ecologia e botânica'
        if n<=59:return 'Geografia','Climatologia e relevo'
        if n<=64:return 'Engenharia Ambiental','Gestão ambiental e planejamento urbano'
        if n<=75:return 'Engenharia Ambiental','Urbanização e saneamento'
        if n<=86:return 'Engenharia Ambiental','Hidrologia e poluição hídrica'
        if n<=94:return 'Engenharia Ambiental','Poluição do solo e atmosférica'
        if n<=108:return 'Engenharia Ambiental','Geoprocessamento e sensoriamento remoto'
        return 'Direito Ambiental','Legislação ambiental'
    if cargo==10:
        if n<=55:return 'Engenharia de Minas','Operação e encerramento de minas'
        if n<=66:return 'Engenharia de Minas','Geotecnia e barragens'
        if n<=76:return 'Engenharia de Minas','Recursos minerais e planejamento de lavra'
        if n<=96:return 'Engenharia de Minas','Prospecção e análise mineral'
        if n<=100:return 'Engenharia de Minas','Hidrologia e hidrogeologia'
        return 'Engenharia de Minas','Normas e legislação mineral e ambiental'
    if cargo==9:
        if n<=56:return 'Física','Grandezas físicas e mecânica'
        if n<=60:return 'Física','Fluidos e ondas'
        if n<=65:return 'Física','Mecânica e balística'
        if n<=72:return 'Física','Eletromagnetismo'
        if n<=75:return 'Física','Termodinâmica'
        if n<=82:return 'Física','Óptica e ondas'
        if n<=90:return 'Física','Física moderna e nuclear'
        if n<=105:return 'Criminalística','Balística forense'
        if n<=110:return 'Física','Microscopia e análise de materiais'
        return 'Legislação Especial','Armas e produtos controlados'
    if cargo==7:
        if n<=67:return 'Engenharia Cartográfica','Topografia e geodésia'
        if n<=84:return 'Engenharia Cartográfica','Cartografia e fotogrametria'
        if n<=96:return 'Engenharia Cartográfica','Sensoriamento remoto'
        if n<=102:return 'Engenharia Cartográfica','Sistemas de informações geográficas'
        if n<=107:return 'Engenharia Cartográfica','Avaliação de imóveis'
        return 'Engenharia Cartográfica','Georreferenciamento e processamento de imagens'
    if cargo==8:
        if n<=54:return 'Medicina Legal','Cadeia de custódia'
        if n<=64:return 'Medicina Legal','Traumatologia forense'
        if n<=67:return 'Medicina Legal','Asfixiologia e baropatias'
        if n<=87:return 'Medicina Legal','Tanatologia e necropsia'
        if n<=97:return 'Medicina Legal','Sexologia forense'
        if n<=100:return 'Medicina Legal','Antropologia forense'
        if n==101:return 'Medicina Legal','Toxicologia forense'
        if n<=103:return 'Medicina Legal','Sexologia forense'
        if n<=111:return 'Medicina Legal','Psiquiatria forense'
        return 'Medicina Legal','Perícia médica e previdenciária'
    if cargo==5:
        if n<=58:return 'Geologia','Geoquímica e mineralogia'
        if n<=62:return 'Geologia','Paleontologia'
        if n<=66:return 'Geologia','Intemperismo e formação dos solos'
        if n<=73:return 'Geologia','Geoprocessamento e geoestatística'
        if n<=78:return 'Geologia','Geologia ambiental'
        if n<=84:return 'Geologia','Mecânica dos solos e das rochas'
        if n<=93:return 'Geologia','Análise de materiais geológicos'
        if n<=108:return 'Geologia','Recursos minerais e mineração'
        return 'Geologia','Legislação mineral e ambiental'
    if cargo==6:
        if n<=70:return 'Engenharia Civil','Construção e orçamento de edificações'
        if n<=77:return 'Engenharia Civil','Geotecnia e barragens'
        if n<=84:return 'Engenharia Civil','Saneamento e recursos hídricos'
        if n<=102:return 'Engenharia Civil','Estruturas e materiais de construção'
        if n<=112:return 'Engenharia Civil','Perícias e fiscalização de obras'
        if n<=116:return 'Engenharia Civil','Obras portuárias'
        return 'Engenharia Civil','Patologias das construções'
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
    unicos={};sobreposicoes=0
    for q in itens:
        chave=q['chave_oficial']
        if chave not in unicos:
            unicos[chave]=q
            continue
        anterior=unicos[chave]
        assert anterior['id'].startswith('pf-2025-cargo-5-') and q['id'].startswith('pf-2025-cargo-10-'),(anterior['id'],q['id'])
        assert (anterior['numero_original'],q['numero_original']) in SOBREPOSICOES_CONFERIDAS
        assert (anterior['gabarito_oficial'],anterior['anulada'])==(q['gabarito_oficial'],q['anulada'])
        anterior['provas']=list(dict.fromkeys(anterior['provas']+q['provas']))
        anterior['origens_provas']+=q['origens_provas']
        sobreposicoes+=1
    itens=list(unicos.values())
    provas=[]
    for concurso in nomes:
        qs=sorted([{**q,**next(o for o in q['origens_provas'] if o['concurso']==concurso)} for q in itens if concurso in q['provas']],key=lambda q:q['numero_original'])
        assert [q['numero_original'] for q in qs]==list(range(1,121)),concurso
        provas.append(dict(concurso=concurso,itens=120,corrigiveis=sum(not q['anulada'] for q in qs),
                           anuladas=[q['numero_original'] for q in qs if q['anulada']],respostas=''.join(q['gabarito_oficial'] for q in qs)))
    (DESTINO/'questoes.json').write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    (DESTINO/'manifesto.json').write_text(json.dumps(dict(itens_unicos=len(itens),sobreposicoes_conferidas=sobreposicoes,blocos=manifestos,cadernos=provas),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PF 2025 Peritos:',len(itens),'itens;',len(provas),'áreas completas')


if __name__=='__main__':
    import sys
    if '--reextrair' in sys.argv:
        from importar_cebraspe import extrair
        metas=json.loads((ROOT/'tmp/federais-manifesto-2025-prf.json').read_text(encoding='utf8'))
        for cargo,opcoes in {3:{'topos_itens':{58:371.0,105:110.0}},4:{'itens_sem_divisao':[82,93,98],'topos_itens':{118:119.0,119:153.1,120:187.2}},5:{},6:{},7:{},8:{},9:{},10:{},11:{},13:{},14:{}}.items():
            meta=next(m for m in metas if m['id']==f'pf-2025-cargo-{cargo}')
            meta.update(opcoes)
            # Nestes itens, a primeira linha não possui símbolos elevados.
            # A margem de 1 ponto exclui os descendentes da linha anterior.
            sem_fragmentos={5:[72,73,77],6:[115,116,119,120],7:[66,74,75,78,80],8:[116,118,119,120],9:[120],10:[66,69,71,73,75,78,108,109,111,112,114,116,119,120],11:[52,55,69,71,73,75,76,100,101,108,109],13:[76,77,82,84,87,88,98,114,116,119,120],14:[110,111,114,115,118,120]}.get(cargo,[])
            if sem_fragmentos:
                import pdfplumber
                with pdfplumber.open(ROOT/f"tmp/federais/{meta['prova_local']}.pdf") as doc:
                    meta['topos_itens']={int(w['text']):w['top']-1 for p in doc.pages for w in p.extract_words(extra_attrs=['size']) if w['text'].isdigit() and int(w['text']) in sem_fragmentos and abs(w['size']-9)<.15 and (26<=w['x0']<=33 or 301<=w['x0']<=309)}
            qs=extrair(meta,ROOT/'public/acervo/federais-em-revisao')
            (ROOT/f"tmp/{meta['id']}-questoes-revisar.json").write_text(json.dumps(qs,ensure_ascii=False,indent=2),encoding='utf8')
    preparar()
