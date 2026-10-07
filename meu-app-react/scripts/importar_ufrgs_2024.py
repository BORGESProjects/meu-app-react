"""Extrai as provas do Vestibular UFRGS 2024 sem usar IA.

Os PDFs e o gabarito usados pelo script ficam em ``tmp/ufrgs-2025``. O
resultado publicado contém apenas itens que passaram pela validação estrutural:
enunciado, cinco alternativas textuais e resposta oficial.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
FONTES = ROOT / "tmp/ufrgs-2024"
DESTINO = ROOT / "public/acervo/ufrgs-2024/questoes.json"

GABARITO_DIA_1 = [
    *"ADEBBCBDEADDCCA",
    *"DACEACABDBADECD",
    *"BCDCDBBEEAECEDD",
    *"XDDCBBADECCAAEE",
]

GABARITO_DIA_2 = [
    *"BEDDCAAECBDCDBC",
    *"CACEBDCBDAEDABC",
    *"ECADEEDBAXDACBC",
    *"EACCDAACBEEDEBD",
    *"CADABCDBDCEDBCE",
]

# Questões cuja resolução depende de uma figura, gráfico ou fórmula que não é
# preservada corretamente pela extração textual ficam para um lote visual.
QUESTOES_VISUAIS = {
    (1, 40), (1, 50), (1, 51), (1, 52), (1, 54), (1, 55), (1, 56), (1, 57), (1, 58),
    (2, 17), (2, 18), (2, 20), (2, 21), (2, 24), (2, 25), (2, 26),
    (2, 35), (2, 39), (2, 52), (2, 55), (2, 56), (2, 59), (2, 66),
}


def limpar(texto: str) -> str:
    texto = texto.replace("\u00ad", "").replace("�", "")
    texto = re.sub(r"(?<=\w)-\s+(?=\w)", "", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip(" \n\t–-")


def paginas(arquivo: Path, primeira: int) -> list[str]:
    resultado = []
    for pagina in PdfReader(arquivo).pages[primeira - 1 :]:
        texto = pagina.extract_text() or ""
        texto = re.sub(r"(?m)^\s*UFRGS\s*[–-]\s*CV/2024.*$", "", texto)
        texto = re.sub(r"(?m)^\s*\d+\s*$", "", texto)
        texto = re.sub(r"(?m)^\s*[Qq]\s*\n\s*uais\b", "Quais", texto)
        texto = re.sub(r"(?m)^\s*\(\s*\n\s*([A-E])\)", r"(\1)", texto)
        texto = re.sub(r"(?m)^\s*0\s*\n\s*1\.\s*", "01. ", texto)
        resultado.append(texto)
    return resultado


def localizar_questoes(texto: str, total: int) -> list[tuple[int, int, int]]:
    posicoes = []
    cursor = 0
    for numero in range(1, total + 1):
        rotulo = rf"0?{numero}" if numero < 10 else str(numero)
        padrao = re.compile(rf"(?m)^\s*{rotulo}\.\s+(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])")
        achado = padrao.search(texto, cursor)
        if not achado:
            raise ValueError(f"Questão {numero:02d} não localizada")
        posicoes.append((numero, achado.start(), achado.end()))
        cursor = achado.end()
    return posicoes


def materia(numero: int, dia: int) -> str:
    if dia == 1:
        return (
            "Língua Portuguesa" if numero <= 15 else
            "Literatura" if numero <= 30 else
            "História" if numero <= 45 else "Matemática"
        )
    return (
        "Língua Inglesa" if numero <= 15 else
        "Física" if numero <= 30 else
        "Química" if numero <= 45 else
        "Geografia" if numero <= 60 else "Biologia"
    )


def extrair_dia(arquivo: Path, dia: int, total: int, gabarito: list[str]) -> list[dict]:
    por_pagina = paginas(arquivo, 3 if dia == 1 else 2)
    texto = "\n\f\n".join(por_pagina)
    posicoes = localizar_questoes(texto, total)
    posicao_por_numero = {numero: inicio for numero, inicio, _ in posicoes}
    apoios: dict[int, str] = {}
    for instrucao in re.finditer(r"(?i)Instrução:\s*", texto):
        cabecalho = limpar(texto[instrucao.start(): instrucao.start() + 260])
        faixa = re.search(r"questões?(?:\s+de)?\s+(\d{1,2})\s+(?:a|e)\s+(\d{1,2})", cabecalho, re.I)
        unica = re.search(r"questão\s+(\d{1,2})", cabecalho, re.I)
        if faixa:
            primeiro, ultimo = map(int, faixa.groups())
        elif unica:
            primeiro = ultimo = int(unica.group(1))
        else:
            continue
        inicio_questao = posicao_por_numero.get(primeiro)
        if inicio_questao and instrucao.start() < inicio_questao:
            apoio = limpar(texto[instrucao.start():inicio_questao])
            if len(apoio) > 30:
                for numero in range(primeiro, ultimo + 1):
                    apoios[numero] = apoio
    questoes = []
    for indice, (numero, _inicio, fim_marcador) in enumerate(posicoes):
        if (dia, numero) in QUESTOES_VISUAIS:
            continue
        fim = posicoes[indice + 1][1] if indice + 1 < len(posicoes) else len(texto)
        bloco = texto[fim_marcador:fim]
        # Cabeçalhos de uma nova matéria ou instruções pertencem à próxima
        # questão; removê-los da última alternativa evita contaminar o item.
        bloco = re.split(r"\n\s*(?:Instrução:|(?:LITERATURA|HISTÓRIA|GEOGRAFIA|MATEMÁTICA|FÍSICA|QUÍMICA|BIOLOGIA)\b)", bloco)[0]
        marcadores = list(re.finditer(r"(?m)^\s*\(([A-E])\)\s*", bloco))
        if [m.group(1) for m in marcadores[:5]] != list("ABCDE"):
            continue
        enunciado = limpar(bloco[: marcadores[0].start()])
        opcoes = []
        for i, marcador in enumerate(marcadores[:5]):
            limite = marcadores[i + 1].start() if i < 4 else len(bloco)
            opcao = bloco[marcador.end():limite]
            if i == 4:
                opcao = opcao.split("\f", 1)[0]
                opcao = re.split(r"(?m)^\s*\d{2}\.\s*$", opcao, maxsplit=1)[0]
            opcoes.append(limpar(opcao))
        # Itens cuja resposta depende integralmente de figura não são úteis sem
        # o recorte visual; ficam fora deste lote até o importador de imagens.
        if not enunciado or any(len(opcao) < 2 for opcao in opcoes):
            continue
        if any("[elemento gráfico]" in opcao for opcao in opcoes):
            continue
        questoes.append({
            "id": f"ufrgs-2024-d{dia}-{numero:02d}",
            "ano": 2024,
            "numero_original": numero,
            "modelo": f"{dia}º dia",
            "materia": materia(numero, dia),
            "conteudo": materia(numero, dia),
            "banca": "UFRGS",
            "concurso": "Vestibular UFRGS 2024",
            "dificuldade": "Média",
            "dificuldade_estimada": True,
            "enunciado": enunciado,
            "opcoes": opcoes,
            "apoio": [{"texto": apoios[numero]}] if numero in apoios else [],
            "origem": f"UFRGS - Vestibular 2024 - {dia}º dia",
            "fonte_dados": "https://www.ufrgs.br/vestibular/cv2024/gabaritos/",
            "resposta_correta": 0 if gabarito[numero - 1] == "X" else ord(gabarito[numero - 1]) - ord("A"),
            "anulada": gabarito[numero - 1] == "X",
        })
    return questoes


def main() -> None:
    if len(GABARITO_DIA_1) != 60 or len(GABARITO_DIA_2) != 75:
        raise ValueError(f"Gabaritos inválidos: {len(GABARITO_DIA_1)} e {len(GABARITO_DIA_2)}")
    questoes = [
        *extrair_dia(FONTES / "prova-dia1.pdf", 1, 60, GABARITO_DIA_1),
        *extrair_dia(FONTES / "prova-dia2.pdf", 2, 75, GABARITO_DIA_2),
    ]
    ids = [q["id"] for q in questoes]
    if len(ids) != len(set(ids)):
        raise ValueError("Há identificadores duplicados")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(questoes)} questões textuais válidas geradas")
    print(json.dumps({f"dia-{d}": sum(q["modelo"] == f"{d}º dia" for q in questoes) for d in (1, 2)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
