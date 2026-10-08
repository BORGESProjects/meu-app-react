"""Gera o lote canônico UFPR 2023 a partir do caderno/gabarito definitivo.

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
PDF = ROOT / "tmp/pdfs/ufpr-2023/Geral.pdf"
DESTINO = ROOT / "public/acervo/ufpr-2023"
IMAGENS = DESTINO / "imagens"
FONTE = "https://servicos.nc.ufpr.br/documentos/ps2023/provas/Geral.pdf"
PAGINAS = [*range(2, 21), 26, 27]  # índices: núcleo comum + Inglês
ESCALA = 1.8

APOIOS = {
    (28, 36): (7, 650.0),
    (37, 41): (9, 380.0),
    (44, 48): (11, 43.0),
    (62, 63): (15, 568.0),
    (83, 85): (26, 64.0),
    (86, 87): (26, 556.0),
    (89, 90): (27, 384.0),
}


def limpar(texto: str) -> str:
    texto = texto.replace("\u00ad", "").replace("►", "")
    texto = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", texto)
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip()


def materia(numero: int) -> str:
    if numero <= 10:
        return "Biologia"
    if numero <= 19:
        return "Matemática"
    if numero <= 27:
        return "História"
    if numero <= 36:
        return "Física"
    if numero <= 48:
        return "Língua Portuguesa"
    if numero <= 54:
        return "Literatura"
    if numero <= 66:
        return "Química"
    if numero <= 71:
        return "Filosofia"
    if numero <= 79:
        return "Geografia"
    if numero <= 82:
        return "Sociologia"
    return "Língua Inglesa"

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
    for pagina_indice in range(2, 21):
        palavras = pdf.pages[pagina_indice].extract_words(x_tolerance=2, y_tolerance=3)
        for indice, palavra in enumerate(palavras[:-1]):
            numero_texto = palavra["text"].lstrip("*")
            if re.fullmatch(r"\d{2}", numero_texto) and palavras[indice + 1]["text"] == "-" and palavra["x0"] < 70:
                numero = int(numero_texto)
                if 1 <= numero <= 82:
                    encontrados.append({"numero": numero, "pagina": pagina_indice, "topo": float(palavra["top"])})
    for pagina_indice, numeros in ((26, {83, 84, 85}), (27, {86, 87, 88, 89, 90})):
        palavras = pdf.pages[pagina_indice].extract_words(x_tolerance=2, y_tolerance=3)
        for indice, palavra in enumerate(palavras[:-1]):
            numero_texto = palavra["text"].lstrip("*")
            if re.fullmatch(r"\d{2}", numero_texto) and palavras[indice + 1]["text"] == "-" and palavra["x0"] < 70:
                numero = int(numero_texto)
                if numero in numeros:
                    encontrados.append({"numero": numero, "pagina": pagina_indice, "topo": float(palavra["top"])})
    if [item["numero"] for item in encontrados] != list(range(1, 91)):
        raise ValueError(f"Não foi possível localizar as 90 questões canônicas da UFPR 2023: {[item['numero'] for item in encontrados]}")
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

        apoios_gerados: dict[tuple[int, int], dict] = {}
        for intervalo, (pagina_indice, topo) in APOIOS.items():
            primeiro = next(item for item in marcadores if item["numero"] == intervalo[0])
            caminho = IMAGENS / f"apoio-{intervalo[0]:02d}-{intervalo[1]:02d}.webp"
            fundo_apoio = primeiro["topo"] - 5 if primeiro["pagina"] == pagina_indice else pdf.pages[pagina_indice].height - 20
            salvar_webp(recorte(imagem_pagina(pagina_indice), pdf.pages[pagina_indice], topo, fundo_apoio), caminho)
            texto = limpar(pdf.pages[pagina_indice].crop((25, topo, pdf.pages[pagina_indice].width - 25, fundo_apoio)).extract_text() or "")
            apoios_gerados[intervalo] = {"imagem": url(caminho), "texto": texto}

        questoes: list[dict] = []
        for indice, inicio in enumerate(marcadores):
            numero, pagina_indice, topo = inicio["numero"], inicio["pagina"], inicio["topo"]
            pagina = pdf.pages[pagina_indice]
            palavras = pagina.extract_words(x_tolerance=2, y_tolerance=3)
            proximo = marcadores[indice + 1] if indice + 1 < len(marcadores) else None
            limite = proximo["topo"] - 3 if proximo and proximo["pagina"] == pagina_indice else pagina.height - 22
            # A página 21 ainda contém a primeira questão de outra opção de
            # língua estrangeira. Ela não integra o modelo canônico em Inglês,
            # mas delimita corretamente o fim da questão 82.
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
            xs = [float(marcador["x0"]) for marcador in alternativas]
            duas_colunas = max(xs) - min(xs) > 120
            divisor = (min(xs) + max(xs)) / 2 if duas_colunas else pagina.width
            inicio_direita = min((x for x in xs if x > divisor), default=pagina.width)
            for opcao_indice, marcador in enumerate(alternativas):
                inicio_opcao = float(marcador["top"])
                lado_direito = duas_colunas and float(marcador["x0"]) > divisor
                mesma_coluna = [
                    outro for outro in alternativas
                    if (not duas_colunas or (float(outro["x0"]) > divisor) == lado_direito)
                    and float(outro["top"]) > inicio_opcao + 0.5
                ]
                if mesma_coluna:
                    fim_opcao = min(float(outro["top"]) for outro in mesma_coluna) - 1
                else:
                    fim_opcao = fim_da_ultima_opcao(palavras, inicio_opcao, limite)
                x_texto = float(marcador["x1"]) + 2
                x_fim = pagina.width - 25 if not duas_colunas or lado_direito else inicio_direita - 8

                caixa = pagina.crop((x_texto, max(25, inicio_opcao - 1), x_fim, fim_opcao))
                texto = limpar(caixa.extract_text(x_tolerance=2, y_tolerance=3) or "")
                letra = chr(65 + opcao_indice)
                opcoes.append(texto or f"Alternativa {letra} — consulte o recorte oficial.")
                caminho_opcao = IMAGENS / f"q{numero:02d}-{letra.lower()}.webp"
                salvar_webp(recorte(imagem_pagina(pagina_indice), pagina, inicio_opcao - 2, fim_opcao + 1, x0=x_texto, x1=x_fim), caminho_opcao)
                opcoes_imagens.append(url(caminho_opcao))
                opcoes_corrompidas.append(bool(re.search(r"\(cid:\d+\)|[\ue000-\uf8ff\ufffd]", texto)))
            caixa_enunciado = pagina.crop((25, max(25, topo - 3), pagina.width - 25, topo_a - 3))
            enunciado = limpar(re.sub(r"^\*?\d{2}\s*-\s*", "", caixa_enunciado.extract_text(x_tolerance=2, y_tolerance=3) or ""))
            item = {
                "id": f"ufpr-2023-{numero:02d}",
                "ano": 2023,
                "numero_original": numero,
                "modelo": "Geral — Inglês",
                "materia": materia(numero),
                "conteudo": materia(numero),
                "banca": "UFPR",
                "concurso": "Processo Seletivo UFPR 2023",
                "dificuldade": "Média",
                "dificuldade_estimada": True,
                "enunciado": enunciado or f"Questão {numero} da prova UFPR 2023, conforme o recorte oficial.",
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
                    item["apoio"] = [apoio]
                    break
            questoes.append(item)
    return questoes


if __name__ == "__main__":
    questoes = gerar()
    arquivo = DESTINO / "questoes.json"
    arquivo.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(questoes)} questões UFPR 2023 gravadas em {arquivo}")
