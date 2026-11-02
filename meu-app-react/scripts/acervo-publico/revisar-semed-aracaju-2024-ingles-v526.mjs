import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-semed-aracaju-2024-professor-ingles-v526'
const doc='9021c40b9a77b9c1'
const base='tmp/revisao-profissional/revisao-fub-2016-terapia-ocupacional-cargo7-v525/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/semed_aracaju_24/arquivos/025_SEMED_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/semed_aracaju_24/arquivos/GAB_DEFINITIVO_025_SEMED_007_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)

const respostas={51:'C',52:'E',53:'E',54:'E',55:'C',56:'C',57:'E',58:'C',59:'C',60:'C',61:'C',62:'E',63:'C',64:'C',65:'E',66:'E',67:'E',68:'E',69:'E',70:'E',71:'C',72:'C',73:'C',74:'E',75:'C',76:'E',77:'E',78:'C',79:'C',80:'ANULADA',81:'E',82:'E',83:'E',84:'C',85:'C',86:'E',87:'E',88:'C',89:'E',90:'E',91:'C',92:'C',93:'C',94:'C',95:'C',96:'E',97:'E',98:'C',99:'C',100:'E',101:'E',102:'E',103:'E',104:'C',105:'C',106:'E',107:'C',108:'E',109:'C',110:'C',111:'C',112:'C',113:'C',114:'E',115:'E',117:'C',118:'E',119:'C',120:'E'}
const temas={
 51:'Abordagem integrada de conteúdo e língua (CLIL)',52:'Método silencioso (The Silent Way)',53:'Abordagem comunicativa e fluência',54:'Método direto e ensino indutivo de línguas',55:'Ensino de línguas baseado em tarefas (TBLT)',56:'Método audiolingual e prática de padrões',57:'Resposta física total (TPR)',58:'Método de gramática e tradução',
 59:'Compreensão de texto: tutoria virtual e apoio sob demanda',60:'Compreensão de texto: personalização de materiais didáticos',61:'Compreensão de texto: aprendizagem personalizada',62:'Compreensão de texto: tutoria virtual e atendimento individualizado',63:'Compreensão de texto: ferramentas de apoio à aprendizagem de línguas',64:'Compreensão de texto: preparação para avaliações',65:'Compreensão de texto: escrita, revisão e pensamento crítico',
 66:'Metodologias ativas: instrução por pares',67:'Metodologias ativas: gamificação no ensino de línguas',68:'Metodologias ativas: aprendizagem baseada em projetos',69:'Metodologias ativas: sala de aula invertida',
 70:'Interpretação de canção: tema e construção de sentido',71:'Interpretação de canção: informação explícita e inferência',72:'Interpretação de canção: localização de informação explícita',73:'Interpretação de canção: comparação e analogia',74:'Interpretação de canção: inferência sobre atitude do eu lírico',
 75:'Vocabulário e semântica: expressão idiomática e efeito de sentido',76:'Morfologia: formação de substantivos e adjetivos',77:'Variação linguística, registro informal e convenções ortográficas',78:'Vocabulário: significado contextual de adjetivos',79:'Morfologia: classe gramatical e função de palavra',
 80:'Morfologia: advérbios de frequência e intensidade',81:'Estratégias de leitura: skimming e localização de informação',82:'Sintaxe: modificadores nominais e adjetivos',83:'Coesão referencial: anáfora e retomada textual',84:'Verbos frasais e construções com going back',85:'Adjetivos: formação do superlativo',
 86:'Pontuação: vírgulas parentéticas',87:'Discurso direto e discurso relatado',88:'Orações relativas e estrutura sintática',89:'Tempos verbais e identificação de formas verbais',90:'Orações imperativas e sujeito implícito',91:'Vocabulário: cognatos e falsos cognatos',92:'Tempos verbais: simple past',93:'Paráfrase, coesão e preservação de sentido',94:'Gêneros textuais: biografia e antecipação de conteúdo',95:'Determinantes: pronomes possessivos e demonstrativos',96:'Pontuação e coordenação em enumerações',97:'Marcadores discursivos e organização temporal',
 98:'Tecnologias educacionais: acesso digital e desigualdade',99:'Ambientes virtuais de aprendizagem: interação e acompanhamento',100:'Integração de tecnologias e adaptação metodológica',101:'Ambientes virtuais: atividades interativas e gamificação',102:'Avaliação da aprendizagem em ambientes virtuais',103:'Tecnologias educacionais e motivação',104:'Avaliação formativa e adaptação do ensino',105:'Tecnologias digitais e aprendizagem ativa de inglês',106:'Evidências de aprendizagem mediada por tecnologia',107:'Personalização de conteúdos em plataformas digitais',
 108:'Construtivismo e uso ativo de tecnologias',109:'Recursos didáticos digitais para o ensino de inglês',110:'Planejamento pedagógico para seleção de tecnologias',111:'Recursos digitais para desenvolvimento de vocabulário',112:'Uso crítico de tecnologia e autonomia do estudante',113:'Mediação docente em ambientes virtuais de aprendizagem',114:'Critérios pedagógicos para seleção de tecnologias',
 115:'BNCC: língua em uso, multimodalidade e conhecimentos linguísticos',117:'BNCC: flexibilidade curricular e protagonismo estudantil',118:'BNCC: competências de língua inglesa e articulação curricular',119:'Currículo de Sergipe: interação em contextos locais e globais',120:'Currículo de Sergipe: tecnologias digitais e equidade educacional'
}
const faceis=new Set([51,55,56,59,61,63,64,70,71,72,73,78,81,83,91,92,94,98,99,104,105,109,111,113,115,117,119,120])
const dificeis=new Set([53,54,57,58,65,66,68,76,77,80,82,84,86,87,88,89,90,95,96,97,102,106,108,112,114,115,118])
const correcoes={
 55:'O ensino de línguas baseado em tarefas (task-based language teaching) se concentra na realização de tarefas práticas que exigem habilidades linguísticas, como, por exemplo, criar uma apresentação ou planejar uma viagem.',
 58:'O método de tradução gramatical valoriza a precisão e frequentemente envolve a tradução entre o idioma alvo e o idioma nativo, enfatizando leitura e escrita.',
 65:'ChatGPT doesn’t specifically aim to improve writing skills beyond basic corrections, as it mainly focuses on grammar and spelling.',
 69:'A sala de aula invertida (flipped classroom) consiste em inverter o modelo tradicional de ensino, com os alunos assistindo a vídeos explicativos em sala e realizando atividades práticas no seu dia a dia.',
 79:'In the text, the word “fun” is a verb.',
 85:'The phrase “the most widespread”, in the fourth sentence of the text, is a superlative construction, with “most” modifying the adjective “widespread”.',
 97:'The phrase “Over the course of a career spanning the 1960s to her death in 2014” (last sentence) functions as a discourse marker in the text.',
 107:'A utilização de plataformas digitais possibilita a adaptação do conteúdo e das atividades de língua inglesa às necessidades específicas de cada aluno.'
}
const grupos=[
 [[51,58],'Texto-base: apresentação das abordagens de ensino de língua estrangeira e da abordagem eclética; considere o comando do caderno sobre métodos e abordagens.'],
 [[59,65],'Texto-base: texto em inglês sobre usos educacionais do ChatGPT, incluindo aprendizagem personalizada, tutoria virtual, aprendizagem de línguas, preparação para exames e apoio à escrita.'],
 [[66,69],'Texto-base: metodologias ativas centradas no estudante, com mediação docente, colaboração, criatividade, comunicação e pensamento crítico.'],
 [[70,74],'Texto-base: letra da canção “Be True to Your School”, dos Beach Boys, reproduzida na página da prova indicada nas referências visuais.'],
 [[75,79],'Texto-base: microconto “Untitled”, de Adhiraj Singh, e comentário crítico sobre a linguagem e o efeito humorístico da narrativa.'],
 [[80,85],'Texto-base: texto “African Englishes From a Sociolinguistic Perspective”, sobre variedades do inglês na África, suas histórias e distribuição geográfica.'],
 [[86,90],'Texto-base visual: tira “The narrator”, de Tom Gauld. A página original da prova permanece vinculada como imagem para leitura dos quadros.'],
 [[91,97],'Texto-base: texto biográfico em inglês sobre a trajetória de Maya Angelou e sua atuação literária, artística e política.'],
 [[98,107],'Texto-base: definição de ambientes virtuais de aprendizagem (AVA/LMS) e bloco de itens sobre seus efeitos no ensino de língua inglesa.'],
 [[108,114],'Texto-base: bloco sobre tecnologias educacionais no ensino e aprendizagem de língua inglesa, com foco em construtivismo, recursos, planejamento e mediação docente.'],
 [[115,118],'Texto-base: disposições da BNCC para o componente curricular Língua Inglesa.'],
 [[119,120],'Texto-base: diretrizes do Currículo de Sergipe para o ensino de língua inglesa.']
]
const contexto=n=>grupos.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const porNumero=new Map()
for(const q of ps){const n=Number(q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,69)
assert.deepEqual([...porNumero.keys()].filter(n=>!respostas[n]||!temas[n]),[])
assert.deepEqual([...porNumero.keys()].filter(n=>n<51||n>120),[])
const canonica=new Map([...porNumero].map(([n,a])=>{
 const q=[...a].sort((x,y)=>x.enunciado.length-y.enunciado.length)[0]
 assert.ok(q);return [n,q]
}))
const decisoes=[]
for(const [n,a] of [...porNumero].sort((x,y)=>x[0]-y[0])){
 const q=canonica.get(n),g=respostas[n],context= contexto(n)
 const dificuldade=dificeis.has(n)?'Difícil':faceis.has(n)?'Fácil':'Média'
 assert.ok(g&&temas[n]&&context)
 const baseDecision={materia:'Língua Inglesa',conteudo:temas[n],ano:2024,concurso:'SEMED Aracaju 2024 — Cargo 7: Professor de Língua Inglesa',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'22/12/2024',cargo:'Cargo 7: Professor — Língua Inglesa',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade linguística, na necessidade de inferência e no conhecimento metodológico exigido; a banca não publicou nível de dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} confrontado com o caderno oficial do Cargo 7 e classificado pelo conceito avaliado. Resposta conferida no gabarito definitivo do CEBRASPE.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:g==='ANULADA'?null:g==='C'?0:1,anulada:g==='ANULADA',gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 7: Professor de Língua Inglesa — aplicação em 22/12/2024',item:n,resposta:g,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 const enunciado=(correcoes[n]||q.enunciado).replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>35,`enunciado insuficiente ${n}`)
 const imagem=n===97?'paginas/9021c40b9a77b9c1-0003.webp':q.imagem
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...baseDecision,enunciado,texto_apoio:context,pagina:q.pagina,visual:{pagina:q.pagina,imagem,motivo:'Página da prova oficial preservada para conferir o enunciado e seus textos-base e elementos gráficos.'},apta_resolucao:true,correcao_automatica:g!=='ANULADA'})
 for(const dup of a.filter(x=>x.id!==q.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...baseDecision,enunciado:dup.enunciado.replace(/\s+/g,' ').trim(),resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_ou_mesclada_no_mesmo_caderno',duplicada_de:q.id,pagina:dup.pagina})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'22/12/2024',concurso:'SEMED Aracaju 2024 — Cargo 7: Professor de Língua Inglesa',nota:'Foram revisados 69 itens distintos entre 51 e 120, com o item 116 já classificado na base anterior. Três capturas repetidas dos itens 52, 54 e 55 foram mantidas como inelegíveis e vinculadas às versões canônicas. O item 80 está anulado no gabarito definitivo. As páginas originais foram preservadas como contexto visual.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'SEMED Aracaju 2024 — Cargo 7: Professor de Língua Inglesa',itens_distintos:69,registros_revisados:72,duplicatas_inelegiveis:3,item_anulado:80,gabarito_definitivo:gabarito,prova_oficial:prova}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
