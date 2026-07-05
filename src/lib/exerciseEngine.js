/**
 * exerciseEngine — arma la secuencia de ejercicios de una lección en TIEMPO DE
 * EJECUCIÓN a partir de su vocabulario, con una semilla por intento.
 *
 * Objetivo: que cada vez que se repite la misma lección cambie la mezcla de tipos
 * y el orden (no salen todos los tipos siempre, y no en el mismo orden). Se
 * eliminan las flashcards: su vocabulario alimenta los tipos nuevos.
 *
 * Tipos que emite:
 *   - true_false            (Verdadero/Falso)
 *   - multiple_choice_text  (opción múltiple náhuat→español, tipo existente)
 *   - matching              (emparejar; con significado o con PRONUNCIACIÓN)
 *   - lightning             (ronda relámpago: varias preguntas contrarreloj)
 *   - classify              (clasifica por tema; solo si hay 2+ temas)
 * Los ejercicios artesanales especiales (build_sentence, active_recall,
 * multiple_choice_image) se conservan y se intercalan.
 */

// PRNG determinista por semilla (mulberry32): misma secuencia dentro de un intento.
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffle = (arr, rng) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const norm = (s = '') => s.toLowerCase().trim()
const isWord = (it) => it?.nahuat_word && it?.spanish_translation
const WORD_TYPES = new Set(['flashcard', 'multiple_choice_text'])
const SPECIAL_TYPES = new Set(['build_sentence', 'active_recall', 'multiple_choice_image'])

/** Opciones de opción múltiple: la correcta + distractores del pool. */
function mcOptions(word, pool, rng) {
  const distract = shuffle(
    pool.filter((w) => norm(w.spanish_translation) !== norm(word.spanish_translation)),
    rng,
  ).slice(0, 3).map((w) => w.spanish_translation)
  const opts = shuffle(
    [{ text: word.spanish_translation, correct: true }, ...distract.map((t) => ({ text: t, correct: false }))],
    rng,
  )
  return opts.map((o, i) => ({ id: `o${i + 1}`, text: o.text, correct: o.correct }))
}

function buildTrueFalse(word, pool, rng, id) {
  const truthy = rng() < 0.5
  let shown = word.spanish_translation
  if (!truthy) {
    const others = pool.filter((w) => norm(w.spanish_translation) !== norm(word.spanish_translation))
    shown = others.length ? others[Math.floor(rng() * others.length)].spanish_translation : word.spanish_translation
  }
  return {
    id, type: 'true_false',
    nahuat_word: word.nahuat_word,
    pronunciation: word.pronunciation,
    spanish_translation: word.spanish_translation, // real (para feedback)
    shown_translation: shown,
    is_true: norm(shown) === norm(word.spanish_translation),
  }
}

function buildMultipleChoice(word, pool, rng, id) {
  return {
    id, type: 'multiple_choice_text',
    nahuat_word: word.nahuat_word,
    spanish_translation: word.spanish_translation,
    pronunciation: word.pronunciation,
    pronunciationText: word.pronunciationText,
    instruction: '¿Qué significa esta palabra?',
    options: mcOptions(word, pool, rng),
  }
}

function buildMatching(words, id, { pronunciation = false } = {}) {
  const pairs = words.slice(0, 5).map((w) => ({
    nahuat: w.nahuat_word,
    spanish: pronunciation ? `/${w.pronunciation}/` : w.spanish_translation,
  }))
  return {
    id, type: 'matching',
    instruction: pronunciation ? 'Une cada palabra con su pronunciación.' : 'Une cada palabra náhuat con su significado.',
    pairs,
  }
}

function buildLightning(words, pool, rng, id) {
  const questions = words.slice(0, 6).map((w, i) => ({
    id: `${id}-q${i}`,
    nahuat_word: w.nahuat_word,
    spanish_translation: w.spanish_translation,
    options: mcOptions(w, pool, rng),
  }))
  return { id, type: 'lightning', seconds: Math.max(15, questions.length * 5), questions }
}

/**
 * Construye la secuencia de ejercicios de una lección.
 * @param {object} lesson  - lección (usa lesson.items como vocabulario base)
 * @param {object} opts
 * @param {number} opts.seed         - semilla del intento (distinta → mezcla distinta)
 * @param {Array}  [opts.sectionWords] - vocabulario de toda la sección (distractores)
 * @returns {Array} ejercicios listos para LessonRunner
 */
export function buildExercises(lesson, { seed = 1, sectionWords = [] } = {}) {
  const rng = mulberry32(seed)
  const items = lesson?.items || []

  // Vocabulario base (de flashcards y opción múltiple) y ejercicios especiales.
  const words = []
  const seen = new Set()
  const special = []
  for (const it of items) {
    if (WORD_TYPES.has(it.type) && isWord(it)) {
      const k = norm(it.nahuat_word)
      if (!seen.has(k)) { seen.add(k); words.push(it) }
    } else if (SPECIAL_TYPES.has(it.type) || it.type === 'matching') {
      special.push(it)
    }
  }

  // Pool de distractores: palabras de la sección (o las de la lección).
  const distractPool = (sectionWords.length ? sectionWords : words).filter(isWord)

  if (words.length === 0) {
    // Lección sin vocabulario (p. ej. solo frases): deja los especiales.
    return special.length ? shuffle(special, rng) : items
  }

  const shuffledWords = shuffle(words, rng)
  const exercises = []
  let used = 0

  // 1) Un emparejamiento (mitad de las veces con pronunciación, mitad con significado).
  if (shuffledWords.length >= 4) {
    const group = shuffledWords.slice(used, used + 5)
    const withPron = group.every((w) => w.pronunciation) && rng() < 0.5
    exercises.push(buildMatching(group, `ex-match-${seed}`, { pronunciation: withPron }))
    used += group.length
  }

  // 2) Una ronda relámpago si aún queda vocabulario.
  if (shuffledWords.length - used >= 3) {
    const group = shuffledWords.slice(used, used + 6)
    exercises.push(buildLightning(group, distractPool, rng, `ex-lightning-${seed}`))
    used += group.length
  }

  // 3) El vocabulario restante: cada palabra es Verdadero/Falso u Opción múltiple (aleatorio).
  for (let i = used; i < shuffledWords.length; i++) {
    const w = shuffledWords[i]
    const id = `ex-w${i}-${seed}`
    exercises.push(rng() < 0.5
      ? buildTrueFalse(w, distractPool, rng, id)
      : buildMultipleChoice(w, distractPool, rng, id))
  }

  // 4) Intercala los ejercicios especiales artesanales y baraja todo.
  return shuffle([...exercises, ...special], rng)
}
