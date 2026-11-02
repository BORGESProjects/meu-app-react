import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-inpi-biologia-2023-v237',doc='5ae3a9cad363e35d'
const prova='https://cdn.cebraspe.org.br/concursos/INPI_23/arquivos/930_INPI_013_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/inpi_23/arquivos/ED_1_INPI_2023_ABERTURA_ATUALIZADO_RET_5.PDF'
const concurso='INPI 2023 — Cargo 13: Pesquisador em Propriedade Industrial, Área P2 — Bioquímica, Imunologia, Biologia Celular e Molecular, Biotecnologia e Microbiologia'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='930_INPI_013_01.PDF'||catalog.questoes.length!==66)throw Error('Inventário incompatível: esperados 66 registros no catálogo OCR')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-formulas-fub-complemento-v236'))
if(prev<0)throw Error('Base anterior v236 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const entries=catalog.questoes
const ids=new Set(entries.map(x=>x.id)),byId=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo&&x.ano===2023&&/inpi/i.test(x.concurso||''))){
 const chunk=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of chunk)if(ids.has(q.id)){byId.set(q.id,q);ids.delete(q.id)}
 if(!ids.size)break
}
if(ids.size)throw Error(`Questões INPI ausentes do acervo: ${[...ids].join(', ')}`)

const temas={
51:'Bioquímica: classes de biomoléculas e natureza química dos anticorpos',
52:'Imunologia: estrutura quaternária dos anticorpos e pontes dissulfeto',
53:'Imunologia: sítio de ligação ao antígeno e reconhecimento específico',
54:'Imunologia: purificação de anticorpos por cromatografia de afinidade',
55:'Bioquímica: beta-oxidação de ácidos graxos em hipoglicemia',
56:'Metabolismo energético: glicólise, frutose-6-fosfato e frutose-1,6-bisfosfato',
57:'Metabolismo de carboidratos: vias anabólicas de polissacarídeos',
58:'Metabolismo de aminoácidos: catabolismo de aminoácidos cetogênicos',
59:'Bioenergética: fosforilação oxidativa em músculo esquelético',
60:'Metabolismo lipídico: insulina e síntese de ácidos graxos',
61:'Metabolismo de carboidratos: glicogenólise e manutenção da glicemia',
62:'Metabolismo de lipídios: transporte de ácidos graxos por lipoproteínas',
63:'Metabolismo de nucleotídeos: PRPP e síntese de purinas e pirimidinas',
64:'Metabolismo de lipídios: síntese e função dos sais biliares',
65:'Beta-oxidação: acetil-CoA e metabolismo de aminoácidos aromáticos',
66:'Biologia molecular: composição de bases nitrogenadas no DNA de fita dupla',
67:'Biologia molecular: ligações de hidrogênio e ligações covalentes nas fitas de DNA',
68:'Biologia molecular: expressão gênica e mRNA policistrônico',
69:'Replicação do DNA: incorporação de nucleotídeos trifosfatados',
70:'Replicação do DNA: conservação semiconservativa das fitas',
71:'Imunologia: resposta imune inata e reconhecimento de antígenos',
72:'Imunologia: maturação e diferenciação de linfócitos B e T',
73:'Imunologia: co-reconhecimento de antígeno, MHC I e linfócitos T CD8+',
74:'Imunologia: classes de imunoglobulinas e afinidade de ligação',
75:'Imunologia: granulócitos, fagocitose e inflamação aguda',
76:'Imunologia: anticorpos e ativação de fagócitos por opsonização',
77:'Imunologia: neutropenia congênita e maturação de neutrófilos',
78:'Imunologia: IgA, IgE e defesa das mucosas',
79:'Virologia: genoma de retrovírus e vírus de RNA',
80:'Imunodiagnóstico: imunoeletroforese e precipitação antígeno-anticorpo',
81:'Diagnóstico laboratorial: sensibilidade e especificidade de testes',
82:'Vacinas: antígenos recombinantes e polissacarídeos conjugados',
83:'Imunodiagnóstico: ensaio de fixação do complemento',
84:'Imunologia: processamento de antígenos e apresentação por linfócitos B',
85:'Imunologia: avidez e afinidade de anticorpos',
86:'Imunização passiva: transferência placentária de IgG e leite materno',
87:'Imunologia: maturação de linfócitos B e expressão de imunoglobulinas',
88:'Imunologia: MHC classe II e apresentação de antígenos exógenos',
89:'Imunologia: adjuvantes e potencialização da resposta imune',
90:'Imunologia: órgãos linfoides primários e secundários',
91:'Biologia celular: organização tridimensional da cromatina interfásica',
92:'Biologia celular: síntese de ácidos nucleicos e função do núcleo',
93:'Citogenética molecular: hibridização fluorescente in situ (FISH)',
94:'Biologia celular: apoptose e alterações morfológicas celulares',
95:'Biologia celular: complexo de Golgi e modificações pós-traducionais',
96:'Biologia celular: Golgi, secreção celular e diferenciação funcional',
97:'Biologia celular: fragmentação do Golgi e síntese proteica',
98:'Ciclo celular: quinases dependentes de ciclina (CDKs) e fosforilação',
99:'Biologia molecular: inibidores de CDK e regulação da transcrição',
100:'Ciclo celular: CDKs, fase S e replicação do DNA',
101:'Biologia molecular: cromossomos, cromatina e organização do DNA',
102:'Genética: locus e posição de genes em cromossomos',
103:'Biologia molecular: leitura de códons e tradução sem sobreposição',
104:'Biologia molecular: diferenças entre replicação e transcrição',
105:'Bioquímica: desnaturação de proteínas e estabilidade térmica de ácidos nucleicos',
106:'Biotecnologia: enzimas de restrição e clivagem de DNA',
107:'Biotecnologia: DNA ligase e clonagem gênica',
108:'Biotecnologia: bibliotecas genômicas e vetores plasmidiais',
109:'Sequenciamento de DNA: tecnologia Illumina e terminadores reversíveis',
110:'Biologia molecular: hibridização de DNA e formação de híbridos',
111:'PCR: amplificação exponencial e número de ciclos',
112:'Genética: polimorfismo de nucleotídeo único e aptidão',
113:'Biotecnologia: cromossomos artificiais bacterianos (BACs)',
114:'Genética molecular: reparo por excisão de bases e de nucleotídeos',
115:'Genética molecular: heterocromatina e silenciamento gênico',
116:'PCR: DNA polimerase termoestável e amplificação de DNA',
117:'PCR multiplex: primers, especificidade e amplificação de múltiplos alvos',
118:'PCR em tempo real: termociclador, fluoróforo e detecção de fluorescência',
119:'PCR em tempo real: corantes intercalantes SYBR Green e especificidade',
120:'Enzimas de restrição: atividades de polimerase e exonuclease'
}
const blocos=[
 [51,'Tendo como referência a figura da página 1, que representa a estrutura de anticorpos com ligações dissulfeto entre cadeias leves e pesadas, julgue os itens.'],
 [55,'Considere o metabolismo em hepatócitos humanos durante hipoglicemia. Julgue os itens relativos às vias metabólicas e ao uso de substratos.'],
 [59,'Considere células musculares estriadas humanas em hipoglicemia durante esforço leve abaixo do limiar aeróbico. Julgue os itens.'],
 [62,'Considere o metabolismo de lipídios e nucleotídeos em hepatócitos humanos e as funções variadas desses grupos de biomoléculas. Julgue os itens.'],
 [66,'No que se refere à estrutura, às funções e às reações de ácidos nucleicos, julgue os itens.'],
 [71,'Julgue os itens a seguir acerca do sistema imunológico, suas características e composição.'],
 [76,'A respeito do funcionamento do sistema imunológico, julgue os itens seguintes.'],
 [79,'Julgue os itens relativos às metodologias de diagnóstico biológico e à utilização de vacinas.'],
 [84,'Julgue os itens subsequentes, relacionados à imunologia humana.'],
 [88,'Com base na imunologia, ciência que estuda o sistema imunológico e suas funções, julgue os itens.'],
 [91,'Considere a organização tridimensional dos cromossomos no núcleo interfásico e a regulação gênica pela topologia da cromatina. Julgue os itens.'],
 [94,'Considere a integridade estrutural e funcional do aparelho de Golgi e as consequências de sua fragmentação. Julgue os itens.'],
 [98,'Considere o papel das quinases dependentes de ciclina (CDKs) no controle do ciclo celular. Julgue os itens.'],
 [101,'Considerando a codificação da informação genética e os níveis de organização dos ácidos nucleicos, julgue os itens.'],
 [106,'Considere princípios e métodos de biologia molecular utilizados em manipulações genéticas e biotecnologia. Julgue os itens.'],
 [112,'Considere a conservação do material genético e as variações entre células de um indivíduo e entre indivíduos da mesma espécie. Julgue os itens.'],
 [116,'Considere métodos moleculares para diagnóstico de doenças infecciosas, como a reação em cadeia da polimerase (PCR), que permite detectar agentes com alta sensibilidade e especificidade. Julgue os itens.']
]
function contexto(n){return blocos.filter(([inicio])=>inicio<=n).at(-1)[1]}
const facil=new Set([51,53,55,57,59,60,61,62,64,66,67,68,70,71,72,74,75,78,79,81,82,83,84,86,87,90,92,93,95,96,98,100,102,103,104,106,107,108,110,111,112,113,115,116,117,118,119,120])
const dificil=new Set([52,54,58,63,65,69,73,77,80,85,88,89,91,94,97,99,105,109,114])
const decisoes=[]
for(const e of entries){const q=byId.get(e.id),n=e.numero,conteudo=temas[n],pagina=e.pagina||3
 if(!q||!conteudo)throw Error(`Questão ${n} sem registro ou classificação`)
 const img=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${img}`)
 const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Biologia',conteudo,ano:2023,concurso,
  numero_original:n,pagina,dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela quantidade de etapas moleculares/celulares e integração de conceitos; não representa índice psicométrico oficial.',
  classificacao_fonte:{documento:catalog.arquivo,prova,edital,metodo:'Classificação item a item pelo enunciado, imagem ou texto-base e conteúdo programático do Cargo 13, Área P2.'},
  visual:{pagina,imagem:img,motivo:`Página ${pagina} do caderno oficial conferida; diagrama, texto-base, figura ou contexto necessário permanece associado à questão.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
  motivo:`Classificação específica por conteúdo de Bioquímica, Imunologia, Biologia Celular/Molecular, Biotecnologia ou Microbiologia; gabarito preexistente preservado.`}
 d.texto_apoio=contexto(n)
 if(n===115)d.enunciado='O forte empacotamento do DNA em heterocromatina normalmente provoca o silenciamento dos genes nas regiões em que ocorre.'
 if(n===116)d.enunciado='A técnica de PCR utiliza uma DNA polimerase termoestável, sendo capaz de catalisar reações a temperaturas acima de 70 °C na maioria dos casos.'
 decisoes.push(d)
}
if(decisoes.length!==66)throw Error(`Esperados 66 registros do catálogo, obtidos ${decisoes.length}`)
const textos={
117:'A PCR multiplex demanda o uso de uma Taq polimerase específica para cada alvo a ser amplificado.',
118:'A PCR em tempo real utiliza um termociclador que também é capaz de realizar a excitação do fluoróforo e a detecção de fluorescência.',
119:'Uma das vantagens da realização de PCR em tempo real com marcadores como o SYBR Green é o fato de o marcador ser específico para as sequências-alvo.',
120:'Existem enzimas que apresentam as atividades de polimerase e de exonuclease na mesma estrutura quaternária.'}
const imagem='paginas/5ae3a9cad363e35d-0003.webp',ctx=contexto(116),adicoes=[]
const imagemHash=createHash('sha256').update(await fs.readFile(`public/acervo-extraido/${imagem}`)).digest('hex')
for(const n of [117,118,119,120]){const enunciado=textos[n],id=`extr-${createHash('sha256').update(`${doc}:${n}:${enunciado}`).digest('hex').slice(0,20)}`,conteudo=temas[n]
 const q={id,ano:2023,numero_original:n,banca:'CEBRASPE',concurso,materia:'Biologia',conteudo,enunciado,opcoes:['Certo','Errado'],resposta_correta:null,anulada:false,pagina:3,documento_id:doc,paginas_origem:[3],imagens_paginas:[imagem],pagina_imagem:imagem,texto_apoio:ctx,transcricoes_ocr:[],fonte:prova,origem:'CEBRASPE — INPI 2023',documento_origem:catalog.arquivo,tipo_documento:'PROVA OBJETIVA — CONHECIMENTOS ESPECÍFICOS — CARGO 13',tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',contexto_paginas:[{pagina:3,imagem}],status_revisao:'revisada_individualmente',motivos_revisao:['gabarito_oficial_nao_vinculado'],classificacao_confianca:0.95,classificacao_metodo:'Conferência individual na página oficial e classificação pelo conteúdo programático do Cargo 13, Área P2.',classificacao_revisada:true,classificacao_pendente:false,classificacao_evidencia:`Questão ${n}: ${conteudo}`,classificacao_fonte:{documento:catalog.arquivo,prova,edital,metodo:'Transcrição visual da página oficial e classificação conforme o conteúdo do Cargo 13, Área P2.'},dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela integração de conceitos de PCR; não representa índice psicométrico oficial.',revisao_semantica_visual:{imagem:imagem,pagina:3,sha256:imagemHash,motivo:'Texto e contexto conferidos visualmente na página oficial.',metodo:'Conferência visual individual da página original'},banca_original:'Cebraspe',organizadora:'CEBRASPE',aplicacao:concurso,elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:['gabarito_oficial_nao_vinculado']},integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:['gabarito_oficial_nao_vinculado']}}
 adicoes.push(q)
}
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes,adicoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,itens_revisados:66,itens_ausentes_do_acervo_adicionados:4,paginas_conferidas:[1,2,3],publicado:false},null,2))
