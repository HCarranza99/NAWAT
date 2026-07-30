import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, ExternalLink, Library, Sprout } from 'lucide-react'

import Torogoz from '../components/ui/Torogoz'
import TorogozBadge from '../components/ui/TorogozBadge'
import {
  COMMUNITY_NOTE,
  DICTIONARY_URL,
  PRIMARY_SOURCE,
  SECONDARY_SOURCES,
} from '../data/credits'

/**
 * Pantalla de fuentes y créditos.
 *
 * Reconoce de dónde viene el contenido. NO afirma que el uso esté autorizado
 * (ver la nota en src/data/credits.js): solo atribuye la obra a sus autores.
 */
export default function CreditsScreen() {
  const navigate = useNavigate()
  const { title, subtitle, authors, year, isbn, blurb, dedication } = PRIMARY_SOURCE

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
              <Library className="h-3.5 w-3.5" />
              Fuentes y créditos
            </p>
            <h1 className="mt-1.5 text-[1.9rem] font-black leading-[1.05] tracking-tight">
              De dónde viene <span className="text-[#9ddfc6]">este náhuat</span>
            </h1>
          </div>
          <div className="-mb-16 shrink-0 drop-shadow-[0_12px_22px_rgba(0,0,0,0.3)]">
            <Torogoz emotion="reading" size={104} />
          </div>
        </div>
      </header>

      <main className="space-y-4 px-5 pt-5 lg:mx-auto lg:max-w-[720px] lg:px-8 lg:pt-9">
        {/* Cabecera de escritorio */}
        <div className="hidden lg:mb-2 lg:flex lg:items-center lg:gap-4">
          <TorogozBadge size={56} />
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">
              Fuentes y créditos
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">
              De dónde viene este náhuat
            </h1>
          </div>
        </div>

        <p className="text-[0.95rem] font-medium leading-relaxed text-[#3d4a44]">
          Aprende Nawat no documentó la lengua: la aprende de quienes sí lo hicieron.
          Todo el vocabulario que enseña proviene del trabajo de otras personas, y
          corresponde nombrarlas.
        </p>

        {/* ── Fuente principal ── */}
        <section className="surface-card overflow-hidden p-0">
          <div className="flex items-center gap-3 border-b border-[#e3ded2] bg-[#f0fbf4] px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2fae7e] to-[#1f7a57] text-white shadow-[0_6px_16px_rgba(31,122,87,0.28)]">
              <BookOpen className="h-5 w-5" />
            </span>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#1f7a57]">
              Fuente principal del vocabulario
            </p>
          </div>

          <div className="space-y-3 p-4">
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight text-[#17211d]">
                {title}
              </h2>
              <p className="mt-0.5 text-[0.82rem] font-semibold text-[#6d756e]">{subtitle}</p>
            </div>

            <ul className="space-y-1">
              {authors.map((name) => (
                <li key={name} className="text-[0.92rem] font-black text-[#1f7a57]">
                  {name}
                </li>
              ))}
            </ul>

            <p className="text-[0.86rem] font-medium leading-relaxed text-[#3d4a44]">{blurb}</p>

            <p className="border-l-2 border-[#52b788]/40 pl-3 text-[0.82rem] font-medium italic leading-snug text-[#6d756e]">
              {dedication}
            </p>

            <dl className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-hairline pt-3 text-[0.78rem]">
              <div className="flex gap-1.5">
                <dt className="font-bold text-[#6d756e]">Año:</dt>
                <dd className="font-black tabular-nums text-[#17211d]">{year}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="font-bold text-[#6d756e]">ISBN:</dt>
                <dd className="font-black tabular-nums text-[#17211d]">{isbn}</dd>
              </div>
            </dl>

            {DICTIONARY_URL ? (
              <a
                href={DICTIONARY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1f7a57]/25 bg-[#eef8f2] px-4 py-3 text-[0.86rem] font-black text-[#1f7a57] transition hover:bg-[#e2f4ea] active:scale-[0.99]"
              >
                <ExternalLink className="h-4 w-4" />
                Conseguir el diccionario
              </a>
            ) : (
              <p className="mt-1 rounded-2xl border border-hairline bg-[#f7f5ef] px-4 py-3 text-[0.78rem] font-semibold leading-snug text-[#6d756e]">
                Buscá la obra por su ISBN para conseguir el diccionario completo. Vale
                mucho más que lo que esta aplicación alcanza a enseñar.
              </p>
            )}
          </div>
        </section>

        {/* ── Otras fuentes ── */}
        <section className="surface-card p-4">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">
            Otras obras consultadas
          </h2>
          <ul className="mt-3 space-y-3">
            {SECONDARY_SOURCES.map((source) => (
              <li key={source.title} className="border-l-2 border-[#e3ded2] pl-3">
                <p className="text-[0.88rem] font-black leading-tight text-[#17211d]">
                  {source.title}
                </p>
                <p className="mt-0.5 text-[0.8rem] font-bold text-[#1f7a57]">{source.author}</p>
                <p className="mt-1 text-[0.78rem] font-medium leading-snug text-[#6d756e]">
                  {source.note}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Comunidad hablante ── */}
        <section className="rounded-2xl border border-[#52b788]/30 bg-[#f0fbf4] p-4">
          <p className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#1f7a57]">
            <Sprout className="h-3.5 w-3.5" />
            A quienes la sostuvieron
          </p>
          <p className="mt-2.5 text-[0.88rem] font-medium leading-relaxed text-[#25443a]">
            {COMMUNITY_NOTE}
          </p>
        </section>

        <button className="btn-3d btn-3d-soft text-sm" onClick={() => navigate(-1)}>
          Volver
        </button>
      </main>
    </div>
  )
}
