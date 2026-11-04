import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {supabase} from '../supabaseClient'
import {API_URL,fetchApi} from '../api'
import {STATUS_EDITAL, novoIdEdital, lerConteudosEdital, acrescentarConteudos, alterarTopico, resumoEdital, topicoVisivel, identidadeEdital, copiarEditalAntigo} from '../editais'
import './EditalPlanejador.css'
import {aplicativoNativo} from '../plataforma'
import {criarEditaisOffline} from '../editaisOffline'
import {linhasModelosEditais, modelosEditaisOficiais} from '../data/modelosEditaisOficiais'

const vazio = {titulo:'', edicao:'', unidade:'', data_prova:''}
const exemplo = 'Português:\nInterpretação de textos\nConcordância verbal e nominal\n\nMatemática:\nEquações do primeiro e segundo grau\nGeometria plana'
const ImportarEditalPdf = lazy(()=>import('./ImportarEditalPdf'))
const chavePratica = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim()
function estatisticaPratica(materia,topico,historico) {
  const materiaAlvo=chavePratica(materia),conteudoAlvo=chavePratica(topico)
  const itens=historico.filter(item=>{
    const materiaResposta=chavePratica(item.materia),conteudoResposta=chavePratica(item.conteudo)
    if(!materiaResposta || !conteudoResposta || !conteudoAlvo)return false
    const mesmaMateria=materiaResposta===materiaAlvo || materiaResposta.includes(materiaAlvo) || materiaAlvo.includes(materiaResposta)
    return mesmaMateria && (conteudoResposta.includes(conteudoAlvo) || conteudoAlvo.includes(conteudoResposta))
  })
  const acertos=itens.filter(item=>item.acertou===true).length
  return {total:itens.length,percentual:itens.length?Math.round(acertos/itens.length*100):0}
}

function Progresso({materias}) {
  const r = resumoEdital(materias)
  return <div className="edital-progresso"><div><span>{r.concluidos} de {r.total} conteúdos estudados</span><strong>{r.percentual}%</strong></div><progress max="100" value={r.percentual} aria-label="Conteúdos estudados" /></div>
}

export default function EditalPlanejador({userId, client = supabase, historicoRespostas = [], onPraticar, mostrarCatalogoOficial = true}) {
  const repositorioLocal=useMemo(()=>aplicativoNativo?criarEditaisOffline({client,userId,storage:window.localStorage}):null,[client,userId])
  const [editais,setEditais] = useState([])
  const [selecionado,setSelecionado] = useState('')
  const [favoritos,setFavoritos] = useState([])
  const [carregando,setCarregando] = useState(true)
  const [salvando,setSalvando] = useState(false)
  const [erro,setErro] = useState('')
  const [aviso,setAviso] = useState('')
  const [form,setForm] = useState(vazio)
  const [criando,setCriando] = useState(false)
  const [configurando,setConfigurando] = useState(false)
  const [modo,setModo] = useState('materia')
  const [materia,setMateria] = useState('')
  const [conteudos,setConteudos] = useState('')
  const [busca,setBusca] = useState('')
  const [status,setStatus] = useState('')
  const [prioridade,setPrioridade] = useState('')
  const [abertas,setAbertas] = useState({})
  const [editando,setEditando] = useState(null)
  const [antigos,setAntigos] = useState(mostrarCatalogoOficial ? linhasModelosEditais : null)
  const [lendoAntigos,setLendoAntigos] = useState(false)
  const [modeloSelecionado,setModeloSelecionado] = useState(mostrarCatalogoOficial ? linhasModelosEditais[0]?.concurso || '' : '')
  const [leitorSolicitado,setLeitorSolicitado] = useState(false)
  const bloqueio = useRef(false)
  const chavePreferencias = useMemo(()=>`ap-edital-preferencias:${userId||'anonimo'}`,[userId])
  const ativo = editais.find(e => e.id === selecionado)
  const resumo = useMemo(() => resumoEdital(ativo?.materias || []),[ativo])
  const modelos = useMemo(() => [...new Set((antigos || []).map(item => item.concurso).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[antigos])
  const modeloInfo = useMemo(() => modelosEditaisOficiais.find(item=>item.concurso===modeloSelecionado),[modeloSelecionado])

  useEffect(()=>{
    let cancelado=false
    try {
      const local=JSON.parse(window.localStorage.getItem(chavePreferencias)||'{}')
      if(Array.isArray(local.favoritos))setFavoritos(local.favoritos.filter(id=>typeof id==='string'))
      if(typeof local.selecionado==='string')setSelecionado(local.selecionado)
    } catch { /* Preferências locais antigas ou inválidas são ignoradas. */ }
    if(!client?.auth?.getUser)return undefined
    client.auth.getUser().then(({data,error})=>{
      if(cancelado||error||data?.user?.id!==userId)return
      const meta=data.user.user_metadata||{}
      if(Array.isArray(meta.ap_edital_favoritos))setFavoritos(meta.ap_edital_favoritos.filter(id=>typeof id==='string'))
      if(typeof meta.ap_edital_selecionado==='string')setSelecionado(meta.ap_edital_selecionado)
    }).catch(()=>{})
    return ()=>{cancelado=true}
  },[client,userId,chavePreferencias])

  async function salvarPreferencias(proximasFavoritas=favoritos,proximoSelecionado=selecionado) {
    const preferencia={favoritos:proximasFavoritas,selecionado:proximoSelecionado}
    try {window.localStorage.setItem(chavePreferencias,JSON.stringify(preferencia))} catch { /* O salvamento em conta continua sendo tentado. */ }
    if(!client?.auth?.getUser||!client?.auth?.updateUser)return false
    try {
      const {data,error}=await client.auth.getUser()
      if(error||data?.user?.id!==userId)return false
      const {error:erroAtualizacao}=await client.auth.updateUser({data:{...(data.user.user_metadata||{}),ap_edital_favoritos:proximasFavoritas,ap_edital_selecionado:proximoSelecionado}})
      return !erroAtualizacao
    } catch {return false}
  }

  async function alternarFavorito(id) {
    const proximos=favoritos.includes(id)?favoritos.filter(item=>item!==id):[...favoritos,id]
    setFavoritos(proximos)
    const salvo=await salvarPreferencias(proximos)
    setAviso(salvo?'Favorito salvo na sua conta.':'Favorito salvo neste dispositivo; sincronize quando estiver online.')
  }

  const carregar = useCallback(async (cancelado = () => false) => {
    setCarregando(true); setErro('')
    try {
      if(repositorioLocal) {
        const {rows,aviso:mensagem}=await repositorioLocal.listar()
        if(cancelado())return
        setEditais(rows);setAviso(mensagem);setSelecionado(atual=>rows.some(e=>e.id===atual)?atual:rows[0]?.id||'');return
      }
      const {data,error} = await client.from('editais_usuario').select('*').eq('user_id',userId).order('created_at',{ascending:true})
      if (error) throw error
      if (cancelado()) return
      setEditais(data || [])
      setSelecionado(atual => data?.some(e => e.id === atual) ? atual : data?.[0]?.id || '')
    } catch {
      if (!cancelado()) setErro('Não foi possível carregar seus editais. Verifique a conexão e tente novamente. Seus conteúdos não foram alterados.')
    } finally { if (!cancelado()) setCarregando(false) }
  }, [userId, client, repositorioLocal])

  useEffect(() => {
    let cancelado = false
    // eslint-disable-next-line react/set-state-in-effect -- Account-scoped network synchronization.
    carregar(() => cancelado)
    const reconectar=()=>{if(!cancelado)void carregar(()=>cancelado)}
    if(repositorioLocal)window.addEventListener('online',reconectar)
    return () => {cancelado = true;window.removeEventListener('online',reconectar)}
  }, [carregar,repositorioLocal])

  useEffect(() => { if (mostrarCatalogoOficial) void carregarAntigos() }, [])

  async function gravar(edital, novo = false) {
    if (bloqueio.current) return false
    bloqueio.current = true; setSalvando(true); setErro(''); setAviso('')
    try {
      if(repositorioLocal) {
        const {row,aviso:mensagem}=await repositorioLocal.gravar(edital,novo)
        setEditais(atuais=>[...atuais.filter(e=>e.id!==row.id),row]);setSelecionado(row.id);void salvarPreferencias(favoritos,row.id);setAviso(mensagem);return true
      }
      const payload = {titulo:edital.titulo.trim(), edicao:edital.edicao.trim(), unidade:edital.unidade.trim(), data_prova:edital.data_prova || null, materias:edital.materias, updated_at:new Date().toISOString()}
      const query = novo
        ? client.from('editais_usuario').insert({...payload,id:edital.id,user_id:userId})
        : client.from('editais_usuario').update(payload).eq('id',edital.id).eq('user_id',userId).eq('updated_at',edital.updated_at)
      const {data,error} = await query.select().single()
      if (error) throw error
      setEditais(atuais => novo ? [...atuais,data] : atuais.map(e => e.id === data.id ? data : e))
      setSelecionado(data.id); void salvarPreferencias(favoritos,data.id); setAviso('Alterações salvas na sua conta.')
      return true
    } catch {setErro('Não foi possível salvar. Confira a conexão ou recarregue se o edital foi alterado em outra aba. Seu rascunho continua no formulário.'); return false}
    finally {bloqueio.current = false; setSalvando(false)}
  }

  function escolher(id) {
    setSelecionado(id); setEditando(null); setConfigurando(false); setCriando(false)
    setBusca(''); setStatus(''); setPrioridade(''); setMateria(''); setConteudos(''); setErro(''); setAviso('')
    void salvarPreferencias(favoritos,id)
  }

  async function salvarConcurso(event) {
    event.preventDefault()
    if (editais.some(e => e.id !== (configurando ? ativo?.id : '') && identidadeEdital(e.titulo,e.edicao,e.unidade) === identidadeEdital(form.titulo,form.edicao,form.unidade))) {
      setErro('Este concurso já existe. Selecione-o para acrescentar os conteúdos.'); return
    }
    if (await gravar({...form,id:configurando ? ativo.id : novoIdEdital(),materias:configurando ? ativo.materias : []},!configurando)) {
      if (!configurando) {setBusca('');setStatus('');setPrioridade('');setMateria('');setConteudos('');setEditando(null)}
      setCriando(false); setConfigurando(false); setForm(vazio)
    }
  }

  let previa = null, erroPrevia = ''
  if (conteudos.trim() && (modo === 'varias' || materia.trim())) {
    try {previa = acrescentarConteudos(ativo?.materias || [], lerConteudosEdital(conteudos,modo === 'materia' ? materia : ''), () => '')}
    catch (e) {erroPrevia = e.message}
  }

  async function incluir(event) {
    event.preventDefault()
    try {
      const lote = acrescentarConteudos(ativo.materias,lerConteudosEdital(conteudos,modo === 'materia' ? materia : ''))
      if (!lote.adicionados) {setAviso(`Nenhum conteúdo novo. ${lote.repetidos} já constam neste edital.`); return}
      if (await gravar({...ativo,materias:lote.materias})) {
        setConteudos(''); setAviso(`${lote.adicionados} conteúdo(s) acrescentado(s). ${lote.repetidos} repetido(s) ignorado(s). O progresso existente foi preservado.`)
      }
    } catch (e) {setErro(e.message)}
  }

  async function atualizar(materiaId,topicoId,dados) {
    return gravar({...ativo,materias:alterarTopico(ativo.materias,materiaId,topicoId,dados)})
  }

  async function incluirDoPdf(grupos) {
    const lote=acrescentarConteudos(ativo.materias,grupos)
    if(!lote.adicionados)return false
    if(await gravar({...ativo,materias:lote.materias})) {
      setAviso(`${lote.adicionados} conteúdos do PDF acrescentados. O progresso e as outras matérias foram preservados.`)
      return true
    }
    return false
  }

  async function carregarAntigos() {
    setLendoAntigos(true); setErro('')
    try {
      const r = await fetchApi(`${API_URL}/api/editais`, {signal:AbortSignal.timeout(60000)})
      if (!r.ok) throw new Error()
      const data = await r.json()
      if (!Array.isArray(data)) throw new Error()
      const unicos = new Map()
      for (const item of [...linhasModelosEditais,...data]) {
        const chave = `${String(item.concurso||'').trim().toLocaleLowerCase('pt-BR')}|${String(item.materia||'').trim().toLocaleLowerCase('pt-BR')}|${String(item.conteudo||item.topico||'').trim().toLocaleLowerCase('pt-BR')}`
        if (!unicos.has(chave)) unicos.set(chave,item)
      }
      const combinados=[...unicos.values()]
      setAntigos(combinados)
      setModeloSelecionado(atual=>combinados.some(item=>item.concurso===atual)?atual:combinados.find(item=>item.concurso)?.concurso||'')
    } catch {setErro('Os modelos oficiais e seus editais pessoais continuam disponíveis. Não foi possível atualizar os modelos adicionais agora.')}
    finally {setLendoAntigos(false)}
  }

  async function copiar(concurso) {
    const materias = copiarEditalAntigo(antigos.filter(i => (i.concurso || 'Sem concurso') === concurso))
    if (!materias.length) {setErro('Este modelo não possui conteúdos identificados por matéria.'); return}
    if (editais.some(e => identidadeEdital(e.titulo,e.edicao,e.unidade) === identidadeEdital(concurso,'',''))) {
      setErro('Você já tem um edital com esse nome. Selecione-o para continuar estudando.'); return
    }
    if (await gravar({...vazio,id:novoIdEdital(),titulo:concurso,materias},true)) setAviso('Cópia pessoal criada. Os itens antigos foram preservados; seu acompanhamento começa como não iniciado.')
  }

  function exportar() {
    const blob = new Blob([JSON.stringify({versao:1,edital:ativo},null,2)],{type:'application/json'})
    const url = URL.createObjectURL(blob), a = document.createElement('a')
    a.href=url; a.download=`edital-${ativo.titulo.replace(/[^a-z0-9]/gi,'-')}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000)
  }

  return <section className="edital-planejador" aria-labelledby="titulo-editais">
    <header className="edital-cabecalho"><div><span className="edital-sobretitulo">Seu plano de estudos</span><h2 id="titulo-editais">Edital verticalizado</h2><p>Organize cada concurso em matérias e pequenos conteúdos. Estude, revise e acompanhe sua evolução.</p></div><button disabled={carregando || salvando} className="edital-primario" onClick={() => {setForm(vazio);setCriando(true);setConfigurando(false)}}>+ Novo concurso</button></header>
    <div className="edital-mensagem" aria-live="polite">{salvando ? 'Salvando alterações…' : aviso}</div>
    {erro && <div role="alert" className="edital-erro">{erro} <button onClick={() => carregar()} disabled={salvando}>Recarregar editais</button></div>}
    {carregando ? <p role="status">Carregando seus editais…</p> : <>
      {(criando || configurando) && <form onSubmit={salvarConcurso} className="edital-painel edital-form">
        <h3>{configurando ? 'Editar informações do concurso' : 'Crie seu edital pessoal'}</h3>
            <p>Use o nome do concurso e, se necessário, a edição e a unidade. Cada edital tem seu próprio progresso.</p>
        <div className="edital-campos"><label>Concurso<input required maxLength={150} placeholder="Ex.: CPOR" value={form.titulo} onChange={e => setForm({...form,titulo:e.target.value})} /></label><label>Edição<input maxLength={80} placeholder="Ex.: 2026" value={form.edicao} onChange={e => setForm({...form,edicao:e.target.value})} /></label><label>Unidade ou local<input maxLength={150} placeholder="Ex.: CPOR de São Paulo" value={form.unidade} onChange={e => setForm({...form,unidade:e.target.value})} /></label><label>Data da prova (opcional)<input type="date" value={form.data_prova || ''} onChange={e => setForm({...form,data_prova:e.target.value})} /></label></div>
        <div className="edital-acoes"><button disabled={salvando || !form.titulo.trim()} className="edital-primario">{configurando ? 'Salvar informações' : 'Criar edital'}</button><button type="button" onClick={() => {setCriando(false);setConfigurando(false)}}>Cancelar</button></div>
      </form>}
      {!!editais.length && <div className="edital-seletor"><label>Concurso em estudo<select disabled={salvando} value={selecionado} onChange={e => escolher(e.target.value)}>{[...editais].sort((a,b)=>Number(favoritos.includes(b.id))-Number(favoritos.includes(a.id))||String(a.titulo).localeCompare(String(b.titulo),'pt-BR')).map(e => <option key={e.id} value={e.id}>{favoritos.includes(e.id)?'★ ':''}{[e.titulo,e.edicao,e.unidade].filter(Boolean).join(' · ')}</option>)}</select></label><span>{favoritos.length?`${favoritos.length} favorito(s) · `:''}Seus editais e marcações são pessoais.</span></div>}
      {ativo ? <>
        <div className="edital-painel"><div className="edital-linha"><div><h3>{ativo.titulo} {ativo.edicao}</h3><p>{ativo.unidade}{ativo.data_prova ? ` · Prova em ${ativo.data_prova.split('-').reverse().join('/')}` : ''}</p></div><div className="edital-acoes"><button type="button" className="edital-favorito" aria-pressed={favoritos.includes(ativo.id)} onClick={()=>alternarFavorito(ativo.id)}>{favoritos.includes(ativo.id)?'★ Edital favorito':'☆ Favoritar edital'}</button><button disabled={salvando} onClick={() => {setForm({titulo:ativo.titulo,edicao:ativo.edicao,unidade:ativo.unidade,data_prova:ativo.data_prova || ''});setConfigurando(true);setCriando(false)}}>Editar concurso</button><button onClick={exportar}>Baixar cópia</button></div></div><Progresso materias={ativo.materias} /><div className="edital-indicadores"><span><strong>{ativo.materias.length}</strong> matérias</span><span><strong>{resumo.estudando}</strong> em estudo</span><span><strong>{resumo.revisar}</strong> para revisar</span><span><strong>{resumo.total-resumo.concluidos}</strong> ainda não concluídos</span></div></div>
        <details className="edital-painel edital-pdf" onToggle={e=>{if(e.currentTarget.open)setLeitorSolicitado(true)}}><summary>Importar e verticalizar um PDF de edital</summary>{leitorSolicitado && <Suspense fallback={<p>Carregando leitor de editais…</p>}><ImportarEditalPdf key={ativo.id} materiasExistentes={ativo.materias} onAdicionar={incluirDoPdf} disabled={salvando}/></Suspense>}</details>
        <details className="edital-painel edital-inclusao" open={!resumo.total || undefined}>
          <summary>+ Acrescentar matérias e conteúdos</summary>
          <form onSubmit={incluir} className="edital-form">
            <p>Cole os conteúdos do edital. A inclusão soma novos tópicos sem apagar matérias ou reiniciar marcações.</p>
            <div className="edital-acoes"><button type="button" aria-pressed={modo === 'materia'} onClick={() => setModo('materia')}>Uma matéria</button><button type="button" aria-pressed={modo === 'varias'} onClick={() => setModo('varias')}>Várias matérias</button></div>
            {modo === 'materia' ? <label>Matéria<input required list="materias-do-edital" maxLength={100} value={materia} placeholder="Escolha uma existente ou escreva uma nova" onChange={e => setMateria(e.target.value)} /><datalist id="materias-do-edital">{ativo.materias.map(m => <option key={m.id} value={m.nome} />)}</datalist></label> : <p>Escreva o nome de cada matéria seguido de <strong>:</strong> em uma linha própria. Abaixo, um conteúdo por linha. Use o exemplo apenas como modelo de organização, não como edital oficial.</p>}
            <label>Conteúdos<textarea rows={modo === 'varias' ? 10 : 6} required maxLength={150000} value={conteudos} onChange={e => setConteudos(e.target.value)} placeholder={modo === 'varias' ? exemplo : 'Um conteúdo por linha. Também pode separar por ponto e vírgula.'} /></label>
            {erroPrevia && <p className="edital-erro">{erroPrevia}</p>}
            {previa && <p role="status">Prévia: <strong>{previa.adicionados}</strong> novos conteúdos · {previa.repetidos} repetidos serão ignorados.</p>}
            <div className="edital-acoes"><button className="edital-primario" disabled={salvando || !previa?.adicionados}>Verticalizar e acrescentar</button></div>
          </form>
        </details>
        {!!resumo.total && <div className="edital-painel edital-filtros"><label>Buscar conteúdo<input type="search" placeholder="Pesquise tópicos ou anotações" value={busca} onChange={e => setBusca(e.target.value)} /></label><label>Etapa<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas</option><option value="pendentes">Ainda não concluídos</option>{Object.entries(STATUS_EDITAL).map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select></label><label>Prioridade<select value={prioridade} onChange={e => setPrioridade(e.target.value)}><option value="">Todas</option><option value="alta">Alta</option><option value="normal">Normal</option></select></label><button type="button" onClick={() => {setBusca('');setStatus('');setPrioridade('')}}>Limpar filtros</button></div>}
        {ativo.materias.map(m => {
          const visiveis = m.topicos.filter(t => topicoVisivel(t,busca,status,prioridade)), r = resumoEdital([m])
          if (!visiveis.length && (busca || status || prioridade)) return null
          const aberta = abertas[m.id] !== false
          return <section className="edital-painel edital-materia" key={m.id}>
            <button className="edital-materia-titulo" aria-expanded={aberta} onClick={() => setAbertas({...abertas,[m.id]:!aberta})}><span>{aberta ? '▾' : '▸'} {m.nome}</span><span>{r.concluidos}/{r.total} · {r.percentual}%</span></button>
            <Progresso materias={[m]} />
            {aberta && <><p className="edital-ajuda">Marque o que já estudou. Use “Revisar” para conteúdos que precisam de reforço. O sinal de prática considera suas respostas recentes, mas não substitui uma avaliação completa.</p><ol className="edital-topicos">{visiveis.map(t => {const pratica=estatisticaPratica(m.nome,t.titulo,historicoRespostas);const incidencia=chavePratica(t.incidencia);return <li key={t.id} className={t.status === 'concluido' ? 'edital-concluido' : ''}>
            <div className="edital-topico"><label className="edital-check"><input type="checkbox" disabled={salvando} checked={t.status === 'concluido'} onChange={() => atualizar(m.id,t.id,{status:t.status === 'concluido' ? 'pendente' : 'concluido'})} /><span>{t.titulo}</span></label><div className="edital-topico-acoes"><select disabled={salvando} aria-label={`Etapa de ${t.titulo}`} value={t.status} onChange={e => atualizar(m.id,t.id,{status:e.target.value})}>{Object.entries(STATUS_EDITAL).map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select><button className={t.prioridade === 'alta' ? 'edital-alta' : ''} aria-pressed={t.prioridade === 'alta'} disabled={salvando} title="Alternar prioridade" onClick={() => atualizar(m.id,t.id,{prioridade:t.prioridade === 'alta' ? 'normal' : 'alta'})}>{t.prioridade === 'alta' ? '★ Alta' : '☆ Prioridade'}</button><button disabled={salvando} onClick={() => setEditando({materiaId:m.id,...t})} aria-label={`Editar ${t.titulo}`}>Editar</button></div></div>
              <div className="edital-study-signal"><span className="edital-incidencia" data-level={incidencia.startsWith('alt')?'alta':incidencia.startsWith('med')?'media':incidencia.startsWith('bai')?'baixa':''}>{t.incidencia ? `Incidência ${t.incidencia}` : 'Incidência não informada no modelo'}</span><span>{pratica.total ? `${pratica.total} questão(ões) vinculadas · ${pratica.percentual}% de acerto · ${pratica.total>=20&&pratica.percentual>=80?'boa consistência recente':pratica.total>=10?'em desenvolvimento':'pratique mais para avaliar'}` : 'Ainda sem respostas vinculadas a este conteúdo'}</span>{onPraticar && <button type="button" className="edital-praticar" onClick={()=>onPraticar(m.nome,t.titulo)}>Praticar este conteúdo</button>}</div>
              {t.notas && <p className="edital-nota">{t.notas}</p>}
              {t.fonte_pdf && <p className="edital-nota">PDF: {t.fonte_pdf.arquivo} · página {t.fonte_pdf.pagina}{t.fonte_pdf.pagina_fim!==t.fonte_pdf.pagina ? `–${t.fonte_pdf.pagina_fim}` : ''}{t.fonte_pdf.ocr ? ' · OCR' : ''}</p>}
              {editando?.id === t.id && <form className="edital-edicao edital-form" onSubmit={async e => {e.preventDefault(); if (await atualizar(m.id,t.id,{titulo:editando.titulo.trim(),notas:editando.notas.trim()})) setEditando(null)}}><label>Conteúdo<input required maxLength={1500} value={editando.titulo} onChange={e => setEditando({...editando,titulo:e.target.value})} /></label><label>Minhas anotações<textarea rows={3} maxLength={5000} placeholder="O que revisar, materiais, páginas, dúvidas…" value={editando.notas} onChange={e => setEditando({...editando,notas:e.target.value})} /></label><div className="edital-acoes"><button className="edital-primario" disabled={salvando || !editando.titulo.trim()}>Salvar tópico</button><button type="button" onClick={() => setEditando(null)}>Cancelar</button><button type="button" disabled={salvando} className="edital-perigo" onClick={async () => {if (window.confirm(`Excluir apenas o tópico “${t.titulo}”? Os outros conteúdos serão mantidos.`) && await gravar({...ativo,materias:ativo.materias.map(mm => mm.id === m.id ? {...mm,topicos:mm.topicos.filter(tt => tt.id !== t.id)} : mm)})) setEditando(null)}}>Excluir tópico</button></div></form>}
            </li>})}</ol><div className="edital-acoes"><button disabled={salvando} onClick={() => {setModo('materia');setMateria(m.nome);document.querySelector('.edital-inclusao')?.setAttribute('open','');document.querySelector('.edital-inclusao')?.scrollIntoView({behavior:'smooth',block:'start'})}}>+ Conteúdos em {m.nome}</button></div></>}
          </section>
        })}
        {!!resumo.total && !ativo.materias.some(m => m.topicos.some(t => topicoVisivel(t,busca,status,prioridade))) && <p className="edital-painel">Nenhum conteúdo corresponde aos filtros. Limpe-os para ver os demais tópicos.</p>}
        {!resumo.total && <div className="edital-vazio"><h3>Seu edital está pronto para receber conteúdos</h3><p>Abra “Acrescentar matérias e conteúdos”, escolha uma matéria ou cole várias e verticalize. Depois, acompanhe cada tópico na lista.</p></div>}
      </> : !criando && <div className="edital-vazio"><h3>Qual concurso você está estudando?</h3><p>Crie um edital, como CPOR 2026, e inclua as matérias do seu programa. Cada concurso terá seu próprio acompanhamento.</p><button className="edital-primario" onClick={() => {setForm(vazio);setCriando(true)}}>Criar meu primeiro edital</button></div>}
      {mostrarCatalogoOficial && <section className="edital-painel edital-modelo-pronto"><h3>Começar por um modelo de edital</h3><p>Escolha uma matriz para criar seu acompanhamento pessoal. Os tópicos e marcações ficam na sua conta; modelos transcritos de fichas enviadas estão identificados como referência e não alteram o documento compartilhado.</p><div className="edital-seletor"><label>Concurso, vestibular ou edição<select disabled={salvando || !modelos.length} value={modeloSelecionado} onChange={e=>setModeloSelecionado(e.target.value)}><option value="">Selecione um modelo</option>{modelos.map(modelo=><option key={modelo} value={modelo}>{modelo} · {antigos.filter(item=>item.concurso===modelo).length} conteúdos</option>)}</select></label><button className="edital-primario" disabled={salvando || !modeloSelecionado} onClick={()=>copiar(modeloSelecionado)}>Adicionar à minha área</button><button disabled={lendoAntigos} onClick={carregarAntigos}>{lendoAntigos?'Atualizando…':'Atualizar modelos'}</button></div>{modeloInfo && <div className="edital-modelo-fonte"><strong>{modeloInfo.categoria}{modeloInfo.ano?` · Edição ${modeloInfo.ano}`:''}</strong><p>{modeloInfo.observacao}</p>{modeloInfo.fonte && <a href={modeloInfo.fonte} target="_blank" rel="noreferrer">Consultar programa ou documento oficial ↗</a>}</div>}{antigos && !modelos.length && <p role="status">Nenhum modelo está disponível agora. Você ainda pode criar seu edital manualmente ou importar o PDF oficial.</p>}</section>}
    </>}
  </section>
}
