import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pires-rio-servico-social-v81'
const base='tmp/revisao-profissional/revisao-mpce-servico-social-2020-v80/acervo-extraido'
const doc='6711ab97bdbff15c'
const prova='https://cdn.cebraspe.org.br/concursos/PREF_PIRESRIO_GO_21/arquivos/643_PREF_PIRESDORIO_002_01.PDF'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-prefeitura-pires-rio-servico-social-2021.json','utf8')).filter(q=>q.materia==='Serviço Social')
const temas={
51:['Serviço Social','Pesquisa e exercício profissional: articulação entre investigação e prática'],
52:['Serviço Social','Pesquisa social: ampliação das demandas e produção de conhecimento'],
53:['Serviço Social','Pesquisa em Serviço Social: conhecimento e intervenção profissional'],
54:['Serviço Social','Pesquisa social: totalidade e reprodução material e social'],
55:['Serviço Social','Formação profissional: transversalidade da pesquisa'],
56:['Ética Profissional','Sigilo profissional: emissão de certidão disciplinar a pedido do interessado'],
58:['Ética Profissional','Certidão profissional e acesso a informações para defesa de direitos'],
59:['Ética Profissional','Certidão de situação disciplinar e informações ético-profissionais'],
61:['Serviço Social','Assessoria profissional: atuação em políticas públicas e movimentos sociais'],
62:['Serviço Social','Assessoria e trabalho profissional: contradições institucionais'],
63:['Serviço Social','Assessoria a movimentos sociais: dimensão política'],
65:['Serviço Social','Assessoria à gestão de políticas sociais'],
66:['Ética Profissional','Sigilo profissional e dimensão ética da atuação'],
68:['Legislação Profissional','Fiscalização profissional: atribuições dos CRESS e CFESS'],
69:['Ética Profissional','Aprimoramento intelectual e princípios éticos profissionais'],
70:['Legislação Profissional','Prescrição de infração ético-disciplinar'],
71:['Ética Profissional','Relações com o sistema de justiça e depoimento profissional'],
74:['Serviço Social','Ação investigativa e reflexão sobre o trabalho profissional'],
81:['Serviço Social','Questão social: respostas profissionais e controle social'],
82:['Serviço Social','Questão social: moralização e culpabilização de famílias'],
83:['Políticas Sociais','Questão social e respostas do Estado capitalista'],
85:['Serviço Social','Perícia social: autonomia profissional e opinião técnica'],
87:['Direitos da Criança e do Adolescente','Proteção integral: Disque 100 e rede de proteção'],
88:['Direitos da Criança e do Adolescente','Lei nº 13.431/2017: escuta especializada e depoimento especial'],
89:['Direitos da Criança e do Adolescente','Violência sexual, negligência e contexto de ocorrência'],
90:['Serviço Social','População em situação de rua: políticas de acolhimento e direitos humanos'],
91:['Serviço Social','Crianças e adolescentes em situação de rua: causas e proteção social'],
92:['Saúde Pública','HIV/AIDS: determinantes sociais e políticas de prevenção'],
93:['Saúde Pública','HIV: profilaxia pré-exposição e antirretrovirais'],
94:['Políticas Sociais','Política social, cidadania e direitos sociais'],
95:['Políticas Sociais','Proteção social e classificação das situações de pobreza'],
96:['Políticas Sociais','Neoliberalismo, desassalariamento e proteção social'],
97:['Políticas Sociais','Estado e sociedade: subordinação das políticas sociais'],
98:['Mediação de Conflitos','Lei nº 13.140/2015: confidencialidade e busca da verdade'],
99:['Mediação de Conflitos','Lei nº 13.140/2015: oralidade e isonomia'],
100:['Mediação de Conflitos','Lei nº 13.140/2015: imparcialidade e informalidade'],
101:['Direito da Pessoa Idosa','Estatuto da Pessoa Idosa: comunicação de violência'],
102:['Direito da Pessoa Idosa','Proteção social e dever estatal de assistência à pessoa idosa'],
103:['Direito da Pessoa Idosa','Gratuidade no transporte coletivo para pessoas idosas'],
104:['Direito da Pessoa Idosa','Direito à saúde e atendimento domiciliar'],
105:['Assistência Social','LOAS: objetivos da política de assistência social'],
106:['Assistência Social','LOAS: equidade no acesso a serviços e benefícios'],
107:['Assistência Social','Cadastro Único e acesso a programas sociais'],
108:['Assistência Social','Vigilância socioassistencial e prevenção de vulnerabilidades'],
109:['Assistência Social','LOAS: Benefício de Prestação Continuada (BPC)'],
110:['Direito da Mulher','Lei Maria da Penha: violência psicológica'],
111:['Direito da Mulher','Lei Maria da Penha: violência sexual'],
112:['Direito da Mulher','Lei Maria da Penha: violência física'],
113:['Direito da Mulher','Lei Maria da Penha: violência patrimonial'],
114:['Direitos da Criança e do Adolescente','Prevenção da delinquência juvenil: programas comunitários'],
115:['Direitos da Criança e do Adolescente','Diretrizes de Riad: protagonismo e proteção de jovens'],
116:['Direitos da Criança e do Adolescente','Prevenção da delinquência juvenil: educação e atenção individualizada'],
117:['Ética Profissional','Código de Ética: sigilo profissional e proteção de usuários'],
118:['Ética Profissional','Sigilo profissional: limites e comunicação em situação de risco'],
119:['Ética Profissional','Dever de preservar o sigilo profissional'],
120:['Ética Profissional','Sigilo e compartilhamento de informações em equipes multiprofissionais'],
}
const blocos=[
[51,55,'Bloco: pesquisa em Serviço Social, sua relação com a formação e com o trabalho profissional.'],
[56,59,'Situação hipotética: Jorge, assistente social, é alvo de denúncia no CRESS e solicita uma certidão de natureza disciplinar e ética; os itens abordam sigilo, acesso e conteúdo da certidão.'],
[60,65,'Situação hipotética: Iris, assistente social da maior unidade de saúde de município com mais de 100 mil habitantes, também assessora um movimento social de educação popular. Os itens tratam de assessoria, sistematização do trabalho, políticas sociais e dimensão política.'],
[66,71,'Bloco: ética profissional, sigilo, competências dos Conselhos de Serviço Social e relações com o sistema de justiça.'],
[72,74,'Bloco: investigação e planejamento no trabalho cotidiano do assistente social.'],
[75,79,'Bloco: Programa Auxílio Brasil, políticas públicas e participação social.'],
[80,83,'Bloco: questão social, cidadania, políticas sociais e respostas do Estado.'],
[84,86,'Bloco: estudo social, perícia, relatório, laudo e parecer social.'],
[87,89,'Bloco: proteção de crianças e adolescentes vítimas de violência, rede de proteção e procedimentos de escuta.'],
[90,91,'Bloco: crianças e adolescentes em situação de rua e políticas de proteção.'],
[92,93,'Bloco: políticas e literatura científica sobre HIV/AIDS e prevenção.'],
[94,97,'Bloco: política social, Estado, sociedade e neoliberalismo.'],
[98,100,'Referência do bloco: Lei nº 13.140/2015, que dispõe sobre mediação entre particulares e autocomposição no âmbito da administração pública.'],
[101,104,'Referência do bloco: Estatuto da Pessoa Idosa (Lei nº 10.741/2003).'],
[105,109,'Referência do bloco: Lei Orgânica da Assistência Social — LOAS (Lei nº 8.742/1993).'],
[110,113,'Referência do bloco: Lei Maria da Penha (Lei nº 11.340/2006).'],
[114,116,'Referência do bloco: Princípios Orientadores das Nações Unidas para a Prevenção da Delinquência Juvenil (Diretrizes de Riad).'],
[117,120,'Referência do bloco: Código de Ética do Assistente Social; itens sobre sigilo profissional e trabalho em equipe.'],
]
const limpos={
55:'A defesa da transversalidade da pesquisa em Serviço Social na formação profissional, no século XXI, pressupõe a defesa da centralidade da pesquisa acadêmico-científica e da pesquisa em serviços.',
59:'O CRESS ou o CFESS poderá atestar a situação disciplinar e(ou) ético-profissional de Jorge na certidão solicitada, desde que o processo já esteja em andamento.',
93:'A profilaxia pré-exposição ao HIV, centrada no uso de antirretrovirais para reduzir o risco de infecção, tem-se mostrado uma estratégia ineficaz para pessoas com risco aumentado de contaminação.',
97:'Uma característica da política social contemporânea é a subordinação da política social ao progressivo poder do trabalho sobre o capital.',
100:'A imparcialidade do mediador e a informalidade são princípios que devem orientar a mediação, conforme a Lei nº 13.140/2015.',
104:'A prevenção e a manutenção da saúde da pessoa idosa serão efetivadas por meio de atendimento domiciliar, incluída a internação, quando necessária e quando a pessoa não puder se locomover.',
116:'No tocante à educação voltada à prevenção da delinquência juvenil, deve-se dispensar atenção especial às crianças e aos jovens que se destaquem quanto ao cumprimento de regras de assiduidade e das tarefas educativas.',
120:'Em trabalho multidisciplinar, conforme a situação de vulnerabilidade social do usuário, as informações devem ser compartilhadas com a equipe para potencializar o atendimento, observados os limites éticos do sigilo profissional.',
}
const difícil=new Set([54,55,59,61,62,63,65,66,68,70,71,74,82,83,85,87,88,89,90,92,93,95,96,97,98,99,100,101,102,103,104,106,107,109,110,111,112,113,114,116,117,118,120])
const vistos=new Map(),decisoes=[]
if(qs.length!==60)throw Error(`Esperados 60 registros, encontrados ${qs.length}`)
for(const q of qs){
 const n=Number(q.numero_original),[materia,conteudo]=temas[n]||[]
 if(!materia)throw Error(`Sem classificação para item ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const texto=blocos.find(([a,b])=>n>=a&&n<=b)?.[2]
 const visual={pagina,imagem,texto_apoio:texto||'',motivo:'Conferência da página do caderno oficial; matéria e conteúdo classificados pelo enunciado e pelo comando do bloco.'}
 if(limpos[n])visual.enunciado=limpos[n]
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,pagina,dificuldade:difícil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade conceitual, normativa e interpretativa; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`Prefeitura de Pires do Rio/GO 2021 — Assistente Social — CEBRASPE; item ${n}. Conferido na página original.`,visual}
 const principal=vistos.get(n)
 if(principal){d.apta_resolucao=false;d.duplicada_de=principal;d.inelegibilidade_motivo=`Cópia extraída do item ${n} no mesmo caderno oficial; uma ocorrência idêntica foi mantida disponível.`}
 else vistos.set(n,q.id)
 decisoes.push(d)
}
const duplicatas=decisoes.filter(d=>d.apta_resolucao===false)
if(duplicatas.length!==4)throw Error(`Esperadas 4 cópias repetidas dos itens 54, 55, 59 e 61; encontradas ${duplicatas.length}`)
for(const d of decisoes)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'Prefeitura de Pires do Rio/GO 2021 — Assistente Social',documento_id:doc,registros_revisados:60,questoes_unicas_classificadas:56,duplicatas_desativadas:duplicatas.map(d=>({id:d.id,duplicada_de:d.duplicada_de})),materias_específicas:'Serviço Social, Ética Profissional, Legislação Profissional, Políticas Sociais, Direitos da Criança e do Adolescente, Saúde Pública, Direitos da Pessoa Idosa, Assistência Social, Direito da Mulher e Mediação de Conflitos',paginas_origem_conferidas:3,gabarito_hash_pendente:true,observacao:'A classificação anterior agrupava as 60 ocorrências como Serviço Social; distribuí as questões por sua matéria e conteúdo reais. Comparei as páginas originais e desativei as cópias dos itens 54, 55, 59 e 61. Textos e referências compartilhados foram separados e associados aos blocos corretos. Gabarito não foi validado por arquivo binário local com hash; correção automática não habilitada.',fontes:[prova]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
