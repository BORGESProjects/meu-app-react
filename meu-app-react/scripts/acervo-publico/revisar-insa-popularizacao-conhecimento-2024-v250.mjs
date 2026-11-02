import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='eeac4c69f5f1d79d'
const prova='https://cdn.cebraspe.org.br/concursos/mcti_insa_24/arquivos/036_MCTIINSA_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_005_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/mcti_insa_24/arquivos/MCTI_INSA_24_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf'
const concurso='INSA/MCTI 2024 — Cargo 5: Pesquisador Adjunto I, Gestão da Informação e Popularização do Conhecimento'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==75||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Caderno oficial Cargo 5 diverge do catálogo esperado')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-cpnuje-cargo7-engenharia-civil-2024-v249'))
if(start<0)throw Error('Base v249 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),records=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)records.set(q.id,q)
if(records.size!==75)throw Error(`Esperados 75 recortes OCR do Cargo 5; encontrados ${records.size}`)

const topics=new Map([
 [51,['Comunicação Social','Divulgação científica: agentes históricos e comunicação por profissionais da ciência']],
 [52,['Comunicação Social','Ciência e sociedade: prestígio, poder simbólico e compreensão pública da ciência']],
 [53,['Comunicação Social','Divulgação científica: prestação de contas, educação e formação da opinião pública']],
 [54,['História','História da ciência no Brasil: Emílio Goeldi e o Museu Paraense']],
 [55,['Comunicação Social','História da divulgação científica no Brasil: aplicações práticas da ciência']],
 [56,['História','História da divulgação científica brasileira e imprensa no século XVIII']],
 [57,['Políticas de Ciência e Tecnologia','História das instituições científicas brasileiras: SBPC e CAPES no pós-guerra']],
 [58,['Organizações Internacionais','UNESCO: objetivos institucionais e vínculo com a ONU']],
 [59,['Comunicação Social','Divulgação científica e cooperação internacional para o desenvolvimento']],
 [60,['Políticas de Ciência e Tecnologia','CNPq e institucionalização do fomento à ciência e tecnologia no Brasil']],
 [61,['Comunicação Social','Comunicação pública da ciência: acesso e mediação do conhecimento científico']],
 [62,['Comunicação Social','Popularização da ciência por manifestações culturais e artísticas']],
 [63,['Comunicação Social','Alfabetização e letramento científico: popularização e vulgarização']],
 [64,['Educação','Feiras científicas, olimpíadas e democratização do conhecimento']],
 [65,['Geografia','Delimitação do semiárido brasileiro e distribuição territorial por estados']],
 [66,['Geografia','Clima e vegetação do semiárido: limites territoriais e precipitação']],
 [67,['Geografia','Estados abrangidos pela delimitação oficial do semiárido brasileiro']],
 [68,['Geografia','Desenvolvimento regional: MATOPIBA e sua composição territorial']],
 [69,['Geografia','Distribuição espacial do semiárido no Nordeste e no vale do São Francisco']],
 [70,['Recursos Hídricos','Abastecimento no semiárido: poços e fontes de água não convencionais']],
 [71,['Recursos Hídricos','Gestão de recursos hídricos: reúso e mediação de conflitos pelo uso da água']],
 [72,['Recursos Hídricos','Secas prolongadas, abastecimento público e impactos econômicos no semiárido']],
 [73,['Políticas Públicas','Tecnologia social: valor de uso, valor de troca e reaplicação']],
 [74,['Políticas Públicas','Tecnologia social: origem, finalidade e distinção de inovação orientada ao mercado']],
 [75,['Políticas Públicas','Tecnologia social: protagonismo comunitário e participação social']],
 [76,['Políticas Públicas','Tecnologia e desenvolvimento social: prioridades políticas e diretrizes públicas']],
 [77,['Políticas Públicas','Tecnologia social: escala de reaplicação e adequação a contextos locais']],
 [78,['Políticas Públicas','Convivência com o semiárido: tecnologia social e integração de políticas e saberes']],
 [79,['Políticas Públicas','Tecnologia social: estrutura metodológica e reaplicabilidade']],
 [80,['Políticas de Ciência e Tecnologia','Política científica: pesquisa universitária, investimento público e inovação']],
 [81,['Políticas Públicas','Tecnologia social como política pública: governança e participação de atores']],
 [82,['Políticas de Ciência e Tecnologia','Desenvolvimento tecnológico: fatores econômicos, sociais e institucionais']],
 [83,['Etnobotânica','Ética em pesquisa: consentimento prévio informado de comunidades tradicionais']],
 [84,['Etnobotânica','Métodos quantitativos e validação científica em estudos etnobotânicos']],
 [85,['Etnobotânica','Etnobotânica aplicada: bioprospecção e desenvolvimento farmacêutico']],
 [86,['Etnobotânica','Cultivo sustentável de plantas medicinais e conservação da biodiversidade']],
 [87,['Etnobotânica','Comércio de plantas medicinais, segurança alimentar e impactos socioculturais']],
 [88,['Etnobotânica','Técnica de listagem livre e relevância cultural de espécies vegetais']],
 [89,['Etnobotânica','Entrevistas semiestruturadas e métodos de coleta de dados etnobotânicos']],
 [90,['Desenvolvimento Sustentável','Conhecimentos tradicionais do semiárido e beneficiamento de produtos locais']],
 [91,['Desenvolvimento Sustentável','Pecuária na Caatinga: sistemas produtivos e conservação da vegetação']],
 [92,['Desenvolvimento Sustentável','Economia rural do semiárido e sustentabilidade do uso da Caatinga']],
 [93,['Produção Animal','Caprinocultura e ovinocultura: suplementação e nutrição no semiárido']],
 [94,['Produção Animal','Adaptação de rebanhos ao semiárido: desempenho, rusticidade e manejo sanitário']],
 [95,['Políticas Públicas','Programa Cisternas: acesso à água, capacitação e tecnologias de baixo custo']],
 [96,['Desenvolvimento Sustentável','Manejo de microbacias: barragens subterrâneas e retenção de água']],
 [97,['Desenvolvimento Sustentável','Conhecimento tradicional, conservação de alimentos e segurança alimentar']],
 [98,['Comunicação Social','Comunicação organizacional: evolução da relação entre organizações e públicos']],
 [99,['Marketing','Marketing: personalização da oferta e experiência do consumidor']],
 [100,['Comunicação Social','Comunicação organizacional contemporânea: transparência e empoderamento dos públicos']],
 [101,['Tecnologia da Informação','Transformação digital: ritmo de difusão e mudanças tecnológicas']],
 [102,['Tecnologia da Informação','História da Internet: Web 1.0 e características de interação']],
 [103,['Tecnologia da Informação','Web 2.0: plataforma, redes sociais e inteligência coletiva']],
 [104,['Marketing','Marketing digital: métricas de campanha, audiência e definição de B2B']],
 [105,['Marketing','Marketing viral: comportamento do público e pesquisa de emoções']],
 [106,['Comunicação Social','Tecnologia, comunicação organizacional e fidelização de públicos']],
 [107,['Marketing','Marketing digital: pesquisa de opinião, clipping e monitoramento de marcas']],
 [108,['Comunicação Social','Mídias sociais: classificação de canais e alinhamento a objetivos institucionais']],
 [109,['Comunicação Social','Monitoramento de redes sociais: escuta, concorrência e engajamento']],
 [110,['Comunicação Social','Moderação e gestão de críticas em canais digitais']],
 [111,['Ciência da Informação','Gestão do conhecimento: ativos intangíveis e vantagem competitiva']],
 [112,['Tecnologia da Informação','Negócios digitais: comércio eletrônico, educação a distância e serviços em rede']],
 [113,['Tecnologia da Informação','Redes de negócios digitais e integração entre empresas e stakeholders']],
 [114,['Inclusão Digital','Exclusão digital: acesso, competências informacionais e uso significativo']],
 [115,['Acessibilidade Digital','Acessibilidade digital, remoção de barreiras e usabilidade para pessoas com deficiência']],
 [116,['Inclusão Digital','Inclusão digital espontânea e induzida: acesso, apropriação e desigualdade']],
 [117,['Inclusão Digital','Participação ativa e apropriação social das tecnologias de informação e comunicação']],
 [118,['Inclusão Digital','Acesso às TICs, educação, infraestrutura e apropriação crítica']],
 [119,['Acessibilidade Digital','Linguagem acessível e inclusão informacional de pessoas com baixa alfabetização']],
 [120,['Inclusão Digital','Conectividade, desenvolvimento social e desigualdades digitais']],
])
if(topics.size!==70)throw Error(`Classificação incompleta: ${topics.size}/70`)
const answers=['E','C','C','C','C','E','X','C','C','C','E','E','C','C','E','E','C','X','E','E','C','C','C','E','C','E','E','C','E','E','E','C','C','C','E','E','E','C','E','C','C','E','E','C','E','E','C','C','E','C','E','E','C','E','C','E','C','C','E','E','C','E','C','C','E','E','C','C','E','E']
if(answers.length!==70)throw Error('Gabarito definitivo deve cobrir 51–120')
const answerMap=new Map(answers.map((x,i)=>[i+51,x])),keyDigest=hashRevisao(answers.join(''))
const byNumber=new Map()
for(const e of catalog.questoes){const a=byNumber.get(Number(e.numero))||[];a.push(e);byNumber.set(Number(e.numero),a)}
if(byNumber.size!==70||[...byNumber.keys()].some(n=>n<51||n>120)||[...byNumber].some(([n,a])=>a.length!==( [58,60,63,64,76].includes(n)?2:1 )))throw Error('Perfil de numeração/duplicação OCR divergente')
const canonical=new Map([[58,'extr-0987cb222aa4f3aafee9'],[60,'extr-3b8842b8f21896871588'],[63,'extr-0cf325cae4350a03f7cd'],[64,'extr-13fa7528f6aa6277f9a4'],[76,'extr-da4a5a5189f8e45f8948']])
const duplicateToCanonical=new Map()
for(const [n,es] of byNumber)for(const e of es){const chosenId=canonical.get(n)||es[0].id;if(e.id!==chosenId)duplicateToCanonical.set(e.id,chosenId)}
if(duplicateToCanonical.size!==5)throw Error('Esperava cinco duplicatas OCR')
const fixes=new Map([
 [60,{enunciado:'A criação do Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq) pelo governo federal desempenhou papel importante no estímulo à divulgação das atividades científicas e tecnológicas desenvolvidas no Brasil.'}],
 [64,{enunciado:'As feiras científicas e as olimpíadas são eventos que ajudam a democratizar ideias científicas no Brasil e no mundo.',texto_apoio:'Segundo dados do INSA, o semiárido brasileiro abrange uma área de cerca de 1,3 milhão de km², com 1.477 municípios distribuídos em 11 estados e com população de aproximadamente 31 milhões de habitantes. Acerca desse contexto regional, julgue os itens a seguir.'}],
 [72,{enunciado:'Em períodos de estiagem prolongada, o abastecimento de água é impactado negativamente em muitos municípios, com reflexo em atividades econômicas, em especial, a agrícola e a industrial.'}],
 [76,{enunciado:'O desenvolvimento de soluções para necessidades sociais busca direcionar o uso da tecnologia de acordo com prioridades políticas definidas, refletindo diretrizes estabelecidas por governos e instituições.'}],
 [97,{enunciado:'As necessidades de alimentação e a carência de estruturas de armazenamento a frio nas comunidades do semiárido deram ensejo a um conhecimento consolidado que se expressa na produção de alimentos que podem ser mantidos em temperatura ambiente, tais como o queijo do sertão, ou requeijão sólido, e o charque de carne de caprinos, bovinos e ovinos.'}],
 [103,{enunciado:'O termo Web 2.0 foi cunhado para caracterizar conferências sobre o uso da Web como plataforma baseada em redes sociais e inteligência coletiva.'}],
 [106,{enunciado:'A tecnologia é o conjunto de técnicas que, tendo como base a razão e o desenvolvimento científico, funcionam como mediadoras de várias funções requeridas pela vida humana.'}],
 [110,{enunciado:'Na moderação de comentários sobre a marca em blogs e mídias sociais, diante da impossibilidade de se responder a todos, o mais indicado é apagar eventuais críticas e reclamações, para não causar prejuízos à imagem da organização.'}],
])
const contexts=new Map([
 [51,'Julgue os próximos itens considerando que a popularização da ciência, a comunicação e a divulgação científica se interligam para ampliar o acesso do público a temas científicos.'],
 [57,'A respeito da criação e do aperfeiçoamento de órgãos de fomento à ciência, julgue os itens seguintes.'],
 [61,'No que se refere às formas de popularização da ciência, também vista como comunicação pública da ciência, julgue os itens a seguir.'],
 [65,'Segundo dados do INSA, o semiárido brasileiro abrange cerca de 1,3 milhão de km², com 1.477 municípios em 11 estados e aproximadamente 31 milhões de habitantes. Acerca desse contexto regional, julgue os itens.'],
 [70,'No semiárido brasileiro, a oferta de água para usos múltiplos está muito abaixo da demanda, o que endossa a visão de que a região sempre está em estresse hídrico. Acerca desse assunto, julgue os itens.'],
 [73,'Em relação aos aspectos fundamentais da tecnologia social, julgue os itens a seguir.'],
 [78,'A respeito das implicações e transversalidades das tecnologias sociais, julgue os itens seguintes.'],
 [83,'A respeito de conceitos fundamentais da etnobotânica, sua relação com sustentabilidade, ferramentas de estudo e fundamentos éticos de pesquisa, julgue os itens.'],
 [90,'Segundo o projeto MapBiomas, em duas décadas, mais que duplicou a transformação da vegetação natural da Caatinga em agricultura convencional de sequeiro. Acerca do meio ambiente, do desenvolvimento rural sustentável e dos conhecimentos tradicionais do semiárido, julgue os itens.'],
 [98,'Tendo em vista que mudanças sociais, culturais e tecnológicas impactam a comunicação das organizações, julgue os itens a seguir.'],
 [104,'A grande quantidade de espaços digitais e marcas pode fazer com que pessoas se sintam perdidas no ciberespaço, fenômeno denominado infodemia. Julgue os itens.'],
 [107,'Com o crescimento da Internet, aumentou a influência das mídias sociais nos negócios. Em relação ao monitoramento de mídias sociais, julgue os itens.'],
 [111,'A gestão da informação e do conhecimento e o uso efetivo da informação contribuem para a capacidade competitiva de organizações e para a construção de vantagens competitivas. Julgue os itens.'],
 [114,'A respeito de acessibilidade e inclusão digital, julgue os itens a seguir.'],
])
const decisions=[...records.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Questão sem referência, página ou classificação: ${q.id}`)
 const k=answerMap.get(n),anulada=k==='X',duplicate=duplicateToCanonical.has(q.id),fix=fixes.get(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n)[0],conteudo:topics.get(n)[1],ano:2025,concurso,numero_original:n,pagina:page,dificuldade:[56,65,66,67,68,70,79,84,91,92,93,96,102,104,114,115].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, combinação de conhecimentos e precisão terminológica do item; não é nível oficial individual da banca.',resposta_correta:anulada?null:k==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva de respostas dos itens 51–120; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Cebraspe/INSA-MCTI, Cargo 5, prova aplicada em 23/02/2025. Item ${n}, página ${page}; matéria e assunto especificados pelo enunciado e pelo bloco temático do caderno. Resposta vinculada ao gabarito definitivo.`,...(duplicate?{apta_resolucao:false,duplicada_de:duplicateToCanonical.get(q.id),inelegibilidade_motivo:'Recorte OCR duplicado de outro registro do mesmo item e caderno; mantido como inelegível, com versão canônica ativa.'}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']}),visual:{pagina:page,imagem:image,...(fix?{enunciado:fix.enunciado}:{}),texto_apoio:fix?.texto_apoio??contexts.get(n)??q.texto_apoio??'',motivo:fix?'Enunciado e contexto conferidos com o texto oficial; correção de fragmentação/contaminação do OCR.':'Página do caderno oficial vinculada para conferência do texto e preservação de elementos visuais.'}}
})
if(decisions.length!==75||new Set(decisions.map(x=>x.id)).size!==75)throw Error('Quantidade de registros do documento divergente')
for(const page of new Set(decisions.map(x=>x.visual.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortes:75,itensOficiais:70,pendentesRevisados:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,duplicatasOCR:duplicateToCanonical.size,correcoesOCR:fixes.size,itensAnulados:decisions.filter(x=>x.anulada&&!duplicateToCanonical.has(x.id)).map(x=>x.numero_original),gabaritos:decisions.filter(x=>!duplicateToCanonical.has(x.id)).length,porMateria:Object.fromEntries([...new Set([...topics.values()].map(x=>x[0]))].map(m=>[m,[...topics].filter(([,v])=>v[0]===m).length])),fonte:prova,gabarito},null,2));process.exit(0)}
const name='revisao-insa-popularizacao-conhecimento-2024-v250'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,recortes:75,itensOficiais:70,duplicatasOCR:duplicateToCanonical.size,correcoesOCR:fixes.size,itensAnulados:[57,68],pendenciasRevisadas:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,publicado:false,fonte:prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## INSA/MCTI 2024 — Cargo 5: Gestão da Informação e Popularização do Conhecimento — v250\n\n- Revisei os 75 recortes do caderno oficial que cobrem 70 itens numerados de 51 a 120. Classifiquei matéria e conteúdo por item em Comunicação Social, História, políticas de ciência e tecnologia, Geografia, Recursos Hídricos, Políticas Públicas, Etnobotânica, Desenvolvimento Sustentável, Produção Animal, Marketing, Ciência da Informação, Tecnologia da Informação, Inclusão Digital e Acessibilidade Digital. Registrei aplicação em 23/02/2025, dificuldade estimada, gabarito definitivo e página visual de cada item.\n- Corrigi sete enunciados/contextos contaminados pela junção de texto entre itens e blocos: 60, 64, 72, 76, 97, 103, 106 e 110 (o total inclui oito ajustes, sendo o item 64 reparado e marcado contexto compartilhado). Sinalizei cinco cópias de OCR (itens 58, 60, 63, 64 e 76) como inelegíveis e mantive os registros canônicos.\n- O item 115 já existia no banco e foi conferido com o PDF; não criei cópia. Vinculei o gabarito definitivo para todos os 70 itens e respeitei as anulações oficiais dos itens 57 e 68, sem correção automática.\n- Validação local: ${result.classificadas} registros revisados, ${result.novas_classificacoes} novas classificações, cinco duplicatas sinalizadas, ${result.contextos_visuais} referências visuais, ${result.total} registros, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local; ainda não publicada na nuvem.\n- Fontes oficiais: [caderno do Cargo 5](https://cdn.cebraspe.org.br/concursos/mcti_insa_24/arquivos/036_MCTIINSA_005_01.PDF), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_005_01.PDF), [justificativas oficiais de alterações e anulações](https://cdn.cebraspe.org.br/concursos/mcti_insa_24/arquivos/MCTI_INSA_24_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf), [página do INSA/MCTI](https://www.gov.br/insa/pt-br/acesso-a-informacao/servidores-ou-empregados-publicos/concursos-publicos/encerrados).\n`)
console.log(JSON.stringify(out,null,2))
