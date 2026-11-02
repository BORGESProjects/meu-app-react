import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-emap-2018-cargo3-comunicacao-v544'
const doc='c78984f6fc411554'
const base='tmp/revisao-profissional/revisao-trf6-2025-engenharia-eletrica-v543/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/402_EMAP003.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EMAP_18/arquivos/GAB_DEFINITIVO_402_EMAP003__PAG_3.PDF'
const raw=[]
for await(const {questoes} of lotesAtuais()) for(const q of questoes) if(q.documento_id===doc&&q.classificacao_pendente&&!q.classificacao_revisada&&q.integridade_profissional?.apta_resolucao!==false) raw.push(q)
assert.equal(raw.length,71)
assert.ok(raizesAtuais.includes(base))

// Transcrição dos gabaritos definitivos oficiais do caderno 402_EMAP003.
const keyRows=[
 [51,'CC E E E C E C E C C E E C E E C C C C'],
 [71,'EE C C C C C C C E E E C E C E E E E C'],
 [91,'EC C C C C C E E C E C C E E C E C C E'],
 [111,'EC C E C E C E E C']
]
const answers=Object.fromEntries(keyRows.flatMap(([first,row])=>[...row.replace(/\s/g,'')].map((answer,i)=>[first+i,answer])))
const duplicates={51:['extr-6830d3756d1bd391562c','extr-42905c901fc9e7d9da84'],52:['extr-1c22b8d6295a43809c8c','extr-4ebdf205676742b946c1'],55:['extr-7dac15241327b460e6ac','extr-23032c1f8c10804dbb87']}
const content={
  51:['Jornalismo','Ética jornalística e sigilo da fonte'],52:['Jornalismo','Ética jornalística: opinião e juízo de valor'],53:['Jornalismo','Ética jornalística: direito à informação e proteção da fonte'],54:['Jornalismo','Teorias da comunicação: grupos primários e comunicação de massa'],55:['Jornalismo','Sociologia da comunicação: espaço social em Pierre Bourdieu'],56:['Jornalismo','Função social do jornalismo e apuração de informações'],
  57:['Relações Públicas','Ética profissional: lobby e atuação de relações públicas'],58:['Relações Públicas','Ética profissional: conflito de interesses e autorização do cliente'],59:['Relações Públicas','Ética profissional e convivência no ambiente de trabalho'],60:['Relações Públicas','Ética profissional e concorrência por cargo'],61:['Relações Públicas','Deveres profissionais e transferência de informações'],
  62:['Comunicação Pública','Conceitos e origem da comunicação pública'],63:['Comunicação Pública','Comunicação pública e comunicação mercadológica'],64:['Comunicação Pública','Comunicação interna e processos políticos decisórios'],65:['Teorias da Comunicação','Teoria hipodérmica e efeitos da comunicação de massa'],66:['Teorias da Comunicação','Agenda-setting e efeitos da mídia'],67:['Teorias da Comunicação','Newsmaking e produção de notícias'],
  68:['Jornalismo','História do rádio e radiodifusão no Brasil'],69:['Jornalismo','História da televisão no Brasil'],70:['Jornalismo','História da televisão e formação de audiência'],71:['Jornalismo','História da televisão e interatividade'],72:['Mídias Digitais','Blogs e segmentação de públicos'],73:['Mídias Digitais','Wikis, produção colaborativa e verificação de informação'],
  74:['Jornalismo','Gêneros jornalísticos: coluna e editorial'],75:['Jornalismo','Gêneros jornalísticos: crônica'],76:['Jornalismo','Participação do leitor no jornalismo impresso e digital'],77:['Jornalismo','Gêneros jornalísticos: reportagem'],78:['Jornalismo','Notícia: pirâmide invertida e critérios de relevância'],79:['Jornalismo','Notícia: valores-notícia, surpresa e conflito'],80:['Jornalismo','Notícia: critérios de noticiabilidade'],81:['Jornalismo','Conceito e critérios de notícia'],
  82:['Telejornalismo e Radiojornalismo','Redação para rádio e televisão: registro linguístico'],83:['Telejornalismo e Radiojornalismo','Redação audiovisual e relação entre texto e imagem'],84:['Telejornalismo e Radiojornalismo','Clareza e repetição no texto jornalístico'],85:['Jornalismo Digital','Redação para web: períodos e parágrafos'],87:['Jornalismo Digital','Redação e estrutura do texto para web'],
  88:['Comunicação Organizacional','Planejamento estratégico da comunicação: objetivos e prioridades'],89:['Comunicação Organizacional','Comunicação interna e integração organizacional'],90:['Marketing','Estratégia de marketing: mercado-alvo e composto de marketing'],91:['Marketing Digital','Marcas e relacionamento com consumidores em mídias sociais'],92:['Marketing Digital','Engajamento, diálogo e transparência nas redes sociais'],93:['Marketing Digital','Consumidor digital e posicionamento de marca'],94:['Marketing','Marca: sinais de qualidade percebidos pelo consumidor'],95:['Marketing','Gestão de marca e storytelling'],96:['Marketing','Publicidade: apelos de medo e comportamento do consumidor'],
  97:['Assessoria de Imprensa','Relacionamento com jornalistas e critérios de seleção de notícias'],98:['Assessoria de Imprensa','Nota oficial e release'],99:['Assessoria de Imprensa','Entrevista coletiva e relacionamento com a imprensa'],100:['Assessoria de Imprensa','Clipping e monitoramento de notícias'],101:['Assessoria de Imprensa','Media training e preparação de porta-voz'],102:['Relações Públicas','Funções estratégicas e gestão de relacionamentos'],103:['Relações Públicas','Função política e gestão de conflitos organizacionais'],104:['Comunicação Organizacional','Análise do ambiente organizacional e variáveis setoriais'],105:['Comunicação Organizacional','Fluxos de comunicação organizacional'],106:['Eventos','Planejamento de eventos: estudo de viabilidade'],107:['Eventos','Planejamento de eventos: briefing'],108:['Cerimonial e Protocolo','Protocolo: disposição das bandeiras'],
  109:['Publicidade e Propaganda','Processo publicitário e comportamento do consumidor'],110:['Publicidade e Propaganda','Tema de campanha e identidade publicitária'],111:['Publicidade e Propaganda','Agência: criação, planejamento e execução de campanhas'],112:['Publicidade e Propaganda','Planejamento de mídia e pesquisa'],113:['Comunicação Visual','Identidade visual: logotipo'],114:['Comunicação Organizacional','Imagem e identidade corporativa'],115:['Produção Gráfica','Acabamento gráfico: alceamento'],116:['Produção Gráfica','Projeto editorial: boneca e rafe'],117:['Mídias Digitais','Convergência midiática e circulação de conteúdo'],119:['Mídias Digitais','Portais: classificação vertical e horizontal'],120:['Mídias Digitais','Monitoramento de mídias sociais e análise de conteúdo']
}
const context=n=>{
 if(n<=56)return 'Leia o texto-base: uma testemunha teve a identidade divulgada por um jornal apesar de pedido de sigilo do Ministério Público. O jornal justificou a publicação por falta de espaço; entidades representativas do jornalismo não se manifestaram até o fechamento da reportagem. Os itens 51 a 56 tratam do Código de Ética dos Jornalistas Brasileiros e de teorias da comunicação.'
 if(n<=61)return 'Situação hipotética: Otávio, profissional de relações públicas, migra da área de relações institucionais para projetos especiais, após disputar uma vaga com colega. Mantém clientes concorrentes da empresa e, ao deixar o cargo, apaga arquivos sem repassar informações ao sucessor. Julgue os itens à luz do Código de Ética dos Profissionais de Relações Públicas.'
 if(n<=67)return 'A respeito de comunicação pública e das teorias da comunicação, julgue os itens.'
 if(n<=73)return 'Julgue os itens sobre história dos meios de comunicação, massificação e segmentação de públicos, interatividade e novas mídias.'
 if(n<=77)return 'No que se refere aos gêneros jornalísticos, julgue os itens.'
 if(n<=81)return 'Considere a máxima jornalística segundo a qual a mordida de um homem por um cachorro é mais noticiável que a de um cachorro por um homem. Julgue os itens acerca dos critérios de notícia.'
 if(n<=84)return 'A respeito da redação no telejornalismo e no radiojornalismo, julgue os itens.'
 if(n===85||n===87)return 'Com relação ao texto no webjornalismo, julgue os itens.'
 if(n<=90)return 'Em relação ao planejamento estratégico de comunicação organizacional, julgue os itens.'
 if(n<=93)return 'Com a rápida disseminação do uso da Internet, discutiu-se se as marcas teriam espaço nessa esfera. Julgue os itens subsequentes.'
 if(n<=96)return 'O conceito de marca inclui nome, logotipo, slogan e a experiência proporcionada aos clientes. Julgue os itens.'
 if(n<=101)return 'A respeito da assessoria de imprensa, julgue os itens.'
 if(n<=105)return 'No que se refere a relações públicas e comunicação organizacional, julgue os itens.'
 if(n<=108)return 'Com relação a planejamento e organização de eventos, julgue os itens.'
 if(n<=113)return 'Julgue os itens referentes a publicidade e propaganda.'
 if(n<=116)return 'A respeito de comunicação visual, processo gráfico e planejamento editorial, julgue os itens.'
 return 'Acerca das novas tecnologias da comunicação, julgue os itens.'
}
const easy=new Set([56,59,61,68,69,70,73,75,82,83,84,85,87,92,93,97,98,100,102,103,106,108,113,115,117,120])
const hard=new Set([51,52,53,55,57,58,60,63,64,65,66,67,74,78,79,80,81,88,89,91,94,95,96,99,101,104,105,107,109,110,111,112,114,116,119])
const preferred={51:'extr-42905c901fc9e7d9da84',52:'extr-4ebdf205676742b946c1',55:'extr-23032c1f8c10804dbb87'}
const decisions=[]
for(const q of raw){
 const n=Number(q.numero_original??q.numero),subject=content[n]
 assert.ok(subject&&answers[n],`Falta classificação ou gabarito do item ${n}`)
 const dup=duplicates[n]?.includes(q.id)&&q.id!==preferred[n]
 let enunciado=String(q.enunciado||'').replace(/\r/g,'').replace(/\s+/g,' ').trim()
 if(n===55)enunciado='Na reportagem hipotética, a palavra “espaço” (R.9) refere-se ao espaço estruturado conceituado por Pierre Bourdieu.'
 if(n===51)enunciado=enunciado.replace(/Jomalistas/gi,'Jornalistas')
 if(n===52)enunciado=enunciado.replace(/ju[ií]zo/gi,'juízo')
 if(n===56)enunciado='Entre outros fins, o texto jornalístico investiga, reúne e contextualiza criticamente informações da atualidade.'
 enunciado=enunciado.replace(/\bJomalistas\b/g,'Jornalistas').replace(/\bjuizo\b/gi,'juízo').replace(/\bintema\b/gi,'interna').replace(/\bn otícias\b/gi,'notícias').replace(/\bparaateoria\b/gi,'Para a teoria').replace(/\bagenda-serting\b/gi,'agenda-setting').replace(/\bwebjornalismo\b/gi,'webjornalismo')
 const page=n<=73?1:n<=96?2:3,answer=answers[n],image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 assert.ok(enunciado.length>20,`Enunciado insuficiente ${n}: ${q.id}`)
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:subject[0],conteudo:subject[1],ano:2018,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Empresa Maranhense de Administração Portuária (EMAP) — Concurso Público 2018',cargo:'Analista Portuário II — Área: Comunicação (Cargo 3)',aplicacao:'24/06/2018',numero_original:n,numero:n,dificuldade:easy.has(n)?'Fácil':hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo nível de abstração conceitual, quantidade de relações entre conceitos e necessidade de aplicação normativa; o Cebraspe não publica dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n} conferido no caderno oficial do Cargo 3 — Comunicação; matéria e conteúdo definidos pelo conceito efetivamente avaliado. Ano e cargo verificados no documento oficial.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito definitivo — caderno 402_EMAP003 — Cargo 3: Analista Portuário II, área Comunicação',item:n,resposta:answer,aplicacao:'24/06/2018',fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_certo_errado_nao_vinculado','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada'],enunciado,texto_apoio:context(n),pagina:page,visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial 402_EMAP003; preservada para conferir o enunciado e sua diagramação.`},apta_resolucao:!dup,correcao_automatica:!dup,...(dup?{inelegibilidade_motivo:'duplicata_de_extracao_ocr',duplicada_de:preferred[n]}:{})})
}
assert.equal(decisions.length,71)
assert.equal(decisions.filter(x=>x.inelegibilidade_motivo==='duplicata_de_extracao_ocr').length,3)
assert.equal(new Set(decisions.map(x=>x.numero_original)).size,68)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,concurso:'EMAP 2018 — Cargo 3: Analista Portuário II, área Comunicação',aplicacao:'24/06/2018',nota:'71 registros pendentes confrontados com a prova e o gabarito definitivo oficiais; três registros OCR duplicados vinculados ao item canônico. Enunciados e textos de contexto separados, OCR evidente corrigido, classificação e dificuldade estimada preenchidas. Páginas 1 a 3 associadas aos intervalos oficiais de itens.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_analisados:71,itens_unicos:68,duplicatas_inelegiveis:3,prova_oficial:prova,gabarito_oficial:gabarito}))
