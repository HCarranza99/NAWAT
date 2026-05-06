import { useState } from 'react'
import useGameStore from '../store/useGameStore'
import { createParticipant, saveConsent } from '../services/analytics'
import { CONSENT_TEXT, CONSENT_VERSION } from '../data/questionnaires'
import LoginScreen from './LoginScreen'

export default function ConsentScreen() {
  const [showLogin, setShowLogin] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { setParticipant, acceptConsent } = useGameStore()

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    accepted &&
    !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setError('')
    setLoading(true)

    const fn = firstName.trim()
    const ln = lastName.trim()

    try {
      const id = await createParticipant(fn, ln)
      setParticipant(id, `${fn} ${ln}`)
      await saveConsent(id, CONSENT_VERSION, CONSENT_TEXT)
      acceptConsent()
    } catch {
      setError('No se pudo guardar tu perfil. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="screen px-[22px] pt-9 pb-7 bg-background">
      {showLogin && <LoginScreen onBack={() => setShowLogin(false)} />}
      {!showLogin && (
      <div className="flex flex-col gap-6">
        <div className="onboarding-slide">
          <span className="onboarding-icon">🌿</span>
          <h1 className="onboarding-title">Bienvenido al estudio NAWAT</h1>
          <p className="onboarding-text">
            Antes de comenzar, necesitamos tu consentimiento y algunos datos básicos.
          </p>
          <button
            className="inline-block mt-3 text-[0.88rem] font-bold text-nahuat-green-light underline py-1 transition-colors hover:text-white"
            onClick={() => setShowLogin(true)}
          >
            ¿Ya tienes cuenta? Iniciar sesión
          </button>
        </div>

        <form className="flex flex-col gap-3.5 w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-bold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="firstName">Nombre</label>
            <input
              id="firstName"
              className="profile-input"
              type="text"
              placeholder="Ej. María"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-bold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="lastName">Apellido</label>
            <input
              id="lastName"
              className="profile-input"
              type="text"
              placeholder="Ej. García"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={loading}
            />
          </div>

          <div className="bg-card border-[1.5px] border-border rounded-sm px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]" role="region" aria-label="Cláusula de consentimiento">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.6px] text-muted-foreground mb-2">
              Cláusula de consentimiento
            </p>
            <div className="max-h-[180px] overflow-y-auto text-[0.85rem] leading-[1.5] text-foreground [&_p]:mb-2">
              {CONSENT_TEXT.split('\n').map((line, i) =>
                line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
              )}
            </div>
          </div>

          <label className="flex items-start gap-2.5 px-3.5 py-3 bg-card border-[1.5px] border-border rounded-sm cursor-pointer text-[0.88rem] leading-[1.4] text-foreground">
            <input
              type="checkbox"
              className="w-5 h-5 shrink-0 mt-px cursor-pointer accent-primary"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={loading}
            />
            <span>Acepto participar voluntariamente y que mis datos se usen con fines académicos.</span>
          </label>

          {error && <p className="text-[0.82rem] text-destructive font-semibold">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {loading ? 'Guardando…' : 'Continuar al cuestionario →'}
          </button>
        </form>
      </div>
      )}
    </div>
  )
}
