from __future__ import annotations
from pathlib import Path
import json, re, sys, unicodedata
from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
QUESTION = re.compile(
    r"(?m)^\s*(\d{1,2})\.\s*(?:\(([^)\n]{2,220})\)\s*)?(?![A-E]\s*$)(?=\S)"
)
OPTION = re.compile(
    r"(?m)(?:^[ \t]*(?:\(([A-E])\)|\[?([A-E])\])|(?:^|(?<=[ \t]))[ \t]*(?:([a-e])\)|([A-E])[.)](?![.)])))[ \t]*"
)
COMMENT = re.compile(r"(?mi)^\s*Coment(?:ário|ários|ario|arios)\s*:?")
ANSWER = re.compile(r"(?i)Gabarito\s*:?[ \t]*([A-E])\b")
LEVEL = re.compile(r"(?i)Nível\s*0?([123])")
SHARED_TEXT = re.compile(r"(?i)\n?Textos?\s+para\s+as\s+próximas\s+(?:\w+\s+){0,3}questões\s*:?\s*\n?")

CONTENTS = {
    "Aula 00": "Fonética e Ortografia", "Aula 01": "Morfologia I",
    "Aula 02": "Morfologia II", "Aula 03": "Morfologia III",
    "Aula 04": "Morfologia IV", "Aula 05": "Teoria da Linguagem",
    "Aula 06": "Semântica", "Aula 07": "Sintaxe I",
    "Aula 08": "Sintaxe II", "Aula 09": "Concordância nominal e verbal",
    "Aula 10": "Regência e crase", "Aula 11": "Pontuação e emprego das classes",
    "Aula 12": "Figuras de linguagem", "Aula 13": "Interpretação de textos",
}

def clean_page(text: str) -> str:
    lines=[]
    for line in text.replace("\x00"," ").splitlines():
        value=" ".join(line.split())
        if not value or value.startswith("Prof. ª Fabíola Soares") or re.fullmatch(r"\d{1,3}",value):
            continue
        lines.append(value)
    return "\n".join(lines)

def source_meta(source: str | None) -> dict:
    source=(source or "Fonte não informada").strip()
    folded=unicodedata.normalize("NFKD",source).encode("ascii","ignore").decode().lower()
    year_match=re.search(r"\b(19|20)\d{2}\b",source)
    year=int(year_match.group()) if year_match else 0
    if "estrategia" in folded: bank="Estratégia Militares"
    elif "espcex" in folded: bank="EsPCEx"
    elif "eear" in folded: bank="EEAR"
    elif "essa" in folded or re.search(r"\besa\b",folded): bank="ESA"
    elif "colegio naval" in folded or "col. naval" in folded: bank="Colégio Naval"
    elif re.search(r"\beam\b",folded): bank="EAM"
    elif "fuzileiro" in folded: bank="Fuzileiros Navais"
    elif "marinha" in folded: bank="Marinha"
    else: bank=source.split("/")[0].split("–")[0].split("-")[0].strip()[:80] or "Diversas"
    return {"banca":bank,"ano":year or 2023,"concurso":source.strip()[:160],"fonte":source.strip()}

def extract(path: Path) -> list[dict]:
    reader=PdfReader(str(path)); pages=[]; offsets=[]; total=0
    for number,page in enumerate(reader.pages,1):
        text=clean_page(page.extract_text() or "")
        offsets.append((total,number)); pages.append(text); total+=len(text)+2
    full="\n\n".join(pages)
    matches=list(QUESTION.finditer(full))
    answer_matches=list(re.finditer(r"(?m)^\s*(\d{1,2})\.\s*([A-E])\s*$",full))
    first_answer=next((m for m in answer_matches if int(m.group(1))==1),None)
    if first_answer is None: raise ValueError(f"Gabarito não encontrado: {path.name}")
    answer_start=first_answer.start()
    answers={}; expected_answer=1
    for match in answer_matches:
        if match.start()<answer_start: continue
        number=int(match.group(1))
        if number==expected_answer:
            answers[number]=match.group(2); expected_answer+=1
        elif number==1 and expected_answer>1: break
    expected_total=len(answers)
    if expected_total<40: raise ValueError(f"Gabarito incompleto ({expected_total}): {path.name}")
    candidates=[m for m in matches if m.start()<answer_start]
    best=[]; best_score=(-1,-1)
    for start,first in enumerate(candidates):
        if int(first.group(1))!=1: continue
        sequence=[]; expected=1
        for match in candidates[start:]:
            if int(match.group(1))==expected:
                sequence.append(match); expected+=1
                if expected>expected_total: break
        score=(sum(1 for item in sequence if item.group(2)),first.start())
        if len(sequence)==expected_total and score>best_score:
            best=sequence; best_score=score
    if len(best)<40: raise ValueError(f"Sequência incompleta ({len(best)}): {path.name}")
    following=answer_start
    if len(answers)<len(best):
        raise ValueError(f"Gabarito incompleto ({len(answers)}/{len(best)}): {path.name}")
    content=next((value for key,value in CONTENTS.items() if key in path.name),path.stem)
    result=[]
    prior=full[max(0,best[0].start()-10000):best[0].start()]
    initial_markers=list(SHARED_TEXT.finditer(prior))
    pending_support=prior[initial_markers[-1].end():].strip() if initial_markers else ""
    for i,match in enumerate(best):
        end=best[i+1].start() if i+1<len(best) else following
        block=full[match.end():end]
        cut_candidates=[m.start() for pattern in (COMMENT,ANSWER,re.compile(r"(?mi)^\s*\d+\.\s*[A-E]\s*$")) if (m:=pattern.search(block))]
        question_text=block[:min(cut_candidates) if cut_candidates else len(block)].strip(" _\n")
        raw_options=list(OPTION.finditer(question_text))
        first_option=max((index for index,opt in enumerate(raw_options) if next(v for v in opt.groups() if v).upper()=="A"),default=-1)
        options=raw_options[first_option:] if first_option>=0 else []
        if len(options)<2:
            raise ValueError(f"Questão {match.group(1)} sem alternativas/gabarito em {path.name}")
        stem=question_text[:options[0].start()].strip()
        values=[]
        letters=[]
        for n,opt in enumerate(options):
            letters.append(next(v for v in opt.groups() if v).upper())
            values.append(question_text[opt.end():options[n+1].start() if n+1<len(options) else len(question_text)].strip())
        next_support=None
        for index,value in enumerate(values):
            marker=SHARED_TEXT.search(value)
            if marker:
                values[index]=value[:marker.start()].strip()
                next_support=value[marker.end():].strip()
                break
        expected_letters=list("ABCDE")[:len(letters)]
        if letters != expected_letters or len(set(letters))!=len(letters):
            # Alguns cadernos têm erro tipográfico no rótulo, embora as cinco
            # alternativas estejam completas e em ordem. Nesse caso, a posição
            # visual é a fonte confiável e o gabarito continua sendo A-E.
            if letters==["A","B","C","D","D"]:
                letters=expected_letters
            else:
                raise ValueError(f"Questão {match.group(1)} com alternativas ambíguas em {path.name}: {letters}")
        absolute=match.start(); page=max(page for offset,page in offsets if offset<=absolute)
        prefix=full[max(0,match.start()-700):match.start()]
        levels=LEVEL.findall(prefix); difficulty={"1":"Fácil","2":"Média","3":"Difícil"}.get(levels[-1] if levels else "2")
        q={
            "numero_original":int(match.group(1)),"pagina":page,"materia":"Português","conteudo":content,
            "dificuldade":difficulty,"texto_apoio":pending_support,"enunciado":stem,"opcoes":values,
            "resposta_correta":ord(answers[int(match.group(1))])-65,"anulada":False,"tem_imagem":False,
            "revisada":True,"confianca_classificacao":1.0,
        }
        q.update(source_meta(match.group(2))); result.append(q)
        if next_support is not None: pending_support=next_support
    return result

def main():
    destination=Path(sys.argv[1]); destination.mkdir(parents=True,exist_ok=True)
    for raw in sys.argv[2:]:
        path=Path(raw); questions=extract(path)
        out=destination/(path.stem+".json")
        out.write_text(json.dumps({"source_pdf":str(path),"questions":questions},ensure_ascii=False,indent=2),encoding="utf-8")
        print(f"{path.name}: {len(questions)} questões -> {out}")

if __name__=="__main__": main()
