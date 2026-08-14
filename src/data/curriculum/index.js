import module0 from './module0'
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

const modules = [module0, module1]

export default modules

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EL CONTRATO — lo que NO puede cambiar al agregar contenido
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  La app no debe cambiar de forma cada vez que se escribe un módulo. Para eso
 *  hay dos vocabularios cerrados, y solo uno de ellos toca la interfaz.
 *
 *  1. TIPOS DE LECCIÓN (`lesson.type`) — es contenido, no interfaz.
 *
 *       'dialogo'  una situación con una conversación. El caso normal.
 *       'sonidos'  contrastes de pronunciación. No admite diálogo: no se puede
 *                  conversar sobre un fonema. Trae pares mínimos y ejemplos.
 *
 *     Se pueden agregar más con el tiempo. Agregar uno NO obliga a tocar la
 *     interfaz, porque todos terminan compilando a los mismos ítems de abajo.
 *
 *  2. TIPOS DE ÍTEM — esto SÍ es interfaz, y está congelado.
 *
 *       dialogue · flashcard · note · task
 *       matching · build_sentence · multiple_choice_text · active_recall
 *
 *     Los cuatro últimos son los que MIDEN: tienen una respuesta correcta que el
 *     estudiante no elige por sí mismo. La tarjeta de memoria no mide (se
 *     autoevalúa), así que se usa lo mínimo — ver `compilarDialogo`.
 *
 *     Cada uno tiene su componente en LessonRunner. Un tipo nuevo acá significa
 *     un componente nuevo, o sea que la app cambia de forma. Por eso la prueba
 *     `curriculum.test.js` falla si `toRunnerItems` emite algo fuera de esta
 *     lista: el error salta al escribir contenido, no cuando el estudiante ve
 *     "Tipo de ejercicio no soportado".
 *
 *  El resultado práctico: agregar un módulo es agregar UN ARCHIVO DE DATOS.
 *  Ni componentes, ni rutas, ni cambios en el motor.
 */
export const TIPOS_DE_LECCION = ['dialogo', 'sonidos']
export const TIPOS_DE_ITEM = [
  'dialogue', 'flashcard', 'note', 'task',
  'matching', 'build_sentence', 'multiple_choice_text', 'active_recall',
]

/** Los que tienen respuesta correcta comprobable. La tarjeta de memoria no está. */
export const TIPOS_QUE_MIDEN = ['matching', 'build_sentence', 'multiple_choice_text', 'active_recall']

/**
 * Vista uniforme de TODO el náhuat de una lección, con su procedencia.
 *
 * Cada tipo de lección guarda su contenido distinto: la de situación tiene
 * `dialogue` y `vocabulary`; la de sonidos tiene `sounds`. Las comprobaciones de
 * procedencia no deben saber eso — si lo supieran, agregar un tipo rompería
 * todas las pruebas a la vez (pasó exactamente eso al escribir el módulo 0).
 *
 * Un tipo de lección nuevo se soporta extendiendo SOLO esta función.
 *
 * @returns {Array<{nawat, es, source, evidence, donde}>}
 */
export function cadenasConFuente(lesson) {
  if (!lesson) return []
  const salida = []
  const add = (x, donde) => {
    if (x?.nawat) salida.push({ nawat: x.nawat, es: x.es, source: x.source, evidence: x.evidence, donde })
  }

  for (const d of lesson.dialogue || []) add(d, 'diálogo')
  for (const v of lesson.vocabulary || []) add(v, 'vocabulario')
  for (const s of lesson.sounds || []) {
    add({ nawat: s.grapheme, es: s.description, source: s.source, evidence: 'directa' }, 'sonido')
    add({ ...s.example, evidence: 'directa' }, 'ejemplo del sonido')
  }
  for (const e of lesson.note?.examples || []) add({ ...e, evidence: 'directa' }, 'nota')

  return salida
}

/** Lo que la lección enseña como unidad de vocabulario, sea cual sea su tipo. */
export function unidadesDeVocabulario(lesson) {
  if (!lesson) return []
  if (lesson.type === 'sonidos') return [] // las grafías no son palabras
  return lesson.vocabulary || []
}

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
 * Azar DETERMINISTA sembrado con el id de la lección.
 *
 * Los ejercicios no pueden salir en el mismo orden que la respuesta (la
 * regalarían) ni cambiar en cada render (romperían las pruebas y confundirían a
 * quien repite la lección). Sembrado con el id, cada lección tiene su propia
 * mezcla y siempre la misma.
 */
function pseudoAzar(semilla) {
  let a = [...semilla].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0
    return a / 4294967296
  }
}

/** Baraja con el generador sembrado; nunca devuelve el orden original. */
function mezclar(lista, rnd) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  const igual = copia.every((x, i) => x === lista[i])
  return igual && copia.length > 1 ? [copia.at(-1), ...copia.slice(0, -1)] : copia
}

/**
 * Convierte una lección en la lista de ítems que consume LessonRunner.
 *
 * Acá es donde el contrato se sostiene: cada tipo de lección COMPILA a los
 * mismos seis tipos de ítem. Por eso un tipo de lección nuevo no obliga a
 * escribir un componente nuevo — y por eso la app no cambia de forma cuando
 * crece el contenido.
 *
 * La práctica se DERIVA del contenido, nunca se escribe a mano. Así un ejercicio
 * no puede contradecir a su lección —que es lo que pasó con `Pia` y `Nikpia`
 * conviviendo en la sección 4— y basta corregir la fuente para que el resto se
 * acomode solo.
 */
export function toRunnerItems(lesson) {
  if (!lesson) return []
  return lesson.type === 'sonidos' ? compilarSonidos(lesson) : compilarDialogo(lesson)
}

/**
 * Lección de pronunciación. No lleva diálogo: no se puede conversar sobre un
 * fonema. El sonido se presenta con su palabra de ejemplo y se practica
 * emparejando sonido con ejemplo, que es la discriminación que importa.
 */
function compilarSonidos(lesson) {
  const items = [
    {
      id: `${lesson.id}-intro`,
      type: 'note',
      kicker: 'De qué se trata',
      title: lesson.objective,
      body: lesson.situation,
      examples: [],
    },
    ...lesson.sounds.map((s, i) => ({
      id: `${lesson.id}-son${i + 1}`,
      type: 'flashcard',
      nahuat_word: s.grapheme,
      spanish_translation: s.description,
      pronunciation: s.pron,
      pronunciationText: s.pronText,
      example_sentence: s.example.nawat,
      example_translation: s.example.es,
      source: s.source,
    })),
    {
      id: `${lesson.id}-nota`,
      type: 'note',
      // "¿Qué pasó ahí?" solo funciona después de un diálogo; acá no hubo uno.
      kicker: 'Para tener en cuenta',
      title: lesson.note.title,
      body: lesson.note.body,
      examples: lesson.note.examples,
    },
  ]

  const pares = lesson.sounds.map((s) => ({ nahuat: s.grapheme, spanish: s.example.nawat }))
  if (pares.length >= 2 && new Set(pares.map((p) => p.spanish)).size === pares.length) {
    items.push({
      id: `${lesson.id}-unir`,
      type: 'matching',
      instruction: 'Une cada sonido con la palabra que lo lleva',
      // Sin esto la columna derecha se rotula "Español" y contiene náhuat.
      left_label: 'Sonido',
      right_label: 'Palabra',
      pairs: pares.slice(0, 5),
    })
  }

  // Discriminar el sonido dentro de una palabra: esto SÍ mide, la tarjeta no.
  const rnd = pseudoAzar(lesson.id)
  for (const [i, s] of lesson.sounds.entries()) {
    const otras = lesson.sounds.filter((o) => o.grapheme !== s.grapheme).map((o) => o.example.nawat)
    if (otras.length < 2) continue
    const opciones = mezclar(
      [{ text: s.example.nawat, correct: true }, ...otras.map((t) => ({ text: t, correct: false }))],
      rnd,
    )
    items.push({
      id: `${lesson.id}-disc${i + 1}`,
      type: 'multiple_choice_text',
      nahuat_word: s.grapheme,
      spanish_translation: s.example.nawat,
      pronunciation: s.pron,
      pronunciationText: s.pronText,
      instruction: `¿Cuál palabra lleva el sonido ${s.grapheme}?`,
      options: opciones.map((o, j) => ({ id: `o${j + 1}`, ...o })),
    })
  }

  items.push({ id: `${lesson.id}-tarea`, type: 'task', body: lesson.task })
  return items
}

/** Normaliza una palabra para comparar: sin puntuación, minúsculas. */
const desnudo = (s = '') => s.toLowerCase().normalize('NFC').replace(/[¿?¡!.,]/g, '').trim()

/** Todo el vocabulario del currículo, para sacar distractores de otras lecciones. */
function vocabularioGlobal() {
  return modules.flatMap((m) => m.lessons.flatMap((l) => l.vocabulary || []))
}

/**
 * Lección de situación: diálogo → presentación mínima → nota → práctica → tarea.
 *
 * SOBRE LAS TARJETAS DE MEMORIA. Se usan lo menos posible, por dos razones:
 *
 *  1. Se autoevalúan ("lo sabía" / "no lo sabía"), así que no miden nada. Sirven
 *     para presentar, no para comprobar.
 *  2. En este modelo son casi siempre redundantes: el diálogo YA mostró la
 *     palabra en contexto y con su traducción.
 *
 * De ahí la regla: una palabra recibe tarjeta SOLO si no aparece en el diálogo.
 * En la lección 1 eso baja de ocho tarjetas a dos (Tiutak y Tayua, que solo
 * salen en la nota). Todo lo demás se comprueba con ejercicios que sí tienen
 * respuesta correcta: opción múltiple, emparejar, ordenar y escribir.
 */
function compilarDialogo(lesson) {
  const items = []
  const rnd = pseudoAzar(lesson.id)

  items.push({
    id: `${lesson.id}-dialogo`,
    type: 'dialogue',
    situation: lesson.situation,
    objective: lesson.objective,
    lines: lesson.dialogue,
  })

  // ── Presentación: solo lo que el diálogo no mostró ──
  const enDialogo = new Set(
    lesson.dialogue.flatMap((l) => l.nawat.split(/\s+/).map(desnudo)),
  )
  const sinPresentar = lesson.vocabulary.filter((v) => !enDialogo.has(desnudo(v.nawat)))
  for (const [i, v] of sinPresentar.entries()) {
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

  // ── Práctica: todo con respuesta correcta comprobable ──

  // Opción múltiple sobre las dos primeras palabras, con distractores reales.
  const ajenas = vocabularioGlobal().filter(
    (v) => !lesson.vocabulary.some((p) => desnudo(p.nawat) === desnudo(v.nawat)),
  )
  for (const [i, v] of lesson.vocabulary.slice(0, 2).entries()) {
    const distractores = []
    const vistos = new Set([v.es.toLowerCase()])
    for (const otra of mezclar(ajenas, rnd)) {
      if (vistos.has(otra.es.toLowerCase())) continue
      vistos.add(otra.es.toLowerCase())
      distractores.push(otra.es)
      if (distractores.length === 3) break
    }
    if (distractores.length < 3) continue
    const opciones = mezclar(
      [{ text: v.es, correct: true }, ...distractores.map((t) => ({ text: t, correct: false }))],
      rnd,
    )
    items.push({
      id: `${lesson.id}-op${i + 1}`,
      type: 'multiple_choice_text',
      nahuat_word: v.nawat,
      spanish_translation: v.es,
      pronunciation: v.pron,
      pronunciationText: v.pronText,
      instruction: '¿Qué significa esta palabra?',
      options: opciones.map((o, j) => ({ id: `o${j + 1}`, ...o })),
    })
  }

  // Emparejar: solo si ningún significado se repite (si no, hay pares ambiguos).
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

  // Ordenar: se toma una línea ATESTIGUADA del diálogo. Nunca una frase inventada
  // para el ejercicio. El banco lleva DISTRACTORES —palabras que no van en la
  // frase— porque con solo las correctas el ejercicio se resuelve por descarte.
  const ordenable = lesson.dialogue.find((l) => l.nawat.trim().split(/\s+/).length >= 3)
  if (ordenable) {
    const palabras = ordenable.nawat.replace(/[¿?¡!.]/g, '').trim().split(/\s+/)
    const enFrase = new Set(palabras.map(desnudo))
    const senuelos = mezclar(ajenas, rnd)
      .map((v) => v.nawat.toLowerCase())
      .filter((w) => !enFrase.has(desnudo(w)))
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .slice(0, Math.min(3, Math.max(2, palabras.length - 1)))
    items.push({
      id: `${lesson.id}-ordenar`,
      type: 'build_sentence',
      instruction: `Ordena: "${ordenable.es}"`,
      spanish_translation: ordenable.es,
      word_bank: mezclar([...palabras, ...senuelos], rnd),
      correct_order: palabras,
      source: ordenable.source,
    })
  }

  // Escribir de memoria: el único ejercicio de producción pura. Se elige la
  // palabra más corta del vocabulario para que sea exigente y no cruel.
  const paraEscribir = [...lesson.vocabulary].sort((a, b) => a.nawat.length - b.nawat.length)[0]
  if (paraEscribir) {
    items.push({
      id: `${lesson.id}-escribir`,
      type: 'active_recall',
      nahuat_word: paraEscribir.nawat,
      spanish_translation: paraEscribir.es,
      pronunciation: paraEscribir.pron,
      pronunciationText: paraEscribir.pronText,
      instruction: `¿Cómo se escribe "${paraEscribir.es}" en náhuat?`,
    })
  }

  items.push({
    id: `${lesson.id}-tarea`,
    type: 'task',
    body: lesson.task,
  })

  return items
}
