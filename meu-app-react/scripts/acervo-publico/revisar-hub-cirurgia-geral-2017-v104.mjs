import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const base='tmp/revisao-profissional/revisao-hub-farmacia-v103/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-hub-urologia-2017.json','utf8'))
const grupos=[];const definir=(a,b,conteudo,contexto)=>grupos.push({a,b,conteudo,contexto})
definir(1,5,'Cirurgia geral: apendicite aguda, apresentação clínica, diagnóstico e indicação cirúrgica','Em relação à apendicite aguda, seu diagnóstico e tratamento, julgue os itens.')
definir(6,11,'Cirurgia geral: anatomia da parede abdominal, incisões, infecções necrosantes e hérnias','De acordo com a anatomia da parede abdominal e as hérnias abdominais, julgue os itens.')
definir(12,15,'Cirurgia do trauma: trauma abdominal, controle de danos, lesões duodenopancreáticas e laparotomia','Considerando o trauma abdominal e as estratégias de controle de danos, julgue os itens.')
definir(16,21,'Cirurgia geral: abdome agudo, apendicite, obstrução intestinal, diverticulite e isquemia mesentérica','A propósito do abdome agudo, julgue os itens.')
definir(22,26,'Gastroenterologia cirúrgica: úlcera péptica, anatomia gástrica e secreção ácida','Em relação à anatomia gástrica, às patologias e aos tratamentos que podem acometer o estômago, julgue os itens.')
definir(27,30,'Cirurgia hepatobiliopancreática: câncer da vesícula biliar, colecistectomia e coledocolitíase','Acerca dos procedimentos cirúrgicos das patologias do fígado e das vias biliares, julgue os itens.')
definir(31,35,'Cirurgia geral: colecistite aguda, colecistite alitiásica e litíase biliar','Considere a colecistite aguda, doença inflamatória da vesícula biliar. Julgue os itens.')
definir(36,40,'Endocrinologia cirúrgica: doenças da tireoide, investigação por PAAF e tumores endócrinos','A tireoide é uma glândula endócrina anterior do pescoço. Julgue os itens sobre fisiologia e patologias tireoidianas.')
definir(41,46,'Cirurgia geral: dor abdominal, abdome agudo, peritonite e padrões de dor','A instalação de um quadro de abdome agudo é acompanhada por dor abdominal importante e pode exigir intervenção cirúrgica. Julgue os itens.')
definir(47,50,'Cirurgia na gestação: apendicite, diagnóstico e manejo do abdome agudo em gestantes','Caso especial de abdome agudo: paciente gestante, situação que exige atenção à saúde materna e fetal. Julgue os itens.')
definir(51,60,'Infecção em cirurgia: infecção do sítio cirúrgico, sepse, imunidade, infecção urinária e peritonite','As infecções em cirurgias são desafio clínico e podem estar relacionadas ao ato cirúrgico ou a outros procedimentos. Julgue os itens.')
definir(61,65,'Cirurgia do trauma: choque, lesão por esmagamento, avaliação neurológica e trauma cranioabdominal','Caso: homem de 28 anos, vítima de atropelamento, inconsciente, com lesão por esmagamento da coxa esquerda. Chega com FC 140 bpm, PA 80/60 mmHg e FR 32 irpm; foi imobilizado, recebeu oxigênio e teve a ferida tamponada. Julgue os itens.')
definir(66,68,'Cirurgia gástrica: estenose pilórica por úlcera péptica e distúrbios hidroeletrolíticos/ácido-base','Caso: paciente no pré-operatório de cirurgia para estenose pilórica por úlcera péptica apresenta vômitos intensos e desidratação. Após correção hidroeletrolítica e ácido-base, foi submetido a vagotomia troncular, antrectomia e reconstrução Billroth II. Julgue os itens.')
definir(69,70,'Infecções sexualmente transmissíveis: sífilis, penicilina e HPV oncogênico','As infecções sexualmente transmissíveis podem demandar tratamento clínico ou operatório. Julgue os itens.')
definir(71,75,'Oncologia e saúde pública: epidemiologia dos cânceres de próstata, mama, colorretal e colo do útero','Com base na estimativa do Ministério da Saúde para o Brasil no biênio 2016–2017, julgue os itens sobre incidência de neoplasias.')
definir(76,78,'Gastroenterologia cirúrgica: hemorragia digestiva alta e baixa e hipertensão portal','Hemorragia digestiva é causa importante de internação; o manejo pode ser clínico ou cirúrgico. Julgue os itens.')
definir(79,82,'Cirurgia pancreática: pancreatite crônica, insuficiência exócrina/endócrina e derivação de Puestow','Caso: homem de 50 anos, etilista crônico, com dor abdominal no andar superior irradiada para o dorso, esteatorreia e diabetes mellitus, diagnosticado com doença pancreática. Julgue os itens com base no caso.')
definir(83,86,'Cirurgia colorretal e oncologia: câncer de reto e cólon, estadiamento, neoadjuvância e rastreamento','Caso: mulher de 45 anos com alteração do hábito intestinal, tenesmo e hematoquezia há quatro meses, sem outras comorbidades ou histórico familiar de neoplasia. Julgue os itens.')
definir(87,88,'Urologia e trauma: lesão renal por trauma fechado e indicação de exploração cirúrgica','Caso: homem de 25 anos vítima de atropelamento com hematúria macroscópica; exames de imagem mostram lesão renal esquerda sem acometimento de outros órgãos. Julgue os itens sobre tratamento.')
definir(89,90,'Cirurgia hepatobiliopancreática: colecistite aguda calculosa e indicação de colecistectomia','Caso: mulher de 42 anos com dor prolongada no quadrante superior direito, febre, náuseas e vômitos; exame mostra defesa local e leucocitose, com ultrassonografia solicitada. Julgue os itens.')
definir(91,96,'Cirurgia do trauma e terapia intensiva: síndrome compartimental abdominal, fisiopatologia e tratamento','Desde 1989, estuda-se a síndrome compartimental abdominal (SCA), complicação grave associada a morbidade e mortalidade. Julgue os itens.')
definir(97,102,'Cirurgia da parede abdominal: hérnias, fatores de risco, tratamento e dor crônica pós-operatória','A hérnia da parede abdominal é uma patologia cirúrgica frequente; o tratamento varia conforme a localização. Julgue os itens.')
definir(103,107,'Cirurgia do trauma: resposta inflamatória ao trauma (RIT), fisiologia e resposta neuroendócrina','O organismo responde a um agressor externo com alterações fisiológicas para manter a vida; esse conjunto é denominado resposta inflamatória ao trauma (RIT). Julgue os itens.')
definir(108,112,'Ginecologia cirúrgica: endometriose, manifestações clínicas e diagnóstico','Endometriose é caracterizada por implante ectópico de tecido endometrial, geralmente na cavidade pélvica. Julgue os itens.')
definir(113,117,'Cirurgia do trauma: avaliação inicial, exame FAST, choque e complicações tardias','O trauma é causa importante de morte e perda de vida saudável, especialmente entre jovens. Julgue os itens sobre diagnóstico e tratamento do paciente traumatizado.')
definir(118,120,'Cirurgia torácica e trauma: lesões traumáticas do esôfago e abordagem operatória','Lesões traumáticas do esôfago dependem da localização e da precocidade do diagnóstico e tratamento. Julgue os itens.')
const limpar=new Map([
 [35,'A forma alitiásica raramente ocorre nos casos de colecistite aguda.'],
 [46,'As causas de abdome agudo não variam conforme a idade do paciente.'],
 [50,'A apendicite aguda é a doença não obstétrica mais comum que requer tratamento cirúrgico na paciente grávida.'],
 [65,'O hematoma subdural, possível achado desse caso clínico, é um tipo de hematoma que, comparado ao hematoma epidural, é mais frequente e costuma ser mais grave devido à presença de lesão parenquimatosa concomitante.'],
 [68,'Neste caso clínico, o distúrbio ácido-base de provável ocorrência na fase inicial do período pós-operatório é a alcalose, que poderá ser desencadeada pelo aumento da secreção de aldosterona, com reabsorção de bicarbonato.'],
 [82,'Uma das operações utilizadas para o tratamento desse paciente é a derivação do tipo Puestow, que, com suas modificações, envolve basicamente uma pancreatojejunostomia longitudinal.'],
 [86,'Entre os eventos que devem ter ocorrido na carcinogênese do caso da paciente inclui-se a mutação no gene K-ras, considerada atualmente o último evento genético antes da transformação do adenoma em câncer.'],
 [96,'A mensuração da pressão intravesical é um método-padrão para a avaliação da pressão intra-abdominal.'],
 [102,'A dor crônica é um tipo de complicação do tratamento cirúrgico dessas hérnias.'],
 [107,'Em um paciente com RIT, existe o envolvimento direto do sistema nervoso e do sistema circulatório.'],
 [112,'O exame de imagem mais indicado para o diagnóstico dessa doença é a rotina radiológica para abdome agudo.'],
 [117,'O terceiro pico de mortes que ocorre dias após o trauma é devido principalmente a complicações como hematomas intracranianos, pneumotórax hipertensivo e obstrução de vias aéreas.'],
 [120,'A abordagem cirúrgica das lesões do terço inferior do esôfago deve ser por toracotomia no sexto espaço intercostal esquerdo.']
])
const decisoes=[]
for(const q of pendentes){const n=q.numero_original,g=grupos.find(x=>n>=x.a&&n<=x.b);if(!g)throw Error(`Item sem classificação/contexto: ${q.id} #${n}`)
 let enunciado=limpar.get(n)||q.enunciado
 enunciado=enunciado.replaceAll('exten sas','extensas').replaceAll('hemorrági cas','hemorrágicas').replaceAll('p ossível','possível').replaceAll('gest ação','gestação').replaceAll('posi ção','posição').replaceAll('atu ação','atuação').replaceAll('modifi cações','modificações').replaceAll('c as os','casos').replaceAll('les ões','lesões').replaceAll('d essas','dessas').replaceAll('c aso','caso').replaceAll('expr essivo','expressivo')
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Medicina',conteudo:g.conteudo,ano:2017,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; a prova não informa nível oficial de dificuldade.',motivo:`Classificação individual do item ${n} pelo tema clínico-cirúrgico e pelo contexto verificado na página original.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Página original conferida visualmente; casos clínicos e comandos compartilhados vinculados aos itens correspondentes.'}})
}
if(decisoes.length!==106)throw Error(`Esperados 106 registros, encontrados ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-cirurgia-geral-v104',base,decisoes})
