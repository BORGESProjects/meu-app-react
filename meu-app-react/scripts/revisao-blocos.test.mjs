import test from 'node:test'
import assert from 'node:assert/strict'
import {separarComandoSeguinte} from './acervo-publico/separar-comando-seguinte.mjs'
import {classificarDireito} from './acervo-publico/agente-direito-classificador.mjs'
import {classificarTI} from './acervo-publico/agente-ti-regras.mjs'
const item='O contrato administrativo deve ser executado integralmente.'
const comando='Acerca dos serviços públicos, julgue os itens a seguir.'
const q={banca:'CEBRASPE',opcoes:['Certo','Errado'],numero_original:13,pagina:1,enunciado:item+'\n'+comando}
test('separa somente comando entre números consecutivos com fonte integral',()=>{
 assert.equal(separarComandoSeguinte(q,[`13 ${q.enunciado}\n14 Outro item.`]).enunciado,item)
 assert.equal(separarComandoSeguinte(q,[`13 ${q.enunciado}\n15 Outro item.`]),null)
 assert.equal(separarComandoSeguinte({...q,enunciado:'Texto diferente.'},[`13 ${q.enunciado}\n14 Outro item.`]),null)
})
test('preserva cenário do próprio item, fórmulas e itens já revisados',()=>{
 const texto=item+'\nCom relação ao paciente descrito, seu diagnóstico é grave. Julgue os itens a seguir.'
 assert.equal(separarComandoSeguinte({...q,enunciado:texto},[`13 ${texto}\n14 Outro item.`]),null)
 assert.equal(separarComandoSeguinte({...q,revisao_visual:{}},[`13 ${q.enunciado}\n14 Outro item.`]),null)
 assert.equal(separarComandoSeguinte({...q,enunciado:'Expressão /g123 inválida.\n'+comando},[`13 Expressão /g123 inválida.\n${comando}\n14 Outro item.`]),null)
})
test('recusa palavras incidentais de direito em história, economia e processo penal',()=>{
 for(const enunciado of ['A Revolução de 1930 foi antecedida por levantes contrários ao excesso da jornada de trabalho.','O Plano Real culminou com a edição da Lei de Responsabilidade Fiscal.','O magistrado recebeu a denúncia mesmo diante de excludente de ilicitude.','O contrato poderia ser substituído por carta-contrato e nota de empenho.'])assert.equal(classificarDireito({enunciado,classificacao_pendente:true}),null)
 assert.match(classificarDireito({enunciado:'A demonstração do resultado abrangente apresenta outros resultados abrangentes.',classificacao_pendente:true}).conteudo,/abrangente/)
})
test('distingue DNS e métricas de software de palavras incidentais',()=>{
 for(const enunciado of ['O root server DNS indica o endereço IP do servidor responsável pelo domínio.','A análise de pontos de função utiliza os requisitos funcionais.'])assert.equal(classificarTI({enunciado}),null)
 assert.match(classificarTI({enunciado:'O Windows 10 permite fixar pastas no explorador de arquivos.'}).conteudo,/Windows/)
})
test('não classifica endereço de site como HTML nem contrato como remuneração de pessoas',()=>{
 for(const enunciado of ['Leia as fotografias: cruzeiros.com.br/viagem html. A hospitalidade é importante.','Não compete ao avaliador de imóveis analisar a documentação jurídica do bem.','A remuneração variável da contratada consta do instrumento convocatório.','O roteamento dinâmico de microsserviços pode usar Zuul.'])assert.equal(classificarTI({enunciado}),null)
})
