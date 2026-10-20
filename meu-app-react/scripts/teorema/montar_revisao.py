"""Reconcile every CSV row with original question text AND choices.

The old extractor sometimes assigned question 7 the number 2. The original
number is therefore only a hint, not a primary key for matching CSV rows.
"""
import collections
import hashlib
import json
from difflib import SequenceMatcher
from functools import lru_cache

from auditar_pacote import WORK, ROOT, read_rows, fold
from extrair_colunas import VERSION, reference_at_start
from metadados import classify


@lru_cache(maxsize=200000)
def similarity(a, b):
    a, b = fold(a), fold(b)
    if not a or not b:
        return 0.0
    if min(len(a), len(b)) >= 4 and (a.startswith(b) or b.startswith(a)):
        return 1.0
    return SequenceMatcher(None, a[:350], b[:350], autojunk=False).ratio()


def match_row(row, candidates):
    ranked = []
    row_options = json.loads(row['opcoes'])
    _, row_text = reference_at_start(row['enunciado'])
    for q in candidates:
        if q.get('pendencia'):
            continue
        txt = similarity(row_text, q['enunciado'])
        scores = [similarity(a,b) for a,b in zip(row_options, q['opcoes'])]
        opt = sum(scores)/max(len(row_options),len(q['opcoes'])) if scores else 0
        same_number = str(q['numero']) == row['numero_origem']
        score = .55*txt + .4*opt + .05*same_number
        ranked.append((score, txt, opt, same_number, q))
    ranked.sort(key=lambda item: item[0], reverse=True)
    if not ranked:
        return None, {'motivo': 'nenhum bloco completo com gabarito no PDF'}
    score, txt, opt, same_number, q = ranked[0]
    margin = score - (ranked[1][0] if len(ranked)>1 else 0)
    min_text = min(len(fold(row_text)), len(fold(q['enunciado'])))
    confidence = ((txt >= .72 and min_text >= 25 and (opt >= .35 or same_number))
                  or (opt >= .88 and margin >= .12)
                  or (txt >= .92 and min_text >= 65 and margin >= .10)
                  or (same_number and txt >= .5 and opt >= .6 and margin >= .12))
    info = {'score': round(score,4), 'texto': round(txt,4), 'alternativas': round(opt,4), 'margem': round(margin,4), 'numero_pdf': q['numero']}
    if not confidence or (len(ranked)>1 and margin < .025):
        return None, info | {'motivo': 'correspondência entre CSV e PDF ambígua', 'candidatos': [i[4]['numero'] for i in ranked[:3]]}
    return q, info


def main():
    sources = json.loads((WORK/'fontes.json').read_text(encoding='utf-8'))
    published = {q['id']:q for q in json.loads((ROOT/'public/acervo/teorema-180/questoes.json').read_text(encoding='utf-8'))}
    published_by_csv = {q['fonte_material']['registro_csv']:q for q in published.values() if q.get('fonte_material',{}).get('registro_csv')}
    documents = {}
    results, selected, used = [], [], {}
    for row in read_rows():
        filename = row['arquivo_origem']
        entry = {'numero_csv': int(row['numero']), 'arquivo': filename, 'numero_csv_origem': row['numero_origem']}
        if entry['numero_csv'] in published_by_csv:
            old=published_by_csv[entry['numero_csv']]
            used[old['id']]=entry['numero_csv']
            results.append(entry | {'status':'ja_publicada','id':old['id'],'numero_pdf':old['fonte_material']['numero']})
            continue
        if int(row['numero']) == 2123:
            results.append(entry | {'status':'quarentena', 'motivo':'revisão visual: exercícios discursivos 2–4 mesclados em alternativas inexistentes; sem gabarito de múltipla escolha'})
            continue
        if len(sources.get(filename,[])) != 1:
            results.append(entry | {'status':'quarentena', 'motivo':'PDF original não localizado de forma única'}); continue
        if filename not in documents:
            path = WORK/'documentos-colunas'/(hashlib.sha256(filename.encode()).hexdigest()[:16]+'.json')
            documents[filename] = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'erro':'extração ainda não executada'}
        doc = documents[filename]
        if doc.get('versao') != VERSION or doc.get('erro'):
            results.append(entry | {'status':'quarentena', 'motivo':doc.get('erro','extração desatualizada')}); continue
        candidates = [q | {'ocorrencia':index} for values in doc.get('questoes',{}).values() for index,q in enumerate(values)]
        # The first published batch was independently checked in the PDFs.
        # Keep those records even when a conservative new context rule declines
        # to reconstruct them again; this is not a reason to republish them.
        for old in published.values():
            source=old.get('fonte_material',{})
            if source.get('arquivo') != filename:
                continue
            n=source.get('numero')
            if not any(q.get('numero')==n and not q.get('pendencia') for q in candidates):
                candidates.append({'numero':n,'enunciado':old['enunciado'],'opcoes':old['opcoes'],
                                   'ocorrencia':0,'publicada_id':old['id']})
        q, info = match_row(row, candidates)
        if q is None:
            results.append(entry | {'status':'quarentena'} | info); continue
        origin = filename+':'+str(q['numero']) + (':'+str(q['ocorrencia']) if q['ocorrencia'] else '')
        identity = q.get('publicada_id') or 'teorema-' + hashlib.sha256(origin.encode()).hexdigest()[:16]
        entry |= info | {'id':identity, 'numero_pdf':q['numero'], 'numero_corrigido':str(q['numero']) != row['numero_origem']}
        if identity in used:
            results.append(entry | {'status':'duplicata_csv', 'duplicata_de':used[identity]}); continue
        used[identity] = entry['numero_csv']
        if identity in published:
            results.append(entry | {'status':'ja_publicada'}); continue
        try:
            meta = classify(q['referencia'])
        except ValueError as error:
            results.append(entry | {'status':'quarentena', 'motivo':str(error)}); continue
        corrected = (q['resposta_correta'] is not None and row['resposta_correta'].upper() != chr(q['resposta_correta']+65))
        selected.append({'id':identity, 'csv':row, 'questao':q, 'metadados':meta, 'correspondencia':info,
                         'fonte_local':sources[filename][0], 'gabarito_corrigido_do_csv':corrected})
        results.append(entry | {'status':'candidata', 'gabarito_corrigido':corrected})
    summary = {'total_registros':len(results), 'estados':dict(collections.Counter(r['status'] for r in results)),
               'motivos_quarentena':dict(collections.Counter(r.get('motivo') for r in results if r['status']=='quarentena')),
               'numeros_corrigidos':sum(r.get('numero_corrigido',False) for r in results),
               'gabaritos_corrigidos':sum(r.get('gabarito_corrigido',False) for r in results)}
    for name,value in [('plano-colunas.json',results),('candidatas-colunas.json',selected),('resumo-colunas.json',summary)]:
        (WORK/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=True))


if __name__ == '__main__':
    main()
