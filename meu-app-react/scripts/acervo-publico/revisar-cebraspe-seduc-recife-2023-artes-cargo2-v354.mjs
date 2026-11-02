import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const doc='5000220021cca25c'
const prova='https://cdn.cebraspe.org.br/concursos/seduc_recife_23_professor/arquivos/829_SEDUC_RECIFE_23_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_recife_23_professor/arquivos/GAB_DEFINITIVO_829_SEDUC_RECIFE_23_002_01.PDF'
const concurso='SEDUC/Recife 2023 — Professor II — Artes'
const records=JSON.parse(await fs.readFile('tmp/pendentes-documento-'+doc+'.json','utf8'))
const key={55:'C',56:'E',57:'E',58:'C',59:'C',60:'E',61:'X',62:'C',63:'E',64:'E',65:'E',66:'C',67:'C',68:'C',69:'E',70:'C',71:'C',72:'C',73:'E',74:'C',75:'C',76:'E',77:'C',78:'C',79:'E',80:'E',81:'C',82:'C',83:'C',84:'X',85:'E',86:'C',87:'E',88:'E',89:'E',90:'C',91:'C',92:'C',93:'C',94:'E',95:'E',96:'E',97:'C',98:'C',99:'C',100:'C',101:'E',102:'C',103:'E',104:'E',105:'C',106:'C',107:'C',108:'C',109:'C',110:'E',111:'E',112:'C',113:'E',114:'C',115:'C',116:'C',117:'C',118:'C',119:'E',120:'C'}
const gabaritoHash='5b7e05322ac3ec0c050c8bf340ccca27f065df1b5dcdf596baf24c196360b2bf'
const assuntos={
55:'Arte-educação: conhecimento, técnica e expressão no ensino básico',
56:'Tendências pedagógicas do ensino de Arte no Currículo de Pernambuco',
57:'Abordagem Triangular: arte e tecnologias digitais',
58:'Abordagem Triangular: leitura de imagens, contextualização e fazer artístico',
59:'Arte, cidadania e acesso a bens culturais: Paço do Frevo',
60:'Patrimônio cultural imaterial: memória do frevo e cidadania',
61:'Instituições culturais: ações de formação de público',
62:'Paço do Frevo: preservação e difusão da cultura local',
63:'Quinteto Armorial: diálogo entre música erudita e popular',
64:'Quinteto Armorial: instrumentos tradicionais e cultura nordestina',
65:'Quinteto Armorial: influências musicais',
66:'BNCC: protagonismo, criatividade e experiência artística',
67:'BNCC: produção artística e instituições culturais',
68:'BNCC: acesso à arte e experiências mediadas pela mídia',
69:'BNCC: códigos e técnicas na aprendizagem de Arte',
70:'BNCC: dimensões do conhecimento em Arte',
71:'BNCC: integração das linguagens artísticas',
72:'Ensino de Arte: aprendizagem pluridimensional e experiencial',
73:'Conhecimento em Arte: materialidade e experiência',
74:'Multiculturalismo: cultura, costumes e tradições',
75:'Multiculturalismo: diversidade cultural',
76:'Multiculturalismo: conflitos sociais e diferenças culturais',
77:'Culturas indígenas: produção e modos de vida',
78:'Multiculturalismo: origem histórica do movimento',
79:'Cultura afro-brasileira: incorporação e resistência',
80:'Arte pré-histórica brasileira: sítios arqueológicos e pinturas rupestres',
81:'Arte indígena: arqueologia e culturas originárias',
82:'Arte pré-histórica brasileira: cerâmica marajoara',
83:'Arte indígena: produção artística, ritos e celebrações',
84:'Arte afro-brasileira: primeiros artistas negros no Brasil',
85:'Arte africana e arte pré-histórica brasileira: técnicas e períodos',
86:'Barroco no Brasil: influência portuguesa',
87:'Barroco brasileiro: características estéticas',
88:'Modernismo brasileiro: movimentos artísticos e literatura',
89:'Arte contemporânea brasileira: crítica social',
90:'Modernismo brasileiro: artistas e Semana de Arte Moderna',
91:'Arte e tecnologia: produção artística com recursos computacionais',
92:'Audiovisual: fotografia, cinema e tecnologia',
93:'Arte audiovisual contemporânea: técnicas e tecnologias digitais',
94:'Arte audiovisual: globalização e produção cultural',
95:'Arte audiovisual: diálogo com manifestações preexistentes',
96:'Arte audiovisual contemporânea: mídias e linguagens',
97:'Teatro brasileiro: romantismo e tradição clássica',
98:'Teatro brasileiro: nacionalismo e Martins Pena',
99:'Teatro Experimental do Negro: Abdias do Nascimento',
100:'Teatro político brasileiro: Arena conta Tiradentes',
101:'Teatro de Arena: democratização do acesso e produção',
102:'Música popular nordestina: matrizes africanas, indígenas e europeias',
103:'Repente: métrica, sextilha e rima',
104:'Embolada: estrutura poética e acompanhamento musical',
105:'Repente e embolada: improvisação',
106:'Frevo: reconhecimento como patrimônio cultural imaterial',
107:'Frevo: estilos e características rítmicas',
108:'Frevo: passos, dança e contexto histórico-social',
109:'Boi-bumbá: variações regionais e personagens',
110:'Maracatu: matrizes culturais e história',
111:'Maracatu rural e maracatu-nação: diferenças',
112:'Movimento Armorial: Ariano Suassuna e integração das linguagens artísticas',
113:'Literatura de cordel e Movimento Armorial',
114:'Quinteto Armorial: tradição popular e música erudita',
115:'Movimento Armorial: Projeto Pernambuco-Brasil e grupos artísticos',
116:'Antônio Nóbrega: Quinteto Armorial e tradições populares',
117:'Mestre Salustiano e preservação da cultura popular',
118:'Manguebeat: cultura regional e cultura pop',
119:'Manguebeat: influências artísticas e culturais',
120:'Manguebeat: crítica urbana e temas sociais'
}
const materia=n=>n>=55&&n<=58||n>=66&&n<=73?'Arte-Educação':
 n>=59&&n<=62?'Cultura Brasileira':
 n>=63&&n<=65?'Música Brasileira':
 n>=74&&n<=79?'Cultura e Diversidade':
 n>=80&&n<=91?'Artes Visuais e História da Arte':
 n>=92&&n<=96?'Arte Audiovisual':
 n>=97&&n<=101?'Teatro':
 n>=102&&n<=107?'Música Brasileira':
 n>=108&&n<=111?'Dança e Cultura Popular':
 n>=112&&n<=120?'Música e Cultura Nordestina':null
const contextMap=[
[55,56,'Com base nas tendências do ensino da Arte mencionadas no Currículo de Pernambuco — Ensino Fundamental, julgue os itens.'],
[57,58,'A abordagem triangular articula leitura, contextualização e fazer artístico.'],
[59,62,'Texto-base: O Paço do Frevo é um centro de referência dedicado à difusão, pesquisa, lazer e formação em dança e música do frevo, em Recife (PE). Suas ações ultrapassam o espaço físico, alcançam comunidades e bairros e buscam atrair novos públicos e ampliar o interesse pela arte e pela cultura, especialmente entre grupos socialmente desfavorecidos. Fonte indicada no caderno: UOL (com adaptações). Considerando essas informações e a importância da arte na construção da cidadania, julgue os itens.'],
[63,65,'No que se refere ao Quinteto Armorial, julgue os itens.'],
[66,69,'De acordo com as competências e habilidades de Arte para o Ensino Fundamental previstas na Base Nacional Comum Curricular (BNCC), julgue os itens.'],
[70,73,'Sobre as dimensões do conhecimento que integram o processo de ensino e aprendizagem em Arte, segundo a BNCC do Ensino Fundamental, julgue os itens.'],
[74,79,'No que se refere ao multiculturalismo, julgue os itens.'],
[80,85,'A respeito da arte pré-histórica no Brasil, da produção artística indígena e da arte africana, julgue os itens.'],
[86,91,'Julgue os itens relativos à produção artística no Brasil.'],
[92,96,'Em relação à produção audiovisual, julgue os itens.'],
[97,101,'No que se refere ao teatro no Brasil, julgue os itens.'],
[102,107,'A respeito da música nas tradições populares brasileiras, julgue os itens.'],
[108,111,'No que se refere à dança nas tradições populares no Brasil, julgue os itens.'],
[112,115,'A respeito do Movimento Armorial no Brasil, julgue os itens.'],
[116,120,'Em relação à música na região Nordeste no século XX e a outras tradições populares, julgue os itens.']
]
const contexto=n=>contextMap.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const stems={
56:'Os conhecimentos específicos da Arte passaram a integrar as tendências pedagógicas na concepção modernista do ensino da Arte.',
58:'Constituem o tripé da Abordagem Triangular: leitura de imagens, contextualização e fazer artístico.',
61:'As ações internas desse centro destinam-se a atrair novos públicos para o fomento da arte e da cultura.',
65:'O cancioneiro medieval é elemento predominante da expressão musical do Quinteto Armorial.',
67:'A aprendizagem em Arte não está restrita a produções legitimadas pelas instituições culturais.',
79:'A cultura negra não foi incorporada à cultura brasileira, o que se deve à resistência dos povos dominantes de origem europeia instalados no Brasil.',
97:'Considerado o texto teatral que inaugurou o teatro romântico brasileiro, Antônio José ou O Poeta da Inquisição, de Gonçalves de Magalhães, apresenta traços conservadores do teatro clássico.',
101:'Criado durante o período da ditadura militar no Brasil, o Teatro de Arena tinha como objetivo conectar os habitantes das periferias ao teatro por meio da apresentação das peças em espaços alternativos — distantes dos centros urbanos e fora de edifícios teatrais burgueses — e da eliminação dos grandes cenários e grandes figurinos, para baratear os custos e, consequentemente, os ingressos.'
}
const duplicates={'extr-0e8948d50ec79bb0bf16':'extr-00bc6a9ff8b851193798','extr-efc7082ea76a318e2bdc':'extr-613feea6e9396feff831'}
const remove=['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','materia_nao_identificada','conteudo_nao_identificado','classificacao_generica']
if(records.length!==68)throw Error('Esperados 68 registros; encontrados '+records.length)
const decisions=[]
for(const q of records){
 const n=Number(q.numero),ans=key[n],mat=materia(n),content=assuntos[n],dup=duplicates[q.id]
 if(!ans||!mat||!content)throw Error('Sem chave ou classe: '+n+'/'+q.id)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:content,ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — 11/06/2023 — conhecimentos específicos — Cargo 2',cargo:'Professor II — Artes',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:(n===57||n===64||n===85||n===89||n===100||n===103||n===110||n===113||n===115)?'Difícil':(n===55||n===60||n===66||n===68||n===77||n===82||n===86||n===92||n===106||n===109||n===117)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo nível de interpretação, repertório histórico-cultural e integração de conceitos; a banca não publica nível de dificuldade por item.',classificacao_fonte:prova,motivo:'Conferência das páginas do caderno oficial e cotejo item a item com o gabarito definitivo do Cargo 2 — Artes; classificação por conteúdo efetivamente cobrado.',enunciado:stems[n]||q.enunciado.trim(),texto_apoio:contexto(n),apta_resolucao:!dup,remover_pendencias:remove}
 if(dup){d.inelegibilidade_motivo='Duplicata OCR do item '+n+'; transcrição canônica preservada. Cópia desativada para evitar dupla contagem em tentativas e estatísticas.';d.duplicada_de=dup}
 else{d.resposta_correta=ans==='C'?0:ans==='E'?1:null;d.anulada=ans==='X';d.gabarito_oficial={fonte:gabarito,arquivo:'GAB_DEFINITIVO_829_SEDUC_RECIFE_23_002_01.PDF',prova:'829_SEDUC_RECIFE_23_002_01.PDF',sha256:gabaritoHash,numero:n,pagina:1,resposta:ans,criterio:ans==='X'?'Item anulado conforme gabarito oficial definitivo do Cargo 2 — Artes.':'Gabarito oficial definitivo CEBRASPE, correspondente ao código completo do caderno 829_SEDUC_RECIFE_23_002_01.'}}
 decisions.push(d)
}
const preview={documento:doc,registros:records.length,questoesUnicas:decisions.filter(x=>x.apta_resolucao).length,duplicatasDesativadas:decisions.filter(x=>x.duplicada_de).length,anuladas:decisions.filter(x=>x.anulada).length,gabaritosDefinitivos:decisions.filter(x=>x.gabarito_oficial).length,disciplinas:[...new Set(decisions.filter(x=>x.apta_resolucao).map(x=>x.materia))],publicado:false}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(preview,null,2));process.exit(0)}
const nome='revisao-cebraspe-seduc-recife-2023-artes-cargo2-v354'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/'+nome+'/acervo-extraido')
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',"\nraizesAtuais.unshift('tmp/revisao-profissional/"+nome+"/acervo-extraido')\n")
const report={...result,...preview,edicao:concurso,figurasNecessarias:0,publicado:false,prova,gabarito,nota:'Os 68 registros pendentes foram cotejados com as páginas 1–3 do caderno oficial. Dois registros duplicados foram desativados. Texto-base do Paço do Frevo e comandos por grupo foram separados dos enunciados. Não há imagens ou gráficos indispensáveis à resolução; as páginas de origem permanecem vinculadas para auditoria. Itens anulados permanecem no estudo, sem pontuação automática.'}
await fs.writeFile('docs/acervo/revisao-profissional/'+nome+'.json',JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',"\n\n## CEBRASPE/SEDUC Recife 2023 — Professor II, Artes — revisão v354\n\n- Revisei "+records.length+" registros pendentes das páginas 1–3; corrigi matérias e conteúdos, removi blocos de OCR contaminados e associei os comandos aos itens corretos.\n- Restaurei o texto-base do Paço do Frevo para os itens 59–62, com indicação da fonte do próprio caderno, e separei a Abordagem Triangular e os demais enunciados agrupados.\n- Desativei duas duplicatas de OCR (itens 58 e 61), mantendo as versões canônicas. Conferi os 66 gabaritos no documento definitivo oficial; os itens 61 e 84 foram anulados e não recebem pontuação automática.\n- Validação local: "+result.total+" questões, "+result.disponiveis+" elegíveis e "+result.pendentes+" pendências. Não publicado na nuvem.\n- Fontes: [caderno oficial]("+prova+") e [gabarito definitivo oficial]("+gabarito+").\n")
console.log(JSON.stringify(report,null,2))

