import module1 from './module1'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CURRÍCULO v2 — lecciones basadas en situaciones
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Modelo nuevo, en paralelo al de src/data/sections/. No lo reemplaza todavía:
 *  las secciones 1–5 siguen vivas y con el progreso de quien ya las jugó. Este
 *  módulo se publica cuando un hablante lo valide; recién entonces se decide qué
 *  jubilar.
 *
 *  FORMA DE UNA LECCIÓN
 *
 *    id, order
 *    title      { nawat, es }
 *    situation  el contexto narrativo: dónde pasa esto y por qué
 *    objective  qué va a poder hacer el estudiante al terminar
 *    dialogue   [{ speaker: 'a'|'b', nawat, es, evidence, source }]
 *    vocabulary [{ nawat, es, pron, pronText, evidence, source }]
 *    note       { title, body, examples: [{ nawat, es, source }] }
 *    task       una tarea del mundo real, fuera de la pantalla
 *    speakerAsk lo que falta y solo un hablante puede contestar
 *
 *  REGLA DURA: toda cadena en náhuat lleva `source`. Sin excepción. La prueba
 *  src/test/curriculum.test.js falla si aparece una sin procedencia — para que
 *  no pueda entrar contenido sin respaldo por descuido, que es exactamente como
 *  entraron los cuatro errores anteriores.
 *
 *  `evidence` vale 'directa' (la cadena aparece así en la fuente) o 'compuesta'
 *  (se armó con piezas atestiguadas). Nada más. Si algo no encaja en ninguna de
 *  las dos, no va.
 *
 *  EL ORDEN DE LOS EJERCICIOS NO ES DECORATIVO
 *
 *  Diálogo → vocabulario → nota → práctica → tarea. Primero se oye la lengua
 *  funcionando, después se nombra lo que pasó. Al revés —que es como estaban
 *  las secciones 1–5— se aprenden palabras sueltas que nunca llegan a ser
 *  lengua. Ver el análisis del 6-ago-2026: 67% de las palabras del corpus no
 *  tenían ninguna frase que las mostrara en uso.
 */

const modules = [module1]

export default modules

/** Índice plano de lecciones, para rutas y búsquedas. */
export const lessonsById = new Map(
  modules.flatMap((m) => m.lessons.map((l) => [l.id, { ...l, moduleId: m.id, module: m }])),
)

export function getModule(id) {
  return modules.find((m) => m.id === id) || null
}

export function getLesson(id) {
  return lessonsById.get(id) || null
}

/**
 * Convierte una lección v2 en la lista de ítems que consume LessonRunner.
 *
 * La práctica se DERIVA del diálogo y del vocabulario: no se escribe a mano. Así
 * un ejercicio no puede contradecir al contenido —que es lo que pasó con `Pia` y
 * `Nikpia` conviviendo en la misma lección de la sección 4— y basta corregir la
 * fuente para que todo lo demás se acomode.
 */
/**
 * Baraja estable: el banco de palabras no puede salir ya ordenado (regalaría la
 * respuesta) ni cambiar en cada render (rompería las pruebas). Se siembra con el
 * id de la lección, así cada una tiene su propio orden y siempre el mismo.
 */
function desordenar(palabras, semilla) {
  let a = [...semilla].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const copia = [...palabras]
  for (let i = copia.length - 1; i > 0; i--) {
    a = (a * 1664525 + 1013904223) >>> 0
    const j = a % (i + 1)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  // Si la mezcla devolvió el orden original, se rota para que nunca coincida.
  const igual = copia.every((p, i) => p === palabras[i])
  return igual && copia.length > 1 ? [copia.at(-1), ...copia.slice(0, -1)] : copia
}

export function toRunnerItems(lesson) {
  if (!lesson) return []
  const items = []

  items.push({
    id: `${lesson.id}-dialogo`,
    type: 'dialogue',
    situation: lesson.situation,
    objective: lesson.objective,
    lines: lesson.dialogue,
  })

  for (const [i, v] of lesson.vocabulary.entries()) {
    items.push({
      id: `${lesson.id}-voc${i + 1}`,
      type: 'flashcard',
      nahuat_word: v.nawat,
      spanish_translation: v.es,
      pronunciation: v.pron,
      pronunciationText: v.pronText,
      source: v.source,
    })
  }

  items.push({
    id: `${lesson.id}-nota`,
    type: 'note',
    title: lesson.note.title,
    body: lesson.note.body,
    examples: lesson.note.examples,
  })

  // Emparejar: solo si hay pares suficientes y ningún significado repetido.
  const pares = lesson.vocabulary.map((v) => ({ nahuat: v.nawat, spanish: v.es }))
  const significados = new Set(pares.map((p) => p.spanish.toLowerCase()))
  if (pares.length >= 2 && significados.size === pares.length) {
    items.push({
      id: `${lesson.id}-unir`,
      type: 'matching',
      instruction: 'Une cada palabra con su significado',
      pairs: pares.slice(0, 5),
    })
  }

  // Ordenar la frase: se toma una línea ATESTIGUADA del diálogo, la primera que
  // tenga al menos tres palabras. Nunca una frase inventada para el ejercicio.
  const ordenable = lesson.dialogue.find((l) => l.nawat.trim().split(/\s+/).length >= 3)
  if (ordenable) {
    const palabras = ordenable.nawat.replace(/[¿?¡!.]/g, '').trim().split(/\s+/)
    items.push({
      id: `${lesson.id}-ordenar`,
      type: 'build_sentence',
      instruction: `Ordena: "${ordenable.es}"`,
      spanish_translation: ordenable.es,
      word_bank: desordenar(palabras, lesson.id),
      correct_order: palabras,
      source: ordenable.source,
    })
  }

  items.push({
    id: `${lesson.id}-tarea`,
    type: 'task',
    body: lesson.task,
  })

  return items
}
