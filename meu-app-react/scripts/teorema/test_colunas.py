import unittest
from unittest.mock import patch
import json

from extrair_colunas import extract_document, reference_at_start, parse_keys
from montar_revisao import match_row
from metadados import classify, ASSIMILACAO
from higienizar_fontes import watermark
from limites_visuais import band_cut
from PIL import Image,ImageDraw
from renderizar_revisao import options_for_images


REGIONS = [{'pagina':0,'coluna':0,'bbox':[24,73,294,814]}, {'pagina':0,'coluna':1,'bbox':[301,73,571,814]}]


def line(text, y, region=0, x=None, labels=()):
    x = x if x is not None else (42 if region == 0 else 315)
    return {'text':text,'top':y,'bottom':y+11,'x0':x,'x1':x+200,'region':region,
            'anchors':[{'label':label,'x':pos,'top':y,'bottom':y+11} for label,pos in labels]}


class ColunasTest(unittest.TestCase):
    def parse(self, lines):
        with patch('extrair_colunas.read_layout',return_value=(lines,REGIONS,True)):
            return extract_document('fixture.pdf')

    def test_marca_pessoal_isolada_nao_apaga_texto_da_questao(self):
        self.assertTrue(watermark([['exemplo','@','example.com']],b'TJ'))
        self.assertTrue(watermark([['123','.456.789','-00']],b'TJ'))
        self.assertFalse(watermark(['O texto cita exemplo@example.com como parte do problema.'],b'Tj'))
        self.assertFalse(watermark(['2x + 3 = 7'],b'Tj'))

    def test_faixa_branca_proxima_ao_limite_preserva_ultima_linha(self):
        image=Image.new('RGB',(100,200),'white');draw=ImageDraw.Draw(image)
        draw.rectangle((10,150,90,159),fill='black')
        draw.rectangle((10,166,90,180),fill='black')
        cut=band_cut(image,[0,0,100,200],100,170,1,target=164)
        self.assertGreater(cut,159)
        self.assertLess(cut,166)

    def test_faixa_entre_fracoes_nao_corta_denominador(self):
        image=Image.new('RGB',(100,160),'white');draw=ImageDraw.Draw(image)
        draw.rectangle((10,100,90,120),fill='black')
        draw.rectangle((10,128,90,145),fill='black')
        cut=band_cut(image,[0,0,100,160],110,131,1)
        self.assertGreater(cut,120)
        self.assertLess(cut,128)

    def test_formulas_visualmente_diferentes_nao_sao_rejeitadas_por_texto_auxiliar(self):
        options=options_for_images(['4 3 3','3','3 3','3\n\n3','3 4'])
        self.assertNotEqual(options[2],options[3])
        self.assertIn('Alternativa C',options[2])
        self.assertIn('Alternativa D',options[3])

    def test_cabecalho_com_diacritico_ocr_nao_vaza_na_alternativa_anterior(self):
        ls=[line('1. Escolha o sinônimo.',90)]
        ls += [line(f'{c.lower()}) originate.' if c=='E' else f'{c.lower()}) Option {c}',120+i*15,labels=[(c,42)]) for i,c in enumerate('ABCDE')]
        ls += [line('TEXTO PARA AS PRÓXIMAS 2 QUESTƠES:',210),line('A complete shared passage.',230),line('2. According to the text, choose.',300)]
        ls += [line(f'{c.lower()}) Choice {c}',340+i*20,labels=[(c,42)]) for i,c in enumerate('ABCDE')]
        ls += [line('Gabarito: 1-A; 2-B',600,1)]
        questions=self.parse(ls)
        self.assertEqual(questions[1][0]['opcoes'][-1],'originate.')
        self.assertIn('complete shared passage',questions[2][0]['apoios'][0]['texto'])

    def test_numerador_antes_do_numero_e_da_alternativa(self):
        ls = [line('3 4',92,x=190),line('1. (EEAR 2013) Sejam as frações.',100)]
        ls += [line('27',140,x=70),line('a)',148,labels=[('A',42)]),line('2',160,x=70)]
        ls += [line(f'{label.lower()}) {i}',190+i*25,labels=[(label,42)]) for i,label in enumerate('BCD')]
        ls += [line('Gabarito: 1-B',600,region=1)]
        q = self.parse(ls)[1][0]
        self.assertEqual(q['referencia'],'EEAR 2013')
        self.assertTrue(q['enunciado'].startswith('3 4'))
        self.assertLess(q['partes'][0]['recortes'][0]['bbox'][1],92)
        self.assertAlmostEqual(q['partes'][0]['recortes'][0]['bbox'][3],139.7)
        self.assertIn('27',q['opcoes'][0])
        self.assertNotIn('27',q['enunciado'])

    def test_contexto_continua_na_coluna_direita_sem_alternativas(self):
        ls=[line('TEXTO PARA A PRÓXIMA QUESTÃO:',80),line('A long shared passage.',100),line('End of the passage.',80,1),line('1. (EEAR 2020) According to the text, choose:',120,1)]
        ls += [line(f'{c.lower()}) Option {c}',170+i*25,1,labels=[(c,315)]) for i,c in enumerate('ABCDE')]
        ls += [line('Gabarito: 1-C',600,1)]
        q=self.parse(ls)[1][0]
        self.assertEqual(len(q['apoios'][0]['recortes']),2)
        self.assertEqual(q['apoios'][0]['recortes'][1]['bbox'][0],301)
        self.assertIn('End of the passage',q['apoios'][0]['texto'])
        self.assertNotIn('Option',q['apoios'][0]['texto'])
        self.assertEqual(q['resposta_correta'],2)

    def test_denominador_nao_migra_para_alternativa_seguinte(self):
        ls=[line('1. Calcule a carga elétrica.',90),line('Q',140,x=60),
            line('a)',146,labels=[('A',42)]),line('4',154,x=60),
            line('Q',167,x=60),line('b)',173,labels=[('B',42)]),line('2',181,x=60),
            line('c) 2Q',193,labels=[('C',42)]),line('d) 4Q',207,labels=[('D',42)]),
            line('Gabarito: 1-A',600,1)]
        q=self.parse(ls)[1][0]
        self.assertIn('Q',q['opcoes'][0])
        self.assertIn('4',q['opcoes'][0])
        self.assertIn('2',q['opcoes'][1])
        self.assertEqual(q['opcoes'][2],'2Q')
        self.assertNotIn('\nQ',q['enunciado'])

    def test_alternativas_na_mesma_linha_nao_se_repetem_nos_recortes(self):
        ls=[line('1. Identifique o número correto.',100),line('a) -6 b) -5 c) 4 d) 5 e) 6',160,labels=list(zip('ABCDE',[42,82,122,162,202]))),line('Gabarito: 1-C',600,1)]
        q=self.parse(ls)[1][0]
        self.assertEqual(q['opcoes'],['-6','-5','4','5','6'])
        for a,b in zip(q['partes'][1:],q['partes'][2:]):
            self.assertEqual(a['recortes'][0]['bbox'][2],b['recortes'][0]['bbox'][0])

    def test_referencia_com_parenteses_internos_e_multiplas_linhas(self):
        ref,txt=reference_at_start('1. (Espcex (Aman) 2020) Um objeto.\nContinuação.')
        self.assertEqual(ref,'Espcex (Aman) 2020')
        self.assertEqual(txt,'Um objeto.\nContinuação.')
        self.assertEqual(classify(ref)['banca'],'EsPCEx')
        self.assertEqual(classify(ref)['ano'],2020)

    def test_numero_errado_do_csv_nao_sobrescreve_outra_questao(self):
        row={'numero_origem':'2','enunciado':'n n + + = , então:', 'opcoes':json.dumps(['n=4','n=3','n=2','n=1','n=0'])}
        choices=[{'numero':2,'enunciado':'A solução da equação é um número natural.', 'opcoes':['maior que nove','ímpar','cubo perfeito','divisível por cinco','múltiplo de três']},
                 {'numero':7,'enunciado':'Se (n+4)! + (n+3)! =15(n+2)!, então:', 'opcoes':['n=4','n=3','n=2','n=1','n=0']}]
        q,info=match_row(row,choices)
        self.assertIsNotNone(q)
        self.assertEqual(q['numero'],7)

    def test_agregador_nao_e_banca_e_nao_inventa_ano(self):
        meta=classify('G1 - ifsul 2019')
        self.assertEqual((meta['banca'],meta['ano']),('IFSUL',2019))
        meta=classify(None)
        self.assertEqual((meta['banca'],meta['ano']),(ASSIMILACAO,None))
        with self.assertRaises(ValueError):
            classify('UFEP')

    def test_gabarito_com_resposta_por_extenso_tabela_simples_e_quebra_de_linha(self):
        ls=[line('GABARITO',100),line('1 A',120),line('2-B; 3-(F;V); 4c; 5-',140),line('d; 6-e.',160),line('Resposta da questão 7:',180),line('Resposta: c',200)]
        answers,_=parse_keys(ls,0)
        self.assertEqual(dict(answers),{1:{'A'},2:{'B'},4:{'C'},5:{'D'},6:{'E'},7:{'C'}})

    def test_numeracao_reinicia_por_nivel_sem_trocar_gabarito(self):
        ls=[line('GABARITO NÍVEL 1',100),line('1. C',120),line('GABARITO NÍVEL 2',140),
            line('Resposta da questão 1:',160),line('[D]',180),
            line('3-a',200),line('Resposta da questão 2:',220),line('Questão anulada no gabarito oficial.',240)]
        answers,_=parse_keys(ls,0,by_level=True)
        self.assertEqual(answers[(1,1)],{'C'})
        self.assertEqual(answers[(2,1)],{'D'})
        self.assertEqual(answers[(2,2)],{'ANULADA'})
        self.assertNotIn((2,3),answers)


if __name__=='__main__':
    unittest.main()
