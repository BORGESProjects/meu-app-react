import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-ibama-fauna-2025-v417'
const documento='060114ec12d567d3'
const prova='https://cdn.cebraspe.org.br/concursos/ibama_25/arquivos/057_IBAMA_003_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/ibama_25/arquivos/Gab_Definitivo_057_IBAMA_003_01.PDF'
const respostas=new Map([...`51:E 52:E 53:C 54:C 55:E 56:C 57:C 58:E 59:C 60:X 61:E 62:C 63:C 64:C 65:C 66:E 67:E 68:E 69:C 70:E 71:C 72:X 73:C 74:E 75:C 76:E 77:C 78:E 79:C 80:E 81:C 82:C 83:E 84:C 85:C 86:X 87:E 88:C 89:E 90:C 91:C 92:E 93:E 94:C 95:E 96:C 97:C 98:C 99:E 100:E 101:E 102:E 103:E 104:E 105:C 106:C 107:E 108:C 109:E 110:C 111:C 112:E 113:E 114:C 115:E 116:X 117:X 118:C 119:E 120:E`.split(' ').map(x=>{const [n,a]=x.split(':');return [Number(n),a]})])
if(respostas.size!==70)throw Error(`Gabarito mapeado com ${respostas.size} itens, esperado 70`)
const topicos=new Map([
 [51,['Legislação Ambiental','IN IBAMA nº 5/2021: destinação provisória de fauna silvestre recebida em CETAS']],
 [52,['Legislação Ambiental','IN IBAMA nº 5/2021: espécies recebidas nos CETAS']],
 [53,['Zoologia','Triagem de fauna silvestre: identificação taxonômica, avaliação e marcação']],
 [54,['Legislação Ambiental','CETAS: visitação, educação ambiental e autorização administrativa']],
 [55,['Ecologia','Áreas úmidas: definição e ecossistemas naturais ou artificiais']],
 [56,['Ecologia','Ecossistemas amazônicos sujeitos a inundação e sazonalidade hídrica']],
 [57,['Ecologia','Pulso de inundação em várzeas e dinâmica da fauna aquática']],
 [58,['Botânica','Vegetação herbácea e produtividade nos igapós']],
 [59,['Zoologia','Anatomia renal comparada de procionídeos e felinos']],
 [60,['Zoologia','Classificação de artiodáctilos e anatomia dos dígitos']],
 [61,['Zoologia','Taxonomia de xenartros: tatu-canastra e nomenclatura de Edentata']],
 [62,['Legislação Ambiental','CONCEA e métodos alternativos em testes de cosméticos']],
 [63,['Legislação Ambiental','Experimentação animal no desenvolvimento de cosméticos']],
 [64,['Legislação Ambiental','Lei nº 5.197/1967: destinação de produtos apreendidos']],
 [65,['Legislação Ambiental','Lei de Proteção à Fauna: criadouros para fins econômicos']],
 [66,['Legislação Ambiental','Políticas públicas sobre caça esportiva e proteção da fauna']],
 [67,['Legislação Ambiental','Defeso da pesca e proteção de espécies']],
 [68,['Legislação Ambiental','Caça e captura de fauna silvestre em zonas urbanas']],
 [69,['Legislação Ambiental','Crimes ambientais: maus-tratos e experimentação animal']],
 [70,['Biologia Evolutiva','Evolução do cérebro animal e hipótese do cérebro triuno']],
 [71,['Biologia Evolutiva','Limites do uso de categorias “primitivo” e “evoluído”']],
 [72,['Biologia Evolutiva','Origem e evolução inicial dos organismos']],
 [73,['Biologia Evolutiva','Evolução, sistema nervoso e hierarquização de organismos']],
 [74,['Epidemiologia','Conceito de risco epidemiológico e caracterização de danos']],
 [75,['Genética de Populações','Migração e movimento de alelos entre populações']],
 [76,['Genética de Populações','Fluxo gênico e diversidade genética populacional']],
 [77,['Epidemiologia','Diferença entre epidemia e endemia']],
 [78,['Biologia Evolutiva','Anagênese e mudança de linhagens evolutivas']],
 [79,['Ecologia','Monitoramento de indivíduos e potencial adaptativo de espécies']],
 [80,['Medicina Veterinária','Extrapolação alométrica de doses entre espécies']],
 [81,['Medicina Veterinária','Contenção física de psitaciformes em cativeiro']],
 [82,['Medicina Veterinária','Cetamina e anestesia de animais silvestres']],
 [83,['Medicina Veterinária','Contenção de aves Sulidae e risco de asfixia']],
 [84,['Medicina Veterinária','Biossegurança ocupacional e zoonoses']],
 [85,['Medicina Veterinária','Tiaminase em peixes e deficiência nutricional em mustelídeos']],
 [86,['Zoologia','Reprodução de serpentes: oviparidade e viviparidade']],
 [87,['Medicina Veterinária','Ciclo estral e ovulação do lobo-guará']],
 [88,['Medicina Veterinária','Hemocromatose nutricional em aves']],
 [89,['Medicina Veterinária','Hiperparatireoidismo nutricional secundário em quelônios']],
 [90,['Medicina Veterinária','Manejo alimentar de crocodilianos em cativeiro']],
 [91,['Conservação da Fauna','Espécies ameaçadas: sauim-de-coleira e caiarara-ka’apor']],
 [92,['Zoologia','Taxonomia de Sus scrofa e relações entre suiformes']],
 [93,['Conservação da Fauna','Translocação de fauna e avaliação de impactos populacionais']],
 [94,['Ecologia','Estratégia Nacional para Espécies Exóticas Invasoras']],
 [95,['Conservação da Fauna','Dispositivos de mitigação de captura incidental de aves marinhas']],
 [96,['Biologia da Conservação','Conservação ex situ e preservação in situ diante das mudanças climáticas']],
 [97,['Gestão Ambiental','Governança ambiental e instrumentos econômicos de sustentabilidade']],
 [98,['Legislação Ambiental','Manejo sustentável e sistemas agroflorestais em reserva legal']],
 [99,['Biologia da Conservação','Paisagem, áreas antropizadas e manutenção da biodiversidade']],
 [100,['Biologia da Conservação','Princípios ecológicos e genéticos aplicados à conservação']],
 [101,['Legislação Ambiental','Uso de recursos naturais em unidades de proteção integral']],
 [102,['Legislação Ambiental','Manejo florestal e corredores ecológicos']],
 [103,['Legislação Ambiental','Corredores ecológicos no Sistema Nacional de Unidades de Conservação']],
 [104,['Ecologia','Lobo-guará, corredores ecológicos e conectividade de habitats']],
 [105,['Ecologia','Conectividade de fragmentos e fluxo gênico em corredores ecológicos']],
 [106,['Conservação da Fauna','Planos de ação para espécies ameaçadas e áreas de reprodução']],
 [107,['Conservação da Fauna','Conservação da tartaruga-de-couro e áreas de reprodução']],
 [108,['Legislação Ambiental','Unidades de conservação, APP e proteção de áreas reprodutivas']],
 [109,['Ecologia','Efeito de borda e fragmentação de habitats']],
 [110,['Ecologia','Renaturalização urbana e restauração de ecossistemas']],
 [111,['Ecologia','Javali europeu como espécie exótica invasora']],
 [112,['Ecologia','Metapopulações e conectividade espacial de habitats']],
 [113,['Ecologia','Dispersão de fauna e adaptação às mudanças climáticas']],
 [114,['Ecologia','Morcegos frugívoros, dispersão e heterogeneidade vegetal']],
 [115,['Ecologia','Espécies nativas fora de sua área de ocorrência natural']],
 [116,['Geografia Física','Relevo e distribuição da radiação solar incidente']],
 [117,['Geografia Física','Altitude, radiação solar e albedo']],
 [118,['Geomorfologia','Depósitos correlativos e evolução da paisagem']],
 [119,['Cartografia','Escala cartográfica, distância real e medição em mapa']],
 [120,['Cartografia','Escolha de escala cartográfica para análise ambiental']]
])
const grupos=new Map([
 [[51,54],'Centros de triagem de animais silvestres (CETAS), IN IBAMA nº 5/2021 e proteção da fauna'],
 [[55,58],'Áreas úmidas, ecossistemas amazônicos e pulso de inundação'],
 [[59,61],'Anatomia e taxonomia de mamíferos silvestres'],
 [[62,69],'Proteção legal da fauna, experimentação animal e ilícitos ambientais'],
 [[70,73],'Biologia animal e evolução'],
 [[74,79],'Genética de populações, evolução e epidemiologia'],
 [[80,84],'Contenção de fauna silvestre, farmacologia veterinária e biossegurança'],
 [[85,90],'Medicina veterinária de animais silvestres: nutrição, reprodução e clínica'],
 [[91,95],'Manejo da fauna silvestre, conservação e espécies invasoras'],
 [[96,100],'Biologia da conservação, gestão ambiental e uso sustentável'],
 [[101,105],'Legislação ambiental e corredores ecológicos'],
 [[106,108],'Proteção de áreas de reprodução e conservação de espécies'],
 [[109,115],'Ecologia da paisagem, fragmentação, conectividade e dispersão'],
 [[116,118],'Geografia física, radiação solar e geomorfologia'],
 [[119,120],'Cartografia aplicada a estudos ambientais']
])
const imagens=async pagina=>{const arquivo=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${arquivo}`);return arquivo}
const exportados=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const qs=exportados.map(q=>({...q,numero_original:q.numero,texto_apoio:q.apoio}))
qs.sort((a,b)=>Number(a.numero_original)-Number(b.numero_original))
if(qs.length!==60||new Set(qs.map(q=>q.numero_original)).size!==60)throw Error(`Esperadas 60 questões pendentes únicas; encontradas ${qs.length}`)
for(const n of [60,72,86])if(respostas.get(n)!=='X')throw Error(`Anulação oficial do item ${n} divergente`)
const hashGabarito=createHash('sha256').update([...respostas].map(([n,a])=>`${n}:${a}`).join('\n')).digest('hex')
const decisoes=[]
for(const q of qs){
 const n=Number(q.numero_original),pagina=Number(q.pagina),[materia,conteudo]=topicos.get(n)||[]
 if(!materia)throw Error(`Sem classificação individual do item ${n}`)
 const answer=respostas.get(n);if(!answer)throw Error(`Sem gabarito oficial para o item ${n}`)
 const anulada=answer==='X',imagem=await imagens(pagina)
 const apoio=Array.isArray(q.apoio)?q.apoio.map(x=>x.texto).filter(Boolean).join('\n\n'):String(q.texto_apoio||'')
 const bloco=[...grupos].find(([[a,b]])=>n>=a&&n<=b)?.[1]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
   concurso:'IBAMA 2025 — Cargo 3: Analista Ambiental, Tema 2 — Manejo, Conservação e Reabilitação da Fauna Silvestre',
   banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Concurso IBAMA — prova aplicada em 06/04/2025',cargo:'Analista Ambiental — Tema 2: Manejo, Conservação e Reabilitação da Fauna Silvestre',
   numero_original:n,numero:n,pagina,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:anulada?null:answer==='C'?0:1,anulada,
   dificuldade:['Legislação Ambiental','Genética de Populações','Medicina Veterinária'].includes(materia)?'Média':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial baseada na especificidade técnico-científica e normativa; não é faixa oficial da banca.',classificacao_fonte:prova,
   motivo:`Item ${n}, caderno oficial do CEBRASPE para IBAMA 2025, Cargo 3, Tema 2. Matéria e conteúdo individualizados pelo enunciado e pelo comando de seção “${bloco}”; cargo, ano, aplicação e banca cotejados com as publicações oficiais.`,
   texto_apoio:apoio,visual:{pagina,imagem,texto_apoio:apoio,motivo:`Página ${pagina} do caderno oficial associada ao item ${n}; contexto textual preservado e imagem da página verificada visualmente.`},apta_resolucao:true,
   gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_057_IBAMA_003_01.PDF',prova:'057_IBAMA_003_01.pdf',sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_dos_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado, sem correção automática.':'Gabarito oficial definitivo do CEBRASPE para o Cargo 3, Tema 2.'},
   ...(anulada?{anulacao_fonte:chave}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']})
}
const base=raizesAtuais[0]
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
const final={...report,documento,questoes_revisadas:decisoes.length,questoes_unicas:60,itens_anulados:[60,86],prova_oficial:prova,gabarito_definitivo:chave,checksum_gabarito:hashGabarito,correcao_automatica:58}
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2))
console.log(JSON.stringify(final,null,2))
