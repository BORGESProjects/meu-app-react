import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,lotesAtuais,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'

const nome='revisao-semantica-v17',duplicado='extr-2643fb0c739de3334cfd',mantida='extr-2a4d8fa68e2fd35ba18d'
const destino=`tmp/revisao-profissional/${nome}/acervo-extraido`,m=JSON.parse(await lerArquivoAtual('manifesto.json'))
const facetas=criarIndiceFacetas();let total=0,disponiveis=0,removida=null,preservada=null,lotesAlterados=0
await fs.mkdir(path.join(destino,'lotes'),{recursive:true})
for await(const {indice,questoes,lote} of lotesAtuais()){
 const resultado=questoes.filter(q=>{if(q.id!==duplicado)return true;if(removida)throw Error('ID duplicado repetido');removida=structuredClone(q);return false})
 if(resultado.length!==questoes.length){const b=zlib.gzipSync(JSON.stringify(resultado),{level:9});const arquivo=`lotes/${nome}-${indice}-${hashRevisao(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),b);m.lotes[indice].arquivo=arquivo;m.lotes[indice].quantidade=resultado.length;lotesAlterados++}
 for(const q of resultado){total++;if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++;if(q.id===mantida)preservada=structuredClone(q)}
 facetas.adicionar(indice,resultado)
}
if(!removida)throw Error('Registro duplicado não encontrado')
if(!preservada)throw Error('Registro preservado não encontrado')
if(removida.ano!==2017||removida.numero_original!==110||removida.concurso!=='TRF 1ª Região 2017')throw Error('A identidade do candidato à duplicata mudou')
const manifestoAntes=Number(m.questoes_extraidas_unicas);if(total!==manifestoAntes-1)throw Error('Contagem inesperada após consolidação')
const disponiveisAntes=Number(m.questoes_disponiveis_resolucao);m.questoes_extraidas_unicas=total;m.questoes_encontradas_antes_de_deduplicar=Number(m.questoes_encontradas_antes_de_deduplicar);m.duplicadas_removidas=Number(m.duplicadas_removidas||0)+1;m.questoes_disponiveis_resolucao=disponiveis;m.questoes_indisponiveis_revisao=total-disponiveis;m.gerado_em=new Date().toISOString()
m.bancas=m.bancas.map(b=>b.banca==='CEBRASPE'?{...b,questoes:Math.max(0,b.questoes-1)}:b)
m.duplicatas_consolidadas=[...(m.duplicatas_consolidadas||[]),{questao_mantida:mantida,questao_consolidada:duplicado,ano:2017,concurso:'TRF 1ª Região',numero:110,criterio:'mesmo enunciado, banca, edição, número e gabarito; a segunda cópia vem do caderno adaptado 005_05 e foi consolidada com o caderno 005_01',fonte_consolidada:removida.fonte,gabarito_consolidado:removida.gabarito_oficial}]
const f=facetas.finalizar();if(f.linhas.reduce((n,r)=>n+r[6],0)!==disponiveis)throw Error('Contagem das facetas não confere')
const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),fa=`lotes/filtros-${nome}-${hashRevisao(fb).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,fa),fb);m.indice_facetas={arquivo:fa,sha256:hashRevisao(fb),versao:1}
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json'));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const normalizar=x=>x.normalize('NFC').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/giu,'');const enunciadoOriginal=removida.enunciado.split('\nJosé, vereador')[0].trim();const enunciadosIguais=normalizar(enunciadoOriginal)===normalizar(preservada.enunciado);if(!enunciadosIguais||removida.resposta_correta!==preservada.resposta_correta)throw Error('A equivalência da duplicata não foi confirmada')
const rel={gerado_em:m.gerado_em,pacote:nome,questao_removida:duplicado,questao_preservada:mantida,enunciado_normalizado_igual:enunciadosIguais,gabarito_equivalente:removida.resposta_correta===preservada.resposta_correta,total,disponiveis,antes:manifestoAntes,disponiveis_antes:disponiveisAntes,lotes_alterados:lotesAlterados,metadados_legados_observacao:'Os resumos legados detalhados de matéria e conteúdo não são usados para os filtros; o índice de facetas completo foi recalculado para o acervo consolidado.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-deduplicacao.json`,JSON.stringify(rel,null,2));await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-registro-removido.json.gz`,zlib.gzipSync(JSON.stringify(removida),{level:9}));console.log(JSON.stringify(rel))
