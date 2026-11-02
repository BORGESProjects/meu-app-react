import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const origem = raizesAtuais.find(r => r.includes('revisao-arsal-direito-2026-v143'))
if (!origem) throw new Error('Base v143 não encontrada')
const documento = 'e11d47b6db984ea1'
const questoes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
if (questoes.length !== 55 || questoes.some(q => q.concurso !== 'INFRA S/A 26 ANALISTA' || q.banca !== 'CEBRASPE')) throw new Error('Exportação INFRA S.A. inesperada ou desatualizada')

const prova = 'https://cdn.cebraspe.org.br/concursos/infrasa_26_analista/arquivos/1C1668CD3507A43FF9F244281621EEB862E40BE78DB828914CF3C9E32F9FA996.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/INFRASA_26_ANALISTA/arquivos/686BA145A69230A753F7C4C7A79B8A08440F887DFB1796D9FA9C7C14FD952627.pdf'
const pag = n => n <= 57 ? 1 : n <= 72 ? 2 : n <= 97 ? 3 : 4
for (let n = 1; n <= 4; n++) await fs.access(`public/acervo-extraido/paginas/${documento}-${String(n).padStart(4, '0')}.webp`)

const grupos = [
  [41, 41, 'Administração Pública', 'Reforma do Estado: Plano Diretor da Reforma do Aparelho do Estado e publicização'],
  [42, 42, 'Administração', 'Teoria contingencial: relação entre organização e ambiente'],
  [43, 43, 'Administração', 'Abordagem clássica: administração científica de Taylor e teoria clássica de Fayol'],
  [44, 44, 'Administração Pública', 'Reforma administrativa: descentralização funcional no Decreto-Lei nº 200/1967'],
  [45, 45, 'Direito Administrativo', 'Lei de Acesso à Informação: classificação e prazos de sigilo'],
  [46, 46, 'Administração Pública', 'Governança pública: redes de cooperação e prestação de serviços'],
  [47, 47, 'Administração', 'Planejamento: níveis organizacionais e horizonte do planejamento tático'],
  [48, 48, 'Administração', 'Direção: liderança, comunicação e motivação'],
  [49, 49, 'Administração', 'Ferramentas de gestão: matriz GUT e critérios de priorização'],
  [50, 50, 'Administração', 'Comportamento organizacional: grupos e organização informal'],
  [51, 51, 'Administração', 'Organização: departamentalização funcional e contingências ambientais'],
  [52, 52, 'Administração', 'Organização: delegação, autoridade e processo decisório'],
  [53, 53, 'Gestão de Pessoas', 'Motivação: teoria dos dois fatores de Herzberg'],
  [54, 54, 'Administração', 'Controle estratégico: contabilidade de custos e instrumentos de controle'],
  [55, 55, 'Administração', 'Processo administrativo: controle, mensuração e avaliação de resultados'],
  [56, 56, 'Gestão de Pessoas', 'Gestão por competências: competências requeridas e lacunas'],
  [57, 57, 'Gestão de Pessoas', 'Seleção de pessoas: testes psicológicos'],
  [58, 58, 'Gestão de Projetos', 'Métodos ágeis: Scrum e retrospectiva de sprint'],
  [59, 59, 'Gestão de Projetos', 'Avaliação de projetos: análise de custo-benefício'],
  [60, 60, 'Gestão de Projetos', 'Planejamento de projetos: escopo, objetivos e partes interessadas'],
  [61, 61, 'Logística', 'Atividades logísticas: manutenção de estoques como atividade de apoio'],
  [62, 62, 'Logística', 'Atividades primárias: transporte e processamento de pedidos'],
  [63, 63, 'Logística', 'Resposta eficiente ao consumidor (ECR): estratégia push'],
  [64, 66, 'Administração de Materiais', 'Gestão de estoques: classificação XYZ, normalização e categorias de materiais'],
  [67, 68, 'Administração de Materiais', 'Planejamento de estoques: VMI e estoque em trânsito'],
  [69, 69, 'Administração Pública', 'Compras públicas: centralização e descentralização de aquisições'],
  [70, 70, 'Administração Pública', 'Compras públicas sustentáveis e poder de compra do Estado'],
  [71, 71, 'Direito Administrativo', 'Estatais: modos de disputa em licitação — Lei nº 13.303/2016'],
  [72, 72, 'Direito Administrativo', 'Estatais: certificação de qualidade na aquisição de bens'],
  [73, 73, 'Administração de Materiais', 'Almoxarifado: leiaute flexível'],
  [74, 74, 'Administração Pública', 'Patrimônio público: alienação de bens de empresas estatais'],
  [75, 75, 'Administração de Materiais', 'Patrimônio: identificação, registro e inventário de bens'],
  [76, 76, 'Direito Administrativo', 'Lei nº 13.303/2016: vantagem competitiva e contratos'],
  [77, 77, 'Direito Administrativo', 'Lei nº 13.303/2016: orçamento sigiloso e valor estimado'],
  [78, 78, 'Direito Administrativo', 'Lei nº 13.303/2016: responsabilização por sobrepreço em contratação direta'],
  [79, 79, 'Direito Administrativo', 'Lei nº 13.303/2016: recusa do vencedor em assinar contrato'],
  [80, 80, 'Direito Administrativo', 'Lei nº 13.303/2016: princípios aplicáveis aos contratos das estatais'],
  [81, 81, 'Direito Administrativo', 'Lei nº 13.303/2016: duração dos contratos de estatais'],
  [82, 82, 'Direito Administrativo', 'Controle interno e externo de empresas estatais'],
  [83, 83, 'Direito Administrativo', 'Lei nº 13.303/2016: sanções por inexecução contratual'],
  [84, 86, 'Direito Administrativo', 'Regulamento interno da INFRA S.A.: PCA, matriz de riscos e participação estrangeira'],
  [87, 87, 'Direito Administrativo', 'Pesquisa de preços: mapa comparativo em contratações da INFRA S.A.'],
  [88, 88, 'Direito Administrativo', 'Contratos administrativos: garantia de execução'],
  [89, 89, 'Direito Administrativo', 'Gestão contratual: prorrogação, alteração, repactuação e reajuste'],
  [90, 90, 'Direito Administrativo', 'Fiscalização de contratos: glosas e devido processo'],
  [91, 91, 'Arquivologia', 'Documentos digitais: requisitos do SIGAD e autenticidade'],
  [92, 92, 'Arquivologia', 'Classificação de documentos e plano de classificação'],
  [93, 93, 'Arquivologia', 'Função arquivística: prova e informação'],
  [94, 94, 'Arquivologia', 'Avaliação documental e tabela de temporalidade'],
  [95, 95, 'Arquivologia', 'Princípios arquivísticos: ordem original'],
  [96, 96, 'Arquivologia', 'Política nacional de arquivos: Lei nº 8.159/1991'],
  [97, 97, 'Arquivologia', 'Gestão de documentos: fase de produção e avaliação'],
  [98, 98, 'Direito Administrativo', 'Lei de Acesso à Informação: graus de sigilo'],
  [99, 99, 'Direito Digital', 'LGPD: fundamentos e princípios de proteção de dados pessoais'],
  [100, 100, 'Direito Administrativo', 'Lei de Acesso à Informação: órgãos sujeitos à lei'],
]
const comandos = new Map([
  [41, 'Acerca das principais abordagens teóricas da administração e da evolução da administração pública no Brasil, julgue os itens a seguir.'],
  [45, 'Como empresa pública federal vinculada ao Ministério dos Transportes, a INFRA S.A. é regida pelo arcabouço normativo e institucional da administração pública. A partir dessa premissa, julgue os itens seguintes.'],
  [47, 'Acerca do processo de planejamento e das funções da administração nesse processo, julgue os itens que se seguem.'],
  [49, 'Julgue o item a seguir, relativo à ferramenta de análise e priorização matriz GUT.'],
  [50, 'Empresas aeroportuárias geralmente adotam departamentalização mista, que combina áreas funcionais, como engenharia, recursos humanos e finanças, com organização baseada em processos críticos, como operações, segurança e experiência do passageiro. A partir dessa contextualização, julgue os itens sobre departamentalização e organização informal.'],
  [52, 'Em uma organização como a INFRA S.A., é importante manter os colaboradores motivados e exercer uma liderança positiva. Além disso, dadas as condições de funcionamento e o tamanho dessa empresa pública federal, é importante descentralizar atividades e delegar responsabilidades. A respeito de motivação, descentralização e delegação, julgue os itens subsequentes.'],
  [54, 'A existência de uma empresa de logística com operações em diversos continentes depende da função de administração de controle, essencial para assegurar que prazos, custos, estoques e atividades estejam alinhados com o planejamento. Julgue os itens subsecutivos.'],
  [56, 'Em relação à seleção de pessoas e à gestão por competências, julgue os itens a seguir.'],
  [58, 'Com relação à elaboração, à análise e à avaliação de projetos e às etapas da gestão de projetos, julgue os itens que se seguem.'],
  [61, 'Considerando a situação hipotética dos caminhoneiros e a classificação de atividades primárias e de apoio à logística, julgue os itens subsequentes.'],
  [64, 'A respeito das etapas e das metodologias de classificação de materiais, julgue os itens que se seguem.'],
  [67, 'Considerando a situação hipotética do consultor de uma importadora, julgue os itens subsecutivos sobre planejamento de estoques.'],
  [69, 'Considerando a situação hipotética das compras de uma empresa pública federal, julgue os itens relativos às recomendações adequadas sobre compras no setor público.'],
  [71, 'Considerando a situação hipotética da licitação para aquisição de material de consumo, julgue os itens com base na Lei nº 13.303/2016.'],
  [73, 'Considerando a situação hipotética do almoxarifado e do patrimônio de uma empresa pública, julgue os itens seguintes com base na Lei nº 13.303/2016.'],
  [76, 'A respeito do regime de licitações e contratos aplicável à INFRA S.A., julgue os itens com base na Lei nº 13.303/2016.'],
  [81, 'Tendo em vista o planejamento de longo prazo conduzido pela INFRA S.A., julgue os itens com fundamento na Lei nº 13.303/2016.'],
  [84, 'Julgue os itens de acordo com o Regulamento Interno de Licitações e Contratos da INFRA S.A.'],
  [87, 'Com base nas normas internas da INFRA S.A. de licitações e de gestão e fiscalização de contratos, julgue os itens a seguir.'],
  [91, 'A respeito de princípios e conceitos arquivísticos, da legislação arquivística e da gestão de documentos, julgue os itens que se seguem.'],
  [98, 'Com base na Lei de Acesso à Informação (LAI) e na Lei Geral de Proteção de Dados Pessoais (LGPD), julgue os itens a seguir.'],
])
const duplicatas = new Map([
  ['extr-606eab8dfbf16d7ff280', 'extr-4bf83714eec9b23cd487'],
  ['extr-6a8f0532d1d8b5e716f2', 'extr-1a5da446d0645264e93a'],
  ['extr-0d9074b89c64e4a2d926', 'extr-a7683495dc8e5001cb9b'],
  ['extr-8da19b3b06ef89e95099', 'extr-22a754ee45f32bdfdbd5'],
])
const facil = new Set([41, 43, 45, 48, 50, 52, 55, 57, 58, 61, 62, 64, 67, 68, 70, 72, 75, 78, 80, 85, 90, 91, 93, 94, 98, 100])
const dificil = new Set([42, 46, 47, 49, 51, 53, 54, 59, 60, 63, 66, 69, 71, 74, 77, 79, 81, 82, 83, 84, 86, 87, 89, 92, 95, 96, 97, 99])
const cortes = new Map([
  [44, 'Como empresa pública federal vinculada'], [46, 'Organizações de grande complexidade, como um porto'],
  [49, ''], [51, ''], [53, ''],
  [54, 'O controle é a função de administração'], [55, 'Em um setor orientado para o cliente'],
  [56, '56 A modelagem do trabalho por competências'], [60, 'Dois caminhoneiros decidiram abrir'],
  [66, 'Um consultor foi contratado'], [68, 'Certa colaboradora do setor de compras'],
  [70, 'Carina, empregada do setor de licitações'], [72, 'CEBRASPE – INFRA S.A.'],
  [75, 'A respeito do regime de licitações'], [80, 'Tendo em vista que o planejamento de longo prazo'],
  [83, 'Julgue os próximos itens,'],
  [86, 'Com base na Norma Interna de Gestão'], [90, 'Os arquivos, no âmbito das organizações públicas'],
  [97, 'CEBRASPE – INFRA S.A.'], [100, 'Espaço livre']
])
function corrigir(q) {
  let s = q.enunciado.replace(/\s+/gu, ' ').trim()
  const n = Number(q.numero)
  const stops = new Map([
    [49, [' DO Empresas', ' Empresas aeroportuárias']],
    [51, [' TD', ' Em uma']],
    [53, [' DT', ' A exist']]
  ])
  const particulares = stops.get(n) || []
  const posicoes = particulares.map(m => s.indexOf(m)).filter(i => i > 0)
  if (posicoes.length) s = s.slice(0, Math.min(...posicoes)).trim()
  const corte = cortes.get(n)
  if (corte && corte && s.includes(corte)) s = s.slice(0, s.indexOf(corte)).trim()
  const fixes = [
    [/reservando\s*-\s*se/giu, 'reservando-se'], [/Decreto\s*-\s*lei/giu, 'Decreto-lei'],
    [/arc\s+abouço/giu, 'arcabouço'], [/p\s+articipam/giu, 'participam'], [/env\s+olve/giu, 'envolve'],
    [/organiza\s+ção/giu, 'organização'], [/basca\s+da/giu, 'baseada'], [/basca\s+do/giu, 'baseado'],
    [/organi\s+zação/giu, 'organização'], [/responsa\s+bilidades/giu, 'responsabilidades'],
    [/existên\s+cia/giu, 'existência'], [/toma\s*-\s*se/giu, 'torna-se'],
    [/estrat\s+ificarem/giu, 'estratificarem'], [/logís\s+tica/giu, 'logística'],
    [/substituí\s+dos/giu, 'substituídos'], [/mi\s+nuciosa/giu, 'minuciosa'],
    [/atendar/giu, 'atender'], [/sustentável\s+s/giu, 'sustentável'],
    [/julgue\s+o\s+s itens/giu, 'julgue os itens'], [/julgamento\s+adotado/giu, 'julgamento adotado'],
    [/confor\s+me/giu, 'conforme'], [/alcançar\s+o\s+resultado/giu, 'alcançar o resultado'],
    [/estrat\s+égico/giu, 'estratégico'], [/almo\s+xarifado/giu, 'almoxarifado'],
    [/patrimonia\s+l/giu, 'patrimonial'], [/impediment\s+o de/giu, 'impedimento de'],
    [/vedad\s+a/giu, 'vedada'], [/sigilo\s+-\s*garantia/giu, 'seguro-garantia'],
    [/seguro\s+-\s*garantia/giu, 'seguro-garantia'], [/d\s+espesa/giu, 'despesa'],
    [/p\s+ossível/giu, 'possível'], [/e\s+las relacionadas/giu, 'elas relacionadas'],
    [/entidade sancionadora por cinco anos/giu, 'entidade sancionadora por cinco anos'],
    [/contribuir para o desenvolvimento nacional s\s+ustentável/giu, 'contribuir para o desenvolvimento nacional sustentável'],
    [/as horas\s+extras/giu, 'as horas extras'], [/equilibrio/giu, 'equilíbrio'],
    [/partes interessada\s+s/giu, 'partes interessadas'], [/orga\s+nização/giu, 'organização'],
    [/de acordo c\s+om/giu, 'de acordo com'],
    [/primazi\s+a/giu, 'primazia'], [/administra\s+ção/giu, 'administração'],
    [/decisões\s+baseada/giu, 'decisões baseadas'], [/reserva\s+do\s+Estado/giu, 'reserva do Estado'],
    [/fa\s+tores/giu, 'fatores'], [/m\s+odo/giu, 'modo'], [/o\s+s itens/giu, 'os itens'],
  ]
  for (const [re, rep] of fixes) s = s.replace(re, rep)
  return s
}

const decisoes = questoes.map(q => {
  const n = Number(q.numero), grupo = grupos.find(([de, ate]) => n >= de && n <= ate)
  if (!grupo) throw new Error(`Item INFRA S.A. fora da taxonomia: ${n}`)
  const [, , materia, conteudo] = grupo, pagina = pag(n)
  const comando = [...comandos].filter(([inicio]) => n >= inicio).at(-1)?.[1]
  const duplicada = duplicatas.has(q.id)
  return {
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo,
    concurso: 'INFRA S.A. 2026 — Cargo 1: Analista, especialidade Administrador', ano: 2026,
    numero_original: n, pagina, dificuldade: facil.has(n) ? 'Fácil' : dificil.has(n) ? 'Difícil' : 'Média',
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pelo nível de aplicação conceitual e integração de conteúdos; não é uma escala psicométrica publicada pela banca.',
    classificacao_fonte: prova,
    texto_apoio: comando || 'Julgue o item conforme o conteúdo e a norma expressamente indicados no enunciado.',
    visual: { pagina, imagem: `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`, motivo: `Conferência visual do item ${n} na página ${pagina} da prova oficial do Cargo 1.` },
    enunciado: corrigir(q),
    ...(duplicada ? { apta_resolucao: false, duplicada_de: duplicatas.get(q.id), inelegibilidade_motivo: 'Registro OCR duplicado do mesmo item e da mesma prova; versão mais limpa preservada para resolução.' } : {}),
    motivo: `Classificação individual pelo enunciado, bloco temático e caderno oficial do Cargo 1 — Administrador. Gabarito definitivo específico localizado em ${gabarito}; respostas automáticas aguardam transcrição conferida.`
  }
})
if (decisoes.length !== 55 || duplicatas.size !== 4) throw new Error('Contagem inesperada para o lote INFRA S.A.')
for (const [, destino] of duplicatas) if (!questoes.some(q => q.id === destino)) throw new Error(`Destino de cópia não encontrado: ${destino}`)

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-infrasa-administrador-2026-v144', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-infrasa-administrador-2026-v144/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)
const reportPath = 'docs/acervo/revisao-profissional/RELATORIO.md'
let report = await fs.readFile(reportPath, 'utf8')
const marker = '\n\n## Revisão INFRA S.A. — Cargo 1 Administrador — v144\n'
const old = report.indexOf(marker)
if (old >= 0) report = report.slice(0, old)
report += `\n\n## Revisão INFRA S.A. — Cargo 1 Administrador — v144\n\n- Revisei 55 registros de 51 itens únicos pendentes da prova específica do Cargo 1 — Analista, especialidade Administrador, aplicada em 15/03/2026. Classifiquei conteúdos de Administração Pública e Geral, Direito Administrativo, Gestão de Pessoas, Gestão de Projetos, Logística, Administração de Materiais e Arquivologia.\n- Conferi visualmente as quatro páginas do caderno oficial e corrigi contaminação de enunciados por textos-base e itens adjacentes. Corrigi palavras quebradas pelo OCR, reconstruí os comandos compartilhados por blocos e vinculei cada registro à página correta. Quatro versões OCR repetidas dos itens 49, 51, 53 e 54 foram desativadas, mantendo uma cópia limpa de cada item.\n- Marquei dificuldade como estimativa editorial. O Cebraspe publica gabarito definitivo específico do Cargo 1; não associei respostas nem habilitei correção automática sem validar a transcrição item a item.\n- Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis. Revisão local, ainda não publicada na nuvem.\n- Fontes oficiais: [prova específica do Cargo 1](https://cdn.cebraspe.org.br/concursos/infrasa_26_analista/arquivos/1C1668CD3507A43FF9F244281621EEB862E40BE78DB828914CF3C9E32F9FA996.pdf), [gabarito definitivo específico do Cargo 1](https://cdn.cebraspe.org.br/concursos/INFRASA_26_ANALISTA/arquivos/686BA145A69230A753F7C4C7A79B8A08440F887DFB1796D9FA9C7C14FD952627.pdf), [página oficial do concurso, cargos e publicações](https://www.cebraspe.org.br/concursos/INFRASA_26_ANALISTA).\n`
await fs.writeFile(reportPath, report)
console.log(JSON.stringify({ ...rel, revisados: decisoes.length, itens_unicos: 51, duplicatas_desativadas: duplicatas.size, prova, gabarito, publicado: false }, null, 2))
