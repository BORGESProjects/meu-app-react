import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='d8d1354c8cf71a74'
const nome='revisao-fub-audiovisual-2018-v261'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_18/arquivos/MATRIZ_433_FUB017__PAG_4.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_18/arquivos/5.GAB_DEFINITIVO_MATRIZ_433_FUB017__PAG_4.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/fub_18/arquivos/fub_18_justificativas_de_alteraes_de_gabarito.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==66)throw Error(`Esperava 66 pendências atuais, encontrei ${raw.length}`)

const answersText='51:X|52:E|53:C|54:C|55:C|56:C|57:C|58:E|59:E|60:C|61:E|62:E|63:E|64:C|65:C|66:C|67:E|68:C|69:C|70:E|71:C|72:E|73:E|74:E|75:C|76:E|77:E|78:C|79:C|80:C|81:E|82:E|83:C|84:E|85:E|86:C|87:E|88:C|89:E|90:C|91:E|92:C|93:C|94:E|95:C|96:C|97:E|98:C|99:C|100:E|101:E|102:C|103:C|104:E|105:E|106:C|107:E|108:C|109:C|110:E|111:E|112:C|113:E|114:C|115:C|116:E|117:C|118:E|119:E|120:E'
const answers=new Map(answersText.split('|').map(v=>{const [n,a]=v.split(':');return[Number(n),a]}))
const keyHash=createHash('sha256').update(answersText).digest('hex')
const exam='FUB 2018 — Cargo 17, Técnico em Audiovisual (aplicação em 16/12/2018)'

// Matéria e tópico descrevem o conteúdo efetivamente cobrado, sem o rótulo genérico usado na importação.
const topics={
  51:['Comunicação Audiovisual','Formato de tela: transição da televisão analógica para a TV digital','Fácil'],
  52:['Comunicação Audiovisual','Proporções de tela em dispositivos e produtos audiovisuais','Fácil'],
  53:['Produção Audiovisual','Câmeras DSLR: custo, acesso e qualidade técnica de produção','Média'],
  54:['Linguagem Audiovisual','Enquadramento e ângulo de câmera: contra-plongée e relação de poder','Média'],
  55:['Acústica','Efeito Doppler e frequência percebida de fonte sonora em movimento','Média'],
  56:['Acústica','Reflexão sonora e reverberação em ambientes fechados','Fácil'],
  57:['Acústica','Absorção sonora e tratamento acústico de salas de gravação','Fácil'],
  58:['Acústica','Câmaras anecoicas e isolamento de ondas sonoras e eletromagnéticas','Média'],
  59:['Acústica','Velocidade de propagação do som e da luz; sincronismo audiovisual','Média'],
  60:['Produção Audiovisual','Pitching e seleção de projetos de roteiro','Média'],
  61:['Produção Audiovisual','Funções do diretor de televisão nas etapas de produção','Média'],
  62:['Produção Audiovisual','Equipe técnica de reportagem externa','Fácil'],
  63:['Comunicação Social','Campanha eleitoral, produção televisiva e mercado de comunicação','Média'],
  64:['Sonoplastia','Híbrida telefônica com retorno em radiodifusão','Média'],
  65:['Sonoplastia','Conceito e recursos da sonoplastia/sonotécnica','Fácil'],
  66:['Captação de Áudio','Som ambiente como recurso de continuidade e edição audiovisual','Fácil'],
  67:['Edição de Áudio e Vídeo','Etapas de produção audiovisual: mixagem e pós-produção','Média'],
  68:['Sonoplastia','Mixagem de monitor e mixagem de PA em apresentações ao vivo','Média'],
  69:['Áudio Profissional','Mesas de áudio: canais e tecnologias analógica e digital','Média'],
  70:['Captação de Áudio','Microfone boom e continuidade visual da captação','Fácil'],
  71:['Microfones','Padrão polar cardioide e captação de mesa-redonda','Média'],
  72:['Microfones','Microfone de lapela e captação de plateia em programas de auditório','Média'],
  73:['Microfones','Microfones para entrevistas externas e padrões de captação','Média'],
  74:['Captação de Áudio','Captação de som com DSLR em ambientes externos','Média'],
  75:['Comunicação Digital','Radiodifusão digital e transmissão broadcasting','Fácil'],
  76:['Comunicação Digital','Qualidade, estabilidade e transmissão de sinais digitais','Fácil'],
  77:['Comunicação Digital','Convergência entre telecomunicações, mídia e informática','Média'],
  78:['Comunicação Audiovisual','Audiovisual em mídias digitais, jogos e dispositivos móveis','Fácil'],
  79:['Fundamentos de Eletrônica','Sinais analógicos, digitais e representação binária','Média'],
  80:['Educação a Distância','Ambientes virtuais de aprendizagem: recursos e ferramentas','Fácil'],
  81:['Educação a Distância','Tratamento pedagógico de vídeos educacionais','Média'],
  82:['Educação a Distância','Fóruns virtuais: interação síncrona e assíncrona','Fácil'],
  83:['Design Instrucional','Planejamento, implementação e avaliação de cursos','Fácil'],
  84:['Tecnologias Educacionais','Videoconferência e ensino híbrido: conceitos e aplicações','Fácil'],
  85:['Hipertexto e Multimídia','Hipertexto, links e integração de imagens e sons','Fácil'],
  86:['Tecnologias Educacionais','Software de edição de imagem e áudio para educação a distância','Média'],
  87:['Tecnologias Educacionais','Recursos digitais e objetos de aprendizagem','Média'],
  88:['Tecnologias Educacionais','Leitores digitais e plataformas de leitura de e-books','Fácil'],
  89:['Tecnologias Educacionais','Ferramentas colaborativas e serviços em nuvem','Média'],
  90:['Inteligência Artificial','Agentes inteligentes e sistemas adaptativos na educação a distância','Difícil'],
  91:['Educação a Distância','Interação em ambientes virtuais e affordances das mídias','Média'],
  92:['Tecnologias Educacionais','Plataformas de vídeo e compartilhamento para aprendizagem','Fácil'],
  94:['Tecnologias Educacionais','Apresentações digitais e ferramentas de visualização','Fácil'],
  95:['Educação a Distância','Atividades síncronas e assíncronas em AVA','Fácil'],
  97:['Videoconferência','Redes e largura de banda para transmissão de vídeo e áudio','Média'],
  98:['Comunicação Digital','Plataformas de conferência on-line e compartilhamento de tela','Fácil'],
  99:['Televisão','Interpolação e conversão de material para alta definição','Média'],
  101:['Informática','Armazenamento externo, estação de trabalho e cópia de segurança','Fácil'],
  103:['Fotografia','Filtro de densidade neutra, exposição e velocidade do obturador','Média'],
  104:['Microfones','Microfone de lapela, alimentação Phantom Power e microfone dinâmico','Difícil'],
  105:['Vídeo Digital','Formato RAW, profundidade de informação e pós-processamento','Difícil'],
  106:['Captação de Áudio','Captação estereofônica e canais monaurais','Média'],
  107:['Design Gráfico','Síntese aditiva de cores no sistema cor-luz (RGB)','Média'],
  108:['Design Gráfico','Luminosidade, brilho e valores RGB em monitores','Média'],
  109:['Design Gráfico','Sistema de cores CMYK e reprodução para impressão','Média'],
  110:['Design Gráfico','Matiz, saturação e propriedades da cor','Fácil'],
  111:['Edição de Áudio e Vídeo','Edição de vídeo em alta resolução com arquivos proxy','Média'],
  112:['Edição de Áudio e Vídeo','Sincronização multicâmera e organização de trilhas na linha do tempo','Difícil'],
  113:['Edição de Áudio e Vídeo','Exportação, codec, taxa de bits e controle do tamanho do arquivo','Difícil'],
  114:['Pós-produção Audiovisual','Correção de cor e color grading','Média'],
  115:['Fotografia Digital','Sensor de imagem e mosaico de filtros de cor Bayer','Média'],
  116:['Fotografia Digital','Fator de corte de sensor e resolução de vídeo em DSLR','Difícil'],
  117:['Fotografia','Balanço de branco e temperatura de cor da iluminação','Fácil'],
  118:['Iluminação Audiovisual','Luz principal, tamanho da fonte e dureza das sombras','Média'],
  119:['Iluminação Audiovisual','Temperatura de cor da luz natural e de lâmpadas de tungstênio','Média'],
  120:['Linguagem Audiovisual','Movimentos de câmera: travelling e câmera subjetiva','Média'],
}

const contexts=n=>{
  if(n<=54)return 'Com relação ao suporte e ao formato de exibição de um produto em linguagem audiovisual, considerando as características atuais da linguagem audiovisual e da convergência de mídias, julgue o item.'
  if(n<=59)return 'Julgue o item acerca de acústica aplicada à produção audiovisual.'
  if(n<=63)return 'Julgue o item a respeito da produção técnica e artística de uma obra audiovisual.'
  if(n<=66)return 'Julgue o item relativo à sonoplastia e à captação de áudio em produção audiovisual.'
  if(n<=74)return 'Julgue o item sobre equipamentos e técnicas de captação e operação de áudio.'
  if(n<=79)return 'Texto-base (itens 75 a 79): “O termo sociedade da informação refere-se a um período no qual passou a haver uma cultura informático-midiática que mudou algumas relações com os meios e resultou na criação de novos formatos de comunicação. A mudança do analógico para o digital configurou uma transformação significativa nesse processo.” Márcia Nogueira Alves, Mídia e produção audiovisual: uma introdução, 2.ª ed., Curitiba: Ibpex, 2011, p. 131 (com adaptações). Considerando o fragmento como referência inicial, julgue o item.'
  if(n<=95)return 'Julgue o item a respeito de ambientes virtuais de aprendizagem, tecnologias de ensino e seu uso.'
  if(n===97)return 'Julgue o item referente às formas de conexão e à qualidade de transmissão para videoconferências.'
  if(n<=101)return 'Acerca das características das mídias digitais aplicadas à informática, à televisão, ao rádio e à Web, julgue o item.'
  if(n<=106)return 'Julgue o item a respeito dos sistemas de captação de imagens e sons, seus formatos e suas características.'
  if(n<=110)return 'Julgue o item relativo aos sistemas de cor e às suas propriedades.'
  if(n<=114)return 'Julgue o item a respeito do uso de programas de edição e tratamento de vídeo e áudio.'
  return 'Julgue o item referente ao uso e às características de câmeras digitais e analógicas, em estúdio ou em áreas externas.'
}

const topicMap=new Map(Object.entries(topics).map(([n,v])=>[Number(n),v]))
const decisions=raw.map(q=>{
  const n=Number(q.numero),[materia,conteudo,dificuldade]=topicMap.get(n)||[]
  const answer=answers.get(n)
  if(!materia||!conteudo||!dificuldade||!answer)throw Error(`Classificação ou gabarito ausente no item ${n}`)
  const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  let stem=String(q.enunciado||'').replace(/CESPE\s*\|\s*CEBRASPE[\s\S]*$/i,'').replace(/\n(?:Com referência|O termo sociedade|Tendo o fragmento|Acerca das características|No tocante aos sistemas|Julgue os itens seguintes|Espaço livre)[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
  stem=stem.replace(/f a z q u e a s/i,'faz que as').replace(/Phantom Powe r/i,'Phantom Power').replace(/zoom\s+,/i,'zoom,').replace(/HangOuts/i,'Hangouts')
  if(n===116)stem='A gravação de vídeo em uma câmera DSLR (digital single lens reflex) com fator de corte (crop factor) faz que as dimensões do clipe gravado sejam reduzidas, e que se tenha menor número de pixels do que se teria em um vídeo gravado com as mesmas especificações em uma câmera full frame.'
  if(n===51)stem='Com o advento da TV digital, a proporção de tela utilizada em produtos audiovisuais passou de 3:4, que correspondia ao padrão adotado na TV analógica, para 16:9.'
  if(!stem)throw Error(`Enunciado vazio no item ${n}`)
  const annulled=answer==='X'
  return {
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,
    concurso:exam,numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial pelo domínio técnico e pela quantidade de etapas conceituais; não é faixa publicada pela banca.',
    classificacao_fonte:prova,
    motivo:`CEBRASPE — FUB 2018, Cargo 17 (Técnico em Audiovisual); item ${n}, página ${page}. Conteúdo e tópico conferidos no caderno oficial; gabarito cotejado com a chave definitiva do cargo.`,
    enunciado:stem,texto_apoio:contexts(n),opcoes:['Certo','Errado'],
    resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,
    gabarito_oficial:{fonte:chave,arquivo:'5.GAB_DEFINITIVO_MATRIZ_433_FUB017__PAG_4.PDF',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_itens_51_a_120; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:annulled?'Gabarito definitivo marca X; anulação confirmada nas justificativas oficiais do concurso.':'Gabarito oficial definitivo do Cargo 17 — Técnico em Audiovisual, aplicação em 16/12/2018.'},
    apta_resolucao:true,
    remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
    visual:{pagina:page,imagem:image,motivo:'Página do caderno oficial conferida; imagem da página vinculada para consulta visual e preservação de elementos gráficos.'},
  }
})
if(decisions.length!==66||decisions.filter(x=>x.anulada).length!==1)throw Error('Contagens do pacote inconsistentes')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## FUB 2018 — Cargo 17, Técnico em Audiovisual — v261\n\n- Revisei e classifiquei 66 itens pendentes por matéria, tópico, ano, cargo e dificuldade estimada; substituí rótulos incorretos e genéricos como “Informática” e “Serviço Social” por áreas pertinentes ao conteúdo audiovisual, acústica, educação a distância, captação, iluminação e edição.\n- Corrigi ruídos de OCR em grafia e quebras de linha, separei comandos comuns dos enunciados e preservei o texto-base de sociedade da informação nos itens 75–79. As páginas oficiais 1–4 foram verificadas localmente e associadas aos itens.\n- Vinculei o gabarito definitivo do Cargo 17. O item 51 está oficialmente anulado; foi mantido sem resposta correta automática.\n- Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno do Cargo 17](<${prova}>), [gabarito definitivo](<${chave}>), [justificativas de alteração e anulação](<${justificativas}>), [página oficial do concurso](https://cdn.cebraspe.org.br/concursos/FUB_18/).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:66,anuladas:1,publicacao:'local'},null,2))
