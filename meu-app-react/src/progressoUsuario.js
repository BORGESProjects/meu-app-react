const campos = ['horas_estudo', 'historico_respostas', 'tarefas']
const vazio = () => ({horas_estudo:[], historico_respostas:[], tarefas:[]})
export function normalizarProgresso(dados) {
  return Object.fromEntries(campos.map(campo => [campo, Array.isArray(dados?.[campo]) ? dados[campo] : []]))
}
const chaveItem = item => item?.id == null ? null : String(item.id)

export function aplicarOperacoes(base, operacoes) {
  const dados = normalizarProgresso(base)
  for (const op of operacoes) {
    if (!campos.includes(op.campo)) continue
    const anteriores = dados[op.campo]
    const excluir = new Set(op.remover || [])
    const adicionar = new Map((op.adicionar || []).map(item => [chaveItem(item),item]))
    // Histórico e horas são cumulativos; repetir uma tentativa não conta duas vezes.
    const presentes = new Set(anteriores.map(chaveItem))
    if (op.campo !== 'tarefas') {
      dados[op.campo] = [...anteriores, ...[...adicionar].filter(([id]) => id && !presentes.has(id)).map(([,item]) => item)]
    } else {
      dados.tarefas = anteriores.filter(item => !excluir.has(chaveItem(item))).map(item => adicionar.get(chaveItem(item)) || item)
      dados.tarefas.push(...[...adicionar].filter(([id]) => id && !presentes.has(id) && !excluir.has(id)).map(([,item]) => item))
    }
  }
  return dados
}

export function diferencaProgresso(campo, anterior, proximo) {
  const mapa = new Map(anterior.map(item => [chaveItem(item),item]))
  const ids = new Set(proximo.map(chaveItem))
  return {
    campo,
    adicionar:proximo.filter(item => chaveItem(item) && (!mapa.has(chaveItem(item)) || (campo === 'tarefas' && JSON.stringify(mapa.get(chaveItem(item))) !== JSON.stringify(item)))),
    remover:campo === 'tarefas' ? anterior.filter(item => !ids.has(chaveItem(item))).map(chaveItem) : [],
  }
}

export function criarRepositorioProgresso(client) {
  async function requisitar(consulta) {
    let resultado = await consulta()
    if (resultado.status === 401) {
      let limite
      try {
        const renovacao = await Promise.race([
          client.auth.refreshSession(),
          new Promise((_,reject)=>{limite=setTimeout(()=>reject(new Error('Renovação indisponível')),20000)}),
        ])
        if (renovacao.error || !renovacao.data?.session) throw new Error('Sessão não renovada')
      } catch {
        throw {code:'AUTH_RELOGIN',message:'A sessão de acesso expirou e precisa de novo login.'}
      } finally {clearTimeout(limite)}
      resultado = await consulta()
    }
    if (resultado.error) throw {...resultado.error,statusHttp:resultado.status}
    return resultado.data
  }
  return {
    async ler(userId) {
      return requisitar(()=>client.from('progresso_usuario').select('horas_estudo,historico_respostas,tarefas,updated_at')
        .eq('user_id',userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle())
    },
    async gravar(userId, anterior, dados) {
      // Comparação de versão: uma aba não sobrescreve alterações de outra.
      const updated_at = new Date(Math.max(Date.now(), Date.parse(anterior?.updated_at || 0) + 1 || 0)).toISOString()
      const payload = {...dados,updated_at}
      try {
        return await requisitar(()=>{
          const consulta = anterior
            ? client.from('progresso_usuario').update(payload).eq('user_id',userId).eq('updated_at',anterior.updated_at)
            : client.from('progresso_usuario').insert({...payload,user_id:userId})
          return consulta.select('horas_estudo,historico_respostas,tarefas,updated_at')
            .abortSignal(AbortSignal.timeout(20000)).maybeSingle()
        })
      } catch (erro) {
        if (erro.code === '23505') return null // Outra aba criou a linha primeiro.
        throw erro
      }
    },
  }
}

export function criarControleProgresso({userId, repositorio, storage, id = () => crypto.randomUUID(), agendar = setTimeout, cancelar = clearTimeout}) {
  const prefixo = `ap-aprovado:progresso:${userId}:`
  const chaveCache = prefixo + 'cache'
  const prefixoOp = prefixo + 'op:'
  const ouvintes = new Set()
  const duraveis = new Set()
  let base = vazio(), pendentes = [], carregado = false, avisoLocal = '', rodando = false, geracao = 0, timer, tentativas = 0
  let snapshot
  function lerPendentes() {
    const mapa = new Map(pendentes.map(op=>[op.id,op]))
    try {
      const presentes = new Set()
      for (let i=0;i<storage.length;i++) {
        const chave = storage.key(i)
        if (!chave?.startsWith(prefixoOp)) continue
        const op = JSON.parse(storage.getItem(chave))
        if (op?.id && campos.includes(op.campo) && Array.isArray(op.adicionar) && Array.isArray(op.remover)) {mapa.set(op.id,op);presentes.add(op.id)}
      }
      for (const id of duraveis) if (!presentes.has(id)) mapa.delete(id)
      for (const id of presentes) duraveis.add(id)
    } catch { avisoLocal = 'O navegador não permitiu recuperar a cópia local. Não feche a página até sincronizar.' }
    pendentes = [...mapa.values()].sort((a,b)=>a.criadoEm-b.criadoEm || a.id.localeCompare(b.id))
  }
  function cache() {
    try { storage.setItem(chaveCache,JSON.stringify({userId,dados:base})) }
    catch { avisoLocal = 'Não foi possível guardar uma cópia neste navegador. Não feche a página até sincronizar.' }
  }
  function emitir(status,erro='',diagnostico='') {
    snapshot = {dados:aplicarOperacoes(base,pendentes),carregado,status,erro,diagnostico,avisoLocal,pendentes:pendentes.length}
    for (const ouvir of ouvintes) ouvir()
  }
  try {
    const recuperado = JSON.parse(storage.getItem(chaveCache))
    if (recuperado?.userId === userId) {base = normalizarProgresso(recuperado.dados); carregado = true}
  } catch { /* Uma cópia indisponível não substitui o progresso do servidor por zeros. */ }
  lerPendentes()
  if (pendentes.length) carregado = true
  emitir(carregado ? 'pendente' : 'carregando')
  function marcarTentativa(atraso) {
    cancelar(timer)
    timer = agendar(()=>{void sincronizar()},atraso)
  }
  async function sincronizar() {
    if (!rodando) return
    const atual = geracao
    rodando = false // Uma única requisição em andamento por controlador.
    cancelar(timer)
    emitir('salvando')
    try {
      for (let conflito=0;conflito<5;conflito++) {
        const remoto = await repositorio.ler(userId)
        if (atual !== geracao) return
        lerPendentes()
        const enviadas = [...pendentes]
        const dados = aplicarOperacoes(remoto,enviadas)
        const salvo = enviadas.length ? await repositorio.gravar(userId,remoto,dados) : remoto
        if (atual !== geracao) return
        if (enviadas.length && !salvo) continue
        base = normalizarProgresso(salvo)
        const ids = new Set(enviadas.map(op=>op.id))
        pendentes = pendentes.filter(op=>!ids.has(op.id))
        for (const op of enviadas) {
          try { storage.removeItem(prefixoOp+op.id) }
          catch { avisoLocal = 'A cópia local não pôde ser atualizada. O progresso já foi confirmado na conta.' }
        }
        lerPendentes()
        carregado = true
        tentativas = 0
        cache()
        emitir(pendentes.length ? 'pendente' : 'salvo')
        if (pendentes.length) marcarTentativa(0)
        else marcarTentativa(60000) // Atualiza também alterações realizadas em outro dispositivo.
        return
      }
      throw new Error('O progresso mudou em outra aba. Vamos tentar novamente.')
    } catch (erro) {
      if (atual !== geracao) return
      emitir('erro',erro?.code === 'AUTH_RELOGIN'
        ? 'Sua sessão expirou. Entre novamente na mesma conta para sincronizar. As alterações pendentes foram mantidas.'
        : erro?.code === '42501'
        ? 'O banco recusou o acesso ao progresso desta conta. Suas alterações pendentes foram mantidas.'
        : 'Não foi possível sincronizar com a conta. As alterações pendentes serão reenviadas automaticamente.',
        [erro?.statusHttp ? `HTTP ${erro.statusHttp}` : '',erro?.code,erro?.message || erro?.name].filter(Boolean).join(' · ').slice(0,600))
      marcarTentativa(erro?.code === 'AUTH_RELOGIN' ? 30000 : Math.min(30000,1000*2**Math.min(tentativas++,5)))
    } finally { if (atual === geracao) rodando = true }
  }
  function mudar(campo, valor) {
    if (!carregado || !campos.includes(campo)) return
    const anterior = snapshot.dados[campo]
    const proximo = typeof valor === 'function' ? valor(anterior) : valor
    if (!Array.isArray(proximo)) return
    const op = {...diferencaProgresso(campo,anterior,proximo),id:id(),criadoEm:Date.now()}
    if (!op.adicionar.length && !op.remover.length) return
    pendentes.push(op)
    try { storage.setItem(prefixoOp+op.id,JSON.stringify(op));duraveis.add(op.id) }
    catch { avisoLocal = 'Não foi possível guardar a alteração neste navegador. Não feche a página até sincronizar.' }
    emitir('pendente')
    if (rodando) marcarTentativa(150)
  }
  return {
    getSnapshot:()=>snapshot,
    subscribe(ouvir) { ouvintes.add(ouvir); return ()=>ouvintes.delete(ouvir) },
    mudar,
    iniciar() {geracao++;rodando=true;void sincronizar()},
    parar() {geracao++;rodando=false;cancelar(timer)},
    tentar:()=>{if(rodando) void sincronizar()},
  }
}
