import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='7608f738874aea09'
const prova='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/036_MCTIINSA_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_007_01.PDF'
const concurso='INSA/MCTI 2024 — Cargo 7: Pesquisador Adjunto I — Sistema de Produção Animal'
const cargo='Pesquisador Adjunto I — Área de Atuação: Sistema de Produção Animal (Código P07)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==76||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Caderno oficial diverge do catálogo')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(records.length!==76||new Set(records.map(q=>q.id)).size!==76)throw Error('A quantidade de recortes do caderno diverge')

const duplicateOf=new Map([
 ['extr-192f17fb1d28861f157d','extr-0da2c6c2f4eae7bff0e2'],
 ['extr-72873bf43cffe5a105cd','extr-4ac8b12f64dcdb3271a1'],
 ['extr-a1f6ff28c4e2cd2446a2','extr-461cb85c62fd79c9ebf4'],
 ['extr-ba5cd20688e079130763','extr-c1a59587de4d29389886'],
 ['extr-cf35fbdc8ad5a7f35bd4','extr-4beead31338d393528b0'],
 ['extr-b9b81d80c9f1b77ad760','extr-c9637c1eee31f9b24647']
])
const category={
51:['Zootecnia','Conservação de recursos genéticos animais: teste de progênie e avaliação de reprodutores','Média'],
52:['Zootecnia','Melhoramento genético animal: seleção assistida por marcadores e resistência a doenças','Difícil'],
53:['Medicina Veterinária','Sanidade de pequenos ruminantes: método FAMACHA e avaliação de anemia por Haemonchus contortus','Média'],
54:['Zootecnia','Reprodução animal: inseminação artificial em tempo flexível em caprinos','Difícil'],
55:['Zootecnia','Manejo de rebanhos: descarte orientado e seleção animal','Média'],
56:['Zootecnia','Raças locais e recursos genéticos animais do semiárido: caprinocultura','Fácil'],
57:['Zootecnia','Sistemas de produção animal: cabrito ecológico da Caatinga e raças nativas','Média'],
58:['Zootecnia','Recursos genéticos animais: características da raça bovina Curraleiro Pé-Duro','Média'],
59:['Zootecnia','Produção animal no semiárido: rebanho bovino do Nordeste','Fácil'],
60:['Botânica','Forragicultura: espécies da Caatinga na dieta de herbívoros domésticos','Média'],
61:['Genética Animal','Genética de populações: consanguinidade, homozigose e heterozigose','Média'],
62:['Melhoramento Genético Animal','Seleção animal: alteração da frequência de características desejáveis','Fácil'],
63:['Genética Animal','Variabilidade genética e resposta à seleção','Média'],
64:['Melhoramento Genético Animal','Cruzamentos: heterose e desempenho médio da progênie','Média'],
65:['Melhoramento Genético Animal','Intensidade de seleção e respostas correlacionadas entre características','Difícil'],
66:['Melhoramento Genético Animal','Seleção em rebanhos e melhoramento de gado leiteiro','Média'],
67:['Melhoramento Genético Animal','Diferença esperada na progênie (DEP) e valor genético','Difícil'],
68:['Melhoramento Genético Animal','Seleção de reprodutores: intensidade de seleção por sexo','Média'],
69:['Reprodução Animal','Perímetro escrotal de touros e precocidade sexual das filhas','Média'],
70:['Melhoramento Genético Animal','Estratégias de cruzamento: mérito genético, heterose e complementaridade','Difícil'],
71:['Genética Animal','Marcadores moleculares: identificação genética e verificação de parentesco','Média'],
72:['Zootecnia','Produção leiteira: controle e registro individual de produção','Fácil'],
73:['Melhoramento Genético Animal','Seleção e reprodução: registros produtivos e intervalo de gerações','Média'],
74:['Reprodução Animal','Processamento de sêmen e avaliação zoogenética de reprodutores','Média'],
75:['Zootecnia','Registro genealógico e certificado especial de identificação e produção animal','Média'],
76:['Conservação de Recursos Genéticos Animais','Conservação on farm e manejo de recursos genéticos animais','Média'],
77:['Conservação de Recursos Genéticos Animais','Raças naturalizadas: conceito e distribuição de espécies domésticas','Média'],
78:['Conservação de Recursos Genéticos Animais','Cruzamento, adaptação local e conservação de raças naturalizadas','Média'],
79:['Conservação de Recursos Genéticos Animais','Conservação in situ on farm de espécies domésticas','Fácil'],
80:['Conservação de Recursos Genéticos Animais','Raças naturalizadas brasileiras de caprinos, bovinos e ovinos','Média'],
81:['Genética Animal','Mutação e frequência gênica em populações','Média'],
82:['Genética Animal','Genética de populações: genótipos e constituição genética','Média'],
83:['Genética Animal','Equilíbrio de Hardy-Weinberg: condições de validade','Difícil'],
84:['Genética Animal','Mutação: alterações gênicas e surgimento de alelos','Média'],
85:['Genética Animal','Determinação cromossômica do sexo em aves','Média'],
86:['Genética Animal','Frequências gênica e genotípica: estimativa a partir de fenótipos','Difícil'],
87:['Genética Animal','Frequência alélica e frequência genotípica','Fácil'],
88:['Genética Animal','Forças evolutivas e estrutura genética de populações','Média'],
89:['Genética Animal','Equilíbrio de Hardy-Weinberg e frequência gênica','Difícil'],
90:['Genética Animal','Cálculo de frequência gênica em população com três genótipos','Difícil'],
91:['Melhoramento Genético Animal','Herdabilidade: sentido amplo e variância genética aditiva','Difícil'],
92:['Genética Quantitativa','Herança poligênica, médias e variações populacionais','Média'],
93:['Genética Quantitativa','Características quantitativas: fenótipo, genótipo e ambiente','Média'],
94:['Genética Quantitativa','Estatística aplicada à genética quantitativa: média, variância e covariância','Média'],
95:['Genética Quantitativa','Características produtivas e influência ambiental','Fácil'],
96:['Genética Quantitativa','Ação gênica aditiva, dominância e epistasia','Difícil'],
97:['Melhoramento Genético Animal','Ganho genético: diferencial de seleção e herdabilidade restrita','Média'],
98:['Genética Quantitativa','Genes de pequeno efeito e controle de características quantitativas','Média'],
99:['Biotecnologia Animal','Edição genética: CRISPR-Cas9 e modificação de características','Difícil'],
100:['Melhoramento Genético Animal','Seleção genômica: SNP e predição da DEP','Difícil'],
101:['Genética Animal','Genômica e identificação de paternidade em programas de reprodução','Média'],
102:['Biotecnologia Animal','Sequenciamento, PCR e detecção de polimorfismos','Média'],
103:['Melhoramento Genético Animal','Seleção assistida por marcadores para qualidade da carne e resistência a doenças','Média'],
104:['Biotecnologia Animal','PCR e sexagem de embriões por marcadores cromossômicos','Difícil'],
105:['Genética Animal','Genotipagem de mutações de interesse em bovinos e suínos','Média'],
106:['Bem-Estar Animal','Necessidades comportamentais e resposta a estímulos','Média'],
107:['Bem-Estar Animal','Indicadores de bem-estar animal: medidas baseadas em recursos e nos animais','Média'],
108:['Bem-Estar Animal','Cinco liberdades: interação social e conforto comportamental','Fácil'],
109:['Bem-Estar Animal','Conceito de bem-estar: estado físico e mental do animal','Fácil'],
110:['Bem-Estar Animal','Etograma e indicadores comportamentais de bem-estar','Média'],
111:['Bem-Estar Animal','Indicadores fisiológicos de estresse: cortisol em transporte','Média'],
112:['Bem-Estar Animal','Indicadores comportamentais e imunológicos de bem-estar animal','Média'],
113:['Bem-Estar Animal','Avaliação de riscos e pontos críticos de bem-estar no rebanho','Média'],
114:['Fisiologia Animal','Resposta endócrina ao estresse: catecolaminas e glicocorticoides','Difícil'],
115:['Ambiência Animal','Estresse térmico e consumo alimentar de ruminantes','Média'],
116:['Ambiência Animal','Termorregulação: umidade do ar e perda de calor por evaporação','Média'],
117:['Ambiência Animal','Zona de termoneutralidade e mecanismos de dissipação de calor','Média'],
118:['Ambiência Animal','Resfriamento evaporativo: eficiência psicrométrica e umidade relativa','Média'],
119:['Ambiência Animal','Índices de conforto térmico: temperatura, umidade e radiação','Difícil'],
120:['Ambiência Animal','Carga térmica radiante e conforto térmico na produção animal','Média']
}
const block=n=>n<=55?'Julgue os itens sobre conservação de recursos genéticos animais do semiárido brasileiro.':n<=60?'Julgue os itens sobre raças domésticas locais e nativas do semiárido brasileiro.':n<=65?'Julgue os itens sobre melhoramento genético animal.':n<=70?'No que se refere à seleção de reprodutores, julgue os itens.':n<=75?'Julgue os itens sobre programas de melhoramento genético animal.':n<=80?'Em relação à utilização de recursos genéticos animais, julgue os itens.':n<=85?'Em relação à genética de populações animais, julgue os itens.':n<=90?'Julgue os itens relativos às frequências gênica e genotípica.':n<=98?'Em relação à genética quantitativa, julgue os itens.':n<=105?'Julgue os itens sobre ferramentas moleculares e suas aplicações no melhoramento animal.':n<=109?'Julgue os itens sobre princípios e fundamentos do bem-estar animal.':n<=114?'Julgue os itens sobre indicadores de bem-estar animal.':n<=117?'Julgue os itens sobre ambiente e termorregulação dos animais de produção.':'Julgue os itens relativos à ambiência na produção animal.'
const fixes=new Map([
 [62,'A seleção animal implica aumento da frequência genética desejada.'],
 [76,'Na conservação on farm, não é permitida a utilização de manejos reprodutivos ou sanitários dos animais.'],
 [114,'A liberação de adrenalina e noradrenalina e, posteriormente, de glicocorticoides está relacionada à resposta endócrina ao estresse em animais com bem-estar comprometido.'],
 [120,'Supondo haver trocas térmicas por evaporação entre o ambiente e o animal, é possível utilizar a carga térmica radiante como medida do conforto térmico.']
])

const gabaritos=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')
const answerRecord=gabaritos.trim().split('\n').map(JSON.parse).find(x=>x.documento_id===doc)
if(answerRecord.status!=='tabela_lida'||Object.keys(answerRecord.respostas).length!==60)throw Error('O índice local do gabarito não tem as 60 respostas verificadas esperadas')
const answerDigest=hashRevisao(Object.entries(answerRecord.respostas).sort((a,b)=>Number(a[0])-Number(b[0])).map(([n,a])=>`${n}:${a}`).join('\n'))
const decisions=records.map(q=>{
 const n=Number(q.numero),topic=category[n],page=Number(q.pagina),duplicate=duplicateOf.has(q.id)
 if(!topic||!page)throw Error(`Item ${n} não tem classificação ou página`)
 const imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=answerRecord.respostas[String(n)]
 const visual={pagina:page,imagem,texto_apoio:block(n),motivo:fixes.has(n)?`Página ${page} conferida visualmente; OCR do item ${n} corrigido e separado do próximo bloco.`:`Página ${page} do caderno oficial conferida; comando temático e item ${n} vinculados.`}
 if(fixes.has(n))visual.enunciado=fixes.get(n)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2025,concurso,cargo,organizadora:'CEBRASPE',aplicacao:'INSA/MCTI — aplicação em 23/02/2025',numero_original:n,pagina:page,dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela combinação de conceitos, cálculo e precisão técnica; não é nível oficial individual da banca.',classificacao_fonte:prova,motivo:`CEBRASPE — INSA/MCTI, Cargo 7 (P07), prova aplicada em 23/02/2025. Item ${n}; conteúdo e seção conferidos no caderno oficial.`,texto_apoio:block(n),reemplazarContexto:true,imagens_contexto:[{pagina:page,imagem,texto:block(n)}],visual}
 if(fixes.has(n))d.enunciado=fixes.get(n)
 if(answer){d.resposta_correta=answer==='X'?null:answer==='C'?0:1;d.anulada=answer==='X';d.gabarito_oficial={fonte:gabarito,arquivo:'Gab_Definitivo_036_MCTIINSA_007_01.PDF',prova:'036_MCTIINSA_007_01.PDF',sha256:answerDigest,sha256_tipo:'sha256_da_transcricao_canonica_dos_itens_51_a_110; nao_e_hash_do_pdf',hash_metodo:'SHA-256 da transcrição canônica item:resposta dos 60 itens 51–110 disponíveis no índice de gabaritos conferidos; não representa o hash do PDF.',numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo CEBRASPE do Cargo 7, validado no índice local de gabaritos oficiais; o índice disponível cobre os itens 51–110.'}}
 if(duplicate){d.apta_resolucao=false;d.duplicada_de=duplicateOf.get(q.id);d.inelegibilidade_motivo='Cópia OCR duplicada do mesmo item numerado no mesmo caderno; mantida apenas a versão canônica para resolução.'}
 else {d.apta_resolucao=true;d.remover_pendencias=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}
 return d
})
for(const page of new Set(decisions.map(d=>d.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
if(decisions.length!==76||decisions.filter(d=>d.apta_resolucao===false).length!==6||new Set(decisions.map(d=>d.numero_original)).size!==70)throw Error('Esperados 76 recortes, 70 itens e 6 duplicatas')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortes:76,itensUnicos:70,duplicatas:6,gabaritosVinculados:decisions.filter(d=>d.gabarito_oficial).length,itensSemGabarito:decisions.filter(d=>!d.gabarito_oficial&&!duplicateOf.has(d.id)).map(d=>d.numero_original),paginas:[1,2,3],corrigidos:[...fixes.keys()],publicado:false},null,2));process.exit(0)}

const name='revisao-insa-cargo7-producao-animal-itens51-120-v318'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,cargo,registrosRevistos:76,itensUnicos:70,duplicatasDesativadas:6,paginasConferidas:[1,2,3],itensComGabaritoVerificado:60,itensSemGabaritoVerificado:[111,112,113,114,115,116,117,118,119,120],itensComOCRCorrigido:[...fixes.keys()],gabaritoDefinitivo:gabarito,publicado:false,observacao:'O índice local de gabaritos oficiais disponível cobre somente os itens 51–110. Os itens 111–120 permanecem elegíveis para resolução manual, sem correção automática até verificar o restante da chave oficial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## INSA/MCTI — Cargo 7, Sistema de Produção Animal — itens 51–120 — v318\n\n- Revisei 76 registros OCR para 70 itens únicos. Corrigi as classificações genéricas ou inadequadas item a item em Zootecnia, Medicina Veterinária, Botânica, Genética Animal, Reprodução Animal, Conservação de Recursos Genéticos, Genética Quantitativa, Biotecnologia, Bem-Estar e Ambiência Animal. Registrei aplicação em 23/02/2025, cargo, dificuldade estimada e página.\n- Desativei seis cópias OCR dos itens 53, 55, 60, 62, 75 e 76. Reparei fragmentos OCR nos itens 62, 76, 114 e 120 e associei os comandos temáticos de cada bloco às imagens das três páginas oficiais.\n- Vinculei os 60 gabaritos definitivos disponíveis no índice local (itens 51–110). O índice atual não contém resposta validada para os itens 111–120; estes ficam liberados para resolução manual, sem correção automática.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo do Cargo 7](<${gabarito}>), [edital oficial do concurso](<https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/ED_1_2023_INSA_ABERTURA_.PDF>).\n`)
console.log(JSON.stringify(report,null,2))


