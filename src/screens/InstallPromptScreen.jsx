import { useState } from 'react'
import { Share, Plus, Wifi } from 'lucide-react'

import useGameStore from '../store/useGameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { esIOS } from '../lib/instalacion'
import Torogoz from '../components/ui/Torogoz'

/**
 * InstallPromptScreen.jsx
 *
 * Invitación a instalar la app, justo después del registro.
 *
 * POR QUÉ AQUÍ Y NO DESPUÉS
 * Instalar no cuesta nada y se gana desde el primer día: la app queda en la
 * pantalla de inicio, abre sin navegador y funciona sin señal. A diferencia de
 * la cuenta —que se ofrece cuando ya hay progreso que perder, ver
 * lib/ofertaDeCuenta— acá no hay nada que "merecer" primero.
 *
 * EL CASO DE iOS
 * `beforeinstallprompt` es de Chrome. Safari en iPhone NO lo dispara nunca, así
 * que `canInstall` siempre es false ahí y sin este caso aparte los usuarios de
 * iPhone verían una pantalla vacía o se la saltarían sin enterarse de que se
 * puede instalar. En iOS se explica el gesto a mano, que es lo único que se
 * puede hacer.
 *
 * Si el navegador no ofrece instalación NI es iOS (escritorio, Firefox móvil),
 * la pantalla no se muestra: App.jsx la salta. Pedir algo que no se puede hacer
 * es peor que no pedir nada.
 */

export default function InstallPromptScreen() {
  const { canInstall, install } = usePwaInstall()
  const finishInstallPrompt = useGameStore((s) => s.finishInstallPrompt)
  const [instalando, setInstalando] = useState(false)
  const ios = esIOS()

  const instalar = async () => {
    setInstalando(true)
    // El resultado da igual: aceptara o no, la persona ya decidió y sigue.
    // Insistir en una segunda pantalla sería castigar el "no".
    await install()
    setInstalando(false)
    finishInstallPrompt()
  }

  return (
    <div className="screen justify-between bg-background px-7 pb-10 pt-12">
      <div className="onboarding-body-wrap">
        <div className="onboarding-slide">
          <Torogoz emotion="celebrating" size={120} />
          <h1 className="onboarding-title">Tenela a mano</h1>
          <p className="onboarding-text">
            Instalá Aprende Nawat en tu teléfono: queda junto a tus otras apps y
            se abre sin pasar por el navegador.
          </p>

          <ul className="mt-2 flex w-full flex-col gap-2.5 text-left">
            <Ventaja icon={Wifi}>
              Funciona sin señal. Podés practicar en el bus o donde no haya datos.
            </Ventaja>
            <Ventaja icon={Plus}>
              No ocupa casi nada y no pide permisos.
            </Ventaja>
          </ul>

          {/* iOS: no hay API que pedir, hay que enseñar el gesto. */}
          {ios && !canInstall && (
            <div className="mt-4 w-full rounded-2xl border border-hairline bg-[#f7f5ef] p-4 text-left">
              <p className="text-[0.8rem] font-black uppercase tracking-[0.1em] text-[#1f7a57]">
                En iPhone
              </p>
              <ol className="mt-2 flex flex-col gap-1.5 text-[0.85rem] font-medium leading-snug text-[#3d4a44]">
                <li className="flex items-start gap-2">
                  <Share className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" aria-hidden="true" />
                  <span>Tocá el botón de compartir, abajo en Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" aria-hidden="true" />
                  <span>Elegí «Agregar a inicio» y confirmá.</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <div className="onboarding-actions">
        {canInstall ? (
          <button className="btn-3d btn-3d-primary" onClick={instalar} disabled={instalando}>
            {instalando ? 'Instalando…' : 'Instalar la app'}
          </button>
        ) : (
          <button className="btn-3d btn-3d-primary" onClick={finishInstallPrompt}>
            Entendido, empecemos
          </button>
        )}

        {canInstall && (
          <button
            className="py-2 text-[0.88rem] font-semibold text-muted-foreground underline"
            onClick={finishInstallPrompt}
          >
            Ahora no
          </button>
        )}
      </div>
    </div>
  )
}

function Ventaja({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-[#f0fbf4] px-3.5 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" aria-hidden="true" />
      <span className="text-[0.85rem] font-medium leading-snug text-[#25443a]">{children}</span>
    </li>
  )
}
