import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-secont-es-2022-cargo5-engenharia-v284'
const base='tmp/revisao-profissional/revisao-pge-rj-2022-cargo3-direito-v283/acervo-extraido'
const doc='9b947ee4f58d73fa'
const prova='https://cdn.cebraspe.org.br/concursos/secont_es_22/arquivos/690_SECONT_ES_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/secont_es_22/arquivos/GAB_DEFINITIVO_690_SECONT_ES_005_01.PDF'
const registro=JSON.parse((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`)))
if(registro.status!=='tabela_lida'||registro.sha256!=='3bae33e2a9d113936a0989bf0b56532723fa6af66c4a3cc5c17f1b283c59fb0f')throw Error('Gabarito não consta como conferido')
const chave={...registro.respostas,111:'E',112:'E',113:'C',114:'E',115:'E',116:'C',117:'C',118:'C',119:'E',120:'X'}
const temas={
72:['Engenharia Civil','Projeto básico: estudos técnicos preliminares, viabilidade, impacto ambiental, custo e prazo'],
73:['Engenharia Civil','Orçamento de obras: encargos sociais e composição do BDI'],
75:['Engenharia Civil','Fiscalização de obras: recebimento provisório e responsabilidade técnica'],
76:['Engenharia Civil','Contratos de obras: medição na execução semi-integrada'],
77:['Engenharia Civil','Gestão de contratos de obras: atraso, multa de mora e rescisão unilateral'],
79:['Engenharia Civil','Contratação integrada: limites de alteração contratual por variação de quantitativos'],
80:['Engenharia Civil','Contratos administrativos: apostilamento e registro de dotação suplementar'],
81:['Direito Ambiental','Licenciamento ambiental: estudos ambientais e exigência de RIMA'],
82:['Direito Ambiental','Unidades de conservação: desafetação e competência legal'],
83:['Direito Ambiental','Licenciamento ambiental de rodovias: prazo da licença de operação'],
84:['Engenharia Civil','Orçamento de obras: encargos financeiros no BDI e atraso de pagamento'],
85:['Engenharia Civil','Orçamento de obras: ressarcimento de custos financeiros por atraso de pagamento'],
86:['Engenharia Civil','Orçamento de obras: classificação de encargos financeiros como custo direto ou indireto'],
87:['Engenharia Civil','Materiais de construção: argila expandida e propriedades do concreto leve'],
88:['Engenharia Civil','Materiais de construção: finura do cimento, resistência e exsudação do concreto'],
89:['Engenharia Civil','Orçamentação: coeficientes de consumo e perdas de materiais no SINAPI'],
90:['Engenharia Civil','Orçamentação: referências de custos desoneradas e não desoneradas do SINAPI'],
91:['Engenharia Civil','Orçamentação: custos de ociosidade em composições unitárias'],
92:['Engenharia Civil','Instalações prediais hidrossanitárias: desconectores e gases do esgoto'],
93:['Engenharia Civil','Instalações prediais de água: dimensionamento pelo consumo provável'],
94:['Engenharia Civil','Instalações de esgoto: sifonamento e ventilação de ramais'],
95:['Engenharia Civil','Orçamento de obras: classificação de encargos sociais como custos diretos'],
96:['Engenharia Civil','Orçamento de obras: administração local e administração central'],
97:['Engenharia Civil','Custos rodoviários: fator de interferência de tráfego no SICRO'],
98:['Engenharia Civil','Custos rodoviários: mobilização e desmobilização de equipamentos'],
99:['Engenharia Civil','Orçamento de obras: administração central e composição do BDI'],
100:['Engenharia Civil','Terraplenagem: espessura de camadas de aterro compactadas'],
101:['Engenharia Civil','Terraplenagem: ensaios de compactação e índice de suporte Califórnia'],
102:['Engenharia Civil','Terraplenagem: tratamento de material rochoso na plataforma de corte'],
104:['Engenharia Civil','Terraplenagem: empolamento e medição de volume escavado'],
105:['Engenharia Civil','Sinalização rodoviária: materiais termoplásticos extrudados e retrorrefletividade'],
106:['Engenharia Civil','Sinalização rodoviária: controle de retrorrefletividade'],
107:['Engenharia Civil','Pavimentação: concreto asfáltico, camada binder e aderência'],
108:['Engenharia Civil','Pavimentação: índice de suporte de sub-base e estabilização de solos'],
109:['Engenharia Civil','Obras hidráulicas: drenagem interna e estabilidade de barragens de terra'],
110:['Engenharia Civil','Hidráulica: escoamento gradualmente variado e controle por comporta'],
111:['Engenharia Civil','Hidráulica de instalações hidrelétricas: golpe de aríete e chaminé de equilíbrio'],
112:['Engenharia Civil','Turbinas hidráulicas: sistemas de fechamento e condução de água'],
113:['Engenharia Civil','Hidráulica de vertedores: soleira espessa e lâmina vertente'],
114:['Engenharia Civil','Irrigação: sistemas localizados por gotejamento e microaspersão'],
115:['Engenharia Civil','Gestão de perímetros irrigados: métodos e operação da distribuição de água'],
116:['Engenharia Civil','Gestão de perímetros irrigados: operação, manutenção e contratação de serviços'],
117:['Engenharia Civil','Tratamento de água: flotação por ar dissolvido e remoção de coloides'],
118:['Engenharia Civil','Hidráulica: método de Hardy Cross em redes de distribuição malhadas'],
119:['Engenharia Civil','Hidrologia: amortecimento de cheias em reservatórios'],
120:['Engenharia Civil','Saneamento: tratamento secundário de esgoto e lagoas de estabilização']
}
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(qs.length!==45)throw Error(`Esperados 45 itens; recebidos ${qs.length}`)
const letras={C:0,E:1},difceis=new Set([72,73,76,79,81,84,86,89,90,92,93,97,99,101,104,107,108,109,110,111,112,113,117,118,119,120])
const contextos={
 81:'Com base no disposto na legislação ambiental brasileira, julgue os itens subsecutivos.',
 82:'Com base no disposto na legislação ambiental brasileira, julgue os itens subsecutivos.',
 83:'Com base no disposto na legislação ambiental brasileira, julgue os itens subsecutivos.',
 84:'Em uma obra pública, o pagamento das medições estava atrasado havia três meses, embora a obra seguisse o cronograma. O contratado solicitou as parcelas atrasadas com juros e correção monetária. O fiscal informou que os custos de possíveis atrasos já seriam ressarcidos pela parcela de encargos financeiros do BDI. Julgue os itens com base nessa situação.',
 85:'Em uma obra pública, o pagamento das medições estava atrasado havia três meses, embora a obra seguisse o cronograma. O contratado solicitou as parcelas atrasadas com juros e correção monetária. O fiscal informou que os custos de possíveis atrasos já seriam ressarcidos pela parcela de encargos financeiros do BDI. Julgue os itens com base nessa situação.',
 86:'Em uma obra pública, o pagamento das medições estava atrasado havia três meses, embora a obra seguisse o cronograma. O contratado solicitou as parcelas atrasadas com juros e correção monetária. O fiscal informou que os custos de possíveis atrasos já seriam ressarcidos pela parcela de encargos financeiros do BDI. Julgue os itens com base nessa situação.',
 89:'Considerando a aplicação do Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI) na elaboração de orçamentos de referência, julgue os itens.',
 90:'Considerando a aplicação do Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI) na elaboração de orçamentos de referência, julgue os itens.',
 91:'Considerando a aplicação do Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI) na elaboração de orçamentos de referência, julgue os itens.',
 92:'Ao inspecionar as instalações hidrossanitárias de um prédio recém-construído, o engenheiro constatou ausência de desconectores entre alguns ramais de esgoto primário e secundário, falta de ventilação de ramais secundários e baixa vazão simultânea nas torneiras dos lavatórios, indicando falha de dimensionamento.',
 93:'Ao inspecionar as instalações hidrossanitárias de um prédio recém-construído, o engenheiro constatou ausência de desconectores entre alguns ramais de esgoto primário e secundário, falta de ventilação de ramais secundários e baixa vazão simultânea nas torneiras dos lavatórios, indicando falha de dimensionamento.',
 94:'Ao inspecionar as instalações hidrossanitárias de um prédio recém-construído, o engenheiro constatou ausência de desconectores entre alguns ramais de esgoto primário e secundário, falta de ventilação de ramais secundários e baixa vazão simultânea nas torneiras dos lavatórios, indicando falha de dimensionamento.',
 97:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT, julgue os itens.',
 98:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT, julgue os itens.',
 99:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT, julgue os itens.',
 100:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT e dos requisitos para a execução de projetos e obras de terraplenagem, julgue os itens.',
 101:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT e dos requisitos para a execução de projetos e obras de terraplenagem, julgue os itens.',
 102:'Acerca da metodologia e dos conceitos do Sistema de Custos Rodoviários (SICRO) do DNIT e dos requisitos para a execução de projetos e obras de terraplenagem, julgue os itens.',
 104:'Dados para o serviço de terraplenagem de aterro com material de área de empréstimo: volume de escavação in natura de 5.300 m³; densidade in natura de 1.700 kg/m³; empolamento de 20%; distância média de transporte até o aterro de 4.000 m.',
 105:'Julgue os itens sobre execução dos serviços de sinalização rodoviária.',
 106:'Julgue os itens sobre execução dos serviços de sinalização rodoviária.',
 107:'Acerca da execução dos serviços de pavimentação rodoviária, julgue os itens.',
 108:'Acerca da execução dos serviços de pavimentação rodoviária, julgue os itens.',
 109:'Julgue os itens sobre barragens, soleiras, canais, condutos sob pressão e turbinas hidráulicas.',
 110:'Julgue os itens sobre barragens, soleiras, canais, condutos sob pressão e turbinas hidráulicas.',
 111:'Julgue os itens sobre barragens, soleiras, canais, condutos sob pressão e turbinas hidráulicas.',
 112:'Julgue os itens sobre barragens, soleiras, canais, condutos sob pressão e turbinas hidráulicas.',
 113:'Julgue os itens sobre barragens, soleiras, canais, condutos sob pressão e turbinas hidráulicas.',
 114:'No que se refere à irrigação e à drenagem, julgue os itens.',
 115:'No que se refere à irrigação e à drenagem, julgue os itens.',
 116:'No que se refere à irrigação e à drenagem, julgue os itens.',
 117:'No que se refere ao tratamento de água, julgue o item.',
 118:'No que se refere à análise de redes de abastecimento, julgue o item.',
 119:'No que se refere ao amortecimento de cheias em reservatórios, julgue o item.',
 120:'No que se refere ao tratamento secundário de esgoto, julgue o item.'
}
const cortarApos={80:'Com base no disposto',83:'OBRAS DE EDIFICAÇÕES',88:'Considerando a aplicação do SINAPI',91:'690005_01N222893',96:'OBRAS RODOVIÁRIAS',102:'Os dados a seguir são relativos',104:'Julgue os itens subsecutivos, a respeito da execução dos serviços de sinalização rodoviária.',113:'No que se refere a irrigação e drenagem'}
const decisoes=qs.map(q=>{
 const n=Number(q.numero),tema=temas[n],answer=chave[n]
 if(!tema)throw Error(`Sem classificação para item ${n}`)
 if(!['C','E','X'].includes(answer))throw Error(`Sem chave oficial para item ${n}`)
 const pagina=Number(q.pagina),anulada=answer==='X',imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2022,concurso:'SECONT/ES 2022 — Auditor do Estado — Especialidade: Engenharia Civil (Cargo 5)',numero_original:n,pagina,dificuldade:difceis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme conhecimento técnico, leitura normativa e complexidade de raciocínio; a banca não divulga dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n} do Cargo 5 — Engenharia Civil; classificado pelo assunto específico indicado no comando e no conteúdo do caderno oficial.`,visual:{pagina,imagem,motivo:'Página do caderno oficial conferida e preservada para texto-base, dados, diagramas e elementos visuais.'},gabarito_oficial:{fonte:gabarito,sha256:registro.sha256,numero:n,pagina:1,resposta:anulada?null:answer,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado.':'Gabarito definitivo oficial do caderno 690_SECONT_ES_005_01.'},resposta_correta:anulada?null:letras[answer],anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado']}
 if(contextos[n])d.texto_apoio=contextos[n]
 if(cortarApos[n]){const idx=q.enunciado.indexOf(cortarApos[n]);if(idx>=0)d.visual.enunciado=q.enunciado.slice(0,idx).trim()}
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'SECONT/ES 2022 — Caderno 005 — Auditor do Estado, Engenharia Civil',documento_id:doc,registros_revisados:decisoes.length,questoes_anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero_original),contextos_textuais_reconstruidos:Object.keys(contextos).length,enunciados_separados_de_cabecalhos:Object.keys(cortarApos).filter(n=>decisoes.find(d=>d.numero_original===Number(n))?.visual?.enunciado).map(Number),fontes:[prova,gabarito],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
