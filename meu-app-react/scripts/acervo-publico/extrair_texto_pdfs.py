"""Extract the embedded text from downloaded official exam PDFs."""

from __future__ import annotations

import argparse
import csv
import json
import logging
import os
import re
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from pypdf import PdfReader
try:
    import pypdfium2 as pdfium
except ImportError:
    pdfium = None

logging.getLogger("pypdf").setLevel(logging.ERROR)


def carregar_origens(pasta: Path) -> dict[str, str]:
    origens: dict[str, str] = {}
    for manifesto in pasta.rglob("manifesto*.csv"):
        try:
            with manifesto.open(encoding="utf-8-sig", newline="") as arquivo:
                for linha in csv.DictReader(arquivo):
                    local = linha.get("caminho_local") or linha.get("arquivo_local")
                    origem = linha.get("url_origem") or linha.get("origem")
                    if local and origem:
                        caminho = Path(local)
                        if not caminho.is_absolute():
                            caminho = pasta / caminho
                        origens[os.path.normcase(os.path.normpath(str(caminho)))] = origem
        except (OSError, UnicodeError, csv.Error):
            continue
    return origens


def eh_appledouble(arquivo_pdf: Path) -> bool:
    try:
        with arquivo_pdf.open("rb") as arquivo:
            # AppleDouble resource forks often carry a .pdf suffix after being
            # expanded from a ZIP, but begin with this non-PDF magic value.
            return arquivo.read(4) == b"\x00\x05\x16\x07"
    except OSError:
        return False


def extrair(arquivo_pdf: Path, pasta_originais: Path, pasta_textos: Path, origem: str) -> dict:
    relativo = arquivo_pdf.relative_to(pasta_originais)
    destino = pasta_textos / relativo.with_suffix(".txt")
    destino.parent.mkdir(parents=True, exist_ok=True)
    if destino.exists():
        try:
            anterior = destino.read_text(encoding="utf-8")
            paginas_antigas = int(re.search(r"(?m)^Páginas: (\d+)$", anterior).group(1))
            marcadores = len(re.findall(r"(?m)^===== PÁGINA \d+ =====$", anterior))
            status_antigo = re.search(r"(?m)^Status da extração: (.+)$", anterior)
            if (
                anterior.startswith("Arquivo:")
                and paginas_antigas == marcadores
                and (not status_antigo or status_antigo.group(1) != "falha de leitura")
            ):
                return {
                    "arquivo_pdf": str(arquivo_pdf), "arquivo_texto": str(destino),
                    "paginas": paginas_antigas, "caracteres": len(anterior),
                    "status": status_antigo.group(1) if status_antigo else "extraído",
                    "erro": "", "fonte_oficial": origem,
                }
        except (OSError, UnicodeError, AttributeError, ValueError):
            pass
    total_caracteres = 0
    paginas = 0
    erro = ""
    partes: list[str] = []

    if pdfium is not None:
        leitor_pdfium = None
        try:
            leitor_pdfium = pdfium.PdfDocument(str(arquivo_pdf))
            paginas = len(leitor_pdfium)
            for numero in range(paginas):
                pagina = None
                texto_pagina = None
                try:
                    pagina = leitor_pdfium[numero]
                    texto_pagina = pagina.get_textpage()
                    texto = texto_pagina.get_text_range() or ""
                except Exception as exc:  # Keep good pages when one page is malformed.
                    texto = ""
                    erro = erro or f"Página {numero + 1}: {exc}"
                finally:
                    if texto_pagina is not None:
                        texto_pagina.close()
                    if pagina is not None:
                        pagina.close()
                texto = texto.strip()
                total_caracteres += len(texto)
                partes.append(f"\n\n===== PÁGINA {numero + 1} =====\n\n{texto}")
        except Exception as exc:
            erro_pdfium = str(exc)
            if leitor_pdfium is not None:
                leitor_pdfium.close()
            paginas = 0
            total_caracteres = 0
            partes = []
            erro = ""
            try:
                leitor = PdfReader(str(arquivo_pdf), strict=False)
                paginas = len(leitor.pages)
                for numero, pagina in enumerate(leitor.pages, start=1):
                    try:
                        texto = pagina.extract_text() or ""
                    except Exception as page_exc:
                        texto = ""
                        erro = erro or f"Página {numero}: {page_exc}"
                    texto = texto.strip()
                    total_caracteres += len(texto)
                    partes.append(f"\n\n===== PÁGINA {numero} =====\n\n{texto}")
            except Exception as fallback_exc:
                erro = f"PDFium: {erro_pdfium}; pypdf: {fallback_exc}"
    else:
        try:
            leitor = PdfReader(str(arquivo_pdf), strict=False)
            paginas = len(leitor.pages)
            for numero, pagina in enumerate(leitor.pages, start=1):
                try:
                    texto = pagina.extract_text() or ""
                except Exception as exc:  # Keep good pages when one page is malformed.
                    texto = ""
                    erro = erro or f"Página {numero}: {exc}"
                texto = texto.strip()
                total_caracteres += len(texto)
                partes.append(f"\n\n===== PÁGINA {numero} =====\n\n{texto}")
        except Exception as exc:
            erro = str(exc)
    if pdfium is not None and leitor_pdfium is not None:
        leitor_pdfium.close()

    estado = "extraído" if total_caracteres >= 100 else "sem texto pesquisável"
    if erro and total_caracteres:
        estado = "extraído parcialmente"
    elif erro:
        estado = "falha de leitura"

    cabecalho = [
        f"Arquivo: {relativo.as_posix()}",
        f"Páginas: {paginas}",
        f"Status da extração: {estado}",
    ]
    if origem:
        cabecalho.append(f"Fonte oficial: {origem}")
    if erro:
        cabecalho.append(f"Observação: {erro}")
    destino.write_text("\n".join(cabecalho) + "\n" + "".join(partes), encoding="utf-8")

    return {
        "arquivo_pdf": str(arquivo_pdf),
        "arquivo_texto": str(destino),
        "paginas": paginas,
        "caracteres": total_caracteres,
        "status": estado,
        "erro": erro,
        "fonte_oficial": origem,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--pasta",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "output" / "acervo-bancas-1996-2026",
        help="Pasta que contém originais/ e onde será criada textos/.",
    )
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    raiz = args.pasta.resolve()
    pasta_originais = raiz / "originais"
    pasta_textos = raiz / "textos"
    pdfs_encontrados = sorted(pasta_originais.rglob("*.pdf")) if pasta_originais.exists() else []
    artefatos_appledouble = [arquivo for arquivo in pdfs_encontrados if eh_appledouble(arquivo)]
    apple_double_paths = set(artefatos_appledouble)
    arquivos = [arquivo for arquivo in pdfs_encontrados if arquivo not in apple_double_paths]
    if not arquivos:
        raise SystemExit(f"Nenhum PDF encontrado em {pasta_originais}")

    for arquivo_pdf in artefatos_appledouble:
        relativo = arquivo_pdf.relative_to(pasta_originais)
        texto_orfao = (raiz / "textos" / relativo).with_suffix(".txt")
        texto_orfao.unlink(missing_ok=True)
    if artefatos_appledouble:
        print(f"Ignorando {len(artefatos_appledouble)} metadados AppleDouble que têm extensão .pdf, mas não são PDFs.")

    origens = carregar_origens(raiz)
    resultados = []
    with ProcessPoolExecutor(max_workers=max(1, args.workers)) as executor:
        tarefas = {
            executor.submit(
                extrair,
                pdf,
                pasta_originais,
                pasta_textos,
                origens.get(os.path.normcase(os.path.normpath(str(pdf))), ""),
            ): pdf
            for pdf in arquivos
        }
        for numero, tarefa in enumerate(as_completed(tarefas), start=1):
            try:
                resultados.append(tarefa.result())
            except Exception as exc:
                resultados.append(
                    {
                        "arquivo_pdf": str(tarefas[tarefa]),
                        "arquivo_texto": "",
                        "paginas": 0,
                        "caracteres": 0,
                        "status": "falha de leitura",
                        "erro": str(exc),
                        "fonte_oficial": "",
                    }
                )
            if numero % 50 == 0 or numero == len(arquivos):
                print(f"Extraídos {numero}/{len(arquivos)} PDFs")

    resultados.sort(key=lambda item: item["arquivo_pdf"].casefold())
    csv_path = raiz / "manifesto-extracao.csv"
    with csv_path.open("w", encoding="utf-8-sig", newline="") as arquivo:
        campos = ["arquivo_pdf", "arquivo_texto", "paginas", "caracteres", "status", "erro", "fonte_oficial"]
        escritor = csv.DictWriter(arquivo, fieldnames=campos)
        escritor.writeheader()
        escritor.writerows(resultados)

    resumo = {
        "pdfs": len(resultados),
        "artefatos_appledouble_ignorados": len(artefatos_appledouble),
        "com_texto": sum(item["status"] == "extraído" for item in resultados),
        "parciais": sum(item["status"] == "extraído parcialmente" for item in resultados),
        "sem_texto_pesquisavel": sum(item["status"] == "sem texto pesquisável" for item in resultados),
        "falhas": sum(item["status"] == "falha de leitura" for item in resultados),
        "observacao": "Extração de texto incorporado ao PDF. PDFs somente imagem não recebem OCR nesta etapa.",
    }
    (raiz / "resumo-extracao.json").write_text(
        json.dumps(resumo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(resumo, ensure_ascii=False))


if __name__ == "__main__":
    main()
