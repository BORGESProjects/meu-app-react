import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-cnmp-2023-seguranca-institucional-v527',doc='90d41c34c408851f'
const base='tmp/revisao-profissional/revisao-semed-aracaju-2024-professor-ingles-v526/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/814_CNMP_011_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/GAB_DEFINITIVO_814_CNMP_011_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)
const respostas={51:'C',52:'C',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'C',60:'C',61:'E',62:'C',63:'E',64:'E',65:'C',66:'ANULADA',67:'C',68:'E',69:'C',70:'E',71:'C',72:'E',73:'ANULADA',74:'C',75:'E',76:'E',77:'C',78:'C',79:'E',80:'C',81:'E',82:'E',83:'C',84:'C',85:'C',86:'E',87:'E',88:'C',89:'C',90:'ANULADA',91:'ANULADA',92:'E',93:'ANULADA',94:'ANULADA',95:'E',96:'E',97:'C',98:'E',99:'ANULADA',100:'ANULADA',101:'E',102:'E',103:'ANULADA',104:'C',105:'E',106:'E',107:'E',108:'E',109:'E',110:'C',111:'C',112:'E',113:'C',114:'C',115:'C',116:'E',117:'E',118:'E',119:'C',120:'E'}
const materia=n=>n<=58?'Segurança Institucional':n<=62?'Segurança da Informação':n<=66?'Segurança Institucional':n<=68?'Gestão de Crises':n<=80?'Inteligência':n<=86?'Gestão de Crises':n<=101?'Segurança Contra Incêndio':n<=103?'Primeiros Socorros':n<=106?'Legislação de Armas':n<=116?'Direito Penal':'Legislação e Direitos Humanos'
const temas={
 51:'Segurança de dignitários: equipes aproximada, velada e ostensiva',52:'Segurança de dignitários: reconhecimento e planejamento tático',53:'Segurança de dignitários: prevenção e dissuasão de ameaças',54:'Segurança de dignitários: posicionamento da equipe de proteção',
 55:'Resolução CNMP nº 116/2014: medidas protetivas e proteção de familiares',56:'Gestão de riscos: perfil do ameaçado, criminalidade local e dados estatísticos',57:'Gestão de riscos: reavaliação durante vínculo profissional',58:'Proteção institucional: adesão a protocolos de segurança',
 59:'Segurança da informação: classificação e grau de sigilo',60:'Segurança da informação: confidencialidade, integridade e disponibilidade',61:'Gestão de riscos de segurança da informação: identificação de ameaças',62:'Gestão de riscos de segurança da informação: impacto e probabilidade',
 63:'Segurança corporativa: áreas livres e controle de acesso',64:'Segurança física: perímetros e barreiras de proteção',65:'Segurança corporativa: teoria das esferas concêntricas',66:'Segurança de instalações: controle de acesso a redes e quadros de energia',
 67:'Gerenciamento de crises: características e avaliação situacional',68:'Gerenciamento de crises: prevenção e protocolos para ameaças',
 69:'Lei nº 9.883/1999: fundamentos do Sistema Brasileiro de Inteligência',70:'Atividade de inteligência: inteligência brasileira e inteligência adversa',71:'ABIN: avaliação de ameaças à ordem constitucional',72:'Sistema Brasileiro de Inteligência: controle e fiscalização',73:'ABIN: orçamento e rubricas sigilosas',74:'ABIN: nomeação do diretor-geral e aprovação pelo Senado',
 75:'Decreto nº 4.376/2002: composição e vinculação do Sistema Brasileiro de Inteligência',76:'Sistema Brasileiro de Inteligência: Centro de Inteligência Nacional e fluxo informacional',77:'Conselho Consultivo do SBI: natureza do serviço e remuneração',78:'Conselho Consultivo do SBI: vinculação institucional',79:'Conselho Consultivo do SBI: instituições participantes',80:'Conselho Consultivo do SBI: credencial de segurança',
 81:'Gerenciamento de crises: tiro de comprometimento e situação com reféns',82:'Gerenciamento de crises: perímetro tático interno',83:'Negociação orientada por princípios: pessoas, interesses, opções e critérios',84:'Gerenciamento tático de crises: localização do posto de comando',85:'Gerenciamento de crises: critérios de ação e aceitabilidade do risco',86:'Classificação de risco em ocorrências com reféns e armas automáticas',
 87:'Manutenção predial e prevenção contra incêndios',88:'Manutenção predial: prevenção e correção de falhas estruturais e instalações',89:'Prevenção contra incêndios: identificação de controles e equipamentos prediais',90:'Manutenção predial: classificação de obras necessárias',91:'Proteção contra incêndios: rotas de fuga e sinalização',
 92:'Proteção contra incêndio: inspeção e manutenção de extintores',93:'Extintores: recarga e certificação',94:'Hidrantes: inspeção e ensaio hidrostático de mangueiras',95:'Hidrantes: periodicidade de inspeção',96:'Extintores: reposição durante manutenção',97:'Hidrantes: componentes e acessórios',98:'Portas corta-fogo: desobstrução e condições de fechamento',99:'Sinalização de emergência: rotas de fuga e equipamentos',100:'Portas corta-fogo: fechamento automático e manutenção',101:'Manutenção de portas corta-fogo: qualificação do prestador',
 102:'Primeiros socorros: ressuscitação cardiopulmonar',103:'Primeiros socorros: avaliação inicial da vítima',
 104:'Lei nº 10.826/2003: omissão de cautela e objeto material',105:'Porte de arma no CNMP: guarda, manutenção e controle de uso',106:'Estatuto do Desarmamento: armas de fabricação artesanal',
 107:'Crimes contra a Administração Pública: menor potencial ofensivo',108:'Resistência e lesão corporal: concurso de crimes e bis in idem',109:'Juizados Especiais Criminais: atribuições e termo circunstanciado',110:'Lei nº 9.099/1995: medidas despenalizadoras',111:'Lei nº 13.869/2019: interrogatório durante repouso noturno',112:'Abuso de autoridade: sujeitos ativos e princípio da especialidade',
 113:'Lei nº 7.716/1989: homofobia, transfobia e racismo',114:'Injúria racial: natureza, inafiançabilidade e imprescritibilidade',115:'Lei nº 7.716/1989: discriminação por procedência regional',116:'Discriminação por procedência nacional: tipicidade e contexto',
 117:'Estatuto da Pessoa Idosa: procedimento para apuração de crimes',118:'Atendimento prioritário: extensão aos acompanhantes',119:'Estatuto da Pessoa Idosa: recusa de crédito e superendividamento',120:'Identificação pessoal: retenção de documento de visitante'
}
const contextos=[
 [[51,54],'Caso-base: procurador-geral estadual ameaçado deve comparecer a cerimônia pública. Itens sobre planejamento e equipes de segurança de dignitários.'],
 [[55,58],'Itens fundamentados na Resolução CNMP nº 116/2014, sobre proteção institucional e gestão de riscos.'],
 [[59,62],'Itens sobre classificação da informação, princípios de segurança e gestão de riscos informacionais.'],
 [[63,66],'Itens sobre segurança corporativa estratégica, áreas, perímetros, barreiras e instalações.'],
 [[67,68],'Itens sobre características e gerenciamento preventivo de crises.'],
 [[69,74],'Itens fundamentados na Lei nº 9.883/1999, que institui o Sistema Brasileiro de Inteligência.'],
 [[75,80],'Itens fundamentados no Decreto nº 4.376/2002, sobre organização e funcionamento do Sistema Brasileiro de Inteligência.'],
 [[81,86],'Itens sobre gerenciamento de crises, negociação e critérios de ação.'],
 [[87,91],'Itens sobre manutenção predial, prevenção e proteção contra incêndios.'],
 [[92,101],'Itens sobre extintores, hidrantes, portas corta-fogo e sinalização de emergência.'],
 [[102,103],'Itens de primeiros socorros: avaliação inicial e ressuscitação cardiopulmonar.'],
 [[104,106],'Itens fundamentados na Lei nº 10.826/2003 e na Resolução Conjunta CNMP/CNJ nº 4/2014.'],
 [[107,110],'Itens sobre resistência, desobediência, desacato e infrações de menor potencial ofensivo, à luz do Código Penal e da Lei nº 9.099/1995.'],
 [[111,112],'Itens fundamentados na Lei nº 13.869/2019 (Lei de Abuso de Autoridade).'],
 [[113,116],'Itens sobre crimes resultantes de preconceito de raça ou cor, com referência à Lei nº 7.716/1989 e à jurisprudência do STF.'],
 [[117,120],'Itens sobre o Estatuto da Pessoa Idosa, apresentação de documentos de identificação e prioridade de atendimento.']
]
const contexto=n=>contextos.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const correcoes={
 54:'O agente de segurança denominado “mosca” deverá ser posicionado o mais distante possível do dignitário, de modo a dissuadir qualquer movimento atentatório.',
  68:'O gerenciamento de crises alcança somente os cenários de crises já instaladas ou em ocorrência, criando protocolos e procedimentos distintos para a mera ameaça de crise.',
 66:'Os cabeamentos da rede elétrica e os quadros de energia, tanto nas áreas externas quanto nas áreas externas, devem estar sob acesso restrito e os quadros devem estar trancados com chaves ou outros dispositivos similares.',
 69:'A dignidade da pessoa humana é expressamente prevista como fundamento do Sistema Brasileiro de Inteligência (SBI).',
 70:'Denomina-se inteligência brasileira aquela cujo objetivo principal é neutralizar a inteligência adversa.',
 74:'A nomeação do diretor-geral da Agência Brasileira de Inteligência (ABIN) depende da aprovação do Senado Federal.',
 84:'O posto de comando tático do comandante do grupo tático localiza-se entre o perímetro interno e o público.',
  106:'Somente possui relevância jurídica a arma de fogo de produção industrial, excluindo-se, portanto, as fabricadas artesanalmente.',
  110:'Entre as medidas despenalizadoras previstas na Lei nº 9.099/1995 para os crimes de menor potencial ofensivo, encontram-se a composição dos danos civis, a transação penal e a suspensão condicional do processo.',
  112:'Os crimes previstos na Lei de Abuso de Autoridade não podem ser imputados a nenhum membro do CNMP, pois estes possuem estatuto próprio, aplicando-se, portanto, o princípio da especialidade.',
 94:'As mangueiras dos hidrantes devem ser desenroladas e submetidas a teste hidrostático para verificar se há algum vazamento nelas.',
 103:'Nos primeiros socorros, a avaliação inicial consiste em chamar a vítima e verificar se ela responde ao chamado, se está consciente e se está respirando.',
 109:'Caso um técnico administrativo incumbido de zelar pela segurança institucional do CNMP tome conhecimento da prática de infração penal de menor potencial ofensivo na sede desse órgão, ele deverá lavrar termo circunstanciado e encaminhá-lo imediatamente ao juizado criminal, especificando o autor do fato e a vítima.',
 116:'É atípica a conduta de injuriar alguém em razão da sua procedência nacional, no contexto de uma piada, com intuito de descontração, diversão ou recreação.'
}
const porNumero=new Map()
for(const q of ps){const n=Number(q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,70)
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[54,55])
const canonica=new Map([...porNumero].map(([n,a])=>[n,[...a].sort((x,y)=>x.enunciado.length-y.enunciado.length)[0]]))
const decisoes=[]
for(const [n,a] of [...porNumero].sort((x,y)=>x[0]-y[0])){
 const q=canonica.get(n),g=respostas[n],ctx=contexto(n),mat=materia(n)
 assert.ok(g&&temas[n]&&ctx&&mat,`classificação incompleta ${n}`)
 const faceis=new Set([52,60,63,67,77,78,91,95,97,98,104,110,113,117,120])
 const dificuldade=faceis.has(n)?'Fácil':((n>=59&&n<=62)||(n>=69&&n<=80)||(n>=81&&n<=86)||(n>=104&&n<=116)?'Difícil':'Média')
 const baseDecision={materia:mat,conteudo:temas[n],ano:2023,concurso:'CNMP 2023 — Cargo 11: Técnico, Segurança Institucional',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'16/04/2023',cargo:'Cargo 11: Técnico do CNMP — Apoio Técnico Administrativo — Segurança Institucional',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade normativa, técnica ou operacional do item; a banca não publicou dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n} conferido com o caderno oficial do Cargo 11 e classificado pelo conteúdo avaliado; gabarito definitivo confrontado com a publicação oficial do CEBRASPE.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:g==='ANULADA'?null:g==='C'?0:1,anulada:g==='ANULADA',texto_apoio:ctx,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 11: Segurança Institucional — aplicação em 16/04/2023',item:n,resposta:g,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 const enunciado=(correcoes[n]||q.enunciado).replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>35,`enunciado insuficiente ${n}`)
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...baseDecision,enunciado,pagina:q.pagina,visual:{pagina:q.pagina,imagem:q.imagem,motivo:'Página correspondente do caderno oficial preservada para leitura do item e do comando compartilhado.'},apta_resolucao:true,correcao_automatica:g!=='ANULADA'})
 for(const dup of a.filter(x=>x.id!==q.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...baseDecision,enunciado:dup.enunciado.replace(/\s+/g,' ').trim(),resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_ou_mesclada_no_mesmo_caderno',duplicada_de:q.id,pagina:dup.pagina})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'16/04/2023',concurso:'CNMP 2023 — Cargo 11: Técnico do CNMP — Apoio Técnico Administrativo — Segurança Institucional',nota:'Os 70 itens distintos do caderno (51 a 120) foram classificados com matérias e conteúdos específicos. Capturas repetidas do item 54 foram reconciliadas; o registro mesclado do item 55 foi mantido inelegível e vinculado à versão canônica. Os nove itens anulados foram preservados sem correção automática. Comandos e contextos compartilhados foram separados; páginas originais mantidas como apoio visual.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'CNMP 2023 — Cargo 11: Técnico — Segurança Institucional',itens_distintos:70,registros_revisados:72,duplicatas_inelegiveis:2,itens_anulados:Object.entries(respostas).filter(([,v])=>v==='ANULADA').map(([n])=>Number(n)),gabarito_definitivo:gabarito,prova_oficial:prova}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
