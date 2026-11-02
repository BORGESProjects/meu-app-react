import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='d26ca3e651df671f'
const fonte='https://download.inep.gov.br/educacao_basica/enem/provas/2017/2017_PV_reaplicacao_PPL_D1_CD21.pdf'
const concurso='ENEM 2017 — Reaplicação PPL, 1º dia, Caderno 21 (Laranja)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==84||catalog.url!==fonte)throw Error('Catálogo oficial do ENEM PPL 2017 Caderno 21 divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-arsal-engenharia-eletrica-2026-v243'))
if(start<0)throw Error('Base v243 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==84)throw Error(`Esperados 84 itens do caderno, encontrados ${active.size}`)

// Questões 1–5 aparecem em versões linguísticas alternativas (inglês e espanhol).
// A separação em duas variantes é intencional e cada uma mantém seu próprio texto-base.
const english=new Set(catalog.questoes.slice(0,5).map(q=>q.id)),spanish=new Set(catalog.questoes.slice(5,10).map(q=>q.id))
const language=new Map([
 [6,['Português','Interpretação de texto e crítica à ideia de ruptura absoluta na contemporaneidade']],
 [7,['Artes','Teatro físico: gesto, esforço, movimento e expressividade corporal']],
 [8,['Literatura','Poesia social: voz lírica, trabalho e transformação do mundo']],
 [9,['Português','Identidade regional, pertencimento e cultura de torcida']],
 [10,['Português','Gênero crônica: finalidade, voz autoral e reflexão sobre a escrita']],
 [11,['Português','Leitura de capa de revista e integração entre linguagem verbal e visual']],
 [12,['Literatura','Regionalismo e variação lexical em narrativa brasileira']],
 [13,['Literatura','Narrador e relações sociais em São Bernardo, de Graciliano Ramos']],
 [14,['Educação Física','Classificação dos esportes por interação entre adversários e cooperação']],
 [15,['Literatura','O Mulato, de Aluísio Azevedo: racismo e hierarquia social']],
 [16,['Português','Jornalismo e transformações dos meios de comunicação']],
 [17,['Artes','Cubismo e colagem na composição visual de Pablo Picasso']],
 [18,['Português','Línguas indígenas, nheengatu e diversidade linguística']],
 [19,['Artes','Festa junina, quadrilha e cultura popular']],
 [20,['Artes','Teatro: relação entre texto, atuação e recepção do público']],
 [21,['Português','Leitura de tirinha e construção de humor']],
 [22,['Português','Interpretação de texto e finalidade argumentativa sobre educação']],
 [23,['Literatura','Lima Barreto: exclusão social e representação do hospício']],
 [24,['Português','Tecnologia e vida digital: efeitos sociais da comunicação']],
 [25,['Português','Divulgação científica: emoções e estudos de António Damásio']],
 [26,['Português','Oralidade e variação linguística em diálogo coloquial']],
 [27,['Artes','Escultura monumental e realismo socialista na obra de Vera Mukhina']],
 [28,['Literatura','Crônica e construção narrativa de episódio cotidiano']],
 [29,['Português','Gêneros digitais e práticas de leitura e escrita em chats']],
 [30,['Artes','Frevo: dança, carnaval e patrimônio cultural pernambucano']],
 [31,['Literatura','Narrativa contemporânea: memória, infância e imagens literárias']],
 [32,['Artes','Dadaísmo e ready-made: ressignificação de objeto cotidiano']],
 [33,['Literatura','Narrativa literária e construção de perspectiva sobre a infância']],
 [34,['Literatura','Poesia de Carlos Drummond de Andrade: tempo e experiência']],
 [35,['Português','Entrevista e argumentação sobre tecnologia e cognição']],
 [36,['Português','Publicidade de saúde: campanha de prevenção do câncer de mama']],
 [37,['Artes','Grafite, reciclagem e ressignificação estética do espaço urbano']],
 [38,['Português','Publicidade: metáfora e persuasão na construção de mensagem']],
 [39,['Português','Tirinha e crítica aos efeitos sociais da internet']],
 [40,['Português','Mídia esportiva, mercado e internacionalização do basquete']],
 [41,['Português','Gênero carta e marcas linguísticas de interlocução']],
 [42,['Português','Divulgação científica e interpretação de pesquisa sobre paternidade e saúde']],
 [43,['Literatura','Conto de Sérgio Sant’Anna: sonoridade, ritmo e efeitos expressivos']],
 [44,['Literatura','Poesia de João Cabral de Melo Neto: imagens e representação da morte']],
 [45,['Artes','Leitura de signos visuais, vestuário e distinção social']],
])
const human=new Map([
 [46,['Filosofia','Direitos civis, universalismo e fundamentos das constituições modernas']],
 [47,['História','Política de preservação do patrimônio brasileiro e criação do SPHAN']],
 [48,['História','Ciclo da borracha, crise econômica e transformações urbanas em Manaus']],
 [49,['Sociologia','Estado-nação, identidade nacional e formação política moderna']],
 [52,['Geografia','Amazônia, rios voadores e circulação atmosférica de umidade']],
 [55,['Sociologia','Família, casamento e construção social de normas de gênero']],
 [58,['Sociologia','Colonialismo, racismo e identidade na obra de Frantz Fanon']],
 [59,['Geografia','Continuum rural-urbano e organização espacial das atividades']],
 [60,['História','História cultural dos costumes alimentares e uso dos talheres']],
 [61,['Geografia','Conservação do solo: erosão em encosta, drenagem e terraceamento']],
 [62,['Sociologia','Políticas sociais compensatórias, exclusão e igualdade de oportunidades']],
 [63,['Sociologia','Movimentos LGBT, estigma e reconhecimento de direitos']],
 [65,['Geografia','Infraestrutura, integração territorial e economia global']],
 [67,['Filosofia','Epistemologia de Aristóteles: verdade, opinião e conhecimento científico']],
 [68,['História','Povos indígenas, catequização e relações coloniais com missionários']],
 [69,['Filosofia','Estoicismo: propriedade, perda e domínio sobre as próprias reações']],
 [70,['História','Primeira Guerra Mundial e crise econômica internacional do entreguerras']],
 [71,['Sociologia','UPPs, política de pacificação e cidadania nas favelas']],
 [72,['História','Abolicionismo e participação popular no fim da escravidão no Brasil']],
 [73,['Geografia','Intemperismo, erosão, transporte e deposição de sedimentos']],
 [74,['Geografia','Integração regional, comércio Brasil–Argentina e Mercosul']],
 [75,['Geografia','Agricultura canavieira, queima da palha e mecanização do corte']],
 [76,['Sociologia','Divisão sexual do trabalho e desigualdade de gênero']],
 [77,['Sociologia','Movimento Negro Unificado e enfrentamento do racismo no Brasil']],
 [78,['Geografia','Demarcação de terras indígenas e Raposa Serra do Sol']],
 [79,['História','Era Vargas, sindicalismo e incorporação estatal do movimento operário']],
 [80,['Sociologia','Nepotismo, moralidade e impessoalidade na administração pública']],
 [82,['Filosofia','Aristóteles: definição de enigma e construção lógica de sentido']],
 [84,['Geografia','Cafeicultura em encostas, erosão e impactos ambientais históricos']],
 [85,['Geografia','Demografia: pirâmide etária, estrutura populacional e demanda social']],
 [86,['História','Escravidão, mineração e irmandades religiosas em Minas Gerais colonial']],
 [87,['Geografia','Revolução Verde, produtividade agrícola e persistência da fome']],
 [88,['Geografia','Urbanização, impermeabilização do solo e escoamento superficial']],
 [89,['Geografia','Emissões de CO₂ e acidificação dos oceanos: impactos sobre organismos marinhos']],
])
const diffHard=new Set([7,11,14,17,27,30,32,37,40,45,49,52,58,61,63,67,68,70,71,74,75,76,77,78,79,80,82,85,87,88,89])
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']
for(const page of new Set(catalog.questoes.map(x=>x.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const decisions=[...active.values()].map(q=>{
 const entry=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=entry?.pagina
 if(!entry||!page)throw Error(`Página original ausente para ${q.id}`)
 let materia,conteudo
 if(english.has(q.id)){materia='Inglês';conteudo='Compreensão leitora em inglês: ideia central, inferência, vocabulário contextual e finalidade comunicativa.'}
 else if(spanish.has(q.id)){materia='Espanhol';conteudo='Compreensão leitora em espanhol: interpretação, inferência, vocabulário contextual e finalidade comunicativa.'}
 else if(n<=45)[materia,conteudo]=language.get(n)||['Português','Leitura e interpretação de textos e linguagens multimodais']
 else [materia,conteudo]=human.get(n)||(()=>{throw Error(`Classificação temática ausente para a questão ${n}`)})()
 const context=(entry.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial, vinculada pelo catálogo para preservar textos-base ou elementos visuais que atravessam páginas.'}))
 const stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<20||/�|\ufffd/.test(stem))throw Error(`Enunciado OCR suspeito em ${q.id}; imagem original preservada para inspeção`)
 const mapPage=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2017,concurso,numero_original:n,pagina:page,dificuldade:diffHard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo encadeamento de fontes, operações de leitura e conhecimento curricular; não divulgada oficialmente pelo INEP.',classificacao_fonte:fonte,motivo:`ENEM PPL 2017, reaplicação, Caderno 21 Laranja, questão ${n}, página ${page}. Área, matéria e conteúdo definidos pela competência exigida no comando e pelos textos-base; imagens e gráficos mantidos na página original.`,visual:{pagina:page,imagem:mapPage,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial preservada como referência visual do enunciado, texto-base, imagem, gráfico e alternativas.'},...(context.length?{imagens_contexto:context}:{}),apta_resolucao:true,remover_pendencias:removable}
})
if(decisions.length!==84||decisions.some(x=>!x.materia||!x.conteudo||!x.ano))throw Error('Cobertura/classificação do caderno incompleta')
if(new Set(decisions.map(x=>x.id)).size!==84)throw Error('IDs duplicados no lote')
const reportPreview={registros:decisions.length,ingles:decisions.filter(x=>english.has(x.id)).length,espanhol:decisions.filter(x=>spanish.has(x.id)).length,portugues_artes:decisions.filter(x=>x.numero_original>=6&&x.numero_original<=45).length,humanas:decisions.filter(x=>x.numero_original>=46).length,por_materia:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(s=>[s,decisions.filter(x=>x.materia===s).length])),imagens_pagina_individual:decisions.filter(x=>x.visual).length,pendentesAntes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,fonte}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify(reportPreview,null,2));process.exit(0)}
const name='revisao-enem-ppl2017-caderno21-v244'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,...reportPreview,paginasPDFPreservadas:31,complementosVisuaisContiguos:decisions.filter(x=>x.imagens_contexto?.length).length,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão ENEM PPL 2017 — 1º dia, Caderno 21 Laranja — v244\n\n- Revisei os 84 registros do caderno: versões alternativas de Inglês (1–5) e Espanhol (1–5), Linguagens em Português/Artes/Educação Física (6–45) e Ciências Humanas (46–89, apenas os itens constantes do catálogo). Corrigi classificações temáticas genéricas e alinhei ano, concurso, matéria e conteúdo aos filtros usados no site.\n- Mantive a numeração das variantes de idioma separada, pois são opções legítimas do ENEM. Preservei o conteúdo extraído e vinculei a página original e páginas contíguas quando o material de apoio se estende. As imagens oficiais de 31 páginas permanecem disponíveis localmente; não atribuí gabarito automático novo.\n- Validação local: ${result.classificadas} registros revisados, ${result.novas_classificacoes} novas classificações, ${result.contextos_visuais} referências visuais, ${result.total} registros totais no acervo, ${result.disponiveis} elegíveis e ${result.pendentes} pendências de classificação. Alteração local, não publicada na nuvem.\n- Fonte oficial: [caderno ENEM PPL 2017 — 1º dia, Caderno 21](https://download.inep.gov.br/educacao_basica/enem/provas/2017/2017_PV_reaplicacao_PPL_D1_CD21.pdf); [catálogo oficial de provas e gabaritos do INEP](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2017).\n`)
console.log(JSON.stringify(out,null,2))
