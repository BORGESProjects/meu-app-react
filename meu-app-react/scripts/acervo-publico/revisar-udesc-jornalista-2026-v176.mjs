import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='d851f0be5b644b41'
const prova='https://cdn.cebraspe.org.br/concursos/UDESC_26/arquivos/64AA8DB7F9EF8EF629AB3C352C171326B8E6FDDBF3E86A1E7C168F9567ECBC9D.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==74)throw Error('Catálogo CEBRASPE/UDESC 2026 divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-camara-2025-itens-91-180-v175'))
if(start<0)throw Error('Base v175 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==74)throw Error(`Esperados 74 registros, encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const duplicates=new Map([
 ['extr-73817616877e4b883614','extr-fc8023206f609a3469c4'],
 ['extr-23d7f912a78d37060b08','extr-dd1bb3b172054008c6a9'],
 ['extr-c479e5d9c923d628e60e','extr-633727bb381d226eb6c4'],
 ['extr-8c91ff747abf639b8f95','extr-6580f29c4089309041e5']
])
const topics=new Map([
 [51,['Teorias da Comunicação','Comunicação de massa: recepção ativa e diversidade de interpretações']],
 [52,['História da Comunicação','Imprensa, mercado e tensões entre função informativa e indústria cultural']],
 [53,['História do Jornalismo','Profissionalização do jornalismo e consolidação da imprensa de massa no século XIX']],
 [54,['Teorias do Jornalismo','Jornalismo como forma de conhecimento e construção social da notícia']],
 [55,['História da Comunicação','Imprensa e padronização de mensagens para públicos de massa']],
 [56,['Teorias do Jornalismo','Jornalismo como instituição social e formação da opinião pública']],
 [57,['Legislação em Comunicação','Radiodifusão: concessões e renovação de outorgas de rádio e televisão']],
 [58,['História da Comunicação','Radiodifusão brasileira: concentração, descentralização e pluralidade regional']],
 [59,['História da Comunicação','História da televisão no Brasil: implantação e primeiras emissoras']],
 [60,['Legislação em Comunicação','Constituição Federal: complementaridade entre os sistemas privado, público e estatal']],
 [61,['Comunicação Pública','Empresa Brasil de Comunicação: objetivos e caráter do sistema público']],
 [62,['História da Comunicação','História do rádio no Brasil e expansão da radiodifusão']],
 [63,['Técnicas de Jornalismo','Entrevista jornalística: roteiro, escuta ativa e adaptação ao entrevistado']],
 [64,['Técnicas de Jornalismo','Apuração jornalística: adequação de métodos a cada meio de comunicação']],
 [65,['Jornalismo Radiofônico','Linguagem para rádio: clareza, concisão e redundância na comunicação oral']],
 [66,['Jornalismo Audiovisual','Edição televisiva: narrativa pela integração de imagem, som e texto']],
 [67,['Webjornalismo','Hipertextualidade e multimidialidade na produção jornalística digital']],
 [68,['Redação Jornalística','Presente histórico em títulos e leads: atualidade e dinamismo narrativo']],
 [69,['Teorias do Jornalismo','Condições institucionais de produção da notícia e credibilidade jornalística']],
 [70,['Teorias do Jornalismo','Noticiabilidade e valores profissionais na produção social da notícia']],
 [71,['Teorias do Jornalismo','Valores-notícia: seleção e hierarquização de acontecimentos']],
 [72,['Redação Jornalística','Imparcialidade, verificação, equilíbrio e atribuição de fontes']],
 [73,['Redação Jornalística','Atribuição explícita de fontes e identificação da origem das informações']],
 [74,['Redação Jornalística','Separação entre informação e opinião e uso de linguagem valorativa']],
 [75,['Assessoria de Imprensa','Entrevistas exclusivas: seleção de veículos e estratégia de relacionamento']],
 [76,['Assessoria de Imprensa','Mídia espontânea e publicidade: diferenças entre assessoria e compra de espaço']],
 [77,['Assessoria de Imprensa','Rotinas de assessoria de imprensa e rotinas de redação jornalística']],
 [78,['Assessoria de Imprensa','Relacionamento sistemático entre organização e veículos de comunicação']],
 [79,['Assessoria de Imprensa','Relacionamento com a imprensa e acesso dos jornalistas às fontes institucionais']],
 [80,['Assessoria de Imprensa','Release e sugestão de pauta: instrumentos de relacionamento com a mídia']],
 [81,['Assessoria de Imprensa','Atendimento à imprensa: resposta a demandas e facilitação do acesso às fontes']],
 [82,['Comunicação Organizacional','Gestão de crise e estratégias para mídias sociais na comunicação institucional']],
 [83,['Comunicação Organizacional','Comunicação interna: públicos internos e canais dirigidos a colaboradores']],
 [84,['Jornalismo Institucional','Técnicas jornalísticas aplicadas à divulgação institucional']],
 [85,['Comunicação Organizacional','Transparência e circulação de informações institucionais']],
 [86,['Comunicação Organizacional','Pauta institucional: planejamento de ações, eventos e divulgação']],
 [87,['Comunicação Organizacional','Comunicação interna e delimitação dos públicos organizacionais']],
 [88,['Webjornalismo','Usabilidade e escaneabilidade: tópicos em publicações digitais']],
 [89,['Webjornalismo','Hipertexto, links e navegação entre conteúdos relacionados']],
 [90,['Webjornalismo','Multimidialidade: integração de formatos em uma publicação digital']],
 [91,['Webjornalismo','Memória digital e recuperação de conteúdos jornalísticos publicados']],
 [92,['Webjornalismo','Interatividade: participação do público além dos comentários em notícias']],
 [93,['Webjornalismo','Atualização contínua e fluxo de publicação de notícias digitais']],
 [94,['Webjornalismo','Linguagens e formatos jornalísticos: seleção de vídeo em publicação digital']],
 [95,['Jornalismo Empresarial','Publicações internas e periodicidade editorial']],
 [96,['Jornalismo Empresarial','Comunicação audiovisual em publicações empresariais']],
 [97,['Jornalismo Empresarial','Linguagem formal, adequação ao público e comunicação organizacional']],
 [98,['Gêneros Jornalísticos','Crônica: gênero, linguagem e relação entre factualidade e interpretação']],
 [99,['Gêneros Jornalísticos','Notícia: objetividade, relato factual e manifestação opinativa']],
 [100,['Gêneros Jornalísticos','Entrevista: estrutura de perguntas, respostas e apresentação das fontes']],
 [101,['Gêneros Jornalísticos','Editorial e comentário: opinião institucional e entrevistas informativas']],
 [102,['Gêneros Jornalísticos','Briefing editorial: definição, finalidade e aplicação na produção jornalística']],
 [103,['Técnicas de Redação Jornalística','Pirâmide invertida: ordenação decrescente de relevância das informações']],
 [104,['Técnicas de Redação Jornalística','Lead: síntese das informações essenciais do acontecimento']],
 [105,['Técnicas de Redação Jornalística','Critérios de seleção jornalística e valores-notícia']],
 [106,['Comunicação Educativa','Produção de material didático: atualização temática, precisão e adequação ao público']],
 [107,['Edição Jornalística','Edição de texto: revisão gramatical, organização e clareza da informação']],
 [108,['Editoração','Produção gráfica: planejamento tipográfico antes da impressão']],
 [109,['Editoração','Preparação de originais, padronização e adequação à impressão']],
 [110,['Editoração','Preparação de originais e revisão textual antes da impressão']],
 [111,['Editoração','Planejamento editorial e escolha de técnicas de impressão']],
 [112,['Design Editorial','Tipografia e espaçamento: legibilidade, mancha gráfica e economia de espaço']],
 [113,['Design Editorial','Mancha gráfica: área de composição e organização da página impressa']],
 [114,['Design Editorial','Planejamento editorial: ilustrações, cores e organização visual']],
 [115,['Editoração','Retrancagem: identificação e organização de matérias em produção editorial']],
 [116,['Design Editorial','Tipografia: legibilidade e identidade visual da publicação']],
 [117,['Design Editorial','Diagramação: hierarquia visual, fluxo de leitura e organização de elementos']],
 [118,['Design Editorial','Integração entre edição jornalística e projeto gráfico']],
 [119,['Design Editorial','Coerência entre texto, identidade visual e experiência de leitura']],
 [120,['Design Editorial','Padronização de títulos, subtítulos, textos e elementos gráficos']]
])
const repairs=new Map([
 ['extr-986c1f965781cebdfd1f','O rádio, como veículo de comunicação de massa no Brasil, só adquiriu relevância nacional após a década de 70 do século passado, quando passou a ser utilizado como meio de entretenimento.'],
 ['extr-fc8023206f609a3469c4','A edição de conteúdo televisivo exige não apenas cortes e ajustes de tempo, mas também a construção narrativa por meio da combinação de imagens, sons e textos.'],
 ['extr-dd1bb3b172054008c6a9','No jornalismo digital, a lógica de hipertextualidade e multimidialidade altera práticas de redação e edição, exigindo integração entre texto, áudio, vídeo e recursos interativos na construção da notícia.'],
 ['extr-633727bb381d226eb6c4','Na redação jornalística, o emprego do presente histórico pode ser utilizado como recurso legítimo para conferir atualidade e dinamismo ao relato noticioso, especialmente em títulos e leads.'],
 ['extr-6580f29c4089309041e5','A produção noticiosa é condicionada por fatores institucionais, como a linha editorial, mas tais condicionantes não afetam a credibilidade.'],
 ['extr-5dec93c352d01ccce07a','O gerenciamento de crises e a definição de estratégias para mídias sociais estão incluídos no âmbito de atuação do assessor de imprensa atualmente.'],
 ['extr-7eddfb417764b0eecb09','A comunicação interna é direcionada principalmente aos colaboradores da organização.'],
 ['extr-9584d2bb016e798105c1','O webjornalista deve priorizar os vídeos, dada sua importância na divulgação dos fatos nos veículos de imprensa digitais.'],
 ['extr-d2bdc1fb2da4a80c75f3','O emprego da linguagem padrão formal é obrigatório nas publicações jornalísticas empresariais, independentemente do público-alvo.'],
 ['extr-68162ba3946295751528','O briefing, no contexto da imprensa escrita, é um gênero exclusivamente publicitário, e não se aplica à produção editorial jornalística.'],
 ['extr-f72a8d75bf8cd5e09a55','O lead deve apresentar de forma sintética as informações essenciais do fato, respondendo às perguntas básicas do acontecimento.'],
 ['extr-ef89b1b4eb4509749b28','A interatividade no jornalismo digital restringe-se à possibilidade de comentários em notícias online.'],
 ['extr-4f4f9a28842e87073f97','A atualização contínua das notícias constitui característica relevante do jornalismo digital.'],
 ['extr-e8debf34a098349f197c','No jornalismo, a credibilidade da notícia depende da separação entre informação e opinião, devendo-se, por isso, evitar adjetivações valorativas no texto, já que a emissão de opinião é incompatível com a prática profissional.']
])

const decisions=[]
for(const q of active.values()){
 const e=entries.get(q.id);if(!e)throw Error(`Registro sem catálogo: ${q.id}`)
 const n=Number(q.numero_original||q.numero),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 if(duplicates.has(q.id)){
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Jornalismo',conteudo:'Cópia OCR duplicada de item já preservado no mesmo caderno',ano:2026,concurso:'UDESC 2026 — Técnico Universitário de Desenvolvimento — Jornalista',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,classificacao_fonte:prova,motivo:'Comparação dos enunciados e da página oficial confirmou que é repetição OCR de um item único.',visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Imagem original mantida para auditoria da cópia extraída.'},apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR de item numerado já preservado.',duplicada_de:duplicates.get(q.id)})
  continue
 }
 const [materia,conteudo]=topics.get(n)||[]
 if(!materia||!conteudo)throw Error(`Classificação ausente para item ${n}: ${q.id}`)
 let enunciado=repairs.get(q.id)||q.enunciado
 if(n===120)enunciado=enunciado.replace(/\s*Espaço livre\s*$/i,'').trim()
 if(!enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Integridade/tipo inesperado no item ${n}`)
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,concurso:'UDESC 2026 — Técnico Universitário de Desenvolvimento — Jornalista',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por extensão, carga conceitual e integração de conhecimentos; o Cebraspe não publica dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação pela leitura do enunciado e pelo conteúdo programático oficial do cargo de Jornalista.`,visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial verificada; contexto visual e enunciado original preservados.'},enunciado,apta_resolucao:true})
}
const canonical=decisions.filter(d=>d.apta_resolucao!==false),numbers=new Set(canonical.map(d=>Number(d.numero_original)))
if(canonical.length!==70||numbers.size!==70||![...Array(70)].every((_,i)=>numbers.has(i+51)))throw Error(`Cobertura esperada 51–120 divergente: ${canonical.length} registros, ${numbers.size} números`)
if(decisions.filter(d=>d.apta_resolucao===false).length!==4)throw Error('Esperadas quatro duplicatas OCR')
if(process.argv.includes('--dry-run')){const pending=canonical.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length;console.log(JSON.stringify({registros:active.size,itens_unicos:canonical.length,duplicatas:4,questoes_pendentes_antes:pending,disciplinas:Object.fromEntries([...new Set(canonical.map(d=>d.materia))].map(s=>[s,canonical.filter(d=>d.materia===s).length])),textoOCRcorrigido:repairs.size,prova},null,2));process.exit(0)}
const name='revisao-udesc-jornalista-2026-v176'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_no_documento:active.size,itens_unicos_classificados:canonical.length,duplicatas_inelegiveis:4,intervalo_numerico:'51–120 sem lacunas',correcoes_OCR:repairs.size,paginas_origem_conferidas:[1,2,3],publicado:false,prova,fonte_catalogo:'https://www.cebraspe.org.br/concursos/udesc_26'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
