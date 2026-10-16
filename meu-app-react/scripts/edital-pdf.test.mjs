import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs'
import {linhasPdf,faixaProgramatica,extrairPrograma} from '../src/editalPdf.js'
import {acrescentarConteudos} from '../src/editais.js'
const paginas=linhas=>[{numero:1,linhas:linhas.map(texto=>({texto,y:200,altura:800}))}]
const fontes=JSON.parse(readFileSync(new URL('./fixtures/editais/fontes.json',import.meta.url),'utf8'))

async function ler(nome) {
  const bytes=readFileSync(new URL('./fixtures/editais/'+nome,import.meta.url))
  assert.equal(createHash('sha256').update(bytes).digest('hex'),fontes.find(f=>f.arquivo===nome).sha256)
  const loading=getDocument({data:new Uint8Array(bytes),disableFontFace:true,isEvalSupported:false})
  try {
    const doc=await loading.promise,out=[]
    for(let i=1;i<=doc.numPages;i++){
      const p=await doc.getPage(i),v=p.getViewport({scale:1})
      out.push({numero:i,...linhasPdf((await p.getTextContent()).items,v.width,v.height)})
    }
    return out
  }finally{await loading.destroy()}
}

test('edital oficial em duas colunas preserva 17 tópicos de Português e 24 de Matemática',async()=>{
  const ps=await ler('marinha-2026.pdf'),faixa=faixaProgramatica(ps)
  assert.deepEqual(faixa,{inicio:15,fim:15,detectada:true})
  assert.equal(ps[14].linhas.find(l=>l.texto==='LÍNGUA PORTUGUESA').coluna,1)
  assert.equal(ps[14].linhas.find(l=>l.texto==='MATEMÁTICA').coluna,2)
  const r=extrairPrograma(ps.filter(p=>p.numero===15))
  assert.deepEqual(r.grupos.map(g=>[g.nome,g.topicos.length]),[['Língua Portuguesa',17],['Matemática',24]])
  const port=r.grupos[0].topicos.map(t=>t.titulo).join(' '),mat=r.grupos[1].topicos.map(t=>t.titulo).join(' ')
  assert.match(port,/Gramática aplicada ao texto → Verbos.*imperativo/u)
  assert.doesNotMatch(port,/Frações|Porcentagem|Conjuntos/)
  assert.match(mat,/Transformação de Unidades de Medida → Resolver problemas/)
  assert.match(mat,/Porcentagem/)
  assert.doesNotMatch(mat,/Predicado|Substantivos|de 17/)
  assert.ok(r.grupos.every(g=>g.topicos.every(t=>t.pagina===15)))
})

test('tabela oficial com matéria centralizada recupera início e continuação entre páginas',async()=>{
  const ps=await ler('ifsertao-2026.pdf'),r=extrairPrograma(ps)
  assert.deepEqual(r.grupos.map(g=>[g.nome,g.topicos.length]),[['Engenharia Civil',10],['Logística',10]])
  const engenharia=r.grupos[0],logistica=r.grupos[1]
  assert.match(engenharia.topicos[0].titulo,/Materiais de Construção.*recicláveis/u)
  const nono=engenharia.topicos[8]
  assert.equal(nono.pagina,1);assert.equal(nono.pagina_fim,2)
  assert.match(nono.titulo,/Normas técnicas aplicadas ao concreto estrutural/)
  assert.doesNotMatch(nono.titulo,/MINISTÉRIO|SECRETARIA|INSTITUTO FEDERAL/)
  assert.match(logistica.topicos[0].titulo,/Gestão de Transporte/)
  assert.doesNotMatch(logistica.topicos.map(t=>t.titulo).join(' '),/Materiais de Construção/)
})

test('hierarquia, continuação, legislação e bibliografia são tratadas sem inventar conteúdos',()=>{
  const r=extrairPrograma(paginas(['CONTEÚDO PROGRAMÁTICO','1. PORTUGUÊS','1. Gramática','1.1. Morfologia','1.2. Sintaxe','Concordância verbal e','nominal.','BIBLIOGRAFIA','Livro do autor não é tópico','MATEMÁTICA','1 - Conjuntos','- União; interseção e comple-','mento.','2. Lei nº 8.112/1990: referência textual.']))
  assert.equal(r.grupos.length,2)
  assert.deepEqual(r.grupos[0].topicos.map(t=>t.titulo),['Gramática → Morfologia','Gramática → Sintaxe Concordância verbal e nominal.'])
  assert.equal(r.grupos[1].topicos[0].titulo,'Conjuntos → União; interseção e complemento.')
  assert.match(r.grupos[1].topicos[1].titulo,/8.112\/1990/)
  assert.ok(r.ignoradas.some(l=>l.texto.includes('Livro do autor')))
  assert.equal(extrairPrograma(paginas(['Inscrições de 01 a 30 de maio.','Cronograma de seleção.'])).grupos.length,0)
})

test('origem e progresso dos tópicos existentes sobrevivem à inclusão do PDF',()=>{
  const original=[{id:'m',nome:'Matemática',topicos:[{id:'t',titulo:'Funções',status:'concluido',prioridade:'alta',notas:'Revisado'}]}]
  const fonte={arquivo:'edital.pdf',sha256:'abc',pagina:7,pagina_fim:8,ocr:false}
  const r=acrescentarConteudos(original,[{nome:'Matemática',topicos:[{titulo:'Funções',fonte_pdf:fonte},{titulo:'Geometria',fonte_pdf:fonte}]}],()=> 'novo')
  assert.equal(r.adicionados,1);assert.equal(r.repetidos,1)
  assert.deepEqual(r.materias[0].topicos[0],original[0].topicos[0])
  assert.deepEqual(r.materias[0].topicos[1].fonte_pdf,fonte)
  assert.equal(original[0].topicos.length,1)
})

test('aliases de matéria reutilizam o grupo existente sem reiniciar suas marcações',()=>{
  const anterior=[{id:'p',nome:'Português',topicos:[{id:'t',titulo:'Crase',status:'concluido',notas:'Revisado'}]}]
  const result=acrescentarConteudos(anterior,[{nome:'Língua Portuguesa',topicos:[{titulo:'Crase'},{titulo:'Sintaxe'}]}],()=> 'novo')
  assert.equal(result.materias.length,1)
  assert.equal(result.materias[0].id,'p')
  assert.equal(result.materias[0].topicos[0].status,'concluido')
  assert.equal(result.repetidos,1)
})

test('OCR e caracteres suspeitos geram alertas e páginas sem matéria não são publicadas como tópicos',()=>{
  const ps=paginas(['PORTUGUÊS','1. Interpreta��o de textos','2. Sintaxe'])
  ps[0].ocr=true;ps[0].confianca=61
  const r=extrairPrograma(ps)
  assert.ok(r.avisos.some(a=>a.includes('baixa confiança')))
  assert.ok(r.grupos[0].topicos[0].alertas.includes('Caracteres ilegíveis'))
  assert.equal(faixaProgramatica(paginas(['Leia o conteúdo programático no Anexo III.'])).detectada,false)
})

test('coluna sem matéria fica separada para conferência em vez de contaminar outra disciplina',()=>{
  const ps=paginas(['1. Sintaxe'])
  ps[0].linhas.unshift({texto:'Português',materia:'Português'})
  ps[0].linhas.push({texto:'Matéria a conferir — coluna 2',materia:'Matéria a conferir — coluna 2'},{texto:'1. Equações',y:200,altura:800})
  const r=extrairPrograma(ps)
  assert.equal(r.grupos.length,2)
  assert.doesNotMatch(r.grupos[0].topicos.map(t=>t.titulo).join(' '),/Equações/)
  assert.ok(r.avisos.some(a=>a.includes('sem matéria identificada')))
})
