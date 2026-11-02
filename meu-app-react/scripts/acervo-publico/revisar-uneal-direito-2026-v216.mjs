import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-uneal-direito-2026-v216',doc='02a6e38c5ae6b3ba'
const prova='https://cdn.cebraspe.org.br/concursos/UNE_AL_26/arquivos/B4EFD5069559791E1545D6919181985ED536EB2D43BFB9B978202E063D54EBBA.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/UNE_AL_26/arquivos/34174F80907EC22E0D898B9A599A00E1706832A321DAD657899D6F60F0CBAFF0.pdf'
const concurso='UNEAL 2026 — Analista Administrativo — Área: Direito — Cargo 6'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70||catalog.arquivo!=='B4EFD5069559791E1545D6919181985ED536EB2D43BFB9B978202E063D54EBBA.pdf')throw Error('Caderno UNEAL Cargo 6 divergente do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-slu-jornalismo-2019-v215'))
if(start<0)throw Error('Base anterior v215 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const ids=new Set(catalog.questoes.map(q=>q.id)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(ids.has(q.id)){active.set(q.id,q);ids.delete(q.id)}
 if(!ids.size)break
}
if(active.size!==70||ids.size)throw Error(`Esperados 70 itens UNEAL, encontrados ${active.size}; ausentes ${ids.size}`)

const topics={
51:['Direito Administrativo','Processo administrativo disciplinar: denúncia anônima, motivação e investigação preliminar'],
52:['Direito Administrativo','Agentes públicos: readaptação e vacância de cargo'],
53:['Direito Administrativo','Fontes do direito administrativo: atos normativos administrativos'],
54:['Direito Administrativo','Estágio probatório: exoneração, demissão e garantias procedimentais'],
55:['Direito Administrativo','Ato administrativo: tipicidade e atributos'],
56:['Direito Administrativo','Administração indireta: personalidade jurídica das sociedades de economia mista'],
57:['Direito Administrativo','Poder de polícia: guardas municipais e sanções de trânsito'],
58:['Direito Administrativo','Improbidade administrativa: prescrição e ressarcimento ao erário'],
59:['Direito Administrativo','Responsabilidade civil do Estado: culpa concorrente da vítima'],
60:['Direito Administrativo','Serviços públicos: continuidade e greve de servidores'],
61:['Licitações e Contratos','Lei nº 14.133/2021: critério de julgamento por maior retorno econômico'],
62:['Licitações e Contratos','Sistema de registro de preços: obras e serviços de engenharia'],
63:['Direito Constitucional','Eficácia das normas constitucionais: normas programáticas e controle de constitucionalidade'],
64:['Direito Constitucional','Eficácia das normas constitucionais: normas de eficácia contida'],
65:['Direito Constitucional','Competências do Presidente da República e referendo do Congresso Nacional em tratados'],
66:['Direito Constitucional','Controle externo: sustação de contratos administrativos pelo TCU'],
67:['Direito Constitucional','Repartição de competências legislativas: crimes de responsabilidade'],
68:['Direito Constitucional','Bens da União: recursos minerais e propriedade do solo'],
69:['Direito Constitucional','Comissões parlamentares de inquérito: poderes de investigação e reserva de jurisdição'],
70:['Direito Constitucional','Competência legislativa da União: diretrizes e bases da educação e linguagem neutra'],
71:['Direito Financeiro','Orçamento público: créditos suplementares e autorização legislativa'],
72:['Direito Financeiro','Orçamento público: emendas parlamentares e indicação de recursos'],
73:['Direitos Fundamentais','Acesso à informação pública: direitos, prazos e sigilo estatal'],
74:['Direito Constitucional','Intervenção do Estado na propriedade: requisição administrativa'],
75:['Direito Civil','Desconsideração da personalidade jurídica: cabimento e procedimento'],
76:['Direito Civil','Desconsideração da personalidade jurídica: desvio de finalidade'],
77:['Direito do Consumidor','Desconsideração da personalidade jurídica: teoria menor e obstáculo ao ressarcimento'],
78:['Direito Civil','Desconsideração da personalidade jurídica: teoria maior e confusão patrimonial'],
79:['Direito Civil','Desconsideração inversa da personalidade jurídica'],
80:['Direito Civil','Direitos da personalidade: alteração e imutabilidade do nome civil'],
81:['Direito Civil','Registro civil: nome e identidade de gênero'],
82:['Direito Empresarial','Sociedade irregular: registro posterior e efeitos sobre responsabilidade dos sócios'],
83:['Direito Empresarial','Personalidade jurídica: autonomia patrimonial e alocação de riscos'],
84:['Direito Empresarial','Sociedade em comum: responsabilidade dos sócios e benefício de ordem'],
85:['Direito Civil','Direitos da personalidade: nome indígena e autodeterminação'],
86:['Direito Civil','Natureza jurídica do direito ao nome e direitos da personalidade'],
87:['Direito Processual Civil','Condições da ação: interesse, legitimidade e teoria da asserção'],
88:['Direito Processual Civil','Petição inicial: pedido, causa de pedir e inépcia'],
89:['Direito Processual Civil','Classificação das ações segundo o provimento jurisdicional'],
90:['Direito Processual Civil','Jurisdição: princípio da inércia e iniciativa processual'],
91:['Direito Processual Civil','Normas fundamentais do processo civil: igualdade e paridade de tratamento'],
92:['Direito Processual Civil','Ação de improbidade administrativa e aplicação subsidiária do CPC'],
93:['Direito Processual Civil','Preclusão temporal e prática de atos processuais'],
94:['Direito Processual Civil','Capacidade processual e capacidade postulatória da Fazenda Pública'],
95:['Direito Constitucional','Ação popular: legitimidade ativa e tutela do patrimônio público'],
96:['Direito Processual Civil','Mandado de segurança: direito líquido e certo e prova pré-constituída'],
97:['Direito Processual Civil','Recursos: reforma, invalidação, esclarecimento e integração da decisão'],
98:['Direito do Trabalho','Prescrição trabalhista: pretensão declaratória e anotação da CTPS'],
99:['Direito do Trabalho','Grupo econômico: coexistência de contratos e jornada compartilhada'],
100:['Direito do Trabalho','Banco de horas: acordo individual escrito e prazo de compensação'],
101:['Direito do Trabalho','Tempo à disposição do empregador: situações excluídas da jornada'],
102:['Direito do Trabalho','Rescisão por justa causa: condenação criminal e suspensão condicional da pena'],
103:['Direito do Trabalho','Salário: parcelas remuneratórias e integração de verbas'],
104:['Direito do Trabalho','FGTS: diretor não empregado e equiparação a trabalhador'],
105:['Direito do Trabalho','Adicional noturno: regime de revezamento e hora noturna reduzida'],
106:['Direito do Trabalho','Adicional de insalubridade: integração à remuneração'],
107:['Direito do Trabalho','Suspensão e interrupção do contrato: casamento e falecimento de familiar'],
108:['Direito do Trabalho','Salário complessivo: nulidade da quitação englobada de direitos'],
109:['Direito Educacional','Constituição Federal: atuação prioritária dos sistemas de ensino'],
110:['Direito Educacional','Princípios constitucionais do ensino: pluralismo e liberdade pedagógica'],
111:['Direito Educacional','Direito à educação, dever estatal e colaboração da sociedade'],
112:['Direito Educacional','Autonomia universitária: ensino, pesquisa e extensão'],
113:['Direito Educacional','Salário-educação: repartição de cotas e matrículas na educação básica'],
114:['Direito Educacional','Educação física na educação básica: obrigatoriedade e prática facultativa'],
115:['Direito Educacional','Base Nacional Comum Curricular do ensino médio: componentes curriculares'],
116:['Direito Educacional','Sistema de ensino: delegação de regulação da educação superior'],
117:['Direito Educacional','Organização da educação nacional: educação infantil e ensino fundamental'],
118:['Direito Educacional','Plano Nacional de Educação: monitoramento e competências institucionais'],
119:['Direito Educacional','FIES: agente operador e valores mínimos de financiamento'],
120:['Direito Educacional','SINAES: resultado insatisfatório e protocolo de compromisso'],
}
if(Object.keys(topics).length!==70)throw Error('Classificações não cobrem os 70 itens')

const officialAnswers=[
 "C","C","C","E","E","C","E","C","C","E","E","E","C","E","E","E","E","C","E","C",
 "E","X","C","E","C","C","C","C","E","C","E","E","C","E","E","C","E","C","E","C",
 "C","E","C","C","C","E","C","E","C","C","E","C","E","E","C","C","E","C","C","E",
 "C","E","C","E","C","C","E","E","E","C"
];
if(officialAnswers.length!==70) throw Error("Gabarito oficial fora do padrão esperado");
const answerDigest=hashRevisao(officialAnswers.map((v,i)=>`${i+51}:${v}`).join(','))

const shared={
  82:'Caso-base dos itens 82 a 84: os fundadores de sociedade constituída por instrumento público, com objeto lícito e sócios capazes, retardaram deliberadamente a inscrição dos atos constitutivos por 120 dias e celebraram contratos em nome da sociedade durante esse período. Após o registro, um credor pretende executar diretamente o patrimônio pessoal dos sócios signatários, alegando que não se aplica o benefício de ordem.',
  87:'Contexto dos itens 87 a 91: uma instituição pública é parte em diferentes demandas judiciais relacionadas à contratação de serviços e à gestão de recursos públicos, propostas ou impetradas por cidadãos e órgãos de controle.',
  92:'Contexto dos itens 92 a 97: a mesma instituição pública figura em demandas judiciais ligadas à contratação de serviços e à gestão de recursos públicos. Os itens abordam regras processuais e instrumentos de controle judicial da Administração Pública.',
  98:'Contexto dos itens 98 a 102: analista administrativo de autarquia estadual examina, em processo administrativo, práticas de empresas contratadas e setores internos relacionadas à regularidade de contratos e relações de trabalho.',
  103:'Contexto dos itens 103 e 104: analista administrativo de autarquia avalia a adequação de práticas trabalhistas adotadas por empresas contratadas após a entrada em vigor da reforma trabalhista.',
}
const range=(n,a,b)=>n>=a&&n<=b
const getSupport=n=>range(n,82,84)?shared[82]:range(n,87,91)?shared[87]:range(n,92,97)?shared[92]:range(n,98,102)?shared[98]:range(n,103,108)?shared[103]:''
const sourcePages={1:'',2:'',3:'',4:''}
const pageOf=n=>catalog.questoes.find(q=>q.numero===n)?.pagina
for(const e of catalog.questoes){if(!pageOf(e.numero))throw Error(`Página ausente no item ${e.numero}`);await fs.access(`public/acervo-extraido/paginas/${doc}-${String(pageOf(e.numero)).padStart(4,'0')}.webp`)}

const decisions=catalog.questoes.map(e=>{
 const q=active.get(e.id),n=e.numero,[materia,conteudo]=topics[n],key=officialAnswers[n-51],page=pageOf(n)
 if(!q?.enunciado||!key||!materia||!conteudo)throw Error(`Item ${n}: enunciado, tema ou gabarito ausente`)
 let stem=q.enunciado.replace(/CEBRASPE\s*[–-]\s*UNEAL\s*[–-]\s*Edital:\s*2026/gi,' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
 stem=stem.replace(/figu ras/gi,'figuras').replace(/improbid ade/gi,'improbidade').replace(/TC U/gi,'TCU').replace(/própr ios/gi,'próprios').replace(/comis sões/gi,'comissões').replace(/instituiçõe s/gi,'instituições').replace(/local izados/gi,'localizados').replace(/personalid ade/gi,'personalidade').replace(/imutabili dade/gi,'imutabilidade').replace(/jurídic as/gi,'jurídicas').replace(/analisad as/gi,'analisadas').replace(/contratad a/gi,'contratada').replace(/declar atórias/gi,'declaratórias').replace(/estabilização d/gi,'estabilização d')
 if(stem.length<35||/CEBRASPE|UNEAL|Edital:\s*2026/i.test(stem))throw Error(`Item ${n} com enunciado possivelmente incompleto: ${stem}`)
 const annulled=key==='X',opcoes=q.opcoes?.length===2?q.opcoes:['Certo','Errado']
 if(opcoes[0]!=='Certo'||opcoes[1]!=='Errado')throw Error(`Opções inválidas no item ${n}`)
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,concurso,numero_original:n,pagina:page,
  dificuldade:[53,54,57,58,62,64,66,67,69,70,72,75,76,77,78,79,81,84,87,88,92,94,96,98,100,101,102,104,107,110,112,113,116,118,120].includes(n)?'Difícil':[51,52,55,56,59,60,61,63,65,68,71,73,74,80,82,83,85,86,89,90,91,93,95,97,99,103,105,106,108,109,111,114,115,117,119].includes(n)?'Média':'Fácil',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade normativa, jurisprudencial e interpretativa; a banca não publica dificuldade psicométrica individual.',
  opcoes,enunciado:stem,texto_apoio:getSupport(n)||q.texto_apoio||'',resposta_correta:annulled?null:key==='C'?0:1,anulada:annulled,
  gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'34174F80907EC22E0D898B9A599A00E1706832A321DAD657899D6F60F0CBAFF0.pdf',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da transcrição normalizada dos 70 gabaritos lidos no quadro oficial; não representa hash criptográfico do PDF.',criterio:'Gabarito definitivo CEBRASPE — UNEAL 2026, Cargo 6 — Analista Administrativo, Área: Direito.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do item e do bloco temático da prova oficial; conferência com o conteúdo programático do cargo.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:getSupport(n)||q.texto_apoio||'',motivo:`Página ${page} do caderno oficial vinculada ao item ${n}; questão textual, sem figura ou gráfico.`},
  motivo:`Revisão v216 do item ${n}: matéria e tópico específicos, contexto compartilhado quando aplicável, ano/cargo, dificuldade estimada e gabarito definitivo.`}
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_revisados:70,gabarito_definitivo:{anulado:72},contexts:5},null,2))
