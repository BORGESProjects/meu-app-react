import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const base='tmp/revisao-profissional/revisao-abin-educacao-v97/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-hub-terapia-ocupacional-2017.json','utf8'))
const faixa=new Map(),definir=(ns,conteudo)=>ns.forEach(n=>faixa.set(n,conteudo))
definir([1,2,3,4,5],'Desenvolvimento infantil: estimulação precoce, reflexos primitivos, escalas de avaliação e microcefalia')
definir([6,7,8],'Brincar e desenvolvimento: atividade lúdica, brincar terapêutico e história da Terapia Ocupacional')
definir([9,10,11,12,13],'Doenças neuromusculares na infância: distrofia muscular de Duchenne, conservação de energia, órteses e mobilidade')
definir([14,15,16,17],'Desenvolvimento infantil: transtornos do neurodesenvolvimento, participação e CIF')
definir([18,19,20,21],'Terapia Ocupacional pediátrica hospitalar: alta, contexto social, atividades de vida diária e brinquedoteca')
definir([22],'Cuidados paliativos pediátricos: dor, cuidados e participação')
definir([24],'Análise da atividade e manejo de fadiga: ciclo atividade-repouso')
definir([25],'Oncologia pediátrica: dor relacionada à doença e ao tratamento')
definir([26,27,28,29,30],'Análise e graduação de atividades: atividade expressiva, estrutura e desempenho')
definir([31,32,33,34,35,36],'Terapia Ocupacional em grupos: abordagens psicodinâmicas, grupo de atividades e atividade grupal')
definir([37,38,39,40,41,42],'Biomecânica da mão: arcos, preensão, avaliação sensorial e adaptação de atividades')
definir([43,44,45,46,47,48],'Gerontologia: funcionalidade, demência, envelhecimento, cuidados paliativos e prevenção de quedas')
definir([49,50,51,52,53,54],'Paralisia cerebral: avaliação, tecnologia assistiva, posicionamento, órteses e abordagem Bobath')
definir([55,56,57],'Terapia Ocupacional em oncologia: organização do cotidiano, manejo de sintomas e autoestima')
definir([58,59,60],'Terapia Ocupacional hospitalar: SUS, história da atuação e promoção da saúde')
definir([61,62,63,64,65],'Avaliação em disfunções físicas: sensibilidade, goniometria, dinamometria, força e edema')
definir([66,67,68,69,70],'Oncologia e reabilitação: radioterapia, câncer, mastectomia, sensibilidade e linfedema')
definir([71,72,73,74,75],'Órteses de membro superior: forças, órtese estática progressiva, polegar, osteoartrite e túnel do carpo')
definir([76,77,78,79,80,81],'Reabilitação cardiopulmonar na DPOC: sinais de alerta, esforço, postura, conservação de energia e fatores psicossociais')
definir([82,83,84,85],'Oncologia pediátrica: ansiedade, efeitos cognitivos, brincar terapêutico e neoplasias')
definir([86,87,88,89,90],'Reabilitação cardíaca: parâmetros de segurança, autoeficácia, análise de atividade e conservação de energia')
definir([91,92,93,94,95],'Prematuridade e UTIN: brincar social, estimulação, avaliação do desenvolvimento e posicionamento')
definir([96,97,98],'Estrutura da prática da Terapia Ocupacional: habilidades, clientes e áreas de ocupação (OTPF/AOTA)')
definir([99,100,101,102],'Avaliação em Terapia Ocupacional: estereognosia, COPM, PEDI e instrumentos de avaliação física')
definir([103,104,105,106,107,108,109],'Processo de intervenção: cuidado hospitalar, brincar, exercício, desuso, atividades de vida diária e dinâmica grupal')
definir([110,111,112,113,114,115,116],'Tecnologia assistiva e reabilitação: órteses, adaptações, próteses, posicionamento e controle motor')
definir([117,118],'Análise da atividade: tarefa, teoria e abordagem biomecânica')
definir([119,120],'Raciocínio clínico em Terapia Ocupacional: raciocínio científico, pragmático, recursos e competências')

const contexto=new Map([
 ['1-5','O secretário de Atenção à Saúde do Ministério da Saúde apresentou diretrizes para a estimulação precoce de crianças com atraso no desenvolvimento neuropsicomotor decorrente de microcefalia. Com relação ao assunto, julgue os itens.'],
 ['6-8','No que se refere ao brincar, atividade primordialmente utilizada pelo terapeuta ocupacional como recurso terapêutico para crianças, julgue os itens.'],
 ['9-13','Caso clínico: criança com distrofia muscular de Duchenne, desenvolvimento inicialmente sem alterações e atraso para iniciar a marcha. Aos 18 meses, apresentava quedas frequentes e usava as mãos apoiadas nos joelhos para se levantar; aos cinco anos tinha dificuldade para subir degraus e, aos seis, projetava o corpo para frente. Julgue os itens com base no caso.'],
 ['14-17','A respeito das práticas de Terapia Ocupacional aplicadas à população infantil com transtornos globais do desenvolvimento, julgue os itens.'],
 ['18-21','A respeito das práticas de Terapia Ocupacional aplicadas à população infantil em contexto hospitalar, julgue os itens.'],
 ['22','No que se refere às causas de dor e aos cuidados paliativos na população infantil, julgue o item.'],
 ['24','Considere os ciclos de atividade e repouso e o manejo da fadiga em Terapia Ocupacional. Julgue o item.'],
 ['25','Considere os efeitos colaterais dos procedimentos terapêuticos para o câncer infantil e os danos provocados pela doença. Julgue o item.'],
 ['26-30','As atividades humanas são a base da intervenção da Terapia Ocupacional. Com relação à análise e aos recursos terapêuticos usados pelo profissional, julgue os itens.'],
 ['31-36','Acerca da abordagem grupal da Terapia Ocupacional, julgue os itens.'],
 ['37-42','Caso clínico: paciente relata dificuldade para carregar uma sacola leve de compras e formigamento em ambas as mãos. Com relação ao caso e à avaliação biomecânica da mão, julgue os itens.'],
 ['43-48','A respeito da Terapia Ocupacional no cuidado da população idosa, julgue os itens.'],
 ['49-54','Caso clínico: criança de três anos com paralisia cerebral, que usa óculos e apresenta pouco controle de tronco e polegares aduzidos. A terapeuta iniciou a avaliação pela coleta de informações. Julgue os itens com base no caso.'],
 ['55-57','Considere três intervenções de Terapia Ocupacional em oncologia: I — organização do cotidiano; II — tratamento da fadiga e de outros sintomas; III — autoestima. Julgue os itens.'],
 ['58-60','No que concerne à intervenção da Terapia Ocupacional em contextos hospitalares, julgue os itens.'],
 ['61-65','Acerca do processo de avaliação em Terapia Ocupacional de pacientes com disfunções físicas, julgue os itens.'],
 ['66-70','Com base na atuação do terapeuta ocupacional em oncologia, julgue os itens.'],
 ['71-75','Considerando a avaliação, prescrição e confecção de órteses para membros superiores, julgue os itens.'],
 ['76-81','Caso clínico: paciente de 53 anos, engenheiro químico e tabagista, com diagnóstico de DPOC, inicia tratamento com equipe multiprofissional de reabilitação cardiopulmonar. Julgue os itens.'],
 ['82-85','Acerca do atendimento ao paciente oncológico pediátrico, julgue os itens.'],
 ['86-90','A respeito da atuação do terapeuta ocupacional no cuidado ao paciente com doença cardíaca, julgue os itens.'],
 ['91-95','No que se refere ao atendimento ao recém-nascido prematuro na UTIN e ao acompanhamento subsequente de seu desenvolvimento, julgue os itens.'],
 ['96-98','A estrutura da prática da Terapia Ocupacional: domínio e processo, documento da AOTA, apresenta ideias inter-relacionadas que definem e guiam a prática. Julgue os itens.'],
 ['99-102','O processo de avaliação em Terapia Ocupacional é importante para determinar a condição do cliente, suas necessidades e prioridades e orientar as intervenções. Julgue os itens.'],
 ['103-109','O processo de intervenção em Terapia Ocupacional consiste em ações qualificadas, realizadas em colaboração com o cliente para facilitar o envolvimento na ocupação. Julgue os itens.'],
 ['110-116','A propósito do uso da tecnologia assistiva na Terapia Ocupacional, julgue os itens.'],
 ['117-118','A análise da atividade é um processo utilizado por terapeutas ocupacionais para compreender as etapas necessárias à realização de uma tarefa. Julgue os itens.'],
 ['119-120','Raciocínio clínico é o processo usado por profissionais para planejar, orientar, realizar e refletir sobre o tratamento do cliente. Julgue os itens.']
])
const porNumero=new Map(pendentes.map(q=>[q.numero_original,q]))
const decisao=[]
for(const q of pendentes){
 const n=q.numero_original,par=[...contexto].find(([chave])=>{const partes=chave.split('-').map(Number),ini=partes[0],fim=partes[1]??partes[0];return n>=ini&&n<=fim})
 if(!faixa.has(n)||!par)throw Error(`Questão sem classificação/contexto: ${n}`)
 const texto=String(q.enunciado||'').replace(/\s+/g,' ').trim()
 const enunciado=q.enunciado.replaceAll('ter apêutica','terapêutica').replaceAll('crian ças','crianças').replaceAll('órt ese','órtese').replaceAll('classificaç ões','classificações').replaceAll('relacion adas','relacionadas').replaceAll('ati vi dades','atividades').replaceAll('i deal','ideal').replaceAll('posi cionamento','posicionamento').replaceAll('dessensibiliza ção','dessensibilização').replaceAll('semi círculos','semicírculos').replaceAll('estendi da','estendida').replaceAll('flexi bilidade','flexibilidade').replaceAll('defici ência','deficiência').replaceAll('idos a','idosa').replaceAll('a tividade','atividade').replaceAll('bra cadeira','brincadeira')
 decisao.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Terapia Ocupacional',conteudo:faixa.get(n),ano:2017,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na aplicação clínica e conceitual exigida; o caderno não publica nível de dificuldade.',motivo:`Classificação individual pelo conteúdo do item ${n}, conferida na página ${q.pagina} do caderno oficial. A matéria específica deste caderno é Terapia Ocupacional.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:par[1],motivo:'Página original conferida visualmente; texto-base/comando compartilhado vinculado ao item e trechos com espaços indevidos de OCR corrigidos após comparação com o caderno.'}})
}
if(decisao.length!==119)throw Error(`Esperadas 119 decisões, encontradas ${decisao.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-terapia-ocupacional-v98',base,decisoes:decisao})
