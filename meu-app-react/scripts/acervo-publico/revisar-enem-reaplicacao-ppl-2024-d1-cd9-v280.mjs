import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-enem-reaplicacao-ppl-2024-d1-cd9-v281'
const base='tmp/revisao-profissional/correcao-leitura-petrobras-2021-item-58-v279/acervo-extraido'
const doc='662232e925825462'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_reaplicacao_PPL_D1_CD9_braile_e_ledor.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_reaplicacao_PPL_D1_CD9_braile_e_ledor.pdf'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-documento-662232e925825462.json','utf8'))

// Classificação editorial pelo conteúdo específico do item, não pelo rótulo amplo da área.
const temas={
1:['Língua Inglesa','Interpretação multimodal: fruição e leitura de obra de arte'],
2:['Língua Inglesa','Vocabulário em contexto: aquecimento global e temperaturas extremas'],
3:['Língua Inglesa','Literatura e identidade: migração, língua e pertencimento'],
4:['Língua Inglesa','Interpretação de cartum: identidade digital e autorrepresentação'],
5:['Língua Inglesa','Interpretação de texto: tecnologia, infância e educação'],
6:['Língua Portuguesa','Leitura de campanha: multimodalidade e persuasão em saúde pública'],
7:['Língua Portuguesa','Gêneros jornalísticos: finalidade e público-alvo de notícia de serviço'],
8:['Educação Física','Esporte e sociedade: doping, ética e integridade esportiva'],
9:['Língua Portuguesa','Variação linguística e revisão: ferramentas de correção textual'],
10:['Literatura','Cultura popular: fandango, viola caipira e representação do cotidiano'],
11:['Artes','Arte popular brasileira: escultura de Mestre Vitalino e representação social'],
12:['Língua Portuguesa','Contato linguístico na fronteira: variação lexical português-espanhol'],
13:['Língua Portuguesa','Educação midiática: verificação de informação e combate à desinformação'],
15:['Literatura','Poesia brasileira: Ferreira Gullar, contexto histórico e construção de esperança'],
16:['Literatura','Gênero crônica: metalinguagem e processo de escrita'],
17:['Língua Portuguesa','Inteligência artificial e educação: leitura de notícia e debate público'],
18:['Literatura','Narrativa e ironia: expectativa do leitor e comportamento social'],
19:['Língua Portuguesa','Gênero epistolar: interlocução e uso do vocativo'],
20:['Língua Portuguesa','Tecnologia e sociedade: privacidade, vigilância e autonomia de adolescentes'],
21:['Literatura','Canção brasileira: oralidade, coloquialidade e construção de sentido'],
22:['Literatura','Conto brasileiro: descrição de espaço e construção de atmosfera'],
23:['Língua Portuguesa','Gênero argumentativo: tese, evidências e persuasão sobre licença-paternidade'],
24:['Literatura','Poesia modernista: repetição, enumeração e construção de contraste'],
25:['Literatura','Poesia contemporânea: intertextualidade e metalinguagem'],
26:['Língua Portuguesa','Funções da linguagem: apelo ao interlocutor em anúncio publicitário'],
27:['Literatura','Crônica urbana: metáfora e representação do espaço social'],
28:['Educação Física','Atividade física, saúde e condicionantes sociais'],
29:['Língua Portuguesa','Variação linguística: jargão corporativo e comunicação no trabalho'],
30:['Educação Física','Esporte, gênero e preconceito: participação feminina no rúgbi'],
31:['Artes','Fotografia e sociedade: representação do trabalho e desemprego'],
32:['Língua Portuguesa','Leitura crítica de notícia: adequação linguística e confiabilidade'],
33:['Literatura','Memórias literárias: descrição e caracterização de personagem'],
34:['Língua Portuguesa','Linguagem visual: padrões de beleza, estereótipos e visibilidade'],
35:['Língua Portuguesa','Gêneros digitais: características e usos do podcast'],
36:['Língua Portuguesa','Divulgação científica e cidadania: clareza na leitura de bulas'],
37:['Língua Portuguesa','Lexicografia: acepções, verbetes e polissemia'],
38:['Língua Portuguesa','Tecnologia e educação: usos e implicações de inteligência artificial'],
39:['Matemática','Leitura de infográfico: comparação de dados sobre participação no skate'],
40:['Língua Portuguesa','Linguagem visual: padrões de beleza, estereótipos e visibilidade'],
41:['Língua Portuguesa','Gêneros digitais: características e usos do podcast'],
42:['Língua Portuguesa','Divulgação científica e cidadania: clareza na leitura de bulas'],
43:['Língua Portuguesa','Lexicografia: acepções, verbetes e polissemia'],
44:['Língua Portuguesa','Tecnologia e educação: usos e implicações de inteligência artificial'],
45:['Matemática','Leitura de infográfico: comparação de dados sobre participação no skate'],
46:['História','Abolição da escravidão: mobilização social e atuação de Dragão do Mar'],
47:['Sociologia','Trabalho e tecnologia: automação, capitalismo e relações de produção'],
48:['História','Povoamento da Europa: evidências genéticas e diversidade populacional'],
49:['História','Roma antiga e recepção do legado clássico na cultura política'],
50:['História','Movimento dos direitos civis nos Estados Unidos: Rosa Parks e resistência'],
51:['Sociologia','Justiça ambiental: movimentos sociais e gestão comunitária'],
52:['Filosofia','Nietzsche: eterno retorno e avaliação das escolhas de vida'],
53:['História','Quilombos: estratégias de sobrevivência e organização econômica'],
54:['Filosofia','Albert Camus: absurdo e condição humana'],
55:['Geografia','Migração internacional: Brexit, trabalho e circulação de pessoas'],
56:['História','Memória social e patrimônio: Museu da Maré'],
57:['Filosofia','Empirismo e indução: problema da generalização científica'],
58:['Geografia','Caatinga: uso comunitário da terra e relação sociedade-natureza'],
59:['História','Cidadania na Antiguidade: pertencimento e exclusão social'],
60:['História','Religiosidade popular: Círio de Nazaré e continuidade cultural'],
61:['Geografia','Fronteira agrícola do Matopiba: expansão e produção de commodities'],
62:['História','Era Vargas: industrialização e Companhia Siderúrgica Nacional'],
63:['História','Ditadura chilena: memória, responsabilização e justiça de transição'],
64:['Geografia','Brasília: integração territorial e projeto de desenvolvimento nacional'],
65:['História','Europa medieval: catedrais, sociedade e economia agrária'],
66:['Geografia','Industrialização: carvão mineral, fábricas e urbanização'],
67:['História','Colonização das Américas: etnocentrismo no debate de Sepúlveda e Las Casas'],
68:['Sociologia','Indústria cultural: Woodstock e mercantilização da arte'],
69:['Sociologia','Direito à moradia: desigualdade e população em situação de rua'],
70:['Geografia','Geotecnologias: GPS, localização e serviços digitais'],
71:['Filosofia','Ubuntu: interdependência e ética comunitária'],
72:['Filosofia','Filosofia da linguagem: limites da representação e experiência subjetiva'],
73:['Geografia','Mudanças climáticas no Ártico: rotas comerciais e geopolítica'],
74:['Sociologia','Movimentos sociais: normas, conflitos e relações de poder'],
75:['Geografia','Terras indígenas: análise cartográfica e fiscalização do desmatamento'],
76:['Sociologia','Tranças afro-brasileiras: trabalho, ancestralidade e identidade'],
77:['História','Escravidão, capitalismo e formação histórica do racismo estrutural'],
78:['Filosofia','Escola de Frankfurt: razão instrumental e crítica da barbárie'],
79:['Geografia','Migrações internacionais: governança e políticas migratórias'],
80:['Geografia','Estrutura fundiária brasileira: latifúndio e modernização agrícola'],
81:['Geografia','Soberania e território: reconhecimento político de Sealand'],
82:['Sociologia','Liberdade artística, participação política e inclusão de minorias'],
83:['Geografia','Pegada ecológica: consumo de recursos e sobrecarga da Terra'],
84:['Sociologia','Mídia e construção social da percepção da realidade'],
85:['História','República brasileira na virada do século XIX para o XX: contexto e disputas'],
86:['Geografia','Cartografia: escala e comparação de áreas de desmatamento'],
87:['Geografia','Agropecuária brasileira: intensificação e sustentabilidade'],
88:['Sociologia','Corpo, padrões estéticos e sociedade de consumo'],
88:['Geografia','Agropecuária brasileira: intensificação e sustentabilidade'],
89:['Sociologia','Corpo, padrões estéticos e sociedade de consumo'],
90:['Biologia','Conservação da agrobiodiversidade: bancos de sementes e adaptação']
}

Object.assign(temas,{
14:['Literatura','Poesia brasileira: Ferreira Gullar, contexto histórico e construção de esperança'],
15:['Literatura','Gênero crônica: metalinguagem e processo de escrita'],
16:['Língua Portuguesa','Inteligência artificial e educação: leitura de notícia e debate público'],
17:['Literatura','Narrativa e ironia: expectativa do leitor e comportamento social'],
18:['Língua Portuguesa','Gênero epistolar: interlocução e uso do vocativo'],
19:['Língua Portuguesa','Tecnologia e sociedade: privacidade, vigilância e autonomia de adolescentes'],
20:['Literatura','Canção brasileira: oralidade, coloquialidade e construção de sentido'],
21:['Literatura','Conto brasileiro: descrição de espaço e construção de atmosfera'],
22:['Língua Portuguesa','Gênero argumentativo: tese, evidências e persuasão sobre licença-paternidade'],
23:['Literatura','Narrativa contemporânea: caracterização de personagem e conflito'],
24:['Literatura','Conto de Clarice Lispector: memória, morte e construção da subjetividade'],
25:['Literatura','Narrativa contemporânea: conflito e caracterização de personagem'],
26:['Literatura','Poesia modernista: repetição, enumeração e construção de contraste'],
27:['Literatura','Poesia contemporânea: intertextualidade e metalinguagem'],
28:['Língua Portuguesa','Funções da linguagem: apelo ao interlocutor em anúncio publicitário'],
29:['Literatura','Crônica urbana: metáfora e representação do espaço social'],
30:['Educação Física','Atividade física, saúde e condicionantes sociais'],
31:['Literatura','Romantismo brasileiro: Lucíola e representação da sociedade urbana'],
32:['Língua Portuguesa','Campanha de conscientização: multimodalidade e respeito à neurodiversidade'],
33:['Literatura','Literatura regional: linguagem epistolar e identidade goiana'],
34:['Literatura','Canção brasileira: oralidade, repetição e rotina no cotidiano'],
35:['Educação Física','Esporte, gênero e preconceito: participação feminina no rúgbi'],
36:['Língua Portuguesa','Variação linguística: jargão corporativo e comunicação no trabalho'],
37:['Artes','Fotografia e sociedade: representação do trabalho e desemprego'],
38:['Língua Portuguesa','Leitura crítica de notícia: adequação linguística e confiabilidade'],
39:['Literatura','Memórias literárias: descrição e caracterização de personagem'],
40:['Língua Portuguesa','Linguagem visual: padrões de beleza, estereótipos e visibilidade'],
41:['Língua Portuguesa','Gêneros digitais: características e usos do podcast'],
42:['Língua Portuguesa','Divulgação científica e cidadania: clareza na leitura de bulas'],
43:['Língua Portuguesa','Lexicografia: acepções, verbetes e polissemia'],
44:['Língua Portuguesa','Tecnologia e educação: usos e implicações de inteligência artificial'],
45:['Matemática','Leitura de infográfico: comparação de dados sobre participação no skate'],
46:['História','Abolição da escravidão: mobilização social e atuação de Dragão do Mar'],
47:['Sociologia','Trabalho e tecnologia: automação, capitalismo e relações de produção'],
48:['História','Povoamento da Europa: evidências genéticas e diversidade populacional'],
49:['História','Roma antiga e recepção do legado clássico na cultura política'],
50:['História','Movimento dos direitos civis nos Estados Unidos: Rosa Parks e resistência'],
51:['Sociologia','Justiça ambiental: movimentos sociais e gestão comunitária'],
52:['Filosofia','Nietzsche: eterno retorno e avaliação das escolhas de vida'],
53:['História','Quilombos: estratégias de sobrevivência e organização econômica'],
54:['Filosofia','Albert Camus: absurdo e condição humana'],
55:['Geografia','Migração internacional: Brexit, trabalho e circulação de pessoas'],
56:['História','Memória social e patrimônio: Museu da Maré'],
57:['Filosofia','Empirismo e indução: problema da generalização científica'],
58:['Geografia','Caatinga: uso comunitário da terra e relação sociedade-natureza'],
59:['História','Cidadania na Antiguidade: pertencimento e exclusão social'],
60:['História','Religiosidade popular: Círio de Nazaré e continuidade cultural'],
61:['Geografia','Fronteira agrícola do Matopiba: expansão e produção de commodities'],
62:['História','Era Vargas: industrialização e Companhia Siderúrgica Nacional'],
63:['História','Ditadura chilena: memória, responsabilização e justiça de transição'],
64:['Geografia','Brasília: integração territorial e projeto de desenvolvimento nacional'],
65:['História','Europa medieval: catedrais, sociedade e economia agrária'],
66:['Geografia','Industrialização: carvão mineral, fábricas e urbanização'],
67:['História','Colonização das Américas: etnocentrismo no debate de Sepúlveda e Las Casas'],
68:['Sociologia','Indústria cultural: Woodstock e mercantilização da arte'],
69:['Sociologia','Direito à moradia: desigualdade e população em situação de rua'],
70:['Geografia','Geotecnologias: GPS, localização e serviços digitais'],
71:['Filosofia','Ubuntu: interdependência e ética comunitária'],
72:['Filosofia','Filosofia da linguagem: limites da representação e experiência subjetiva'],
73:['Geografia','Mudanças climáticas no Ártico: rotas comerciais e geopolítica'],
74:['Sociologia','Movimentos sociais: normas, conflitos e relações de poder'],
75:['Geografia','Terras indígenas: análise cartográfica e fiscalização do desmatamento'],
76:['Sociologia','Tranças afro-brasileiras: trabalho, ancestralidade e identidade'],
77:['História','Escravidão, capitalismo e formação histórica do racismo estrutural'],
78:['Filosofia','Escola de Frankfurt: razão instrumental e crítica da barbárie'],
79:['Geografia','Migrações internacionais: governança e políticas migratórias'],
80:['Geografia','Estrutura fundiária brasileira: latifúndio e modernização agrícola'],
81:['Geografia','Soberania e território: reconhecimento político de Sealand'],
82:['Sociologia','Liberdade artística, participação política e inclusão de minorias'],
83:['Geografia','Pegada ecológica: consumo de recursos e sobrecarga da Terra'],
84:['Sociologia','Mídia e construção social da percepção da realidade'],
86:['História','República brasileira na virada do século XIX para o XX: contexto e disputas'],
87:['Geografia','Cartografia: escala e comparação de áreas de desmatamento'],
88:['Geografia','Agropecuária brasileira: intensificação e sustentabilidade'],
89:['Sociologia','Corpo, padrões estéticos e sociedade de consumo'],
90:['Biologia','Conservação da agrobiodiversidade: bancos de sementes e adaptação']
})

// Chaves oficiais do caderno 9; q. 17 e 24 aparecem sem alternativa no gabarito oficial (anuladas).
const chave={1:'D',2:'A',3:'B',4:'C',5:'D',6:'C',7:'B',8:'C',9:'A',10:'A',11:'C',12:'C',13:'D',14:'B',15:'A',16:'C',18:'A',19:'E',20:'E',21:'A',22:'C',23:'E',25:'B',26:'D',27:'E',28:'A',29:'E',30:'E',31:'D',32:'A',33:'E',34:'A',35:'D',36:'D',37:'B',38:'C',39:'D',40:'D',41:'A',42:'E',43:'D',44:'E',45:'C',46:'B',47:'D',48:'A',49:'D',50:'B',51:'C',52:'B',53:'E',54:'A',55:'A',56:'E',57:'C',58:'C',59:'B',60:'E',61:'B',62:'E',63:'D',64:'B',65:'C',66:'E',67:'C',68:'D',69:'C',70:'D',71:'E',72:'D',73:'B',74:'A',75:'C',76:'D',77:'A',78:'D',79:'B',80:'A',81:'E',82:'A',83:'E',84:'A',85:'C',86:'A',87:'C',88:'E',89:'B',90:'D'}
const anuladas=new Set([17,24])
const oficialKeys=`EN:1D,2A,3B,4C,5D; ES:1C,2A,3D,4D,5C; PT:${Object.entries(chave).map(([n,a])=>`${n}${a}`).join(',')}`
const checksum=createHash('sha256').update(oficialKeys).digest('hex')
const letras=['A','B','C','D','E']
const espanholIds=new Set(['extr-746ae4f74f703f09beed','extr-d19848602415b09a9a51','extr-b08717e841880f642b4a','extr-143f2519b224eb2f1141'])
const idioma=(q)=>Number(q.numero)<=5?(espanholIds.has(q.id)?'espanhol':'inglês'):'português'
const dificuldadeAlta=new Set([3,7,8,13,17,21,26,28,30,33,35,38,42,46,47,51,53,56,57,60,62,63,64,66,71,72,74,76,77,78,79,80,82,85,86,87,89,90])

if(qs.length!==82)throw Error(`Esperados 82 registros; recebidos ${qs.length}`)
const decisoes=qs.map(q=>{
 let n=Number(q.numero_original??q.numero)
 if(q.id==='extr-653e23137cd6b3c2b5b6')n=43
 // O extrator atribuiu o número 5 ao verbete de dicionário da questão 43.
 const tema=temas[n]
 if(!tema)throw Error(`Sem classificação para ${q.id}, questão ${n}`)
 const variante=idioma(q)
 let materia=tema[0],conteudo=tema[1]
 if(n<=5&&variante!=='português'){
   materia=variante==='inglês'?'Língua Inglesa':'Língua Espanhola'
   conteudo=variante==='inglês'?temas[n][1]:({1:'Direitos linguísticos e diversidade cultural indígena',2:'Interpretação de poema: migração, identidade e voz poética',4:'Interpretação de poema: memória cultural e identidade aimará',5:'Interpretação de notícia: língua e identidade cultural quéchua'})[n]
 }
 const pagina=Number(q.pagina),visual={pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original do caderno oficial conferida visualmente; preservada para consulta do texto, imagens e elementos gráficos.'}
 const anulada=anuladas.has(n)
 const answer=n<=5&&variante==='espanhol'?({1:'C',2:'A',3:'D',4:'D',5:'C'})[n]:chave[n]
 if(!anulada&&!answer)throw Error(`Sem gabarito para ${q.id} item ${n}`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,concurso:'ENEM 2024 — Reaplicação PPL — 1º dia — Caderno 9 Laranja (Braille e ledor)',numero_original:n,pagina,dificuldade:dificuldadeAlta.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo número de etapas interpretativas e conceitos necessários; não é estatística oficial de acerto.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo específico e pelo comando, com conferência da página ${pagina} do caderno oficial. Variante linguística identificada como ${variante}.`,visual}
 if(anulada){d.anulada=true;d.resposta_correta=null;d.gabarito_oficial={fonte:gabarito,sha256:checksum,sha256_tipo:'transcricao-canonica-do-gabarito-oficial',numero:n,pagina:1,resposta:null,criterio:'O gabarito oficial do INEP deixa o campo do item em branco; questão anulada, sem correção automática.'}}
 else {d.resposta_correta=letras.indexOf(answer);d.gabarito_oficial={fonte:gabarito,sha256:checksum,sha256_tipo:'transcricao-canonica-do-gabarito-oficial',numero:n,pagina:1,resposta:answer,criterio:`Gabarito oficial do INEP, caderno 9; ${n<=5?`variante ${variante}`:'questão objetiva'}.`}}
 if(n!==Number(q.numero_original??q.numero))d.numero_original=n
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'ENEM 2024 — Reaplicação PPL — 1º dia — Caderno 9 Laranja — Braille e ledor',documento_id:doc,registros_revisados:decisoes.length,questoes_unicas_classificadas:decisoes.length,questoes_anuladas:[17,24],variantes_linguisticas:'Questões 1–5 em inglês e espanhol mantidas como aplicações distintas conforme o caderno; não deduplicadas.',numero_corrigido:[{id:'extr-653e23137cd6b3c2b5b6',de:5,para:43}],gabarito:'Vinculado ao PDF oficial do INEP; itens 17 e 24 sem chave oficial e anulados.',paginas_origem_conferidas:decisoes.length,fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
