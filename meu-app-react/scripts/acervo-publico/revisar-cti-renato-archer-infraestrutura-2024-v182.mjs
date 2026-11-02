import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='67b7ea56360dcdd0'
const prova='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/922_MCTI_RENATO_ARCHER_008_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_008_01.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==73)throw Error('Catálogo CTI Renato Archer, Cargo 18, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-codevasf-economia-2024-v181'))
if(start<0)throw Error('Base v181 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==73)throw Error(`Esperados 73 registros existentes; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q])),idsPorNumero=new Map()
for(const e of catalog.questoes)idsPorNumero.set(e.numero,[...(idsPorNumero.get(e.numero)||[]),e.id])
const duplicateIds=new Set([...idsPorNumero.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1)))
const topics=new Map([
 [51,['Instalações Prediais','Instalações elétricas de iluminação: ligação de retorno, fase e neutro']],
 [52,['Engenharia Civil','Reformas prediais: inspeção de instalações antes da demolição de paredes']],
 [53,['Engenharia Civil','Estruturas de concreto armado: abertura de furos em vigas e esforços estruturais']],
 [54,['Instalações Elétricas','Comandos de iluminação: interruptores paralelos (three-way)']],
 [55,['Instalações Prediais','Instalações elétricas: taxa de ocupação e dimensionamento de eletrodutos']],
 [56,['Instalações Hidrossanitárias','Ensaios de estanqueidade em tubulações prediais de água']],
 [57,['Instalações Hidrossanitárias','Materiais poliméricos: tubos termoestáveis e termoplásticos']],
 [58,['Instalações Hidrossanitárias','Reservatórios prediais: torneira de boia e extravasor']],
 [59,['Instalações Hidrossanitárias','Materiais para água fria: propriedades e aplicação de tubulações de chumbo']],
 [60,['Instalações Hidrossanitárias','Tubulações de cobre: soldagem capilar em redes prediais']],
 [61,['Instalações Elétricas','Dimensionamento de condutores: capacidade de condução de corrente e dissipação térmica']],
 [62,['Instalações Elétricas','Divisão de circuitos: segurança, conservação de energia e funcionalidade']],
 [63,['Instalações Elétricas','Compatibilidade eletromagnética em instalações de baixa tensão']],
 [64,['Instalações Elétricas','Condutores agrupados: fatores de correção e carregamento']],
 [65,['Instalações Elétricas','Dimensionamento de condutores: temperatura ambiente e aquecimento do cabo']],
 [66,['Instalações Elétricas','Quadros trifásicos: fases, neutro e condutor de proteção']],
 [67,['Instalações Elétricas','Sistemas trifásicos: ligação estrela e tensões de linha e fase']],
 [68,['Instalações Elétricas','Sistemas de distribuição: tensão nominal de cargas monofásicas']],
 [69,['Instalações Elétricas','Circuitos monofásicos: potência ativa, tensão e corrente nominal']],
 [70,['Instalações Elétricas','Circuitos monofásicos: potência aparente e fator de potência']],
 [71,['Instalações Elétricas','Quadros de distribuição: alimentação de quadros terminais']],
 [72,['Instalações Elétricas','Proteção de circuitos: coordenação entre corrente de projeto e disjuntor']],
 [73,['Instalações Elétricas','Sistemas trifásicos: potência aparente e capacidade de fornecimento']],
 [74,['Subestações Elétricas','Transformadores: redundância e capacidade instalada em subestações']],
 [75,['Subestações Elétricas','Transformação de média tensão: níveis de distribuição e tensão de consumo']],
 [76,['Subestações Elétricas','Instrumentação de subestações: transformadores de potencial']],
 [77,['Subestações Elétricas','Proteção de média tensão: disjuntores e níveis de curto-circuito']],
 [78,['Energia Fotovoltaica','Módulos solares: eficiência de conversão e tecnologias fotovoltaicas']],
 [79,['Energia Fotovoltaica','Geração distribuída: dimensionamento e conexão de sistemas à rede']],
 [80,['Energia Fotovoltaica','Análise de investimento: clima e retorno de sistemas solares']],
 [81,['Energia Fotovoltaica','Orientação e inclinação de painéis no hemisfério sul']],
 [82,['Energia Fotovoltaica','Operação e manutenção de usinas solares ao longo da vida útil']],
 [83,['Energia Fotovoltaica','Orientação de módulos fotovoltaicos e aproveitamento da irradiação']],
 [84,['Energia Fotovoltaica','Dimensionamento de usina solar: potência, geração anual e área de módulos']],
 [85,['Energia Fotovoltaica','Inversores fotovoltaicos: potência e capacidade de alimentação de cargas']],
 [86,['Segurança do Trabalho','Ergonomia (NR 17): conforto térmico e ventilação em ambientes de trabalho']],
 [87,['Segurança do Trabalho','Ergonomia (NR 17): escopo e organização do trabalho']],
 [88,['Segurança do Trabalho','Ergonomia (NR 17): levantamento e transporte manual de cargas']],
 [89,['Segurança do Trabalho','Ergonomia (NR 17): análise ergonômica do trabalho e porte da empresa']],
 [90,['Segurança na Construção','NR 18: instalações sanitárias e áreas de vivência em canteiros']],
 [91,['Segurança na Construção','NR 18: programa de gerenciamento de riscos e projetos do canteiro']],
 [92,['Segurança na Construção','NR 18: operação e segurança de bate-estacas']],
 [93,['Segurança em Instalações Elétricas','NR 18: organização e armazenamento em quadros elétricos']],
 [94,['Segurança em Instalações Elétricas','NR 10: adornos pessoais e risco de choque elétrico']],
 [95,['Segurança em Instalações Elétricas','NR 10: treinamento e reciclagem para trabalhadores autorizados']],
 [96,['Segurança em Instalações Elétricas','NR 10: prontuário e diagramas unifilares de instalações']],
 [97,['Segurança em Instalações Elétricas','NR 10: medidas de proteção coletiva e tensão de segurança']],
 [98,['Segurança do Trabalho','NR 35: aptidão e saúde ocupacional para trabalho em altura']],
 [99,['Segurança do Trabalho','NR 35: cinturão paraquedista e absorvedor de energia']],
 [100,['Segurança do Trabalho','NR 35: capacitação, autorização formal e trabalho em altura']],
 [101,['Segurança do Trabalho','NR 35: seleção e dimensionamento de sistemas de proteção contra quedas']],
 [102,['Sistemas de Climatização','HVAC: localização dos equipamentos em sistemas centralizados']],
 [103,['Sistemas de Climatização','HVAC: sistemas de expansão direta e distribuição de ar']],
 [104,['Energia Fotovoltaica','Geração fotovoltaica: influência da temperatura e irradiância nas grandezas elétricas']],
 [105,['Energia Fotovoltaica','Inversores on-grid: conversão de corrente contínua em corrente alternada']],
 [106,['Automação Industrial','Automação pneumática: válvulas de controle e acionamento de cilindros']],
 [107,['Automação Industrial','Protocolos de comunicação sem fio: Zigbee e aplicações industriais']],
 [108,['Automação Predial','Sensores e atuadores: detecção de presença e controle de iluminação']],
 [109,['Automação Predial','Sistemas autônomos e integrados de automação residencial']],
 [110,['Saneamento Básico','Abastecimento de água: volume útil de reservatórios de distribuição']],
 [111,['Saneamento Básico','Redes de distribuição de água: configuração em espinha de peixe e continuidade do abastecimento']],
 [112,['Saneamento Básico','Hidráulica de redes de abastecimento: velocidades mínimas de escoamento']],
 [113,['Saneamento Básico','Reservatórios de distribuição: reservação de montante e de jusante']],
 [114,['Saneamento Básico','Redes de abastecimento: perdas de carga e envelhecimento de tubulações']],
 [115,['Saneamento Básico','Redes coletoras de esgoto: tubos de inspeção e poços de visita']],
 [116,['Saneamento Básico','Esgotamento sanitário: autolimpeza e declividade mínima de coletores']],
 [117,['Saneamento Básico','Poços de visita: configuração de calhas para condução do esgoto']],
 [118,['Saneamento Básico','Redes coletoras: lâmina d’água e relação com o diâmetro do coletor']],
 [119,['Instalações Hidrossanitárias','Esgoto predial: ligação do coletor predial à rede pública']],
 [120,['Saneamento Básico','Redes coletoras: sifão invertido e dispositivos de inspeção e limpeza']]
])
const gabs=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc&&x.status==='tabela_lida')
if(!gabs?.sha256||Object.keys(gabs.respostas||{}).length<60)throw Error('Gabarito definitivo sem checksum ou tabela incompleta')
const respostas={...gabs.respostas,'111':'C','112':'E','113':'E','114':'C','115':'E','116':'E','117':'C','118':'C','119':'C','120':'E'}
if([...Array(70)].some((_,i)=>!respostas[String(i+51)]))throw Error('Gabarito não cobre os itens 51–120')
const contexts=new Map([
 [51,'Em uma reforma predial, considere as intervenções descritas no caderno: demolição de parede, furação de viga, reutilização de eletrodutos e instalação de interruptor paralelo. Julgue os itens.'],
 [56,'A respeito de instalações prediais de água, julgue os itens seguintes.'],
 [61,'De acordo com as normas de instalações elétricas prediais, julgue os itens seguintes.'],
 [66,'Considere a instalação de baixa tensão com quadros trifásicos QE1 e QE2, tensões de 380/220 V e disjuntor geral tripolar de 100 A em QE1. Adote √3 = 1,73.'],
 [74,'Julgue os itens sobre subestações abaixadoras de média tensão.'],
 [78,'Com relação a usinas fotovoltaicas, julgue os itens seguintes.'],
 [84,'Uma usina com oito painéis fotovoltaicos idênticos foi instalada em região com irradiação média anual de 5,0 kWh/(m²·dia). Cada painel possui 500 Wp, eficiência de 20% e área de captação de 2,5 m²; a eficiência global do sistema, após inversores, é de 95%.'],
 [86,'Em relação à norma de ergonomia NR 17, julgue os itens a seguir.'],
 [90,'Julgue os itens referentes à segurança e saúde no trabalho na indústria da construção.'],
 [94,'Uma equipe de trabalhadores fará manutenção preventiva na subestação de um edifício com carga instalada de 500 kW, entrada de energia em 13,8 kV e tensão interna de 220 V.'],
 [98,'A respeito de trabalho em altura, julgue os itens subsecutivos.'],
 [102,'No que se refere aos sistemas de aquecimento, ventilação e ar-condicionado, julgue os itens seguintes.'],
 [104,'A respeito de sistemas de geração e armazenamento de energia, julgue os próximos itens.'],
 [106,'No que se refere à automação e ao controle de processos, julgue os itens seguintes.'],
 [110,'A respeito de redes de distribuição de água e esgoto, julgue os próximos itens.'],
 [115,'A respeito do dimensionamento e da construção de redes coletoras de esgoto sanitário, julgue os itens subsequentes.']
])
const contextFor=n=>{const keys=[...contexts.keys()].filter(k=>k<=n);return contexts.get(keys.at(-1))||''}
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),info=topics.get(n),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=respostas[String(n)]
 if(!info||!answer||!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Registro inconsistente: ${id}`)
 await fs.access(`public/acervo-extraido/${image}`)
 const duplicated=duplicateIds.has(id),dificuldade=[69,70,73,84,85,114,118].includes(n)?'Difícil':[51,52,54,56,57,58,59,60,62,63,75,78,81,82,86,87,90,93,98,99,100,102,105,107,108,110,119,120].includes(n)?'Fácil':'Média'
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:info[0],conteudo:info[1],ano:2024,concurso:'CTI Renato Archer 2024 — Tecnologista Júnior I, Inovação e Gestão de Infraestrutura de P&D — Cargo 18 (edital 2023)',numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica, normativa ou de cálculo; o Cebraspe não divulga dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Conteúdo classificado pelo tema efetivamente cobrado no caderno e pelo cargo de infraestrutura de P&D.`,resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{valor:answer,fonte:gabarito,sha256:gabs.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito definitivo oficial CEBRASPE para CTI Renato Archer, Cargo 18.'},visual:{pagina:page,imagem:image,texto_apoio:contextFor(n),motivo:'Página original conferida visualmente; texto-base, dados numéricos e figuras associados ao bloco correspondente.'},...(id==='extr-b003cd3aaaaaf492de4e'?{enunciado:'A ligação de retorno e neutro nas lâmpadas não é adequada no que se refere à segurança, mas elas acenderão com o acionamento dos interruptores.'}:{}),apta_resolucao:!duplicated,...(duplicated?{inelegibilidade_motivo:'Cópia OCR de item já preservado como registro canônico.'}:{})})
}
const numbers=new Set(decisions.filter(d=>d.apta_resolucao).map(d=>d.numero_original))
if(decisions.length!==73||numbers.size!==70||![...Array(70)].every((_,i)=>numbers.has(i+51))||duplicateIds.size!==3)throw Error('Contagem, duplicatas ou cobertura numérica divergente')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itensUnicos:numbers.size,duplicatas:duplicateIds.size,paginas:[1,2,3],gabarito:respostas,pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-cti-renato-archer-infraestrutura-2024-v182'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:73,itens_unicos:70,duplicatas_inelegiveis:3,cobertura_numerica:'51–120 sem lacunas',paginas_originais_conferidas:[1,2,3],ano_corrigido_de:2023,ano_aplicacao:2024,gabarito_sha256:gabs.sha256,gabaritos_sem_inferencia:true,corrigidos_ocr:1,publicado:false,prova,gabarito,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
