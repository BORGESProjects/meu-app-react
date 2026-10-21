import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {problemasDeIntegridade,separarRodapeEditorial} from '../src/qualidadeQuestao.js'
import {corrigirQuestaoConferida,questaoPublicavel} from '../src/acervo.js'
const base={id:'verificacao',enunciado:'Assinale a alternativa que responde corretamente ao problema apresentado.',opcoes:['Primeira opção.','Segunda opção.','Terceira opção.','Quarta opção.'],resposta_correta:1}
test('resoluções não são apagadas para disfarçar alternativas possivelmente deslocadas',()=>{
 for(const texto of ['Quarta opção.\n\nComentário:\nA resposta é outra.','Quarta opção. Comentários: Explicação do professor.','Quarta opção.\nResolução\nAfirmação I incorreta.','Comentários\nAplicando Pitágoras, encontramos...','Quarta opção. Gabarito: A','Quarta opção. 7.1 – Gabarito 1. B 2. C']){
  const original={...base,opcoes:[...base.opcoes.slice(0,3),texto]}
  const corrigida=corrigirQuestaoConferida(original)
  assert.equal(questaoPublicavel(corrigida),false,texto)
  assert.ok(corrigida.opcoes[3].includes('Coment')||corrigida.opcoes[3].includes('Resolução')||corrigida.opcoes[3].includes('Gabarito'))
 }
 const rica={...base,blocos_opcoes:base.opcoes.map(t=>[{tag:'p',children:[t]}])}
 rica.blocos_opcoes[3].push({tag:'p',children:['Comentários: o aluno deve marcar outra opção.']})
 assert.equal(questaoPublicavel(rica),false)
 assert.equal(questaoPublicavel({...base,blocos_opcoes:{3:{children:1}}}),false)
})
test('menções legítimas a comentários, resolução e gabaritos não são censuradas',()=>{
 const q={...base,opcoes:['Houve alguns comentários sobre você.','A resolução de conflitos envolve diálogo.','O narrador insere um comentário no trecho.','À zero hora seria divulgado o gabarito das provas.']}
 assert.deepEqual(problemasDeIntegridade(q),[]);assert.equal(questaoPublicavel(q),true)
})
test('rótulos de alternativas não substituem conteúdo quando falta o recorte',()=>{
 const q={...base,opcoes:['Alternativa A — consulte o recorte original.','Alternativa B — consulte o recorte original.','Alternativa C — consulte o recorte original.','Alternativa D — consulte o recorte original.']}
 assert.equal(questaoPublicavel(q),false)
 assert.equal(questaoPublicavel({...q,opcoes_imagens:['/a.webp','/b.webp','/c.webp','/d.webp']}),true)
 assert.equal(questaoPublicavel({...q,opcoes_imagens:['/a.webp','/b.webp','/c.webp']}),false)
})
test('limpeza remove somente cabeçalho editorial vazio no fim da opção',()=>{
 const original={...base,opcoes:[...base.opcoes.slice(0,3),'Quarta opção.\n__________________\n\n7.1 Gabarito']}
 assert.equal(corrigirQuestaoConferida(original).opcoes[3],'Quarta opção.')
 assert.equal(questaoPublicavel(corrigirQuestaoConferida(original)),true)
 assert.match(original.opcoes[3],/Gabarito/u)
 assert.equal(separarRodapeEditorial('Gabarito').removido,'')
 assert.equal(separarRodapeEditorial('Quarta opção.\n7.1 Gabarito\n1. B').removido,'')
})
test('recusa imagens ausentes sem confundir tabela textual íntegra ou conceito abstrato',()=>{
 assert.equal(questaoPublicavel({...base,enunciado:'A figura ilustra o circuito elétrico. Calcule a corrente.'}),false)
 assert.equal(questaoPublicavel({...base,enunciado:'A tabela apresenta os valores.\nR | I\n2,5 | 4\n3,5 | 3\nCalcule a tensão da fonte.'}),true)
 assert.equal(questaoPublicavel({...base,enunciado:'Qual característica da tabela periódica descreve o comportamento dos metais?'}),true)
 assert.equal(questaoPublicavel({...base,enunciado:'Qual o sentido da ironia da tirinha?'}),false)
})
test('soluções ocupando opções e comandos deslocados exigem recuperação na fonte',()=>{
 assert.equal(questaoPublicavel({...base,opcoes:['Correto. Essa região...','Incorreto. Lembre-se...','Incorreto. As frutas...','Incorreto. A irrigação...']}),false)
 assert.equal(questaoPublicavel({...base,opcoes:['Marque a alternativa correta.','Uma opção.','Outra opção.','Última opção.']}),false)
})
test('destaque tipográfico não pode desaparecer quando identifica o alvo da pergunta',()=>{
 const q={...base,enunciado:'No trecho apresentado, a palavra sublinhada indica um estado de:'}
 assert.equal(questaoPublicavel(q),false)
 assert.equal(questaoPublicavel({...q,imagem_original:'/acervo/prova/questao.webp'}),true)
 assert.equal(questaoPublicavel({...q,enunciado:'A palavra destacada “fatigar-se” indica um estado de:'}),true)
})
test('UFRGS 2023 recupera circuito, tabela e trajetória sem contaminar alternativas',()=>{
 const lote=JSON.parse(fs.readFileSync('public/acervo/ufrgs-2023/questoes.json'))
 for(const n of [26,27]){const q=lote.find(q=>q.id===`ufrgs-2023-d2-${n}`);assert.equal(q.pagina,13);assert.equal(q.imagem_sem_alternativas,true);assert.ok(fs.existsSync('public'+q.imagem_original));assert.equal(questaoPublicavel(q),true)}
 const q=lote.find(q=>q.id==='ufrgs-2023-d2-27');assert.equal(q.opcoes[4],'0,50 r.');assert.equal(q.resposta_correta,3)
})
test('18 questões EsPCEx preservam os destaques inclusive em cada alternativa',()=>{
 const revisadas=JSON.parse(fs.readFileSync('docs/acervo/reparacao-destaques-espcex.json'))
 const lote=JSON.parse(fs.readFileSync('public/acervo/espcex-2017-2026/questoes.json'))
 assert.equal(revisadas.length,18)
 for(const r of revisadas){const q=lote.find(q=>q.id===r.id);assert.ok(questaoPublicavel(q),r.id);assert.equal(q.opcoes_imagens.length,5);assert.ok(q.imagem_sem_alternativas);assert.ok(q.texto_extraido_corrompido);for(const f of [q.imagem_original,...q.opcoes_imagens])assert.ok(fs.existsSync('public'+f),f)}
})
test('EsPCEx 2024 questão 36 conserva a terceira alternativa e o final do enunciado',()=>{
 const q=JSON.parse(fs.readFileSync('public/acervo/espcex-2017-2026/questoes.json')).find(q=>q.id==='espcex-2024-d2-36')
 assert.match(q.enunciado,/presbiterianos \(na Escócia\)/u)
 assert.equal(q.opcoes[2],'Calvinismo (ou Reforma Calvinista).');assert.equal(q.resposta_correta,2)
 assert.match(q.opcoes_imagens[2],/revisada-C\.webp$/u)
 assert.ok(fs.statSync('public'+q.opcoes_imagens[2]).size>1000)
})

test('UFRGS 2022 questão 49 restaura logaritmo, frações e potência em opções separadas',()=>{
 const q=JSON.parse(fs.readFileSync('public/acervo/ufrgs-2022/questoes.json')).find(q=>q.id==='ufrgs-2022-d1-49')
 assert.equal(questaoPublicavel(q),true)
 assert.equal(q.enunciado,'Se log₂ x + (log₂ x)² = 12, então o valor de x é')
 assert.deepEqual(q.opcoes,['8 ou 1/16.','1/8 ou 16.','−4 ou 3.','4 ou −3.','2¹².'])
 assert.equal(q.resposta_correta,0)
 assert.equal(q.imagem_sem_alternativas,true)
 assert.equal(q.opcoes_imagens.length,5)
 for(const imagem of [q.imagem_original,...q.opcoes_imagens])assert.ok(fs.statSync('public'+imagem).size>500)
})

test('EsPCEx 2024 questões 38 e 44 têm o conteúdo real de todas as alternativas',()=>{
 const lote=JSON.parse(fs.readFileSync('public/acervo/espcex-2017-2026/questoes.json'))
 for(const n of [38,44]){
  const q=lote.find(q=>q.id===`espcex-2024-d2-${n}`)
  assert.equal(questaoPublicavel(q),true)
  assert.equal(q.opcoes.length,5)
  assert.equal(q.opcoes.some(o=>/consulte o recorte/u.test(o)),false)
  assert.equal(q.imagem_sem_alternativas,true)
  assert.equal(q.resposta_correta,2)
  assert.ok(fs.statSync('public'+q.imagem_original).size>1000)
 }
 assert.equal(lote.find(q=>q.id==='espcex-2024-d2-38').opcoes[2],'Pacto Colonial.')
 assert.match(lote.find(q=>q.id==='espcex-2024-d2-44').enunciado,/IV – O termo “Queremismo”/u)
})
