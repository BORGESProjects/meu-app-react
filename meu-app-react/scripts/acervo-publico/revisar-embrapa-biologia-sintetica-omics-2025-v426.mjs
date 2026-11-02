import fs from 'node:fs/promises'
import path from 'node:path'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-embrapa-biologia-sintetica-omics-2025-v426'
const doc='6e2dc9441ba83791'
const prova='https://cdn.cebraspe.org.br/concursos/EMBRAPA_24/arquivos/042_EMBRAPA_ANALISTA_021_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/EMBRAPA_24/arquivos/Gab_Definitivo_042_EMBRAPA_ANALISTA_021_01.PDF'
const concurso='EMBRAPA 2025 — Analista — Ciências Biológicas — Biologia Sintética e Ciências Ômicas — Opção 40000605'
const cargo='Analista — Área: Ciências Biológicas — Subárea: Biologia Sintética e Ciências Ômicas — Opção 40000605'
const aplicacao='23/03/2025'
const fontes=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8'))
const fonte=fontes.find(x=>x.id===doc)
if(!fonte||fonte.url!==prova||fonte.arquivo!=='042_EMBRAPA_ANALISTA_021_01.pdf')throw Error('Identificação do caderno não confere com o catálogo oficial local.')
const keys=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')
const official=keys.trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
if(!official||official.status!=='tabela_lida'||official.gabarito_url!==gabarito||official.sha256!=='741e54ae110bfe7e9a7ef31f9de831670f802905d18d7038ea094881a1932224')throw Error('Gabarito definitivo oficial ausente ou diferente do documento validado.')
const answers={71:'C',72:'C',73:'C',74:'C',75:'E',76:'C',77:'E',78:'C',79:'E',80:'C',81:'C',82:'E',83:'E',84:'E',85:'E',86:'E',87:'E',88:'C',89:'C',90:'C',91:'E',92:'C',93:'C',94:'E',95:'C',96:'C',97:'C',98:'C',99:'E',100:'C'}
if(Object.entries(answers).some(([n,v])=>official.respostas[n]!==v)||Object.keys(official.respostas).length!==30)throw Error('Gabarito 71–100 diverge do definitivo conferido para este caderno.')
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(pendentes.length!==38||new Set(pendentes.map(q=>q.numero)).size!==30)throw Error('Cobertura do lote mudou: esperados 38 registros e 30 itens únicos.')

const duplicados=new Map([
 ['extr-1b66efed5c577d014a48','extr-f77ac1f868b7eab36b07'],
 ['extr-37f990ccc2bcf31bd652','extr-98b81c0aadfdc5d7e5a6'],
 ['extr-a983ef6b5df1041378c6','extr-ffbaaded84ea9ae034ed'],
 ['extr-cfa275167f10b7a0c645','extr-4cf3404fb9d1b7354d58'],
 ['extr-5ac20a12485e6ae1a247','extr-90120d28e66bffd2b537'],
 ['extr-a856185148b5a0ddc83a','extr-2e50b3a91891047d3d68'],
 ['extr-19352064a402709eab66','extr-b8059d442f4b76707340'],
 ['extr-dd44cf0f23eae8e2d3f4','extr-8c6090ef35c48c717cad']
])
const difficulty={71:'Média',72:'Média',73:'Média',74:'Média',75:'Difícil',76:'Difícil',77:'Média',78:'Média',79:'Média',80:'Fácil',81:'Média',82:'Média',83:'Média',84:'Fácil',85:'Média',86:'Fácil',87:'Média',88:'Fácil',89:'Fácil',90:'Média',91:'Fácil',92:'Média',93:'Difícil',94:'Média',95:'Média',96:'Fácil',97:'Média',98:'Fácil',99:'Média',100:'Média'}
const topics={
 71:'Biologia sintética: organismos semissintéticos e pares de bases não naturais',
 72:'Biologia sintética: circuitos genéticos e expressão gênica',
 73:'Biologia sintética: autorreplicação de sistemas artificiais',
 74:'Biologia sintética: dependência metabólica e organismos mínimos',
 75:'Edição genômica: CRISPR-Cas, prime editing e base editing',
 76:'Metabolômica: integração de abordagens untargeted e targeted',
 77:'Metabolômica: RMN, sensibilidade e quantificação de metabólitos',
 78:'Bioquímica de proteínas: proteínas intrinsecamente desordenadas',
 79:'Proteômica: estrutura proteica e modificações pós-traducionais',
 80:'Metagenômica: caracterização de microbiomas sem cultivo',
 81:'Ciências ômicas: integração de genômica, transcriptômica e proteômica',
 82:'Transcriptômica: classes de RNA e expressão gênica',
 83:'Transformação genética vegetal: transformação transiente e estável',
 84:'Transformação genética: eletroporação',
 85:'Transformação genética vegetal: vetor Agrobacterium tumefaciens',
 86:'Transformação genética vegetal: método biobalístico',
 87:'Genética bacteriana: conjugação e transferência horizontal',
 88:'Microbiologia agrícola: caracterização molecular de microrganismos',
 89:'Microbiologia do solo: rizosfera e disponibilidade de nutrientes',
 90:'Bioprocessos: fermentação em estado sólido de microrganismos agrícolas',
 91:'Microbiologia agrícola: seleção de microrganismos e desempenho em campo',
 92:'Bioinsumos: formulação, estabilidade e viabilidade comercial',
 93:'Melhoramento genético: GWAS, seleção genômica e loci de características complexas',
 94:'Melhoramento genético: avaliação fenotípica e seleção assistida por marcadores',
 95:'Genética quantitativa: QTL, mapas genéticos e interação genótipo-ambiente',
 96:'Genética molecular: SNPs como marcadores em melhoramento',
 97:'Genética quantitativa: seleção de características monogênicas e poligênicas',
 98:'Melhoramento genético: seleção assistida por marcadores em estágios iniciais',
 99:'Genética quantitativa: seleção assistida em características poligênicas',
 100:'Genética molecular: comparação de marcadores microssatélites e SNPs'
}
const stems={
 71:'A produção de organismos com alfabeto genético expandido abre novas possibilidades para a biologia sintética, como é o caso da criação de nucleotídeos sintéticos, que formam pares de bases não naturais (UBP) e criam um organismo semissintético (SSO) capaz de armazenar informações genéticas aumentadas.',
 72:'Na biologia sintética, a construção de circuitos genéticos artificiais permite o controle preciso da expressão gênica em microrganismos e possibilita a síntese de biomoléculas de interesse industrial, que perpassam desde substâncias que não são produzidas naturalmente até tentativas de síntese de seres vivos completamente novos.',
 73:'A biologia sintética já conseguiu produzir organismos que sejam capazes de autorreplicação sustentada em ambientes controlados, embora ainda haja algumas limitações.',
 74:'Replicações genéticas feitas sob condições controladas falham em ambientes naturais devido a sua dependência de nutrientes específicos e à fragilidade genética resultante da remoção de genes não essenciais.',
 75:'Para mitigar desafios técnicos, como a ocorrência de mutações off-target e a necessidade de mecanismos eficientes de reparo do DNA, são utilizadas variantes enzimáticas da Cas9, como a Cas9 de alta fidelidade (Cas9-HF) e a Cas12a (Cpf1), além das edições primária (prime editing) e de base (base editing), que permitem modificações mais controladas no genoma por permitir mais cortes na dupla fita do DNA.',
 76:'Considere que, em um estudo metabolômico voltado para o desenvolvimento de plantas resistentes ao estresse hídrico, um analista tenha utilizado exclusivamente a análise metabolômica não direcionada (untargeted) para correlacionar variações entre perfis metabólicos e a tolerância ao estresse. Considere, ainda, que, na compilação de dados, esse analista encontrou dificuldades na identificação precisa de metabólitos-chave previamente associados com a resposta ao estresse. Nessa situação hipotética, para sanar esse problema, o analista deverá utilizar, também, uma abordagem direcionada (targeted) para conseguir quantificar e validar os biomarcadores identificados.',
 77:'Para identificar biomarcadores associados a doenças metabólicas humanas, um analista deve escolher a técnica de espectroscopia de ressonância magnética nuclear (RMN) para detectar metabólitos de baixa abundância e diferenciar compostos estruturalmente semelhantes, pois apresenta reprodutibilidade e é capaz de fazer a quantificação absoluta dos metabólitos em biofluidos.',
 78:'As proteínas intrinsecamente desordenadas contam com uma estrutura altamente flexível, que pode adotar diferentes conformações em resposta a mudanças nas condições ambientais e interações moleculares, e a função dessas proteínas não depende de uma estrutura fixa, mas da capacidade de se moldar e interagir com outras moléculas de maneira dinâmica.',
 79:'A proteômica se refere à análise da estrutura primária das proteínas e não abrange modificações pós-traducionais.',
 80:'A metagenômica permite a identificação e caracterização de microrganismos presentes em amostras ambientais, sem a necessidade de cultivo, e é amplamente utilizada em estudos de microbiomas.',
 81:'O uso combinado de genômica, transcriptômica e proteômica permite uma visão integrada da biologia celular, o que auxilia a descoberta de novos alvos terapêuticos.',
 82:'A transcriptômica se limita a analisar o RNA mensageiro (mRNA), sem considerar outros tipos de RNA, como microRNAs e RNAs longos não codificantes.',
 83:'A transformação transiente é útil para estudos rápidos, como regulação gênica e localização de proteínas, nos casos em que se busca uma transformação genética estável, com produção de plantas transgênicas que herdem o gene de interesse, e quando se deseja alcançar a expressão contínua em gerações subsequentes de plantas.',
 84:'A técnica de eletroporação permite a introdução de DNA exógeno em células por meio da aplicação de pulsos elétricos que diminuem a permeabilidade da membrana celular.',
 85:'O uso de Agrobacterium tumefaciens como vetor para a introdução de genes de interesse em plantas, sem uso de gene marcador de seleção, é apropriado, pois a presença de um único gene de interesse é suficiente para garantir a transformação bem-sucedida e a expressão do gene no sistema vegetal.',
 86:'O método biobalístico utiliza vetores virais para a inserção de DNA em células vegetais.',
 87:'O processo de transformação genética por conjugação depende de vetores virais, ocorre em eucariotos e é ausente em bactérias.',
 88:'Técnicas de biologia molecular, como sequenciamento de DNA, são utilizadas para caracterizar geneticamente microrganismos isolados durante a prospecção.',
 89:'O uso de microrganismos rizosféricos na agricultura pode aumentar a disponibilidade de nutrientes para as plantas.',
 90:'A fermentação em estado sólido é uma técnica utilizada na produção, em larga escala, de microrganismos agrícolas.',
 91:'A seleção de microrganismos para uso agrícola baseia-se apenas na sua capacidade de sobrevivência em laboratório.',
 92:'A formulação de bioinsumos é etapa fundamental para a viabilidade comercial dos microrganismos agrícolas.',
 93:'Técnicas como GWAS (genome-wide association studies) e seleção genômica ampliaram a aplicação da seleção assistida por marcadores moleculares, o que permite a identificação de loci associados a características complexas em grandes populações.',
 94:'A avaliação fenotípica, nas etapas finais de melhoramento genético, é a análise que tem o menor impacto na seleção assistida por marcadores moleculares.',
 95:'O sucesso da seleção assistida por marcadores em culturas agrícolas está condicionado à precisão dos mapas genéticos e à validação do efeito do QTL (quantitative trait loci) em diferentes ambientes e populações.',
 96:'Marcadores do tipo SNP (single nucleotide polymorphism) são amplamente utilizados na seleção assistida por marcadores, devido a sua alta densidade genômica e facilidade de detecção automatizada.',
 97:'A seleção assistida por marcadores é mais eficaz em características controladas por um único gene do que em características quantitativas complexas.',
 98:'A técnica de seleção assistida por marcadores permite a seleção de indivíduos portadores de alelos desejáveis em estágios iniciais do desenvolvimento, o que acelera o processo de melhoramento.',
 99:'Em programas de melhoramento genético, a seleção assistida por marcadores é limitada à identificação de genes de herança simples, e não é aplicada em características de base poligênica.',
 100:'A utilização de marcadores microssatélites na técnica de seleção assistida por marcadores moleculares oferece maior polimorfismo em comparação aos SNPs, mas apresenta menor automação e eficiência em larga escala.'
}
const headings=[
 {from:71,to:75,text:'Acerca das teorias e dos avanços relacionados à biologia sintética, julgue os itens que se seguem.'},
 {from:76,to:77,text:'Julgue os itens a seguir, com referência a ciências ômicas.'},
 {from:88,to:92,text:'Julgue os itens subsequentes, a respeito do processo de prospecção e da produção de microrganismos de interesse agrícola.'},
 {from:93,to:100,text:'Acerca da seleção assistida por marcadores moleculares, julgue os itens que se seguem.'}
]
const semPendencias=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
const decisaoPorNumero=new Map()
for(const [n,stem] of Object.entries(stems)){
 const numero=Number(n),h=headings.find(x=>numero>=x.from&&numero<=x.to),page=numero<=87?1:2,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,valor=answers[n]
 decisaoPorNumero.set(numero,{numero,stem,heading:h?.text||'',page,image,valor,topic:topics[n],difficulty:difficulty[n]})
}
const decisoes=pendentes.map(q=>{
 const numero=Number(q.numero),d=decisaoPorNumero.get(numero)
 if(!d)throw Error(`Item ${numero} sem revisão.`)
 const duplicada=duplicados.has(q.id)
 if(duplicada&&!pendentes.some(x=>x.id===duplicados.get(q.id)&&Number(x.numero)===numero))throw Error(`Registro canônico da duplicata não corresponde ao item ${numero}.`)
 const old=enunciadoHash(q.enunciado)
 const decision={id:q.id,sha256_enunciado:old,materia:'Biologia',conteudo:d.topic,ano:2025,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao,cargo,numero_original:numero,numero,pagina:d.page,dificuldade:d.difficulty,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; a banca não publicou parâmetro psicométrico de dificuldade. Nível atribuído pela densidade conceitual e inferência necessária.',classificacao_fonte:prova,motivo:`Classificação individual pelo enunciado e pelo agrupamento temático do caderno oficial da opção 40000605. A prova identifica a subárea Biologia Sintética e Ciências Ômicas e tem aplicação em 23/03/2025.`,resposta_correta:d.valor==='C'?0:1,anulada:false,gabarito_oficial:{valor:d.valor,fonte:gabarito,arquivo:'Gab_Definitivo_042_EMBRAPA_ANALISTA_021_01.PDF',prova:'042_EMBRAPA_ANALISTA_021_01.pdf',sha256:official.sha256,numero,pagina:1,criterio:'Gabarito oficial definitivo CEBRASPE, opção 40000605, itens 71–100; publicado pela banca.'},visual:{pagina:d.page,imagem:d.image,enunciado:d.stem,texto_apoio:d.heading,motivo:'Transcrição conferida visualmente com a página correspondente do caderno oficial CEBRASPE; arquivo de imagem original preservado.'},apta_resolucao:!duplicada,remover_pendencias:semPendencias,...(duplicada?{inelegibilidade_motivo:'Cópia duplicada do mesmo item no mesmo caderno. Mantém-se apenas o registro canônico com enunciado conferido.',duplicada_de:duplicados.get(q.id)}:{})}
 if(d.heading)decision.texto_apoio=d.heading
 return decision
})

function enunciadoHash(value){return hashRevisao(value)}
if(decisoes.length!==38||decisoes.filter(x=>x.apta_resolucao).length!==30||new Set(decisoes.map(x=>x.numero)).size!==30)throw Error('A revisão deve manter 30 itens e desativar exatamente 8 duplicatas.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:decisoes.length,itensUnicos:decisoes.filter(x=>x.apta_resolucao).length,duplicatas:decisoes.filter(x=>!x.apta_resolucao).length,gabaritosOficiais:decisoes.filter(x=>x.gabarito_oficial).length,stemTranscritos:decisoes.filter(x=>x.visual?.enunciado).length,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const report={...result,documento:doc,concurso,aplicacao,itens_caderno:30,registros_revisados:38,duplicatas_desativadas:8,gabaritos_definitivos_vinculados:30,transcricoes_conferidas_visualmente:30,fonte_prova:prova,fonte_gabarito:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
