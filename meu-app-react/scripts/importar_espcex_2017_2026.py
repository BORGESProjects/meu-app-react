"""Monta o acervo EsPCEx 2017-2026 a partir dos cadernos e gabaritos.

O processo é determinístico. PDFs com texto são lidos por posição; as edições
escaneadas de 2023 e 2024 usam OCR local e mantêm recortes das questões e das
alternativas para que fórmulas e figuras nunca dependam do texto reconhecido.
"""
from __future__ import annotations

import csv
import io
import json
import re
import subprocess
import tempfile
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FONTES = ROOT / "tmp/espcex-2017-2026"
DESTINO = ROOT / "public/acervo/espcex-2017-2026"
IMAGENS = DESTINO / "imagens"
TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
TESSDATA = ROOT / "tmp/tessdata"
ANOS_DIGITAIS = {2017, 2018, 2019, 2020, 2021, 2022, 2025}
PADRAO_CORROMPIDO = re.compile(r"[\uE000-\uF8FF\uFFFD\u25A0\u25A1\u0900-\u0DFF\u1200-\u137F]|(?:\?\s*){4,}|\(cid:\d+\)", re.I)
PADRAO_REFERENCIA_APOIO = re.compile(r"(?:according to|de acordo com|conforme|segundo) (?:the |o )?(?:text|texto|tirinha|charge|figura|gráfico)", re.I)
PADRAO_CONTAMINACAO = re.compile(r"texto para (?:as )?(?:próximas|questões)|(?:\n| {2,})\*?\d{1,3}\s*(?:\*\d{1,3}\s*)?-\s+.{12,}|PUC\s*-\s*DEMAIS CURSOS", re.I)


def limpar(texto: str) -> str:
    texto = texto.replace("\u00ad", "").replace("\ufeff", "").replace("\ufffe", "")
    texto = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", texto)
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip(" \n\t–-")


def materia(numero: int, dia: int) -> str:
    if dia == 1:
        return "Língua Portuguesa" if numero <= 20 else "Física" if numero <= 32 else "Química"
    return "Matemática" if numero <= 20 else "Geografia" if numero <= 32 else "História" if numero <= 44 else "Língua Inglesa"


def extrair_gabarito(arquivo: Path, total: int) -> list[str]:
    pdf = pdfium.PdfDocument(arquivo)
    texto = "\n".join(p.get_textpage().get_text_range() for p in pdf)
    respostas: dict[int, str] = {}
    for numero, resposta in re.findall(r"(?<!\d)(\d{1,2})\s*(?:-\s*)?(Anulada|[A-E])(?!\w)", texto, re.I):
        n = int(numero)
        if 1 <= n <= total and n not in respostas:
            respostas[n] = resposta.upper()
    ausentes = [n for n in range(1, total + 1) if n not in respostas]
    if ausentes:
        raise ValueError(f"Gabarito incompleto em {arquivo}: {ausentes}")
    return [respostas[n] for n in range(1, total + 1)]


def marcadores_digitais(pdf: pdfplumber.PDF, total: int) -> list[tuple[int, int, float]]:
    candidatos: dict[int, list[tuple[int, float]]] = {n: [] for n in range(1, total + 1)}
    for indice, pagina in enumerate(pdf.pages[1:], 1):
        for palavra in pagina.extract_words():
            if palavra["x0"] >= 50 or not (35 < palavra["top"] < pagina.height - 30):
                continue
            if not re.fullmatch(r"\d{1,2}", palavra["text"]):
                continue
            numero = int(palavra["text"])
            if 1 <= numero <= total:
                candidatos[numero].append((indice, float(palavra["top"])))
    escolhidos = []
    anterior = (-1, -1.0)
    for numero in range(1, total + 1):
        validos = [pos for pos in candidatos[numero] if pos > anterior]
        if not validos:
            raise ValueError(f"Questão {numero} não localizada no caderno")
        atual = min(validos)
        escolhidos.append((numero, *atual))
        anterior = atual
    return escolhidos


def dividir_alternativas(texto: str, formato: str = "colchetes") -> tuple[str, list[str]]:
    # A primeira tentativa ignora [A]1, [B]2 etc. dentro de fórmulas. A
    # segunda aceita alternativas matemáticas que começam diretamente por um
    # algarismo, presentes em alguns cadernos antigos.
    for padrao in (
        re.compile(r"(?:\[\s*([A-E])\s*[\]\[]|\(\s*([A-E])\s*\))\s*(?!\d)"),
        re.compile(r"(?:\[\s*([A-E])\s*[\]\[]|\(\s*([A-E])\s*\))\s*"),
    ):
        marcadores = list(padrao.finditer(texto))
        for inicio in range(max(0, len(marcadores) - 4)):
            grupo = marcadores[inicio:inicio + 5]
            letras = [(m.group(1) or m.group(2)) for m in grupo]
            if letras != list("ABCDE"):
                continue
            enunciado = limpar(texto[:grupo[0].start()])
            opcoes = []
            for i, marcador in enumerate(grupo):
                fim = grupo[i + 1].start() if i < 4 else len(texto)
                opcoes.append(limpar(texto[marcador.end():fim]))
            return enunciado, opcoes
        # Algumas alternativas curtas são diagramadas em duas ou três
        # colunas; o extrator devolve A,C,E,B,D. Quando cada letra aparece uma
        # única vez, remontamos as opções pelo próprio rótulo.
        letras_todas = [(m.group(1) or m.group(2)) for m in marcadores]
        if len(marcadores) == 5 and set(letras_todas) == set("ABCDE"):
            enunciado = limpar(texto[:marcadores[0].start()])
            por_letra = {}
            for i, marcador in enumerate(marcadores):
                fim = marcadores[i + 1].start() if i < 4 else len(texto)
                por_letra[letras_todas[i]] = limpar(texto[marcador.end():fim])
            return enunciado, [por_letra[letra] for letra in "ABCDE"]
    return limpar(texto), []


def salvar_webp(imagem: Image.Image, caminho: Path, qualidade: int = 76) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    if imagem.width > 1100:
        altura = round(imagem.height * 1100 / imagem.width)
        imagem = imagem.resize((1100, altura), Image.Resampling.LANCZOS)
    imagem.save(caminho, "WEBP", quality=qualidade, method=6)


def url_imagem(caminho: Path) -> str:
    return "/" + caminho.relative_to(ROOT / "public").as_posix()


def texto_corrompido(texto: str) -> bool:
    return bool(PADRAO_CORROMPIDO.search(str(texto or ""))) or any(
        ord(caractere) < 32 and caractere not in "\t\n\r" for caractere in str(texto or "")
    )


def opcoes_publicaveis(opcoes: list[str]) -> bool:
    limpas = [limpar(opcao) for opcao in opcoes]
    normalizadas = [re.sub(r"\s+", " ", opcao).casefold() for opcao in limpas]
    return (
        len(limpas) == 5
        and all(limpas)
        and all(len(opcao) <= 500 for opcao in limpas)
        and len(set(normalizadas)) == 5
        and not all(re.fullmatch(r"[a-e]", opcao) for opcao in normalizadas)
        and not any(texto_corrompido(opcao) or PADRAO_CONTAMINACAO.search(opcao) for opcao in limpas)
    )


def opcoes_por_imagem() -> list[str]:
    return [f"Alternativa {letra} — consulte o recorte original." for letra in "ABCDE"]


def extrair_digital(ano: int, dia: int, gabarito: list[str]) -> list[dict]:
    arquivo = FONTES / str(ano) / f"prova-dia{dia}.pdf"
    total = 44 if dia == 1 else 56
    questoes = []
    with pdfplumber.open(arquivo) as pdf:
        marcadores = marcadores_digitais(pdf, total)
        render = pdfium.PdfDocument(arquivo)
        for indice, (numero, pagina_indice, topo) in enumerate(marcadores):
            pagina = pdf.pages[pagina_indice]
            proximo = marcadores[indice + 1] if indice + 1 < len(marcadores) else None
            fundo = proximo[2] - 3 if proximo and proximo[1] == pagina_indice else pagina.height - 35
            recorte = pagina.crop((55, max(35, topo - 3), pagina.width - 28, fundo))
            texto = recorte.extract_text(x_tolerance=2, y_tolerance=3) or ""
            enunciado, opcoes = dividir_alternativas(texto)
            opcoes_validas = opcoes_publicaveis(opcoes)
            enunciado_invalido = len(limpar(enunciado)) < 12 or texto_corrompido(enunciado)
            requer_imagem = not opcoes_validas or enunciado_invalido or bool(PADRAO_REFERENCIA_APOIO.search(enunciado))
            if enunciado_invalido:
                enunciado = f"Questão {numero} da prova EsPCEx {ano}, conforme o recorte original."
            if not opcoes_validas:
                opcoes = opcoes_por_imagem()

            item = criar_item(ano, dia, numero, gabarito[numero - 1], enunciado, opcoes, pagina_indice + 1)
            if requer_imagem or materia(numero, dia) in {"Matemática", "Física", "Química"}:
                escala = 1.65
                imagem_pagina = render[pagina_indice].render(scale=escala).to_pil()
                box = (int(55 * escala), int(max(35, topo - 3) * escala), int((pagina.width - 28) * escala), int(fundo * escala))
                caminho = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}.webp"
                salvar_webp(imagem_pagina.crop(box), caminho)
                item["imagem_original"] = url_imagem(caminho)
                if requer_imagem:
                    item["texto_extraido_corrompido"] = True
            questoes.append(item)
    return questoes


def detectar_caixas(imagem: Image.Image) -> list[tuple[int, int, int, int]]:
    cinza = imagem.convert("L")
    largura, altura = cinza.size
    x0, x1 = int(largura * .05), int(largura * .15)
    y0, y1 = int(altura * .035), int(altura * .94)
    pretos = {(x, y) for y in range(y0, y1) for x in range(x0, x1) if cinza.getpixel((x, y)) < 80}
    caixas: list[tuple[int, int, int, int]] = []
    while pretos:
        inicial = pretos.pop()
        pilha = [inicial]
        pontos = [inicial]
        while pilha:
            x, y = pilha.pop()
            for vizinho in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                if vizinho in pretos:
                    pretos.remove(vizinho)
                    pilha.append(vizinho)
                    pontos.append(vizinho)
        xs = [p[0] for p in pontos]
        ys = [p[1] for p in pontos]
        largura_componente = max(xs) - min(xs) + 1
        altura_componente = max(ys) - min(ys) + 1
        if (min(xs) < largura * .10
                and largura * .014 < largura_componente < largura * .07
                and altura * .018 < altura_componente < altura * .045):
            caixas.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
    return sorted(caixas, key=lambda caixa: caixa[1])


def ocr_numero(imagem: Image.Image) -> int | None:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temporario:
        caminho = Path(temporario.name)
    imagem.save(caminho)
    try:
        resultado = subprocess.run([
            str(TESSERACT), str(caminho), "stdout", "--tessdata-dir", str(TESSDATA),
            "-l", "por", "--psm", "10", "-c", "tessedit_char_whitelist=0123456789",
        ], capture_output=True, text=True, encoding="utf-8", errors="replace", check=True)
    finally:
        caminho.unlink(missing_ok=True)
    achado = re.search(r"\d{1,2}", resultado.stdout)
    return int(achado.group()) if achado else None


def ocr_tsv(imagem: Image.Image) -> tuple[str, list[dict]]:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temporario:
        caminho = Path(temporario.name)
    imagem.save(caminho)
    try:
        resultado = subprocess.run([
            str(TESSERACT), str(caminho), "stdout", "--tessdata-dir", str(TESSDATA),
            "-l", "por", "--psm", "6", "tsv",
        ], capture_output=True, text=True, encoding="utf-8", errors="replace", check=True)
    finally:
        caminho.unlink(missing_ok=True)
    linhas = list(csv.DictReader(io.StringIO(resultado.stdout), delimiter="\t"))
    palavras = [l for l in linhas if l.get("text", "").strip()]
    agrupadas: dict[tuple[str, str, str, str], list[str]] = {}
    for palavra in palavras:
        chave = tuple(palavra[c] for c in ("block_num", "par_num", "line_num", "top"))
        agrupadas.setdefault(chave, []).append(palavra["text"])
    texto = "\n".join(" ".join(partes) for partes in agrupadas.values())
    return limpar(texto), palavras


def letra_marcador(token: str) -> str | None:
    token = token.strip()
    if not token or token[0] not in "[(I|":
        return None
    achado = re.search(r"[A-E]", token[:4].upper())
    return achado.group(0) if achado else None


def extrair_escaneado(ano: int, dia: int, gabarito: list[str]) -> list[dict]:
    arquivo = FONTES / str(ano) / f"prova-dia{dia}.pdf"
    total = 44 if dia == 1 else 56
    pdf = pdfium.PdfDocument(arquivo)
    paginas: dict[int, Image.Image] = {}
    marcadores: list[tuple[int, int]] = []
    for pagina_indice in range(1, len(pdf)):
        pagina = pdf[pagina_indice]
        imagem = pagina.render(scale=1.8, grayscale=False).to_pil()
        paginas[pagina_indice] = imagem
        candidatos = detectar_caixas(imagem)
        marcadores.extend((pagina_indice, caixa[1]) for caixa in candidatos)
    if len(marcadores) != total:
        raise ValueError(f"Foram detectadas {len(marcadores)}/{total} questões em {ano}, dia {dia}")

    recortes: list[tuple[int, Image.Image]] = []
    for indice, (pagina_indice, topo) in enumerate(marcadores):
        proximo = marcadores[indice + 1] if indice + 1 < len(marcadores) else None
        partes = []
        primeira_pagina = paginas[pagina_indice]
        x0, x1 = int(primeira_pagina.width * .06), int(primeira_pagina.width * .94)
        if proximo and proximo[0] == pagina_indice:
            partes.append(primeira_pagina.crop((x0, max(0, topo - 5), x1, proximo[1] - 5)))
        else:
            partes.append(primeira_pagina.crop((x0, max(0, topo - 5), x1, int(primeira_pagina.height * .985))))
            if proximo:
                for intermediaria in range(pagina_indice + 1, proximo[0]):
                    imagem_intermediaria = paginas[intermediaria]
                    partes.append(imagem_intermediaria.crop((int(imagem_intermediaria.width*.06), int(imagem_intermediaria.height*.04), int(imagem_intermediaria.width*.94), int(imagem_intermediaria.height*.985))))
                imagem_final = paginas[proximo[0]]
                partes.append(imagem_final.crop((int(imagem_final.width*.06), int(imagem_final.height*.04), int(imagem_final.width*.94), proximo[1]-5)))
        largura = max(parte.width for parte in partes)
        composta = Image.new("RGB", (largura, sum(parte.height for parte in partes)), "white")
        y = 0
        for parte in partes:
            composta.paste(parte, (0, y))
            y += parte.height
        recortes.append((pagina_indice, composta))

    questoes = []
    for numero, (pagina_indice, imagem) in enumerate(recortes, 1):
        texto, palavras = ocr_tsv(imagem)
        marcadores = []
        cursor = 0
        for palavra in palavras:
            letra = letra_marcador(palavra["text"])
            if letra == chr(65 + cursor):
                marcadores.append(palavra)
                cursor += 1
                if cursor == 5:
                    break
        if len(marcadores) != 5:
            enunciado = texto if len(texto) >= 12 else f"Questão {numero} da prova EsPCEx {ano}, conforme o recorte original."
            opcoes = [f"Alternativa {letra} — consulte o recorte original." for letra in "ABCDE"]
            caminho = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}.webp"
            salvar_webp(imagem, caminho)
            item = criar_item(ano, dia, numero, gabarito[numero - 1], enunciado, opcoes, pagina_indice + 1)
            item["imagem_original"] = url_imagem(caminho)
            item["texto_extraido_corrompido"] = True
            questoes.append(item)
            continue
        primeira = marcadores[0]
        topo_a = max(1, int(primeira["top"]) - 5)
        texto_antes = texto.split(primeira["text"], 1)[0]
        enunciado = limpar(re.sub(r"^\s*\d{1,2}\s*", "", texto_antes))
        if len(enunciado) < 12:
            enunciado = f"Questão {numero} da prova EsPCEx {ano}, conforme o recorte original."

        stem = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}.webp"
        salvar_webp(imagem.crop((0, 0, imagem.width, topo_a)), stem)
        opcoes_imagens = []
        ys = [int(m["top"]) for m in marcadores]
        xs = [int(m["left"]) for m in marcadores]
        mesma_linha = max(ys) - min(ys) < 24
        layout_separavel = (mesma_linha and all(xs[i] < xs[i+1] for i in range(4))) or (not mesma_linha and all(ys[i] < ys[i+1] for i in range(4)))
        if not layout_separavel:
            caminho = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}.webp"
            salvar_webp(imagem, caminho)
            opcoes = [f"Alternativa {letra} — consulte o recorte original." for letra in "ABCDE"]
            item = criar_item(ano, dia, numero, gabarito[numero - 1], enunciado, opcoes, pagina_indice + 1)
            item["imagem_original"] = url_imagem(caminho)
            item["texto_extraido_corrompido"] = True
            questoes.append(item)
            continue
        for i, marcador in enumerate(marcadores):
            if mesma_linha:
                esquerda = max(0, int(marcador["left"]) - 4)
                direita = int(marcadores[i + 1]["left"]) - 4 if i < 4 else imagem.width
                box = (esquerda, max(0, min(ys) - 5), direita, min(imagem.height, max(ys) + int(marcador["height"]) + 8))
            else:
                topo = max(0, int(marcador["top"]) - 5)
                fundo = int(marcadores[i + 1]["top"]) - 5 if i < 4 else imagem.height
                box = (max(0, int(marcador["left"]) - 5), topo, imagem.width, fundo)
            caminho = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}-{chr(97+i)}.webp"
            salvar_webp(imagem.crop(box), caminho, 80)
            opcoes_imagens.append(url_imagem(caminho))
        opcoes = [f"Alternativa {letra} — consulte o recorte original." for letra in "ABCDE"]
        item = criar_item(ano, dia, numero, gabarito[numero - 1], enunciado, opcoes, pagina_indice + 1)
        item["imagem_original"] = url_imagem(stem)
        item["opcoes_imagens"] = opcoes_imagens
        item["texto_extraido_corrompido"] = True
        item["opcoes_texto_corrompido"] = [True] * 5
        if numero == 1 and pagina_indice > 1:
            apoios = []
            for anterior in range(1, pagina_indice):
                imagem_anterior = paginas[anterior]
                recorte_apoio = imagem_anterior.crop((int(imagem_anterior.width*.06), int(imagem_anterior.height*.04), int(imagem_anterior.width*.94), int(imagem_anterior.height*.94)))
                caminho_apoio = IMAGENS / str(ano) / f"d{dia}-apoio-p{anterior+1}.webp"
                salvar_webp(recorte_apoio, caminho_apoio)
                apoios.append({"imagem": url_imagem(caminho_apoio), "texto": f"Texto de apoio da página {anterior+1}"})
            item["apoio"] = apoios
        questoes.append(item)
    return questoes


def extrair_2026(ano: int, dia: int, gabarito: list[str]) -> list[dict]:
    arquivo = FONTES / str(ano) / f"prova-dia{dia}.pdf"
    total = 44 if dia == 1 else 56
    questoes = []
    with pdfplumber.open(arquivo) as pdf:
        render = pdfium.PdfDocument(arquivo)
        marcadores = []
        for pagina_indice, pagina in enumerate(pdf.pages[1:], 1):
            palavras = pagina.extract_words()
            for i, palavra in enumerate(palavras[:-1]):
                if palavra["text"].upper().startswith("QUEST") and re.fullmatch(r"\d{1,2}", palavras[i+1]["text"]):
                    numero = int(palavras[i+1]["text"])
                    marcadores.append((numero, pagina_indice, palavra["x0"], palavra["top"]))
        por_numero = {m[0]: m for m in marcadores}
        if sorted(por_numero) != list(range(1, total + 1)):
            raise ValueError(f"Marcadores 2026 incompletos, dia {dia}")
        for numero in range(1, total + 1):
            _, pagina_indice, x, topo = por_numero[numero]
            pagina = pdf.pages[pagina_indice]
            esquerda = 28 if x < pagina.width / 2 else pagina.width / 2 + 8
            direita = pagina.width / 2 - 8 if x < pagina.width / 2 else pagina.width - 28
            proximos = [m for m in marcadores if m[1] == pagina_indice and (m[2] < pagina.width/2) == (x < pagina.width/2) and m[3] > topo]
            fundo = min((m[3] for m in proximos), default=pagina.height - 35) - 3
            texto = pagina.crop((esquerda, topo - 3, direita, fundo)).extract_text(x_tolerance=2, y_tolerance=3) or ""
            texto = re.sub(r"(?i)^QUEST(?:Ã|A)O\s+\d+\s*", "", texto)
            enunciado, opcoes = dividir_alternativas(texto)
            if len(opcoes) != 5:
                raise ValueError(f"Alternativas 2026 inválidas, dia {dia}, questão {numero}")
            enunciado_invalido = len(limpar(enunciado)) < 12 or texto_corrompido(enunciado)
            opcoes_validas = opcoes_publicaveis(opcoes)
            if enunciado_invalido:
                enunciado = f"Questão {numero} da prova EsPCEx {ano}, conforme o recorte original."
            if not opcoes_validas:
                opcoes = opcoes_por_imagem()
            item = criar_item(ano, dia, numero, gabarito[numero-1], enunciado, opcoes, pagina_indice + 1)
            escala = 2.0
            imagem_pagina = render[pagina_indice].render(scale=escala).to_pil()
            box = (int(esquerda * escala), int(max(30, topo - 3) * escala), int(direita * escala), int(fundo * escala))
            caminho = IMAGENS / str(ano) / f"d{dia}-q{numero:02d}.webp"
            salvar_webp(imagem_pagina.crop(box), caminho)
            item["imagem_original"] = url_imagem(caminho)
            if enunciado_invalido or not opcoes_validas:
                item["texto_extraido_corrompido"] = True
            questoes.append(item)
    return questoes


def criar_item(ano: int, dia: int, numero: int, resposta: str, enunciado: str, opcoes: list[str], pagina: int) -> dict:
    anulada = resposta == "ANULADA"
    return {
        "id": f"espcex-{ano}-d{dia}-{numero:02d}",
        "ano": ano,
        "numero_original": numero,
        "modelo": "A" if dia == 1 else "D" if ano < 2026 else "Versão 1",
        "dia": dia,
        "materia": materia(numero, dia),
        "conteudo": materia(numero, dia),
        "banca": "EsPCEx",
        "concurso": f"Concurso de Admissão EsPCEx {ano}",
        "dificuldade": "Média",
        "dificuldade_estimada": True,
        "enunciado": limpar(enunciado),
        "opcoes": [limpar(o) for o in opcoes],
        "resposta_correta": None if anulada else ord(resposta) - 65,
        "anulada": anulada,
        "pagina": pagina,
        "origem": f"EsPCEx — {ano} — {dia}º dia",
        "fonte": "https://www.vunesp.com.br/EPCE2601" if ano == 2026 else "https://espcex.eb.mil.br/index.php/provas-anteriores/64-concurso",
    }


def validar(questoes: list[dict]) -> None:
    if len(questoes) != 1000:
        raise ValueError(f"Quantidade inesperada: {len(questoes)}/1000")
    ids = [q["id"] for q in questoes]
    if len(ids) != len(set(ids)):
        raise ValueError("Identificadores duplicados")
    for q in questoes:
        if len(q["enunciado"]) < 12 or len(q["opcoes"]) != 5:
            raise ValueError(f"Questão estruturalmente inválida: {q['id']}")
        if not opcoes_publicaveis(q["opcoes"]):
            raise ValueError(f"Alternativas não publicáveis: {q['id']}")
        if texto_corrompido(q["enunciado"]) and not q.get("imagem_original"):
            raise ValueError(f"Enunciado ilegível sem recorte: {q['id']}")
        if PADRAO_REFERENCIA_APOIO.search(q["enunciado"]) and not (q.get("imagem_original") or q.get("apoio")):
            raise ValueError(f"Texto de apoio ausente: {q['id']}")
        if not q["anulada"] and q["resposta_correta"] not in range(5):
            raise ValueError(f"Resposta inválida: {q['id']}")


def main() -> None:
    if not TESSERACT.exists():
        raise FileNotFoundError("Tesseract OCR não encontrado")
    questoes = []
    for ano in range(2017, 2027):
        for dia, total in ((1, 44), (2, 56)):
            gabarito = extrair_gabarito(FONTES / str(ano) / f"gabarito-dia{dia}.pdf", total)
            if ano in ANOS_DIGITAIS:
                lote = extrair_digital(ano, dia, gabarito)
            elif ano in {2023, 2024}:
                lote = extrair_escaneado(ano, dia, gabarito)
            else:
                lote = extrair_2026(ano, dia, gabarito)
            questoes.extend(lote)
            print(f"{ano} dia {dia}: {len(lote)} questões", flush=True)
    validar(questoes)
    DESTINO.mkdir(parents=True, exist_ok=True)
    (DESTINO / "questoes.json").write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(questoes)} questões geradas", flush=True)


if __name__ == "__main__":
    main()
