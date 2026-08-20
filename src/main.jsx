import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import App from './App.jsx'
import { vigilarActualizaciones } from './lib/actualizacion'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Mantiene al día a quien tiene la app instalada. Va después del render para no
// competir con la primera pintura: no hay prisa por actualizar, la hay por que
// la app aparezca.
vigilarActualizaciones()
