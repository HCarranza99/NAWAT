import sections from '../data/sections'

/** Encuentra la siguiente lección disponible siguiendo el progreso. */
export function findNextLesson(sectionProgress) {
  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx]
    if (sIdx > 0) {
      const prevProg = sectionProgress[sections[sIdx - 1].id]
      if (!prevProg?.bossCompleted) continue
    }
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

/** Índice global (1-based) de una lección dentro de todas las secciones. */
export function globalLessonIndex(targetLesson) {
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

/** Total de lecciones en todas las secciones. */
export function totalLessonsCount() {
  return sections.reduce((acc, s) => acc + s.lessons.length, 0)
}

/** Lecciones completadas según el progreso. */
export function completedLessonsCount(sectionProgress) {
  return sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((l) => l.completed).length
  }, 0)
}
