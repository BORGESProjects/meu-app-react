import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-anm-2021-tecnico-seguranca-barragens-pendencias-v399'
const doc='1f82a251a0d1c34d'
const prova='https://cdn.cebraspe.org.br/concursos/anm_21_pss/arquivos/MATRIZ_579_ANM.PDF'
const gabBasicos='https://cdn.cebraspe.org.br/concursos/anm_21_pss/arquivos/GAB_DEFINITIVO_MATRIZ_579_ANM_CB1_00.PDF'
const gabEspecificos='https://cdn.cebraspe.org.br/concursos/anm_21_pss/arquivos/GAB_DEFINITIVO_MATRIZ_579_ANM_001_00.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const answers={
3:'E',4:'E',5:'C',7:'C',12:'E',13:'C',14:'E',15:'E',16:'C',17:'E',18:'E',19:'C',35:'E',36:'C',37:'E',40:'C',
41:'E',42:'E',43:'C',44:'E',45:'C',46:'E',47:'E',48:'C',49:'E',50:'E',51:'E',52:'C',53:'C',54:'E',55:'E',56:'E',57:'C',58:'C',59:'C',60:'E',61:'E',62:'C',63:'E',64:'C',65:'C',66:'E',67:'E',68:'E',69:'C',70:'E',71:'C',72:'E',73:'E',74:'C',75:'C',76:'C',77:'E',78:'E',79:'C',80:'C',81:'C',82:'E',83:'E',84:'E',85:'C',86:'E',87:'C',88:'C',89:'C',90:'E',91:'C',92:'E',93:'C',94:'C',95:'C',96:'E',97:'E',98:'C',99:'E'
}
const T={
  3:['História do Brasil','Colonização portuguesa: primeiras expedições e busca por metais preciosos'],
  4:['História do Brasil','Capitanias e primeiros núcleos coloniais: fundação de São Vicente'],
  5:['História do Brasil','Expedições coloniais e conhecimento sobre recursos minerais'],
  7:['História do Brasil','Colonização: interpretação de referências a São Vicente no texto histórico'],
  12:['Língua Portuguesa','Coesão e progressão textual: marcador discursivo conclusivo'],
  13:['Língua Inglesa','Reading comprehension: comparação de acordos de compensação ambiental'],
  14:['Língua Inglesa','Reading comprehension: identificação de dados sobre o desastre de Mariana'],
  15:['Língua Inglesa','Reading comprehension: alcance das medidas de reparação e apoio comunitário'],
  16:['Língua Inglesa','Reading comprehension: inferência sobre práticas e regulação de barragens'],
  17:['Língua Inglesa','Reading comprehension: sequência temporal do acordo e das medidas de assistência'],
  18:['Língua Inglesa','Reading comprehension: propósito e alcance das ações da empresa'],
  19:['Direito Constitucional','Direitos fundamentais: inafiançabilidade, imprescritibilidade e insuscetibilidade de graça'],
  35:['Filosofia','Ética kantiana: imperativo categórico e princípio de universalização'],
  36:['Sociologia','Constituição de 1988: redução das desigualdades como objetivo fundamental'],
  37:['Filosofia','Utilitarismo: felicidade individual e bem-estar coletivo'],
  40:['Direito Administrativo','Lei Anticorrupção: acordo de leniência e reparação integral do dano'],
  41:['Engenharia de Barragens','Segurança de barragens de rejeitos: prevenção de piping por drenagem'],
  42:['Engenharia de Barragens','Segurança de barragens: prevenção de galgamento e proteção do talude de jusante'],
  43:['Engenharia de Barragens','Elementos de proteção e drenagem em barragem de rejeitos: rip-rap e tapete drenante'],
  44:['Mecânica dos Materiais','Ensaio tensão-deformação: tensão de ruptura e módulo de Young'],
  45:['Mecânica dos Materiais','Curva tensão-deformação: escoamento e encruamento'],
  46:['Geologia','Petrologia ígnea: rochas intrusivas e extrusivas e velocidade de resfriamento'],
  47:['Geologia','Petrologia sedimentar: processos de formação de rochas sedimentares'],
  48:['Geologia','Petrologia ígnea: séries de reação de Bowen e cristalização mineral'],
  49:['Geologia de Engenharia','Classificação geomecânica de maciços rochosos: sistema RMR'],
  50:['Geologia de Engenharia','Classificação geomecânica de maciços: sistema Q de Barton e RQD'],
  51:['Geologia','Intemperismo físico e químico: alteração das rochas na superfície terrestre'],
  52:['Geologia','Intemperismo químico: infiltração de água e alteração mineral'],
  53:['Mecânica dos Solos','Redes de fluxo: cálculo de vazão e número de canais e quedas equipotenciais'],
  54:['Mecânica dos Solos','Redes de fluxo em meios anisotrópicos: permeabilidade horizontal e vertical'],
  55:['Mecânica dos Solos','Redes de fluxo: discretização em canais e quedas equipotenciais'],
  56:['Mecânica dos Solos','Percolação em barragens de terra: lei de Darcy e estimativa de vazão'],
  57:['Mecânica dos Solos','Redes de fluxo em barragens: canais de fluxo e quedas equipotenciais'],
  58:['Mecânica dos Solos','Percolação em solo anisotrópico: seção transformada e permeabilidade equivalente'],
  59:['Mecânica dos Solos','Investigação geotécnica: ensaio de palheta e resistência não drenada'],
  60:['Mecânica dos Solos','Resistência ao cisalhamento: ensaio de cisalhamento direto'],
  61:['Mecânica dos Solos','Compactação: energia e procedimento do ensaio Proctor modificado'],
  62:['Mecânica dos Solos','Compactação: umidade ótima e massa específica seca máxima'],
  63:['Mecânica dos Solos','Curva de compactação: efeito da umidade sobre a densidade seca'],
  64:['Engenharia de Barragens','Ruptura de barragens: mapas de inundação e modelagem hidrodinâmica'],
  65:['Engenharia de Barragens','Formação de brecha: geometria, tempo de ruptura e hidrograma de cheia'],
  66:['Engenharia de Barragens','Ruptura de barragens: influência do tipo e material da estrutura na brecha'],
  67:['Engenharia de Barragens','Modelagem de brecha: métodos empíricos e modelos físicos'],
  68:['Hidráulica','Modelagem hidrodinâmica simplificada: equações e termos de inércia e pressão'],
  69:['Hidráulica','Reologia: viscosidade de fluidos não newtonianos e taxa de deformação'],
  70:['Engenharia de Barragens','Barragens de rejeitos: alteamento a jusante e consumo de materiais'],
  71:['Engenharia de Barragens','Barragens de rejeitos: método de alteamento a montante e equipamentos'],
  72:['Engenharia de Barragens','Ciclonagem de rejeitos: segregação granulométrica e disposição de sólidos'],
  73:['Engenharia de Barragens','Segregação hidráulica e propriedades geotécnicas de rejeitos'],
  74:['Engenharia de Barragens','Barragens de rejeitos: flexibilidade construtiva dos alteamentos sucessivos'],
  75:['Mecânica dos Solos','Rejeitos de mineração: forma das partículas e resistência ao cisalhamento'],
  76:['Mecânica dos Solos','Cisalhamento direto em rejeitos não saturados: sucção e coesão aparente'],
  77:['Engenharia de Barragens','Rejeitos filtrados: desaguamento e disposição em pilha seca'],
  78:['Mecânica dos Solos','Liquefação de rejeitos: comportamento não drenado e perda de resistência'],
  79:['Mecânica dos Solos','Comportamento geomecânico de rejeitos: material, depósito e método construtivo'],
  80:['Mecânica dos Solos','Resistência ao cisalhamento: critério de ruptura de Mohr-Coulomb'],
  81:['Geotecnia','Estabilidade de taludes: geometria e parâmetros de resistência do solo'],
  82:['Geotecnia','Estabilidade de taludes: método de Fellenius e superfícies planas de ruptura'],
  83:['Geotecnia','Estabilidade de taludes: fator de segurança em superfícies circulares'],
  84:['Instrumentação Geotécnica','Piezometria: medição de pressão neutra em solos e rochas'],
  85:['Instrumentação Geotécnica','Piezômetros: resposta em solos de baixa permeabilidade'],
  86:['Instrumentação Geotécnica','Medição de nível d’água: medidores diretos e indiretos'],
  87:['Instrumentação Geotécnica','Leitura de nível e pressão: interpretação de escala manométrica'],
  88:['Hidráulica','Medidores de vazão: rotâmetro e orientação de instalação'],
  89:['Hidráulica','Medição ultrassônica de vazão: interferência de gás e sólidos em suspensão'],
  90:['Instrumentação Geotécnica','Monitoramento de barragens: medição de deslocamentos verticais e horizontais'],
  91:['Mecânica dos Solos','Capacidade de suporte: resistência ao cisalhamento e critério de Mohr-Coulomb'],
  92:['Geotecnia','Estabilidade de taludes: fator de segurança e consequências de ruptura'],
  93:['Geofísica','Radar de penetração no solo (GPR): princípio eletromagnético e investigação rasa'],
  94:['Geofísica','Métodos geofísicos: vantagens da investigação não invasiva'],
  95:['Legislação Mineral e Ambiental','Lei nº 12.334/2010: Plano de Segurança de Barragem e PNSB'],
  96:['Legislação Mineral e Ambiental','Segurança de barragens: classificação de risco e dano potencial associado'],
  97:['Legislação Mineral e Ambiental','Competências fiscalizatórias da ANM: sanções e títulos de lavra'],
  98:['Legislação Mineral e Ambiental','Regulação de barragens: obrigações para estruturas suscetíveis a liquefação'],
  99:['Legislação Mineral e Ambiental','Fiscalização de barragens: avaliação de conformidade e operacionalidade (ACO)']
}
const ctx={
hist:'Texto-base: trecho histórico sobre a colonização portuguesa, as primeiras povoações e as expedições em busca de metais e pedras preciosas no Brasil.',
port:'Comando: análise linguística e discursiva de texto-base sobre a mineração colonial e as expectativas de descoberta de riquezas minerais.',
english:'Texto-base em inglês: reportagem sobre o acordo de reparação relativo ao rompimento da barragem de Brumadinho em 2019, a tragédia de Mariana em 2015 e medidas de compensação e apoio às comunidades afetadas.',
constitution:'Comando: julgue o item com base nos direitos e garantias fundamentais previstos na Constituição Federal de 1988.',
ethics:'Comando: itens de ética e filosofia moral sobre Kant, utilitarismo e valores constitucionais relacionados à vida coletiva.',
leniency:'Comando: item sobre acordo de leniência e responsabilidade civil da pessoa jurídica à luz da legislação anticorrupção.',
piping:'Texto-base: prevenção dos fenômenos de piping e galgamento em barragens de rejeitos. O caderno traz figura esquemática com taludes, drenagem, rip-rap e tapete horizontal; a página original foi preservada.',
stress:'Texto-base: curva tensão-deformação de material submetido a carregamento. A figura original apresenta regiões e pontos de referência para identificação do módulo de Young, escoamento e ruptura.',
rocks:'Comando: itens de mineralogia, petrologia e geologia de engenharia, incluindo classificação de rochas, série de Bowen e classificações de maciços rochosos RMR e Q.',
weathering:'Comando: processos de intemperismo físico e químico e alteração de minerais e rochas pela água e por agentes superficiais.',
flow:'Texto-base: rede de fluxo em barragens de terra, com linhas de fluxo e equipotenciais, parâmetros de permeabilidade, dimensões e esquemas originais do caderno mantidos nas imagens da página.',
soil:'Comando: ensaios geotécnicos e propriedades de solos: anisotropia, resistência não drenada, cisalhamento direto e compactação Proctor.',
damBreak:'Comando: ruptura de barragem e propagação a jusante; análise da formação da brecha, hidrogramas, mapas de inundação e aproximações de modelos hidrodinâmicos.',
rheology:'Comando: conceitos de hidráulica e reologia de fluidos, incluindo comportamento não newtoniano.',
tailings:'Comando: construção e operação de barragens de rejeitos, alteamentos, ciclonagem, segregação granulométrica, propriedades mecânicas, filtragem e liquefação.',
slope:'Comando: estabilidade de taludes e capacidade de suporte com base em geometria, parâmetros de resistência e métodos de equilíbrio limite, incluindo Fellenius e Mohr-Coulomb.',
piezometer:'Texto-base: dois exemplos ilustrados de piezômetros e instrumentação usados para medir pressão da água em solos e rochas; as figuras originais permanecem vinculadas à página da prova.',
flowmeters:'Texto-base: instrumentos ilustrados de medição de nível e vazão. Os desenhos das figuras A e B e escalas de leitura foram preservados junto às páginas originais.',
monitoring:'Comando: instrumentação para monitoramento de barragens, deslocamentos e parâmetros geotécnicos.',
geophysics:'Comando: métodos de investigação geofísica aplicados a barragens, incluindo radar de penetração no solo (GPR).',
law:'Comando: legislação de segurança de barragens, política nacional, fiscalização da ANM, classificação de risco e avaliações de conformidade.'
}
function context(n){if(n<=7)return ctx.hist;if(n===12)return ctx.port;if(n<=18)return ctx.english;if(n===19)return ctx.constitution;if(n<=37)return ctx.ethics;if(n===40)return ctx.leniency;if(n<=43)return ctx.piping;if(n<=45)return ctx.stress;if(n<=50)return ctx.rocks;if(n<=52)return ctx.weathering;if(n<=58)return ctx.flow;if(n<=63)return ctx.soil;if(n<=68)return ctx.damBreak;if(n===69)return ctx.rheology;if(n<=80)return ctx.tailings;if(n<=83)return ctx.slope;if(n<=85)return ctx.piezometer;if(n<=89)return ctx.flowmeters;if(n===90)return ctx.monitoring;if(n<=92)return ctx.slope;if(n<=94)return ctx.geophysics;return ctx.law}
function cleanStem(text){return text.trim().split(/\n\s*(?:Espaço livre|CEBRASPE\s*[|–—-]\s*ANM)/i)[0].trim().replace(/\btext o\b/gi,'texto').replace(/\bhel p\b/gi,'help').replace(/\btem -se\b/gi,'tem-se').replace(/\bl inha\b/gi,'linha').replace(/\bm oles\b/gi,'moles').replace(/\bliquefaçã o\b/gi,'liquefação').replace(/\bi nglês\b/gi,'inglês').replace(/\bAgên cia\b/gi,'Agência').replace(/\bconclui -se\b/gi,'conclui-se')}
if(records.length!==75||new Set(records.map(q=>q.numero)).size!==75)throw Error(`Esperados 75 itens distintos; recebidos ${records.length}.`)
if(records.some(q=>q.resposta!=null))throw Error('Há resposta preexistente; revisão interrompida para evitar sobrescrita.')
const decisions=records.map(q=>{
 const n=Number(q.numero),topic=T[n],answer=answers[n]
 if(!topic||!answer)throw Error(`Item ${n}: classificação ou gabarito não mapeado.`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}.`)
 const basic=n<=40,sourceKey=basic?gabBasicos:gabEspecificos,stem=cleanStem(q.enunciado)
 if(stem.length<35)throw Error(`Enunciado suspeito/incompleto no item ${n}.`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:context(n),materia:topic[0],conteudo:topic[1],ano:2021,concurso:'ANM 2021 — Processo Seletivo Simplificado — Técnico em Segurança de Barragens',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova aplicada em 16/05/2021',cargo:'Técnico em Segurança de Barragens',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[13,14,16,19,40,43,44,45,48,49,50,53,54,55,56,57,58,59,60,61,63,64,65,67,68,69,70,72,73,74,76,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica, normativa ou linguística; não é nível publicado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial da ANM 2021; matéria e conteúdo classificados pelo conceito avaliado e pela seção correspondente da prova.`,resposta_correta:answer==='C'?0:1,anulada:false,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:sourceKey,arquivo:sourceKey.split('/').at(-1),prova,numero:n,pagina:1,resposta:answer,criterio:basic?'Gabarito oficial definitivo de Conhecimentos Básicos do perfil Técnico em Segurança de Barragens.':'Gabarito oficial definitivo do perfil Técnico em Segurança de Barragens.'},apta_resolucao:true}
})
if(decisions.some(d=>!d.materia||!d.conteudo||!d.texto_apoio||d.ano!==2021))throw Error('Há item sem contexto ou classificação completa.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,porMateria:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),semContexto:decisions.filter(d=>!d.texto_apoio).map(d=>d.numero),semGabarito:decisions.filter(d=>!d.gabarito_oficial).map(d=>d.numero),prova,gabBasicos,gabEspecificos,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — ANM 2021 — Técnico em Segurança de Barragens',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabaritos:{basicos:gabBasicos,especificos:gabEspecificos},publicado:false,nota:'75 registros pendentes classificados em história, português, inglês, filosofia, sociologia, direito e especialidades de segurança de barragens, geotecnia, geologia, hidráulica, instrumentação e legislação. Gabaritos definitivos básicos e específicos foram conferidos; imagens e figuras do caderno preservadas. Dificuldade estimada editorialmente.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — ANM 2021 — Técnico em Segurança de Barragens — revisão v399\n\n- 75 itens pendentes reclassificados, incluindo História do Brasil, Português, Inglês, Filosofia, Sociologia, Direito Constitucional e Administrativo e conteúdos específicos de geologia, geotecnia, engenharia e segurança de barragens.\n- Gabaritos oficiais definitivos de Conhecimentos Básicos e da prova específica conferidos separadamente; filtros de ano, perfil e banca registrados.\n- Recuperados os contextos compartilhados sobre mineração colonial, tragédias de barragens, piping/galgamento, curvas tensão-deformação, redes de fluxo, solos, rejeitos, instrumentação e legislação. Figuras de talude, piezômetros e medidores permanecem vinculadas às páginas originais.\n- Espaçamentos OCR evidentes foram corrigidos sem alterar o conteúdo técnico; dificuldade indicada como estimativa editorial.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo de Conhecimentos Básicos](${gabBasicos}) e [gabarito definitivo específico](${gabEspecificos}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify({...report,classificadas:result.classificadas,disponiveis:result.disponiveis,pendentes:result.pendentes},null,2))
