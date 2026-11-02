import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-2016-terapia-ocupacional-cargo7-v525'
const doc='892d5e4ab4ef27e1'
const base='tmp/revisao-profissional/revisao-depen-cargo8-agente-federal-execucao-penal-v524/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_007_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_007_01.pdf'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)

const respostas={
 51:'E',52:'C',53:'E',54:'C',55:'C',56:'E',57:'E',58:'C',59:'C',60:'C',61:'C',62:'E',63:'C',64:'E',65:'C',66:'C',67:'E',68:'C',69:'C',70:'E',
 71:'C',72:'E',73:'E',74:'E',75:'E',76:'C',77:'E',78:'E',79:'C',80:'C',81:'C',82:'E',83:'E',84:'E',85:'C',86:'C',87:'E',88:'E',89:'C',90:'C',
 91:'C',92:'C',93:'E',94:'C',95:'E',96:'E',97:'E',98:'E',99:'C',100:'C',101:'C',102:'E',103:'E',104:'C',105:'E',106:'E',107:'E',108:'E',109:'C',110:'C',
 111:'C',112:'E',113:'C',114:'C',115:'E',116:'C',117:'C',118:'E',119:'E',120:'E'
}
const temas={
 51:'Modelos de ocupação humana e fundamentos da terapia ocupacional',52:'Ciência ocupacional: forma, função e significado da ocupação',53:'Fundamentos científicos da prática de terapia ocupacional',54:'Terapia ocupacional em equipes interdisciplinares e contextos micro e macrossociais',55:'Comportamento ocupacional: adaptação, motivação, tempo e papéis',
 56:'Avaliação do desempenho ocupacional e classificação da incapacidade para autocuidado',57:'Classificação Internacional de Funcionalidade, Incapacidade e Saúde (CIF)',58:'Adaptação transcultural de instrumentos e desenvolvimento de escalas',59:'Validade de instrumentos: conteúdo, critério e construto',
 60:'Recursos terapêuticos: treino de memória, atenção e concentração',61:'Atividades terapêuticas ocupacionais e áreas de desempenho',62:'Autonomia profissional, alta e encaminhamento em terapia ocupacional',63:'Tecnologia assistiva: prescrição, confecção, treino e ajuste',
 64:'Abordagens grupais: condições de participação e presença do terapeuta',65:'Grupo como ferramenta de compreensão do sujeito e do contexto social',66:'Abordagem grupal em doenças crônicas e construção de significados',67:'Composição de grupos terapêuticos com participantes de diferentes condições',68:'Classificação de grupos terapêuticos segundo Mosey',
 69:'Equipes interdisciplinares, saúde mental e reforma psiquiátrica',70:'Atendimento interdisciplinar à criança com paralisia cerebral',71:'Centros de Atenção Psicossocial e trabalho interdisciplinar',72:'Abordagem interdisciplinar após acidente vascular encefálico',73:'Atendimento domiciliar em terapia ocupacional e prevenção',
 74:'Ergonomia em terapia ocupacional: prevenção e saúde do trabalhador',75:'Anatomia funcional do punho: músculos flexores e extensores',76:'Desempenho ocupacional e papéis profissionais',
 77:'Traumatismo cranioencefálico: estratégias compensatórias e tecnologia assistiva',78:'Avaliação ocupacional e histórico de uso de álcool',79:'Idade e dimensão temporal do contexto de desempenho',80:'Traumatismo cranioencefálico: cognição, segurança e retorno ao trabalho',81:'Componentes do desempenho e avaliação após traumatismo cranioencefálico',82:'Escala Rancho Los Amigos: prognóstico e funcionamento cognitivo',
 83:'Acidente vascular encefálico: negligência corporal e espacial',84:'Acidente vascular encefálico: órteses, tônus e espasticidade',85:'Acidente vascular encefálico: oclusão e ruptura vascular',86:'Acidente vascular encefálico: padrões sinérgicos de movimento',
 87:'Níveis de intervenção: adaptação ambiental e prevenção de deformidades',88:'Níveis de intervenção e doenças crônicas/progressivas',89:'Medida de Independência Funcional e avaliação no nível de alívio de problemas',90:'Prevenção e participação comunitária',91:'Independência e atividades de vida diária',92:'Acessibilidade e barreiras arquitetônicas nos níveis de intervenção',
 93:'Pediatria: método Bobath e facilitação do movimento',94:'Pediatria: contexto de desempenho e participação escolar',95:'Mielomeningocele: apoio dos membros superiores e função manual',96:'Mobilidade pediátrica: inclinação (tilt) em cadeira de rodas',97:'Pediatria: tônus muscular e espasticidade',
 98:'Saúde mental: atuação em serviços de urgência psiquiátrica',99:'Saúde mental: avaliação ocupacional, relações sociais e participação',100:'Saúde mental: interação social e fortalecimento da rede de apoio',
 101:'Baixa visão: iluminação doméstica, sombras e segurança',102:'Deficiência auditiva: estimulação precoce e desenvolvimento da comunicação',103:'Deficiências auditiva e visual: brincadeiras concretas e simbólicas',104:'Deficiência visual: desenvolvimento motor e reflexos primitivos',
 105:'Terapia ocupacional no campo social e ampliação do setting',106:'Território e integração entre sujeito e contexto social',107:'Vulnerabilidade social e prioridades da terapia ocupacional',
 108:'Código de Ética: compartilhamento de procedimentos profissionais',109:'Código de Ética: identificação e título profissional',110:'Código de Ética: divulgação de agradecimentos de pacientes',111:'Código de Ética: responsabilidade do preceptor por residentes',
 112:'Atenção Primária à Saúde: tecnologia assistiva em atendimento domiciliar',113:'Atenção Primária à Saúde: apoio matricial e intersetorialidade',114:'Atenção Primária à Saúde: necessidades do território e demandas de cuidado',
 115:'Terapia ocupacional hospitalar: cuidado de pessoas com câncer',116:'Terapia ocupacional em UTI: posicionamento, mobilização e órteses',117:'UTI neonatal: abordagem ambiental, clínica, equipe e família',118:'Neuropatia periférica: sensibilidade, integridade da pele e órteses',119:'Queimadura palmar: posicionamento funcional de punho e dedos',120:'Pós-operatório de mastectomia: posicionamento do membro e prevenção de edema'
}
const faceis=new Set([51,53,55,56,60,61,63,70,71,73,76,79,81,85,86,90,91,93,94,96,99,100,101,102,105,106,107,110,113,114,116,117,119,120])
const dificeis=new Set([57,59,62,64,65,68,75,77,80,82,84,88,89,92,95,98,103,104,108,109,111,112,115,118])
const contexts=[
 [[51,55],'Julgue os itens relativos aos fundamentos da terapia ocupacional.'],
 [[56,59],'A respeito dos métodos e das técnicas de avaliação e classificação em terapia ocupacional, julgue os itens a seguir.'],
 [[60,63],'Acerca dos recursos terapêuticos da terapia ocupacional, julgue os itens a seguir.'],
 [[64,68],'Com relação às abordagens grupais na terapia ocupacional, julgue os itens a seguir.'],
 [[69,73],'A respeito da terapia ocupacional em equipes interdisciplinares, julgue os itens subsecutivos.'],
 [[74,76],'Julgue os itens relativos à terapia ocupacional nos processos de saúde, doença e trabalho.'],
 [[77,82],'Caso clínico: homem de 35 anos, motociclista profissional, com histórico de abuso de álcool, sofreu traumatismo cranioencefálico em acidente de trabalho. Uma semana após a alta hospitalar, compareceu ao ambulatório de terapia ocupacional no nível VI da Escala Rancho Los Amigos. Julgue os itens sobre avaliação e intervenção nesse caso.'],
 [[83,86],'Julgue os itens sobre acidente vascular encefálico e intervenção da terapia ocupacional nessa condição clínica.'],
 [[87,92],'Programa de intervenção em terapia ocupacional: nível 1 — prevenção, com o indivíduo em seu ambiente habitual e sem queixas funcionais aparentes; nível 2 — alívio de problemas, após doença ou trauma, com possibilidade de recuperar parte das capacidades; nível 3 — ajuste ambiental quando há limitações para recuperar capacidades e habilidades. Julgue os itens sobre os níveis.'],
 [[93,97],'Julgue os itens sobre terapia ocupacional na prática pediátrica.'],
 [[98,100],'Julgue os itens sobre a prática de terapia ocupacional em saúde mental.'],
 [[101,104],'Julgue os itens sobre a atuação de terapeutas ocupacionais junto a pessoas com disfunções sensoriais.'],
 [[105,107],'Julgue os itens relativos à prática da terapia ocupacional no campo social.'],
 [[108,111],'Considere o Código de Ética e Deontologia da Terapia Ocupacional, aprovado pela Resolução COFFITO nº 425/2013. Julgue os itens.'],
 [[112,114],'Julgue os itens sobre intervenções de terapia ocupacional para promoção da saúde e prevenção de agravos na Atenção Primária à Saúde.'],
 [[115,120],'Julgue os itens sobre a prática de terapia ocupacional no ambiente hospitalar.']
]
const contexto=n=>contexts.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const correcoes={
 54:'A inserção da terapia ocupacional no ambiente interdisciplinar e a definição dos espaços micro e macrossociais desenvolveram os fundamentos presentes na prática da terapia ocupacional.',
 58:'A tradução transcultural de ferramentas internacionais é uma das formas utilizadas para a criação das escalas.',
 107:'A prática da terapia ocupacional no campo social deve priorizar intervenções com pessoas em situação de vulnerabilidade social, tendo como eixo central o processo saúde-doença.',
 111:'O terapeuta ocupacional preceptor é responsável pelas ações e intervenções de residentes em terapia ocupacional sob sua tutela, ainda que eles já possuam registro junto ao Conselho Regional de Fisioterapia e Terapia Ocupacional.'
}
const porNumero=new Map()
for(const q of ps){const n=Number(q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,70)
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[54,2],[58,2]])
const canonica=new Map([...porNumero].map(([n,a])=>{
 const alvo=n===54?'extr-f652a2e7681ddc1b886e':n===58?'extr-6c3b3bf9bf13ffba4cd8':null
 const q=alvo?a.find(x=>x.id===alvo):[...a].sort((x,y)=>x.enunciado.length-y.enunciado.length)[0]
 assert.ok(q,`captura canônica ausente no item ${n}`);return [n,q]
}))
const decisoes=[]
for(const [n,a] of [...porNumero].sort((x,y)=>x[0]-y[0])){
 const q=canonica.get(n),resposta=respostas[n],conteudo=temas[n]
 assert.ok(resposta&&conteudo&&contexto(n),`dados incompletos no item ${n}`)
 const dificuldade=dificeis.has(n)?'Difícil':faceis.has(n)?'Fácil':'Média'
 const baseDecision={
  materia:'Terapia Ocupacional',conteudo,ano:2016,
  concurso:'FUB 2016 — Cargo 7: Terapeuta Ocupacional',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'18/12/2016',cargo:'Cargo 7: Terapeuta Ocupacional',
  numero_original:n,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual ou clínica do item; a banca não publicou nível de dificuldade por questão.',
  classificacao_fonte:prova,
  motivo:`Item ${n} comparado com o caderno oficial do CEBRASPE; matéria e conteúdo classificados pelo conceito efetivamente avaliado e pelo comando do bloco. Gabarito definitivo oficial conferido.`,
  tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:resposta==='C'?0:1,anulada:false,
  texto_apoio:contexto(n),
  gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 7: Terapeuta Ocupacional — aplicação em 18/12/2016',item:n,resposta,fonte:'CEBRASPE'},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']
 }
 const enunciado=correcoes[n]||q.enunciado.replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>35,`enunciado curto no item ${n}`)
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...baseDecision,enunciado,apta_resolucao:true,pagina:q.pagina})
 for(const dup of a.filter(x=>x.id!==q.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...baseDecision,enunciado:dup.enunciado.replace(/\s+/g,' ').trim(),resposta_correta:null,apta_resolucao:false,inelegibilidade_motivo:'captura_duplicada_ou_mesclada_no_mesmo_caderno',duplicada_de:q.id,pagina:dup.pagina})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'18/12/2016',concurso:'FUB 2016 — Cargo 7: Terapeuta Ocupacional',nota:'Os 70 itens distintos do caderno (51 a 120) foram classificados e vinculados ao gabarito definitivo. As capturas repetidas dos itens 54 e 58 foram mantidas como registros inelegíveis, vinculadas às versões canônicas. Os itens 54, 58, 107 e 111 tiveram OCR e limites de enunciado corrigidos; os comandos e contextos compartilhados foram separados em texto de apoio.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'FUB 2016 — Cargo 7: Terapeuta Ocupacional',itens_distintos:70,registros_revisados:72,duplicatas_inelegiveis:2,gabarito_definitivo:gabarito,prova_oficial:prova}))
