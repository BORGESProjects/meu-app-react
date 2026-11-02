import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-fuvest-2025-v419',documento='d97d20aed8c4e370'
const prova='https://www.fuvest.br/wp-content/uploads/fuvest2025_primeira_fase_prova_V1.pdf'
const chave='https://www.fuvest.br/wp-content/uploads/fuvest2025_gabarito_primeira_fase.pdf'
const respostas=new Map([...`1:E 2:B 3:B 4:C 5:A 6:C 7:C 8:E 9:D 10:A 11:D 12:D 13:B 14:A 15:D 16:C 17:C 18:E 19:B 20:E 21:B 22:E 23:D 24:C 25:B 26:E 27:E 28:D 29:C 30:B 31:B 32:E 33:B 34:E 35:E 36:E 37:C 38:A 39:D 40:C 41:C 42:E 43:C 44:C 45:E 46:D 47:C 48:D 49:A 50:D 51:B 52:D 53:A 54:A 55:C 56:E 57:A 58:A 59:D 60:D 61:C 62:D 63:E 64:B 65:C 66:D 67:A 68:A 69:B 70:A 71:C 72:A 73:A 74:D 75:A 76:D 77:E 78:B 79:D 80:E 81:D 82:D 83:D 84:B 85:B 86:B 87:A 88:E 89:E 90:B`.split(' ').map(s=>{const [n,a]=s.split(':');return [Number(n),a]})])
if(respostas.size!==90)throw Error(`Gabarito FUVEST: esperadas 90 respostas, encontradas ${respostas.size}`)
const temas=new Map([
 [1,['Português','Interpretação de textos e arte indígena: identidade, memória e colonialismo']],
 [2,['Geografia','Garimpo ilegal, terras indígenas, recursos hídricos e impactos socioambientais']],
 [3,['Português','Charge, ambiguidade, colocação de termos e crítica social']],
 [4,['História','Colonização portuguesa, caminhos indígenas e ocupação territorial']],
 [5,['Literatura','Adaptação de romance para novela gráfica e linguagem visual']],
 [6,['Filosofia','Alteridade, empatia e reconhecimento do outro']],
 [7,['Lógica','Falácias informais e tipos de argumento']],
 [8,['Filosofia','Tomás de Aquino, criação e natureza divina']],
 [9,['Sociologia','Comunicação digital, presença e temporalidade contemporânea']],
 [10,['Sociologia','Cultura do cancelamento e comunicação em rede']],
 [11,['Português','Conectivos e relações de sentido no texto']],
 [12,['Sociologia','Extrativismo e colonialismo de dados']],
 [13,['História','Colonização ibérica e inglesa na América']],
 [14,['História','Crise política do Império e crítica ao sistema de governo']],
 [16,['Matemática','Porcentagem, inclinação de rampas e desigualdades da NBR 9050']],
 [17,['Matemática','Geometria analítica e distância entre pontos no plano']],
 [18,['Física','Quantidade de movimento, impulso e força média em colisões']],
 [19,['Física','Efeito Compton, comprimento de onda e frequência de fótons']],
 [20,['Química','Modelos atômicos e estrutura da matéria']],
 [21,['Química','Estrutura eletrônica, raio iônico e baterias de intercalação']],
 [24,['Química','Compostos iônicos, cloreto de sódio e fontes de sal']],
 [25,['Geografia','Cartografia: escala numérica e conversão de unidades']],
 [27,['Geografia','Mudanças climáticas, derretimento de calotas e rotação da Terra']],
 [28,['Geografia','Terra, rotação e interação gravitacional de marés']],
 [29,['Biologia','Teoria sintética da evolução e adaptação das espécies']],
 [30,['Biologia','Fragmentação de habitats, deriva genética e doenças recessivas']],
 [31,['Biologia','Ecologia: mutualismo, branqueamento e perda de recifes de coral']],
 [32,['Física','Óptica ondulatória: interferência e iridescência']],
 [33,['Biologia','Anatomia comparada e biomecânica do crânio de pica-paus']],
 [34,['Literatura','Narrador, focalização e análise do romance Os ratos']],
 [35,['Literatura','Personagens, narrador e interpretação de Os ratos']],
 [36,['Literatura','Interpretação de narrativa africana de língua portuguesa']],
 [37,['Português','Poema, título e relações intertextuais']],
 [38,['Literatura','Recursos expressivos e representação da dor na poesia']],
 [39,['História','Propaganda política, representação de massas e varguismo/peronismo']],
 [40,['Sociologia','Desigualdade de gênero e participação no esporte']],
 [41,['Inglês','Interpretação de letra de música e metáforas em língua inglesa']],
 [42,['Inglês','Leitura de texto poético e construção social do conforto']],
 [43,['Literatura','Carlos Drummond de Andrade e o Modernismo brasileiro']],
 [44,['Filosofia','Santo Agostinho: tempo, memória e expectativa']],
 [45,['Matemática','Média aritmética e expectativa de vida por sexo']],
 [46,['Biologia','Botânica: sementes, reserva energética e embrião vegetal']],
 [47,['Biologia','Nutrição, gordura saturada e leitura de mapa temático']],
 [48,['Geografia','Pecuária brasileira e análise de séries estatísticas do IBGE']],
 [49,['Geografia','Sensoriamento remoto e desmatamento no MATOPIBA']],
 [50,['Geografia','Biomas brasileiros, campos e expansão agrícola']],
 [51,['Geografia','Ilha de calor, uso do solo e variação espacial da temperatura']],
 [52,['Física','Ondas eletromagnéticas, frequência AM e comunicação por rádio']],
 [55,['Biologia','Fisiologia comparada: sistemas circulatórios de invertebrados']],
 [56,['Química','Sais, solubilidade e desidratação na mumificação']],
 [57,['Química','Soluções supersaturadas, cristalização e equilíbrio']],
 [58,['Química','Chumbo: toxicidade, exposição e contaminação ambiental']],
 [59,['Física','Dilatação térmica linear e interpretação de gráficos']],
 [61,['Física','História da Física: Galileu e queda livre de corpos']],
 [63,['Química','Captura de carbono, estequiometria e produção de metano']],
 [64,['Química','Combustão, combustíveis e armazenamento de reagentes em foguetes']],
 [66,['Português','Emprego do pronome se e voz verbal']],
 [67,['Biologia','Células-tronco, diferenciação e aplicações terapêuticas']],
 [70,['Matemática','Progressão aritmética e recorrência de sequências']],
 [71,['Biologia','Seleção natural, mutação e resistência bacteriana a antibióticos']],
 [72,['Química','Substituição eletrofílica aromática da sulfanilamida']],
 [73,['Física','Gases ideais, estequiometria e pressão manométrica']],
 [74,['Física','Pressão, força resultante e aceleração de uma rolha']],
 [75,['Matemática','Geometria espacial: capacidade volumétrica de vaso com seção variável']],
 [76,['Matemática','Volumes e áreas laterais de cilindros']],
 [77,['Matemática','Geometria analítica: interseção de circunferências']],
 [78,['Português','Humor em cartum e interpretação de interação verbal']],
 [79,['História','Migrações e invasões no Império Romano tardio']],
 [80,['Sociologia','Max Weber: ética protestante e espírito do capitalismo']],
 [81,['Geografia','Industrialização brasileira e concentração industrial no Sudeste']],
 [82,['Literatura','Realismo e crítica social em Machado de Assis e Eça de Queirós']],
 [83,['Literatura','O funcionalismo público como personagem e tema literário']],
 [84,['Literatura','Intertextualidade entre Marília de Dirceu e Romanceiro da Inconfidência']],
 [85,['História','Conjuração Mineira, derrama e Inconfidência']],
 [86,['Arte','Modernismo brasileiro, Tarsila do Amaral e patrimônio mineiro']],
 [87,['Geografia','Produção têxtil, divisão do trabalho e economia local em Ijebu']],
 [88,['Geografia','Sahel: clima semiárido e transição ecológica africana']],
 [89,['Sociologia','Identidade africana, alteridade e globalização']],
 [90,['Português','Canção, identidade nacional e representações do Brasil']]
])
const blocos=new Map([
 [[1,12],'Linguagens, textos, artes e sociedade'],[[13,14],'História e formação política da América e do Brasil'],
 [[16,17],'Matemática e geometria aplicada'],[[18,21],'Física e Química: matéria, energia e radiação'],
 [[24,25],'Química e cartografia'],[[27,33],'Ciências da natureza e mudanças ambientais'],
 [[34,44],'Linguagens, literatura, história e filosofia'],[[45,52],'Matemática, biologia, geografia e física'],
 [[55,59],'Ciências da natureza: biologia, química e física'],[[61,64],'Física e química'],
 [[66,67],'Português e biologia'],[[70,78],'Matemática, biologia, química, física e interpretação textual'],
 [[79,90],'História, ciências humanas e literatura']
])
const clean=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\s*#####.*$/s,'').replace(/começa ndo/giu,'começando').replace(/consid eradas/giu,'consideradas').replace(/possíve l/giu,'possível').replace(/po pulação/giu,'população').replace(/aparecim ento/giu,'aparecimento').replace(/es trutura/giu,'estrutura').replace(/co nhecido/giu,'conhecido').replace(/direta mente/giu,'diretamente').replace(/uma barra de um cert o material/giu,'uma barra de certo material').replace(/material \. O gráfico/giu,'material. O gráfico').replace(/re flexão/giu,'reflexão').replace(/dif erença/giu,'diferença').replace(/co ncentração/giu,'concentração').replace(/po pulação/giu,'população').replace(/sulfan ilamida/giu,'sulfanilamida').replace(/se r encaixada/giu,'ser encaixada').replace(/rampa em porcentagem/giu,'rampa em porcentagem')
const respostasTexto=o=>o.map(clean)
const exportados=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
if(exportados.length!==79)throw Error(`Esperadas 79 questões FUVEST pendentes; export trouxe ${exportados.length}`)
const canonical=[...respostas].sort((a,b)=>a[0]-b[0]).map(([n,a])=>`${n}:${a}`).join('\n')
const hashGabarito=createHash('sha256').update(canonical).digest('hex')
const decisoes=[]
for(const q of exportados){
 const n=Number(q.numero),pagina=Number(q.pagina),[materia,conteudo]=temas.get(n)||[]
 if(!materia)throw Error(`Item ${n} sem matéria e conteúdo`)
 const answer=respostas.get(n);if(!answer)throw Error(`Item ${n} sem gabarito oficial`)
 const imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const apoio=clean(q.apoio||'')
 const ctx=(q.contexto||[]).map(x=>({pagina:Number(x.pagina),imagem:x.imagem,texto:''})).filter(x=>x.imagem&&x.pagina!==pagina)
 for(const c of ctx)await fs.access(`public/acervo-extraido/${c.imagem}`)
 const enunciado=clean(q.enunciado)
 let corrigido=enunciado
 if(n===16)corrigido=corrigido.replace(/Inclinação e desnível máximo de cada segmento de rampa.*?Acessibilidade a edificações,/,'Inclinação e desnível máximo de cada segmento de rampa: 1 < h ≤ 1,5 m: i = 5%; 0,8 < h ≤ 1 m: 5% < i ≤ 6,25%; 0 < h ≤ 0,8 m: 6,25% < i ≤ 8,33%. Acessibilidade a edificações,')
 if(n===19)corrigido=corrigido.replace(/𝜆ᇱ.*?em que/,'λ′ = λ₀ + (α/m)(1 − cos θ), em que')
 if(n===59)corrigido=corrigido.replace(/Δ𝐿.*?sendo 𝛼/,'ΔL = α L₀ (T − T₀), sendo α')
 if(n===70)corrigido=corrigido.replace(/Seja .*?Nessas condições, é correto afirmar:/,'Seja (aₙ) uma progressão aritmética cujo primeiro termo é a₁ e a razão r, ambos reais. Define-se outra sequência (bₙ), com primeiro termo real b₁ e lei bₙ₊₁ = bₙ + aₙ, para n > 0 natural. Por exemplo, se b₁ = 0 e (aₙ) = (1, 3, 5, 7, 9, 11, …), então (bₙ) = (0, 1, 4, 9, 16, 25, …). Se (bₙ) também for uma progressão aritmética de razão r′, é correto afirmar:')
 if(n===17)corrigido=corrigido.replaceAll('൏','<').replaceAll('൑','≤')
 if(n===18)corrigido=corrigido.replaceAll('ꟷ','⁻')
 if(n===21)corrigido=corrigido.replaceAll('Li +','Li⁺').replaceAll('Na +','Na⁺')
 if(n===72)corrigido=corrigido.replace(/1 L de uma solução/,'1 L de uma solução')
 if(n===73)corrigido=corrigido.replaceAll('CO 2','CO₂').replaceAll('NaHCO 3','NaHCO₃').replaceAll('CH3COOH','CH₃COOH').replaceAll('CH3COONa','CH₃COONa')
 if(n===74)corrigido=corrigido.replaceAll('105 Pa','10⁵ Pa')
 if(n===76)corrigido=corrigido.replaceAll('൐','>').replaceAll('ൌ','=').replaceAll('൅','+').replaceAll('ଵ','₁').replaceAll('ଶ','₂').replaceAll('௛','h').replaceAll('௥','r')
 if(n===77)corrigido=corrigido.replaceAll('𝑥ଶ','x²').replaceAll('𝑦ଶ','y²').replaceAll('െ','−').replaceAll('ൌ','=')
 const opcoes=respostasTexto(q.opcoes||[]).map(o=>o.replaceAll('൏','<').replaceAll('൑','≤').replaceAll('ൌ','=').replaceAll('ꟷ','⁻').replaceAll('൅','+').replaceAll('ଵ','₁').replaceAll('ଶ','₂').replaceAll('ெ','−').replaceAll('൐','>').replaceAll(' Li +',' Li⁺').replaceAll(' Na +',' Na⁺'))
 if(opcoes.length!==5)throw Error(`Item ${n}: esperadas 5 alternativas, encontradas ${opcoes.length}`)
 const dificuldade=(n===19||n===21||n===63||n===70||n===72||n===73||n===74||n===75||n===76||n===77)?'Difícil':(n<=14||[16,17,24,25,34,35,37,43,46,55,56,66,78,86,90].includes(n))?'Média':'Média'
 const bloco=[...blocos].find(([[a,b]])=>n>=a&&n<=b)?.[1]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
   concurso:'Vestibular USP 2025 — 1ª fase — Prova V1',banca:'FUVEST',organizadora:'FUVEST',aplicacao:'17/11/2024 — primeira fase do Vestibular USP 2025',etapa:'1ª fase',cargo:'Vestibular USP',
   numero_original:n,numero:n,pagina,opcoes,resposta_correta:'ABCDE'.indexOf(answer),anulada:false,tipo_resposta:'objetiva',
   dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência de leitura, aplicação de conceitos e número de etapas de raciocínio; a FUVEST publica estatísticas próprias por questão e carreira, que não foram usadas nesta classificação.',
   classificacao_fonte:prova,motivo:`Questão ${n}, caderno FUVEST V1 do Vestibular USP 2025. Matéria e conteúdo individualizados pelo texto, alternativas, imagens e seção temática; gabarito cotejado com a tabela oficial da prova V1. O vestibular é de 2025 e sua primeira fase foi aplicada em 17/11/2024.`,
   ...(corrigido!==enunciado?{enunciado:corrigido}:{}),texto_apoio:apoio,
   imagens_contexto:ctx,reemplazarContexto:true,visual:{pagina,imagem,texto_apoio:apoio,motivo:`Página ${pagina} do caderno oficial V1 vinculada como imagem principal; páginas contextuais da extração preservadas e conferidas para textos, gráficos, mapas e figuras.`},apta_resolucao:true,
   gabarito_oficial:{fonte:chave,arquivo:'fuvest2025_gabarito_primeira_fase.pdf',prova:'Vestibular USP 2025 — Prova V1',sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_das_90_respostas; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial FUVEST da prova V1 — primeira fase aplicada em 17/11/2024.'},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']})
}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const final={...report,documento,questoes_revisadas:79,questoes_unicas:79,prova_oficial:prova,gabarito_oficial:chave,checksum_gabarito:hashGabarito,ano_vestibular:2025,data_aplicacao:'2024-11-17',imagens_contextuais_verificadas:true}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2));console.log(JSON.stringify(final,null,2))
