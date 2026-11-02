import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {lotesAtuais} from './acervo-atual.mjs'
const todos=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/apos-delimitacao-candidatos.json.gz')))
const longos=todos.filter(q=>q.enunciado.length>350||/\n\s*\n/u.test(q.enunciado))
const corrigidas={
1:['Direito Constitucional','Teoria da Constituição: conceito e classificações'],
2:['Informática','Redes de computadores: protocolos de comunicação'],
5:['Direito Administrativo','Serviços públicos: concessões e parcerias público-privadas'],
7:['Português','Tipologia textual: narração, descrição e argumentação'],
8:['Engenharia Civil','Orçamento de obras: custos, BDI e orçamento de referência'],
13:['Segurança do Trabalho','Saúde, meio ambiente e sustentabilidade'],
14:['Engenharia Civil','Fiscalização de obras: registros, responsabilidades e livro de ordem'],
21:['Economia','Economia do setor público: funções do Estado'],
27:['Português','Verbos: tempos, modos e vozes verbais'],
28:['Português','Semântica: sentido das palavras e expressões'],
30:['Engenharia Civil','Pavimentação: materiais asfálticos e patologias'],
31:['Informática','Segurança da informação: privacidade e normas ISO'],
34:['Segurança do Trabalho','Higiene ocupacional: agentes químicos e limites de tolerância'],
35:['Engenharia Civil','Materiais de construção: concreto e água de amassamento'],
36:['Engenharia Civil','Planejamento e controle de obras: valor agregado e medições'],
43:['Direito Administrativo','Transparência e acesso à informação'],
51:['Português','Concordância verbal e nominal'],
57:['Direito Administrativo','Organização administrativa: administração indireta'],
60:['Português','Concordância verbal e nominal'],
61:['Português','Interpretação de textos'],
}
// Leitura semântica concluída. Não aplicar estes registros até conferir os contextos e imagens indicados.
const misturados=new Set([1,4,5,6,7,8,9,10,11,12,13,14,19,20,21,22,23,24,26,27,28,30,32,33,35,36,42,48,51,59,61,62])
const dependentes=new Set([16,29,55]),ocr=new Set([17,25,34,39,51,57,58,60,61])
const porId=new Map(longos.map((q,i)=>[q.id,{indice:i,...q}]))
const fila=[]
for await(const {questoes,lote} of lotesAtuais())for(const q of questoes){const p=porId.get(q.id);if(!p)continue;const i=p.indice;fila.push({indice:i,id:q.id,sha256_enunciado:p.sha256_enunciado,materia_proposta:corrigidas[i]?.[0]||p.depois.materia,conteudo_proposto:corrigidas[i]?.[1]||p.depois.conteudo,publicavel:false,status:'Aguardando conferência de integridade antes de aplicar classificação',pendencias:[...(misturados.has(i)?['Texto do bloco seguinte incorporado ao enunciado']:[]),...(dependentes.has(i)?['Confirmar diagrama, tabela ou resultado necessário']:[]),...(ocr.has(i)?['Conferir espaçamento ou transcrição na imagem']:[])],lote:lote.arquivo,questao:q})}
fila.sort((a,b)=>a.indice-b.indice)
if(fila.length!==63)throw Error('Fila incompleta')
await fs.writeFile('docs/acervo/revisao-profissional/revisao-longos-pendente.json.gz',zlib.gzipSync(JSON.stringify(fila),{level:9}))
console.log(JSON.stringify({propostas:63,retificadas:Object.keys(corrigidas).length,mistura_de_blocos:misturados.size,aplicadas:0}))
