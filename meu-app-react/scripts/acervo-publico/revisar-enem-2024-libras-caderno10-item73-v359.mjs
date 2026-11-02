import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2024-libras-caderno10-item73-v359'
const doc='ecf0c023091e9a7e'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D1_CD10_superampliada.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD10.pdf'
const id='extr-d4d24c379d37890dba1a'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const q=records.find(x=>x.id===id)
if(!q)throw Error('Registro pendente não encontrado')

const textoApoio='TEXTO I\nO empirismo moderno foi, em grande parte, condicionado por dois dogmas. Um deles é a crença em certa divisão fundamental entre verdades analíticas, ou fundadas em significados independentemente de questões de fato, e verdades sintéticas, ou fundadas em fatos. O outro dogma é o reducionismo: a crença de que todo enunciado significativo é equivalente a algum constructo lógico sobre termos que se referem à experiência imediata.\nQUINE, W. V. O. Dois dogmas do empirismo. In: RYLE, G. et al. Ensaios. São Paulo: Abril Cultural, 1975.\n\nTEXTO II\nTeses: 1. Somente os enunciados que possuem conteúdo factual são teoricamente significativos; enunciados que não podem, em princípio, estar fundamentados pela experiência são carentes de significado. 2. As ciências empíricas usam somente o conteúdo empírico da realidade. 3. A filosofia usa um conceito não empírico da realidade.\nCARNAP, R. Pseudoproblemas na filosofia. In: SCHLICK, M.; CARNAP, R.; POPPER, K. Coletânea de textos. São Paulo: Abril Cultural, 1975.'
const enunciado='Ao comparar os textos, conclui-se que eles apresentam posicionamentos filosóficos divergentes com relação ao'
const opcoes=[
  'estatuto epistemológico da linguagem.',
  'alicerce estruturante da moralidade.',
  'conteúdo essencial da metafísica.',
  'princípio constitutivo da ontologia.',
  'domínio reflexivo da estética.'
]
const decisao={
  id, sha256_enunciado:hashRevisao(q.enunciado),
  materia:'Filosofia', conteudo:'Epistemologia: empirismo lógico, verificacionismo e reducionismo',
  ano:2024, concurso:'ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), superampliada', banca:'INEP', organizadora:'INEP',
  aplicacao:'ENEM 2024 — 1º dia — Caderno 10 Roxo — aplicação regular',
  numero_original:73, numero:73, pagina:81, dificuldade:'Média', dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pelo confronto de dois textos filosóficos e identificação da divergência epistemológica.',
  classificacao_fonte:prova,
  motivo:'Conferência visual direta da página 81 do caderno oficial, que identifica o item impresso como questão 73; transcrição das duas bases textuais e das cinco alternativas. Gabarito A conferido no PDF oficial do Caderno 10 Roxo do Inep.',
  enunciado, opcoes, texto_apoio:textoApoio, resposta_correta:0, anulada:false, apta_resolucao:true,
  gabarito_oficial:{fonte:gabarito, arquivo:'2024_GB_impresso_D1_CD10.pdf', prova:'2024_PV_impresso_D1_CD10_superampliada.pdf', numero:73, pagina:1, resposta:'A', criterio:'Gabarito oficial do Inep para o Caderno 10 Roxo, item 73.'},
  visual:{pagina:81, imagem:`paginas/${doc}-0081.webp`, enunciado, texto_apoio:textoApoio, motivo:'Conferência visual da questão 73 no caderno oficial superampliado; restauração da base textual completa e remoção do rodapé OCR agregado à alternativa E.'}
}
if(process.argv.includes('--dry-run')){
  console.log(JSON.stringify({documento:doc,id,numeroAnterior:q.numero,numeroCorrigido:73,pagina:81,alternativas:opcoes.length,resposta:'A',publicado:false},null,2));
  process.exit(0)
}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:[decisao]})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,id,edicao:'ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), superampliada',numeroAnterior:q.numero,numeroCorrigido:73,pagina:81,resposta:'A',publicado:false,prova,gabarito,nota:'Registro originalmente numerado como questão 3, embora a página oficial mostre a questão 73. Corrigida a numeração, transcritos integralmente os dois textos-base e as alternativas, removido o rodapé agregado por OCR e conferido o gabarito oficial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## INEP/ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), questão 73 — revisão v359\n\n- Corrigida a numeração do registro, que estava como questão 3 apesar de a página 81 do caderno oficial identificar a questão 73.\n- Restaurados os dois textos-base e as cinco alternativas, retirando o texto de rodapé que havia sido agregado à alternativa E pelo OCR.\n- Classificação: Filosofia — Epistemologia, empirismo lógico, verificacionismo e reducionismo.\n- Gabarito A conferido na tabela oficial do Inep. Publicação em nuvem não realizada.\n- Fontes: [caderno oficial](\${prova}) e [gabarito oficial](\${gabarito}).\n`)
console.log(JSON.stringify(report,null,2))
