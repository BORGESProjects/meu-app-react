import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='b02d5d5f31d662d3'
const prova='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/888_TBG_013_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_013_01.PDF'
const concurso='TBG 2023 — Cargo 13: Engenheiro Júnior — Ênfase: Inspeção — aplicação em 15/10/2023'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='888_TBG_013_01.PDF')throw Error('Documento do Cargo 13 da TBG não confere')

// Gabarito oficial definitivo, itens 31–100. X corresponde a item anulado.
const respostaTexto=[
 'XEECXECCECEECEECXCCE',
 'CECCECEEECECCECEECEC',
 'CCECEECECEEEECCCECEC',
 'EECEECCCEC'
].join('')
if(respostaTexto.length!==70||/[^CEX]/.test(respostaTexto))throw Error('Sequência do gabarito oficial inválida')
const respostas=Object.fromEntries([...respostaTexto].map((v,i)=>[i+31,v]))
const temas={
31:['Soldagem','Soldagem MAG: aplicação em aços inoxidáveis'],32:['Soldagem','Soldagem no estado sólido e mecanismo de união'],33:['Soldagem','Soldagem por fusão e zona termicamente afetada'],34:['Soldagem','Processos de soldagem com energia mecânica: atrito e deformação plástica'],35:['Soldagem','Soldagem MIG pulsada e materiais de base'],36:['Soldagem','Soldagem MIG/MAG: posições e formação de escória'],
37:['Ensaios Não Destrutivos','Inspeção visual como ensaio não destrutivo'],38:['Ensaios Não Destrutivos','Líquido penetrante: detecção de vazamentos em tubos e tanques'],39:['Ensaios Não Destrutivos','Correntes parasitas e materiais condutores'],40:['Ensaios Não Destrutivos','Emissão acústica e monitoramento dinâmico de defeitos'],41:['Ensaios Não Destrutivos','Líquido penetrante: ensaio superficial e limitações'],42:['Ensaios Não Destrutivos','Termografia infravermelha e princípios de medição térmica'],
43:['Metalurgia da Soldagem','Tamanho de grão e microestrutura da solda'],44:['Metalurgia da Soldagem','Solidificação da poça de fusão e formato do cordão'],45:['Metalurgia da Soldagem','Teor de carbono e formação de bainita no metal de solda'],46:['Metalurgia da Soldagem','Macroestrutura de solda e resistência à propagação de trincas'],
47:['Inspeção de Soldagem','Análise macrográfica do metal base e identificação de defeitos'],48:['Ensaios Não Destrutivos','Radiografia industrial: inclusões e poros em juntas soldadas'],49:['Inspeção de Soldagem','Ensaio de estanqueidade e verificação de juntas soldadas'],50:['Inspeção de Soldagem','Controle da qualidade dos eletrodos e parâmetros de soldagem'],
51:['Ensaios Não Destrutivos','Líquido penetrante: formulação e inspeção de tubulações'],52:['Ensaios Não Destrutivos','Partículas magnéticas: identificação de descontinuidades'],53:['Ensaios Não Destrutivos','Ultrassom em tubulações poliméricas e defeitos internos'],54:['Ensaios Não Destrutivos','Ensaio de pressão e detecção de vazamentos em tubos de ferro fundido'],55:['Ensaios Não Destrutivos','Radiografia de tubulações de aço-carbono e defeitos superficiais'],
56:['Materiais e Processos de Fabricação','Ferro-gusa: alto-forno, carbono e impurezas'],57:['Materiais e Processos de Fabricação','Tubos de aço inoxidável sem costura: laminação e conformação'],58:['Materiais e Processos de Fabricação','Fundição por gravidade de tubos de ferro fundido'],59:['Materiais e Processos de Fabricação','Extrusão de tubos cerâmicos de alumina e emprego de mandril'],60:['Materiais e Processos de Fabricação','Conformação e soldagem de tubos de aço-carbono'],
61:['Inspeção de Dutos','Regulamento ANP nº 2/2011: inspeção geológico-geotécnica da faixa de dutos'],62:['Inspeção de Dutos','NR 13: programa e plano de inspeção de tubulações'],63:['Inspeção de Dutos','NR 13: gestão de caldeiras, vasos de pressão, tubulações e tanques'],64:['Inspeção de Dutos','Regulamento ANP nº 2/2011: monitoramento de vazamentos e calibração'],65:['Ensaios Não Destrutivos','Partículas magnéticas em dutos de aço inoxidável após evento sísmico'],66:['Ensaios Não Destrutivos','Ultrassom em campo: limitações de porte e transporte do equipamento'],67:['Ensaios Não Destrutivos','Radiografia industrial de dutos e componentes'],68:['Ensaios Não Destrutivos','Ensaio hidrostático ou pneumático para localização de vazamentos'],69:['Ensaios Não Destrutivos','Líquido penetrante: mecanismo e detecção de descontinuidades superficiais'],70:['Inspeção de Dutos','Inspeção visual de soldas, flanges e conexões'],
71:['Corrosão','Temperatura e velocidade de reações de corrosão'],72:['Corrosão','Corrosão por pite e ação de espécies corrosivas'],73:['Corrosão','Transição dúctil-frágil e morfologia de fratura dos aços'],74:['Materiais','Polímeros: taxa de deformação, temperatura e fragilização'],75:['Corrosão','Corrosão aquosa, corrosão galvânica e par galvânico'],76:['Corrosão','Diagrama de Pourbaix: potencial eletroquímico, pH e regiões de estabilidade'],77:['Corrosão','Preparação de superfícies e aderência de revestimentos anticorrosivos'],78:['Corrosão','Passividade e formação de películas protetoras'],79:['Corrosão','Polarização eletroquímica e potencial de eletrodo'],80:['Corrosão','Proteção anticorrosiva e redução da velocidade de oxidação'],
81:['Resistência dos Materiais','Lei de Hooke e deformação elástica'],82:['Metalurgia Física','Fragilização ao revenido em aços de baixa liga e elementos residuais'],83:['Corrosão','Par galvânico platina-zinco em meio ácido'],84:['Resistência dos Materiais','Tensão mecânica: tração, compressão e cisalhamento'],85:['Resistência dos Materiais','Torção, flexão e cisalhamento em elementos mecânicos'],
86:['Metalurgia Física','Estrutura cristalina CCC da ferrita alfa em aços-carbono'],87:['Metalurgia Física','Cementação e difusão de carbono em estado sólido'],88:['Metalurgia Física','Encruamento de aço-carbono e geração de discordâncias'],89:['Metalurgia Física','Tamanho de grão, resistência mecânica e dureza'],90:['Tratamentos Térmicos','Recristalização de aço-carbono e propriedades mecânicas'],
91:['Metalurgia Física','Austenitização e transformação de ferrita em austenita'],92:['Metalurgia Física','Diagrama ferro-carbono e microestrutura perlítica'],93:['Tratamentos Térmicos','Têmpera: formação de martensita por resfriamento rápido'],94:['Tratamentos Térmicos','Revenido, bainita e transformações de fase do aço'],95:['Metalurgia Física','Elementos de liga e homogeneidade microestrutural após têmpera'],96:['Ensaios Mecânicos','Ensaio Jominy e avaliação da temperabilidade'],
97:['Ensaios Mecânicos','Teor de carbono, resistência mecânica e ensaio de dureza'],98:['Materiais','Materiais cerâmicos: ligações químicas e condutividade elétrica'],99:['Metalurgia Física','Teor de carbono e tenacidade de aços-carbono'],100:['Metalurgia Física','Aço inoxidável: camada passiva de óxido de cromo']
}
const contextoPorNumero={
31:'Julgue os itens seguintes, relativos aos processos de soldagem.',37:'Acerca de ensaios não destrutivos, julgue os itens que se seguem.',43:'Com referência à metalurgia da soldagem e aos defeitos de origem metalúrgica, julgue os itens a seguir.',47:'A respeito dos cuidados de inspeção que devem ocorrer antes, durante e após a soldagem, julgue os itens a seguir.',51:'Considerando as opções de ensaios não destrutivos que podem ser usados para a inspeção de tubulações de transporte de fluidos, julgue os itens a seguir.',56:'Acerca dos processos de fabricação de tubulações de gasodutos, julgue os itens seguintes.',61:'Julgue os itens a respeito das normas e dos regulamentos técnicos relacionados a dutos terrestres para movimentação de petróleo, derivados e gás natural.',65:'Cenário: duto de transporte de gás natural fabricado em aço inoxidável austenítico, com 300 km de comprimento, submetido a abalo sísmico natural próximo ao quilômetro 100. Para avaliar possíveis danos, foram realizados ensaios não destrutivos no duto.',71:'No que se refere à corrosão, aos processos de deterioração e à resistência dos materiais, julgue os itens seguintes.',76:'Julgue os itens subsequentes relativos ao diagrama de Pourbaix, à passivação, à polarização e às medidas anticorrosivas.',81:'A respeito da resistência dos materiais, das alterações metalúrgicas e dos danos causados pelo hidrogênio, julgue os itens subsequentes.',86:'Texto-base: aço-carbono utilizado na fabricação de tubulações para transporte de produtos de petróleo, com teor de carbono usual entre 0,2% e 0,8%. Considere sua estrutura cristalina.',91:'A respeito das transformações de fases e das microestruturas em aços-carbono estabelecidas em diagramas de fase, julgue os itens seguintes.',97:'Com relação à composição, às propriedades e aos ensaios mecânicos dos materiais, julgue os itens subsequentes.'
}
const contexto=n=>{let t='';for(const k of Object.keys(contextoPorNumero).map(Number).sort((a,b)=>a-b))if(k<=n)t=contextoPorNumero[k];return t}
const paginas=new Map(catalog.questoes.map(q=>[q.numero,q.pagina]))
if(Object.keys(temas).length!==70||new Set(catalog.questoes.map(q=>q.numero)).size!==70)throw Error('Classificação não cobre os 70 itens oficiais 31–100')
for(let n=31;n<=100;n++)if(!temas[n]||!paginas.has(n)||!respostas[n])throw Error(`Item ${n}: classificação, página ou gabarito ausente`)

const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==78||new Set(registros.map(q=>q.numero_original)).size!==70)throw Error(`Esperava 78 registros OCR para os 70 itens oficiais; encontrei ${registros.length} registros e ${new Set(registros.map(q=>q.numero_original)).size} números distintos`)
const duplicadas=new Map([
 ['extr-8fe608305a50b6a58e82','extr-6b6e951a842541656be0'],['extr-56f653d722f63aab3da4','extr-59adecc4e236812d08fb'],
 ['extr-2a53b9cdff6a5c3fab71','extr-2e1be7ebe607f0bbe09a'],['extr-05d2df363cf08f2ea783','extr-af14cf5dfa263e2509ba'],
 ['extr-bec7ebe4550fa647f828','extr-51cb3933c6e2597c2130'],['extr-2d3e13229cb35cba62a6','extr-362239a6d4d2dfc20e0f'],
 ['extr-7178a08509a4e78d4516','extr-6524c0480bcbbb0eb134'],['extr-1acee66bd73526c01e2e','extr-ff89cb8418bad215d8f7']
])
const correcoes={
31:'O processo MAG é adequado à soldagem de aço inoxidável.',34:'Quando é empregada fonte de energia mecânica no processo de soldagem, o calor é gerado por atrito ou por deformação plástica do material.',
42:'A inspeção termográfica é uma técnica de ensaio não destrutivo que utiliza pulsos ultrassônicos para localização dos defeitos.',
44:'A poça de fusão no formato de gota ocorre quando a velocidade da solidificação é igual à velocidade de soldagem.',
45:'No metal de solda, o teor de carbono — principal elemento químico na determinação da microestrutura do aço — deve estar entre 0,05% e 0,15%, para evitar a formação de bainita.',
48:'O controle radiográfico, em que a peça a controlar é submetida à incidência de raios X ou raios gama, é a melhor opção para a detecção de inclusões e poros após a soldagem.',
55:'A incidência de raios X na superfície de uma tubulação fabricada em aço-carbono permite revelar apenas defeitos superficiais, como resultado da reflexão do feixe de raios X na superfície.',
56:'Produtos fabricados com ferro-gusa contêm elevado teor de carbono e de impurezas, resultantes da transformação de minério de ferro, carvão e calcário durante a operação do alto-forno.',
58:'Tubulações de ferro fundido obtidas pelo processo de fundição por gravidade apresentam como principal característica a concentração de tensões, resultante da aplicação de força de compactação em uma prensa durante a solidificação.'
}
const digest=hashRevisao(respostaTexto)
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original),t=temas[n],pagina=paginas.get(n),ctx=contexto(n),resposta=respostas[n]
 if(!t||!pagina||!ctx)throw Error(`Item ${n}: classificação, página ou contexto ausente`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2023,concurso,numero_original:n,pagina,dificuldade:[34,37,38,39,40,41,42,43,44,46,47,48,51,52,53,54,55,61,62,63,64,65,66,67,68,69,71,72,73,76,78,79,80,82,83,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela especificidade metalúrgica, mecânica, de inspeção e dos ensaios; o CEBRASPE não publicou dificuldade por item.',motivo:`Item ${n}: classificação individual pelo enunciado e pelo bloco temático do caderno oficial do Cargo 13.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura semântica e inspeção visual das três páginas oficiais'},resposta_correta:resposta==='X'?null:resposta==='C'?0:1,anulada:resposta==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_888_TBG_013_01.PDF',criterio:'Gabarito oficial definitivo CEBRASPE — Cargo 13: Engenheiro Júnior, Ênfase Inspeção.',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência oficial dos 70 itens 31–100; não é hash do PDF.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${pagina} do caderno oficial preservada para leitura do item, figura e contexto compartilhado.`}}
 if(correcoes[n]&&!duplicadas.has(q.id))d.enunciado=correcoes[n]
 if(duplicadas.has(q.id)){d.apta_resolucao=false;d.duplicada_de=duplicadas.get(q.id);d.inelegibilidade_motivo=`Cópia OCR do item ${n}; preservada no histórico e retirada da resolução para evitar duplicidade.`}
 return d
})
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-anp-combustiveis-ii-2022-v209'))
if(!base)throw Error('Raiz v209 não encontrada')
const nome='revisao-tbg-inspecao-2023-v210'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:70,itens_unicos_classificados:70,duplicatas_ocr_excluidas:duplicadas.size,itens_anulados_oficiais:[31,35,47],gabaritos_definitivos_associados:70,paginas_originais_conferidas:[1,2,3],data_aplicacao:'2023-10-15',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão TBG — Cargo 13, Inspeção — v210\n\n- Revisei 78 registros OCR correspondentes aos 70 itens oficiais de 31 a 100. Classifiquei cada item por Soldagem, Ensaios Não Destrutivos, Inspeção de Dutos, Corrosão, Resistência dos Materiais, Metalurgia Física, Tratamentos Térmicos, Materiais e Ensaios Mecânicos, com assunto específico, cargo, ano, página e dificuldade estimada.\n- Excluí oito cópias OCR duplicadas da resolução e corrigi a transcrição do item 44 (“poça de fusão”), além de normalizar os itens com duplicatas. Associei os blocos de contexto, as três páginas originais e o gabarito definitivo, com os itens 31, 35 e 47 anulados.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno Cargo 13](<${prova}>), [gabarito definitivo Cargo 13](<${gabarito}>), [edital TBG 2023](https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/ED_1_2023_TBG_ABERTURA_VERSAO_COMPILADA1.PDF).\n`)
console.log(JSON.stringify(out))
