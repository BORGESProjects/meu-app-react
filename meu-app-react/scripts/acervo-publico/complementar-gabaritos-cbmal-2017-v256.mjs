import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '4caad0dfcd788048'
const prova = 'https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/340_CBMAL_CB1_01.pdf'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/CBM_AL_17_COMBATENTE/arquivos/Gab_Definitivo_340_CBMAL_CB1_01.PDF'
const sha256 = '1d1bad56bca9d06f37a2cc765a53c5b3df9172637a7650419b4c7c8135e91e87'
const ids = ['extr-541e2064ba4224c906c2', 'extr-62f8ae4bc8fc3dc01931', 'extr-9ea0d588f2bbf4e46ef4', 'extr-3e5051e04243830b5dc3', 'extr-a64f028f765f45cee1fa', 'extr-bae00cef5ec3143cae20', 'extr-a98d7d5c938c7b967388', 'extr-1b8ba731a630b2e3825d', 'extr-2bbe721b2b76c1db05d0', 'extr-b354afafbdbd03351ea4']
const details = {
  'extr-541e2064ba4224c906c2': ['Língua Espanhola', 'Vocabulário e semântica: substituição de “sin duda” por advérbio equivalente.', 1, 'C'],
  'extr-62f8ae4bc8fc3dc01931': ['Língua Espanhola', 'Reescrita e sintaxe: manutenção do sentido e correção gramatical em trecho do texto.', 4, 'E'],
  'extr-9ea0d588f2bbf4e46ef4': ['História', 'História contemporânea: limites da Liga das Nações na manutenção da paz após a Primeira Guerra Mundial.', 7, 'E'],
  'extr-3e5051e04243830b5dc3': ['História', 'História contemporânea: impactos das guerras do século XX sobre combatentes e populações civis.', 8, 'E'],
  'extr-a64f028f765f45cee1fa': ['História', 'Guerra Fria e dissuasão nuclear: corrida armamentista, equilíbrio estratégico e destruição mútua.', 12, 'C'],
  'extr-bae00cef5ec3143cae20': ['Língua Portuguesa', 'Crase e regência: efeitos da alteração de “a sobrevivência” no contexto sintático.', 13, 'C'],
  'extr-a98d7d5c938c7b967388': ['Língua Portuguesa', 'Coesão referencial: retomada pronominal de “Hiroshima e Nagasaki”.', 14, 'E'],
  'extr-1b8ba731a630b2e3825d': ['Língua Portuguesa', 'Semântica lexical: sentido contextual do verbo “dissuadir”.', 15, 'E'],
  'extr-2bbe721b2b76c1db05d0': ['Informática', 'Correio eletrônico: uso do campo CC e envio de mensagens a vários destinatários.', 38, 'E'],
  'extr-b354afafbdbd03351ea4': ['Informática', 'Suítes de escritório: edição de texto, inserção de imagens e criação de desenhos no Writer.', 39, 'C'],
}
const base = raizesAtuais[0]
const bases = raizesAtuais
const manifesto = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const active = new Map()
for (const index of [274, 275, 276]) {
  const lot = manifesto.lotes[index]
  const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo, bases)))
  for (const q of qs) if (q.documento_id === doc && ids.includes(q.id)) active.set(q.id, q)
}
if (active.size !== ids.length) throw Error(`Esperava ${ids.length} itens já classificados sem gabarito; encontrei ${active.size}`)
const decisions = ids.map(id => {
  const q = active.get(id)
  const [materia, conteudo, numero, letra] = details[id]
  if (Number(q.numero_original) !== numero || q.documento_id !== doc || !q.classificacao_pendente === false) throw Error(`Dados inesperados para ${id}`)
  const resposta = letra === 'C' ? 0 : 1
  return {
    id, sha256_enunciado: hashRevisao(q.enunciado), materia, conteudo, ano: 2017,
    concurso: 'CBM/AL 2017 — Oficial Combatente — Conhecimentos Básicos',
    numero_original: numero, pagina: Number(q.pagina), classificacao_fonte: prova,
    dificuldade: 'Média', dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial por complexidade de leitura e conhecimento exigido.',
    motivo: `Caderno oficial CBM/AL 2017, Oficial Combatente, item ${numero}; matéria e tópico conferidos com o comando e a página do caderno.`,
    resposta_correta: resposta, anulada: false,
    gabarito_oficial: { fonte: gabarito, arquivo: 'Gab_Definitivo_340_CBMAL_CB1_01.PDF', sha256, numero, pagina: 1, resposta: letra, criterio: 'Gabarito definitivo específico do caderno CB1, cargo 1; resposta conferida na tabela oficial.' },
    apta_resolucao: true, remover_pendencias: ['gabarito_oficial_nao_vinculado', 'classificacao_especifica_pendente', 'ano_sem_evidencia'],
  }
})
if (process.argv.includes('--dry-run')) { console.log(JSON.stringify({ registros: decisions.length, materias: Object.fromEntries([...new Set(decisions.map(d => d.materia))].map(m => [m, decisions.filter(d => d.materia === m).length])) }, null, 2)); process.exit(0) }
const nome = 'complemento-gabaritos-cbmal-2017-v256'
const result = await aplicarRevisoesIndividuais({ nome, base, decisoes: decisions })
const rootLine = `raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`
const current = await fs.readFile('scripts/acervo-publico/acervo-atual.mjs', 'utf8')
if (!current.includes(rootLine)) await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\n${rootLine}\n`)
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify({ ...result, source: prova, answer_key: gabarito, published: false }, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## Complemento CBM/AL 2017 — Conhecimentos Básicos, v256\n\n- Completei a chave oficial nos 10 registros já classificados que ainda estavam sem gabarito: Espanhol (1 e 4), História (7, 8 e 12), Língua Portuguesa (13–15) e Informática (38–39). Corrigi também os assuntos e a origem de classificação que ainda estavam rotulados como Inglês.\n- Vinculei o gabarito definitivo específico do caderno CB1 do cargo de Oficial Combatente. As respostas e o SHA-256 foram conferidos no inventário documental oficial. Validação local: ${result.classificadas} registros atualizados; total ${result.total}, elegíveis ${result.disponiveis}, pendências ${result.pendentes}. Não publicado na nuvem.\n- Fontes oficiais: [caderno CB1](<${prova}>), [gabarito definitivo](<${gabarito}>).\n`)
console.log(JSON.stringify(result, null, 2))
