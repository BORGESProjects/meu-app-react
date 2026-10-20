"""Hand-checked regions from the original image-only PDFs, in PDF points.

These two CSV rows lost choices or mixed adjacent exercises. Coordinates were
checked on complete rendered pages, and letters are asserted against the native
answer-key page. Unknown institution UFEP remains blocked by metadata review.
"""
import hashlib
import json
import re
from pypdf import PdfReader
from auditar_pacote import WORK
from extrair_colunas import VERSION


def apply():
    sources=json.loads((WORK/'fontes.json').read_text(encoding='utf8'))
    definitions=[
        ('PDF - LISTA 39 - TERMOQUÍMICA II.pdf',11,2,'A','Univali-SC - adaptada',
         'Uma das etapas envolvidas na produção do álcool combustível (etanol) é a fermentação. '
         'A equação que apresenta esta transformação é: C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂. '
         'Conhecendo-se os calores de formação apresentados na tabela, pode-se afirmar que a fermentação ocorre com:',
         ['liberação de 18 kcal/mol.','absorção de 18 kcal/mol.','liberação de 142 kcal/mol.','absorção de 142 kcal/mol.','variação energética nula.'],
         [[25,77,295,306.5],[25,306.5,295,320.5],[25,320.5,295,334.5],[25,334.5,295,348.5],[25,348.5,295,362.5],[25,362.5,295,376]]),
        ('PDF - LISTA 34 - REAÇÕES ORGÂNICAS II.pdf',12,1,'B','UFEP',
         'Ao se aquecer ácido butanóico, que possui um cheiro desagradável, com etanol na presença de pequena quantidade de ácido sulfúrico, forma-se uma substância com odor de abacaxi. Essa substância é um:',
         ['éter.','éster.','composto aromático.','anidrido.','aldeído.'],
         [[25,566,295,622],[25,622,162,636.5],[162,622,295,636.5],[25,636.5,171,650],[171,636.5,295,650],[25,650,295,663]])]
    for name,n,page,letter,ref,text,options,rects in definitions:
        key=PdfReader(sources[name][0]).pages[-1].extract_text()
        assert re.search(r'(?<!\d)'+str(n)+r'\s*[-–]\s*'+letter+r'\b',key), (name,n)
        q={'numero':n,'nivel':None,'enunciado':text,'referencia':ref,'opcoes':options,
           'resposta_correta':ord(letter)-65,'anulada':False,'apoios':[], 'pagina':page+1,
           'gabarito_linhas':[f'{n}-{letter}'],'duas_colunas':True,'revisao_manual':True,
           'partes':[{'texto':t,'recortes':[{'pagina':page,'coluna':0,'bbox':r}]} for t,r in zip([text,*options],rects)]}
        output=WORK/'documentos-colunas'/(hashlib.sha256(name.encode()).hexdigest()[:16]+'.json')
        output.write_text(json.dumps({'versao':VERSION,'arquivo':name,'questoes':{str(n):[q]}},ensure_ascii=False,indent=2),encoding='utf8')


if __name__=='__main__':
    apply()
