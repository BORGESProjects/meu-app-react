import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tjpa-jornalismo-v78'
const base='tmp/revisao-profissional/revisao-dpdf-engenharia-civil-v77/acervo-extraido'
const doc='cf9984b0ec578a9d'
const prova='https://cdn.cebraspe.org.br/concursos/TJ_PA_25_SERVIDOR/arquivos/CE33335C31890FFF003B611D990EF14136BB79660D76207992ABB22195616700.pdf'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-tjpa-adm-2025.json','utf8')).filter(q=>q.numero_original>=59)
const temas={
59:['Direito Administrativo','Lei de Acesso à Informação: âmbito de aplicação e entes federativos'],
60:['Direito Digital','Lei Geral de Proteção de Dados: âmbito de aplicação e tratamento de dados'],
61:['Direito Constitucional','Direito de acesso à informação pública e Constituição Federal'],
62:['Comunicação Social','Comunicação organizacional: canais, públicos e ferramentas'],
63:['Comunicação Social','Comunicação interna: estrutura, cultura e competências'],
64:['Comunicação Social','Assessoria de comunicação: planejamento, execução e avaliação'],
65:['Comunicação Social','Comunicação de crise: composição e atuação de equipes'],
66:['Comunicação Social','Assessoria de imprensa: acompanhamento de fontes e entrevistas'],
67:['Comunicação Social','Assessoria de imprensa: clipping e monitoramento de mídia'],
68:['Comunicação Social','Assessoria de imprensa: mailing e preparação para entrevistas'],
69:['Comunicação Social','Assessoria de imprensa: releases em meios digitais'],
70:['Comunicação Social','Assessoria de comunicação: mediação entre organização e imprensa'],
71:['Comunicação Social','Assessoria de imprensa: sugestão de pauta e release'],
72:['Comunicação Social','Jornalismo institucional: artigos e conteúdo opinativo'],
73:['Comunicação Social','Assessoria de imprensa: conceito e finalidade do release'],
74:['Comunicação Social','Relacionamento com a imprensa e atendimento a jornalistas'],
75:['Comunicação Social','Comunicação organizacional: gestão de crises'],
76:['Comunicação Social','Jornalismo institucional: critérios de noticiabilidade'],
77:['Comunicação Social','Comunicação interna e endomarketing'],
79:['Comunicação Social','Teorias da comunicação: gatekeeping e jornalismo institucional'],
80:['Comunicação Social','Teorias da comunicação: agenda setting'],
81:['Comunicação Social','Teorias da comunicação: espiral do silêncio'],
82:['Comunicação Social','Teorias do jornalismo: newsmaking'],
83:['Comunicação Social','Redação jornalística: clareza e adequação da linguagem'],
84:['Comunicação Social','Jornalismo: critérios de noticiabilidade'],
85:['Comunicação Social','Redação jornalística: pirâmide invertida'],
86:['Comunicação Social','Apuração jornalística digital: verificação de fontes'],
87:['Comunicação Social','Radiojornalismo: linguagem e apuração sonora'],
88:['Comunicação Social','Telejornalismo: imagens, dados e construção de sentido'],
89:['Comunicação Social','Radiojornalismo: edição de áudio e ruídos de fundo'],
90:['Comunicação Social','Telejornalismo: identificação de imagens de arquivo'],
91:['Comunicação Social','Edição jornalística: revisão gramatical e editorial'],
92:['Comunicação Social','Fotojornalismo: técnica, narrativa e ética'],
93:['Comunicação Social','Telejornalismo: linguagem e texto para locução'],
94:['Comunicação Social','Adaptação de conteúdo radiofônico para televisão'],
95:['Comunicação Social','Jornalismo digital: podcasts, videocasts e ética profissional'],
96:['Comunicação Social','Comunicação digital: redes sociais e mídias sociais'],
97:['Comunicação Social','Cultura digital: tecnofobia e perspectivas sobre tecnologia'],
98:['Comunicação Social','Jornalismo online: convergência e multimidialidade'],
99:['Comunicação Social','Jornalismo online: infografia multimídia'],
100:['Comunicação Social','Jornalismo online: hipertexto e organização da notícia'],
101:['Comunicação Social','Jornalismo imersivo: reportagem em 360 graus'],
102:['Comunicação Social','Jornalismo online: formato longform'],
103:['Comunicação Social','Jornalismo digital: interatividade seletiva'],
104:['Comunicação Social','Jornalismo digital: interatividade comunicativa'],
105:['Comunicação Social','Jornalismo digital: personalização de conteúdo'],
106:['Comunicação Social','Jornalismo digital: mercados de nicho e segmentação de público'],
107:['Comunicação Social','Ética e desinformação: conceito de fake news'],
108:['Comunicação Social','Verificação de fatos: fact-checking e apuração jornalística'],
109:['Comunicação Social','Comunicação do Poder Judiciário: Sistema de Comunicação do Judiciário'],
110:['Comunicação Social','Comunicação pública do Judiciário: transparência e linguagem acessível'],
111:['Comunicação Social','Comunicação judiciária: identidade visual e símbolos institucionais'],
112:['Comunicação Social','Inteligência artificial no jornalismo: produção e distribuição de conteúdo'],
113:['Comunicação Social','Inteligência artificial: algoritmos e curadoria em redes sociais'],
114:['Comunicação Social','Inteligência artificial: impactos na produção de conteúdo e desigualdade'],
115:['Comunicação Social','Inteligência artificial: automação e expectativas no jornalismo'],
116:['Comunicação Social','Comunicação do Judiciário: governança e competências do comitê'],
117:['Comunicação Social','Comunicação do Judiciário: atribuições e organização do comitê'],
118:['Comunicação Social','Linguagem simples no Judiciário: eixos do pacto nacional'],
119:['Comunicação Social','Linguagem simples no Judiciário: brevidade e capacitação'],
120:['Comunicação Social','Linguagem simples: clareza sem eliminar terminologia técnica necessária'],
}
const blocos=[
[59,61,'Bloco: Lei de Acesso à Informação (Lei nº 12.527/2011), Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e direito constitucional de acesso a informações públicas.'],
[62,68,'Bloco: fundamentos e finalidades da comunicação nas organizações, atuação da assessoria de comunicação, processos internos e instrumentos de relacionamento com a imprensa.'],
[69,75,'Bloco: papel do assessor de comunicação, sugestões de pauta, releases e artigos, atendimento à imprensa e comunicação de crise.'],
[76,78,'Bloco: jornalismo institucional, comunicação organizacional e comunicação interna.'],
[79,85,'Bloco: teorias da comunicação, fundamentos do jornalismo, critérios de noticiabilidade e redação jornalística.'],
[86,89,'Bloco: prática jornalística, apuração, produção da notícia e meios sonoros e audiovisuais.'],
[90,95,'Bloco: uso de imagens, edição e técnicas de produção no jornalismo.'],
[96,97,'Bloco: comunicação digital e mídias sociais.'],
[98,104,'Bloco: formatos jornalísticos e interatividade na Web.'],
[105,108,'Bloco: jornalismo digital, personalização, desinformação e checagem de fatos.'],
[109,111,'Referência do bloco: Resolução CNJ nº 85/2009, sobre comunicação social no âmbito do Poder Judiciário.'],
[112,115,'Bloco: inteligência artificial, automação e produção de conteúdo jornalístico.'],
[116,120,'Referências do bloco: Pacto Nacional do Judiciário pela Linguagem Simples e Portaria CNJ nº 198/2019, que institui o Comitê de Comunicação Social do Poder Judiciário.'],
]
const limpos={
75:'Em se tratando de comunicação organizacional em situações de crise, deve-se evitar a tentativa de conter a crise internamente com o intuito de esquivar-se da exposição negativa.',
104:'A interatividade comunicativa acontece quando um usuário registra comentário em uma notícia digital, responde a outros leitores ou interage diretamente com jornalistas via chat, fóruns ou redes sociais vinculadas à plataforma.',
108:'A checagem de fatos (fact-checking) diferencia-se da apuração jornalística tradicional ao focar a verificação da veracidade de fatos já noticiados ou de declarações públicas de políticos e autoridades.',
115:'As organizações de mídia não têm expectativa de que a inteligência artificial gere textos jornalísticos, mas apenas de que continue acelerando a pesquisa e a classificação de conteúdos.',
120:'Um dos eixos do Pacto Nacional do Judiciário pela Linguagem Simples prevê o fomento ao uso de linguagem simples e direta nos documentos judiciais, mediante a completa eliminação de expressões técnicas.',
}
const dificeis=new Set([60,61,65,70,75,79,80,81,82,86,88,90,92,94,95,97,99,100,101,103,104,107,108,109,112,113,114,115,116,117,118,119,120])
if(qs.length!==61)throw Error(`Esperados 61 itens específicos; encontrados ${qs.length}`)
const decisoes=qs.map(q=>{
 const n=Number(q.numero_original),[materia,conteudo]=temas[n]||[]
 if(!materia)throw Error('Sem classificação para item '+n)
 const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const texto=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]
 const visual={pagina,imagem,motivo:'Conferência visual da página do caderno oficial; matéria e assunto corrigidos conforme cabeçalho e conteúdo do item.'}
 if(limpos[n])visual.enunciado=limpos[n]
 if(texto)visual.texto_apoio=texto
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,pagina,dificuldade:dificeis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual, normativa e interpretativa; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`TJPA 2025 — Técnico Judiciário, Comunicação Social, CEBRASPE; item ${n}. Conferido individualmente na página original.`,visual}
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'TJPA 2025 — Técnico Judiciário — Comunicação Social',documento_id:doc,registros_revisados:61,questoes_unicas_classificadas:61,duplicatas_desativadas:0,imagens_origem_conferidas:3,contextos_compartilhados_separados:13,gabarito_hash_pendente:true,observacao:'Corrigida a classificação genérica/incorreta de Administração Pública para os assuntos específicos da prova de Comunicação Social: três itens de legislação e 58 itens de comunicação/jornalismo, com conteúdos individualizados. Contextos dos blocos e enunciados contaminados por OCR foram tratados; a imagem oficial de cada questão permanece associada. Gabarito oficial não foi vinculado sem validação binária local, portanto não foi habilitada correção automática nesta revisão.',fontes:[prova]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
