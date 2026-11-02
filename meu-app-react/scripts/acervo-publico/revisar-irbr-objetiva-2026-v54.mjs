import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'

const documento='37cd2cc9f2c15e37'
const url='https://cdn.cebraspe.org.br/concursos/IRBR_26_DIPLOMACIA/arquivos/9AFA463453FEF0A89EBB56387CCC39386F5B09A3A84D342A4112BB6B1339E891.pdf'
const secoes=[
  [[1,9],'Língua Portuguesa','Interpretação de texto sobre cartografia histórica, demarcação de terras indígenas, referenciação, sintaxe e ortografia'],
  [[10,15],'Língua Portuguesa','Leitura de carta de Antônio Vieira: gênero epistolar, interpretação, figuras de linguagem, sintaxe e concordância'],
  [[16,20],'Língua Portuguesa','Compreensão e interpretação de narrativa brasileira; relações entre escolarização, vida rural e cultura afro-brasileira'],
  [[21,30],'Língua Portuguesa','Leitura comparativa de Voltaire e Machado de Assis; gêneros, figuras de linguagem, estilo, sintaxe e efeitos de sentido'],
  [[31,35],'Língua Portuguesa','Teoria e crítica literária: redução estrutural, autonomia estética e relações entre literatura e sociedade em Antonio Candido'],
  [[36,40],'Língua Portuguesa','Teoria literária e interpretação de texto crítico: representação, antítese e realismo na Divina Comédia segundo Erich Auerbach'],
  [[41,45],'História do Brasil','Independência, escravidão, formação do Estado nacional e crise do regime monárquico'],
  [[46,65],'História do Brasil','Primeira República (1889–1930): política externa, Rio Branco, movimentos militares, tenentismo e transformações republicanas'],
  [[66,70],'História do Brasil','História política republicana: período Vargas, democracia de 1946, regime militar, bipartidarismo e redemocratização'],
  [[71,76],'História Mundial','Periodização da Época Moderna e Revoluções Americana, Francesa e Haitiana; Antigo Regime e modernidade'],
  [[77,83],'História Mundial','Revoluções do século XVIII, Revolução Industrial, economia mundial moderna e interpretações dos modos de produção'],
  [[84,86],'História Mundial','Imperialismo europeu, unificações nacionais e rivalidades entre potências no fim do século XIX e início do XX'],
  [[87,89],'História Mundial','Guerra de Secessão dos Estados Unidos e centralidade da escravidão no conflito'],
  [[90,92],'História Mundial','Unificações da Alemanha e da Itália; Bismarck, irredentismo e socialismo no Império Alemão'],
  [[93,95],'História Mundial','Fascismo italiano, nazismo, propaganda e perseguição política na Europa do século XX'],
  [[96,98],'Geografia','Pensamento geográfico: correntes tradicionais e pragmáticas, positivismo e geopolítica do espaço vital'],
  [[99,101],'Geografia','Geografia da população: IDH, migrações internas e deslocamentos forçados contemporâneos'],
  [[102,103],'Geografia','Globalização, blocos econômicos, BRICS e pensamento de Milton Santos'],
  [[104,105],'Geografia','Agricultura mundial e agronegócio: territorialização de monopólios e sistemas agroalimentares'],
  [[106,108],'Geografia','Estrutura fundiária brasileira, agricultura familiar, Lei de Terras e campesinato'],
  [[109,117],'Geografia','Política e gestão ambiental no Brasil: zoneamento, SISNAMA, justiça climática, governança e competências federativas'],
  [[118,120],'Geografia','Urbanização, metropolização, conurbação e regiões metropolitanas no Brasil'],
]
const manifesto=JSON.parse(await lerArquivoAtual('manifesto.json'))
const base=raizesAtuais[0],decisoes=[]
for(const lote of manifesto.lotes){
  const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
  for(const q of qs){
    if(q.documento_id!==documento||!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)continue
    const n=Number(q.numero_original),regra=secoes.find(([[de,ate]])=>n>=de&&n<=ate)
    if(!regra)throw Error(`Sem tema para o item ${q.numero_original}`)
    if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo incompatível no item ${q.numero_original}`)
    if(q.ano&&Number(q.ano)!==2026)throw Error(`Ano divergente no item ${q.numero_original}: ${q.ano}`)
    if(q.banca!=='CEBRASPE')throw Error(`Banca divergente no item ${q.numero_original}: ${q.banca}`)
    const [[de,ate],materia,conteudo]=regra
    decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,
      motivo:`Item ${n}: área e conteúdo conferidos pelo título da seção, texto-base e comando do caderno oficial IRBr/Diplomacia 2026, itens ${de}–${ate}, páginas ${q.paginas_origem?.join(', ')||q.pagina}.`,
      classificacao_fonte:{materia:`Seção temática e enunciados do caderno oficial, itens ${de}–${ate}`,pagina:q.pagina,url}})
  }
}
if(decisoes.length!==104)throw Error(`Esperadas 104 pendências aptas; encontradas ${decisoes.length}`)
await fs.writeFile('docs/acervo/revisao-profissional/revisao-semantica-v54-decisoes.json',JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome:'revisao-semantica-v54',base,decisoes})
console.log(JSON.stringify({...resultado,documento,concurso:'Instituto Rio Branco — Diplomacia — 2026',classificacoes:Object.fromEntries([...new Set(decisoes.map(d=>d.materia))].map(m=>[m,decisoes.filter(d=>d.materia===m).length]))}))
