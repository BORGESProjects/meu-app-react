import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='1c5f5116484bd6c5'
const prova='https://public.inep.gov.br/enade2009/COMUNICACAO_SOCIAL.pdf'
const concurso='ENADE 2009 — Comunicação Social'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const labels={
'2@32':['Comunicação Social','Comunicação política: internet, redes sociais e participação eleitoral','Média'],
'6@6':['Língua Portuguesa','Interpretação de texto: representação cultural do sertão','Média'],
'13@12':['Comunicação Social','Teorias da comunicação: modelo de Lasswell e análise de conteúdo','Média'],
'14@12':['Comunicação Social','Comunicação organizacional: blogs corporativos','Fácil'],
'20@14':['Comunicação Social','Produção gráfica e editorial: função estética e informativa','Fácil'],
'21@14':['Comunicação Social','Teoria crítica: indústria cultural e cultura de massa','Média'],
'22@14':['Comunicação Social','Comunicação digital: mídias sociais e novas funções profissionais','Fácil'],
'23@14':['Jornalismo','Ética jornalística: apuração e interesses comerciais na cobertura esportiva','Média'],
'24@15':['Comunicação Social','Opinião pública: pesquisas e sondagens eleitorais','Média'],
'26@16':['Jornalismo','Pesquisa jornalística: verificação e confiabilidade de fontes','Fácil'],
'27@24':['Publicidade e Propaganda','Criação publicitária: figuras de retórica e manipulação visual','Média'],
'28@16':['Jornalismo','Jornalismo de opinião: editoriais, colunas e articulistas','Média'],
'29@16':['Jornalismo','Redação jornalística: lide e hierarquia da informação','Média'],
'29@47':['Cinema e Audiovisual','Direção de arte: cenários e locações cinematográficas','Fácil'],
'31@47':['Publicidade e Propaganda','Regulamentação publicitária: CONAR e autorregulação','Média'],
'31@54':['Cinema e Audiovisual','Teoria do cinema: política dos autores','Média'],
'32@18':['Comunicação Social','Linguagem visual: projeto gráfico e especificidades das mídias','Média'],
'32@25':['Publicidade e Propaganda','Produção gráfica: processos de impressão e offset','Fácil'],
'32@41':['Produção Editorial','Audiolivros: seleção de narradores, dicção e interpretação','Média'],
'32@48':['Cinema e Audiovisual','Roteiro audiovisual: convenções de roteiro para cinema e televisão','Média'],
'33@18':['Jornalismo','Rotinas produtivas: briefing e distribuição de pautas','Fácil'],
'33@54':['Cinema e Audiovisual','Cinema brasileiro: estética e política em Glauber Rocha','Média'],
'34@19':['Jornalismo','Linguagem audiovisual: enquadramentos de entrevista para televisão','Fácil'],
'34@26':['Publicidade e Propaganda','Planejamento de mídia: seleção de veículos, formatos e inserções','Média'],
'34@41':['Produção Editorial','Projeto gráfico editorial: hierarquia entre imagens e textos','Média'],
'35@42':['Produção Editorial','Gestão editorial: catálogo, vendas e sustentabilidade da editora','Média'],
'35@55':['Cinema e Audiovisual','Ética audiovisual: direito de imagem em documentários','Média'],
'36@35':['Comunicação Social','Comunicação organizacional: fluxo de informação e poder','Média'],
'36@55':['Comunicação Social','Cibercultura: virtualização e sociabilidade','Média'],
'37@49':['Comunicação Social','Direito Autoral: proteção de obras e titulares estrangeiros','Média'],
'37@55':['Cinema e Audiovisual','Transformações do cinema: digitalização e internet','Fácil']}
const survey=new Set(['1@59','2@59','3@59','4@59','6@59','9@59'])
const cleanOptions={
'29@16':['A) o comentarista responsável pelas colunas siga a orientação do Editor de Opinião.','B) o repórter reproduza fielmente as opiniões dos especialistas no assunto.','C) o Editor de Opinião indique os assuntos para os textos dos articulistas.','D) o editorialista desconsidere as informações ao redigir a matéria.','E) o Editor de Opinião e o comentarista desempenhem funções semelhantes.'],
'29@47':['A) aprovar cenas externas e internas do roteiro.','B) determinar quem será o autor do roteiro.','C) executar a sonoplastia da edição.','D) operar as tomadas de câmera.','E) realizar as tomadas de câmera.'],
'32@25':['A) Flexografia.','B) Serigrafia.','C) Rotogravura.','D) Offset.','E) Tipografia.'],
'32@48':['A) I e II.','B) I e III.','C) I e IV.','D) III e IV.','E) II e III.'],
'34@26':['A) I, II e V.','B) I, III e V.','C) II, III e IV.','D) III, IV e V.','E) II, IV e V.']}
const all=records.filter(q=>q.materia==='Conhecimentos Gerais'&&q.conteudo==='Conteúdos gerais de Conhecimentos Gerais')
if(all.length!==37)throw Error(`Grupo mudou: esperava 37, achei ${all.length}`)
const decisions=[]
for(const q of all){const n=Number(q.numero),pg=Number(q.pagina),key=`${n}@${pg}`,spec=labels[key],isSurvey=survey.has(key)
 if(!q.id||!q.enunciado||!q.imagem||!q.opcoes?.length)throw Error(`Questão ${key}: registro incompleto`)
 if(!isSurvey&&!spec)throw Error(`Classificação ausente para ${key}`)
 let enunciado=q.enunciado.trim().replace(/\s+/g,' ')
 enunciado=enunciado.replace(/\bimar atitudes políticas\b/i,'legitimar atitudes políticas').replace(/\bmais lizado\b/i,'mais utilizado').replace(/\bpesquisas nos sites de busca\b/i,'pesquisas em sites de busca').replace(/\bA situação vivenciada pelos veículos de comunicação de massa apresentada no texto é\b/i,'A situação vivenciada pelos veículos de comunicação de massa apresentada no texto é:')
 if(key==='29@16')enunciado='“No princípio, Deus criou o céu e a terra.” Essa frase bíblica é encontrada no Manual de Estilo da Editora Abril (Nova Fronteira, 1991) como exemplo de clareza, simplicidade e impacto, destacando que “se a primeira frase não levar à segunda, seu texto está morto”. PORQUE O lide/abertura da matéria deve trazer a informação mais importante. Considerando essas assertivas, é correto afirmar que:'
 if(key==='32@48')enunciado='O cinema entrou na televisão por meio do jornalismo. Eram os filmes de 16 mm utilizados nos noticiários. Com o desenvolvimento da tecnologia, o cinema passou a adotar métodos de roteirização que vieram da TV. Assim, o profissional de hoje domina as duas linguagens — cinema e TV — na sua missão de criar produtos adequados às duas modalidades. Considerando-se a elaboração do roteiro, julgue as afirmativas I a IV e assinale a alternativa que reúne as corretas.'
 if(key==='34@26')enunciado='O planejamento de mídia de uma campanha envolve o estudo e a organização de muitas ações. Sob a ótica dessa especialidade publicitária, julgue as afirmativas I a V e assinale a alternativa que reúne as corretas.'
 if(key==='37@49')enunciado='Os veículos de comunicação selecionam seus produtores exigindo deles conhecimento das normas de Direito Autoral para o cumprimento da Lei n.º 9.610/1998 nos programas transmitidos no Brasil. PORQUE Estrangeiros domiciliados no exterior não possuem direito à proteção assegurada nos acordos, convenções e tratados em vigor no Brasil. Considerando essas assertivas, é correto afirmar que:'
 const opcoes=cleanOptions[key]||q.opcoes.map(o=>o.replace(/\n(?:ENADE:|COMUNICAÇÃO SOCIAL|EXAME NACION(?:AL)? DE DESEMPENHO DOS ESTUDANTIS|EXAME ACIONA DE DESEMPENHO DOS ESTUDANTIS|-\s*\d+\s*-)[\s\S]*$/i,'').trim()).filter(Boolean)
 const base={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:isSurvey?'Pesquisa de avaliação da prova':spec[0],conteudo:isSurvey?'Questionário de percepção pós-prova':spec[1],ano:2009,concurso,banca:'INEP',organizadora:'INEP',aplicacao:isSurvey?'Questionário de avaliação preenchido após a prova — não integra o caderno de questões de conhecimento':`Prova objetiva — Comunicação Social — item ${n}, componente temático conforme enunciado`,numero_original:n,pagina:pg,dificuldade:isSurvey?'Fácil':spec[2],dificuldade_estimada:true,dificuldade_evidencia:isSurvey?'Categoria editorial apenas para catalogação; item excluído da resolução por ser formulário de opinião.':'Estimativa editorial baseada na interpretação, conceito ou procedimento exigido; não é nível oficial do INEP.',classificacao_fonte:prova,motivo:isSurvey?'Identificado visualmente na página 59 como questionário de avaliação da prova (tempo, clareza, dificuldade e suficiência das instruções), sem conteúdo avaliativo; removido da fila de resolução.':'Identificação individual do conteúdo com base no enunciado, nas alternativas e no componente temático indicado no caderno oficial do ENADE 2009 de Comunicação Social.',enunciado,opcoes,texto_apoio:'',imagem_pagina:q.imagem,apta_resolucao:!isSurvey,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto'],...(isSurvey?{inelegibilidade_motivo:'formulario_de_avaliacao_pos_prova_nao_e_questao_de_conhecimento'}:{})}
 if(key==='2@32')base.texto_apoio='Dois gráficos da pesquisa DataSenado realizada em 2009 sobre uso da internet e participação política. Os gráficos originais estão preservados na imagem da página vinculada ao item.'
 if(key==='27@24')base.texto_apoio='Peça publicitária ilustrada necessária à identificação da figura de retórica. A imagem original integra a página vinculada ao item.'
 if(key==='34@19')base.texto_apoio='Figura de uma entrevista para televisão com entrevistador e entrevistado; a ilustração original foi preservada na página vinculada.'
 decisions.push(base)
}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({total:decisions.length,questoesResolutiveis:decisions.filter(d=>d.apta_resolucao).length,formulariosExcluidos:decisions.filter(d=>!d.apta_resolucao).length,componentes:[...new Set(decisions.filter(d=>d.apta_resolucao).map(d=>d.materia))],opcoesReconstruidas:Object.keys(cleanOptions),publicado:false},null,2));process.exit(0)}
const nome='revisao-enade-comunicacao-social-2009-v342'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,itensRevisados:decisions.length,questoesClassificadas:decisions.filter(x=>x.apta_resolucao).length,formulariosExcluidos:decisions.filter(x=>!x.apta_resolucao).length,opcoesConferidasNoOriginal:Object.keys(cleanOptions),publicado:false,nota:'Pacote local. O questionário pós-prova foi excluído da prática por não conter itens de conhecimento. Não foi vinculado gabarito oficial neste pacote.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ENADE 2009 — Comunicação Social — revisão v342\n\n- Classifiquei 31 itens por áreas como Jornalismo, Publicidade e Propaganda, Cinema e Audiovisual, Produção Editorial e Comunicação Social.\n- Corrigi alternativas contaminadas por questões adjacentes nos itens 29/p.47, 32/p.25, 32/p.48 e 34/p.26; restaurei a redação dos blocos de asserção/razão e retirei rodapés capturados pelo OCR. Mantive imagens e páginas originais, incluindo gráfico, anúncio e ilustração de enquadramento.\n- Excluí da resolução seis perguntas da página 59 que são um formulário de avaliação do exame (dificuldade, tempo, clareza e suficiência das instruções), e não itens de conhecimento.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. Sem gabarito definitivo vinculado pelo pacote. Não publicado na nuvem.\n- Fonte: [caderno oficial do INEP](<${prova}>).\n`)
console.log(JSON.stringify(report,null,2))
