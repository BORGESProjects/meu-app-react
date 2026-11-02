import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const base = 'tmp/revisao-profissional/revisao-hub-psicologia-2018-v105/acervo-extraido'
const pendentes = JSON.parse(await fs.readFile('tmp/pendentes-b2ca5bf574c87fbe.json', 'utf8'))
const grupos = []
const definir = (a,b,conteudo,contexto) => grupos.push({a,b,conteudo,contexto})
definir(1,3,'Saúde coletiva em Odontologia: Estratégia Saúde da Família e atenção primária','Julgue os itens sobre organização da Estratégia Saúde da Família e acompanhamento do processo saúde-doença na atenção básica.')
definir(4,5,'Estomatologia: lesões potencialmente malignas, câncer bucal e referência/contrarreferência','Caso clínico: homem de 57 anos, tabagista há 40 anos, com mancha branca no assoalho bucal, higiene precária e lesão em soalho da boca. Considere o protocolo de referência e contrarreferência para lesões nos centros de especialidades odontológicas.')
definir(6,8,'Saúde bucal coletiva: prevenção e cuidado odontológico ao longo do ciclo de vida','Julgue os itens sobre ações de saúde bucal para adolescentes, adultos e idosos, no âmbito da atenção básica.')
definir(9,10,'Odontopediatria: sucção não nutritiva, chupeta e desenvolvimento da oclusão','Julgue os itens sobre uso racional de chupeta em bebês e repercussões do hábito na dentição e oclusão.')
definir(11,16,'Cariologia preventiva: biofilme, clorexidina, arginina, flúor, xilitol e edulcorantes','Julgue os itens sobre medidas preventivas e controle da atividade cariogênica.')
definir(17,22,'Urgência odontológica: infecção odontogênica, disseminação, farmacoterapia e conduta','Caso clínico: mulher de 47 anos, hipertensa e diabética, com edema facial esquerdo envolvendo região orbital, extensa cárie no dente 23 e radiolucidez apical extensa. Usa losartana e metformina. Julgue os itens sobre tratamento e conduta. Inclui-se a análise de escolha farmacológica e segurança clínica.')
definir(23,25,'Urgência odontológica: febre associada a infecções e manejo clínico','Julgue os itens sobre avaliação e controle da febre em pessoas com infecções odontológicas.')
definir(26,27,'Dentística restauradora: restaurações diretas/indiretas e adesão dentinária','Contexto: restauração de pré-molar superior com lesão de cárie profunda. Julgue os itens sobre resina e adesivos dentinários.')
definir(28,30,'Patologia clínica: coagulograma, hemostasia e interpretação de testes','Contexto e dados da tabela: homem de 32 anos com suspeita de deficiência de coagulação. Valores de referência/paciente: TP 11–13 s (70%–100%) / 30 s; retração do coágulo 45%–55% / 47%; TPP 40–60 s / 55 s; TT 9–15 s / 20 s. Julgue os itens com base nesses resultados.')
definir(31,35,'Endodontia: abscesso dentoalveolar agudo, necrose pulpar e resposta periapical','Julgue os itens sobre abscesso dentoalveolar agudo, drenagem, necrose pulpar, histopatologia e resposta inflamatória periapical.')
definir(36,40,'Fisiologia oral: saliva, composição, pH, imunidade e funções protetoras','Julgue os itens sobre secreção salivar, tampão bicarbonato, imunoglobulinas, digestão, limpeza e proteção dos tecidos bucais.')
definir(41,45,'Cariologia: atividade da doença, controle do biofilme e decisão restauradora','Julgue os itens sobre manejo de lesões cariosas, abordagem conservadora, remineralização e indicação de restauração.')
definir(46,50,'Dentística estética: percepção de cor, forma dental, sorriso e corredor bucal','Julgue os itens sobre princípios de estética dental, forma, proporção, desgaste e harmonia do sorriso.')
definir(51,55,'Embriologia e desenvolvimento dentário: odontogênese, cemento e bainha de Hertwig','Julgue os itens sobre desenvolvimento dos tecidos dentários e periodontais, formação radicular e fases da odontogênese.')
definir(56,60,'Histologia oral: dentina, complexo dentinopulpar, polpa e microcirculação','Julgue os itens sobre estrutura dentinária, odontoblastos, resposta pulpar, células mesenquimais e microcirculação.')
definir(61,65,'Periodontia e oncologia: periodontite crônica, biofilme e cuidado antes da terapia oncológica','Julgue os itens sobre periodontite crônica, microbiota periodontal e tratamento periodontal em pacientes que serão submetidos à radioterapia ou quimioterapia.')
definir(66,70,'Patologia oral: hipercementose, cemento radicular e exodontia','Caso clínico: paciente em tratamento oncológico com indicação de exodontia do dente 36 antes da radioterapia mandibular; exame radiográfico mostra hipercementose. Julgue os itens sobre cemento, concrescência e extração.')
definir(71,76,'Periodontia: diagnóstico, classificação, mobilidade, furca e plano de tratamento','Caso clínico: paciente de 17 anos, saudável, com mobilidade nos dentes 11, 36 e 46, bolsas profundas, sangramento à sondagem, lesões de furca grau 3 e perda óssea vertical, sem cálculo significativo. Julgue os itens de diagnóstico e tratamento periodontal.')
definir(77,81,'Microbiologia oral: biofilme, microbiota peri-implantar, cárie e infecções endodônticas','Julgue os itens sobre microbiota oral, mucosite peri-implantar, histoplasmose, estreptococos mutans, Enterococcus faecalis e arqueas em sítios periodontais.')
definir(82,84,'Endodontia e periodontia: lesões endoperiodontais e diagnóstico diferencial','Julgue os itens sobre lesões endodônticas, periodontais e combinadas. No item situacional, considere o dente 25 com bolsa até o ápice, drenagem periodontal, ausência de vitalidade, cárie extensa e alteração apical sugestiva de necrose pulpar.')
definir(85,88,'Estomatologia e histologia oral: língua, cor dental e variações anatômicas normais','Julgue os itens sobre alterações relacionadas à idade, cor dos dentes, grânulos de Fordyce e pigmentação melânica gengival.')
definir(89,90,'Odontologia oncológica: efeitos da quimioterapia e radioterapia em tecidos bucais','Julgue os itens sobre mucosite oral, efeitos da quimioterapia e repercussões da irradiação na polpa e no germe dentário.')
definir(91,96,'Saúde coletiva em Odontologia: atribuições da equipe de saúde bucal na Estratégia Saúde da Família','Julgue os itens sobre atribuições do cirurgião-dentista, técnico e auxiliar de saúde bucal, planejamento, agenda, ações coletivas e atendimento de urgência.')
definir(97,101,'Cariologia: vigilância, diagnóstico, controle e prevenção da cárie','Julgue os itens sobre controle da doença cárie, biofilme, vigilância coletiva e diagnóstico clínico/radiográfico.')
definir(102,105,'Cariologia preventiva: flúor, fluorose dental e fluoretação da água','Julgue os itens sobre dose e período de exposição ao flúor, fluorose e fluoretação de abastecimento público.')
definir(106,111,'Política de saúde bucal: Brasil Sorridente, CEO, GraduaCEO e organização da equipe','Julgue os itens sobre o programa Brasil Sorridente, padrões do GraduaCEO, atribuições dos centros de especialidades odontológicas e composição das equipes de saúde bucal.')
definir(112,114,'Odontologia oncológica: preparo odontológico e prevenção de complicações da oncoterapia','Julgue os itens sobre avaliação e estabilização da saúde bucal antes de radioterapia/quimioterapia, extrações prévias e fatores de risco para complicações orais.')
definir(115,120,'Estomatologia e oncologia: mucosite oral, candidíase e prevenção durante radioterapia','Julgue os itens sobre fases da mucosite, candidíase, cuidados locais, soluções de bochecho e laser de baixa energia.')

const limpar = new Map([
 [5,'Havendo suspeita de lesão maligna, o profissional deverá, primeiramente, encaminhar o paciente para um hospital de referência, onde poderá ser realizada uma biópsia.'],
 [22,'Indica-se a suspensão da administração de losartana potássica 50 mg durante setenta e duas horas, haja vista o risco evidente de hemorragia oftálmica.'],
 [30,'O tempo de protrombina alongado encontra-se vinculado à deficiência de alguns dos fatores da via extrínseca.'],
 [35,'Ao exame histológico, a lesão apresenta numerosos leucócitos polimorfonucleares desintegrados, resíduos e remanescentes celulares, além de acúmulo de exsudato purulento.'],
 [60,'Assim como em qualquer tecido humano, na polpa a microcirculação tem a função primária de fornecer oxigênio e nutrientes para as células e drenar gás carbônico e resíduos do metabolismo celular.'],
 [65,'A periodontite crônica tem como fator etiológico primário o cálculo dentário, que, além de ser revestido por uma superfície não mineralizada de biofilme e detritos bacterianos, é altamente retentivo.'],
 [70,'Apesar de a espessura do cemento variar conforme a região — aumenta gradualmente em direção ao ápice —, em caso de hipercementose, ocorre uma formação excessiva de cemento que resulta em espessamento anormal, com alteração da forma macroscópica da raiz.'],
 [76,'Tanto o periodonto de proteção quanto o de sustentação foram afetados nos dentes 11, 36 e 46 do paciente; caso a junção cemento esmalte esteja abaixo da margem gengival e não ao mesmo nível, a medida do nível de inserção será menor que a medida da bolsa periodontal, visto que não há recessão gengival.'],
 [96,'O cirurgião-dentista deve atender tanto demandas de urgência odontológica quanto pequenas cirurgias ambulatoriais.'],
 [105,'A fluorose dental decorre de um efeito sistêmico resultante da ingestão crônica de pequenas quantidades de flúor durante a amelogênese.'],
 [111,'A equipe de saúde bucal modalidade tipo III, composta por um cirurgião-dentista, um auxiliar de saúde bucal e um técnico de saúde bucal, realiza atendimento nas unidades básicas de saúde.']
])

const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b)
 if(!g)throw new Error(`Questão sem faixa temática: ${q.id} / ${n}`)
 let enunciado=limpar.get(n)||q.enunciado
 enunciado=enunciado.replace(/\s*\|\|.*$/s,'').replace(/\s+Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Odontologia',conteudo:g.conteudo,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnico-clínica; não é nível oficial do caderno.',motivo:`Classificação de Odontologia do item ${n} pelo tema clínico, epidemiológico ou biológico do enunciado e do comando oficial.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/b2ca5bf574c87fbe-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Caderno oficial comparado com a extração; contexto clínico, comando comum e dados do coagulograma preservados junto às questões pertinentes.'}})
}
if(decisoes.length!==104)throw new Error(`Esperadas 104 questões pendentes, recebidas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-odontologia-2018-v106',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-odontologia-2018-v106/acervo-extraido')
