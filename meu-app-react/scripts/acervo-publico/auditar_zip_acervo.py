from __future__ import annotations

import argparse
import json
import shutil
import sys
import zipfile
from pathlib import Path, PurePosixPath


def validar_arquivos(infos: list[zipfile.ZipInfo]) -> None:
    nomes: set[str] = set()
    for info in infos:
        nome = info.filename
        caminho = PurePosixPath(nome)
        if caminho.is_absolute() or ".." in caminho.parts or "\\" in nome or ":" in nome:
            raise ValueError(f"Caminho inseguro no ZIP: {nome}")
        if nome in nomes:
            raise ValueError(f"Nome duplicado no ZIP: {nome}")
        nomes.add(nome)


def extrair_e_conferir(arquivo_zip: Path, destino: Path) -> dict:
    arquivo_zip = arquivo_zip.resolve(strict=True)
    destino = destino.resolve()
    if destino.exists():
        raise FileExistsError(f"A pasta de destino já existe; nada foi sobrescrito: {destino}")

    with zipfile.ZipFile(arquivo_zip) as pacote:
        infos = pacote.infolist()
        validar_arquivos(infos)
        arquivos = [info for info in infos if not info.is_dir()]
        bytes_previstos = sum(info.file_size for info in arquivos)
        espaco = shutil.disk_usage(destino.parent).free
        if espaco < bytes_previstos + 2 * 1024**3:
            raise OSError(
                f"Espaço insuficiente: necessário pelo menos {bytes_previstos + 2 * 1024**3} bytes; "
                f"disponível {espaco} bytes."
            )

        pdfs = sum(info.filename.lower().endswith(".pdf") for info in arquivos)
        textos = sum(info.filename.lower().endswith(".txt") for info in arquivos)
        tamanho_zip = arquivo_zip.stat().st_size
        print(json.dumps({
            "fase": "inventario",
            "zip": str(arquivo_zip),
            "bytes_zip": tamanho_zip,
            "arquivos": len(arquivos),
            "bytes_descompactados_previstos": bytes_previstos,
            "pdfs": pdfs,
            "textos_txt": textos,
            "espaco_livre_destino": espaco,
            "destino": str(destino),
        }, ensure_ascii=False), flush=True)

        destino.mkdir(parents=False, exist_ok=False)
        destino_resolvido = destino.resolve(strict=True)
        bytes_extraidos = 0
        for indice, info in enumerate(arquivos, start=1):
            caminho_relativo = Path(*PurePosixPath(info.filename).parts)
            saida = destino / caminho_relativo
            if not saida.resolve().is_relative_to(destino_resolvido):
                raise ValueError(f"O caminho saiu da pasta de destino: {info.filename}")
            saida.parent.mkdir(parents=True, exist_ok=True)
            with pacote.open(info, "r") as origem, saida.open("wb") as destino_arquivo:
                shutil.copyfileobj(origem, destino_arquivo, length=1024 * 1024)
            bytes_extraidos += info.file_size
            if indice % 500 == 0 or indice == len(arquivos):
                print(json.dumps({
                    "fase": "extraindo_e_verificando_crc",
                    "arquivos_concluidos": indice,
                    "total_arquivos": len(arquivos),
                    "bytes_concluidos": bytes_extraidos,
                }), flush=True)

    if bytes_extraidos != bytes_previstos:
        raise IOError(f"Tamanho extraído diverge do índice ZIP: {bytes_extraidos} != {bytes_previstos}")

    contagem_final = sum(1 for caminho in destino.rglob("*") if caminho.is_file())
    resumo = {
        "fase": "concluido",
        "arquivos_no_zip": len(arquivos),
        "arquivos_extraidos": contagem_final,
        "bytes_previstos": bytes_previstos,
        "bytes_extraidos": bytes_extraidos,
        "pdfs": pdfs,
        "textos_txt": textos,
        "crc": "todos os arquivos foram lidos até o fim durante a extração; nenhum CRC inválido",
        "pasta": str(destino),
    }
    if contagem_final != len(arquivos):
        raise IOError(f"Contagem final diverge do ZIP: {contagem_final} != {len(arquivos)}")
    return resumo


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrai o pacote de provas com validação de caminhos e CRC.")
    parser.add_argument("arquivo_zip", type=Path)
    parser.add_argument("destino", type=Path)
    args = parser.parse_args()
    try:
        resumo = extrair_e_conferir(args.arquivo_zip, args.destino)
    except Exception as erro:
        print(json.dumps({"fase": "erro", "tipo": type(erro).__name__, "mensagem": str(erro)}, ensure_ascii=False), file=sys.stderr, flush=True)
        return 1
    print(json.dumps(resumo, ensure_ascii=False), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
