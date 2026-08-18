/**
 * ofertaDeCuenta.js
 *
 * Cuándo ofrecer la cuenta. Vive aparte de las pantallas porque la regla es
 * una decisión de producto y conviene poder probarla sin montar nada.
 *
 * EL PROBLEMA QUE RESUELVE
 * La oferta vivía justo después del registro, antes de que la persona hubiera
 * visto una sola lección. Ahí no hay nada que perder todavía, así que casi
 * nadie la aceptaba: 467 participantes y 1 solo perfil en la nube. Y sin
 * cuenta, el progreso vive en localStorage: se pierde al cambiar de teléfono,
 * limpiar el navegador o desinstalar la PWA.
 *
 * El momento bueno es cuando perder el avance YA duele. Por eso se ofrece al
 * terminar un módulo completo, no al entrar.
 *
 * POR QUÉ «DE DOS LECCIONES O MÁS»
 * El primer módulo (m0, «Los sonidos») tiene una sola lección de cuatro
 * ejercicios. Terminarlo son unos tres minutos: ahí todavía no hay inversión
 * que proteger, y además coincidiría con la encuesta de entrada —que se
 * interpone al aprobar la primera lección—, dejando dos interrupciones
 * seguidas. El primer módulo con peso real es m1 («El saludo», cinco
 * lecciones).
 *
 * La regla se escribe por tamaño y no como 'm1' a propósito: si mañana m0 crece
 * o se reordenan los módulos, sigue valiendo sola.
 */

/** Un módulo por debajo de esto no representa inversión suficiente. */
export const MIN_LECCIONES_PARA_OFRECER = 2

/** ¿Están completas TODAS las lecciones de este módulo? */
export function moduloCompleto(seccion, sectionProgress = {}) {
  const lecciones = seccion?.lessons ?? []
  if (lecciones.length === 0) return false
  const hechas = sectionProgress?.[seccion.id]?.lessonsCompleted ?? {}
  return lecciones.every((leccion) => hechas[leccion.id]?.completed === true)
}

/**
 * ¿Toca ofrecer la cuenta ahora?
 *
 * @param {object[]} sections - los módulos (ver useSections)
 * @param {object} estado
 * @param {object} estado.sectionProgress - progreso guardado
 * @param {string|null} estado.authUserId - id de la cuenta, si ya tiene una
 * @param {boolean} estado.accountPromptDismissed - ya se le ofreció una vez
 * @returns {boolean}
 */
export function debeOfrecerCuenta(sections = [], {
  sectionProgress = {},
  authUserId = null,
  accountPromptDismissed = false,
} = {}) {
  // Quien ya tiene cuenta no necesita que se la ofrezcan; su progreso ya viaja.
  if (authUserId) return false
  // Se ofrece UNA vez. Insistir en cada módulo convierte la app en un cobrador.
  if (accountPromptDismissed) return false

  return sections.some(
    (seccion) =>
      (seccion?.lessons?.length ?? 0) >= MIN_LECCIONES_PARA_OFRECER &&
      moduloCompleto(seccion, sectionProgress),
  )
}
