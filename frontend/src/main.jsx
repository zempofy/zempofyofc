import React from 'react'

// Enter pula para o próximo campo em qualquer input do sistema
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return
  const tag = e.target.tagName
  // Só em inputs de texto, não em textarea ou buttons
  if (tag !== 'INPUT') return
  const tipo = e.target.type
  if (['submit', 'button', 'checkbox', 'radio', 'file'].includes(tipo)) return
  
  // Pegar todos os inputs focáveis da página
  const inputs = Array.from(document.querySelectorAll(
    'input:not([disabled]):not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), select:not([disabled]), textarea:not([disabled])'
  )).filter(el => el.offsetParent !== null) // só visíveis
  
  const idx = inputs.indexOf(e.target)
  if (idx >= 0 && idx < inputs.length - 1) {
    e.preventDefault()
    inputs[idx + 1].focus()
  }
})
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
