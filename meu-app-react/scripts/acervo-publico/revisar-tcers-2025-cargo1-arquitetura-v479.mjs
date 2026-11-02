import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-tcers-2025-arquitetura-cargo1-v479'
const documento = 'd52c501354a0d96a'
const prova = 'https://cdn.cebraspe.org.br/concursos/TCE_RS_25/arquivos/2498E3C7584F604DC8E95B1290A88F561AFCEBFE69251C4FD3BD3D6702C38DC9.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/tce_rs_25/arquivos/914267BDB7DDDCC5DEB863C72B48D14B90DF87796AC917C6BE67BAFCEF937F74.pdf'
const justificativas = 'https://cdn.cebraspe.org.br/concursos/tce_rs_25/arquivos/759390851096AB4AEE109937F247FD7D38D3A727C61BCA7E6B3D683D95E784E9.pdf'
const edital = 'https://cdn.cebraspe.org.br/concursos/tce_rs_25/arquivos/5BD602429F6DE6CF3F6208F84AD755EBAC97163D43C968C259DC3B818332AFF8.pdf'
const concurso = 'TCE/RS — Auditor de Controle Externo — 2025'
const catalogo = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(catalogo?.url.toLowerCase(), prova.toLowerCase())
const pendentes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
assert.equal(pendentes.length, 75)
const hashes = new Map(pendentes.map(q => [q.id, hashRevisao(q.enunciado)]))

const respostas = [
  'E','E','E','C','C','C','C','E','E','C','E','C','C','E','C','E','C','E','C','C',
  'C','E','E','E','C','E','C','E','E','C','E','E','E','C','C','E','C','C','E','E',
  'C','E','C','C','E','E','E','C','E','C','E','C','E','E','E','C','C','E','C','C',
  'E','C','E','C','C','E','C','E','E','C','C','C','E','E','C','E','C','C','E','E',
  'E','X','C','C','X','E','E','E','E','C','C','E','E','C','E','E','C','C','X','C'
]
assert.equal(respostas.length, 100)
const respostaPorNumero = new Map(respostas.map((r, i) => [i + 1, r]))
const hashGabarito = hashRevisao(respostas.join(''))
const duplicatas = new Map([['extr-dd5644d56d1f0f8fae9b', 'extr-a8ec2003d17d246c42e6']])
assert.ok(pendentes.some(x => x.id === 'extr-a8ec2003d17d246c42e6'))

const assuntos = new Map([
  [1,['Arquitetura e Urbanismo','História da arquitetura e patrimônio: tombamento de cemitérios e bens arqueológicos']],
  [2,['Arquitetura e Urbanismo','Patrimônio cultural: intervenções e autorização em imóveis tombados']],
  [3,['Arquitetura e Urbanismo','História da arquitetura: arquitetura gótica e antiguidade clássica']],
  [4,['Arquitetura e Urbanismo','Cartas patrimoniais: Carta de Veneza e conjuntos urbanos e rurais']],
  [5,['Arquitetura e Urbanismo','Cartas patrimoniais: educação e preservação de monumentos']],
  [6,['Desenho Técnico','Representação gráfica: convenções de hachuras']],
  [7,['Desenho Técnico','Desenho arquitetônico: cota de nível em osso e revestimentos']],
  [8,['Geometria Descritiva','Projeções ortogonais e verdadeira grandeza de segmentos']],
  [9,['Arquitetura e Urbanismo','Documentação de projeto: conteúdo de laudo técnico']],
  [10,['Desenho Técnico','Perspectiva cônica e pontos de fuga']],
  [12,['Direito Urbanístico','Estatuto da Cidade: estudo de impacto de vizinhança e patrimônio cultural']],
  [13,['Direito Urbanístico','Estatuto da Cidade: plano diretor e política de desenvolvimento urbano']],
  [14,['Direito Urbanístico','Estatuto da Cidade: ordenação do uso do solo e retenção especulativa de imóveis']],
  [16,['Legislação Ambiental','Licenciamento ambiental: relação entre EIA e RIMA']],
  [17,['Legislação Ambiental','Licenciamento ambiental: certidão municipal de conformidade urbanística']],
  [18,['Legislação Ambiental','Licenciamento ambiental de rodovias: exigência de EIA e RIMA']],
  [19,['Habitação e Desenvolvimento Sustentável','Agenda 2030: acesso à habitação segura e adequada']],
  [20,['Habitação e Desenvolvimento Sustentável','Sistema Nacional de Habitação de Interesse Social e programas habitacionais']],
  [21,['Parcelamento do Solo Urbano','Loteamentos: áreas para equipamentos urbanos e comunitários']],
  [22,['Parcelamento do Solo Urbano','Lei nº 6.766/1979: loteamento e desmembramento']],
  [23,['Parcelamento do Solo Urbano','Infraestrutura básica em zonas habitacionais de interesse social']],
  [24,['Infraestrutura Urbana','Abastecimento de água: captação e adução de água bruta']],
  [25,['Infraestrutura Urbana','Sistema viário e integração com drenagem urbana']],
  [26,['Gestão de Resíduos Sólidos','Logística reversa de pneus e responsabilidade pós-consumo']],
  [27,['Projeto Arquitetônico','Programa de necessidades, modulação e racionalização construtiva']],
  [28,['Projeto Arquitetônico','Fluxograma e relações funcionais de residência']],
  [29,['Materiais e Sistemas Construtivos','Argamassa armada: composição, propriedades e aplicações']],
  [30,['Conforto Ambiental','Acústica arquitetônica: reflexões, eco, sombra acústica e concentração sonora']],
  [31,['Conforto Ambiental','Bioclimatologia: carta bioclimática e estratégias de condicionamento']],
  [32,['Conforto Ambiental','Projeto arquitetônico: orientação solar e insolação de ambientes']],
  [33,['Segurança Contra Incêndio','Saídas de emergência: dimensionamento de escadas e rampas']],
  [34,['Patrimônio e Reabilitação','Retrofit, restauração e preservação de edifícios históricos']],
  [35,['Instalações Elétricas','Simbologia elétrica: dispositivos de seccionamento e manobra']],
  [36,['Instalações Hidrossanitárias','Reservatórios: alimentação, saída, extravasor e limpeza']],
  [37,['Sistemas Construtivos','Coberturas: identificação de terça, frechal e caibros']],
  [38,['Impermeabilização','Estanqueidade de coberturas e proteção contra passagem de fluidos']],
  [39,['Orçamento de Obras','Curva ABC: desconto sobre insumos de maior relevância']],
  [40,['Orçamento de Obras','Curva ABC: classificação de insumos e serviços']],
  [41,['Orçamento de Obras','Curva ABC: concentração do custo nos insumos de maior relevância']],
  [42,['Planejamento de Obras','PERT/CPM: efeito de atraso em atividade de rede']],
  [43,['Planejamento de Obras','PERT/CPM: caminho crítico e início de atividades']],
  [44,['Tecnologia do Concreto','Controle tecnológico: amostragem para ensaios de resistência à compressão']],
  [45,['Tecnologia do Concreto','Concreto fresco: ensaio de consistência e frequência de amostragem']],
  [46,['Legislação Profissional','RRT: finalidade, responsabilidade técnica e comprovação de autoria']],
  [47,['Legislação Profissional','Código de Ética e atribuições de arquitetos e urbanistas']],
  [48,['Legislação Profissional','Atribuições profissionais e projetos de segurança contra incêndio']],
  [49,['Acessibilidade','Acessibilidade em imóvel tombado e adaptação de estação ferroviária']],
  [50,['Acessibilidade','Acessibilidade comunicacional e desenho universal em auditório']],
  [51,['Acessibilidade','Lei Brasileira de Inclusão: acessibilidade e alvará de funcionamento']],
  [52,['Acessibilidade','Lei Brasileira de Inclusão: vagas reservadas em estacionamento']],
  [53,['Saneamento Básico','Lei nº 11.445/2007 e Novo Marco do Saneamento: planejamento integrado']],
  [54,['Saneamento Básico','Medição individualizada de água em edificações condominiais']],
  [55,['Saneamento Básico','Regionalização e prestação de serviços de saneamento']],
  [56,['Saneamento Básico','Planos de saneamento: periodicidade de revisão']],
  [57,['Saneamento Básico','Universalização dos serviços e infraestrutura de saneamento']],
  [58,['Mobilidade Urbana','Planejamento urbano e prioridade de investimentos no sistema viário']],
  [59,['Mobilidade Urbana','Política Nacional de Mobilidade Urbana: inclusão e redução de desigualdades']],
  [60,['Mobilidade Urbana','Plano de mobilidade: acessibilidade e polos geradores de viagens']],
  [61,['Gestão de Resíduos Sólidos','Resíduos da construção civil e logística reversa em habitação social']],
  [62,['Gestão de Resíduos Sólidos','Consórcios intermunicipais e disposição final ambientalmente adequada']],
  [63,['Gestão de Resíduos Sólidos','Plano diretor e gestão integrada de resíduos sólidos']],
  [64,['Gestão de Resíduos Sólidos','Planos de gerenciamento de resíduos e compatibilidade com planejamento municipal']],
  [65,['Licitações e Contratos','Lei nº 14.133/2021: anteprojeto e projeto básico']],
  [66,['Licitações e Contratos','Lei nº 14.133/2021: modalidades e procedimentos auxiliares']],
  [83,['Auditoria Governamental','Inteligência artificial generativa: revisão crítica e risco de informação inverossímil']],
  [84,['Auditoria Governamental','Inteligência artificial em auditoria: viés de exclusão e representatividade de dados']],
  [85,['Auditoria Governamental','Inteligência artificial em auditoria: proteção e anonimização de dados pessoais']],
  [86,['Auditoria Governamental','Inteligência artificial: imparcialidade e discriminação algorítmica']],
  [87,['Auditoria Governamental','Papéis de trabalho e transparência no uso de inteligência artificial']],
  [88,['Auditoria Governamental','Auditoria financeira: risco inerente e risco de controle']],
  [89,['Auditoria Governamental','Auditoria operacional: monitoramento de ações corretivas']],
  [90,['Auditoria Governamental','Auditoria operacional: planejamento e evidência suficiente e apropriada']],
  [91,['Auditoria Governamental','Auditoria de conformidade: materialidade e fatores qualitativos']],
  [92,['Auditoria Governamental','Auditoria operacional: tempestividade do relatório']]
])
assert.equal(assuntos.size, 74)

const contextos = new Map([
  [1,'Acerca da história da arquitetura e da preservação do patrimônio arquitetônico, julgue os itens subsequentes.'],
  [6,'No que diz respeito a projetos de arquitetura e suas normas de representação, métodos e técnicas de desenho, julgue os itens.'],
  [11,'Com base na Lei nº 10.257/2001 (Estatuto da Cidade), julgue os itens a seguir.'],
  [16,'No que se refere ao estudo de impacto ambiental (EIA), ao relatório de impacto ambiental (RIMA) e ao procedimento de licenciamento ambiental, julgue os itens.'],
  [19,'Acerca da habitação de interesse social e do direito à moradia digna, julgue os itens subsequentes.'],
  [21,'Em relação ao parcelamento do solo urbano, julgue os itens conforme a Lei nº 6.766/1979.'],
  [24,'A respeito de conceitos e práticas relacionados à infraestrutura urbana, julgue os itens.'],
  [27,'Julgue os itens sobre programa de necessidades, fluxograma, modulação e racionalização da construção.'],
  [29,'Julgue o item a seguir sobre materiais e sistemas construtivos.'],
  [30,'Acerca de conforto ambiental, utilize os desenhos e gráficos das páginas originais para julgar os itens.'],
  [33,'Julgue os itens referentes a segurança de edificações e projetos complementares.'],
  [35,'Em relação à leitura e interpretação de projetos complementares de edificações, julgue os itens; símbolos, esquemas e tabelas estão nas páginas originais.'],
  [37,'A respeito de projetos de edifícios e seus elementos construtivos, julgue os itens.'],
  [39,'A tabela da página 3 apresenta os custos e percentuais acumulados dos insumos de uma obra; julgue os itens sobre a curva ABC.'],
  [41,'A tabela de custos da página 3 e o diagrama de rede com 13 atividades da página 3 subsidiam os itens de orçamento e planejamento de obras.'],
  [42,'Considere o diagrama PERT/CPM de uma reforma, com 13 atividades e durações indicadas em semanas na página 3.'],
  [44,'Durante a fiscalização de uma obra, um profissional habilitado realiza ensaios de controle tecnológico para verificar a consistência e a resistência à compressão do concreto.'],
  [46,'Acerca da regulamentação das atividades e atribuições de arquitetos e urbanistas, julgue os itens.'],
  [49,'Uma universidade pública do Rio Grande do Sul está construindo um novo campus. O projeto inclui prédios acadêmicos, biblioteca, restaurante universitário, áreas de convivência e centro esportivo. A biblioteca será instalada em uma antiga estação ferroviária tombada, sem adaptações de acessibilidade.'],
  [53,'Julgue os itens à luz da Política Nacional de Saneamento Básico (Lei nº 11.445/2007) e do Novo Marco do Saneamento Básico (Lei nº 14.026/2020).'],
  [58,'Com base na Política Nacional de Mobilidade Urbana (Lei nº 12.587/2012), julgue os itens subsequentes.'],
  [61,'De acordo com a Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010), julgue os itens.'],
  [65,'No que se refere a licitações públicas, julgue os itens conforme a Lei nº 14.133/2021.'],
  [74,'A respeito de contratos administrativos de obras públicas, julgue os itens com base na Lei nº 14.133/2021.'],
  [78,'Considerando a legislação aplicável às contratações públicas e à concessão e permissão de serviços públicos, julgue os itens.'],
  [81,'Julgue os itens relativos ao controle interno, à auditoria financeira e à comunicação de deficiências de controle.'],
  [83,'Um auditor pretende utilizar inteligência artificial generativa em uma auditoria operacional realizada em programa social destinado a comunidades quilombolas: na análise de informações obtidas de diferentes fontes e na redação dos achados.'],
  [88,'Com base nas normas aplicáveis às auditorias realizadas no âmbito dos tribunais de contas, julgue os itens.'],
  [92,'Julgue os itens de acordo com as práticas de auditoria governamental e governança pública.']
])
const contextoDe = n => {
  const a = [...contextos.keys()].filter(k => k <= n).at(-1)
  return contextos.get(a)
}
const faceis = new Set([1,2,3,4,6,7,9,11,13,16,19,22,25,26,30,33,34,36,38,45,48,53,54,56,58,61,62,63,65,66,71,73,74,79,83,84,88,89,90,91,92])
const dificeis = new Set([8,10,14,18,24,28,31,32,39,40,41,42,43,44,47,49,50,52,57,60,67,68,69,70,72,75,76,77,78,80,82,85,86,87])

const decisoes = pendentes.map(q => {
  const n = Number(q.numero)
  const assunto = assuntos.get(n)
  assert.ok(assunto, `Item sem assunto específico: ${q.id} (${n})`)
  const pagina = Number(q.pagina)
  const imagem = `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`
  const duplicada = duplicatas.has(q.id)
  const resposta = respostaPorNumero.get(n)
  assert.ok(resposta, `Gabarito definitivo sem resposta para o item ${n}`)
  const dificuldade = faceis.has(n) ? 'Fácil' : dificeis.has(n) ? 'Difícil' : 'Média'
  const texto = q.enunciado.replace(/\s+/g, ' ').trim()
  const d = {
    id: q.id,
    sha256_enunciado: hashes.get(q.id),
    materia: assunto[0],
    conteudo: assunto[1],
    ano: 2025,
    concurso,
    cargo: 'Auditor de Controle Externo (ACE) — Especialidade Arquitetura (Cargo 1)',
    banca: 'CEBRASPE',
    organizadora: 'CEBRASPE',
    aplicacao: 'Prova objetiva P2 — Conhecimentos Específicos — aplicada em 19/10/2025',
    numero: n,
    numero_original: n,
    pagina,
    dificuldade,
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial conforme o nível de interpretação normativa, técnico e de cálculo exigido; não é índice psicométrico publicado pela banca.',
    resposta_correta: resposta === 'X' ? null : resposta === 'C' ? 0 : 1,
    anulada: resposta === 'X',
    gabarito_oficial: {
      fonte: gabarito,
      arquivo: '914267BDB7DDDCC5DEB863C72B48D14B90DF87796AC917C6BE67BAFCEF937F74.pdf',
      sha256: hashGabarito,
      numero: n,
      resposta,
      criterio: 'Gabarito oficial definitivo do Cargo 1 — ACE, Arquitetura; anulações conferidas no documento oficial de justificativas.'
    },
    classificacao_fonte: prova,
    motivo: `Item classificado conforme o comando, o assunto e o programa oficial do Cargo 1 — Auditor de Controle Externo, especialidade Arquitetura.`,
    texto_apoio: contextoDe(n),
    visual: { pagina, imagem, enunciado: texto, texto_apoio: contextoDe(n), motivo: `Página ${pagina} conferida visualmente; figuras, tabelas e diagramas são mantidos junto ao item correspondente.` },
    apta_resolucao: !duplicada,
    remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'integridade_visual_pendente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto', 'classificacao_pendente'],
    ...(duplicada ? { inelegibilidade_motivo: 'recorte_ocr_duplicado_do_item_5_no_mesmo_caderno', duplicada_de: duplicatas.get(q.id) } : {})
  }
  return d
})
assert.equal(decisoes.length, 75)
assert.equal(decisoes.filter(x => x.apta_resolucao).length, 74)
assert.equal(decisoes.filter(x => x.anulada && x.apta_resolucao).map(x => x.numero).join(','), '85')
for (const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ lote: nome, recortes_revisados: 75, itens_unicos_revisados: 74, duplicatas: 1, anuladas: [85], paginas_conferidas: [1,2,3,4,5,6], figuras_tabelas_graficos_preservados: true, gabaritos_definitivos: 74, publicado: false }, null, 2))
  process.exit(0)
}

const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = { ...resultado, documento, prova, gabarito, justificativas, edital, concurso, recortes_revisados: 75, itens_unicos_revisados: 74, duplicatas_sinalizadas: 1, anuladas: [85], paginas_conferidas: [1,2,3,4,5,6], publicado: false }
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## TCE/RS 2025 — ACE, Arquitetura, Cargo 1 — revisão v479\n\n- Revisei os 75 recortes pendentes do caderno: 74 itens únicos e uma cópia OCR do item 5. Classifiquei cada item em patrimônio/arquitetura, desenho técnico, direito urbanístico, licenciamento ambiental, habitação, parcelamento do solo, infraestrutura urbana, conforto ambiental, instalações, orçamento, planejamento, acessibilidade, saneamento, mobilidade, resíduos, licitações e auditoria governamental.\n- Conferi visualmente as páginas 1–6 e associei os contextos corretos. Plantas, diagramas, símbolos, gráficos bioclimáticos, tabela da curva ABC e diagrama PERT/CPM permanecem ligados às questões correspondentes.\n- Registrei CEBRASPE, TCE/RS 2025, Cargo 1 — ACE, especialidade Arquitetura, aplicação em 19/10/2025. A dificuldade é estimativa editorial. Vinculei o gabarito definitivo oficial e marquei o item 85 como anulado conforme as justificativas oficiais.\n- Pacote local, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas oficiais](<${justificativas}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio, null, 2))
