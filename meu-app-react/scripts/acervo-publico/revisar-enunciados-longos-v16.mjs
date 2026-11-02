import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const fila=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-longos-pendente.json.gz'))),item=i=>fila.find(q=>q.indice===i).questao
const decisoes=[
 {i:28,materia:'Português',conteudo:'Semântica lexical: significado de “imensuráveis” e sinonímia contextual',motivo:'A página confirma que o item 10 solicita substituir “imensuráveis” por “vastos”; é uma questão de vocabulário e sentido contextual.'},
 {i:37,materia:'Informática',conteudo:'Banco de dados: características do SQLite 3 e comparação com SGBDs',motivo:'A página confirma que o item 80 compara SQLite 3 com PostgreSQL, Oracle e SQL Server; refinado o subtópico.'},
 {i:38,materia:'Português',conteudo:'Orações subordinadas concessivas: sentido e reescrita de “apesar de”',motivo:'A página confirma que o item 81 avalia coerência e correção ao reescrever uma oração concessiva no texto.'},
 {i:51,materia:'Português',conteudo:'Concordância verbal: flexão de “chegar” com sujeito composto',motivo:'A página confirma o item 8, que analisa a flexão de “chegar” em trecho de texto; refinado o tópico gramatical.'}
]
await aplicarRevisoesIndividuais({nome:'revisao-semantica-v16',base:'tmp/revisao-profissional/revisao-semantica-v15/acervo-extraido',decisoes:decisoes.map(p=>{const q=item(p.i);return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:p.materia,conteudo:p.conteudo,motivo:p.motivo}})})
