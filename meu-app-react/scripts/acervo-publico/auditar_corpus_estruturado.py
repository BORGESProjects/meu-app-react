import gzip
import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2] / "public" / "acervo-extraido"
MANIFEST = ROOT / "manifesto.json"


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    lots = manifest.get("lotes", [])
    seen_ids = set()
    duplicate_ids = 0
    missing_enunciado = 0
    no_page_image = 0
    missing_image_paths = Counter()
    all_image_paths = set()
    issue_counts = Counter()
    type_counts = Counter()
    batch_errors = []
    checked_questions = 0
    lot_bytes = 0

    for lot in lots:
        relative = str(lot.get("arquivo", ""))
        path = ROOT / relative
        if not path.is_file():
            batch_errors.append({"arquivo": relative, "erro": "lote ausente"})
            continue
        lot_bytes += path.stat().st_size
        try:
            questions = json.loads(gzip.decompress(path.read_bytes()))
        except Exception as error:
            batch_errors.append({"arquivo": relative, "erro": str(error)})
            continue
        if not isinstance(questions, list):
            batch_errors.append({"arquivo": relative, "erro": "JSON não é uma lista"})
            continue
        if len(questions) != int(lot.get("quantidade", -1)):
            batch_errors.append({"arquivo": relative, "erro": "quantidade diverge do manifesto", "esperado": lot.get("quantidade"), "real": len(questions)})

        for question in questions:
            checked_questions += 1
            qid = str(question.get("id", ""))
            if not qid or qid in seen_ids:
                duplicate_ids += 1
            seen_ids.add(qid)
            if not str(question.get("enunciado", "")).strip():
                missing_enunciado += 1
            tipo = str(question.get("tipo_extraido", ""))
            type_counts[tipo or "sem tipo"] += 1
            for reason in question.get("motivos_revisao", []) or []:
                issue_counts[str(reason)] += 1
            pages = set(question.get("imagens_paginas", []) or [])
            if question.get("pagina_imagem"):
                pages.add(question["pagina_imagem"])
            if not pages:
                no_page_image += 1
            for image in pages:
                image = str(image)
                all_image_paths.add(image)
                image_path = ROOT / image
                if not image_path.is_file():
                    missing_image_paths[image] += 1

    image_bytes = 0
    image_file_count = 0
    for relative in all_image_paths:
        path = ROOT / relative
        if path.is_file():
            image_file_count += 1
            image_bytes += path.stat().st_size

    index_bytes = sum((ROOT / name).stat().st_size for name in ("manifesto.json", "visuais.json") if (ROOT / name).is_file())
    referenced_total = lot_bytes + image_bytes + index_bytes
    root_sizes = Counter()
    root_counts = Counter()
    root_total_bytes = 0
    root_total_files = 0
    for path in ROOT.rglob("*"):
        if path.is_file():
            size = path.stat().st_size
            root_total_bytes += size
            root_total_files += 1
            rel = path.relative_to(ROOT)
            top = rel.parts[0] if rel.parts else "root"
            root_sizes[top] += size
            root_counts[top] += 1

    report = {
        "manifesto": {"questoes_declaradas": manifest.get("questoes_extraidas_unicas"), "lotes_declarados": len(lots)},
        "validacao": {
            "questoes_lidas": checked_questions,
            "ids_unicos": len(seen_ids) - duplicate_ids,
            "ids_ausentes_ou_duplicados": duplicate_ids,
            "enunciados_vazios": missing_enunciado,
            "sem_pagina_visual": no_page_image,
            "lotes_com_erro": len(batch_errors),
            "arquivos_visuais_referenciados": len(all_image_paths),
            "arquivos_visuais_existentes": image_file_count,
            "referencias_visuais_ausentes": dict(missing_image_paths),
            "tipos": dict(type_counts),
            "alertas_revisao": dict(issue_counts),
        },
        "armazenamento": {
            "lotes_bytes": lot_bytes,
            "imagens_referenciadas_bytes": image_bytes,
            "indices_bytes": index_bytes,
            "total_para_carga_completa_bytes": referenced_total,
            "total_para_carga_completa_gib": round(referenced_total / (1024 ** 3), 3),
            "limite_usuario_bytes": 10_000_000_000,
            "total_arquivos_no_corpus": root_total_files,
            "total_bytes_no_corpus": root_total_bytes,
            "por_diretorio": {name: {"arquivos": root_counts[name], "bytes": root_sizes[name]} for name in sorted(root_sizes)},
        },
        "erros_de_lote": batch_errors,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
