import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizarBanca} from '../src/filtros.js'
import {normalizarMetadadosQuestao,anoDaAplicacao} from '../src/origemQuestao.js'
import {enriquecerQuestaoExtraida,modalidadeQuestaoExtraida} from '../src/classificacaoQuestaoExtraida.js'
import {criarIndiceFacetas,opcoesFacetasAcervo,loteCorrespondeFacetas} from '../src/facetasAcervo.js'
import {indexarFiltros,filtrarIndice,opcoesRelacionadas} from '../src/indiceFiltros.js'

test('ano ausente usa a mesma chave nos dois acervos',()=>{
 const q={id:'sem-data',banca:'ESA',materia:'Matemática',conteudo:'Geometria',opcoes:['a','b'],enunciado:'Calcule a área do triângulo.'}
 const principal=indexarFiltros([q]),indice=criarIndiceFacetas()
 indice.adicionar(0,[q])
 const manifesto={facetas:indice.finalizar()}
 assert.equal(opcoesRelacionadas(principal).ano[0].value,'sem-ano')
 assert.equal(opcoesFacetasAcervo(manifesto).ano[0].value,'sem-ano')
 assert.equal(filtrarIndice(principal,{ano:['sem-ano']}).length,1)
 assert.equal(loteCorrespondeFacetas(manifesto,0,{ano:['sem-ano']}),true)
})

test('aplicações mantêm sua identidade sob INEP e Exército',()=>{
 for(const exame of ['ENEM','ENCCEJA','ENADE','ENAMED','REVALIDA','SAEB','PND'])assert.equal(normalizarBanca('INEP',exame),exame)
 assert.equal(normalizarBanca('Exército Brasileiro','ESA Concurso de Admissão 2025'),'ESA')
 assert.equal(normalizarBanca('Exército Brasileiro','IME CFG'),'IME')
 assert.equal(normalizarBanca('EEAR-2019/1'),'EEAR')
})
test('o ano de uma edição comercial não substitui o ano da prova',()=>{
 assert.equal(anoDaAplicacao({banca:'Estratégia Militares',concurso:'Estratégia Militares 2022 — EsPCEx 2020'}),2020)
 assert.equal(anoDaAplicacao({banca:'Questões de assimilação',concurso:'Questões de assimilação',enunciado:'O texto de 2007 descreve uma figura.'}),null)
 const q=normalizarMetadadosQuestao({banca:'Estratégia Militares',concurso:'Estratégia Militares 2022 — EsPCEx 2020',fonte:'fonte-autorizada'})
 assert.equal(q.concurso,'EsPCEx 2020');assert.equal(q.concurso_original,'Estratégia Militares 2022 — EsPCEx 2020');assert.equal(q.fonte,'fonte-autorizada')
})
test('presidente não constitui evidência de dente e pessoa não é SOA',()=>{
 const q=enriquecerQuestaoExtraida({banca:'Cebraspe',concurso:'AGU ADVOGADO 2015',enunciado:'A Secretaria-Geral de Contencioso é o órgão de direção superior da AGU competente para subsidiar as informações prestadas pelo presidente da República ao STF.',opcoes:['Certo','Errado']})
 assert.equal(q.materia,'Direito Administrativo');assert.doesNotMatch(q.conteudo,/Odontologia|web/)
 const outro=enriquecerQuestaoExtraida({banca:'Cebraspe',enunciado:'A pessoa que ocupa o cargo de presidente apresenta sua proposta.',opcoes:['Certo','Errado']})
 assert.notEqual(outro.materia,'Odontologia');assert.notEqual(outro.conteudo,'Arquitetura e serviços web')
})
test('ordem oficial do ENEM respeita a mudança em 2017',()=>{
 const q={banca:'INEP',concurso:'ENEM',numero_original:1,enunciado:'Enunciado sem pistas disciplinares.',opcoes:['A','B','C','D','E']}
 assert.equal(enriquecerQuestaoExtraida({...q,ano:2016}).materia,'Ciências Humanas e suas Tecnologias')
 assert.equal(enriquecerQuestaoExtraida({...q,ano:2017}).materia,'Linguagens e suas Tecnologias')
})
test('discursivas não são declaradas objetivas só porque existem subitens',()=>{
 assert.equal(modalidadeQuestaoExtraida({documento_origem:'fuv1997_2fase_mat.pdf',opcoes:['Determine x','Justifique']}),'discursiva')
 assert.equal(modalidadeQuestaoExtraida({opcoes:['Certo','Errado']}),'certo_errado')
})
test('índice conjunto considera todos os lotes sem misturar suas disciplinas',()=>{
 const indice=criarIndiceFacetas()
 indice.adicionar(0,[{banca:'INEP',concurso:'ENEM',ano:2022,materia:'Matemática',conteudo:'Trigonometria',enunciado:'Seno e cosseno',opcoes:[]}])
 indice.adicionar(1,[{banca:'Exército Brasileiro',concurso:'ESA',ano:2025,materia:'Português',conteudo:'Pontuação',enunciado:'Vírgula',opcoes:[]}])
 const m={facetas:indice.finalizar()}
 assert.equal(loteCorrespondeFacetas(m,0,{materia:['portugues']}),false)
 assert.equal(loteCorrespondeFacetas(m,1,{banca:['esa'],materia:['portugues']}),true)
 assert.deepEqual(opcoesFacetasAcervo(m,{banca:['enem']}).materia.map(q=>q.value),['matematica'])
 assert.equal(opcoesFacetasAcervo(m,{}).banca.length,2)
})
