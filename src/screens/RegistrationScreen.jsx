/**
 * RegistrationScreen.jsx
 *
 * Lo primero que ve quien abre la app por primera vez: nombre, edad y
 * departamento de residencia. Tres campos y listo — nada de correo ni
 * contraseña, que eso ya vive en AccountPromptScreen y es opcional.
 *
 * Para qué: los tres datos se guardan en la fila de `participants` que ancla
 * TODA la telemetría posterior (sessions, lesson_attempts, exercise_responses
 * cuelgan de participant_id). Sin esto, el dato de uso existe pero no se puede
 * responder "¿quiénes están aprendiendo náhuat?".
 *
 * El insert a Supabase no ocurre aquí: la pantalla solo escribe en el store y
 * App.jsx crea el participante. Así un fallo de red no encierra al usuario en
 * el formulario y el intento se repite en la siguiente carga.
 *
 * Quien YA tiene cuenta no llena nada: entra por "Iniciar sesión" y useAuth le
 * restaura identidad y progreso (adoptCloudIdentity). Y quien ya venía usando
 * la app desde antes lo hace después, desde Perfil (ver ProfileScreen).
 */
import { useState } from 'react'
import useGameStore, { PHASES } from '../store/useGameStore'
import RegistrationFields from '../components/RegistrationFields'
import LoginScreen from './LoginScreen'
import Torogoz from '../components/ui/Torogoz'

export default function RegistrationScreen() {
  const [showLogin, setShowLogin] = useState(false)

  const completeRegistration = useGameStore((s) => s.completeRegistration)
  const skipRegistration = useGameStore((s) => s.skipRegistration)

  /**
   * Guarda el registro y pasa a la oferta de cuenta (AccountPromptScreen).
   * El guardado ocurre ANTES de ese paso a propósito: crear cuenta con Google
   * recarga la página, y si los datos no estuvieran ya persistidos se perderían
   * en la redirección.
   */
  const cerrarRegistro = (accion) => {
    accion()
    useGameStore.setState({ studyPhase: PHASES.ACCOUNT_PROMPT })
  }

  // Quien ya tiene cuenta se salta todo esto: al iniciar sesión, useAuth le
  // restaura nombre, edad, residencia y participante desde su perfil, y el
  // gate de App.jsx deja de mostrar esta pantalla.
  if (showLogin) {
    return (
      <LoginScreen
        onBack={() => setShowLogin(false)}
        hint="¿Eres nuevo? Vuelve atrás y llena el registro: son tres datos."
      />
    )
  }

  return (
    <div className="screen bg-background px-6 pb-8 pt-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <Torogoz emotion="greeting" size={110} />
        <h1 className="onboarding-title">Antes de empezar</h1>
        <p className="onboarding-text">
          Tres datos rápidos para saber quién está aprendiendo náhuat. Nada de correo
          ni contraseña.
        </p>
        <button
          type="button"
          className="py-1 text-[0.88rem] font-bold text-primary underline"
          onClick={() => setShowLogin(true)}
        >
          ¿Ya tienes cuenta? Iniciar sesión
        </button>
      </header>

      <div className="mt-7 flex flex-1 flex-col">
        <RegistrationFields
          submitLabel="Continuar →"
          onSubmit={(datos) => cerrarRegistro(() => completeRegistration(datos))}
          secondaryAction={
            /* Salida sin fricción: quien no quiera dar sus datos entra igual y
               sigue contando como usuario en la telemetría. */
            <button
              type="button"
              className="py-2 text-[0.85rem] font-semibold text-muted-foreground underline"
              onClick={() => cerrarRegistro(skipRegistration)}
            >
              Prefiero no decirlo
            </button>
          }
        >
          <p className="text-[0.78rem] leading-snug text-muted-foreground">
            Usamos estos datos solo para entender quién usa la app y mejorarla. No los
            compartimos ni los vendemos.
          </p>
        </RegistrationFields>
      </div>
    </div>
  )
}
