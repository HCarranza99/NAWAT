/**
 * LoginScreen.jsx
 *
 * Pantalla de inicio de sesión con email/contraseña y Google OAuth.
 * Accesible desde el botón "¿Ya tienes cuenta?" en ConsentScreen.
 */
import { useState } from 'react'
import { signInWithEmail, signInWithGoogle } from '../services/auth'
import useGameStore from '../store/useGameStore'

export default function LoginScreen({ onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')

  const setAuthUser = useGameStore((s) => s.setAuthUser)

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)

    const { user, error: err } = await signInWithEmail(email.trim(), password)
    setLoading(false)

    if (err) {
      setError(err === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : err)
      return
    }

    // El hook useAuth en App.jsx se encarga del merge y la navegación
    setAuthUser(user.id)
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoadingGoogle(true)
    const { error: err } = await signInWithGoogle()
    setLoadingGoogle(false)
    if (err) setError(err)
    // Si no hay error, Supabase redirigirá la página automáticamente
  }

  return (
    <div className="bg-background min-h-svh flex flex-col">
      <div className="relative bg-gradient-to-br from-[#1f4f3b] via-primary to-[#3a8461] px-6 pt-12 pb-10 rounded-b-[32px]">
        <button
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 text-white text-[1.2rem] flex items-center justify-center backdrop-blur-md transition-colors hover:bg-white/25"
          onClick={onBack}
          aria-label="Volver"
        >
          ←
        </button>
        <div className="flex flex-col items-center gap-2 text-center text-white">
          <span className="text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">🌿</span>
          <h1 className="text-[1.6rem] font-extrabold tracking-[-0.5px] mt-1">Bienvenido de nuevo</h1>
          <p className="text-[0.9rem] opacity-85">Inicia sesión para continuar tu aprendizaje</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-5 pt-6 pb-8">
        {/* Google Button */}
        <button
          className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-sm text-[0.95rem] font-semibold text-foreground bg-white border-[1.5px] border-border shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all hover:enabled:bg-[#f8f8f8] hover:enabled:shadow-[0_4px_24px_rgba(0,0,0,0.12)] disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loading}
        >
          <span className="flex items-center">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.5-17.7 11.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-1.9 14.3-5.2l-6.6-5.6C29.6 35.7 26.9 37 24 37c-6 0-10.7-3.1-11.8-8.4l-7 5.4C8 41.5 15.4 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.9 5.3-5.5 7l6.6 5.6C41.5 37.5 45 31.2 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
          </span>
          {loadingGoogle ? 'Redirigiendo…' : 'Continuar con Google'}
        </button>

        <div className="flex items-center gap-3 text-muted-foreground text-[0.82rem] before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
          <span>o con tu correo</span>
        </div>

        <form className="flex flex-col gap-3.5" onSubmit={handleEmailLogin} noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
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
            <label className="text-[0.82rem] font-semibold text-muted-foreground uppercase tracking-[0.5px]" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className="w-full px-4 py-3.5 border-[1.5px] border-border rounded-sm text-base text-foreground bg-white outline-none transition-all focus:border-nahuat-green-light focus:shadow-[0_0_0_3px_rgba(82,183,136,0.15)]"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-[0.85rem] text-destructive font-semibold bg-nahuat-wrong-bg border border-destructive rounded-sm px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión →'}
          </button>
        </form>

        <p className="text-[0.82rem] text-muted-foreground text-center leading-[1.5] pt-2">
          ¿Eres nuevo? Completa el cuestionario inicial para crear tu cuenta.
        </p>
      </div>
    </div>
  )
}
