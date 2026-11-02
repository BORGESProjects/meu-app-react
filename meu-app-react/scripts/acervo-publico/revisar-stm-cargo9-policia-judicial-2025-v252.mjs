import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='b745c43f7762823b'
const prova='https://cdn.cebraspe.org.br/concursos/stm_25/arquivos/072_STM_009_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/stm_25/arquivos/Gab_Definitivo_072_STM_009_01.pdf'
const concurso='STM 2025 — Cargo 9: Técnico Judiciário, Área Administrativa, Agente da Polícia Judicial'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==76||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Caderno oficial STM, Cargo 9, diverge do catálogo')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-trt10-estatistica-2024-v251'))
if(start<0)throw Error('Base v251 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),records=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)records.set(q.id,q)
if(records.size!==76)throw Error(`Esperados 76 recortes OCR do Cargo 9; encontrados ${records.size}`)

const topics=new Map([
 [51,['Direito Penal','Aplicação da lei penal: contagem de prazo e teoria do tempo do crime']],
 [52,['Direito Penal','Lei penal no tempo: abolitio criminis e efeitos da coisa julgada']],
 [53,['Direito Penal','Lei penal no espaço: teoria da ubiquidade nos crimes a distância']],
 [54,['Direito Penal','Leis temporárias e excepcionais: ultratividade']],
 [55,['Direito Penal','Tempo do crime: teoria da atividade e momento da conduta']],
 [56,['Direito Penal','Crimes contra a liberdade individual: perseguição e reiteração de condutas']],
 [57,['Direito Penal','Homicídio privilegiado: natureza jurídica e efeitos na pena']],
 [58,['Direito Penal','Homicídio culposo: culpa, imprudência, negligência e imperícia']],
 [59,['Direito Penal','Crimes contra a fé pública: falsificação de cheque e documento particular']],
 [60,['Direito Penal','Crimes contra a administração pública: tráfico de influência']],
 [61,['Direito Penal','Crimes contra o patrimônio: coisa abandonada e furto']],
 [62,['Direito Penal','Crimes contra a administração pública: corrupção ativa e bilateralidade']],
 [63,['Direito Penal','Crimes contra o patrimônio: receptação qualificada no exercício de atividade comercial']],
 [64,['Direito Processual Penal','Prisão em flagrante: condutor e legitimidade de agente público ou particular']],
 [65,['Direito Processual Penal','Prova pericial: indeferimento de exame de corpo de delito']],
 [66,['Direito Processual Penal','Auto de prisão em flagrante: recusa de assinatura e audiência de custódia']],
 [67,['Direito Processual Penal','Violência doméstica: prioridade para exame de corpo de delito']],
 [68,['Direito Processual Penal','Prisão em flagrante: ausência de testemunhas do crime']],
 [69,['Segurança Institucional','Análise de risco de dignitários: danos, perdas e proteção integral']],
 [70,['Segurança Institucional','Diagnóstico de risco: contexto, vulnerabilidades, ameaças e coleta de informações']],
 [71,['Segurança Institucional','Proteção de dignitários: métodos estruturados para análise de risco']],
 [72,['Segurança Institucional','Planejamento de contingências: medidas de proteção proporcionais ao risco']],
 [73,['Segurança Institucional','Gerenciamento de crises: planos específicos para ameaças identificadas']],
 [74,['Segurança Institucional','Proteção de dignitários: previsibilidade de rotina e vulnerabilidades']],
 [75,['Segurança Institucional','Avaliação de ameaças: atos hostis deliberados e riscos involuntários']],
 [76,['Segurança Institucional','Proteção de dignitários: adequação de medidas preventivas e efetivo']],
 [77,['Segurança Institucional','Uso diferenciado da força: necessidade e proporcionalidade na defesa pessoal']],
 [78,['Segurança Institucional','Defesa pessoal: antecipação e limites do uso de força letal']],
 [79,['Segurança Institucional','Armamento e tiro: porte ostensivo de arma em escolta']],
 [80,['Direito Administrativo','Responsabilidade civil e administrativa por disparo acidental de arma de fogo']],
 [81,['Segurança Institucional','Proteção de dignitários: acesso à arma e resposta a ameaças']],
 [82,['Primeiros Socorros','Atendimento emergencial: segurança da cena e proteção do socorrista']],
 [83,['Primeiros Socorros','Atendimento pré-hospitalar: avaliação inicial e movimentação de pessoa inconsciente']],
 [84,['Primeiros Socorros','Equipe de proteção: capacitação e resposta imediata até suporte especializado']],
 [85,['Segurança Institucional','Planejamento da proteção pessoal: protocolos, contexto e análise de risco']],
 [86,['Segurança Institucional','Escolta de dignitários: cápsula de segurança e veículos de apoio tático']],
 [87,['Segurança Institucional','Segurança orgânica no Judiciário: diagnóstico local e normas nacionais']],
 [88,['Segurança Institucional','Segurança orgânica e gestão de crises: revisão de protocolos e proteção de informações']],
 [89,['Segurança Institucional','Segurança orgânica e contingência: proteção de ativos e gestão de crises']],
 [90,['Segurança Institucional','Planejamento de contingência: ativos críticos, comando e fluxos decisórios']],
 [91,['Segurança Institucional','Análise de vulnerabilidades em unidades judiciárias: rotinas e fluxos']],
 [92,['Segurança da Informação','Segurança patrimonial e proteção de ativos informacionais']],
 [93,['Segurança Institucional','Gestão de segurança judiciária: barreiras, capacitação e prevenção']],
 [94,['Segurança Institucional','Segurança perimetral: integração de videomonitoramento e barreiras físicas']],
 [95,['Segurança da Informação','Confidencialidade de dados: criptografia e controle de acesso hierarquizado']],
 [96,['Segurança Contra Incêndio','Incêndio classe D: agentes extintores e metais combustíveis']],
 [97,['Segurança Contra Incêndio','Prevenção e combate a incêndio: classes de extintores e NR-23']],
 [98,['Segurança Contra Incêndio','Sinalização fotoluminescente de rotas de fuga e tempo de luminância']],
 [99,['Segurança Contra Incêndio','Prevenção de incêndios em arquivos e conservação de documentos']],
 [100,['Segurança Contra Incêndio','Resposta a princípio de incêndio: alarme e acionamento de emergência']],
 [101,['Inteligência','Ciclo de inteligência: direcionamento, coleta, análise e disseminação']],
 [102,['Inteligência','Análise de vínculos: link analysis e valor probatório']],
 [103,['Comunicação','Atendimento ao público judiciário: linguagem acessível e precisão normativa']],
 [104,['Direito Penal','Abuso de autoridade: contenção e retenção de pessoa em dependência pública']],
 [105,['Direito Processual Penal','Juizados especiais criminais: termo circunstanciado e encaminhamento']],
 [106,['Direitos Humanos','Discriminação racial: tratamento desigual e enquadramento penal']],
 [107,['Direito Administrativo','Prioridade especial da pessoa idosa e atendimento médico emergencial']],
 [108,['Direito Processual Penal','Identificação civil e retenção de documentos pessoais na execução penal']],
 [109,['Protocolo e Cerimonial','Precedência diplomática em cerimônias oficiais: embaixadores e ministros']],
 [110,['Protocolo e Cerimonial','Ordem de precedência de autoridades civis e militares em cerimônia oficial']],
 [111,['Legislação de Armas','Estatuto do Desarmamento: omissão de cautela e resultado de dano']],
 [112,['Legislação de Armas','Porte de arma de fogo por agentes da polícia judicial']],
 [113,['Direito Administrativo','Poder de polícia administrativa e atribuições da polícia judicial']],
 [114,['Inteligência','Inteligência de segurança institucional: identificação e acompanhamento de ameaças']],
 [115,['Legislação de Segurança Institucional','Resolução CNJ 383/2021: composição do grupo de apoio do SinSIPJ']],
 [116,['Legislação de Segurança Institucional','Sistema de inteligência do Poder Judiciário: compartilhamento e sigilo de documentos']],
 [117,['Legislação de Segurança Institucional','Resolução CNJ 435/2021: proteção de servidores em situação de risco']],
 [118,['Legislação de Segurança Institucional','Atuação de policiais militares em órgãos de segurança do Poder Judiciário']],
 [119,['Legislação de Armas','Resoluções CNJ 467/2022 e 566/2024: suspensão de porte funcional e recolhimento de arma']],
 [120,['Legislação de Armas','Resolução CNJ 566/2024: porte funcional e uso de arma institucional ou particular']],
])
if(topics.size!==70)throw Error(`Mapeamento incompleto: ${topics.size}/70`)
const answers=['E','C','E','C','C','E','E','C','E','C','C','E','C','C','E','E','C','E','E','X','C','C','E','E','C','C','C','E','E','E','C','C','X','C','E','C','E','C','E','X','C','X','E','E','C','E','E','E','E','E','E','X','C','E','E','E','C','X','C','E','E','E','E','C','E','E','X','E','C','C']
if(answers.length!==70)throw Error('Gabarito definitivo deve cobrir os itens 51–120')
const answerMap=new Map(answers.map((x,i)=>[i+51,x])),keyDigest=hashRevisao(answers.join(''))
const byNumber=new Map()
for(const e of catalog.questoes){const a=byNumber.get(Number(e.numero))||[];a.push(e);byNumber.set(Number(e.numero),a)}
if(byNumber.size!==70||[...byNumber.keys()].some(n=>n<51||n>120)||[...byNumber].some(([n,a])=>a.length!==([51,54,55,63,73,76].includes(n)?2:1)))throw Error('Perfil de numeração/duplicação OCR divergente')
const canonical=new Map([[51,'extr-e78ee1d559d8f7391355'],[54,'extr-51fecd5806d16c58af79'],[55,'extr-7a6b8832b717dc32f7d8'],[63,'extr-7dbc6946978d44555b64'],[73,'extr-ff88ff1b8d8da3ff91eb'],[76,'extr-043d71dfeb051299bb6c']])
const duplicateToCanonical=new Map()
for(const [n,es] of byNumber)for(const e of es){const id=canonical.get(n)||es[0].id;if(e.id!==id)duplicateToCanonical.set(e.id,id)}
if(duplicateToCanonical.size!==6)throw Error('Esperadas seis cópias OCR duplicadas')

const contexts=new Map([
 [51,'Acerca da aplicação da lei penal, julgue os itens seguintes.'],
 [56,'Acerca dos crimes contra a pessoa, julgue os itens subsequentes.'],
 [59,'Julgue os itens referentes a crimes contra a administração pública, contra o patrimônio e contra a fé pública.'],
 [64,'No que se refere à prova penal e à legislação processual penal, julgue os itens seguintes.'],
 [69,'Acerca da análise de riscos na segurança de dignitários, julgue os itens.'],
 [72,'A respeito do planejamento de contingências e do gerenciamento de crises, julgue os itens.'],
 [74,'No que concerne à segurança de pessoas no âmbito da proteção de dignitários, julgue os itens.'],
 [77,'No que se refere à defesa pessoal na escolta de dignitários e ao uso diferenciado da força, julgue os itens.'],
 [79,'Em relação a armamento e tiro e à responsabilidade pelo uso da força, julgue os itens.'],
 [82,'Julgue os itens a respeito de primeiros socorros na segurança de dignitários.'],
 [85,'No que diz respeito às técnicas, táticas, operacionalização, planejamento e execução da segurança de dignitários, julgue os itens.'],
 [87,'Considerando os fundamentos, princípios e definições de segurança orgânica e o planejamento de contingências, julgue os itens.'],
 [91,'No que se refere à segurança de áreas e instalações, segurança patrimonial, identificação de vulnerabilidades e ameaças e segurança da informação, julgue os itens.'],
 [96,'Julgue os itens referentes à prevenção e ao combate a incêndio e ao plano de evacuação.'],
 [101,'Acerca do serviço de inteligência e da qualidade no atendimento ao público, julgue os itens.'],
 [104,'Durante plantão judiciário, um agente da polícia judicial intervém em conflito e mantém uma pessoa retida por 30 minutos. Depois, verifica-se que houve ofensas verbais e lesão corporal leve. Julgue os itens sobre a situação.'],
 [106,'Em tribunal, um colaborador terceirizado impede advogado negro de usar elevador social, mas permite o uso a advogados brancos. O agente conduz o colaborador à delegacia e registra ocorrência por possível racismo. Julgue o item.'],
 [107,'Uma idosa de 81 anos aguardava audiência com dores quando um homem de 28 anos sofreu convulsão e bateu a cabeça. A equipe de saúde atendeu primeiro a emergência. Julgue o item.'],
 [108,'Com base na Lei 5.553/1968, sobre apresentação e uso de documentos de identificação pessoal, julgue o item.'],
 [109,'Considere cerimônia oficial federal no STM com presença do presidente da República, chefe do Gabinete Militar, ministros de Estado, embaixadores estrangeiros e governador do Distrito Federal. Julgue os itens.'],
 [111,'À luz da Lei 10.826/2003 e suas alterações, julgue os itens.'],
 [113,'No que se refere ao exercício do poder de polícia administrativa nos tribunais e às atribuições de agentes e inspetores da polícia judicial, julgue os itens.'],
 [115,'Julgue os itens relativos ao Sistema de Inteligência de Segurança Institucional do Poder Judiciário (SinSIPJ).'],
 [117,'Julgue os itens sobre a Política e o Sistema Nacional de Segurança do Poder Judiciário, conforme a Resolução CNJ 435/2021.'],
 [119,'Com base nas Resoluções CNJ 467/2022 e 566/2024, julgue os itens.'],
])
const decisions=[...records.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Questão sem mapeamento ou página: ${q.id}`)
 const k=answerMap.get(n),anulada=k==='X',duplicate=duplicateToCanonical.has(q.id),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics.get(n)[0],conteudo:topics.get(n)[1],ano:2025,concurso,numero_original:n,pagina:page,dificuldade:[52,56,58,60,62,63,65,66,68,70,73,78,80,83,88,90,92,94,96,97,98,101,102,104,105,106,107,108,109,110,112,113,115,117,118,119].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade normativa, técnica operacional e articulação de conceitos; a banca não divulga dificuldade individual.',resposta_correta:anulada?null:k==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva dos itens 51–120; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Cebraspe/STM, Cargo 9 — Agente da Polícia Judicial; aplicação em 01/06/2025. Item ${n}, página ${page}; classificação conforme o tema e o enunciado do caderno oficial.`,...(duplicate?{apta_resolucao:false,duplicada_de:duplicateToCanonical.get(q.id),inelegibilidade_motivo:'Cópia OCR do mesmo item e da mesma edição; registro canônico mantido, cópia marcada inelegível.'}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']}),visual:{pagina:page,imagem:image,texto_apoio:contexts.get(n)||'',motivo:'Página do caderno oficial associada ao item para preservar o contexto, o texto-base e a apresentação visual.'}}
})
if(decisions.length!==76)throw Error('Esperados 76 recortes OCR do documento')
for(const page of new Set(decisions.map(x=>x.visual.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortesOCR:76,itensOficiais:70,pendentesRevisados:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,duplicatasOCR:duplicateToCanonical.size,itensAnulados:decisions.filter(x=>x.anulada&&!duplicateToCanonical.has(x.id)).map(x=>x.numero_original),gabaritos:decisions.filter(x=>!duplicateToCanonical.has(x.id)).length,materias:[...new Set([...topics.values()].map(x=>x[0]))],fonte:prova,gabarito},null,2));process.exit(0)}
const name='revisao-stm-cargo9-policia-judicial-2025-v252'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,recortesOCR:76,itensOficiais:70,duplicatasOCR:duplicateToCanonical.size,itensAnulados:[70,83,90,92,102,108,117],pendenciasRevisadas:decisions.filter(x=>records.get(x.id).classificacao_pendente&&!duplicateToCanonical.has(x.id)).length,publicado:false,fonte:prova,gabarito}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## STM 2025 — Cargo 9: Agente da Polícia Judicial — v252\n\n- Classifiquei os 70 itens oficiais de 51 a 120 por matéria e conteúdo específico, com ano da aplicação, dificuldade estimada, fonte e página original. A classificação distingue Direito Penal, Direito Processual Penal, Segurança Institucional, Primeiros Socorros, Segurança da Informação, Segurança Contra Incêndio, Inteligência, Comunicação, Direitos Humanos, Direito Administrativo, Protocolo e Cerimonial, Legislação de Armas e Legislação de Segurança Institucional.\n- Vinculei o gabarito definitivo oficial e respeitei as anulações dos itens 70, 83, 90, 92, 102, 108 e 117, sem correção automática nesses itens. Marquei seis cópias OCR dos itens 51, 54, 55, 63, 73 e 76 como inelegíveis e mantive uma versão de cada item.\n- Mantive associados às questões os blocos de contexto, cenários práticos e instruções comuns identificados no PDF; todas as páginas do caderno permanecem ligadas como referência visual.\n- Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações, seis duplicatas sinalizadas, ${result.contextos_visuais} referências visuais, ${result.total} registros, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, ainda não publicada na nuvem.\n- Fontes oficiais: [caderno Cargo 9](https://cdn.cebraspe.org.br/concursos/stm_25/arquivos/072_STM_009_01.pdf), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/stm_25/arquivos/Gab_Definitivo_072_STM_009_01.pdf), [edital de abertura](https://cdn.cebraspe.org.br/concursos/stm_25/arquivos/ED_1_2025_STM_ABERTURA.PDF), [página do concurso](https://www.cebraspe.org.br/concursos/STM_25).\n`)
console.log(JSON.stringify(out,null,2))
