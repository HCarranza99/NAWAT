/**
 * Utilidades de ruta de lecciones. Reciben `sections` como parámetro (en vez de
 * importarlo) para no acoplarse al índice y poder probarlas con datos de mentira.
 */

/**
 * ¿Está terminada esta sección?
 *
 * Existe porque el currículo v2 NO tiene examen final. Antes la regla estaba
 * escrita como `prog.bossCompleted` en cinco lugares distintos, y sin boss eso
 * es siempre falso: la ruta entera quedaba trabada en el primer módulo y no
 * fallaba ninguna prueba, porque ninguna miraba el desbloqueo.
 *
 * Acá la regla es una sola y sirve para las dos formas: si la sección tiene
 * boss hay que aprobarlo, y si no, alcanza con terminar las lecciones. Así el
 * boss puede volver algún día sin tocar las pantallas.
 */
export function seccionCompleta(section, sectionProgress) {
  if (!section) return false
  const prog = sectionProgress?.[section.id] || { lessonsCompleted: {}, bossCompleted: false }
  const leccionesListas = section.lessons.every((l) => prog.lessonsCompleted?.[l.id]?.completed)
  if (!leccionesListas) return false
  return section.boss ? prog.bossCompleted === true : true
}

/** Encuentra la siguiente lección disponible siguiendo el progreso. */
export function findNextLesson(sections, sectionProgress) {
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx]
    if (sIdx > 0 && !seccionCompleta(sections[sIdx - 1], sectionProgress)) continue
    const prog = sectionProgress[section.id] || { lessonsCompleted: {}, bossCompleted: false }
    for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
      const lesson = section.lessons[lIdx]
      if (lIdx > 0 && !prog.lessonsCompleted?.[section.lessons[lIdx - 1].id]?.completed) break
      if (!prog.lessonsCompleted?.[lesson.id]?.completed) return { section, lesson, isBoss: false }
    }
    const allDone = section.lessons.every((l) => prog.lessonsCompleted?.[l.id]?.completed)
    if (allDone && !prog.bossCompleted && section.boss) return { section, lesson: section.boss, isBoss: true }
  }
  return null
}

/**
 * Adónde navega una lección.
 *
 * Las tarjetas de la ruta, el inicio y la pantalla de resultado armaban la URL
 * a mano, cada una por su lado. Ahora la trae el dato (`lesson.route`) y esto
 * es solo el respaldo, para que cambiar de ruta sea un cambio de un solo lugar.
 */
export function rutaDeLaLeccion(section, lesson, isBoss = false) {
  if (lesson?.route) return lesson.route
  return isBoss ? `/section/${section.id}/boss` : `/section/${section.id}/lesson/${lesson.id}`
}

/** Índice global (1-based) de una lección dentro de todas las secciones. */
export function globalLessonIndex(sections, targetLesson) {
  let idx = 0
  for (const section of sections) {
    for (const lesson of section.lessons) {
      idx += 1
      if (lesson.id === targetLesson.id) return idx
    }
  }
  return idx
}

/** Construye los pasos de la ruta (stepper) de una sección. */
export function buildSteps(section, sectionProgress, next, limit = 4) {
  const prog = sectionProgress[section.id] || { lessonsCompleted: {} }
  return section.lessons.slice(0, limit).map((lesson) => {
    const lp = prog.lessonsCompleted?.[lesson.id]
    const completed = lp?.completed === true
    const isCurrent = next && !next.isBoss && lesson.id === next.lesson.id
    return { lesson, completed, isCurrent, stars: lp?.stars || 0, locked: !completed && !isCurrent }
  })
}
