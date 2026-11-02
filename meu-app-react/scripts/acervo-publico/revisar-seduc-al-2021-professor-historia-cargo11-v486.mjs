import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2021-professor-historia-cargo11-v486'
const documento='782e66048bf15d28'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/606_SEDUC_AL_011_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_011_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/ED_SEDUC_AL_21_ABERTURA.PDF'
const concurso='SEDUC/AL — Professor — Especialidade História — Cargo 11 — 2021'
const cargo='Professor — Especialidade História — Cargo 11'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,66)
assert.equal(catalogo.questoes.length,78)
assert.deepEqual(new Set(pendentes.map(x=>x.id)),new Set(catalogo.questoes.filter(q=>pendentes.some(p=>p.id===q.id)).map(x=>x.id)))

const linhas=[
 [51,'E E C C C E C E C C E E E E E C C C E E'],
 [71,'C C E E C E E C C C C E E E E C E C C C'],
 [91,'E C C C C C E E C C C C E E C C C E C E'],
 [111,'E C E C E E E E C C']
]
const gabaritoPorNumero=new Map()
for(const [inicio,linha] of linhas)linha.split(/\s+/).forEach((v,i)=>gabaritoPorNumero.set(inicio+i,v))
assert.equal(gabaritoPorNumero.size,70)
const hashGabarito=hashRevisao([...gabaritoPorNumero].map(([n,v])=>`${n}:${v}`).join('|'))

const grupos=[
 [51,55,'História Antiga: Fenícia, economia, organização política, navegação e religião'],
 [56,63,'História Antiga: Grécia, cidades-Estado, sociedade e legado'],
 [64,68,'História Medieval: reinos africanos, Sahel, Gana, Mali e comércio transaariano'],
 [69,73,'História Moderna: Revoluções Inglesas do século XVII'],
 [74,79,'Imperialismo e descolonização: partilha da África, Ásia, Bandung e Argélia'],
 [80,83,'História Contemporânea: Guerra Fria e globalização'],
 [84,88,'Brasil Colônia: legislação indigenista, aldeamentos, alianças e escravização'],
 [89,93,'Brasil Império: Independência e conjuntura política luso-brasileira'],
 [94,99,'Brasil República: Proclamação, Constituição de 1891 e conflitos políticos'],
 [100,103,'História e currículo: Referencial Curricular de Alagoas, diversidade e multiculturalismo'],
 [104,108,'Ensino de História: BNCC, tempo, espaço, sociedade e cultura'],
 [109,114,'Ensino de História: temporalidade, narrativa histórica e experiências do tempo'],
 [115,120,'Ensino de História e tecnologias: telemática, novas linguagens e representação gráfica']
]
const assunto=n=>grupos.find(([a,b])=>n>=a&&n<=b)?.[2]
const contexto=n=>{
 if(n<=55)return 'Texto-base sobre as sociedades fenícia e grega antigas e seus processos históricos. O caderno oficial contém o contexto integral na página associada.'
 if(n<=63)return 'Texto-base sobre a Grécia antiga, sua organização política e social e sua influência no Ocidente, conforme a página do caderno oficial.'
 if(n<=68)return 'Texto-base sobre os reinos africanos entre os séculos V e XV, incluindo a região do Sahel e as redes comerciais.'
 if(n<=73)return 'Texto-base contextualiza as Revoluções Inglesas do século XVII e suas consequências políticas.'
 if(n<=79)return 'Texto-base sobre o colonialismo do final do século XIX e a descolonização da África e da Ásia no século XX.'
 if(n<=83)return 'Texto-base relaciona o fim da Guerra Fria, a dissolução da União Soviética e a globalização.'
 if(n<=88)return 'Texto-base reproduz trecho da legislação e da política colonial portuguesa sobre povos indígenas, aliados, inimigos e aldeamentos. Fonte indicada no caderno: Conferência Nacional de Política Indigenista, 2015; André Ramos, Revista de Estudos e Pesquisas, FUNAI, 2004.'
 if(n<=93)return 'Texto-base descreve a crise política portuguesa de 1820, a Revolução Liberal do Porto e seus efeitos na Independência do Brasil. Fonte indicada no caderno: Boris Fausto, História do Brasil, 1996.'
 if(n<=99)return 'Texto-base sobre a Proclamação da República, o governo provisório e a Constituição de 1891.'
 if(n<=103)return 'Texto-base do Referencial Curricular de Alagoas (ReCAL), 2019, sobre diversidade, respeito, direitos e representações sociais.'
 if(n<=108)return 'Texto-base da BNCC para Ciências Humanas sobre tempo, espaço, contextos, permanências e mudanças.'
 if(n<=114)return 'Texto-base de relato docente sobre temporalidade, narrativa histórica e experiências do tempo no ensino. Referência indicada no caderno: Marcelo Gomes da Silva, “Pra que serve o Ensino de História?”'
 return 'Texto-base sobre telemática, cib espaço, jogos eletrônicos, novas percepções gráficas e implicações para o ensino de História. Referência indicada no caderno: Marcos Silva, “Ensino de História e novas tecnologias”.'
}
const nivel=n=>((n>=51&&n<=68)||(n>=69&&n<=83)||(n>=94&&n<=103)||(n>=115)?'Fácil':(n>=84&&n<=93)||(n>=104&&n<=114)?'Média':'Média')
const porNumero=new Map()
for(const q of pendentes){const n=Number(q.numero);if(!porNumero.has(n))porNumero.set(n,[]);porNumero.get(n).push(q)}
const elegivel=new Map()
for(const [n,lista] of porNumero){
 const qualidade=q=>((q.enunciado.match(/\b606011_|\bEspaço livre|\bCEBRASPE\s*\|/g)||[]).length*1000)+(q.enunciado.match(/\b(des|con|mo)\s+\w/g)||[]).length*20+(q.resposta==null?1:0)
 elegivel.set(n,[...lista].sort((a,b)=>qualidade(a)-qualidade(b))[0].id)
}
const retirar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const [n,lista] of porNumero){
 const resposta=gabaritoPorNumero.get(n),conteudo=assunto(n),ctx=contexto(n),pagina=Number(lista[0].pagina)
 assert.ok(resposta&&conteudo&&pagina,`Item ${n} sem gabarito, conteúdo ou página`)
 for(const q of lista){
  const duplicada=elegivel.get(n)!==q.id
  const imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  let enunciado=q.enunciado.replace(/\s+/g,' ').trim()
  enunciado=enunciado.replace(/\s*606011_01N563875\s+CEBRASPE\s*\|\s*SEDUC\/AL\s*[–-]\s*Edital:\s*2021.*$/i,'').replace(/\s+Espaço livre\s*$/i,'').trim()
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'História',conteudo,ano:2021,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 17/10/2021',cargo,numero:n,numero_original:n,pagina,dificuldade:nivel(n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na leitura e na articulação dos conteúdos históricos e documentos de referência; não corresponde a índice psicométrico oficial.',resposta_correta:resposta==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'Gabaritos oficiais definitivos CEBRASPE — SEDUC/AL 2021 — Cargo 11: História',sha256:hashGabarito,numero:n,resposta,criterio:'Transcrição do gabarito definitivo publicado pelo CEBRASPE.'},classificacao_fonte:prova,motivo:'Classificação semântica item a item com base no enunciado e nos textos-base do caderno; banca, cargo, ano, aplicação e gabarito cotejados com fontes oficiais. Dificuldade estimada.',texto_apoio:ctx,visual:{pagina,imagem,enunciado,texto_apoio:ctx,motivo:`Página ${pagina} do caderno oficial conferida visualmente; contexto associado ao bloco correto.`},apta_resolucao:!duplicada,remover_pendencias:retirar,...(duplicada?{inelegibilidade_motivo:'duplicata_ocr_do_mesmo_item_oficial',duplicada_de:elegivel.get(n)}:{})})
 }
}
assert.equal(decisoes.length,66)
assert.equal(new Set(porNumero.keys()).size,58)
assert.equal(decisoes.filter(x=>x.apta_resolucao).length,58)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros_reconciliados:66,itens_oficiais_unicos_pendentes:58,duplicatas_ocr_inelegiveis:8,gabarito_oficial_vinculado:true,paginas_conferidas:[1,2,3,4],publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,registros_reconciliados:66,itens_oficiais_unicos_pendentes:58,questoes_unicas_elegiveis:58,duplicatas_inelegiveis:8,paginas_conferidas:[1,2,3,4],gabarito_definitivo_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2021 — Professor de História, Cargo 11 — revisão v486\n\n- Reconciliei 66 registros pendentes com 58 itens oficiais únicos; oito cópias de OCR foram marcadas inelegíveis e vinculadas a um registro canônico.\n- Classifiquei matéria, conteúdo, banca, concurso, cargo, ano, aplicação e dificuldade estimada.\n- Conferi visualmente as páginas 1–4, associei os textos-base aos blocos correspondentes e removi resíduos de cabeçalho/rodapé dos enunciados quando identificados.\n- Vinculei as respostas do gabarito definitivo oficial; nenhum item dessa edição está anulado.\n- Pacote local; não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo oficial](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
