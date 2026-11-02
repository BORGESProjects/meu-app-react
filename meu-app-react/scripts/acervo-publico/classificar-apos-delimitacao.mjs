import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {lotesAtuais} from './acervo-atual.mjs'
import {classificarDireito} from './agente-direito-classificador.mjs'
import {classificarTI} from './agente-ti-regras.mjs'
import {classificarObjetoExplicito} from './classificar_objeto_explicito.mjs'
const propostas=[],amostras={},pendencias=[],sha=x=>createHash('sha256').update(x).digest('hex')
for await(const {questoes} of lotesAtuais())for(const q of questoes){
 const t=String(q.enunciado||'')
 if(q.integridade_profissional?.apta_resolucao!==false&&/\bJUSTIFICATIVA\s*[:–-]/iu.test(t))pendencias.push({id:q.id,documento:q.documento_id,pagina:q.pagina_imagem,motivo:'justificativa_possivelmente_revela_resposta_no_enunciado',enunciado:t})
 if(!q.revisao_delimitacao||!q.classificacao_pendente||q.classificacao_revisada||q.integridade_profissional?.apta_resolucao===false)continue
 if(/\b(?:julgue|justificativa|gabarito)\b/iu.test(t)||/^\s*\d{1,3}[.\s]+\S/mu.test(t))continue
 const cs=[classificarDireito(q),classificarTI(q),classificarObjetoExplicito(q)].filter(Boolean)
 if(!cs.length||new Set(cs.map(c=>c.materia+'|'+c.conteudo)).size!==1)continue
 const {regra,...depois}=cs[0]
 const p={id:q.id,sha256_enunciado:sha(t),antes:{materia:q.materia,conteudo:q.conteudo,classificacao_pendente:q.classificacao_pendente},depois,enunciado:t}
 propostas.push(p);const k=depois.materia+' | '+depois.conteudo;(amostras[k]??=[]).push(p)
}
const grupos=Object.fromEntries(Object.entries(amostras).map(([k,a])=>[k,{total:a.length,amostras:[a[0],a[Math.floor(a.length/2)],a.at(-1)]}]))
await fs.writeFile('docs/acervo/revisao-profissional/apos-delimitacao-candidatos.json.gz',zlib.gzipSync(JSON.stringify(propostas)))
await fs.writeFile('docs/acervo/revisao-profissional/apos-delimitacao-amostras.json',JSON.stringify(grupos,null,2))
await fs.writeFile('docs/acervo/revisao-profissional/justificativas-no-enunciado.json.gz',zlib.gzipSync(JSON.stringify(pendencias)))
console.log(JSON.stringify({candidatas:propostas.length,grupos:Object.keys(grupos).length,justificativas_no_enunciado:pendencias.length,publicado:false}))
