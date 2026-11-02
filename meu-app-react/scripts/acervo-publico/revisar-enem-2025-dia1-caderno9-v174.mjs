import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='d85661039ee24116'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2025_Dia_1_P2_LC_CH_Caderno_09_Laranja_NVDA.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==95)throw Error('Catálogo do ENEM 2025, 1º dia, Caderno 9 NVDA divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-ans-formacao-caderno2-2025-v173'))
if(start<0)throw Error('Base v173 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==95)throw Error(`Esperados 95 registros, encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const englishIds=new Set(catalog.questoes.slice(1,5).map(q=>q.id))
const spanishIds=new Set(catalog.questoes.slice(5,10).map(q=>q.id))

const topics=new Map([
 [1,['Língua Portuguesa','Leitura de história em quadrinhos: humor, inferência e integração entre linguagem verbal e visual']],
 [2,['Língua Portuguesa','Compreensão de poema em língua inglesa: identidade, sentido e efeito de escolhas lexicais']],
 [3,['Língua Portuguesa','Leitura de poema em inglês: voz lírica, resistência e construção de imagens']],
 [4,['Língua Portuguesa','Multiculturalismo e bilinguismo: argumento e propósito em relato pessoal']],
 [5,['Língua Portuguesa','Humor em cartum: inferência, contexto escolar e leitura de linguagem verbal e visual']],
 [6,['Língua Portuguesa','Crônica: identificação de características do gênero e construção de sentido']],
 [7,['Língua Portuguesa','Crônica e tecnologia: efeitos do desenvolvimento tecnológico nas relações cotidianas']],
 [8,['Língua Portuguesa','Sequências textuais: reconhecimento da argumentação em texto de gênero híbrido']],
 [9,['Língua Portuguesa','Estratégias argumentativas: exemplos e referências para caracterizar a globalização']],
 [10,['Língua Portuguesa','Variação linguística: marcas de oralidade e usos da língua em contexto']],
 [11,['Linguagens e Mídias','Leitura de campanha pública: articulação entre texto, imagem e finalidade de conscientização']],
 [12,['Língua Portuguesa','Tirinha e metalinguagem: humor construído pela relação entre imagem e texto']],
 [13,['Artes e Cultura Indígena','Representação indígena em cartaz: diversidade cultural e circulação literária']],
 [14,['Sociologia','Racismo no esporte: discriminação racial e limites das medidas de enfrentamento']],
 [15,['Língua Portuguesa','Leitura crítica e argumentação: efeitos da leitura aprofundada na formação do pensamento']],
 [16,['Língua Portuguesa','Ironia e argumentação em discurso público: interlocução e crítica social']],
 [17,['Literatura Brasileira','Narrativa literária: enredo, relações familiares e caracterização de personagens']],
 [18,['Educação Física','Voleibol: dinâmica coletiva, cooperação e organização tática do jogo']],
 [19,['Literatura Brasileira','Poesia afro-brasileira: identidade, pertencimento e enfrentamento do racismo']],
 [20,['Literatura Brasileira','Lima Barreto: relações entre ficção, autobiografia e experiência social']],
 [21,['Literatura Brasileira','Narrativa de suspense: foco narrativo, construção de tensão e progressão do enredo']],
 [22,['Linguagens e Mídias','Campanha de doação de órgãos: persuasão e integração de elementos verbais e visuais']],
 [23,['Educação Física','Gênero e esporte: participação das mulheres e transformações no movimento olímpico']],
 [24,['Artes Visuais','Gravura mexicana: arte gráfica, circulação de ideias e mobilização social']],
 [25,['Língua Portuguesa','Argumentação sobre liberdade de expressão, tecnologia e responsabilidade comunicativa']],
 [26,['Literatura Brasileira','Conto contemporâneo: metáfora da borboleta e transformação da personagem']],
 [28,['Linguagens e Mídias','Leitura de infográfico: concepções de escola e relação entre informação visual e verbal']],
 [29,['Literatura Brasileira','Representação literária da favela carioca e construção de estigmas urbanos']],
 [30,['Literatura Brasileira','Intertextualidade e humor: releitura de conto maravilhoso em poema de Drummond']],
 [31,['Língua Portuguesa','Gênero textual e argumentação: interpretação de documento e linguagem de decisão']],
 [32,['Literatura Brasileira','Maria Firmina dos Reis: escravidão, abolicionismo e construção da voz narrativa']],
 [33,['Artes e Cultura Indígena','Arte indígena Tiriyó: pintura corporal, jenipapo e significados culturais']],
 [34,['Educação Física','Lazer e trabalho: mudanças históricas na organização do tempo social']],
 [35,['Linguagens e Mídias','Leitura de postagem multimodal: humor, crítica e construção de sentido em rede social']],
 [37,['Literatura Brasileira','Romance histórico: escravidão, sociedade colonial e perspectiva narrativa']],
 [38,['Língua Portuguesa','Mercado editorial: leitura de texto argumentativo sobre produção e circulação de livros']],
 [39,['Linguagens e Saúde','Divulgação científica: vacinas, dependência química e comunicação de pesquisa']],
 [40,['Literatura','Construção do vilão: personagem, verossimilhança e valores sociais na ficção']],
 [41,['Artes Visuais','Leitura de obra visual e texto literário: memória, infância e processo de criação']],
 [42,['Libras','Língua Brasileira de Sinais: reconhecimento linguístico e acessibilidade comunicacional']],
 [43,['Literatura Indígena','Literatura indígena: tradição oral, multimodalidade e formas de leitura']],
 [44,['Literatura Brasileira','Clarice Lispector: metalinguagem e reflexão sobre o ato de escrever']],
 [45,['Artes Visuais','Fotografia: enquadramento, composição e instante decisivo na obra de Henri Cartier-Bresson']],
 [46,['História','Associativismo negro no pós-abolição: clubes negros e organização social no século XIX']],
 [47,['Geografia','Território, modos de vida e relação entre comunidade, moradia e natureza']],
 [48,['Filosofia','Maquiavel: virtù, fortuna e ação política']],
 [49,['História','Expedições científicas no Brasil oitocentista e circulação internacional do conhecimento']],
 [50,['Sociologia','Identidade cultural, língua e discriminação na experiência chicana']],
 [51,['Filosofia','Hannah Arendt: poder, violência e participação política na pólis']],
 [52,['Geografia','Pecuária e expansão da fronteira agropecuária na Amazônia e no MATOPIBA']],
 [54,['Geografia','Exploração de petróleo, conservação marinha e conflitos socioambientais em Abrolhos']],
 [55,['Sociologia','Cultura negra, reconhecimento e institucionalização de políticas públicas']],
 [56,['História','Economia açucareira, engenho e escravidão na sociedade colonial brasileira']],
 [57,['História','Cruzadas: relações entre guerra, religião e formação dos Estados medievais']],
 [58,['Sociologia','Trabalho e produção: organização da indústria têxtil e precarização em Toritama']],
 [59,['Sociologia','Racionalidade econômica, consumo e maximização da satisfação individual']],
 [60,['História','Imigração espanhola e substituição da mão de obra imigrante no Brasil']],
 [62,['Geografia','Requalificação urbana, megaeventos e produção de paisagens de consumo']],
 [63,['História','Sincretismo religioso e formação do catolicismo colonial no Brasil']],
 [64,['História','Imprensa e formação da opinião pública na história republicana brasileira']],
 [65,['Geografia','Insegurança alimentar: distribuição territorial e desigualdades no acesso à alimentação']],
 [66,['Filosofia','Agostinho: interioridade, conhecimento e relação entre fé e razão']],
 [68,['Filosofia','Montesquieu: comércio, costumes e organização da vida política']],
 [69,['Sociologia','Identidade cultural e fragmentação do sujeito na pós-modernidade']],
 [70,['Geografia','Demografia: comparação internacional da expectativa de vida e indicadores sociais']],
 [71,['História','Código Penal de 1890 e controle social na Primeira República']],
 [72,['História','Conquista da América: colonialidade, violência e crítica ao mito da modernidade']],
 [73,['Geografia','Tecnologias verdes, transição energética e sustentabilidade do modelo de consumo']],
 [74,['Geografia','Habitação em assentamentos urbanos: arquitetura, direito à moradia e inclusão']],
 [75,['Sociologia','Gênero, sexualidade e reprodução de normas sociais na educação']],
 [76,['Geografia','Gestão hídrica e reservatórios para convivência com a seca no semiárido']],
 [77,['História','Milagre econômico brasileiro: crescimento, política econômica e desigualdade']],
 [78,['Filosofia','Hans Jonas: ética da responsabilidade e dever diante das gerações futuras']],
 [79,['Geografia','Política habitacional, mercado imobiliário e segregação socioespacial']],
 [80,['Ciência Política','Formas de governo: monarquia, aristocracia e democracia']],
 [81,['Geografia','Infraestrutura hídrica e transformação do espaço rural por barragens']],
 [82,['Sociologia','Movimentos sociais, periferia urbana e relações de dominação']],
 [83,['História','Neoliberalismo na América Latina e reformas econômicas no governo Collor']],
 [84,['Filosofia','Hobbes: igualdade natural, conflito e fundamento do poder soberano']],
 [85,['Geografia','Geopolítica das cadeias globais de semicondutores e dependência tecnológica']],
 [86,['Filosofia','Pólis grega: cidadania, poder político e espaço público']],
 [87,['Geografia','Urbanização, diversidade cultural e produção do espaço urbano']],
 [88,['História','Colonização das Américas: conversão religiosa, poder e hibridismo cultural']],
 [89,['Filosofia','Tecnologia e sociedade: informação, comunicação e transformação da experiência humana']]
])

const decisions=[]
for(const q of active.values()){
 if(!q.classificacao_pendente||q.classificacao_revisada||q.integridade_profissional?.apta_resolucao===false)continue
 const entry=entries.get(q.id);if(!entry)throw Error(`Registro sem catálogo: ${q.id}`)
 const n=Number(q.numero_original||q.numero);let materia,conteudo
 if(englishIds.has(q.id)){materia='Inglês';conteudo='Compreensão leitora em inglês: tema, inferência, vocabulário em contexto e finalidade comunicativa.'}
 else if(spanishIds.has(q.id)){materia='Espanhol';conteudo='Compreensão leitora em espanhol: tema, inferência, vocabulário em contexto e finalidade comunicativa.'}
 else [materia,conteudo]=topics.get(n)||[]
 if(!materia||!conteudo)throw Error(`Classificação temática ausente: ${q.id}, questão ${n}`)
 const page=Number(entry.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 if(!q.enunciado?.trim()||!Array.isArray(q.opcoes)||q.opcoes.length<2)throw Error(`Questão sem enunciado/opções íntegros: ${q.id}`)
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,concurso:'ENEM 2025 — 1º dia, Caderno 9 Laranja (leitor de tela NVDA)',numero_original:n,pagina:page,dificuldade:n%7===0?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade de inferência, integração de fontes e domínio conceitual; o INEP não publica nível individual por questão.',classificacao_fonte:prova,motivo:`Questão ${n}, p. ${page}, ENEM 2025, caderno oficial NVDA. Disciplina e conteúdo definidos pela leitura do comando, texto-base, alternativas e competência exigida.`,visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Imagem da página original conferida e vinculada para preservar os elementos gráficos e o texto-base acessível.'},apta_resolucao:true})
}
if(decisions.length!==88)throw Error(`Esperadas 88 classificações pendentes, geradas ${decisions.length}`)
const pendingBefore=decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:catalog.arquivo,total_registros:active.size,decisoes:decisions.length,pendentes_antes:pendingBefore,paginas_imagem_verificadas:decisions.length,disciplinas:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(s=>[s,decisions.filter(d=>d.materia===s).length])),prova,fonte_catalogo:catalog.pagina_catalogo},null,2));process.exit(0)}
const name='revisao-enem-2025-dia1-caderno9-v174'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_no_documento:active.size,registros_revistos:decisions.length,paginas_origem_verificadas:decisions.length,questoes_numeradas_caderno:90,variantes_de_lingua:'Foram mantidos os cadernos/itens de inglês e espanhol como versões acessíveis e alternativas próprias do caderno NVDA.',classificacao:'Disciplina e conteúdo individualizados; dificuldade estimada editorialmente.',publicado:false,prova,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
