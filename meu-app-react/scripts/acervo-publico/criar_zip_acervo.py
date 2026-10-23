from __future__ import annotations

import os
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
FINAL = OUT.parent / "acervo-bancas-1996-2026-completo.zip"
TEMP = FINAL.with_suffix(FINAL.suffix + ".partial")


def main() -> None:
    if FINAL.exists():
        raise SystemExit(f"O arquivo final já existe e não será sobrescrito: {FINAL}")
    if TEMP.exists():
        raise SystemExit(f"Arquivo temporário já existe; verifique antes de continuar: {TEMP}")
    files = sorted((p for p in OUT.rglob("*") if p.is_file()), key=lambda p: p.as_posix().casefold())
    if not files:
        raise SystemExit(f"Nenhum arquivo encontrado em {OUT}")
    with zipfile.ZipFile(TEMP, "w", allowZip64=True) as archive:
        for index, path in enumerate(files, start=1):
            relative = path.relative_to(OUT).as_posix()
            if path.suffix.lower() in {".txt", ".csv", ".json", ".md"}:
                archive.write(path, relative, compress_type=zipfile.ZIP_DEFLATED, compresslevel=1)
            else:
                archive.write(path, relative, compress_type=zipfile.ZIP_STORED)
            if index % 1000 == 0 or index == len(files):
                print(f"Arquivados {index:,}/{len(files):,} arquivos", flush=True)
    with zipfile.ZipFile(TEMP, "r") as archive:
        broken = archive.testzip()
        if broken:
            raise SystemExit(f"Verificação CRC falhou no arquivo: {broken}")
        if len(archive.infolist()) != len(files):
            raise SystemExit(f"Contagem divergente: disco={len(files)}; ZIP={len(archive.infolist())}")
    os.replace(TEMP, FINAL)
    print(f"ZIP pronto: {FINAL} ({FINAL.stat().st_size:,} bytes; {len(files):,} arquivos)")


if __name__ == "__main__":
    main()
