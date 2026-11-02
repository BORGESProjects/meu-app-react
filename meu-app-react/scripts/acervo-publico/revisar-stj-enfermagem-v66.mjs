import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-stj-enfermagem-v66'
const base='tmp/revisao-profissional/revisao-pf-2021-agente-v65/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/STJ_24/arquivos/018_STJ_008_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/STJ_24/arquivos/GAB_DEFINITIVO_018_STJ_008_01.PDF'
const examImageBase='public/acervo-extraido/paginas/cf9fa8b06384cebe-'
const gabaritos=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-candidatos.json','utf8'))
const entry=gabaritos.find(x=>x.documento_id==='cf9fa8b06384cebe')
const conferidos=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split('\n').filter(Boolean).map(x=>JSON.parse(x))
const gab=conferidos.find(x=>x.documento_id==='cf9fa8b06384cebe')
if(!entry||!gab||!Object.keys(gab.respostas).length)throw Error('Fonte oficial do gabarito não encontrada no catálogo conferido.')
const gabaritoSha=gab.sha256
const pendentes=JSON.parse(await fs.readFile('tmp/stj-enfermagem-pendentes.json','utf8'))
const conteudos=new Map([
 [52,'Gestão e processo de enfermagem'],[54,'Sistema Único de Saúde e epidemiologia'],[55,'Princípios e organização do SUS'],[56,'Promoção e prevenção em saúde'],[57,'Organização e estrutura do SUS'],[58,'Saúde indígena e organização do SUS'],[59,'História constitucional do direito à saúde'],[60,'Níveis de atenção à saúde'],[61,'Políticas de atenção à saúde'],
 [62,'Infecções sexualmente transmissíveis: donovanose'],[63,'Neonatologia: reanimação do recém-nascido'],[64,'Saúde da pessoa idosa: avaliação funcional'],[65,'Hepatites virais: cuidado nutricional'],[66,'Saúde da mulher: coleta citopatológica'],[67,'Saúde do adolescente: imunização e confidencialidade'],[68,'Doenças infecciosas: tétano acidental'],[69,'Urgência e emergência: suporte avançado de vida'],[70,'Urgência e emergência: cadeia de sobrevivência'],[71,'Urgência e emergência: acesso vascular e medicação'],[72,'Urgência e emergência: ressuscitação cardiopulmonar'],
 [73,'Segurança do paciente: administração de medicamentos'],[74,'Terapia intravenosa: seleção de cateter'],[75,'Terapia intravenosa: soluções e osmolaridade'],[76,'Terapia intravenosa: água para injeção'],[77,'Cálculo de medicamentos: concentração e volume'],[78,'Farmacologia: infusão de antimicrobianos'],[79,'Promoção da saúde e prevenção do câncer'],[80,'Políticas de atenção às doenças crônicas'],[81,'Promoção da saúde e autocuidado digital'],[82,'Imunização e vigilância em saúde'],
 [83,'Biossegurança: gerenciamento de resíduos em saúde'],[84,'Biossegurança: contenção de agentes biológicos'],[85,'Segurança do trabalho: materiais perfurocortantes'],[86,'Biossegurança: contenção primária'],[87,'Precauções e prevenção de infecções'],[88,'Legislação profissional: imunização'],[89,'Direitos e condições de trabalho em enfermagem'],[90,'Legislação profissional: atribuições da enfermagem'],[91,'Legislação profissional: piso salarial'],[92,'Ética profissional: infrações e penalidades'],[93,'Ética profissional: responsabilidade e denúncia'],[94,'Ética profissional: notificação de violência'],[95,'Gestão de recursos materiais: distribuição de medicamentos'],[96,'Gestão de estoques em serviços de saúde'],[97,'Gestão de materiais: previsão e provisão'],
 [98,'Sistematização da assistência: Processo de Enfermagem'],[99,'Sistematização da assistência: implementação'],[100,'Registros e documentação de enfermagem'],[101,'Sistematização da assistência: avaliação'],[102,'Vigilância em saúde: perfil epidemiológico'],[103,'Vigilância em saúde: participação social'],[104,'Política Nacional de Vigilância em Saúde: princípios'],[105,'Notificação compulsória e investigação epidemiológica'],[106,'Notificação compulsória: lista nacional'],[107,'Notificação compulsória: varicela'],[108,'Vigilância epidemiológica: sistemas de informação'],[109,'Vigilância epidemiológica: surtos respiratórios'],[110,'Imunização: eventos supostamente atribuíveis'],[111,'Vigilância sentinela da influenza'],[112,'Vigilância de mpox'],[113,'Diagnóstico laboratorial de arboviroses'],[114,'Vigilância epidemiológica: classificação de casos'],[115,'Manejo clínico da dengue na gestação'],[116,'Prevenção e vacinação contra mpox'],[117,'Vigilância epidemiológica da febre do Oropouche'],[118,'Epidemiologia: investigação de surtos e casos secundários'],[119,'Epidemiologia: medidas de associação e risco relativo'],[120,'Vigilância epidemiológica: resposta municipal a eventos atípicos']
])
const contextoPorNumero=n=>{
 if(n>=51&&n<=53)return 'Em relação ao gerenciamento de enfermagem em serviços de saúde, julgue os itens com base na regulamentação do Conselho Federal de Enfermagem.'
 if(n<=56)return 'De acordo com a Constituição Federal de 1988 e a legislação básica do Sistema Único de Saúde (SUS), julgue o item.'
 if(n<=59)return 'Acerca da trajetória histórica do SUS, de sua estrutura e de sua organização, julgue o item.'
 if(n<=61)return 'No que se refere aos serviços e níveis de assistência à saúde e às políticas e programas do Ministério da Saúde no SUS, julgue o item.'
 if(n<=68)return 'Julgue o item sobre assistência de enfermagem conforme as orientações do Ministério da Saúde.'
 if(n<=72)return 'Considere as recomendações da American Heart Association sobre suporte básico e avançado de vida em emergência.'
 if(n<=78)return 'Com relação aos cuidados de enfermagem na administração de medicamentos e soluções, julgue o item.'
 if(n<=82)return 'Julgue o item sobre ações estratégicas para prevenção e enfrentamento de doenças transmissíveis e crônicas.'
 if(n<=87)return 'Considere os protocolos nacionais de biossegurança e de gerenciamento de resíduos em serviços de saúde.'
 if(n<=91)return 'Julgue o item com base na legislação que rege o exercício profissional da enfermagem.'
 if(n<=94)return 'Julgue o item com base no Código de Ética dos Profissionais de Enfermagem.'
 if(n<=97)return 'A gestão de recursos materiais em saúde busca prover os recursos necessários com qualidade, quantidade adequada, no tempo certo e ao menor custo.'
 if(n<=101)return 'Julgue o item sobre a Sistematização da Assistência de Enfermagem e o Processo de Enfermagem.'
 if(n<=104)return 'Julgue o item com base na Política Nacional de Vigilância em Saúde (PNVS).'
 if(n<=108)return 'Julgue o item sobre notificação compulsória de doenças, agravos e eventos de saúde pública.'
 if(n<=111)return 'Julgue o item sobre vigilância epidemiológica e sanitária.'
 if(n<=117)return 'Julgue o item sobre dengue, outras arboviroses, febre do Oropouche e resposta epidemiológica à mpox.'
 return 'Julgue o item acerca da investigação de epidemias.'
}
const baixa=new Set([54,56,57,60,61,65,67,79,82,88,89,93,96,98,99,102,103,106,110,111,112,114,115,116,117,120])
const alta=new Set([63,69,70,71,72,73,75,77,83,84,87,92,100,105,109,118,119])
const decisions=[]
const seen=new Map()
for(const q of pendentes){
 const n=Number(q.numero_original)
 const conteudo=conteudos.get(n)
 if(!conteudo)throw Error(`Item ${n} sem conteúdo editorial definido.`)
 const first=seen.get(n)
 const anulada=gab.respostas[String(n)]==='X'
 const resposta=gab.respostas[String(n)]
 const page=n<=72?1:n<=101?2:3
 const image=`paginas/cf9fa8b06384cebe-${String(page).padStart(4,'0')}.webp`
 await fs.access(`${examImageBase}${String(page).padStart(4,'0')}.webp`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Enfermagem',conteudo,ano:2024,pagina:page,dificuldade:baixa.has(n)?'Fácil':alta.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial a partir da especificidade técnica, da leitura do enunciado e das etapas de raciocínio; a prova não publica taxa individual de acerto.',classificacao_fonte:prova,motivo:`STJ 2024 — Analista Judiciário, área de apoio especializado, especialidade Enfermagem, item ${n}. Classificação conferida no caderno oficial; contexto de comando associado ao bloco correto.`,imagem_pagina:image,texto_apoio:contextoPorNumero(n)}
 if(resposta){
  d.anulada=anulada
  d.resposta_correta=anulada?null:resposta==='C'?0:1
  d.gabarito_oficial={valor:resposta,fonte:gabarito,sha256:gabaritoSha,metodo:'Conferência com a linha do gabarito definitivo oficial identificado para o Cargo 8.'}
 }
 if(first){d.apta_resolucao=false;d.duplicada_de=first.id;d.inelegibilidade_motivo=`Cópia exata do item ${n} na mesma edição e no mesmo caderno; preservada para auditoria, sem duplicar na resolução.`}
 else seen.set(n,q)
 decisions.push(d)
}
if(decisions.length!==68||new Set(decisions.map(x=>x.id)).size!==68)throw Error(`Contagem inesperada: ${decisions.length} decisões.`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'STJ 2024 — Analista Judiciário — Enfermagem',documento_id:'cf9fa8b06384cebe',questoes_da_prova_revisadas:68,questoes_unicas_classificadas:67,duplicatas_desativadas:1,gabaritos_oficiais_vinculados:Object.values(gab.respostas).filter(x=>x==='C'||x==='E').length,gabaritos_ausentes_neste_registro:[111,112,113,114,115,116,117,118,119,120],anuladas:Object.entries(gab.respostas).filter(([,v])=>v==='X').map(([n])=>Number(n)),imagens_de_pagina_corrigidas:68,fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
