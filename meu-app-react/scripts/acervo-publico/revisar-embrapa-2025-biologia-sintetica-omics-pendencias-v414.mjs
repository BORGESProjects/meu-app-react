import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-embrapa-2025-biologia-sintetica-omics-pendencias-v414'
const doc='c700a56658083454'
const concurso='EMBRAPA 2025 — Pesquisador — Ciências Biológicas — Biologia Sintética e Ciências Ômicas — Opção 40000345'
const prova='https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/140_041_EMBRAPA_PESQUISADOR_056_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/Gab_Definitivo_140_041_EMBRAPA_PESQUISADOR_056_01.PDF'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const existentes=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const item109=existentes.find(q=>Number(q.numero)===109)
if(!item109||pendentes.length!==38||new Set(pendentes.map(q=>q.id)).size!==38||new Set(pendentes.map(q=>q.numero)).size!==34)throw Error('A fila ou a cobertura do documento mudou; confira novamente.')
const records=[...pendentes,item109]
if(new Set(records.map(q=>q.id)).size!==39||new Set(records.map(q=>q.numero)).size!==35)throw Error('Cobertura inesperada do caderno.')

const defs={
76:['Biotecnologia','Biologia sintética: engenharia metabólica de microrganismos para produção de biocombustíveis'],
77:['Biotecnologia','Biologia sintética: microrganismos geneticamente modificados e desenvolvimento de vacinas'],
78:['Biotecnologia','Biologia sintética: desenho e inserção de DNA sintético'],
79:['Biotecnologia','Biologia sintética: fundamentos interdisciplinares e construção de sistemas biológicos'],
80:['Biotecnologia Vegetal','Biofortificação de culturas: provitamina A em plantas'],
81:['Genética','Ciências ômicas no melhoramento genético e riscos à biodiversidade'],
82:['Genética','Genômica e fenotipagem aplicadas ao melhoramento de plantas'],
83:['Genética','Transcriptômica: expressão gênica e características agronômicas'],
84:['Genética','Proteômica e metabolômica no melhoramento genético vegetal'],
85:['Genética','Proteômica aplicada a características agronômicas'],
86:['Biotecnologia','Biossensores sintéticos: aplicações em diagnóstico de doenças'],
87:['Biotecnologia','Células sintéticas e sistemas biológicos artificiais'],
88:['Biotecnologia','Construção de sistemas biológicos artificiais e biossensores'],
89:['Biotecnologia','Biossensores: integração de dados biológicos e componentes eletrônicos'],
90:['Biotecnologia','Sistemas biológicos artificiais e aplicações terapêuticas'],
91:['Genética','Circuitos sintéticos para controle da expressão gênica em plantas'],
92:['Genética','CRISPR/dCas9: modulação simultânea da expressão de múltiplos genes'],
93:['Genética','Epigenética vegetal aplicada ao melhoramento de plantas'],
94:['Genética','Epigenômica: estados da cromatina e métodos de análise'],
95:['Genética','Epigenética: regulação da expressão sem alteração da sequência de DNA'],
96:['Genética','Alterações epigenéticas e efeitos ao longo da vida'],
97:['Genética','Regulação epigenética da expressão: metilação, acetilação e fosforilação'],
98:['Bioinformática','Bases de dados de promotores vegetais e elementos reguladores'],
99:['Bioinformática','Predição de genes e pipelines de melhoramento vegetal'],
100:['Melhoramento Genético Vegetal','GWAS, variabilidade genética e seleção assistida por marcadores'],
101:['Melhoramento Genético Vegetal','Fenotipagem de plantas: ângulo foliar e estresse hídrico'],
102:['Ciências Ômicas','Metabolômica vegetal e rendimento de culturas'],
103:['Ciências Ômicas','Integração de dados multiômicos e mecanismos de resistência vegetal'],
104:['Bioinformática','Inteligência artificial aplicada à análise de dados ômicos e estresse vegetal'],
105:['Ciências Ômicas','Metaboloma: definição, massa molecular e amostras biológicas'],
106:['Ciências Ômicas','Genômica, transcriptômica, proteômica e metabolômica: escopo e definições'],
107:['Genética Molecular','Sequenciamento de DNA e aplicações em biologia e melhoramento'],
108:['Genética Molecular','Edição genômica e melhoramento simultâneo de características quantitativas'],
109:['Genética Molecular','CRISPR/Cas9: edição genética e aplicações biomédicas'],
110:['Genética Molecular','Edição gênica, engenharia genômica e tecnologia do DNA recombinante']
}
const commands={
76:'Com referência a biologia sintética, julgue os próximos itens.',
81:'Julgue os itens que se seguem, pertinentes às ciências ômicas.',
86:'Julgue os próximos itens, a respeito do desenvolvimento de sistemas biológicos artificiais e biossensores.',
91:'Julgue os itens subsequentes, relativos ao design de circuitos sintéticos que regulam a expressão gênica.',
93:'A respeito de epigenômica e regulação epigenética, julgue os itens a seguir.',
98:'Com relação ao uso de ferramentas bioinformáticas no melhoramento de plantas, julgue os itens seguintes.',
102:'A respeito de dados ômicos no melhoramento de plantas, julgue os próximos itens.',
107:'Acerca de análise genômica e sequenciamento de DNA, julgue os itens subsecutivos.'
}
const canonical=new Map([[82,'extr-70bf4b1f0a95849b9be6'],[83,'extr-b15f496967e99f95e850'],[85,'extr-f49c5ea0c37ab9c4b95d'],[90,'extr-38284e882d9bbfc2a475']])
const fixes={
82:'Embora o sequenciamento do DNA seja fundamental, a genômica também ajuda a identificar genes com potencial para melhoria de características agronômicas, conectando a genética com a fenotipagem.',
83:'A análise do transcriptoma fornece dados sobre quais genes são expressos em diferentes condições e que são essenciais para o melhoramento de características adaptativas e produtivas.',
85:'A proteômica tradicional é incapaz de causar impactos no melhoramento genético de plantas, pois ela se limita às análises de quantificação proteica, sem ter relação com as características agronômicas.',
90:'Sistemas biológicos artificiais, como terapias gênicas e modulação celular, oferecem alternativas promissoras no tratamento de doenças complexas, como câncer e distúrbios genéticos.',
105:'Metabólitos são produtos intermediários ou finais do metabolismo em uma amostra não viva, sendo denominado metaboloma o conjunto de alguns metabólitos de elevada massa molecular (até 1500 Da), presentes ou alterados em um sistema biológico.',
108:'Uma das maiores contribuições das técnicas de edição de genomas na área agrícola é a possibilidade de melhoramento de múltiplas características simultaneamente em linhagens elite, agilizando o desenvolvimento de produtos comerciais, o que geralmente é impraticável por meio de técnicas convencionais de melhoramento genético: essa versatilidade é importante para o melhoramento de características determinadas por QTLs (Quantitative Trait Loci), ou seja, aquelas controladas por poucos loci do genoma.',
109:'CRISPR/Cas9 é uma técnica de edição genética que permite alterar, remover ou adicionar sequências de DNA e pode ser utilizada no tratamento de diversas doenças como câncer, hepatite B e HIV.',
110:'Edição genômica, edição gênica ou engenharia genômica são nomes dados às modificações específicas feitas no DNA de organismos vivos, o que se tornou possível após o desenvolvimento da tecnologia do RNA recombinante.'
}
const answers=[
 ...['C','E','C','C','C'],
 ...['C','C','C','E','E'],
 ...['C','E','E','E','C'],
 ...['C','E','C','E','E'],
 ...['C','C','C','C','E'],
 ...['C','E','E','C','E'],
 ...['C','C','E','C','E']
]
if(answers.length!==35)throw Error(`Gabarito com ${answers.length} itens; esperado 35.`)
const keyDigest=createHash('sha256').update(answers.join('')).digest('hex')
const easy=new Set([79,80,83,86,89,91,95,96,101,104,107,109]),hard=new Set([76,81,84,87,88,92,94,98,99,100,102,103,105,106,108,110])
const pendingFlags=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
const decisions=records.map(q=>{
 const n=Number(q.numero),cls=defs[n],page=Number(q.pagina),duplicate=canonical.has(n)&&q.id!==canonical.get(n),command=[...Object.keys(commands).map(Number)].filter(x=>x<=n).at(-1),key=answers[n-76],image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 if(!cls||n<76||n>110||!key)throw Error(`Item ${n} sem classificação ou gabarito.`)
 const stem=fixes[n]||q.enunciado.replace(/\s+/g,' ').trim()
 const out={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:cls[0],conteudo:cls[1],ano:2025,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'23/03/2025',cargo:'Pesquisador — Ciências Biológicas — Biologia Sintética e Ciências Ômicas — Opção 40000345',numero_original:n,numero:n,pagina:page,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na integração conceitual, especificidade técnica e inferência exigida; a banca não publicou índice psicométrico de dificuldade.',classificacao_fonte:prova,motivo:`Classificação individual pelo item e pelo comando no caderno oficial da EMBRAPA, opção 40000345. Prova aplicada em 23/03/2025, conforme gabarito oficial definitivo.`,resposta_correta:key==='C'?0:1,anulada:false,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'Gab_Definitivo_140_041_EMBRAPA_PESQUISADOR_056_01.PDF',prova:'140_041_EMBRAPA_PESQUISADOR_056_01.pdf',sha256:keyDigest,sha256_tipo:'SHA-256 da sequência canônica dos 35 gabaritos definitivos C/E publicados pela banca',numero:n,pagina:1,criterio:'Gabarito oficial definitivo CEBRASPE para a opção 40000345.'},texto_apoio:commands[command],apoio:[{pagina:page,imagem:image,texto:commands[command]}],visual:{pagina:page,imagem:image,texto_apoio:commands[command],motivo:'Página do caderno oficial mantida e associada; texto conferido com a publicação oficial CEBRASPE.'},apta_resolucao:!duplicate,remover_pendencias:pendingFlags,...(duplicate?{inelegibilidade_motivo:'Registro duplicado do mesmo item no mesmo caderno; desativado para impedir repetição.',duplicada_de:canonical.get(n)}:{})}
 if(!out.visual.texto_apoio)throw Error(`Item ${n} sem texto-base.`)
 return out
})
if(decisions.length!==39||decisions.filter(x=>x.apta_resolucao).length!==35)throw Error('Cobertura inesperada: esperado 35 itens únicos e quatro cópias duplicadas.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:39,itensUnicos:35,duplicatas:4,edicao:concurso,aplicacao:'23/03/2025',gabarito:'definitivo oficial',item109_corrigido:true,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,edicao:concurso,documento_id:doc,prova,gabarito,registros_revisados:39,itens_unicos:35,duplicatas_desativadas:4,aplicacao:'23/03/2025',item109_reclassificado:true,publicado:false,observacao:'Trinta e oito registros pendentes revisados e o item 109, já presente mas indevidamente classificado como Medicina/2024, corrigido. Quatro duplicatas desativadas. Os 35 itens únicos 76–110 desta seção do caderno estão presentes; as páginas originais foram preservadas.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — EMBRAPA 2025 — Pesquisador em Biologia Sintética e Ciências Ômicas — revisão v414\n\n- 38 registros pendentes revistos e item 109 existente reclassificado; 35 itens únicos cobertos e quatro duplicatas desativadas.\n- Banca, opção/cargo, ano de aplicação 2025, disciplina/conteúdo, dificuldade estimada, aplicação em 23/03/2025 e tipo certo/errado registrados.\n- Textos-base por bloco e imagens de origem associados; erros de OCR corrigidos, incluindo o item 105 e contaminação no item 110.\n- Gabarito definitivo oficial vinculado aos itens 76–110.\n- Alterações locais; publicação na nuvem pendente.\n`)
console.log(JSON.stringify({...result,edicao:concurso,itens_unicos:35,duplicatas_desativadas:4,item109_reclassificado:true,publicado:false}))
