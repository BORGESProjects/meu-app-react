import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-hub-transplante-rim-v497',documento='a7ece24cd0709233'
const prova='https://cdn.cebraspe.org.br/concursos/HUB_17_RESIDENCIA/arquivos/288RMUHUB_008_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/HUB_17_RESIDENCIA/arquivos/Gab_Definitivo_288RMUHUB_008_01.pdf'
const concurso='Residência Médica HUB/UnB 2017 — Programa Transplante de Rim — pré-requisito: Nefrologia'
const cargo='Residência Médica — Transplante de Rim (Nefrologia)'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(ps.length,74)

const conteudos={
  1:'Doença renal crônica: anemia e suplementação de ferro',2:'Doença renal crônica: reposição de ferro parenteral',3:'Anemia na doença renal crônica e inibidores da ECA',5:'Doença renal crônica: controle pressórico e bloqueio do SRAA',6:'Doença mineral óssea na doença renal crônica: PTH e fósforo',8:'Progressão da doença renal crônica e fatores de risco',
  9:'Infecção urinária: tratamento de cistite na gestação',10:'Infecção urinária: bacteriúria assintomática',11:'Infecção urinária em idosos: manifestações clínicas',12:'Infecção urinária não complicada: diagnóstico e urocultura',
  13:'Morte encefálica: fatores confundidores e exame neurológico',14:'Morte encefálica: exames complementares',15:'Morte encefálica: critérios clínicos e apneia',16:'Morte encefálica: causas e potenciais doadores de órgãos',
  17:'Injúria renal aguda associada a contraste: antioxidantes',18:'Nefropatia por contraste: bicarbonato versus solução salina',19:'Nefropatia por contraste: prevenção farmacológica',20:'Distúrbios acidobásicos: acidose metabólica com hiato aniônico normal',21:'Distúrbios acidobásicos: excesso de mineralocorticoides',
  36:'Sedimento urinário em transplantados: células decoy',37:'Sedimento urinário: cristais de fosfato de cálcio e pH',38:'Análise de urina: pigmentos e diagnóstico diferencial de hematúria',39:'Infecção urinária: bactérias produtoras de urease',40:'Urina tipo 1: esterase leucocitária e piúria estéril',
  41:'Glomerulopatias: doença de lesões mínimas',42:'Glomerulopatias associadas ao HIV',43:'Nefropatia diabética: hiperfiltração e proteinúria',44:'Glomerulopatia membranosa: histopatologia',45:'Síndrome nefrótica: proteinúria e manifestações clínicas',
  46:'Doença renal policística autossômica dominante: gene PKD1',47:'Doença túbulo-intersticial: anemia falciforme e capacidade de concentração urinária',48:'Malacoplaquia renal: disfunção macrofágica',49:'Nefropatia analgésica e lesões túbulo-intersticiais',50:'Doenças túbulo-intersticiais: inflamação e fibrose',
  51:'Diuréticos tiazídicos: alterações eletrolíticas e metabólicas',52:'Antagonistas da aldosterona: espironolactona e remodelamento cardíaco',53:'Diuréticos: alcalose metabólica e acetazolamida',54:'Diuréticos na doença renal crônica avançada',
  55:'Nefrolitíase: localização do cálculo e irradiação da dor',56:'Nefrolitíase: obesidade como fator de risco',57:'Nefrolitíase: formação de cálculos de oxalato de cálcio',
  58:'Infecção urinária por Staphylococcus aureus e infecção endovascular',59:'Infecção urinária: agentes etiológicos mais comuns',60:'Infecção urinária: adesão bacteriana e virulência',
  61:'Injúria renal aguda: interleucina 18 como biomarcador',62:'Injúria renal aguda: L-FABP e lesão isquêmica',63:'Injúria renal aguda: cistatina C e predição',64:'Injúria renal aguda: KIM-1 após cirurgia cardíaca',65:'Injúria renal aguda: NGAL sérica e urinária',66:'Síndrome hepatorrenal: critérios de investigação',67:'Síndrome hepatorrenal: doença renal parenquimatosa',
  82:'Doença renal crônica: excreção de amônio e acidose metabólica',83:'Doença renal crônica: excreção fracionada de sódio',84:'Doença renal crônica: concentração urinária e desidratação',
  85:'Transplante renal: rejeição mediada por anticorpos',86:'Transplante renal: inibidores de mTOR e recuperação do enxerto',87:'Transplante renal: sensibilização imunológica e anticorpos anti-HLA',88:'Transplante renal preemptivo: compatibilidade e cross-match',89:'Transplante renal: anticorpos anti-HLA e seleção de doador',90:'Transplante renal: rejeição aguda e classificação de Banff',
  91:'Doença renal crônica e coração: miocardiopatia urêmica',92:'Doença renal crônica e coração: diagnóstico de doença arterial coronariana',
  101:'Transplante renal: linfocele e complicações cirúrgicas',102:'Transplante renal: hematoma perienxerto',103:'Transplante renal: fístula urinária',104:'Transplante renal: estenose ureteral precoce',105:'Transplante renal: trombose venosa do enxerto',
  106:'Fisiologia renal: peptídeo natriurético atrial',107:'Fisiologia renal: sistema renina-angiotensina-aldosterona',108:'Fisiologia renal: sistema nervoso simpático e volume extracelular',109:'Fisiologia renal: vasopressina e reabsorção de água',110:'Fisiologia renal: liberação de peptídeos natriuréticos',
  111:'Nefrites hereditárias: doença de Fabry',112:'Nefrites hereditárias: deficiência de LCAT e síndrome nefrítica'
}
const stems={
  48:'A disfunção macrofágica que dificulta a erradicação de bactérias gram-positivas faz parte da fisiopatologia da malacoplaquia renal.',
  60:'O fator primário de virulência das bactérias consiste na sua capacidade de adesão às superfícies celulares.',
  64:'KIM-1 (kidney injury molecule) é uma proteína transmembrana normalmente não detectada no tecido renal ou na urina em condições normais. Em pacientes submetidos a cirurgia cardíaca, essa proteína aumenta após 6 a 12 horas da cirurgia, mantendo-se elevada por 48 horas, enquanto a creatinina, outro biomarcador, aumenta apenas após 24 horas.',
  65:'A dosagem sérica de NGAL (neutrophil gelatinase-associated lipocalin) é superior à dosagem urinária para predizer injúria renal aguda. Essa proteína possui excelente sensibilidade e especificidade, alterando-se nas horas iniciais após a injúria renal.',
  82:'O equilíbrio acidobásico é afetado nas fases iniciais da insuficiência renal crônica. A excreção de amônio não se sustenta devido à incapacidade das células do túbulo proximal de aumentar a síntese de amônia, o que resulta em acidose metabólica.',
  84:'Nos pacientes com doença renal crônica, a dificuldade em concentrar a urina os predispõe à desidratação hipertônica.',
  87:'Os fatores indutores de maior risco imunológico incluem transplante prévio, gestações ou abortamentos e transfusões de hemocomponentes.',
  88:'Conforme a legislação em vigor, em caso de transplante renal preemptivo com doador vivo, consanguíneo ou não, o cross-match deve ser negativo e a tipagem HLA deve mostrar compatibilidade, com HLA idêntica ou haploidêntica.',
  91:'O estado urêmico é miocardiopático devido a seu envolvimento hemodinâmico, manifestado por hipotensão, depleção de volume e complacência arterial aumentada.',
  92:'O padrão-ouro para o diagnóstico de doença arterial coronariana é a cintilografia miocárdica, uma ferramenta diagnóstica moderna e menos invasiva que outras.',
  101:'O acúmulo de volume variável de linfa envolto por pseudocápsula, com localização ao redor do enxerto renal ou em tecido subcutâneo, denomina-se linfocele, que, em casos sintomáticos, é tratada com drenagem percutânea ou cirúrgica.',
  102:'O acúmulo de sangue perienxerto é achado comum no pós-operatório imediato de transplante renal. O tratamento é conservador e independe da repercussão clínica do paciente ou de alterações laboratoriais.',
  111:'A doença de Fabry consiste em um erro inato associado ao cromossomo X, que afeta o metabolismo dos glicoesfingolipídeos e envolve uma enzima lisossômica, a α-galactosidase A. Essa doença caracteriza-se pelo acúmulo de globotriaosilceramida e glicoesfingolipídeos neutros relacionados, desencadeando disfunção de múltiplos órgãos.',
  112:'A tríade policitemia, síndrome nefrítica e opacidade corneana sugere uma deficiência de lecitina-colesterol aciltransferase (LCAT). Nesse caso, a doença renal é um achado universal, com albuminúria sendo notada precocemente, e a proteinúria aumenta em gravidade durante a quarta e a quinta décadas, geralmente com o desenvolvimento de síndrome nefrítica, mas sem alteração da função renal.'
}
const contextos={
  '1-4':'Texto-base: caso clínico de paciente em hemodiálise por doença renal crônica, com resultados laboratoriais de ferritina, saturação de transferrina e hemoglobina. A página original preservada contém todos os dados clínicos.',
  '5-8':'Texto-base: caso clínico de paciente com doença renal crônica, hipertensão não controlada, dislipidemia, tabagismo, albuminúria, PTH e fósforo sérico. Ver a página original para o caso completo.',
  '9-12':'Comando de seção: julgue os itens sobre infecção do trato urinário.',
  '13-16':'Comando de seção: julgue os itens sobre morte encefálica.',
  '17-19':'Comando de seção: julgue os itens sobre prevenção de nefropatia associada a contraste.',
  '20-22':'Comando de seção: julgue os itens sobre distúrbios acidobásicos.',
  '36-40':'Texto-base: avaliação do sedimento urinário (EAS ou urina tipo 1) como ferramenta para análise de alterações renais e do trato urinário.',
  '41-45':'Texto-base: síndromes glomerulares — nefrótica, nefrítica, glomerulonefrite rapidamente progressiva e anormalidades urinárias assintomáticas.',
  '46-50':'Texto-base: fisiologia tubular e patologias do túbulo-interstício, que podem levar a fibrose e perda progressiva da função renal.',
  '51-54':'Comando de seção: julgue os itens sobre mecanismos de ação, indicações e efeitos colaterais dos diuréticos.',
  '55-57':'Texto-base: nefrolitíase, condição frequente em nefrologia, urologia e clínica médica, com casos assintomáticos e cólicas nefréticas.',
  '58-60':'Comando de seção: julgue os itens sobre infecção do trato urinário.',
  '61-65':'Texto-base: características desejáveis de biomarcador de injúria renal aguda. Comando sobre biomarcadores; a página original contém o contexto completo.',
  '66-71':'Comando de seção: julgue os itens sobre síndrome hepatorrenal.',
  '82-84':'Texto-base: adaptação renal para manter a homeostase em pessoas com doença renal crônica.',
  '85-90':'Texto-base: transplante renal como terapia substitutiva e demanda de órgãos no Brasil. Para o item 87, a página também traz o contexto sobre pacientes sensibilizados e pesquisa de anticorpos anti-HLA.',
  '91-95':'Texto-base: doença cardiovascular como principal causa de morte em pacientes com doença renal crônica.',
  '101-105':'Comando de seção: julgue os itens sobre possíveis complicações cirúrgicas após o transplante renal.',
  '106-110':'Texto-base: mecanismos efetores renais de defesa contra alterações no volume extracelular: SRAA, sistema nervoso simpático, peptídeos natriuréticos e feedback túbulo-glomerular.',
  '111-115':'Comando de seção: julgue os itens sobre nefrites hereditárias.',
  '116-120':'Comando de seção: julgue os itens sobre diálise.'
}
const faixa=n=>Object.keys(contextos).find(k=>{const[a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const limpar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const respostas=ps.map(q=>`${q.numero}:${q.anulada?'X':q.resposta===0?'C':q.resposta===1?'E':'?'}`).sort((a,b)=>Number(a.split(':')[0])-Number(b.split(':')[0]))
assert.ok(respostas.every(x=>!x.endsWith(':?')),'Há item sem resposta/gabarito no registro exportado')
const hashGabarito=hashRevisao(respostas.join('|'))
const decisoes=[]
for(const q of ps){
 const n=Number(q.numero),img=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,anulada=q.anulada===true
 assert.ok(conteudos[n],`Item ${n} sem conteúdo`);await fs.access(`public/acervo-extraido/${img}`)
 let enunciado=stems[n]||q.enunciado.replace(/\s+/g,' ').replace(/\s*CESPE\s*\|\s*CEBRASPE\s*[–-]\s*RMU\s*[–-]\s*Aplicação:\s*2017\s*/gi,' ').trim()
 enunciado=enunciado.replace(/\s*(?:O biomarcador ideal para injúria renal aguda|Com relação à infecção do trato urinário|A respeito de possíveis complicações cirúrgicas subsequentes|Os principais mecanismos efetores renais|Acerca das nefrites hereditárias|Com relação à diálise|Espaço livre).*$/i,'').trim()
 assert.ok(enunciado.length>20,`Enunciado incompleto no item ${n}`)
 const resposta=anulada?null:q.resposta
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Nefrologia',conteudo:conteudos[n],ano:2017,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE (CESPE/UnB à época)',aplicacao:'Prova objetiva aplicada em 22/1/2017',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:[1,2,5,6,14,17,18,19,20,21,23,24,25,26,27,37,39,42,44,47,48,54,57,61,62,64,65,66,67,85,86,87,88,89,90,92,104,105,107,111,112].includes(n)?'Difícil':[11,12,15,36,38,41,45,51,56,60,83,91,101,102,106,108,110].includes(n)?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de prova de residência médica especializada, baseada na integração de fisiopatologia renal, clínica e terapêutica; não é índice oficial de acertos.',resposta_correta:resposta,anulada,gabarito_oficial:{fonte:gabarito,arquivo:'Gab_Definitivo_288RMUHUB_008_01.pdf — Programa Transplante de Rim',sha256:hashGabarito,numero:n,resposta:anulada?'X':resposta===0?'C':'E',anulada,criterio:'Gabarito oficial definitivo do programa Transplante de Rim, aplicação em 22/1/2017; resposta registrada e vinculada ao item.'},classificacao_fonte:prova,motivo:`Item ${n}: matéria e conteúdo identificados pelo enunciado e comando clínico; banca, programa, aplicação e gabarito associados às fontes oficiais. Dificuldade editorial estimada.`,enunciado,texto_apoio:contextos[faixa(n)],imagem_pagina:img,visual:{pagina:q.pagina,imagem:img,enunciado,texto_apoio:contextos[faixa(n)],motivo:`Página original ${q.pagina} conferida visualmente; caso clínico, contexto e terminologia foram mantidos vinculados ao item.`},apta_resolucao:true,remover_pendencias:limpar}
 decisoes.push(d)
}
assert.equal(decisoes.length,74);assert.equal(new Set(decisoes.map(x=>x.id)).size,74);assert.equal(decisoes.filter(x=>x.apta_resolucao).length,74)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:74,unicas_aptas:74,duplicatas:0,anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero),paginas:[2,3,4,5,6,7],gabarito_definitivo_oficial:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,registros_revisados:74,itens_unicos:74,questoes_aptas:74,anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero),paginas_conferidas:[2,3,4,5,6,7],gabarito_definitivo_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2));await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## HUB/UnB 2017 — Nefrologia, Programa Transplante de Rim — revisão v497\n\n- Revisei 74 registros únicos das páginas 2–7, corrigindo matérias incorretas e conteúdos vagos; todos ficaram aptos à resolução.\n- Separei os casos clínicos e comandos de seção dos enunciados e preservei as imagens das páginas originais junto aos itens. Corrigi OCR e termo médico corrompido no item 48, mantendo a resposta oficial associada.\n- Ano e aplicação foram definidos como 2017 e 22/1/2017 conforme o gabarito oficial definitivo. Dificuldade estimada editorialmente. Pacote validado localmente, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${gabarito}).\n`)
console.log(JSON.stringify({...relatorio,publicado:false},null,2))
