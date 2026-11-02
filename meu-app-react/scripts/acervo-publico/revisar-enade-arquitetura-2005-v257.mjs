import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '51b574614be49497'
const prova = 'https://riep.inep.gov.br/bitstreams/95764a20-0e47-479e-8e39-2240122a7c64/download'
const chave = 'https://riep.inep.gov.br/bitstreams/e387e78b-02d4-4704-bea2-839c1156e34c/download'
const answerLetters = ['D','E','C','A','E','C','B','A','C','D','B','C','C','B','C','E','C','B','D','E','E','B','A','A','D','E','D','B','A','D','B','B','E','C']
const canonicalKey = answerLetters.map((x, i) => `${i + 1}:${x}`).join('|')
const keySha = createHash('sha256').update(canonicalKey).digest('hex')
const base = raizesAtuais[0]
const bases = raizesAtuais
const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const catalogo = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(d => d.id === doc)
if (!catalogo || catalogo.url !== 'http://download.inep.gov.br/download/enade/2005/provas/ARQUITETURA.pdf') throw Error('Catálogo da prova ENADE 2005 divergente')
const sourceLotIndex = manifesto.lotes.findIndex(l => l.arquivo.includes('inep-2005-enade-3c7b9ed-revisao-v2'))
if (sourceLotIndex < 0) throw Error('Lote ENADE 2005 não encontrado')
const sourceLot = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(manifesto.lotes[sourceLotIndex].arquivo, bases)))
const active = sourceLot.filter(q => q.documento_id === doc)
const pending = active.filter(q => q.classificacao_pendente && !q.classificacao_revisada && q.integridade_profissional?.apta_resolucao !== false)
if (pending.length !== 41 || active.length !== 41) throw Error(`Esperava 41 registros do documento e 41 pendências; encontrei ${active.length}/${pending.length}`)

const keyByNumber = Object.fromEntries(answerLetters.map((v, i) => [i + 1, v]))
const details = {
  1:['Ética e Cidadania','Reforma política, transparência eleitoral e controle público.'],
  2:['Sociologia','Inclusão digital, desigualdade de acesso e exclusão social.'],
  3:['Atualidades','Terrorismo internacional, democracia e fatores sociais associados à violência política.'],
  4:['Atualidades','Problemas sociais brasileiros representados em charges: saúde, segurança, habitação e desemprego.'],
  5:['Educação','Educação indígena, diversidade cultural e diferenças entre educação formal e saberes comunitários.'],
  6:['Ética e Cidadania','Democracia direta, referendo e participação cidadã informada.'],
  7:['Artes','Leitura de imagem e relações entre representação artística, cidade e literatura brasileira.'],
  8:['Arquitetura','Representação e projeto arquitetônico digital: sistemas CAD e produção industrial.'],
  9:['Arquitetura','História da arquitetura moderna: neoplasticismo, De Stijl e interação entre arquitetura e artes.'],
  10:['Arquitetura','Projeto escolar: conforto acústico, setorização e organização dos ambientes de aprendizagem.'],
  11:['Arquitetura','Sistemas estruturais: vínculos, apoios e comportamento estático de estruturas.'],
  12:['Arquitetura','Preservação do patrimônio: teoria do restauro crítico de Cesare Brandi.'],
  13:['Arquitetura','História e tecnologia construtiva: estrutura, cúpula e compressão no Panteão de Roma.'],
  14:['Arquitetura','Conforto ambiental: proteção solar, brise-soleil, orientação e desenho de fachadas.'],
  17:['Arquitetura','Desenho técnico e representação: escala gráfica aplicada a plantas e imagens aéreas.'],
  18:['Arquitetura','Geometria e composição: traçado regulador e proporções no projeto arquitetônico.'],
  19:['Arquitetura','História da arquitetura: villas de Andrea Palladio e composição modular das plantas.'],
  20:['Arquitetura','História da arquitetura moderna: detalhe construtivo e obras de Mies van der Rohe.'],
  22:['Arquitetura','Teoria e história: precedentes, repertório formal e continuidade na criação arquitetônica.'],
  23:['Urbanismo','História do urbanismo: parques urbanos, espaços livres e formação de bairros brasileiros.'],
  24:['Urbanismo','Planejamento urbano: comparação entre os planos de Brasília e da Barra da Tijuca.'],
  26:['Arquitetura','Patologia das construções: fissuras em vigas, leitura de diagramas e comportamento estrutural.'],
  27:['Arquitetura','Sistemas construtivos: estrutura independente Dom-ino e construção tradicional em alvenaria.'],
  28:['Urbanismo','Legislação urbanística e ambiental: faixa marginal de proteção e restrições ao uso do solo.'],
  29:['Urbanismo','Plano diretor e Estatuto da Cidade: função social da propriedade e participação no planejamento.'],
  30:['Urbanismo','Mobilidade urbana: integração do transporte coletivo ao plano diretor.'],
  31:['Urbanismo','Instrumentos de política urbana: cálculo de outorga onerosa e coeficiente de aproveitamento.'],
  32:['Urbanismo','Regularização fundiária, direito à moradia e permanência de comunidades quilombolas.'],
  33:['Arquitetura','Projeto habitacional: implantação, programa de necessidades e organização do lote urbano.'],
  34:['Arquitetura','Tecnologia das construções: lajes pré-moldadas, modulação e soluções estruturais.'],
}
const pageFor = new Map(catalogo.questoes.map(e => [e.id, e]))
const infoOnly = new Set(['extr-489bdf0f3ac16a4ef1d4','extr-f2d2d69ddd8880632206'])
const surveyIds = new Set(['extr-f95068dac42422bbeaaf','extr-a4452b8633a160cebd46','extr-cf218686ba67de71e22d','extr-17801d1f0ebf7055b78b','extr-e2223400dc998bc8a486','extr-fa86fee6d55ba99ec2f0','extr-7de26ba844989cb20f9b','extr-88bfad719c8ca67e6a59','extr-b811f4f9873587ce016d'])
const duplicateSurveyReasons = 'Item do questionário de percepção da prova, não é questão de conhecimento nem possui gabarito; retirado do fluxo de resolução.'
const choiceCleanups = new Map([
  ['extr-c23f5979d71b3badb513', [4, 'a dificuldade de acesso ao mundo digital torna o cidadão um excluído social.']],
  ['extr-51041895b8075ea8ec7e', [4, 'ser entendida como uma estratégia dos governos para manter o exercício da soberania.']],
  ['extr-f3fa691776b73f9b4f9f', [4, 'as duas afirmações são falsas.']],
  ['extr-5c6794a03bc84c418917', [4, 'os vínculos A, B e C são engastes e o vínculo D é um articulado móvel.']],
  ['extr-fcd24954aec5fdcbf169', [4, 'Vigas de aço.']],
  ['extr-b00ec98dd8be384f5cf3', [4, 'I, II, III e IV.']],
  ['extr-6bbb142faaaff307a58e', [4, 'I, II e III.']],
  ['extr-765562f17f9dbc0bc2dc', [4, 'Vale do Anhangabaú/São Paulo e Bairro do Méier/Rio de Janeiro.']],
  ['extr-59940df1ebbf3a73cd23', [4, 'os centros de convenções, os shopping-centers e os eixos viários.']],
  ['extr-f88aec177a1e6ff0ad72', [4, 'no perímetro 2 vai ser gerado o dobro dos recursos provenientes de outorga onerosa em relação ao perímetro 1.']],
  ['extr-0b40d754336359fb666a', [4, 'I, II, IV e V.']],
])
const cleanStem = new Map([
  ['extr-c23f5979d71b3badb513','Leia e relacione os textos e a charge sobre inclusão digital. Comparando a proposta acima com a charge, pode-se concluir que'],
  ['extr-51041895b8075ea8ec7e','O referendo popular é uma prática democrática exercida em alguns países, como no caso espanhol da votação sobre a Constituição Europeia. Na charge, observam-se diferentes opções de voto e abstenção. A partir da situação, a consulta popular deve'],
  ['extr-6249a15ce7607f5e16e0','A Escola do Conjunto Pedregulho, projetada por Affonso Eduardo Reidy, pertence à rede municipal de edifícios escolares do Rio de Janeiro e atende do 1º ao 4º ano do ensino fundamental. Considerando as necessidades dos usuários nessa faixa etária, a solução de projeto'],
  ['extr-f88aec177a1e6ff0ad72','Considerando os dados dos perímetros 1 e 2, com áreas brutas de 10 ha e 5 ha, áreas líquidas de 7 ha e 3,5 ha, coeficientes básicos de 2,5 e 1,5 e coeficiente máximo de 3,0 em ambos, e adotando igual contrapartida por metro quadrado, qual conclusão sobre os recursos de outorga onerosa é correta?'],
])
const decisions = pending.map(q => {
  const entry = pageFor.get(q.id)
  if (!entry) throw Error(`Questão ausente do catálogo: ${q.id}`)
  if (infoOnly.has(q.id) || surveyIds.has(q.id)) return {
    id:q.id, sha256_enunciado:hashRevisao(q.enunciado), materia:'ENADE — item administrativo', conteudo:'Instruções ou questionário de percepção da prova; não é item avaliativo.',
    ano:2005, concurso:'ENADE 2005 — Arquitetura e Urbanismo', numero_original:Number(q.numero_original), pagina:Number(q.pagina), classificacao_fonte:prova,
    motivo:infoOnly.has(q.id)?'Página de instruções da aplicação, não contém questão avaliativa.':duplicateSurveyReasons,
    apta_resolucao:false, inelegibilidade_motivo:infoOnly.has(q.id)?'Instrução de prova, sem resposta avaliativa.':duplicateSurveyReasons,
  }
  const isRenumbered31=q.id==='extr-f88aec177a1e6ff0ad72'
  const n=isRenumbered31?31:Number(q.numero_original)
  const classification=details[n]
  if(!classification || !keyByNumber[n]) throw Error(`Matéria ou chave ausente em ${q.id} (item ${n})`)
  const [materia,conteudo]=classification
  const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  const contextPages=(entry.paginas||[]).filter(p=>Number(p)!==page).map(p=>({pagina:Number(p),imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua da prova oficial com o texto-base, a imagem ou os dados necessários à questão.'}))
  const letter=keyByNumber[n],choiceIndex=letter.charCodeAt(0)-65
  const options=[...(q.opcoes||[])].map(x=>String(x).trim())
  if(choiceCleanups.has(q.id)){const [i,text]=choiceCleanups.get(q.id);if(options[i]!==undefined)options[i]=text}
  if(q.id==='extr-59c0bed1402763c71556')options.splice(0,options.length,'A — barra gráfica mais extensa (ver escala original na imagem)','B — barra gráfica extensa (ver imagem da página)','C — barra gráfica intermediária (ver imagem da página)','D — barra gráfica curta (ver imagem da página)','E — barra gráfica muito curta (ver imagem da página)')
  if(options.length!==5 || choiceIndex<0 || choiceIndex>4) throw Error(`Alternativas ou chave inválida em ${q.id}`)
  return {
    id:q.id, sha256_enunciado:hashRevisao(q.enunciado), materia, conteudo, ano:2005,
    concurso:'ENADE 2005 — Arquitetura e Urbanismo', numero_original:n, pagina:page,
    dificuldade:['11','13','18','21','23','24','25','26','27','28','29','30','31','32','33','34'].includes(String(n))?'Difícil':'Média',
    dificuldade_estimada:true, dificuldade_evidencia:'Estimativa editorial com base na complexidade conceitual e no trabalho de leitura/interpretação; não publicada pelo INEP.',
    classificacao_fonte:prova, motivo:`ENADE 2005 — Arquitetura e Urbanismo, item ${n}, página impressa ${page}; matéria e assunto conferidos no enunciado e no contexto original.`,
    resposta_correta:choiceIndex, anulada:false,
    gabarito_oficial:{fonte:chave,arquivo:'gabarito_arquitetura_urbanismo.pdf',sha256:keySha,sha256_tipo:'sha256_da_transcricao_canonica_dos_34_itens_do_gabarito_oficial',numero:n,pagina:1,resposta:letter,criterio:'Chave oficial do INEP no Repositório Institucional; gabarito de múltipla escolha de Arquitetura e Urbanismo.'},
    apta_resolucao:true, remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente'],
    ...(isRenumbered31?{numero_original:31,enunciado:cleanStem.get(q.id)}:{}),
    ...(cleanStem.has(q.id)?{enunciado:cleanStem.get(q.id)}:{}),
    ...(choiceCleanups.has(q.id)||q.id==='extr-59c0bed1402763c71556'?{opcoes:options}:{}),
    texto_apoio:'', visual:{pagina:page,imagem:image,motivo:'Página original conferida visualmente; preserva o enunciado, alternativas, texto-base, tabelas, desenhos e gráficos.'},
    ...(contextPages.length?{imagens_contexto:contextPages}:{})
  }
})

const existingIds=new Set(active.map(q=>q.id))
const missing=[
  {n:15,page:14,materia:'Arquitetura',conteudo:'Conforto acústico: reflexão e propagação do som em cobertura parabólica.',stem:'A imagem mostra a Igreja de São Francisco, no bairro da Pampulha, em Belo Horizonte, projetada por Oscar Niemeyer. Como a cobertura do templo tem forma de arco parabólico, o som propagado no interior da capela',options:['forma ponto surdo.','é difratado.','não produz eco.','é absorvido.','é transmitido.']},
  {n:16,page:14,materia:'Arquitetura',conteudo:'Conforto ambiental e eficiência energética: estratégias de iluminação natural em edifícios tropicais.',stem:'Observe os exemplos de edifícios apresentados na página original. O aproveitamento adequado da luz natural possibilita reduzir o consumo de energia. Para que esse objetivo seja atingido em edificações situadas nos trópicos, avalie as afirmações: I — a claraboia permite boa iluminação natural com baixo consumo; II — o uso de cobertura em shed é eficiente em altas, médias e baixas latitudes; III — bandejas de luz (light-shelves) reduzem o uso de luz artificial em ambientes de grande profundidade; IV — o lanternim é uma opção eficiente para entrada de luz natural e ventilação; V — a adoção de fachada dupla de vidro é justificável somente em cidades de altas latitudes. São corretas apenas as afirmações',options:['I, II e III.','I, II e IV.','I, IV e V.','II, III e IV.','III, IV e V.']},
  {n:21,page:17,materia:'Arquitetura',conteudo:'Teoria e história da arquitetura: Modulor de Le Corbusier, proporção, ergonomia e crítica antropométrica.',stem:'Le Corbusier defendia um sistema de medida proporcional denominado Modulor. A partir da figura original, considere as afirmações: I — o sistema atenderia a exigências funcionais e dimensionais humanas e também às exigências de beleza, por derivar da seção áurea; II — seria um instrumento universal, simples de empregar e aplicável mundialmente para obter proporções racionais; III — Le Corbusier adotou como referência inicial uma estatura humana de 1,75 m e depois elevou a referência para 1,83 m, considerando o aumento progressivo da estatura humana na Europa; IV — as conclusões do sistema podem ser questionadas pela aplicação inadequada de referências antropométricas e pela desconsideração das variações anatômicas individuais. São corretas as afirmações',options:['I e II, apenas.','I e III, apenas.','I, II e III, apenas.','II, III e IV, apenas.','I, II, III e IV.']},
  {n:25,page:21,materia:'Arquitetura',conteudo:'Sistemas construtivos e estruturas: comparação entre os cinco pontos de Le Corbusier e a construção popular da Favela da Maré.',stem:'Considere os paralelos entre a “laje” da Favela da Maré e o “teto-jardim” de Le Corbusier. I — Os construtores da Favela da Maré conhecem e seguem os preceitos de Le Corbusier. II — As mesmas possibilidades técnicas que amparam os cinco pontos de Le Corbusier estão presentes, em boa medida, nos materiais e técnicas das casas da Favela da Maré. III — Essas possibilidades técnicas que chamaram a atenção do arquiteto francês no início do século XX tornaram-se acessíveis, ao menos em parte, aos pobres das grandes cidades. IV — O concreto armado é o material da construção que representa perfeitamente aquelas “novas” possibilidades técnicas e também está presente nas casas da Favela da Maré. É(são) válido(s) o(s) paralelo(s)',options:['I, apenas.','IV, apenas.','II e III, apenas.','II, III e IV, apenas.','I, II, III e IV.']},
]
const adicoes=missing.map(({n,page,materia,conteudo,stem,options})=>{
  const id=`extr-${createHash('sha256').update(`${doc}:questao:${n}`).digest('hex').slice(0,20)}`
  if(existingIds.has(id))throw Error(`ID já existe para item ausente ${n}`)
  const letter=keyByNumber[n],image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  return {id,ano:2005,numero_original:n,banca:'ENADE',banca_original:'INEP',concurso:'ENADE 2005 — Arquitetura e Urbanismo',organizadora:'INEP',aplicacao:'ENADE',documento_id:doc,materia,conteudo,enunciado:stem,opcoes:options,resposta_correta:letter.charCodeAt(0)-65,anulada:false,pagina:page,pagina_imagem:image,imagens_paginas:[image],paginas_origem:[page],contexto_paginas:[{pagina:page,imagem:image,texto:'Página original com as figuras e os dados apresentados no item.'}],texto_apoio:'',fonte:prova,origem:'INEP — ENADE 2005 — Arquitetura e Urbanismo',documento_origem:'ARQUITETURA.pdf',tipo_documento:'Prova',tipo_extraido:'objetiva',tipo_resposta:'objetiva',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Transcrição visual individual da prova oficial e classificação semântica por conteúdo',classificacao_evidencia:`Questão ${n}, página impressa ${page}, transcrita do caderno oficial. Gabarito conferido na chave oficial do INEP.`,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; o INEP não publica faixa de dificuldade por item.',classificacao_fonte:prova,gabarito_oficial:{fonte:chave,arquivo:'gabarito_arquitetura_urbanismo.pdf',sha256:keySha,sha256_tipo:'sha256_da_transcricao_canonica_dos_34_itens_do_gabarito_oficial',numero:n,pagina:1,resposta:letter,criterio:'Chave oficial do INEP no Repositório Institucional; gabarito de múltipla escolha de Arquitetura e Urbanismo.'},integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]}}
})
if(decisions.length!==41 || decisions.filter(x=>x.apta_resolucao===false).length!==11 || adicoes.length!==4)throw Error('Contagens do pacote inconsistentes')
for(const d of [...decisions.filter(x=>x.visual),...adicoes])await fs.access(`public/acervo-extraido/${d.visual?.imagem||d.pagina_imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({revisadas:decisions.length,inativas:decisions.filter(x=>x.apta_resolucao===false).length,novas:adicoes.map(q=>q.numero_original),itensAtivosEsperados:34,gabarito_sha_transcricao:keySha,porMateria:Object.fromEntries([...new Set(decisions.filter(x=>x.apta_resolucao!==false).map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m&&d.apta_resolucao!==false).length]))},null,2));process.exit(0)}
const nome='revisao-enade-arquitetura-2005-v257'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions,adicoes})
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`
const current=await fs.readFile('scripts/acervo-publico/acervo-atual.mjs','utf8')
if(!current.includes(rootLine))await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\n${rootLine}\n`)
const report={...result,source:prova,answer_key:chave,answer_key_canonical_sha256:keySha,answer_key_hash_type:'canonical transcription digest; not the PDF file hash',missing_items_added:adicoes.map(q=>q.numero_original),instructions_and_survey_disabled:decisions.filter(x=>x.apta_resolucao===false).length,published:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ENADE 2005 — Arquitetura e Urbanismo — v257\n\n- Revisei os 41 registros pendentes: classifiquei os 30 itens objetivos existentes e retirei do fluxo de resolução duas extrações de instruções e nove perguntas de percepção da prova, que não avaliam conhecimento. Corrigi o número do item 31, que estava registrado como 5.\n- Conferi as páginas originais e acrescentei os itens 15, 16, 21 e 25, ausentes do banco. As imagens originais preservam diagramas, plantas, fotos, tabelas e escalas; limpei contaminações de OCR em enunciados e alternativas selecionados.\n- Vinculei o gabarito oficial da edição para os 34 itens objetivos; não há gabarito aplicado às perguntas de opinião. Validação local: ${result.classificadas} registros revisados, ${result.adicionadas} itens acrescentados, ${result.disponiveis} elegíveis e ${result.pendentes} pendências no acervo. Ainda não publicado na nuvem.\n- Fontes: [prova oficial no Repositório Institucional do INEP](<https://riep.inep.gov.br/items/95764a20-0e47-479e-8e39-2240122a7c64>), [gabarito oficial](<${chave}>), [página oficial de provas e gabaritos](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos).\n`)
console.log(JSON.stringify(report,null,2))
