/**
 * AccountPromptScreen.jsx
 *
 * Pantalla que aparece después de completar el postest.
 * Ofrece 3 opciones:
 *   1. Crear cuenta con email + contraseña
 *   2. Continuar con Google (OAuth)
 *   3. Continuar sin cuenta (con advertencia)
 */
import { useState } from 'react'
import { signUpWithEmail, signInWithGoogle } from '../services/auth'
import { saveProgressToCloud } from '../services/auth'
import useGameStore from '../store/useGameStore'

export default function AccountPromptScreen() {
  const [view, setView] = useState('prompt') // 'prompt' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const goFree = useGameStore((s) => s.goFree)
  const setAuthUser = useGameStore((s) => s.setAuthUser)

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)

    const { user, error: err } = await signUpWithEmail(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(err.includes('already registered')
        ? 'Este correo ya tiene una cuenta. Inicia sesión desde la pantalla de bienvenida.'
        : err)
      return
    }

    if (user) {
      setAuthUser(user.id)
      const state = useGameStore.getState()
      await saveProgressToCloud(state)
      setSuccess(true)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoadingGoogle(true)
    const { error: err } = await signInWithGoogle()
    setLoadingGoogle(false)
    if (err) setError(err)
  }

  // ── Vista de éxito ───────────────────────────────────────────
  if (success) {
    return (
      <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
        <div className="onboarding-body-wrap">
          <div className="onboarding-slide">
            <span className="onboarding-icon">☁️</span>
            <h1 className="onboarding-title">¡Cuenta creada!</h1>
            <p className="onboarding-text">
              Tu progreso ya está guardado en la nube. Puedes continuar desde cualquier dispositivo.
            </p>
          </div>
        </div>
        <div className="onboarding-actions">
          <button className="btn btn-primary" onClick={goFree}>
            Comenzar →
          </button>
        </div>
      </div>
    )
  }

  // ── Vista de registro ────────────────────────────────────────
  if (view === 'register') {
    return (
      <div className="screen bg-background min-h-svh flex flex-col">
        <div className="relative bg-gradient-to-br from-[#1f4f3b] via-primary to-[#3a8461] px-6 pt-12 pb-10 rounded-b-[32px]">
          <button
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 text-white text-[1.2rem] flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/25"
            onClick={() => { setView('prompt'); setError('') }}
          >←</button>
          <div className="flex flex-col items-center gap-2 text-center text-white">
            <span className="text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">🔐</span>
            <h1 className="text-[1.6rem] font-extrabold tracking-[-0.5px] mt-1">Crea tu cuenta</h1>
            <p className="text-[0.9rem] opacity-85">Tu progreso quedará guardado en la nube</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 px-5 pt-6 pb-8">
          <form className="flex flex-col gap-3.5" onSubmit={handleRegister} noValidate>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-semibold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                className="w-full px-4 py-3.5 border-[1.5px] border-border rounded-sm text-base text-foreground bg-white outline-none transition-all focus:border-nahuat-green-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.15)]"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.82rem] font-semibold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                className="w-full px-4 py-3.5 border-[1.5px] border-border rounded-sm text-base text-foreground bg-white outline-none transition-all focus:border-nahuat-green-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.15)]"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {error && <p className="text-[0.85rem] text-destructive font-semibold bg-nahuat-wrong-bg border border-destructive rounded-sm px-3.5 py-2.5">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Vista de prompt principal ────────────────────────────────
  return (
    <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
      <div className="onboarding-body-wrap">
        <div className="onboarding-slide">
          <span className="onboarding-icon">🎉</span>
          <h1 className="onboarding-title">¡Gracias por participar!</h1>
          <p className="onboarding-text">
            Has completado el estudio. A partir de ahora la app queda libre para que sigas aprendiendo náhuat a tu ritmo.
          </p>
        </div>

        <div className="bg-white rounded-[20px] px-5 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-border flex flex-col items-center gap-3 text-center my-4">
          <div className="text-5xl">☁️</div>
          <h2 className="text-[1.2rem] font-extrabold text-primary">¿Quieres guardar tu progreso?</h2>
          <p className="text-[0.88rem] text-muted-foreground leading-[1.5]">
            Crea una cuenta gratuita y accede a tu avance desde cualquier dispositivo.
          </p>

          <div className="w-full flex flex-col gap-2.5 mt-1">
            <button
              className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-sm text-[0.95rem] font-semibold text-foreground bg-white border-[1.5px] border-border shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all hover:enabled:bg-[#f8f8f8] hover:enabled:shadow-[0_4px_24px_rgba(0,0,0,0.12)] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleGoogle}
              disabled={loadingGoogle}
            >
              <span className="flex items-center">
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
                  <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.5-17.7 11.7z" fill="#FF3D00"/>
                  <path d="M24 45c5.5 0 10.5-1.9 14.3-5.2l-6.6-5.6C29.6 35.7 26.9 37 24 37c-6 0-10.7-3.1-11.8-8.4l-7 5.4C8 41.5 15.4 45 24 45z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.9 5.3-5.5 7l6.6 5.6C41.5 37.5 45 31.2 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
                </svg>
              </span>
              {loadingGoogle ? 'Redirigiendo…' : 'Continuar con Google'}
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setView('register')}
              disabled={loadingGoogle}
            >
              Crear cuenta con correo
            </button>
          </div>

          {error && <p className="text-[0.85rem] text-destructive font-semibold bg-nahuat-wrong-bg border border-destructive rounded-sm px-3.5 py-2.5 mt-2">{error}</p>}
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="text-[0.88rem] text-muted-foreground underline py-2" onClick={goFree}>
          Continuar sin cuenta
        </button>
        <p className="text-[0.78rem] text-muted-foreground text-center leading-[1.5]">
          ⚠️ Sin cuenta, tu progreso solo se guarda en este dispositivo.
        </p>
      </div>
    </div>
  )
}
