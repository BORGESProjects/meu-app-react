"""Importação IFPR 2020: constantes de origem e comando compatível para a edição completa."""
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/acervo/ifpr-2020'
SOURCE='https://arquivos.qconcursos.com/prova/arquivo_prova/77667/funtef-pr-2019-if-pr-vestibular-cursos-superiores-prova.pdf'
KEY_SOURCE='https://arquivos.qconcursos.com/prova/arquivo_gabarito/77667/funtef-pr-2019-if-pr-vestibular-cursos-superiores-gabarito.pdf'

def clean(s):
    return re.sub(r'(?<=\w)[\u0002\u00ad-]\n(?=\w)','',s).replace('\u0002','').strip()

def main():
    # O comando antigo agora preserva a edição completa, em vez de sobrescrevê-la com quatro itens.
    from completar_ifpr_2020 import main as completar
    completar()

if __name__=='__main__':main()
