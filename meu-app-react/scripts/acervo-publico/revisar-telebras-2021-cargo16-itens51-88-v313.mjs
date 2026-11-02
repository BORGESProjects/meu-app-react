import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='88619bf218e60ed6'
const prova='https://cdn.cebraspe.org.br/concursos/TELEBRAS_21/arquivos/657_TELEBRAS_016_01.PDF'
const concurso='TELEBRAS 2021 — Cargo 16: Técnico em Gestão de Telecomunicações — Assistente Administrativo'
const cargo='Cargo 16 — Técnico em Gestão de Telecomunicações — Ocupação: Assistente Administrativo'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==76)throw Error('Caderno TELEBRAS divergente do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const selected=records.filter(q=>q.numero>=51&&q.numero<=88)
if(selected.length!==44||new Set(selected.map(q=>q.id)).size!==44)throw Error(`Esperados 44 registros (38 itens e 6 duplicatas), obtidos ${selected.length}`)

const stems={
51:'A redação oficial deve atender sempre ao interesse geral dos cidadãos.',
52:'Caso o signatário do documento tenha sido designado para cargo público vago ou em situação de afastamento ou impedimento legal ou regulamentar do titular, deve-se incluir na assinatura, depois do nome do cargo, o termo “interino”.',
53:'Para documentos que sigam o padrão ofício, a numeração é obrigatória a partir da segunda página.',
54:'O expediente a ser utilizado para informar o vice-presidente da República sobre determinado assunto é a exposição de motivos.',
55:'O documento conjunto circular é elaborado quando mais de um órgão envia, conjuntamente, o mesmo expediente para um único órgão receptor.',
56:'Documentos são encaminhados ao arquivo com a única finalidade de serem arquivados.',
57:'O tipo vertical de arquivamento permite rápida consulta aos documentos.',
58:'Ainda que documentos sejam arquivados de maneira errada, sua localização não será prejudicada se existir instrumento que descreva o acervo.',
59:'O método de arquivamento numérico simples utiliza como elementos de busca o número e a data do documento.',
60:'Após expedição, cópias de documentos devem ser arquivadas.',
61:'No protocolo, documentos de natureza ostensiva devem ser abertos e analisados.',
62:'O ofício é uma correspondência externa.',
63:'Correspondência oficial é aquela que trata de assunto de interesse pessoal de servidores de uma instituição.',
64:'A motivação impacta no tempo que o servidor despende para realizar suas atividades.',
65:'O conflito prejudica o desempenho das tarefas, mas não afeta o bem-estar das pessoas.',
66:'Conflitos são inevitáveis, porém são gerenciáveis.',
67:'Em uma equipe, o conflito pode estimular sentimentos de identidade.',
68:'A falta de apoio da chefia pode gerar frustração no profissional de sua equipe.',
69:'O principal objetivo da área de relações públicas é manter a compreensão mútua entre as empresas e os seus públicos.',
70:'A comunicação desempenha papel fundamental no processo político-social ao promover a troca de informações entre as empresas e a comunidade ou entre a comunidade e o Estado, e a esse processo, considerado a partir das empresas, dá-se o nome de relações públicas.',
71:'A comunicação descendente é utilizada para captar a opinião dos empregados, por meio de contato direto das chefias com as bases operativas e de manifestação de opiniões pelos funcionários.',
72:'Teaser designa o documento noticioso preparado pela empresa e destinado à imprensa cujo objetivo é simplesmente informar, mas com a intenção de que seja publicado.',
73:'Simpósio é um evento técnico dirigido por um coordenador a pessoas de mesmo nível e mesma qualificação, em grupos menores, dividido em exposição, discussão e conclusão.',
74:'Administrar as controvérsias públicas das partes interessadas, também conhecidas como stakeholders, no destino de uma organização é um dos papéis das relações públicas.',
75:'Conforme a classificação tradicional, o público misto é formado por públicos que, embora não atuem no âmbito da empresa, têm forte relação com ela.',
76:'Como uma das principais ferramentas de comunicação para o marketing, as relações públicas estão conectadas ao “P” de “Produto” do mix de marketing.',
77:'Ombudsman é o profissional contratado por uma empresa para ouvir, observar e criticar detalhes que precisam ser corrigidos a partir das reclamações provenientes dos clientes.',
78:'A identidade de uma empresa é resultante do balanço das percepções positivas e negativas dos públicos da empresa.',
79:'A requisição para retirada de materiais do almoxarifado deverá ser entregue ao encarregado desse setor com a assinatura do requisitante, que, por sua vez, deve ocupar cargo que preveja a possibilidade de retirada de materiais mediante requisição formal.',
80:'Compras de materiais de expediente devem ser realizadas pelo chefe de cada almoxarifado, independentemente do valor, conforme a necessidade de cada setor do órgão.',
81:'A transferência de computador sob a carga patrimonial do servidor A com destino ao servidor B de outra unidade administrativa deverá ocorrer por ato formal com a assinatura de ambos e a devida verificação física de existência e integridade do bem por esses servidores.',
82:'O grande volume de estoque com baixo ou nenhum giro implica a aquisição equivocada de insumo por parte do gestor.',
83:'A necessidade de insumos deverá ser comunicada com antecedência ao setor de compras para que este providencie a aquisição e o almoxarifado não fique sem estoque para suprir os setores do órgão.',
84:'A antecipação de recebíveis é prática recorrente de empresas e constitui-se como opção para evitar o comprometimento de imóveis como garantia.',
85:'O pagamento antecipado a fornecedores em troca de desconto financeiro é uma situação em que a empresa obtém receitas financeiras.',
86:'Caso determinado empregado solicite adiantamento de salário e seja atendido mediante indicação de retirada de numerário no caixa da empresa, o responsável pelo caixa deverá ficar com documento assinado pelo funcionário que retirou o dinheiro em lugar do numerário correspondente.',
87:'O lucro projetado tomará em consideração os insumos a serem consumidos pela empresa, as despesas, os custos e as receitas. Contudo, os gastos com depreciação, amortização e exaustão não serão considerados para a projeção dos lucros.',
88:'A venda de bens é a opção mais viável para a empresa captar recursos quando seu caixa não é capaz de arcar com obrigações correntes.'
}
const subjects={
51:['Redação Oficial','Finalidade, princípios e interesse público na redação oficial','Fácil'],52:['Redação Oficial','Expedientes oficiais: assinatura por autoridade interina','Média'],53:['Redação Oficial','Padrão ofício: paginação de documentos','Fácil'],54:['Redação Oficial','Exposição de motivos e comunicação com a Vice-Presidência','Fácil'],55:['Redação Oficial','Correspondência oficial: documento conjunto circular','Média'],
56:['Arquivologia','Arquivamento: finalidades e funções dos arquivos','Fácil'],57:['Arquivologia','Métodos de arquivamento vertical','Fácil'],58:['Arquivologia','Sistemas de arquivo: classificação, localização e instrumentos de pesquisa','Média'],59:['Arquivologia','Métodos de arquivamento numérico simples','Fácil'],
60:['Administração','Protocolo e gestão documental: arquivamento de cópias expedidas','Fácil'],61:['Administração','Protocolo: recebimento e abertura de documentos ostensivos','Média'],62:['Redação Oficial','Correspondência oficial: ofício','Fácil'],63:['Redação Oficial','Correspondência oficial e interesse público','Fácil'],
64:['Administração','Comportamento organizacional: motivação e desempenho no trabalho','Fácil'],65:['Administração','Comportamento organizacional: conflito e bem-estar no trabalho','Média'],66:['Administração','Comportamento organizacional: gestão de conflitos','Fácil'],67:['Administração','Comportamento organizacional: identidade e coesão de equipes','Média'],68:['Administração','Comportamento organizacional: apoio da chefia e frustração','Média'],
69:['Comunicação Social','Relações públicas: objetivos e relacionamento com os públicos','Fácil'],70:['Comunicação Social','Relações públicas: comunicação institucional e relação organização-comunidade','Média'],71:['Comunicação Social','Comunicação organizacional: fluxos ascendente e descendente','Média'],72:['Comunicação Social','Assessoria de imprensa: teaser e divulgação de notícias','Média'],73:['Comunicação Social','Eventos: conceito e organização de simpósios','Média'],74:['Comunicação Social','Relações públicas: gestão de controvérsias e stakeholders','Média'],75:['Comunicação Social','Relações públicas: classificação de públicos internos, externos e mistos','Média'],76:['Comunicação Social','Marketing: relações públicas e composto de marketing','Média'],77:['Comunicação Social','Ouvidoria e ombudsman: escuta e tratamento de reclamações','Média'],78:['Comunicação Social','Identidade e imagem organizacional: percepção dos públicos','Média'],
79:['Administração','Gestão de materiais: requisição e retirada em almoxarifado','Média'],80:['Administração','Gestão de compras: competências e processo de aquisição','Média'],81:['Administração','Gestão patrimonial: transferência e responsabilidade por bens móveis','Média'],82:['Administração','Gestão de estoques: giro, demanda e planejamento de suprimentos','Média'],83:['Administração','Gestão de estoques: reposição e comunicação da necessidade de compras','Média'],
84:['Administração Financeira','Gestão do capital de giro: antecipação de recebíveis e garantias','Média'],85:['Administração Financeira','Gestão de caixa: desconto financeiro por pagamento antecipado','Média'],86:['Administração','Tesouraria: adiantamento salarial, saque e comprovação documental','Média'],87:['Contabilidade','Apuração e projeção de resultado: custos, despesas, receitas e depreciação','Média'],88:['Administração Financeira','Captação de recursos e gestão de ativos para liquidez','Média']
}
if(Object.keys(stems).length!==38||Object.keys(subjects).length!==38)throw Error('Mapa de classificação ou transcrição incompleto')

const contexts={
51:{pagina:1,text:'A respeito da redação de expedientes, julgue os itens a seguir.'},
56:{pagina:1,text:'Julgue os itens subsequentes acerca de noções de arquivamento.'},
60:{pagina:1,text:'Com relação a procedimentos administrativos, julgue os itens que se seguem.'},
64:{pagina:1,text:'Julgue os itens seguintes a respeito de noções sobre relações humanas.'},
69:{pagina:1,text:'Julgue os itens relativos a relações públicas. Na sequência, a prova reúne itens sobre objetivos, comunicação institucional, fluxos de comunicação, assessoria de imprensa e eventos.'},
74:{pagina:1,text:'A respeito de relações públicas, julgue os itens seguintes.'},
79:{pagina:1,text:'No que se refere à administração de materiais e patrimônio, julgue os itens seguintes.'},
84:{pagina:2,text:'Em relação à administração financeira de empresas, julgue os itens subsequentes.'}
}
const duplicates=new Map([
 ['extr-9cd16b0b6170ce61e287','extr-708c93d29469f03a8488'],
 ['extr-17a18b17e1f9e13fb9ab','extr-f2f34a9afaa06400ce72'],
 ['extr-eb0a315e548c0a4a0523','extr-80105aae089fc10917e4'],
 ['extr-10d95237ec75b70a4a20','extr-3680999a170ae0c44a75'],
 ['extr-651be7d0fa099c660c89','extr-177a096ffeb48e14c06b'],
 ['extr-b62ece991087983c0f12','extr-b461ea50b60c073560e5']
])
const decisions=selected.map(q=>{
 const n=Number(q.numero),topic=subjects[n]
 if(!stems[n]||!topic)throw Error(`Questão ${n} fora da matriz manual`)
 const ctx=[...Object.entries(contexts)].reverse().find(([start])=>n>=Number(start))?.[1]
 const page=n<=83?1:2,image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const canonical=duplicates.get(q.id)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2021,concurso,cargo,organizadora:'CEBRASPE',aplicacao:'TELEBRAS — Cargo 16 — Assistente Administrativo',numero_original:n,pagina:page,enunciado:stems[n],opcoes:['Certo','Errado'],dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade conceitual e operacional; não divulgada como faixa oficial pela banca.',classificacao_fonte:prova,motivo:`Caderno oficial CEBRASPE/TELEBRAS 2021, Cargo 16, item ${n}; tema definido pelo enunciado e pelo comando do bloco. Cargo conferido no edital oficial.`,apta_resolucao:!canonical,...(!canonical?{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}:{inelegibilidade_motivo:'Registro OCR repetido do mesmo número de questão no mesmo caderno; mantida apenas uma versão canônica para evitar duplicidade.',duplicada_de:canonical}),texto_apoio:ctx.texto, reemplazarContexto:true,imagens_contexto:[{pagina:ctx.pagina,imagem:`paginas/${doc}-${String(ctx.pagina).padStart(4,'0')}.webp`,texto:ctx.texto}],visual:{pagina:page,imagem:image,texto_apoio:ctx.texto,motivo:`Página ${page} do caderno oficial vinculada ao item ${n}; transcrição cotejada visualmente com o original.`}}
})
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const duplicateCount=decisions.filter(d=>!d.apta_resolucao).length
if(decisions.length!==44||duplicateCount!==6)throw Error(`Esperados 44 registros e 6 duplicatas, obtidos ${decisions.length}/${duplicateCount}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:decisions.length,itensUnicos:new Set(decisions.map(d=>d.numero_original)).size,duplicatas:duplicateCount,paginas:[1,2],publicado:false},null,2));process.exit(0)}

const name='revisao-telebras-2021-cargo16-itens51-88-v313'
const result=await aplicarRevisoesIndividuais({nome:name,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,cargo,registrosRevistos:decisions.length,itensUnicos:38,duplicatasDesativadas:duplicateCount,paginasConferidas:[1,2],gabarito:false,publicado:false,observacao:'Classifiquei também registros do bloco que estavam incorretamente etiquetados como Física, Serviço Social ou Contabilidade. O gabarito definitivo não foi localizado nesta etapa e nenhuma resposta foi inventada; esses itens permanecem resolvíveis, sem correção automática.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## TELEBRAS 2021 — Cargo 16, Assistente Administrativo — itens 51–88 — v313\n\n- Corrigi 38 questões únicas de redação oficial, arquivologia, procedimentos administrativos, comportamento organizacional, relações públicas, gestão de materiais, administração financeira e contabilidade. Preenchi banca, concurso, cargo, ano, matéria, tópico e dificuldade estimada.\n- Revisei as páginas 1 e 2 do caderno original, transcrevi enunciados com falhas e associei as imagens e os contextos de cada bloco.\n- Identifiquei seis registros OCR repetidos dos itens 59, 60, 62, 79, 81 e 83; mantive uma versão resolvível de cada e desativei as cópias para que não apareçam duas vezes.\n- Não registrei gabaritos sem conferir a chave definitiva. As questões únicas continuam disponíveis para estudo, sem correção automática nesta revisão.\n- Validação local: ${result.total} questões, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [edital oficial do cargo 16](<https://cdn.cebraspe.org.br/concursos/TELEBRAS_21/arquivos/ED_1_TELEBRAS_21_ABERTURA.PDF>).\n`)
console.log(JSON.stringify(report,null,2))
