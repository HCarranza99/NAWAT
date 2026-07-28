import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'

import Torogoz from '../components/ui/Torogoz'

/**
 * Pantalla de regreso después de donar.
 *
 * PayPal manda al donante a `/gracias` (URL de operación completada configurada
 * en el botón alojado). No recibimos confirmación del pago aquí: esta pantalla
 * es solo un agradecimiento, nunca un comprobante.
 */
export default function ThanksScreen() {
  const navigate = useNavigate()

  return (
    <div className="screen items-center justify-center gap-5 bg-[#f7f5ef] px-8 pb-28 text-center lg:mx-auto lg:w-full lg:max-w-[560px] lg:pb-12">
      <Torogoz emotion="celebrate" size={150} />

      <div>
        <p className="flex items-center justify-center gap-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#1f7a57]">
          <Heart className="h-3.5 w-3.5 fill-current" />
          Padiush
        </p>
        <h1 className="mt-2 text-[1.9rem] font-black leading-tight tracking-tight text-[#17211d]">
          ¡Gracias por tu apoyo!
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#6d756e]">
          Tu donación ayuda a mantener Aprende Nawat gratis y a seguir ampliando el
          contenido. PayPal te envía el comprobante por correo.
        </p>
      </div>

      <button className="btn-3d btn-3d-primary mt-1" onClick={() => navigate('/')}>
        Seguir aprendiendo
      </button>
    </div>
  )
}
