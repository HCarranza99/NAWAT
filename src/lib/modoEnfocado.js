/**
 * ¿El usuario está DENTRO de un ejercicio?
 *
 * Cuando lo está, la app entra en modo enfocado: se esconde la barra de
 * navegación, la barra lateral y el banner de demo. La pantalla queda para la
 * lección y nada más.
 *
 * POR QUÉ ESTO ES UNA FUNCIÓN Y NO TRES CONDICIONES SUELTAS
 *
 * Hasta el 14-ago-2026 la misma lista de rutas estaba copiada en tres lugares:
 * `AppChrome`, `DemoBanner` y `BottomNav`. Cuando las lecciones se mudaron a
 * `/curriculo/:lessonId`, los tres quedaron obsoletos a la vez y nadie se
 * enteró: no hay error posible, simplemente la barra dejó de esconderse y en
 * móvil tapaba el botón de "Empezar lección".
 *
 * Con una sola función, mudar una ruta se arregla en un solo lugar. Y hay
 * prueba: `modoEnfocado.test.js` falla si una ruta de lección deja de esconder
 * el chrome.
 *
 * Se conservan `/section/` y `/lesson/` a propósito. Son las rutas del
 * contenido viejo y hoy redirigen, pero durante el instante previo a la
 * redirección la ruta todavía es esa; sin ellas el chrome parpadea.
 */
const RUTAS_ENFOCADAS = ['/curriculo/', '/section/', '/lesson/']
// `/encuesta` es la encuesta de entrada. Va aquí por la misma razón que el
// resto: se responde sin una barra que invite a abandonarla a media pregunta.
const PANTALLAS_ENFOCADAS = ['/review', '/result', '/encuesta']

export function esModoEnfocado(pathname = '') {
  if (PANTALLAS_ENFOCADAS.includes(pathname)) return true
  return RUTAS_ENFOCADAS.some((prefijo) => pathname.startsWith(prefijo))
}
