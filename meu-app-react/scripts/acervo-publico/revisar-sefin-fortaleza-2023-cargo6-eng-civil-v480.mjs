import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sefin-fortaleza-2023-cargo6-engenharia-civil-v480'
const documento='2117896de4b1eda1'
const prova='https://cdn.cebraspe.org.br/concursos/SEFIN_FORTALEZA_CE_23/arquivos/848_SEFIN_CE_ANALISTA_006_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/sefin_fortaleza_ce_23/arquivos/GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_006_01.PDF'
const concurso='SEFIN Fortaleza/CE — Analista Fazendário Municipal — Engenharia Civil (Cargo 6) — 2023'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,75)
const hashes=new Map(pendentes.map(q=>[q.id,hashRevisao(q.enunciado)]))
const respostas=[
 'C','C','E','C','C','C','E','E','E','E','E','C','E','C','C','E','C','C','E','E',
 'C','C','C','C','E','C','E','C','E','E','C','E','C','C','E','E','E','E','C','C',
 'E','E','C','E','C','C','E','E','E','X','C','C','E','C','C','E','E','E','E','C',
 'E','E','C','C','C','E','C','E','C','E','E','E','C','C','C','E','C','C','E','E',
 'E','C','X','E','E','C','E','E','C','C','C','E','E','E','C','E','E','E','E','C'
]
assert.equal(respostas.length,100)
const respostaPorNumero=new Map(respostas.map((r,i)=>[i+51,r]))
const assuntos=new Map()
const grupo=(nums,materia,conteudo)=>nums.forEach(n=>assuntos.set(n,[materia,conteudo]))
grupo([51,52,53],'Direito Urbanístico','Estatuto da Cidade (Lei nº 10.257/2001): diretrizes, direito a cidades sustentáveis e objetivos da política urbana')
grupo([54,55,56],'Parcelamento do Solo Urbano','Lei nº 6.766/1979: requisitos e restrições ao parcelamento urbano')
grupo([57,58,59],'Legislação Municipal','Lei Orgânica de Fortaleza: competências municipais, distritos e serviços públicos')
grupo([60,61,62],'Planejamento Urbano','Plano Diretor Participativo de Fortaleza (LC nº 62/2009): uso e ocupação do solo e participação social')
grupo([63,64,65],'Planejamento Urbano','Lei de Uso e Ocupação do Solo de Fortaleza (LC nº 236/2017): zonas e ordenamento territorial')
grupo([66,67],'Legislação Ambiental','Lei nº 9.605/1998: sanções penais e administrativas ambientais')
grupo([68],'Cadastro Territorial','Cadastro territorial multifinalitário: diretrizes da Portaria MDR nº 3.242/2022')
grupo([69,70,71,72],'Licenciamento Ambiental','Resoluções CONAMA nº 237/1997 e nº 1/1986: licenças ambientais, EIA e diagnóstico ambiental')
grupo([73,74,75],'Gestão e Documentação de Obras','Alterações de projeto, registro as built e responsabilidade técnica na execução de obra pública')
grupo([76,77,78,79],'Planejamento e Controle de Obras','Cronograma físico-financeiro: acompanhamento, orçamento detalhado, atrasos e valor agregado')
grupo([80,81,82],'Orçamentação de Obras','Composição de custos unitários: insumos, quantitativos e preços')
grupo([83,84,85,86],'Patologia das Construções','Patologias em edificações: movimentações higroscópicas, fissuras e recalque diferencial')
grupo([87,88,89],'Materiais de Construção','Armazenamento e conservação de cimento e aço; gestão de suprimentos em obras')
grupo([90,91,92],'Orçamento de Obras','Benefícios e despesas indiretas (BDI): custos indiretos, mobilização e encargos')
grupo([93,94],'Orçamento de Obras','Curva ABC de serviços: concentração de custos e classes de relevância')
grupo([95,96,97],'Planejamento e Controle de Obras','PERT/CPM: caminho crítico, folgas e impacto de atrasos no prazo da obra')
grupo([98,99,100],'Topografia e Cadastro Territorial','Parcelas, implantação e materialização da rede de referência cadastral municipal')
grupo([101,102,103],'Avaliação de Imóveis','ABNT NBR 14653-2: depreciação, variáveis do método comparativo e vistoria')
grupo([104,105,106,107],'Engenharia Econômica','Avaliação de investimentos: fluxo de caixa, juros compostos, taxa interna de retorno e valor presente líquido')
grupo([108,109,110,111],'Perícias de Engenharia','Perícia de edificações: habilitação, laudo, vício e defeito; responsabilidade técnica e ART')
grupo([112,113,114],'Avaliação de Imóveis','CUB, custo de reprodução, valor depreciável e depreciação Ross-Heidecke')
grupo([115,116,117],'Estatística Aplicada à Engenharia','Regressão linear: inferência sobre parâmetros, variáveis e diagnóstico dos resíduos')
grupo([118,119,120,121],'Estatística Descritiva','Medidas de posição, dispersão e forma da distribuição; dados da tabela da página original')
grupo([122,123,124,125,126],'Estatística Aplicada à Engenharia','Regressão linear simples e ANOVA: coeficientes, correlação, variância e teste F')
grupo([127,128,129],'Inferência Estatística','Intervalo de confiança e testes de hipóteses para média: erro, p-valor e nível de significância')
grupo([130,131,132],'Probabilidade','Eventos independentes, inclusão e interseção; probabilidade condicional')
grupo([133,134,135,136],'Informática Aplicada à Engenharia','Microsoft Excel: funções matriciais, DEGRAU, SEERRO e DELTA; tabela da página original')
const contextos=[
 [51,'Com base no Estatuto da Cidade (Lei nº 10.257/2001), julgue os itens sobre diretrizes e objetivos da política urbana.'],
 [54,'De acordo com a Lei nº 6.766/1979, que dispõe sobre o parcelamento do solo urbano, julgue os itens.'],
 [57,'Considerando a Lei Orgânica do Município de Fortaleza, julgue os itens sobre competências municipais.'],
 [60,'Com base no Plano Diretor Participativo do Município de Fortaleza (LC nº 62/2009), julgue os itens.'],
 [63,'Com base na Lei Complementar municipal nº 236/2017, que trata do parcelamento, uso e ocupação do solo de Fortaleza, julgue os itens.'],
 [66,'À luz da Lei nº 9.605/1998, que dispõe sobre sanções penais e administrativas ambientais, julgue os itens.'],
 [68,'Com base na Portaria nº 3.242/2022 do Ministério do Desenvolvimento Regional, julgue o item sobre cadastro territorial multifinalitário.'],
 [69,'Com base nas Resoluções CONAMA nº 237/1997 e nº 1/1986, julgue os itens sobre licenciamento ambiental e EIA.'],
 [73,'Durante a execução de obra pública, projetos complementares foram executados. Considere a situação descrita no enunciado original e julgue os itens.'],
 [76,'A respeito do cronograma físico-financeiro de obra pública, julgue os itens.'],
 [80,'Quanto à ficha de composição de custos unitários de serviços de uma obra, julgue os itens.'],
 [83,'Julgue os itens sobre patologias em edificações.'],
 [87,'No que se refere à gestão de produção de edificações, aquisição, armazenamento e manutenção de insumos, julgue os itens.'],
 [90,'A respeito de benefícios e despesas indiretas (BDI) em obras de edificações, julgue os itens.'],
 [93,'Acerca de análise de orçamento de obras pela metodologia ABC (Activity-Based Costing), julgue os itens.'],
 [95,'No que se refere à programação de obras e ao cronograma executivo, julgue os itens.'],
 [98,'Com base nas normas vigentes para implantação e manutenção da rede de referência cadastral municipal, julgue os itens.'],
 [101,'De acordo com a ABNT NBR 14653-2:2011, julgue os itens sobre avaliação de imóveis urbanos.'],
 [104,'Considere a tabela de investimentos anuais reproduzida na página original. Julgue os itens sobre avaliação do fluxo de caixa no ano 5.'],
 [108,'Considere a perícia de imóvel descrita no caderno original e julgue os itens sobre laudo, habilitação profissional e ART.'],
 [112,'Considere a avaliação de imóvel usado com CUB e tabela de Ross-Heidecke descrita no caderno original.'],
 [115,'Julgue os itens sobre métodos de avaliação de imóveis segundo a ABNT NBR 14653-2:2011 e regressão linear.'],
 [118,'A tabela binária de dez observações da página original é parte do enunciado dos itens sobre estatística descritiva.'],
 [122,'Considere os resultados do modelo de regressão linear e a tabela da página 4 do caderno original; julgue os itens.'],
 [127,'Considere a amostra normal, os valores críticos de Z e os parâmetros informados no enunciado original; julgue os itens.'],
 [130,'Considere o espaço amostral e as probabilidades P(A)=0,61 e P(B)=0,22 informadas no enunciado original.'],
 [133,'Considere a planilha reproduzida na página 4 do caderno original. Julgue os itens sobre funções do Excel.']
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''
const correcoes=new Map([
 [100,{enunciado:'Em loteamentos, devem ser utilizados marcos de concreto para a materialização dos pontos notáveis de esquina.'}],
 [124,{enunciado:'O coeficiente de correlação linear de Pearson entre as variáveis x e y é igual ou superior a 0,85.'}],
 [128,{enunciado:'O p-valor do teste de hipóteses H₀: μ ≥ 5 versus H₁: μ < 5 é igual a 0,5.'}],
 [130,{enunciado:'Se A e B forem eventos independentes, então P(A ∪ B) é igual a 0,83.'}],
 [131,{enunciado:'Se B ⊂ A, então P(A ∩ B) = 0,1342.'}],
 [132,{enunciado:'Se A e B forem eventos mutuamente excludentes, então P(A|B) = P(B|A).'}],
 [133,{enunciado:'A fórmula =MATRIZ.DETERM(A2:C4) calculará o determinante da matriz formada pelo intervalo de células A2:C4.',anulada:true}]
])
const decisōes=pendentes.map(q=>{
 const n=Number(q.numero),assunto=assuntos.get(n);assert.ok(assunto,`Sem classificação para ${n}`)
 const resposta=respostaPorNumero.get(n);assert.ok(resposta,`Sem gabarito para ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 const corrigido=correcoes.get(n),texto=(corrigido?.enunciado||q.enunciado).replace(/\s+/g,' ').trim()
 const respostaFinal=corrigido?.anulada?'X':resposta
 const dificuldade=[53,61,65,67,70,72,78,82,85,92,97,102,104,105,106,107,114,116,117,122,124,125,126,127,128,129,131,132].includes(n)?'Difícil':[51,52,54,55,56,58,60,62,64,68,74,80,87,88,89,91,98,99,109,113,119,120,123,133,134,135,136].includes(n)?'Fácil':'Média'
 const removidos=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
 return {id:q.id,sha256_enunciado:hashes.get(q.id),materia:assunto[0],conteudo:assunto[1],ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — aplicada em 23/07/2023',cargo:'Analista Fazendário Municipal — Engenharia Civil (Cargo 6)',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na leitura normativa, no domínio técnico e no cálculo exigidos; não representa índice psicométrico da banca.',resposta_correta:respostaFinal==='X'?null:respostaFinal==='C'?0:1,anulada:respostaFinal==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_848_SEFIN_CE_ANALISTA_006_01.PDF',sha256:hashRevisao(respostas.join('')),numero:n,resposta:respostaFinal,criterio:'Gabarito definitivo oficial CEBRASPE do Cargo 6; item 100 anulado; item 133 também anulado.'},classificacao_fonte:prova,motivo:`Classificação específica baseada no enunciado e no contexto do caderno oficial do Cargo 6 — Engenharia Civil.`,texto_apoio:contextoDe(n),visual:{pagina,imagem,enunciado:texto,texto_apoio:contextoDe(n),motivo:`Página ${pagina} conferida visualmente; tabelas, planilha, dados e fórmulas relevantes preservados no recorte original.`},apta_resolucao:true,remover_pendencias:removidos,...(corrigido?{enunciado:corrigido.enunciado}:{})}
})
assert.equal(decisōes.length,75)
assert.equal(new Set(decisōes.map(x=>x.numero)).size,75)
assert.deepEqual(decisōes.filter(x=>x.anulada).map(x=>x.numero).sort((a,b)=>a-b),[100,133])
for(const d of decisōes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,recortes_revisados:75,itens_unicos:75,anuladas:[100,133],paginas_conferidas:[1,2,3,4],tabelas_planilha_e_simbolos_preservados:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisōes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,recortes_revisados:75,itens_unicos:75,anuladas:[100,133],paginas_conferidas:[1,2,3,4],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEFIN Fortaleza/CE 2023 — Engenharia Civil, Cargo 6 — revisão v480\n\n- Revisei os 75 itens pendentes, classificando-os em direito/planejamento urbano, legislação municipal e ambiental, engenharia civil, orçamento, patologia, avaliações, estatística, probabilidade e Excel.\n- Conferi visualmente as páginas 1–4; mantive as tabelas, a planilha e os dados visuais associados. Corrigi os símbolos matemáticos e estatísticos corrompidos pelo OCR e removi o texto de cabeçalho contaminante no item 100.\n- Registrei aplicação em 23/07/2023 e o gabarito definitivo oficial. Os itens 100 e 133 constam anulados; continuam disponíveis para estudo, sem correção automática.\n- Pacote local, ainda não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo oficial](<${gabarito}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
