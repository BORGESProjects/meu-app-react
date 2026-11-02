import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const documento='18cc964242be913f'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fnde-2023-especialista-atual.json','utf8'))
const origem='tmp/revisao-profissional/revisao-enem-2024-dia1-laranja-v119/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/FNDE_23_ESPECIALISTA/arquivos/978_FNDE_CF_001_01.PDF'
const chaveUrl='https://cdn.cebraspe.org.br/concursos/fnde_23_especialista/arquivos/GAB_DEFINITIVO_978_FNDE_CF_001_01.PDF'
const chaves=[
 ...`E E C C E C C E E C E C C C E C E E C C`.split(' '),
 ...`E C E C C X E E E C E C C C E C C E E C`.split(' '),
 ...`E E C E E C C C E E C E C C C C E E C C`.split(' '),
 ...`E C E C C C E C E C C C C C E E E C E E`.split(' '),
 ...`C C E E C C C C C E E C C C C E E C C E`.split(' '),
]
if(chaves.length!==100)throw Error('Gabarito FNDE incompleto')
const materias=[
 [[1,3],'Ciência Política','Estado, governo e sociedade — conceitos e relações'],
 [[4,11],'Políticas Públicas','Federalismo educacional, cidadania, ciclo de políticas públicas e instrumentos distributivos e regulatórios'],
 [[12,15],'Políticas Públicas Educacionais','BNCC, Plano Nacional de Educação (PNE), PPA e financiamento educacional'],
 [[16,20],'Administração Pública','FNDE, gestão institucional, rede de ensino e fontes de receita'],
 [[21,25],'Administração Financeira e Orçamentária','Orçamento público do FNDE, evolução histórica e financiamento da educação'],
 [[26,30],'Administração Pública','História, valores, missão, natureza institucional e programas do FNDE'],
 [[31,35],'Políticas Públicas Educacionais','Programa Nacional de Alimentação Escolar (PNAE), execução e controle social'],
 [[36,41],'Políticas Públicas Educacionais','Programa Dinheiro Direto na Escola (PDDE), transferências e prestação de contas'],
 [[42,47],'Políticas Públicas Educacionais','Programa Nacional do Livro e do Material Didático (PNLD), adesão e acessibilidade'],
 [[48,53],'Políticas Públicas Educacionais','Transporte escolar — PNATE e Programa Caminho da Escola'],
 [[54,56],'Políticas Públicas Educacionais','Plano de Ações Articuladas (PAR), dimensões e sistema SIMEC'],
 [[57,59],'Políticas Públicas Educacionais','PROINFÂNCIA — infraestrutura e transferência de recursos'],
 [[60,62],'Financiamento da Educação','Manutenção e desenvolvimento do ensino (MDE), fontes e responsabilidades financeiras'],
 [[63,65],'Direito Constitucional','Organização federativa da educação, regime de colaboração e direito à educação básica'],
 [[66,68],'Financiamento da Educação','FUNDEB — natureza, composição e destinação dos recursos'],
 [[69,70],'Financiamento da Educação','Salário-educação — natureza e aplicação dos recursos'],
 [[71,73],'Políticas Públicas Educacionais','Programas suplementares, bolsas e auxílios do FNDE'],
 [[74,75],'Financiamento Estudantil','Fundo de Financiamento Estudantil (FIES), gestão e público atendido'],
 [[76,80],'Administração Pública','Transferências, gestão de riscos, acompanhamento de despesas e prestação de contas'],
 [[81,83],'Controle Externo','Prestação de contas e tomada de contas especial (TCE) no FNDE e no TCU'],
 [[84,90],'Direito Administrativo','Tomada de contas especial — fases, quantificação do dano, julgamento e parcelamento'],
 [[91,96],'Administração Pública','Estrutura organizacional, planejamento estratégico, avaliação e inovação no FNDE'],
 [[97,100],'Integridade Pública','Programa de integridade, gestão de riscos e comissão de ética do FNDE'],
]
const contextos=[
 [[1,3],'Comando do caderno: julgue os itens sobre os conceitos de sociedade, Estado e governo.'],
 [[4,11],'Comando do caderno: julgue os itens relativos às políticas públicas sociais.'],
 [[12,15],'Comando do caderno: julgue os itens sobre o Plano Nacional de Educação (PNE) e as políticas educacionais.'],
 [[16,20],'Comando do caderno: julgue os itens sobre o FNDE e a rede de ensino brasileira.'],
 [[21,25],'Comando do caderno: julgue os itens sobre o orçamento e o planejamento do FNDE.'],
 [[26,30],'Comando do caderno: julgue os itens sobre o papel, a história, a missão e os valores do FNDE nas políticas educacionais.'],
 [[31,35],'Comando do caderno: julgue os itens sobre o Programa Nacional de Alimentação Escolar (PNAE).'],
 [[36,41],'Comando do caderno: julgue os itens sobre os recursos e as regras do Programa Dinheiro Direto na Escola (PDDE).'],
 [[42,47],'Comando do caderno: julgue os itens sobre o Programa Nacional do Livro e do Material Didático (PNLD).'],
 [[48,53],'Comando do caderno: julgue os itens sobre o PNATE e o Programa Caminho da Escola.'],
 [[54,56],'Comando do caderno: julgue os itens sobre o Plano de Ações Articuladas (PAR).'],
 [[57,59],'Comando do caderno: julgue os itens sobre o PROINFÂNCIA.'],
 [[60,62],'Comando do caderno: julgue os itens sobre o financiamento da educação básica pública no Brasil.'],
 [[63,65],'Comando do caderno: julgue os itens sobre organização da educação, atuação prioritária dos entes e regime de colaboração.'],
 [[66,68],'Comando do caderno: julgue os itens sobre o FUNDEB.'],
 [[69,70],'Comando do caderno: julgue os itens sobre o salário-educação.'],
 [[71,73],'Comando do caderno: julgue os itens sobre programas suplementares, bolsas e auxílios.'],
 [[74,75],'Comando do caderno: julgue os itens sobre o Fundo de Financiamento Estudantil (FIES).'],
 [[76,80],'Comando do caderno: julgue os itens sobre transferências, prestação de contas, gestão de riscos e acompanhamento da execução de despesas do FNDE.'],
 [[81,83],'Comando do caderno: julgue os itens sobre prestação de contas e tomada de contas especial, seus pressupostos, constituição, desenvolvimento e julgamento.'],
 [[84,85],'Comando do caderno: julgue os itens sobre as fases, a quantificação do dano e a responsabilização no processo de tomada de contas especial.'],
 [[86,90],'Comando do caderno: julgue os itens sobre julgamento de contas no TCU e parcelamento de débitos em processos de tomada de contas especial.'],
 [[91,93],'Comando do caderno: julgue os itens sobre estrutura organizacional, histórico do planejamento e desafios de gestão estratégica do FNDE.'],
 [[94,96],'Comando do caderno: julgue os itens sobre planejamento, monitoramento, avaliação e aprendizado estratégico do FNDE.'],
 [[97,100],'Comando do caderno: julgue os itens sobre preservação da integridade no âmbito do FNDE.'],
]
const invalidos=new Map([['extr-9328c9b42f7481a20f11',{duplicada_de:'extr-35814eafbf449e8f9c72'}]])
function faixa(n,lista){return lista.find(([[a,b]])=>n>=a&&n<=b)?.slice(1)}
for(const q of pendentes){if(!faixa(Number(q.numero_original),materias)||!faixa(Number(q.numero_original),contextos))throw Error(`Sem classificação/contexto: ${q.numero_original}`)}
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero_original),dup=invalidos.get(q.id)
 if(dup)return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Políticas Públicas',conteudo:'Duplicata OCR do item 11 — não é registro adicional',ano:2024,numero_original:11,pagina:q.pagina,apta_resolucao:false,inelegibilidade_motivo:'Cópia do mesmo enunciado do item 11, reconhecida pela comparação visual da página 1; manter apenas o registro íntegro.',duplicada_de:dup.duplicada_de,motivo:'O caderno oficial contém o item 11 uma única vez; a segunda extração difere apenas por espaços de OCR.'}
 const [materia,conteudo]=faixa(n,materias),apoio=faixa(n,contextos)[0]
 let enunciado=q.enunciado.trim()
 if(n===11)enunciado=enunciado.replace(/\nNo que se refere ao Plano Nacional de Educação[\s\S]*$/i,'').trim()
 if(n===29)enunciado='O FNDE é uma autarquia relativamente nova, tendo sido criada após o advento da Constituição Federal de 1988.'
 if(n===59)enunciado=enunciado.replace(/\nCEBRASPE\s*[–-]\s*FNDE[\s\S]*$/i,'').trim()
 if(n===73)enunciado=enunciado.replace(/\nNo que se refere ao Fundo de Financiamento Estudantil[\s\S]*$/i,'').trim()
 const valor=chaves[n-1],anulada=valor==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para item objetivo do CEBRASPE; não é índice psicométrico publicado pela banca.',texto_apoio:apoio,...(enunciado!==q.enunciado.trim()?{enunciado}:{}),resposta_correta:anulada?null:valor==='C'?0:1,anulada,gabarito_oficial:{valor,fonte:chaveUrl,metodo:'Conferido no gabarito oficial definitivo CEBRASPE para a prova 978_FNDE_CF_001_01; X indica item anulado.'},classificacao_fonte:prova,visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,motivo:`Página ${q.pagina} do caderno oficial do curso de formação do FNDE, conferida visualmente; texto de comando/seção vinculado ao item ${n}.`},motivo:`FNDE — Especialista em Financiamento e Execução de Programas e Projetos Educacionais, prova objetiva do curso de formação, CEBRASPE. Classificação segundo o tema da seção e o conteúdo do item. A prova foi aplicada em 28/04/2024.`}
})
const nome='revisao-fnde-formacao-2024-v120'
const rel=await aplicarRevisoesIndividuais({nome,base:origem,decisoes})
const raiz=`tmp/revisao-profissional/${nome}/acervo-extraido`
if(!raizesAtuais.includes(raiz))raizesAtuais.unshift(raiz)
const arq='scripts/acervo-publico/acervo-atual.mjs';let atual=await fs.readFile(arq,'utf8');if(!atual.includes(`raizesAtuais.unshift('${raiz}')`))atual=atual.replace('export async function lerArquivoAtual',`raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`);await fs.writeFile(arq,atual)
const reportPath='docs/acervo/revisao-profissional/RELATORIO.md';let report=await fs.readFile(reportPath,'utf8')
if(!report.includes('## Revisão do caderno v120 — FNDE'))report+=`\n\n## Revisão do caderno v120 — FNDE, curso de formação de Especialista, 2024\n\n- Revisei ${rel.classificadas} registros pendentes: ${decisoes.filter(x=>x.apta_resolucao!==false).length} questões classificadas individualmente e ${decisoes.filter(x=>x.apta_resolucao===false).length} duplicata OCR retirada da resolução. O item 26 foi identificado como anulado no gabarito definitivo e ficou sem resposta automática.\n- Corrigi filtros anteriormente distribuídos entre Física, Economia, Direito Constitucional, Serviço Social, Educação e Administração para matérias e conteúdos específicos: Ciência Política, Políticas Públicas, Educação, Administração Pública, Administração Financeira e Orçamentária, Financiamento da Educação e Estudantil, Direito Constitucional e Administrativo, Controle Externo e Integridade Pública. Registrei 2024 como ano de aplicação, conforme o próprio gabarito oficial.\n- Conferi visualmente as quatro páginas do caderno. Relacionei os comandos de cada bloco aos respectivos itens e corrigi o espaçamento por OCR no item 29 e a concatenação de seções seguintes nos itens 11, 59 e 73. A dificuldade média é estimada editorialmente, não dado oficial do CEBRASPE.\n- Validação local: total ${rel.total}, disponíveis ${rel.disponiveis}, pendências elegíveis ${rel.pendentes}; ${rel.lotes_alterados} lotes alterados e facetas recalculadas.\n- Fontes primárias: [caderno oficial CEBRASPE/FNDE](https://cdn.cebraspe.org.br/concursos/FNDE_23_ESPECIALISTA/arquivos/978_FNDE_CF_001_01.PDF) e [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/fnde_23_especialista/arquivos/GAB_DEFINITIVO_978_FNDE_CF_001_01.PDF).\n- Estado: v120 integrado localmente; não publicado no Cloudflare. A revisão integral do corpus continua.\n`
await fs.writeFile(reportPath,report)
console.log(JSON.stringify(rel))
