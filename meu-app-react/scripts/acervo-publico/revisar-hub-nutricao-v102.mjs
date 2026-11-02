import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-hub-psicologia-v101/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-hub-nutricao-2017.json','utf8'))
const faixas=[];const definir=(a,b,conteudo)=>faixas.push({a,b,conteudo})
definir(1,5,'Técnicas dietéticas e ciência dos alimentos: amidos, consistência, disfagia, glúten e fibras')
definir(6,10,'Higiene e segurança dos alimentos: legislação sanitária, controle de temperatura e doenças transmitidas por alimentos')
definir(11,16,'Terapia nutricional enteral: preparo, acesso, administração, contraindicações e legislação profissional')
definir(17,21,'Avaliação nutricional: antropometria, risco cardiometabólico, obesidade, idosos e sarcopenia')
definir(22,26,'Bioquímica e nutrição clínica: aminoácidos, qualidade proteica, funções das proteínas e glutamina')
definir(27,31,'Nutrição clínica: diagnóstico, prevenção e controle do diabetes mellitus')
definir(32,35,'Legislação e rotulagem nutricional: alegações, ingredientes, alimentos processados e integrais')
definir(36,38,'Nutrição materno-infantil: composição do leite humano e alimentação complementar')
definir(39,40,'Nutrição clínica e hipertensão arterial: adequação energética e de micronutrientes')
definir(41,43,'Alimentos funcionais: antocianinas, prebióticos e ácidos graxos ômega-3')
definir(44,46,'Nutrição clínica em HIV: trato gastrointestinal, imunidade e efeitos dos antirretrovirais')
definir(47,48,'Vitaminas lipossolúveis: recomendações de ingestão de vitaminas E e D')
definir(49,52,'Avaliação nutricional bioquímica: albumina, proteínas plasmáticas, índice creatinina-altura e transtirretina')
definir(53,56,'Terapia nutricional na pancreatite aguda: composição da dieta, lipídios, proteína e posicionamento da sonda')
definir(57,61,'Dietoterapia na doença renal crônica e hemodiálise: água, sódio, proteína, potássio, fósforo e alimentos nefrotóxicos')
definir(62,64,'Nutrição oncológica pediátrica: terapia enteral, avaliação antropométrica e desnutrição')
definir(65,68,'Dietoterapia no refluxo gastroesofágico: cafeína, lipídios, peso e fracionamento alimentar')
definir(69,70,'Dietoterapia nas doenças diverticulares: fibras, motilidade intestinal e diverticulose')
definir(71,73,'Dietoterapia na litíase biliar: perda de peso, fibras e lipídios')
definir(74,77,'Nutrição clínica em oncologia e sintomas gastrointestinais: constipação, diarreia, náuseas, xerostomia e disfagia')
definir(78,80,'Nutrição oncológica: caquexia, perda de massa muscular e estágios da síndrome')
definir(81,84,'Aconselhamento nutricional e mudança de comportamento: modelo transteórico e estágios de prontidão')
definir(85,89,'Avaliação da composição corporal: pregas cutâneas, bioimpedância, ultrassonografia e calorimetria indireta')
definir(90,93,'Avaliação nutricional clínica: avaliação global subjetiva, ingestão, capacidade funcional e perda de peso')
definir(94,98,'Cirurgia bariátrica: técnicas, componentes restritivos/disabsortivos, indicações e complicações')
definir(99,102,'Diagnóstico nutricional: excesso de peso em idosos, crianças, gestantes e adultos')
definir(103,106,'Nutrição clínica no diabetes: avaliação de sintomas, função renal, glicemia, hemoglobina glicada e planejamento alimentar')
definir(107,109,'Terapia nutricional especializada: algoritmo de decisão, indicações enterais e parenterais e escolha da fórmula')
definir(110,113,'Terapia nutricional parenteral: cálculo de infusão, osmolaridade e adequação de macronutrientes')
definir(114,116,'Nutrição enteral por sonda: prevenção e manejo de obstrução, diarreia e hiperglicemia')
definir(117,120,'Guia Alimentar para a População Brasileira: planejamento, alimentos in natura, saúde e comensalidade')
const contextos=[
 [1,5,'Caso: em estabelecimento assistencial de saúde são preparados mingaus de aveia, amido de milho e fubá, com leite e consistência pastosa. Julgue os itens relativos a esses alimentos.'],
 [6,10,'Caso: após refeições em unidade de alimentação, funcionários apresentaram sintomas gastrointestinais. A inspeção encontrou falhas de higiene, manipulação e controle de temperatura; análises indicaram Staphylococcus aureus. Julgue os itens com base no caso.'],
 [11,16,'Em relação à terapia de nutrição enteral, julgue os itens.'],
 [17,21,'Acerca da obesidade e da desnutrição, julgue os itens subsequentes.'],
 [22,26,'Acerca de aminoácidos e de fontes de proteínas, julgue os itens.'],
 [27,31,'Julgue os itens subsecutivos de acordo com as diretrizes da Sociedade Brasileira de Diabetes de 2015–2016.'],
 [32,35,'Caso: pão integral embalado, comercializado em padaria, com lista de ingredientes informada no rótulo. Julgue os itens relativos à legislação e à classificação do alimento.'],
 [36,38,'No que se refere ao aleitamento materno e à alimentação complementar, julgue os itens.'],
 [39,40,'A respeito da hipertensão arterial sistêmica (HAS), julgue os itens.'],
 [41,43,'A legislação brasileira define alegação de propriedade funcional como aquela relativa ao papel metabólico ou fisiológico que o nutriente ou não nutriente exerce no crescimento, desenvolvimento, manutenção e funções normais do organismo. Julgue os itens.'],
 [44,46,'Com relação ao comprometimento do trato gastrointestinal em portadores de HIV, julgue os itens.'],
 [47,48,'A respeito das necessidades diárias de vitaminas lipossolúveis, julgue os itens.'],
 [49,52,'Em relação aos parâmetros bioquímicos usados na avaliação nutricional de pacientes hospitalizados, julgue os itens.'],
 [53,56,'No que tange à terapia nutricional enteral utilizada durante manifestações clínicas de pancreatite aguda grave, julgue os itens.'],
 [57,61,'Julgue os itens sobre dietoterapia de pacientes com doença renal crônica em hemodiálise.'],
 [62,64,'Com relação ao paciente oncológico pediátrico em tratamento com quimioterapia e radioterapia, julgue os itens.'],
 [65,68,'No que se refere à fisiopatologia e às orientações nutricionais para o refluxo gastroesofágico, julgue os itens.'],
 [69,70,'Acerca da doença diverticular, julgue os itens.'],
 [71,73,'Julgue os itens relativos ao tratamento dietético da litíase biliar.'],
 [74,77,'A respeito de modificações na dieta para pacientes com sinais e sintomas relacionados ao tratamento oncológico, julgue os itens.'],
 [78,80,'No que concerne à caquexia em pacientes com câncer, julgue os itens.'],
 [81,84,'A figura da página original representa as etapas do modelo transteórico de mudança de comportamento. Considere a prontidão para seguir um plano alimentar ou praticar exercícios e julgue os itens.'],
 [85,89,'Acerca da composição corporal e dos métodos para sua avaliação, julgue os itens.'],
 [90,93,'Caso: paciente idoso com desnutrição grave, classificado C em todos os parâmetros da avaliação global subjetiva. Julgue os itens sobre avaliação nutricional com base no caso.'],
 [94,98,'As figuras da página original esquematizam técnicas de cirurgia bariátrica. Julgue os itens sobre procedimentos e características associados.'],
 [99,102,'No que se refere ao diagnóstico de sobrepeso e obesidade, julgue os itens.'],
 [103,106,'Caso clínico: paciente do sexo feminino, 50 anos, diabética e com sobrepeso, apresenta polidipsia, poliúria e polifagia. Julgue os itens sobre sintomas e conduta nutricional.'],
 [107,109,'A figura original apresenta algoritmo de decisão para terapia nutricional especializada. Considere suas situações de avaliação, função gastrointestinal e necessidade de suporte; julgue os itens.'],
 [110,113,'Caso: formulação de nutrição parenteral total para administração em sistema 3 em 1 a adulto de 50 kg metabolicamente estável; composição informada no caderno. Julgue os itens.'],
 [114,116,'No que se refere às estratégias de prevenção e controle de intercorrências associadas à terapia nutricional por sonda, julgue os itens.'],
 [117,120,'De acordo com os princípios e recomendações do Novo Guia Alimentar para a População Brasileira, julgue os itens.']
]
const achar=(n)=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]
const desativar='extr-e07052cae271f69a03da',decisoes=[]
for(const q of pendentes){const n=q.numero_original,t=faixas.find(x=>n>=x.a&&n<=x.b),apoio=achar(n);if(!t||!apoio)throw Error(`Item sem classe/contexto: ${q.id} #${n}`)
 let enunciado=q.enunciado
 if(q.id==='extr-7132be65ae53079d8055')enunciado='O fricassê deveria ter sido resfriado a temperatura inferior a 10 °C em um prazo máximo de 6 horas.'
 if(q.id==='extr-d4f425e1d18544ce5e80')enunciado='Como o agente etiológico foi o Staphylococcus aureus, nessa situação, a contaminação provavelmente está associada aos manipuladores de alimentos.'
 if(q.id==='extr-ae8faccd6d8f744d01f8')enunciado='No caso de idosos, a medida da circunferência da panturrilha inferior a 31 cm é um indicativo de sarcopenia.'
 if(q.id==='extr-a03397c0f0133b694004')enunciado='Em casos de desnutrição, é indicado o aumento proteico nas dietas prescritas.'
 if(q.id==='extr-619dff48c4808d7962b5')enunciado='A calorimetria indireta é um método indicado para realizar a avaliação da composição corporal em crianças.'
 if(q.id==='extr-0a46fbf89f0521aed41c')enunciado='Houve mudança de peso nos últimos seis meses, com redução involuntária de peso superior a 10%.'
 if(q.id==='extr-9be9dcdfcd980e669a64')enunciado='As frutas devem ser excluídas da dieta da referida paciente porque possuem elevado índice glicêmico.'
 enunciado=enunciado.replaceAll('apr esenta','apresenta').replaceAll('r esposta','resposta').replaceAll('situ ação','situação').replaceAll('contraindi cações','contraindicações').replaceAll('com posição','composição').replaceAll('us ado','usado').replaceAll('gli cose','glicose').replaceAll('adaptação do estado','adaptação do estado')
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Nutrição',conteudo:t.conteudo,ano:2017,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na aplicação clínica e conceitual; a prova não informa nível oficial.',motivo:`Classificação nutricional específica do item ${n}, conferida na página ${q.pagina} do caderno oficial.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:'Página original conferida visualmente; caso, comando compartilhado e referências a figura/algoritmo associados ao bloco correspondente.'}}
 if(q.id===desativar){d.apta_resolucao=false;d.inelegibilidade_motivo='Fragmento de OCR separado indevidamente do item 9: contém somente “°C em um prazo máximo de 6 horas”, sem enunciado autônomo; o texto foi reincorporado ao item 9.';d.duplicada_de='extr-7132be65ae53079d8055'}
 decisoes.push(d)
}
if(decisoes.length!==121)throw Error(`Esperados 121 registros, encontrados ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-nutricao-v102',base,decisoes})
