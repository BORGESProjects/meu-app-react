import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { lotesAtuais, raizesAtuais } from './acervo-atual.mjs'

const nome='revisao-cau-mg-arquiteto-2025-v416'
const documento='4432bc2b6b5b66cf'
const prova='https://cdn.cebraspe.org.br/concursos/CAU_MG_25/arquivos/078_CAU_MG_002_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/cau_mg_25/arquivos/Gab_Definitivo_078_CAU_MG_CG2_01.pdf'
const answers='C C C E C E E C C E C E C C E E E E C C  C C E E C C C C C E C C C C E E C C E C  E E X E C E C E E E E E E C E C C E E C  C C C C E E E C E C'.trim().split(/\s+/)
if(answers.length!==70) throw Error(`Gabarito tem ${answers.length} respostas, esperado 70`)
const materiaConteudo=n=>{
  if(n<=54)return ['História da Arquitetura e do Urbanismo','Patrimônio cultural brasileiro, urbanismo colonial, bens tombados e preservação']
  if(n<=58)return ['Arquitetura','Projeto arquitetônico, documentação, execução e intervenções em edificações']
  if(n<=61)return ['Desenho Técnico','Representação gráfica, escalas, convenções e leitura de projetos']
  if(n<=65)return ['Urbanismo','Planejamento urbano, uso do solo, gestão democrática e instrumentos do Estatuto da Cidade']
  if(n<=68)return ['Direito Urbanístico','Parcelamento do solo urbano, legislação urbana e instrumentos de ordenação']
  if(n<=73)return ['Arquitetura Paisagística','Paisagismo, espaços livres, vegetação e composição da paisagem']
  if(n<=79)return ['Projeto de Arquitetura','Programa, etapas, coordenação, compatibilização e desenvolvimento de projetos']
  if(n<=85)return ['Conforto Ambiental','Conforto térmico, clima, orientação solar, ventilação e desempenho ambiental']
  if(n<=92)return ['Tecnologia da Construção','Sistemas construtivos, materiais, estruturas, instalações e segurança contra incêndio']
  if(n<=97)return ['Projeto e Execução de Obras','Fiscalização, especificações, detalhes construtivos, orçamento e controle de obras']
  if(n<=102)return ['Legislação e Ética Profissional','Lei nº 12.378/2010, atribuições, ética, direitos autorais e responsabilidade técnica']
  if(n<=104)return ['Legislação Profissional','Registro, atribuições e exercício profissional em Arquitetura e Urbanismo']
  if(n<=109)return ['Acessibilidade','ABNT NBR 9050, desenho universal e legislação de inclusão e acessibilidade']
  if(n===110)return ['Direito Constitucional','Ação popular e tutela jurisdicional do patrimônio público']
  if(n<=112)return ['Direito Urbanístico','Lei nº 6.766/1979 e parcelamento do solo urbano']
  return ['Legislação Profissional','Normas e resoluções do CAU/BR, registro, RRT, honorários e exercício profissional']
}
const blocos=[
  [51,54,'História da arquitetura e do urbanismo'],[55,58,'Projeto e documentação arquitetônica'],
  [59,61,'Desenho técnico'],[62,65,'Planejamento urbano'],[66,68,'Parcelamento urbano'],
  [69,73,'Paisagismo'],[74,79,'Projeto arquitetônico'],[80,85,'Conforto ambiental'],
  [86,92,'Tecnologia e sistemas construtivos'],[93,97,'Execução e fiscalização de obras'],
  [98,104,'Legislação e exercício profissional'],[105,109,'Acessibilidade e inclusão'],
  [110,110,'Ação popular'],[111,112,'Parcelamento do solo urbano'],[113,120,'Regulamentação profissional do CAU']
]
const imagemPorPagina=async pagina=>{
  const p=`public/acervo-extraido/paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  await fs.access(p);return `paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
}
const registros=[]
for await(const {questoes} of lotesAtuais(raizesAtuais)) for(const q of questoes) if(q.documento_id===documento && q.classificacao_pendente && !q.classificacao_revisada && q.integridade_profissional?.apta_resolucao!==false) registros.push(q)
registros.sort((a,b)=>Number(a.numero_original)-Number(b.numero_original))
if(registros.length!==70 || new Set(registros.map(q=>q.numero_original)).size!==70) throw Error(`Esperados 70 itens únicos; encontrados ${registros.length}`)
const canonical=registros.map((q,i)=>`${q.numero_original}:${answers[i]}`).join('\n')
const keyHash=createHash('sha256').update(canonical).digest('hex')
const decisoes=[]
for(let i=0;i<registros.length;i++){
  const q=registros[i],n=Number(q.numero_original),pagina=Number(q.pagina),[materia,conteudo]=materiaConteudo(n),g=answers[i],anulada=g==='X'
  const imagem=await imagemPorPagina(pagina)
  const apoio=Array.isArray(q.apoio)?q.apoio.map(x=>x.texto).filter(Boolean).join('\n\n'):String(q.texto_apoio||'')
  const faixa=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]
  decisoes.push({
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
    concurso:'CAU/MG 2025 — Cargo 2: Arquiteto e Urbanista',banca:'CEBRASPE',organizadora:'CEBRASPE',
    aplicacao:'Concurso CAU/MG — prova objetiva aplicada em 13/07/2025',cargo:'Arquiteto e Urbanista',
    numero_original:n,numero:n,pagina,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',
    resposta_correta:anulada?null:(g==='C'?0:1),anulada,
    dificuldade:n>=98&&n<=112?'Difícil':n>=80&&n<=97?'Média':'Média',dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial por densidade normativa e técnica do item; a banca não publica nível individual de dificuldade.',
    classificacao_fonte:prova,
    motivo:`Item ${n} do caderno oficial CAU/MG 2025, Cargo 2. Banca, cargo, ano e aplicação cotejados com a publicação do Cebraspe; matéria e conteúdo classificados pelo enunciado e pelo bloco temático “${faixa}”.`,
    texto_apoio:apoio,
    visual:{pagina,imagem,texto_apoio:apoio,motivo:`Página ${pagina} do caderno oficial vinculada ao item ${n}; mantidos contexto e elementos gráficos existentes.`},
    apta_resolucao:true,
    gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_078_CAU_MG_CG2_01.pdf',prova:'078_CAU_MG_002_01.pdf',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:g,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado e sem correção automática.':'Gabarito oficial definitivo CEBRASPE, Cargo 2 — Arquiteto e Urbanista.'},
    ...(anulada?{anulacao_fonte:chave}:{}),
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']
  })
}
const base=raizesAtuais[0]
await fs.mkdir('tmp',{recursive:true})
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
const out={...report,documento,questoes_revisadas:decisoes.length,questoes_unicas:70,item_anulado:93,prova_oficial:prova,gabarito_definitivo:chave,checksum_gabarito:keyHash,correcao_automatica:69}
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
console.log(JSON.stringify(out,null,2))
