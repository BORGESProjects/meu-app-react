import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-dpdf-engenharia-civil-v77'
const base = 'tmp/revisao-profissional/revisao-codevasf-civil-v76/acervo-extraido'
const doc = '8b04251f9e0cde8a'
const prova = 'https://cdn.cebraspe.org.br/concursos/DPDF_20_ANALISTA/arquivos/548_DPDF_008_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/DPDF_20_ANALISTA/arquivos/GAB_DEFINITIVO_548_DPDF_008_01.PDF'
const qs = JSON.parse(await fs.readFile('tmp/pendentes-dpdf-administracao-2020.json', 'utf8'))

const temas = {
  51:['Engenharia Civil','Fiscalização de obras públicas: apoio técnico ao fiscal do contrato'],
  52:['Engenharia Civil','Contratos de obras: reajustamento e variação dos custos dos insumos'],
  53:['Engenharia Civil','Planejamento de obras: cronogramas físico e de execução'],
  54:['Engenharia Civil','Projetos de obras: projeto básico'],
  55:['Engenharia Civil','Projetos de obras: projeto executivo e execução contratual'],
  56:['Segurança do Trabalho','EPI: treinamento, uso, guarda e conservação'],
  57:['Segurança do Trabalho','Ergonomia e movimentação manual de cargas na construção'],
  58:['Segurança do Trabalho','Ergonomia: adaptação dos postos de trabalho'],
  59:['Segurança do Trabalho','Trabalho em altura: capacitação e requisitos normativos'],
  60:['Direito do Trabalho','Segurança e saúde do trabalho: adicional de insalubridade e cumulação'],
  61:['Direito Administrativo','Parcerias público-privadas: licença ambiental e licitação'],
  62:['Direito Ambiental','Responsabilidade ambiental: termo de compromisso'],
  63:['Direito Administrativo','Licitações de obras: contratação de remanescente e dispensa'],
  64:['Direito Administrativo','Licitações: concurso e remuneração ou prêmio'],
  65:['Engenharia Civil','Licitações de obras: projeto básico e anteprojeto'],
  66:['Engenharia Civil','Orçamento de obras: produtividade de mão de obra e duração de serviços'],
  67:['Engenharia Civil','Quantitativos de obras: cálculo da área real de telhados inclinados'],
  68:['Engenharia Civil','Orçamento de obras: custo unitário básico e orçamento analítico'],
  69:['Direito Administrativo','Regime Diferenciado de Contratações: anteprojeto na contratação integrada'],
  70:['Direito Administrativo','Regime Diferenciado de Contratações: alterações e aditivos na contratação integrada'],
  71:['Engenharia Civil','Terraplenagem: empolamento de solos'],
  72:['Engenharia Civil','Instalações hidráulicas prediais: CPVC em sistemas de água quente'],
  73:['Engenharia Civil','Fundações: estacas mega e cravação por reação'],
  74:['Engenharia Civil','Concreto: trabalhabilidade, lançamento e adensamento'],
  75:['Engenharia Civil','Instalações elétricas prediais: barramentos blindados'],
  76:['Engenharia Civil','Orçamento de obras: encargos sociais e composição do BDI'],
  77:['Engenharia Civil','Orçamento de equipamentos: custo horário improdutivo e depreciação'],
  78:['Engenharia Civil','Orçamento de estruturas: quantitativos e custo de barras de aço'],
  79:['Engenharia Civil','Orçamento de estruturas: quantitativos, perdas e peso do aço'],
  80:['Engenharia Civil','SINAPI: leitura de composições e custos de mão de obra'],
  81:['Engenharia Civil','SINAPI: coeficientes de consumo de materiais'],
  82:['Engenharia Civil','Planejamento de obras: folga total e controle de cronograma'],
  83:['Direito Administrativo','Contratos de obras: atraso injustificado e reajustamento'],
  84:['Engenharia Civil','Planejamento de obras: caminho crítico e folga das atividades'],
  85:['Direito Administrativo','Contratos administrativos: sanções por atraso na execução'],
  86:['Engenharia Civil','Avaliação de imóveis: aproveitamento eficiente conforme a NBR 14653'],
  87:['Engenharia Civil','Avaliação de imóveis: depreciação física'],
  88:['Engenharia Civil','Barragens de terra: aterros hidráulico e compactado'],
  89:['Engenharia Civil','Barragens de gravidade: subpressão e pressão hidrostática'],
  90:['Engenharia Civil','Barragens: trincheira de vedação e controle de percolação'],
  91:['Engenharia Civil','Hidrologia de barragens: níveis e volume útil de reservatórios'],
  92:['Engenharia Civil','Usinas hidrelétricas: potência e rendimento de turbinas'],
  93:['Engenharia Civil','Hidrelétricas: perdas de carga e queda bruta'],
  94:['Engenharia Civil','Irrigação por superfície: infiltração e comprimento de sulcos'],
  95:['Engenharia Civil','Irrigação por aspersão: vazão, frequência e zona radicular'],
  96:['Engenharia Civil','Hidráulica de canais: distribuição de velocidades em seção trapezoidal'],
  97:['Engenharia Civil','Hidráulica de canais: profundidade crítica e número de Froude'],
  98:['Engenharia Civil','Centrais hidrelétricas: classificação por potência instalada'],
  99:['Engenharia Civil','Turbinas hidráulicas: turbinas de reação e pressão no rotor'],
  100:['Engenharia Civil','Adutoras: ventosas de tríplice função e expulsão de ar'],
  101:['Engenharia Civil','Adutoras: ventosas simples e válvulas de admissão e expulsão de ar'],
  102:['Engenharia Civil','Redes coletoras de esgoto: diâmetro mínimo e lâmina de água'],
  103:['Engenharia Civil','Redes coletoras de esgoto: dimensionamento hidráulico e área molhada'],
  104:['Engenharia Civil','Pavimentação: tratamento superficial simples e reforço estrutural'],
  105:['Engenharia Civil','Pavimentação: tratamento superficial simples e resistência ao desgaste'],
  106:['Engenharia Civil','Pavimentação: tratamento superficial simples, ligante e agregado'],
  107:['Engenharia Civil','SICRO: BDI em composições de custos rodoviários'],
  108:['Engenharia Civil','SICRO: produtividade e produção de equipamentos rodoviários'],
  109:['Engenharia Civil','SICRO: classificação de materiais de terraplenagem'],
  110:['Engenharia Civil','Pavimentação asfáltica: deformação permanente e defeitos do revestimento'],
  111:['Engenharia Civil','Pavimentação asfáltica: ensaio de creep estático e deformação permanente'],
  112:['Engenharia Civil','Pavimentação asfáltica: classificação dos agregados'],
  113:['Engenharia Civil','Pavimentação asfáltica: textura superficial dos agregados'],
  114:['Engenharia Civil','Pavimentação asfáltica: granulometria, densidade e volume de vazios'],
  115:['Engenharia Civil','Pavimentação asfáltica: classificação granulométrica dos agregados'],
  116:['Engenharia Civil','Pavimentação asfáltica: resistência e propriedades dos agregados'],
  117:['Engenharia Ambiental','Rodovias: impactos ambientais no meio biótico'],
  118:['Engenharia Ambiental','Rodovias: impactos socioeconômicos e passivo ambiental'],
  119:['Engenharia Ambiental','Rodovias: medidas mitigadoras no planejamento de obras'],
  120:['Engenharia Ambiental','Rodovias: recuperação de áreas de canteiro de obras'],
}

const blocos = [
  [56,60,'Situação hipotética: Ricardo, engenheiro e proprietário de uma construtora, contratou dez trabalhadores para construir um prédio de três andares. Os itens tratam de segurança e higiene do trabalho na obra.'],
  [66,67,'Bloco: análise de custos e levantamento de quantitativos de obras.'],
  [78,79,'Quadro de aço da edificação: barras de 6,3 mm, 360 m, R$ 20 por barra de 12 m; 8,0 mm, 240 m, R$ 32 por barra; 10,0 mm, 600 m, R$ 45 por barra; 12,5 mm, 480 m, R$ 70 por barra. Considerar acréscimo de 10% nos comprimentos para compensar perdas. Pesos lineares: 0,25; 0,40; 0,63; e 1,00 kg/m, respectivamente.'],
  [80,81,'Composição SINAPI de montagem e desmontagem de forma de viga, com escoramento por pontalete de madeira, pé-direito simples e uma utilização (referência 12/2015). Coeficientes relevantes: tábua de madeira não aparelhada, 0,913 m; ajudante de carpinteiro, 0,455 h; carpinteiro, 2,482 h; fabricação de forma, 1,02 m².'],
  [82,85,'Situação hipotética: em obra pública, a contratada atrasou injustificadamente uma semana um serviço não crítico; o atraso consumiu toda a folga total e a medição ocorreu após a data-base de reajuste.'],
  [88,91,'Bloco: tipos, pré-dimensionamento e aspectos construtivos de barragens hidráulicas.'],
  [92,93,'Bloco: avaliação do potencial hidráulico de aproveitamentos hidrelétricos.'],
  [94,95,'Bloco: condicionantes de projeto de irrigação.'],
  [96,97,'Bloco: canais abertos para transporte de água.'],
  [100,101,'Situação hipotética: durante a execução de adutora de grande vazão, ventosas simples foram substituídas por ventosas de tríplice função. Os itens comparam as funções desses dispositivos.'],
  [102,103,'Situação hipotética: no dimensionamento de coletores de esgoto, adotaram-se diâmetro mínimo de 100 mm e lâmina de água igual a 0,75 do diâmetro para o cálculo da área molhada.'],
  [104,106,'Bloco: adoção de tratamento superficial simples em pavimentação asfáltica.'],
  [107,109,'Bloco: orçamento de obras rodoviárias pelo SICRO e metodologia de custos rodoviários.'],
  [110,111,'Bloco: deformação permanente em pavimentos asfálticos.'],
  [112,116,'Bloco: desempenho de misturas asfálticas e propriedades dos agregados usados em revestimentos.'],
  [117,120,'Situação: impactos da implantação de rodovia sem recuperação ambiental, que podem evoluir para passivo ambiental. Os itens abordam impactos bióticos, socioeconômicos e medidas mitigadoras.'],
]
const corrigidos = {
  55:'Conforme previsão legal, o projeto executivo pode ser desenvolvido concomitantemente com a execução das obras e dos serviços, desde que assim seja autorizado pela administração.',
  68:'O custo unitário básico (CUB) é utilizado nos orçamentos analíticos de obras e serviços de engenharia devido à sua baixa margem de incerteza.',
  75:'Nas instalações elétricas prediais, os barramentos blindados (bus-way) são recomendados nos casos em que a distribuição de energia é feita a pequenas distâncias ou com baixa densidade de carga.',
  77:'No cálculo do custo horário improdutivo de um equipamento, deve ser computada, entre outras coisas, a parcela referente à depreciação.',
  79:'O peso total de ferro a adquirir é superior a 1 tonelada.',
  81:'Na tabela, o coeficiente 0,913 da tábua de madeira não aparelhada representa o consumo total de madeira necessário para a execução do serviço.',
  85:'De acordo com a legislação vigente, a contratada está sujeita a penalidade por atraso de etapas, mesmo que as atividades atrasadas não sejam críticas.',
  97:'A profundidade crítica de um canal depende apenas da sua forma e da vazão da água, e não de sua rugosidade ou declividade.',
  99:'Nas turbinas de reação utilizadas para a geração de energia, a pressão estática permanece constante entre a entrada e a saída do rotor.',
  101:'As características comuns das ventosas simples e de tríplice função incluem a expulsão de ar durante o enchimento da linha.',
  103:'Para maior segurança, é recomendável que o projetista altere o nível de lâmina d’água considerado no projeto e adote a área molhada correspondente ao duto completamente coberto pela água.',
  111:'O creep estático, ensaio adotado para estudar a deformação permanente em misturas asfálticas, pode ser realizado mediante aplicação de cargas de compressão, torção, flexão ou tração.',
  116:'A resistência ao choque e ao desgaste do agregado é uma propriedade relevante para a pavimentação, pois está associada à ação do tráfego.',
}
const dificuldadeAlta = new Set([60,61,63,65,66,69,70,78,79,80,83,85,86,89,90,91,92,93,96,97,98,99,100,101,102,103,107,108,109,110,111,114,117,118,119,120])
const porNumero = new Map()
for (const q of qs) { const n=Number(q.n); const a=porNumero.get(n)||[]; a.push(q); porNumero.set(n,a) }

const decisoes=[]
const mantido=new Map()
for (const q of qs) {
  const n=Number(q.n), [materia,conteudo]=temas[n]||[]
  if (!materia) throw Error(`Sem classificação específica para o item ${n}`)
  const pagina=Number(q.pagina), imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  const bloco=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]
  const decisao={
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,pagina,
    dificuldade:dificuldadeAlta.has(n)?'Difícil':'Média',dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial baseada na densidade normativa, conceitual e de cálculo; não representa taxa estatística de acerto.',
    classificacao_fonte:prova,
    motivo:`DPDF 2020 — Analista de Apoio à Assistência Judiciária, Cargo 8, Engenharia Civil, CEBRASPE; item ${n}. Conferido visualmente na página original e classificado pelo conteúdo específico.`,
    visual:{pagina,imagem,enunciado:corrigidos[n],texto_apoio:bloco,motivo:'Conferência visual individual do caderno oficial; enunciado normalizado e contexto comum separado quando aplicável.'},
  }
  if (!corrigidos[n]) delete decisao.visual.enunciado
  if (!bloco) delete decisao.visual.texto_apoio
  const anteriores=mantido.get(n)
  if (anteriores) {
    decisao.apta_resolucao=false
    decisao.inelegibilidade_motivo=`Registro duplicado do item ${n} no mesmo caderno oficial; ocorrência principal ${anteriores}.`
    decisao.duplicada_de=anteriores
  } else mantido.set(n,q.id)
  decisoes.push(decisao)
}
const duplicatas=decisoes.filter(d=>d.apta_resolucao===false)
if(qs.length!==69||duplicatas.length!==2)throw Error(`Esperados 69 registros e duas duplicatas; recebidos ${qs.length} e ${duplicatas.length}`)

const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'DPDF 2020 — Analista de Apoio à Assistência Judiciária — Cargo 8 — Engenharia Civil',documento_id:doc,registros_revisados:69,questoes_unicas_classificadas:67,duplicatas_desativadas:duplicatas.map(d=>({id:d.id,duplicada_de:d.duplicada_de})),imagens_origem_conferidas:3,contextos_e_tabelas_reconstruidos:15,gabarito_hash_pendente:true,observacao:'As 67 questões únicas foram classificadas e conferidas visualmente no caderno oficial. Corrigidos os registros duplicados dos itens 51 e 55; removidos textos de blocos vizinhos que haviam sido concatenados a enunciados e separados os contextos comuns e tabelas do caderno. O gabarito definitivo oficial foi localizado, mas não vinculado sem cópia binária local e hash; não habilitei correção automática por esta revisão.',fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
