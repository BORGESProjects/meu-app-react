import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [tarefas, setTarefas] = useState([])
  const [novaTarefa, setNovaTarefa] = useState('')
  const [loading, setLoading] = useState(false)

  // Buscar tarefas no Supabase assim que abre a página
  useEffect(() => {
    buscarTarefas()
  }, [])

  async function buscarTarefas() {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.log('Erro ao buscar:', error)
    else setTarefas(data)
  }

  async function adicionarTarefa(e) {
    e.preventDefault()
    if (!novaTarefa.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from('tarefas')
      .insert([{ texto: novaTarefa }])

    if (error) {
      console.log('Erro ao salvar:', error)
    } else {
      setNovaTarefa('')
      await buscarTarefas()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-400">⚡ Minhas Tarefas</h1>
          <p className="text-sm text-slate-400 mt-1">Conectado ao Supabase em tempo real</p>
        </header>

        <form onSubmit={adicionarTarefa} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Digite uma nova tarefa..."
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-slate-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>

        <div className="space-y-2">
          {tarefas.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">Nenhuma tarefa encontrada.</p>
          ) : (
            tarefas.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-slate-200"
              >
                <span>{item.texto}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App