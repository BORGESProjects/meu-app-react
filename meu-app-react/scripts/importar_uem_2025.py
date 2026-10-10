import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "tmp" / "pdfs" / "uem-2025" / "prova.pdf"
DESTINO = ROOT / "public" / "acervo" / "uem-2025" / "questoes.json"

GABARITO = {1: 27, 2: 7, 3: 30, 4: 21, 5: 31, 6: 23, 7: 15, 8: 20, 9: 20, 10: 17}
CONTEUDOS = {
    1: "Interpretação de textos", 2: "Interpretação de textos", 3: "Variação linguística",
    4: "Interpretação de textos", 5: "Interpretação de textos", 6: "Semântica e estilística",
    7: "Interpretação de textos", 8: "Literatura brasileira", 9: "Poesia brasileira",
    10: "Literatura brasileira",
}


def coluna(page, lado):
    metade = page.width / 2
    caixa = (0, 0, metade, page.height) if lado == "E" else (metade, 0, page.width, page.height)
    return page.crop(caixa).extract_text(x_tolerance=2, y_tolerance=3) or ""


def limpar(texto):
    texto = re.sub(r"\n(?:\d+\s+)?UEM/CVU\s*[–-]\s*Vestibular de Verão 2025(?:\s+\d+)?\nCaderno de Prova\s*$", "", texto.strip())
    texto = re.sub(r"(?<=\w)-\n(?=\w)", "", texto)
    texto = re.sub(r"[ \t]+", " ", texto)
    texto = re.sub(r" *\n *", "\n", texto)
    return texto.strip()


def bloco(texto, numero, proximo=None):
    inicio = re.search(rf"Questão {numero:02d}\s+—+", texto)
    if not inicio:
        raise ValueError(f"Questão {numero:02d} não encontrada")
    fim = re.search(rf"Questão {proximo:02d}\s+—+", texto[inicio.end():]) if proximo else None
    trecho = texto[inicio.end(): inicio.end() + fim.start()] if fim else texto[inicio.end():]
    return limpar(trecho)


def dividir(trecho):
    marcadores = list(re.finditer(r"(?m)^(01|02|04|08|16)\)\s*", trecho))
    if [m.group(1) for m in marcadores] != ["01", "02", "04", "08", "16"]:
        raise ValueError("As cinco afirmações não foram identificadas na ordem oficial")
    enunciado = limpar(trecho[:marcadores[0].start()])
    opcoes = []
    for indice, marcador in enumerate(marcadores):
        fim = marcadores[indice + 1].start() if indice + 1 < len(marcadores) else len(trecho)
        opcoes.append(limpar(trecho[marcador.end():fim]))
    return enunciado, opcoes


def prefixo_antes(texto, numero):
    return limpar(texto[:re.search(rf"Questão {numero:02d}\s+—+", texto).start()])


def apos(texto, padrao):
    encontrado = re.search(padrao, texto, re.I)
    if not encontrado:
        raise ValueError(f"Trecho de apoio não encontrado: {padrao}")
    return limpar(texto[encontrado.end():])


def main():
    with pdfplumber.open(PDF) as pdf:
        p6e, p6d = coluna(pdf.pages[5], "E"), coluna(pdf.pages[5], "D")
        p7e, p7d = coluna(pdf.pages[6], "E"), coluna(pdf.pages[6], "D")
        p8e, p8d = coluna(pdf.pages[7], "E"), coluna(pdf.pages[7], "D")
        p9e = coluna(pdf.pages[8], "E")

    texto1 = prefixo_antes(p6e, 1)
    texto1 = apos(texto1, r"Leia o texto a seguir para responder as questões de 01 a 03\.")
    inicio_texto2 = apos(p6d, r"Leia o texto a seguir para responder as questões de 04 a 06\.")
    inicio_texto2 = inicio_texto2.split("Questão 04", 1)[0]
    texto2 = limpar(inicio_texto2 + "\n" + p7e)

    fontes = {
        1: (p6e, None), 2: (p6d, 3), 3: (p6d, None),
        4: (p7d, 5), 5: (p7d, 6), 6: (p7d, None),
        7: (p8e, 8), 8: (p8e, None), 9: (p8d, None), 10: (p9e, None),
    }
    questoes = []
    for numero in range(1, 11):
        trecho = bloco(fontes[numero][0], numero, fontes[numero][1])
        if numero == 3:
            trecho = trecho.split("Leia o texto a seguir para responder as questões de 04 a 06.", 1)[0]
        enunciado, opcoes = dividir(trecho)
        apoio = texto1 if numero <= 3 else texto2 if numero <= 6 else f"{texto1}\n\n{texto2}" if numero == 7 else ""
        questoes.append({
            "id": f"uem-2025-{numero:02d}",
            "ano": 2025,
            "banca": "UEM",
            "concurso": "Vestibular de Verão UEM 2025",
            "numero_original": numero,
            "materia": "Língua Portuguesa" if numero <= 7 else "Literatura",
            "conteudo": CONTEUDOS[numero],
            "dificuldade": "Médio",
            "enunciado": enunciado,
            "texto_apoio": apoio,
            "opcoes": opcoes,
            "rotulos_opcoes": ["01", "02", "04", "08", "16"],
            "tipo_resposta": "somatoria",
            "valores_opcoes": [1, 2, 4, 8, 16],
            "resposta_soma": GABARITO[numero],
            "resposta_correta": GABARITO[numero],
            "fonte_pdf": "https://www.vestibular.uem.br/provas/ve25/P1.pdf",
            "fonte_gabarito": "https://www.vestibular.uem.br/provas/ve25/gabdef.pdf",
            "pagina": 6 + (numero >= 4) + (numero >= 7) + (numero >= 10),
        })

    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(questoes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(questoes)} questões gravadas em {DESTINO}")


if __name__ == "__main__":
    main()



