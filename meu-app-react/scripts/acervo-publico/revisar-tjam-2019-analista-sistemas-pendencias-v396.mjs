import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tjam-2019-analista-sistemas-pendencias-v396'
const doc='b6fb958be88c70e9'
const prova='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/481_tjam001_matriz.pdf'
const gabaritoBasicos='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAMCB1__PAG_3.PDF'
const gabaritoCargo='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAM001__PAG_4.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))

const respostas={
  1:'E',2:'C',3:'E',4:'E',5:'E',7:'C',8:'C',10:'E',11:'C',12:'E',14:'E',
  17:'E',18:'C',19:'C',20:'C',21:'C',22:'E',23:'E',24:'E',25:'C',26:'E',27:'C',28:'C',29:'C',30:'E',31:'C',32:'E',33:'C',34:'E',35:'E',36:'E',37:'E',38:'C',39:'C',40:'C',
  41:'C',44:'C',45:'E',46:'E',60:'C',85:'C',86:'E',87:'C',88:'C',110:'C',111:'E',112:'E',113:'C',114:'C',115:'E',117:'E',118:'C',119:'E',120:'C'
}

const temas={
  1:['Português','Compreensão e inferência em texto sobre contratos inteligentes'],
  2:['Português','Precisão vocabular e linguagem técnica'],
  3:['Português','Compreensão de relações de causa e finalidade'],
  4:['Português','Compreensão de informações explícitas'],
  5:['Português','Identificação de desafios e argumentos do texto'],
  7:['Português','Inferência e modalidade no texto'],
  8:['Português','Tipologia textual: narração e dissertação'],
  10:['Português','Coesão e relações lógico-discursivas'],
  11:['Português','Referência pronominal e coesão textual'],
  12:['Português','Sintaxe: sujeito e predicação verbal'],
  14:['Português','Verbos: tempo, modo e efeitos de sentido'],
  17:['Geografia do Amazonas','Zona Franca de Manaus: distribuição industrial e impactos regionais'],
  18:['Geografia do Amazonas','Zona Franca de Manaus: urbanização e migrações'],
  19:['Geografia do Amazonas','Rede urbana e área de influência de Manaus'],
  20:['Geografia do Amazonas','Rede urbana amazônica: densidade e extensão municipal'],
  21:['Geografia do Amazonas','Amazônia: recursos naturais, povos tradicionais e população indígena'],
  22:['Geografia do Amazonas','Urbanização, macrocefalia e desenvolvimento regional'],
  23:['Legislação do Poder Judiciário','Requisição de força pública por órgão judicial'],
  24:['Direito Administrativo','Reintegração de servidor e efeitos da decisão judicial'],
  25:['Legislação do Poder Judiciário','Adicional de qualificação e títulos acadêmicos'],
  26:['Legislação do Poder Judiciário','Metas nacionais do Poder Judiciário e Meta 1 do CNJ'],
  27:['Legislação do Poder Judiciário','Política judiciária de tratamento adequado de conflitos'],
  28:['Direito da Criança e do Adolescente','SINASE: guia de execução para medidas socioeducativas'],
  29:['Legislação do Poder Judiciário','Política de atenção prioritária ao primeiro grau'],
  30:['Legislação do Poder Judiciário','Planejamento e plano de logística sustentável do Judiciário'],
  31:['Acessibilidade e inclusão','Acessibilidade comunicacional e atendimento em Libras'],
  32:['Legislação do Poder Judiciário','Banco Nacional de Monitoramento de Prisões (BNMP 2.0)'],
  33:['Legislação do Poder Judiciário','Política judiciária de enfrentamento à violência doméstica'],
  34:['Direitos Humanos','Nome social e identidade de gênero de adolescente'],
  35:['Acessibilidade e inclusão','LBI: avaliação biopsicossocial da deficiência'],
  36:['Acessibilidade e inclusão','LBI: barreiras arquitetônicas, urbanísticas e nos transportes'],
  37:['Acessibilidade e inclusão','LBI: educação inclusiva e educação bilíngue em Libras'],
  38:['Acessibilidade e inclusão','LBI: autonomia e direito de escolha em ações afirmativas'],
  39:['Acessibilidade e inclusão','LBI: prioridade e reserva de unidades habitacionais'],
  40:['Acessibilidade e inclusão','LBI: serviços socioassistenciais e apoio à vida independente'],
  41:['Engenharia de Software','Modelagem de processos: operador lógico AND em EPC'],
  44:['Engenharia de Software','Engenharia de requisitos: inconsistência e conflitos entre requisitos'],
  45:['Engenharia de Software','Engenharia de requisitos: validação e análise de impacto'],
  46:['Engenharia de Software','Gerência de requisitos: controle de mudanças e rastreabilidade'],
  60:['Engenharia de Software','Teste de desempenho: teste de carga e teste de estresse'],
  85:['Segurança da Informação','Criptografia simétrica: algoritmo e comprimento de chave'],
  86:['Segurança da Informação','Criptografia simétrica e assimétrica: desempenho'],
  87:['Segurança da Informação','Princípios de segurança criptográfica e gestão de chaves'],
  88:['Redes de Computadores','TCP: janela de congestionamento e controle de transmissão'],
  110:['Governança de TI','COBIT 5: domínio Entregar, Servir e Suportar (DSS)'],
  111:['Governança de TI','COBIT 5: domínios, processos e compatibilidade com métodos ágeis'],
  112:['Governança de TI','COBIT 5: gestão de portfólio e de requisitos'],
  113:['Governança de TI','COBIT 5: processo de aquisição e escopo de avaliação'],
  114:['Engenharia de Software','CMMI: validação de produto no ambiente de uso'],
  115:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: processo judicial eletrônico'],
  117:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: assinatura eletrônica e credenciamento'],
  118:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: momento de realização do ato processual'],
  119:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: publicação e intimação em diário eletrônico'],
  120:['Legislação de Tecnologia da Informação','Lei nº 11.419/2006: data de publicação eletrônica']
}

function contexto(n,q){
  if(n<=7||n>=8&&n<=16){
    const a=q.apoio.indexOf('Texto CB1A1-I'),b=q.apoio.indexOf('Tendo como referência as ideias do texto CB1A1-I')
    if(a>=0&&b>a)return q.apoio.slice(a,b).trim()
    return 'Texto CB1A1-I: reportagem sobre a proposta de contratos inteligentes, seu funcionamento em código e rede descentralizada, o exemplo de recuperação automática de veículo, a plataforma Ethereum, os desafios regulatórios e de infraestrutura e a futura economia compartilhada.'
  }
  if(n<=18)return 'Contexto: Zona Franca de Manaus como polo industrial da Região Norte; análise de sua distribuição territorial, geração de empregos, migração e urbanização.'
  if(n<=20)return 'Texto-base: Manaus é apresentada como metrópole amazônica que exerce influência direta sobre municípios dentro e fora do Amazonas. O bloco avalia a extensão e as características de sua rede urbana.'
  if(n<=22)return 'Contexto: mudanças estruturais ocorridas na Amazônia a partir da segunda metade do século XX, ligadas à integração nacional, com efeitos sociais e ambientais no estado do Amazonas.'
  if(n<=34)return 'Comando da prova: julgue os itens com base na legislação institucional e na legislação do Poder Judiciário do estado do Amazonas e nas normas do CNJ expressamente mencionadas em cada enunciado.'
  if(n<=40)return 'Comando da prova: julgue os itens à luz da Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei nº 13.146/2015).'
  if(n<=43)return 'Comando: considere as notações de modelagem de processos EPC, BPMN e DMN; avaliam-se seus operadores, estruturas e finalidades.'
  if(n<=46)return 'Comando: itens sobre processos de engenharia de requisitos de sistemas de informação, incluindo consistência, validação, análise de impacto e controle de mudanças.'
  if(n<=60)return 'Comando: itens sobre técnicas de teste de software, incluindo teste de carga, estresse e desempenho.'
  if(n<=87)return 'Comando: julgue os itens acerca de criptografia, segurança de algoritmos e chaves e comparação entre sistemas simétricos e assimétricos.'
  if(n===88)return 'Comando: julgue o item acerca de redes de computadores e controle de congestionamento no protocolo TCP.'
  if(n<=114)return 'Comando: itens sobre governança de tecnologia da informação com COBIT 5, domínios de governança/gestão, processos e avaliação de capacidade.'
  return 'Comando: itens sobre informatização do processo judicial e atos processuais eletrônicos, com referência à Lei nº 11.419/2006.'
}

if(records.length!==54||new Set(records.map(q=>q.numero)).size!==54)throw Error(`Esperados 54 itens distintos; recebidos ${records.length}.`)
if(records.some(q=>q.resposta!=null))throw Error('Há resposta preexistente; revisão interrompida para evitar sobrescrita.')

const decisions=records.map(q=>{
  const n=Number(q.numero),topic=temas[n],answer=respostas[n]
  if(!topic||!answer)throw Error(`Item ${n}: classificação ou gabarito não mapeado.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato incompatível no item ${n}.`)
  const isBasic=n<=40,sourceKey=isBasic?gabaritoBasicos:gabaritoCargo
  return {
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:q.enunciado.trim(),texto_apoio:contexto(n,q),
    materia:topic[0],conteudo:topic[1],ano:2019,concurso:'TJ/AM 2019 — Tribunal de Justiça do Estado do Amazonas — Analista Judiciário — Especialidade Analista de Sistemas — Cargo 1',
    banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 13/10/2019',cargo:'Analista Judiciário — Especialidade Analista de Sistemas — Cargo 1',
    numero_original:n,numero:n,pagina:q.pagina,
    dificuldade:[5,7,11,12,14,17,20,21,22,24,25,26,28,32,33,36,38,39,41,44,45,46,60,85,86,87,88,110,111,112,113,114,115,117,118,119,120].includes(n)?'Difícil':'Média',
    dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo complexidade conceitual, linguística ou normativa; não é nível publicado pela banca.',
    classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 1; matéria e tópico definidos pelo comando, conteúdo e norma/conceito efetivamente avaliado.`,
    resposta_correta:answer==='C'?0:1,anulada:false,
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],
    gabarito_oficial:{fonte:sourceKey,arquivo:sourceKey.split('/').at(-1),prova,numero:n,pagina:1,resposta:answer,criterio:isBasic?'Gabarito oficial definitivo dos Conhecimentos Básicos, específico para o Cargo 1.':'Gabarito oficial definitivo do Cargo 1 — Analista de Sistemas.'},
    apta_resolucao:true
  }
})

if(decisions.some(d=>!d.texto_apoio||!d.materia||!d.conteudo||d.ano!==2019))throw Error('Há item sem contexto ou filtro completo.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,porMateria:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),semContexto:decisions.filter(d=>!d.texto_apoio).map(d=>d.numero),semGabarito:decisions.filter(d=>!d.gabarito_oficial).map(d=>d.numero),anulados:[],prova,gabaritoBasicos,gabaritoCargo,publicado:false},null,2));process.exit(0)}

const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — TJ/AM 2019 — Analista de Sistemas — Cargo 1',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabaritos:{basicos:gabaritoBasicos,cargo:gabaritoCargo},publicado:false,nota:'54 registros pendentes sem gabarito foram classificados por matéria e conteúdo específico, vinculados ao gabarito oficial definitivo aplicável ao Cargo 1 e preservaram os campos de imagem e página do caderno. Os contextos compartilhados foram separados em blocos coerentes; gabarito C/E convertido para o padrão de resposta do site. Dificuldade é estimativa editorial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — TJ/AM 2019 — Analista de Sistemas, Cargo 1 — revisão v396\n\n- 54 itens pendentes reclassificados em Português, Geografia do Amazonas, legislação do Judiciário, Direito Administrativo, Direito da Criança e do Adolescente, Direitos Humanos, acessibilidade, Engenharia de Software, Segurança da Informação, Redes e Governança de TI.\n- Gabaritos definitivos do Cargo 1 conferidos separadamente para Conhecimentos Básicos (itens 1–40) e Conhecimentos Específicos (41–120); não há anulação entre os itens revisados.\n- Contextos de leitura, geografia, acessibilidade, modelagem de processos, requisitos, testes, criptografia, COBIT e processo eletrônico foram vinculados aos itens pertinentes; imagens de página existentes foram preservadas.\n- A dificuldade foi estimada editorialmente e identificada como estimativa.\n- Fontes: [caderno oficial do Cargo 1](${prova}), [gabarito definitivo de conhecimentos básicos](${gabaritoBasicos}) e [gabarito definitivo do Cargo 1](${gabaritoCargo}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
