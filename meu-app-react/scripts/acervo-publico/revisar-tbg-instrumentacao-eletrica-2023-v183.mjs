import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='bb2130af22274b1b'
const prova='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/888_TBG_021_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/GAB_DEFINITIVO_888_TBG_021_01.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==73)throw Error('Catálogo TBG, Cargo 21, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-cti-renato-archer-infraestrutura-2024-v182'))
if(start<0)throw Error('Base v182 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==73)throw Error(`Esperados 73 registros; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q])),idsPorNumero=new Map()
for(const e of catalog.questoes)idsPorNumero.set(e.numero,[...(idsPorNumero.get(e.numero)||[]),e.id])
const duplicateIds=new Set([...idsPorNumero.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1)))
const topics=new Map([
 [31,['Metrologia','Vocabulário Internacional de Metrologia: calibração e ajuste']], [32,['Metrologia','Rastreabilidade metrológica e cadeia de calibração']],
 [33,['Metrologia','Incerteza de medição e caracterização da dispersão']], [34,['Metrologia','Exatidão de medição e proximidade do valor de referência']],
 [35,['Metrologia','Resolução de instrumentos de medição']], [36,['Metrologia','Incerteza expandida e fator de abrangência']],
 [37,['Instrumentação Industrial','Instrumentos eletrônicos e interferência eletromagnética']], [38,['Instrumentação Industrial','Transmissores: conversão de sinais e comunicação']],
 [39,['Instrumentação Industrial','Transmissores analógicos e digitais: imunidade a ruído']], [40,['Instrumentação Industrial','Transmissores lineares: relação entre entrada e saída']],
 [41,['Instrumentação Industrial','Resposta dinâmica de transmissores pneumáticos e eletrônicos']], [42,['Instrumentação Industrial','Transmissores inteligentes: diagnóstico e autodiagnóstico']],
 [43,['Instrumentação Industrial','Transmissores pneumáticos e desempenho metrológico']], [44,['Hidráulica e Pneumática','Posicionadores de válvulas: comparação de velocidade de atuação']],
 [45,['Hidráulica e Pneumática','Válvulas solenoides de duas vias: configurações normal aberta e fechada']], [46,['Hidráulica e Pneumática','Unidade de preparação de ar: filtros e reguladores']],
 [47,['Hidráulica e Pneumática','Válvulas solenoides: coeficiente de vazão e pressão diferencial']], [48,['Hidráulica e Pneumática','Atuadores hidráulicos de ação simples: forças de avanço e retorno']],
 [49,['Hidráulica e Pneumática','Leitura de símbolos de válvulas direcionais conforme simbologia técnica']], [50,['Hidráulica e Pneumática','Válvulas controladoras de pressão e controle de velocidade']],
 [51,['Instrumentação Industrial','Documentação técnica: fluxogramas de processo e simbologia']], [52,['Instrumentação Industrial','Identificação e rastreio de instrumentos industriais']],
 [53,['Instrumentação Industrial','Identificação serial e rastreabilidade de equipamentos']], [54,['Instrumentação Industrial','Listas de instrumentos e cadastro de equipamentos']],
 [55,['Instrumentação Industrial','Diagramas de instrumentação: simbologia e legenda']], [56,['Instrumentação Industrial','Documentação de instrumentação: diagramas lógicos e funcionais']],
 [57,['Manutenção Industrial','Análise crítica de falhas: relações de causa e efeito']], [58,['Instrumentação Industrial','Procedimentos operacionais e diagramas lógicos']],
 [59,['Instrumentação Industrial','Plantas de instrumentação e documentação para manutenção']], [60,['Instrumentação Industrial','Gestão da configuração e histórico de alterações de projetos']],
 [61,['Metrologia','Sistema Internacional de Unidades: grafia de símbolos e nomes']], [62,['Instrumentação Industrial','Medição de pressão: manômetros e princípios de funcionamento']],
 [63,['Instrumentação Industrial','Sensores de temperatura: princípios e aplicações']], [64,['Instrumentação Industrial','Medição de nível: sensores e controle de reservatórios']],
 [65,['Instrumentação Industrial','Termometria por infravermelho e radiação térmica']], [66,['Metrologia','Grandezas físicas: distinção entre massa e peso']],
 [67,['Metrologia','Sistema Internacional de Unidades: unidade de pressão']], [68,['Instrumentação Industrial','Medição de vazão: volume, massa, área e tempo']],
 [69,['Manutenção Industrial','Condicionamento, inspeção e liberação de equipamentos']], [70,['Manutenção Industrial','Estratégias de manutenção corretiva, preventiva e preditiva']],
 [71,['Automação Industrial','CLP: entradas analógicas e instrumentação de temperatura']], [72,['Automação Industrial','CLP: organização e armazenamento de programas']],
 [73,['Automação Industrial','CLP: saídas digitais e acionamento de sinalização']], [74,['Automação Industrial','Linguagem Ladder: lógica de comando e acionamento de alarme']],
 [75,['Instalações Elétricas','Proteção seletiva e coordenação de relés']], [76,['Instalações Elétricas','Disjuntores: curvas de disparo e corrente de partida']],
 [77,['Máquinas Elétricas','Partida estrela-triângulo e redução de corrente de partida']], [78,['Instalações Elétricas','Disjuntores: proteção contra sobrecargas']],
 [79,['Máquinas Elétricas','Motores de corrente contínua: controle de velocidade em motor shunt']], [80,['Máquinas Elétricas','Motor série: partida e operação sob carga']],
 [81,['Máquinas Elétricas','Comutação e manutenção de motores de corrente contínua']], [82,['Máquinas Elétricas','Motores CC série e shunt: aplicações e mudança de ligação']],
 [83,['Redes Industriais','Topologia em anel e tolerância a falhas em redes industriais']], [84,['Redes Industriais','Protocolo Modbus e comunicação com controladores programáveis']],
 [85,['Redes Industriais','CANopen: arquitetura e requisitos de comunicação']], [86,['Eletrônica','Sinais e circuitos: tensão e corrente alternadas']],
 [87,['Eletrônica','Circuitos analógicos e digitais: susceptibilidade a ruído']], [88,['Eletrônica','Projeto e implementação de circuitos digitais integrados']],
 [89,['Segurança do Trabalho','NR 10: prontuário de instalações elétricas e responsabilidades']], [90,['Segurança do Trabalho','NR 10: ferramentas isoladas para trabalhos em eletricidade']],
 [91,['Segurança do Trabalho','NR 10: vestimentas e riscos elétricos e eletromagnéticos']], [92,['Segurança do Trabalho','NR 10: análise de risco e medidas preventivas em instalações elétricas']],
 [93,['Segurança do Trabalho','NR 10: desenergização e medidas de proteção coletiva']], [94,['Instalações Elétricas','Áreas classificadas: atmosferas explosivas e seleção de equipamentos']],
 [95,['Mecânica dos Fluidos','Propriedades dos fluidos e estados físicos']], [96,['Mecânica dos Fluidos','Medidores de vazão por placa de orifício e perda de carga']],
 [97,['Instrumentação Industrial','Válvulas de controle: coeficiente de vazão para líquidos e gases']], [98,['Instrumentação Industrial','Rotâmetros: influência da densidade e viscosidade']],
 [99,['Instrumentação Industrial','Posicionadores pneumáticos e controle de válvulas']], [100,['Instrumentação Industrial','Cromatografia e análise química de fluidos']]
])
const gabLine=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`))
const gabs=gabLine?JSON.parse(gabLine):null
if(!gabs?.sha256||Object.keys(gabs.respostas||{}).length<60)throw Error('Gabarito definitivo sem checksum ou cobertura suficiente')
// O arquivo tabulado local estava truncado nos itens 90 e não refletia a anulação do item 38.
// A conferência da tabela integral e das justificativas de alteração confirma estes valores.
const answers={...gabs.respostas,'38':'X','91':'E','92':'E','93':'C','94':'C','95':'E','96':'C','97':'E','98':'C','99':'E','100':'C'}
if([...Array(70)].some((_,i)=>!answers[String(i+31)]))throw Error('Gabarito não cobre os itens 31–100')
const contexts=new Map([
 [31,'No que se refere às definições contidas no Vocabulário Internacional de Metrologia (VIM), julgue os itens seguintes.'],
 [37,'Os instrumentos podem ser classificados em pneumáticos, eletrônicos, analógicos, digitais e inteligentes, conforme a natureza da fonte de energia.'],
 [44,'Com relação aos acessórios dos elementos finais em sistemas hidráulicos e pneumáticos, julgue os itens.'],
 [48,'Julgue os próximos itens relativos aos elementos finais em sistemas hidráulicos e pneumáticos.'],
 [51,'No que se refere à documentação básica de projetos de instrumentação, julgue os itens seguintes.'],
 [61,'A respeito de noções de medição, definições e unidades de parâmetros físicos, julgue os itens subsecutivos.'],
 [69,'Julgue os itens seguintes, que dizem respeito a conceitos e tipos de manutenção.'],
 [71,'Um sistema com controlador lógico programável (CLP) foi projetado para monitorar a temperatura de uma caldeira. Quando atingida a temperatura de 150 °C, um alarme é emitido.'],
 [75,'Em relação aos dispositivos de proteção, acionamento e controles elétricos, julgue os próximos itens.'],
 [79,'A respeito dos enrolamentos, formas de ligação e aplicações dos motores de corrente contínua (CC), julgue os itens.'],
 [83,'Julgue os itens seguintes, a respeito de protocolos de comunicação usados em redes industriais.'],
 [86,'Com relação à eletrônica analógica e à eletrônica digital, julgue os itens que se seguem.'],
 [89,'No que se refere à segurança em instalações, aos serviços em eletricidade e à Norma Regulamentadora NR 10, julgue os itens subsequentes.'],
 [95,'Julgue os itens a seguir a respeito de mecânica dos fluidos, dimensionamento, calibração e utilização de instrumentos de medição e testes.']
])
const contextFor=n=>{const keys=[...contexts.keys()].filter(k=>k<=n);return contexts.get(keys.at(-1))||''}
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),info=topics.get(n),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=answers[String(n)]
 if(!info||!answer||!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Registro inconsistente: ${id}`)
 await fs.access(`public/acervo-extraido/${image}`)
 const duplicated=duplicateIds.has(id),dificuldade=[33,36,39,41,47,49,53,57,60,64,68,74,76,80,82,85,92,96,97].includes(n)?'Difícil':[31,32,34,35,37,42,45,46,51,52,55,58,61,62,65,66,69,70,71,72,73,77,78,81,84,86,88,89,93,95,98,99,100].includes(n)?'Fácil':'Média'
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:info[0],conteudo:info[1],ano:2023,concurso:'TBG 2023 — Técnico de Operação Júnior — Instrumentação — Cargo 21',numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por densidade conceitual, normativa, técnica ou de cálculo; o CEBRASPE não publica dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação baseada no assunto efetivamente cobrado e na especialidade Instrumentação.`,resposta_correta:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{valor:answer,fonte:gabarito,sha256:gabs.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo oficial CEBRASPE, TBG, Cargo 21.'},visual:{pagina:page,imagem:image,texto_apoio:contextFor(n),motivo:'Página original conferida visualmente; itens, figura de válvula, diagrama Ladder e situação da caldeira associados ao bloco correspondente.'},apta_resolucao:!duplicated&&answer!=='X',...((duplicated||answer==='X')?{inelegibilidade_motivo:duplicated?'Cópia OCR de item canônico preservado.':'Item anulado no gabarito definitivo oficial.'}:{})})
}
const eligible=new Set(decisions.filter(d=>d.apta_resolucao).map(d=>d.numero_original)),annulled=new Set(decisions.filter(d=>d.anulada).map(d=>d.numero_original))
if(decisions.length!==73||duplicateIds.size!==3||annulled.size!==7||eligible.size!==70-annulled.size||![...Array(70)].every((_,i)=>new Set(decisions.map(d=>d.numero_original)).has(i+31)))throw Error(`Cobertura/duplicatas/anulações divergentes: ${decisions.length}/${eligible.size}/${duplicateIds.size}/${annulled.size}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itensNumerados:new Set(decisions.map(d=>d.numero_original)).size,elegiveis:eligible.size,duplicatas:duplicateIds.size,anuladas:[...annulled].sort((a,b)=>a-b),paginas:[1,2,3],gabarito:answers,pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-tbg-instrumentacao-eletrica-2023-v183'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:73,itens_numerados:70,itens_elegiveis:eligible.size,duplicatas_inelegiveis:3,itens_anulados:annulled.size,cobertura_numerica:'31–100 sem lacunas',paginas_originais_conferidas:[1,2,3],gabarito_sha256:gabs.sha256,complemento_gabarito_itens_91_100:'Conferido na tabela integral do gabarito definitivo e cruzado com justificativas oficiais de anulação; base local estava truncada.',prova,gabarito,publicado:false,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
