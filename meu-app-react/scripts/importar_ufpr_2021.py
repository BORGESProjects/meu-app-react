"""Gera o lote canônico UFPR 2021 a partir do caderno/gabarito definitivo.

O PDF oficial marca a resposta correta com uma seta. Cada enunciado e cada
alternativa são preservados em recortes independentes para que fórmulas,
gráficos, destaques tipográficos e textos de apoio não dependam da extração de
texto do PDF.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "tmp/pdfs/ufpr-2021/ingles.pdf"
DESTINO = ROOT / "public/acervo/ufpr-2021"
IMAGENS = DESTINO / "imagens"
FONTE = "https://servicos.nc.ufpr.br/documentos/PS2021/provas1fase/ps2021_conhecimentos_gerais_ingles.pdf"
PAGINAS = [*range(2, 16)]  # caderno definitivo em Inglês
ESCALA = 1.8

APOIOS = {
    (1, 4): [(2, 43.7)],
    (5, 9): [(2, 588.2)],
    (10, 11): [(3, 640.5), (4, 25.0)],
    (35, 40): [(9, 357.6)],
}



OPCOES_CONFERIDAS = {
    4: ["in addition.", "besides.", "either.", "nevertheless.", "otherwise."],
    9: [
        "uma personificação das empresas multinacionais.",
        "uma metáfora da capilarização das empresas multinacionais.",
        "um paradoxo sobre a distribuição mundial de alimentos.",
        "uma alegoria sobre as redes de alimentação fast food.",
        "um eufemismo sobre a obesidade mundial crescente.",
    ],
}

def limpar(texto: str) -> str:
    texto = texto.replace("\u00ad", "").replace("►", "")
    texto = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", texto)
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip()


def materia(numero: int) -> str:
    if numero <= 4:
        return "Língua Inglesa"
    if numero <= 12:
        return "Língua Portuguesa"
    if numero <= 19:
        return "Literatura"
    if numero <= 22:
        return "História"
    if numero <= 32:
        return "Geografia"
    if numero <= 34:
        return "Biologia"
    if numero <= 40:
        return "Física"
    if numero <= 44:
        return "Filosofia"
    if numero <= 50:
        return "Matemática"
    if numero <= 56:
        return "Química"
    return "Sociologia"

def salvar_webp(imagem: Image.Image, caminho: Path, qualidade: int = 82) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    if imagem.width > 1180:
        altura = round(imagem.height * 1180 / imagem.width)
        imagem = imagem.resize((1180, altura), Image.Resampling.LANCZOS)
    imagem.save(caminho, "WEBP", quality=qualidade, method=6)


def url(caminho: Path) -> str:
    return "/" + caminho.relative_to(ROOT / "public").as_posix()


def inicios(pdf: pdfplumber.PDF) -> list[dict]:
    encontrados: list[dict] = []
    for pagina_indice in PAGINAS:
        palavras = pdf.pages[pagina_indice].extract_words(x_tolerance=2, y_tolerance=3)
        for indice, palavra in enumerate(palavras[:-1]):
            numero_texto = palavra["text"].lstrip("*")
            if re.fullmatch(r"\d{2}", numero_texto) and palavras[indice + 1]["text"] == "-" and palavra["x0"] < 80:
                numero = int(numero_texto)
                if 1 <= numero <= 60:
                    encontrados.append({"numero": numero, "pagina": pagina_indice, "topo": float(palavra["top"])})
    if [item["numero"] for item in encontrados] != list(range(1, 61)):
        raise ValueError(f"Não foi possível localizar as 60 questões canônicas da UFPR 2021: {[item['numero'] for item in encontrados]}")
    return encontrados


def fim_da_ultima_opcao(palavras: list[dict], topo: float, limite: float) -> float:
    linhas = sorted({round(float(p["top"]), 1) for p in palavras if topo <= p["top"] < limite})
    if not linhas:
        return min(limite, topo + 16)
    anterior = linhas[0]
    for atual in linhas[1:]:
        if atual - anterior > 18:
            return anterior + 13
        anterior = atual
    return min(limite, anterior + 13)


def recorte(imagem: Image.Image, pagina, topo: float, fundo: float, x0: float = 25, x1: float | None = None) -> Image.Image:
    direita = pagina.width - 25 if x1 is None else x1
    return imagem.crop((int(x0 * ESCALA), int(max(25, topo) * ESCALA), int(direita * ESCALA), int(min(pagina.height - 20, fundo) * ESCALA)))


def gerar() -> list[dict]:
    DESTINO.mkdir(parents=True, exist_ok=True)
    IMAGENS.mkdir(parents=True, exist_ok=True)
    with pdfplumber.open(PDF) as pdf:
        marcadores = inicios(pdf)
        render = pdfium.PdfDocument(PDF)
        imagens_paginas: dict[int, Image.Image] = {}

        def imagem_pagina(indice: int) -> Image.Image:
            if indice not in imagens_paginas:
                imagens_paginas[indice] = render[indice].render(scale=ESCALA).to_pil().convert("RGB")
            return imagens_paginas[indice]

        apoios_gerados: dict[tuple[int, int], list[dict]] = {}
        for intervalo, segmentos in APOIOS.items():
            primeiro = next(item for item in marcadores if item["numero"] == intervalo[0])
            partes: list[dict] = []
            for parte, (pagina_indice, topo) in enumerate(segmentos, 1):
                sufixo = f"-parte-{parte}" if len(segmentos) > 1 else ""
                caminho = IMAGENS / f"apoio-{intervalo[0]:02d}-{intervalo[1]:02d}{sufixo}.webp"
                fundo_apoio = primeiro["topo"] - 5 if primeiro["pagina"] == pagina_indice else pdf.pages[pagina_indice].height - 20
                salvar_webp(recorte(imagem_pagina(pagina_indice), pdf.pages[pagina_indice], topo, fundo_apoio), caminho)
                texto = limpar(pdf.pages[pagina_indice].crop((25, topo, pdf.pages[pagina_indice].width - 25, fundo_apoio)).extract_text() or "")
                partes.append({"imagem": url(caminho), "texto": texto})
            apoios_gerados[intervalo] = partes

        questoes: list[dict] = []
        for indice, inicio in enumerate(marcadores):
            numero, pagina_indice, topo = inicio["numero"], inicio["pagina"], inicio["topo"]
            pagina = pdf.pages[pagina_indice]
            palavras = pagina.extract_words(x_tolerance=2, y_tolerance=3)
            proximo = marcadores[indice + 1] if indice + 1 < len(marcadores) else None
            limite = proximo["topo"] - 3 if proximo and proximo["pagina"] == pagina_indice else pagina.height - 22
            outros_inicios = [
                float(palavra["top"])
                for posicao, palavra in enumerate(palavras[:-1])
                if palavra["top"] > topo
                and re.fullmatch(r"\*?\d{2}", palavra["text"])
                and palavras[posicao + 1]["text"] == "-"
                and palavra["x0"] < 70
            ]
            if outros_inicios:
                limite = min(limite, min(outros_inicios) - 3)
            cabecalhos = {"MATEMÁTICA", "FÍSICA", "QUÍMICA", "BIOLOGIA", "GEOGRAFIA", "HISTÓRIA", "LÍNGUA", "LITERATURA", "SOCIOLOGIA", "FILOSOFIA", "ALEMÃO", "ESPANHOL", "FRANCÊS", "INGLÊS", "ITALIANO"}
            proximos_cabecalhos = [float(p["top"]) for p in palavras if float(p["top"]) > topo and p["text"] == p["text"].upper() and p["text"].upper() in cabecalhos]
            if proximos_cabecalhos:
                limite = min(limite, min(proximos_cabecalhos) - 3)
            proximos_apoios = [
                apoio_topo
                for segmentos in APOIOS.values()
                for apoio_pagina, apoio_topo in segmentos
                if apoio_pagina == pagina_indice and topo < apoio_topo < limite
            ]
            if proximos_apoios:
                limite = min(limite, min(proximos_apoios) - 3)
            if numero == 60:
                limite = min(limite, 530.0)  # início da proposta discursiva
            alternativas_brutas = [p for p in palavras if topo <= p["top"] < limite and re.fullmatch(r"►?[A-Ea-e]\)", p["text"])]
            por_letra = {p["text"].replace("►", "")[0].upper(): p for p in alternativas_brutas}
            if set(por_letra) != set("ABCDE"):
                raise ValueError(f"Questão {numero}: alternativas {sorted(por_letra)} localizadas")
            alternativas = [por_letra[letra] for letra in "ABCDE"]

            resposta = next((i for i, marcador in enumerate(alternativas) if marcador["text"].startswith("►")), None)
            anulada = resposta is None
            topo_a = min(float(marcador["top"]) for marcador in alternativas)
            caminho_enunciado = IMAGENS / f"q{numero:02d}-enunciado.webp"
            imagem_enunciado = recorte(imagem_pagina(pagina_indice), pagina, topo - 3, topo_a - 3)

            salvar_webp(imagem_enunciado, caminho_enunciado)

            opcoes: list[str] = []
            opcoes_imagens: list[str] = []
            opcoes_corrompidas: list[bool] = []
            # As alternativas podem aparecer em uma coluna, duas colunas ou
            # numa única linha. Cada célula termina no próximo marcador da
            # mesma linha e na linha seguinte, evitando capturar a alternativa
            # vizinha em fórmulas e estruturas químicas.
            linhas_alternativas: list[list[dict]] = []
            for marcador in sorted(alternativas, key=lambda item: (float(item["top"]), float(item["x0"]))):
                linha = next(
                    (grupo for grupo in linhas_alternativas if abs(float(grupo[0]["top"]) - float(marcador["top"])) <= 4),
                    None,
                )
                if linha is None:
                    linhas_alternativas.append([marcador])
                else:
                    linha.append(marcador)
            for linha in linhas_alternativas:
                linha.sort(key=lambda item: float(item["x0"]))

            for opcao_indice, marcador in enumerate(alternativas):
                linha_atual = next(grupo for grupo in linhas_alternativas if marcador in grupo)
                posicao = linha_atual.index(marcador)
                proxima_na_linha = linha_atual[posicao + 1] if posicao + 1 < len(linha_atual) else None
                linhas_abaixo = [
                    grupo for grupo in linhas_alternativas
                    if min(float(item["top"]) for item in grupo) > max(float(item["top"]) for item in linha_atual) + 4
                ]
                proxima_linha = min(
                    (min(float(item["top"]) for item in grupo) for grupo in linhas_abaixo),
                    default=None,
                )
                inicio_opcao = float(marcador["top"])
                fim_opcao = (
                    proxima_linha - 1
                    if proxima_linha is not None
                    else limite
                )
                x_texto = float(marcador["x1"]) + 2
                if proxima_na_linha:
                    x_fim = float(proxima_na_linha["x0"]) - 5
                elif len(linha_atual) >= 3:
                    espacamentos = [
                        float(linha_atual[i + 1]["x0"]) - float(linha_atual[i]["x0"])
                        for i in range(len(linha_atual) - 1)
                    ]
                    espacamento = sorted(espacamentos)[len(espacamentos) // 2]
                    x_fim = min(pagina.width - 25, float(marcador["x0"]) + espacamento - 5)
                else:
                    x_fim = pagina.width - 25

                caixa = pagina.crop((x_texto, max(25, inicio_opcao - 2), x_fim, fim_opcao))
                texto = limpar(caixa.extract_text(x_tolerance=2, y_tolerance=3) or "")
                letra = chr(65 + opcao_indice)
                opcoes.append(texto or f"Alternativa {letra} — consulte o recorte oficial.")
                caminho_opcao = IMAGENS / f"q{numero:02d}-{letra.lower()}.webp"
                salvar_webp(
                    recorte(
                        imagem_pagina(pagina_indice),
                        pagina,
                        inicio_opcao - 2,
                        fim_opcao + 1,
                        x0=x_texto,
                        x1=x_fim,
                    ),
                    caminho_opcao,
                )
                opcoes_imagens.append(url(caminho_opcao))
                opcoes_corrompidas.append(bool(re.search(r"\(cid:\d+\)|[\ue000-\uf8ff\ufffd]", texto)))
            if numero in OPCOES_CONFERIDAS:
                opcoes = OPCOES_CONFERIDAS[numero]
                opcoes_corrompidas = [False] * 5
            caixa_enunciado = pagina.crop((25, max(25, topo - 3), pagina.width - 25, topo_a - 3))
            enunciado = limpar(re.sub(r"^\*?\s*\d{2}\s*-\s*", "", caixa_enunciado.extract_text(x_tolerance=2, y_tolerance=3) or ""))
            item = {
                "id": f"ufpr-2021-{numero:02d}",
                "ano": 2021,
                "numero_original": numero,
                "modelo": "Geral — Inglês",
                "materia": materia(numero),
                "conteudo": materia(numero),
                "banca": "UFPR",
                "concurso": "Processo Seletivo UFPR 2021",
                "dificuldade": "Média",
                "dificuldade_estimada": True,
                "enunciado": enunciado or f"Questão {numero} da prova UFPR 2021, conforme o recorte oficial.",
                "opcoes": opcoes,
                "resposta_correta": resposta,
                "anulada": anulada,
                "pagina": pagina_indice + 1,
                "fonte_pdf": FONTE,
                "fonte_gabarito": FONTE,
                "imagem_original": url(caminho_enunciado),
                "imagem_sem_alternativas": True,
                "opcoes_imagens": opcoes_imagens,
                "opcoes_texto_corrompido": opcoes_corrompidas,
            }
            for intervalo, apoio in apoios_gerados.items():
                if intervalo[0] <= numero <= intervalo[1]:
                    item["apoio"] = apoio
                    break
            questoes.append(item)
    return questoes


if __name__ == "__main__":
    questoes = gerar()
    arquivo = DESTINO / "questoes.json"
    arquivo.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(questoes)} questões UFPR 2021 gravadas em {arquivo}")
