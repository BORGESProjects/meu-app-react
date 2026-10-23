#!/usr/bin/env python3
"""Gera o catálogo leve do site a partir do pacote local de provas públicas.

Os PDFs e arquivos de texto não são copiados para `public/`: o site conserva
metadados e links para as páginas/arquivos de origem.
"""

import argparse
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[2]
FONTE_PADRAO = RAIZ / "output" / "acervo-bancas-1996-2026"
DESTINO_PADRAO = RAIZ / "public" / "acervo-provas"


def slug(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-") or "banca"


def chave_caminho(texto):
    normalizado = str(texto or "").replace("\\", "/").lower()
    marcador = "/originais/"
    if marcador in normalizado:
        return normalizado.split(marcador, 1)[1]
    if normalizado.startswith("originais/"):
        return normalizado[len("originais/"):]
    return normalizado


def url_web(texto):
    texto = str(texto or "").strip()
    return texto if texto.startswith(("https://", "http://")) else ""


def ler_csv(caminho):
    with caminho.open("r", encoding="utf-8-sig", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


def gerar(fonte, destino):
    manifesto_path = fonte / "manifesto-geral.csv"
    extracao_path = fonte / "manifesto-extracao.csv"
    resumo_path = fonte / "resumo-acervo.json"
    cobertura_path = fonte / "cobertura-portais.json"
    resumo_texto_path = fonte / "resumo-extracao.json"
    obrigatorios = [manifesto_path, extracao_path, resumo_path, cobertura_path, resumo_texto_path]
    ausentes = [str(caminho) for caminho in obrigatorios if not caminho.is_file()]
    if ausentes:
        raise SystemExit("Arquivos-fonte ausentes: " + ", ".join(ausentes))

    resumo_origem = json.loads(resumo_path.read_text(encoding="utf-8"))
    resumo_texto = json.loads(resumo_texto_path.read_text(encoding="utf-8"))
    cobertura = json.loads(cobertura_path.read_text(encoding="utf-8"))
    nomes_canonicos = {nome.casefold(): nome for nome in resumo_origem.get("por_banca", {})}

    textos = {}
    for linha in ler_csv(extracao_path):
        chave = chave_caminho(linha.get("arquivo_pdf"))
        if chave:
            textos[chave] = {
                "status": linha.get("status", ""),
                "paginas": int(linha["paginas"]) if str(linha.get("paginas", "")).isdigit() else None,
                "caracteres": int(linha["caracteres"]) if str(linha.get("caracteres", "")).isdigit() else None,
            }

    por_banca = defaultdict(list)
    for linha in ler_csv(manifesto_path):
        if str(linha.get("extensao", "")).lower() != ".pdf":
            continue
        if not linha.get("caminho_local"):
            continue
        bytes_pdf = int(linha["bytes"]) if str(linha.get("bytes", "")).isdigit() else 0
        if bytes_pdf <= 0:
            continue

        banca_bruta = str(linha.get("banca", "")).strip()
        banca = nomes_canonicos.get(banca_bruta.casefold(), banca_bruta)
        caminho = str(linha.get("caminho_local", "")).replace("\\", "/")
        chave = chave_caminho(caminho)
        texto = textos.get(chave, {})
        origem = url_web(linha.get("url_origem"))
        pagina = url_web(linha.get("pagina_origem"))
        identidade = "|".join((banca, linha.get("concurso", ""), caminho))
        registro = {
            "id": hashlib.sha1(identidade.encode("utf-8")).hexdigest()[:16],
            "banca": banca,
            "concurso": str(linha.get("concurso", "")).strip(),
            "ano": str(linha.get("ano", "")).strip(),
            "tipo": str(linha.get("tipo", "")).strip(),
            "arquivo": str(linha.get("nome_arquivo", "")).strip(),
            "url": origem,
            "pagina": pagina,
            "bytes": bytes_pdf,
            "textoStatus": texto.get("status", "não extraído"),
            "paginas": texto.get("paginas"),
            "caracteres": texto.get("caracteres"),
        }
        por_banca[banca].append(registro)

    total_pdfs = sum(map(len, por_banca.values()))
    esperado = int(resumo_origem.get("pdfs_locais", 0))
    if total_pdfs != esperado:
        raise SystemExit(f"Manifesto inconsistente: {total_pdfs} PDFs encontrados; resumo informa {esperado}.")

    destino.mkdir(parents=True, exist_ok=True)
    cobertura_por_banca = {item["banca"].casefold(): item for item in cobertura}
    bancos = []
    nomes_bancas = {banca.casefold(): banca for banca in por_banca}
    for item in cobertura:
        nomes_bancas.setdefault(item.get("banca", "").casefold(), item.get("banca", ""))
    for chave_banca, banca in sorted(nomes_bancas.items(), key=lambda item: item[1].casefold()):
        registros = sorted(
            por_banca.get(nomes_canonicos.get(chave_banca, banca), []),
            key=lambda item: (-(int(item["ano"]) if item["ano"].isdigit() else 0), item["concurso"].casefold(), item["arquivo"].casefold()),
        )
        nome_arquivo = slug(banca) + ".json"
        if registros:
            (destino / nome_arquivo).write_text(json.dumps(registros, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        item_cobertura = cobertura_por_banca.get(chave_banca, {})
        bancos.append({
            "banca": banca,
            "slug": slug(banca),
            "pdfs": len(registros),
            "concursosListados": item_cobertura.get("concursos_listados", 0),
            "itensPendentes": item_cobertura.get("itens_falhos", 0),
            "observacao": item_cobertura.get("observacao", ""),
        })

    por_status_texto = Counter()
    for registros in por_banca.values():
        por_status_texto.update(registro["textoStatus"] for registro in registros)

    resumo = {
        "dataColeta": resumo_origem.get("data_coleta", ""),
        "periodoConsultado": resumo_origem.get("periodo_consultado", "1996–2026"),
        "pdfs": total_pdfs,
        "bancasComArquivos": sum(bool(item["pdfs"]) for item in bancos),
        "texto": {
            "comTexto": resumo_texto.get("com_texto", 0),
            "parciais": resumo_texto.get("parciais", 0),
            "semTextoPesquisavel": resumo_texto.get("sem_texto_pesquisavel", 0),
            "falhas": resumo_texto.get("falhas", 0),
            "observacao": resumo_texto.get("observacao", ""),
            "porStatus": dict(por_status_texto),
        },
        "bancas": bancos,
        "nota": "O catálogo contém metadados e links de origem. Os PDFs e textos completos permanecem no pacote local e não são enviados ao site.",
    }
    (destino / "resumo.json").write_text(json.dumps(resumo, ensure_ascii=False, indent=2), encoding="utf-8")
    (destino / "LEIA-ME.md").write_text(
        "# Catálogo de provas públicas\n\n"
        f"Atualizado em {resumo['dataColeta']}; período consultado: {resumo['periodoConsultado']}.\n\n"
        f"O catálogo do site indexa {total_pdfs:,} PDFs de {resumo['bancasComArquivos']} bancas/instituições. "
        "Ele contém metadados e links para as fontes de origem, não cópias dos documentos. "
        "O pacote integral local é muito grande para ser enviado como parte do site.\n\n"
        "Os PDFs e textos extraídos ainda não são questões estruturadas; para entrar no banco corrigível, "
        "cada questão precisa ser revisada e ter alternativas e gabarito confirmados. A disponibilidade pública "
        "de um arquivo não equivale a uma licença geral de republicação.\n",
        encoding="utf-8",
    )
    print(json.dumps({"pdfs": total_pdfs, "bancas": len(bancos), "destino": str(destino)}, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fonte", type=Path, default=FONTE_PADRAO)
    parser.add_argument("--destino", type=Path, default=DESTINO_PADRAO)
    args = parser.parse_args()
    gerar(args.fonte, args.destino)


if __name__ == "__main__":
    main()
