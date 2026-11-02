import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-hub-terapia-ocupacional-v98/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-hub-terapia-ocupacional-2018.json','utf8'))
const materia='Terapia Ocupacional',faixas=[]
const definir=(inicio,fim,conteudo)=>faixas.push({inicio,fim,conteudo})
definir(1,5,'Oncologia: carcinogênese, neoplasias, fatores de risco e conceitos gerais')
definir(6,10,'Oncologia e gerontologia: cuidado à pessoa idosa com câncer, metástase, demência, fadiga, dor e cuidados paliativos')
definir(11,15,'Oncologia: avaliação da dor, entrevista, sistemas familiares e comunicação do prognóstico')
definir(16,20,'Oncologia pediátrica: brinquedoteca, neoplasias, radioterapia, tecnologia assistiva e brincar terapêutico')
definir(21,25,'Doenças cardiovasculares: ciclo cardíaco, hipertensão, angina, infarto e doença vascular')
definir(26,31,'DPOC e Terapia Ocupacional: contexto domiciliar, conservação de energia, fadiga e treino de atividades')
definir(32,35,'Intervenção grupal: educação em saúde, grupos cardiopulmonares e grupos em oncologia')
definir(36,40,'Reabilitação física: doenças reumáticas, fratura de quadril, lesão de plexo braquial, órteses e edema')
definir(41,46,'Oncologia: desempenho ocupacional, cognição, manejo de fadiga, quimioterapia e linfedema')
definir(47,50,'Reabilitação cardiopulmonar na DPOC: respiração, conservação de energia, exercício e controle da dispneia')
definir(51,56,'Reabilitação neurológica após hemiplegia: tônus, posicionamento, controle de tronco, visão, deglutição e sensibilidade')
definir(57,60,'Terapia Ocupacional hospitalar: avaliação funcional, brinquedoteca, mobilização e planejamento da alta')
definir(61,61,'Cuidados paliativos pediátricos: conforto, participação e apoio à família')
definir(62,66,'Terapia Ocupacional neonatal: prematuridade, UTIN, posicionamento, órteses e autorregulação')
definir(67,70,'Reabilitação de membro superior: fraturas, nervo radial, órteses dinâmicas e avaliação funcional')
definir(71,75,'Desenvolvimento infantil: microcefalia, estimulação precoce, reflexo de Moro e avaliação do desenvolvimento')
definir(76,78,'Brincar terapêutico: desenvolvimento, brincar espontâneo e história da Terapia Ocupacional')
definir(79,83,'Doenças neuromusculares na infância: distrofia muscular de Duchenne, mobilidade, Gowers e órteses')
definir(84,87,'Desenvolvimento infantil: transtornos do neurodesenvolvimento, queixas funcionais e CIF')
definir(88,91,'Terapia Ocupacional pediátrica hospitalar: atividades de vida diária, brinquedoteca, alta e contexto social')
definir(92,95,'Cuidados paliativos pediátricos e dor: ciclo atividade-repouso, dor do câncer e escala visual analógica')
definir(96,98,'Estrutura da prática da Terapia Ocupacional: ocupações, habilidades perceptuais e clientes (AOTA/OTPF)')
definir(99,102,'Avaliação em Terapia Ocupacional: estereognosia, COPM, PEDI e instrumentos de avaliação física')
definir(103,109,'Intervenção em Terapia Ocupacional: exercício, prevenção do desuso, desempenho ocupacional e grupos')
definir(110,116,'Tecnologia assistiva: próteses, adequação postural, controle motor, adaptações e órteses')
definir(117,118,'Análise da atividade: tarefa, teoria e abordagem biomecânica')
definir(119,120,'Raciocínio clínico em Terapia Ocupacional: raciocínio científico, pragmático, recursos e competências')
const contextos=[
 [1,5,'Acerca de câncer e dos conceitos gerais em oncologia, julgue os itens seguintes.'],
 [6,10,'Caso clínico: mulher de 71 anos internada por infecção urinária, com histórico de neoplasia mamária tratada por mastectomia, metástase pulmonar, possível demência, dor, fadiga e tristeza. Após melhora da infecção, a família propõe alta e acompanhamento domiciliar sem intervenções. Julgue os itens com base no caso.'],
 [11,11,'Com base no caso clínico da paciente idosa com câncer, metástase pulmonar, dor e fadiga, julgue o item sobre avaliação da dor.'],
 [12,15,'No que se refere aos cuidados da Terapia Ocupacional com a pessoa com câncer e sua família, julgue os itens.'],
 [16,20,'Com relação à oncologia pediátrica e à atuação da Terapia Ocupacional nesse contexto, julgue os itens.'],
 [21,25,'A respeito dos aspectos clínicos das doenças cardiovasculares, julgue os itens.'],
 [26,31,'Caso clínico: Joaquim, 72 anos, ex-tabagista, com DPOC e oxigenoterapia domiciliar, relata dispneia, limitação das atividades cotidianas e fadiga. Julgue os itens seguintes com base no caso.'],
 [32,35,'Com relação às estratégias e abordagens grupais em Terapia Ocupacional, julgue os itens.'],
 [36,40,'A respeito da atuação da Terapia Ocupacional junto a pessoas com disfunções físicas, julgue os itens.'],
 [41,46,'A respeito do papel do terapeuta ocupacional como membro da equipe de cuidado da pessoa com câncer, julgue os itens.'],
 [47,50,'Julgue os itens referentes à atuação da Terapia Ocupacional na reabilitação de pacientes com DPOC.'],
 [51,56,'A respeito da atuação da Terapia Ocupacional na reabilitação de pacientes hemiplégicos, julgue os itens.'],
 [57,60,'Com relação ao atendimento terapêutico ocupacional no ambiente hospitalar, julgue os itens.'],
 [61,61,'Nos cuidados paliativos de crianças, considere a assistência à criança e à família para favorecer brincar, interação e conforto.'],
 [62,66,'Acerca da atuação da Terapia Ocupacional na unidade de tratamento intensivo neonatal (UTIN), julgue os itens.'],
 [67,70,'A respeito da atuação do terapeuta ocupacional na reabilitação de pacientes com lesões nos membros superiores, julgue os itens.'],
 [71,75,'Com relação à microcefalia, suas implicações para o desenvolvimento neuropsicomotor infantil e à estimulação precoce, julgue os itens.'],
 [76,78,'No que se refere ao brincar, atividade primordialmente utilizada pelo terapeuta ocupacional como recurso terapêutico para crianças, julgue os itens.'],
 [79,83,'Caso clínico: criança com distrofia muscular de Duchenne, atraso para iniciar a marcha, quedas e apoio das mãos nos joelhos para se levantar. Julgue os itens com base no caso.'],
 [84,87,'Com relação à atuação do terapeuta ocupacional em casos de crianças com transtornos globais do desenvolvimento, julgue os itens.'],
 [88,91,'A respeito das práticas de Terapia Ocupacional aplicadas à população infantil em contexto hospitalar, julgue os itens.'],
 [92,95,'No que se refere às causas de dor e aos cuidados paliativos na população infantil, julgue os itens.'],
 [96,98,'A estrutura da prática da Terapia Ocupacional: domínio e processo, documento oficial da AOTA, apresenta ideias inter-relacionadas que definem e guiam a prática. Julgue os itens.'],
 [99,102,'O processo de avaliação em Terapia Ocupacional determina a condição do cliente, suas necessidades e prioridades e orienta as intervenções. Julgue os itens.'],
 [103,109,'O processo de intervenção em Terapia Ocupacional consiste em ações qualificadas, realizadas em colaboração com o cliente para facilitar seu envolvimento na ocupação. Julgue os itens.'],
 [110,116,'A propósito do uso da tecnologia assistiva na Terapia Ocupacional, julgue os itens.'],
 [117,118,'A análise da atividade é usada para compreender as etapas necessárias à realização de uma tarefa. Julgue os itens.'],
 [119,120,'Raciocínio clínico é o processo usado para planejar, orientar, realizar e refletir sobre o tratamento do cliente. Julgue os itens.']
]
const faixa=(n)=>faixas.find(x=>n>=x.inicio&&n<=x.fim)?.conteudo
const contexto=(n)=>contextos.find(([i,f])=>n>=i&&n<=f)?.[2]
const idDuplicatas=new Map([['extr-d35d1ddacaded71da42a','extr-c0e0c5d881374cddb79d'],['extr-2bc94e25a5f4b2cc8bf2','extr-09d9784b917c29c32cc0'],['extr-998ede674aabcd1ff4d1','extr-584295edb5c0088fa448'],['extr-0aa4ae26306b0ae16cee','extr-0bd80cbbb512472cec67']])
const corrigidos=new Map([
 ['extr-09d9784b917c29c32cc0',{enunciado:'A anaplasia é uma característica das neoplasias malignas relacionada à invasão de tecidos e à ocorrência de metástases.'}],
 ['extr-d35d1ddacaded71da42a',{enunciado:'O estágio de promoção corresponde ao primeiro estágio da carcinogênese e é caracterizado por alterações celulares irreversíveis que afetam o DNA, o RNA e proteínas específicas.'}],
 ['extr-c0e0c5d881374cddb79d',{enunciado:'O estágio de promoção corresponde ao primeiro estágio da carcinogênese e é caracterizado por alterações celulares irreversíveis que afetam o DNA, o RNA e proteínas específicas.'}],
 ['extr-584295edb5c0088fa448',{enunciado:'A paciente pode vir a apresentar dispneia, um dos sintomas mais comuns em pacientes oncológicos com metástases pulmonares.'}],
 ['extr-998ede674aabcd1ff4d1',{enunciado:'A paciente pode vir a apresentar dispneia, um dos sintomas mais comuns em pacientes oncológicos com metástases pulmonares.'}],
 ['extr-0bd80cbbb512472cec67',{enunciado:'O procedimento cirúrgico ao qual a paciente se submetera aos sessenta anos de idade foi uma mastectomia total ou simples.'}]
])
const decisoes=[]
for(const q of pendentes){
 const n=q.numero_original,c=faixa(n),ctx=contexto(n);if(!c||!ctx)throw Error(`Item sem classificação/contexto: ${q.id} n${n}`)
 const corre=corrigidos.get(q.id),visual={pagina:q.pagina,imagem:`paginas/${q.documento_id}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:'Página original conferida visualmente; texto-base, comando e contexto clínico compartilhado vinculados ao item.'}
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:c,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; o caderno não informa dificuldade oficial.',motivo:`Item ${n} classificado pelo conteúdo específico de Terapia Ocupacional e conferido na página ${q.pagina} do caderno oficial.`,visual,...(corre?{enunciado:corre.enunciado}:{})}
 if(idDuplicatas.has(q.id)){d.apta_resolucao=false;d.inelegibilidade_motivo='Registro duplicado na extração do mesmo item da mesma prova; uma única cópia canônica foi preservada.';d.duplicada_de=idDuplicatas.get(q.id)}
 decisoes.push(d)
}
if(decisoes.length!==106||idDuplicatas.size!==4)throw Error('Contagem do lote inesperada')
await aplicarRevisoesIndividuais({nome:'revisao-hub-terapia-ocupacional-2018-v99',base,decisoes})
