
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🔧 [main.tsx] Carregando aplicação...')

const container = document.getElementById("root")
if (!container) {
  throw new Error("Root element not found")
}

console.log('🔧 [main.tsx] Container encontrado, criando root...')

const root = createRoot(container)
root.render(<App />)

console.log('🔧 [main.tsx] Aplicação renderizada com sucesso!')
