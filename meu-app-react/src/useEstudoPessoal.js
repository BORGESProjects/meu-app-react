import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabaseClient'

const vazio = () => ({ filtros: [], cadernos: [], questoes: {}, simulados: [], configuracoes: [], removidos: { filtros: [], cadernos: [], questoes: [], simulados: [], configuracoes: [] } })
const colecoes = ['filtros', 'cadernos', 'simulados', 'configuracoes']

function normalizar(dados) {
  const removidos = dados?.removidos || {}
  return {
    filtros: Array.isArray(dados?.filtros) ? dados.filtros.filter(item => item && typeof item.id === 'string' && typeof item.nome === 'string') : [],
    cadernos: Array.isArray(dados?.cadernos) ? dados.cadernos.map(item => ({
      ...item,
      pasta: typeof item.pasta === 'string' ? item.pasta : '',
      questoes: Array.isArray(item?.questoes) ? [...new Set(item.questoes.map(String))] : [],
      removidosQuestoes: Array.isArray(item?.removidosQuestoes) ? [...new Set(item.removidosQuestoes.map(String))] : [],
    })).filter(item => typeof item.id === 'string' && typeof item.nome === 'string') : [],
    questoes: dados?.questoes && typeof dados.questoes === 'object' && !Array.isArray(dados.questoes) ? dados.questoes : {},
    simulados: Array.isArray(dados?.simulados) ? dados.simulados.filter(item => item && typeof item.id === 'string').slice(0, 50) : [],
    configuracoes: Array.isArray(dados?.configuracoes) ? dados.configuracoes.filter(item => item && typeof item.id === 'string').slice(0, 30) : [],
    removidos: Object.fromEntries([...colecoes, 'questoes'].map(campo => [campo, Array.isArray(removidos[campo]) ? [...new Set(removidos[campo].map(String))] : []])),
  }
}

function unirColecao(remoto, local, removidos) {
  const removidosSet = new Set(removidos)
  const porId = new Map()
  for (const item of [...remoto, ...local]) {
    if (!item?.id || removidosSet.has(String(item.id))) continue
    const anterior = porId.get(String(item.id))
    const dataItem = Date.parse(item.modificadoEm || item.criadoEm || 0) || 0
    const dataAnterior = Date.parse(anterior?.modificadoEm || anterior?.criadoEm || 0) || 0
    if (!anterior || dataItem >= dataAnterior) porId.set(String(item.id), item)
  }
  return [...porId.values()].sort((a, b) => (Date.parse(b.modificadoEm || b.criadoEm || 0) || 0) - (Date.parse(a.modificadoEm || a.criadoEm || 0) || 0))
}

function mesclarEstudos(primeiro, segundo) {
  const a = normalizar(primeiro), b = normalizar(segundo)
  const removidos = Object.fromEntries([...colecoes, 'questoes'].map(campo => [campo, [...new Set([...a.removidos[campo], ...b.removidos[campo]])]]))
  const filtros = unirColecao(a.filtros, b.filtros, removidos.filtros)
  const simulados = unirColecao(a.simulados, b.simulados, removidos.simulados).slice(0, 50)
  const configuracoes = unirColecao(a.configuracoes, b.configuracoes, removidos.configuracoes).slice(0, 30)
  const cadernos = unirColecao(a.cadernos, b.cadernos, removidos.cadernos).map(caderno => {
    const outro = [...a.cadernos, ...b.cadernos].find(item => item.id === caderno.id) || caderno
    const versoes = [a.cadernos.find(item => item.id === caderno.id), b.cadernos.find(item => item.id === caderno.id)].filter(Boolean)
    const excluidas = new Set(versoes.flatMap(item => item.removidosQuestoes || []))
    const ids = [...new Set(versoes.flatMap(item => item.questoes || []))].filter(id => !excluidas.has(id))
    return { ...outro, ...caderno, questoes: ids, removidosQuestoes: [...excluidas] }
  })
  const idsQuestoesRemovidas = new Set(removidos.questoes)
  const questoes = {}
  for (const id of new Set([...Object.keys(a.questoes), ...Object.keys(b.questoes)])) {
    if (idsQuestoesRemovidas.has(id)) continue
    const qa = a.questoes[id], qb = b.questoes[id]
    const ta = Date.parse(qa?.modificadoEm || 0) || 0
    const tb = Date.parse(qb?.modificadoEm || 0) || 0
    questoes[id] = !qa ? qb : !qb ? qa : ta >= tb ? qa : qb
  }
  return { filtros, cadernos, questoes, simulados, configuracoes, removidos }
}

function registrarAlteracoes(anteriores, dadosNovos) {
  const antes = normalizar(anteriores), depois = normalizar(dadosNovos)
  const agora = new Date().toISOString()
  const removidos = { ...antes.removidos, ...depois.removidos }
  for (const campo of colecoes) {
    const idsNovos = new Set(depois[campo].map(item => String(item.id)))
    removidos[campo] = [...new Set([...antes.removidos[campo], ...depois.removidos[campo], ...antes[campo].filter(item => !idsNovos.has(String(item.id))).map(item => String(item.id))])]
    const anterioresPorId = new Map(antes[campo].map(item => [String(item.id), item]))
    depois[campo] = depois[campo].map(item => {
      const anterior = anterioresPorId.get(String(item.id))
      if (!anterior) return { ...item, modificadoEm: item.modificadoEm || agora }
      const semVersao = ({ modificadoEm: _modificadoEm, ...resto }) => resto
      return JSON.stringify(semVersao(anterior)) === JSON.stringify(semVersao(item))
        ? item : { ...item, modificadoEm: agora }
    })
  }
  const cadernosAnteriores = new Map(antes.cadernos.map(item => [item.id, item]))
  depois.cadernos = depois.cadernos.map(caderno => {
    const anterior = cadernosAnteriores.get(caderno.id)
    if (!anterior) return caderno
    const ids = new Set(caderno.questoes)
    const removidosQuestoes = [...new Set([...(anterior.removidosQuestoes || []), ...(caderno.removidosQuestoes || []), ...anterior.questoes.filter(id => !ids.has(id))])].filter(id => !ids.has(id))
    const novaColecao = [...new Set([...ids, ...anterior.questoes])].filter(id => !removidosQuestoes.includes(id))
    return { ...caderno, questoes: novaColecao, removidosQuestoes }
  })
  for (const id of new Set([...Object.keys(antes.questoes), ...Object.keys(depois.questoes)])) {
    if (JSON.stringify(antes.questoes[id]) !== JSON.stringify(depois.questoes[id]) && depois.questoes[id]) {
      depois.questoes[id] = { ...depois.questoes[id], modificadoEm: agora }
    }
  }
  return { ...depois, removidos }
}

async function gravarRemoto(userId, dados) {
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const leitura = await supabase.from('estudo_pessoal_usuario').select('dados,updated_at').eq('user_id', userId).maybeSingle()
    if (leitura.error) throw leitura.error
    const mesclado = mesclarEstudos(dados, leitura.data?.dados)
    const updatedAt = new Date().toISOString()
    if (!leitura.data) {
      const insercao = await supabase.from('estudo_pessoal_usuario').insert({ user_id: userId, dados: mesclado, updated_at: updatedAt }).select('updated_at').maybeSingle()
      if (!insercao.error) return mesclado
      if (insercao.error.code === '23505') continue
      throw insercao.error
    }
    const atualizacao = await supabase.from('estudo_pessoal_usuario').update({ dados: mesclado, updated_at: updatedAt })
      .eq('user_id', userId).eq('updated_at', leitura.data.updated_at).select('updated_at').maybeSingle()
    if (atualizacao.error) throw atualizacao.error
    if (atualizacao.data) return mesclado
  }
  throw new Error('O estudo foi alterado em outro dispositivo. Tente sincronizar novamente.')
}

export function useEstudoPessoal(userId, sincronizar = true) {
  const chave = useMemo(() => `ap-aprovado:estudo-pessoal:v1:${encodeURIComponent(String(userId || 'visitante'))}`, [userId])
  const remotoAtivo = Boolean(userId && sincronizar)
  const [estado, setEstado] = useState({ chave: '', dados: vazio(), carregado: false, erro: '', sincronizacao: 'local' })
  const estadoRef = useRef(estado)
  const remotoPronto = useRef(false)
  const gravaEmAndamento = useRef(false)
  const timer = useRef(null)
  const sincronizarRef = useRef(null)

  useLayoutEffect(() => { estadoRef.current = estado }, [estado])

  useEffect(() => {
    let ativo = true
    remotoPronto.current = !remotoAtivo
    let local = vazio(), erro = ''
    try {
      const salvo = JSON.parse(window.localStorage.getItem(chave) || 'null')
      if (salvo) local = normalizar(salvo)
    } catch {
      erro = 'Não foi possível ler os cadernos e filtros salvos deste dispositivo.'
    }
    setEstado({ chave, dados: local, carregado: true, erro, sincronizacao: remotoAtivo ? 'carregando' : 'local' })
    if (remotoAtivo) {
      void supabase.from('estudo_pessoal_usuario').select('dados').eq('user_id', userId).maybeSingle().then(({ data, error: erroRemoto }) => {
        if (!ativo) return
        remotoPronto.current = true
        if (erroRemoto) {
          const tabelaAusente = erroRemoto.code === 'PGRST205' || erroRemoto.code === '42P01'
          setEstado(atual => atual.chave === chave ? { ...atual, sincronizacao: 'erro', erro: tabelaAusente
            ? 'Sincronização entre dispositivos depende da migração estudo-pessoal.sql no Supabase.'
            : 'A sincronização on-line falhou; seus dados locais foram preservados.' } : atual)
          return
        }
        if (data?.dados) {
          const dados = mesclarEstudos(estadoRef.current.chave === chave ? estadoRef.current.dados : local, data.dados)
          setEstado(atual => atual.chave === chave ? { ...atual, dados, sincronizacao: 'salvo', erro: '' } : atual)
        } else {
          setEstado(atual => atual.chave === chave ? { ...atual, sincronizacao: 'salvo', erro: '' } : atual)
          setTimeout(() => { void sincronizarRef.current?.() }, 0)
        }
      }).catch(() => {
        if (!ativo) return
        remotoPronto.current = true
        setEstado(atual => atual.chave === chave ? { ...atual, sincronizacao: 'erro', erro: 'A sincronização on-line falhou; seus dados locais foram preservados.' } : atual)
      })
    }
    return () => { ativo = false; clearTimeout(timer.current) }
  }, [chave, remotoAtivo, userId])

  const sincronizarAgora = useCallback(async () => {
    if (!remotoAtivo || !remotoPronto.current || gravaEmAndamento.current) return
    gravaEmAndamento.current = true
    const enviado = estadoRef.current.dados
    setEstado(atual => atual.chave === chave ? { ...atual, sincronizacao: 'sincronizando' } : atual)
    try {
      const salvo = await gravarRemoto(userId, estadoRef.current.dados)
      setEstado(atual => {
        if (atual.chave !== chave) return atual
        return { ...atual, dados: mesclarEstudos(atual.dados, salvo), sincronizacao: 'salvo', erro: '' }
      })
    } catch (erro) {
      setEstado(atual => atual.chave === chave ? { ...atual, sincronizacao: 'erro', erro: erro?.code === '42P01' || erro?.code === 'PGRST205'
        ? 'Sincronização entre dispositivos depende da migração estudo-pessoal.sql no Supabase.'
        : 'A sincronização on-line falhou; as alterações continuam salvas neste dispositivo.' } : atual)
    } finally {
      gravaEmAndamento.current = false
      if (JSON.stringify(estadoRef.current.dados) !== JSON.stringify(enviado)) {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => { void sincronizarRef.current?.() }, 500)
      }
    }
  }, [chave, remotoAtivo, userId])
  useLayoutEffect(() => { sincronizarRef.current = sincronizarAgora }, [sincronizarAgora])

  useEffect(() => {
    if (!estado.carregado || estado.chave !== chave) return
    try {
      window.localStorage.setItem(chave, JSON.stringify(estado.dados))
    } catch {
      setEstado(atual => atual.chave === chave ? { ...atual, erro: 'O navegador não conseguiu salvar as alterações deste dispositivo.' } : atual)
    }
  }, [chave, estado])

  useEffect(() => {
    if (!remotoAtivo || !remotoPronto.current || !estado.carregado || estado.chave !== chave) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { void sincronizarRef.current?.() }, 900)
    return () => clearTimeout(timer.current)
  }, [chave, estado.dados, estado.carregado, estado.chave, remotoAtivo])

  useEffect(() => {
    if (!remotoAtivo) return undefined
    const tentar = () => { if (!document.hidden) void sincronizarRef.current?.() }
    window.addEventListener('online', tentar)
    window.addEventListener('focus', tentar)
    return () => { window.removeEventListener('online', tentar); window.removeEventListener('focus', tentar) }
  }, [remotoAtivo])

  const atualizar = useCallback(mudar => {
    setEstado(atual => {
      if (atual.chave !== chave || !atual.carregado) return atual
      const recebido = typeof mudar === 'function' ? mudar(atual.dados) : mudar
      return { ...atual, dados: registrarAlteracoes(atual.dados, recebido), erro: '' }
    })
  }, [chave])

  const pronto = estado.chave === chave && estado.carregado
  return {
    dados: pronto ? estado.dados : vazio(),
    carregado: pronto,
    erro: pronto ? estado.erro : '',
    sincronizacao: remotoAtivo ? (pronto ? estado.sincronizacao : 'carregando') : 'local',
    atualizar,
    sincronizarAgora,
  }
}
