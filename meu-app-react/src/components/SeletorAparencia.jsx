import {useEffect, useState} from 'react'

const CHAVE = 'ap-aprovado:aparencia:v1'
const padrao = {tema:'classico',modo:'escuro'}

function lerPreferencia() {
  try {
    const valor = JSON.parse(window.localStorage.getItem(CHAVE) || 'null')
    return {
      tema: ['vestibular','multidisciplinar'].includes(valor?.tema) ? 'multidisciplinar' : 'classico',
      modo: valor?.modo === 'claro' ? 'claro' : 'escuro',
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
    raiz.dataset.studyMotif = preferencia.tema === 'multidisciplinar' ? 'conjunto' : ''
    try { window.localStorage.setItem(CHAVE,JSON.stringify(preferencia)) } catch { /* A aparência continua aplicada nesta sessão. */ }
  },[preferencia])

  function atualizar(chave,valor) { setPreferencia(atual => ({...atual,[chave]:valor})) }

  return <div className="appearance-control relative z-[60] self-start xl:self-auto">
    <button type="button" aria-expanded={aberto} aria-controls="appearance-panel" onClick={()=>setAberto(value=>!value)} className="appearance-trigger inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2">
      <span aria-hidden="true">{preferencia.modo === 'escuro' ? '◐' : '☼'}</span><span>Aparência</span><span className="appearance-trigger-summary">{preferencia.tema === 'classico' ? 'Clássico' : 'Multidisciplinar'}</span>
    </button>
    {aberto&&<section id="appearance-panel" aria-label="Preferências de aparência" className="appearance-panel absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold">Personalize seu espaço</h2><p className="mt-1 text-xs opacity-75">Sua escolha fica salva neste dispositivo.</p></div><button type="button" aria-label="Fechar aparência" onClick={()=>setAberto(false)} className="rounded-lg px-2 py-1 text-sm opacity-70 hover:opacity-100">×</button></div>
      <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">Estilo</legend><div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={preferencia.tema==='classico'} onClick={()=>atualizar('tema','classico')} className={`appearance-option ${preferencia.tema==='classico'?'is-active':''}`}><span className="appearance-preview classic-preview" aria-hidden="true">A·P</span><span><strong>Clássico</strong><small>Estudo direto</small></span></button>
        <button type="button" aria-pressed={preferencia.tema==='multidisciplinar'} onClick={()=>atualizar('tema','multidisciplinar')} className={`appearance-option ${preferencia.tema==='multidisciplinar'?'is-active':''}`}><span className="appearance-preview multidisciplinar-preview" aria-hidden="true">✦</span><span><strong>Multidisciplinar</strong><small>Visual futurista para qualquer foco</small></span></button>
      </div></fieldset>
      <fieldset className="mt-4"><legend className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">Visibilidade</legend><div className="grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={preferencia.modo==='escuro'} onClick={()=>atualizar('modo','escuro')} className={`appearance-mode ${preferencia.modo==='escuro'?'is-active':''}`}><span aria-hidden="true">◐</span><span><strong>Escuro</strong><small>Foco máximo</small></span></button>
        <button type="button" aria-pressed={preferencia.modo==='claro'} onClick={()=>atualizar('modo','claro')} className={`appearance-mode ${preferencia.modo==='claro'?'is-active':''}`}><span aria-hidden="true">☼</span><span><strong>Claro</strong><small>Maior visibilidade</small></span></button>
      </div></fieldset>
      {preferencia.tema==='multidisciplinar'&&<p className="mt-4 rounded-xl border border-current/10 bg-black/[0.04] p-3 text-xs leading-relaxed opacity-75">O estilo Multidisciplinar combina referências sutis a medicina, engenharia, direito e computação no mesmo fundo.</p>}
    </section>}
  </div>
}

