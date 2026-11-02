import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-inoversasul-2024-geografia-cargo16-itens41-100-v386',doc='019f74c90acb03f3'
const prova='https://cdn.cebraspe.org.br/concursos/inoversasul_24/arquivos/033_INOVERSASUL_016_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/inoversasul_24/arquivos/GAB_DEFINITIVO_033_INOVERSASUL_016_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const keyRows=[
 [41,'C E C C C E C E C C E E E C E E E C C C'],
 [61,'E E C C C E E C C C C C E C C C C E E E'],
 [81,'C E C E C E C E E C C C C E C E C C E C']
]
const answers=new Map()
for(const [start,row] of keyRows){const vals=row.split(/\s+/);if(vals.length!==20)throw Error(`Linha inválida no gabarito definitivo, item ${start}`);vals.forEach((v,i)=>answers.set(start+i,v))}
const classifications={
41:['Geografia','Pensamento geográfico: geografia radical e análise socioespacial'],
42:['Geografia','Correntes do pensamento geográfico: geografia humanística e neopositivismo'],
43:['Geografia','Correntes do pensamento geográfico: determinismo de Friedrich Ratzel'],
44:['Geografia','Correntes do pensamento geográfico: possibilismo de Vidal de La Blache'],
45:['Geografia','Categorias geográficas: território e relações de poder'],
46:['Geografia','Espaço geográfico: relações sociedade-natureza na geografia renovada'],
47:['Geografia','Ensino de Geografia: interpretação da realidade e abordagem interdisciplinar'],
48:['Geografia','Ensino de Geografia: tecnologias e recursos didáticos'],
49:['Geografia','Ensino de Geografia: contextualização e construção do conhecimento geográfico'],
50:['Geografia','Geografia ambiental: economia mundial e negociações sobre mudanças climáticas'],
51:['Geografia','Mudanças climáticas: emissões de gases de efeito estufa na geração de eletricidade e calor'],
52:['Geografia','Globalização e geopolítica: blocos econômicos e centros de influência'],
53:['Geografia','Globalização: nacionalismos, identidade cultural e fragmentação territorial'],
54:['Geografia','Geopolítica mundial: multipolaridade e centros de poder'],
55:['Geografia','Geopolítica e economia mundial: NAFTA e integração econômica da América do Norte'],
56:['Geografia','Geografia da população: população absoluta e desenvolvimento econômico'],
57:['Geografia','Teorias demográficas: Malthus e a relação entre população e recursos'],
58:['Geografia','Teorias demográficas: teoria reformista e distribuição de renda'],
59:['Geografia','Dinâmica demográfica: crescimento vegetativo e saldo migratório'],
60:['Geografia','Teorias demográficas: crescimento geométrico da população e aritmético dos recursos'],
62:['Geografia','Regionalização brasileira: complexo Centro-Sul e concentração econômica'],
63:['Geografia','Regionalização brasileira: regiões geoeconômicas de Pedro Pinchas Geiger'],
64:['Geografia','Regionalização brasileira: limites do complexo geoeconômico Nordeste'],
66:['Geografia','Cartografia: meridianos, longitude e antimeridiano'],
67:['Geografia','Cartografia: coordenadas geográficas e localização sobre o Equador'],
68:['Geografia','Cartografia temática: representação e análise de fenômenos espaciais'],
69:['Geografia','Geotecnologias: sistemas de informação geográfica, satélites e drones'],
71:['Geografia','Geografia da população: estrutura etária e população economicamente ativa'],
72:['Geografia','Geografia da população: pirâmide etária e transição da natalidade'],
73:['Geografia','Migrações internas: fluxos inter-regionais no Brasil nos anos 2000'],
74:['Geografia','Migrações internas: fluxos populacionais brasileiros nas décadas de 1980 e 1990'],
75:['Geografia','Geografia agrária: sistemas integrados de produção agropecuária e conservação do solo'],
76:['Geografia','Geografia agrária: diferenciação entre campo e cidade e desenvolvimento capitalista'],
77:['Geografia','Geografia agrária e urbana: divisão social do trabalho entre campo e cidade'],
78:['Geografia','Geografia urbana: poluição atmosférica, uso do solo e urbanização'],
79:['Geografia','Geografia urbana: impermeabilização do solo, drenagem e riscos de inundação'],
80:['Geografia','Geografia agrária: monopolização do território e relações capitalistas de produção'],
81:['Geografia','Geografia agrária: territorialização dos monopólios e cadeia agroindustrial'],
82:['Geografia','Pedologia: lençol freático, evaporação e salinização dos solos'],
84:['Geografia','Geopolítica: ordem multilateral do pós-Segunda Guerra e atuação do Brasil'],
85:['Geografia','Geopolítica brasileira: abertura econômica, MERCOSUL e BRICS'],
86:['Geografia','Geopolítica contemporânea: conflito Israel-Palestina e Oriente Médio'],
87:['Geografia','Geopolítica contemporânea: guerra civil síria e deslocamentos de refugiados'],
88:['Geografia','Geopolítica contemporânea: guerra russo-ucraniana e conflitos europeus'],
89:['Geografia','Geografia ambiental: relações dialéticas entre sociedade e natureza'],
90:['Geografia','Educação ambiental: práxis educativa, valores e conservação da diversidade'],
91:['Geografia','Educação ambiental: cidadania, justiça social, ética e diálogo intercultural'],
92:['Geografia','Geopolítica europeia: integração regional e desafios econômicos da União Europeia'],
93:['Geografia','Geopolítica europeia: nacionalismo, euroceticismo e coesão da União Europeia'],
95:['Geografia','Biogeografia: biodiversidade e composição do bioma Amazônia'],
96:['Geografia','Amazônia: floresta em pé, ciclo hidrológico e regulação climática'],
97:['Geografia','Amazônia: desmatamento, uso do solo e exploração de recursos naturais'],
98:['Geografia','Biomas brasileiros: expansão agropecuária e degradação ambiental'],
99:['Geografia','Conservação ambiental: unidades de conservação e usos permitidos'],
100:['Geografia','Conservação ambiental: reservas extrativistas e populações tradicionais']
}
const cleanStems={
72:'A pirâmide etária em questão apresenta um afunilamento na base, característico de uma população com taxas de natalidade em declínio.',
91:'A educação ambiental deve pautar-se pelo diálogo entre gerações e culturas, buscando a cidadania, a liberdade, a justiça social e a ética nas relações que envolvem sociedade e meio ambiente.'
}
const graph='Gráfico de pirâmide etária da população residente no Brasil, por sexo e faixas de idade (2010 e 2022): homens à esquerda, mulheres à direita; idades no eixo vertical e população residente em percentual no eixo horizontal.'
const mismatches=records.filter(q=>q.resposta!=null&&answers.has(Number(q.numero))&&q.resposta!==(answers.get(Number(q.numero))==='C'?0:1))
if(mismatches.length)throw Error(`Respostas existentes divergem do gabarito definitivo nos itens: ${mismatches.map(q=>`${q.numero}=${q.resposta}/${answers.get(Number(q.numero))}`).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),c=classifications[n],answer=answers.get(n)
 if(!c||!answer)throw Error(`Item sem classificação ou sem gabarito definitivo: ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
 const visual=[71,72].includes(n)?{pagina:2,imagem:`paginas/${doc}-0002.webp`,texto_apoio:graph,motivo:'Imagem conferida na página original: a pirâmide etária do IBGE (2010 e 2022) é necessária à interpretação dos itens 71 e 72.'}:undefined
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:c[0],conteudo:c[1],ano:2025,concurso:'Fundação InoversaSul 2024 — Professor de Geografia — Anos Finais — Cargo 16',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 05/01/2025',cargo:'Professor de Geografia — Anos Finais — Cargo 16',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[42,48,51,55,57,58,60,63,66,67,70,71,72,74,78,79,82,86,88,92,94,96].includes(n)?'Difícil':[41,45,47,49,54,56,58,62,68,69,73,75,77,80,90,95,97,98,100].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme a exigência conceitual e de interpretação geográfica do item; não representa classificação publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno específico de Geografia, Cargo 16; conteúdo identificado pela afirmação e pelo bloco temático indicado no caderno.`,resposta_correta:answer==='C'?0:1,anulada:false,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_033_INOVERSASUL_016_01.PDF',prova:'033_INOVERSASUL_016_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo específico do caderno 033_INOVERSASUL_016_01, Cargo 16 — Professor de Geografia.'},...(cleanStems[n]?{enunciado:cleanStems[n]}:{}),...(visual?{visual}:{})}
})
if(decisions.length!==55)throw Error(`Esperados 55 registros pendentes; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,questoesUnicas:[...new Set(decisions.map(x=>x.numero))].length,imagemGrafico:decisions.filter(x=>x.visual).map(x=>x.numero),enunciadosLimpos:Object.keys(cleanStems),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — Fundação InoversaSul 2024 — Professor de Geografia — Anos Finais — Cargo 16',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,imagem_grafico:Boolean(d.visual),enunciado_corrigido:Boolean(d.enunciado)})),prova,gabarito,publicado:false,nota:'55 registros pendentes revisados com matéria, conteúdo, ano da aplicação, concurso, cargo, dificuldade estimada e gabarito definitivo do mesmo caderno. O gráfico original da pirâmide etária foi conferido visualmente e associado aos itens 71 e 72; enunciados de OCR que incorporavam o comando do bloco seguinte foram limpos.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — Fundação InoversaSul 2024 — Professor de Geografia, Cargo 16 — revisão v386\n\n- 55 registros pendentes classificados individualmente por matéria e conteúdo, com identificação da aplicação (05/01/2025) e dificuldade estimada.\n- Gabarito definitivo do mesmo caderno vinculado aos itens classificados.\n- O gráfico da pirâmide etária brasileira (IBGE, 2010 e 2022) foi conferido na página original e mantido associado aos itens 71 e 72; os enunciados 72 e 91 foram separados dos comandos subsequentes que haviam sido unidos pelo OCR.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
