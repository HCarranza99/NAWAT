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
    <div className="screen consent-screen">
      {showLogin && <LoginScreen onBack={() => setShowLogin(false)} />}
      {!showLogin && (
      <div className="consent-body">
        <div className="onboarding-slide">
          <span className="onboarding-icon">🌿</span>
          <h1 className="onboarding-title">Bienvenido al estudio NAWAT</h1>
          <p className="onboarding-text">
            Antes de comenzar, necesitamos tu consentimiento y algunos datos básicos.
          </p>
          <button
            className="consent-login-link"
            onClick={() => setShowLogin(true)}
          >
            ¿Ya tienes cuenta? Iniciar sesión
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="profile-field">
            <label className="profile-label" htmlFor="firstName">Nombre</label>
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
          <div className="profile-field">
            <label className="profile-label" htmlFor="lastName">Apellido</label>
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

          <div className="consent-box" role="region" aria-label="Cláusula de consentimiento">
            <p className="consent-label">Cláusula de consentimiento</p>
            <div className="consent-text">
              {CONSENT_TEXT.split('\n').map((line, i) =>
                line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
              )}
            </div>
          </div>

          <label className="consent-check">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={loading}
            />
            <span>Acepto participar voluntariamente y que mis datos se usen con fines académicos.</span>
          </label>

          {error && <p className="profile-error">{error}</p>}

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
