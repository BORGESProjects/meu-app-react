import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='vincular-gabarito-enem-caderno10-lote-v430'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD10.pdf'
const respostas={'1e':'A','1s':'D','2e':'A','2s':'A','3e':'C','4e':'E','4s':'D','5e':'A','5s':'D',6:'D',7:'B',8:'E',9:'D',10:'A',11:'D',12:'E',13:'E',14:'B',15:'D',16:'D',17:'B',18:'D',19:'B',20:'B',21:'C',22:'E',23:'E',24:'C',25:'B',26:'D',27:'C',28:'B',29:'A',30:'D',31:'D',32:'D',33:'C',34:'B',35:'D',36:'E',37:'D',38:'D',39:'C',40:'E',41:'C',42:'B',43:'E',44:'C',45:'E',46:'A',47:'C',48:'B',49:'C',50:'A',51:'D',52:'C',53:'E',54:'D',55:'B',56:'A',57:'E',58:'C',59:'E',60:'D',61:'A',62:'D',63:'B',64:'A',65:'D',66:'B',67:'E',68:'B',69:'C',70:'D',71:'A',72:'D',73:'A',74:'B',75:'C',76:'D',77:'E',78:'A',79:'B',80:'C',81:'A',82:'E',83:'D',84:'E',85:'B',86:'B',87:'C',88:'E',89:'C',90:'E'}
const idioma={'extr-6079f936b06b609b9810':'1e','extr-03da985c4c6162ad3c3d':'1s','extr-2138b19519cfd837141f':'2e','extr-671854bee06c8197d387':'2s','extr-4bf658ad9b79fea56254':'3e','extr-85e702a85fc65fdaeb9d':'4e','extr-8761b7594fce0336f917':'4s','extr-1be8981bbc59fdf430a7':'5e','extr-ef265fdd3b67142a85c4':'5s'}
const canonical=Object.entries(respostas).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true})).map(([n,v])=>`${n}:${v}`).join('\n')
const digest=createHash('sha256').update(`INEP|ENEM2024|D1|CD10|ROXO|GABARITO_OFICIAL\n${canonical}`).digest('hex')
const source='docs/acervo/revisao-profissional/revisao-enem-2024-caderno10-ampliada-lote-v429-alteracoes.json.gz'
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile(source)))
const decisions=audit.map(x=>structuredClone(x.decisao)).filter(d=>d.apta_resolucao)
if(decisions.length!==67)throw Error('Esperados 67 itens objetivos para vincular ao gabarito oficial.')
for(const d of decisions){
 const key=respostas[idioma[d.id]||String(d.numero)]
 if(!key||d.gabarito_oficial.valor!==key)throw Error(`Gabarito não confere na questão ${d.numero} (${d.id}).`)
 d.sha256_enunciado=hashRevisao(d.enunciado)
 d.gabarito_oficial={...d.gabarito_oficial,sha256:digest,sha256_tipo:'transcricao_canonica_da_tabela_oficial',metodo:'SHA-256 da transcrição canônica das respostas publicadas no PDF oficial do INEP; não é hash dos bytes do arquivo.'}
}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({questoes:67,gabarito,sha256_transcricao_oficial:digest,nao_e_hash_do_pdf:true},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:'bd0aa14272cba87e',questoes_com_correcao_automatica:67,gabarito_oficial:gabarito,sha256_transcricao_oficial:digest,sha256_tipo:'transcricao_canonica_da_tabela_oficial',nao_e_hash_do_pdf:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
