import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='correcao-hub-transplante-rim-item48-v498',id='extr-c143ea2882de1c4ab8e6',documento='a7ece24cd0709233'
const dir='tmp/revisao-profissional/revisao-hub-transplante-rim-v497/acervo-extraido/lotes'
let atual
for(const f of await fs.readdir(dir)){
 if(f.startsWith('filtros-'))continue
 const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(dir,f))))
 atual=qs.find(q=>q.id===id)
 if(atual)break
}
assert.ok(atual,'Questão 48 revisada não encontrada no pacote anterior')
const prova='https://cdn.cebraspe.org.br/concursos/HUB_17_RESIDENCIA/arquivos/288RMUHUB_008_01.pdf'
const enunciado='Disfunção macrocitária que dificulta a erradicação de bactérias gram-positivas faz parte da fisiopatologia de malacoplaquia renal.'
const imagem=`paginas/${documento}-${String(atual.pagina).padStart(4,'0')}.webp`
const decisao={id,sha256_enunciado:hashRevisao(atual.enunciado),materia:atual.materia,conteudo:atual.conteudo,ano:2017,concurso:atual.concurso,banca:atual.banca,organizadora:atual.organizadora,aplicacao:atual.aplicacao,cargo:atual.cargo,numero:48,numero_original:48,pagina:atual.pagina,dificuldade:atual.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:atual.dificuldade_evidencia,resposta_correta:atual.resposta_correta,anulada:false,gabarito_oficial:atual.gabarito_oficial,classificacao_fonte:prova,motivo:'Transcrição preservada conforme o caderno oficial, que imprime “macrocitária”. A troca por “macrofágica” alteraria o enunciado e poderia mudar o julgamento; por isso, mantive o texto da fonte e o gabarito definitivo E.',enunciado,texto_apoio:atual.texto_apoio,visual:{pagina:atual.pagina,imagem,enunciado,texto_apoio:atual.texto_apoio,motivo:'O enunciado foi restabelecido fielmente conforme a página original do caderno oficial; a grafia da fonte é mantida para não alterar o conteúdo avaliado.'},apta_resolucao:true,remover_pendencias:[]}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:[decisao]})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,item_corrigido:48,questoes_aptas:1,validacao_pendente:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify([decisao]),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n### Correção de fidelidade documental — HUB/UnB 2017, item 48 — v498\n\n- Restabeleci a grafia exata do caderno oficial (“macrocitária”) e mantive o gabarito definitivo E. A normalização anterior para “macrofágica” alterava o sentido da assertiva; a alteração foi revertida e registrada.\n- Fonte: [caderno oficial](${prova}). Revisão local; ainda sem publicação na nuvem.\n`)
console.log(JSON.stringify(relatorio,null,2))
