from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "acervo-bancas-1996-2026"


def write_csv(name: str, fields: list[str], rows: list[dict]) -> None:
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    funatec_page = "https://www.funatec.org.br/concursos/encerrados"
    funatec_rows = []
    for pdf in sorted((OUT / "originais" / "FUNATEC").rglob("*.pdf")):
        relative = pdf.relative_to(OUT).as_posix()
        funatec_rows.append({
            "banca": "FUNATEC", "concurso": pdf.parent.name, "tipo": pdf.stem,
            "nome_arquivo": pdf.name, "url_origem": "", "pagina_origem": funatec_page,
            "caminho_local": relative, "bytes": pdf.stat().st_size,
            "status": "baixado; URL direta não recuperada", "erro": "O arquivo foi preservado de coleta pública anterior; o portal expirou as conexões durante a conferência final.",
        })
    write_csv("manifesto-funatec.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], funatec_rows)

    write_csv("manifesto-vunesp.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], [{
        "banca": "VUNESP", "concurso": "Acervo histórico", "tipo": "Provas e gabaritos",
        "url_origem": "", "pagina_origem": "https://www.vunesp.com.br/busca/concurso/encerrados",
        "status": "acesso automatizado negado (HTTP 403)",
        "erro": "A listagem oficial retornou HTTP 403 nesta coleta; nenhum bloqueio foi contornado.",
    }])

    write_csv("manifesto-fundep.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], [{
        "banca": "FUNDEP", "concurso": "Arquivo histórico", "tipo": "Política oficial de retenção",
        "url_origem": "", "pagina_origem": "https://concursos.fundep.ufmg.br/site/Site/Faq.aspx",
        "status": "acervo histórico não mantido",
        "erro": "A FAQ oficial informa que provas, gabaritos e demais arquivos ficam disponíveis até a homologação e que a FUNDEP não mantém arquivo de provas anteriores.",
    }])

    write_csv("manifesto-idecan.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], [
        {"banca": "IDECAN", "concurso": "Acervo histórico", "tipo": "Editais, provas e gabaritos", "url_origem": "", "pagina_origem": "https://concurso.idecan.org.br/editais", "status": "acesso automatizado negado (HTTP 403)", "erro": "Portal oficial retornou HTTP 403; não foram contornadas barreiras de acesso."},
        {"banca": "IDECAN", "concurso": "Acervo legado", "tipo": "Concursos e documentos", "url_origem": "", "pagina_origem": "https://site-idecan-antigo.azurewebsites.net/getConc.aspx?key=bxdbMAISNtYp4=", "status": "site desativado (HTTP 403)", "erro": "O endereço legado respondeu que o site está desativado."},
    ])

    write_csv("manifesto-cesgranrio.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], [{
        "banca": "CESGRANRIO", "concurso": "Concursos concluídos", "tipo": "Provas e gabaritos",
        "url_origem": "", "pagina_origem": "https://www.cesgranrio.org.br/wp-json/wp/v2/concurso?per_page=100&_embed",
        "status": "nenhum PDF de prova identificado na listagem pública consultada",
        "erro": "A API oficial listou concursos, mas o conteúdo público consultado não expôs links diretos de cadernos ou gabaritos.",
    }])

    zip_manifest = OUT / "manifesto-ibfc-pacotes-zip.csv"
    doc_rows = []
    if zip_manifest.exists():
        with zip_manifest.open(encoding="utf-8-sig", newline="") as f:
            for package in csv.DictReader(f):
                paths = [p for p in (package.get("arquivos_extraidos") or "").split(";") if p]
                for local in paths:
                    p = OUT / Path(local)
                    if p.is_file():
                        doc_rows.append({
                            "banca": "IBFC", "concurso": package.get("concurso", ""),
                            "tipo": package.get("tipo", "Documento extraído de anexo ZIP"),
                            "nome_arquivo": p.name, "url_origem": package.get("url_origem", ""),
                            "pagina_origem": package.get("pagina_origem", ""),
                            "caminho_local": p.relative_to(OUT).as_posix(), "bytes": p.stat().st_size,
                            "status": "extraído de ZIP", "erro": "",
                        })
    write_csv("manifesto-ibfc-documentos-extraidos.csv", ["banca", "concurso", "tipo", "nome_arquivo", "url_origem", "pagina_origem", "caminho_local", "bytes", "status", "erro"], doc_rows)
    print(f"FUNATEC PDFs: {len(funatec_rows)}; documentos extraídos dos ZIPs do IBFC: {len(doc_rows)}")


if __name__ == "__main__":
    main()
