"""Restaura os apoios visuais das questões CFN colocadas em quarentena."""
from __future__ import annotations

import json
import zipfile
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ARQUIVO = ROOT / "public/acervo/cfn-2020-2025/questoes.json"
IMAGENS = ARQUIVO.parent / "imagens"
FONTES = ROOT / "tmp/fontes-cfn"
FONTE_NORMAL = Path(r"C:\Windows\Fonts\arial.ttf")
FONTE_NEGRITO = Path(r"C:\Windows\Fonts\arialbd.ttf")


def fonte(tamanho: int, negrito: bool = False):
    caminho = FONTE_NEGRITO if negrito else FONTE_NORMAL
    return ImageFont.truetype(str(caminho), tamanho)


def salvar(imagem: Image.Image, nome: str) -> str:
    IMAGENS.mkdir(parents=True, exist_ok=True)
    caminho = IMAGENS / nome
    imagem.convert("RGB").save(caminho, "WEBP", quality=88, method=6)
    return "/" + caminho.relative_to(ROOT / "public").as_posix()


def reta_numerica() -> Image.Image:
    imagem = Image.new("RGB", (900, 220), "white")
    desenho = ImageDraw.Draw(imagem)
    y = 115
    desenho.line((90, y, 820, y), fill="#111827", width=4)
    desenho.polygon([(820, y), (800, y - 10), (800, y + 10)], fill="#111827")
    for x, rotulo in zip((180, 360, 555, 730), ("0", "x", "y", "1")):
        desenho.line((x, y - 16, x, y + 16), fill="#111827", width=3)
        caixa = desenho.textbbox((0, 0), rotulo, font=fonte(42))
        desenho.text((x - (caixa[2] - caixa[0]) / 2, y + 28), rotulo, fill="#111827", font=fonte(42))
    return imagem


def retangulo() -> Image.Image:
    imagem = Image.new("RGB", (900, 390), "white")
    desenho = ImageDraw.Draw(imagem)
    desenho.rectangle((180, 70, 720, 310), outline="#111827", width=5)
    desenho.text((390, 15), "x + 5 m", fill="#111827", font=fonte(42, True))
    desenho.text((30, 165), "x − 2 m", fill="#111827", font=fonte(42, True))
    return imagem


def grafico_vendas() -> Image.Image:
    imagem = Image.new("RGB", (900, 560), "white")
    desenho = ImageDraw.Draw(imagem)
    origem_x, origem_y = 115, 390
    desenho.line((origem_x, 70, origem_x, 465), fill="#111827", width=4)
    desenho.line((70, origem_y, 840, origem_y), fill="#111827", width=4)
    for valor in (-10, 0, 10, 20, 30):
        y = origem_y - valor * 9
        desenho.line((origem_x - 8, y, 830, y), fill="#cbd5e1" if valor else "#111827", width=2)
        desenho.text((35, y - 15), f"{valor}%", fill="#111827", font=fonte(25))
    dados = [("A", -10), ("B", 20), ("C", 30), ("D", 15)]
    for indice, (rotulo, valor) in enumerate(dados):
        x = 190 + indice * 155
        y = origem_y - valor * 9
        topo, fundo = (y, origem_y) if valor >= 0 else (origem_y, y)
        desenho.rectangle((x, topo, x + 85, fundo), fill="#6366f1", outline="#312e81", width=2)
        desenho.text((x + 28, 430), rotulo, fill="#111827", font=fonte(32, True))
    desenho.text((245, 15), "Projeção de vendas", fill="#111827", font=fonte(40, True))
    return imagem


def figura_ods_2021() -> Image.Image:
    prova = next(p for p in (FONTES / "2021").rglob("*.ods") if "gabarito" not in p.name.lower())
    nome = "Pictures/1000000000000152000000D4B852B65E4AEBC1C5.jpg"
    with zipfile.ZipFile(prova) as pacote:
        from io import BytesIO
        return Image.open(BytesIO(pacote.read(nome))).convert("RGB")


def recorte_pdf(ano: int, caixa_relativa: tuple[float, float, float, float]) -> Image.Image:
    prova = next(p for p in (FONTES / str(ano)).rglob("*.pdf") if "gabarito" not in p.name.lower())
    documento = pdfium.PdfDocument(prova)
    pagina = documento[4].render(scale=2.1).to_pil().convert("RGB")
    largura, altura = pagina.size
    x0, y0, x1, y1 = caixa_relativa
    return pagina.crop((round(x0 * largura), round(y0 * altura), round(x1 * largura), round(y1 * altura)))


def main() -> None:
    questoes = json.loads(ARQUIVO.read_text(encoding="utf-8"))
    por_id = {q["id"]: q for q in questoes}

    reparos = {
        "cfn-2020-88-35": (reta_numerica(), "Reta numérica do caderno, com 0 < x < y < 1."),
        "cfn-2021-11-34": (figura_ods_2021(), "Escada apoiada em muro perpendicular ao solo."),
        "cfn-2021-11-46": (retangulo(), "Retângulo com lados x − 2 m e x + 5 m."),
        "cfn-2023-14-28": (grafico_vendas(), "Gráfico da projeção de vendas: A −10%, B 20%, C 30% e D 15%."),
        "cfn-2024-55-29": (recorte_pdf(2024, (0.105, 0.655, 0.425, 0.755)), "Tabela oficial: notas 4,50; 6,00; 7,50 e 9,00."),
        "cfn-2025-11-34": (recorte_pdf(2025, (0.645, 0.815, 0.995, 0.945)), "Paralelepípedo com dimensões 5 cm, 4 cm e 3 cm."),
    }

    for id_questao, (imagem, descricao) in reparos.items():
        caminho = salvar(imagem, f"{id_questao}-apoio.webp")
        por_id[id_questao]["apoio"] = [{"imagem": caminho, "texto": descricao}]

    por_id["cfn-2020-88-35"]["enunciado"] = "Na reta numérica do apoio estão representados os números reais 0, x, y e 1. Qual é a posição do número xy?"
    por_id["cfn-2021-11-34"]["enunciado"] = "Uma escada está apoiada em um muro perpendicular ao solo, conforme o apoio, e forma um ângulo de 60° com o solo. Sabendo que seu comprimento é de 3,8 metros, a que distância o pé da escada está da base do muro?"
    por_id["cfn-2021-11-46"]["enunciado"] = "Uma região retangular tem as dimensões indicadas no apoio. O valor de x que faz com que a área seja igual a 30 m² é:"
    por_id["cfn-2023-14-28"]["enunciado"] = "Uma empresa apresentou a projeção de vendas dos produtos A, B, C e D no gráfico do apoio. Qual é a diferença entre a maior e a menor projeção de vendas?"
    por_id["cfn-2024-55-29"]["enunciado"] = "Um aluno do Ensino Médio obteve as notas apresentadas na tabela do apoio. Sabendo que elas formam uma progressão aritmética, determine a média aritmética e a razão da PA."
    por_id["cfn-2025-11-34"]["enunciado"] = "O apoio representa uma caixa em forma de paralelepípedo. Qual é o seu volume, em cm³?"
    por_id["cfn-2025-11-34"]["opcoes"] = ["12 cm³", "20 cm³", "30 cm³", "50 cm³", "60 cm³"]

    ARQUIVO.write_text(json.dumps(questoes, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(reparos)} questões CFN reparadas")


if __name__ == "__main__":
    main()
