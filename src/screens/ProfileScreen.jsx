import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Cloud,
  Download,
  Flame,
  Heart,
  LogIn,
  LogOut,
  Medal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  UserRoundPen,
  Zap,
} from 'lucide-react'

import useGameStore, { PHASES } from '../store/useGameStore'
import { DONATION_ENABLED } from '../data/donation'
import { GAME_CONFIG } from '../data/gameConfig'
import { distritoLabel, faltanDatosDeRegistro, paisLabel, residenciaLabel } from '../data/registro'
import RegistrationFields from '../components/RegistrationFields'
import LoginScreen from './LoginScreen'
import TorogozBadge from '../components/ui/TorogozBadge'
import { saveParticipantRegistration } from '../services/analytics'
import { saveProgressToCloud, signOut } from '../services/auth'
import { usePwaInstall } from '../hooks/usePwaInstall'

function StatCard({ icon: Icon, value, label, tone = 'text-[#1f7a57]' }) {
  return (
    <div className="surface-card p-3.5">
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-3 text-2xl font-black leading-none text-[#17211d] tabular-nums">{value}</p>
      <p className="mt-1 text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">{label}</p>
    </div>
  )
}

export default function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false)
  const [confirmandoSalida, setConfirmandoSalida] = useState(false)
  const [mostrandoLogin, setMostrandoLogin] = useState(false)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { canInstall, install } = usePwaInstall()
  const {
    xp, streak, lastPlayedDate,
    participantName, participantAge, participantResidence,
    participantDistrict, participantCountry,
    isGuestMode,
  } = useGameStore()

  // ── Datos del registro ───────────────────────────────────────
  // El aviso del inicio entra por aquí (/profile?completar=1) y abre el
  // formulario de una, sin obligar a buscar el botón. Se lee al montar en vez
  // de sincronizarlo con un efecto: es el estado inicial, no una suscripción.
  const [editandoDatos, setEditandoDatos] = useState(() => searchParams.get('completar') === '1')
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [errorDatos, setErrorDatos] = useState('')
  const faltanDatos = faltanDatosDeRegistro({
    participantName, participantAge, participantResidence,
    participantDistrict, participantCountry,
  })
  // Lo más específico primero: quien dice "Nahuizalco" se reconoce ahí, no en
  // "Sonsonate".
  const lugar = participantCountry
    ? paisLabel(participantCountry)
    : (distritoLabel(participantDistrict) ?? residenciaLabel(participantResidence))

  /** Cierra el formulario y limpia el parámetro para que recargar no lo reabra. */
  const cerrarEditor = () => {
    setEditandoDatos(false)
    setErrorDatos('')
    if (searchParams.has('completar')) setSearchParams({}, { replace: true })
  }

  const guardarDatos = async (datos) => {
    setErrorDatos('')
    setGuardandoDatos(true)

    // Primero lo local: aunque la red falle, la app ya lo sabe y la próxima
    // sincronización lo sube.
    useGameStore.getState().completeRegistration(datos)
    useGameStore.getState().dismissRegistrationPrompt()

    const { participantId, authUserId } = useGameStore.getState()
    // El participante ya existe, así que esto no puede ir en su fila: se envía
    // a la tabla de solo-agregar. Si aún no existiera (registro fallido sin
    // red), App.jsx lo crea con estos datos.
    const guardado = participantId
      ? await saveParticipantRegistration(participantId, datos)
      : true
    if (authUserId) await saveProgressToCloud(useGameStore.getState())

    setGuardandoDatos(false)
    if (!guardado) {
      setErrorDatos('Se guardó en este dispositivo, pero no pudimos enviarlo. Revisa tu conexión.')
      return
    }
    cerrarEditor()
  }

  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const level = Math.floor(xp / xpPerLevel) + 1
  const xpInLevel = xp % xpPerLevel
  const levelPct = Math.round((xpInLevel / xpPerLevel) * 100)

  /**
   * Cierra sesión de verdad: sube lo que falte, cierra en Supabase y deja el
   * dispositivo limpio. El progreso no se pierde — queda en la cuenta y vuelve
   * al iniciar sesión otra vez.
   */
  const handleLogout = async () => {
    setLoggingOut(true)
    // Primero sincronizar: si algo no había subido, este es el último momento
    // en que existe localmente.
    await saveProgressToCloud(useGameStore.getState())
    await signOut()
    // El estado local de esta pantalla se cierra ANTES de limpiar el store:
    // `signOutLocal` deja el dispositivo en blanco y la app salta al registro,
    // así que a partir de esa línea este componente ya no está montado.
    setLoggingOut(false)
    setConfirmandoSalida(false)
    useGameStore.getState().signOutLocal()
  }

  // El login se monta ENCIMA de todo, no dentro del perfil: si no, la barra de
  // navegación queda flotando sobre el formulario e invita a irse a medias.
  if (mostrandoLogin) {
    return (
      <div className="fixed inset-0 z-[300] overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-[480px]">
          <LoginScreen
            onBack={() => setMostrandoLogin(false)}
            onSuccess={() => setMostrandoLogin(false)}
            hint="¿No tienes cuenta? Vuelve atrás y toca “Crear una cuenta”."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      <header className="brand-header px-5 pb-6 pt-5 lg:hidden">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TorogozBadge size={54} />
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">Perfil</p>
              <h1 className="mt-1 truncate text-2xl font-black leading-none tracking-normal">
                {participantName || 'Estudiante'}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/65">Nivel {level}</p>
            </div>
          </div>

          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_8px_18px_rgba(244,162,97,0.35)]">
            <Medal className="h-7 w-7" />
          </div>
        </div>

        <div className="relative z-10 mt-5 rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-extrabold text-white">Progreso de nivel</p>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">{xpInLevel}/{xpPerLevel} XP</p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/14">
            <div className="h-full rounded-full bg-[#9ddfc6] transition-[width] duration-500 ease-out" style={{ width: `${levelPct}%` }} />
          </div>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
          <div className={`inline-flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-extrabold ${
            isGuestMode
              ? 'border-white/15 bg-white/8 text-white/72'
              : 'border-[#9ddfc6]/25 bg-[#9ddfc6]/12 text-[#9ddfc6]'
          }`}>
            {isGuestMode ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <Cloud className="h-4 w-4 shrink-0" />}
            <span className="truncate">{isGuestMode ? 'Sin cuenta vinculada' : 'Cuenta vinculada'}</span>
          </div>
        </div>
      </header>

      <main className="space-y-5 px-5 pt-5 lg:mx-auto lg:max-w-[900px] lg:px-8 lg:pt-9">
        <div className="hidden lg:mb-1 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Perfil</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">{participantName || 'Estudiante'}</h1>
            <p className="mt-1.5 text-sm font-medium text-[#6d756e]">Nivel {level}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_10px_22px_rgba(244,162,97,0.32)]">
            <Medal className="h-8 w-8" />
          </div>
        </div>
        {/* Solo lo que no vive en Logros: estrellas, lecciones, secciones e
            insignias son de esa pantalla y aquí solo duplicaban. */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard icon={Zap} value={xp} label="XP total" tone="text-[#1f7a57]" />
          <StatCard icon={Flame} value={streak} label="Racha" tone="text-[#c77918]" />
          <StatCard icon={Heart} value={GAME_CONFIG.lives.max} label="Vidas por lección" tone="text-[#d94848]" />
        </section>

        {/* Datos del registro. Dos caras del mismo botón: invitación cuando
            faltan (los 463 participantes que ya existían nunca los dieron) y
            resumen editable cuando ya están. */}
        {faltanDatos ? (
          <button
            onClick={() => setEditandoDatos(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#1f7a57]/30 bg-[#eef8f2] p-4 text-left transition active:scale-[0.99]"
            data-testid="completar-registro"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#52b788] to-[#1f7a57] text-white shadow-[0_6px_16px_rgba(31,122,87,0.28)]">
              <UserRoundPen className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.92rem] font-black leading-tight text-[#17211d]">
                Cuéntanos quién eres
              </span>
              <span className="mt-1 block text-[0.76rem] font-semibold leading-snug text-[#6d756e]">
                Nombre, edad y de dónde eres. Toma menos de un minuto y nos ayuda a
                mejorar la app.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#1f7a57]" />
          </button>
        ) : (
          <button
            onClick={() => setEditandoDatos(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 text-left transition hover:bg-[#faf9f5] active:scale-[0.99]"
            data-testid="editar-registro"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef8f2] text-[#1f7a57]">
              <Pencil className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.86rem] font-black leading-tight text-[#17211d]">
                Tus datos
              </span>
              <span className="mt-0.5 block truncate text-[0.74rem] font-semibold leading-snug text-[#6d756e]">
                {participantName} · {participantAge} años · {lugar}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#a8b0a8]" />
          </button>
        )}

        {lastPlayedDate && (
          <p className="rounded-md border border-[#e3ded2] bg-white px-4 py-3 text-center text-sm font-medium text-[#6d756e] shadow-sm">
            Última sesión: {new Date(lastPlayedDate).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        )}

        {DONATION_ENABLED && (
          <button
            onClick={() => navigate('/donar')}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#f4a261]/35 bg-[#fff6ec] p-4 text-left transition active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_6px_16px_rgba(244,162,97,0.3)]">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.92rem] font-black leading-tight text-[#17211d]">Apoya el proyecto</span>
              <span className="mt-1 block text-[0.76rem] font-semibold leading-snug text-[#6d756e]">
                Una donación mantiene la app gratis y sin anuncios.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#c77918]" />
          </button>
        )}

        {/* Créditos: entrada discreta pero encontrable, deliberadamente más sobria
            que la tarjeta de donación para no competir con ella. */}
        <button
          onClick={() => navigate('/creditos')}
          className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 text-left transition hover:bg-[#faf9f5] active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef8f2] text-[#1f7a57]">
            <BookOpen className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.86rem] font-black leading-tight text-[#17211d]">
              Fuentes y créditos
            </span>
            <span className="mt-0.5 block text-[0.74rem] font-semibold leading-snug text-[#6d756e]">
              De dónde viene el náhuat que enseña la app
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#a8b0a8]" />
        </button>

        {/* Privacidad: la cláusula ya se mostró en el registro, pero ahí se lee
            con prisa. Acá queda para quien después se pregunta qué aceptó — y es
            desde donde se pide el borrado de los datos. */}
        <button
          onClick={() => navigate('/privacidad')}
          className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-white px-4 py-3 text-left transition hover:bg-[#faf9f5] active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef8f2] text-[#1f7a57]">
            <ShieldCheck className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.86rem] font-black leading-tight text-[#17211d]">
              Privacidad
            </span>
            <span className="mt-0.5 block text-[0.74rem] font-semibold leading-snug text-[#6d756e]">
              Qué guardamos, y cómo pedir que lo borremos
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#a8b0a8]" />
        </button>

        {/* Cuenta. Sin sesión, lo importante es que quede claro que el avance
            vive solo aquí; con sesión, cómo salir. */}
        {isGuestMode ? (
          <section className="rounded-2xl border border-[#f4d7ad] bg-[#fff8ec] p-4" data-testid="sesion-local">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4a261]/20 text-[#c77918]">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[0.95rem] font-black leading-tight text-[#17211d]">
                  Tu avance está solo en este dispositivo
                </h2>
                <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-[#8a4b12]">
                  Si cambias de teléfono, borras los datos del navegador o desinstalas la
                  app, se pierde. Con una cuenta lo llevas contigo y puedes seguir desde
                  donde quedaste en cualquier dispositivo.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                className="btn-3d btn-3d-primary text-sm"
                onClick={() => setMostrandoLogin(true)}
                data-testid="iniciar-sesion"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </button>
              <button
                className="btn-3d btn-3d-soft text-sm"
                onClick={() => useGameStore.setState({ studyPhase: PHASES.ACCOUNT_PROMPT })}
              >
                <Cloud className="h-4 w-4" />
                Crear una cuenta
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#1f7a57]/25 bg-[#eef8f2] p-4" data-testid="sesion-en-nube">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f7a57]/15 text-[#1f7a57]">
                <Cloud className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[0.95rem] font-black leading-tight text-[#17211d]">
                  Tu avance se guarda en tu cuenta
                </h2>
                <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-[#4a6b5c]">
                  Puedes cerrar sesión sin perder nada: al volver a entrar, tu progreso
                  regresa contigo.
                </p>
              </div>
            </div>

            <button
              className="btn-3d btn-3d-soft mt-4 text-sm"
              onClick={() => setConfirmandoSalida(true)}
              disabled={loggingOut}
              data-testid="cerrar-sesion"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </section>
        )}

        {canInstall && (
          <section>
            <button className="btn-3d btn-3d-primary text-sm" onClick={install}>
              <Download className="h-4 w-4" />
              Instalar app
            </button>
          </section>
        )}
      </main>

      {confirmandoSalida && (
        <ConfirmarSalida
          loading={loggingOut}
          onCancel={() => setConfirmandoSalida(false)}
          onConfirm={handleLogout}
        />
      )}

      {editandoDatos && (
        <EditorDeDatos
          initial={{
            nombre: participantName ?? '',
            edad: participantAge,
            residencia: participantResidence ?? '',
            distrito: participantDistrict ?? '',
            pais: participantCountry ?? '',
          }}
          loading={guardandoDatos}
          error={errorDatos}
          onSubmit={guardarDatos}
          onClose={cerrarEditor}
        />
      )}
    </div>
  )
}

/* ── Confirmación de cierre de sesión ───────────────────────────── */
// Se confirma porque el dispositivo queda limpio: el avance sigue en la cuenta,
// pero de aquí desaparece, y eso conviene decirlo antes y no después.
function ConfirmarSalida({ loading, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Cerrar sesión"
    >
      <div className="w-full max-w-[360px] rounded-[1.6rem] border border-hairline bg-white p-6 text-center shadow-[0_24px_60px_rgba(16,47,41,0.3)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8f2] text-[#1f7a57]">
          <LogOut className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-black text-[#17211d]">¿Cerrar sesión?</h2>
        <p className="mt-2 text-sm font-medium leading-snug text-[#6d756e]">
          Tu progreso queda guardado en tu cuenta. Este dispositivo quedará en blanco
          hasta que vuelvas a iniciar sesión.
        </p>
        <div className="mt-5 space-y-2">
          <button
            className="btn-3d btn-3d-primary text-sm"
            onClick={onConfirm}
            disabled={loading}
            data-testid="confirmar-cerrar-sesion"
          >
            {loading ? 'Cerrando sesión…' : 'Sí, cerrar sesión'}
          </button>
          <button
            className="btn-3d btn-3d-soft text-sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Formulario de datos, sobre la pantalla de perfil ────────────── */
function EditorDeDatos({ initial, loading, error, onSubmit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[300] overflow-y-auto bg-black/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Tus datos"
    >
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-background px-6 pb-8 pt-6">
        <header className="flex flex-col gap-2">
          <button
            type="button"
            className="self-start py-1 text-[0.9rem] font-bold text-muted-foreground"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ← Volver
          </button>
          <h2 className="text-[1.5rem] font-black tracking-tight text-[#17211d]">Tus datos</h2>
          <p className="text-[0.85rem] font-medium leading-snug text-muted-foreground">
            Nos ayudan a saber quién está aprendiendo náhuat. Puedes cambiarlos cuando
            quieras.
          </p>
        </header>

        <div className="mt-6 flex flex-1 flex-col">
          <RegistrationFields
            initial={initial}
            submitLabel="Guardar"
            loading={loading}
            onSubmit={onSubmit}
          >
            {error && (
              <p role="alert" className="text-[0.8rem] font-semibold text-destructive">
                {error}
              </p>
            )}
            <p className="text-[0.78rem] leading-snug text-muted-foreground">
              Usamos estos datos solo para entender quién usa la app y mejorarla. No los
              compartimos ni los vendemos.
            </p>
          </RegistrationFields>
        </div>
      </div>
    </div>
  )
}
