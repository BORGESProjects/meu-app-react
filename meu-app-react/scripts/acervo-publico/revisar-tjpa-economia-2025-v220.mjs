import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tjpa-economia-2025-v220',doc='fa9ed2b65deeb413'
const prova='https://cdn.cebraspe.org.br/concursos/TJ_PA_25_SERVIDOR/arquivos/2DF32B284D7EA83F64088E4846E3569EAA7DB4486BB4B0CB28B36791657C6892.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/tj_pa_25_servidor/arquivos/53483EE025122C939B2F57E9D9831C4AE6DBB76242274755374ADFDE74576960.pdf'
const justificativas='https://cdn.cebraspe.org.br/concursos/tj_pa_25_servidor/arquivos/5E10ADD3DCD4007DF1CFDCC2950380475E1C11ED98E3574F8A3A91CAA6C4EF82.pdf'
const concurso='TJPA 2025 — Analista Judiciário — Especialidade: Economia — Cargo 10'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='2DF32B284D7EA83F64088E4846E3569EAA7DB4486BB4B0CB28B36791657C6892.pdf'||catalog.questoes.length!==70)throw Error('Caderno TJPA Economia diverge do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-see-pe-historia-2022-v219'))
if(start<0)throw Error('Base anterior v219 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==70||wanted.size)throw Error(`Esperados 70 itens TJPA; encontrados ${byId.size}; ausentes ${wanted.size}`)
const textPages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`))),officialText=textPages.join('\n')
const clean=s=>s.replace(/CEBRASPE\s*[–-]\s*TJ_PA_SERVIDOR\s*[–-]\s*Edital:\s*2025/g,'').replace(/-\s*\n\s*/g,'-').replace(/\s+/g,' ').trim()
const re=/(?:^|\n)\s*(5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+([\s\S]*?)(?=\n\s*(?:5[1-9]|6\d|7\d|8\d|9\d|10\d|11\d|120)\s+|$)/g
const stems=new Map([...officialText.matchAll(re)].map(m=>[Number(m[1]),clean(m[2])]))
if(stems.size!==70||Array.from({length:70},(_,i)=>51+i).some(n=>!stems.has(n)))throw Error(`Caderno não contém os 70 enunciados completos: ${stems.size}`)
const key=['E','E','C','C','C','E','C','E','C','C','E','C','E','C','E','C','C','E','C','C','E','C','E','E','C','C','E','C','E','E','C','C','C','E','E','E','C','E','E','E','C','C','C','E','E','C','E','E','C','E','E','X','E','C','E','E','C','X','E','E','E','C','C','C','C','C','C','C','C','C']
if(key.length!==70)throw Error('Gabarito oficial precisa cobrir os 70 itens')
const contexts={
 51:'Acerca dos conceitos fundamentais de microeconomia, julgue os itens que se seguem.',
 55:'Julgue os itens a seguir, a respeito da determinação das curvas de procura, elasticidade, produtividade e custos de produção.',
 59:'Em relação à teoria da produção, ao equilíbrio da firma e à economia do bem-estar, julgue os itens subsecutivos.',
 62:'No que se refere a estruturas de mercado, cadeias e redes produtivas, competitividade e estratégia empresarial, julgue os itens seguintes.',
 66:'Considere uma economia em que o Banco Central mantém a taxa de juros constante por meio de política monetária ativa, diante de uma política fiscal expansionista. Os itens tratam dos impactos sobre o agregado monetário M1.',
 69:'Acerca dos instrumentos utilizados pelo Banco Central e de conceitos relacionados aos principais agregados monetários, julgue os itens subsequentes.',
 72:'Contexto hipotético: uma economia nacional opera com capital fixo no curto prazo, está sujeita a variações nominais de salários, preços internos e políticas fiscais expansionistas, adota câmbio fixo e mantém constante o nível de preços internacionais. Os itens examinam os efeitos macroeconômicos de choques salariais e fiscais e de movimentos nos preços internos.',
 76:'Julgue os próximos itens acerca dos conceitos de déficit e dívida pública.',
 78:'Texto-base do caderno: a economia internacional recente tem sido marcada por transformações nos fluxos comerciais e financeiros, influenciadas por câmbio, políticas comerciais e integração dos mercados. Tarifas, subsídios, blocos econômicos, organismos multilaterais e capitais internacionais são relevantes à formulação de políticas e ao equilíbrio macroeconômico. Julgue os itens com base nos fundamentos do comércio exterior, das finanças internacionais e das instituições multilaterais.',
 81:'No que diz respeito às funções do Estado em um sistema econômico, julgue os itens seguintes.',
 83:'Acerca da contabilidade do setor público e de suas métricas, julgue os itens subsequentes.',
 86:'Julgue os itens a respeito das políticas fiscal e monetária, do financiamento por dívida pública e da função reguladora do Estado na economia.',
 90:'No que se refere às desigualdades de renda no Brasil e ao sistema de previdência social, julgue os próximos itens.',
 92:'Em relação ao processo de industrialização no Brasil e às correspondentes mudanças estruturais na economia nacional, julgue os itens a seguir.',
 94:'Julgue os itens relativos à estrutura tributária brasileira.',
 96:'No que concerne à estrutura do orçamento público no Brasil e ao tratamento da dívida pública, julgue os itens subsecutivos.',
 98:'Julgue os itens referentes aos principais planos de estabilização econômica do século XX no Brasil e às relações comerciais e financeiras do Brasil com o mundo.',
 101:'Julgue os itens a seguir, que tratam dos princípios orçamentários e suas implicações.',
 103:'Julgue os itens relativos aos instrumentos de planejamento, execução e controle orçamentário.',
 105:'No que se refere às alterações orçamentárias e à sua articulação com outros aspectos da execução orçamentária, julgue os itens subsequentes.',
 107:'Julgue os itens referentes a alterações orçamentárias.',
 111:'Acerca das receitas públicas, julgue os itens a seguir.',
 114:'Julgue os itens relativos ao conceito, à classificação, aos estágios e às especificidades da despesa pública no Brasil.',
 117:'Com base na Lei de Responsabilidade Fiscal (LRF), julgue os itens subsequentes.',
 119:'Julgue os próximos itens à luz das disposições da Lei Complementar n.º 200/2023, que institui o regime fiscal sustentável para as contas da União.'
}
const contextFor=n=>Object.entries(contexts).reverse().find(([s])=>n>=Number(s))?.[1]||''
const topics={
51:['Economia','Microeconomia: cartéis, coordenação de produtores e eficiência'],52:['Economia','Microeconomia: controle de preços e bem-estar'],53:['Economia','Microeconomia: fronteira de possibilidades de produção e custo de oportunidade'],54:['Economia Internacional','Comércio internacional e fronteira de possibilidades de consumo'],
55:['Economia','Teoria do consumidor: maximização da utilidade e restrição orçamentária'],56:['Economia','Elasticidade-preço cruzada e classificação de bens'],57:['Economia','Produção: economias de escala e rendimentos constantes'],58:['Economia','Custos de produção no longo prazo e curva de custo médio'],59:['Economia','Função de produção Cobb–Douglas e rendimentos de escala'],60:['Economia','Equilíbrio competitivo de longo prazo e lucro econômico'],61:['Economia','Equilíbrio competitivo, eficiência de Pareto e equidade'],
62:['Economia','Estruturas de mercado: discriminação de preços e excedente do consumidor'],63:['Economia','Concorrência monopolística, diferenciação e barreiras à entrada'],64:['Economia','Integração vertical e dupla marginalização'],65:['Economia','Teoria dos jogos: decisões sequenciais e estratégia empresarial'],
66:['Economia Monetária','Política monetária, demanda por moeda e agregado M1'],67:['Economia Monetária','Política fiscal, depósitos à vista e multiplicador monetário'],68:['Economia Monetária','Política fiscal expansionista e meios de pagamento'],69:['Economia Monetária','Multiplicador monetário, papel-moeda e depósitos à vista'],70:['Economia Monetária','Depósito compulsório e oferta de moeda M1'],71:['Economia Monetária','Base monetária e meios de pagamento: composição e comparação'],
72:['Macroeconomia','Salário nominal, custos de produção e nível geral de preços'],73:['Macroeconomia','Câmbio real, preços domésticos e exportações líquidas'],74:['Macroeconomia','Salário nominal, salário real e mercado de trabalho'],75:['Macroeconomia','Política fiscal, atividade econômica, preços e câmbio real'],76:['Finanças Públicas','Dívida pública bruta e obrigações do setor público'],77:['Finanças Públicas','Déficit primário, dívida pública e dívida líquida'],
78:['Economia Internacional','Integração econômica: união aduaneira e tarifa externa comum'],79:['Economia Internacional','Tarifas de importação e saldo da balança comercial'],80:['Economia Internacional','FMI: estabilidade financeira e assistência a países'],81:['Economia do Setor Público','Função alocativa do Estado e bens públicos'],82:['Economia do Setor Público','Função estabilizadora e política macroeconômica'],
83:['Finanças Públicas','Necessidade de financiamento do setor público e dívida líquida'],84:['Finanças Públicas','Déficits público: nominal e operacional'],85:['Finanças Públicas','Gestão da dívida pública federal e perfil de vencimentos'],86:['Finanças Públicas','Política fiscal, tributos e oferta de moeda'],87:['Economia Monetária','Banco Central, meta de inflação e taxa Selic'],88:['Direito Financeiro','Lei de Responsabilidade Fiscal: limites ao endividamento público'],89:['Economia do Setor Público','Regulação econômica e funções das agências reguladoras'],
90:['Previdência Social','Benefício de prestação continuada e natureza assistencial'],91:['Previdência Social','Regime Geral de Previdência Social e resultado fiscal'],92:['Economia Brasileira','Plano de Metas e industrialização por substituição de importações'],93:['Economia Brasileira','Milagre econômico e financiamento externo'],94:['Finanças Públicas','Tributação: progressividade e distribuição da carga tributária'],95:['Direito Tributário','Competência tributária: IRPF, IPVA e IPTU'],
96:['Orçamento Público','Lei orçamentária anual e planejamento das receitas e despesas'],97:['Orçamento Público','Plano plurianual: vigência e ciclo de governo'],98:['Economia Brasileira','Balança comercial e pauta de exportações brasileiras'],99:['Economia Brasileira','Plano Cruzado: congelamento de preços e salários'],100:['Economia Brasileira','Plano Real e reforma monetária'],
101:['Orçamento Público','Princípio da anualidade orçamentária'],102:['Orçamento Público','LRF e princípio do equilíbrio orçamentário'],103:['Orçamento Público','PPA: alteração de metas e instrumentos legislativos'],104:['Orçamento Público','LDO, LOA e integração do planejamento orçamentário'],105:['Orçamento Público','Descentralização de créditos e classificação da despesa'],106:['Orçamento Público','Créditos extraordinários: urgência e imprevisibilidade'],107:['Orçamento Público','Transposição, remanejamento e transferência de recursos'],108:['Orçamento Público','Créditos suplementares e limites autorizados na LOA'],109:['Orçamento Público','Créditos especiais e fontes de recursos'],110:['Orçamento Público','Créditos suplementares, autorização legislativa e controle externo'],
111:['Contabilidade Pública','Receita patrimonial e exploração de atividades econômicas do Estado'],112:['Contabilidade Pública','Estágios da receita orçamentária'],113:['Direito Financeiro','Dívida ativa tributária e correção de vícios formais'],114:['Contabilidade Pública','Despesa pública: estágio da liquidação'],115:['Contabilidade Pública','Dívida flutuante, restos a pagar e operações de tesouraria'],116:['Orçamento Público','Legalidade orçamentária e fixação prévia da despesa'],117:['Direito Financeiro','LRF: gestão fiscal planejada, transparente e prevenção de riscos'],118:['Direito Financeiro','LRF: compatibilidade entre PPA, LDO, LOA e metas fiscais'],119:['Finanças Públicas','Regime fiscal sustentável: limites individualizados de despesa primária'],120:['Finanças Públicas','Regime fiscal sustentável: metas de resultado primário plurianuais']
}
if(Object.keys(topics).length!==70)throw Error('Classificação não cobre os 70 itens')
const annulled=new Set([102,108]),answerDigest=hashRevisao(key.join(',')),pageFor=n=>n<=77?1:n<=100?2:3
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const formula='Uma função de produção Cobb–Douglas Q(K, L) = A · K^α · L^β tem rendimentos decrescentes de escala se α + β < 1.'
const decisions=catalog.questoes.map(e=>{
 const n=e.numero,q=byId.get(e.id),[materia,conteudo]=topics[n],page=pageFor(n),answer=key[n-51],apoio=contextFor(n)
 if(!q||!stems.has(n)||!materia||!conteudo||!apoio||!answer)throw Error(`Item ${n}: campo essencial ausente`)
 const anulada=annulled.has(n),enunciado=n===59?formula:stems.get(n)
 if(/\/g\d{2,}/.test(enunciado))throw Error(`OCR simbólico pendente no item ${n}`)
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,concurso,numero_original:n,pagina:page,
  dificuldade:[59,61,64,65,67,69,70,72,73,75,77,78,79,83,84,85,88,90,91,94,95,97,98,100,102,103,105,106,107,108,109,110,113,115,118,119,120].includes(n)?'Difícil':[51,53,54,60,68,71,76,81,82,87,92,96,99,101,111,112,114,117].includes(n)?'Fácil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade microeconômica, macroeconômica, fiscal, contábil ou normativa; a banca não publica dificuldade psicométrica por item.',
  enunciado,opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:apoio,resposta_correta:anulada?null:answer==='C'?0:1,anulada,
  gabarito_oficial:{valor:anulada?'X':answer,fonte:gabarito,arquivo:'53483EE025122C939B2F57E9D9831C4AE6DBB76242274755374ADFDE74576960.pdf',justificativas,prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência ordenada dos 70 gabaritos oficiais definitivos, itens 51–120; não é hash criptográfico do PDF.',criterio:n===119?'Gabarito definitivo CEBRASPE; item 119 alterado de E para C conforme justificativa oficial.':anulada?'Gabarito definitivo CEBRASPE marca o item como anulado.':'Gabarito oficial definitivo CEBRASPE — TJPA 2025, Cargo 10: Economia.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura item a item do enunciado e do contexto; conteúdo econômico e jurídico-financeiro enquadrado por tema específico.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:`Página ${page} do caderno oficial associada ao item ${n}; fórmula do item 59 transcrita visualmente do original.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v220 do item ${n}: matéria e conteúdo específicos, ano, cargo, contexto e dificuldade classificados; gabarito definitivo aplicado${n===59?' e fórmula Cobb–Douglas recomposta do original':n===119?' com alteração de resposta de E para C':''}.`}
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_revisados:70,anuladas:[102,108],alteracao_definitiva:{item:119,de:'E',para:'C'},formulas_reconstruidas:[59],paginas_originais:3,publicado:false},null,2))
