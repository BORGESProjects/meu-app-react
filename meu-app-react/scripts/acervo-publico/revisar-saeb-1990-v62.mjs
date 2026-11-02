import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'

const base=raizesAtuais[0]
const itens=JSON.parse(await fs.readFile('tmp/saeb-pendencias-contexto.json','utf8'))
const mirror='https://pt.scribd.com/document/889247906/Manual-Saeb-1990-Anexo-Manuais-e-Instrumentos-relatorio-Preliminar-Do-Sistema-de-Avaliacao-Do-Ensino-Publico-de-Primeiro-Grau'
const inep='https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb/documentos-edicoes-antigas'
const corrigidos=new Map([
 ['182:1','O rapaz foi escolhido para sacrificar o canário porque pensavam que ele'],
 ['185:26','Marcelo ______ há dois dias.'],
 ['186:30','Não estou ______ bem por causa da ______, que torna tudo cinzento.'],
 ['189:9','(3 726 : 18) · 10 é igual a'],
 ['204:20','Os bombeiros chegaram, mas não conseguiram apagar o fogo. A conjunção que substitui MAS, sem alterar o sentido da oração grifada, é'],
 ['206:30','As informações que você obteve serão, no futuro, muito ______ e ______.'],
 ['209:11','3a² − 12 é igual a'],
])

function disciplina(p){
 if(p>=182&&p<=186||p>=201&&p<=206)return 'Língua Portuguesa'
 if(p>=189&&p<=192||p>=208&&p<=213)return 'Matemática'
 if(p>=194&&p<=199||p>=215&&p<=220)return 'Ciências'
 throw Error(`Página sem bloco disciplinar: ${p}`)
}
function conteudo(d,p,n,s){
 const t=s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase()
 if(d==='Língua Portuguesa'){
  if((p<=184&&n<=6)||(p>=201&&p<=202&&n<=6))return 'Leitura e interpretação: compreensão de texto, inferência e vocabulário contextual'
  if(p===183&&n>=7&&n<=12)return 'Fonologia: separação silábica, tonicidade e encontros vocálicos'
  if(p===184&&n>=13&&n<=15)return 'Morfossintaxe: tipos de frase e pontuação expressiva'
  if(/substantivo/.test(t))return 'Morfologia: substantivos'
  if(/pronome/.test(t))return 'Morfologia: pronomes'
  if(/adjetivo/.test(t))return 'Morfologia: adjetivos'
  if(/silab|oxit|proparox|dissilab|ditongo|hiato/.test(t))return 'Fonologia: estrutura e classificação das palavras'
  if(/sujeito|predicado|vocativo|objeto direto|adjunto adnominal|adjunto adverbial|oração|período/.test(t))return 'Sintaxe: termos da oração e período'
  if(/conjunção|mas,|coordenadas|assindéticas/.test(t))return 'Sintaxe: coordenação e relações de sentido'
  if(/verbo|professor|diretor|cajus|horas|eleições|intimida|proposta|devia|marcelo/.test(t))return 'Morfossintaxe: flexão e concordância verbal e nominal'
  if(/concerto|conserto|enxerg|fumaca|fumaça|plural|pãez|degrau/.test(t))return 'Ortografia e convenções da escrita'
  return 'Morfossintaxe: classes de palavras e concordância'
 }
 if(d==='Matemática'){
  if(/primo|divisor|divisível|mínimo múltiplo|máximo divisor/.test(t))return 'Aritmética: divisibilidade, números primos e múltiplos'
  if(/fração|\d\/\d|decimal|0,|,75/.test(t))return 'Números racionais: frações e números decimais'
  if(/metro|centímetro|cm|m3|dm3|volume|litro|quilo|grama|horas|minutos|meses|cruzeiro|preço|custam/.test(t))return 'Grandezas e medidas: conversões e problemas com medidas'
  if(/perímetro|área|quadrado|retângulo|trapézio|triângulo|ângulo|hexágono|paralelogramo/.test(t))return 'Geometria plana: figuras, perímetro e ângulos'
  if(/equação|sistema|conjunto verdade|desigualdade|\bx\b|polinômio/.test(t))return 'Álgebra: expressões, equações e sistemas'
  if(/multiplica|divid|soma|subtra|igual a/.test(t))return 'Aritmética: operações com números naturais e racionais'
  return 'Aritmética e resolução de problemas'
 }
 if(/solo|erosão|argiloso|fertiliz|açude|reflorest/.test(t))return 'Ciências da Terra: solo, erosão e conservação ambiental'
 if(/água|sifão|vapor|condens|filtração|destila|pressão|montanha|ar ocupa|oxigênio|nitrogênio|combustão|vela|extintor/.test(t))return 'Ciências físicas e químicas: ar, água, matéria e transformações'
 if(/recurso natural|poluente|poluição|ecológica|germinar|semente|planta|fotossíntese|vegetal|raiz/.test(t))return 'Ecologia e botânica: ambiente, recursos naturais e plantas'
 if(/vacina|anticorpo|doença|lombriga|solitária|esquistoss|tétano|chagas|tuberculose|barbeiro|parasita/.test(t))return 'Biologia e saúde: imunização, doenças e parasitoses'
 if(/dente|arcada|coluna vertebral|vértebra|osso|vitamina|músculo|diafragma|respira|circulação|sangue|plasma|hemácia|urinário|digest|proteína|órgão|gameta|reprodu|sentido|retina|audi|nervoso|cerebelo|meninges|alimento/.test(t))return 'Biologia: corpo humano, sistemas e saúde'
 return 'Ciências: ambiente, matéria e seres vivos'
}
function dificuldade(d,p,n,s){
 const t=s.toLowerCase()
 const medio=d==='Matemática'&&(/sistema|equação|trapézio|paralelogramo|convers|perímetro|peça de roupa|quilo|ângulo|fração/.test(t)||p===210||p===212)
  ||d==='Língua Portuguesa'&&((p>=201&&p<=204&&n<=6)||/infer|interpreta|adjunto|oração/.test(t))
 return medio?'Média':'Fácil'
}
const decisoes=itens.map(q=>{
 assert.ok(q.opcoes?.length===4,`Alternativas incompletas em ${q.id}`)
 const imagem=`paginas/5c5123afb1efa4b7-${String(q.p).padStart(4,'0')}.webp`
 assert.ok(existsSync(path.resolve('public/acervo-extraido',imagem)),`Imagem da página ${q.p} ausente em ${q.id}`)
 const materia=disciplina(q.p)
 const apoio=[]
 if(materia==='Língua Portuguesa'&&q.p>=182&&q.p<=184&&q.num<=18)apoio.push({pagina:181,imagem:'paginas/5c5123afb1efa4b7-0181.webp',texto:'Texto-base “Caso de Canário”, página anterior do mesmo caderno.'})
 if(materia==='Língua Portuguesa'&&q.p>=201&&q.p<=204&&q.num<=21)apoio.push({pagina:201,imagem:'paginas/5c5123afb1efa4b7-0201.webp',texto:'Texto-base “Brinquedos incendiados”, de Cecília Meireles, na página original do caderno.'})
 const key=`${q.p}:${q.num}`
 const p={id:q.id,sha256_enunciado:createHash('sha256').update(q.stem).digest('hex'),materia,conteudo:conteudo(materia,q.p,q.num,q.stem),ano:1990,dificuldade:dificuldade(materia,q.p,q.num,q.stem),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica baseada no nível indicado no caderno (5ª/7ª série), na quantidade de etapas e no tipo de raciocínio; não representa estatística oficial de acertos.',motivo:`Caderno identificado visualmente pelo código disciplinar e série na página ${q.p}; conteúdo e alternativas confrontados com a página original. A correspondência integral do texto do teste no documento intitulado SAEB 1990 sustenta o ano; o catálogo histórico do Inep inclui as edições 1990–1995.`,classificacao_fonte:{materia:`Código impresso do caderno e comando da questão ${q.num}, página ${q.p}`,pagina:q.p,url:mirror,fonte_oficial:inep}}
 if(apoio.length)p.imagens_contexto=apoio
 p.visual={pagina:q.p,imagem,...(corrigidos.has(key)?{enunciado:corrigidos.get(key)}:{}),motivo:corrigidos.has(key)?'Enunciado reconstruído por leitura visual da página original; corrigido OCR com mistura do item seguinte e preservadas as quatro alternativas transcritas.':'Página original conferida para alinhar o caderno e a questão; alternativas já estavam transcritas e foram mantidas.'}
 return p
})
assert.equal(decisoes.length,137)
const r=await aplicarRevisoesIndividuais({nome:'revisao-saeb-1990-v62',base,decisoes})
console.log(JSON.stringify({...r,ano:1990,ano_evidencia:'correspondência do teste no documento identificado como edição 1990; histórico oficial Inep',enunciados_reconstruidos:corrigidos.size,textos_base_ligados:decisoes.filter(x=>x.imagens_contexto).length,alternativas_conferidas:decisoes.length*4,gabarito_preservado:'sem gabarito oficial vinculado; não inferido'}))
