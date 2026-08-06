/**
 * Estado de navegación que espera ResultScreen al terminar una lección.
 *
 * Los nombres NO son libres: ResultScreen desestructura `score` y `xpEarned`.
 * Pasarle `accuracy` y `xp` —que es lo que parecía natural desde la pantalla del
 * currículo— hizo que el resultado mostrara "NaN%" y "+undefined" sin que
 * fallara ninguna prueba. Vive en su propio módulo para poder verificarlo sin
 * montar la pantalla, y para que el contrato tenga un solo dueño.
 */
export function buildResultState(lesson, items, ratio, xpEarned) {
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title.es,
    lessonIcon: lesson.module?.icon,
    score: ratio,
    xpEarned,
    totalItems: items.length,
    returnTo: '/',
  }
}
