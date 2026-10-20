import fs from 'node:fs'
import {dadosDaProva, incluirConfiguracao, idiomaDaQuestao} from '../src/simulados.js'
import {concursosDaQuestao, questaoNaProva} from '../src/provasCompartilhadas.js'

// Apenas lotes reconstruídos de cadernos e gabaritos, nunca coleções de exercícios.
const fontes = fs.readdirSync('public/acervo').filter(n => /^(?:ufpr-|utfpr-|ufrgs-|uem-|ifpr-|pf-|prf-|enem-2017-2021$|cfn-2020-2025$|espcex-2017-2026$|pucpr-)/.test(n))
const grupos = new Map()
for (const fonte of fontes) {
  const caminho = `public/acervo/${fonte}/questoes.json`
  if (!fs.existsSync(caminho)) continue
  for (const q of JSON.parse(fs.readFileSync(caminho,'utf8'))) {
    for (const concurso of concursosDaQuestao(q)) {
      const item = questaoNaProva(q, concurso), dados = dadosDaProva(item)
      if (!grupos.has(dados.id)) grupos.set(dados.id, {...dados, fonte: caminho, registros: []})
      grupos.get(dados.id).registros.push(item)
    }
  }
}
for (const fonte of ['src/data/esa2025.json','src/data/enem2022.json']) {
  for (const q of JSON.parse(fs.readFileSync(fonte,'utf8'))) {
    const dados = dadosDaProva(q)
    if (!grupos.has(dados.id)) grupos.set(dados.id,{...dados,fonte,registros:[]})
    grupos.get(dados.id).registros.push(q)
  }
}
function totalEsperado(g) {
  const q=g.registros[0], ano=Number(g.ano)
  if(g.banca==='UFPR') return [2021,2022].includes(ano)?60:90
  if(g.banca==='UTFPR') return ano===2026?40:60
  if(g.banca==='ENEM') return 90
  if(g.banca==='EsPCEx') return Number(q.dia)===1?44:56
  if(g.banca==='CFN') return 50
  if(g.banca==='IFPR') return 50
  if(g.banca==='PF'||g.banca==='PRF') return 120
  if(g.banca==='UEM') return ano<=2020 && Number(q.dia)===1?40:50
  if(g.banca==='UFRGS') return /1º dia/.test(q.modelo)?(ano===2025?75:60):(ano===2025?60:75)
  if(g.banca==='ESA') return 50
  if(/PUC/.test(g.banca)) return 60
  return null
}
const catalogo=[], excluidas=[]
for(const g of grupos.values()) {
  const total=totalEsperado(g)
  // A escolha padrão é só uma checagem inicial. A aplicação valida novamente cada configuração.
  const idioma = ['Inglês','Espanhol','Francês'].find(lingua => g.registros.filter(q=>incluirConfiguracao(q,lingua)).length === total) || 'Inglês'
  const selecionadas=g.registros.filter(q=>incluirConfiguracao(q,idioma))
  const ids = new Set(selecionadas.map(q=>q.id))
  if(!total || ids.size!==total || selecionadas.some(q=>q.prova_incompleta)) { excluidas.push([g.prova,ids.size,total]); continue }
  const {registros,...dados}=g
  const itens=[...new Map(registros.map(q=>[q.id,[String(q.id),idiomaDaQuestao(q),q.bloco_especifico||'']])).values()]
  catalogo.push({...dados,totalOriginal:total,itens})
}
fs.writeFileSync('src/data/provasCompletas.json',JSON.stringify(catalogo))
console.log(JSON.stringify({provas:catalogo.length,excluidas},null,2))
