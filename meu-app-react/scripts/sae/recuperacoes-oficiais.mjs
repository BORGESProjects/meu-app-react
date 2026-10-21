// Recuperações pontuais conferidas visualmente no caderno e gabarito oficiais.
// O original capturado permanece intacto para auditoria.
const n=(tag,...children)=>({tag,attrs:{},children})
export const recuperacoesOficiais = new Map([
 ['sae-e44f51c2d0a952dd28bb', {
  recurso:'EXT21MA07099.jpg',
  formula:n('math',n('mrow',n('mn','3'),n('msup',n('mi','x'),n('mn','2')),n('mo','−'),n('mn','9'),n('mi','x'),n('mo','+'),n('mn','7'),n('mo','='),n('msup',n('mrow',n('mo','('),n('mi','x'),n('mo','−'),n('mi','a'),n('mo',')')),n('mn','3')),n('mo','−'),n('msup',n('mrow',n('mo','('),n('mi','x'),n('mo','−'),n('mi','b'),n('mo',')')),n('mn','3')))),
  resposta:0, opcoes:['3.','5.','6.','9.','12.'],
  prova:'https://www.fuvest.br/wp-content/uploads/fuvest_2020_primeira_fase_prova_V.pdf',
  gabarito:'https://www.fuvest.br/wp-content/uploads/fuvest_2020_primeira_fase_gabaritos.pdf',
  modelo:'V',numero:20,pagina:7,
 }],
])

export function recuperarFonteOficial(original){
 const r=recuperacoesOficiais.get(original.id)
 if(!r)return original
 if(original.resposta_correta!==r.resposta || JSON.stringify(original.alternativas.map(a=>a.texto.trim()))!==JSON.stringify(r.opcoes))throw Error('Recuperação oficial não corresponde às alternativas ou à chave capturada')
 const q=structuredClone(original)
 let substituicoes=0
 function recuperar(node){
  if(typeof node==='string')return node
  if(node.tag==='img'&&node.attrs?.src?.endsWith('/'+r.recurso)){substituicoes++;return structuredClone(r.formula)}
  return {...node,children:(node.children||[]).map(recuperar)}
 }
 q.enunciado_blocos=q.enunciado_blocos.map(recuperar)
 if(substituicoes!==1)throw Error('Recuperação oficial exige exatamente um recurso ausente conhecido')
 q.recuperacao_oficial={prova:r.prova,gabarito:r.gabarito,modelo:r.modelo,numero:r.numero,pagina:r.pagina}
 return q
}
