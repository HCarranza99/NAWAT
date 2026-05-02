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
    <div className="screen auth-screen">
      <div className="auth-header">
        <button className="auth-back-btn" onClick={onBack} aria-label="Volver">
          ←
        </button>
        <div className="auth-header-inner">
          <span className="auth-logo-icon">🌿</span>
          <h1 className="auth-title">Bienvenido de nuevo</h1>
          <p className="auth-subtitle">Inicia sesión para continuar tu aprendizaje</p>
        </div>
      </div>

      <div className="auth-body">
        {/* Google Button */}
        <button
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loading}
        >
          <span className="btn-google-icon">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.5-17.7 11.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-1.9 14.3-5.2l-6.6-5.6C29.6 35.7 26.9 37 24 37c-6 0-10.7-3.1-11.8-8.4l-7 5.4C8 41.5 15.4 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.9 5.3-5.5 7l6.6 5.6C41.5 37.5 45 31.2 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
          </span>
          {loadingGoogle ? 'Redirigiendo…' : 'Continuar con Google'}
        </button>

        <div className="auth-divider">
          <span>o con tu correo</span>
        </div>

        <form className="auth-form" onSubmit={handleEmailLogin} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión →'}
          </button>
        </form>

        <p className="auth-footer-note">
          ¿Eres nuevo? Completa el cuestionario inicial para crear tu cuenta.
        </p>
      </div>
    </div>
  )
}
