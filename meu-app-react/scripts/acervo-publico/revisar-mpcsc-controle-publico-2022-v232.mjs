import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpcsc-controle-publico-2022-v232',doc='78f42c25831b06ec'
const prova='https://cdn.cebraspe.org.br/concursos/MPC_SC_22_SERVIDOR/arquivos/727_MPC_SC_SERVIDOR_001_01.PDF'
const concurso='MPC/SC 2022 — Servidor, Cargo 1'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='727_MPC_SC_SERVIDOR_001_01.PDF'||catalog.questoes.length!==71)throw Error('Inventário incompatível: esperados 71 registros OCR, itens 51–120')
const porNumero=new Map();for(const e of catalog.questoes){const a=porNumero.get(e.numero)||[];a.push(e);porNumero.set(e.numero,a)}
if(porNumero.size!==70||[...porNumero.keys()].some(n=>n<51||n>120))throw Error('Esperados 70 números únicos entre 51 e 120')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-sesaual-cirurgia-toracica-2021-v231'))
if(prev<0)throw Error('Base anterior v231 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lote of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros ausentes do banco: ${want.size}`)

const materias={},temas={
51:['Direito Administrativo','Controle administrativo: hierarquia, autotutela e controle interno'],
52:['Direito Administrativo','Princípios da Administração Pública no controle administrativo'],
53:['Direito Constitucional','Tribunais de contas estaduais e municipais: controle externo e fiscalização'],
54:['Direito Constitucional','TCU: comunicação ao Congresso de irregularidades em despesas públicas'],
55:['Direito Administrativo','TCE/SC: consulta parlamentar e prazo para pronunciamento'],
56:['Direito Administrativo','TCE/SC: informações à Assembleia Legislativa sobre auditorias'],
57:['Direito Administrativo','MPC/SC: recebimento e tramitação de denúncias e representações'],
58:['Direito Administrativo','MPC/SC: investigação preliminar e coleta de elementos'],
59:['Direito Constitucional','TCU: contas do presidente da República e parecer prévio'],
60:['Direito Constitucional','Tribunais de contas: registro de atos de admissão de pessoal'],
61:['Direito Constitucional','Tribunais de contas: registro de aposentadorias, reformas e pensões'],
62:['Direito Constitucional','Transferências federais: competência para julgar contas de recursos repassados'],
63:['Direito Constitucional','TCE e câmara municipal: registro de atos de admissão de pessoal'],
64:['Direito Constitucional','Tribunais de contas: julgamento das contas de mesas legislativas'],
65:['Direito Administrativo','MPC junto ao TCE: regime, prerrogativas e organização institucional'],
66:['Direito Constitucional','Auditores de tribunal de contas: remuneração e vedação de equiparação'],
67:['Direito Administrativo','Tribunal de contas: medidas cautelares e poder geral de cautela'],
68:['Direito Administrativo','Processo nos tribunais de contas: contraditório e ampla defesa'],
69:['Direito Constitucional','Remédios constitucionais: habeas corpus contra medida cautelar'],
70:['Direito Constitucional','Remédios constitucionais: mandado de segurança e prova pré-constituída'],
71:['Direito Constitucional','Remédios constitucionais: habeas data e acesso a processo administrativo'],
72:['Direito Constitucional','Controle de constitucionalidade pelo Poder Judiciário'],
73:['Direito Constitucional','Tribunal de contas: julgamento de contas de administradores e responsáveis'],
74:['Direito Administrativo','MPC junto ao TCE: autonomia e vínculo institucional'],
75:['Direito Administrativo','Controle judicial de decisões de tribunais de contas e mérito administrativo'],
76:['Direito Constitucional','Ministério Público de Contas: iniciativa legislativa sobre estrutura própria'],
77:['Administração Pública','Despesa pública: empenho e anulação de crédito empenhado'],
78:['Administração Pública','Despesa pública: liquidação e condição para pagamento'],
79:['Administração Pública','Restos a pagar: empenho ordinário e inscrição no encerramento do exercício'],
80:['Administração Pública','Empenho por estimativa: despesas de valor não determinável'],
81:['Administração Pública','Liquidação da despesa: apuração do valor e comprovação do serviço'],
82:['Administração Pública','Orçamento municipal: reestimativa de receita e erro técnico ou legal'],
83:['Direito Financeiro','Renúncia de receita: anistia de multas tributárias e LRF'],
84:['Direito Financeiro','Calamidade pública: medidas fiscais e estimativa de impacto orçamentário'],
85:['Direito Previdenciário','RPPS de Santa Catarina: dependentes e enteados'],
86:['Direito Previdenciário','RPPS de Santa Catarina: parcelas remuneratórias e salário de contribuição'],
87:['Direito Previdenciário','RPPS de Santa Catarina: aposentadoria compulsória de servidores'],
88:['Direito Previdenciário','RPPS de Santa Catarina: revisão médica da aposentadoria por incapacidade'],
89:['Direito Previdenciário','RPPS de Santa Catarina: cálculo dos benefícios e média contributiva'],
90:['Direito Previdenciário','Previdência complementar estadual: adesão ao RPC-SC e direito de opção'],
91:['Direito Previdenciário','Previdência complementar: benefício especial e contribuição patrocinada'],
92:['Direito Previdenciário','RPPS de Santa Catarina: competência para conceder aposentadoria'],
93:['Direito Processual Civil','CPC: prazos processuais e prazos peremptórios'],
94:['Direito Processual Civil','CPC: intimação, início do prazo recursal e tempestividade'],
95:['Direito Processual Civil','CPC: julgamento parcial do mérito e impugnação por recurso'],
96:['Direito Processual Civil','CPC: substituição de testemunha e alteração de endereço'],
97:['Direito Processual Civil','CPC: autocomposição homologada e título executivo judicial'],
98:['Direito Processual Civil','CPC: abandono da causa e extinção sem resolução de mérito'],
99:['Direito Processual Civil','Mandado de segurança: decadência e revisão de ato de tribunal de contas'],
100:['Direito Processual Civil','Improbidade administrativa: indisponibilidade de bens e contraditório prévio'],
101:['Direito Administrativo','MPC/SC: publicidade, motivação e publicação de decisões colegiadas'],
102:['Direito Administrativo','TCE/SC: imputação de débito, boa-fé e atualização monetária'],
103:['Direito Administrativo','TCE/SC: termo de ajustamento de gestão e homologação pelo Pleno'],
104:['Direito Constitucional','Tribunal de contas: eficácia executiva das decisões e cumprimento de determinações'],
105:['Direito Administrativo','Ministério Público de Contas: requisição independente de documentos e informações'],
106:['Direito Constitucional','Contas anuais de prefeitos: parecer prévio e julgamento pela Câmara Municipal'],
107:['Direito Administrativo','MPC/SC: substituição do procurador-geral e critérios de sucessão'],
108:['Direito Administrativo','TCE/SC: embargos de declaração e interrupção de prazos'],
109:['Direito Administrativo','TCE/SC: recursos contra parecer prévio das contas anuais'],
110:['Direito Administrativo','TCE/SC: quitação de débito ou multa e manutenção do julgamento'],
111:['Administração Pública','Orçamento público: conteúdo e função da Lei de Diretrizes Orçamentárias'],
112:['Administração Pública','Orçamento público: princípio da unidade ou totalidade'],
113:['Administração Pública','Orçamento público: princípio da exclusividade e créditos adicionais'],
114:['Administração Pública','Orçamento por programas: programa, ações e solução de problemas públicos'],
115:['Contabilidade Pública','NBC TSP: relevância e valor preditivo ou confirmatório da informação'],
116:['Contabilidade','Ética profissional: dever de comunicação de impedimento ao exercício'],
117:['Administração Pública','Receitas vinculadas: aplicação, exercício de ingresso e saldo remanescente'],
118:['Administração Pública','Receita pública: operações de crédito por antecipação de receita'],
119:['Administração Pública','Despesas de exercícios anteriores: restos a pagar com prescrição interrompida'],
120:['Administração Pública','Créditos adicionais especiais: abertura e indicação da fonte de recursos']
}
for(const [n,[m]] of Object.entries(temas))materias[n]=m
const facil=new Set([51,53,56,57,59,60,63,64,66,69,70,71,72,73,75,78,80,82,85,86,87,89,91,93,94,96,97,101,103,104,106,107,108,110,111,112,114,115,116,117,118,119,120])
const dificil=new Set([54,55,58,61,62,67,68,74,76,77,79,81,83,84,88,90,92,95,98,99,100,102,105,109,113])
const contextos={
51:'Quanto ao conceito, à abrangência e às espécies de controle da administração pública, julgue os itens a seguir.',
53:'Julgue os itens que se seguem, referentes à fiscalização financeira, contábil, orçamentária e patrimonial.',
55:'Acerca da fiscalização do Tribunal de Contas do Estado de Santa Catarina (TCE/SC), julgue os itens subsequentes.',
57:'Julgue os itens seguintes, referentes aos instrumentos de atuação do Ministério Público de Contas do Estado de Santa Catarina (MPC/SC).',
59:'A respeito do controle externo no Brasil, julgue os próximos itens.',
61:'Considerando a jurisprudência do STJ e do STF no que for pertinente, julgue os itens que se seguem.',
67:'De acordo com a jurisprudência do STF sobre o processo administrativo no âmbito do tribunal de contas, julgue os itens a seguir.',
69:'Considerando a jurisprudência do STJ e do STF naquilo que for pertinente, julgue os itens que se seguem.',
75:'Acerca do controle externo e da atuação dos tribunais de contas, julgue os itens subsequentes.',
77:'Um prefeito municipal incluiu, no orçamento de obra pública de mobilidade urbana, crédito com vigência de dois anos, empenhado em janeiro do primeiro ano. À luz da Lei n.º 4.320/1964, julgue os itens a seguir.',
82:'Um município catarinense reduziu a alíquota do IPTU e anistiou multas por atraso durante a pandemia, sob critérios legais. A câmara municipal reestimou a previsão da receita orçamentária. À luz da LRF, julgue os itens seguintes.',
85:'Considerando a Constituição Federal e a Lei Complementar Estadual n.º 412/2008, sobre o RPPS de Santa Catarina, julgue os itens seguintes.',
90:'À luz da Constituição, da jurisprudência do STF e da legislação estadual sobre o RPPS e a previdência complementar de Santa Catarina, julgue os itens seguintes.',
93:'De acordo com o Código de Processo Civil, considere que os processos sejam regidos pelo procedimento comum e julgue os itens.',
99:'À luz das normas sobre improbidade administrativa e mandado de segurança, julgue o item seguinte.',
101:'Acerca do direito processual de contas e das normas aplicáveis ao MPC/SC e ao TCE/SC, julgue os itens subsequentes.',
106:'A respeito dos tribunais de contas, da jurisprudência dos tribunais superiores e da legislação catarinense, julgue os itens.',
111:'Acerca do planejamento e do orçamento públicos no Brasil e dos princípios dessa disciplina, considere a Constituição Federal e julgue os itens.',
115:'Com relação à NBC TSP Estrutura Conceitual e ao Código de Ética Profissional do Contador, julgue os itens.',
117:'Julgue os itens seguintes sobre receita e despesa públicas e sua execução orçamentária e financeira.'
}
const pontos=[51,53,55,57,59,61,67,69,75,77,82,85,90,93,99,101,106,111,115,117]
function contexto(n){return contextos[pontos.filter(x=>x<=n).at(-1)]}
const canon55='extr-4930482a296b765b4466',decisoes=[]
for(const [n,entries] of porNumero){
 const m=temas[n][0],topic=temas[n][1]
 for(const e of entries){const q=byId.get(e.id),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`,duplicate=n===55&&e.id!==canon55
  if(!q||!topic)throw Error(`Questão ${n} sem matéria ou assunto`)
  if(q.pagina!==e.pagina)throw Error(`Página divergente no item ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:m,conteudo:topic,ano:2022,concurso,numero_original:n,pagina:e.pagina,
   dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial conforme a quantidade de normas, competências ou etapas processuais que o item exige combinar; não é estatística psicométrica publicada pela banca.',
   classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura do enunciado e do bloco de comando na imagem oficial da página; classificação por objeto jurídico específico.'},
   visual:{pagina:e.pagina,imagem:img,motivo:`Página original ${e.pagina} conferida; o caderno é textual e não contém figura ou gráfico indispensável neste item.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicate?'Cópia OCR do item 55 com itens seguintes concatenados; mantida a extração canônica limpa.':`Classificação individual: ${topic}. Chave e enunciado foram preservados.`}
  if(n===55&&!duplicate)d.enunciado='Na apreciação de matéria submetida pela Comissão Mista Permanente de Deputados ao TCE/SC, esse tribunal deverá emitir pronunciamento conclusivo em até trinta dias.'
  if(!duplicate){d.apta_resolucao=true;d.texto_apoio=contexto(n)}
  else{d.apta_resolucao=false;d.inelegibilidade_motivo='Cópia OCR concatenada do item 55; mantida a questão canônica limpa extr-4930482a296b765b4466.';d.duplicada_de=canon55}
  decisoes.push(d)
 }
}
if(decisoes.length!==71)throw Error(`Esperados 71 registros OCR, obtidos ${decisoes.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:71,itens_unicos:70,duplicatas_inelegiveis:1,imagens_origem_conferidas:[1,2,3,4],publicado:false},null,2))
