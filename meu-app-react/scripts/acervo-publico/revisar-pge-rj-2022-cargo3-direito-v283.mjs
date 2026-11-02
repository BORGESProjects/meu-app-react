import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pge-rj-2022-cargo3-direito-v283'
const base='tmp/revisao-profissional/correcao-enem-ppl-2024-cd9-item13-v282/acervo-extraido'
const doc='0d13b43da8258a04'
const prova='https://cdn.cebraspe.org.br/concursos/PGE_RJ_22/arquivos/679_PGERJ_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/PGE_RJ_22/arquivos/GAB_DEFINITIVO_679_PGERJ_003_01.PDF'
const conferidos=JSON.parse((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`)))
if(conferidos.status!=='tabela_lida'||conferidos.sha256!=='ad57b3c7beabf9cfdf10d6edfacae7a9fa16130cf6cdf0b3f5b8026e04ecb9c0')throw Error('Gabarito não validado no registro de fontes')
const chave={...conferidos.respostas,111:'E',112:'C',113:'E',114:'E',115:'C',116:'C',117:'X',118:'E',119:'E',120:'E'}
const temas={
51:['Direito Constitucional','Comissões parlamentares de inquérito: encaminhamento de conclusões e limites de atuação'],
52:['Direito Constitucional','Competências legislativas e administrativas dos entes federativos'],
53:['Direito Constitucional','Organização do Estado: regiões metropolitanas e lei complementar estadual'],
54:['Direito Constitucional','Conselho Nacional de Justiça: controle administrativo, financeiro e disciplinar'],
55:['Direito Constitucional','Processo legislativo constitucional: iniciativa de emenda à Constituição'],
61:['Direito Processual Civil','Ação civil pública: competência territorial e tutela coletiva do consumidor'],
62:['Direito Processual Civil','Incidente de resolução de demandas repetitivas: pressupostos de admissibilidade'],
72:['Direito Empresarial','Recuperação judicial: dispensa de certidões negativas após o deferimento'],
73:['Direito Empresarial','Recuperação judicial: finalidade, preservação da empresa e função social'],
74:['Direito Empresarial','Falência: desconsideração da personalidade jurídica'],
75:['Direito Empresarial','Recuperação judicial: prazo para apresentação do plano'],
76:['Direito Empresarial','Recuperação judicial: distribuição de lucros e dividendos antes do plano'],
77:['Direito Civil','Contratos empresariais: interpretação e validade de cláusulas contratuais'],
78:['Direito Administrativo','Bens públicos: alienação de bem de uso comum do povo'],
79:['Direito Civil','Direito das obrigações: consignação em pagamento e recusa de quitação'],
80:['Direito Civil','Lei de Introdução às Normas do Direito Brasileiro: revogação tácita de lei'],
81:['Direito Empresarial','Propriedade industrial: cotitularidade e requerimento de patente'],
83:['Direito Empresarial','Sociedade anônima: responsabilidade do acionista'],
84:['Direito Empresarial','Recuperação judicial: suspensão da prescrição e efeitos do deferimento'],
85:['Direito Administrativo','Processo administrativo disciplinar: descrição dos fatos na portaria de instauração'],
86:['Direito Administrativo','Poder disciplinar: aplicação de penalidade a servidor público'],
87:['Direito Administrativo','Improbidade administrativa: ressarcimento ao erário e imprescritibilidade'],
88:['Direito Administrativo','Responsabilização disciplinar: independência entre instâncias e demissão'],
89:['Direito Administrativo','Responsabilidade civil do Estado: pretensão de ressarcimento ao erário'],
90:['Direito Administrativo','Reposição ao erário: pagamento indevido e boa-fé do servidor'],
91:['Direito Administrativo','Contratos administrativos: alteração unilateral e limites legais'],
92:['Direito Administrativo','Contratos administrativos: modalidades de garantia contratual'],
93:['Direito Administrativo','Contratos administrativos: vedação à vigência por prazo indeterminado'],
94:['Direito Tributário','IPI: seletividade regional e redução de desigualdades socioeconômicas'],
96:['Direito Tributário','ITBI: fato gerador na promessa de compra e venda de imóvel'],
97:['Direito Tributário','IPTU: incidência sobre imóvel de empresa estatal exploradora de atividade econômica'],
98:['Direito Tributário','Obrigação tributária: ocorrência do fato gerador de situação jurídica'],
99:['Direito Tributário','Obrigação acessória: conservação de livros e documentos contábeis'],
100:['Direito Tributário','Crédito tributário: protesto de certidão de dívida ativa e prescrição'],
102:['Direito Financeiro','Créditos adicionais: reabertura de crédito especial no exercício seguinte'],
104:['Direito Financeiro','Classificação da despesa pública: despesas correntes e inversões financeiras'],
107:['Direito do Trabalho','Poder disciplinar do empregador e despedida por justa causa'],
109:['Direito do Trabalho','Justa causa: incontinência de conduta e interpretação jurisprudencial'],
110:['Direito do Trabalho','Estabilidade de membro da CIPA e dispensa por justa causa'],
113:['Direito do Trabalho','Proteção constitucional contra despedida arbitrária e indenização compensatória'],
114:['Direito do Trabalho','Estabilidade provisória da gestante: período de proteção'],
115:['Direito Previdenciário','Acidente de trabalho: agressão durante a execução das atividades laborais'],
116:['Direito Previdenciário','Salário de contribuição: férias e horas extras'],
117:['Direito Previdenciário','Regime próprio estadual: contribuição durante licença sem vencimentos'],
118:['Direito Previdenciário','Benefício por incapacidade decorrente de acidente de trabalho e carência'],
119:['Direito Previdenciário','Pensão por morte de servidor militar: dependentes e rateio do benefício'],
120:['Direito Previdenciário','Regime próprio de previdência: aproveitamento de tempo de magistério por membro do Ministério Público']
}
const difceis=new Set([51,53,55,61,62,72,74,75,77,81,84,85,87,88,89,94,98,100,102,104,109,110,113,116,117,118,119,120])
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(qs.length!==47)throw Error(`Esperados 47 itens pendentes; recebidos ${qs.length}`)
const letras={C:0,E:1}
const decisoes=qs.map(q=>{
 const n=Number(q.numero),tema=temas[n],answer=chave[n]
 if(!tema)throw Error(`Falta classificação individual para questão ${n} (${q.id})`)
 if(!['C','E','X'].includes(answer))throw Error(`Falta resposta no gabarito oficial para questão ${n}`)
 const pagina=Number(q.pagina),anulada=answer==='X',imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2022,concurso:'PGE/RJ 2022 — 2º concurso público — Cargo 3: Analista Processual',numero_original:n,pagina,dificuldade:difceis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade normativa e nas etapas de interpretação exigidas; não é estatística oficial de acerto.',classificacao_fonte:prova,motivo:`Questão ${n}, Cargo 3 — Analista Processual. Matéria e tópico identificados pelo comando e pelo conteúdo normativo do item no caderno oficial.`,visual:{pagina,imagem,motivo:'Página original do caderno CEBRASPE conferida; mantida para consulta do enunciado e do contexto.'},gabarito_oficial:{fonte:gabarito,sha256:conferidos.sha256,numero:n,pagina:1,resposta:anulada?null:answer,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado.':'Gabarito definitivo oficial do caderno 679_PGERJ_003_01, Cargo 3.'},resposta_correta:anulada?null:letras[answer],anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado']}
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'PGE/RJ 2022 — Caderno 003 — Cargo 3: Analista Processual',documento_id:doc,registros_revisados:decisoes.length,questoes_anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero_original),materias:[...new Set(decisoes.map(x=>x.materia))],fontes:[prova,gabarito],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
