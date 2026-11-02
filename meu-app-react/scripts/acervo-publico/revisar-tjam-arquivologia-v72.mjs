import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-tjam-arquivologia-v72'
const base = 'tmp/revisao-profissional/revisao-stj-juridica-v71/acervo-extraido'
const doc = 'b18578eab3ff4d18'
const prova = 'https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/481_TJAM002_MATRIZ.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAM002__PAG_3.PDF'
const qs = JSON.parse(await fs.readFile(`tmp/pendentes-${doc}.json`, 'utf8'))

const topics = {
  11: ['Língua Portuguesa', 'Interpretação de textos: referenciação e coesão'],
  24: ['Direito da Criança e do Adolescente', 'Execução de medidas socioeducativas: guia de execução'],
  29: ['Direitos Humanos', 'Direito ao nome social e capacidade civil'],
  34: ['Direito da Pessoa com Deficiência', 'Assistência social: serviços de cuidado à pessoa com deficiência'],
  36: ['Informática', 'Redes: intranet e colaboração corporativa'],
  37: ['Informática', 'Segurança da informação: disponibilidade, confidencialidade e integridade'],
  38: ['Direito Processual Civil', 'Processo eletrônico: conservação de autos e documentos'],
  39: ['Direito Processual Civil', 'Processo eletrônico: acesso e segurança de redes'],
  40: ['Direito Processual Civil', 'Processo eletrônico: comunicações processuais'],
  41: ['Arquivologia', 'Legislação arquivística: custódia de documentos públicos'],
  42: ['Arquivologia', 'Legislação arquivística: depósito de arquivos privados'],
  43: ['Arquivologia', 'CONARQ: composição e competências'],
  44: ['Arquivologia', 'CONARQ: declaração de interesse público e social'],
  45: ['Arquivologia', 'Arquivo Nacional: organização e descentralização'],
  46: ['Arquivologia', 'Princípios arquivísticos: organicidade'],
  47: ['Arquivologia', 'Função social dos arquivos e memória institucional'],
  48: ['Arquivologia', 'Avaliação documental: valores e recolhimento'],
  49: ['Arquivologia', 'Arquivologia contemporânea: pós-modernismo e contexto de produção'],
  50: ['Arquivologia', 'Arquivista: memória coletiva e mediação'],
  51: ['Arquivologia', 'Diplomática: autenticidade e origem documental'],
  57: ['Arquivologia', 'Ciclo de vida documental: transferência e recolhimento'],
  61: ['Arquivologia', 'Gestão de documentos: fundamentos e tradição arquivística'],
  62: ['Arquivologia', 'Gestão de documentos no Brasil: evolução histórica'],
  63: ['Arquivologia', 'Avaliação documental: análise e destinação'],
  64: ['Arquivologia', 'Gestão de documentos: planejamento de recursos e estrutura'],
  65: ['Arquivologia', 'Gestão de documentos: acesso à informação'],
  66: ['Arquivologia', 'Gestão de documentos: tramitação e programa de gestão'],
  67: ['Arquivologia', 'Protocolo: registro, autuação e controle da tramitação'],
  68: ['Arquivologia', 'Gestão de documentos: fases corrente e intermediária'],
  70: ['Arquivologia', 'Descrição arquivística: instrumentos de pesquisa'],
  71: ['Arquivologia', 'Gestão de documentos: preservação da informação pública'],
  72: ['Arquivologia', 'Política nacional de arquivos: preservação documental'],
  75: ['Arquivologia', 'Diagnóstico arquivístico: condições de armazenamento e controle'],
  76: ['Arquivologia', 'Diagnóstico arquivístico: organização e recuperação da informação'],
  77: ['Arquivologia', 'Diagnóstico arquivístico: abordagem maximalista'],
  78: ['Arquivologia', 'Diagnóstico arquivístico: abordagem minimalista'],
  79: ['Arquivologia', 'Diagnóstico arquivístico: instrumentos de coleta de dados'],
  80: ['Arquivologia', 'Diagnóstico arquivístico: pré-diagnóstico'],
  81: ['Arquivologia', 'Protocolo: recebimento e separação de correspondência'],
  82: ['Arquivologia', 'Protocolo: encaminhamento de correspondência ostensiva'],
  83: ['Arquivologia', 'Protocolo: registro e metadados documentais'],
  84: ['Arquivologia', 'Protocolo: registro de documentos recebidos e expedidos'],
  85: ['Arquivologia', 'Protocolo: distribuição de documentos'],
  86: ['Arquivologia', 'Protocolo: tramitação e movimentação de documentos'],
  87: ['Arquivologia', 'Protocolo: expedição de documentos'],
  88: ['Arquivologia', 'Produção documental: função de criação'],
  89: ['Arquivologia', 'Produção documental: tecnologia e criação de documentos'],
  90: ['Arquivologia', 'Documentos digitais: metadados'],
  91: ['Arquivologia', 'Aquisição documental: transferência e recolhimento'],
  93: ['Arquivologia', 'Classificação de documentos: princípios e métodos'],
  94: ['Arquivologia', 'Classificação: proveniência e pertinência'],
  97: ['Arquivologia', 'Difusão arquivística: transparência ativa'],
  98: ['Arquivologia', 'Descrição arquivística: fases documentais'],
  99: ['Arquivologia', 'Instrumentos de pesquisa: guia'],
  100: ['Arquivologia', 'Preservação documental: prevenção e ciclo de vida'],
  101: ['Arquivologia', 'Análise tipológica: aplicação à classificação e ao arranjo'],
  102: ['Arquivologia', 'Tipologia documental: espécie documental'],
  103: ['Arquivologia', 'Tipologia documental: relação entre espécie e tipo'],
  104: ['Arquivologia', 'Tipologia documental: requerimento e arquivos universitários'],
  105: ['Arquivologia', 'Análise tipológica: descrição e metadados'],
  106: ['Arquivologia', 'Lei de Acesso à Informação: Serviço de Informação ao Cidadão'],
  107: ['Arquivologia', 'Lei de Acesso à Informação: requisitos do pedido'],
  108: ['Arquivologia', 'Lei de Acesso à Informação: informações pessoais'],
  109: ['Arquivologia', 'Lei de Acesso à Informação: recursos administrativos'],
  110: ['Arquivologia', 'Lei de Acesso à Informação: monitoramento institucional'],
  111: ['Arquivologia', 'Documento arquivístico digital: fixidez e forma fixa'],
  113: ['Arquivologia', 'Documento arquivístico digital: interatividade e estática'],
  114: ['Arquivologia', 'e-ARQ Brasil: plano de classificação e inativação de classes'],
  116: ['Arquivologia', 'e-ARQ Brasil: entidades e metadados de gestão'],
  117: ['Arquivologia', 'Microfilmagem: requisitos técnicos e microformas'],
  118: ['Arquivologia', 'Microfilmagem: guarda e prazos de retenção'],
  119: ['Arquivologia', 'Microfilmagem: sinalética de continuação'],
  120: ['Arquivologia', 'Microfilmagem: sinalética de encadernação defeituosa'],
}

const keys = ['EECEECECEC','EECECCCEEC','ECCCCCCECE','CEECCECCCE','CECECEECEC','CECECECCCE','EECECCECXC','CECEECCCEC'].join('')
const answers = Object.fromEntries([...keys].map((value,index)=>[41+index,value]))
const clean = {
  11: 'Infere-se das informações do terceiro parágrafo do texto CB1A1-I que o segmento “Foi bloqueada” (R. 19) refere-se a “chave digital” (R. 18).',
  24: 'Caso vários adolescentes tenham de ingressar em unidade de internação e semiliberdade por ato infracional praticado em conjunto, o ingresso ocorrerá mediante a apresentação de guia de execução para cada adolescente, que será expedida pelo juiz do processo de conhecimento.',
  29: 'É vedado a menor de dezoito anos de idade, não emancipado, alterar o nome social.',
  34: 'Os serviços socioassistenciais para pessoa com deficiência em situação de dependência incluem a prestação de cuidados básicos e instrumentais por cuidadores sociais.',
  36: 'As intranets utilizam tecnologias da Internet para viabilizar a comunicação entre os empregados de uma empresa, permitindo-lhes compartilhar informações e trabalhar de forma colaborativa.',
  37: 'A Lei nº 11.419/2006 está alinhada com os princípios de segurança da informação denominados disponibilidade, confidencialidade e integridade, na medida em que estabelece que os autos dos processos eletrônicos devem ser protegidos por sistemas de segurança de acesso e armazenados em meio que garanta a preservação e a integridade dos dados.',
  38: 'Os autos de processos devem ser conservados exclusivamente em meio eletrônico, eliminando-se toda documentação impressa e, consequentemente, a necessidade de armazenamento físico.',
  39: 'Os órgãos do Poder Judiciário devem utilizar apenas redes internas (intranets) para acesso aos processos eletrônicos, por questões de sigilo e segurança.',
  40: 'Quando for inviável realizar citação, intimação ou notificação por meio eletrônico, deve-se obedecer às regras ordinárias aplicáveis aos documentos físicos, devendo-se digitalizá-los e posteriormente destruí-los.',
  120: 'A figura apresentada no caderno ilustra a sinalética utilizada para indicar encadernação defeituosa.'
}
const diffHard = new Set([11,24,29,37,40,43,44,49,51,57,61,63,64,67,72,77,78,79,83,86,89,93,94,97,98,101,103,105,107,108,109,110,111,113,114,116,117,119,120])
const decisoes = []
for (const q of qs) {
  const n = Number(q.numero_original), tax = topics[n]
  if (!tax) throw new Error(`Sem classificação para questão ${n}`)
  const pg = Number(q.pagina)
  const imagem = `paginas/${doc}-${String(n===85?6:n===120?7:Number(q.imagem.match(/-(\d+)\.webp$/)?.[1]||pg)).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  const d = {
    id:q.id, sha256_enunciado:hashRevisao(q.enunciado), materia:tax[0], conteudo:tax[1], ano:2019,
    pagina:pg, dificuldade:diffHard.has(n)?'Difícil':'Média', dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial pela especificidade do conteúdo e pelas relações conceituais ou normativas exigidas; não representa índice oficial de acerto.',
    classificacao_fonte:prova,
    motivo:`TJ/AM 2019 — Analista Judiciário, Especialidade Arquivologia, Cargo 2, prova objetiva oficial, questão ${n}; matéria e conteúdo identificados pelo enunciado e pelo cabeçalho temático do caderno.`,
    imagem_pagina:imagem,
    texto_apoio: n===11 ? 'Texto-base CB1A1-I: texto sobre contratos inteligentes e execução automatizada de obrigações. O terceiro parágrafo apresenta uma operação condicionada por chave digital; consulte a página original vinculada para verificar a relação de referência perguntada.' : undefined
  }
  if (clean[n]) d.enunciado=clean[n]
  if (answers[n] && n>=41) {
    const a=answers[n]
    d.anulada=a==='X'; d.resposta_correta=a==='X'?null:a==='C'?0:1
    d.gabarito_oficial={valor:a,fonte:gabarito,metodo:'Transcrito do gabarito definitivo oficial CEBRASPE do Cargo 2; fonte oficial registrada. Arquivo binário não disponível localmente para validação por hash.'}
  }
  if(n===119) d.texto_apoio='O item depende do símbolo gráfico impresso no caderno. A imagem da página original foi associada à questão para que a sinalética seja examinada junto ao enunciado.'
  if(n===120) d.texto_apoio='O item depende do desenho da sinalética de encadernação defeituosa, preservado na imagem da página original vinculada à questão.'
  decisoes.push(d)
}
if(decisoes.length!==73) throw new Error(`Esperadas 73 revisões, recebidas ${decisoes.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
const report={...result,prova:'TJ/AM 2019 — Analista Judiciário — Especialidade Arquivologia — Cargo 2',documento_id:doc,registros_revisados:73,questoes_unicas_classificadas:73,gabaritos_oficiais_transcritos:64,itens_anulados:[109],questoes_basicas_sem_gabarito_verificado:[11,24,29,34,36,37,38,39,40],gabarito_hash_pendente:true,observacao:'As questões foram classificadas por enunciado e contexto do caderno. Os gabaritos definitivos dos itens revisados entre 41 e 120 foram registrados com a fonte oficial, mas o PDF binário não está localmente disponível para associar hash criptográfico; por isso a correção automática não é liberada por esta revisão. Os itens básicos permanecem sem chave até conferência visual legível da publicação oficial.',fontes:[prova,gabarito]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
