import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-hub-terapia-ocupacional-caderno-completo-v100/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-hub-psicologia-2017.json','utf8'))
const temas=[];const definir=(a,b,materia,conteudo)=>temas.push({a,b,materia,conteudo})
const ps='Psicologia'
definir(1,5,ps,'Psicologia jurídica e social: violência intrafamiliar, negligência e efeitos da violência na infância')
definir(6,10,ps,'Psicologia social e familiar: violência intrafamiliar, relações de poder e fatores de risco')
definir(11,15,ps,'Teorias psicológicas: Winnicott, abordagem sistêmica, Lacan, behaviorismo e terapia cognitivo-comportamental')
definir(16,20,ps,'Teorias psicológicas: Jung, psicologia social, psicanálise freudiana, aparelho psíquico e princípio do prazer')
definir(21,30,ps,'Psicologia do desenvolvimento e avaliação infantil: sinais de risco para transtorno do espectro autista e intervenção precoce')
definir(31,35,ps,'Psicologia organizacional: poder, liderança, coalizões e dinâmica de grupos no trabalho')
definir(36,40,ps,'Entrevista psicológica: entrevista psicodinâmica, clínica, de seleção e orientação profissional')
definir(41,46,ps,'Psicologia social: violência psicológica, preconceito, assédio moral e relações de poder')
definir(47,55,ps,'Psicologia clínica e psicodinâmica: sofrimento, defesas do ego, recalque, narcisismo e sintomas psicossomáticos')
definir(56,59,ps,'Psicoterapia breve: crise, acolhimento, transferência e manejo clínico do sofrimento')
definir(60,64,ps,'Psicologia da saúde: dor, percepção álgica, avaliação e estratégias psicológicas de manejo')
definir(65,69,ps,'Psicologia da saúde e hospitalar: equipe interdisciplinar, prevenção, interconsulta e modelos de saúde')
definir(70,81,ps,'Psicologia da saúde e análise do comportamento: obesidade, compulsão alimentar, cirurgia bariátrica e mudança comportamental')
definir(82,85,ps,'Psicologia da saúde: adesão ao tratamento, comunicação clínica e barreiras à adesão medicamentosa')
definir(86,90,ps,'Psicologia hospitalar e cuidados paliativos: dor oncológica, enfrentamento, autonomia e decisões de fim de vida')
definir(91,95,ps,'Métodos de pesquisa em Psicologia: delineamento experimental, variáveis, observação e validade')
definir(96,101,ps,'Psicologia cognitiva: memória de trabalho, memória episódica e semântica, interferência e esquecimento')
definir(102,106,ps,'Análise do comportamento e aprendizagem: punição, condicionamento, extinção, contingências e reflexos')
definir(107,111,ps,'Bases biológicas do comportamento: sistema nervoso autônomo, neuroplasticidade, linguagem, emoção e potencial de ação')
definir(112,120,ps,'Psicologia cognitiva e psicofisiologia: Gestalt, percepção, sono, visão, audição e ritmos circadianos')
const contextos=[
 [1,5,'Caso hipotético: Jonathas, seis anos, vive em abrigo, apresenta timidez, agressividade, baixa autoestima e isolamento; há relato de negligência, uso de drogas pela mãe, conflitos e ameaças no ambiente familiar. Julgue os itens com base no caso.'],
 [6,10,'Com relação à violência intrafamiliar, às relações de poder e a fatores de risco familiares, julgue os itens.'],
 [11,15,'No que se refere às abordagens teóricas em Psicologia, julgue os itens.'],
 [16,20,'No que tange às teorias psicológicas, julgue os itens.'],
 [21,25,'Caso clínico: Gilberto, de um ano e cinco meses, apresenta dificuldades de interação, linguagem e repertório comportamental; a mãe relata seletividade alimentar, irritabilidade e desconforto com ruídos e aglomerações. Julgue os itens com base no caso.'],
 [26,30,'Considere o caso clínico de Gilberto, a avaliação do desenvolvimento, a identificação de sinais de risco e a intervenção precoce. Julgue os itens.'],
 [31,35,'Acerca do poder nos grupos sociais, em especial nos ambientes de trabalho, julgue os itens.'],
 [36,40,'Julgue os itens relativos ao uso da entrevista psicológica em instituições.'],
 [41,46,'Com relação à violência psicológica, julgue os itens.'],
 [47,50,'A respeito do sofrimento psíquico, julgue os itens subsequentes.'],
 [51,55,'Considerando as abordagens psicodinâmicas para a compreensão do sujeito nas suas relações sociais, julgue os itens.'],
 [56,59,'Julgue os itens a respeito da psicoterapia breve.'],
 [60,64,'Com relação ao processo álgico, conceitos, avaliação e tratamento da dor, julgue os itens.'],
 [65,69,'Julgue os itens sobre trabalho do psicólogo da saúde, interconsulta hospitalar e modelos de saúde.'],
 [70,81,'Caso clínico: homem de 38 anos, com obesidade grave, rotina de trabalho estressante, alimentação baseada em fast-food e indicação médica de cirurgia bariátrica. Julgue os itens com base no caso.'],
 [82,85,'Acerca da adesão ao tratamento de saúde, julgue os itens.'],
 [86,90,'Caso clínico: paciente com câncer agressivo em estágio avançado, dor, decisão sobre tratamentos e desejo de morrer com dignidade, com suporte familiar e cuidados paliativos em consideração. Julgue os itens com base no caso.'],
 [91,95,'Julgue os itens referentes a métodos e estudos utilizados por psicólogos.'],
 [96,101,'A respeito da memória, julgue os itens subsequentes.'],
 [102,106,'Acerca dos processos de aprendizagem e do comportamento, julgue os itens.'],
 [107,111,'No que se refere às bases biológicas do comportamento, julgue os itens.'],
 [112,120,'Com relação aos processos sensoriais, perceptuais e da consciência, julgue os itens.']
]
const limpeza=new Map([
 [2,'Jonathas apresenta, predominantemente, forma ativa de manifestação diante do contexto disfuncional experienciado por ele.'],
 [15,'De acordo com as contribuições da teoria cognitivo-comportamental, o comportamento pode ser compreendido a partir de sua associação com pensamentos, cognições e ideias.'],
 [20,'De acordo com a teoria psicanalítica proposta por Freud, o id não conhece juízo de valor, funcionando sob a égide da satisfação imediata, ou seja, do princípio do prazer.'],
 [25,'O atendimento de Gilberto deverá ser realizado apenas pelo pediatra ou pelo psiquiatra infantil, uma vez que são estes os profissionais capacitados para a detecção de transtornos mentais com início precoce.'],
 [40,'A entrevista de orientação profissional, centrada nas experiências vividas em nível individual e em diferentes grupos sociais, visa apreender e compreender o funcionamento psicológico do entrevistado.'],
 [50,'Sofrimento é a dor psíquica do recalque, a não realização do desejo, o confronto do princípio de realidade com o princípio de prazer.'],
 [64,'Na avaliação da dor, os profissionais de saúde devem selecionar aquilo que parece compatível com o processo álgico, pois o relato do paciente apresenta, em geral, uma percepção distorcida ou exagerada quanto às características ou à intensidade real da dor.'],
 [69,'No ambiente hospitalar, a psicologia da saúde é exercida em atenção aos mediadores psicológicos do processo saúde-doença, relativos às condições físicas do organismo.'],
 [75,'Para esse paciente, é necessária a intervenção psicológica no controle do estresse, visto que, entre outros fatores, a exposição continuada ao estressor rebaixa as funções protetoras do sistema imunológico, com o consequente aumento da vulnerabilidade do organismo para doenças.'],
 [85,'Profissionais de saúde que usam linguagem formal e científica conseguem maior adesão do paciente ao tratamento do que profissionais que usam linguagem popular, tipicamente utilizada pelo próprio paciente e sua comunidade.'],
 [105,'Na contingência de três termos, o estímulo discriminativo antecede o comportamento operante e o estímulo reforçador o sucede.'],
 [111,'Para que os neurônios disparem, é necessário que eles sejam despolarizados em relação ao meio extracelular.'],
 [120,'Os ritmos circadianos podem ser afetados pelas estações do ano, fato que, por sua vez, pode contribuir para a existência de uma maior incidência de depressão nos meses mais frios do ano.']
])
const encontrar=(n,arr)=>arr.find(([a,b])=>n>=a&&n<=b)?.[2]
const decisoes=[]
for(const q of pendentes){const n=q.numero_original,t=temas.find(x=>n>=x.a&&n<=x.b),apoio=encontrar(n,contextos);if(!t||!apoio)throw Error(`Questão sem tema/contexto: ${n}`)
 let enunciado=limpeza.get(n)||q.enunciado
 enunciado=enunciado.replaceAll('pr edominantemente','predominantemente').replaceAll('contribui ções','contribuições').replaceAll('coali zões','coalizões').replaceAll('b ase','base').replaceAll('medi adores','mediadores').replaceAll('psicológi cos','psicológicos').replaceAll('infan til','infantil').replaceAll('favor ecer','favorecer').replaceAll('desne cessárias','desnecessárias').replaceAll('compor tamento','comportamento')
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2017,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual e aplicada; o caderno não informa dificuldade oficial.',motivo:`Classificação individual do item ${n} pelo tema psicológico e pelo comando/contexto verificado na página original ${q.pagina}.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:'Página original conferida visualmente; contexto clínico e comando compartilhado vinculados aos itens correspondentes, com contaminações de extração corrigidas.'}})
}
if(decisoes.length!==120)throw Error(`Esperados 120 itens, encontrados ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-psicologia-v101',base,decisoes})
