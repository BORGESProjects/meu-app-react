import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const base = 'tmp/revisao-profissional/revisao-hub-cirurgia-geral-v104/acervo-extraido'
const pendentes = JSON.parse(await fs.readFile('tmp/pendentes-77bc33648b749c71.json', 'utf8'))
const grupos = []
const definir = (a, b, conteudo, contexto) => grupos.push({ a, b, conteudo, contexto })
definir(1, 5, 'Psicopatologia: avaliação clínica do luto e transtornos depressivos/obsessivo-compulsivos', 'Caso clínico 9A1AAA: Ana, 57 anos, perdeu o marido Gustavo, falecido por câncer; seus filhos José e Antônia também apresentam mudanças emocionais e comportamentais. Julgue os itens com base no DSM-5 e na CID-10.')
definir(6, 10, 'Psicologia da saúde: luto antecipatório e cuidados paliativos', 'Caso clínico 9A1AAA. Considere o relato familiar e o adoecimento de Gustavo por câncer, seguido de falecimento, para julgar itens sobre luto antecipatório e cuidados paliativos.')
definir(11, 15, 'Psicologia clínica: luto normal, luto crônico e fatores de adaptação', 'Julgue os itens sobre manifestações, curso e fatores associados ao processo de luto.')
definir(16, 20, 'Psicologia clínica: abordagens psicoterápicas e elaboração do luto', 'Julgue os itens sobre abordagens psicoterápicas, intervenções e elaboração do luto, incluindo conceitos freudianos.')
definir(21, 30, 'Psicopatologia: psicose, esquizofrenia e transtornos relacionados', 'Caso clínico de Juliano, 30 anos, com início agudo de delírios persecutórios e alterações comportamentais, sem relato de uso de substâncias ou condição médica geral. Julgue os itens conforme DSM-5 e CID-10.')
definir(31, 35, 'Psicopatologia e avaliação psicológica: funções psíquicas, entrevista, simulação e dissimulação', 'Julgue os itens sobre psicopatologia, exame psíquico, entrevista clínica e avaliação de sinais e sintomas.')
definir(36, 40, 'Psicologia da saúde: comportamento alimentar, obesidade e transtornos alimentares', 'Julgue os itens sobre comportamento alimentar, obesidade, anorexia nervosa, compulsão alimentar e bulimia.')
definir(41, 45, 'Psicologia do desenvolvimento e social: violência psicológica e modelo ecológico', 'Julgue os itens sobre violência psicológica contra crianças e adolescentes e os níveis sistêmicos do modelo ecológico.')
definir(46, 51, 'Psicologia hospitalar: princípios e práticas de cuidados paliativos', 'Contexto: o tratamento paliativo considera a morte parte do ciclo vital e prioriza o cuidado integral. Julgue os itens sobre objetivos, limites e acolhimento em cuidados paliativos.')
definir(52, 56, 'Psico-oncologia: atuação psicológica em enfermidades crônicas', 'Julgue os itens sobre as funções do psicólogo no atendimento a pessoas com enfermidades crônicas.')
definir(57, 61, 'Psico-oncologia: acompanhamento psicológico de pacientes com câncer', 'Julgue os itens sobre suporte ao paciente e à família, efeitos do tratamento, depressão, informação clínica e participação no cuidado oncológico.')
definir(62, 67, 'Psico-oncologia: avaliação e intervenção psicológica em dor', 'Julgue os itens sobre avaliação da dor, trabalho interdisciplinar e intervenções psicológicas durante o tratamento oncológico.')
definir(68, 71, 'Psicologia hospitalar: comunicação de más notícias', 'Julgue os itens sobre comunicação de más notícias em doenças crônicas e sua repercussão para paciente, familiares e profissionais de saúde.')
definir(72, 75, 'Psico-oncologia: náusea antecipatória e condicionamento', 'Contexto: pacientes em quimioterapia podem apresentar náusea antecipatória antes das sessões. Julgue os itens sobre condicionamento, fatores associados e manejo comportamental.')
definir(76, 80, 'Psico-oncologia: comunicação do diagnóstico, prevenção e diagnóstico precoce do câncer', 'Julgue os itens sobre comunicação do diagnóstico de câncer, sofrimento psicossocial, rastreamento e diagnóstico precoce.')
definir(81, 86, 'Psicologia da saúde: estratégias de enfrentamento de doenças graves', 'Julgue os itens sobre psicoeducação, coping, estratégias centradas no problema ou na emoção e modelo transacional de enfrentamento.')
definir(87, 90, 'Psicologia hospitalar: cuidados paliativos e autonomia do paciente', 'Situação hipotética: paciente de 80 anos com câncer em estágio terminal, cardiopatia, hipertensão, episódios de angina e infartos, transferido para unidade de internação com familiares e equipe focada em qualidade de vida e alívio de sintomas. Julgue os itens sobre cuidados paliativos.')
definir(91, 96, 'Psicologia da saúde: religiosidade, espiritualidade e enfrentamento da doença', 'Julgue os itens sobre a relação entre religiosidade/espiritualidade, saúde, manejo clínico e enfrentamento religioso/espiritual.')
definir(97, 99, 'Psicologia da saúde: intervenção psicossocial e avaliação de coping', 'Julgue os itens sobre planejamento e avaliação de intervenções psicossociais para pacientes oncológicos e familiares.')
definir(100, 105, 'Psicologia hospitalar: conceitos, integração e acolhimento em cuidados paliativos', 'Julgue os itens sobre definição, indicação, humanização, normatização e acolhimento de pacientes e cuidadores em cuidados paliativos.')
definir(106, 110, 'Psicologia da saúde: avaliação cognitiva e modelo transacional do estresse', 'Contexto: diante de situações potencialmente estressoras, pessoas podem reagir de formas diferentes. Julgue os itens conforme o modelo transacional do estresse de Lazarus e Folkman.')
definir(111, 115, 'Psicologia da saúde: modelo transteórico, mudança comportamental e prevenção', 'Contexto: fatores biológicos, psicológicos e sociais influenciam saúde, adoecimento, tratamento e recuperação. Julgue os itens sobre estágios de mudança e níveis de prevenção.')
definir(116, 120, 'Psicologia da saúde: sono e higiene do sono', 'Contexto: orientações psicológicas para pessoas com dificuldade para dormir ou sono de má qualidade. Julgue os itens sobre higiene do sono e neurogênese.')

const limpar = new Map([
 [5, 'A descrição do comportamento de José é suficiente para supor que ele apresenta um quadro de transtorno obsessivo-compulsivo desencadeado pela perda do pai.'],
 [8, 'A adoção de cuidados paliativos teria visado prevenir o luto complicado no caso da família de Gustavo.'],
 [10, 'Na perspectiva dos cuidados paliativos, a morte de Gustavo é considerada um processo natural.'],
 [27, 'Diante da resposta de Juliano às intervenções clínicas, pode-se afirmar que o paciente apresenta um quadro psicótico breve.'],
 [35, 'Dissimulação e simulação são sinônimos e referem-se à ação de esconder ou negar, de maneira voluntária, a presença de sinais e sintomas psicopatológicos.'],
 [40, 'Comer compulsivo (binge eating), também denominado bulimia, caracteriza-se por um desejo irresistível de ingerir comida, seguido de vômitos e purgações autoinduzidas.'],
 [71, 'Conceitualmente, no contexto médico-hospitalar, a má notícia é sempre um informe atestando a iminência de morte dado ao paciente ou a sua família.'],
 [75, 'A náusea antecipatória pode ser predita pelas características da medicação utilizada e ocorre da mesma forma em todos os pacientes submetidos ao mesmo tratamento.'],
 [90, 'O objetivo desses programas, que não se propõem a realizar diagnósticos sofisticados ou tratamentos com alta tecnologia, é a diminuição do sofrimento causado por doenças malignas e degenerativas.'],
 [110, 'A avaliação da situação estressora é um processo cujo resultado pode variar mais de uma vez ao longo do tempo.'],
 [115, 'Conforme o modelo transteórico, ou modelo de estágios de mudança, uma pessoa obesa e hipertensa que não adota mudanças em sua alimentação está na fase de pré-contemplação.'],
 [120, 'O sono favorece a neurogênese.']
])

const canonicos = new Map()
const decisoes = []
for (const q of pendentes) {
 const n = Number(q.numero_original)
 const g = grupos.find(x => n >= x.a && n <= x.b)
 if (!g) throw new Error(`Questão sem faixa temática: ${q.id} / ${n}`)
 const primeiro = canonicos.get(n)
 if (!primeiro) canonicos.set(n, q.id)
 const duplicada = Boolean(primeiro)
 let enunciado = limpar.get(n) || q.enunciado
 enunciado = enunciado.replace(/\s*\|\|.*$/s, '').replace(/\s+Espaço livre\s*$/i, '').replace(/\s+/g, ' ').trim()
 if (duplicada) {
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Psicologia',conteudo:g.conteudo,ano:2018,numero_original:n,pagina:q.pagina,apta_resolucao:false,duplicada_de:primeiro,inelegibilidade_motivo:'Cópia redundante do mesmo item e número do caderno oficial HUB 2018; a versão canônica foi preservada.',motivo:`Duplicata do item ${n}, comparada com a versão canônica do mesmo caderno e número.`})
  continue
 }
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Psicologia',conteudo:g.conteudo,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade clínica e conceitual; não é nível oficial do caderno.',motivo:`Classificação do item ${n} pelo assunto expresso no enunciado e comando do caderno oficial HUB 2018.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/77bc33648b749c71-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Caderno oficial comparado com o texto extraído; comando ou contexto compartilhado vinculado ao item e contaminações de OCR removidas.'}})
}
if (decisoes.length !== 123 || canonicos.size !== 120) throw new Error(`Esperadas 123 decisões cobrindo 120 itens, recebidas ${decisoes.length}/${canonicos.size}`)
await aplicarRevisoesIndividuais({nome:'revisao-hub-psicologia-2018-v105',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-psicologia-2018-v105/acervo-extraido')
