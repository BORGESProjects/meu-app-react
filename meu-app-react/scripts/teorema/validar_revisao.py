"""Validate every private rendered asset and remove confirmed text duplicates.

Does not write into public or the database. A manifest retains every excluded
CSV row, including uncertain matches that must not be published automatically.
"""
import collections
import json
from pathlib import Path
from PIL import Image
from auditar_pacote import ROOT, WORK, fold


def text_key(q):
    text=fold(q.get('enunciado',''))
    opts=[fold(x) for x in q.get('opcoes',[]) if isinstance(x,str)]
    # Short mathematical OCR is not an identity: different equations can have
    # exactly the same flattened text. Only sufficiently descriptive text counts.
    if len(text)<90 or not opts or any(len(x)<10 for x in opts):
        return None
    return text+'::'+'|'.join(opts)


def records(value):
    if isinstance(value,list):
        return [q for q in value if isinstance(q,dict) and isinstance(q.get('opcoes'),list)]
    if isinstance(value,dict):
        return records(value.get('questoes',[]))
    return []


def main():
    stage=WORK/'lote-colunas'
    questions=json.loads((stage/'questoes.json').read_text(encoding='utf8'))
    existing=[]
    for name in ['acervo-existente-0.json','acervo-existente-1.json']:
        existing.extend(records(json.loads((WORK/name).read_text(encoding='utf8'))))
    for path in (ROOT/'public/acervo').rglob('questoes.json'):
        if any(x in path.parts for x in ['federais-em-revisao','quarentena']):
            continue
        existing.extend(records(json.loads(path.read_text(encoding='utf8'))))
    visible_path=WORK/'acervo-visivel-anterior.json'
    if visible_path.exists():
        existing=records(json.loads(visible_path.read_text(encoding='utf8')))
    seen={text_key(q):q.get('id') for q in existing if text_key(q)}
    visual={q.get('identidade_visual'):q.get('id') for q in existing if q.get('identidade_visual')}
    approved=[];held=[];images={};ids=set()
    reviewed_path=stage/'conferencia-visual.json'
    reviewed=json.loads(reviewed_path.read_text(encoding='utf8')) if reviewed_path.exists() else {}
    for q in questions:
        identity=q['id'];reason=None
        if q['fonte_material']['registro_csv']==277:
            reason='duplicata já identificada na revisão anterior; fora dos 2242 pendentes'
        if q.get('cortes_para_conferencia') and identity not in reviewed:
            reason='limite visual sem faixa branca; exige conferência individual'
        if identity in ids:
            reason='identificador repetido'
        ids.add(identity)
        if len(q['opcoes']) not in [4,5] or len(q['opcoes_imagens'])!=len(q['opcoes']):
            reason='quantidade de alternativas inconsistente'
        if not q.get('anulada') and not (isinstance(q['resposta_correta'],int) and 0<=q['resposta_correta']<len(q['opcoes'])):
            reason='resposta fora das alternativas'
        for asset in [q['imagem_original'],*q['opcoes_imagens'],*[p['imagem'] for p in q.get('apoio',[])]]:
            if not asset.startswith('/acervo/teorema-180/') or Path(asset).name!=asset.split('/')[-1]:
                reason='endereço de imagem inválido';continue
            path=stage/Path(asset).name
            try:
                with Image.open(path) as im:
                    im.verify()
                with Image.open(path) as im:
                    width,height=im.size
                if width<20 or height<15:
                    reason='imagem muito pequena para conferência'
                images[asset]={'largura':width,'altura':height,'bytes':path.stat().st_size}
            except (OSError,ValueError):
                reason='imagem ausente ou inválida'
        key=text_key(q)
        duplicate=seen.get(key) if key else None
        duplicate=duplicate or visual.get(q['identidade_visual'])
        if duplicate:
            reason='conteúdo repetido no acervo ou neste lote'
        if reason:
            held.append({'id':identity,'numero_csv':q['fonte_material']['registro_csv'],'motivo':reason,'duplicata_de':duplicate})
        else:
            approved.append(q)
            if key:
                seen[key]=identity
            visual[q['identidade_visual']]=identity
    for name,value in [('aprovadas.json',approved),('retidas.json',held),('imagens-validadas.json',images)]:
        (stage/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'renderizadas':len(questions),'aprovadas_estruturalmente':len(approved),'retidas':len(held),'motivos':dict(collections.Counter(x['motivo'] for x in held)),'imagens_verificadas':len(images)},ensure_ascii=True))


if __name__=='__main__':
    main()
