import { createHash } from 'node:crypto'
import { classificarReferencia } from './classificacao.mjs'

const classe = (n, nome) => String(n?.attrs?.class ?? '').split(/\s+/u).includes(nome)
const texto = n => typeof n === 'string' ? n : (n?.children ?? []).map(texto).join('')
const compacto = n => texto(n).replace(/\s+/gu, ' ').trim()
const tem = (n, predicado) => typeof n !== 'string' && (predicado(n) || (n.children ?? []).some(c => tem(c, predicado)))
const secos = new Set(['p', 'figure', 'table', 'ol', 'ul', 'math', 'svg', 'img', 'resposta-livre'])

export function extrairCapitulo(capitulo) {
  const questoes = []
  let atual = null
  let secao = ''
  function visitar(n) {
    if (!n || typeof n === 'string') return
    if (/^Acessar (?:Gabarito|Solucionário)$/iu.test(compacto(n))) return
    if (classe(n, 'paginacao') || classe(n, 'p-text-ref') || classe(n, 'tituloResposta')) return
    if (classe(n, 'gabarito')) {
      if (atual) atual.solucao_livro.push(n)
      return
    }
    if (/^h[1-6]$/u.test(n.tag) && /^(?:FIXAR|Interação|Sistematização|Enem e vestibulares(?:\s*\+\s*Desafio)?)$/iu.test(compacto(n))) {
      secao = compacto(n)
      atual = null
      return
    }
    if (classe(n, 'enunciadoNumero') && /^\s*(?:Resolução\s*)?\d+\s*[.)](?!\d)/iu.test(compacto(n))) {
      const inicio = compacto(n)
      const numero = inicio.replace(/^Resolução\s*/iu, '').match(/^(\d+)\s*[.)]/u)?.[1]
      if (!numero) return
      atual = {
        id: `sae-${createHash('sha256').update(`${capitulo.id_capitulo}|${secao}|${numero}|${questoes.length}`).digest('hex').slice(0,20)}`,
        numero_livro: Number(numero), secao, materia: capitulo.materia,
        conteudo: capitulo.capitulo, origem_livro: {
          id_capitulo: capitulo.id_capitulo, grupo: capitulo.grupo, capitulo: capitulo.capitulo,
          url: capitulo.url, titulo_documento: capitulo.titulo_documento,
        },
        ...classificarReferencia(inicio),
        enunciado_blocos: [n], alternativas: [], solucao_livro: [],
        campos_discursivos: 0, estado: 'em_revisao',
      }
      questoes.push(atual)
      return
    }
    if (atual && secos.has(n.tag)) {
      if (n.tag === 'resposta-livre') { atual.campos_discursivos++; return }
      if (classe(n, 'alternativaLetra') && /^[a-e]\s*\)/iu.test(compacto(n))) {
        atual.alternativas.push({
          rotulo: compacto(n).match(/^([a-e])\s*\)/iu)[1].toUpperCase(),
          texto: compacto(n).replace(/^[a-e]\s*\)\s*/iu, ''),
          correta_livro: classe(n, 'respostaCerta'), bloco: n,
          escolha_unica: Boolean(n.escolha_unica),
        })
      } else atual.enunciado_blocos.push(n)
      return
    }
    if (atual && /^h[1-6]$/u.test(n.tag)) { atual.enunciado_blocos.push(n); return }
    // Preserva fórmulas diagramadas em divs sem duplicar os parágrafos internos.
    if (atual && n.tag === 'div' && !tem(n, c => secos.has(c.tag) || /^h[1-6]$/u.test(c.tag)) && compacto(n)) {
      atual.enunciado_blocos.push(n); return
    }
    for (const c of n.children ?? []) visitar(c)
  }
  visitar(capitulo.conteudo)
  for (const q of questoes) {
    q.tipo_resposta = q.campos_discursivos ? 'discursiva'
      : q.alternativas.some(a => a.escolha_unica || a.correta_livro) ? 'multipla_escolha' : 'a_verificar'
    const corretas = q.alternativas.flatMap((a, i) => a.correta_livro ? [i] : [])
    q.resposta_correta = q.tipo_resposta === 'multipla_escolha' && corretas.length === 1 ? corretas[0] : null
    q.pendencias = []
    if (q.tipo_resposta !== 'multipla_escolha') q.pendencias.push('formato_para_revisao')
    if (q.tipo_resposta === 'multipla_escolha' && (q.alternativas.length < 2 || q.alternativas.length > 5 || q.alternativas.some((a, i) => a.rotulo !== 'ABCDE'[i]))) q.pendencias.push('alternativas_inconsistentes')
    if (q.tipo_resposta === 'multipla_escolha' && q.resposta_correta === null) q.pendencias.push('gabarito_nao_confirmado')
    q.pendencias.push('conferencia_visual_e_duplicatas')
  }
  return questoes
}
