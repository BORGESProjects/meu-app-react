import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = 'd8074949d37b37e4'
const nome = 'revisao-tcepa-cargo39-2016-v259'
const prova = 'https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/251TCEPA_039_01.pdf'
const chave = 'https://cdn.cebraspe.org.br/concursos/TCE_PA_16/arquivos/Gab_Definitivo_251TCEPA_039_01.pdf'
const raw = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
if (raw.length !== 44) throw Error(`Esperava 44 pendências atuais, encontrei ${raw.length}`)

const gabaritoTexto = '41:C|42:E|43:C|44:E|45:C|46:C|47:C|48:E|49:E|50:C|51:E|52:C|53:E|54:C|55:C|56:C|57:E|58:C|59:C|60:E|61:E|62:E|63:C|64:C|65:E|66:E|67:E|68:E|69:X|70:C|71:C|72:E|73:E|74:C|75:E|76:C|77:C|78:C|79:E|80:C|81:C|82:C|83:E|84:E|85:E|86:C|87:C|88:C|89:C|90:C|91:E|92:E|93:C|94:C|95:E|96:E|97:E|98:E|99:E|100:C'
const keyHash = createHash('sha256').update(gabaritoTexto).digest('hex')
const exam = 'TCE/PA 2016 — Cargo 39, Auxiliar Técnico de Controle Externo — Área Administrativa'

const questions = {
  41:['Direito Administrativo','Organização administrativa: descentralização da execução de atividades administrativas.','Média'],
  42:['Direito Administrativo','Organização administrativa: composição da administração indireta.','Fácil'],
  44:['Direito Administrativo','Atos administrativos: classificação de parecer administrativo.','Média'],
  61:['Direito Constitucional','Previdência do servidor público: aposentadoria do magistério e regras constitucionais.','Difícil'],
  62:['Direito Constitucional','Teoria da Constituição: rigidez e processo de alteração constitucional.','Fácil'],
  63:['Direito Constitucional','Servidor público: acumulação de proventos de aposentadoria e remuneração de cargo em comissão.','Média'],
  64:['Direito Constitucional','Direitos fundamentais: inviolabilidade domiciliar e flagrante delito.','Fácil'],
  65:['Direito Constitucional','Nacionalidade: brasileiro nato nascido no exterior, filho de brasileiros a serviço do Brasil.','Média'],
  66:['Direito Constitucional','Direitos políticos: suspensão por condenação criminal transitada em julgado.','Média'],
  67:['Direito Constitucional','Liberdade de associação: requisitos para suspensão de atividades e dissolução.','Média'],
  68:['Direito Constitucional','Nacionalidade e extradição: brasileiro naturalizado envolvido em tráfico de entorpecentes.','Difícil'],
  69:['Direito Constitucional','Organização do Estado: auxílio do Tribunal de Contas estadual ao controle externo municipal.','Média'],
  70:['Direito Constitucional','Organização municipal: fusão de municípios, estudos de viabilidade e plebiscito.','Média'],
  71:['Direito Constitucional','Competências estaduais: serviço local de gás canalizado e limites à edição de medida provisória.','Difícil'],
  72:['Direito Constitucional','Conselho Nacional de Justiça: indicação de membro do Ministério Público.','Difícil'],
  73:['Direito Constitucional','Poder Legislativo: licença parlamentar para missão diplomática temporária.','Média'],
  74:['Direito Constitucional','Conselho Nacional de Justiça: competência do Senado em crimes de responsabilidade.','Média'],
  75:['Direito Constitucional','Poder Executivo: delegação da concessão de indulto e comutação de penas.','Difícil'],
  76:['Direito Constitucional','Magistratura: remoção de juiz por interesse público e garantias do cargo.','Difícil'],
  77:['Direito Constitucional','Tribunais de Contas: foro por prerrogativa de função de conselheiro estadual.','Difícil'],
  78:['Direito Constitucional','Poder Legislativo: competência do STF para julgar parlamentares federais.','Média'],
  79:['Direito Constitucional','Ministério Público: nomeação dos chefes dos Ministérios Públicos estaduais e da União.','Média'],
  80:['Direito Constitucional','Defensoria Pública estadual: garantia da inamovibilidade.','Fácil'],
  81:['Direito Civil','Pessoas jurídicas: capacidade para adquirir direitos e contrair deveres.','Fácil'],
  82:['Direito Civil','Capacidade civil: incapacidade absoluta de menores de dezesseis anos.','Fácil'],
  83:['Direito Civil','Direitos da personalidade: disposição gratuita do próprio corpo após a morte e revogabilidade.','Média'],
  84:['Direito Civil','Personalidade civil: nascimento com vida e registro das associações.','Difícil'],
  85:['Direito Civil','Responsabilidade civil: transmissão da obrigação de reparar danos aos herdeiros.','Média'],
  86:['Direito Civil','Responsabilidade civil: redução equitativa da indenização por desproporção entre culpa e dano.','Média'],
  87:['Direito Administrativo','Responsabilidade civil do Estado: ação regressiva contra servidor que agiu com dolo ou culpa.','Média'],
  88:['Direito Civil','Responsabilidade civil: independência entre as esferas civil e criminal e efeitos da sentença penal.','Difícil'],
  89:['Direito Civil','Negócio jurídico: representação e atuação em nome do representado.','Média'],
  90:['Direito Civil','Ato ilícito: abuso de direito e limites socioeconômicos, boa-fé e bons costumes.','Média'],
  91:['Direito Civil','Bens: classificação de bens pertencentes a pessoas jurídicas públicas de direito privado.','Difícil'],
  92:['Direito Civil','Prescrição: impossibilidade de alteração convencional dos prazos prescricionais.','Fácil'],
  93:['Direito do Consumidor','Relação de consumo: conceito legal de fornecedor e entes despersonalizados.','Fácil'],
  94:['Direito do Consumidor','Estatuto da Pessoa Idosa: gratuidade no transporte coletivo urbano a partir de 65 anos.','Média'],
  95:['Direito da Pessoa Idosa','Benefício assistencial: idade, requisitos econômicos e obrigação alimentar familiar.','Difícil'],
  96:['Direito do Consumidor','Consumidor pessoa jurídica: teoria finalista e aquisição de insumos para revenda.','Difícil'],
  97:['Direito Civil','LINDB: revogação de lei anterior por lei nova que regula integralmente a mesma matéria.','Média'],
  98:['Direito Civil','LINDB: vacância e início da vigência da lei após publicação oficial.','Fácil'],
  99:['Direito Civil','LINDB: direito intertemporal, contrato anterior e critérios de integração da lei.','Difícil'],
  100:['Direito Civil','LINDB: duração da vigência da lei e revogação por norma posterior.','Fácil'],
}

const contexts = {
  41:'A respeito da administração direta e indireta e da centralização e da descentralização administrativa, julgue os itens seguintes.',
  42:'A respeito da administração direta e indireta e da centralização e da descentralização administrativa, julgue os itens seguintes.',
  44:'Considere que servidor público de determinada autarquia federal tenha solicitado ao setor técnico da entidade a emissão de parecer para subsidiar sua tomada de decisão. Julgue o item acerca dos atos administrativos.',
  61:'Com relação à Constituição Federal de 1988, sua classificação e seus dispositivos, julgue o item.',
  62:'Com relação à Constituição Federal de 1988, sua classificação e seus dispositivos, julgue o item.',
  63:'Com relação à Constituição Federal de 1988, sua classificação e seus dispositivos, julgue o item.',
  64:'No que concerne aos direitos e deveres individuais e coletivos, à nacionalidade e aos direitos políticos, julgue o item tendo como referência a Constituição Federal.',
  65:'No que concerne aos direitos e deveres individuais e coletivos, à nacionalidade e aos direitos políticos, julgue o item tendo como referência a Constituição Federal.',
  66:'No que concerne aos direitos e deveres individuais e coletivos, à nacionalidade e aos direitos políticos, julgue o item tendo como referência a Constituição Federal.',
  67:'No que concerne aos direitos e deveres individuais e coletivos, à nacionalidade e aos direitos políticos, julgue o item tendo como referência a Constituição Federal.',
  68:'No que concerne aos direitos e deveres individuais e coletivos, à nacionalidade e aos direitos políticos, julgue o item tendo como referência a Constituição Federal.',
  69:'A respeito da União, dos estados, do Distrito Federal e dos municípios, julgue o item. O item foi anulado no gabarito definitivo.',
  70:'A respeito da União, dos estados, do Distrito Federal e dos municípios, julgue o item.',
  71:'A respeito da União, dos estados, do Distrito Federal e dos municípios, julgue o item.',
  72:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  73:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  74:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  75:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  76:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  77:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  78:'No que diz respeito aos Poderes Executivo, Judiciário e Legislativo, julgue o item subsequente.',
  79:'Acerca do Ministério Público e da Defensoria Pública, julgue o item.',
  80:'Acerca do Ministério Público e da Defensoria Pública, julgue o item.',
  81:'Com base no Código Civil, julgue o item sobre personalidade e capacidade jurídica.',
  82:'Com base no Código Civil, julgue o item sobre personalidade e capacidade jurídica.',
  83:'Com base no Código Civil, julgue o item sobre personalidade e capacidade jurídica.',
  84:'Com base no Código Civil, julgue o item sobre personalidade e capacidade jurídica.',
  85:'Julgue o item sobre responsabilidade civil, indenização, dano moral e dano material.',
  86:'Julgue o item sobre responsabilidade civil, indenização, dano moral e dano material.',
  87:'Julgue o item sobre responsabilidade civil, indenização, dano moral e dano material.',
  88:'Julgue o item sobre responsabilidade civil, indenização, dano moral e dano material.',
  89:'Com base no Código Civil, julgue o item sobre bens, fatos jurídicos e prescrição.',
  90:'Com base no Código Civil, julgue o item sobre bens, fatos jurídicos e prescrição.',
  91:'Com base no Código Civil, julgue o item sobre bens, fatos jurídicos e prescrição.',
  92:'Com base no Código Civil, julgue o item sobre bens, fatos jurídicos e prescrição.',
  93:'À luz do Código de Defesa do Consumidor e do Estatuto da Pessoa Idosa, julgue o item.',
  94:'À luz do Código de Defesa do Consumidor e do Estatuto da Pessoa Idosa, julgue o item.',
  95:'À luz do Código de Defesa do Consumidor e do Estatuto da Pessoa Idosa, julgue o item.',
  96:'À luz do Código de Defesa do Consumidor e do Estatuto da Pessoa Idosa, julgue o item.',
  97:'Uma lei nova, oficialmente publicada, regula inteiramente assunto antes disciplinado por outra norma, nada estabelece sobre a data de entrada em vigor nem sobre o prazo de vigência e é silente quanto à revogação expressa da lei antiga. Sessenta dias depois da publicação, um juiz recebe processo relativo a contrato firmado anos antes com base na lei antiga. Julgue o item segundo a LINDB.',
  98:'Uma lei nova, oficialmente publicada, regula inteiramente assunto antes disciplinado por outra norma, nada estabelece sobre a data de entrada em vigor nem sobre o prazo de vigência e é silente quanto à revogação expressa da lei antiga. Sessenta dias depois da publicação, um juiz recebe processo relativo a contrato firmado anos antes com base na lei antiga. Julgue o item segundo a LINDB.',
  99:'Uma lei nova, oficialmente publicada, regula inteiramente assunto antes disciplinado por outra norma, nada estabelece sobre a data de entrada em vigor nem sobre o prazo de vigência e é silente quanto à revogação expressa da lei antiga. Sessenta dias depois da publicação, um juiz recebe processo relativo a contrato firmado anos antes com base na lei antiga. Julgue o item segundo a LINDB.',
  100:'Uma lei nova, oficialmente publicada, regula inteiramente assunto antes disciplinado por outra norma, nada estabelece sobre a data de entrada em vigor nem sobre o prazo de vigência e é silente quanto à revogação expressa da lei antiga. Sessenta dias depois da publicação, um juiz recebe processo relativo a contrato firmado anos antes com base na lei antiga. Julgue o item segundo a LINDB.',
}

const cleanups = new Map([
  [42,'Compõem a administração indireta os órgãos públicos internos, as autarquias, as empresas públicas, as sociedades de economia mista e as fundações públicas.'],
  [78,'Acusados de cometer infrações penais comuns, deputado federal e senador serão processados e julgados, originariamente, pelo Supremo Tribunal Federal.'],
  [80,'Ao defensor público estadual é assegurada a garantia de inamovibilidade.'],
  [89,'Denomina-se representação a relação jurídica em que uma pessoa se obriga perante terceiro por meio de ato praticado em seu nome por representante, cujos poderes são conferidos por lei ou por mandato.'],
  [92,'Os prazos de prescrição podem ser alterados por acordo entre as partes.'],
  [96,'Uma sociedade empresária que compra peças de outra sociedade empresária e as utiliza na montagem do produto que revende poderá invocar, em seu favor, normas do Código de Defesa do Consumidor no caso de ajuizamento de ação contra a pessoa jurídica que lhe vende as peças.'],
])
const answers = new Map(gabaritoTexto.split('|').map(x => { const [n,k]=x.split(':'); return [Number(n),k] }))
const byNumber = new Map(raw.map(q => [Number(q.numero), q]))
if (byNumber.size !== 43 || raw.filter(q => Number(q.numero) === 42).length !== 2) throw Error('Contagem/duplicata do caderno divergente')

const decisions = raw.map(q => {
  const n = Number(q.numero)
  const [materia, conteudo, dificuldade] = questions[n] || []
  const letter = answers.get(n)
  if (!materia || !conteudo || !letter || !contexts[n]) throw Error(`Classificação ou chave ausente no item ${n}`)
  const duplicate = n === 42 && q.id === 'extr-50971c983cef0243e98e'
  const enunciado = cleanups.get(n) || String(q.enunciado || '').replace(/\|\|251TCEPA_039_01N419739\|\|[\s\S]*$/, '').replace(/\s+/g, ' ').trim()
  if (n === 78 && /pr ocessados/.test(enunciado)) throw Error('O item 78 não foi normalizado')
  const anulada = letter === 'X'
  const page = Number(q.pagina)
  const image = `paginas/${doc}-${String(page).padStart(4, '0')}.webp`
  return {
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia,
    conteudo,
    ano: 2016,
    concurso: exam,
    numero_original: n,
    pagina: page,
    dificuldade,
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial baseada na quantidade de regras constitucionais/civis e na necessidade de combinar institutos; não é uma faixa publicada pelo CEBRASPE.',
    classificacao_fonte: prova,
    motivo: `CEBRASPE — TCE/PA 2016, Cargo 39, item ${n}, página ${page}; matéria e tópico identificados pelo comando e pelo instituto jurídico cobrado. Gabarito cotejado com a chave definitiva oficial.`,
    enunciado,
    texto_apoio: contexts[n],
    opcoes: ['Certo','Errado'],
    resposta_correta: anulada ? null : letter === 'C' ? 0 : 1,
    anulada,
    gabarito_oficial: {
      fonte: chave,
      arquivo: 'Gab_Definitivo_251TCEPA_039_01.pdf',
      sha256: keyHash,
      sha256_tipo: 'sha256_da_transcricao_canonica_dos_gabaritos_41_a_100; nao_e_hash_do_pdf',
      numero: n,
      pagina: 1,
      resposta: letter,
      criterio: 'Gabarito definitivo oficial do Cargo 39. O item 69 está anulado.'
    },
    ...(duplicate ? {
      apta_resolucao: false,
      inelegibilidade_motivo: `Duplicata do item 42; foi mantida a versão canônica ${byNumber.get(42).id}, que contém a redação e o gabarito oficial.`,
      duplicada_de: byNumber.get(42).id,
    } : {
      apta_resolucao: true,
      remover_pendencias: ['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente'],
      visual: {pagina:page,imagem:image,motivo:'Página do caderno oficial cotejada; mantém o enunciado e o contexto da seção junto ao item.'}
    })
  }
})

if (decisions.length !== 44 || decisions.filter(d => d.apta_resolucao === false).length !== 1 || decisions.filter(d => d.apta_resolucao === true).length !== 43) throw Error('Contagens de revisão inesperadas')
for (const d of decisions.filter(x => x.visual)) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report = await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## TCE/PA 2016 — Cargo 39, Área Administrativa — v259\n\n- Classifiquei individualmente 43 itens únicos pendentes em Direito Administrativo, Constitucional, Civil, do Consumidor e da Pessoa Idosa; corrigi matéria, assunto, ano, prova/cargo e dificuldade estimada.\n- Reconstituí o item 42 duplicado, normalizei erros de OCR e cortei texto da página seguinte que havia sido anexado aos itens 80 e 92. Mantive um registro canônico do item 42 e sinalizei a cópia como inelegível.\n- Vinculei o gabarito definitivo do Cargo 39 para todos os itens revisados e respeitei a anulação do item 69, sem correção automática. Imagens e comandos de seção foram associados para preservar contexto.\n- Alteração local; não publicada na nuvem.\n- Fontes oficiais: [caderno](<${prova}>), [gabarito definitivo](<${chave}>), [página do concurso](https://cdn.cebraspe.org.br/concursos/TCE_PA_16/).\n`)
console.log(JSON.stringify({...report,reviewed:44,canonical:43,duplicates:1,annulled:1},null,2))
