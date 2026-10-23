import csv
import json
import shutil
import sys
import urllib.request
from pathlib import Path

from pypdf import PdfReader


URL = "https://fs.ibfc.org.br/arquivos/f8c41be13765ced91f0d3d2f70bfa2e3.pdf"
EXPECTED_PAGES = 48


def main():
    root = Path(sys.argv[1])
    with (root / "manifesto-extracao.csv").open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    matches = [row for row in rows if row.get("fonte_oficial") == URL]
    if len(matches) != 1:
        raise SystemExit(f"Era esperado exatamente um registro do PDF oficial; encontrados: {len(matches)}")
    row = matches[0]
    original_path = Path(row["arquivo_pdf"])
    marker = "originais"
    parts = original_path.parts
    try:
        index = next(i for i, part in enumerate(parts) if part.casefold() == marker)
    except StopIteration:
        raise SystemExit("O caminho do PDF não contém a pasta originais.")
    target = root.joinpath(*parts[index:])
    if not target.parent.is_dir():
        raise SystemExit(f"Pasta de destino ausente: {target.parent}")

    temporary = target.with_suffix(target.suffix + ".download")
    request = urllib.request.Request(URL, headers={"User-Agent": "EstudoPessoal-Acervo/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=90) as response, temporary.open("wb") as output:
            if response.status != 200:
                raise RuntimeError(f"O portal retornou HTTP {response.status}")
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)

        with temporary.open("rb") as handle:
            signature = handle.read(1024)
        if b"%PDF-" not in signature:
            raise RuntimeError("O arquivo recebido não tem cabeçalho PDF válido.")
        reader = PdfReader(str(temporary), strict=False)
        pages = len(reader.pages)
        if pages != EXPECTED_PAGES:
            raise RuntimeError(f"O PDF validou com {pages} páginas; eram esperadas {EXPECTED_PAGES} segundo o portal oficial.")

        quarantine = root / "recuperados" / "IBFC" / "arquivo-local-corrompido"
        quarantine.mkdir(parents=True, exist_ok=True)
        backup = quarantine / (target.name + ".original-corrompido")
        if target.exists():
            shutil.move(str(target), str(backup))
        temporary.replace(target)
        print(json.dumps({"status": "recuperado_de_fonte_oficial", "url": URL, "arquivo": str(target), "paginas_validas": pages, "bytes": target.stat().st_size, "copia_corrompida_preservada": str(backup)}, ensure_ascii=False))
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


if __name__ == "__main__":
    main()
