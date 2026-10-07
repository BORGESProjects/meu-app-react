"""Recupera questões EsPCEx que dependem de mapas, gráficos ou figuras."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ARQUIVO = ROOT / "public/acervo/espcex-2017-2026/questoes.json"
FONTES = ROOT / "tmp/espcex-2017-2026"
IMAGENS = ARQUIVO.parent / "imagens/reparadas"
ESCALA = 1.9
IDS = {
    "espcex-2017-d2-41", "espcex-2018-d2-24", "espcex-2018-d2-29", "espcex-2018-d2-30",
    "espcex-2019-d2-22", "espcex-2019-d2-23", "espcex-2019-d2-26", "espcex-2021-d2-21",
    "espcex-2022-d2-23", "espcex-2022-d2-27", "espcex-2022-d2-30", "espcex-2025-d2-23",
    "espcex-2025-d2-26", "espcex-2025-d2-29",
}
ALTERNATIVAS_AO_LADO = {
    "espcex-2022-d2-23": "esquerda",
    "espcex-2022-d2-27": "esquerda",
    "espcex-2025-d2-23": "direita",
    "espcex-2025-d2-29": "direita",
}


def marcador_numero(palavras: list[dict], numero: int) -> dict:
    candidatos = [
        palavra for palavra in palavras
        if palavra["x0"] < 65 and re.fullmatch(rf"0?{numero}", palavra["text"].lstrip("*"))
    ]
    if not candidatos:
        raise ValueError(f"Questão {numero} não localizada")
    return min(candidatos, key=lambda palavra: palavra["top"])


def limite_proxima_questao(palavras: list[dict], numero: int, inicio: dict, altura: float) -> float:
    """Distingue o número da próxima questão de valores em gráficos e tabelas."""
    for indice, palavra in enumerate(palavras):
        if palavra["x0"] >= 65 or palavra["top"] <= inicio["top"] + 15:
            continue
        if not re.fullmatch(rf"0?{numero + 1}", palavra["text"].lstrip("*")):
            continue
        vizinhas = [
            proxima for proxima in palavras[indice + 1:indice + 5]
            if abs(float(proxima["top"]) - float(palavra["top"])) < 18
        ]
        if not vizinhas:
            continue
        texto_seguinte = vizinhas[0]["text"].strip()
        if re.fullmatch(r"[-+]?\d+(?:[,.]\d+)?(?:%|°)?", texto_seguinte):
            continue
        return float(palavra["top"]) - 4
    return altura - 28


def main() -> None:
    questoes = json.loads(ARQUIVO.read_text(encoding="utf-8"))
    selecionadas = [q for q in questoes if q["id"] in IDS]
    if len(selecionadas) != len(IDS):
        raise ValueError("Nem todas as questões previstas foram encontradas")
    IMAGENS.mkdir(parents=True, exist_ok=True)

    documentos: dict[tuple[int, int], pdfium.PdfDocument] = {}
    for questao in selecionadas:
        ano, dia, numero = questao["ano"], questao["dia"], questao["numero_original"]
        prova = FONTES / str(ano) / f"prova-dia{dia}.pdf"
        pagina_indice = questao["pagina"] - 1
        with pdfplumber.open(prova) as pdf:
            pagina = pdf.pages[pagina_indice]
            palavras = pagina.extract_words(x_tolerance=2, y_tolerance=3)
            inicio = marcador_numero(palavras, numero)
            fundo = limite_proxima_questao(palavras, numero, inicio, pagina.height)
            alternativas = [
                palavra for palavra in palavras
                if inicio["top"] <= palavra["top"] < fundo
                and re.fullmatch(r"(?:\[[A-E]\]|\([A-E]\)|[A-E]\))", palavra["text"])
            ]
            alternativas.sort(key=lambda alternativa: (float(alternativa["top"]), float(alternativa["x0"])))
            if len(alternativas) != 5:
                raise ValueError(f"{questao['id']}: {len(alternativas)} alternativas localizadas")

            chave = (ano, dia)
            if chave not in documentos:
                documentos[chave] = pdfium.PdfDocument(prova)
            original = documentos[chave][pagina_indice].render(scale=ESCALA).to_pil().convert("RGB")
            esquerda, direita = 28.0, pagina.width - 25
            topo = max(30.0, float(inicio["top"]) - 5)
            recorte = original.crop((int(esquerda*ESCALA), int(topo*ESCALA), int(direita*ESCALA), int(fundo*ESCALA)))
            desenho = ImageDraw.Draw(recorte)

            mesma_linha = max(float(a["top"]) for a in alternativas) - min(float(a["top"]) for a in alternativas) < 6
            for indice, alternativa in enumerate(alternativas):
                y0 = float(alternativa["top"]) - topo - 2
                companheiras = [a for a in alternativas if abs(float(a["top"]) - float(alternativa["top"])) < 3]
                linha_horizontal = mesma_linha or len(companheiras) > 1
                if linha_horizontal:
                    y1 = min(fundo - topo, y0 + 24)
                else:
                    y1 = (float(alternativas[indice + 1]["top"]) - topo - 1) if indice < 4 else min(fundo - topo, y0 + 50)
                # Provas antigas dispõem figura e alternativas lado a lado.
                # Apagamos somente a metade que contém as alternativas.
                if linha_horizontal:
                    x0 = alternativa["x0"] - esquerda - 3
                    posteriores = [a for a in companheiras if float(a["x0"]) > float(alternativa["x0"])]
                    proxima_x = min((a["x0"] for a in posteriores), default=direita)
                    x1 = proxima_x - esquerda - 1
                elif questao["id"] in ALTERNATIVAS_AO_LADO:
                    lado = ALTERNATIVAS_AO_LADO[questao["id"]]
                    if lado == "esquerda":
                        x0, x1 = 0, pagina.width / 2 - esquerda
                    else:
                        x0, x1 = alternativa["x0"] - esquerda - 3, direita - esquerda
                else:
                    # Nas alternativas verticais, o texto pode ocupar toda a largura
                    # e quebrar a linha antes do marcador. Removemos a faixa inteira.
                    x0, x1 = 0, direita - esquerda
                desenho.rectangle((int(x0*ESCALA), int(y0*ESCALA), int(x1*ESCALA), int(y1*ESCALA)), fill="white")

            caminho = IMAGENS / f"{questao['id']}-enunciado.webp"
            if recorte.width > 1180:
                recorte = recorte.resize((1180, round(recorte.height * 1180 / recorte.width)))
            recorte.save(caminho, "WEBP", quality=84, method=6)
            questao["imagem_original"] = "/" + caminho.relative_to(ROOT / "public").as_posix()
            questao["imagem_sem_alternativas"] = True
            questao["texto_extraido_corrompido"] = True

    ARQUIVO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(selecionadas)} questões EsPCEx reparadas")


if __name__ == "__main__":
    main()
