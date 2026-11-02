import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-codevasf-civil-v76'
const base='tmp/revisao-profissional/revisao-dpdf-servico-social-v75/acervo-extraido'
const doc='fbcaf20513f9a3e0'
const prova='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/989_CODEVASF_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_004_01.PDF'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-codevasf-civil-2024.json','utf8'))
const content={
  51:'Gestão de projetos: caminho crítico e dependências entre atividades',52:'Gestão de projetos: valor agregado, escopo, prazo e custo',53:'Planejamento e controle de obras: cronograma e alterações de execução',54:'Gestão de obras: curva S e acompanhamento de custos e prazos',
  55:'Viabilidade econômica: custos iniciais, custos operacionais e receitas',56:'Viabilidade de projetos: análise econômica de obras',57:'Viabilidade técnica: materiais, mão de obra e capacidade técnica',58:'Indicadores de projeto: taxa interna de retorno e viabilidade',59:'Normas técnicas: prevenção de riscos e litígios',60:'Normas técnicas de engenharia: atualização e aplicação',
  61:'Segurança do trabalho: equipamentos de proteção individual',62:'Segurança do trabalho: responsabilidades na obra',63:'Orçamento de obras: benefícios e despesas indiretas (BDI)',64:'Orçamento de obras: composição analítica e sintética',65:'Gestão de projetos: relatórios no MS Project',66:'Gestão de projetos: gerenciamento de projetos simultâneos',
  69:'Licitações de obras: definição do objeto e competitividade',70:'Pavimentação rodoviária: misturas asfálticas e clima',71:'Concreto: recebimento e ensaio de abatimento (slump test)',72:'Estruturas metálicas: montagem, desmontagem e substituição',73:'Estruturas de concreto: vida útil de projeto e reajuste contratual',74:'SINAPI: identificação de referências e composição de custos',75:'Orçamento de pintura: consumo, rendimento e perdas de material',76:'Materiais de construção: especificação de tinta látex acrílica',77:'Orçamento de obras: custo direto e composição de insumos',78:'Fiscalização de obras: caderno de encargos e documentação técnica',79:'Medição de obras: quantificação e compatibilidade com o cronograma',80:'Contratos de obras: índice e data-base de reajuste',
  81:'Avaliação de imóveis: grau de fundamentação e qualidade de dados',82:'Avaliação de imóveis: método involutivo e aproveitamento eficiente',83:'Avaliação de imóveis: depreciação por decrepitude',84:'Impermeabilização: lajes de cobertura expostas',85:'Instalações elétricas: dispositivo diferencial-residual (DR)',86:'Fundações: estacas Strauss e execução de estacas moldadas in situ',87:'Instalações hidráulicas: reservatório de água potável e proteção contra contaminação',88:'Orçamento de obras: curva ABC e análise de custos',89:'Composição de custos unitários: produtividade de mão de obra',90:'Apropriação de serviços: coeficientes de materiais e mão de obra',
  91:'Irrigação: sistema autopropelido e aspersor tipo canhão',92:'Hidráulica: turbina Francis e classificação de turbinas',93:'Barragens: concreto compactado a rolo e concreto convencional',94:'Pequenas centrais hidrelétricas: tomada d’água e condução',95:'Saneamento: tratamento de esgoto e remoção de sólidos grosseiros',96:'Saneamento: aplicação de tanques sépticos',97:'Tratamento de água: coagulação e mistura rápida',98:'Obras portuárias: molhes de enrocamento e energia de ondas',99:'Portos: equipamentos de movimentação de contêineres',100:'Drenagem urbana: reservatórios de contenção de cheias',
  101:'Rodovias: sinalização vertical e regulamentação de tráfego',102:'Geotecnia: sondagem SPT e índice de resistência à penetração',103:'Sinalização de obras: placas de advertência e orientação',104:'Terraplenagem rodoviária: materiais de terceira categoria',105:'Drenagem rodoviária: concreto para entradas e descidas d’água',106:'Terraplenagem: seleção e compactação de materiais de aterro',107:'Pavimentação: camada de base de solo-cimento e trecho experimental',108:'Custos rodoviários: duração e tempo de ciclo de equipamentos',109:'Planejamento de obras: cronogramas, mobilização e condições climáticas',110:'Canteiro de obras: planejamento, segurança e flexibilidade',
  111:'Licitações: serviços técnicos especializados de natureza intelectual',112:'Contratos públicos: mão de obra e egressos do sistema prisional',113:'Licitações: visita técnica e conhecimento do local da obra',114:'Contratos de obras: medição mensal e regime de execução',115:'Contratos administrativos: reajuste e equilíbrio econômico-financeiro',116:'Contratos contínuos: prorrogação e vigência máxima',117:'Contratos públicos: prazo de serviços e fornecimentos contínuos',118:'Contratos administrativos: substituição de seguro-garantia',119:'Contratos contínuos: reajuste de preços e dedicação exclusiva de mão de obra',120:'Contratos administrativos: caracterização de serviços contínuos'
}
const subjects=n=>n>=111?['Direito Administrativo',content[n]]:n===69?['Direito Administrativo',content[n]]:['Engenharia Civil',content[n]]
const keys=[
  ['E','C','E','E','C','E','C','E','C','E','E','E','C','C','C','C','E','C','E','C'],
  ['E','C','E','C','E','E','C','E','C','E','E','C','E','E','C','C','C','C','E','C'],
  ['X','E','C','E','E','X','C','E','E','C','C','E','C','E','C','E','C','E','C','E'],
  ['C','C','E','C','E','C','C','E','C','E']
].flat()
const answer=Object.fromEntries(keys.map((v,i)=>[51+i,v]))
const context=[
  [51,54,'Bloco: planejamento de projetos e obras de Engenharia Civil.'],
  [55,58,'Bloco: viabilidade econômica e técnica de construções; avaliação de custos, receitas, recursos e indicadores.'],
  [59,60,'Bloco: normas técnicas aplicáveis à Engenharia Civil.'],
  [61,62,'Bloco: segurança do trabalho em Engenharia Civil.'],
  [63,64,'Bloco: avaliação de custos e orçamento de obras.'],
  [65,66,'Bloco: gestão de projetos de Engenharia Civil com MS Project.'],
  [69,69,'Bloco: objeto, homologação e adjudicação em licitações públicas.'],
  [70,70,'Bloco: pavimentação em obras rodoviárias.'],
  [71,73,'Bloco: estruturas de concreto armado e protendido, estruturas metálicas e controle da qualidade dos materiais.'],
  [74,74,'Bloco: Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI).'],
  [75,77,'Dados do catálogo do fabricante: tinta látex acrílica premium, acabamento fosco, rendimento médio de 18 litros por 110 m²; fornecimento em galões de 3,6 L, latas de 18 L ou baldes de 20 L. Considerar as perdas indicadas no enunciado.'],
  [78,80,'Bloco: fiscalização, acompanhamento, documentação técnica, medição e reajuste de obras.'],
  [81,83,'Bloco: avaliação de imóveis conforme a NBR 14653.'],
  [84,86,'Bloco: sistemas construtivos, instalações elétricas e fundações.'],
  [87,87,'Situação hipotética: reservatório de água potável de residência foi projetado com peças transparentes de vidro para permitir a passagem de luz.'],
  [88,88,'Bloco: análise orçamentária de obra de Engenharia Civil e curva ABC.'],
  [89,90,'Composição de mão de obra para chapisco por metro quadrado: pedreiro, coeficiente 0,06810 hora; servente, coeficiente 0,02550 hora. Para o item 89, considere 1.000 m² e valores de R$ 50 e R$ 20 por hora, respectivamente.'],
  [91,94,'Bloco: estruturas hidráulicas, aproveitamento hidrelétrico e irrigação.'],
  [95,97,'Bloco: tratamento de água e esgoto, abastecimento público e saneamento.'],
  [98,100,'Bloco: defesa contra inundação e obras portuárias.'],
  [101,107,'Bloco: sondagem SPT, sinalização e especificações de serviços em obras rodoviárias.'],
  [108,110,'Bloco: canteiro de obras, metodologia e sistema SICRO de custos rodoviários.'],
  [111,115,'Bloco: Lei nº 14.133/2021, licitações, fiscalização e gestão de contratos de obras e serviços de Engenharia.'],
  [116,120,'Bloco: legislação aplicável à gestão e fiscalização de contratos de serviços contínuos.']
]
const clean={
  58:'A taxa interna de retorno é um indicador utilizado na avaliação da viabilidade técnica de um projeto de construção civil, indicando a eficiência técnica do projeto.',
  60:'A atualização das normas técnicas na área da Engenharia Civil é um processo que ocorre anualmente.',
  75:'Pelas especificações apresentadas, e consideradas perdas de 10% durante o uso, serão necessárias 20 latas do produto caso ele seja aplicado em uma área de 1.000 m².',
  76:'As informações apresentadas dizem respeito à tinta látex acrílica premium, acabamento fosco.',
  89:'Se, pela execução de 1.000 m² de chapisco, o pedreiro e o servente receberem, por hora de trabalho, R$ 50 e R$ 20, respectivamente, então os custos com mão de obra para a execução total do serviço serão de R$ 3.905.',
  90:'A apropriação de um serviço permite a obtenção de coeficientes que expressam as quantidades de material, de mão de obra e do tempo empregados por unidade de serviço.'
}
const hard=new Set([51,53,54,57,58,62,63,64,69,71,73,75,77,78,80,81,82,83,84,85,86,87,88,89,91,92,93,94,95,97,98,99,100,101,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120])
const decisions=[]
for(const q of qs){
 const n=Number(q.n),tax=subjects(n)
 if(!content[n])throw Error('Sem conteúdo para '+n)
 const pg=Number(q.pagina),imagem=`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const c=context.find(([a,b])=>n>=a&&n<=b)?.[2]
 const a=answer[n]
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tax[0],conteudo:tax[1],ano:2024,pagina:pg,dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica, normativa ou de cálculo; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`CODEVASF 2024 — Analista em Desenvolvimento Regional, Engenharia Civil, CEBRASPE; questão ${n}. Matéria e assunto conferidos no cabeçalho e no enunciado do caderno oficial.`,imagem_pagina:imagem,texto_apoio:c}
 if(clean[n])d.enunciado=clean[n]
 d.anulada=a==='X';d.resposta_correta=a==='X'?null:a==='C'?0:1;d.gabarito_oficial={valor:a,fonte:gabarito,metodo:'Conferido no gabarito definitivo oficial do Cargo 4; arquivo binário não está localmente disponível para vincular hash.'}
 decisions.push(d)
}
const byNumber=new Map()
for(const d of decisions){const n=Number(qs.find(q=>q.id===d.id).n),arr=byNumber.get(n)||[];arr.push(d);byNumber.set(n,arr)}
const duplicates=[]
for(const [n,arr] of byNumber)if(arr.length>1){for(const d of arr.slice(1)){d.apta_resolucao=false;d.inelegibilidade_motivo=`Extração duplicada da questão ${n} no mesmo caderno; uma ocorrência foi mantida disponível.`;d.duplicada_de=arr[0].id;duplicates.push({numero:n,id:d.id,duplicada_de:arr[0].id})}}
if(decisions.length!==69||duplicates.length!==2)throw Error(`Esperadas 69 revisões e duas duplicatas; obtidas ${decisions.length} e ${duplicates.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'CODEVASF 2024 — Analista em Desenvolvimento Regional — Engenharia Civil — Cargo 4',documento_id:doc,registros_revisados:69,questoes_unicas_classificadas:67,duplicatas_desativadas:duplicates,gabaritos_oficiais_transcritos:69,itens_anulados:[91,96],gabarito_hash_pendente:true,observacao:'Classifiquei os itens pelo conteúdo do caderno e associei os textos de apoio, dados tabulares e imagens das páginas. O gabarito definitivo oficial foi transcrito, inclusive os itens 91 e 96 anulados. O PDF binário da chave não está localmente disponível para hash, portanto a correção automática não é habilitada por esta revisão.',fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
