import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {publicarLote} from './publicar-lote.mjs'
import {apoioIntegradoNaFonte} from './validacao-livros.mjs'

const raiz='tmp/sae-importacao'
const inventario=JSON.parse(fs.readFileSync(raiz+'/inventario.json'))
const materias=['Química','Biologia','Física','Matemática','História','Geografia','Português']
const slug=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase()
const sha=b=>createHash('sha256').update(b).digest('hex')
const ler=p=>JSON.parse(fs.readFileSync(p))
const escrever=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')
const selecao=process.argv[2]
if(selecao&&!materias.includes(selecao))throw Error('Matéria fora do escopo autorizado')
const antigas=fs.readdirSync('docs/acervo').filter(f=>/^estudo-[a-z0-9-]+\.json$/u.test(f)&&!f.includes('-colecao.')).map(f=>ler('docs/acervo/'+f))
const anteriores=new Set(antigas.flatMap(a=>a.id_capitulo?[a.id_capitulo]:(a.capitulos||[]).map(c=>c.id)))
const snapshots=['tmp/banco-auditoria.json','tmp/acervo-publico-auditoria.json'].filter(p=>fs.existsSync(p))
const fontesAdicionais=snapshots.flatMap(ler)
const indisponiveis=fs.existsSync('docs/acervo/pendencias-livros.json')?ler('docs/acervo/pendencias-livros.json'):[]
let catalogo=fs.existsSync('src/data/livrosComplementares.json')?ler('src/data/livrosComplementares.json'):[]
for(const materia of materias.filter(m=>!selecao||m===selecao)){
 const refs=inventario.filter(g=>g.materia===materia).flatMap(g=>g.capitulos)
 const capturados=refs.map(ref=>{
  const arquivo=raiz+'/capitulos/'+ref.id+'.json'
  const impedimento=indisponiveis.find(p=>p.id===ref.id)
  if(impedimento&&!fs.existsSync(arquivo))return {id_capitulo:ref.id,captura_indisponivel:impedimento,questoes:[]}
  if(!fs.existsSync(arquivo))throw Error('Capítulo ainda não capturado: '+ref.label)
  const c=ler(arquivo)
  if(c.questoes.length!==c.quantidade_inicios)throw Error('Contagem de captura incompleta: '+ref.id)
  if(!c.arquivos.some(a=>a.tipo==='image'||a.tipo==='stylesheet'))throw Error('Recuperar os recursos originais: '+ref.id)
  return {...c,arquivo}
 })
 const novos=capturados.filter(c=>!c.captura_indisponivel&&!anteriores.has(c.id_capitulo))
 const pasta='estudo-'+slug(materia)+'-colecao'
 const apoioIntegradoIds=new Set(novos.flatMap(c=>c.questoes.filter(apoioIntegradoNaFonte).map(q=>q.id)))
 const auditoria=publicarLote({pasta,definicoes:novos.map(c=>[c.id_capitulo,c.capitulo]),fontesAdicionais,apoioIntegradoIds})
 const arquivo='public/acervo/'+pasta+'/questoes.json'
 const lote=ler(arquivo)
 // Sem alterar a representação: reduz somente os espaços de indentação do JSON.
 fs.writeFileSync(arquivo,JSON.stringify(lote)+'\n')
 auditoria.fontes=novos.map(c=>({id:c.id_capitulo,materia:c.materia,grupo:c.grupo,capitulo:c.capitulo,url:c.url,sha256:sha(fs.readFileSync(c.arquivo)),registros:c.questoes.length,gabaritos:c.questoes.filter(q=>q.resposta_correta!==null).length,imagens_pendentes:c.imagens_pendentes?.length||0}))
 auditoria.validacao={metodo:'Conferência estrutural contra a captura original, marcação única do gabarito, resolução explícita quando disponível, recursos locais, referências e deduplicação. Não equivale à resolução independente de cada exercício.',snapshots:snapshots.map(p=>({arquivo:p.split('/').at(-1),sha256:sha(fs.readFileSync(p))})),capitulos_ja_processados:capturados.filter(c=>anteriores.has(c.id_capitulo)).map(c=>c.id_capitulo)}
 auditoria.capturas_indisponiveis=capturados.filter(c=>c.captura_indisponivel).map(c=>c.captura_indisponivel)
 if(auditoria.total_extraido!==auditoria.publicados.length+auditoria.quarentena.length+auditoria.duplicatas.length)throw Error('Registros sem destinação no relatório: '+materia)
 escrever('docs/acervo/'+pasta+'.json',auditoria)
 const dados={materia,url:'/acervo/'+pasta+'/questoes.json',quantidade:lote.length,sha256:sha(fs.readFileSync(arquivo))}
 catalogo=[...catalogo.filter(l=>l.materia!==materia),dados]
 catalogo.sort((a,b)=>materias.indexOf(a.materia)-materias.indexOf(b.materia))
 escrever('src/data/livrosComplementares.json',catalogo)
}
