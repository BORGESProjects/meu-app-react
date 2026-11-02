import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const base='tmp/revisao-profissional/revisao-hub-odontologia-2018-v106/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-d1a83a0c98d96dc3.json','utf8'))
const fragmentos=new Set(['extr-a25f10d1f5b745dd3478','extr-fdae4c15ef0decca13f8','extr-706f37ff44642f173d41','extr-4f5d53b1910e855e3a4a','extr-0e210b4d99c6b13eeea9'])
const canonico=new Map()
for(const q of pendentes)if(q.numero_original<=5&&!fragmentos.has(q.id))canonico.set(q.numero_original,q.id)
const grupos=[];const definir=(a,b,conteudo,contexto)=>grupos.push({a,b,conteudo,contexto})
definir(1,5,'Farmacologia: anticoagulação com enoxaparina, dose por peso, interação e reversão','Contexto oficial: paciente com infarto agudo do miocárdio recebe enoxaparina sódica 3 mg/mL por via intravenosa, na dose de 0,3 mg/kg. Julgue os itens sobre farmacologia, cálculo posológico e superdosagem.')
definir(6,9,'Saúde pública: vigilância, determinantes sociais e organização do SUS','Julgue os itens sobre promoção, proteção e recuperação da saúde, vigilância epidemiológica, acesso e princípios organizacionais do Sistema Único de Saúde.')
definir(10,13,'Atenção primária: redes de atenção, PNAB, vacinação e promoção da saúde','Julgue os itens sobre Política Nacional de Atenção Básica, continuidade assistencial, vacinação e Programa Academia da Saúde.')
definir(14,18,'Assistência farmacêutica no SUS: seleção, programação e comissão de farmácia e terapêutica','Julgue os itens sobre medicamentos fornecidos no SUS, planejamento e ciclo da assistência farmacêutica, Comissão de Farmácia e Terapêutica e tratamento da tuberculose.')
definir(42,45,'Farmacologia cardiovascular: furosemida, diuréticos de alça e farmacocinética','Contexto oficial: furosemida bloqueia o cotransportador Na+/K+/2Cl− na membrana luminal do ramo ascendente da alça de Henle e é eliminada principalmente inalterada. Julgue os itens sobre indicações e farmacocinética.')
definir(46,50,'Farmacologia respiratória: bambuterol, agonismo beta-2 e asma','Contexto oficial: medicamento oral com bambuterol, pró-fármaco da terbutalina e agonista adrenérgico predominantemente beta-2. Julgue os itens sobre biotransformação, mecanismo, indicação e efeitos adversos.')
definir(51,55,'Tecnologia farmacêutica: formulações nasais e pulmonares','Julgue os itens sobre tonicidade, polímeros mucoadesivos, formas farmacêuticas nasais e administração inalatória em crises de broncoespasmo.')
definir(56,60,'Farmacologia cardiovascular e legislação sanitária: losartana, genéricos e similares','Julgue os itens sobre mecanismo de ação da losartana e requisitos de registro, equivalência e intercambialidade entre medicamentos de referência, genéricos e similares.')
definir(61,65,'Farmacoterapia respiratória: asma, corticosteroides e broncodilatadores','Contexto oficial: dados de prevalência e internações por asma no Brasil. Julgue os itens sobre tratamento, prevenção ambiental, uso na gestação e efeitos dos broncodilatadores.')
definir(66,70,'Assistência farmacêutica: gestão, planejamento e disponibilidade de medicamentos','Julgue os itens sobre organização sistêmica dos serviços farmacêuticos, planejamento, perdas, abastecimento e competências gerenciais.')
definir(71,74,'Farmacologia oncológica: antineoplásicos, bleomicina e agentes alquilantes','Julgue os itens sobre classes de antineoplásicos, mecanismo de ação e toxicidade de quimioterápicos.')
definir(75,78,'Farmácia clínica: terapia nutricional enteral e parenteral','Julgue os itens sobre indicações de nutrição parenteral, escolha de sondas e cuidados na administração de nutrição enteral.')
definir(79,80,'Farmácia baseada em evidências: níveis de evidência e avaliação de tecnologias em saúde','Julgue os itens sobre evidência clínica e participação social na avaliação e incorporação de tecnologias no SUS.')
definir(81,83,'Legislação farmacêutica: medicamentos sujeitos a controle especial e notificações de receita','Julgue os itens conforme as normas da ANVISA sobre listas de controle especial, amostras grátis, notificações A e B, validade e âmbito territorial.')
definir(84,87,'Farmacovigilância: reação adversa, evento adverso e gravidade','Julgue os itens sobre definições de reação adversa a medicamento, classificação de reações e evento adverso.')
definir(88,90,'Farmacoterapia respiratória: doença pulmonar obstrutiva crônica','Texto-base: DPOC é doença evitável relacionada, entre outros fatores, ao tabagismo e à poluição. Julgue os itens sobre manifestações, componentes da doença e farmacoterapia.')
definir(91,95,'Deontologia e legislação farmacêutica: Código de Ética e responsabilidade profissional','Julgue os itens conforme o Código de Ética Farmacêutica (Resolução CFF nº 596/2014), incluindo dispensação, delegação, recebimento de produtos e responsabilidade.')
definir(96,101,'Farmacologia cardiovascular: inibidores da ECA e tratamento da hipertensão','Julgue os itens sobre efeitos adversos, função renal, uso de IECA, associação com BRA, pós-infarto e contraindicação na gestação.')
definir(102,105,'Legislação farmacêutica: prescrição farmacêutica e denominação comum','Julgue os itens conforme a Resolução CFF nº 586/2013 e as regras de prescrição farmacêutica no SUS e no setor privado.')
definir(106,111,'Farmacologia antimicrobiana: quinolonas, cefalosporinas, carbapenêmicos, penicilina e aminoglicosídeos','Julgue os itens sobre farmacodinâmica e espectro de antibióticos, tratamento da sífilis na gestação e associação imipeném-cilastatina.')
definir(112,114,'Farmacologia cardiovascular: betabloqueadores e interação com clonidina','Julgue os itens sobre interrupção de clonidina, contraindicações e efeitos dos betabloqueadores.')
definir(115,120,'Farmacoterapia do diabetes mellitus: hemoglobina glicada, metformina, sulfonilureias e insulina','Julgue os itens sobre monitoramento e tratamento medicamentoso do diabetes mellitus tipo 1 e tipo 2.')

const limpos=new Map([
 [1,'A administração concomitante da enoxaparina com o ácido acetilsalicílico potencializaria a ação farmacológica da enoxaparina no referido paciente.'],
 [2,'Se o peso desse paciente fosse de 45 kg, para atingir-se a dosagem requerida, o volume da solução de enoxaparina sódica 3 mg/mL injetado deveria ser de 15 mL.'],
 [3,'Se o paciente pesasse 95 kg, a dose da solução do referido fármaco administrada por via intravenosa deveria ser de 28,5 mg.'],
 [4,'Recomenda-se a administração intravenosa do anticoagulante protamina no caso de constatação de que o paciente recebeu uma superdosagem acidental de enoxaparina sódica.'],
 [5,'O tratamento desse paciente com enoxaparina sódica justifica-se por ser esse fármaco um sal cálcico com propriedades coagulantes.'],
 [18,'Prednisona e isoniazida são medicamentos anti-inflamatórios fornecidos pelo Sistema Único de Saúde para tratamento da tuberculose.'],
 [65,'Os efeitos adversos dos broncodilatadores incluem bradicardia, aumento da saturação de oxigênio e sonolência.'],
 [101,'Esses inibidores são indicados para o tratamento da hipertensão em paciente gestante.'],
 [105,'O uso da denominação comum brasileira ou da denominação comum internacional é obrigatório no âmbito do SUS e preferível no âmbito privado.']
])

const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b)
 if(!g)throw Error(`Sem tema para item ${n}`)
 if(fragmentos.has(q.id)){
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Farmácia',conteudo:'Fragmento duplicado da extração em colunas',ano:2018,numero_original:n,pagina:q.pagina,apta_resolucao:false,duplicada_de:canonico.get(n),inelegibilidade_motivo:'Fragmento de OCR cruzou duas colunas e duplicou parcialmente o item correspondente; o enunciado completo foi preservado no registro canônico.',motivo:`Fragmento de extração do item ${n}, identificado pela comparação com o caderno oficial.`})
  continue
 }
 let enunciado=limpos.get(n)||q.enunciado
 enunciado=enunciado.replace(/\s*\|\|.*$/s,'').replace(/\s+Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:n>=6&&n<=13?'Saúde Pública':'Farmácia',conteudo:g.conteudo,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade farmacológica, clínica ou regulatória; não é nível oficial da prova.',motivo:`Classificação do item ${n} segundo o tema farmacêutico ou de saúde pública efetivamente cobrado no caderno oficial.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/d1a83a0c98d96dc3-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Caderno oficial comparado com a extração; caso clínico, tabela de consumo e parâmetros da molécula ilustrada associados aos itens correspondentes.'}})
}
if(decisoes.length!==101)throw Error(`Esperadas 101 decisões, recebidas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-farmacia-2018-v107',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-farmacia-2018-v107/acervo-extraido')
