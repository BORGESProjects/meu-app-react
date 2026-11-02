import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='b8375c7adf3d5424',ano=2025
const prova='https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/050_TRT10_005_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/Gab_Definitivo_050_TRT10_005_01.pdf'
const concurso='TRT 10ª Região 2025 — Analista Judiciário — Apoio Especializado — Enfermagem do Trabalho — Cargo 5'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==71||catalog.arquivo!=='050_TRT10_005_01.pdf')throw Error('Catálogo TRT10 Enfermagem do Trabalho divergente')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-trt10-comunicacao-social-2025-v198'))
if(start<0)throw Error('Base local v198 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),wanted=new Set(catalog.questoes.map(q=>q.id)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){active.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(active.size!==71||wanted.size)throw Error(`Esperados 71 registros TRT10; encontrados ${active.size}; ausentes ${wanted.size}`)

const materiaConteudo={
51:['Segurança do Trabalho','Promoção da saúde no trabalho: Política Nacional de Promoção da Saúde'],
52:['Segurança do Trabalho','CIPA: integração de prevenção entre contratante e contratada'],
53:['Segurança do Trabalho','PGR: avaliação e controle de riscos ocupacionais'],
54:['Enfermagem do Trabalho','PCMSO: relatório analítico e discussão de resultados'],
55:['Segurança do Trabalho','CIPA: identificação de perigos e medidas preventivas'],
56:['Ética e Legislação de Enfermagem','Sigilo profissional e divulgação de informação confidencial'],
57:['Enfermagem do Trabalho','Perfil Profissiográfico Previdenciário e monitorização biológica'],
58:['Ética e Legislação de Enfermagem','Exercício profissional e limites de atuação da enfermagem'],
59:['Ética e Legislação de Enfermagem','Sigilo profissional e compartilhamento de informações'],
60:['Ética e Legislação de Enfermagem','Publicidade profissional e Código de Ética de Enfermagem'],
61:['Saúde Ocupacional','ASO: emissão, formato e entrega ao trabalhador'],
62:['Segurança do Trabalho','Normas Regulamentadoras: aplicação a empregadores rurais'],
63:['Segurança do Trabalho','Informação e treinamento sobre riscos ocupacionais'],
64:['Segurança do Trabalho','CIPA: dimensionamento e representante de prevenção'],
65:['Higiene Ocupacional','Avaliação da exposição ocupacional ao calor e IBUTG'],
66:['Higiene Ocupacional','Exposição ao calor: hidratação e medidas preventivas'],
67:['Segurança do Trabalho','EPI: proteção da cabeça e seleção de equipamentos'],
68:['Saúde Ocupacional','Proteção radiológica: monitoração individual e dosimetria'],
69:['Saúde Ocupacional','Acidente com material biológico e emissão de CAT'],
70:['Ergonomia','NR 17: alternância entre trabalho sentado e em pé'],
71:['Enfermagem em Saúde do Adulto','Diabetes tipo 2: avaliação antropométrica e circunferência abdominal'],
72:['Imunização','Hepatite B: imunoglobulina, via e local de administração'],
73:['Segurança do Paciente','Administração de medicamentos: erros e vias de administração'],
74:['Urgência e Emergência','Desfibrilador externo automático e atendimento pré-hospitalar'],
75:['Semiologia e Semiotécnica','Aferição da pressão arterial e validação de aparelhos'],
76:['Saúde do Trabalhador','Acolhimento e encaminhamento de denúncia de assédio no trabalho'],
77:['Educação em Saúde','Aconselhamento centrado na pessoa e mudança de hábitos'],
78:['Infectologia','HIV: materiais biológicos e risco de transmissão'],
79:['Imunização','Hepatite B: profilaxia pós-exposição sexual'],
80:['Infectologia','HIV: profilaxia pós-exposição e janela de 72 horas'],
81:['Imunização','Vacina contra hepatite B: indicação durante gestação e lactação'],
82:['Ergonomia','Trabalho noturno, turnos e efeitos sobre a saúde'],
83:['Ergonomia','Carga física, mental e psíquica; pausas e recuperação psicofisiológica'],
84:['Saúde Mental no Trabalho','Riscos psicossociais e sofrimento relacionado ao trabalho'],
85:['Ergonomia','NR 17: mobiliário e adaptação às características antropométricas'],
86:['Epidemiologia','Hepatite B: marcador anti-HBs e avaliação de imunidade'],
87:['Vigilância em Saúde do Trabalhador','Notificação de suspeita de doença relacionada ao trabalho'],
88:['Epidemiologia Ocupacional','Indicadores de frequência de acidentes e horas trabalhadas'],
89:['Epidemiologia Ocupacional','Risco relativo: comparação entre grupos expostos e não expostos'],
90:['Enfermagem do Trabalho','Supervisão e educação permanente em serviço'],
91:['Enfermagem do Trabalho','Registros ocupacionais e supervisão de equipe administrativa'],
92:['Enfermagem do Trabalho','SESMT e integração dos serviços de saúde ocupacional'],
93:['Enfermagem do Trabalho','Treinamento inicial e atualização periódica de equipes'],
94:['Saúde do Trabalhador','Planejamento participativo das ações de saúde ocupacional'],
95:['Saúde Coletiva','Lei nº 8.080/1990: vigilância em saúde do trabalhador e intersetorialidade'],
96:['Saúde Coletiva','SUS e responsabilidades na saúde do trabalhador'],
97:['Ética e Legislação de Enfermagem','Código de Ética de Enfermagem e cuidado à saúde do trabalhador'],
98:['Ética e Legislação de Enfermagem','Lei nº 7.498/1986: atribuições e autonomia profissional'],
99:['Saúde do Trabalhador','Qualidade de vida no trabalho: dimensões físicas, emocionais e organizacionais'],
100:['Segurança do Trabalho','Identificação de perigos e avaliação quantitativa de riscos'],
101:['Higiene Ocupacional','Insalubridade: exposição, jornada e eficácia do EPI'],
102:['Educação em Saúde','Adesão a medidas preventivas e dever de proteção do empregador'],
103:['Segurança do Trabalho','Capacitação periódica para uso de EPI'],
104:['Segurança do Trabalho','Responsabilidades do empregador e do trabalhador quanto a EPI'],
105:['Segurança do Trabalho','Programas preventivos: campanhas, inspeções e análise de incidentes'],
106:['Direito Administrativo','Sistema de registro de preços e adesão por entes federais'],
107:['Direito Administrativo','Convênios com entidades privadas sem fins lucrativos'],
108:['Direito Financeiro','Convênios: empenho e cronograma de desembolso'],
109:['Licitações e Contratos','Pesquisa de preços e normas coletivas em contratos administrativos'],
110:['Licitações e Contratos','Pesquisa de preços e matriz de alocação de riscos'],
111:['Licitações e Contratos','Estimativa de preços e mitigação de sobrepreço'],
112:['Licitações e Contratos','Contratações sustentáveis de produtos sujeitos a registro sanitário'],
113:['Licitações e Contratos','Compras públicas sustentáveis e desenvolvimento sustentável'],
114:['Licitações e Contratos','Sustentabilidade, inovação e poder de compra estatal'],
115:['Licitações e Contratos','Planejamento e etapas de contratação sustentável'],
116:['Licitações e Contratos','Gestão de riscos e critérios de sustentabilidade'],
117:['Licitações e Contratos','Governança das contratações: definição e especificação do objeto'],
118:['Licitações e Contratos','Plano de contratações anual na Justiça do Trabalho'],
119:['Licitações e Contratos','Compras compartilhadas no âmbito da Justiça do Trabalho'],
120:['Licitações e Contratos','Documento de formalização da demanda: elementos mínimos']
}
if(Object.keys(materiaConteudo).length!==70)throw Error('Classificações não cobrem os 70 itens oficiais')
const answerTokens=`C C C E E E E E C E E E C C E C C E C E
E C E E C C E E C C E C C C E C C C E E
C C E E C E X X C E C C E E E C C E E E
C C C E E C C E C E`.trim().split(/\s+/)
if(answerTokens.length!==70)throw Error('Sequência de gabarito não contém os 70 itens oficiais')
const respostas=new Map(Array.from({length:70},(_,i)=>[i+51,answerTokens[i]]))
if(respostas.get(97)!=='X'||respostas.get(98)!=='X'||respostas.get(80)!=='C')throw Error('Anulações ou resposta do item 80 divergem do gabarito oficial')
const digest=hashRevisao(answerTokens.join(',')),provaPorNumero=n=>Math.floor((n-51)/20)+1
const contextos={
56:'Julgue os itens subsequentes, acerca de atribuições e responsabilidades de enfermeiros do trabalho e dos demais enfermeiros, determinadas por documentos legais e normativos.',
61:'Considere uma empresa de aluguel de máquinas e equipamentos agrícolas sem operador, sediada em área rural, com 23 empregados sob o regime celetista.',
65:'João, empregado da empresa X, trabalha em atividade que implica exposição ao calor, em ambiente interno, sem carga solar direta.',
68:'Considere um serviço de saúde exercido por trabalhadores sob o regime celetista.',
71:'Julgue os itens subsequentes, relacionados à assistência de enfermagem ambulatorial.',
76:'Julgue os itens referentes à educação sanitária, orientação sobre saúde e segurança e prevenção de doenças infecciosas e profissionais.',
82:'Julgue os itens sobre condições ergonômicas de trabalho e fatores de fadiga e estresse ocupacional.',
86:'Julgue os itens sobre epidemiologia e estudos estatísticos em saúde do trabalho, registros e controle de dados ocupacionais.',
90:'Julgue os itens considerando a legislação vigente sobre organização e funcionamento da enfermagem do trabalho e as boas práticas nesse serviço.',
94:'Considere as responsabilidades dos setores público e privado quanto à saúde do trabalhador, o papel do enfermeiro do trabalho e o planejamento das ações de saúde ocupacional, de acordo com a legislação brasileira.',
99:'Julgue os itens sobre identificação de riscos no ambiente laboral, uso de EPI e planejamento de programas de prevenção de acidentes.',
106:'Julgue os itens com base nos Decretos nº 11.531/2023 e nº 11.462/2023.',
109:'Considere a IN SEGES/ME nº 65/2021, sobre pesquisa de preços, e a IN MPOG nº 5/2017, sobre contratação de serviços sob regime de execução indireta.',
112:'Julgue os itens à luz do Guia de Contratações Sustentáveis da Justiça do Trabalho.',
117:'Julgue os itens com base na Resolução CSJT nº 364/2023, sobre a Política de Governança e Gestão das Contratações da Justiça do Trabalho.'
}
const contextoDe=n=>{let inicio=0;for(const k of Object.keys(contextos).map(Number).sort((a,b)=>a-b))if(k<=n)inicio=k;return contextos[inicio]||''}
const dup=new Map([['extr-f0e32f46a020b09f1261','extr-481f48f89e78b05e5f6a'],['extr-6a2a7f780c76fac84dbd','extr-a11afbda454434c1495c']])
const defective=new Set(dup.keys()),decisoes=catalog.questoes.map(e=>{
 const q=active.get(e.id),n=e.numero,t=materiaConteudo[n],key=respostas.get(n),pagina=provaPorNumero(n)
 if(!q||!t||!key||!pagina)throw Error(`Item ${n}: campo ou gabarito ausente`)
 const texto=defective.has(e.id)?q.enunciado:(n===60?'O enfermeiro está eticamente proibido de anunciar a prestação de seus serviços, mesmo que detenha as necessárias habilidades e competências para prestá-los.':q.enunciado)
 const p={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano,concurso,numero_original:n,pagina,dificuldade:[53,54,58,62,64,68,71,72,75,79,80,83,85,86,88,89,95,96,98,100,101,106,107,109,110,111,115,116,117,118,120].includes(n)?'Difícil':[51,52,56,57,59,61,63,65,66,67,69,70,73,74,76,77,78,81,82,84,87,90,91,92,93,94,97,99,102,103,104,105,108,112,113,114,119].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, normativa e clínica; a banca não publica níveis de dificuldade.',motivo:`Item ${n} conferido no caderno oficial do Cargo 5; conteúdo específico: ${t[1]}.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do enunciado e dos blocos temáticos do caderno oficial'},resposta_correta:key==='X'?null:key==='C'?0:1,anulada:key==='X',gabarito_oficial:{fonte:gabarito,arquivo:'Gab_Definitivo_050_TRT10_005_01.pdf',prova:catalog.arquivo,numero:n,pagina:1,resposta:key,sha256:digest,hash_metodo:'SHA-256 da sequência normalizada das respostas transcritas da tabela oficial; não é hash do PDF.',criterio:'Gabarito definitivo CEBRASPE do Cargo 5 — Enfermagem do Trabalho.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,motivo:`Conferência visual da página ${pagina} do caderno oficial; cotejo de numeração e texto.`}}
 if(!defective.has(e.id))p.texto_apoio=contextoDe(n)
 if(n===60)p.enunciado=texto
 if(defective.has(e.id)){p.apta_resolucao=false;p.duplicada_de=dup.get(e.id);p.inelegibilidade_motivo='Registro OCR concatenou itens de páginas distintas e numeração incompatível; mantido no histórico, fora da resolução.'}
 return p
})
const imagePage2Hash=hashRevisao(await fs.readFile(`public/acervo-extraido/paginas/${doc}-0002.webp`))
const additions=[{n:80,enunciado:'As situações de exposição ao HIV requerem atendimento de urgência ao paciente, devido à necessidade de início precoce da profilaxia, que deve ser realizada no período de até 72 horas da exposição, para maior eficácia da intervenção; caso o atendimento ocorra após 72 horas da exposição, não se indica a quimioprofilaxia com antirretrovirais.'}].map(({n,enunciado})=>{
 const t=materiaConteudo[n],key=respostas.get(n),pagina=2,apoio=contextoDe(n)
 return {id:'extr-trt10-enfermagem-trabalho-q80',banca:'CEBRASPE',banca_original:'CEBRASPE',concurso,organizadora:'CEBRASPE',aplicacao:'TRT 10ª Região — Analista Judiciário — Enfermagem do Trabalho — Cargo 5',ano,numero_original:n,pagina,documento_id:doc,materia:t[0],conteudo:t[1],enunciado,texto_apoio:apoio,opcoes:['Certo','Errado'],resposta_correta:key==='X'?null:key==='C'?0:1,anulada:key==='X',origem:'CEBRASPE — TRT 10ª Região 2025 — Analista Judiciário — Enfermagem do Trabalho',fonte:prova,documento_origem:catalog.arquivo,tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.99,classificacao_metodo:'Transcrição visual do caderno oficial e classificação por conteúdo',classificacao_evidencia:`Item ${n}, página ${pagina}; transcrito do caderno oficial.`,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; não é nível publicado pela banca.',gabarito_oficial:{fonte:gabarito,arquivo:'Gab_Definitivo_050_TRT10_005_01.pdf',prova:catalog.arquivo,numero:n,pagina:1,resposta:key,sha256:digest,hash_metodo:'SHA-256 da sequência normalizada das respostas transcritas da tabela oficial; não é hash do PDF.',criterio:'Gabarito definitivo CEBRASPE do Cargo 5 — Enfermagem do Trabalho.'},pagina_imagem:`paginas/${doc}-0002.webp`,imagens_paginas:[`paginas/${doc}-0002.webp`],paginas_origem:[pagina],contexto_paginas:[{pagina,imagem:`paginas/${doc}-0002.webp`,texto:apoio}],integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]},revisao_semantica_visual:{imagem:`paginas/${doc}-0002.webp`,pagina,sha256:imagePage2Hash,motivo:'Transcrição do item 80 conferida visualmente na página 2 do caderno oficial.',metodo:'Conferência visual individual da página original'}}
})
if(decisoes.length!==71||additions.length!==1||defective.size!==2||new Set(catalog.questoes.filter(q=>!defective.has(q.id)).map(q=>q.numero)).size!==69)throw Error('Cobertura, contaminações ou lacunas divergem do catálogo')
if(decisoes.filter(p=>p.apta_resolucao===false).length!==2||decisoes.filter(p=>p.gabarito_oficial).length!==71)throw Error('Registros invalidados ou gabaritos incompletos')
for(let pagina=1;pagina<=4;pagina++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`)
const result=await aplicarRevisoesIndividuais({nome:'revisao-trt10-enfermagem-trabalho-2025-v199',base,decisoes,adicoes:additions})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trt10-enfermagem-trabalho-2025-v199/acervo-extraido')
const out={...result,documento:catalog.arquivo,registros_revistos:71,itens_oficiais_cobertos:70,itens_adicionados:1,registros_ocr_invalidados:2,itens_anulados:2,gabaritos_oficiais_associados:70,paginas_originais_conferidas:[1,2,3,4],data_aplicacao:'2025-03-16',prova,gabarito,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-trt10-enfermagem-trabalho-2025-v199.json',JSON.stringify(out,null,2))
const section=`\n\n## Revisão TRT 10 — Enfermagem do Trabalho — v199\n\n- Revi visualmente as quatro páginas do caderno oficial Cargo 5 (itens 51–120, prova aplicada em 16/03/2025). Reclassifiquei banca, concurso, ano, matéria, assunto, número, página e dificuldade estimada; vinculei o gabarito definitivo oficial a todos os 70 itens, com os itens 97 e 98 anulados.\n- O catálogo tinha 71 registros: o item 80 estava ausente e dois registros OCR estavam concatenados com blocos de outras questões e numeração incompatível (55 e 60). Excluí essas duas cópias corrompidas da resolução, mantive os registros históricos e transcrevi o item 80 diretamente da página 2. Corrigi o texto de apoio dos itens com cenário compartilhado e mantive as páginas originais associadas.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno Cargo 5](https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/050_TRT10_005_01.pdf), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/trt10_24/arquivos/Gab_Definitivo_050_TRT10_005_01.pdf), [página do concurso](https://www.cebraspe.org.br/concursos/TRT10_24).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
