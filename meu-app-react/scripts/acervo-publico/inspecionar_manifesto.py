import csv
import json
import io
import sys
import zipfile
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlparse


def main():
    root = Path(sys.argv[1])
    manifest = root / "manifesto-extracao.csv"
    summary_path = root / "resumo-extracao.json"
    print(json.dumps({"root": str(root), "manifest_exists": manifest.is_file()}, ensure_ascii=False))
    if summary_path.is_file():
        print(json.dumps({"summary": json.loads(summary_path.read_text(encoding="utf-8-sig"))}, ensure_ascii=False))
    zip_manifest = root / "manifesto-ibfc-pacotes-zip.csv"
    if zip_manifest.is_file():
        with zip_manifest.open("r", encoding="utf-8-sig", newline="") as handle:
            zip_reader = csv.DictReader(handle)
            print(json.dumps({"zip_manifest_columns": zip_reader.fieldnames, "zip_manifest_sample": next(zip_reader, None)}, ensure_ascii=False))
    with manifest.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        print(json.dumps({"columns": reader.fieldnames}, ensure_ascii=False))
        rows = list(reader)
    print(json.dumps({"rows": len(rows)}, ensure_ascii=False))
    for key in reader.fieldnames or []:
        vals = Counter((row.get(key) or "").strip() for row in rows)
        if len(vals) <= 25:
            print(json.dumps({"field": key, "values": vals.most_common(30)}, ensure_ascii=False))
    for status in ("falha de leitura", "sem texto pesquisável", "extraído parcialmente"):
        selected = [row for row in rows if row.get("status") == status]
        print(json.dumps({"status_samples": status, "count": len(selected), "samples": selected[:12]}, ensure_ascii=False))
    failures = [row for row in rows if row.get("status") == "falha de leitura"]
    sources = Counter(row.get("fonte_oficial", "") for row in failures)
    print(json.dumps({"failed_source_counts": sources.most_common()}, ensure_ascii=False))
    for source, count in sources.items():
        filename = Path(unquote(urlparse(source).path)).name
        if not filename.lower().endswith(".zip"):
            continue
        matches = list((root / "originais" / "IBFC" / "_pacotes_zip").rglob(filename))
        entries = [Path(row["arquivo_pdf"]).name for row in failures if row.get("fonte_oficial") == source]
        detail = {"source_zip": source, "source_zip_matches": [str(path) for path in matches], "failed_entries": entries, "zip_crc_errors": []}
        if matches:
            try:
                with zipfile.ZipFile(matches[0]) as archive:
                    broken = archive.testzip()
                    detail["zip_crc_errors"] = [broken] if broken else []
                    detail["entry_checks"] = []
                    pdf_entries = []
                    try:
                        from pypdf import PdfReader
                    except ImportError:
                        PdfReader = None
                    for info in archive.infolist():
                        if not info.filename.lower().endswith(".pdf"):
                            continue
                        payload = archive.read(info.filename)
                        entry = {"filename": info.filename, "bytes": len(payload), "has_pdf_eof_marker": b"%%EOF" in payload[-2048:]}
                        if PdfReader is not None:
                            try:
                                entry["pages"] = len(PdfReader(io.BytesIO(payload), strict=False).pages)
                                entry["parse_error"] = ""
                            except Exception as parse_error:
                                entry["parse_error"] = str(parse_error)
                        pdf_entries.append(entry)
                    detail["pdf_entries_total"] = len(pdf_entries)
                    detail["pdf_entries_parse_failures"] = [entry for entry in pdf_entries if entry.get("parse_error")]
                    for entry in entries[:40]:
                        hits = [name for name in archive.namelist() if Path(name).name.casefold() == entry.casefold()]
                        check = {"filename": entry, "archive_entries": hits}
                        if hits:
                            info = archive.getinfo(hits[0])
                            payload = archive.read(hits[0])
                            check.update({"zip_entry_bytes": info.file_size, "starts_with_pdf": payload.lstrip().startswith(b"%PDF-"), "has_pdf_eof_marker": b"%%EOF" in payload[-2048:]})
                        detail["entry_checks"].append(check)
            except Exception as error:
                detail["zip_error"] = str(error)
        print(json.dumps(detail, ensure_ascii=False))
    print(json.dumps({"samples": rows[:3]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
