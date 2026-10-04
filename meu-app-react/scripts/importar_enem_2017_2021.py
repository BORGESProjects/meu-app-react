"""Baixa e normaliza as edições regulares do ENEM de 2017 a 2021.

Fonte estruturada: API ENEM (enem.dev), projeto público GPL-2.0 baseado nos
cadernos e gabaritos oficiais do Inep. As imagens permanecem na CDN da fonte
para não aumentar o repositório em centenas de megabytes.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DESTINO = ROOT / "public/acervo/enem-2017-2021/questoes.json"
CACHE = ROOT / "tmp/enem-2017-2021"
COMPLEMENTOS = Path(__file__).with_name("enem_questoes_ausentes.json")
ANOS = range(2017, 2022)
BASE = "https://api.enem.dev/v1/exams/{ano}/questions"

MATERIAS = {
    "linguagens": "Linguagens",
    "ciencias-humanas": "Ciências Humanas",
    "human-sciences": "Ciências Humanas",
    "ciencias-natureza": "Ciências da Natureza",
    "natural-sciences": "Ciências da Natureza",
    "matematica": "Matemática",
    "mathematics": "Matemática",
}
IDIOMAS = {"ingles": "Inglês", "english": "Inglês", "espanhol": "Espanhol", "spanish": "Espanhol"}


def obter_json(url: str) -> dict:
    requisicao = urllib.request.Request(url, headers={"User-Agent": "AP-Aprovado/1.0"})
    with urllib.request.urlopen(requisicao, timeout=60) as resposta:
        return json.loads(resposta.read().decode("utf-8"))


def baixar_ano(ano: int) -> list[dict]:
    CACHE.mkdir(parents=True, exist_ok=True)
    arquivo = CACHE / f"enem-{ano}.json"
    if arquivo.exists():
        existentes = json.loads(arquivo.read_text(encoding="utf-8"))
        if existentes:
            return existentes

    questoes: list[dict] = []
    deslocamento = 0
    while True:
        consulta = urllib.parse.urlencode({"limit": 50, "offset": deslocamento, "language": "espanhol"})
        pagina = obter_json(f"{BASE.format(ano=ano)}?{consulta}")
        lote = pagina.get("questions") or []
        questoes.extend(lote)
        metadados = pagina.get("metadata") or {}
        if not metadados.get("hasMore"):
            break
        deslocamento += len(lote)
        if not lote:
            raise RuntimeError(f"Paginação interrompida no ENEM {ano}.")
        time.sleep(0.15)

    # A paginação usa o número da questão como deslocamento e repete o item da
    # fronteira. Também retorna apenas uma língua estrangeira por consulta.
    unicas = {}
    for item in questoes:
        unicas[(item["index"], item.get("language"))] = item
    consulta_ingles = urllib.parse.urlencode({"limit": 5, "language": "ingles"})
    ingles = obter_json(f"{BASE.format(ano=ano)}?{consulta_ingles}").get("questions") or []
    for item in ingles:
        if item.get("language") == "ingles":
            unicas[(item["index"], item.get("language"))] = item
    questoes = list(unicas.values())

    arquivo.write_text(json.dumps(questoes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return questoes


def url_imagem(valor) -> str | None:
    if isinstance(valor, str):
        return valor or None
    if isinstance(valor, dict):
        return valor.get("url") or valor.get("file") or valor.get("src")
    return None


def normalizar(raw: dict, ano: int) -> dict:
    numero = int(raw["index"])
    idioma_raw = raw.get("language")
    # O registro 5 de 2020 é a quinta questão de espanhol, embora a fonte não
    # traga o rótulo de idioma nesse item.
    if ano == 2020 and numero == 5 and not idioma_raw:
        idioma_raw = "espanhol"
    idioma = IDIOMAS.get(str(idioma_raw or "").lower(), "")
    sufixo_idioma = {"Inglês": "-en", "Espanhol": "-es"}.get(idioma, "")
    disciplina = str(raw.get("discipline") or "").lower()
    materia = idioma or MATERIAS.get(disciplina, raw.get("discipline") or "Conhecimentos Gerais")
    alternativas = list(raw.get("alternatives") or [])
    # Dois registros de 2021 foram publicados pela API com a alternativa E
    # ausente. Os complementos abaixo foram conferidos no caderno oficial.
    if ano == 2021 and numero == 105 and len(alternativas) == 4:
        alternativas.append({
            "letter": "E",
            "text": "A carga positiva recebe força para cima e a carga negativa recebe força para baixo.",
            "file": None,
        })
    if ano == 2021 and numero == 175 and len(alternativas) == 4:
        alternativas[-1]["text"] = "8 trapézios isósceles e 12 quadrados."
        alternativas.append({
            "letter": "E",
            "text": "12 trapézios escalenos e 12 quadrados.",
            "file": None,
        })
    letras = [str(item.get("letter") or "").upper() for item in alternativas]
    if letras != list("ABCDE"):
        raise ValueError(f"ENEM {ano}, questão {numero}: alternativas inválidas: {letras}")

    introducao = str(raw.get("alternativesIntroduction") or "").strip()
    contexto = str(raw.get("context") or "").strip()
    contexto = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", contexto)
    contexto = contexto.replace("**", "")
    contexto = re.sub(r"\n{3,}", "\n\n", contexto).strip()
    enunciado = "\n\n".join(parte for parte in (contexto, introducao) if parte)
    opcoes = [str(item.get("text") or f"Alternativa {item['letter']}").strip() for item in alternativas]
    opcoes_imagens = [url_imagem(item.get("file")) for item in alternativas]
    correta = str(raw.get("correctAlternative") or "").upper()
    anulada = correta not in "ABCDE"
    resposta = None if anulada else "ABCDE".index(correta)
    arquivos = [url_imagem(item) for item in (raw.get("files") or [])]
    arquivos = [item for item in arquivos if item]
    dia = 1 if numero <= 90 else 2

    questao = {
        "id": f"enem-{ano}-{numero:03d}{sufixo_idioma}",
        "ano": ano,
        "numero_original": numero,
        "modelo": "Aplicação regular",
        "dia": dia,
        "idioma": idioma,
        "materia": materia,
        "conteudo": "Interpretação de texto" if idioma else materia,
        "banca": "ENEM",
        "concurso": f"ENEM {ano} — {dia}º dia" + (f" — {idioma}" if idioma else ""),
        "dificuldade": "Média",
        "dificuldade_estimada": True,
        "enunciado": enunciado,
        "opcoes": opcoes,
        "resposta_correta": resposta,
        "anulada": anulada,
        "apoio": [{"imagem": imagem, "texto": enunciado[:240]} for imagem in arquivos],
        "origem": f"Inep — ENEM {ano}, aplicação regular; dados estruturados por enem.dev",
        "fonte_dados": "https://enem.dev",
    }
    if any(opcoes_imagens):
        questao["opcoes_imagens"] = opcoes_imagens
    return questao


def main() -> None:
    todas: list[dict] = []
    resumo = {}
    complementos = json.loads(COMPLEMENTOS.read_text(encoding="utf-8"))
    for ano in ANOS:
        brutas = baixar_ano(ano)
        normalizadas = [normalizar(item, ano) for item in brutas]
        normalizadas.extend(item for item in complementos if item["ano"] == ano)
        ids = [item["id"] for item in normalizadas]
        if len(normalizadas) != 185 or len(set(ids)) != 185:
            raise RuntimeError(f"ENEM {ano}: esperadas 185 questões únicas, recebidas {len(set(ids))}.")
        sem_enunciado = sum(not item["enunciado"] for item in normalizadas)
        sem_gabarito = sum(item["anulada"] for item in normalizadas)
        if sem_enunciado:
            raise RuntimeError(f"ENEM {ano}: {sem_enunciado} questões sem enunciado.")
        resumo[ano] = {"questoes": len(normalizadas), "anuladas_ou_sem_gabarito": sem_gabarito}
        todas.extend(normalizadas)

    if len(todas) != 925 or len({item["id"] for item in todas}) != 925:
        raise RuntimeError("O lote final não contém 925 questões únicas.")
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    DESTINO.write_text(json.dumps(todas, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"total": len(todas), "anos": resumo, "arquivo": str(DESTINO)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
