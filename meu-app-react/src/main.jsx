import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {iniciarIntegracaoNativa} from './integracaoNativa'
import EstadoAplicativo from './components/EstadoAplicativo'

iniciarIntegracaoNativa()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EstadoAplicativo />
    <App />
  </StrictMode>,
)
