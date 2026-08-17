/**
 * logger.js
 *
 * Manda a la tabla `error_log` de Supabase todo lo que los try/catch de
 * services/ atrapan y se tragan.
 *
 * POR QUÉ EXISTE
 * Del 4 al 27 de junio de 2026 la app no guardó ni una respuesta de
 * cuestionario. Nadie lo notó en 23 días; se perdieron 70 participantes. El
 * error existía —42501, RLS— pero moría en un catch mudo. Este archivo es lo
 * que hace que la próxima vez se vea el primer día.
 *
 * POR QUÉ UNA TABLA Y NO SENTRY
 * Cuesta $0, no agrega dependencia ni peso al bundle (la app se usa con datos
 * móviles) y no hace falta abrir otra cuenta. Cubre el fallo real de junio, que
 * no fue una caída sino una ruta rechazada mientras el resto funcionaba.
 *
 * LAS CUATRO REGLAS QUE NO SE ROMPEN
 *
 *  1. El logger nunca lanza. Si algo acá falla, se traga en silencio — no puede
 *     romper la app que está intentando instrumentar.
 *  2. El logger nunca se registra a sí mismo. Un fallo al escribir el log NO
 *     genera otro log: sería un bucle infinito contra la base.
 *  3. Sin conexión no se registra nada. La app es PWA y funciona offline; ahí
 *     que las escrituras fallen es lo ESPERADO, no un fallo. Registrarlo
 *     ahogaría la señal real en ruido.
 *  4. Tope por ámbito y código. Una lección con 20 ejercicios fallando escribe
 *     20 filas por persona; con cientos de usuarios eso es una inundación que
 *     cuesta dinero y esconde el problema. Para saber que algo se rompió
 *     alcanza con verlo unas pocas veces.
 *
 * LO QUE NO SE MANDA
 * Nada escrito por el usuario: ni respuestas, ni nombre, ni texto de encuestas.
 * Solo el ámbito, el código de error y qué versión de la app lo produjo. Lo
 * prometido en src/data/privacidad.js tiene que seguir siendo cierto.
 */
import { supabase } from './supabase'
import { STORAGE_KEY } from '../store/useGameStore'

/** Cuántas veces se registra el mismo scope+code antes de callar. */
const TOPE_POR_CLAVE = 3

/** Cuenta de envíos por `scope|code` en esta carga de la página. */
const enviados = new Map()

/** Evita que un fallo del propio logger genere otro registro (regla 2). */
let registrando = false

/**
 * Saca los campos útiles de un error, sea de PostgREST, de Supabase Auth o un
 * Error de JS común. PostgREST trae `code`/`details`/`hint`; un TypeError de
 * red no trae nada de eso y solo deja el mensaje.
 */
function describir(err) {
  if (!err || typeof err !== 'object') {
    return { message: String(err ?? 'error desconocido'), code: null, details: null }
  }
  return {
    message: recortar(err.message ?? String(err), 500),
    // `status` cubre los errores de Auth, que no traen `code` de Postgres.
    code: recortar(err.code ?? err.status ?? null, 50),
    details: recortar(err.details ?? err.hint ?? null, 500),
  }
}

function recortar(valor, max) {
  if (valor == null) return null
  const s = String(valor)
  return s.length > max ? `${s.slice(0, max)}…` : s
}

/**
 * Registra un error atrapado.
 *
 * La firma no cambió: los 17 sitios que ya la usan siguen igual.
 *
 * @param {string} scope - nombre de la función que falló ('endSession', …)
 * @param {unknown} err  - lo que cayó en el catch
 */
export function logError(scope, err) {
  if (import.meta.env.DEV) console.error(`[${scope}]`, err)

  // Regla 2: si esto se llamó desde el propio envío del logger, cortar acá.
  if (registrando) return

  // Regla 3: offline es un estado normal de esta app, no una falla.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return

  const { message, code, details } = describir(err)

  // Regla 4: tope por scope+code.
  const clave = `${scope}|${code ?? '-'}`
  const vistas = enviados.get(clave) ?? 0
  if (vistas >= TOPE_POR_CLAVE) return
  enviados.set(clave, vistas + 1)

  enviar({ scope, message, code, details })
}

/**
 * Envío en segundo plano. No se espera (`void`) a propósito: registrar un error
 * no debe demorar la interacción de quien está usando la app.
 */
function enviar(fila) {
  registrando = true
  try {
    void supabase
      .from('error_log')
      .insert({
        ...fila,
        participant_id: participanteActual(),
        app_version: __APP_VERSION__,
        user_agent: recortar(globalThis.navigator?.userAgent, 300),
        url: recortar(globalThis.location?.pathname, 200),
      })
      .then(
        () => {},
        () => {}, // regla 1 y 2: si el insert falla, se traga
      )
  } catch {
    // Si ni siquiera se pudo armar la llamada, no hay nada más que hacer.
  } finally {
    registrando = false
  }
}

/**
 * El participante, leído de localStorage y no del store de Zustand.
 *
 * Se lee el JSON crudo en vez de llamar a `useGameStore.getState()` porque esto
 * corre justo cuando algo ya falló: cuanto menos dependa de que el resto de la
 * app esté sana, mejor. La clave viene del store para que no haya dos literales
 * que se puedan desincronizar.
 */
function participanteActual() {
  try {
    const bruto = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!bruto) return null
    const id = JSON.parse(bruto)?.state?.participantId
    // El modo demo usa el literal 'demo-user', que no es un uuid válido y
    // reventaría el insert (22P02) — justo el tipo de fallo silencioso que
    // este archivo existe para evitar.
    return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id) ? id : null
  } catch {
    return null
  }
}

/** Para pruebas: reinicia los topes entre casos. */
export function _resetTopes() {
  enviados.clear()
  registrando = false
}
