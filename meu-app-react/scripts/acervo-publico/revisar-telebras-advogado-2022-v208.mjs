import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='7bf7814beaa0ed97'
const prova='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/657_TELEBRAS_001_01.PDF'
const prelim='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/GAB_PRELIMINAR_657_TELEBRAS_001_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/TELE_JUSTIFICATIVAS_DE_GABARITO.PDF'
const concurso='TELEBRAS 2021/2022 — Especialista em Gestão de Telecomunicações — Advogado (Cargo 1)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='657_TELEBRAS_001_01.PDF')throw Error('Documento TELEBRAS não confere com o catálogo')
const gabaritos='E,E,C,C,E,E,E,E,C,C,E,E,C,E,C,C,C,C,E,C,C,E,E,E,C,C,C,E,C,E,C,E,E,C,E,E,E,C,C,C,E,C,C,C,C,E,E,C,E,E,C,E,E,C,E,C,C,E,C,E,C,C,C,E,X,E,C,E,C,C'.split(',')
// Tabela oficial preliminar CEBRASPE, itens 51 a 120. As justificativas oficiais
// registram 63 e 115 anulados e a alteração do item 111 de E para C.
const prelimPorNumero=Object.fromEntries(Array.from({length:70},(_,i)=>[i+51,gabaritos[i]]))
if(gabaritos.length!==70)throw Error(`Gabarito preliminar não contém 70 respostas: ${gabaritos.length}`)
const respostas={...prelimPorNumero,63:'X',111:'C',115:'X'}
const temas={
51:['Direito Constitucional','Controle concentrado de constitucionalidade: aditamento da petição inicial em ADI'],
52:['Direito Constitucional','Controle de constitucionalidade: lei municipal e parâmetro de controle estadual'],
53:['Direito Constitucional','Controle de constitucionalidade de lei municipal perante tribunal de justiça'],
54:['Direito Tributário','Imunidade tributária das instituições de assistência social'],
55:['Direito Tributário','Imunidade recíproca e sociedades de economia mista prestadoras de serviço público'],
56:['Direito Constitucional','Competência legislativa sobre planos de saúde e proteção do consumidor'],
57:['Direito Constitucional','Intervenção estadual em município e hipóteses previstas na Constituição'],
58:['Direito Constitucional','Competência legislativa estadual e vedação de discriminação racial na contratação pública'],
59:['Direito Constitucional','Direito à saúde e fornecimento de medicamento de uso off-label'],
60:['Direito Administrativo','Contratos administrativos: prorrogação e discricionariedade'],
61:['Direito Administrativo','Poder disciplinar e sujeição de particulares à disciplina administrativa'],
62:['Direito Administrativo','Tombamento e responsabilidade pela conservação de bem protegido'],
63:['Direito Administrativo','Improbidade administrativa e prescrição do ressarcimento ao erário'],
64:['Direito Constitucional','Concurso público: presunção de inocência e restrições a candidatos'],
65:['Direito Administrativo','Compartilhamento de infraestrutura de telecomunicações e regulação setorial'],
66:['Direito Administrativo','Responsabilidade civil de sociedade de economia mista por atos de agentes'],
67:['Direito Empresarial','Regime societário da TELEBRAS e regulação do mercado de capitais'],
68:['Direito Administrativo','Licitações: pesquisa de preços e orçamento estimativo'],
69:['Direito Civil','Desconsideração da personalidade jurídica e requisitos legais'],
70:['Direito Civil','Fundação privada: instituição por testamento e destinação patrimonial'],
71:['Direito Civil','Locação: preferência do locatário e dação em pagamento'],
72:['Direito Civil','Locação: nulidade da cumulação de garantias'],
73:['Direito Civil','Locação: reparos urgentes, dever de tolerância e rescisão'],
74:['Direito do Consumidor','Crédito consignado e informação sobre margem consignável'],
75:['Direito do Consumidor','Legitimidade de associação para ação coletiva'],
76:['Direito do Consumidor','Superendividamento: ausência do credor em audiência de conciliação'],
77:['Direito Processual Civil','Reclamação constitucional contra ato administrativo'],
78:['Direito Processual Civil','Suspensão de liminar e agravo contra decisão do presidente do tribunal'],
79:['Direito Processual Civil','Ação civil pública: competência e limites subjetivos da coisa julgada'],
80:['Direito Administrativo','Improbidade administrativa por violação a princípios'],
81:['Direito Processual Civil','Reconhecimento do pedido e cumprimento da prestação: redução de honorários'],
82:['Direito Processual Civil','Citação e intimação: impedimento temporal por casamento'],
83:['Direito Processual Civil','Ação de consignação em pagamento de prestações sucessivas'],
84:['Direito Processual Civil','Pedido alternativo em obrigação com prestações fungíveis'],
85:['Direito do Trabalho','Insalubridade: prova pericial e direito ao adicional'],
86:['Direito do Trabalho','Auxílio-doença acidentário: interrupção ou suspensão do contrato'],
87:['Direito do Trabalho','Estabilidade acidentária em contrato por prazo determinado'],
88:['Direito do Trabalho','Estabilidade sindical e registro da candidatura durante aviso-prévio'],
89:['Direito do Trabalho','Reflexos de horas extras habituais em outras verbas trabalhistas'],
90:['Direito do Trabalho','Estabilidade de membro da CIPA e extinção do estabelecimento'],
91:['Direito do Trabalho','Férias proporcionais no pedido de demissão antes de doze meses'],
92:['Direito do Trabalho','Dono da obra e responsabilidade por obrigações do empreiteiro'],
93:['Direito Processual do Trabalho','Exceção de incompetência territorial e suspensão processual'],
94:['Direito Processual do Trabalho','Distribuição dinâmica do ônus da prova'],
95:['Direito Processual do Trabalho','Recurso de revista e transcendência política'],
96:['Direito Processual do Trabalho','Revelia, confissão e recebimento de contestação em audiência'],
97:['Direito Processual do Trabalho','Perícia de insalubridade e periculosidade e adiantamento de honorários'],
98:['Direito Processual do Trabalho','Ação rescisória: prova nova e documento preexistente ignorado'],
99:['Direito Processual do Trabalho','Mandado de segurança contra decisão em execução provisória'],
100:['Direito Empresarial','Sociedade anônima: responsabilidade de acionistas pela integralização do capital'],
101:['Direito Empresarial','Ações de telefonia e complementação acionária após privatização'],
102:['Direito Empresarial','Operações societárias: incorporação e sucessão empresarial'],
103:['Direito Empresarial','Empresário: registro na junta comercial e início da atividade'],
104:['Direito Empresarial','Estabelecimento empresarial: cláusula legal de não concorrência'],
105:['Direito Empresarial','Recuperação judicial: administração da empresa pelo devedor'],
106:['Direito Empresarial','Falência: classificação de honorários como crédito extraconcursal'],
107:['Direito Empresarial','Recuperação judicial: descumprimento do plano e convolação em falência'],
108:['Direito Financeiro','Competência legislativa sobre direito financeiro'],
109:['Direito Financeiro','Lei de diretrizes orçamentárias e metas fiscais'],
110:['Direito Financeiro','Mecanismos de ajuste fiscal por excesso de despesas correntes'],
111:['Direito Financeiro','Despesa total com pessoal e limites da Lei de Responsabilidade Fiscal'],
112:['Direito Financeiro','Controle externo e acesso a informações bancárias de recursos públicos'],
113:['Direito Financeiro','Precatórios: regime constitucional de pagamento e acordos'],
114:['Direito Tributário','Execução fiscal e cobrança de créditos não tributários'],
115:['Direito Tributário','Mandado de segurança e liminar em compensação tributária'],
116:['Direito Tributário','Ação declaratória tributária e procedimento judicial aplicável'],
117:['Direito Tributário','Ação anulatória de débito fiscal e controle de atos administrativos tributários'],
118:['Direito Tributário','Extinção do crédito tributário por dação em pagamento'],
119:['Direito Tributário','Lançamento de crédito com exigibilidade suspensa'],
120:['Direito Tributário','IPI: anterioridade nonagesimal e exceções constitucionais']
}
const paginas=new Map(catalog.questoes.map(x=>[x.numero,x.pagina]))
if(Object.keys(temas).length!==70||new Set(catalog.questoes.map(x=>x.numero)).size!==70)throw Error('Classificação ou caderno oficial incompleto')
const pendentes=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc&&q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false)pendentes.push(q)
if(pendentes.length!==49)throw Error(`A varredura encontrou ${pendentes.length} questões pendentes; valide o total antes de aplicar`)
const digest=hashRevisao(Array.from({length:70},(_,i)=>respostas[i+51]).join(','))
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero_original),tema=temas[n],pagina=paginas.get(n),resposta=respostas[n]
 if(!tema||!pagina||!resposta)throw Error(`Questão ${n}: classificação, página ou resposta ausente`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2022,concurso,numero_original:n,pagina,dificuldade:[51,55,57,58,63,65,68,69,70,75,76,78,79,80,83,84,87,89,92,95,97,98,101,102,104,105,107,109,110,112,113,115,117,120].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela especificidade normativa e integração de institutos jurídicos; o CEBRASPE não publicou dificuldade por item.',motivo:`Item ${n}: classificação individual pelo conteúdo do enunciado e conferência do tema no caderno oficial do Cargo 1 (Advogado).`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura semântica individual do enunciado e conferência com o caderno oficial'},resposta_correta:resposta==='X'?null:resposta==='C'?0:1,anulada:resposta==='X',gabarito_oficial:{fonte:prelim,arquivo:'GAB_PRELIMINAR_657_TELEBRAS_001_01.PDF',justificativas,criterio:'Tabela oficial preliminar conferida com as justificativas oficiais de alteração: item 63 anulado, item 111 alterado para C e item 115 anulado.',tipo:'Tabela preliminar reconciliada com alterações/anulações oficiais',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência de respostas dos itens 51–120, reconciliada com as justificativas oficiais; não é hash dos PDFs.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,motivo:`Página ${pagina} do caderno oficial associada ao item ${n}; preserva o original para conferir a transcrição e o contexto.`}}
})
for(let p=1;p<=4;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-pref-pires-do-rio-cargos-6-7-v207'))
if(!base)throw Error('Raiz local v207 não encontrada')
const nome='revisao-telebras-advogado-2022-v208'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:70,itens_pendentes_reclassificados:decisoes.length,itens_anulados_oficiais:[63,115],item_alterado_oficial:{numero:111,resposta:'C'},gabaritos_oficiais_associados:decisoes.length,paginas_originais_conferidas:[1,2,3,4],data_aplicacao:'2022-02-20',prova,gabarito_preliminar:prelim,justificativas,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão TELEBRAS — Advogado, Cargo 1 — v208\n\n- Reclassifiquei os ${decisoes.length} registros pendentes deste caderno por matéria e assunto jurídico específico, corrigindo ano para a aplicação de 20/02/2022, concurso/cargo e dificuldade estimada. O caderno contém 70 itens, numerados de 51 a 120; os demais já não estavam marcados como pendentes.\n- Vinculei os quatro recortes originais de página para preservar enunciados, continuação de itens e conferência visual. Associei o gabarito preliminar oficial às justificativas oficiais: itens 63 e 115 anulados e item 111 alterado para C.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno Cargo 1](<${prova}>), [gabarito preliminar](<${prelim}>), [justificativas de alteração](<${justificativas}>), [página oficial do concurso](https://www.cebraspe.org.br/concursos/telebras_21).\n`)
console.log(JSON.stringify(out))
