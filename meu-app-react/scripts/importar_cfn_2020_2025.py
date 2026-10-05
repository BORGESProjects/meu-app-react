"""Gera o lote C-FSD-FN 2020-2025 a partir do arquivo oficial da Marinha.

Os pacotes oficiais misturam ODT/ODG com extensão .ods e PDF. Este importador
lê ambos sem IA, escolhe o mesmo código de prova do caderno distribuído no
pacote e cruza cada item com a coluna correspondente do gabarito.
"""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
FONTES = ROOT / "tmp/fontes-cfn"
DESTINO = ROOT / "public/acervo/cfn-2020-2025/questoes.json"

# código do caderno presente em cada pacote e posição de sua coluna no gabarito
CONFIG = {
    2020: ("88", 3),
    2021: ("11", 0),
    2022: ("11", 0),
    2023: ("14", 0),
    2024: ("55", 0),
    2025: ("11", 0),
}


def paragrafos_ocr_2019() -> list[str]:
    paginas = ROOT / "tmp/fontes-cfn/2019-layout"
    resultado = []
    for arquivo in sorted(paginas.glob("pagina-*.json")):
        linhas = json.loads(arquivo.read_text(encoding="utf-8-sig"))
        linhas = [item for item in linhas if isinstance(item.get("x"), (int, float)) and item.get("y", 0) >= 180]
        linhas.sort(key=lambda item: (item["x"] >= 826, item["y"], item["x"]))
        resultado.extend(item["text"].strip() for item in linhas if item.get("text", "").strip())
    return resultado


def paragrafos(arquivo: Path) -> list[str]:
    if arquivo.suffix.lower() == ".pdf":
        return [
            linha.strip()
            for pagina in PdfReader(arquivo).pages
            for linha in (pagina.extract_text() or "").splitlines()
            if linha.strip()
        ]
    with zipfile.ZipFile(arquivo) as pacote:
        raiz = ET.fromstring(pacote.read("content.xml"))
        formulas = {}

        def formula(referencia: str) -> str:
            chave = referencia.removeprefix("./").rstrip("/")
            if chave in formulas:
                return formulas[chave]
            try:
                objeto = ET.fromstring(pacote.read(f"{chave}/content.xml"))
                anotacao = next(("".join(e.itertext()) for e in objeto.iter() if e.tag.endswith("}annotation")), "")
                valor = anotacao or "".join(objeto.itertext())
                valor = re.sub(r"\b(?:left|right)\s*", "", valor)
                valor = valor.replace(" cdot ", " · ").replace(" times ", " × ").replace(" over ", "/")
                valor = limpar(valor)
            except KeyError:
                valor = "[elemento gráfico]"
            formulas[chave] = valor
            return valor

        def texto_elemento(elemento) -> str:
            partes = [elemento.text or ""]
            for filho in elemento:
                if filho.tag.endswith("}object"):
                    href = next((v for k, v in filho.attrib.items() if k.endswith("}href")), "")
                    partes.append(formula(href))
                elif filho.tag.endswith("}image") or filho.tag.endswith("}desc"):
                    pass
                else:
                    partes.append(texto_elemento(filho))
                partes.append(filho.tail or "")
            return "".join(partes)

        resultado = []
        for elemento in raiz.iter():
            if elemento.tag.endswith("}p") or elemento.tag.endswith("}h"):
                texto = texto_elemento(elemento).strip()
                if texto:
                    resultado.append(texto)
    return resultado


def arquivo_do_ano(ano: int, gabarito: bool) -> Path:
    arquivos = [p for p in (FONTES / str(ano)).rglob("*") if p.is_file()]
    candidatos = [p for p in arquivos if ("gabarito" in p.name.lower()) == gabarito]
    if len(candidatos) != 1:
        raise RuntimeError(f"CFN {ano}: arquivo {'de gabarito' if gabarito else 'de prova'} ambíguo: {candidatos}")
    return candidatos[0]


def posicoes_questoes(paras: list[str]) -> list[int]:
    posicoes = []
    inicio = 0
    for numero in range(1, 51):
        padrao = re.compile(rf"\(?0?{numero}\)?\s*[.)]\s*")
        achada = next((i for i in range(inicio, len(paras)) if padrao.match(paras[i])), None)
        if achada is None:
            for i in range(inicio, len(paras)):
                m = padrao.search(paras[i])
                if m and m.start():
                    # Fórmulas ancoradas podem preceder visualmente o número,
                    # mas aparecem antes dele no XML interno do documento.
                    paras[i] = f"{m.group(0).strip()} {paras[i][:m.start()].strip()} {paras[i][m.end():].strip()}"
                    achada = i
                    break
        if achada is None:
            raise RuntimeError(f"Questão {numero} não localizada após o parágrafo {inicio}.")
        posicoes.append(achada)
        inicio = achada + 1
    return posicoes


def limpar(texto: str) -> str:
    texto = texto.replace("\ufffd", "")
    texto = re.sub(r"\s+", " ", texto).strip()
    return texto


def extrair_questoes(ano: int, codigo: str) -> list[dict]:
    prova = arquivo_do_ano(ano, False)
    paras = paragrafos_ocr_2019() if ano == 2019 else paragrafos(prova)
    posicoes = posicoes_questoes(paras)
    questoes = []
    apoio_atual = ""

    # O trecho anterior à primeira questão contém o primeiro texto-base.
    prefixo = [p for p in paras[:posicoes[0]] if not re.fullmatch(r"\d+", p)]
    indices_titulo = [i for i, p in enumerate(prefixo) if re.match(r"^(?:LÍNGUA PORTUGUESA|TEXTO\s*\d*)", p, re.I)]
    if indices_titulo:
        apoio_atual = limpar("\n".join(prefixo[indices_titulo[-1]:]))

    for numero, inicio in enumerate(posicoes, 1):
        fim = posicoes[numero] if numero < 50 else len(paras)
        bloco = paras[inicio:fim]
        bloco[0] = re.sub(rf"^\(?0?{numero}\)?\s*[.)]\s*", "", bloco[0]).strip()
        # O LibreOffice às vezes grava uma fórmula ancorada imediatamente antes
        # da letra da alternativa que aparece visualmente à esquerda dela.
        i = 1
        while i < len(bloco):
            if i > 1 and re.fullmatch(r"\(?[A-E]\)?\s*[.)]", bloco[i]) and bloco[i - 1] and not re.match(r"^\(?[A-E]\)?\s*[.)]", bloco[i - 1]):
                bloco[i] = f"{bloco[i]} {bloco[i - 1]}"
                del bloco[i - 1]
            else:
                i += 1

        combinado = "\n".join(bloco)
        marcadores = []
        cursor = 0
        for letra_esperada in "ABCDE":
            prefixo = r"(?<!\w)" if letra_esperada == "A" else ""
            achado = re.search(prefixo + rf"\(?({letra_esperada})\)?\s*[.)]\s*", combinado[cursor:])
            if achado is None:
                break
            # Converte as posições relativas ao recorte em posições absolutas.
            achado = re.compile(achado.re.pattern).match(combinado, cursor + achado.start())
            marcadores.append(achado)
            cursor = achado.end()
        letras = [m.group(1) for m in marcadores]
        if letras != list("ABCDE"):
            raise RuntimeError(f"CFN {ano}, questão {numero}: alternativas encontradas {letras}")

        enunciado = limpar(combinado[:marcadores[0].start()])
        opcoes = []
        for indice, marcador in enumerate(marcadores):
            letra = marcador.group(1)
            limite = marcadores[indice + 1].start() if indice < 4 else len(combinado)
            partes = combinado[marcador.end():limite].splitlines()
            if letra == "E":
                corte = next((j for j, p in enumerate(partes) if re.match(r"^(?:TEXTO\s*\d+|LÍNGUA PORTUGUESA|MATEMÁTICA)\b", p, re.I)), None)
                if corte is not None:
                    novo_apoio = [p for p in partes[corte:] if not re.fullmatch(r"\d+", p)]
                    apoio_atual = limpar("\n".join(novo_apoio))
                    partes = partes[:corte]
            opcoes.append(limpar("\n".join(partes)))

        if not enunciado or any(not opcao for opcao in opcoes):
            raise RuntimeError(f"CFN {ano}, questão {numero}: texto incompleto")
        materia = "Língua Portuguesa" if numero <= 25 else "Matemática"
        questao = {
            "id": f"cfn-{ano}-{codigo}-{numero:02d}",
            "ano": ano,
            "numero_original": numero,
            "modelo": f"Código {codigo}",
            "materia": materia,
            "conteudo": materia,
            "banca": "CFN",
            "concurso": f"CFN {ano} — Soldado Fuzileiro Naval",
            "dificuldade": "Média",
            "dificuldade_estimada": True,
            "enunciado": enunciado,
            "opcoes": opcoes,
            "apoio": ([{"texto": apoio_atual}] if apoio_atual and numero <= 25 else []),
            "origem": f"Marinha do Brasil — C-FSD-FN {ano}, prova código {codigo}",
            "fonte_dados": "https://www.marinha.mil.br/cpesfn/provas-anteriores-c-fsd-fn",
        }
        questoes.append(questao)
    return questoes


def extrair_gabarito(ano: int, coluna: int) -> list[str]:
    texto = "\n".join(paragrafos(arquivo_do_ano(ano, True)))
    pares = re.findall(r"(?<!\d)([1-9]|[1-4]\d|50)\s+([A-E])\b", texto)
    # Os 200 primeiros pares são as quatro colunas das 50 questões.
    pares = pares[:200]
    if len(pares) != 200:
        raise RuntimeError(f"CFN {ano}: esperados 200 pares no gabarito, recebidos {len(pares)}")
    respostas = []
    for numero in range(1, 51):
        linha = pares[(numero - 1) * 4:numero * 4]
        if [int(n) for n, _ in linha] != [numero] * 4:
            raise RuntimeError(f"CFN {ano}: linha {numero} do gabarito inválida: {linha}")
        respostas.append(linha[coluna][1])
    return respostas


def main() -> None:
    todas = []
    resumo = {}
    for ano, (codigo, coluna) in CONFIG.items():
        questoes = extrair_questoes(ano, codigo)
        respostas = extrair_gabarito(ano, coluna)
        for questao, letra in zip(questoes, respostas):
            questao["resposta_correta"] = "ABCDE".index(letra)
            questao["anulada"] = False
        todas.extend(questoes)
        resumo[ano] = len(questoes)
    esperado = len(CONFIG) * 50
    if len(todas) != esperado or len({q["id"] for q in todas}) != esperado:
        raise RuntimeError(f"O lote CFN não contém {esperado} questões únicas.")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(todas, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"total": len(todas), "anos": resumo, "arquivo": str(DESTINO)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
