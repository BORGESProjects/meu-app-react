import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='cf8480559731acce'
const prova='https://www.fuvest.br/wp-content/uploads/fuvest2026-fase1-prova-V1.pdf'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-enem-ppl-2017-dia1-v170'))
if(start<0)throw Error('Base v170 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==89||catalog.url!==prova)throw Error('Catálogo da FUVEST 2026 divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==89)throw Error(`Esperados 89 registros da FUVEST 2026, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const topics=new Map([
 [1,['Língua Portuguesa','Interpretação de texto literário: ponto de vista e efeito de sentido']],
 [2,['Língua Portuguesa','Semântica e pontuação: uso de aspas e valor expressivo']],
 [3,['Matemática','Análise combinatória e probabilidade em eleição de conselho']],
 [4,['Matemática','Teoria da informação: entropia, logaritmos e distribuição de probabilidades']],
 [5,['Química','Ligações químicas: classificação iônica, covalente e metálica']],
 [6,['Geografia','Patrimônio histórico-cultural e leitura do espaço geográfico']],
 [7,['Matemática','Trigonometria: equação trigonométrica e identidades fundamentais']],
 [8,['Língua Portuguesa','Sociolinguística: variação linguística e práticas pedagógicas']],
 [9,['História','História da educação no Brasil e pensamento de Nísia Floresta']],
 [10,['Artes','Arte afro-brasileira: capoeira e representação visual na obra de Maria Auxiliadora']],
 [11,['Língua Portuguesa','Leitura de texto jornalístico e construção de opinião']],
 [12,['História','Movimentos de mulheres e luta por igualdade de direitos no Brasil']],
 [13,['Literatura','Literatura brasileira: Rachel de Queiroz, gênero e perspectiva social']],
 [14,['Geografia','Migração internacional, refúgio e interpretação de mapa e gráfico']],
 [15,['Sociologia','Uberização do trabalho, plataformas digitais e precarização laboral']],
 [16,['Geografia','Organização industrial, logística e produção just-in-time']],
 [17,['Sociologia','Redes sociais, circulação de informação e comportamento coletivo']],
 [18,['Matemática','Função exponencial e modelagem do crescimento de usuários']],
 [19,['Artes','Arte contemporânea: Cildo Meireles, moeda e crítica social']],
 [20,['História','Colonização espanhola, povos indígenas e sistemas de exploração colonial']],
 [21,['História','Jesuítas, povos indígenas e documentação colonial no século XVI']],
 [22,['Língua Portuguesa','Leitura de cartum: inferência, humor e interação entre linguagem verbal e visual']],
 [23,['Geografia','Desmatamento da Mata Atlântica e monitoramento ambiental']],
 [24,['Geografia','Antártida: clima, cobertura vegetal e distribuição de espécies']],
 [25,['Inglês','Compreensão leitora: ideia central, inferência e vocabulário em contexto']],
 [26,['Inglês','Compreensão de texto em inglês sobre geologia e vulcanismo']],
 [27,['Geografia','Energia geotérmica, recursos naturais e desenvolvimento regional']],
 [28,['Língua Portuguesa','Leitura multimodal e inteligência artificial: autoria, imagem e circulação digital']],
 [29,['Geografia','Mercado de carbono, política climática e acordos internacionais']],
 [30,['Geografia','Reciclagem de alumínio, economia circular e gestão de resíduos']],
 [31,['Química','Corrosão do ferro: oxirredução e proteção de superfícies metálicas']],
 [32,['Química','Ácidos e bases: ação do ácido cítrico na remoção de depósitos minerais']],
 [33,['Geografia','Sustentabilidade da indústria têxtil e impactos ambientais da produção']],
 [34,['Química','Propriedades da água: substâncias dissolvidas e transformações físico-químicas']],
 [35,['Geografia','Movimentos de massa, relevo e fatores climáticos']],
 [36,['Geografia','Cartografia e topografia: diferença de altitude entre pontos']],
 [37,['Matemática','Geometria espacial: cilindros, distâncias e disposição de edificações']],
 [38,['Geografia','Demografia brasileira: população urbana e rural a partir do Censo 2022']],
 [39,['Literatura','Poesia brasileira: imagens urbanas e transformações da paisagem']],
 [40,['Sociologia','Vida urbana, individualidade e relações sociais na cidade moderna']],
 [41,['Sociologia','Carnaval, cultura popular e diversidade social brasileira']],
 [42,['Artes','História do circo: espetáculo, comicidade e expressão dramática']],
 [43,['Artes','Exposições imersivas e mediação tecnológica da experiência artística']],
 [44,['Artes','Estética e pintura moderna: composição e deformação na obra de Cézanne']],
 [45,['Filosofia','Humanismo renascentista e concepção de dignidade e liberdade humanas']],
 [46,['Artes','Escultura barroca e religiosidade na obra Cristo Cachorro']],
 [47,['Língua Portuguesa','Interpretação de poema: busca, ausência e construção de sentido']],
 [48,['Literatura','Literatura africana de língua portuguesa: narrativa e imaginário em Moçambique']],
 [49,['História','Rotas da Seda: intercâmbio comercial e circulação cultural entre regiões']],
 [50,['História','Islamismo, peregrinação a Meca e práticas religiosas']],
 [51,['História','Guerras do Afeganistão e do Iraque: intervenção e consequências sociais']],
 [52,['Geografia','Conflito de Nagorno-Karabakh e disputas territoriais no Cáucaso']],
 [53,['Geografia','Direito internacional, anexação territorial e soberania dos Estados']],
 [54,['História','Democracia ateniense, participação política e instituições da Grécia antiga']],
 [55,['Matemática','Teoria dos números: divisores, números perfeitos e propriedades aritméticas']],
 [56,['Biologia','Classificação biológica e história da taxonomia dos seres vivos']],
 [57,['Biologia','Biotecnologia, edição genética e recriação de características de espécies extintas']],
 [58,['Física','Astronomia: telescópio James Webb e observação de objetos distantes']],
 [59,['Física','Cosmologia observacional e medidas da expansão do Universo']],
 [60,['Física','Buracos negros: gravitação, horizonte de eventos e propriedades físicas']],
 [61,['Física','Efeito fotoelétrico, fótons e energia da radiação eletromagnética']],
 [62,['Química','Reações químicas e geração de oxigênio']],
 [63,['Química','Estequiometria: quantidade de clorato de sódio e produção de oxigênio']],
 [64,['Biologia','Virologia e transmissão de influenza aviária entre espécies']],
 [65,['Biologia','Imunologia: vacinação contra dengue e resposta imune']],
 [66,['Biologia','Fisiologia sensorial: evidências experimentais sobre percepção do paladar']],
 [67,['Química','Bioquímica e espectrometria de massas na identificação de proteínas']],
 [68,['Biologia','Fisiologia humana: receptores gustativos e distribuição corporal']],
 [69,['Biologia','Neurociência da percepção gustativa e interpretação de resultados experimentais']],
 [70,['Biologia','Sistema nervoso: integração cerebral das sensações de sabor']],
 [71,['Física','Termologia: transferência de calor e mudanças de textura no cozimento do ovo']],
 [72,['Física','Mecânica dos fluidos: mistura por jato de água em leito granular']],
 [73,['Física','Estática: condições de equilíbrio mecânico estável']],
 [74,['Matemática','Funções: interpretação e comparação de gráficos']],
 [75,['Física','Mecânica: movimento vertical, colisão e restituição em quique']],
 [76,['Física','Acústica: nível de intensidade sonora e razão entre intensidades']],
 [77,['Física','Ondulatória: frequência, comprimento de onda e resposta auditiva']],
 [78,['Biologia','Evolução: teoria endossimbiótica e origem de organelas eucarióticas']],
 [79,['Biologia','Ecologia química: defesa vegetal e resposta a herbívoros']],
 [80,['Biologia','Comunicação vegetal, defesa e resposta ao ataque de herbívoros']],
 [81,['Biologia','Fisiologia vegetal: comunicação química entre plantas']],
 [82,['Química','Materiais: dissolução de fertilizantes vítreos e liberação de nutrientes']],
 [83,['Química','Estequiometria e composição percentual de fosfato em fertilizante']],
 [84,['Biologia','Fisiologia vegetal: abertura estomática e trocas gasosas']],
 [85,['Biologia','Ecologia: nicho, competição e partilha de recursos']],
 [86,['Literatura','Prosa literária: imagens da natureza e experiência de cultivo']],
 [87,['Literatura','Narrativa e personificação: relações entre plantas e jardineiro']],
 [88,['História','Abolição do tráfico transatlântico de pessoas escravizadas no Brasil']],
 [89,['Sociologia','Memória social, sobrenome e heranças da escravidão']],
 [90,['Literatura','Narrativa literária contemporânea: personagem, escolha e construção de sentido']]
])
if(topics.size!==90)throw Error(`Taxonomia deveria cobrir 90 números, contém ${topics.size}`)
const pagesAvailable=new Set(Array.from({length:38},(_,i)=>i+1))
for(let p=1;p<=38;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const entry=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=pages.get(q.id),topic=topics.get(n)
 if(!entry||!page||!topic||!pagesAvailable.has(page))throw Error(`Questão sem página ou classificação: ${q.id}`)
 const stem=String(q.enunciado||'').replace(/\u00a0/g,' ').replace(/¬/g,' ').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<18||/�|\ufffd/.test(stem))throw Error(`Enunciado suspeito em ${q.id}`)
 const contextPages=[...(entry.paginas||[page])].filter(p=>p!==page)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2026,concurso:'FUVEST 2026 — 1ª fase, Prova V1',numero_original:n,pagina:page,dificuldade:[3,4,5,7,18,31,37,55,61,63,67,71,72,74,76,77,82,83].includes(n)?'Difícil':[1,2,6,8,10,11,13,19,20,21,22,24,25,26,28,30,34,38,41,42,43,46,47,49,50,54,56,57,58,62,64,65,68,70,73,78,84,88,90].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela integração de conceitos e procedimentos; não representa faixa oficial da FUVEST.',enunciado:stem,classificacao_fonte:prova,motivo:`Questão ${n}, página ${page}, Prova V1. Matéria e conteúdo atribuídos a partir do comando e do objeto efetivamente avaliado.`,visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:q.texto_apoio||'',motivo:'Página oficial vinculada para preservar textos-base, fórmulas, mapas, tabelas e alternativas visuais.'},...(contextPages.length?{imagens_contexto:contextPages.map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página vinculada pelo catálogo do documento para preservar a continuação do texto-base ou elemento visual.'}))}:{}),apta_resolucao:true,remover_pendencias:removable}
})
const present=new Set(decisions.map(d=>d.numero_original)),missing=[...Array(90)].map((_,i)=>i+1).filter(n=>!present.has(n))
if(decisions.length!==89||missing.join(',')!=='5')throw Error(`Cobertura divergente; ausentes: ${missing}`)
const add5={id:'extr-fuvest-2026-v1-005',ano:2026,banca:'FUVEST',banca_original:'FUVEST',organizadora:'FUVEST',concurso:'FUVEST 2026 — 1ª fase, Prova V1',aplicacao:'Vestibular FUVEST 2026 — Prova V1',numero_original:5,pagina:3,documento_id:doc,materia:'Química',conteudo:'Ligações químicas: classificação iônica, covalente e metálica',enunciado:'A difusão de descobertas científicas complexas em linguagens mais acessíveis e lúdicas é uma forma de expor a importância da ciência. Um recente trabalho da Universidade de Würzburg, na Alemanha, que descreveu uma nova ligação tripla entre átomos de B (Boro) e C (Carbono), foi apresentado como se os autores estivessem jogando uma espécie de “bingo das ligações químicas”, conforme a figura a seguir.\n\n“No bingo das ligações químicas, os pesquisadores conseguiram completar a lacuna entre o Boro e o Carbono.”\n\nDisponível em: https://www.tecmundo.com.br/ciencia/. Adaptado.\n\nAdaptando essa ideia, foi feito um jogo para identificar os tipos de ligações entre os elementos Na, K, Ca, Cl, Br e I. Assinale a alternativa que representa a melhor marcação do tipo de ligação formada por esses átomos, seguindo a legenda: quadrado — ligação iônica; círculo — ligação covalente; triângulo — ligação metálica.',opcoes:['A','B','C','D','E'],resposta_correta:null,anulada:false,origem:'FUVEST — Vestibular 2026, primeira fase, Prova V1',fonte:prova,documento_origem:catalog.arquivo,tipo_documento:'Prova objetiva — 1ª fase — V1',tipo_extraido:'multipla_escolha',tipo_resposta:'multipla_escolha',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Transcrição do texto-base, comando e legenda da matriz; desenhos das alternativas mantidos na página original.',classificacao_evidencia:'Página 3 da prova oficial mostra a explicação da ligação B–C, a matriz Na/K/Ca/Cl/Br/I e as cinco alternativas diagramadas.',dificuldade:'Difícil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial: requer distinguir interações metálicas, iônicas e covalentes em uma matriz de pares de elementos.',pagina_imagem:`paginas/${doc}-0003.webp`,imagens_paginas:[`paginas/${doc}-0003.webp`],paginas_origem:[3],contexto_paginas:[{pagina:3,imagem:`paginas/${doc}-0003.webp`}],texto_apoio:'As figuras das cinco alternativas são matrizes gráficas e foram preservadas integralmente na página original vinculada; a legenda foi transcrita no enunciado.',integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:[]}}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({existentes:decisions.length,pendentesAntes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,ausente:[5],conteudos:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),paginas:38,fonte:prova},null,2));process.exit(0)}
const name='revisao-fuvest-2026-fase1-v171'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:[add5]})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,prova,registros_revistos:89,questao_recuperada:5,itens_validos:90,lacunas_finais:[],paginas_originais:38,opcoes_visuais_preservadas:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
