import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='4867d97e0ac414cd'
const prova='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/888_TBG_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_001_01.PDF'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-dataprev-comunicacao-social-2023-v158'))
if(start<0)throw new Error('Base v158 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start)
const manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
if(active.size!==71)throw new Error(`Esperava 71 registros do caderno; encontrei ${active.size}`)
const duplicate='extr-0c92ec4c4aba9a0c35b9'
const keyRows=[
 ['C','E','C','C','E','E','C','E','C','C','C','E','E','C','C','C','E','C','E','E'],
 ['E','E','C','E','E','C','E','C','C','C','E','C','C','E','C','C','C','E','E','E'],
 ['C','E','C','C','E','C','C','C','E','E','C','C','E','E','C','E','C','C','C','E'],
 ['E','C','C','E','E','C','E','C','E','E']
]
const key=new Map();let n=31;for(const row of keyRows)for(const a of row)key.set(n++,a)
if(n!==101||key.size!==70)throw new Error('Tabela oficial deveria conter 70 respostas dos itens 31 a 100')
const ranges=[
 [[31,35],'Direito Administrativo','Lei Anticorrupção — responsabilização, atos lesivos, processo administrativo e acordo de leniência','À luz da Lei nº 12.846/2013 (Lei Anticorrupção), julgue os itens.'],
 [[36,40],'Compliance e Integridade','Programa de integridade — lavagem de dinheiro, riscos socioambientais, cultura ética e compliance trabalhista','A respeito da prevenção e da gestão de riscos de compliance, julgue os itens.'],
 [[41,45],'Contabilidade Geral','Demonstrações contábeis — balanço patrimonial, DLPA, demonstração do resultado e DOAR','Julgue os itens sobre conceito, objetivo, periodicidade e elaboração das demonstrações contábeis previstas na legislação societária.'],
 [[46,50],'Análise das Demonstrações Contábeis','Análise econômico-financeira — indicadores, endividamento, análise horizontal e vertical, liquidez e imobilização','Em relação à análise econômico-financeira das entidades contábeis, julgue os itens.'],
 [[51,60],'Auditoria Interna','Planejamento, procedimentos, risco, materialidade, testes substantivos, fraude, amostragem e relatório','A respeito do conceito, objetivo, periodicidade, planejamento e execução de trabalhos de auditoria interna, julgue os itens.'],
 [[61,66],'Gestão de Riscos e Controles Internos','COSO — ambiente e atividades de controle, resposta a riscos, controles preventivos e detectivos','Relativamente às características gerais do padrão COSO e aos tipos de controles de riscos, julgue os itens.'],
 [[67,70],'Compliance e Integridade','Prevenção a fraudes — segregação de funções, indicadores de fraude e conflito de interesses em compras','Com relação aos indicadores de fraude e à segregação de funções, julgue os itens.'],
 [[71,75],'Compliance e Integridade','Programa de integridade — patrocínio da alta administração, conflito de interesses, due diligence, canal de denúncia e background check','No que diz respeito aos programas de integridade organizacionais, julgue os itens.'],
 [[76,85],'Contabilidade Societária','Auditoria e demonstrações financeiras — ativo imobilizado, SOX, DFC, instrumentos financeiros, estatais, equivalência patrimonial, consolidação e estoques','Julgue os itens sobre auditoria de balanços, empresas públicas e governança corporativa, conforme a legislação societária brasileira.'],
 [[86,88],'Direito Digital e Proteção de Dados','Lei Geral de Proteção de Dados — conceito e classificação de dados pessoais e direitos do titular','Julgue os itens relativos às disposições da Lei Geral de Proteção de Dados (LGPD).'],
 [[89,93],'Direito Tributário','Tributos — royalties de petróleo, PIS/COFINS, CIDE-combustíveis, ICMS na importação e ISS','Considerando o regime fiscal brasileiro, julgue os itens.'],
 [[94,97],'Auditoria Governamental','Auditoria interna no Poder Executivo Federal — PAINT, prestação de contas, supervisão técnica e relatório anual','Considerando as normas de elaboração e acompanhamento do plano anual de atividades das auditorias internas emitido pela CGU, julgue os itens.'],
 [[98,100],'Direito Administrativo','Empresas estatais — remuneração de conselheiros, conglomerado estatal e transformação societária','No que concerne à atuação do Estado como empreendedor, conforme o Decreto nº 8.945/2016, julgue os itens.']
]
const resolve=i=>ranges.find(([[a,b]])=>i>=a&&i<=b)
const page=i=>i<=57?1:i<=80?2:3
const clean=(s='')=>s.replace(/\u000c/g,' ').replace(/88800101658749\s*CEB(?:RASPE)?/giu,' ').replace(/\s+(?:Julgue os itens|Em relação|A respeito|No que diz respeito|Relativamente|Considerando|Com relação|No que concerne)[\s\S]*$/u,'').replace(/\s+/g,' ').trim()
const corrections=new Map([
 [35,'O processo administrativo para apuração da responsabilidade de pessoa jurídica por ato lesivo à administração pública deve ser conduzido por comissão composta por pelo menos três servidores estáveis.'],
 [45,'A demonstração das origens e aplicações de recursos, extinta pela Lei nº 11.638/2007, visava demonstrar as modificações na posição financeira da companhia.'],
 [57,'Os testes substantivos têm como principal objetivo verificar a adequação dos controles internos estabelecidos pela administração da entidade.'],
 [63,'A gestão eficaz de riscos implica equilíbrio entre exposições a riscos, ganhos e custos.'],
 [66,'A proteção física dos bens de uma entidade permite a detecção dos riscos sofridos por esses bens.'],
 [68,'Para mitigar o risco de fraudes, o gerente que autoriza as vendas a crédito deve controlar os recebimentos efetivamente realizados.'],
 [69,'Considere-se que um funcionário de uma grande empresa, com mais de vinte anos de serviço, tenha saído em férias, durante as quais percorreu boa parte da Europa, presenteando todos os colegas de trabalho. Ao retornar, mudou-se para um bairro luxuoso. Nessa situação, esses fatos podem constituir indícios de ocorrência de fraude.'],
 [70,'Considere-se que um servidor público responsável por um processo de compra pública seja irmão do fornecedor vencedor da licitação. Nessa situação, evidencia-se uma fraude no processo.'],
 [72,'Diferentemente do abuso de posição ou de poder em favor de interesses privados, o conflito de interesses não chega a constituir transgressão à integridade organizacional.'],
 [75,'O background check encerra-se nas pesquisas de distribuição de ações judiciais, na consulta de processos administrativos e na verificação da situação cadastral do quadro societário da organização com a qual ela almeja desenvolver relações negociais.'],
 [79,'Deve ser considerada irregularidade a existência, no balanço patrimonial, de instrumento financeiro com avaliação obtida a partir de cálculos matemáticos ou estatísticos para definição do seu valor justo.'],
 [80,'O estatuto jurídico das empresas públicas, sociedades de economia mista e suas subsidiárias, definido em lei federal, aplica-se apenas às empresas públicas federais, excluídas as estaduais, municipais e do Distrito Federal.'],
 [85,'O procedimento contábil de redução do custo dos estoques ao seu valor realizável líquido é um indicativo de que o investimento efetuado nos referidos ativos pode não ser mais recuperável.'],
 [88,'O tríplice apoio para proteção de dados inclui o direito fundamental de liberdade, o direito de privacidade e o livre desenvolvimento da pessoa natural.'],
 [93,'O contribuinte do ISS recolhe, no máximo, 5% sobre o preço do serviço.']
])
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),info=resolve(i)
 if(!info)throw new Error(`Número ausente/inválido em ${q.id}`)
 const [[a,b],materia,conteudo,contexto]=info,ans=key.get(i),p=page(i),stem=corrections.get(i)||clean(q.enunciado)
 if(!ans||!stem||stem.length<25)throw new Error(`Item ${i} sem gabarito ou enunciado íntegro`)
 const dup=q.id===duplicate
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,concurso:'TBG — Analista Júnior, Ênfase Auditoria e Compliance (Cargo 1); aplicação em 15/10/2023',numero_original:i,pagina:p,dificuldade:[31,35,38,40,47,50,53,55,56,58,60,63,69,70,73,75,77,79,80,83,85,87,89,91,95,97].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica; o CEBRASPE não publicou níveis de dificuldade.',resposta_correta:ans==='C'?0:1,anulada:false,gabarito_oficial:{valor:ans,fonte:gabarito,numero:i,resposta:ans,metodo:'Gabarito definitivo oficial do Cargo 1, aplicação em 15/10/2023.'},classificacao_fonte:prova,motivo:`Classificação conferida pelo enunciado, pelo cabeçalho do bloco e pela página ${p} do caderno oficial.`,visual:{pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Página ${p} do caderno oficial; texto de instrução do bloco associado ao item ${i}.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:'extr-bfd3cb118a327741b16a',inelegibilidade_motivo:'Duplicata OCR do item 35; a versão canônica permanece no acervo com o enunciado corrigido.'}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.length!==71||new Set(decisions.map(x=>x.numero_original)).size!==70||decisions.filter(x=>x.duplicada_de).length!==1)throw new Error('Cobertura/duplicatas fora do esperado')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:70,duplicatas:1,itens:[31,100],paginas:[1,2,3],classificacoes:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-tbg-auditoria-compliance-2023-v159',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_revistos:71,itens_unicos:70,duplicatas_inelegiveis:1,anuladas:[],paginas_originais:3,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
