import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tbg-2023-analista-comercializacao-v530',doc='dc89e45c51027076'
const base='tmp/revisao-profissional/revisao-fub-2016-audiovisual-cargo14-v529/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/888_TBG_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_003_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,72)

// Chave definitiva oficial do Cargo 3, itens 31–100; X = questão anulada.
const respostas='31:C|32:E|33:E|34:E|35:E|36:C|37:E|38:C|39:C|40:E|41:C|42:E|43:C|44:C|45:E|46:E|47:C|48:C|49:C|50:E|51:C|52:E|53:C|54:E|55:X|56:C|57:E|58:C|59:C|60:E|61:E|62:C|63:C|64:E|65:C|66:C|67:E|68:E|69:E|70:E|71:C|72:C|73:E|74:C|75:E|76:C|77:C|78:E|79:C|80:E|81:C|82:C|83:E|84:C|85:X|86:E|87:E|88:C|89:C|90:E|91:E|92:E|93:E|94:E|95:C|96:C|97:E|98:C|99:C|100:C'
const resposta=new Map(respostas.split('|').map(v=>{const [n,a]=v.split(':');return[Number(n),a]}))
const assuntos={
 31:['Engenharia de Petróleo','Indústria do gás natural: exploração, desenvolvimento e produção','Fácil'],32:['Economia','Armazenamento de gás natural e segurança de suprimento','Média'],33:['Engenharia de Petróleo','Cadeia do gás natural: distribuição','Fácil'],34:['Engenharia de Petróleo','Gás natural: liquefação e regaseificação','Fácil'],35:['Engenharia de Petróleo','Processamento de gás natural','Média'],
 36:['Direito Administrativo','Regulação da indústria do gás: consumidor livre e comercialização','Média'],37:['Direito Administrativo','Regulação do transporte de gás: autorização e permissão','Média'],38:['Engenharia de Petróleo','Transporte de gás: zona de balanceamento','Média'],39:['Direito Administrativo','Independência e autonomia do transportador de gás','Média'],40:['Direito Administrativo','Mercado organizado de gás natural e agentes autorizados','Difícil'],
 41:['Administração','Gestão de projetos: planejamento, escopo, recursos e cronograma','Fácil'],43:['Administração','Gestão de projetos: ciclo de vida','Fácil'],45:['Administração','Gestão de projetos: custo de correção de problemas ao longo do ciclo de vida','Média'],
 46:['Direito Administrativo','Regulação econômica do transporte de gás: tarifas e competência da ANP','Média'],47:['Direito Administrativo','Regulação de contratos e concorrência no mercado de gás','Difícil'],48:['Engenharia de Petróleo','Transporte de gás natural: serviço interruptível','Média'],49:['Direito Administrativo','Gasodutos de transporte para importação e exportação','Média'],50:['Direito Administrativo','Área de mercado de capacidade e gestor de mercado','Difícil'],
 51:['Economia','Mercado de gás natural: oferta nacional','Média'],52:['Economia','Mercado de gás natural: concentração e participação de mercado','Média'],53:['Engenharia de Petróleo','Produção de gás natural: campos marítimos e gás associado','Média'],54:['Economia','Mercado de gás natural: oferta importada e gasoduto Bolívia–Brasil','Fácil'],
 57:['Direito Tributário','Tributação do transporte dutoviário de gás e documentação fiscal','Difícil'],
 58:['Economia','Regulação tarifária do transporte de gás natural','Média'],59:['Economia','Tarifação do gás: receita máxima permitida','Difícil'],60:['Direito Administrativo','Base regulatória de ativos e autorização da ANP','Difícil'],61:['Direito Administrativo','Oferta de capacidade firme, ociosa e interruptível','Difícil'],62:['Engenharia de Petróleo','Capacidade de transporte de gás natural','Média'],63:['Direito Administrativo','Contratação de capacidade de transporte por entrada e saída','Média'],
 64:['Direito Administrativo','Indústria do gás natural: verticalização e relações societárias','Difícil'],65:['Engenharia de Petróleo','Cadeia produtiva do gás natural: exploração e produção','Média'],66:['Economia','Indústria do gás: monopólio natural e concorrência na produção','Média'],67:['Direito Administrativo','Concessão de distribuição local de gás canalizado','Média'],
 68:['Engenharia Ambiental','Matriz energética brasileira: oferta interna de energia','Fácil'],69:['Engenharia Ambiental','Matriz elétrica: participação da energia eólica','Fácil'],70:['Engenharia Ambiental','Matriz energética: participação das fontes renováveis','Fácil'],
 71:['Informática','Mineração de dados: limpeza de dados e valores ausentes','Difícil'],72:['Informática','Mineração de dados: identificação de padrões','Média'],73:['Matemática Financeira','Taxa média de juros compostos e média geométrica','Difícil'],74:['Matemática Financeira','Taxa média em juros simples e média aritmética','Média'],75:['Matemática Financeira','Valor presente e desconto composto de fluxo futuro','Média'],76:['Matemática Financeira','Taxas equivalentes: capitalização semestral e anual','Média'],
 77:['Administração','Análise de investimentos: valor presente líquido e taxa de desconto','Média'],78:['Administração','Análise de investimentos: taxa interna de retorno','Difícil'],79:['Administração','Análise de investimentos: ordem dos fluxos de caixa e VPL','Média'],80:['Economia','Análise de investimentos: comparação de fluxos de caixa pelo VPL','Difícil'],81:['Economia','Análise de investimentos: valor presente líquido a 10%','Média'],82:['Administração','Análise de investimentos: payback descontado','Difícil'],83:['Administração','Análise de investimentos: payback simples','Média'],84:['Economia','Regulação tarifária do transporte de gás: custos operacionais','Difícil'],85:['Economia','Regulação tarifária do transporte de gás: metodologia price-cap','Difícil'],
 86:['Engenharia Ambiental','Política de resíduos sólidos: acesso municipal a recursos federais','Média'],87:['Engenharia Ambiental','Resíduos sólidos: parcerias com associações de catadores','Média'],88:['Engenharia Ambiental','Plano municipal de gestão de resíduos sólidos','Média'],89:['Direito Administrativo','Regulação estatal: domínio dos potenciais de energia hidráulica','Média'],90:['Direito Administrativo','Autorização para aproveitamento de potencial energético de baixa capacidade','Difícil'],91:['Direito Administrativo','Monopólio da União: transporte de petróleo, derivados e gás natural','Média'],
 92:['Engenharia Elétrica','Setor elétrico brasileiro: atribuições da CCEE','Média'],93:['Engenharia Elétrica','Mercado livre de energia elétrica e tarifas ao consumidor','Média'],94:['Engenharia Elétrica','Planejamento do setor elétrico e atribuições da EPE','Média'],95:['Engenharia Elétrica','Fiscalização e operação do sistema elétrico: ONS','Média'],96:['Administração','Análise de investimentos: inflação e taxa de desconto','Difícil'],97:['Administração','Indicadores de desempenho: retorno sobre o investimento (ROI)','Média'],98:['Contabilidade','Análise das demonstrações: índice de liquidez corrente','Fácil'],99:['Contabilidade','Fluxo de caixa: alienação de imobilizado e participações societárias','Difícil'],100:['Contabilidade','Análise das demonstrações: composição do endividamento','Média']
}
const respostasContexto=[
 [[31,35],'Itens sobre etapas da cadeia de valor e da logística do gás natural.'],
 [[36,40],'Itens sobre legislação, agentes, organização de mercado e regulação da indústria brasileira do gás natural.'],
 [[41,45],'Itens sobre gestão de projetos, planejamento, ciclo de vida, escopo e custos de correção.'],
 [[46,50],'Itens sobre contratos, serviços, tarifas e organização do transporte de gás natural.'],
 [[51,54],'Itens sobre produção, oferta, importação e estrutura do mercado brasileiro de gás natural.'],
 [[57,57],'Item sobre emissão de documentos fiscais e medição do fluxo físico no transporte dutoviário de gás natural.'],
 [[58,60],'Itens sobre tarifas de transporte, receita máxima permitida e base regulatória de ativos.'],
 [[61,63],'Itens sobre oferta, capacidade e contratação de serviços de transporte de gás natural.'],
 [[64,67],'Itens sobre estrutura e regulação dos segmentos da indústria de petróleo e gás natural.'],
 [[68,70],'Itens sobre a composição da matriz energética brasileira e da oferta interna de energia.'],
 [[71,72],'Itens sobre mineração de dados e preparação de conjuntos de dados.'],
 [[73,74],'João pagará um empréstimo em parcela única após três meses. As taxas mensais são 6%, 8% e 13%; os itens comparam taxas médias sob juros compostos e simples.'],
 [[75,76],'Pedro precisa dispor de R$ 10.000 em três anos. Uma aplicação oferece rendimento líquido de 10% ao ano; considere o valor presente e as equivalências de taxas indicadas no item.'],
 [[77,79],'Um empresário investiu R$ 250.000; os fluxos líquidos previstos são R$ 150.000 no primeiro ano, R$ 100.000 no segundo e R$ 50.000 no terceiro. A taxa anual de desconto é r; podem ser usadas as aproximações (1,10)⁻¹ = 0,91, (1,10)⁻² = 0,83 e (1,10)⁻³ = 0,75.'],
 [[80,81],'Tabela de fluxos líquidos de caixa, em milhares de reais, para quatro anos: opção 1 = 20, 10, 20 e 10; opção 2 = 15, 18, 15 e 18. Considere taxa de desconto de 10% e as aproximações fornecidas no caderno.'],
 [[82,83],'Lisa investiu R$ 2.800.000. Espera fluxo adicional anual de R$ 500.000 nos três primeiros anos e R$ 600.000 nos seguintes; a taxa de desconto é 12% ao ano. Os itens tratam de payback simples e descontado.'],
 [[84,85],'Itens sobre fundamentos e metodologias de tarifação do transporte de gás natural na Europa. O item 85 foi anulado no gabarito definitivo.'],
 [[86,88],'Um município com aterro sanitário enfrenta dificuldades financeiras e busca recursos federais para implantar coleta de resíduos sólidos com apoio de associação local de catadores.'],
 [[89,91],'Itens sobre regulação econômica pelo Estado brasileiro e competências relativas a recursos energéticos.'],
 [[92,95],'Itens sobre a estrutura e as competências institucionais do setor elétrico brasileiro.'],
 [[96,97],'Itens sobre indicadores econômicos e financeiros para analisar a viabilidade de projetos.'],
 [[98,100],'Itens sobre índices contábeis, fluxo de caixa e composição das exigibilidades.']
]
const contexto=n=>respostasContexto.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const reparos={
 34:'A regaseificação é o processo de transformação física do gás natural, do estado gasoso para o estado líquido.',
 38:'A zona de balanceamento consiste na delimitação de gasoduto ou sistema de transporte de gás natural na qual são apurados os desequilíbrios entre os volumes injetados e retirados de gás natural.',
 39:'O transportador deve construir, operar e manutenir os gasodutos de transporte com independência e autonomia em relação aos agentes que exerçam atividades concorrenciais da indústria de gás natural.',
 40:'O mercado organizado de gás natural refere-se especificamente ao espaço físico destinado à negociação de operações com gás natural por um conjunto determinado de agentes autorizados a operar, por conta própria ou de terceiros.',
 45:'O custo de corrigir problemas é relativamente grande nas fases iniciais, diminuindo exponencialmente com o progresso do projeto.',
 50:'Os transportadores que operam em uma mesma área de mercado de capacidade são dispensados de constituir gestor de área de mercado.',
 54:'A oferta importada de gás natural ingressa no mercado brasileiro exclusivamente pela Bolívia, e o gás é transportado pelo gasoduto Bolívia–Brasil (GASBOL).',
 63:'Os serviços de transporte de gás natural serão oferecidos no regime de contratação de capacidade por entrada e saída, e a entrada e a saída de gás natural poderão ser contratadas de forma independente uma da outra.',
 70:'As fontes de energia renovável representam a maior parcela de contribuição na oferta interna de energia do Brasil.',
 72:'A mineração de dados não se limita às técnicas de obtenção de dados, envolvendo também a observação de padrões nos dados obtidos.',
 73:'Caso o empréstimo tenha sido tomado sob o regime de juros compostos, então a taxa média é a média geométrica das taxas mensais, ou seja, ∛(6% × 8% × 13%).',
 74:'Caso o empréstimo tenha sido tomado sob o regime de juros simples, conclui-se que a taxa média é a média aritmética das taxas mensais, ou seja, (6% + 8% + 13%) / 3.',
 75:'Se Pedro aplicar P = 10.000 × (0,90)³ ou P = 10.000 / (1,10)³, ele conseguirá montantes diferentes, mas ambos suficientes para pagar os R$ 10.000 daqui a três anos.',
 76:'Uma aplicação do principal P que renda 5% ao semestre trará o mesmo montante que a aplicação financeira que rende 10% ao ano.',
 79:'Caso os fluxos líquidos de caixa ocorram em ordem invertida, ou seja, R$ 50.000 no primeiro ano, R$ 100.000 no segundo ano e R$ 150.000 no terceiro ano, o valor presente líquido (VPL) do investimento não mudará.',
 81:'Pelo critério do VPL, a uma taxa de desconto de 10% ao ano, conclui-se que a opção 2 é mais vantajosa que a opção 1.',
 83:'O payback do investimento de Lisa é maior que 4 anos.',
 85:'A metodologia de cálculo da tarifa relativa ao transporte de gás natural é o price-cap, ou preço-teto.',
 91:'Constitui monopólio da União o transporte, por meio de conduto, de petróleo bruto e seus derivados, inclusive gás natural de qualquer origem.',
 95:'A fiscalização do setor de energia elétrica é realizada pelo Operador Nacional do Sistema Elétrico (ONS).',
 99:'Não haverá impacto no fluxo de caixa operacional se o administrador da empresa decidir vender o imóvel próprio da administração em conjunto com participações societárias de outra empresa.'
}
const porNumero=new Map()
for(const q of raw){const n=Number(q.numero),a=porNumero.get(n)||[];a.push(q);porNumero.set(n,a)}
assert.equal(porNumero.size,66)
assert.deepEqual([...porNumero].filter(([,a])=>a.length>1).map(([n])=>n),[34,38,39,40,45,54])
const canonicos={34:'extr-0ef835e701fa8c80ccd5',38:'extr-0bf17b02012c38e1894c',39:'extr-370000798cf027a444b6',40:'extr-cb0570cbc19bf6c533e8',45:'extr-3aa8aef0a6e15b3e47b9',54:'extr-acde05409f2da0dfc2f0'}
const decisoes=[]
for(const [n,registros] of [...porNumero].sort((a,b)=>a[0]-b[0])){
 const canon=canonicos[n]?registros.find(q=>q.id===canonicos[n]):registros[0]
 const [materia,conteudo,dificuldade]=assuntos[n]||[],g=resposta.get(n),ctx=contexto(n)
 assert.ok(canon&&materia&&conteudo&&dificuldade&&g&&ctx,`Dados ausentes no item ${n}`)
 const enunciado=(reparos[n]||canon.enunciado).replace(/\s*\|\|8880030182845\|\|[\s\S]*$/,'').replace(/\s+(?:BLOCO II|BLOCO III)\b[\s\S]*$/,'').replace(/\s+/g,' ').trim()
 const page=Number(canon.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,anulada=g==='X'
 const metadata={materia,conteudo,ano:2023,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'TBG 2023 — Cargo 3: Analista Júnior — Ênfase: Comercialização',cargo:'Analista Júnior — Ênfase: Comercialização',aplicacao:'15/10/2023',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade do conteúdo e dos cálculos; a banca não divulgou dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} conferido na prova oficial do Cargo 3; classificado pelo assunto avaliado e comparado com o gabarito definitivo do Cebraspe.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:anulada?null:g==='C'?0:1,anulada,texto_apoio:ctx,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 3: Analista Júnior, Ênfase Comercialização — aplicação em 15/10/2023',item:n,resposta:g,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 assert.ok(enunciado.length>25,`Enunciado incompleto no item ${n}`)
 decisoes.push({id:canon.id,sha256_enunciado:hashRevisao(canon.enunciado),...metadata,enunciado,pagina:page,visual:{pagina:page,imagem,motivo:'Página original da prova conferida visualmente; preserva enunciado, contexto, tabela e fórmulas.'},apta_resolucao:true,correcao_automatica:!anulada})
 for(const dup of registros.filter(q=>q.id!==canon.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...metadata,enunciado,resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item_no_mesmo_caderno',duplicada_de:canon.id,pagina:Number(dup.pagina)})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'15/10/2023',concurso:'TBG 2023 — Cargo 3: Analista Júnior — Ênfase: Comercialização',nota:'A prova oficial contém itens 31–100. Neste lote havia 66 números distintos pendentes; os números 42, 44, 55 e 56 já estavam fora da fila de classificação. Seis itens tinham captura duplicada (34, 38, 39, 40, 45 e 54); duplicatas foram mantidas inelegíveis. O item 85 foi anulado no gabarito definitivo. Fórmulas dos itens 73–76 foram conferidas visualmente nas páginas originais.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'TBG 2023 — Cargo 3: Analista Júnior — Ênfase: Comercialização',itens_distintos_pendentes:66,registros_revisados:72,duplicatas_inelegiveis:6,anulados:[85],gabaritos_vinculados:66,prova_oficial:prova,gabarito_definitivo:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
