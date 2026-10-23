import csv
import io
import json
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

from pypdf import PdfReader


def parse_pdf(payload):
    try:
        return {"paginas": len(PdfReader(io.BytesIO(payload), strict=False).pages), "erro": ""}
    except Exception as error:
        return {"paginas": None, "erro": str(error)}


def chave_nome_pdf(nome):
    nome = Path(nome).name.casefold()
    if nome.startswith("._"):
        nome = nome[2:]
    nome = re.sub(r"^\d{4}_", "", nome)
    return re.sub(r"[^a-z0-9]", "", Path(nome).stem)


def main():
    root = Path(sys.argv[1])
    with (root / "manifesto-extracao.csv").open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    failures = [row for row in rows if row.get("status") == "falha de leitura"]
    groups = defaultdict(list)
    for row in failures:
        groups[row["fonte_oficial"]].append(row)

    with (root / "manifesto-ibfc-pacotes-zip.csv").open(encoding="utf-8-sig", newline="") as handle:
        zip_rows = list(csv.DictReader(handle))
    source_paths = {
        row.get("url_origem", ""): root / row.get("caminho_local", "")
        for row in zip_rows
    }

    report = []
    for url, bad_rows in groups.items():
        path = source_paths.get(url)
        group = {"url": url, "falhas_no_manifesto": len(bad_rows), "zip_local_encontrado": bool(path and path.is_file())}
        if path and path.is_file():
            group["zip_local_bytes"] = path.stat().st_size
            try:
                with zipfile.ZipFile(path) as archive:
                    corrupt_entry = archive.testzip()
                    entries = {info.filename.casefold(): info.filename for info in archive.infolist()}
                    valid_copies = 0
                    apple_double = 0
                    no_match = []
                    for row in bad_rows:
                        extracted_name = Path(row["arquivo_pdf"]).name
                        key = chave_nome_pdf(extracted_name)
                        candidates = [name for name in entries.values() if chave_nome_pdf(name) == key]
                        originals = [name for name in candidates if not Path(name).name.startswith("._") and "__MACOSX/" not in name]
                        if originals:
                            parsed = parse_pdf(archive.read(originals[0]))
                            if parsed["erro"]:
                                no_match.append({"arquivo": extracted_name, "copia_oficial": originals[0], "erro_copia": parsed["erro"]})
                            else:
                                valid_copies += 1
                            continue
                        stubs = [name for name in candidates if Path(name).name.startswith("._") or "__MACOSX/" in name]
                        if stubs:
                            payload = archive.read(stubs[0])
                            if len(payload) <= 1024 and payload.startswith(b"\x00\x05\x16\x07"):
                                apple_double += 1
                            else:
                                no_match.append({"arquivo": extracted_name, "stub": stubs[0], "bytes": len(payload)})
                        else:
                            no_match.append({"arquivo": extracted_name, "erro": "sem correspondente no ZIP de origem"})
                    group["crc_zip"] = "erro: " + str(corrupt_entry) if corrupt_entry else "ok"
                    group["linhas_com_pdf_oficial_valido"] = valid_copies
                    group["linhas_de_metadados_AppleDouble"] = apple_double
                    group["sem_correspondente_valido"] = no_match
                    if no_match:
                        group["nomes_pdf_dentro_do_zip"] = [name for name in entries.values() if name.casefold().endswith(".pdf")]
            except Exception as error:
                group["erro_zip"] = str(error)
        elif urlparse(url).path.lower().endswith(".pdf"):
            group["arquivo_direto"] = "PDF individual, sem pacote ZIP correspondente no manifesto."
        else:
            group["arquivo_direto"] = "Pacote ZIP de origem não mapeado localmente."
        report.append(group)
    print(json.dumps({"falhas_leitura": len(failures), "fontes_de_origem": len(groups), "zips_encontrados": sum(item["zip_local_encontrado"] for item in report), "grupos": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
