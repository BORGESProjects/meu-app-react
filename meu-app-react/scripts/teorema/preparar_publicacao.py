"""Copy only explicitly validated records/assets into the public static archive.

Run after structural, interface and visual checks; Git push is separate.
All rejected CSV rows remain accounted for in the local review report.
"""
import collections
import csv
import json
import re
import shutil
from pathlib import Path
from auditar_pacote import WORK, ROOT


def load(path):
    return json.loads(path.read_text(encoding='utf8'))


def main():
    stage=WORK/'lote-colunas'
    target=ROOT/'public/acervo/teorema-180'
    old=load(target/'questoes.json')
    approved=load(stage/'aprovadas-interface.json')
    old_ids={q['id'] for q in old}
    additions=[q for q in approved if q['id'] not in old_ids]
    assert additions, 'Nenhum lote novo validado'
    assert all(not q.get('cortes_para_conferencia') for q in additions), 'Limite visual ainda pendente'
    assets=set()
    for q in additions:
        for asset in [q['imagem_original'],*q['opcoes_imagens'],*[p['imagem'] for p in q.get('apoio',[])]]:
            name=Path(asset).name
            assert re.fullmatch(r'(?:teorema-[a-f0-9]{16}-[0-5]|apoio-[a-f0-9]{20})\.webp',name), name
            assert (stage/name).is_file(),name
            assets.add(name)
    for name in sorted(assets):
        shutil.copy2(stage/name,target/name)
    combined=[*old,*additions]
    assert len({q['id'] for q in combined})==len(combined)
    (target/'questoes.json').write_text(json.dumps(combined,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    app=ROOT/'src/App.jsx'
    text=app.read_text(encoding='utf8')
    pattern=r"(const teoremaRevisadas = tentarLeitura\(async \(\) => \{[\s\S]*?data.length !== )\d+"
    text,count=re.subn(pattern,lambda m:m[1]+str(len(combined)),text,count=1)
    assert count==1
    app.write_text(text,encoding='utf8')
    pending=set(load(WORK/'pendentes-originais.json'))
    plan=load(WORK/'plano-colunas.json')
    accepted={q['fonte_material']['registro_csv']:q for q in additions}
    held={r['numero_csv']:r for name in ['retidas.json','retidas-interface.json'] for r in load(stage/name)}
    errors={int(r['csv']):r for r in load(stage/'falhas.json')}
    report=[]
    for row in plan:
        n=row['numero_csv']
        if n not in pending:
            continue
        if n in accepted:
            state,reason='Adicionada','Enunciado, alternativas, imagens e gabarito reconstruídos do PDF'
        elif n in held:
            reason=held[n]['motivo'];state='Duplicata' if 'repetido' in reason or 'duplicata' in reason else 'Retida'
        elif n in errors:
            state,reason='Retida',errors[n]['motivo']
        elif row['status']=='duplicata_csv':
            state,reason='Duplicata','Repete a pergunta associada ao registro CSV '+str(row['duplicata_de'])
        elif row['status']=='ja_publicada':
            state,reason='Já disponível','Questão já publicada no primeiro lote'
        else:
            state,reason='Retida',row.get('motivo','Conferência adicional necessária')
        report.append({'registro_csv':n,'resultado':state,'arquivo':row['arquivo'],'numero_pdf':row.get('numero_pdf',''),'motivo':reason,'id':row.get('id','')})
    assert len(report)==len(pending)==2242
    output=ROOT/'output';output.mkdir(exist_ok=True)
    with (output/'revisao-2242-teorema.csv').open('w',encoding='utf-8-sig',newline='') as handle:
        writer=csv.DictWriter(handle,fieldnames=list(report[0]),delimiter=';');writer.writeheader();writer.writerows(report)
    summary={'data':'2026-10-20','registros_revisados':len(report),'resultados':dict(collections.Counter(r['resultado'] for r in report)),
             'questoes_novas':len(additions),'primeiro_lote_preservado':len(old),'total_lote_publico':len(combined),
             'novas_imagens':len(assets),'gabaritos_corrigidos_novas':sum(q['gabarito_corrigido_do_csv'] for q in additions),
             'assimilacao_novas':sum(q['banca']=='Questões de assimilação' for q in additions),
             'materias':dict(collections.Counter(q['materia'] for q in additions)),
             'retidas':[r for r in report if r['resultado']=='Retida'],
             'metodo':'Conferência estrutural de todos os registros, gabaritos do material, limites por geometria e imagem; amostragem visual; limites não comprovados permanecem retidos. Não equivale a confrontar cada resposta com gabaritos oficiais externos.'}
    docs=ROOT/'docs';docs.mkdir(exist_ok=True)
    (docs/'teorema-revisao-2242.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    (WORK/'publicacao-lote2.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({k:v for k,v in summary.items() if k not in ['retidas','metodo']},ensure_ascii=True))


if __name__=='__main__':
    main()
