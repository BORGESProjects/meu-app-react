import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais, lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais, hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='e51f79e575906352'
const prova='https://cdn.cebraspe.org.br/concursos/UNE_AL_26/arquivos/EC8CD9A13219A6B891B8FF9D71BB5C7D50C2C949D63553BCBA08AD363D581864.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/UNE_AL_26/arquivos/F48574AEF76C3E614583643D4933F98C93CE5EA087BE9BB463EEB05E31659410.pdf'
const concurso='UNEAL 2026 — Conhecimentos Básicos — Cargo 6: Analista Administrativo, Área de Direito'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==53||catalog.url!==prova)throw Error('O caderno não confere com o catálogo de fontes')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-stm-cargo9-policia-judicial-2025-v252'))
if(start<0)throw Error('A base local v252 não foi encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start)
const manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),records=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)records.set(q.id,q)
if(records.size!==53)throw Error(`Esperados 53 recortes do caderno oficial; encontrados ${records.size}`)

const topics=new Map()
const add=(n,m,c)=>topics.set(n,[m,c])
const portugues={1:'Compreensão inferencial: atos discricionários e automação',2:'Tipologia textual e finalidade comunicativa',3:'Interpretação: eficiência administrativa e garantias fundamentais',4:'Interpretação: atuação jurídica e direitos fundamentais',5:'Sintaxe: adjunto adnominal e valor semântico',6:'Acentuação gráfica: regras de acentuação',7:'Reescrita: preservação de sentido e correção gramatical',8:'Pontuação: vírgulas em expressão intercalada',9:'Classes de palavras: advérbios e adjetivos',10:'Semântica e ortografia: conectivos de oposição',11:'Concordância verbal: sujeito e núcleo do predicado',12:'Regência verbal e paralelismo sintático',13:'Reescrita de oração reduzida e nominalização',14:'Semântica: sentido de “higidez” no contexto',15:'Coesão e relações argumentativas: operador “pelo contrário”'}
for(const [n,c] of Object.entries(portugues))add(Number(n),'Língua Portuguesa',c)
for(const [n,c] of Object.entries({16:'Redes: FTP, HTTP e protocolos de aplicação',17:'Redes: HTTP sobre TCP',18:'PowerPoint 2019: Slide Mestre e temas',19:'Windows: gerenciamento de drivers e dispositivos',20:'Windows: Prompt de Comando e automação por scripts',21:'Segurança da informação: antivírus baseado em assinaturas e ameaças zero-day',22:'Windows: movimentação de arquivos entre partições',23:'Segurança da informação: firewall pessoal e conexões de saída',24:'Pesquisa na internet: busca por correspondência exata com aspas',25:'Pesquisa na internet: operador site: e combinação de filtros'}))add(Number(n),'Informática',c)
for(const [n,c] of Object.entries({26:'Análise combinatória em grafo dirigido: movimento de peça por sequência de letras',27:'Percursos em grafo dirigido: posição final após uma sequência de movimentos',28:'Análise combinatória: contagem de caminhos simples entre cidades em grafo completo',29:'Análise combinatória: contagem de ciclos simples em grafo dirigido',30:'Análise combinatória: caminhos com vértices proibidos em grafo dirigido'}))add(Number(n),'Raciocínio Lógico-Matemático',c)
for(const [n,c] of Object.entries({31:'Geografia de Alagoas: usinas hidrelétricas do rio São Francisco',32:'Geografia física: vazão, intrusão salina e ecossistema estuarino',33:'Hidrografia: alto, médio e baixo curso do rio São Francisco'}))add(Number(n),'Geografia',c)
for(const [n,c] of Object.entries({34:'Formação territorial e história política de Maceió',35:'Urbanização, funções urbanas e centralidade regional',36:'Região Metropolitana de Maceió: municípios e integração regional'}))add(Number(n),'Geografia',c)
for(const [n,c] of Object.entries({37:'Quilombo dos Palmares: resistência e repressão colonial',38:'Quilombo dos Palmares: organização territorial e geografia histórica'}))add(Number(n),'História',c)
for(const [n,c] of Object.entries({39:'Economia regional: setor sucroenergético e déficit hídrico',40:'Geografia econômica de Alagoas: localização da agroindústria canavieira'}))add(Number(n),'Geografia',c)
add(41,'Legislação e Políticas Educacionais','Plano Nacional de Educação: vigência, metas e regime de colaboração')
add(42,'Direito Constitucional','Direitos sociais: proteção constitucional e transferência de renda')
add(43,'Direito Constitucional','Direitos sociais: licença-maternidade e licença-paternidade')
add(44,'Direito Constitucional','Liberdade sindical e unicidade sindical')
add(45,'Legislação e Políticas Educacionais','Educação escolar indígena e assistência estudantil')
add(46,'Legislação e Políticas Educacionais','Formação de docentes da educação básica: acesso a cursos de licenciatura')
add(47,'Legislação e Políticas Educacionais','Direito à educação: ausência por motivo religioso e prestação alternativa')
add(48,'Direito Constitucional','Autonomia universitária e regime de trabalho docente')
add(49,'Legislação e Políticas Educacionais','Educação inclusiva: adaptação curricular, métodos e recursos')
add(50,'Direito Constitucional','Autonomia didático-científica e criação ou extinção de cursos')
if(topics.size!==50)throw Error(`Mapeamento temático incompleto: ${topics.size}/50`)

// Transcrição conferida no PDF oficial do gabarito definitivo; esta prova não tem itens anulados.
const answersOfficial=['E','E','E','C','C','C','E','C','E','C','C','C','C','E','C','E','C','C','C','E','E','C','E','C','E','E','C','E','C','C','C','C','E','E','E','C','C','E','C','E','E','C','E','E','C','E','C','E','E','C']
if(answersOfficial.length!==50)throw Error('A sequência de gabarito não cobre os 50 itens')
const keyDigest=hashRevisao(answersOfficial.join(''))
const grouped=new Map()
for(const e of catalog.questoes){const n=Number(e.numero),arr=grouped.get(n)||[];arr.push(e);grouped.set(n,arr)}
const existingNumbers=[...grouped.keys()].sort((a,b)=>a-b)
const missing=[...Array(50)].map((_,i)=>i+1).filter(n=>!grouped.has(n))
if(existingNumbers.length!==46||missing.join(',')!=='26,27,28,29')throw Error(`Perfil OCR inesperado: ${existingNumbers.length} números, ausentes ${missing}`)
const chooseCanonical=arr=>arr.find(e=>!/(PROVAS OBJETIVAS|\n\s*C\s*$|\n\s*8 No segundo)/i.test(e.trecho))||arr[0]
const canonicalByNumber=new Map([...grouped].map(([n,arr])=>[n,chooseCanonical(arr)]))
const canonicalIds=new Set([...canonicalByNumber.values()].map(x=>x.id))
const additions=[
 {n:26,page:2,stem:'Considere que 16 moedas tenham sido tiradas e que tenha sido obtida a seguinte sequência de letras: A A R R A A A R R A R A A R R A. Nesse caso, ao final de todas as movimentações necessárias, a peça estará na região Casa da Cultura.',support:'Contexto do item: tabuleiro dirigido com seis regiões turísticas de Arapiraca. A peça inicia no Planetário; cada jogada usa uma moeda: A avança uma região e R recua uma região.'},
 {n:27,page:2,stem:'Se seis moedas forem tiradas e as letras obtidas, em ordem, forem A R A A R A, a peça, após todas as movimentações necessárias, estará na região Parque Ceci Cunha.',support:'Contexto do item: tabuleiro dirigido com seis regiões turísticas de Arapiraca. A peça inicia no Planetário; cada jogada usa uma moeda: A avança uma região e R recua uma região.'},
 {n:28,page:3,stem:'O número de rotas distintas de Arapiraca a Maceió, passando por todas as demais cidades, mas somente uma única vez por cada cidade, é superior a 30.',support:'Contexto do item: grafo dirigido com seis cidades — Arapiraca, Santana do Ipanema, Palmeira dos Índios, União dos Palmares, Maceió e São Miguel dos Campos —, com arestas indicadas no diagrama da página original.'},
 {n:29,page:3,stem:'O número de rotas distintas que se iniciam em Arapiraca e terminam em Arapiraca, passando por, no mínimo, outras 3 cidades distintas, mas somente uma única vez por cada uma dessas cidades, é superior a 90.',support:'Contexto do item: grafo dirigido com seis cidades — Arapiraca, Santana do Ipanema, Palmeira dos Índios, União dos Palmares, Maceió e São Miguel dos Campos —, com arestas indicadas no diagrama da página original.'},
]
const newIds=new Set(additions.map(x=>`extr-uneal26-cb2-${x.n}`))
const decisions=[]
for(const [n,arr] of grouped){
 const canonical=canonicalByNumber.get(n),key=answersOfficial[n-1],page=Number(canonical.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 for(const e of arr){const q=records.get(e.id);if(!q)throw Error(`Recorte ausente: ${e.id}`);const dup=!canonicalIds.has(e.id)
  if(dup){decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n)[0],conteudo:topics.get(n)[1],ano:2026,concurso,numero_original:n,pagina:Number(e.pagina),apta_resolucao:false,inelegibilidade_motivo:'Duplicata de OCR do mesmo item da mesma edição; o registro canônico foi mantido.',duplicada_de:canonical.id,classificacao_fonte:prova,motivo:`Cópia OCR duplicada do item ${n}; vínculo ao registro canônico verificado no mesmo caderno.`});continue}
  const stem=({4:'Entende-se das ideias estabelecidas no primeiro parágrafo que a atuação do profissional do direito baseada na IA ultrapassa aspectos operacionais, envolvendo também a proteção de direitos fundamentais.',8:'Estaria mantida a correção gramatical do texto caso se suprimissem as vírgulas empregadas no trecho “a eficiência é, sem dúvida, o maior motor para a adoção da IA na gestão pública” (segundo parágrafo).',25:'Em motores de busca, o operador site: restringe os resultados a um domínio específico, mas não pode ser combinado com outros termos ou operadores na mesma consulta.'})[n]
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n)[0],conteudo:topics.get(n)[1],ano:2026,concurso,numero_original:n,pagina:Number(e.pagina),dificuldade:[7,11,13,15,20,21,23,26,28,29,30,32,35,37,38,41,43,44,47,48,50].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade de leitura, aplicação de regra e encadeamento de raciocínio; a banca não publica dificuldade individual.',...(stem?{enunciado:stem}:{}),resposta_correta:key==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'F48574AEF76C3E614583643D4933F98C93CE5EA087BE9BB463EEB05E31659410.pdf',numero:n,pagina:1,resposta:key,sha256:keyDigest,hash_metodo:'SHA-256 da sequência transcrita dos 50 gabaritos definitivos do caderno de conhecimentos básicos do Cargo 6.'},classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial CEBRASPE/UNEAL — Conhecimentos Básicos do Cargo 6; tema determinado pela leitura do enunciado e do comando comum. Aplicação em 02/08/2026.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_certo_errado_nao_vinculado','gabarito_oficial_nao_vinculado','visual_ausente'],visual:{pagina:Number(e.pagina),imagem:image,texto_apoio:'Prova objetiva CEBRASPE — UNEAL 2026, conhecimentos básicos do Cargo 6. Para itens de interpretação e raciocínio, consulte também o texto ou diagrama visível na página original associada.',motivo:'Página original do caderno ligada ao item; mantém texto-base, comandos compartilhados, diagrama e elementos visuais.'}})
 }
}

const template=records.get(canonicalByNumber.get(25).id)
const newQuestions=[]
for(const x of additions){const n=x.n,page=x.page,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,id=`extr-uneal26-cb2-${n}`,key=answersOfficial[n-1],baseQ=structuredClone(template)
 const topic=topics.get(n)
 Object.assign(baseQ,{id,ano:2026,numero_original:n,banca:'CEBRASPE',organizadora:'CEBRASPE',banca_original:'Cebraspe',aplicacao:'CEBRASPE',concurso, materia:topic[0],conteudo:topic[1],enunciado:x.stem,opcoes:['Certo','Errado'],resposta_correta:key==='C'?0:1,anulada:false,pagina:page,documento_id:doc,paginas_origem:[page],imagens_paginas:[image],pagina_imagem:image,texto_apoio:x.support,contexto_paginas:[{pagina:page,imagem:image,texto:x.support}],tipo_resposta:'certo_errado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:1,classificacao_metodo:'Transcrição manual conferida na página original do caderno; classificação temática individual',classificacao_evidencia:`Item ${n} reconstituído visualmente a partir do caderno oficial CEBRASPE/UNEAL 2026; tópico de raciocínio lógico-matemático.`,classificacao_fonte:prova,gabarito_oficial:{fonte:gabarito,arquivo:'F48574AEF76C3E614583643D4933F98C93CE5EA087BE9BB463EEB05E31659410.pdf',numero:n,pagina:1,resposta:key,sha256:keyDigest,hash_metodo:'SHA-256 da sequência transcrita dos 50 gabaritos definitivos do caderno de conhecimentos básicos do Cargo 6.'},dificuldade:n===26||n===29?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela contagem de percursos em grafo e pelo encadeamento dos movimentos; a banca não publica dificuldade individual.',integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]},revisao_semantica_visual:{imagem:image,pagina:page,sha256:hashRevisao(await fs.readFile(`public/acervo-extraido/${image}`)),motivo:'Enunciado e contexto reconstruídos por leitura visual do caderno oficial.',metodo:'Conferência visual individual da página original'}})
 delete baseQ.transcricoes_ocr;delete baseQ.classificacao_anterior;delete baseQ.motivos_revisao;delete baseQ.status_revisao
 newQuestions.push(baseQ)
}
if(decisions.length!==53||decisions.filter(x=>x.apta_resolucao===false).length!==7||additions.length!==4||newIds.size!==4)throw Error('Contagem de revisão, cópias OCR ou itens recompostos incorreta')
for(const p of [1,2,3,4])await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortesOCR:53,itensPresentes:46,itensReconstruidos:4,totalItensOficiais:50,duplicatasSinalizadas:7,gabaritosDefinitivos:50,materias:[...new Set([...topics.values()].map(x=>x[0]))],fonteProva:prova,fonteGabarito:gabarito,alteracaoLocal:true,publicacaoCloudflare:false},null,2));process.exit(0)}
const name='revisao-uneal-conhecimentos-basicos-cargo6-2026-v253'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:newQuestions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const report={...result,recortesOCR:53,itensUnicosCaderno:50,questoesReconstruidas:4,duplicatasSinalizadas:7,itensComGabaritoDefinitivo:50,publicado:false,fonteProva:prova,fonteGabarito:gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## UNEAL 2026 — Conhecimentos Básicos, Cargo 6 — v253\n\n- Corrigi as classificações dos 50 itens do caderno oficial: Língua Portuguesa (1–15), Informática (16–25), Raciocínio Lógico-Matemático (26–30), Geografia (31–36 e 39–40), História (37–38), Legislação e Políticas Educacionais (41, 45–47 e 49) e Direito Constitucional (42–44, 48 e 50). Registrei ano, dificuldade estimada, número e página visual.\n- A inspeção das páginas 2 e 3 revelou que os itens 26 a 29 não tinham sido segmentados no acervo. Transcrevi os quatro a partir do original, mantive associados os diagramas e contextos e acrescentei as respostas do gabarito oficial definitivo.\n- Vinculei o gabarito definitivo oficial a todos os 50 itens. Marquei sete cópias OCR dos itens 1, 2, 4, 5, 6, 7 e 8 como inelegíveis, preservando o registro canônico de cada item.\n- Validação local: ${result.classificadas} recortes revisados, ${result.adicionadas} itens recompostos, ${result.novas_classificacoes} novas classificações, ${result.total} registros, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local; ainda não publicada na nuvem.\n- Fontes oficiais: [caderno de conhecimentos básicos do Cargo 6](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas oficiais de alteração/anulação](<https://cdn.cebraspe.org.br/concursos/UNE_AL_26/arquivos/E1D1B75D3AC853E867B1D53587193906D59783CAB160720864E5891965221AA6.pdf>), [página do concurso](https://www.cebraspe.org.br/concursos/UNE_AL_26).\n`)
console.log(JSON.stringify(report,null,2))
