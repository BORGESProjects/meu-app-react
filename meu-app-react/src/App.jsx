import { useState } from 'react'

function App() {
  // Criando um "Estado" (uma variável que o React monitora para atualizar a tela automaticamente)
  const [contador, setContador] = useState(0)

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Meu Primeiro App em React</h1>
      <p>Você clicou no botão <strong>{contador}</strong> vezes.</p>

      <button 
        onClick={() => setContador(contador + 1)}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Aumentar
      </button>

      <button 
        onClick={() => setContador(0)}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginLeft: '10px' }}
      >
        Zerar
      </button>
    </div>
  )
}

export default App