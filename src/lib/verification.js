/**
 * verification.js
 *
 * Estado de revisión del contenido.
 *
 * La app mezcla dos capas de calidad muy distinta:
 *   - ARTESANAL (secciones 1–5, hechas a mano): cada palabra fue cotejada contra
 *     el diccionario, con su cita de página. No lleva marcas.
 *   - GENERADA (ver scripts/generate-lessons/generate.js): derivada del corpus
 *     automáticamente. Cada ítem y cada lección llevan `verified: false`, porque
 *     NINGÚN hablante las ha revisado todavía.
 *
 * Ese dato existía en los datos desde el principio pero no se mostraba en
 * pantalla: el usuario veía las dos capas exactamente igual. Estas funciones
 * existen para poder decirlo, no para ocultarlo.
 *
 * NOTA: `verified === false` significa "sin revisar", no "incorrecto". Al
 * redactar los avisos hay que sostener esa diferencia y no alarmar de más.
 */

/**
 * ¿Esta lección está pendiente de revisión por un hablante?
 *
 * Prioriza la marca a nivel de lección; si no está (contenido generado antes de
 * que existiera esa marca), la deduce de los ítems. Así no depende de haber
 * regenerado el archivo.
 *
 * @param {object} lesson
 * @returns {boolean}
 */
export function isLessonUnverified(lesson) {
  if (!lesson) return false
  if (lesson.verified === false) return true
  return (lesson.items || []).some((item) => item?.verified === false)
}

/** ¿Este ejercicio suelto está pendiente de revisión? */
export function isItemUnverified(item) {
  return item?.verified === false
}

/**
 * Cuenta cuántas lecciones de una sección están sin revisar.
 * @param {object} section
 * @returns {{ unverified: number, total: number }}
 */
export function countUnverified(section) {
  const lessons = [...(section?.lessons || []), ...(section?.boss ? [section.boss] : [])]
  return {
    unverified: lessons.filter(isLessonUnverified).length,
    total: lessons.length,
  }
}

/** Texto corto del badge. */
export const REVIEW_LABEL = 'En revisión'

/** Explicación honesta, para donde haya espacio de sobra. */
export const REVIEW_EXPLANATION =
  'Este vocabulario se generó automáticamente desde el diccionario y todavía no lo ha revisado un hablante de náhuat. Puede tener errores. Las lecciones sin esta marca sí fueron verificadas una por una.'
