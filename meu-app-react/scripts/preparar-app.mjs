import fs from 'node:fs/promises'
import path from 'node:path'
import {build,loadEnv} from 'vite'
import {raiz,sha256} from './empacotar-acervo.mjs'
import {unirQuestoes} from '../src/acervo.js'

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
// O pacote instalado fica enxuto: questões e filtros ficam offline; imagens e
// páginas originais são carregadas da hospedagem quando solicitadas. Limpar
// antes do build também impede que cópias antigas do acervo pesado entrem nele.
await fs.rm(destino,{recursive:true,force:true})
await import('./preparar-leitor-edital.mjs')
await build({configFile:path.join(raiz,'vite.native.config.js'),define:{
  'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(env.VITE_SUPABASE_URL),
  'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
}})
await fs.mkdir(path.join(destino,'offline'),{recursive:true})
for (const nome of ['favicon.svg','leitura-editais','acervo-provas']) {
  try { await fs.cp(path.join(raiz,'public',nome),path.join(destino,nome),{recursive:true}) }
  catch (erro) { if (erro.code !== 'ENOENT') throw erro }
}
// O app nativo lê um único arquivo offline. Reaplicamos as edições atuais
// com as mesmas regras de validade e deduplicação usadas pelo site.
const origemAcervo = path.join(raiz,'public','acervo')
const pacotesAcervo = []
const questoesAtuais = JSON.parse(questoes.toString('utf8'))
for (const entrada of await fs.readdir(origemAcervo,{withFileTypes:true})) {
  if (!entrada.isDirectory()) continue
  const origemQuestoes = path.join(origemAcervo,entrada.name,'questoes.json')
  try {
    const bytes = await fs.readFile(origemQuestoes)
    const questoes = JSON.parse(bytes.toString('utf8'))
    if (!Array.isArray(questoes)) throw Error('o conteúdo não é uma lista')
    questoesAtuais.push(...questoes)
    pacotesAcervo.push({edicao:entrada.name,questoes:questoes.length,bytes:bytes.length,sha256:sha256(bytes)})
  } catch (erro) {
    if (erro.code !== 'ENOENT') throw Error(`Pacote de questões inválido em public/acervo/${entrada.name}: ${erro.message}`)
  }
}
const instaladas = unirQuestoes(questoesAtuais)
if (instaladas.length < manifesto.questoes) throw Error('O acervo atualizado perdeu questões; revise as fontes antes de compilar.')
const bytesInstalados = Buffer.from(JSON.stringify(instaladas))
await fs.writeFile(path.join(destino,'offline/questoes.json'),bytesInstalados)
await fs.writeFile(path.join(destino,'offline/manifesto.json'),JSON.stringify({
  versao:1,
  questoes:instaladas.length,
  sha256:sha256(bytesInstalados),
  bytes:bytesInstalados.length,
  midia:'sob-demanda',
  edicoes:pacotesAcervo,
},null,2))
// As fontes do sistema funcionam offline; não faz requisição a fontes externas.
const html=await fs.readFile(path.join(destino,'index.html'),'utf8')
await fs.writeFile(path.join(destino,'index.html'),html.replace(/<link[^>]+fonts\.googleapis\.com[^>]+>/gu,''))
console.log(`Aplicativo preparado: ${instaladas.length} questões offline, atualizadas com ${pacotesAcervo.length} conjuntos sem duplicar registros; imagens carregadas sob demanda.`)
