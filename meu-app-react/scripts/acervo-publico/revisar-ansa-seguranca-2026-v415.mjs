import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-ansa-seguranca-trabalho-2026-v415'
const base='tmp/revisao-profissional/revisao-embrapa-2025-biologia-sintetica-omics-pendencias-v414/acervo-extraido'
const documento='e0a688e08da767d3'
const fonte='https://www.cebraspe.org.br/concursos/ansa_26'
const provaSecundaria='https://arquivos.qconcursos.com/prova/arquivo_prova/151981/cespe-cebraspe-2026-ansa-enfase-27-seguranca-do-trabalho-prova.pdf'
const arquivo=`tmp/registros-documento-${documento}.json`
const registros=JSON.parse(await fs.readFile(arquivo,'utf8'))

const blocos=[
  [31,34,'Segurança e Saúde no Trabalho','NR 12: segurança em máquinas e equipamentos'],
  [35,39,'Segurança e Saúde no Trabalho','Análise de riscos: inflamáveis, trabalho em altura e espaços confinados'],
  [40,43,'Segurança e Saúde no Trabalho','Higiene ocupacional: FDS, ruído, vapores e proteção respiratória'],
  [44,47,'Segurança e Saúde no Trabalho','EPI: responsabilidades, seleção, calor e proteção contra quedas'],
  [48,51,'Segurança e Saúde no Trabalho','Prevenção e proteção contra incêndios'],
  [52,55,'Segurança e Saúde no Trabalho','Política Nacional de Segurança e Saúde no Trabalho (PNSST)'],
  [56,58,'Segurança e Saúde no Trabalho','Constituição, legislação trabalhista e normas regulamentadoras de SST'],
  [59,60,'Direito do Trabalho','Convenções da Organização Internacional do Trabalho (OIT)'],
  [61,61,'Segurança e Saúde no Trabalho','Inspeção das condições ambientais e de segurança no trabalho segundo a OIT'],
  [62,65,'Direito Previdenciário','Acidente de trabalho, benefícios e perfil profissiográfico previdenciário (PPP)'],
  [66,71,'Direito do Trabalho','Conceito legal de acidente de trabalho, CAT, nexo técnico e estabilidade'],
  [72,75,'Segurança e Saúde no Trabalho','CIPA, APR, HAZOP e risco grave e iminente'],
  [76,78,'Legislação Federal','Regulação e segurança operacional na indústria de petróleo (ANP)'],
  [79,82,'Segurança e Saúde no Trabalho','SESMT, capacitação e hierarquia das medidas de prevenção'],
  [83,87,'Segurança e Saúde no Trabalho','Saúde ocupacional, primeiros socorros e biossegurança'],
  [88,89,'Segurança e Saúde no Trabalho','Ergonomia e conforto térmico'],
  [90,93,'Direito Ambiental','P2R2, Plano de Emergência Individual e Resolução CONAMA nº 398/2008'],
  [94,96,'Legislação Federal','Resposta a acidentes com hidrocarbonetos e normas da ANP'],
  [97,100,'Direito Ambiental','Plano Nacional de Contingência para incidentes de poluição por óleo (PNC)'],
]
const subtemas={
31:'NR 12: dispositivos de segurança em guindastes para elevação de pessoas',
32:'NR 12: comandos bimanuais e proteção de prensas',
33:'NR 13: inspeção periódica de caldeiras',
34:'NR 10: análise de riscos em instalações elétricas energizadas',
35:'NR 20: análise de riscos e programa de gerenciamento de riscos (PGR)',
36:'NR 20: classificação de líquidos inflamáveis',
37:'NR 20: atividades abrangidas e etapas do ciclo de vida',
38:'NR 35: análise de riscos e sistemas de ancoragem',
39:'NR 33: trabalho isolado e vigia em espaço confinado',
40:'FDS: seção de outras informações',
41:'NR 15: exposição ocupacional ao ruído',
42:'Higiene ocupacional: vapores e fases físicas',
43:'Programa de Proteção Respiratória (PPR) e aptidão médica',
44:'NR 6: deveres de higienização e manutenção de EPI',
45:'Seleção de luvas de proteção contra agentes químicos',
46:'Exposição ocupacional ao calor: cálculo do IBUTG',
47:'NR 35: sistemas de proteção individual contra quedas',
48:'Extintores de CO₂ e incêndios em equipamentos energizados',
49:'Composição da brigada de incêndio',
50:'Classes de incêndio e uso de extintores de água',
51:'Instalação de extintores conforme risco da atividade',
52:'PNSST: execução contínua das ações preventivas',
53:'PNSST: vigilância em saúde',
54:'PNSST: ações educativas e atuação governamental',
55:'PNSST: objetivo de redução dos agravos relacionados ao trabalho',
56:'Fundamentos constitucionais e regulamentares da SST',
57:'Infrações e penalidades por descumprimento de NRs',
58:'Hierarquia normativa entre CLT e normas regulamentadoras',
59:'Ratificação e obrigatoriedade das convenções da OIT',
60:'Convenção da OIT sobre trabalhadores indígenas e igualdade de tratamento',
61:'OIT: avaliação periódica do ambiente de trabalho',
62:'PPP e exames médicos ocupacionais',
63:'Estabilidade provisória após acidente de trabalho',
64:'Carência para benefício por incapacidade decorrente de acidente de trabalho',
65:'PPP e laudo técnico das condições ambientais do trabalho (LTCAT)',
66:'Acidente de trajeto em viagem para capacitação patrocinada pela empresa',
67:'Comunicação de acidente de trabalho (CAT) sem afastamento',
68:'Doença profissional e doença do trabalho',
69:'Acidente de trabalho causado por terceiro ou colega',
70:'Nexo técnico epidemiológico previdenciário (NTEP) e contestação',
71:'Acidente de trabalho por caso fortuito ou força maior',
72:'CIPA, SIPAT e prevenção de assédio e violência no trabalho',
73:'Análise preliminar de risco (APR)',
74:'Estudo de Perigos e Operabilidade (HAZOP)',
75:'Interrupção de atividades diante de risco grave e iminente',
76:'Competências regulatórias da ANP em instalações de petróleo e gás',
77:'Gestão de segurança operacional em refinaria e fiscalização da ANP',
78:'Responsabilidade pela elaboração do sistema de gestão de segurança operacional',
79:'Dimensionamento de SESMT por grau de risco',
80:'NR 12: treinamento eventual após afastamento do operador',
81:'Dimensionamento de engenheiros e médicos do SESMT',
82:'Hierarquia de medidas de prevenção: proteção coletiva, administrativa e EPI',
83:'Primeiros socorros: parada respiratória e desfibrilador externo automático',
84:'Biossegurança e prevenção de exposição a patógenos sanguíneos',
85:'PCMSO: vigilância ativa e passiva da saúde ocupacional',
86:'NR 7: guarda de prontuário médico ocupacional',
87:'Triagem de múltiplas vítimas e classificação por cores',
88:'Ergonomia, fortalecimento muscular e capacidade funcional',
89:'Ergonomia: temperatura nos ambientes de trabalho',
90:'P2R2: composição da Comissão Nacional',
91:'Plano de Emergência Individual: treinamento para resposta a vazamento de óleo',
92:'Plano de Emergência Individual em instalações portuárias',
93:'P2R2: competências da comissão nacional, estadual e distrital',
94:'Sistema de Comando de Incidentes: comando unificado',
95:'ANP: comunicação e acompanhamento de incidentes operacionais',
96:'ANP: notificação e respostas mandatórias a acidentes',
97:'PNC: abrangência territorial sobre águas sob jurisdição nacional',
98:'PNC: ativação da Carta Internacional de Espaço e Grandes Desastres',
99:'PNC: composição da Rede de Atuação Integrada',
100:'PNC: classificação de ocorrência com potencial de descarga de óleo',
}
const dificuldadeAlta=new Set([33,35,36,41,46,57,58,60,62,63,65,67,69,70,76,77,78,81,86,90,92,93,95,96,97,98,99])
const dificuldadeBaixa=new Set([40,42,48,49,50,51,53,55,56,59,64,68,83,87,88,94,100])
const contextos=[
  [31,34,'Julgue os itens a seguir, acerca de prevenção e controle de riscos em máquinas, equipamentos e instalações.'],
  [35,39,'Julgue os itens a seguir, com relação à análise de riscos relacionados a trabalhos a quente, trabalho com líquidos inflamáveis e trabalho em espaços confinados.'],
  [40,43,'Julgue os itens a seguir, no que diz respeito à higiene ocupacional.'],
  [44,47,'Julgue os itens a seguir, no que diz respeito a equipamentos de proteção individual (EPI) e à exposição ao calor no trabalho.'],
  [48,51,'Em relação à proteção contra incêndio, julgue os itens a seguir.'],
  [52,55,'Com base no Decreto nº 7.602/2011, julgue os seguintes itens, acerca da Política Nacional de Segurança e Saúde no Trabalho (PNSST).'],
  [56,58,'Acerca do disposto na legislação e nas normas brasileiras, bem como na Constituição Federal de 1988, acerca de segurança e saúde no trabalho, julgue os itens seguintes.'],
  [59,61,'Julgue os itens subsequentes, a respeito das convenções da Organização Internacional do Trabalho (OIT).'],
  [62,65,'No que se refere aos benefícios decorrentes de acidentes de trabalho e ao perfil profissiográfico previdenciário, julgue os itens a seguir.'],
  [66,71,'A respeito do conceito técnico e legal de acidente de trabalho, julgue os itens a seguir.'],
  [72,75,'Com relação às técnicas e aos procedimentos para evitar acidentes de trabalho, julgue os itens que se seguem.'],
  [76,78,'No que se refere às Resoluções ANP nº 43/2007 e ANP nº 5/2014, que versam sobre segurança operacional na indústria petrolífera, julgue os itens subsequentes.'],
  [79,82,'No que concerne ao SESMT e ao gerenciamento de riscos ocupacionais, julgue os itens a seguir.'],
  [83,87,'Acerca de ações de saúde no contexto da segurança do trabalho, empregando como referência documentos validados por autoridades de saúde e do trabalho, julgue os itens seguintes.'],
  [88,89,'Julgue os itens a seguir, relativos à ergonomia em ambientes de trabalho.'],
  [90,93,'Acerca do Plano Nacional de Prevenção, Preparação e Resposta Rápida a Emergências Ambientais com Produtos Químicos Perigosos (P2R2) e da Resolução CONAMA nº 398/2008, julgue os itens que se seguem.'],
  [94,96,'Considerando os padrões estabelecidos pela Agência Nacional do Petróleo, Gás Natural e Biocombustíveis (ANP), julgue os itens subsequentes acerca das respostas a acidentes com hidrocarbonetos.'],
  [97,100,'Julgue os itens que se seguem, relativos ao Plano Nacional de Contingência (PNC), definido pelo Decreto Federal nº 10.950/2022.'],
]
const duplicatas=new Map([
  ['extr-dea93bb96d2f5c59ba99','extr-af484d290dfabbab85ba'],
  ['extr-a8c2f1ac55be9b18b065','extr-4567079d16a4b2a23c55'],
  ['extr-aa03dfd69821482ba8c7','extr-d86132f4421c00c26d01'],
  ['extr-ea6c5444e37cac46236f','extr-358febdd93f99d32a81d'],
  ['extr-dfa0cd0fd9f0d3ad98f9','extr-d9df2c76e70005e758d9'],
  ['extr-8e30c7af22afc6b80d14','extr-471991f300a0f9f40384'],
  ['extr-d669518ac63d545d95e5','extr-16b232a07b7fe6ef45bb'],
  ['extr-f766c4176661e9d40490','extr-5563933e755edd0688cf'],
])
const limpar={
  33:'A inspeção de segurança periódica de caldeiras de categoria A deve ser realizada obrigatoriamente a cada 12 meses, independentemente da existência do sistema de proteção de integridade estrutural.',
  34:'A análise preliminar de risco é obrigatória em intervenções em instalações elétricas energizadas, de modo a identificar medidas de controle antes da execução.',
  39:'É permitida a presença de trabalhador em espaço confinado, para atuar de forma isolada, quando houver monitoramento eletrônico contínuo externo, dispensada a presença de vigia.',
  42:'Vapores são a fase gasosa de substâncias que existem principalmente na fase líquida ou sólida sob condições normais.',
  48:'Extintores de CO₂ são contraindicados para a extinção de incêndios em ambientes energizados.',
  50:'Extintores de água são indicados para incêndios da classe B.',
  60:'Conforme convenção da OIT, os governos dos países-membros devem fazer o que estiver ao seu alcance para evitar qualquer discriminação entre os trabalhadores pertencentes aos povos indígenas e os demais trabalhadores, especialmente quanto à assistência médica e social, segurança e higiene no trabalho, benefícios da seguridade social e demais benefícios derivados do emprego.',
  67:'Considere que um trabalhador tenha sofrido uma leve entorse no pé no início de suas atividades laborais e que, por isso, tenha sido atendido pelo médico do trabalho, que apenas lhe prescreveu um medicamento e o liberou para retornar ao trabalho em seguida. Nesse caso, como não houve incapacidade laboral, não há necessidade de comunicação de acidente de trabalho ao INSS.',
  70:'Uma vez constatado o nexo técnico epidemiológico entre o trabalho e o agravo à saúde pelo perito médico do INSS, a empresa fica impossibilitada de requerer sua não aplicação.',
  76:'Compete à ANP estabelecer e fiscalizar os requisitos técnicos, econômicos e jurídicos a serem atendidos pelos concessionários nas instalações de perfuração e de produção de petróleo e de gás natural, e as exigências de projeto quanto à proteção ambiental e à segurança industrial e populacional.',
  77:'Na gestão de segurança operacional, a empresa autorizada a exercer a atividade de refino de petróleo deverá prover acesso irrestrito e imediato da ANP à refinaria para fins de levantamento de informações e de apuração de responsabilidades sobre incidentes operacionais ocorridos nas instalações, com a devida interrupção das operações.',
  78:'É responsabilidade da ANP determinar que o operador de uma instalação industrial de petróleo disponha do sistema de gestão de segurança operacional elaborado por ela.',
  80:'O operador de máquinas que ficar afastado de suas atividades por oito meses deverá ser submetido a um treinamento do tipo eventual quando retornar.',
  82:'Se comprovada a inviabilidade técnica da adoção de medidas de proteção coletiva dos riscos químicos e físicos de uma refinaria de petróleo, deverão ser adotadas, nesta ordem hierárquica, medidas de caráter administrativo ou de organização do trabalho e utilização de equipamento de proteção individual (EPI).',
  84:'Para a prevenção da exposição a agentes patógenos de transmissão sanguínea, precauções universais prescrevem o bloqueio do contato direto com fluidos orgânicos como saliva, lágrima, suor, urina e líquido amniótico.',
  86:'O prontuário médico individual de empregado deve ser mantido pela organização por, no mínimo, vinte anos após o seu desligamento, independentemente do grau e do tipo de risco ao qual aquele estivesse exposto.',
  87:'Em situações de triagem de múltiplas vítimas, é recomendável o uso de quatro classificações associadas a cores distintas pelo Serviço de Atendimento Móvel de Urgência.',
  90:'O Ministério da Ciência, Tecnologia e Inovação está expressamente listado no Decreto Federal nº 5.098/2004 como membro componente da Comissão Nacional do P2R2, por meio de seu representante.',
  91:'Um Plano de Emergência Individual, seja em seu formato padrão, seja simplificado, deve prever programa de treinamento de pessoal em resposta a incidentes de poluição por óleo.',
  92:'Instalações portuárias públicas de pequeno porte, mesmo que abasteçam embarcações em seus cais, estão dispensadas de elaborar seu Plano de Emergência Individual.',
  93:'Compete à Comissão Nacional do P2R2 (CN-P2R2) e às Comissões Estaduais e Distrital (CE-P2R2 e CD-P2R2) formular e supervisionar a execução do P2R2.',
  98:'Eventual ativação do International Charter Space and Major Disasters deve ser feita pelo Ministério das Relações Exteriores.',
}

const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]
const decisaoPorId=new Map()
for(const q of registros){
  const n=Number(q.numero)
  const bloco=blocos.find(([a,b])=>n>=a&&n<=b)
  if(!bloco)throw new Error(`Sem classificação para o item ${n}`)
  const duplicadaDe=duplicatas.get(q.id)
  let materia=bloco[2],conteudo=subtemas[n]||bloco[3]
  if(n===59||n===60)materia='Direito do Trabalho'
  if(n===61)materia='Segurança e Saúde no Trabalho'
  if(n>=62&&n<=65)materia='Direito Previdenciário'
  if(n>=66&&n<=71)materia='Direito do Trabalho'
  if(n>=90&&n<=93)materia='Direito Ambiental'
  if(n>=94&&n<=96)materia='Legislação Federal'
  if(n>=97)materia='Direito Ambiental'
  const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
  const p={
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,
    concurso:'ANSA 2026 — Ênfase 27: Segurança do Trabalho',banca:'CEBRASPE',organizadora:'CEBRASPE',
    aplicacao:'ANSA — Processo Seletivo Público 2026 — Ênfase 27: Segurança do Trabalho — 26/04/2026',
    cargo:'Técnico de Segurança do Trabalho',numero_original:n,numero:n,pagina:q.pagina,
    opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:null,
    dificuldade:dificuldadeAlta.has(n)?'Difícil':dificuldadeBaixa.has(n)?'Fácil':'Média',
    dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial, não publicada pela banca; considera densidade normativa, número de referências e sutileza conceitual do item.',
    classificacao_fonte:fonte,
    motivo:`Caderno ANSA 2026, Ênfase 27, item ${n}: conferência visual da página ${q.pagina} e classificação pelo enunciado e comando do bloco. A identificação de banca, aplicação, cargo, data e quantitativo segue a publicação oficial do Cebraspe.`,
    visual:{pagina:q.pagina,imagem,texto_apoio:contexto(n),motivo:`Página ${q.pagina} conferida visualmente no caderno objetivo da ANSA; item ${n} associado ao comando correto.`},
    apta_resolucao:!duplicadaDe,
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao'],
  }
  if(limpar[n]&&!duplicadaDe)p.enunciado=limpar[n]
  if(duplicadaDe){p.inelegibilidade_motivo='registro_duplicado';p.duplicada_de=duplicadaDe}
  decisaoPorId.set(q.id,p)
}
if(registros.length!==78||new Set(registros.map(q=>q.numero)).size!==70||decisaoPorId.size!==78)throw new Error('O lote não corresponde aos 78 registros e 70 itens únicos esperados.')
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify([...decisaoPorId.values()],null,2))
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:[...decisaoPorId.values()]})
console.log(JSON.stringify({ ...report, itens_unicos:70, duplicatas_detectadas:duplicatas.size, prova_publicada_por_cebraspe:true, referencia_prova_secundaria:provaSecundaria, gabarito_definitivo_listado_pelo_cebraspe:true, gabarito_vinculado:false, respostas_automaticas:'não habilitadas até vinculação verificável do arquivo definitivo' }))
