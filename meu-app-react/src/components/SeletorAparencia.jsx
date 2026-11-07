import {useEffect, useState} from 'react'

const CHAVE = 'ap-aprovado:aparencia:v1'
const padrao = {tema:'classico',modo:'escuro',motivo:'medicina'}
const motivos = [
  {id:'medicina',nome:'Medicina',icone:'⚕'},
  {id:'engenharia',nome:'Engenharia',icone:'⌘'},
  {id:'direito',nome:'Direito',icone:'⚖'},
]

function lerPreferencia() {
  try {
    const valor = JSON.parse(window.localStorage.getItem(CHAVE) || 'null')
    return {
      tema: valor?.tema === 'vestibular' ? 'vestibular' : 'classico',
      modo: valor?.modo === 'claro' ? 'claro' : 'escuro',
      motivo: motivos.some(item => item.id === valor?.motivo) ? valor.motivo : padrao.motivo,
    }
  } catch { return padrao }
}

export default function SeletorAparencia() {
  const [preferencia,setPreferencia] = useState(lerPreferencia)
  const [aberto,setAberto] = useState(false)
  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.colorMode = preferencia.modo
    raiz.dataset.studyTheme = preferencia.tema
    raiz.dataset.studyMotif = preferencia.tema === 'vestibular' ? preferencia.motivo : ''
    raiz.style.setProperty('--study-motif-glyph', JSON.stringify(motivoGlyph(preferencia.motivo)))
    try { window.localStorage.setItem(CHAVE,JSON.stringify(preferencia)) } catch { /* A aparência continua aplicada nesta sessão. */ }
  },[preferencia])

  function atualizar(chave,valor) { setPreferencia(atual => ({...atual,[chave]:valor})) }
  const motivo = motivos.find(item => item.id === preferencia.motivo) || motivos[0]

  return <div className="appearance-control relative z-[60] self-start xl:self-auto">
    <button type="button" aria-expanded={aberto} aria-controls="appearance-panel" onClick={()=>setAberto(value=>!value)} className="appearance-trigger inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2">
      <span aria-hidden="true">{preferencia.modo === 'escuro' ? '◐' : '☼'}</span><span>Aparência</span><span className="appearance-trigger-summary">{preferencia.tema === 'classico' ? 'Clássico' : motivo.nome}</span>
    </button>
    {aberto&&<section id="appearance-panel" aria-label="Preferências de aparência" className="appearance-panel absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold">Personalize seu espaço</h2><p className="mt-1 text-xs opacity-75">Sua escolha fica salva neste dispositivo.</p></div><button type="button" aria-label="Fechar aparência" onClick={()=>setAberto(false)} className="rounded-lg px-2 py-1 text-sm opacity-70 hover:opacity-100">×</button></div>
      <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">Estilo</legend><div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={preferencia.tema==='classico'} onClick={()=>atualizar('tema','classico')} className={`appearance-option ${preferencia.tema==='classico'?'is-active':''}`}><span className="appearance-preview classic-preview" aria-hidden="true">A·P</span><span><strong>Clássico</strong><small>Estudo direto</small></span></button>
        <button type="button" aria-pressed={preferencia.tema==='vestibular'} onClick={()=>atualizar('tema','vestibular')} className={`appearance-option ${preferencia.tema==='vestibular'?'is-active':''}`}><span className="appearance-preview vestibular-preview" aria-hidden="true">✦</span><span><strong>Vestibular</strong><small>Visual futurista</small></span></button>
      </div></fieldset>
      <fieldset className="mt-4"><legend className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">Visibilidade</legend><div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={preferencia.modo==='escuro'} onClick={()=>atualizar('modo','escuro')} className={`appearance-mode ${preferencia.modo==='escuro'?'is-active':''}`}><span aria-hidden="true">◐</span><span><strong>Escuro</strong><small>Foco máximo</small></span></button>
        <button type="button" aria-pressed={preferencia.modo==='claro'} onClick={()=>atualizar('modo','claro')} className={`appearance-mode ${preferencia.modo==='claro'?'is-active':''}`}><span aria-hidden="true">☼</span><span><strong>Claro</strong><small>Maior visibilidade</small></span></button>
      </div></fieldset>
      {preferencia.tema==='vestibular'&&<fieldset className="mt-4"><legend className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">Marca d’água temática</legend><div className="grid grid-cols-3 gap-2">{motivos.map(item=><button key={item.id} type="button" aria-pressed={preferencia.motivo===item.id} onClick={()=>atualizar('motivo',item.id)} className={`appearance-motif ${preferencia.motivo===item.id?'is-active':''}`}><span aria-hidden="true">{item.icone}</span><small>{item.nome}</small></button>)}</div></fieldset>}
    </section>}
  </div>
}

function motivoGlyph(id) { return motivos.find(item => item.id === id)?.icone || motivos[0].icone }
