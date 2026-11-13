import { useMemo, useState } from 'react'
import { concursosAbertos, concursosMonitorados, dataCatalogoConcursos } from '../data/concursosAbertos'
import './Concursos.css'

const catalogoConcursos = [...concursosAbertos, ...concursosMonitorados]

const dataLocal = (iso) => {
  if (!iso) return null
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}
const formatarData = (iso) => dataLocal(iso)?.toLocaleDateString('pt-BR') || 'Não informado'
const hojeISO = () => {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}
function statusConcurso(item, hoje) {
  if (item.etapa === 'monitoramento') return { chave: 'monitoramento', texto: item.monitorTexto || 'Acompanhar fontes oficiais' }
  if (item.etapa === 'encerrado') return { chave: 'encerrado', texto: item.monitorTexto || 'Concurso concluído' }
  if (item.etapa === 'autorizado') return { chave: 'autorizado', texto: 'Concurso autorizado' }
  if (item.etapa === 'previsto') return { chave: 'previsto', texto: 'Previsão em acompanhamento' }
  if (!item.inicioInscricao || !item.fimInscricao) return { chave: 'previsto', texto: 'Cronograma não publicado' }
  if (hoje < item.inicioInscricao) return { chave: 'futuro', texto: 'Inscrições em breve' }
  if (hoje <= item.fimInscricao) return { chave: 'aberto', texto: 'Inscrições abertas' }
  return { chave: 'encerrado', texto: 'Inscrições encerradas' }
}
const opcoesUnicas = (campo) => [...new Set(catalogoConcursos.map(item => item[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
const lerChecklist = () => { try { return JSON.parse(localStorage.getItem('ap-concursos-checklist-v1') || '{}') } catch { return {} } }
const siglaVisual = (item) => item.sigla || item.orgao.split(/\s+/).filter(palavra => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(palavra)).slice(0, 3).map(palavra => palavra[0]).join('').toUpperCase()

function IconeConcurso({ item }) {
  const texto = `${item.carreira} ${item.orgao} ${item.titulo}`.toLocaleLowerCase('pt-BR')
  const tipo = /policial|segurança|polícia|militar/.test(texto) ? 'shield'
    : /judici|tribunal|justiça/.test(texto) ? 'court'
      : /banc|escriturário|banco central/.test(texto) ? 'bank'
        : /educa|professor|universidade|instituto federal/.test(texto) ? 'book'
          : /estatística|pesquisa|recenseador|ibge/.test(texto) ? 'chart'
            : /transporte|metroferroviário|metrô/.test(texto) ? 'rail'
              : 'public'
  const desenho = {
    shield: <><path d="M12 3 20 6v5c0 4.5-3.2 8-8 10-4.8-2-8-5.5-8-10V6z"/><path d="m12 7 1.1 2.4 2.6.3-1.9 1.7.5 2.6-2.3-1.3-2.3 1.3.5-2.6-1.9-1.7 2.6-.3z"/></>,
    court: <><path d="m3 8 9-5 9 5H3Zm1 12h16M5 9v8m4-8v8m6-8v8m4-8v8M3 18h18"/></>,
    bank: <><path d="m3 8 9-5 9 5H3Zm1 12h16M5 9v8m4-8v8m6-8v8m4-8v8M3 18h18"/><path d="M12 11v3"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8m-8 3h7"/></>,
    chart: <><path d="M4 20V5m0 15h17"/><path d="m7 15 4-4 3 2 5-6"/><circle cx="7" cy="15" r=".7"/><circle cx="11" cy="11" r=".7"/><circle cx="14" cy="13" r=".7"/><circle cx="19" cy="7" r=".7"/></>,
    rail: <><path d="M7 3h10a3 3 0 0 1 3 3v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a3 3 0 0 1 3-3Z"/><path d="M7 8h10m-9 5h.01M16 13h.01M8 19l-2 2m10-2 2 2M9 16l-2 3m8-3 2 3"/></>,
    public: <><path d="M3 9h18L12 4 3 9Zm2 2v7m4-7v7m6-7v7m4-7v7M3 20h18m-20 0h2"/></>,
  }[tipo]
  return <span className={`contest-emblem emblem-${tipo}`} aria-label={`${item.orgao} — ${siglaVisual(item)}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{desenho}</svg>
    <span>{siglaVisual(item)}</span>
  </span>
}

function trilhaPreparacao(item) {
  if (item.verticalizacao?.length) return item.verticalizacao
  const carreira = `${item.carreira} ${item.titulo}`.toLocaleLowerCase('pt-BR')
  const especificos = /policial|polícia|militar/.test(carreira)
    ? ['Direito Constitucional e Administrativo', 'Direito Penal e legislação especial conforme a carreira', 'Direitos Humanos e legislação estadual ou federal']
    : /judici|tribunal|justiça/.test(carreira)
      ? ['Direito Constitucional e Administrativo', 'Direito material e processual da área do tribunal', 'Regimento interno e legislação institucional']
      : /banc|escriturário/.test(carreira)
        ? ['Sistema financeiro e conhecimentos bancários', 'Matemática financeira, atendimento e vendas', 'Tecnologia ou conhecimentos comerciais conforme o cargo']
        : /educa|professor/.test(carreira)
          ? ['Legislação educacional e políticas públicas', 'Didática, planejamento e avaliação', 'Conteúdo específico da disciplina ou função']
          : ['Legislação e conhecimentos específicos do órgão', 'Requisitos e atribuições do cargo escolhido', 'Conteúdo técnico indicado no edital da função']
  return [
    { materia: 'Base comum — revisar conforme o edital', topicos: ['Língua Portuguesa e interpretação de textos', 'Raciocínio lógico e matemática aplicada quando previstos', 'Noções de informática e atualidades conforme o perfil da seleção'] },
    { materia: 'Conteúdos específicos — trilha inicial', topicos: especificos },
  ]
}

export default function Concursos({ onPraticar }) {
  const [selecionado, setSelecionado] = useState(null)
  const [busca, setBusca] = useState('')
  const [carreira, setCarreira] = useState('')
  const [esfera, setEsfera] = useState('')
  const [uf, setUf] = useState('')
  const [nivel, setNivel] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [revisao, setRevisao] = useState(0)
  const [checklist, setChecklist] = useState(lerChecklist)
  const alternarTopico = (id, chave) => setChecklist(atual => {
    const novo = { ...atual, [id]: { ...(atual[id] || {}), [chave]: !atual[id]?.[chave] } }
    try { localStorage.setItem('ap-concursos-checklist-v1', JSON.stringify(novo)) } catch {}
    return novo
  })
  const hoje = hojeISO()
  const lista = useMemo(() => catalogoConcursos.filter(item => {
    const status = statusConcurso(item, hoje).chave
    const texto = `${item.orgao} ${item.titulo} ${item.banca} ${item.cargos} ${item.uf} ${item.carreira}`.toLocaleLowerCase('pt-BR')
    const filtroDirecionado = Boolean(busca.trim() || carreira || esfera || uf || nivel)
    return (!busca || texto.includes(busca.trim().toLocaleLowerCase('pt-BR')))
      && (!carreira || item.carreira === carreira)
      && (!esfera || item.esfera === esfera)
      && (!uf || item.uf === uf)
      && (!nivel || item.escolaridades.includes(nivel))
      && (statusFiltro ? status === statusFiltro : status !== 'monitoramento' || filtroDirecionado)
  }).sort((a, b) => statusConcurso(a, hoje).chave.localeCompare(statusConcurso(b, hoje).chave, 'pt-BR') || a.orgao.localeCompare(b.orgao, 'pt-BR')), [busca, carreira, esfera, uf, nivel, statusFiltro, hoje, revisao])
  const quantidadeAbertos = catalogoConcursos.filter(item => statusConcurso(item, hoje).chave === 'aberto').length
  const quantidadeProximos = catalogoConcursos.filter(item => ['futuro', 'autorizado', 'previsto'].includes(statusConcurso(item, hoje).chave)).length
  const quantidadeMonitorados = catalogoConcursos.filter(item => statusConcurso(item, hoje).chave === 'monitoramento').length

  if (selecionado) {
    const item = catalogoConcursos.find(concurso => concurso.id === selecionado)
    const status = statusConcurso(item, hoje)
    const trilha = trilhaPreparacao(item)
    return <main className="concursos-page">
      <button className="concursos-back" type="button" onClick={() => setSelecionado(null)}>← Todos os concursos</button>
      <div className="concursos-breadcrumb">AP Aprovado <span>/</span> Concursos <span>/</span> <strong>{item.orgao}</strong></div>
      <header className="concursos-detail-heading">
        <p>Concurso · {item.esfera} · {item.uf === 'BR' ? 'Nacional' : item.uf}</p>
        <h1>{item.titulo}</h1>
        <span className={`contest-status status-${status.chave}`}><i />{status.texto}</span>
      </header>
      <div className="concursos-detail-grid">
        <section className="contest-panel contest-overview">
          <div className="contest-section-title"><h2>Informações gerais</h2><span>Fonte conferida em {formatarData(dataCatalogoConcursos)}</span></div>
          <p>{item.resumo}</p>
          <p>{item.cargos}</p>
          <p>Inscrições: <strong>{formatarData(item.inicioInscricao)} a {formatarData(item.fimInscricao)}</strong>{item.prova && <> · Prova prevista: <strong>{formatarData(item.prova)}</strong></>}</p>
          <p>Concorrência candidato/vaga: <strong>{item.concorrencia ?? 'Ainda não divulgada oficialmente'}</strong></p>
          <div className="contest-actions">
            {item.editalUrl && <a className="contest-primary" href={item.editalUrl} target="_blank" rel="noreferrer">Consultar edital ou página oficial ↗</a>}
            {item.inscricaoUrl && <a className="contest-secondary" href={item.inscricaoUrl} target="_blank" rel="noreferrer">Página de inscrição ↗</a>}
            <button className="contest-secondary" type="button" onClick={() => onPraticar?.(item)}>Praticar questões relacionadas →</button>
          </div>
        </section>
        <aside className="contest-side">
          <section className="contest-panel"><h2>Resumo do concurso</h2><p>Acompanhe os dados publicados no edital</p>
            <dl><div><dt>Vagas</dt><dd>{item.vagasTexto}</dd></div><div><dt>Remuneração</dt><dd>{item.salarioTexto}</dd></div><div><dt>Cargos</dt><dd>{item.carreira}</dd></div><div><dt>Escolaridade</dt><dd>{item.escolaridades.join(', ')}</dd></div><div><dt>Banca</dt><dd>{item.banca}</dd></div><div><dt>Prazo de inscrição</dt><dd>{formatarData(item.fimInscricao)}</dd></div></dl>
          </section>
          <section className="contest-panel contest-links"><h2>Prepare-se</h2><p>Atalhos para continuar seus estudos</p>
            <button type="button" onClick={() => onPraticar?.(item)}>Questões relacionadas ↗</button>{item.editalUrl && <a href={item.editalUrl} target="_blank" rel="noreferrer">Edital e atualizações oficiais ↗</a>}{item.fonteUrl && <a href={item.fonteUrl} target="_blank" rel="noreferrer">Fonte do resumo ↗</a>}
            {!item.editalUrl && <p className="contest-source-note">Esta ficha monitora uma carreira; consulte o site da instituição e o Diário Oficial para verificar novos atos.</p>}
          </section>
        </aside>
      </div>
      <section className="contest-panel contest-syllabus">
        <div className="contest-section-title"><div><p className="contest-kicker">PLANO DE PREPARAÇÃO</p><h2>Conteúdo verticalizado</h2></div><span>Seu progresso fica salvo neste dispositivo</span></div>
        <p className="syllabus-note">{item.notaVerticalizacao || 'Confira o conteúdo programático e as retificações do edital oficial antes de fechar sua preparação.'}</p>
        {trilha.map((grupo, grupoIndex) => <section className="syllabus-group" key={`${item.id}-${grupo.materia}`}>
          <h3>{grupo.materia}</h3>
          <ul>{grupo.topicos.map((topico, topicoIndex) => {
            const chave = `${grupoIndex}-${topicoIndex}`
            return <li key={chave}><label><input type="checkbox" checked={Boolean(checklist[item.id]?.[chave])} onChange={() => alternarTopico(item.id, chave)} /><span>{topico}</span></label></li>
          })}</ul>
        </section>)}
      </section>
      <p className="concursos-footnote">Prazos e dados podem mudar por retificação. A página oficial e o edital vigente são as referências finais; a concorrência só é exibida quando publicada pela organização.</p>
    </main>
  }

  return <main className="concursos-page">
    <header className="concursos-hero">
      <div><p className="concursos-eyebrow">OPORTUNIDADES PÚBLICAS</p><h1>Concursos em foco</h1><p>Encontre editais, vagas e caminhos de preparação em órgãos de todo o país.</p></div>
      <div className="concursos-counters"><div className="concursos-counter"><strong>{quantidadeAbertos}</strong><span>com inscrições abertas<br/>nesta seleção</span></div><div className="concursos-counter"><strong>{quantidadeProximos}</strong><span>autorizados ou<br/>com inscrições futuras</span></div><div className="concursos-counter"><strong>{quantidadeMonitorados}</strong><span>carreiras e órgãos<br/>em monitoramento</span></div></div>
    </header>
    <section className="concursos-toolbar" aria-label="Filtros de concursos">
      <label className="contest-search"><span aria-hidden="true">⌕</span><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Busque por órgão, cargo, banca ou estado" aria-label="Buscar concursos" /></label>
      <select value={carreira} onChange={e => setCarreira(e.target.value)} aria-label="Filtrar por carreira"><option value="">Todas as carreiras</option>{opcoesUnicas('carreira').map(value => <option key={value}>{value}</option>)}</select>
      <select value={esfera} onChange={e => setEsfera(e.target.value)} aria-label="Filtrar por esfera"><option value="">Todas as esferas</option>{opcoesUnicas('esfera').map(value => <option key={value}>{value}</option>)}</select>
      <select value={uf} onChange={e => setUf(e.target.value)} aria-label="Filtrar por estado"><option value="">Todo o país</option>{opcoesUnicas('uf').map(value => <option key={value} value={value}>{value === 'BR' ? 'Nacional' : value}</option>)}</select>
      <select value={nivel} onChange={e => setNivel(e.target.value)} aria-label="Filtrar por escolaridade"><option value="">Todos os níveis</option>{['Fundamental','Médio','Técnico','Superior'].map(value => <option key={value}>{value}</option>)}</select>
      <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} aria-label="Filtrar por situação"><option value="">Editais e concursos cadastrados</option><option value="aberto">Inscrições abertas</option><option value="futuro">Edital publicado · inscrição futura</option><option value="autorizado">Concurso autorizado</option><option value="previsto">Previsão em acompanhamento</option><option value="encerrado">Inscrições encerradas ou concluídas</option><option value="monitoramento">Carreiras e órgãos em monitoramento</option></select>
      <button className="contest-refresh" type="button" onClick={() => setRevisao(value => value + 1)} title="Recalcula prazos cadastrados; confira retificações na fonte oficial">↻ <span>Recalcular prazos</span></button>
    </section>
    <div className="concursos-results"><h2>{statusFiltro === 'monitoramento' ? 'Radar nacional de carreiras' : 'Concursos por oportunidade'}</h2><span>{lista.length} resultado{lista.length === 1 ? '' : 's'} · catálogo conferido em {formatarData(dataCatalogoConcursos)}</span></div>
    {lista.length ? <section className="concursos-cards">{lista.map(item => {
      const status = statusConcurso(item, hoje)
      return <article className="contest-card" key={item.id}>
        <div className="contest-card-top"><IconeConcurso item={item} /><span className={`contest-status status-${status.chave}`}><i />{status.texto}</span></div>
        <p className="contest-orgao">{item.orgao}</p><h3>{item.titulo}</h3>
        <div className="contest-tags">{item.escolaridades.map(value => <span key={value}>{value}</span>)}<span>{item.uf === 'BR' ? 'Nacional' : item.uf}</span></div>
        <p className="contest-salary"><span>Remuneração</span><strong>{item.salarioTexto}</strong></p>
        <div className="contest-card-meta"><span>Vagas</span><strong>{item.vagasTexto}</strong></div>
        <div className="contest-card-meta"><span>Inscrições até</span><strong>{formatarData(item.fimInscricao)}</strong></div>
        <button type="button" className="contest-card-link" onClick={() => setSelecionado(item.id)}>Ver detalhes e questões <span aria-hidden="true">→</span></button>
      </article>
    })}</section> : <div className="contest-empty">Nenhum concurso corresponde a esses filtros. Ajuste a busca ou escolha outra situação.</div>}
    <footer className="concursos-footnote">Os prazos dos editais publicados são recalculados localmente, mas esta lista não consulta automaticamente todos os portais. As fichas de monitoramento são referências de carreira, não confirmação de edital aberto. Confira a instituição e o diário oficial antes de se inscrever; concorrência não publicada aparece como “Ainda não divulgada oficialmente”.</footer>
  </main>
}

