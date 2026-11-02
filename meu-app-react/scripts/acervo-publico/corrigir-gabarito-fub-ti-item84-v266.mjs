import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { lerArquivoAtual } from './acervo-atual.mjs'

const nome='correcao-gabarito-fub-ti-item84-v266',base=raizesAtuais[0],dir=path.join(base)
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_013_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_013_01.pdf'
const id='extr-e1f9c63509594eea59d6',answersText='51:C|52:E|78:C|79:C|80:E|81:C|82:C|83:E|84:E|85:C|86:C|87:E|88:C|90:C|92:C|110:C|111:E|113:C|114:E|115:C'
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'),'utf8'));let qAtual
for(const lot of m.lotes.filter(x=>/revisao-fub-ti-2016-pendencias-v263|consolidacao-fub-ti-2016-itens-79-88-v265/.test(x.arquivo))){const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo)));qAtual=qs.find(q=>q.id===id)||qAtual}
if(!qAtual)throw Error('Item 84 não localizado no lote atual')
const sha=createHash('sha256').update(answersText).digest('hex')
const decisoes=[{id,sha256_enunciado:hashRevisao(qAtual.enunciado),resposta_correta:1,gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_013_01.pdf',sha256:sha,sha256_tipo:'sha256_da_transcricao_canonica_dos_20_itens_revisados; nao_e_hash_do_pdf',numero:84,pagina:1,resposta:'E',criterio:'Gabarito oficial definitivo do Cargo 13 — Técnico de Tecnologia da Informação.'}}]
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n### Retificação de gabarito FUB 2016 — item 84 — v266\n\n- Corrigi o gabarito do item 84 para “Errado” após cotejo com a chave definitiva do Cargo 13.\n- Alteração local, não publicada na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${chave}>).\n`)
console.log(JSON.stringify({...report,item:84,resposta:'Errado',publicacao:'local'},null,2))
