"""Restaura as questões visuais omitidas do Vestibular UFRGS 2023."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium

from importar_ufrgs_2023 import GABARITO_DIA_1, GABARITO_DIA_2, materia


ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "public/acervo/ufrgs-2023/questoes.json"
FONTES = ROOT / "tmp/ufrgs-2023"
IMAGENS = DESTINO.parent / "imagens/reparadas"
ESCALA = 2.0

# Página física do PDF. Os dois primeiros arquivos incluem folhas de rosto e
# cartões de respostas, por isso a relação é explicitada e auditável.
PAGINAS = {
    1: {43: 30, 48: 32, 49: 33, 51: 34, 52: 34, 53: 35, 54: 35,
        55: 36, 56: 36, 57: 37, 58: 38, 59: 39, 60: 39},
    2: {9: 7, 10: 7, 12: 7, 13: 8, 29: 14, 43: 22, 45: 23,
        49: 25, 54: 27, 57: 29, 67: 34, 71: 36},
}


def limpar(texto: str) -> str:
    texto = texto.replace("\u00ad", "").replace("�", "")
    texto = re.sub(r"(?<=\w)-\s+(?=\w)", "", texto)
    return re.sub(r"\s+", " ", texto).strip(" .–-")


def marcador_questao(palavras: list[dict], numero: int) -> dict:
    candidatos = [
        palavra for palavra in palavras
        if (60 <= palavra["x0"] <= 82 or 300 <= palavra["x0"] <= 322)
        and re.fullmatch(rf"0?{numero}\.", palavra["text"])
    ]
    if not candidatos:
        raise ValueError(f"Questão {numero} não localizada na página prevista")
    return min(candidatos, key=lambda palavra: palavra["top"])


def fundo_bloco(palavras: list[dict], inicio: dict, altura: float) -> float:
    coluna = 0 if inicio["x0"] < 200 else 1
    proximas = [
        palavra for palavra in palavras
        if (0 if palavra["x0"] < 200 else 1) == coluna
        and (60 <= palavra["x0"] <= 82 or 300 <= palavra["x0"] <= 322)
        and palavra["top"] > inicio["top"] + 20
        and re.fullmatch(r"(?:0?[1-9]|[1-7][0-9])\.", palavra["text"])
    ]
    return min((float(p["top"]) for p in proximas), default=altura - 35) - 6


def tem_divisor_central(pagina, topo: float, fundo: float) -> bool:
    marcadores = [
        palavra for palavra in pagina.extract_words(x_tolerance=2, y_tolerance=3)
        if re.fullmatch(r"(?:0?[1-9]|[1-7][0-9])\.", palavra["text"])
        and topo <= palavra["top"] < fundo
    ]
    if any(60 <= p["x0"] <= 82 for p in marcadores) and any(300 <= p["x0"] <= 322 for p in marcadores):
        return True
    for linha in pagina.lines:
        x0, x1 = float(linha["x0"]), float(linha["x1"])
        if abs(x0 - x1) < 2 and 285 <= x0 <= 315:
            inferior = min(float(linha["top"]), float(linha["bottom"]))
            superior = max(float(linha["top"]), float(linha["bottom"]))
            if min(superior, fundo) - max(inferior, topo) > 80:
                return True
    return False


def main() -> None:
    questoes = json.loads(DESTINO.read_text(encoding="utf-8"))
    por_id = {q["id"]: q for q in questoes}
    IMAGENS.mkdir(parents=True, exist_ok=True)

    for dia, relacao in PAGINAS.items():
        prova = FONTES / f"prova-dia{dia}.pdf"
        gabarito = GABARITO_DIA_1 if dia == 1 else GABARITO_DIA_2
        documento = pdfium.PdfDocument(prova)
        with pdfplumber.open(prova) as pdf:
            for numero, pagina_numero in relacao.items():
                pagina = pdf.pages[pagina_numero - 1]
                palavras = pagina.extract_words(x_tolerance=2, y_tolerance=3)
                inicio = marcador_questao(palavras, numero)
                topo = max(35.0, float(inicio["top"]) - 7)
                fundo = fundo_bloco(palavras, inicio, pagina.height)
                divisor = tem_divisor_central(pagina, topo, fundo)
                alternativas_todas = sorted([
                    palavra for palavra in palavras
                    if topo <= palavra["top"] < fundo
                    and re.fullmatch(r"\([A-E]\)", palavra["text"])
                ], key=lambda palavra: (float(palavra["top"]), float(palavra["x0"])))
                grupos_horizontais: dict[int, list[dict]] = {}
                for alternativa in alternativas_todas:
                    grupos_horizontais.setdefault(round(float(alternativa["top"])), []).append(alternativa)
                horizontal = next((grupo for grupo in grupos_horizontais.values()
                                   if [a["text"] for a in grupo] == [f"({letra})" for letra in "ABCDE"]), None)
                alternativas = horizontal or [
                    palavra for palavra in alternativas_todas
                    if not divisor or (palavra["x0"] < pagina.width / 2) == (inicio["x0"] < pagina.width / 2)
                ]
                grade = not horizontal and {a["text"] for a in alternativas} == {f"({letra})" for letra in "ABCDE"} \
                    and [a["text"] for a in alternativas] != [f"({letra})" for letra in "ABCDE"]
                if grade:
                    alternativas.sort(key=lambda alternativa: alternativa["text"])
                if [a["text"] for a in alternativas] != [f"({letra})" for letra in "ABCDE"]:
                    raise ValueError(f"UFRGS d{dia} q{numero}: alternativas não localizadas: {[a['text'] for a in alternativas]}")

                esquerda, direita = 52.0, pagina.width - 35
                original = documento[pagina_numero - 1].render(scale=ESCALA).to_pil().convert("RGB")
                primeira_alt = float(alternativas[0]["top"])
                inicio_opcoes = max(topo + 20, primeira_alt - 38) if horizontal else primeira_alt
                if divisor and not horizontal and not grade:
                    if inicio["x0"] < pagina.width / 2:
                        recorte_esquerda, recorte_direita = esquerda, pagina.width / 2 - 4
                    else:
                        recorte_esquerda, recorte_direita = pagina.width / 2 + 4, direita
                else:
                    recorte_esquerda, recorte_direita = esquerda, direita
                # Cada apoio termina antes das alternativas. Nas páginas em duas
                # colunas, apenas a coluna da questão é preservada.
                recorte = original.crop((int(recorte_esquerda * ESCALA), int(topo * ESCALA),
                                         int(recorte_direita * ESCALA), int((inicio_opcoes - 3) * ESCALA)))

                base = f"ufrgs-2023-d{dia}-{numero:02d}"
                enunciado_path = IMAGENS / f"{base}-enunciado.webp"
                if recorte.width > 1180:
                    recorte = recorte.resize((1180, round(recorte.height * 1180 / recorte.width)))
                recorte.save(enunciado_path, "WEBP", quality=86, method=6)

                opcoes_imagens = []
                for indice, alternativa in enumerate(alternativas):
                    y0 = inicio_opcoes - 3 if horizontal else float(alternativa["top"]) - 3
                    if horizontal:
                        y1 = min(fundo, y0 + 80)
                        ox0 = esquerda if indice == 0 else (
                            float(alternativas[indice - 1]["x0"]) + float(alternativa["x0"])) / 2
                        ox1 = direita if indice == 4 else (
                            float(alternativa["x0"]) + float(alternativas[indice + 1]["x0"])) / 2
                    elif grade:
                        y1 = min(fundo, y0 + 95)
                        if alternativa["x0"] < pagina.width / 2:
                            ox0, ox1 = esquerda, pagina.width / 2 - 4
                        else:
                            ox0, ox1 = pagina.width / 2 + 4, direita
                    else:
                        y1 = float(alternativas[indice + 1]["top"]) - 3 if indice < 4 else min(fundo, y0 + 95)
                    if horizontal or grade:
                        pass
                    elif divisor:
                        if alternativa["x0"] < pagina.width / 2:
                            ox0, ox1 = esquerda, pagina.width / 2 - 4
                        else:
                            ox0, ox1 = pagina.width / 2 + 4, direita
                    else:
                        ox0, ox1 = esquerda, direita
                    opcao = original.crop((int(ox0 * ESCALA), int(y0 * ESCALA),
                                            int(ox1 * ESCALA), int(y1 * ESCALA)))
                    caminho_opcao = IMAGENS / f"{base}-{chr(65 + indice)}.webp"
                    opcao.save(caminho_opcao, "WEBP", quality=88, method=6)
                    opcoes_imagens.append("/" + caminho_opcao.relative_to(ROOT / "public").as_posix())

                palavras_enunciado = [
                    p["text"] for p in palavras
                    if p["top"] >= inicio["top"] and p["top"] < primeira_alt
                    and p is not inicio
                ]
                id_ = base
                registro = por_id.get(id_, {})
                registro.update({
                    "id": id_, "ano": 2023, "numero_original": numero,
                    "modelo": f"{dia}º dia", "materia": materia(numero, dia),
                    "conteudo": materia(numero, dia), "banca": "UFRGS",
                    "concurso": "Vestibular UFRGS 2023", "dificuldade": "Média",
                    "dificuldade_estimada": True,
                    "enunciado": registro.get("enunciado") or limpar(" ".join(palavras_enunciado)),
                    "opcoes": registro.get("opcoes") or [f"Alternativa {letra}" for letra in "ABCDE"],
                    "opcoes_imagens": opcoes_imagens,
                    "imagem_original": "/" + enunciado_path.relative_to(ROOT / "public").as_posix(),
                    "imagem_sem_alternativas": True, "texto_extraido_corrompido": True,
                    "apoio": registro.get("apoio", []),
                    "origem": "UFRGS - Vestibular 2023 - prova oficial",
                    "fonte_dados": "https://vestibular.ufrgs.br/cv2023/",
                    "resposta_correta": 0 if gabarito[numero - 1] == "X" else ord(gabarito[numero - 1]) - ord("A"),
                    "anulada": gabarito[numero - 1] == "X",
                })
                if id_ not in por_id:
                    questoes.append(registro)
                    por_id[id_] = registro

    questoes.sort(key=lambda q: (int(str(q["modelo"])[0]), q["numero_original"]))
    if len(questoes) != 135 or len({q["id"] for q in questoes}) != 135:
        raise ValueError(f"Acervo incompleto após reparação: {len(questoes)} registros")
    DESTINO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("UFRGS 2023 restaurada: 135 questões, 25 com apoio visual verificado")


if __name__ == "__main__":
    main()
