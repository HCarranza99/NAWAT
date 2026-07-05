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

  // Vocabulario LIMPIO = solo flashcards: ahí `nahuat_word` es náhuat real y
  // `pronunciation` es guía real. Los demás ejercicios (opción múltiple, matching,
  // frases…) se CONSERVAN tal cual — algunos artesanales vienen "invertidos"
  // (nahuat_word contiene el español), así que no se re-derivan para no ensuciarlos.
  const words = []
  const seen = new Set()
  const kept = []
  for (const it of items) {
    if (it.type === 'flashcard' && isWord(it)) {
      const k = norm(it.nahuat_word)
      if (!seen.has(k)) { seen.add(k); words.push(it) }
    } else if (it.type !== 'flashcard') {
      kept.push(it)
    }
  }

  if (words.length === 0) return items // sin flashcards: deja la lección como está

  const distractPool = (sectionWords.length ? sectionWords : words).filter(isWord)

  // Cada palabra → Verdadero/Falso u Opción múltiple (aleatorio). Cobertura completa.
  const perWord = shuffle(words, rng).map((w, i) => (
    rng() < 0.5
      ? buildTrueFalse(w, distractPool, rng, `ex-tf${i}-${seed}`)
      : buildMultipleChoice(w, distractPool, rng, `ex-mc${i}-${seed}`)
  ))

  // Extras (reforzando, sin consumir el vocabulario base): un emparejamiento y una
  // ronda relámpago si hay suficientes palabras.
  const extras = []
  if (words.length >= 4) {
    const grp = shuffle(words, rng).slice(0, 5)
    const withPron = grp.every((w) => w.pronunciation) && rng() < 0.5
    extras.push(buildMatching(grp, `ex-match-${seed}`, { pronunciation: withPron }))
    extras.push(buildLightning(shuffle(words, rng).slice(0, 6), distractPool, rng, `ex-lightning-${seed}`))
  }

  const all = shuffle([...perWord, ...extras, ...kept], rng)
  // Tope para que no sea eterno (pero sin recortar por debajo de lo que trae la lección).
  return all.slice(0, Math.min(all.length, 12))
}
