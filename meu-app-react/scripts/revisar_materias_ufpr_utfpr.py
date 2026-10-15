"""Reaplica a divisão de matérias conferida nos cadernos oficiais canônicos.

Não altera enunciados, imagens ou respostas. A UFPR muda a ordem das matérias
entre edições; reutilizar limites de outro ano classificava itens incorretamente.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIVISOES = {
    2019: [(9,'História'),(18,'Química'),(27,'Biologia'),(36,'Matemática'),(48,'Língua Portuguesa'),(54,'Literatura'),(63,'Física'),(72,'Geografia'),(78,'Filosofia'),(82,'Sociologia'),(90,'Língua Inglesa')],
    2020: [(9,'Biologia'),(18,'Matemática'),(27,'História'),(36,'Física'),(48,'Língua Portuguesa'),(54,'Literatura'),(63,'Química'),(68,'Filosofia'),(77,'Geografia'),(82,'Sociologia'),(90,'Língua Inglesa')],
    2021: [(4,'Língua Inglesa'),(12,'Língua Portuguesa'),(16,'Literatura'),(22,'História'),(28,'Geografia'),(34,'Biologia'),(40,'Física'),(44,'Filosofia'),(50,'Matemática'),(56,'Química'),(60,'Sociologia')],
    2022: [(4,'Língua Inglesa'),(10,'Biologia'),(16,'Matemática'),(22,'História'),(28,'Física'),(36,'Língua Portuguesa'),(40,'Literatura'),(46,'Química'),(50,'Filosofia'),(56,'Geografia'),(60,'Sociologia')],
    2023: [(9,'Biologia'),(18,'Matemática'),(27,'História'),(36,'Física'),(48,'Língua Portuguesa'),(54,'Literatura'),(63,'Química'),(68,'Filosofia'),(77,'Geografia'),(82,'Sociologia'),(90,'Língua Inglesa')],
    2024: [(9,'Matemática'),(18,'Física'),(27,'Química'),(36,'Biologia'),(45,'Geografia'),(54,'História'),(66,'Língua Portuguesa'),(72,'Literatura'),(76,'Sociologia'),(82,'Filosofia'),(90,'Língua Inglesa')],
    2025: [(9,'Matemática'),(18,'Física'),(27,'Química'),(36,'Biologia'),(45,'Geografia'),(54,'História'),(66,'Língua Portuguesa'),(72,'Literatura'),(77,'Filosofia'),(82,'Sociologia'),(90,'Língua Inglesa')],
}

def materia_ufpr(ano, numero):
    return next(nome for limite,nome in DIVISOES[int(ano)] if numero <= limite)

def revisar():
    for ano in DIVISOES:
        path = ROOT/f'public/acervo/ufpr-{ano}/questoes.json'
        itens = json.loads(path.read_text(encoding='utf8'))
        alterados=[]
        for q in itens:
            nova=materia_ufpr(ano,q['numero_original'])
            if q['materia'] != nova:
                alterados.append(q['numero_original'])
                q['materia']=nova
                q['conteudo']=nova
        path.write_text(json.dumps(itens,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
        print(ano, 'classificações corrigidas:', len(alterados), alterados)

if __name__ == '__main__':
    revisar()
