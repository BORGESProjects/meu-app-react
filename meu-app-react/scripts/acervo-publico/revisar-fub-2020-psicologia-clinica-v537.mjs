import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const nome='revisao-fub-2020-psicologia-clinica-v537',doc='5eb42a0aa9a78f19'
const base='tmp/revisao-profissional/revisao-prefeitura-sao-cristovao-2019-historia-v536/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_19/arquivos/545_FUB_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/fub_19/arquivos/GAB_DEFINITIVO_545_FUB_005_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/fub_19/arquivos/FUB_19_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)
const answers='51:C|52:E|53:E|54:E|55:C|56:C|57:C|58:E|59:C|60:X|61:E|62:E|63:E|64:C|65:E|66:X|67:C|68:C|69:C|70:E|71:C|72:C|73:C|74:E|75:C|76:E|77:E|78:C|79:E|80:C|81:C|82:E|83:E|84:C|85:E|86:E|87:C|88:E|89:X|90:E|91:C|92:C|93:C|94:E|95:E|96:C|97:C|98:E|99:C|100:C|101:C|102:C|103:C|104:E|105:E|106:E|107:C|108:E|109:E|110:C|111:C|112:C|113:C|114:E|115:X|116:C|117:C|118:E|119:C|120:E'
const key=new Map(answers.split('|').map(s=>{const[n,a]=s.split(':');return[+n,a]}))
const classification=[
 [[51,55],'Psicologia Clínica','Documentos psicológicos, avaliação inicial e intervenção psicoterapêutica'],
 [[56,60],'Avaliação Psicológica','Psicodiagnóstico, instrumentos de avaliação e avaliação cognitiva de pessoas idosas'],
 [[61,64],'Bioética e Psicologia da Saúde','Autonomia, recusa terapêutica, cuidados de fim de vida e atuação interdisciplinar'],
 [[65,70],'Psicologia do Envelhecimento','Psicoterapia com idosos, depressão, dor e condições crônicas'],
 [[71,74],'Terapia Cognitivo-Comportamental','Crenças centrais, cognições e reestruturação cognitiva'],
 [[75,78],'Psicologia da Saúde','Teorias e dimensões biopsicossociais da dor'],
 [[79,82],'Psicologia Clínica','Avaliação psicofísica da dor e relação entre psicopatologia e dor'],
 [[83,92],'Psicopatologia e Saúde Mental','Transtorno do espectro autista, desenvolvimento infantil, cuidado em rede e projeto terapêutico singular'],
 [[93,97],'Psicologia e Saúde Pública','Intervenção psicológica, NASF, apoio matricial e reabilitação psicossocial'],
 [[98,102],'Psicologia Clínica','Autolesão, automutilação, ideação suicida e fatores de risco em adolescentes'],
 [[103,108],'Psicologia do Envelhecimento','Violência contra a pessoa idosa, fatores de risco e intervenção psicossocial'],
 [[109,114],'Psicologia Social e de Grupos','Psicanálise, identificação e vínculos na formação de grupos'],
 [[115,120],'Psicologia Escolar e Clínica','Saúde mental universitária, prevenção, trabalho em equipe e sigilo profissional']
]
const marcos='Marcos, estudante universitário no último semestre, procurou atendimento psicológico relatando ansiedade, depressão e dificuldade para dormir. Informou ter tentado estuprar uma colega durante uma festa, estando embriagado, e temia denúncia às vésperas da formatura. Após duas sessões de 50 minutos, ainda em avaliação e sem diagnóstico fechado, disse ter solicitado dispensa ou adiamento das avaliações finais por suas condições psicológicas e pediu documento sobre seu estado atual para apresentar à universidade.'
const pedro='Pedro, 82 anos, está hospitalizado em estado grave e progressivo, com prognóstico reservado. Consciente e informado de que não há possibilidade de cura, comunicou à família, à equipe médica e ao psicólogo que não deseja procedimentos ou equipamentos para prolongar a vida; sempre defendeu o direito à eutanásia e sua legalização.'
const josue='Caso clínico 5A2-I: Maria procurou o serviço público de saúde preocupada com o filho Josué, de 4 anos. Desde bebê, ele era pouco responsivo, parecia interessar-se especialmente por objetos em movimento ou partes de objetos, incomodava-se com sons altos, brincava de modo diferente e tinha pouca interação com outras crianças. A mãe relata preocupação com o desenvolvimento e dificuldade de buscar ajuda. As questões consideram hipótese diagnóstica, desenvolvimento infantil e cuidado em rede.'
const contextos=[
 [[51,55],marcos],[[56,60],'Com relação ao processo de avaliação psicológica e ao psicodiagnóstico realizados pelo psicólogo, julgue os itens.'],
 [[61,64],pedro],[[65,70],'Julgue os itens acerca da avaliação e condução da psicoterapia cognitivo-comportamental para pessoas idosas, incluindo aspectos de envelhecimento, doença crônica e dor.'],
 [[71,74],'Caso clínico 5A2-I. Com base nos princípios da terapia cognitivo-comportamental, julgue os itens.'],
 [[75,78],'Considerando as teorias da dor, julgue os itens.'],[[79,82],`${josue}\nCom base na psicopatologia, no DSM-5 e na CID-10, e considerando a avaliação e o manejo da dor, julgue os itens.`],
 [[83,92],`${josue}\nConsiderando a psicopatologia, o DSM-5, a CID-10, os princípios do SUS e as ações básicas em saúde, julgue os itens sobre avaliação, intervenção e cuidado em rede.`],
 [[93,97],`${josue}\nAinda considerando o caso clínico, as contribuições da psicopatologia, os princípios do SUS, a rede de atenção psicossocial e a atuação profissional, julgue os itens.`],
 [[98,102],'Os atendimentos a pessoas com hábito de se ferir e com ideação suicida são demanda relevante da Psicologia. Considerando a intervenção profissional em automutilação e suicídio, julgue os itens.'],
 [[103,108],'Considerando o aumento da expectativa de vida e os aspectos envolvidos na violência contra pessoas idosas, julgue os itens.'],
 [[109,114],'Uma forma de intervenção do psicólogo na universidade é o trabalho com grupos. Considerando a compreensão psicanalítica dos grupos, julgue os itens.'],
 [[115,120],'Considerando a atuação clínica do psicólogo junto à comunidade discente em universidades, promoção e prevenção em saúde mental, trabalho interdisciplinar e sigilo, julgue os itens.']
]
const get=(a,n)=>a.find(([[lo,hi]])=>n>=lo&&n<=hi)?.[1]
const duplicate='extr-3ac8f4d347d6aea92ef5',canonical='extr-9e40af41f34aa7297226'
const decisions=[]
for(const q of raw){
 const n=+q.numero,answer=key.get(n),[materia,conteudo]=get(classification,n)||[],texto=get(contextos,n)
 assert.ok(answer&&materia&&conteudo&&texto,`Classificação/gabarito ausente: ${n}`)
 const page=+q.pagina,img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,annulled=answer==='X',isDuplicate=q.id===duplicate
 let enunciado=q.enunciado.replace(/\s*(?:5450050155246|CEBRASPE\s*[–-]\s*FUB\s*[–-]\s*Edital:\s*2020|--\s*CONHECIMENTOS ESPECÍFICOS\s*--)[\s\S]*$/,'').trim()
 const tails={55:/\s*Pedro, de 82 anos[\s\S]*$/,60:/\s*Pedro, de 82 anos[\s\S]*$/,70:/\s*5450050155246[\s\S]*$/,97:/\s*Os atendimentos a pessoas com hábito de se ferir[\s\S]*$/,102:/\s*Com o aumento da expectativa de vida[\s\S]*$/,108:/\s*Uma das formas de intervenção do psicólogo na Universidade[\s\S]*$/,114:/\s*São múltiplas as possibilidades de atuação do psicólogo na Universidade[\s\S]*$/}
 if(tails[n])enunciado=enunciado.replace(tails[n],'').trim()
 enunciado=enunciado.replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>20,`Enunciado insuficiente: ${n}/${q.id}`)
 const motivo=isDuplicate?`Registro ${q.id} contém uma cópia OCR do item 55, já representado integralmente por ${canonical}; foi excluído da resolução para evitar duplicata.`:`Item ${n} conferido no caderno oficial 545_FUB_005_01, cargo 5 (Psicólogo — área Clínica), e resposta confrontada com o gabarito definitivo e as justificativas oficiais de alteração.`
 const meta={materia,conteudo,ano:2023,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Fundação Universidade de Brasília (FUB) — Edital nº 2/2020',cargo:'Cargo 5 — Psicólogo — área Clínica',aplicacao:'30/07/2023',numero_original:n,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência de aplicação de conceitos clínicos, éticos e de saúde; a banca não publicou dificuldade individual.',classificacao_fonte:prova,motivo,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:annulled||isDuplicate?null:answer==='C'?0:1,anulada:annulled,texto_apoio:texto,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito definitivo — FUB, cargo 5 (Psicólogo — área Clínica); aplicação 30/07/2023',item:n,resposta:annulled?'Anulada':answer,fonte:'CEBRASPE',justificativas_url:justificativas},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...meta,enunciado,pagina:page,visual:{pagina:page,imagem:img,motivo:'Página correspondente do caderno oficial preservada; texto-base e contexto reconstruídos a partir da prova oficial.'},apta_resolucao:!annulled&&!isDuplicate,correcao_automatica:!annulled&&!isDuplicate,...(isDuplicate?{inelegibilidade_motivo:'duplicata_ocr_mesmo_item_55',duplicada_de:canonical}:{})})
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.anulada).map(x=>x.numero_original).sort((a,b)=>a-b),[60,66,89,115])
assert.deepEqual(decisions.filter(x=>x.id===duplicate).map(x=>x.id),[duplicate])
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,justificativas,concurso:'FUB — edital nº 2/2020; cargo 5, Psicólogo — área Clínica',aplicacao:'30/07/2023',nota:'71 registros processados: itens 51–120 identificados no caderno oficial. Itens 60, 66, 89 e 115 anulados segundo justificativas oficiais. Um registro OCR duplicado do item 55 foi tornado inelegível; a ocorrência íntegra foi mantida. Contextos de Marcos, Pedro e Josué reconstruídos a partir do caderno oficial, mantendo as páginas originais associadas.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_revisados:71,itens_anulados:[60,66,89,115],duplicatas_excluidas:1,prova_oficial:prova,gabarito_oficial:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)

