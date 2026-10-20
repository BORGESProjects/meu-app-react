import unittest
from unittest.mock import patch
from types import SimpleNamespace

from auditar_pacote import parse_document


def line(text, top):
    return {'text': text, 'x0': 85, 'x1': 530, 'top': top, 'bottom': top + 12}


class Page:
    width, height = 595, 842
    def __init__(self, lines):
        self.lines = lines
    def extract_words(self, **kwargs):
        return []
    def extract_text_lines(self, **kwargs):
        return self.lines


class PDF:
    def __init__(self, pages):
        self.pages = pages
    def __enter__(self):
        return self
    def __exit__(self, *args):
        pass


class AuditoriaTest(unittest.TestCase):
    def parse(self, pages):
        with patch('auditar_pacote.pdfplumber.open', return_value=PDF(pages)):
            return parse_document('fixture.pdf')

    def test_gabarito_e_fronteiras_do_original(self):
        lines = [line('1. (ESA 2020) Observe o gráfico abaixo.', 100)]
        lines += [line(f'{c}) Conteúdo {c}', 400+i*20) for i, c in enumerate('abcde')]
        lines += [line('Gabarito: 1-E', 520)]
        q = self.parse([Page(lines)])[1]
        self.assertEqual(q['resposta_correta'], 4)
        self.assertEqual(q['opcoes'], [f'Conteúdo {c}' for c in 'abcde'])
        # The entire blank/graphic area up to A is retained, not half the gap.
        self.assertEqual(q['partes'][0]['recortes'][0]['bbox'][3], 399.5)
        self.assertLess(q['partes'][-1]['recortes'][0]['bbox'][3], 520)

    def test_imagem_antes_do_texto_na_pagina_de_continuacao(self):
        first = Page([line('1. (ESA 2020) Observe as figuras.', 700)])
        second = Page([line('As figuras representam:', 300)] + [line(f'{c}) Conteúdo {c}', 400+i*20) for i, c in enumerate('abcde')] + [line('Gabarito: 1-B', 520)])
        q = self.parse([first, second])[1]
        self.assertEqual(q['partes'][0]['recortes'][1]['bbox'][1], 65)
        self.assertEqual(q['resposta_correta'], 1)

    def test_gabarito_ambiguo_nao_pode_ser_publicado(self):
        ls = [line('1. Enunciado de teste suficiente.', 100)] + [line(f'{c}) Opção {c}', 200+i*20) for i, c in enumerate('abcde')] + [line('Gabarito: 1-A; 1-C', 500)]
        with self.assertRaisesRegex(ValueError, 'gabarito incompleto ou ambíguo'):
            self.parse([Page(ls)])


if __name__ == '__main__':
    unittest.main()
