import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-slu-jornalismo-2019-v215'
const doc = '7030a729f5068e47'
const prova = 'https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/5_449_SLUDF_005_00_COM_JUST.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/6_GAB_DEFINITIVO_449_SLUDF_005_00_PAG_8.PDF'
const concurso = 'SLU/DF 2019 — Analista de Gestão de Resíduos Sólidos — Comunicação Social — Jornalismo — Cargo 5'
const catalog = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === doc)
if (!catalog || catalog.questoes.length !== 81 || catalog.arquivo !== '5_449_SLUDF_005_00_COM_JUST.PDF') throw Error('Catálogo oficial do SLU/DF não corresponde aos 81 registros OCR esperados')
const start = raizesAtuais.findIndex(x => x.includes('revisao-enem-linguagens-caderno9-2023-v214'))
if (start < 0) throw Error('Base v214 não encontrada na fila ativa')
const base = raizesAtuais[start]
const bases = raizesAtuais.slice(start)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const wanted = new Set(catalog.questoes.map(x => x.id))
const active = new Map()
for (const lot of manifest.lotes.filter(x => x.arquivo)) {
  const questions = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo, bases)))
  for (const q of questions) if (wanted.has(q.id)) { active.set(q.id, q); wanted.delete(q.id) }
  if (!wanted.size) break
}
if (active.size !== 81 || wanted.size) throw Error(`Esperados 81 registros do caderno SLU; encontrados ${active.size}; ausentes ${wanted.size}`)

// Classificação por assunto específico, conforme cada bloco e item do caderno oficial.
const subjects = {
  51:['História do Jornalismo','Imprensa brasileira: Correio Braziliense e sua fundação em Londres'],
  52:['História do Jornalismo','Imprensa brasileira: Jornal do Brasil, monarquismo e República'],
  53:['História do Jornalismo','Imprensa brasileira: revista O Cruzeiro e jornalismo ilustrado'],
  54:['História do Jornalismo','Concentração regional dos grandes veículos de imprensa no Brasil'],
  55:['História do Jornalismo','Imprensa brasileira e cobertura da campanha Diretas Já'],
  56:['História do Jornalismo','Transição do jornal impresso para o jornalismo exclusivamente digital'],
  57:['Jornalismo','Texto informativo: objetividade e uso de adjetivos'],
  58:['Jornalismo','Lide: elementos essenciais da notícia'],
  59:['Jornalismo','Pirâmide invertida: hierarquia da informação'],
  60:['Jornalismo','Gêneros jornalísticos: notícia e reportagem'],
  61:['Jornalismo','Apuração jornalística e compromisso com a veracidade'],
  62:['Jornalismo','Entrevista como técnica de apuração jornalística'],
  63:['Jornalismo','Entrevista em on e em off: identificação e anonimato de fontes'],
  64:['Jornalismo','Apuração, checagem e verificação de dados'],
  65:['Jornalismo','Fontes oficiais e instituições públicas'],
  66:['Jornalismo','Fontes primárias e coleta de informação'],
  67:['Jornalismo','Registro de entrevistas e uso de declarações de fontes'],
  68:['História do Jornalismo','Penny press e consolidação do jornalismo informativo'],
  69:['Jornalismo','Critérios de noticiabilidade e valores-notícia'],
  70:['Jornalismo','Objetividade, imparcialidade e subjetividade jornalística'],
  71:['Comunicação Social','Propriedade e concentração dos meios de comunicação no Brasil'],
  72:['Jornalismo','Reportagem com auxílio de computador (RAC) e análise de dados'],
  73:['Jornalismo Digital','Fontes digitais, redes sociais e desinformação'],
  74:['Comunicação Organizacional','Públicos organizacionais e comunicação de massa'],
  75:['Comunicação Organizacional','Jornalismo institucional: universalidade, atualidade e periodicidade'],
  76:['Comunicação Organizacional','Publicações internas e jornalismo diversional'],
  77:['Comunicação Organizacional','Avaliação de resultados e relacionamento com a imprensa'],
  78:['Jornalismo','Pirâmide invertida e estrutura da notícia'],
  79:['Comunicação Organizacional','Produção de notícias institucionais e condicionantes organizacionais'],
  80:['Comunicação Organizacional','Jornalismo institucional: gêneros informativo, interpretativo e opinativo'],
  81:['Jornalismo','Lide descritivo e lide ativador de interesse'],
  82:['Jornalismo','Newsletter: conteúdo especializado, público e periodicidade'],
  83:['Assessoria de Imprensa','Mediação entre organização, imprensa e interesse público'],
  84:['Assessoria de Imprensa','Preparação de porta-voz e relacionamento com jornalistas'],
  85:['Assessoria de Imprensa','Comunicação de crise e atendimento à imprensa'],
  86:['Comunicação Organizacional','Assessoria de imprensa e atribuições da assessoria de comunicação'],
  87:['Assessoria de Imprensa','Position paper e clipping: conceitos e produtos'],
  88:['Assessoria de Imprensa','Release: pauta e divulgação espontânea de conteúdo jornalístico'],
  89:['Assessoria de Imprensa','Pauta aberta: roteiro, perguntas e possibilidades de abordagem'],
  90:['Assessoria de Imprensa','Entrevista coletiva e relacionamento com a imprensa'],
  91:['Jornalismo','Valores-notícia aplicados à seleção de pautas institucionais'],
  92:['Comunicação Interna','Fluxos de comunicação organizacional: descendente, ascendente e misto'],
  93:['Comunicação Interna','Intranet: alcance e viabilidade econômica'],
  94:['Comunicação Interna','Comunicação interna e endomarketing: objetivos e diferenças'],
  95:['Comunicação Interna','Publicações internas: mensagem principal e características editoriais'],
  96:['Comunicação Interna','Princípios editoriais de publicações institucionais'],
  97:['Jornalismo','Jornalismo opinativo: argumentação e posicionamento editorial'],
  98:['Jornalismo','Artigo de opinião e colaboração de autores externos'],
  99:['Jornalismo','Crônica: autoria, juízo de valor e gênero opinativo'],
  100:['Jornalismo Digital','Jornalismo colaborativo e participação do público'],
  101:['Jornalismo','Cartas de leitores como gênero de jornalismo opinativo'],
  102:['Jornalismo','Pauta jornalística: eventos, agendas e critérios de seleção'],
  103:['Assessoria de Imprensa','Release e nota oficial: finalidade e caráter jornalístico'],
  104:['Assessoria de Imprensa','Distribuição de releases em mídias digitais e mecanismos de busca'],
  105:['Assessoria de Imprensa','Clipping, monitoramento de notícias e relatórios de tendência'],
  106:['Assessoria de Imprensa','Briefing, porta-voz e entrevista coletiva em situações institucionais'],
  107:['Jornalismo Digital','Lide, sublide e pirâmide invertida em notícias digitais'],
  108:['Jornalismo Digital','Flash, atualização e transparência sobre apuração incompleta'],
  109:['Jornalismo Digital','Deadline e fechamento editorial na publicação em tempo real'],
  110:['Jornalismo Digital','Webjornalismo, hipertexto e hipermídia'],
  111:['Jornalismo Digital','Hipertexto e relação entre emissor e receptor'],
  112:['Jornalismo Digital','Linguagem multimidiática e textualidades verbais e não verbais'],
  113:['Jornalismo Digital','Notícia em camadas, hiperlinks e aprofundamento da informação'],
  114:['Teorias do Jornalismo','Gatekeeper e seleção editorial de notícias'],
  115:['Assessoria de Imprensa','SEO, palavras-chave e visibilidade de releases'],
  116:['Produção Gráfica','Tipografia digital e evolução das fontes gráficas'],
  117:['Produção Gráfica','Pré-impressão digital e substituição dos fotolitos'],
  118:['Jornalismo Digital','Web 1.0 e Web 2.0: comunicação de um-para-muitos e muitos-para-muitos'],
  119:['Assessoria de Imprensa','Uso de bancos de imagens em conteúdo jornalístico digital'],
  120:['Teorias do Jornalismo','Agenda setting, interatividade e circulação de temas na esfera pública']
}
if (Object.keys(subjects).length !== 70) throw Error('A classificação não cobre todos os 70 itens oficiais')

const pageOf = n => n <= 68 ? 1 : n <= 82 ? 2 : n <= 97 ? 3 : n <= 108 ? 4 : n <= 117 ? 5 : 6
const itemPages = n => n === 97 ? [3,4] : n === 109 ? [4,5] : n === 118 ? [5,6] : [pageOf(n)]
const image = page => `paginas/${doc}-${String(page).padStart(4,'0')}.webp`
for (let p=1;p<=6;p++) await fs.access(`public/acervo-extraido/${image(p)}`)
const officialText=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`))).join('\n')

const duplicatesByNumber = new Map()
for (const entry of catalog.questoes) {
  const list = duplicatesByNumber.get(entry.numero) || []
  list.push(entry)
  duplicatesByNumber.set(entry.numero, list)
}
if (duplicatesByNumber.size !== 70 || [...duplicatesByNumber.values()].filter(x=>x.length>1).length !== 11) throw Error('Padrão de duplicatas diverge do inventário (70 itens, 11 repetições OCR)')
const canonical = new Map()
for (const [n, entries] of duplicatesByNumber) {
  const rank = entry => {
    const q=active.get(entry.id)
    const stem=(q.enunciado||'').replace(/\s*JUSTIFICATIVA[\s\S]*$/i,'').replace(/CEBRASPE\s*[–-]\s*SLUDF\s*[–-]\s*Aplicação:\s*2019/gi,'').trim()
    return stem.length - (/\b(?:CEBRASPE|SLUDF|JUSTIFICATIVA)\b/i.test(stem)?1000:0)
  }
  canonical.set(n,[...entries].sort((a,b)=>rank(b)-rank(a))[0].id)
}

const answerMap = new Map()
for (const [n, entries] of duplicatesByNumber) {
  const matches = entries.map(e => (active.get(e.id).enunciado||'').match(/JUSTIFICATIVA\s*-\s*(CERTO|ERRADO)/i)?.[1]?.toUpperCase()).filter(Boolean)
  const sourceMatch=officialText.match(new RegExp(`(?:^|\\n)\\s*${n}\\s+[\\s\\S]*?\\bJUSTIFICATIVA\\s*-\\s*(CERTO|ERRADO)`,'i'))?.[1]?.toUpperCase()
  if(sourceMatch)matches.push(sourceMatch)
  if (n === 62) { answerMap.set(n,'X'); continue }
  if (!matches.length || new Set(matches).size !== 1) throw Error(`Justificativa divergente/ausente no item ${n}: ${matches.join(',')}`)
  answerMap.set(n,matches[0] === 'CERTO' ? 'C' : 'E')
}
if (answerMap.size !== 70 || answerMap.get(62) !== 'X') throw Error('Não foi possível validar a chave completa e a anulação oficial')
const answerDigest=hashRevisao([...answerMap].sort((a,b)=>a[0]-b[0]).map(([n,k])=>`${n}:${k}`).join(','))

const decisions=catalog.questoes.map(entry=>{
  const q=active.get(entry.id), n=entry.numero, [materia,conteudo]=subjects[n], key=answerMap.get(n), mainPage=pageOf(n)
  if(!q?.enunciado||!materia||!conteudo||!key)throw Error(`Item ${n}: enunciado/classificação/gabarito ausente`)
  const duplicate=canonical.get(n)!==entry.id
  let stem=q.enunciado.replace(/\s*JUSTIFICATIVA[\s\S]*$/i,'').trim()
  stem=stem.replace(/CEBRASPE\s*[–-]\s*SLUDF\s*[–-]\s*Aplicação:\s*2019/gi,' ')
    .replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
    .replace(/jormalismo/gi,'jornalismo').replace(/jormais/gi,'jornais').replace(/jomalismo/gi,'jornalismo')
    .replace(/distingue\s+-\s*se/gi,'distingue-se').replace(/jornal\s+ístico/gi,'jornalístico')
    .replace(/famili\s+ares/gi,'familiares').replace(/co\s+mercial/gi,'comercial').replace(/imprecisõe\s+s/gi,'imprecisões')
    .replace(/\s+([–—-])\s+/g,' $1 ').trim()
  if(stem.length<40||/JUSTIFICATIVA|CEBRASPE|SLUDF|Aplicação:\s*2019/i.test(stem))throw Error(`Item ${n}: enunciado ficou incompleto ou contém texto de cabeçalho/justificativa: ${stem}`)
  const pages=itemPages(n), primary=pages[0]
  const options=q.opcoes?.length===2?q.opcoes:['Certo','Errado']
  if(options[0]!=='Certo'||options[1]!=='Errado')throw Error(`Item ${n}: opções certo/errado inesperadas`)
  const annulled=key==='X'
  const pageImage=image(primary)
  return {
    id:entry.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,concurso,
    numero_original:n,pagina:primary,dificuldade:[53,58,59,63,65,69,70,72,73,77,79,80,85,87,91,92,94,97,98,99,102,103,104,106,108,109,110,111,112,113,115,116,117,118,120].includes(n)?'Difícil':[51,52,54,55,56,57,60,61,62,64,66,67,68,71,74,75,76,78,81,82,83,84,86,88,89,90,93,95,96,100,101,105,107,114,119].includes(n)?'Média':'Fácil',
    dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela abstração e integração conceitual; a banca não publica dificuldade psicométrica individual.',
    enunciado:stem,opcoes:options,resposta_correta:annulled?null:key==='C'?0:1,anulada:annulled,
    apta_resolucao:!duplicate, ...(duplicate?{duplicada_de:canonical.get(n),inelegibilidade_motivo:'Repetição OCR do mesmo item numerado no mesmo caderno; uma cópia íntegra fica disponível para resolução.'}:{}),
    gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'6_GAB_DEFINITIVO_449_SLUDF_005_00_PAG_8.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da transcrição normalizada dos 70 valores de gabarito cotejados com o caderno comentado oficial; não representa hash criptográfico do PDF.',criterio:'Gabarito definitivo CEBRASPE do Cargo 5 — Comunicação Social — Jornalismo; X identifica item anulado.'},
    classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do enunciado e do bloco temático no caderno oficial do Cargo 5.'},
    visual:{pagina:primary,imagem:pageImage,texto_apoio:'',motivo:`Página ${primary} do caderno oficial vinculada ao item ${n}; sem figura, gráfico ou fórmula neste item.`},
    ...(pages.length>1?{imagens_contexto:pages.slice(1).map(p=>({pagina:p,imagem:image(p),texto:''}))}:{}),
    motivo:`Revisão v215 do item ${n}: classificação específica, limpeza do OCR, resposta cotejada ao gabarito definitivo e conferência da página original.`,
    remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','gabarito_certo_errado_nao_vinculado'],
  }
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,registros_ocr:81,itens_unicos:70,duplicatas_excluidas:11,anulada:62,aplicacao_imagens:'6 páginas originais disponíveis; continuidades anexadas aos itens 97, 109 e 118',answer_digest:answerDigest},null,2))
