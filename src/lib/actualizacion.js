/**
 * actualizacion.js
 *
 * Mantiene la app al día cuando está instalada como PWA.
 *
 * EL PROBLEMA QUE RESUELVE
 * `vite-plugin-pwa` inyectaba un registro mínimo:
 *
 *     navigator.serviceWorker.register('/sw.js', { scope: '/' })
 *
 * Eso pregunta por una versión nueva UNA sola vez, al cargar el documento. Una
 * PWA instalada casi nunca carga el documento de cero: se abre desde el ícono y
 * se reanuda desde segundo plano. Resultado observado el 19-ago-2026: un
 * navegador servía un build de días atrás, sin la pantalla de privacidad y sin
 * los arreglos de telemetría — y contra una base que ya había cambiado.
 *
 * Eso último es lo grave: un cliente viejo escribe por rutas que el RLS ya no
 * permite, y falla en silencio. Actualizar no es cosmético.
 *
 * QUÉ HACE
 *   1. Pregunta por versión nueva cada hora Y cada vez que la app vuelve al
 *      frente. Lo segundo es lo que arregla el caso de la PWA instalada.
 *   2. Cuando el service worker nuevo toma el control, recarga — pero solo en un
 *      momento seguro.
 *
 * QUÉ ES UN MOMENTO SEGURO
 * Nunca en medio de una lección. Recargar ahí le borra a alguien los ejercicios
 * que lleva respondidos, que es peor que tener la versión vieja un rato más. Se
 * espera a que salga de la lección y a que la pestaña esté visible; ahí la
 * recarga se confunde con abrir la app y no se nota.
 */
import { esModoEnfocado } from './modoEnfocado'
import { logError } from './logger'

/**
 * Dónde vive el service worker. NO es el mismo en dev que en producción:
 * `vite-plugin-pwa` compila el suyo a `/sw.js` solo al construir, y en el
 * servidor de desarrollo sirve otro en `/dev-sw.js?dev-sw`. Pedir `/sw.js` en
 * dev devuelve el index.html del fallback del SPA —200, pero text/html— y el
 * registro falla sin decir nada.
 */
const SW_URL = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js'
const SW_OPCIONES = import.meta.env.DEV
  ? { scope: '/', type: 'module' }
  : { scope: '/' }

/** Cada cuánto se pregunta por una versión nueva, con la app abierta. */
export const INTERVALO_MS = 60 * 60 * 1000

/** Cada cuánto se reevalúa si ya se puede recargar, con una actualización lista. */
const REINTENTO_MS = 15 * 1000

/**
 * ¿Se puede recargar ahora sin arruinarle la sesión a nadie?
 *
 * Se exporta para poder probarla sin service workers: es la única decisión con
 * consecuencias de todo el archivo.
 *
 * @param {{ hayActualizacion:boolean, yaRecargue:boolean, ruta:string, visible:boolean }} estado
 */
export function debeRecargar({ hayActualizacion, yaRecargue, ruta, visible }) {
  if (!hayActualizacion) return false
  // Una sola recarga por vida de la página: sin esto, un `controllerchange`
  // repetido deja al navegador en un bucle de recargas.
  if (yaRecargue) return false
  // En lección se pierde el progreso del intento. Se espera.
  if (esModoEnfocado(ruta)) return false
  // Recargar una pestaña en segundo plano gasta datos y no la ve nadie.
  if (!visible) return false
  return true
}

/**
 * Arranca la vigilancia. Se llama una vez, desde main.jsx.
 * No lanza nunca: si algo falla, la app sigue con la versión que tenga.
 */
export function vigilarActualizaciones() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  let hayActualizacion = false
  let yaRecargue = false

  const intentar = () => {
    const puede = debeRecargar({
      hayActualizacion,
      yaRecargue,
      ruta: globalThis.location?.pathname ?? '/',
      visible: globalThis.document?.visibilityState === 'visible',
    })
    if (!puede) return
    yaRecargue = true
    globalThis.location.reload()
  }

  // El service worker nuevo ya tomó el control: el documento en pantalla quedó
  // viejo. `clientsClaim` hace que esto ocurra solo, sin esperar a nadie.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    hayActualizacion = true
    intentar()
  })

  navigator.serviceWorker.register(SW_URL, SW_OPCIONES).then(
    (registro) => {
      if (!registro) return

      const preguntar = () => { try { registro.update() } catch { /* sin red */ } }

      setInterval(preguntar, INTERVALO_MS)
      setInterval(intentar, REINTENTO_MS)

      // Lo que arregla el caso de la PWA instalada: al volver al frente se
      // pregunta, en vez de esperar a una carga de documento que no llega.
      globalThis.document?.addEventListener('visibilitychange', () => {
        if (globalThis.document.visibilityState !== 'visible') return
        preguntar()
        intentar()
      })
    },
    (e) => {
      // Se registra el fallo en vez de tragárselo. Si el service worker no se
      // registra, nadie se actualiza nunca — y ese es exactamente el tipo de
      // avería silenciosa que ya costó caro dos veces en este proyecto.
      logError('registrarServiceWorker', e)
    },
  )
}
