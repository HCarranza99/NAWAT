import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react'

import Torogoz from '../components/ui/Torogoz'
import TorogozBadge from '../components/ui/TorogozBadge'
import { SECCIONES, CONTACTO_DATOS, VERSION_AVISO } from '../data/privacidad'

/**
 * Aviso de privacidad — /privacidad
 *
 * El texto NO vive acá: vive en src/data/privacidad.js, junto a la cláusula
 * corta que se muestra dentro del registro. Las dos tienen que decir lo mismo,
 * y separarlas es la forma más fácil de que dejen de hacerlo.
 *
 * Se llega desde el registro (antes de dar cualquier dato) y desde Perfil
 * (después, cuando alguien se pregunta qué aceptó).
 */
export default function PrivacyScreen() {
  const navigate = useNavigate()

  return (
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      {/* ── Cabecera móvil ── */}
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
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacidad
            </p>
            <h1 className="mt-1.5 text-[1.9rem] font-black leading-[1.05] tracking-tight">
              Qué guardamos <span className="text-[#9ddfc6]">y qué no</span>
            </h1>
          </div>
          <div className="-mb-16 shrink-0 drop-shadow-[0_12px_22px_rgba(0,0,0,0.3)]">
            <Torogoz emotion="explaining" size={104} />
          </div>
        </div>
      </header>

      <main className="space-y-4 px-5 pt-5 lg:mx-auto lg:max-w-[720px] lg:px-8 lg:pt-9">
        {/* Cabecera de escritorio */}
        <div className="hidden lg:mb-2 lg:flex lg:items-center lg:gap-4">
          <TorogozBadge size={56} />
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">
              Privacidad
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">
              Qué guardamos y qué no
            </h1>
          </div>
        </div>

        <p className="text-[0.95rem] font-medium leading-relaxed text-[#3d4a44]">
          Sin letra chiquita. Esta app la hace una persona, no una empresa, y lo único
          que se recoge es lo que hace falta para saber si el curso sirve.
        </p>

        {SECCIONES.map((seccion) => (
          <section key={seccion.id} className="surface-card p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">
              {seccion.titulo}
            </h2>
            <div className="mt-2.5 space-y-2.5">
              {seccion.parrafos.map((parrafo, i) => (
                <p
                  key={i}
                  className="text-[0.88rem] font-medium leading-relaxed text-[#3d4a44]"
                >
                  {parrafo}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* ── Contacto ── */}
        <section className="rounded-2xl border border-[#52b788]/30 bg-[#f0fbf4] p-4">
          <p className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#1f7a57]">
            <Mail className="h-3.5 w-3.5" />
            Para cualquier cosa de tus datos
          </p>
          <a
            href={`mailto:${CONTACTO_DATOS}`}
            className="mt-2 inline-block break-all text-[0.95rem] font-black text-[#1f7a57] underline underline-offset-2"
          >
            {CONTACTO_DATOS}
          </a>
        </section>

        <p className="px-1 text-[0.74rem] font-semibold text-[#6d756e]">
          Última actualización: {VERSION_AVISO}
        </p>

        <button className="btn-3d btn-3d-soft text-sm" onClick={() => navigate(-1)}>
          Volver
        </button>
      </main>
    </div>
  )
}
