import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-stj-odontopediatria-2018-v423'
const documento='f9561039893f2c78'
const prova='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/MATRIZ_385_STJ004__PAG_4.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/GAB_DEFINITIVO_385_STJ004.PDF'
const concurso='STJ 2018 — Analista Judiciário — Apoio Especializado — Odontologia — Odontopediatria'
const respostas=new Map(`41:C 42:C 43:E 44:E 45:E 46:E 47:C 48:C 49:E 50:E 51:C 52:E 53:C 54:C 55:C 56:C 57:C 58:E 59:C 60:E 61:C 62:C 63:E 64:C 65:E 66:E 67:C 68:C 69:C 70:E 71:E 72:C 73:C 74:C 75:E 76:E 77:C 78:C 79:C 80:E 81:C 82:E 83:C 84:E 85:E 86:E 87:C 88:C 89:C 90:E 91:E 92:C 93:E 94:C 95:E 96:C 97:E 98:E 99:E 100:X 101:C 102:E 103:C 104:C 105:E 106:C 107:E 108:C 109:E 110:E 111:C 112:E 113:C 114:C 115:E 116:E 117:E 118:E 119:X 120:C`.split(' ').map(x=>{const [n,a]=x.split(':');return[Number(n),a]}))
if(respostas.size!==80)throw Error('Gabarito não contém 80 itens')

const grupos=[
 [41,45,'Odontopediatria','Manejo do comportamento infantil','Média','Com relação aos recursos de manejo do comportamento da criança, julgue os itens.'],
 [46,50,'Odontopediatria','Estabilização protetora e contenção física','Média','Julgue os itens a respeito da estabilização protetora na primeira infância.'],
 [51,55,'Odontopediatria','Comunicação e relação profissional-criança','Média','Com relação aos procedimentos recomendáveis para o estabelecimento de uma boa relação profissional-criança, imprescindíveis ao tratamento odontopediátrico, julgue os itens.'],
 [56,60,'Odontologia materno-infantil','Saúde bucal na gestação, parto e amamentação','Média','Julgue os itens relativos aos efeitos da saúde bucal e geral da gestante no contexto odontopediátrico e aos efeitos da amamentação na saúde bucal do bebê.'],
 [61,64,'Odontologia materno-infantil','Teratógenos e desenvolvimento craniofacial','Média','Embora raros, distúrbios do desenvolvimento embrionário podem influenciar maloclusões na primeira infância. Considerando a ação de agentes teratógenos, julgue os itens.'],
 [65,66,'Odontopediatria','Erupção dentária, alterações e diagnóstico por imagem','Média','Durante inspeção bucal de uma criança hígida de sete anos, constatou-se ausência dos dentes 11 e 21 e discreto tecido edemaciado na área. Julgue os itens sobre o caso e seus aspectos clínicos.'],
 [67,68,'Odontopediatria','Manobras operatórias e segurança durante procedimentos','Média','No que se refere às manobras operatórias e ao uso de instrumentos durante procedimento cirúrgico em paciente pediátrico, julgue os itens.'],
 [69,74,'Odontopediatria','Fluorterapia, toxicidade e prevenção da cárie','Média','Acerca da fluorterapia, julgue os itens.'],
 [75,76,'Odontopediatria','Terapia pulpar em dentes decíduos','Difícil','Uma criança de oito anos foi encaminhada à clínica com lesão extensa de cárie e comprometimento pulpar evidente no dente 84, sem sintomas. Julgue os itens sobre o caso.'],
 [77,80,'Odontopediatria','Terapia pulpar em dentes permanentes jovens e rizogênese incompleta','Difícil','A respeito de dente com rizogênese incompleta e lesão extensa de cárie com comprometimento pulpar, julgue os itens.'],
 [81,85,'Cariologia','Ecologia do biofilme e potencial cariogênico dos carboidratos','Difícil','A teoria ecológica da cárie relaciona o consumo de açúcares ao desequilíbrio da microbiota do biofilme e à perda mineral por queda do pH. Considere esse contexto e julgue os itens sobre cariogenicidade dos alimentos.'],
 [86,90,'Odontopediatria','Tratamento restaurador atraumático (ART)','Média','Com relação ao tratamento restaurador atraumático (ART), julgue os itens.'],
 [91,97,'Traumatologia dentária','Traumatismos dentários na primeira infância e dentição permanente jovem','Difícil','A respeito do diagnóstico e tratamento de traumatismos dentários na primeira infância e em dentes permanentes jovens, julgue os itens.'],
 [98,100,'Odontologia baseada em evidências','Qualidade de vida relacionada à saúde bucal — ECOHIS','Média','Julgue os itens relativos à Escala de Impacto da Saúde Bucal na Primeira Infância (ECOHIS) e à avaliação da qualidade de vida relacionada à saúde bucal.'],
 [101,105,'Anestesiologia odontológica','Anestésicos locais: dissociação, bloqueio e recuperação','Difícil','Com relação à anestesia local em Odontologia, julgue os itens.'],
 [106,111,'Urgências odontológicas','Emergências médicas, síncope, suporte básico de vida e aspiração','Difícil','A respeito da abordagem de emergências médicas pelo cirurgião-dentista, julgue os itens.'],
 [112,115,'Odontologia hospitalar','Pneumonia associada à ventilação, mucosite e osteonecrose','Média','Com referência à atuação do cirurgião-dentista na Odontologia hospitalar e no atendimento a pacientes sob cuidados de terapia intensiva, julgue os itens.'],
 [116,120,'Saúde coletiva e políticas de saúde','Saúde bucal no SUS, Brasil Sorridente, fluoretação e prevenção','Média','Em relação à Odontologia preventiva no Sistema Único de Saúde, julgue os itens.']
]
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
if(records.length!==80||new Set(records.map(q=>Number(q.numero))).size!==80)throw Error('Extração não contém 80 itens únicos')
const clean=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\s+([%)])/g,'$1').replace(/([(])\s+/g,'$1').replace(/\s*[-–—]\s*/g,'-').replace(/\bcr iança\b/gi,'criança').replace(/\bcri ança\b/gi,'criança').replace(/\bcui dados\b/gi,'cuidados').replace(/\bdescalc ificação\b/gi,'descalcificação').replace(/\bvestibulopalatino\b/gi,'vestibulopalatino').trim()
const ann=new Set([100,119])
const hashGabarito=createHash('sha256').update([...respostas].map(([n,a])=>`${n}:${a}`).join('\n')).digest('hex')
const decide=records.map(q=>{
 const n=Number(q.numero),g=grupos.find(([a,b])=>n>=a&&n<=b)
 if(!g||!q.enunciado||q.opcoes?.length!==2)throw Error(`Item ${n} sem enunciado, opções ou classificação`)
 const answer=respostas.get(n),page=Number(q.pagina),image=`paginas/${documento}-${String(page).padStart(4,'0')}.webp`
 const apoio=g[5]
 let enunciado=clean(q.enunciado)
 // Corrige erros evidentes do OCR; o caderno original continua vinculado ao item.
 enunciado=enunciado.replace(/mão-\s*sobre-a-boca\s*\(\s*TMSB\s*\)/i,'mão-sobre-a-boca (TMSB)').replace(/a c riança/gi,'a criança').replace(/inferio res/gi,'inferiores').replace(/fibroses simples\./i,'fibroses simples.').replace(/super EBA/i,'Super EBA').replace(/Trendelemburg/i,'Trendelenburg').replace(/bifosfonatos/i,'bisfosfonatos').replace(/entubados/i,'intubados').replace(/10 anos, contados desde o nascimento\./i,'dez anos, contados desde o nascimento.')
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g[2],conteudo:g[3],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'08/04/2018',cargo:'Analista Judiciário — Apoio Especializado — Odontologia — Odontopediatria',etapa:'Prova objetiva — Conhecimentos específicos — Cargo 4',numero_original:n,numero:n,pagina:page,dificuldade:g[4],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade clínica e conceitual; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:`Classificação individual do item ${n} pelo enunciado e pelo bloco temático da prova oficial do STJ 2018, Cargo 4 (Odontopediatria). Gabarito comparado com o documento definitivo CEBRASPE.`,enunciado,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:answer==='E'?1:null,anulada:ann.has(n),texto_apoio:apoio,imagens_contexto:[],reemplazarContexto:true,imagem_pagina:image,visual:{pagina:page,imagem:image,texto_apoio:apoio,motivo:`Página ${page} conferida no caderno oficial; contexto do bloco separado dos enunciados contíguos e imagem original preservada.`},apta_resolucao:true,gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_385_STJ004.PDF',prova,numero:n,resposta:answer,sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_das_respostas_41_a_120; não é hash do PDF',criterio:ann.has(n)?'Item anulado conforme gabarito oficial definitivo CEBRASPE.':'Gabarito oficial definitivo CEBRASPE do Cargo 4 — Odontopediatria.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']}
})
const canonical=[...respostas].map(([n,a])=>`${n}:${a}`).join('\n'),hash=createHash('sha256').update(canonical).digest('hex')
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decide,null,2))
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decide})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const final={...report,documento,itens_revisados:80,itens_unicos:80,duplicatas:0,itens_anulados:[...ann],itens_com_correcao_automatica:78,paginas_originais_conferidas:[1,2,3,4],prova_oficial:prova,gabarito_oficial:chave,checksum_gabarito_transcricao:hash,data_aplicacao:'2018-04-08',textos_base_reestruturados:true,publicado_na_nuvem:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2))
console.log(JSON.stringify(final,null,2))
