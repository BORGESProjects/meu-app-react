from __future__ import annotations

import csv
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
BOARDS = ("FGV", "IBFC", "UFRJ", "FUNATEC")

for board in BOARDS:
    folder = OUT / "originais" / board
    changed = 0
    if folder.exists():
        for path in folder.rglob("*"):
            if not path.is_file() or path.suffix.lower() == ".pdf":
                continue
            try:
                with path.open("rb") as f:
                    magic = f.read(5)
            except OSError:
                continue
            if magic != b"%PDF-":
                continue
            target = path.with_name(path.name + ".pdf")
            if target.exists():
                continue
            source_name = os.path.abspath(str(path))
            target_name = os.path.abspath(str(target))
            if os.name == "nt":
                source_name = "\\\\?\\" + source_name
                target_name = "\\\\?\\" + target_name
                os.rename(source_name, target_name)
            else:
                os.rename(source_name, target_name)
            changed += 1
    manifest = OUT / f"manifesto-{board.lower()}.csv"
    if manifest.exists():
        with manifest.open("r", newline="", encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
            fields = list(rows[0]) if rows else []
        for row in rows:
            if row.get("caminho_local") and not row["caminho_local"].lower().endswith(".pdf"):
                row["caminho_local"] += ".pdf"
            if row.get("nome_arquivo") and not row["nome_arquivo"].lower().endswith(".pdf"):
                row["nome_arquivo"] += ".pdf"
        with manifest.open("w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
    print(f"{board}: extensões .pdf corrigidas em {changed} arquivos")
