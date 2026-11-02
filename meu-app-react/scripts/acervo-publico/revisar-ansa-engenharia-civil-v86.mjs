import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-ansa-engenharia-civil-v86'
const base='tmp/revisao-profissional/revisao-trf6-servico-social-v85/acervo-extraido'
const doc='e064ab0cb04a13c6'
const prova='https://cdn.cebraspe.org.br/concursos/ANSA_26/arquivos/46753082A4D3843B6A66D6311255C71C279C3A05BEAC537A2CF72C92F3AC4C0B.pdf'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-ansa-engenharia-civil.json','utf8'))
const temas={
33:['Engenharia Civil','Fundações superficiais: dimensionamento de sapatas e estados limites'],
34:['Engenharia Civil','Fundações superficiais: capacidade de carga em solos coesivos saturados'],
35:['Engenharia Civil','Fundações superficiais: sapatas associadas e proximidade entre pilares'],
36:['Engenharia Civil','Fundações profundas: interpretação e correção do índice SPT em estacas'],
37:['Engenharia Civil','Fundações profundas: execução e concretagem de estacas hélice contínua monitorada'],
38:['Engenharia Civil','Fundações profundas: controle de concretagem de estacas com tremonha'],
39:['Engenharia Civil','Fundações profundas: dimensionamento da armadura longitudinal de estacas escavadas'],
40:['Engenharia Civil','Fundações profundas: nega e capacidade de carga de estacas pré-moldadas'],
41:['Engenharia Civil','Materiais de construção: argamassas industrializadas e uniformidade'],
42:['Engenharia Civil','Materiais de construção: granulometria de agregados miúdos para argamassas'],
43:['Engenharia Civil','Tecnologia do concreto: relação água-cimento e resistência mecânica'],
44:['Engenharia Civil','Materiais de construção: finura, hidratação e resistência do cimento Portland'],
45:['Engenharia Civil','Materiais de construção: cal hidratada e propriedades de argamassas'],
46:['Engenharia Civil','Revestimentos e pintura: preparação e selagem de substratos'],
47:['Engenharia Civil','Revestimentos e pintura: cura de reboco antes da aplicação de tinta'],
48:['Engenharia Civil','Revestimentos: aplicação de gesso e preparo de superfícies'],
49:['Engenharia Civil','Instalações prediais: ventilação de redes de esgoto sanitário'],
59:['Engenharia Civil','Controle tecnológico do concreto: ensaio de abatimento (slump test)'],
60:['Engenharia Civil','Mecânica dos solos: compactação e influência do teor de umidade'],
61:['Engenharia Civil','Mecânica dos solos: limites de Atterberg e propriedades de solos argilosos'],
62:['Engenharia Civil','Mecânica dos solos: densidade in situ e grau de compactação'],
63:['Engenharia Civil','Mecânica dos solos: ensaio Proctor, umidade ótima e densidade seca'],
64:['Engenharia Civil','Drenagem profunda: interceptação de água infiltrada e estabilidade de taludes'],
65:['Engenharia Civil','Drenagem urbana: sarjetas e condução do escoamento superficial'],
66:['Engenharia Civil','Drenagem urbana: captação e condução de águas pluviais'],
67:['Engenharia Civil','Terraplenagem: execução e controle da compactação de aterros'],
68:['Engenharia Civil','Mecânica dos solos: matéria orgânica e adequação de solos para aterros'],
69:['Engenharia Civil','Terraplenagem: controle geométrico e volumétrico de plataformas'],
70:['Engenharia Civil','Projeto viário urbano: integração entre arruamento e drenagem'],
71:['Engenharia Civil','Projeto viário urbano: interseções e eficiência da circulação'],
72:['Engenharia Civil','Projeto geométrico de vias: dimensionamento da largura em função do tráfego'],
73:['Engenharia Civil','Pavimentação: subleito e necessidade de camada de sub-base'],
74:['Engenharia Civil','Pavimentação: função e desempenho estrutural do pavimento'],
75:['Engenharia Civil','Pavimentação flexível: revestimento asfáltico e distribuição de cargas'],
76:['Engenharia Civil','Controle tecnológico do concreto: resultados de resistência e conformidade de lotes'],
77:['Engenharia Civil','Controle tecnológico do concreto: moldagem e cura de corpos de prova'],
78:['Engenharia Civil','Controle tecnológico do concreto: ensaios de aceitação em obra e controle estatístico'],
79:['Engenharia Civil','Controle tecnológico do concreto: resistência especificada e tratamento de resultados não conformes'],
80:['Engenharia Civil','Materiais de construção: controle da água de amassamento do concreto'],
81:['Engenharia Civil','Materiais de construção: qualidade, limpeza e armazenamento de agregados'],
82:['Engenharia Civil','Materiais de construção: armazenamento protegido de cimento ensacado'],
83:['Engenharia Civil','Materiais de construção: recebimento e armazenamento de cimento Portland'],
84:['Engenharia Civil','Estruturas de concreto armado: emendas por traspasse e ancoragem de armaduras'],
85:['Engenharia Civil','Estruturas de concreto armado: cobrimento nominal e espaçadores'],
86:['Engenharia Civil','Estruturas de concreto armado: posicionamento da armadura e cobrimento em pilares'],
87:['Engenharia Civil','Estruturas de concreto armado: emendas por solda e métodos alternativos'],
88:['Engenharia Civil','Execução de estruturas de concreto: desmoldantes e preparo de fôrmas'],
89:['Engenharia Civil','Concretagem: adensamento com vibrador de imersão e prevenção de segregação'],
90:['Engenharia Civil','Concretagem: lançamento próximo à posição final e continuidade'],
91:['Engenharia Civil','Fôrmas e escoramentos: inspeção, alinhamento, travamento e liberação para concretagem'],
92:['Informática','AutoCAD: comando DIST, unidades e interpretação de escala em desenhos'],
93:['Informática','AutoCAD: comando MIRROR e simetria de elementos no desenho'],
94:['Informática','AutoCAD: hachuras, leitura de detalhes e representação de materiais'],
95:['Informática','AutoCAD: layouts, viewports e escalas de impressão'],
96:['Informática','AutoCAD: comando ZOOM e diferença entre visualização e dimensões reais'],
97:['Informática','AutoCAD: OSNAP e precisão de captura de pontos de desenho'],
98:['Informática','AutoCAD: criação e atualização de blocos reutilizáveis'],
99:['Informática','AutoCAD: escalas distintas em viewports do paper space'],
100:['Informática','AutoCAD: organização de layers e controle de impressão por layout'],
}
const blocos=[
[33,35,'Contexto: projeto de fundações superficiais e dimensionamento de sapatas.'],
[36,40,'Contexto: projeto e execução de fundações profundas, sondagem e estacas.'],
[41,45,'Contexto: materiais empregados em obras de construção civil.'],
[46,48,'Contexto: boas práticas de pintura e aplicação de revestimento de gesso.'],
[49,49,'Contexto: projetos de instalações prediais de esgoto sanitário.'],
[59,59,'Contexto: controle tecnológico do concreto e verificação da consistência do concreto fresco.'],
[60,63,'Contexto: controle tecnológico de solos e compactação de aterros em obras de engenharia civil.'],
[64,66,'Contexto: terraplenagem e sistemas de drenagem em obras de engenharia civil.'],
[67,69,'Contexto: execução e controle geométrico de aterros e movimentação de terra.'],
[70,72,'Contexto: planejamento geométrico e implantação de vias em arruamentos urbanos.'],
[73,75,'Contexto: projetos e execução de pavimentação em obras de engenharia civil.'],
[76,79,'Contexto: obra pública em concreto armado com concreto usinado; controle tecnológico, fiscalização, corpos de prova e resistência especificada.'],
[80,83,'Contexto: obra pública com central de concreto no canteiro; cimento, agregados e água de amassamento.'],
[84,87,'Contexto: montagem de armaduras de pilares e vigas segundo o projeto estrutural e normas técnicas.'],
[88,91,'Contexto: execução de lajes e vigas de concreto armado com fôrmas de madeira e escoramentos metálicos; lançamento e adensamento do concreto.'],
[92,100,'Contexto: fiscal de obras públicas usa AutoCAD Desktop para conferir projetos, editar plantas, trabalhar com layers e viewports e gerar pranchas em PDF.'],
]
const ids=new Set(),decisoes=[]
if(qs.length!==59)throw Error(`Esperados 59 itens pendentes; encontrados ${qs.length}`)
for(const q of qs){const n=Number(q.numero_original),dados=temas[n];if(!dados)throw Error(`Questão ${n} sem tema`);if(ids.has(q.id))throw Error(`ID duplicado ${q.id}`);ids.add(q.id);const [materia,conteudo]=dados,pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]||'';decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,dificuldade:['33','34','36','37','38','39','40','53','54','60','61','62','63','67','68','69','72','76','77','78','79','84','85','86','87','89','91','92','93','94','95','98','99','100'].includes(String(n))?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade de projeto, execução, normas técnicas e interpretação; não corresponde a estatística oficial de acerto.',classificacao_fonte:prova,motivo:`Araucária Nitrogenados S.A. (ANSA) 2026 — CEBRASPE; item ${n}. Ano conferido no cabeçalho do caderno, tópico conferido no enunciado e no bloco da prova.`,visual:{pagina,imagem,texto_apoio,motivo:'Página oficial do caderno conferida visualmente; fórmulas, desenhos, dados e contexto permanecem acessíveis pela imagem vinculada.'}})}
const relatorio=await aplicarRevisoesIndividuais({nome,base,decisoes})
const detalhe={...relatorio,banca:'CEBRASPE',concurso:'Araucária Nitrogenados S.A. (ANSA) 2026 — Engenharia Civil',ano:2026,documento:'46753082A4D3843B6A66D6311255C71C279C3A05BEAC537A2CF72C92F3AC4C0B.pdf',fonte:prova,paginas_origem_conferidas:[1,2,3,4],observacao:'Reclassifiquei 59 itens que estavam genéricos em conteúdos de fundações, geotecnia, materiais, revestimentos, instalações, drenagem, terraplenagem, vias, pavimentação, concreto armado e AutoCAD. A capa identifica o caderno como ANSA — Edital 2026; ano corrigido para 2026. Os contextos de obra e as páginas originais foram mantidos ligados a cada questão. Gabaritos existentes foram preservados; dificuldade é estimada editorialmente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(detalhe,null,2));console.log(JSON.stringify(detalhe))
