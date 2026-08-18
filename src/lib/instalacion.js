/**
 * instalacion.js
 *
 * Cuándo tiene sentido invitar a instalar la PWA. Aparte de la pantalla porque
 * la regla depende del navegador y conviene poder probarla sin montar nada.
 */

/**
 * ¿Es un iPhone o iPad?
 *
 * Importa porque `beforeinstallprompt` es una API de Chrome: Safari en iOS NO
 * la dispara nunca. Ahí no hay nada que pedirle al navegador y la única salida
 * es explicar el gesto a mano (Compartir → Agregar a inicio).
 *
 * iPadOS 13+ se anuncia como Macintosh, de ahí el chequeo de maxTouchPoints:
 * un Mac de verdad no tiene pantalla táctil.
 */
export function esIOS(nav = typeof navigator !== 'undefined' ? navigator : null) {
  if (!nav) return false
  const ua = nav.userAgent || ''
  return /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1)
}

/**
 * ¿Vale la pena mostrar la invitación?
 *
 * Solo si el navegador ofrece instalar, o si es iOS y podemos explicar cómo.
 * En escritorio, en Firefox móvil o si la app ya está instalada, la pantalla no
 * se muestra: pedir algo que no se puede hacer es peor que no pedir nada.
 */
export function puedeInvitarAInstalar({ canInstall, isInstalled, ios }) {
  if (isInstalled) return false
  return Boolean(canInstall || ios)
}
