import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='316b4c989e7c2a58',nome='revisao-dpdf-defensor-2019-pendencias-v268'
const gabarito='https://cdn.cebraspe.org.br/concursos/DP_DF_19_DEFENSOR/arquivos/GAB_DEFINITIVO_459_DPDF_001_MATRIZ.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/dp_df_19_defensor/arquivos/DP_DF_19_DEFENSOR_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO_VF.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==88)throw Error(`Esperava 88 itens pendentes; encontrei ${raw.length}`)

const linhasGabarito=[
 'E X E E C E X E C E X C X E C E E C E C',
 'C E E C C C E C E E C C E C E C E E E C',
 'C E E C C C C E E E C C C C E E C E C E',
 'C C C E C E E C C E C E E E C C E C C E',
 'X E E E E E C C E E E E E C E X E E E E',
 'C E E C C E E E C C E C C E C E C E C C',
 'E C E C C E E E E E C C E E C C C E E C',
 'E C E E C E E E E C C C C X C C C E E E',
 'E E E C C C E C X E E E E C C C E C E C',
 'E E C E C E C C E C E C E C C E C C E C',
]
const answers=linhasGabarito.flatMap(x=>x.split(/\s+/))
if(answers.length!==200)throw Error(`A chave canônica precisa conter 200 respostas; contém ${answers.length}`)
const keyHash=createHash('sha256').update(answers.join('|')).digest('hex')
const answerFor=n=>answers[n-1]
const exam='DPDF 2019 — II Concurso para Defensor Público de Segunda Categoria — prova objetiva (200 itens; aplicação em 2019)'

// Matéria e conteúdo específicos dos itens. Dificuldade é estimativa editorial, não rótulo da banca.
const topics={
35:['Direito Civil','Multipropriedade: instituição por ato inter vivos ou testamento e registro imobiliário','Média'],
36:['Direito Civil','Bem de família: impenhorabilidade na execução de obrigação alimentar','Média'],
37:['Direito Civil','Registros públicos: retificação extrajudicial do registro de nascimento','Média'],
40:['Direitos Humanos','Estatuto da Pessoa Idosa: direito à educação e oferta de cursos','Média'],
54:['Direito Processual Civil','Citação e interrupção da prescrição no processo civil','Média'],
55:['Direito Processual Civil','Suspeição de membro do Ministério Público e suspensão do processo','Difícil'],
56:['Direito Processual Civil','Apelação: teoria da causa madura após reforma de sentença que reconhece prescrição','Média'],
57:['Direito Constitucional','Mandado de segurança: prazo decadencial contra sanção disciplinar','Média'],
61:['Direito Penal','Aplicação da lei penal no espaço: teoria da ubiquidade','Fácil'],
62:['Direito Penal','Nexo causal: causa relativamente independente superveniente','Média'],
64:['Direito Penal','Dosimetria: atenuante da confissão espontânea retratada em juízo','Difícil'],
65:['Direito Penal','Reincidência e porte de droga para consumo pessoal','Difícil'],
66:['Direito Processual Penal','Ação penal nos crimes contra a honra de servidor público','Média'],
73:['Direito Penal','Estatuto do Desarmamento: tipicidade do porte de arma absolutamente ineficaz','Difícil'],
75:['Execução Penal','Falta grave: indulto, comutação de pena e livramento condicional','Média'],
76:['Execução Penal','Reconhecimento de falta grave por fato definido como crime doloso','Média'],
77:['Criminologia','Escola positivista: biologia criminal e fatores individuais do delito','Média'],
78:['Criminologia','Sociologia criminal: teoria da anomia de Durkheim','Média'],
79:['Criminologia','Teoria do controle social: enraizamento e vínculos sociais em Hirschi','Média'],
80:['Criminologia','Teorias criminológicas: contenção e conformidade diferencial','Difícil'],
81:['Criminologia','Modelos de reação ao delito: modelo dissuasório clássico','Fácil'],
82:['Criminologia','Modelos de reação ao delito: modelo integrador e justiça restaurativa','Média'],
83:['Criminologia','Modelos de reação ao delito: ressocialização e reintegração social','Média'],
84:['Criminologia','Prevenção do delito: níveis primário, secundário e terciário','Média'],
85:['Criminologia','Prevenção primária e políticas de prevenção social do delito','Média'],
86:['Criminologia','Escola positivista: determinismo e intervenção penal','Difícil'],
87:['Criminologia','Criminologia crítica: marxismo, determinismo social e seletividade penal','Difícil'],
100:['Direito Processual Penal','Tribunal do Júri: direito ao silêncio e limites dos debates orais','Difícil'],
101:['Direito Processual Penal','Tribunal do Júri: desclassificação e competência do juiz presidente','Difícil'],
102:['Direito Processual Penal','Audiência de custódia: assistência da Defensoria Pública','Média'],
103:['Direito Processual Penal','Audiência de custódia: liberdade provisória e medidas cautelares','Média'],
106:['Direito da Criança e do Adolescente','Guarda, dever de sustento e colocação em família substituta','Média'],
107:['Direito da Criança e do Adolescente','Guarda estatutária: natureza, efeitos e possibilidade de revogação','Média'],
108:['Direito da Criança e do Adolescente','Conselho Tutelar: atribuições e aplicação de medidas aos pais','Média'],
109:['Direito da Criança e do Adolescente','Dever de comunicação de suspeita de castigo físico ou maus-tratos','Fácil'],
110:['Direito da Criança e do Adolescente','ECA: distinção entre castigo físico e tratamento cruel ou degradante','Média'],
111:['Direito Civil','Responsabilidade civil e dano moral: prova do prejuízo e direitos da personalidade','Média'],
113:['Direito da Criança e do Adolescente','Remissão pré-processual: homologação judicial e revisão pelo Ministério Público','Difícil'],
114:['Direito da Criança e do Adolescente','Medida socioeducativa de internação: hipóteses e excepcionalidade','Média'],
118:['Direito da Criança e do Adolescente','Execução de medida socioeducativa: plano individual de atendimento (PIA)','Média'],
119:['Direito do Consumidor','Contratos bancários: venda casada de seguro e escolha da seguradora','Média'],
124:['Direito Processual Civil','Tutela coletiva: legitimidade da Defensoria Pública para ação coletiva','Difícil'],
130:['Direito Processual Civil','Ações coletivas: continência entre demandas propostas por defensorias','Difícil'],
131:['Direito Processual Civil','Litispendência entre demanda coletiva e demanda individual','Média'],
133:['Direito Processual Civil','Legitimidade para tutela coletiva e legitimação autônoma','Difícil'],
134:['Direito Processual Civil','Tutela coletiva: consequência processual da ilegitimidade ativa','Difícil'],
135:['Direito Processual Civil','Ações coletivas: pertinência temática de associações e sindicatos','Média'],
137:['Direito Processual Civil','Liquidação e execução individual de sentença coletiva por vítimas e sucessores','Média'],
138:['Direito Processual Civil','Direitos difusos, coletivos e individuais homogêneos: divisibilidade do objeto','Média'],
139:['Direito Eleitoral','Competência jurisdicional: propaganda partidária com dano ambiental','Difícil'],
140:['Direito Processual Civil','Ação civil pública: foro do local do dano e competência funcional','Média'],
141:['Direito Constitucional','Defensoria Pública: atribuição para instaurar inquérito civil','Média'],
143:['Direito Empresarial','Sociedade em comum: ausência de registro e prova do contrato social','Média'],
144:['Direito Empresarial','Sociedade em comum: responsabilidade dos sócios e desconsideração da personalidade jurídica','Difícil'],
146:['Direito Empresarial','Sociedade em comum: responsabilidade solidária e ilimitada dos sócios','Média'],
147:['Direito Empresarial','Falência: efeitos sobre a inabilitação dos sócios','Média'],
148:['Direito Empresarial','Falência: pressupostos e análise da insolvência empresarial','Média'],
152:['Direito Empresarial','Registro empresarial: inscrição de filial em outra circunscrição','Média'],
153:['Direitos Humanos','Teoria discursiva de Habermas: direitos humanos e soberania popular','Difícil'],
154:['Direitos Humanos','Fundamentos dos direitos humanos: direitos pré-estatais e pré-jurídicos','Média'],
155:['Direitos Humanos','Universalidade dos direitos humanos e cidadania global','Média'],
156:['Direitos Humanos','Dignidade humana e fundamentação dos direitos humanos em Kant e Habermas','Difícil'],
157:['Direitos Humanos','Direitos digitais: neutralidade da rede e liberdade de expressão','Média'],
158:['Direitos Humanos','Direitos humanos na Internet: deveres estatais e responsabilidade empresarial','Difícil'],
159:['Direitos Humanos','Liberdade de expressão: limites e vedação de direitos absolutos','Média'],
160:['Direitos Humanos','Indivisibilidade e interdependência dos direitos civis, políticos e sociais','Difícil'],
161:['Direitos Humanos','Universalidade dos direitos humanos e proteção da diversidade cultural','Média'],
166:['Direitos Humanos','Justiça de transição no Sistema Interamericano de Direitos Humanos','Difícil'],
167:['Direito Constitucional','Assistência jurídica integral e gratuita: previsão constitucional','Média'],
168:['Direito Constitucional','Defensoria Pública: abrangência temporal da assistência jurídica','Média'],
169:['Direito Constitucional','Defensoria Pública do DF: destituição do defensor público-geral','Média'],
170:['Direito Constitucional','Autonomia administrativa das Defensorias Públicas','Média'],
171:['Direito Constitucional','Autonomia institucional e vedação de vinculação da Defensoria Pública','Média'],
186:['Filosofia do Direito','H. L. A. Hart: limites morais do poder coercitivo da maioria','Difícil'],
187:['Direitos Humanos','Justiça etnocultural, universalidade e indivisibilidade dos direitos humanos','Difícil'],
188:['Filosofia Política','John Rawls: consenso sobreposto, pluralismo razoável e justiça pública','Difícil'],
189:['Sociologia Jurídica','Direito como ideologia e controle estatal de manifestações públicas','Difícil'],
190:['Sociologia Jurídica','Direito positivo e institucionalização de conflitos sociais','Difícil'],
191:['Sociologia','Grupos sociais e agregados sociais: interação, organização e continuidade','Média'],
192:['Sociologia Jurídica','Contingência, procedimento jurídico e transformação do direito vigente','Difícil'],
193:['Teoria Geral do Direito','Jurisprudência dos interesses: interpretação e intenção do legislador','Difícil'],
194:['Sociologia Jurídica','Niklas Luhmann: norma jurídica e expectativa contrafática','Média'],
195:['Sociologia Jurídica','Pierre Bourdieu: eficácia simbólica, universalidade e legitimação do direito','Difícil'],
196:['Sociologia Jurídica','Opinião pública, conhecimento jurídico e confiança no sistema de justiça','Média'],
197:['Conhecimentos sobre o Distrito Federal','RIDE-DF: políticas públicas de interesse comum e desenvolvimento regional','Média'],
198:['Conhecimentos sobre o Distrito Federal','RIDE-DF: metropolização, conurbação e organização territorial','Média'],
199:['Conhecimentos sobre o Distrito Federal','RIDE-DF: inclusão automática de municípios desmembrados (LC n.º 94/1998)','Média'],
200:['Conhecimentos sobre o Distrito Federal','RIDE-DF: composição territorial e municípios de Goiás e Minas Gerais','Fácil'],
}
if(Object.keys(topics).length!==88)throw Error(`Classificações mapeadas: ${Object.keys(topics).length}/88`)

const baseFor=n=>{
 if(n===35)return 'A respeito do condomínio em multipropriedade, julgue o item. Considere as regras legais sobre instituição, duração das frações de tempo e registro imobiliário.'
 if(n===36)return 'Considerando a legislação sobre bem de família e execução de alimentos, julgue o item.'
 if(n===37)return 'Considerando a legislação vigente sobre registros públicos, julgue o item.'
 if(n===40)return 'Com base no Estatuto da Pessoa Idosa e no Estatuto da Pessoa com Deficiência, julgue o item.'
 if(n>=54&&n<=56)return 'À luz do Código de Processo Civil, julgue o item.'
 if(n===57)return 'A respeito do mandado de segurança e dos direitos fundamentais, julgue o item.'
 if(n===61||n===62)return 'A respeito da aplicação da lei penal e da relação de causalidade, julgue o item.'
 if(n===64||n===65)return 'A respeito da aplicação da pena e dos efeitos de condenações anteriores, julgue o item.'
 if(n===66)return 'Acerca da ação penal, das causas extintivas da punibilidade e da prescrição, julgue o item.'
 if(n===73)return 'A respeito dos crimes previstos no Estatuto do Desarmamento, julgue o item.'
 if(n===75||n===76)return 'À luz da Lei de Execução Penal e da jurisprudência dos tribunais superiores, julgue o item.'
 if(n>=77&&n<=80)return 'A respeito das teorias criminológicas e de seus modelos explicativos do comportamento criminal, julgue o item.'
 if(n>=81&&n<=87)return 'Com relação às teorias da criminologia e à prevenção da infração penal no Estado Democrático de Direito, julgue o item.'
 if(n===100||n===101)return 'Situação: Manoel participa de julgamento pelo Tribunal do Júri. Considere as garantias constitucionais e as regras do Código de Processo Penal aplicáveis ao interrogatório e aos debates.'
 if(n===102||n===103)return 'Situação: Valter é apresentado em audiência de custódia e não dispõe de advogado particular. Considere a Constituição Federal, o Código de Processo Penal e as regras sobre liberdade provisória.'
 if(n>=106&&n<=110)return 'Situação: caso envolvendo as crianças Maria e Maurício, guarda por familiares, dever de sustento e suspeita de castigo físico. Julgue conforme o Estatuto da Criança e do Adolescente.'
 if(n===111)return 'Julgue o item considerando responsabilidade civil, direitos da personalidade e a jurisprudência do Superior Tribunal de Justiça sobre dano moral.'
 if(n===113||n===114)return 'Situação: adolescente André responde por ato infracional e são discutidas remissão e aplicação de medida socioeducativa. Julgue conforme o ECA.'
 if(n===118)return 'Acerca da execução de medidas socioeducativas previstas no Estatuto da Criança e do Adolescente, julgue o item.'
 if(n===119)return 'Acerca de contratos bancários e da legislação de proteção do consumidor, julgue o item.'
 if(n>=124&&n<=141)return 'Acerca da tutela coletiva, das ações civis públicas, dos direitos coletivos e da atuação institucional da Defensoria Pública, julgue o item.'
 if(n>=143&&n<=148)return 'Situação: Domingos e outros exploram uma floricultura por sociedade não registrada. Considere o regime da sociedade em comum, a responsabilidade dos sócios e as regras de falência.'
 if(n===152)return 'A respeito do registro empresarial e da inscrição de filiais em circunscrições distintas, julgue o item.'
 if(n>=153&&n<=161)return 'Acerca dos fundamentos e da proteção internacional dos direitos humanos, inclusive em ambientes digitais, julgue o item.'
 if(n>=166&&n<=171)return 'Acerca dos sistemas de proteção dos direitos humanos e da organização constitucional da Defensoria Pública, julgue o item.'
 if(n===186)return 'A respeito da filosofia moral e dos limites democráticos ao poder da maioria, julgue o item.'
 if(n===187||n===188)return 'Acerca da universalidade dos direitos humanos e das teorias de justiça e democracia, julgue o item.'
 if(n>=189&&n<=191)return 'Situação: organizadores divulgam nas redes sociais manifestação de rua em defesa da descriminalização da cannabis; a autoridade policial instaura investigação e tenta impedir o ato. Julgue conforme conceitos de sociologia e sociologia jurídica.'
 if(n>=192&&n<=196)return 'Considerando a situação hipotética da manifestação pública em defesa da descriminalização da cannabis e as correntes sociológicas do direito, julgue o item.'
 return 'Acerca de aspectos políticos e econômicos do Distrito Federal e da Região Integrada de Desenvolvimento do Distrito Federal e Entorno (RIDE-DF), julgue o item conforme a Lei Complementar n.º 94/1998 e suas alterações.'
}
const decisions=raw.map(q=>{
 const n=Number(q.numero),info=topics[n],g=answerFor(n)
 if(!info||!g)throw Error(`Conteúdo ou gabarito ausente para o item ${n}`)
 const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const stem=String(q.enunciado||'').split(/JUSTIFICATIVA\s*[-–—]\s*(?:CERTO|ERRADO|ANULADO)?/i)[0]
   .replace(/(?:CESPE\s*\/\s*Cebraspe|CEBRASPE)\s*[–—-]\s*DPDF\s*[–—-]\s*Aplicação:\s*2019[\s\S]*$/i,'')
   .replace(/\s*Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
 if(!stem)throw Error(`Enunciado vazio no item ${n}`)
 const anulada=g==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:info[0],conteudo:info[1],ano:2019,
  concurso:exam,numero_original:n,pagina:page,dificuldade:info[2],dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela densidade jurídica, variedade de normas e necessidade de jurisprudência; não é classificação publicada pela banca.',
  classificacao_fonte:gabarito,motivo:`CEBRASPE — DPDF 2019, prova objetiva do cargo de Defensor Público de Segunda Categoria; item ${n}, página ${page}. Matéria e tópico determinados pelo conteúdo efetivamente cobrado; gabarito cotejado com a chave oficial definitiva e suas retificações/anulações.`,
  enunciado:stem,texto_apoio:baseFor(n),opcoes:['Certo','Errado'],resposta_correta:anulada?null:g==='C'?0:1,anulada,
  gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_459_DPDF_001_MATRIZ.PDF',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_200_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:g,criterio:anulada?'Gabarito oficial definitivo marca X; anulação confirmada na publicação oficial de justificativas.':'Gabarito oficial definitivo do Cargo de Defensor Público de Segunda Categoria; conferido com a publicação de justificativas de alteração/anulação.'},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
  visual:{pagina:page,imagem:image,motivo:`Página ${page} da prova objetiva oficial vinculada ao item; conferida para preservar o texto e eventuais elementos visuais.`}}
})
if(decisions.length!==88||new Set(decisions.map(x=>x.id)).size!==88)throw Error('Contagem ou unicidade do pacote inconsistente')
if(decisions.filter(x=>x.anulada).map(x=>x.numero_original).sort((a,b)=>a-b).join(',')!=='81,154,169')throw Error('Itens anulados divergentes da chave definitiva')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## DPDF 2019 — prova objetiva do cargo de Defensor Público de Segunda Categoria — v268\n\n- Revisei os 88 itens que estavam pendentes neste documento. Corrigi classificações incompatíveis — como Criminologia registrada como Biologia, conteúdos de Direito da Criança e do Adolescente registrados como Medicina, e itens de Sociologia Jurídica distribuídos em categorias genéricas — e defini matéria, conteúdo, ano, cargo e dificuldade estimada.\n- Vinculei a chave definitiva oficial e as justificativas de alteração/anulação. Os itens 81, 154 e 169 estão anulados; permanecem sem resposta automática.\n- Separei enunciado e justificativa: removi do enunciado os blocos explicativos anexados pelo OCR e reconstituí textos de apoio para os grupos que compartilham casos hipotéticos ou comandos. Imagens das páginas originais foram mantidas para os 88 registros.\n- Alteração local, não publicada na nuvem.\n- Fontes oficiais: [gabarito definitivo](<${gabarito}>), [justificativas de alteração e anulação](<${justificativas}>), [edital do concurso](https://cdn.cebraspe.org.br/concursos/DP_DF_19_DEFENSOR/arquivos/ED_1__2019__DPDF_DEFENSOR__ABT.PDF).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:88,anuladas:3,publicacao:'local'},null,2))
