from __future__ import annotations

from pathlib import Path
import json
import re
import sys
import unicodedata

from pypdf import PdfReader


VISUAL_REFERENCE = re.compile(r"(?i)\b(charge|tirinha|quadrinho|cartum|imagem acima|figura acima)\b")


def normalized(value: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", ascii_text).strip()


def main() -> None:
    folder = Path(sys.argv[1])
    seen: set[str] = set()
    total = 0
    duplicates = 0
    for json_path in sorted(folder.glob("Aula*.json")):
        data = json.loads(json_path.read_text(encoding="utf-8"))
        source = Path(data["source_pdf"])
        reader = PdfReader(str(source))
        kept = []
        for question in data["questions"]:
            fingerprint = normalized(question["enunciado"] + " " + " ".join(question["opcoes"]))
            if fingerprint in seen:
                duplicates += 1
                continue
            seen.add(fingerprint)
            kept.append(question)

        first_page = min(q["pagina"] for q in kept)
        last_page = max(q["pagina"] for q in kept)
        for index, question in enumerate(kept, 1):
            original_number = question["numero_original"]
            original_page = question["pagina"]
            question["numero_fonte"] = original_number
            question["numero_original"] = index
            extra_images = len(reader.pages[original_page - 1].images) > 2
            question["tem_imagem"] = bool(extra_images or VISUAL_REFERENCE.search(question["enunciado"]))

        data["questions"] = kept
        json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        total += len(kept)
        print(f"{json_path.name}: {len(kept)} questões, páginas {first_page}-{last_page}")
    print(f"TOTAL={total} DUPLICATAS_REMOVIDAS={duplicates}")


if __name__ == "__main__":
    main()
