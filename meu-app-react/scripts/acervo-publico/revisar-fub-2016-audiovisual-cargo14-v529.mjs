import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-2016-audiovisual-cargo14-v529',doc='d1a7a3630fb86fab'
const base='tmp/revisao-profissional/revisao-seduc-al-2021-ensino-religioso-v528/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_014_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_014_01.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,72)

// Conferido item a item com o caderno oficial e o gabarito definitivo do Cargo 14.
const respostas='51:C|52:E|53:E|54:E|55:E|56:C|57:E|58:C|59:C|60:E|61:C|62:C|63:C|64:E|65:C|66:C|67:E|68:C|69:E|70:E|71:C|72:C|73:C|74:E|75:C|76:C|77:C|78:E|79:E|80:E|81:C|82:C|83:E|84:E|85:C|86:E|87:C|88:E|89:E|90:C|91:C|92:C|93:E|94:E|95:C|96:C|97:C|98:E|99:E|100:C|101:C|102:C|103:E|104:C|105:E|106:C|107:E|108:C|109:C|110:C|111:E|112:E|113:E|114:C|115:C|116:C|117:E|118:C|119:C|120:C'
const resposta=new Map(respostas.split('|').map(v=>{const [n,a]=v.split(':');return[Number(n),a]}))
const assuntos={
 51:['Linguagem Audiovisual','Campo, extracampo e composição do espaço fílmico','Média'],52:['Linguagem Audiovisual','Extracampo e continuidade espacial','Média'],53:['Linguagem Audiovisual','Movimento panorâmico e enquadramento de câmera','Média'],54:['Linguagem Audiovisual','Plano-sequência e unidade dramática','Média'],55:['Linguagem Audiovisual','Plano, sequência e distância de câmera','Média'],
 56:['Sonoplastia','Som direto e sincronização com a imagem','Fácil'],57:['Pós-produção de Áudio','Sincronização, timbre, equalização e masterização','Média'],58:['Sonoplastia','Som direto, efeitos sonoros e trilha sonora','Fácil'],59:['Sonoplastia','Função técnica e artística da sonoplastia','Fácil'],60:['Captação de Áudio','Função do sonoplasta na gravação audiovisual','Fácil'],61:['Edição de Áudio','Pro Tools: edição e mixagem de áudio','Fácil'],62:['Áudio Digital','Conversão analógico-digital e conversores A/D e D/A','Média'],63:['Edição de Vídeo','Softwares de edição de vídeo','Fácil'],
 64:['Acústica','Frequência fundamental, harmônicos e timbre','Média'],65:['Acústica','Faixas de frequência da voz humana','Fácil'],66:['Acústica','Frequência fundamental e harmônicos da voz','Média'],67:['Acústica','Faixa de frequência da voz na conversação','Fácil'],68:['Acústica','Amplitude, frequência e duração de ondas sonoras','Média'],69:['Acústica','Interferência destrutiva e diferença de fase','Média'],70:['Acústica','Amplitude da onda e intensidade sonora','Fácil'],71:['Acústica','Frequência e percepção da altura do som','Fácil'],72:['Acústica','Amplitude e frequência de ondas sonoras','Fácil'],
 73:['Comunicação Audiovisual','Audiovisual, memória coletiva e narrativas sociais','Média'],74:['Comunicação Audiovisual','Produção artística crítica e indústria cultural','Média'],75:['Animação','Animação, realismo e representação visual','Média'],76:['Linguagem Audiovisual','Industrialização do cinema e continuidade narrativa','Média'],
 77:['Mixagem de Áudio','Compressão dinâmica e uso de compressor/limiter','Média'],78:['Mixagem de Áudio','Filtros passa-altas e equalização','Média'],79:['Mixagem de Áudio','Reverberação, delay e percepção de espaço','Difícil'],80:['Mixagem de Áudio','Efeito de fattening e tempo de delay','Média'],81:['Mixagem de Áudio','Equalização nas etapas de produção musical','Média'],82:['Mixagem de Áudio','Compressão, limiter e controle de picos','Média'],
 83:['Microfones','Phantom power e alimentação de microfones condensadores','Difícil'],84:['Microfones','Impedância e distorção de sinal','Média'],85:['Microfones','Princípio de funcionamento de microfones e alto-falantes','Média'],86:['Microfones','Microfone condensador e armazenamento de carga','Média'],87:['Microfones','Resposta em frequência de microfones condensadores','Fácil'],88:['Microfones','Microfones dinâmicos, condensadores e transientes','Difícil'],
 89:['Edição de Áudio e Vídeo','Formatos de mídia e configuração de sequências de edição','Média'],90:['Vídeo Digital','Padrão de TV digital ISDB-T e codecs de áudio e vídeo','Difícil'],91:['Vídeo Digital','Proporção de pixel em vídeo de alta definição','Média'],92:['Fotografia','Regra dos terços e composição da imagem','Média'],93:['Fotografia','Foco seletivo, distância focal e abertura','Média'],94:['Fotografia Digital','ISO, exposição e ruído de imagem','Média'],95:['Fotografia Digital','Balanço de branco e temperatura de cor','Média'],96:['Vídeo Digital','Interface HDMI e transmissão digital audiovisual','Fácil'],
 97:['Edição de Imagem','Canal alfa e transparência','Fácil'],98:['Edição de Imagem','Modelos de cor RGB e CMYK','Média'],99:['Edição de Imagem','Temperatura de cor em edição digital','Fácil'],100:['Edição de Vídeo','Transições e renderização','Fácil'],101:['Fotografia Digital','Modos de medição de luz em câmeras DSLR','Média'],102:['Fotografia Digital','Formato RAW e dados do sensor','Média'],103:['Vídeo Digital','Resolução Full HD e padrões de transmissão','Média'],104:['Edição de Imagem','Requisitos de hardware para edição de imagem','Fácil'],105:['Edição de Vídeo','Dependências de software na edição de vídeo','Média'],106:['Edição de Vídeo','Renderização e processamento digital','Média'],107:['Edição de Vídeo','Exportação e distribuição de produtos audiovisuais','Fácil'],108:['Edição de Vídeo','Taxa de bits CBR e VBR na exportação','Média'],
 109:['Educação a Distância','Liberação condicionada de conteúdo em plataformas EAD','Fácil'],110:['Educação a Distância','Gêneros audiovisuais em salas virtuais','Média'],111:['Educação a Distância','Planejamento e duração de videoaulas','Média'],112:['Educação a Distância','Distribuição de vídeo: DVD e serviços on-line','Média'],113:['Educação a Distância','Hospedagem e incorporação de vídeos em AVA','Média'],114:['Áudio Digital','Áudio mono, MP3 e taxa de bits para fala','Média'],115:['Educação a Distância','Transmissão adaptativa de vídeo em seminários on-line','Fácil'],116:['Áudio Digital','Microfones USB e conversão A/D','Fácil'],117:['Vídeo Digital','Resolução e padrões de vídeo para streaming','Média'],118:['Comunicação Digital','Podcasting e distribuição de conteúdo pela Internet','Fácil'],119:['Tecnologias Educacionais','PDF e recursos multimídia em materiais digitais','Média'],120:['Vídeo Digital','Progressive scan na exportação de vídeo','Média']
}
const grupos=[
 [[51,55],'Com relação à linguagem audiovisual e aos elementos da composição cinematográfica, julgue o item.'],
 [[56,60],'A respeito da atividade de sonoplastia em produções audiovisuais, julgue o item.'],
 [[61,63],'Julgue o item acerca de equipamentos e softwares de pós-produção audiovisual.'],
 [[64,67],'A respeito da frequência das vozes humanas, julgue o item.'],
 [[68,71],'Com relação à onda senoidal e aos aspectos que distinguem altura, intensidade e duração da vibração sonora, julgue o item.'],
 [[72,76],'Julgue o item a respeito da produção técnica, artística e da linguagem audiovisual.'],
 [[77,82],'No que se refere à mixagem e à sonorização, julgue o item.'],
 [[83,88],'No que diz respeito a microfones, julgue o item.'],
 [[89,91],'Acerca dos parâmetros de áudio e vídeo em softwares de edição, julgue o item.'],
 [[92,96],'Julgue o item relativo à captação e à reprodução de imagens digitais.'],
 [[97,100],'A respeito dos elementos gráficos e efeitos utilizados no processo de edição de imagens e vídeos, julgue o item.'],
 [[101,103],'Com relação às câmeras DSLR, julgue o item.'],
 [[104,108],'No que se refere à edição digital de imagens e vídeo, julgue o item.'],
 [[109,111],'Acerca da administração e produção de cursos em ambientes virtuais de aprendizagem, julgue o item.'],
 [[112,115],'A respeito de equipamentos, formatos e gerenciamento de plataformas de ensino a distância, julgue o item.'],
 [[116,120],'Julgue o item acerca de recursos, formatos e mídias digitais.']
]
const comando=n=>grupos.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const reparos={
 54:'Em um filme, plano-sequência é um conjunto de planos constituídos por uma mesma unidade dramática e interpretativa.',
 56:'No processo de sonorização de uma realização audiovisual, o som direto de uma cena é obtido simultaneamente à gravação das imagens.',
 60:'Sonoplasta é a pessoa responsável pela captação sonora durante as filmagens.',
 62:'Conversores analógico-digitais são hardware e software que, em modelos de conversão mútua, convertem o sinal sonoro analógico em sinal digital, e vice-versa.',
 66:'As frequências mais agudas produzidas pela voz não costumam ultrapassar os 1.500 Hz; entretanto, os harmônicos gerados a partir dessas frequências podem chegar a mais de 15.000 Hz, compondo as peculiares diferenças de timbre de cada emissor.',
 67:'Na conversação, as vozes femininas situam-se em faixa de frequência mais baixa que as masculinas, por serem mais suaves.',
 76:'O desenvolvimento e a industrialização da linguagem audiovisual no cinema levaram os filmes a aprimorar a continuidade narrativa, inicialmente precária e fugidia.',
 83:'A tensão dos microfones condensadores pode chegar até 56 V, ainda que o padrão phantom power tenda a se estabilizar a 9 V.',
 92:'Na fotografia, a regra dos terços da proporção áurea, de acordo com as sequências de Fibonacci, consiste em dividir a tela, horizontal e verticalmente, em três partes iguais, gerando nove áreas proporcionais à área principal, sendo os pontos de encontro das linhas as guias de composição e enquadramento na captação da imagem.',
 95:'O recurso balanço de branco (WB: white balance) corrige as distorções no espectro de cor da imagem gerada pela irradiação da luz natural ou artificial; nas predefinições de temperatura de cor, as principais empresas fabricantes de câmeras seguem um padrão internacional estabelecido com base na escala Kelvin.',
 96:'A tecnologia HDMI (high-definition multimedia interface) popularizou a transmissão digital de áudio e vídeo por permitir o tráfego de dados de alta qualidade em um único cabo.',
 98:'O padrão de cor utilizado em softwares de edição de imagens segue o padrão internacional de captação e transmissão digital CYMK.',
 100:'Dissolve e CrossFade são efeitos de transição de imagens que requerem renderização.',
 103:'O formato FullHD, que equivale à máxima qualidade na transmissão broadcast, contém 720 linhas horizontais e 1.280 linhas verticais.',
 108:'A taxa de bites especifica a quantidade de megabites por segundo do arquivo codificado a ser exportado e, no momento da exportação, pode ter esse valor definido pelo usuário como constante (CBR) ou variável (VBR).',
 111:'No desenvolvimento e na gravação do conteúdo em videoaulas, professores e tutores devem agrupar informações e criar aulas com duração equivalente à das aulas presenciais para que o aluno tenha melhor participação a distância.',
 112:'Mesmo com o aumento da velocidade das conexões residenciais à Internet, o DVD ainda é a mídia mais adequada para distribuir conteúdos em vídeo, pois permite taxa de dados até 9 Mbps maior que a de sites de hospedagem.',
 113:'Para garantir a segurança de acesso a portais de educação a distância, vídeos e videoaulas devem ser hospedados diretamente na plataforma, pois existem impedimentos técnicos para direcioná-los por links a hospedagens externas.',
 114:'O formato mono diminui o tamanho de arquivos MP3 e a taxa de dados em Kbps; para palestras ou podcasts, um arquivo mono a 64 Kbps é suficiente para garantir a inteligibilidade da fala.',
 115:'Durante a transmissão on-line de um seminário, apresentador e espectador podem ajustar a qualidade de transmissão e recepção do vídeo de acordo com a velocidade da conexão.',
 116:'Microfones USB convertem o sinal analógico em sinal digital, funcionando como uma interface de áudio dedicada.',
 117:'A dimensão de vídeos para publicação em sites de hospedagem com streaming limita-se ao padrão standard de 720 × 480 pixels, adequado à visualização em plataformas EAD.',
 118:'O podcasting, alternativa para difusão de conteúdos sonoros, é um processo midiático fundamentado em emissões sonoras que utiliza a Internet como suporte para funcionar e propagar mensagens.',
 119:'O formato PDF armazena textos, imagens, vídeos, áudios e objetos de interação, sendo uma opção para diagramação e publicação de e-books e conteúdos didáticos interativos.',
 120:'Vídeos produzidos para publicação em plataformas EAD devem ser exportados por softwares de edição no formato progressive scan.'
}

const gruposPorNumero=new Map()
for(const q of raw){const n=Number(q.numero),a=gruposPorNumero.get(n)||[];a.push(q);gruposPorNumero.set(n,a)}
assert.equal(gruposPorNumero.size,70)
assert.deepEqual([...gruposPorNumero].filter(([,a])=>a.length>1).map(([n])=>n),[75,76])
const idsCanonicos={75:'extr-a74c90f43c14e0201e7f',76:'extr-3bac243f857dc2ec52b7'}
const decisoes=[]
for(const [n,registros] of [...gruposPorNumero].sort((a,b)=>a[0]-b[0])){
 const canon=idsCanonicos[n]?registros.find(q=>q.id===idsCanonicos[n]):registros[0]
 const [materia,conteudo,dificuldade]=assuntos[n]||[]
 const g=resposta.get(n),ctx=comando(n)
 assert.ok(canon&&materia&&conteudo&&dificuldade&&g&&ctx,`Dados incompletos no item ${n}`)
 const limpo=(reparos[n]||canon.enunciado).replace(/\s*\|\|281FUB_014_01N492975\|\|[\s\S]*$/,'').replace(/\buni dade\b/gi,'unidade').replace(/\bsonori zação\b/gi,'sonorização').replace(/\bcapt ação\b/gi,'captação').replace(/\bFibonaci\b/gi,'Fibonacci').replace(/\bm u ltimedia\b/gi,'multimedia').replace(/\s+/g,' ').trim()
 const page=Number(canon.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const baseDecision={materia,conteudo,ano:2016,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'FUB 2016 — Cargo 14: Técnico em Audiovisual',cargo:'Técnico em Audiovisual',aplicacao:'18/12/2016',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial a partir da terminologia e do raciocínio exigidos; a banca não publicou nível de dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} conferido no caderno oficial do Cargo 14 e classificado pelo objeto de conhecimento efetivamente cobrado. Resposta comparada ao gabarito definitivo oficial.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:g==='C'?0:1,anulada:false,texto_apoio:ctx,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito oficial definitivo — Cargo 14: Técnico em Audiovisual — aplicação em 18/12/2016',item:n,resposta:g,fonte:'CEBRASPE'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 assert.ok(limpo.length>25,`Enunciado incompleto no item ${n}`)
 decisoes.push({id:canon.id,sha256_enunciado:hashRevisao(canon.enunciado),...baseDecision,enunciado:limpo,pagina:page,visual:{pagina:page,imagem,motivo:'Imagem da página do caderno oficial preservada como referência visual e para conferência de OCR.'},apta_resolucao:true,correcao_automatica:true})
 for(const dup of registros.filter(q=>q.id!==canon.id))decisoes.push({id:dup.id,sha256_enunciado:hashRevisao(dup.enunciado),...baseDecision,enunciado:limpo,resposta_correta:null,apta_resolucao:false,correcao_automatica:false,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item_no_mesmo_caderno',duplicada_de:canon.id,pagina:Number(dup.pagina)})
}
assert.equal(decisoes.length,72)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,aplicacao:'18/12/2016',concurso:'FUB 2016 — Cargo 14: Técnico em Audiovisual',nota:'70 itens oficiais distintos, numerados de 51 a 120. As capturas duplicadas dos itens 75 e 76 foram mantidas no histórico, mas tornadas inelegíveis; o registro canônico ficou resolvível. Itens contaminados com cabeçalhos de coluna/página tiveram o enunciado separado e o comando compartilhado preservado como contexto.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'FUB 2016 — Cargo 14: Técnico em Audiovisual',itens_distintos:70,registros_revisados:72,duplicatas_inelegiveis:2,gabaritos_definitivos_vinculados:70,prova_oficial:prova,gabarito_definitivo:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
