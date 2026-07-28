import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Heart, Lock, RefreshCw } from 'lucide-react'

import Torogoz from '../components/ui/Torogoz'
import TorogozBadge from '../components/ui/TorogozBadge'
import {
  DONATION_AMOUNTS,
  DONATION_ENABLED,
  DONATION_USES,
  buildDonationUrl,
} from '../data/donation'

/** ¿La app corre instalada como PWA (sin barra de navegador)? */
function isStandalonePwa() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  )
}

export default function DonateScreen() {
  const navigate = useNavigate()
  const donationUrl = buildDonationUrl()

  const openPayPal = () => {
    if (!donationUrl) return
    // En la PWA instalada, '_blank' lanza el navegador externo y el donante
    // pierde la app: vuelve a una pestaña suelta, no a Aprende Nawat. Navegando
    // en la misma vista, la URL de retorno (/gracias) lo trae de vuelta adentro.
    // En navegador normal sí conviene pestaña nueva, para no perder la sesión.
    const target = isStandalonePwa() ? '_self' : '_blank'
    window.open(donationUrl, target, 'noopener,noreferrer')
  }

  if (!DONATION_ENABLED) {
    return (
      <div className="screen items-center justify-center gap-4 bg-[#f7f5ef] px-8 text-center">
        <h1 className="text-2xl font-black text-[#17211d]">Donaciones no disponibles</h1>
        <p className="max-w-[320px] text-sm font-medium leading-snug text-[#6d756e]">
          Todavía no hay una cuenta de donación configurada.
        </p>
        <button className="btn-3d btn-3d-primary mt-2" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      {/* ── Cabecera ── */}
      <header className="brand-header px-5 pb-16 pt-5 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white/70"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">
              <Heart className="h-3.5 w-3.5" />
              Apoya el proyecto
            </p>
            <h1 className="mt-1.5 text-[1.9rem] font-black leading-[1.05] tracking-tight">
              Ayuda a que el náhuat <span className="text-[#9ddfc6]">siga vivo</span>
            </h1>
          </div>
          <div className="-mb-16 shrink-0 drop-shadow-[0_12px_22px_rgba(0,0,0,0.3)]">
            <Torogoz emotion="happy" size={104} />
          </div>
        </div>
      </header>

      <main className="space-y-4 px-5 pt-5 lg:mx-auto lg:max-w-[720px] lg:px-8 lg:pt-9">
        {/* Cabecera de escritorio */}
        <div className="hidden lg:mb-2 lg:flex lg:items-center lg:gap-4">
          <TorogozBadge size={56} />
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Apoya el proyecto</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">
              Ayuda a que el náhuat siga vivo
            </h1>
          </div>
        </div>

        <p className="text-[0.95rem] font-medium leading-relaxed text-[#3d4a44]">
          Aprende Nawat es gratis y sin anuncios. Si te sirve, una donación ayuda a
          sostenerla y a seguir ampliando el contenido. Cualquier monto suma.
        </p>

        {/* ── En qué se usa ── */}
        <section className="surface-card p-4">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">
            En qué se usa
          </h2>
          <ul className="mt-3 space-y-2.5">
            {DONATION_USES.map((use) => (
              <li key={use} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef8f2] text-[#1f7a57]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm font-semibold leading-snug text-[#3d4a44]">{use}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Montos sugeridos ── */}
        <section className="surface-card p-4">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">
            Montos sugeridos
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DONATION_AMOUNTS.map((amount) => (
              <span
                key={amount}
                className="rounded-xl border border-[#1f7a57]/20 bg-[#eef8f2] px-4 py-2.5 text-base font-black tabular-nums text-[#1f7a57]"
              >
                ${amount}
              </span>
            ))}
            <span className="rounded-xl border border-hairline bg-[#f7f5ef] px-4 py-2.5 text-base font-black text-[#6d756e]">
              Otro
            </span>
          </div>
          <p className="mt-3 text-[0.78rem] font-medium leading-snug text-[#6d756e]">
            El monto lo elegís en PayPal, donde también podés cambiar a una donación
            mensual o anual.
          </p>
        </section>

        {/* ── Acción ── */}
        <section className="space-y-3">
          <button className="btn-3d btn-3d-primary" onClick={openPayPal}>
            <Heart className="h-5 w-5" />
            Donar con PayPal
          </button>

          <ul className="space-y-2 rounded-2xl border border-hairline bg-white p-4">
            <TrustLine icon={Lock}>
              El pago ocurre en la página segura de PayPal. La app nunca ve tus datos.
            </TrustLine>
            <TrustLine icon={CreditCard}>
              Podés pagar con tarjeta de crédito o débito. Si no tenés cuenta de PayPal,
              te va a pedir crear una durante el proceso.
            </TrustLine>
            <TrustLine icon={RefreshCw}>
              Si elegís donación mensual, podés cancelarla cuando quieras desde PayPal.
            </TrustLine>
          </ul>

          <button className="btn-3d btn-3d-soft text-sm" onClick={() => navigate('/')}>
            Ahora no, seguir aprendiendo
          </button>
        </section>
      </main>
    </div>
  )
}

function TrustLine({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1f7a57]" />
      <span className="text-[0.82rem] font-semibold leading-snug text-[#6d756e]">{children}</span>
    </li>
  )
}
