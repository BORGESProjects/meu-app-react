import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpce-servico-social-2020-v80'
const base='tmp/revisao-profissional/revisao-enem-reaplicacao-ppl-2024-v79/acervo-extraido'
const doc='e674e7ec43e1f392'
const prova='https://cdn.cebraspe.org.br/concursos/MP_CE_19_SERVIDOR/arquivos/MATRIZ_520_MPCE008_MATRIZ.PDF'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-mpce-servico-social-2020.json','utf8'))
const temas={
51:['Serviço Social','Fundamentos históricos: influência do pensamento católico na gênese profissional'],
52:['Serviço Social','Fundamentos teórico-metodológicos: positivismo'],
53:['Serviço Social','Gênese do Serviço Social: dignidade humana e doutrina católica'],
54:['Serviço Social','Reconceituação: matrizes e vertentes teórico-metodológicas'],
55:['Serviço Social','Conservadorismo e teorias sociais no Serviço Social'],
56:['Serviço Social','Trabalho profissional: transformações e relações de trabalho'],
57:['Serviço Social','Neoliberalismo, Estado e mediação de conflitos sociais'],
58:['Serviço Social','Atuação socioeducativa no ensino público básico'],
59:['Serviço Social','Campo sociojurídico: origens históricas e instituições'],
60:['Serviço Social','Divisão sociotécnica do trabalho e competências profissionais'],
61:['Serviço Social','Campo sociojurídico e Congresso Brasileiro de Assistentes Sociais'],
63:['Serviço Social','Reconceituação e projeto ético-político profissional'],
64:['Serviço Social','Congresso da Virada: renovação profissional em 1979'],
65:['Serviço Social','Projetos coletivos e dimensão política da profissão'],
66:['Serviço Social','Projeto ético-político e produção de conhecimento'],
67:['Serviço Social','Organização profissional: CFESS, CRESS, ABEPSS e ENESSO'],
68:['Legislação Profissional','Revalidação de diploma estrangeiro e registro profissional'],
69:['Ética Profissional','Atuação como perito ou testemunha e limites da competência profissional'],
70:['Ética Profissional','Código de Ética: pluralismo e aprimoramento intelectual'],
71:['Serviço Social','Formação profissional: diretrizes curriculares e pluralismo'],
72:['Serviço Social','Formação profissional: estágio supervisionado e orientação de campo'],
73:['Serviço Social','Planejamento profissional: elaboração de projeto de trabalho'],
74:['Serviço Social','Planejamento: implantação de planos e projetos'],
75:['Serviço Social','Planejamento e avaliação: acompanhamento, mensuração e controle'],
76:['Serviço Social','Assessoria profissional: atribuições e autonomia técnica'],
77:['Serviço Social','Supervisão profissional e assessoria: diferenças de atribuição'],
78:['Ética Profissional','Código de Ética: liberdade, justiça social e democracia'],
79:['Ética Profissional','Trabalho interdisciplinar e deveres profissionais'],
80:['Ética Profissional','Infrações e apuração de conduta profissional'],
81:['Ética Profissional','Denúncia ética e desagravo público'],
82:['Legislação Profissional','Penalidades previstas na Lei nº 8.662/1993'],
83:['Legislação Profissional','Suspensão do exercício profissional e duração da penalidade'],
84:['Serviço Social','Dimensões do trabalho profissional e condições sócio-históricas'],
85:['Ética Profissional','Entrevista social: informação sobre objetivos e procedimentos'],
86:['Ética Profissional','Parecer social: articulação entre reflexão ética e conhecimento técnico'],
87:['Serviço Social','Estudo social: investigação, fontes de informação e parecer'],
88:['Legislação Profissional','Registro no CRESS e contribuição anual'],
89:['Serviço Social','Supervisão direta de estágio: carga horária e limite de estagiários'],
90:['Legislação Profissional','Atribuições privativas e competências profissionais'],
93:['Serviço Social','Orientação social e defesa de direitos'],
94:['Serviço Social','Pesquisa social: técnicas, metodologia e formalismo'],
95:['Serviço Social','Pesquisa qualitativa: processo em espiral e construção de perguntas'],
96:['Serviço Social','Questão social: pobreza, desigualdade e privação material'],
97:['Serviço Social','Questão social: pobreza e crítica às respostas centradas na expansão do capital'],
98:['Serviço Social','Questão social: classes sociais e contradições do capitalismo'],
99:['Serviço Social','Políticas sociais: redistribuição da riqueza e desigualdade'],
100:['Direitos Humanos','Cidadania, direitos sociais e correlação de forças'],
101:['Serviço Social','Cidadania social e transformação social'],
102:['Direito da Criança e do Adolescente','ECA: comunicação de situações e entrega voluntária para adoção'],
103:['Direito da Criança e do Adolescente','ECA: encaminhamento e procedimentos para entrega legal para adoção'],
104:['Saúde Pública','Atenção à saúde mental no puerpério e assistência psicossocial'],
105:['Direito Penal','Estatuto do Desarmamento: guarda e acesso de criança a arma de fogo'],
106:['Direito da Criança e do Adolescente','ECA: família extensa e perda do poder familiar'],
108:['Direito do Trabalho','Trabalho doméstico: caracterização do vínculo de emprego'],
110:['Direito Previdenciário','Lei nº 8.213/1991: dependentes e presunção de dependência econômica'],
111:['Políticas de Saúde','SUS: organizações sociais, gestão e princípios do sistema'],
113:['Políticas de Saúde','Assessoria em saúde: planejamento e disponibilidade orçamentária'],
114:['Assistência Social','Benefício de Prestação Continuada para pessoa idosa'],
115:['Direito da Mulher','Lei Maria da Penha: violência doméstica e leitura social da situação'],
116:['Direito da Mulher','Lei Maria da Penha: violência patrimonial'],
117:['Direito da Mulher','Lei Maria da Penha: ressarcimento ao SUS dos custos de atendimento'],
}
const apoio=[
[51,55,'Bloco: fundamentos históricos e teórico-metodológicos do Serviço Social brasileiro.'],
[56,62,'Bloco: transformações societárias, condições e relações de trabalho, espaços sócio-ocupacionais e atuação profissional.'],
[63,67,'Bloco: projeto ético-político, projetos coletivos e organização profissional do Serviço Social.'],
[68,72,'Bloco: ética, legislação, formação profissional, diretrizes curriculares e estágio supervisionado.'],
[73,77,'Bloco: planejamento, projeto de trabalho, implantação, controle, assessoria e supervisão profissional.'],
[78,83,'Situação hipotética: Gabriela é assistente social em entidade de assistência social; Diego é estagiário e Vanessa é assistente social. Após Gabriela fazer comentário ofensivo sobre Vanessa e pessoas trans, discute-se a aplicação do Código de Ética e das regras profissionais.'],
[84,87,'Bloco: dimensão técnico-operativa, instrumentos, entrevistas, estudos sociais, pareceres e ética profissional.'],
[88,93,'Situação hipotética: Claudia, assistente social registrada no CRESS e com jornada de 25 horas semanais, trabalha em unidade de internação para adolescentes. Acompanha Heitor, jovem trans de 18 anos. Paula é pedagoga e graduada em Serviço Social, mas ainda não tem registro profissional. Claudia também supervisiona estágio curricular; o caso aborda seleção de estagiários, estudo social, ética, atribuições e respeito à identidade de gênero.'],
[94,95,'Bloco: pesquisa social no Serviço Social.'],
[96,101,'Texto-base atribuído a Maria Carmelita Yazbek, “Classes subalternas e assistência social”, 9ª ed., São Paulo: Cortez, 2009. O trecho descreve manifestações da pobreza e da desigualdade na vida de populações subalternizadas; os itens relacionam o texto à questão social, cidadania e formas de enfrentamento. A página original, com o texto integral e a referência bibliográfica, permanece associada às questões.'],
[102,106,'Situação hipotética: Flávia, de 23 anos, após o parto, manifesta que deseja entregar o filho para adoção. Está desempregada e em extrema pobreza; informa que o pai da criança é agressivo e não tem condições psicossociais para cuidar do bebê. O caso também relata que ele entrega uma arma de fogo ao sobrinho de oito anos.'],
[108,110,'Situação hipotética: contribuintes da Previdência Social procuram orientação. Cleber, 48 anos, casado e empregado de sociedade anônima, é empregador de Amélia, trabalhadora doméstica; Josefa, 51 anos, é contribuinte individual e mora com o esposo, o pai idoso e filhos, incluindo um filho adulto desempregado. Aplicam-se as Leis nº 8.212/1991 e nº 8.213/1991.'],
[111,114,'Situação hipotética: Jaime, assistente social e assessor do secretário estadual de Saúde, atua em uma organização social de saúde. O caso menciona restrição orçamentária, um usuário idoso que ficou incapacitado para trabalhar e depende da renda da neta. Os itens tratam da gestão do SUS, planejamento e acesso a benefícios assistenciais.'],
[115,117,'Situação hipotética: Paula sofre fratura após violência do companheiro Valter e receia represálias; sua irmã Carmem procura a equipe de Serviço Social. Os itens abordam violência doméstica, violência patrimonial, atendimento social e responsabilização pelos custos de atendimento no SUS.'],
]
const limpos={
55:'O conservadorismo pode ser compreendido como uma teoria social para o Serviço Social.',
72:'O estágio supervisionado é uma atividade curricular obrigatória, configurada pela inserção do aluno no espaço socioinstitucional sob supervisão direta do profissional do campo de estágio.',
77:'A supervisão profissional diferencia-se da assessoria pelo seu poder de mando.',
87:'Na realização do estudo social, o profissional deve pautar-se somente pelo que for expressamente falado pelo sujeito, o que representa o conteúdo integrante e verídico do objeto de estudo e serve de base para o parecer social.',
95:'Na pesquisa qualitativa, em geral, pode-se afirmar que ocorre um trabalho em espiral: começa-se com uma pergunta, passa-se a uma resposta, a partir da qual se originam novas interrogações.',
101:'O Serviço Social, ao contribuir para a transformação social, deve aprofundar a noção de cidadania social, que abrange a integralidade do ser humano e a complexidade da sociedade.',
106:'Caso não haja indicação do ex-companheiro de Flávia nem outro representante da família extensa apto a receber a guarda do recém-nascido, a autoridade judiciária competente deverá decretar a extinção do poder familiar.',
110:'Para fins previdenciários, quanto à dependência econômica da família de Josefa, a dependência do genitor é presumida, ao passo que a do cônjuge deve ser comprovada.',
114:'Jaime deverá orientar o Sr. Ângelo quanto ao Benefício de Prestação Continuada a que tem direito, por ser pessoa idosa com mais de 65 anos de idade.',
}
const difíceis=new Set([52,54,57,59,60,61,68,69,70,71,72,77,80,81,82,83,84,86,87,89,90,94,97,99,100,102,103,105,106,107,110,111,113,114,115,116,117])
if(qs.length!==60)throw Error(`Esperados 60 itens pendentes; encontrados ${qs.length}`)
const decisoes=qs.map(q=>{
 const n=Number(q.numero_original),[materia,conteudo]=temas[n]||[]
 if(!materia)throw Error(`Sem classificação para o item ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const texto=apoio.find(([a,b])=>n>=a&&n<=b)?.[2]
 const visual={pagina,imagem,texto_apoio:texto||'',motivo:'Página do caderno oficial conferida visualmente; enunciado normalizado, classificação específica e bloco de contexto separado para evitar mistura entre questões.'}
 if(limpos[n])visual.enunciado=limpos[n]
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,pagina,dificuldade:difíceis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a densidade conceitual, a aplicação de normas e a quantidade de relações necessárias; não representa taxa estatística de acerto.',classificacao_fonte:prova,motivo:`MP/CE 2020 — Analista Ministerial, especialidade Serviço Social, CEBRASPE; item ${n}. Matéria e assunto conferidos na página original do caderno.`,visual}
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'MP/CE 2020 — Analista Ministerial — Serviço Social',documento_id:doc,registros_revisados:60,questoes_unicas_classificadas:60,contextos_reconstruidos:14,limpezas_de_enunciado:Object.keys(limpos).length,imagens_origem_conferidas:60,gabarito_hash_pendente:true,observacao:'Classifiquei individualmente os 60 registros, separei contextos de hipóteses compartilhadas e removi contaminações de blocos seguintes. Reassociei trechos de apoio a grupos pertinentes, preservando a referência bibliográfica visível no caderno. O gabarito definitivo não foi validado em arquivo local com hash; a correção automática permanece desabilitada por esta revisão.',fontes:[prova]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
