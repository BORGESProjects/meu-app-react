import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpce-servico-social-v67'
const base='tmp/revisao-profissional/revisao-stj-enfermagem-v66/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/MP_CE_25_SERVIDOR/arquivos/055_MPCE_010_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/mp_ce_25_servidor/arquivos/Gab_Definitivo_055_MPCE_010_01.PDF'
const idsBad=new Set(['extr-ae460752fa367b8a1871'])
const idsDuplicate=new Map([
 ['extr-47f3a569448f23edcb7f','extr-96f2fedfb8437e3ddd06'],
 ['extr-42052c28acebd1e103cf','extr-a384c9f08a103482726f'],
])
const official=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8').then(s=>s.split('\n').filter(Boolean).map(JSON.parse).find(x=>x.documento_id==='8fabfecc49fb800c'))
if(!official||Object.keys(official.respostas||{}).length!==60)throw Error('Não encontrei as 60 respostas oficiais já conferidas do MPCE.')
const extra=['C','C','E','E','E','C','C','E','C','C']
for(let i=0;i<10;i++)official.respostas[String(111+i)]=extra[i]
const gabaritoSha=official.sha256
const pendentes=JSON.parse(await fs.readFile('tmp/mpce-servico-social-pendentes.json','utf8'))
const contents=new Map([
 [51,'Projeto ético-político do Serviço Social'],[52,'Reconceituação e renovação do Serviço Social'],[53,'Movimento de Reconceituação do Serviço Social'],[54,'Movimento de Reconceituação do Serviço Social'],[55,'Trabalho profissional e mercado de trabalho'],[56,'Trabalho profissional: mediação e acesso a direitos'],[57,'Formação profissional e diretrizes curriculares'],[58,'Espaços sócio-ocupacionais'],[59,'Trabalho profissional e especialização'],[60,'Renovação profissional e intenção de ruptura'],[61,'Perspectivas teórico-metodológicas do Serviço Social'],[62,'Influências teóricas na gênese do Serviço Social'],[63,'Perspectivas teórico-metodológicas: fenomenologia'],
 [64,'Legislação profissional: atribuições e penalidades'],[65,'Lei n.º 8.662/1993: exercício profissional'],[66,'Projeto de intervenção: avaliação de planos e programas'],[67,'Projeto de intervenção nos serviços de saúde'],[68,'Políticas públicas: avaliação de programas e serviços'],[69,'Projeto de intervenção profissional'],[70,'Planejamento e política social'],[71,'Planejamento e responsabilidade ético-política'],[72,'Ética profissional e diretrizes curriculares'],[73,'Formação profissional: currículo e flexibilidade'],[74,'Autonomia profissional e condições de trabalho'],[75,'Ética e responsabilidade na produção de estudos sociais'],
 [76,'Instrumentos técnico-operativos: trabalho com grupos'],[77,'Dimensões teórico-metodológica, ético-política e técnico-operativa'],[78,'Instrumentalidade e trabalho profissional'],[79,'Estudo social e entrevista domiciliar'],[80,'Entrevista semiestruturada'],[81,'Estudo social, orientação e direito à informação'],[82,'Documentos técnicos: parecer social'],[83,'Perícia social e estudo social'],[84,'Laudo social e limites de competência'],[85,'Perícia social: autonomia e vínculo profissional'],[86,'Trabalho interdisciplinar e competências profissionais'],[87,'Trabalho em equipe e manifestações técnicas'],[88,'Questão social e políticas públicas'],[89,'Questão social e políticas sociais'],
 [90,'Política habitacional e avaliação social'],[91,'Políticas sociais e relações de poder'],[92,'Benefício de Prestação Continuada: critérios de renda'],[93,'Benefício de Prestação Continuada para pessoa idosa'],[94,'Direitos da criança e do adolescente: convivência familiar'],[95,'Direitos da criança e do adolescente: trabalho educativo'],[96,'Direitos da criança e do adolescente: trabalho infantil'],[97,'Direitos da criança e do adolescente: proteção integral'],[98,'Direitos da criança e do adolescente: comunicação de violações'],[99,'Direitos da criança e do adolescente: violência e proteção'],[100,'Adoção e entrega voluntária para adoção'],[101,'Adoção e colocação em família substituta'],[102,'Direitos da criança e do adolescente: notificação de violência'],[103,'Exploração sexual de crianças e adolescentes'],[104,'Tráfico de crianças e adolescentes'],[105,'Política de atendimento à população em situação de rua'],[106,'Estatuto da Pessoa Idosa: entidades de atendimento'],[107,'Estatuto da Pessoa Idosa: fiscalização e controle'],[108,'Estatuto da Pessoa Idosa: comunicação de violações'],[109,'Lei n.º 8.662/1993: competência dos CRESS'],[110,'Lei n.º 8.662/1993: competências do CFESS'],[111,'SUS: atendimento e internação domiciliares'],[112,'SUS: direitos da pessoa usuária e acompanhamento em saúde'],[113,'Mediação: Lei n.º 13.140/2015'],[114,'Mediação judicial: instituição e encerramento'],[115,'Mediação judicial: princípios'],[116,'SINASE: medidas disciplinares'],[117,'SINASE: organização do sistema socioeducativo'],[118,'SINASE: direito à visita na internação'],[119,'SINASE: revisão de sanções disciplinares'],[120,'SINASE: avaliação do atendimento socioeducativo']
])
const headers=n=>{
 if(n<=52)return 'Acerca do projeto ético-político do Serviço Social, julgue o item.'
 if(n<=54)return 'Julgue os itens relativos ao Movimento de Reconceituação na América Latina.'
 if(n<=59)return 'Considerando as atribuições, as condições de trabalho e os espaços sócio-ocupacionais do assistente social, julgue o item.'
 if(n<=63)return 'Julgue o item sobre influências teórico-metodológicas e formas de intervenção profissional.'
 if(n<=65)return 'Julgue o item com base na Lei n.º 8.662/1993, que regulamenta a profissão de assistente social.'
 if(n<=69)return 'Julgue o item sobre formulação e avaliação de projetos, planos, programas e serviços sociais.'
 if(n<=71)return 'A respeito do planejamento como processo técnico-político, julgue o item.'
 if(n<=75)return 'Julgue o item com base no Código de Ética do(a) Assistente Social e nas diretrizes curriculares.'
 if(n<=81)return 'Julgue o item sobre a dimensão técnico-operativa e os instrumentos do trabalho profissional.'
 if(n<=85)return 'Julgue o item sobre documentos, estudo, laudo e perícia social.'
 if(n<=87)return 'Julgue o item sobre o desenvolvimento do trabalho do assistente social com profissionais de outras áreas.'
 if(n<=89)return 'Acerca das formas de expressão da questão social e de seu enfrentamento, julgue o item.'
 if(n<=93)return 'No que concerne a políticas e benefícios sociais, julgue o item.'
 if(n<=101)return 'Julgue o item sobre a Constituição Federal, a legislação e as políticas de proteção a crianças e adolescentes.'
 if(n<=105)return 'Julgue o item sobre proteção de crianças e adolescentes e enfrentamento de violações de direitos.'
 if(n<=108)return 'Com base no Estatuto da Pessoa Idosa, julgue o item.'
 if(n<=110)return 'Julgue o item com base na Lei n.º 8.662/1993, que regulamenta a profissão de assistente social.'
 if(n<=112)return 'Julgue o item à luz da Lei Orgânica da Saúde (Lei n.º 8.080/1990).'
 if(n<=115)return 'De acordo com a Lei n.º 13.140/2015, que dispõe sobre a mediação judicial entre particulares, julgue o item.'
 return 'Julgue o item relativo ao Sistema Nacional de Atendimento Socioeducativo (SINASE).'
}
const easy=new Set([53,55,57,58,64,66,68,70,73,80,88,89,91,93,97,102,104,105,106,108,110,113,115,117,118,120])
const hard=new Set([60,61,62,63,65,72,74,75,77,79,82,83,84,90,92,94,95,96,98,99,100,101,103,107,109,111,112,114,116,119])
const decisions=[]
for(const q of pendentes){
 const n=Number(q.numero_original),content=contents.get(n)
 if(!content)throw Error(`Item sem classificação semântica definida: ${q.numero_original}`)
 const page=n<=71?1:n<=89?2:n<=112?3:4
 const image=`paginas/8fabfecc49fb800c-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 const resposta=official.respostas[String(n)]
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Serviço Social',conteudo:content,ano:2025,pagina:page,dificuldade:easy.has(n)?'Fácil':hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme densidade conceitual, especificidade normativa e número de inferências; a banca não publicou taxa individual de acerto.',classificacao_fonte:prova,motivo:`MPCE 2025 — Analista Ministerial, especialidade Serviço Social, item ${n}. Classificação cotejada com o caderno oficial e com o comando temático da seção.`,imagem_pagina:image,texto_apoio:headers(n)}
 if(resposta){const annulled=resposta==='X';d.anulada=annulled;d.resposta_correta=annulled?null:resposta==='C'?0:1;d.gabarito_oficial={valor:resposta,fonte:gabarito,sha256:gabaritoSha,metodo:'Conferência com gabarito definitivo oficial do Cargo 10; itens 111–120 verificados na tabela do PDF oficial.'}}
 if(idsDuplicate.has(q.id)){d.apta_resolucao=false;d.duplicada_de=idsDuplicate.get(q.id);d.inelegibilidade_motivo=`Cópia do item ${n} do mesmo caderno, com enunciado equivalente; preservada para auditoria e desativada na resolução.`}
 if(idsBad.has(q.id)){d.apta_resolucao=false;d.inelegibilidade_motivo='Extração corrompida: o registro reúne vários itens e cabeçalhos em um único enunciado; mantido para auditoria e retirado da resolução.'}
 decisions.push(d)
}
if(decisions.length!==69||new Set(decisions.map(x=>x.id)).size!==69)throw Error(`Contagem inesperada de pendências: ${decisions.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'MPCE 2025 — Analista Ministerial — Serviço Social',documento_id:'8fabfecc49fb800c',questoes_da_prova_revisadas:69,questoes_unicas_classificadas:66,duplicatas_desativadas:2,registro_corrompido_desativado:1,gabaritos_oficiais_conferidos:70,anuladas:[72,96],imagens_de_pagina_corrigidas:69,fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
