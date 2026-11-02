import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-trf6-2025-direito-cargo23-v303',doc='0a074f45192a6997'
const prova='https://cdn.cebraspe.org.br/concursos/TRF6_24/arquivos/034_TRF6_023_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/TRF6_24/arquivos/GAB_DEFINITIVO_034_TRF6_023_01.PDF'
const base=raizesAtuais.find(x=>x.includes('revisao-pref-cachoeiro-psicologia-2024-v302'))
if(!base)throw Error('Base local v302 não encontrada')
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='034_TRF6_023_01.PDF'||catalog.questoes.length!==70)throw Error('Caderno TRF6 Cargo 23 divergente')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==39)throw Error(`Esperados 39 registros pendentes, recebidos ${records.length}`)
const key=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
if(!key||key.status!=='tabela_lida'||!key.sha256||key.prova_url!==prova||key.gabarito_url!==gabarito)throw Error('Gabarito definitivo não validado para este caderno')

const topics={
68:['Direito Civil','Obrigações solidárias: efeitos de julgamento em ação proposta por credor solidário'],69:['Direito Civil','Capacidade civil: atos que o relativamente incapaz pode praticar autonomamente'],70:['Direito Civil','Direito intertemporal: aplicação de lei nova a prazo decadencial em curso'],72:['Direito Civil','Cláusula penal moratória e indenização por lucros cessantes em compra de imóvel'],
75:['Direito Processual Civil','Impedimento e suspeição: momento e forma para alegação pelo réu'],76:['Direito Processual Civil','Intervenção de terceiro e competência federal após sucessão de sociedade de economia mista'],77:['Direito Processual Civil','Gratuidade da justiça: concessão parcial, parcelamento e antecipação de despesas'],79:['Direito Processual Civil','Prova pericial: substituição por prova técnica simplificada'],80:['Direito Processual Civil','Agravo de instrumento e taxatividade mitigada do rol do art. 1.015 do CPC'],
81:['Direito Administrativo','Improbidade administrativa: aplicação temporal da Lei nº 14.230/2021'],82:['Direito Processual Civil','Ação civil pública: coisa julgada e limites territoriais'],
83:['Direito Penal','Extorsão com emprego de arma de fogo: regime inicial de cumprimento da pena'],84:['Direito Penal Tributário','Apropriação indébita tributária em operações próprias e substituição tributária'],85:['Direito Penal','Crimes hediondos: porte ou posse de arma de fogo com sinal identificador adulterado'],86:['Direito Penal','Dosimetria: reincidência e maus antecedentes após o período depurador'],87:['Direito Penal','Concurso de crimes: pluralidade de desígnios em roubo e homicídio tentado'],88:['Direito Penal','Crimes hediondos: reincidência em importunação sexual e livramento condicional'],89:['Direito Penal','Imputabilidade: sistema vicariante e medida de segurança'],90:['Direito Penal','Graça e indulto: crimes equiparados a hediondos e tráfico de drogas'],
91:['Direito Processual Penal','Trancamento da ação penal e suspensão condicional do processo'],92:['Direito Processual Penal','Falsidade de moeda e competência da Justiça Federal'],93:['Direito Processual Penal','Violação de direito autoral transnacional e competência jurisdicional'],94:['Direito de Execução Penal','Execução de pena restritiva de direitos e trânsito em julgado'],95:['Direito de Execução Penal','Transferência e permanência em estabelecimento penal federal'],96:['Direito Processual Penal','Acordo de não persecução penal: cumprimento e extinção da punibilidade'],97:['Direito Processual Penal','Captação ambiental de sinais e requisitos da Lei nº 9.296/1996'],98:['Direito Processual Penal','Juiz das garantias: controle da investigação e trancamento do inquérito'],
99:['Direito Tributário','Princípios tributários: anterioridade anual e nonagesimal para o imposto de renda'],100:['Direito Tributário','Reforma Tributária do Consumo: extinção e substituição de tributos'],102:['Direito Tributário','Responsabilidade tributária por sucessão em fusão de pessoas jurídicas'],106:['Direito Constitucional Tributário','Imunidades tributárias: limites à ampliação por lei ordinária'],
110:['Direito Previdenciário','RGPS: acumulação de auxílio-acidente com aposentadoria e regras de transição'],111:['Direito Previdenciário','Data de entrada do requerimento (DER): reafirmação e implementação de requisitos'],113:['Direito Previdenciário','Prova de tempo de contribuição: acordo trabalhista e início de prova material'],
114:['Direito Ambiental','Unidades de conservação: alteração de ecossistema em estação ecológica'],115:['Direito Ambiental','Recursos hídricos: finalidade e alcance da outorga de uso'],116:['Direito Ambiental','Licenciamento ambiental: prazos de análise por modalidade de licença'],117:['Direito Ambiental','Política Nacional do Meio Ambiente: instrumentos e sanções administrativas'],118:['Direito Ambiental','Responsabilidade civil ambiental do Poder Público por omissão fiscalizatória'],120:['Direito Ambiental','Crimes contra a fauna silvestre: espécime nativo e autorização administrativa']
}
const pageFor=n=>n<=74?1:n<=95?2:n<=117?3:4
const hard=new Set([68,70,72,75,76,80,81,82,83,84,85,87,88,89,90,92,93,95,96,97,98,100,102,106,111,113,114,115,116,117,118,120])
const easy=new Set([69,77,79,86,91,94,99,110])
const clean={
 'extr-8c0be92e804f33f6572d':'O crime de apropriação indébita tributária pode ocorrer tanto em operações próprias como em operações submetidas à substituição tributária.',
 'extr-5b0498bba9d33ec2f533':'À Justiça estadual competem o processamento e o julgamento do crime de violação de direito autoral, ainda que cometido em caráter transnacional.',
 'extr-77c0b03ebd5367126f73':'Quando persistirem os motivos que ensejaram a transferência inicial do preso para o sistema penitenciário federal, é prescindível a ocorrência de fatos novos para eventuais prorrogações da medida.',
 'extr-78e5ee027f54a35ee3a5':'O rol constitucional das imunidades tributárias não pode ser ampliado por legislação comum.',
 'extr-f4f215eace762eabef93':'As penalidades disciplinares previstas na legislação ambiental são consideradas instrumentos da Política Nacional do Meio Ambiente.',
 'extr-a3e69d80c618235798c3':'Matar espécime nativo da fauna silvestre, sem permissão, licença ou autorização da autoridade competente, é crime punível com detenção e multa.'
}
const contexts={
68:'Julgue os itens subsequentes relativos a pessoa natural e jurídica, decadência, simulação e direito das obrigações no direito civil.',
72:'De acordo com a jurisprudência do Superior Tribunal de Justiça sobre responsabilidade civil, contratos e inadimplemento de obrigações, julgue os itens seguintes.',
75:'Julgue os itens relativos a deveres e sucessão das partes e dos procuradores, competência e contestação no processo civil.',
79:'Situação hipotética: Maria ajuizou ação indenizatória contra empresa pública federal; pediu prova pericial, indeferida e substituída por prova técnica simplificada. A autora alegou complexidade da causa e falta de requerimento para substituição. Com base nessa situação, julgue os itens.',
81:'Julgue os itens seguintes sobre improbidade administrativa e ação civil pública, conforme a Constituição e a jurisprudência do Supremo Tribunal Federal.',
83:'Em relação a crimes contra o patrimônio, julgue os itens seguintes.',
85:'Com base na jurisprudência dos tribunais superiores sobre aplicação da pena e crimes hediondos, julgue os itens seguintes.',
87:'Em relação à aplicação da lei penal, julgue os itens seguintes.',
91:'Em relação à ação penal e à competência para seu processamento e julgamento, julgue os itens seguintes com base na jurisprudência dos tribunais superiores.',
94:'Quanto à execução das penas, julgue os itens seguintes.',
96:'Com base na Lei nº 9.296/1996, sobre interceptação telefônica, e nas alterações introduzidas pela Lei nº 13.964/2019 no Código de Processo Penal, julgue os itens seguintes.',
99:'A respeito do Sistema Tributário Nacional, considerando as disposições constitucionais e as alterações promovidas pela Reforma Tributária do Consumo (Emenda Constitucional nº 132/2023), julgue os itens seguintes.',
102:'A respeito da obrigação e da responsabilidade tributária, julgue os itens seguintes à luz do Código Tributário Nacional e da jurisprudência dos tribunais superiores.',
105:'Acerca das imunidades segundo a doutrina e a jurisprudência dos tribunais superiores, julgue os itens seguintes.',
107:'Com base na Lei Complementar nº 109/2001, julgue os itens relativos à previdência complementar.',
110:'Acerca do regime geral de previdência social, julgue os itens seguintes, considerando, no que couber, o entendimento jurisprudencial dos tribunais superiores.',
114:'A respeito do licenciamento ambiental, do Sistema Nacional de Unidades de Conservação da Natureza, da Política Nacional de Recursos Hídricos e da Política Nacional do Meio Ambiente, julgue os itens seguintes.',
118:'A respeito dos recursos florestais, da responsabilidade ambiental e de crimes ambientais, julgue os itens seguintes.'
}
const contextFor=n=>Object.entries(contexts).filter(([start])=>n>=Number(start)).at(-1)?.[1]||''
const decisions=[]
for(const q of records){
 const n=Number(q.numero),topic=topics[n],answer=key.respostas[String(n)]
 if(!topic||!answer)throw Error(`Falta classificação ou gabarito oficial para item ${n}`)
 const page=pageFor(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,decision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2025,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'1º Concurso Público do Tribunal Regional Federal da 6ª Região (TRF6)',aplicacao:'TRF6 — Analista Judiciário — Área Judiciária — Sem Especialidade (Cargo 23)',cargo:'Analista Judiciário — Área Judiciária — Sem Especialidade (Cargo 23)',numero:n,numero_original:n,pagina:page,classificacao_fonte:prova,motivo:`Item ${n} identificado no caderno oficial do Cargo 23. A aplicação foi em 19/01/2025 conforme cronograma oficial; conteúdo classificado pelo tema jurídico específico.`,resposta_correta:answer==='C'?0:answer==='E'?1:null,anulada:answer==='X',gabarito_oficial:{fonte:gabarito,arquivo:key.arquivo_gabarito,prova:key.arquivo_prova,sha256:key.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo CEBRASPE do Cargo 23, identificado pelo mesmo código do caderno; hash e tabela constam no inventário documental.'},dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo grau de interpretação de jurisprudência, integração normativa e raciocínio jurídico; não publicada pela banca.',apta_resolucao:answer!=='X',remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],visual:{pagina:page,imagem:image,motivo:'Página original conferida visualmente; preserva os enunciados, os textos-base e o contexto da prova.'}}
 const stem=clean[q.id];if(stem)decision.visual.enunciado=stem
 const context=contextFor(n);if(context)decision.visual.texto_apoio=context
 if(answer==='X'){decision.inelegibilidade_motivo='Item anulado no gabarito oficial definitivo; mantido no histórico, sem correção automática.';decision.motivo=decision.inelegibilidade_motivo}
 decisions.push(decision)
}
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Analista Judiciário — Área Judiciária — Sem Especialidade (Cargo 23)',ano_edital:2024,ano_aplicacao:2025,registros_revistos:records.length,questoes_unicas:records.length,itens_anulados:records.filter(q=>key.respostas[String(q.numero)]==='X').length,itens_com_contexto_preservado:Object.keys(contexts).length,paginas_visuais_conferidas:[1,2,3,4],prova_oficial:prova,gabarito_oficial:gabarito,gabarito_sha256:key.sha256,edital_oficial:'https://cdn.cebraspe.org.br/concursos/trf6_24/arquivos/Ed_1_TRF6_24_Abertura_atualizado_ret_9.pdf',publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão TRF6 2025 — Analista Judiciário, Área Judiciária, Cargo 23 — v303\n\n- Reexportei da raiz ativa e revisei ${records.length} questões pendentes do caderno específico. Corrigi banca, aplicação, cargo e ano real da prova (2025, embora o edital seja de 2024), classifiquei matéria e conteúdo jurídico, registrei dificuldade estimada e associei o gabarito definitivo com hash.\n- Corrigi seis enunciados contaminados por cabeçalhos ou blocos seguintes, recoloquei textos-base e vinculei as páginas originais. Os itens 77, 81 e 102 foram anulados no gabarito definitivo e ficaram inelegíveis para correção/resolução avaliativa.\n- Conferi visualmente as páginas 1–4 do caderno. Resultado local: ${out.total} questões, ${out.disponiveis} disponíveis e ${out.pendentes} pendentes. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno](${prova}); [gabarito definitivo](${gabarito}); [edital atualizado](${out.edital_oficial}).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
