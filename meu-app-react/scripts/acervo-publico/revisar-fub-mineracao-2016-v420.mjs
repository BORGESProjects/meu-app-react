import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-fub-mineracao-2016-v420',documento='a1c9efc3c51e6b78'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_017_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_017_01.pdf'
const respostas=new Map(`51:C 52:C 53:E 54:E 55:C 56:E 57:E 58:C 59:E 60:C 61:C 62:E 63:C 64:E 65:E 66:E 67:C 68:C 69:C 70:E 71:C 72:C 73:C 74:C 75:E 76:E 77:C 78:C 79:C 80:E 81:E 82:C 83:E 84:C 85:E 86:C 87:E 88:E 89:C 90:E 91:C 92:C 93:E 94:E 95:C 96:E 97:E 98:C 99:C 100:C 101:E 102:E 103:C 104:C 105:C 106:C 107:C 108:E 109:C 110:E 111:C 112:C 113:C 114:E 115:C 116:C 117:E 118:E 119:C 120:C`.split(' ').map(s=>{const [n,a]=s.split(':');return [Number(n),a]}))
if(respostas.size!==70)throw Error(`Esperadas 70 respostas definitivas; encontradas ${respostas.size}`)
const temas=new Map([
 [51,['Geologia','Geologia geral: composição química e diferenças entre crosta continental e oceânica']],
 [52,['Mineralogia','Conceito de mineral: estado físico e origem geológica']],
 [53,['Mineralogia','Silicatos: estrutura dos inossilicatos, piroxênios e anfibólios']],
 [54,['Geologia','Petrologia sedimentar: classificação de conglomerados por suporte de clastos e matriz']],
 [55,['Petrologia','Petrologia ígnea: textura porfirítica, cristalização magmática e velocidade de resfriamento']],
 [56,['Mineralogia','Alteração mineral: saussuritização de feldspatos']],
 [57,['Petrologia','Petrologia metamórfica: eclogito, paragênese mineral e condições de alta pressão']],
 [58,['Geologia','Geofísica: descontinuidade de Gutenberg e propagação de ondas sísmicas no núcleo externo']],
 [59,['Legislação Mineral','Pesquisa mineral: habilitação profissional e responsabilidade técnica perante DNPM e CREA/CONFEA']],
 [60,['Legislação Mineral','Código de Mineração: hipóteses de não incidência em obras de terraplenagem']],
 [61,['Geoprocessamento','Georreferenciamento: pontos de controle e feições identificáveis no terreno']],
 [62,['Cartografia','Cartografia geológica: coordenadas geográficas, projeção UTM e meridiano central']],
 [63,['Pesquisa Mineral','Sondagem: definição do azimute de furos inclinados']],
 [64,['Pesquisa Mineral','Amostragem geoquímica: coleta de fragmentos de rocha (chip sampling)']],
 [65,['Geofísica','Radiometria gama: interpretação de imagens ternárias de K, U e Th']],
 [66,['Pesquisa Mineral','Sondagem rotativa: testemunhos e séries de diâmetros AW, BW, EW, NW e HW']],
 [67,['Sensoriamento Remoto','Fotogrametria aérea: escala, altura de voo e distância focal']],
 [68,['Avaliação de Depósitos Minerais','Classificação de recursos e reservas: critérios de reserva medida e precisão']],
 [69,['Geologia','Petrologia sedimentar: ocorrência e idade de calcários e dolomitos']],
 [70,['Geologia Econômica','Depósitos minerais: gênese de depósitos hidrotermais']],
 [71,['Beneficiamento de Minérios','Minerais-minério, ganga e substâncias deletérias']],
 [72,['Sensoriamento Remoto','Imagens Landsat aplicadas à exploração mineral e ao mapeamento de lineamentos']],
 [73,['Geologia de Engenharia','Mecânica de rochas: espaçamento de fraturas e condutividade hidráulica']],
 [74,['Geologia de Engenharia','Suporte de galerias subterrâneas: tirantes, chumbadores e concreto projetado/armado']],
 [75,['Sensoriamento Remoto','Sensores ativos e passivos: emissão e registro de energia eletromagnética']],
 [76,['Petrologia','Petrografia ígnea: identificação macroscópica de gabro']],
 [77,['Petrologia','Petrografia ígnea: identificação de granodiorito por composição e textura']],
 [78,['Planejamento de Mina','Seleção de equipamentos conforme geometria do corpo mineral e topografia']],
 [79,['Lavra a Céu Aberto','Equipamentos e insumos para decapeamento, perfuração, desmonte e transporte']],
 [80,['Métodos de Lavra','Critérios técnicos e ambientais para seleção entre lavra subterrânea e a céu aberto']],
 [81,['Equipamentos de Mineração','Tratores de esteira: funções em operações de lavra']],
 [82,['Desmonte de Rochas','Explosivos: ondas de choque, vibração e propagação sísmica']],
 [83,['Desmonte de Rochas','Plano de fogo: burden, espaçamento, subperfuração e termos técnicos']],
 [84,['Perfuração de Rochas','Classificação dos sistemas e métodos de perfuração']],
 [85,['Explosivos','Impedância do explosivo e compatibilidade com a rocha e o diâmetro do furo']],
 [86,['Desmonte de Rochas','Argamassa expansiva para corte controlado e extração de blocos']],
 [87,['Beneficiamento de Minérios','Britagem, moagem e classificação granulométrica']],
 [88,['Perfuração de Rochas','Marteletes e perfuratrizes: classificação e aplicação']],
 [89,['Beneficiamento de Minérios','Peneiramento, análise granulométrica, homogeneização e quarteamento']],
 [90,['Beneficiamento de Minérios','Concentração gravítica de minerais densos finos']],
 [91,['Equipamentos de Mineração','Escavadeiras e equipamentos de arranque e carregamento']],
 [92,['Geoprocessamento','Integração de SIG e sensoriamento remoto no monitoramento de áreas mineradas']],
 [93,['Geoprocessamento','SIG aplicado à mineração subterrânea e modelagem tridimensional de corpos de minério']],
 [94,['Geoprocessamento','Governança e controle de acesso a sistemas de informação geográfica']],
 [95,['Geoprocessamento','Gestão de dados de mineração: bancos de dados, análise estatística e inteligência artificial']],
 [96,['Beneficiamento de Minérios','Consumo de energia em usinas: transporte, moagem e separação gravítica']],
 [97,['Beneficiamento de Minérios','Reologia de polpas minerais: viscosidade e ação de modificadores']],
 [98,['Beneficiamento de Minérios','Flotação: hidrofobicidade, bolhas de ar e separação mineral']],
 [99,['Beneficiamento de Minérios','Minerais de minério e ganga: valor econômico e aproveitamento']],
 [100,['Beneficiamento de Minérios','Purificação e remoção de contaminantes minerais']],
 [101,['Equipamentos de Mineração','Motoniveladoras, correias transportadoras e movimentação de materiais']],
 [102,['Equipamentos de Mineração','Jumbo de perfuração: funções em minas subterrâneas']],
 [103,['Lavra Subterrânea','Controle de convergência de escavações por pinos de referência']],
 [104,['Equipamentos de Mineração','Motoscrapers: carregamento e transporte de materiais']],
 [105,['Segurança do Trabalho','Controle de poeira mineral em operações de corte e perfuração']],
 [106,['Segurança do Trabalho','Direito à informação sobre riscos ocupacionais']],
 [107,['Segurança do Trabalho','Umidificação de vias não pavimentadas para controle de poeira']],
 [108,['Segurança do Trabalho','Perfuração e corte de rochas: controle de poeira por supressão úmida']],
 [109,['Higiene Ocupacional','Exposição a poeiras minerais: medidas de prevenção e controle']],
 [110,['Higiene Ocupacional','Monitoramento de exposição ocupacional a poeiras minerais']],
 [111,['Lavra Subterrânea','Método corte e enchimento: uso de estéril no preenchimento de escavações']],
 [112,['Beneficiamento de Minérios','Rejeitos de mineração: consistência de polpa e ensaio de abatimento']],
 [113,['Mineralogia','Propriedades físicas dos minerais: dureza e resistência à abrasão']],
 [114,['Lavra Subterrânea','Desenvolvimento de minas: dimensões de rampas e áreas de acesso']],
 [115,['Segurança do Trabalho','Desmonte de rochas: ruído ocupacional e medidas de mitigação']],
 [116,['Meio Ambiente','Mineração a céu aberto: impactos ambientais e recuperação de áreas degradadas']],
 [117,['Meio Ambiente','Rejeitos de mineração com arsênio: risco de contaminação hídrica']],
 [118,['Meio Ambiente','Mercúrio na mineração: emissões atmosféricas e impacto ambiental']],
 [119,['Meio Ambiente','Fechamento de mina: plano de recuperação de área degradada']],
 [120,['Meio Ambiente','Emissões atmosféricas e fontes de poluição por gases em operações de mineração']]
])
const duplicadas=new Map([
 ['extr-216956c0b0585dec81ef',{mantida:'extr-b29d5b0d22d47af2a9e6',n:51}],
 ['extr-2f53fee7b6ee3c2d7a7c',{mantida:'extr-ed87bbe2ffad4880e16a',n:54}],
 ['extr-8b9b1ba6f3518d56fc36',{mantida:'extr-483a49bddd7d358b11e0',n:55}]
])
const exportados=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
if(exportados.length!==73)throw Error(`Esperados 73 registros brutos do lote; encontrados ${exportados.length}`)
const idsPorNumero=new Map()
for(const q of exportados)idsPorNumero.set(q.numero,[...(idsPorNumero.get(q.numero)||[]),q])
if(idsPorNumero.size!==70||[...idsPorNumero.keys()].some(n=>!respostas.has(n)))throw Error('Números do lote divergem da prova/gabarito 51–120')
const canonical=[...respostas].map(([n,a])=>`${n}:${a}`).join('\n'),hashGabarito=createHash('sha256').update(canonical).digest('hex')
const limpo=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\s*\|\|281FUB_017_01N822512\|\|[\s\S]*$/,'').replace(/\s+Espaço livre\s*$/i,'').replace(/s ilicáticas/gi,'silicáticas').replace(/Osconglomerados/gi,'Os conglomerados').replace(/f lotação/gi,'flotação').replace(/polut\w+/gi,'poluente').trim()
const decisoes=[]
for(const q of exportados){
 const n=Number(q.numero),[materia,conteudo]=temas.get(n)||[]
 if(!materia)throw Error(`Item ${n} sem classificação específica`)
 const dup=duplicadas.get(q.id),resposta=respostas.get(n),imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 let enunciado=limpo(q.enunciado)
 if(n===81)enunciado='Tratores de esteira são equipamentos destinados à perfuração e ao avanço nas frentes de lavra da mina.'
 if(n===86)enunciado='O desmonte com a utilização de argamassa expansiva é adequado nos casos em que se deseja retirar blocos métricos de rocha na forma de paralelepípedos.'
 if(n===120)enunciado='Na mineração, a poluição por gases é pouco significativa e, em geral, restringe-se à emissão de gases pelos motores das máquinas e dos veículos utilizados na lavra.'
 const opcoes=['Certo','Errado']
 const dificuldade=[53,58,62,65,68,73,75,76,77,82,83,85,89,90,93,96,97,98,109,110,112,114].includes(n)?'Difícil':'Média'
 const ctx=[]
 if(n===95){const p='paginas/'+documento+'-0003.webp';await fs.access(`public/acervo-extraido/${p}`);ctx.push({pagina:3,imagem:p,texto:'Continuação do caderno: seção de tratamento e beneficiamento de minérios; página vinculada para conferir o contexto e o encadeamento da prova.'})}
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso:'FUB 2016 — Cargo 17: Técnico em Mineração',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'18/12/2016',cargo:'Técnico em Mineração',numero_original:n,numero:n,pagina:Number(q.pagina),opcoes,resposta_correta:resposta==='C'?0:1,anulada:false,tipo_resposta:'certo_errado',dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especialização técnica e nas etapas de aplicação conceitual; o CEBRASPE não publicou nível de dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo enunciado e pelo bloco temático visível no caderno oficial do Cargo 17. O ano, cargo e data de aplicação foram conferidos no material oficial da FUB/CEBRASPE. Gabarito cotejado com o arquivo oficial definitivo específico do cargo.`,enunciado,texto_apoio:'',imagens_contexto:ctx,reemplazarContexto:true,visual:{pagina:Number(q.pagina),imagem,texto_apoio:'',motivo:`Página ${q.pagina} do caderno oficial verificada visualmente; o original preserva diagramas, descrições de rochas e elementos gráficos úteis aos itens desta página.`},apta_resolucao:!dup,gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_017_01.pdf',prova:'FUB 2016 — Cargo 17: Técnico em Mineração — gabarito definitivo',sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_das_respostas_51_a_120; nao_e_hash_do_pdf',numero:n,resposta,criterio:'Gabarito definitivo do CEBRASPE para o Cargo 17 — Técnico em Mineração; itens 51 a 120.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']}
 if(dup){d.apta_resolucao=false;d.inelegibilidade_motivo='registro_duplicado_com_ocr_mesclado';d.duplicada_de=dup.mantida;d.motivo=`Duplicata do item ${n}; o registro canônico foi mantido separadamente. Esta cópia contém texto repetido ou mesclado e fica fora da resolução e da contagem elegível.`}
 decisoes.push(d)
}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const final={...report,documento,questoes_revisadas:73,questoes_unicas:70,duplicatas_inelegiveis:3,questoes_elegiveis:70,prova_oficial:prova,gabarito_oficial:chave,checksum_gabarito:hashGabarito,ano:2016,data_aplicacao:'2016-12-18',imagens_verificadas:[1,2,3],ocr_mesclado_corrigido:[81,86,120]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2));console.log(JSON.stringify(final,null,2))
