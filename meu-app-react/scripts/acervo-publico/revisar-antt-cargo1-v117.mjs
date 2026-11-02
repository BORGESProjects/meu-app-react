import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const documento='29d464e08674848f'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-${documento}.json`,'utf8'))
const origem='tmp/revisao-profissional/revisao-mpsc-promotor-2023-p1-v115/acervo-extraido'
const materias=[
 [[1,26],'Informática'],[[27,30],'Legislação'],[[31,60],'Contabilidade Geral'],[[61,76],'Governança Corporativa'],[[77,97],'Administração'],[[98,101],'Administração Pública'],[[102,104],'Administração Financeira e Orçamentária'],[[105,120],'Direito Ambiental'],
]
const topicos=[
 [[1,5],'Aprendizado de máquina — aprendizado supervisionado e não supervisionado'],[[6,8],'Redes neurais artificiais, backpropagation, SGD e CNN'],[[9,9],'Processamento de linguagem natural (PLN)'],[[10,11],'ETL, qualidade e armazenamento de dados'],[[12,15],'Inteligência artificial, sistemas de recomendação e algoritmos'],[[16,18],'Processamento de linguagem natural — etapas, análise e aplicações'],[[19,21],'Visão computacional e redes neurais convolucionais'],[[22,23],'Mineração de dados e deep learning'],[[24,26],'SAS — arquitetura e análise de dados'],[[27,28],'Lei Geral de Proteção de Dados — dados sensíveis e transferência internacional'],[[29,30],'Lei de Acesso à Informação — transparência e qualidade da informação'],
 [[31,33],'Contabilidade — objetivos, conceitos e informação contábil'],[[34,36],'Patrimônio, ativo, passivo e patrimônio líquido'],[[37,42],'Fatos contábeis, lançamentos e natureza das contas'],[[43,45],'Plano de contas e escrituração'],[[46,49],'Livro-razão, estorno, lançamentos e depreciação'],[[50,50],'Contabilização da folha de pagamento'],[[51,51],'Adiantamentos a fornecedores e contabilização'],[[52,54],'Balancete de verificação'],[[55,57],'Balanço patrimonial e levantamento contábil'],[[58,60],'Demonstração do resultado do exercício (DRE)'],
 [[61,65],'Governança corporativa — conceitos e evolução histórica'],[[66,71],'Teorias da governança — custos de transação, agência, stakeholders e dependência de recursos'],[[72,76],'Órgãos e abordagem comportamental da governança corporativa'],
 [[77,82],'Gestão de riscos, controles internos e compliance'],[[83,88],'Planejamento organizacional, estratégia competitiva e estrutura'],[[89,93],'Gestão de projetos — métodos ágeis, execução e encerramento'],[[94,97],'Gestão da qualidade, processos e ciclo PDCA'],
 [[98,101],'Evolução da administração pública e avaliação de políticas públicas'],[[102,104],'Lei de Responsabilidade Fiscal — despesa pública e renúncia de receita'],[[105,107],'Constituição Federal — tutela constitucional do meio ambiente'],[[108,111],'Política Nacional sobre Mudança do Clima (PNMC)'],[[112,114],'Política Nacional do Meio Ambiente — instrumentos e responsabilidade civil ambiental'],[[115,117],'Sistema Nacional de Unidades de Conservação e recuperação ambiental'],[[118,120],'Código Florestal — APP, reserva legal e proteção de áreas úmidas'],
]
const contextos=[
 [[1,5],'Comando: julgue os itens sobre aprendizado supervisionado e não supervisionado. O item 5 contém diagrama de regras de associação: 1) {A,B} → {C}; 2) {D} → {E}; 3) {D} → {A}; 4) {F} → {G}; 5) {F} → {H}.'],
 [[6,8],'Comando: julgue os itens sobre redes neurais artificiais, redes neurais convolucionais, backpropagation, descida do gradiente estocástico e deep learning.'],
 [[9,9],'Item sobre processamento de linguagem natural; enunciado autossuficiente.'],
 [[10,11],'Comando: considere ETL (extrair, transformar e carregar), manipulação, tratamento, visualização e armazenamento de dados.'],
 [[12,15],'Comando: julgue os itens sobre inteligência artificial e sistemas de recomendação, incluindo algoritmos de conteúdo, classificação, regras de associação e regressão.'],
 [[16,18],'Comando: julgue os itens sobre processamento de linguagem natural (PLN), suas etapas e níveis de análise.'],
 [[19,21],'Comando: julgue os itens sobre visão computacional e processamento de imagens.'],
 [[22,23],'Comando: julgue os itens sobre mineração de dados e deep learning.'],
 [[24,26],'Comando: julgue os itens sobre o software SAS, sua arquitetura, análise exploratória, aprendizado de máquina e gestão de dados.'],
 [[27,30],'Base legal: Lei nº 12.527/2011 (Lei de Acesso à Informação) e Lei nº 13.709/2018 (LGPD). Julgue os itens segundo essas normas.'],
 [[31,33],'Comando: julgue os itens sobre objetivos e finalidades da contabilidade.'],
 [[34,36],'Comando: julgue os itens sobre patrimônio contábil, ativo, passivo e patrimônio líquido.'],
 [[37,42],'Comando: julgue os efeitos dos fatos contábeis, lançamentos, contas devedoras e credoras.'],
 [[43,45],'Comando: julgue os itens sobre componentes e funcionamento do plano de contas.'],
 [[46,49],'Comando: julgue os itens sobre escrituração contábil, livro-razão, estorno, operações financeiras e depreciação.'],
 [[50,50],'Dados de folha de pagamento: salários brutos R$ 15.500; INSS descontado dos funcionários R$ 1.240; FGTS R$ 1.240; salário-família R$ 145; INSS patronal R$ 4.500. Considere estes os únicos dados para a contabilização proposta.'],
 [[51,51],'Situação: empresa transfere R$ 50.000 a fornecedor como adiantamento para acelerar a produção.'],
 [[52,54],'Comando: julgue conceitos, finalidade e elaboração do balancete de verificação.'],
 [[55,57],'Comando: julgue os itens sobre composição e elaboração do balanço patrimonial.'],
 [[58,60],'Comando: julgue os itens sobre estrutura, finalidade e conteúdo da demonstração do resultado do exercício (DRE).'],
 [[61,65],'Comando: julgue os itens sobre história, conceitos e definição de governança corporativa.'],
 [[66,71],'Comando: julgue os itens sobre teorias da governança corporativa: custos de transação, agência, stakeholders, custódia, teoria da firma e dependência de recursos.'],
 [[72,76],'Comando: considere os órgãos e a abordagem comportamental da governança corporativa.'],
 [[77,82],'Comando: julgue os itens sobre gestão de riscos, controle interno e compliance.'],
 [[83,88],'Comando: julgue os itens sobre planejamento nas organizações, estratégia e estruturas organizacionais.'],
 [[89,93],'Comando: julgue os itens sobre gestão de projetos, métodos ágeis e tradicionais, execução e encerramento.'],
 [[94,97],'Comando: julgue os itens sobre gestão da qualidade, processos e ciclo PDCA.'],
 [[98,101],'Comando: considere a evolução da administração pública no Brasil, os modelos de gestão e avaliação de políticas públicas.'],
 [[102,104],'Base legal: Lei Complementar nº 101/2000 (Lei de Responsabilidade Fiscal). Julgue os itens sobre criação de despesas, pessoal e compensação de renúncias.'],
 [[105,107],'Base legal: Constituição Federal de 1988. Julgue os itens sobre proteção constitucional do meio ambiente e participação da coletividade.'],
 [[108,111],'Base legal: Lei nº 12.187/2009, Política Nacional sobre Mudança do Clima (PNMC).'],
 [[112,114],'Base legal: Lei nº 6.938/1981, Política Nacional do Meio Ambiente (PNMA).'],
 [[115,117],'Base legal: Lei nº 9.985/2000, que institui o Sistema Nacional de Unidades de Conservação da Natureza.'],
 [[118,120],'Base legal: Lei nº 12.651/2012 (Código Florestal). Itens sobre reserva legal, áreas de preservação permanente e proteção de corpos d’água.'],
]
const limpar={
 18:/\nCEBRASPE\s*[–-]\s*ANTT[\s\S]*$/i,21:/\nNo que se refere a deep learning[\s\S]*$/i,26:/\nCom base no previsto na Lei n\.º 12\.527\/2011[\s\S]*$/i,
 57:/\nCEBRASPE\s*[–-]\s*ANTT[\s\S]*$/i,60:/\nAcerca do histórico e de conceitos da governança[\s\S]*$/i,76:/\nAcerca de controle, riscos e compliance[\s\S]*$/i,
 82:/\nCEBRASPE\s*[–-]\s*ANTT[\s\S]*$/i,97:/\nNo que tange a aspectos da evolução da administração pública[\s\S]*$/i,101:/\nCom base na Lei Complementar n\.º 101\/2000[\s\S]*$/i,
 107:/\nEspaço livre[\s\S]*$/i,111:/\nNo que se refere à Política Nacional do Meio Ambiente[\s\S]*$/i,114:/\nConsiderando o disposto na Lei n\.º 9\.985\/2000[\s\S]*$/i,
 117:/\nCom base na Lei n\.º 12\.651\/2012[\s\S]*$/i,120:/\nEspaço livre\s*$/i,
}
const ids=new Set();for(const q of pendentes){if(ids.has(q.id))throw Error(`ID repetido ${q.id}`);ids.add(q.id);if(!faixa(Number(q.numero_original),materias)||!faixa(Number(q.numero_original),topicos)||!faixa(Number(q.numero_original),contextos))throw Error(`Sem tema/contexto ${q.numero_original}`)}
function faixa(n,lista){return lista.find(([[a,b]])=>n>=a&&n<=b)?.[1]}
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero_original);let enunciado=q.enunciado.trim();if(limpar[n])enunciado=enunciado.replace(limpar[n],'').trim()
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:faixa(n,materias),conteudo:faixa(n,topicos),ano:2024,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova objetiva de Especialista em Regulação; a banca não publica nível de dificuldade individual.',texto_apoio:faixa(n,contextos),...(enunciado!==q.enunciado.trim()?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,motivo:`Página ${q.pagina} do caderno oficial ANTT/CEBRASPE, cargo 1; questão ${n} conferida visualmente, incluindo diagrama e quadros quando existentes.`},motivo:`Caderno objetivo oficial ANTT, Cargo 1 — Especialista em Regulação de Serviços de Transportes Terrestres, CEBRASPE. A matéria e o conteúdo foram atribuídos pelo enunciado e pela seção correspondente do caderno.`}
})
const nome='revisao-antt-cargo1-2024-v117'
const rel=await aplicarRevisoesIndividuais({nome,base:origem,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const arq='scripts/acervo-publico/acervo-atual.mjs';await fs.writeFile(arq,(await fs.readFile(arq,'utf8')).replace('export async function lerArquivoAtual',`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\nexport async function lerArquivoAtual`))
const reportPath='docs/acervo/revisao-profissional/RELATORIO.md';let text=await fs.readFile(reportPath,'utf8')
text+=`\n\n## Revisão do caderno v117 — ANTT, Cargo 1, prova objetiva de 2024\n\n- Classifiquei individualmente ${rel.classificadas} itens ainda pendentes: Ciência de Dados/Informática, LGPD e LAI, Contabilidade Geral, Governança Corporativa, Administração, Administração Pública, Administração Financeira e Orçamentária e Direito Ambiental. Corrigi matérias deslocadas como Serviço Social, Medicina, Estatística e Direito Empresarial quando não correspondiam ao conteúdo do caderno.\n- Conferi visualmente as seis páginas do caderno oficial; relacionei as imagens às questões, transcrevi o diagrama de regras de associação do item 5 e o quadro de folha de pagamento do item 50 para o contexto de resolução. Separei comandos/cabeçalhos de seções seguintes que o OCR havia anexado aos itens 18, 21, 26, 57, 60, 76, 82, 97, 101, 107, 111, 114, 117 e 120. Gabaritos já associados foram preservados.\n- O cabeçalho da prova informa edital 2023; a aplicação foi em 14/04/2024, conforme cronograma oficial, então registrei 2024 como ano da aplicação. Dificuldade média estimada editorialmente. Validação: ${rel.classificadas} itens classificados; total ${rel.total}, disponíveis ${rel.disponiveis}, pendências elegíveis ${rel.pendentes}; ${rel.lotes_alterados} lotes atualizados e facetas recalculadas.\n- Fontes primárias: [caderno oficial CEBRASPE/ANTT — Cargo 1](https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/951_ANTT_001_01.PDF), [edital oficial com conteúdo programático](https://cdn.cebraspe.org.br/concursos/antt_23/arquivos/ED_1_2023_ANTT_ABERTURA_ATUALIZADO_RET_4.PDF) e [edital oficial com data das provas](https://anttlegis.antt.gov.br/action/TematicaAction.php?acao=abrirVinculos&cod_menu=8619&cod_modulo=161&cotematica=18917000).\n- Estado: v117 integrado localmente; não publicado no Cloudflare. Revisão integral do corpus continua.\n`
await fs.writeFile(reportPath,text);console.log(JSON.stringify(rel))
