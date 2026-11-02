import test from 'node:test'
import assert from 'node:assert/strict'
import {avaliarTipoDocumento} from './acervo-publico/tipo_documento_fonte.mjs'
test('listas de convocação e critérios de títulos não são cadernos',()=>{
 assert.equal(avaliarTipoDocumento({arquivo:'fuvest_2019_chamada_5.pdf'}).auxiliar,true)
 assert.equal(avaliarTipoDocumento({tipo_catalogo:'Melhores Treineiros'}).auxiliar,true)
 assert.equal(avaliarTipoDocumento({arquivo:'anexo-v-prova-de-titulos-1680289998.pdf'}).auxiliar,true)
})
test('metadados oficiais distinguem discursivas e padrões de resposta',()=>{
 assert.equal(avaliarTipoDocumento({tipo_catalogo:'Caderno de prova discursiva'}).discursivo,true)
 assert.equal(avaliarTipoDocumento({tipo_catalogo:'Padrão de resposta'}).auxiliar,true)
 assert.equal(avaliarTipoDocumento({tipo_catalogo:'Expectativa de resposta Enade'}).auxiliar,true)
 assert.deepEqual(avaliarTipoDocumento({tipo_catalogo:'Caderno de prova objetiva - Tipo Padrão'}),{auxiliar:false,discursivo:false})
})
