import fs from 'node:fs/promises'
import path from 'node:path'
import {build,loadEnv} from 'vite'
import {raiz,caminhoPublico,sha256} from './empacotar-acervo.mjs'

// Somente a configuração pública do Supabase é embutida no aplicativo.
let publica={}
try {publica=JSON.parse(await fs.readFile(path.join(raiz,'native/config.public.json'),'utf8'))} catch(e) {if(e.code!=='ENOENT')throw e}
const env = {...publica,...loadEnv('production',raiz,'VITE_'),...process.env}
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) throw Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY públicas para compilar o aplicativo.')
if (/service_role|sb_secret_/u.test(env.VITE_SUPABASE_ANON_KEY)) throw Error('Nunca use uma chave secreta no aplicativo.')
if (env.VITE_SUPABASE_ANON_KEY.split('.').length === 3) {
  const payload=JSON.parse(Buffer.from(env.VITE_SUPABASE_ANON_KEY.split('.')[1],'base64url'))
  if (payload.role !== 'anon') throw Error('O aplicativo requer a chave pública anon.')
}
const origem = path.join(raiz,'native/acervo'), destino = path.join(raiz,'dist-native')
const manifesto = JSON.parse(await fs.readFile(path.join(origem,'manifesto.json'),'utf8'))
const questoes = await fs.readFile(path.join(origem,'questoes.json'))
if (manifesto.questoes !== 25495 || sha256(questoes) !== manifesto.sha256) throw Error('Pacote de 25.495 questões ausente ou alterado. Execute app:acervo com as fontes conferidas.')
await import('./preparar-leitor-edital.mjs')
await build({configFile:path.join(raiz,'vite.native.config.js'),define:{
  'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(env.VITE_SUPABASE_URL),
  'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
}})
await fs.mkdir(path.join(destino,'offline'),{recursive:true})
await fs.copyFile(path.join(origem,'questoes.json'),path.join(destino,'offline/questoes.json'))
await fs.copyFile(path.join(origem,'manifesto.json'),path.join(destino,'offline/manifesto.json'))
for (const r of manifesto.recursos) {
  const arquivo = r.url.startsWith('/native-media/') ? path.join(raiz,'native/media',path.basename(r.url)) : caminhoPublico(r.url)
  const bytes = await fs.readFile(arquivo)
  if (sha256(bytes) !== r.sha256) throw Error('Imagem alterada ou incompleta: '+r.url)
  const para = path.join(destino,r.url.slice(1))
  await fs.mkdir(path.dirname(para),{recursive:true});await fs.writeFile(para,bytes)
}
for (const nome of ['favicon.svg','leitura-editais','acervo-provas']) {
  try { await fs.cp(path.join(raiz,'public',nome),path.join(destino,nome),{recursive:true}) }
  catch (erro) { if (erro.code !== 'ENOENT') throw erro }
}
// As fontes do sistema funcionam offline; não faz requisição a fontes externas.
const html=await fs.readFile(path.join(destino,'index.html'),'utf8')
await fs.writeFile(path.join(destino,'index.html'),html.replace(/<link[^>]+fonts\.googleapis\.com[^>]+>/gu,''))
console.log(`Aplicativo preparado: ${manifesto.questoes} questões e ${manifesto.recursos.length} recursos visuais verificados.`)
