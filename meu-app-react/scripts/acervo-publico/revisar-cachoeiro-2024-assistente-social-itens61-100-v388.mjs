import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cachoeiro-2024-assistente-social-itens61-100-v388',doc='3825886e5c3c8d6d'
const prova='https://cdn.cebraspe.org.br/concursos/pref_cachoeiro_24_adm/arquivos/937_PCI_ADMINISTRATIVO_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/pref_cachoeiro_24_adm/arquivos/GAB_DEFINITIVO_937_PCI_ADMINISTRATIVO_003_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const keyRows=[
 [61,'C C E C E E C E E C E C C E C C E C X C'],
 [81,'C E C C C C C E E C C X E E C E C E E C']
]
const answers=new Map()
for(const [start,row] of keyRows){const values=row.split(/\s+/);if(values.length!==20)throw Error(`Linha inválida do gabarito definitivo, item ${start}`);values.forEach((v,i)=>answers.set(start+i,v))}
const topics={
61:['Serviço Social','Fundamentos históricos e teórico-metodológicos: reprodução das relações sociais'],
62:['Serviço Social','Trabalho profissional: precarização das condições de trabalho e qualidade dos serviços'],
63:['Serviço Social','Serviço social no contexto internacional: particularidades históricas e nacionais'],
64:['Serviço Social','Fundamentos teóricos: matrizes de conhecimento e correntes do pensamento social'],
65:['Serviço Social','Movimento de reconceituação e gênese do serviço social crítico'],
66:['Serviço Social','Ética profissional: assessoria e posicionamento ético-político'],
67:['Serviço Social','Projeto ético-político: enfrentamento ao capitalismo, racismo, patriarcado, capacitismo e LGBTfobia'],
68:['Serviço Social','Ética profissional: denúncia de discriminação perante o CRESS'],
69:['Serviço Social','Perícia social: elaboração e linguagem de laudos e pareceres'],
70:['Serviço Social','Perícia social: requisitos do laudo conforme o Código de Processo Civil'],
71:['Serviço Social','Exercício profissional: articulação das dimensões teórico-metodológica, ético-política e técnico-operativa'],
72:['Serviço Social','Exercício profissional: totalidade e interdependência das dimensões profissionais'],
73:['Serviço Social','Controle social: conselhos e participação da sociedade civil nas políticas sociais'],
74:['Serviço Social','Instrumentos técnico-operativos: entrevista e relação profissional-usuário'],
75:['Serviço Social','Instrumentos técnico-operativos: visita domiciliar no Poder Judiciário'],
76:['Serviço Social','Instrumentos técnico-operativos: entrevista como processo interativo'],
77:['Direito Previdenciário','Seguridade Social: composição constitucional do sistema de proteção social'],
78:['Direito Previdenciário','Seguridade Social: conceito e direitos relativos à saúde, previdência e assistência'],
79:['Serviço Social','Lei Orgânica da Assistência Social: descentralização e comando da política'],
80:['Serviço Social','Política Nacional de Assistência Social: proteção social, garantia de vida e prevenção de riscos'],
81:['Serviço Social','Sistema Único de Assistência Social: descentralização e participação social'],
82:['Direito da Criança e do Adolescente','Estatuto da Criança e do Adolescente: definição etária de criança e adolescente'],
83:['Direito da Criança e do Adolescente','Estatuto da Criança e do Adolescente: prevenção da gravidez na adolescência'],
84:['Direitos Humanos','Igualdade racial: reparação histórica e enfrentamento da discriminação étnico-racial'],
85:['Direitos Humanos','Estatuto da Pessoa Idosa: dever de proteção à dignidade'],
86:['Direitos Humanos','Estatuto da Pessoa Idosa: acompanhante hospitalar e autonomia no tratamento de saúde'],
87:['Direitos Humanos','Lei Maria da Penha: violência patrimonial e retenção ou destruição de documentos'],
88:['Direito Previdenciário','Benefício de Prestação Continuada: natureza assistencial e intransmissibilidade'],
89:['Direito Previdenciário','Benefício de Prestação Continuada: composição da renda familiar per capita'],
90:['Direitos Humanos','Direitos sexuais e reprodutivos: métodos contraceptivos e violência doméstica'],
91:['Serviço Social','Código de Ética do Assistente Social: sanções e representação nos conselhos profissionais'],
92:['Serviço Social','Código de Ética do Assistente Social: penalidades e exercício profissional'],
93:['Serviço Social','Ética profissional e sigilo: depoimento sobre informação confidencial'],
94:['Serviço Social','Ética profissional: autoria, orientação e propriedade intelectual'],
95:['Direito Constitucional','Seguridade Social: participação da comunidade e organização dos serviços de saúde'],
96:['Direito Constitucional','Seguridade Social: universalidade da cobertura e do atendimento'],
97:['Saúde Pública','Sistema Único de Saúde: saneamento básico e proteção ambiental'],
98:['Direito Educacional','LDB: prestação alternativa por motivo de escusa de consciência religiosa'],
99:['Direito Processual Civil','Mediação: escolha de mediadores judiciais e extrajudiciais'],
100:['Direito Educacional','LDB: ausência escolar por motivo de crença religiosa']
}
const cleanStems={
61:'O serviço social pode ser entendido no movimento histórico da sociedade, no complexo processo de (re)produção das relações sociais capitalistas; nesse contexto, ele é entendido como uma reprodução da totalidade da vida em sociedade, na sua processualidade.',
85:'Zelar pela dignidade da pessoa idosa é dever de todos.',
94:'É permitido ao assistente social publicar em seu nome trabalho de outro profissional, quando tal trabalho tiver sido feito sob sua orientação.',
97:'Compete ao SUS participar da execução de ações de saneamento básico e colaborar com a proteção do meio ambiente.'
}
const scenario='Situação comum aos itens 86 a 90: Maria, 62 anos, é casada com João, 66 anos. Moram com eles Antônio, filho de João e Maria, Ana, esposa de Antônio, e Júlio, filho de Antônio e Ana. Nesses itens, BPC significa benefício de prestação continuada.'
const mismatches=records.filter(q=>q.resposta!=null&&answers.get(Number(q.numero))!=='X'&&q.resposta!==(answers.get(Number(q.numero))==='C'?0:1))
if(mismatches.length)throw Error(`Respostas existentes divergem do gabarito definitivo: ${mismatches.map(q=>`${q.numero}=${q.resposta}/${answers.get(Number(q.numero))}`).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),t=topics[n],answer=answers.get(n)
 if(!t||!answer)throw Error(`Item sem classificação ou gabarito no item ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
 const anulada=answer==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2024,concurso:'Prefeitura de Cachoeiro de Itapemirim 2024 — Assistente Social — Cargo 3',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 07/04/2024',cargo:'Assistente Social — Cargo 3',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[61,64,65,68,70,77,78,82,83,86,89,91,92,93,94,95,96,98,99].includes(n)?'Difícil':[62,63,67,73,76,80,81,84,85,87,88,90,97,100].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade normativa, teórica ou técnico-operativa; não é classificação individual publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 3 — Assistente Social; assunto e conteúdo identificados pelo enunciado e pelo comando temático da prova.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_937_PCI_ADMINISTRATIVO_003_01.PDF',prova:'937_PCI_ADMINISTRATIVO_003_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo que identifica o mesmo caderno 937_PCI_ADMINISTRATIVO_003_01, Cargo 3.'},...(cleanStems[n]?{enunciado:cleanStems[n]}:{}),...([86,87,88,89,90].includes(n)?{texto_apoio:scenario}:{})}
})
if(decisions.length!==40)throw Error(`Esperados 40 registros pendentes; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero),itensComContexto:decisions.filter(d=>d.texto_apoio).map(d=>d.numero),enunciadosCorrigidos:Object.keys(cleanStems),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — Prefeitura de Cachoeiro de Itapemirim 2024 — Assistente Social — Cargo 3',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,contextualizada:Boolean(d.texto_apoio),enunciado_corrigido:Boolean(d.enunciado)})),prova,gabarito,publicado:false,nota:'40 itens pendentes classificados individualmente. Os itens 79 e 92 estão anulados conforme o gabarito definitivo. O item 61 foi restaurado integralmente; os itens 85, 94 e 97 foram separados de texto de contexto ou do bloco seguinte. A situação familiar comum aos itens 86 a 90 foi preservada como texto de apoio para permitir a resolução sem depender apenas da imagem da página.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — Cachoeiro de Itapemirim 2024 — Assistente Social, Cargo 3 — revisão v388\n\n- 40 questões classificadas por matéria e conteúdo, com cargo, ano, aplicação e dificuldade estimada.\n- Gabarito definitivo do mesmo caderno associado; itens 79 e 92 marcados como anulados.\n- Enunciado 61 restaurado integralmente; os enunciados 85, 94 e 97 foram limpos de trechos indevidamente anexados pelo OCR.\n- A situação familiar compartilhada foi preservada como contexto de apoio para os itens 86 a 90, e as páginas originais foram mantidas.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
