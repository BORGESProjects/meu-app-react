import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const nome='correcao-petrobras-2021-item-58-v276'
const base='tmp/revisao-profissional/revisao-petrobras-2021-enfase-2-pendencias-v275/acervo-extraido'
const ids=['extr-814662b79d3ad4998ad7','extr-d2a1b455c725163e93ae']
const formula='A produção mensal de uma fábrica é p = 3ℓ^(1/3)k^(2/3), em que ℓ e k são os custos de pessoal e equipamento. Para produzir p₀ por mês, os valores de ℓ e k que minimizam o custo total ℓ + k são ℓ = ³√(p₀/3) e k = ⁴√p₀.'
const decisoes=ids.map(id=>({
  id,
  sha256_enunciado:hashRevisao('A produção mensal de uma fábrica é p = 3ℓ^(1/3)k^(2/3), em que ℓ e k são os custos de pessoal e equipamento. Para produzir p₀ por mês, os valores de ℓ e k que minimizam o custo total ℓ + k são ℓ = (p₀/3)^(1/3) e k = p₀^(2/3).'),
  enunciado:formula,
  materia:'Matemática',
  conteudo:'Cálculo diferencial — otimização de função de produção Cobb-Douglas',
  ano:2022,
  concurso:'PETROBRAS PSP RH 2021 — Ênfase 2: Análise de Comercialização e Logística — Comércio e Suprimento (aplicação em 20/2/2022)',
  numero_original:58,
  pagina:1,
  dificuldade:'Difícil',
  dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela complexidade matemática e pelas etapas de otimização; não publicada pela banca.',
  classificacao_fonte:'https://cdn.cebraspe.org.br/concursos/PETROBRAS_21_NS/arquivos/ED_1_PETROBRAS_PSP1_2021_ABERTURA.PDF',
  motivo:'Matemática e cálculo de otimização; fórmula transcrita novamente após conferência visual do caderno oficial.',
  texto_apoio:'A função de produção é p = 3ℓ^(1/3)k^(2/3), em que ℓ e k são custos de pessoal e de equipamento. Para uma meta p₀, minimiza-se o custo total ℓ + k.',
  opcoes:['Certo','Errado'],
  resposta_correta:0,
  anulada:false,
  apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
  gabarito_oficial:{fonte:'https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/GAB_DEFINITIVO_658_PETROBRAS_002_01.PDF',arquivo:'GAB_DEFINITIVO_658_PETROBRAS_002_01.PDF',numero:58,pagina:1,resposta:'C',criterio:'Transcrito do gabarito oficial definitivo da ênfase 2.'},
  visual:{pagina:1,imagem:'paginas/fadb0e08acc3d2de-0001.webp',motivo:'Fórmula conferida visualmente no caderno oficial, página 1.'}
}))
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Correção de transcrição — Petrobras 2021, item 58 — v276\n\n- A conferência visual da página 1 do caderno oficial mostrou que o segundo minimizador é \`k = ⁴√p₀\`; a transcrição anterior registrava incorretamente \`k = p₀^(2/3)\`.\n- Corrigi o enunciado no registro canônico e no registro OCR duplicado (este permanece inelegível para resolução). Preservei a resposta C do gabarito definitivo.\n- Alteração local, ainda não publicada na nuvem. Fonte: [caderno oficial](<https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/658_PETROBRAS_002_01.PDF>) e [gabarito definitivo](<https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/GAB_DEFINITIVO_658_PETROBRAS_002_01.PDF>).\n`)
console.log(JSON.stringify({...report,revisadas:2,questao:58,publicacao:'local'},null,2))
