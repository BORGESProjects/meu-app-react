import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-bcb-economia-v68'
const base='tmp/revisao-profissional/revisao-mpce-servico-social-v67/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/BCB_24/arquivos/959_BCB_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/bcb_24/arquivos/GAB_DEFINITIVO_959_BCB_001_01.PDF'
const doc='ad0ce551cc23c1cb'
const info=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8').then(s=>s.split('\n').filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc))
if(!info||Object.keys(info.respostas||{}).length!==60)throw Error('Gabarito definitivo local do BCB não foi identificado.')
const keys=['E','X','C','E','C','C','C','C','E','C','C','C','E','X','E','C','E','C','C','E',
 'C','C','C','C','E','E','E','C','E','C','E','E','X','E','E','C','C','E','C','C',
 'E','C','E','C','E','C','C','E','E','C','C','E','C','E','C','C','C','E','C','E',
 'E','C','C','E','E','C','C','E','X','E']
if(keys.length!==70)throw Error(`Chave definitiva incompleta: ${keys.length}`)
const answers=Object.fromEntries(keys.map((value,i)=>[String(51+i),value]))
for(const [n,v] of Object.entries(info.respostas))if(answers[n]!==v)throw Error(`Divergência entre transcrição oficial e registro local no item ${n}.`)
const keySha=info.sha256
const pendentes=JSON.parse(await fs.readFile('tmp/bcb-economia-pendentes.json','utf8'))
const classifica=n=>{
 if(n<=68){const map={51:['Economia','Macroeconomia: modelo keynesiano'],52:['Economia','Macroeconomia: crescimento de Solow'],53:['Economia','Macroeconomia aberta: câmbio e teoria quantitativa da moeda'],54:['Economia','Regulação bancária: risco operacional e requerimento de capital'],55:['Economia','Macroeconomia aberta: modelo Mundell-Fleming'],56:['Economia','Política monetária: taxa Selic e multiplicador monetário'],57:['Economia','Política fiscal e câmbio flexível'],58:['Economia','Política monetária: operações compromissadas e dívida pública'],59:['Economia','Política monetária: emissão de títulos pelo Banco Central'],60:['Economia','Macroeconomia: curva de Phillips e expectativas'],61:['Economia','Macroeconomia aberta: paridade do poder de compra'],62:['Economia','Macroeconomia aberta: paridade coberta de juros'],63:['Economia','Comércio exterior: elasticidade-preço e balança comercial'],64:['Economia','Macroeconomia aberta: regimes cambiais'],65:['Economia','Ciclos econômicos reais: produtividade'],66:['Economia','Ciclos econômicos reais: choques tecnológicos'],67:['Economia','Mercado de trabalho: modelo novo-keynesiano'],68:['Economia','Macroeconomia: modelos clássico e novo-keynesiano']};return map[n]}
 if(n<=78){const map={69:['Economia','Microeconomia: preferências quase lineares e escolha do consumidor'],70:['Economia','Teoria da firma: função de produção e custos'],71:['Economia','Teoria dos jogos: equilíbrio de Nash'],72:['Economia','Teoria dos jogos: estratégia dominante'],73:['Economia','Microeconomia: sinalização e seleção adversa'],74:['Economia','Microeconomia: problema principal-agente'],75:['Economia','Equilíbrio geral: lei de Walras'],76:['Economia','Economia do bem-estar: eficiência de Pareto'],77:['Economia','Economia comportamental: escolhas sob risco'],78:['Economia','Economia comportamental: efeito da certeza']};return map[n]}
 if(n<=96){const map={79:['Finanças','Títulos públicos: Tesouro Prefixado e risco de mercado'],80:['Finanças','Títulos públicos: Tesouro IPCA'],81:['Finanças','Mercado de capitais: valor intrínseco e preço de ações'],82:['Finanças','Mercado de capitais: ações ordinárias e preferenciais'],83:['Finanças','Mercado de opções: opção de venda e payoff'],84:['Finanças','Fundos de investimento e eficiência de mercado'],85:['Finanças','Fundos de investimento: classificação cambial'],86:['Finanças','Teoria de carteiras: aversão ao risco'],87:['Finanças','Teoria de carteiras: risco sistemático e diversificação'],88:['Finanças','Precificação de ativos: CAPM e APT'],89:['Finanças','Precificação de ativos: fatores de risco e APT'],90:['Finanças','Renda fixa: deslocamentos da estrutura a termo'],91:['Finanças','Renda fixa: expectativas e curva de juros'],92:['Finanças','Renda fixa: estrutura a termo e indicadores macroeconômicos'],93:['Finanças','Renda fixa: duration e convexidade'],94:['Finanças','Renda fixa: apreçamento por fluxo descontado'],95:['Finanças','Gestão de riscos: valor em risco (VaR)'],96:['Finanças','Riscos ambientais, sociais e de governança (ESG)']};return map[n]}
 if(n<=108){const map={97:['Estatística e Econometria','Estatística: convergência da variância amostral'],98:['Estatística e Econometria','Estatística: esperança da variância amostral'],99:['Estatística e Econometria','Estatística: distribuição de Poisson e máxima verossimilhança'],100:['Estatística e Econometria','Estatística: variância do estimador de máxima verossimilhança'],101:['Estatística e Econometria','Estatística: método dos momentos'],102:['Estatística e Econometria','Estatística: estimação de probabilidades por máxima verossimilhança'],103:['Estatística e Econometria','Econometria: estacionariedade de séries temporais'],104:['Estatística e Econometria','Econometria: estacionariedade em modelos VAR'],105:['Estatística e Econometria','Econometria: modelos vetoriais autorregressivos'],106:['Estatística e Econometria','Econometria: dados em painel e efeitos aleatórios'],107:['Estatística e Econometria','Econometria: dados em painel e efeitos fixos'],108:['Estatística e Econometria','Processos estocásticos: cadeias de Markov']};return map[n]}
 const map={109:['Contabilidade','COSIF: empréstimos e financiamentos'],110:['Contabilidade','COSIF: competência normativa e regulação contábil'],111:['Contabilidade','COSIF: investimentos societários e bonificações'],112:['Contabilidade','COSIF: classificação de títulos e instrumentos financeiros'],113:['Contabilidade','Contabilidade societária: reservas de lucros'],114:['Contabilidade','COSIF: ativos não financeiros mantidos para venda'],115:['Contabilidade','Contabilidade: provisões e passivos contingentes'],116:['Contabilidade','COSIF: reconhecimento de ativos intangíveis recebidos em doação'],117:['Contabilidade','Governança: atribuições do comitê de auditoria'],118:['Contabilidade','COSIF: ativos intangíveis em liquidação extrajudicial'],119:['Contabilidade','Demonstrações financeiras e normas de divulgação'],120:['Contabilidade','COSIF: encerramento de grupos de consórcio']};return map[n]
}
const texts={
 59:'O BCB emite títulos para a execução da política monetária.',
 68:'A perspectiva clássica enfatiza a capacidade dos mercados de alcançar equilíbrio e eficiência por conta própria, enquanto o modelo novo-keynesiano reconhece a possibilidade de desequilíbrios persistentes devido a rigidezes e imperfeições no mercado, sugerindo um papel mais ativo da política econômica na estabilização da economia.',
 69:'Mantidos fixos os preços, um aumento na renda do consumidor implica o consumo adicional do bem X.',
 76:'O primeiro teorema do bem-estar econômico garante que qualquer dotação inicial possibilita uma troca de bens que implica uma melhoria de Pareto.',
 78:'A inadequação do conjunto das respostas ao que se espera de agentes racionais é conhecida como efeito da certeza (certainty effect).',
 82:'Enquanto ações ordinárias dão direito apenas a voto, as ações preferenciais dão direito à parte dos dividendos proporcional ao número de votos detidos pelo acionista.',
 85:'Um fundo com investimento de pelo menos uma parte de seu patrimônio em ativos atrelados à variação cambial é um fundo cambial, de acordo com a Comissão de Valores Mobiliários (CVM).',
 87:'Na análise de carteiras de investimentos, o risco sistemático é a parcela que não pode ser eliminada por meio da diversificação.',
 89:'A APT é mais flexível que o CAPM, pois permite a inclusão de múltiplos fatores de risco, o que pode proporcionar uma avaliação mais precisa dos retornos esperados, especialmente em mercados complexos e multifacetados.',
 92:'A estrutura a termo reflete as expectativas do mercado em relação às futuras taxas de juros e fornece indícios sobre a conjuntura econômica, sendo influenciada por fatores como políticas monetárias, expectativas de inflação e condições econômicas globais.',
 96:'A medição dos riscos que envolvem fatores de ordem ambiental, social e de governança pode ser útil para a avaliação do desempenho de organizações públicas e privadas.',
 97:'Caso a população seja normal padrão, então, pela lei fraca dos grandes números, Sₙ² converge em probabilidade para 1 à medida que n → +∞.',
 98:'Se n = 100, então a esperança matemática do estimador S₁₀₀ é igual ao desvio padrão populacional.',
 99:'A estimativa de máxima verossimilhança da variância populacional é igual ou superior a 2.',
 100:'A estimativa da variância do estimador de máxima verossimilhança do parâmetro δ é igual a 0,32.',
 101:'A estimativa de δ pelo método dos momentos é igual a 1,6.',
 102:'A estimativa de máxima verossimilhança da probabilidade P(X = 0) é igual à frequência relativa de zeros na amostra, ou seja, 2/5.',
 108:'Em uma cadeia de Markov, a probabilidade de transição de um estado para outro é influenciada pela sequência completa de eventos anteriores.',
 110:'Os pronunciamentos técnicos do Comitê de Pronunciamentos Contábeis valem para as instituições do Sistema Financeiro Nacional assim que sua vigência for aprovada pelo Conselho Federal de Contabilidade, independentemente de ato do Conselho Monetário Nacional ou do BCB.',
 112:'Os instrumentos financeiros que não se enquadrem nas categorias de títulos para negociação ou de títulos mantidos até o vencimento devem ser registrados na categoria títulos disponíveis para venda.',
 116:'Os ativos intangíveis recebidos em doação, atendidos os requisitos legais e regulamentares, devem ser registrados pelo seu valor de mercado, com possibilidade de registro no ativo circulante.'
}
const contexts={
 60:'A macroeconomia é a área que estuda dinâmicas econômicas agregadas. Este bloco aborda conceitos macroeconômicos e seus efeitos sobre a economia.',
 61:'A macroeconomia é a área que estuda dinâmicas econômicas agregadas. Este bloco aborda conceitos macroeconômicos e seus efeitos sobre a economia.',
 62:'A macroeconomia é a área que estuda dinâmicas econômicas agregadas. Este bloco aborda conceitos macroeconômicos e seus efeitos sobre a economia.',
 63:'A macroeconomia é a área que estuda dinâmicas econômicas agregadas. Este bloco aborda conceitos macroeconômicos e seus efeitos sobre a economia.',
 64:'A macroeconomia é a área que estuda dinâmicas econômicas agregadas. Este bloco aborda conceitos macroeconômicos e seus efeitos sobre a economia.',
 69:'Para o consumidor, as preferências são quase lineares nos bens X e Y, consumidos nas quantidades x e y. A utilidade é U(x,y) = x + ln(y), em que ln representa o logaritmo natural.',
 71:'Jogo sequencial entre os bancos B1 (líder) e B2 (seguidor), que escolhem manter ou reduzir os juros. Payoffs (B1, B2): se B1 mantém, B2 manter = (30, 20) e reduzir = (18, 30); se B1 reduz, B2 manter = (40, 8) e reduzir = (35, 25). A imagem da árvore de decisão do caderno oficial está associada a esta questão.',
 72:'Jogo sequencial entre os bancos B1 (líder) e B2 (seguidor), que escolhem manter ou reduzir os juros. Payoffs (B1, B2): se B1 mantém, B2 manter = (30, 20) e reduzir = (18, 30); se B1 reduz, B2 manter = (40, 8) e reduzir = (35, 25). A imagem da árvore de decisão do caderno oficial está associada a esta questão.',
 77:'Experimento sobre escolhas sob risco: opção A paga $ 2.500 com probabilidade de 33%, $ 2.400 com 66% e $ 0 com 1%; opção B paga $ 2.400 com certeza. No segundo experimento, opção C paga $ 2.500 com probabilidade de 33% e $ 0 com 67%; opção D paga $ 2.400 com 34% e $ 0 com 66%. 82% escolheram B, 83% escolheram C e 61% escolheram B e C conjuntamente.',
 78:'Experimento sobre escolhas sob risco: opção A paga $ 2.500 com probabilidade de 33%, $ 2.400 com 66% e $ 0 com 1%; opção B paga $ 2.400 com certeza. No segundo experimento, opção C paga $ 2.500 com probabilidade de 33% e $ 0 com 67%; opção D paga $ 2.400 com 34% e $ 0 com 66%. 82% escolheram B, 83% escolheram C e 61% escolheram B e C conjuntamente.',
 90:'A estrutura a termo relaciona rendimentos de títulos de dívida de qualidade similar aos diferentes prazos até o vencimento e costuma ser representada por uma curva de rendimentos. Referência do caderno: Ross, Westerfield e Jaffe, Administração Financeira, 25.ª ed., Atlas, 2002 (com adaptações).',
 91:'A estrutura a termo relaciona rendimentos de títulos de dívida de qualidade similar aos diferentes prazos até o vencimento e costuma ser representada por uma curva de rendimentos. Referência do caderno: Ross, Westerfield e Jaffe, Administração Financeira, 25.ª ed., Atlas, 2002 (com adaptações).',
 92:'A estrutura a termo relaciona rendimentos de títulos de dívida de qualidade similar aos diferentes prazos até o vencimento e costuma ser representada por uma curva de rendimentos. Referência do caderno: Ross, Westerfield e Jaffe, Administração Financeira, 25.ª ed., Atlas, 2002 (com adaptações).',
 97:'Considere uma amostra aleatória simples de uma população normal, com desvio padrão amostral Sₙ. No item 97, suponha que a população seja normal padrão.',
 98:'Considere uma amostra aleatória simples de uma população normal, com desvio padrão amostral Sₙ. No item 98, n = 100.',
 99:'A amostra observada é (3, 0, 0, 1, 4), de tamanho n = 5, retirada de uma população com função de probabilidade P(X = x) = e^(−δ) δˣ / x!, para δ > 0 e x ∈ {0, 1, 2, …}.',
 100:'A amostra observada é (3, 0, 0, 1, 4), de tamanho n = 5, retirada de uma população com função de probabilidade P(X = x) = e^(−δ) δˣ / x!, para δ > 0 e x ∈ {0, 1, 2, …}.',
 101:'A amostra observada é (3, 0, 0, 1, 4), de tamanho n = 5, retirada de uma população com função de probabilidade P(X = x) = e^(−δ) δˣ / x!, para δ > 0 e x ∈ {0, 1, 2, …}.',
 102:'A amostra observada é (3, 0, 0, 1, 4), de tamanho n = 5, retirada de uma população com função de probabilidade P(X = x) = e^(−δ) δˣ / x!, para δ > 0 e x ∈ {0, 1, 2, …}.',
}
const easy=new Set([51,55,56,58,59,61,65,66,73,74,79,80,81,82,84,85,87,89,95,96,103,109,111,112,115,116,117])
const hard=new Set([53,54,57,62,63,64,67,68,70,71,75,76,77,88,90,91,93,97,98,99,100,101,102,104,105,106,107,108,110,113,114,118,119,120])
const decisions=[]
for(const q of pendentes){
 const n=Number(q.numero_original),classification=classifica(n),answer=answers[String(n)]
 if(!classification||!answer)throw Error(`Classificação ou gabarito ausente para o item ${n}.`)
 const page=n<=70?1:n<=85?2:n<=105?3:4
 const image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 const anulada=answer==='X'
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:classification[0],conteudo:classification[1],ano:2024,pagina:page,dificuldade:easy.has(n)?'Fácil':hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e matemática e pelo número de etapas de raciocínio; a banca não publica índice individual de acerto.',classificacao_fonte:prova,motivo:`Banco Central do Brasil 2024 — Analista, área Economia e Finanças, caderno 1, item ${n}. Matéria e tópico conferidos pela seção e pelo conteúdo do caderno oficial.`,imagem_pagina:image,texto_apoio:contexts[n]||''}
 if(Object.hasOwn(texts,n))d.enunciado=texts[n]
 d.anulada=anulada;d.resposta_correta=anulada?null:answer==='C'?0:1;d.gabarito_oficial={valor:answer,fonte:gabarito,sha256:keySha,metodo:'Conferência item a item com o gabarito oficial definitivo do Caderno 1; anuladas mantidas sem correção automática.'}
 decisions.push(d)
}
if(decisions.length!==67||new Set(decisions.map(x=>x.id)).size!==67)throw Error(`Contagem inesperada: ${decisions.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'Banco Central do Brasil 2024 — Analista — Economia e Finanças',documento_id:doc,questoes_da_prova_revisadas:67,questoes_unicas_classificadas:67,gabaritos_oficiais_conferidos:67,anuladas:[52,64,83,119],imagens_de_pagina_corrigidas:67,formulas_e_diagrama_reestruturados:true,fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
