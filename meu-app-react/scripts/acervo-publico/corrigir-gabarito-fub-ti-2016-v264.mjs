import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='correcao-gabarito-fub-ti-2016-v264'
const base=raizesAtuais[0]
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_013_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_013_01.pdf'
const answersText='51:C|52:E|78:C|79:C|80:E|81:C|82:C|83:E|84:E|85:C|86:C|87:E|88:C|90:C|92:C|110:C|111:E|113:C|114:E|115:C'
const answers=new Map(answersText.split('|').map(x=>{const [n,a]=x.split(':');return[Number(n),a]}))
const ids=new Map([[79,'extr-2a8ba3c0f27b3b94be0c'],[80,'extr-fca9a7bc4bea9ad994ad'],[82,'extr-12c809dbcbbf851d4a0d'],[86,'extr-b656c6b85f8e5b851851'],[87,'extr-88ca87645974ae6d00e4'],[88,'extr-69c7110ba0b6db322915']])
const dir=path.join(base)
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'),'utf8'))
const touched=m.lotes.filter(x=>x.arquivo.includes('revisao-fub-ti-2016-pendencias-v263'))
const current=new Map()
for(const lot of touched){const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(dir,lot.arquivo))));for(const q of qs)if([...ids.values()].includes(q.id))current.set(q.numero_original,q)}
if(current.size!==6)throw Error(`Esperava 6 registros para correção, encontrei ${current.size}`)
const keyHash=createHash('sha256').update(answersText).digest('hex')
const decisoes=[...ids].map(([numero,id])=>{
  const q=current.get(numero),answer=answers.get(numero)
  if(!q||q.id!==id||!answer)throw Error(`Item ${numero} não localizado ou resposta ausente`)
  return {id,sha256_enunciado:hashRevisao(q.enunciado),resposta_correta:answer==='C'?0:1,gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_013_01.pdf',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_20_itens_revisados; nao_e_hash_do_pdf',numero,pagina:1,resposta:answer,criterio:'Correção cotejada com a sequência do gabarito oficial definitivo do Cargo 13 — Técnico de Tecnologia da Informação.'}}
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`

### Retificação de gabarito FUB 2016 — v264

- Na validação cruzada do pacote v263, retifiquei as respostas dos itens 79, 80, 82, 86, 87 e 88 para coincidir com o gabarito definitivo do Cargo 13. Os demais campos revisados foram preservados.
- Alteração local, não publicada na nuvem.
- Fontes oficiais: [caderno do Cargo 13](<${prova}>), [gabarito definitivo](<${chave}>).
`)
console.log(JSON.stringify({...report,retificadas:[...ids.keys()],publicacao:'local'},null,2))
