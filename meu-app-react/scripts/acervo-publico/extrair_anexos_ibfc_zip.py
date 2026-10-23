from __future__ import annotations

import concurrent.futures
import csv
import hashlib
import re
import shutil
import zipfile
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"
MANIFEST = OUT / "manifesto-ibfc.csv"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"
DOC_EXTENSIONS = {".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt", ".png", ".jpg", ".jpeg", ".tif", ".tiff"}
MAX_MEMBER = 100 * 1024 * 1024
MAX_TOTAL = 1024 * 1024 * 1024


def slug(value: str) -> str:
    value = re.sub(r"[^\w.-]+", "_", value, flags=re.UNICODE).strip("_.-")
    return value[:110] or "arquivo"


def safe_member_path(base: Path, member: str, sequence: int) -> Path | None:
    filename = PurePosixPath(member.replace("\\", "/")).name
    if not filename:
        return None
    suffix = Path(filename).suffix[:12]
    stem = slug(Path(filename).stem)[:70]
    target = base / f"{sequence:04d}_{stem}{suffix}"
    try:
        target.resolve().relative_to(base.resolve())
    except ValueError:
        return None
    return target


def download(row: dict) -> dict:
    url = row["url_origem"]
    package_id = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
    name = unquote(urlparse(url).path.rstrip("/").split("/")[-1]) or "anexo.zip"
    if not name.lower().endswith(".zip"):
        name += ".zip"
    zip_path = OUT / "originais" / "IBFC" / "_pacotes_zip" / f"{package_id}.zip"
    extract_dir = OUT / "originais" / "IBFC" / "_extraidos_zip" / package_id
    try:
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        extract_dir.mkdir(parents=True, exist_ok=True)
        if zip_path.exists() and zipfile.is_zipfile(zip_path):
            data = None
        else:
            req = Request(url, headers={"User-Agent": UA, "Accept": "application/zip,application/octet-stream,*/*"})
            with urlopen(req, timeout=45) as response:
                data = response.read()
            if not data.startswith(b"PK"):
                raise ValueError(f"resposta não é ZIP ({len(data)} bytes)")
            with zip_path.open("wb") as f:
                f.write(data)
        extracted = []
        total = 0
        with zipfile.ZipFile(zip_path) as archive:
            if len(archive.infolist()) > 1000:
                raise ValueError("pacote contém mais de 1000 itens; ignorado por segurança")
            for sequence, info in enumerate(archive.infolist(), start=1):
                if info.is_dir() or info.file_size > MAX_MEMBER:
                    continue
                if total + info.file_size > MAX_TOTAL:
                    break
                member_path = PurePosixPath(info.filename.replace("\\", "/"))
                if member_path.suffix.lower() not in DOC_EXTENSIONS:
                    continue
                destination = safe_member_path(extract_dir, info.filename, sequence)
                if destination is None:
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                if destination.exists() and destination.stat().st_size == info.file_size:
                    extracted.append(destination)
                    total += info.file_size
                    continue
                with archive.open(info) as source, destination.open("wb") as target:
                    shutil.copyfileobj(source, target, length=1024 * 1024)
                total += destination.stat().st_size
                extracted.append(destination)
        return {
            "banca": "IBFC", "concurso": row.get("concurso", ""), "tipo": row.get("tipo", ""),
            "nome_arquivo": name, "url_origem": url, "pagina_origem": row.get("pagina_origem", ""),
            "caminho_local": str(zip_path.relative_to(OUT)), "bytes": zip_path.stat().st_size,
            "status": "baixado e extraído", "itens_extraidos": len(extracted), "erro": "",
            "arquivos_extraidos": ";".join(str(p.relative_to(OUT)) for p in extracted),
        }
    except Exception as exc:
        return {
            "banca": "IBFC", "concurso": row.get("concurso", ""), "tipo": row.get("tipo", ""),
            "nome_arquivo": name, "url_origem": url, "pagina_origem": row.get("pagina_origem", ""),
            "caminho_local": str(zip_path.relative_to(OUT)) if zip_path.exists() else "",
            "bytes": zip_path.stat().st_size if zip_path.exists() else 0,
            "status": "falha", "itens_extraidos": 0, "erro": str(exc)[:300], "arquivos_extraidos": "",
        }


def main() -> None:
    with MANIFEST.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
        fields = list(rows[0]) if rows else []
    selected = [r for r in rows if r.get("status") == "falha" and (
        urlparse(r.get("url_origem", "")).path.lower().endswith(".zip")
        or "application/zip" in r.get("erro", "").lower()
        or "application/x-zip" in r.get("erro", "").lower()
    )]
    by_url = {r["url_origem"]: r for r in selected}
    print(f"Pacotes ZIP identificados: {len(by_url)}", flush=True)
    results: dict[str, dict] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(download, row): row["url_origem"] for row in by_url.values()}
        for n, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            result = future.result()
            results[futures[future]] = result
            if n % 20 == 0 or n == len(futures):
                ok = sum(r["status"] == "baixado e extraído" for r in results.values())
                print(f"Pacotes processados {n}/{len(futures)}; concluídos {ok}", flush=True)

    for row in rows:
        result = results.get(row.get("url_origem", ""))
        if result and result["status"] == "baixado e extraído":
            row["nome_arquivo"] = result["nome_arquivo"]
            row["caminho_local"] = result["caminho_local"]
            row["bytes"] = result["bytes"]
            row["status"] = "baixado e extraído"
            row["erro"] = ""
    with MANIFEST.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    extra_manifest = OUT / "manifesto-ibfc-pacotes-zip.csv"
    out_fields = ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "itens_extraidos", "erro", "arquivos_extraidos"]
    with extra_manifest.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        writer.writerows(sorted(results.values(), key=lambda r: (r["concurso"], r["nome_arquivo"])))
    print(f"ZIPs processados: {len(results)}; extraídos: {sum(r['status']=='baixado e extraído' for r in results.values())}; itens extraídos: {sum(r['itens_extraidos'] for r in results.values())}; falhas: {sum(r['status']=='falha' for r in results.values())}", flush=True)


if __name__ == "__main__":
    main()
