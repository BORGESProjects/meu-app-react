import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [tarefas, setTarefas] = useState([])
  const [novaTarefa, setNovaTarefa] = useState('')

  // Buscar tarefas salvas no banco assim que abre o app
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

    const { error } = await supabase
      .from('tarefas')
      .insert([{ texto: novaTarefa }])

    if (error) {
      console.log('Erro ao salvar:', error)
    } else {
      setNovaTarefa('')
      buscarTarefas() // Recarrega a lista
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>📝 Lista de Tarefas (Full-Stack)</h1>
      
      <form onSubmit={adicionarTarefa} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Digite algo para salvar no banco..."
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Salvar
        </button>
      </form>

      <ul>
        {tarefas.map((item) => (
          <li key={item.id} style={{ marginBottom: '8px', fontSize: '18px' }}>
            {item.texto}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App