"""Renderizar páginas de provas usadas pelo acervo e fazer OCR português de páginas incompletas."""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "output" / "acervo-bancas-1996-2026"
PUBLIC = ROOT / "public" / "acervo-extraido"
TESSDATA = ROOT / "public" / "leitura-editais"
DEFAULT_TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")


def imagem_tem_cor(imagem: Image.Image) -> bool:
    amostra = imagem.convert("RGB").resize((64, 64))
    dados = amostra.tobytes()
    total = len(dados) // 3
    coloridos = sum(1 for i in range(0, len(dados), 3) if max(dados[i:i + 3]) - min(dados[i:i + 3]) > 24 and max(dados[i:i + 3]) > 70)
    amostra.close()
    return coloridos / max(1, total) > 0.006


def renderizar_pagina(documento, numero: int, escala: float) -> Image.Image:
    pagina = documento[numero - 1]
    bitmap = pagina.render(scale=escala)
    imagem = bitmap.to_pil().convert("RGB")
    bitmap.close()
    pagina.close()
    return imagem


def imagem_webp_valida(arquivo: Path) -> bool:
    try:
        if arquivo.stat().st_size < 256:
            return False
        with arquivo.open("rb") as handle:
            cabecalho = handle.read(12)
        return len(cabecalho) == 12 and cabecalho[:4] == b"RIFF" and cabecalho[8:12] == b"WEBP"
    except OSError:
        return False


def reconhecer_pagina(imagem: Image.Image, doc_id: str, numero: int, tesseract: Path, temp_dir: Path) -> str:
    origem = temp_dir / f"{doc_id}-{numero:04d}.png"
    destino = temp_dir / f"{doc_id}-{numero:04d}-ocr"
    imagem.save(origem, format="PNG", optimize=False, compress_level=1)
    comando = [
        str(tesseract), str(origem), str(destino), "-l", "por", "--psm", "3",
        "--tessdata-dir", str(TESSDATA),
    ]
    ambiente = os.environ.copy()
    ambiente["TESSDATA_PREFIX"] = str(TESSDATA)
    # Cada tarefa já roda em um processo separado. Evita que o OpenMP do
    # Tesseract crie mais threads por processo e sature o conjunto de CPUs.
    ambiente["OMP_THREAD_LIMIT"] = "1"
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    processo = subprocess.run(comando, capture_output=True, timeout=120, env=ambiente, creationflags=flags)
    arquivo_texto = destino.with_suffix(".txt")
    try:
        texto = arquivo_texto.read_text(encoding="utf-8", errors="replace").strip()
    finally:
        origem.unlink(missing_ok=True)
        arquivo_texto.unlink(missing_ok=True)
    if processo.returncode != 0:
        detalhe = processo.stderr.decode("utf-8", errors="replace")[-400:]
        raise RuntimeError(detalhe or f"Tesseract retornou {processo.returncode}")
    return texto


def processar_documento(tarefa: dict, tesseract: Path, temp_dir: Path) -> dict:
    doc_id = str(tarefa["documento_id"])
    relativo = Path(str(tarefa.get("caminho_local", "")))
    if relativo.is_absolute() or ".." in relativo.parts or not relativo.parts or relativo.parts[0].lower() != "originais":
        return {"documento_id": doc_id, "erro": "caminho de origem inválido"}
    arquivo_pdf = (BASE / relativo).resolve()
    origem_permitida = (BASE / "originais").resolve()
    if not arquivo_pdf.is_relative_to(origem_permitida) or not arquivo_pdf.is_file():
        return {"documento_id": doc_id, "erro": "PDF de origem não encontrado"}

    paginas_imagem = {int(p) for p in tarefa.get("paginas", []) if int(p) > 0}
    paginas_ocr = {int(p) for p in tarefa.get("paginas_ocr", []) if int(p) > 0}
    paginas_necessarias = sorted(paginas_imagem | paginas_ocr)
    if not paginas_necessarias:
        return {"documento_id": doc_id, "imagens": 0, "ocr": 0, "bytes": 0}

    arquivo_ocr = BASE / "textos-ocr" / f"{doc_id}.json"
    try:
        dados_ocr = json.loads(arquivo_ocr.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        dados_ocr = {}
    imagens_pendentes = {
        numero for numero in paginas_imagem
        if not imagem_webp_valida(PUBLIC / "paginas" / f"{doc_id}-{numero:04d}.webp")
    }
    ocr_pendente = {numero for numero in paginas_ocr if str(numero) not in dados_ocr}
    paginas_necessarias = sorted(imagens_pendentes | ocr_pendente)
    if not paginas_necessarias:
        return {"documento_id": doc_id, "imagens": 0, "ocr": 0, "bytes": 0}
    novos_ocr = 0
    imagens = 0
    bytes_imagem = 0
    falhas_paginas = []
    documento = None
    try:
        documento = pdfium.PdfDocument(str(arquivo_pdf))
        total = len(documento)
        for numero in paginas_necessarias:
            if numero > total:
                falhas_paginas.append(f"página {numero} excede o PDF ({total})")
                continue
            destino_imagem = PUBLIC / "paginas" / f"{doc_id}-{numero:04d}.webp"
            try:
                if numero in paginas_imagem and not imagem_webp_valida(destino_imagem):
                    pagina = documento[numero - 1]
                    largura, altura = pagina.get_size()
                    escala = min(1.47, 900 / max(1, largura), math.sqrt(1_100_000 / max(1, largura * altura)))
                    bitmap = pagina.render(scale=escala)
                    imagem = bitmap.to_pil().convert("RGB")
                    bitmap.close()
                    pagina.close()
                    if not imagem_tem_cor(imagem):
                        imagem = imagem.convert("L")
                    destino_imagem.parent.mkdir(parents=True, exist_ok=True)
                    temporario_imagem = destino_imagem.with_suffix(".webp.tmp")
                    imagem.save(temporario_imagem, format="WEBP", quality=48, method=3)
                    temporario_imagem.replace(destino_imagem)
                    imagens += 1
                    bytes_imagem += destino_imagem.stat().st_size
                    imagem.close()
                if numero in paginas_ocr and str(numero) not in dados_ocr:
                    # Reutiliza a página do leitor: a resolução já é suficiente
                    # para OCR e evita renderizar a mesma página duas vezes.
                    if destino_imagem.is_file() and imagem_webp_valida(destino_imagem):
                        with Image.open(destino_imagem) as imagem_existente:
                            imagem_ocr = imagem_existente.convert("RGB")
                    else:
                        imagem_ocr = renderizar_pagina(documento, numero, 1.47).convert("RGB")
                    texto = reconhecer_pagina(imagem_ocr, doc_id, numero, tesseract, temp_dir)
                    imagem_ocr.close()
                    dados_ocr[str(numero)] = texto
                    novos_ocr += 1
            except Exception as erro:
                falhas_paginas.append(f"página {numero}: {erro}")
        if novos_ocr:
            arquivo_ocr.parent.mkdir(parents=True, exist_ok=True)
            temporario = arquivo_ocr.with_suffix(".json.tmp")
            temporario.write_text(json.dumps(dados_ocr, ensure_ascii=False), encoding="utf-8")
            temporario.replace(arquivo_ocr)
    except Exception as erro:
        return {"documento_id": doc_id, "erro": str(erro), "imagens": imagens, "ocr": novos_ocr, "bytes": bytes_imagem}
    finally:
        if documento is not None:
            documento.close()

    return {
        "documento_id": doc_id,
        "imagens": imagens,
        "ocr": novos_ocr,
        "bytes": bytes_imagem,
        "falhas_paginas": falhas_paginas,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit-docs", type=int, default=0, help="Limite opcional para uma execução de conferência.")
    parser.add_argument("--tesseract", type=Path, default=Path(os.environ.get("TESSERACT_EXE", DEFAULT_TESSERACT)))
    args = parser.parse_args()

    tarefas_path = BASE / "tarefas-recursos-questoes.json"
    if not tarefas_path.is_file():
        raise SystemExit("Tarefas visuais ausentes. Execute primeiro npm run acervo:extrair.")
    if not args.tesseract.is_file():
        raise SystemExit(f"Tesseract não encontrado em {args.tesseract}. Defina TESSERACT_EXE ou informe --tesseract.")
    if not (TESSDATA / "por.traineddata").is_file():
        raise SystemExit(f"Modelo português do OCR ausente em {TESSDATA / 'por.traineddata'}.")

    tarefas = json.loads(tarefas_path.read_text(encoding="utf-8"))
    documentos = tarefas.get("documentos", [])
    if args.limit_docs > 0:
        documentos = documentos[:args.limit_docs]
    temp_dir = ROOT / "tmp" / "acervo-ocr"
    temp_dir.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    resultados = []
    total = len(documentos)
    with ProcessPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futuros = {executor.submit(processar_documento, tarefa, args.tesseract, temp_dir): tarefa for tarefa in documentos}
        for numero, futuro in enumerate(as_completed(futuros), start=1):
            try:
                resultado = futuro.result()
            except Exception as erro:  # A damaged source must not interrupt the remaining editions.
                resultado = {"documento_id": futuros[futuro].get("documento_id"), "erro": str(erro)}
            resultados.append(resultado)
            if numero % 25 == 0 or numero == total:
                print(f"Documentos processados: {numero}/{total}", flush=True)

    falhas = [{"documento_id": r.get("documento_id"), "erro": r.get("erro")} for r in resultados if r.get("erro")]
    falhas.extend({"documento_id": r.get("documento_id"), "erro": erro} for r in resultados for erro in r.get("falhas_paginas", []))
    imagens_disponiveis = 0
    bytes_disponiveis = 0
    ocr_disponiveis = 0
    ocr_texto_disponivel = 0
    for tarefa in documentos:
        doc_id = str(tarefa["documento_id"])
        for pagina in tarefa.get("paginas", []):
            arquivo = PUBLIC / "paginas" / f"{doc_id}-{int(pagina):04d}.webp"
            if arquivo.is_file():
                imagens_disponiveis += 1
                bytes_disponiveis += arquivo.stat().st_size
        try:
            dados = json.loads((BASE / "textos-ocr" / f"{doc_id}.json").read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            dados = {}
        for texto in dados.values():
            if str(texto).strip():
                ocr_disponiveis += 1
                if len(str(texto).strip()) >= 30:
                    ocr_texto_disponivel += 1
    manifesto = {
        "gerado_em": __import__("datetime").datetime.now().astimezone().isoformat(),
        "paginas_visuais_planejadas": sum(len(t.get("paginas", [])) for t in documentos),
        "paginas_ocr_planejadas": sum(len(t.get("paginas_ocr", [])) for t in documentos),
        "paginas_visuais_disponiveis": imagens_disponiveis,
        "bytes_visuais_disponiveis": bytes_disponiveis,
        "paginas_ocr_disponiveis": ocr_disponiveis,
        "paginas_ocr_com_transcricao_util": ocr_texto_disponivel,
        "imagens_criadas_nesta_execucao": sum(r.get("imagens", 0) for r in resultados),
        "bytes_imagens_criadas_nesta_execucao": sum(r.get("bytes", 0) for r in resultados),
        "paginas_ocr_concluidas_nesta_execucao": sum(r.get("ocr", 0) for r in resultados),
        "documentos_processados": total,
        "falhas": falhas,
    }
    (PUBLIC / "visuais.json").write_text(json.dumps(manifesto, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifesto, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
