import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tcesc-2022-economia-v299',doc='7f8774ff13ed5fd4'
const prova='https://cdn.cebraspe.org.br/concursos/tce_sc_21_auditor/arquivos/660_TCESC_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tce_sc_21_auditor/arquivos/GAB_DEFINITIVO_660_TCESC_004_01.PDF'
const base=raizesAtuais.find(x=>x.includes('revisao-inpi-2024-cargo14-redes-v298'))
if(!base)throw Error('Base local v298 não encontrada')
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='660_TCESC_004_01.PDF'||catalog.questoes.length!==66)throw Error('Caderno TCE/SC Ciências Econômicas divergente')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const grupo=records.filter(q=>q.materia==='Conhecimentos Específicos')
if(grupo.length!==39)throw Error(`Esperados 39 itens no grupo genérico, recebidos ${grupo.length}`)
const overrides={
 'extr-5af243826ed5487f107c':'O aumento do salário nominal gera aumento do nível de preços via expansão da demanda agregada.',
 'extr-4c55676f3602810b7461':'Nessa situação, o resultado operacional negativo significa que o governo está gastando acima de sua arrecadação de impostos, taxas e contribuições, ou seja, contribuindo para a elevação do endividamento do setor público.',
 'extr-390801e0a3cf72ab8e23':'A relação dívida pública bruta/PIB do país nos últimos dez anos tem crescido, mas, em 2021, o endividamento caiu mais de 8 pontos percentuais.',
 'extr-025baad0d3ec43e87c29':'A dívida chegou ao maior patamar da história em março de 2020, quando atingiu 90% do PIB.',
 'extr-ad937634fb14645668cd':'O prazo médio da dívida encerrou 2021 em 6,8 anos, acima dos 5,8 anos registrados no fim de 2020.',
 'extr-bbfd9781b41486c8d854':'No longo prazo, a minimização do custo para produzir q = 24.000 unidades envolve a contratação de 5 unidades de mão de obra.',
 'extr-88f4ab75619e03ba16a2':'Var(X̄) = 0,011 ∑ᵢ₌₁¹⁰ (Xᵢ − X̄)².'
}
const descriptions={
41:['Macroeconomia','Modelo IS-LM: moeda, produto e salário real'],42:['Macroeconomia','Modelo IS-LM: consumo autônomo e inclinação da curva IS'],43:['Macroeconomia','Dicotomia clássica e neutralidade da moeda'],44:['Macroeconomia','Salários nominais, preços e demanda agregada'],45:['Macroeconomia','Senhoriagem e financiamento dos gastos públicos'],47:['Macroeconomia','Agregados monetários: M1 e base monetária'],48:['Macroeconomia','Demanda por moeda e taxa de juros'],49:['Economia Internacional','Balanço de pagamentos e reservas internacionais'],51:['Microeconomia','Teoria do consumidor: utilidade marginal'],52:['Microeconomia','Teoria do consumidor: curva de Engel e renda'],53:['Microeconomia','Teoria da produção: função Cobb-Douglas e demanda por fatores'],54:['Microeconomia','Custos de produção: curto prazo e custo fixo'],55:['Microeconomia','Teoria da produção: isoquantas e minimização de custos'],56:['Microeconomia','Teoria da produção: produtividade marginal dos fatores'],57:['Microeconomia','Teoria da produção: escolha ótima de fatores'],58:['Economia do Setor Público','Falhas de mercado: externalidades e bens públicos'],59:['Economia do Setor Público','Bens públicos: não exclusividade e carona'],60:['Economia do Setor Público','Bens públicos: não exclusividade e não rivalidade'],61:['Economia do Setor Público','Função desenvolvimentista do Estado'],62:['Economia do Setor Público','Funções alocativa e distributiva do Estado'],63:['Economia do Setor Público','Função distributiva e transferências de renda'],65:['Finanças Públicas','Resultado fiscal: critérios acima e abaixo da linha'],66:['Finanças Públicas','Resultado primário, nominal e juros reais'],67:['Finanças Públicas','Resultado operacional e nominal'],68:['Finanças Públicas','Déficit operacional e endividamento público'],69:['Finanças Públicas','Dívida pública bruta e relação dívida/PIB'],70:['Finanças Públicas','Dívida pública: trajetória e participação no PIB'],72:['Finanças Públicas','Gestão da dívida pública: prazo médio e perfil de vencimentos'],73:['Matemática Financeira','Taxas de juros: taxa nominal e efetiva diária'],74:['Matemática Financeira','Taxas de juros: equivalência entre taxas mensal e anual'],75:['Matemática Financeira','Juros compostos: montante com capitalização diária'],76:['Matemática Financeira','Séries uniformes postecipadas e fator de valor atual'],77:['Matemática Financeira','Sistemas de amortização: SAC e Tabela Price'],78:['Matemática Financeira','Sistemas de amortização: prestações e amortização constante'],89:['Estatística','Amostragem sem reposição: variância da média amostral e correção para população finita']
}
const byNumber=new Map();for(const q of grupo){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const keepIds={44:'extr-5af243826ed5487f107c',68:'extr-4c55676f3602810b7461',69:'extr-390801e0a3cf72ab8e23',70:'extr-025baad0d3ec43e87c29',72:'extr-ad937634fb14645668cd'}
const decisions=[]
for(const [n,items] of byNumber){
 const keeper=items.find(q=>q.id===keepIds[n])||items[0]
 for(const q of items){
  if(q.id!==keeper.id){decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Economia',conteudo:`Duplicata OCR do item ${n}`,ano:2022,concurso:'TCE/SC 2022 — Auditor Fiscal de Controle Externo — Ciências Econômicas (Cargo 4)',numero_original:n,pagina:Number(q.pagina),classificacao_fonte:prova,motivo:'Duplicata de OCR do mesmo item e caderno; preservada a versão textual mais íntegra.',apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR do mesmo item.',duplicada_de:keeper.id});continue}
  const topic=descriptions[n]
  if(!topic)throw Error(`Falta classificação específica do item ${n}`)
  const enunciado=overrides[q.id]||q.enunciado.split(/\nCEBRASPE\s*[–-]\s*TCE\/SC[\s\S]*$/)[0].replace(/\s+/g,' ').trim()
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2022,concurso:'TCE/SC 2022 — Auditor Fiscal de Controle Externo — Ciências Econômicas (Cargo 4)',numero_original:n,pagina:Number(q.pagina),dificuldade:[53,54,56,57,65,66,67,68,69,70,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89].includes(n)?'Difícil':[43,45,47,48,49,51,55,58,59,60,61,62,63].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no conceito econômico, estatístico ou cálculo exigido; não é classificação publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 4; área e assunto conferidos pelo enunciado e pelo bloco temático do PDF.`,enunciado,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_660_TCESC_004_01.PDF',prova:catalog.arquivo,numero:n,pagina:1,criterio:'Referência ao gabarito definitivo oficial do Cargo 4; sem cópia/hash local, a correção automática não será habilitada por esta revisão.'}})
 }
}
if(decisions.length!==grupo.length)throw Error(`Decisões ${decisions.length} não correspondem aos ${grupo.length} registros`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Auditor Fiscal de Controle Externo — Ciências Econômicas (Cargo 4)',ano_aplicacao:2022,registros_revistos:grupo.length,questoes_unicas_reclassificadas:byNumber.size,duplicatas_inelegiveis:grupo.length-byNumber.size,questao_89_formula_restaurada:true,prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão TCE/SC 2022 — Economia e Estatística — v299\n\n- Classifiquei os 39 registros do grupo genérico em Macroeconomia, Microeconomia, Economia do Setor Público, Finanças Públicas e Estatística, com ano, aplicação e dificuldade estimada.\n- Deduplicatei os registros repetidos dos itens 44, 68, 69, 70 e 72. Restaurei o item 89 a partir do caderno oficial: Var(X̄) = 0,011 ∑ᵢ₌₁¹⁰ (Xᵢ − X̄)².\n- Gabarito definitivo oficial referenciado; correção automática não ativada porque o PDF não está arquivado com hash local. Resultado local: ${out.total} questões, ${out.disponiveis} disponíveis e ${out.pendentes} pendentes. Não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}); [gabarito oficial definitivo](${gabarito}).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
