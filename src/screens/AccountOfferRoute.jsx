import { useLocation, useNavigate } from 'react-router-dom'

import useGameStore from '../store/useGameStore'
import AccountPromptScreen from './AccountPromptScreen'

/**
 * AccountOfferRoute.jsx — la ruta /cuenta
 *
 * Envuelve AccountPromptScreen para cuando se interpone DENTRO de la app, al
 * completar el primer módulo. Existe para que la pantalla de abajo no tenga que
 * saber si vive dentro o fuera del router: acá se resuelve la navegación y allá
 * solo se recibe `onDone`.
 *
 * Marca la oferta como vista pase lo que pase —cree cuenta o siga sin ella—
 * para no volver a interponerla en cada módulo. Una app que insiste en cada
 * hito deja de sentirse como una app y empieza a sentirse como un cobrador.
 */
export default function AccountOfferRoute() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const dismissAccountPrompt = useGameStore((s) => s.dismissAccountPrompt)

  const volverA = state?.volverA ?? '/'

  return (
    <AccountPromptScreen
      onDone={() => {
        dismissAccountPrompt()
        navigate(volverA, { replace: true })
      }}
    />
  )
}
