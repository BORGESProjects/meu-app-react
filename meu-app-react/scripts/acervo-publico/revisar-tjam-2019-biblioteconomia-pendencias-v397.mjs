import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tjam-2019-biblioteconomia-pendencias-v397'
const doc='997aae00f847045d'
const prova='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/481_TJAM003_MATRIZ.PDF'
const gabaritoBasicos='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAMCB3__PAG_3.PDF'
const gabaritoCargo='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAM003__PAG_4.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const respostas={
  40:'E',51:'E',52:'C',53:'C',54:'C',56:'C',57:'E',58:'E',59:'C',61:'E',62:'C',68:'E',69:'C',70:'E',71:'C',72:'E',73:'E',75:'E',76:'C',77:'C',81:'E',83:'E',84:'C',85:'C',90:'E',91:'C',92:'C',93:'C',94:'C',95:'E',99:'E',105:'E',107:'C',113:'C',114:'C',115:'E',116:'C'
}
const temas={
  40:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: comunicação processual fora do meio eletrônico'],
  51:['Biblioteconomia','Fontes de informação jurídica: fontes primárias, secundárias e terciárias'],
  52:['Biblioteconomia','Fontes jurídicas primárias: legislação e Constituição Federal'],
  53:['Biblioteconomia','Teoria das fontes do Direito: fontes materiais e formais'],
  54:['Biblioteconomia','Fontes formais do Direito: espécies normativas'],
  56:['Informática','Dispositivos de entrada: leitores ópticos, cartões e sensores'],
  57:['Informática','Periféricos de saída: impressoras seriais e a laser'],
  58:['Informática','Memória principal: características de RAM e ROM'],
  59:['Informática','Arquitetura de computadores: entrada de dados e comunicação com a CPU'],
  61:['Biblioteconomia','Indexação e resumos: finalidade do índice'],
  62:['Biblioteconomia','Indexação: termos como pontos de acesso e recuperação da informação'],
  68:['Biblioteconomia','Classificação Decimal Universal: tabelas auxiliares e sinais de relação'],
  69:['Biblioteconomia','Classificação Decimal Universal: notação, forma e indicação de idioma'],
  70:['Biblioteconomia','Resumos: resumo indicativo, informativo e crítico'],
  71:['Biblioteconomia','Normas de resumos: extensão por tipo de documento'],
  72:['Biblioteconomia','Índices e sumários: estrutura e remissivas'],
  73:['Biblioteconomia','Indexação: controle de vocabulário e informações complementares'],
  75:['Biblioteconomia','Catalogação: título principal e título alternativo'],
  76:['Biblioteconomia','Catalogação: indicação de responsabilidade e fontes de informação'],
  77:['Biblioteconomia','Catalogação: descrição da edição na ausência de indicação'],
  81:['Biblioteconomia','Serviços de informação: seleção e avaliação de fontes'],
  83:['Biblioteconomia','Gestão de unidades de informação: objetivos e metas'],
  84:['Biblioteconomia','Marketing da informação: análise de mercado e estudos mercadológicos'],
  85:['Biblioteconomia','Marketing de unidades de informação: definição de objetivos'],
  90:['Biblioteconomia','Fontes de informação: comunicação do conhecimento em língua natural'],
  91:['Biblioteconomia','Linguagens documentárias: métodos indutivo e dedutivo na coleta de termos'],
  92:['Biblioteconomia','Recuperação da informação na Internet: buscadores e metabusca'],
  93:['Biblioteconomia','Representação da informação: ficha catalográfica como metadado'],
  94:['Biblioteconomia','Organização da informação: dicionário de dados e metadados'],
  95:['Biblioteconomia','Recuperação da informação: indexação automatizada e intervenção humana'],
  99:['Biblioteconomia','Fontes oficiais de informação jurídica: seções do Diário Oficial da União'],
  105:['Biblioteconomia','Estudos de usuários: entrevistas e coleta de dados'],
  107:['Biblioteconomia','Disseminação Seletiva da Informação (DSI): perfis e serviços personalizados'],
  113:['Biblioteconomia','Controle bibliográfico: acessibilidade bibliográfica e física'],
  114:['Biblioteconomia','Bibliografia: conceito, descrição e organização de listas'],
  115:['Biblioteconomia','Bibliografias na era digital: atualidade e uso de repertórios'],
  116:['Biblioteconomia','Bibliografias: periodicidade, tratamento e cobertura documental']
}
function contexto(n){
  if(n===40)return 'Comando: julgue o item com base na Lei nº 11.419/2006, que disciplina a informatização do processo judicial e a prática de atos processuais por meio eletrônico.'
  if(n<=55)return 'Comando: itens sobre documentação e informação jurídica, natureza das fontes do Direito e etapas do processo legislativo federal.'
  if(n<=60)return 'Comando: itens sobre componentes e dispositivos de computadores usados em bibliotecas, incluindo entrada, processamento, memória e saída de dados.'
  if(n<=73)return 'Texto-base: indexação de assuntos e elaboração de resumos são atividades relacionadas à representação e recuperação do conteúdo temático de documentos. O bloco também aborda classificação e notação bibliográfica.'
  if(n<=77)return 'Comando: itens sobre descrição bibliográfica, título, indicação de responsabilidade e dados da edição.'
  if(n<=85)return 'Comando: itens sobre gestão de unidades de informação, fontes, planejamento, estudos de mercado e marketing de serviços bibliotecários.'
  if(n<=95)return 'Comando: itens sobre fontes de informação, terminologia, indexação, metadados, organização e recuperação da informação em catálogos e mecanismos de busca.'
  if(n===99)return 'Comando: item sobre divulgação oficial de atos e informações jurídicas no Diário Oficial da União.'
  if(n<=107)return 'Comando: itens sobre estudos de usuários e serviços de disseminação de informação personalizados.'
  return 'Comando: itens sobre controle bibliográfico, bibliografias, sua definição, organização, alcance e uso em ambiente digital.'
}

if(records.length!==37||new Set(records.map(q=>q.numero)).size!==37)throw Error(`Esperados 37 itens distintos; recebidos ${records.length}.`)
if(records.some(q=>q.resposta!=null))throw Error('Há resposta preexistente; revisão interrompida para evitar sobrescrita.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=temas[n],answer=respostas[n]
  if(!topic||!answer)throw Error(`Item ${n}: classificação ou gabarito oficial não mapeado.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}.`)
  const stem=q.enunciado.trim().split(/\n\s*(?:Espaço livre|CEBRASPE\s*[–—-]\s*TJAM)/i)[0].trim()
  return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:contexto(n),materia:topic[0],conteudo:topic[1],ano:2019,concurso:'TJ/AM 2019 — Tribunal de Justiça do Estado do Amazonas — Analista Judiciário — Especialidade Biblioteconomia — Cargo 3',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 13/10/2019',cargo:'Analista Judiciário — Especialidade Biblioteconomia — Cargo 3',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[40,51,53,54,62,68,69,70,71,73,75,76,77,83,84,91,92,94,95,99,105,107,113,116].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, normativa ou técnica; não é nível publicado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 3; matéria e conteúdo classificados conforme o conceito biblioteconômico, jurídico ou de informática avaliado.`,resposta_correta:answer==='C'?0:1,anulada:false,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:n<=40?gabaritoBasicos:gabaritoCargo,arquivo:(n<=40?gabaritoBasicos:gabaritoCargo).split('/').at(-1),prova,numero:n,pagina:1,resposta:answer,criterio:n<=40?'Gabarito oficial definitivo dos Conhecimentos Básicos do caderno Cargo 3.':'Gabarito oficial definitivo do Cargo 3 — Biblioteconomia.'},apta_resolucao:true}
})
if(decisions.some(d=>!d.texto_apoio||!d.materia||!d.conteudo||d.ano!==2019))throw Error('Há item sem contexto ou filtros completos.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,porMateria:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),semContexto:decisions.filter(d=>!d.texto_apoio).map(d=>d.numero),semGabarito:decisions.filter(d=>!d.gabarito_oficial).map(d=>d.numero),prova,gabaritoBasicos,gabaritoCargo,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — TJ/AM 2019 — Biblioteconomia — Cargo 3',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabaritos:{basicos:gabaritoBasicos,cargo:gabaritoCargo},publicado:false,nota:'37 registros pendentes classificados por matéria e tópico, com gabarito definitivo específico para o Cargo 3. Item 40 foi conferido no gabarito básico; item 43 do conjunto não fazia parte das pendências deste lote. Imagens originais de página foram preservadas; os contextos compartilhados foram vinculados por bloco. Dificuldade estimada editorialmente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — TJ/AM 2019 — Biblioteconomia, Cargo 3 — revisão v397\n\n- 37 itens pendentes reclassificados entre Biblioteconomia, Informática e Legislação de Tecnologia da Informação, com conteúdo específico e filtros de prova/ano/cargo.\n- Respostas conferidas nos gabaritos oficiais definitivos de Conhecimentos Básicos do Cargo 3 e do caderno específico de Biblioteconomia.\n- Contextos de fontes jurídicas, indexação, classificação, catalogação, gestão de bibliotecas, recuperação da informação e processo eletrônico foram associados aos grupos pertinentes. Campos de imagem e página do caderno foram mantidos.\n- Dificuldade indicada como estimativa editorial.\n- Fontes: [caderno oficial do Cargo 3](${prova}), [gabarito definitivo de conhecimentos básicos](${gabaritoBasicos}) e [gabarito definitivo de Biblioteconomia](${gabaritoCargo}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify({...report,classificadas:result.classificadas,disponiveis:result.disponiveis,pendentes:result.pendentes},null,2))
