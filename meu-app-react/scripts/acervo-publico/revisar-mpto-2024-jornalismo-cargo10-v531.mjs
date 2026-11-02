import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpto-2024-jornalismo-cargo10-v531',doc='0580709974a678b5'
const base='tmp/revisao-profissional/revisao-tbg-2023-analista-comercializacao-v530/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/952_MP_TO_010_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/GAB_DEFINITIVO_952_MP_TO_010_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)

// Transcrição do gabarito oficial definitivo, Cargo 10, itens 51–120.
const answers='51:E|52:C|53:C|54:C|55:C|56:C|57:C|58:E|59:C|60:C|61:E|62:C|63:E|64:C|65:C|66:C|67:E|68:C|69:E|70:C|71:C|72:E|73:E|74:E|75:C|76:C|77:E|78:C|79:E|80:C|81:C|82:C|83:E|84:C|85:E|86:C|87:E|88:E|89:C|90:C|91:C|92:E|93:E|94:C|95:C|96:C|97:E|98:C|99:C|100:E|101:C|102:C|103:C|104:C|105:C|106:E|107:E|108:C|109:C|110:C|111:C|112:E|113:C|114:E|115:E|116:E|117:C|118:C|119:E|120:E'
const resposta=new Map(answers.split('|').map(v=>{const[n,a]=v.split(':');return[Number(n),a]}))
const topics={
 51:['Jornalismo','Prática jornalística: técnica, normas e multidisciplinaridade','Média'],52:['Jornalismo','Jornalismo como prática cultural e modelos de produção','Fácil'],53:['Ética Jornalística','Ética, regulação e efeitos da desinformação','Média'],54:['Comunicação Social','Interdisciplinaridade da comunicação','Fácil'],
 55:['Jornalismo','Crítica profissional e aperfeiçoamento das práticas jornalísticas','Fácil'],56:['Ética Jornalística','Credibilidade, confiança e compromisso com os fatos','Média'],57:['Redação Jornalística','Fidelidade aos fatos e interpretação na reportagem','Média'],58:['Ética Jornalística','Objetividade e limites da intervenção do repórter','Média'],
 59:['Jornalismo','Pauta jornalística no ambiente on-line','Média'],60:['Jornalismo','Reuniões de pauta e organização da redação','Fácil'],61:['Jornalismo','Preparação do repórter e briefing de pauta','Média'],62:['Jornalismo','Pauta: seleção e planejamento de assuntos','Fácil'],
 63:['Jornalismo Investigativo','Apuração jornalística em ambientes digitais','Média'],64:['Jornalismo Investigativo','Planejamento, disciplina e persistência na investigação','Fácil'],65:['Jornalismo Investigativo','Triangulação, verificação e conferência de fontes','Fácil'],
 66:['Técnicas de Entrevista','Persistência na entrevista jornalística','Fácil'],67:['Técnicas de Entrevista','Preparação e improvisação na entrevista','Média'],68:['Técnicas de Entrevista','Entrevista coletiva, exclusiva e pingue-pongue','Média'],
 69:['Jornalismo Institucional','Ética e precisão na produção de notícias institucionais','Média'],70:['Jornalismo Institucional','História da comunicação empresarial e assessoria de imprensa','Média'],71:['Jornalismo Institucional','Comunicação estratégica e objetivos organizacionais','Média'],
 72:['Assessoria de Imprensa','Briefing, release e materiais de relacionamento com a imprensa','Média'],73:['Assessoria de Imprensa','Release: atualidade e adequação aos veículos','Fácil'],74:['Assessoria de Imprensa','Release e comunicação institucional','Média'],
 75:['Redação Jornalística','Pirâmide invertida e hierarquia da informação','Fácil'],76:['Jornalismo Digital','Multimidialidade e experiência de leitura no jornalismo digital','Fácil'],
 77:['Assessoria de Imprensa','Ética e veracidade no relacionamento com o assessorado','Média'],78:['Assessoria de Imprensa','Comunicação de crise e posicionamento público','Média'],79:['Assessoria de Imprensa','Gerenciamento de crise e reputação institucional','Fácil'],
 80:['Assessoria de Imprensa','Entrevista coletiva e relacionamento com veículos','Fácil'],81:['Comunicação Organizacional','Relacionamento com a mídia no ambiente digital','Média'],
 82:['Metodologia da Pesquisa em Comunicação','Auditoria de imagem: métodos de pesquisa e percepção dos públicos','Média'],83:['Metodologia da Pesquisa em Comunicação','Estudo de caso e métodos qualitativos e quantitativos','Média'],
 84:['Assessoria de Imprensa','Pauta institucional e linha editorial dos veículos','Média'],85:['Assessoria de Imprensa','Planejamento estratégico de pauta institucional','Média'],86:['Comunicação Organizacional','Integração de ferramentas de comunicação e públicos','Média'],
 87:['Assessoria de Imprensa','Mailing e distribuição de conteúdo jornalístico','Fácil'],88:['Redação Jornalística','Reportagem: apuração, profundidade e organização do texto','Média'],89:['Redação Jornalística','Pauta como planejamento de matérias e reportagens','Fácil'],90:['Comunicação Organizacional','Relatório institucional: ações, resultados e recomendações','Fácil'],91:['Jornalismo','Notícia: exposição de fatos e acontecimentos','Fácil'],92:['Técnicas de Entrevista','Entrevista como técnica de apuração e consulta a fontes','Média'],
 93:['Redação Jornalística','Gêneros jornalísticos impressos: crônica, editorial e informação','Média'],94:['Redação Jornalística','Lead e parágrafo tópico na notícia','Média'],95:['Redação Jornalística','Lead secundário e organização do texto noticioso','Média'],96:['Teorias do Jornalismo','Valores-notícia e critérios de noticiabilidade','Média'],
 97:['Produção Gráfica','Processo gráfico: etapas de acabamento','Fácil'],98:['Produção Gráfica','Acabamento gráfico: técnicas e qualidade do impresso','Fácil'],99:['Projeto Gráfico e Diagramação','Identidade visual e planejamento editorial','Fácil'],100:['Projeto Gráfico e Diagramação','Atribuições de redação, edição e diagramação','Média'],101:['Projeto Gráfico e Diagramação','Projeto gráfico e consistência da diagramação','Fácil'],102:['Projeto Gráfico e Diagramação','Tipografia, entrelinha e espaçamento visual','Média'],103:['Projeto Gráfico e Diagramação','Mancha gráfica, margens e área útil da página','Fácil'],104:['Projeto Gráfico e Diagramação','Mancha gráfica, formato da página e acomodação visual','Média'],
 105:['Jornalismo Digital','Ecologia da mídia e interação entre público, jornalista e notícia','Média'],106:['Ética Jornalística','Clickbait, tráfego e responsabilidade editorial','Média'],107:['Ética Jornalística','Verificação de fontes e publicação em tempo real','Difícil'],108:['Teorias do Jornalismo','Gatekeeping e seleção de informações no webjornalismo','Média'],109:['Jornalismo Digital','Interação síncrona e recíproca entre jornalistas e internautas','Difícil'],
 110:['Jornalismo Digital','Cultura da convergência, participação e produção de conteúdo','Média'],111:['Jornalismo Digital','SEO, visibilidade e qualidade da informação jornalística','Difícil'],112:['Jornalismo Digital','Analytics e métricas de audiência para estratégias editoriais','Média'],113:['Jornalismo Digital','Fact-checking e combate à desinformação','Fácil'],114:['Jornalismo Digital','Paginação de conteúdo e experiência do usuário','Média'],115:['Jornalismo Digital','Cross-posting e distribuição multiplataforma','Média'],116:['Jornalismo Digital','Design de interação, animação e experiência de leitura','Média'],117:['Mídias Sociais','Algoritmos de distribuição e alcance de publicações','Média'],118:['Mídias Sociais','Vídeos ao vivo, stories e engajamento','Fácil'],119:['Jornalismo Digital','Podcasts e integração de formatos multimídia','Média'],120:['Mídias Sociais','Algoritmos, transparência e distribuição de conteúdo','Média']
}
const groups=[
 [[51,54],'Itens sobre o campo profissional do jornalismo, a comunicação e questões éticas e regulatórias.'],
 [[55,58],'Considerando o panorama contemporâneo do jornalismo e o trabalho do repórter profissional, julgue o item.'],
 [[59,62],'Itens relativos à produção e ao planejamento de pautas jornalísticas.'],
 [[63,65],'Itens sobre características, linguagens e técnicas de produção de uma matéria investigativa.'],
 [[66,68],'Itens sobre entrevista jornalística, preparação e diálogo com fontes.'],
 [[69,71],'Itens sobre jornalismo institucional, comunicação empresarial e comunicação estratégica.'],
 [[72,74],'Itens sobre rotinas produtivas de assessoria de imprensa e materiais enviados aos veículos.'],
 [[75,76],'Itens sobre construção da notícia e diferenças entre jornalismo impresso e digital.'],
 [[77,79],'Itens sobre atribuições do assessor de imprensa, crise de imagem e reputação.'],
 [[80,81],'Itens sobre organização de entrevistas e relacionamento com a mídia.'],
 [[82,83],'Itens sobre métodos e técnicas de pesquisa em comunicação e auditoria de imagem.'],
 [[84,86],'Itens sobre estratégia de comunicação empresarial e elaboração de pauta institucional.'],
 [[87,92],'Itens sobre gêneros, técnicas, produtos e rotinas de redação jornalística.'],
 [[93,95],'Itens sobre gêneros impressos e técnicas de redação jornalística.'],
 [[96,96],'Item sobre critérios de seleção, redação e edição jornalística.'],
 [[97,98],'Itens sobre etapas do processo gráfico e acabamento de produtos impressos.'],
 [[99,100],'Itens sobre planejamento editorial, identidade visual e atribuições de redação e diagramação.'],
 [[101,102],'Itens sobre processo de diagramação, composição, tipografia e espaçamento.'],
 [[103,104],'Itens sobre mancha gráfica, margens e distribuição dos elementos na página.'],
 [[105,106],'Itens sobre interação entre internautas, jornalistas e notícia no webjornalismo.'],
 [[107,109],'Itens sobre técnicas de redação, verificação e interação no jornalismo digital.'],
 [[110,120],'Itens sobre fluxo de informação, convergência, métricas, verificação e formatos do webjornalismo e das mídias sociais.']
]
const contexto=n=>groups.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const repair={
 54:'A comunicação relaciona-se com vários segmentos da sociedade, podendo atuar em áreas como a ciência, a economia e a sociologia, por exemplo.',
 56:'A relação entre o público e um veículo de comunicação se estabelece por meio de um pacto de confiabilidade a partir do noticiamento do que é real.',
 79:'Dentre as funções de um assessor de imprensa, o gerenciamento de crise de imagem é a única esfera que deve ser gerenciada.',
 98:'A etapa dos acabamentos inclui diversas técnicas e processos aplicados para melhorar a aparência, a durabilidade e a atratividade visual do produto impresso.',
 100:'Uma das atribuições do redator é a diagramação do conteúdo (textos e imagens) e pela criação de leiautes.',
 102:'O espaçamento entre letras e linhas auxilia na composição de um visual mais leve: quanto maior for esse espaçamento, mais leve é o visual.',
 109:'O modelo de conexão sincrônica-recíproca pode ser uma abordagem eficaz para fortalecer a relação entre jornalistas e internautas no ambiente do webjornalismo.'
}
const byNumber=new Map()
for(const q of raw){const n=Number(q.numero),a=byNumber.get(n)||[];a.push(q);byNumber.set(n,a)}
assert.equal(byNumber.size,70)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n])=>n),[79])
const canonical79='extr-146a14adcba54439365c'
const decisions=[]
for(const[n,records]of[...byNumber].sort((a,b)=>a[0]-b[0])){
 const q=n===79?records.find(x=>x.id===canonical79):records[0]
 const[materia,conteudo,dificuldade]=topics[n]||[],key=resposta.get(n),ctx=contexto(n)
 assert.ok(q&&materia&&conteudo&&dificuldade&&key&&ctx,`Dados incompletos no item ${n}`)
 const enunciado=(repair[n]||q.enunciado).replace(/\s*CEBRASPE\s*[–-]\s*MPTO\s*[–-]\s*Edital:\s*2024[\s\S]*$/,'').replace(/\s*--\s*CONHECIMENTOS ESPECÍFICOS\s*--[\s\S]*$/,'').replace(/\s+Quanto à organização de entrevistas[\s\S]*$/,'').replace(/\s+Julgue os itens a seguir, a respeito do fluxo de informação[\s\S]*$/,'').replace(/\s+No que se refere ao planejamento editorial[\s\S]*$/,'').replace(/\s+Quanto à mancha gráfica[\s\S]*$/,'').replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>25,`Enunciado insuficiente no item ${n}`)
 const page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const metadata={materia,conteudo,ano:2024,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'MPTO 2024 — Cargo 10: Analista Ministerial Especializado — Jornalismo',cargo:'Analista Ministerial Especializado — Área de Atuação: Jornalismo',aplicacao:'03/03/2024',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no tipo de conhecimento e na inferência exigida; a banca não divulgou nível de dificuldade por questão.',classificacao_fonte:prova,motivo:`Item ${n} conferido na prova oficial do Cargo 10; classificado pelo assunto de jornalismo/comunicação efetivamente cobrado e comparado com o gabarito definitivo.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:key==='C'?0:1,anulada:false,texto_apoio:ctx,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 10: Analista Ministerial Especializado — Jornalismo — aplicação em 03/03/2024',item:n,resposta:key,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...metadata,enunciado,pagina:page,visual:{pagina:page,imagem,motivo:'Página original conferida visualmente; contexto e estrutura do caderno preservados.'},apta_resolucao:true,correcao_automatica:true})
 for(const dup of records.filter(x=>x.id!==q.id))decisions.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...metadata,enunciado,resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item_no_mesmo_caderno',duplicada_de:q.id,pagina:Number(dup.pagina)})
}
assert.equal(decisions.length,71)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'03/03/2024',concurso:'MPTO 2024 — Cargo 10: Analista Ministerial Especializado — Jornalismo',nota:'A edição contém os itens 51–120. Havia 70 números distintos na fila, com captura duplicada do item 79; a cópia foi preservada como inelegível. Os 70 registros canônicos foram classificados conforme subáreas e conteúdos do edital/caderno, com o gabarito definitivo vinculado. As três páginas originais foram conferidas visualmente; comandos de seção anexados por OCR foram separados dos enunciados.'},null,2))
console.log(JSON.stringify({...result,documento:doc,edicao:'MPTO 2024 — Cargo 10: Analista Ministerial Especializado — Jornalismo',itens_distintos:70,registros_revisados:71,duplicatas_inelegiveis:1,gabaritos_definitivos_vinculados:70,prova_oficial:prova,gabarito_definitivo:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
