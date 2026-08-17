import { ChevronDown, ShieldCheck } from 'lucide-react'
import { CLAUSULA_CORTA, SECCIONES } from '../data/privacidad'

/**
 * PrivacyNotice.jsx
 *
 * La cláusula de privacidad que acompaña al registro, con el aviso completo
 * desplegable en el mismo lugar.
 *
 * POR QUÉ NO ES UN ENLACE A /privacidad
 * RegistrationScreen se monta FUERA del BrowserRouter (ver App.jsx: el gate de
 * fase devuelve la pantalla directamente, antes de que exista el router). Un
 * <Link> ahí revienta. Y aunque funcionara, mandar a alguien a otra pantalla a
 * media forma es la manera más segura de que abandone el registro.
 *
 * Usa <details> nativo a propósito: sin estado, sin JS, y el teclado y los
 * lectores de pantalla ya saben cómo tratarlo.
 *
 * El texto vive en src/data/privacidad.js, el mismo que lee PrivacyScreen.
 */
export default function PrivacyNotice() {
  return (
    <div className="rounded-2xl border border-hairline bg-[#f7f5ef] p-3.5">
      <p className="flex items-start gap-2 text-[0.78rem] font-medium leading-snug text-[#3d4a44]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" aria-hidden="true" />
        <span>{CLAUSULA_CORTA}</span>
      </p>

      <details className="group mt-2">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-[0.78rem] font-bold text-primary underline underline-offset-2 marker:content-none">
          Leer el aviso completo
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="mt-3 space-y-3 border-t border-hairline pt-3">
          {SECCIONES.map((seccion) => (
            <section key={seccion.id}>
              <h3 className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#17211d]">
                {seccion.titulo}
              </h3>
              <div className="mt-1 space-y-1.5">
                {seccion.parrafos.map((parrafo, i) => (
                  <p key={i} className="text-[0.76rem] font-medium leading-snug text-[#6d756e]">
                    {parrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </details>
    </div>
  )
}
