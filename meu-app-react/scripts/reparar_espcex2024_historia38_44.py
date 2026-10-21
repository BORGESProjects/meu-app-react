"""Substitui rótulos sem conteúdo por alternativas conferidas no caderno D."""
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
arquivo = ROOT / 'public/acervo/espcex-2017-2026/questoes.json'
destino = arquivo.parent / 'imagens/reparadas'
prefixo = ROOT / 'tmp/espcex-2017-2026/2024/revisao'
subprocess.run(['pdftoppm', '-f', '18', '-l', '19', '-scale-to', '1800', '-png',
                str(ROOT / 'tmp/espcex-2017-2026/2024/prova-dia2.pdf'), str(prefixo)], check=True)
dados = {
 38: (18, (101, 578, 1238, 728),
      'A integração da América ao contexto europeu deu-se por meio do colonialismo mercantilista, em que várias cortes europeias partiram para a montagem e exploração de impérios coloniais. Estabeleceu-se um conjunto de normas que regulamentava as relações entre as colônias e metrópoles, chamado por muitos historiadores de',
      ['Aculturação Forçada.', 'Choque de Civilizações.', 'Pacto Colonial.', 'Colonato.', 'Contrato Social.']),
 44: (19, (101, 1033, 1238, 1542),
      'A participação do Brasil na Segunda Guerra Mundial ao lado dos aliados criou uma situação insólita: combatia-se o fascismo na Europa, enquanto no Brasil mantinha-se um regime ditatorial, o Estado Novo, inspirado nesse mesmo fascismo. Getúlio Vargas, percebendo que a redemocratização do País seria inevitável, tomou uma série de medidas, na tentativa de manter-se no poder. Relativamente a esse momento histórico, analise as assertivas abaixo.\n'
      'I – Muitos acreditavam que o retorno dos “pracinhas” da Força Expedicionária Brasileira (FEB) aceleraria o processo, pois, após derrotar a ditadura na Europa, completaria o trabalho, fazendo o mesmo no Brasil.\n'
      'II – Apesar da violência com que a ditadura os tratou, Luís Carlos Prestes e o Partido Comunista Brasileiro apoiaram Vargas, seguindo orientações de Moscou.\n'
      'III – Na campanha eleitoral para as eleições presidenciais de 1945, Vargas fazia um jogo político ambíguo: apoiava o general Eurico Gaspar Dutra, mas também estimulava um movimento popular que pedia a sua permanência no poder.\n'
      'IV – O termo “Queremismo” era derivado dos gritos “Queremos democracia!”, dos grupos populares contrários ao Estado Novo.\n'
      'Assinale a alternativa que apresenta todas as assertivas corretas.',
      ['I e II.', 'II, III e IV.', 'I, II e III.', 'III e IV.', 'I e IV.'])
}
questoes = json.loads(arquivo.read_text(encoding='utf-8'))
for numero, (pagina, caixa, texto, opcoes) in dados.items():
    q = next(q for q in questoes if q['id'] == f'espcex-2024-d2-{numero}')
    assert q['resposta_correta'] == 2  # Preserva o gabarito existente.
    imagem = Image.open(str(prefixo) + f'-{pagina}.png').convert('RGB')
    assert imagem.size == (1341, 1800)
    nome = q['id']+'-enunciado-revisado.webp'
    imagem.crop(caixa).save(destino / nome, 'WEBP', quality=94)
    q.update(enunciado=texto, opcoes=opcoes, imagem_sem_alternativas=True,
             imagem_original='/acervo/espcex-2017-2026/imagens/reparadas/'+nome,
             texto_extraido_corrompido=True)
arquivo.write_text(json.dumps(questoes, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
pendentes = ROOT / 'docs/acervo/espcex-alternativas-pendentes.json'
itens = json.loads(pendentes.read_text(encoding='utf-8'))
ids = {f'espcex-2024-d2-{n}' for n in dados}
pendentes.write_text(json.dumps([q for q in itens if q['id'] not in ids], ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('EsPCEx 2024: questões 38 e 44 recuperadas; alternativas separadas do enunciado.')
