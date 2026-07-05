/**
 * Generador de lecciones — capa curricular.
 *
 * Transforma el corpus (docs/catalogo_extraido.json) en secciones con el MISMO
 * formato que la app ya renderiza (src/data/sections/*), aplicando reglas
 * pedagógicas. NO reescribe el contenido artesanal: lo respeta y deduplica
 * contra él, y rellena la pronunciación con scripts/generate-lessons/transliterate.js.
 *
 * Estrategia elegida por el usuario: ENRIQUECER.
 *   - Núcleo artesanal (secciones 1–5) intacto.
 *   - Se generan solo las palabras del catálogo que NO se enseñan a mano.
 *   - Cada ítem generado lleva generated:true y verified:false (revisión humana).
 *
 * Salida: src/data/sections/generated.js  (array de secciones)
 *
 * Uso:  node scripts/generate-lessons/generate.js
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { toPronunciation, toPronunciationText } from './transliterate.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')

const corpus = JSON.parse(readFileSync(resolve(ROOT, 'docs/catalogo_extraido.json'), 'utf8'))

// ── Metadatos visuales por unidad ───────────────────────────────────────────
// id = 5 + position → las secciones generadas continúan la numeración tras las
// 5 artesanales (6, 7, 8, 9, 10), manteniéndola única y secuencial.
const UNIT_META = {
  'u1-saludos': { icon: '👋', color: '#E76F51' },
  'u2-hogar': { icon: '🏠', color: '#2A9D8F' },
  'u3-acciones': { icon: '🍲', color: '#E9C46A' },
  'u4-naturaleza': { icon: '🌿', color: '#588157' },
  'u5-tiempo': { icon: '🕒', color: '#4361EE' },
}

const ARTISANAL_SECTIONS = 5
const CHUNK = 8 // ítems-base por microlección (más un emparejamiento opcional → ≤9)
const MIN_LESSON_ITEMS = 2
const MIN_SECTION_WORDS = 8 // mínimo para poder armar un boss de 8 ítems

// ── Conjunto de dedupe: palabras náhuat ya enseñadas a mano ──────────────────
async function loadArtisanalWords() {
  const mods = await Promise.all(
    [1, 2, 3, 4, 5].map((i) => import(pathToFileURL(resolve(ROOT, `src/data/sections/section${i}.js`)).href))
  )
  const set = new Set()
  for (const mod of mods) {
    const sec = mod.default
    const items = [
      ...(sec.lessons || []).flatMap((l) => l.items || []),
      ...((sec.boss && sec.boss.items) || []),
    ]
    for (const it of items) {
      if (it.nahuat_word) set.add(it.nahuat_word.toLowerCase().trim())
    }
  }
  return set
}

// ── Índices del corpus ───────────────────────────────────────────────────────
const itemBySlug = new Map(corpus.items.map((it) => [it.slug, it]))

const phraseWordsByPhrase = new Map()
for (const pw of corpus.phrase_words) {
  if (!phraseWordsByPhrase.has(pw.phrase_slug)) phraseWordsByPhrase.set(pw.phrase_slug, [])
  phraseWordsByPhrase.get(pw.phrase_slug).push(pw)
}
for (const arr of phraseWordsByPhrase.values()) arr.sort((a, b) => a.position - b.position)

// Mapa palabra→frase más corta que la contiene (para ejemplos en flashcards)
const exampleByWord = new Map()
for (const [phraseSlug, pws] of phraseWordsByPhrase) {
  const phrase = itemBySlug.get(phraseSlug)
  if (!phrase) continue
  for (const pw of pws) {
    const prev = exampleByWord.get(pw.word_slug)
    if (!prev || phrase.text_nawat.length < prev.text_nawat.length) {
      exampleByWord.set(pw.word_slug, phrase)
    }
  }
}

const lessonItemsByLesson = new Map()
for (const li of corpus.lesson_items) {
  if (!lessonItemsByLesson.has(li.lesson_slug)) lessonItemsByLesson.set(li.lesson_slug, [])
  lessonItemsByLesson.get(li.lesson_slug).push(li)
}
for (const arr of lessonItemsByLesson.values()) arr.sort((a, b) => a.position - b.position)

// Pools de distractores: traducciones al español por tema y por categoría
const wordItems = corpus.items.filter((it) => it.kind === 'word')
const distractorsByTopic = new Map()
const distractorsByPos = new Map()
for (const it of wordItems) {
  for (const topic of it.topics || []) {
    if (!distractorsByTopic.has(topic)) distractorsByTopic.set(topic, [])
    distractorsByTopic.get(topic).push(it.text_es)
  }
  if (!distractorsByPos.has(it.part_of_speech)) distractorsByPos.set(it.part_of_speech, [])
  distractorsByPos.get(it.part_of_speech).push(it.text_es)
}

// ── Utilidades ────────────────────────────────────────────────────────────────
let seed = 1337
const rand = () => {
  // PRNG determinista (mismas lecciones en cada build → reproducible)
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const uniq = (arr) => [...new Set(arr)]

function pickDistractors(item, n) {
  const answer = item.text_es
  let pool = []
  for (const topic of item.topics || []) pool.push(...(distractorsByTopic.get(topic) || []))
  if (pool.length < n + 1) pool.push(...(distractorsByPos.get(item.part_of_speech) || []))
  pool = uniq(pool).filter((t) => t && t !== answer)
  return shuffle(pool).slice(0, n)
}

// ── Constructores de ejercicios ────────────────────────────────────────────────
function buildFlashcard(item, id) {
  const card = {
    id,
    type: 'flashcard',
    nahuat_word: item.text_nawat,
    spanish_translation: item.text_es,
    pronunciation: toPronunciation(item.text_nawat),
    pronunciationText: toPronunciationText(item.text_nawat),
    generated: true,
    verified: false,
  }
  const example = exampleByWord.get(item.slug)
  if (example && example.text_nawat !== item.text_nawat) {
    card.example_sentence = example.text_nawat
    card.example_translation = example.text_es
  }
  return card
}

function buildMultipleChoice(item, id) {
  const distractors = pickDistractors(item, 3)
  if (distractors.length < 2) return buildFlashcard(item, id) // sin opciones suficientes
  const options = shuffle([
    { text: item.text_es, correct: true },
    ...distractors.map((t) => ({ text: t, correct: false })),
  ]).map((o, i) => ({ id: `o${i + 1}`, text: o.text, correct: o.correct }))
  return {
    id,
    type: 'multiple_choice_text',
    nahuat_word: item.text_nawat,
    spanish_translation: item.text_es,
    pronunciation: toPronunciation(item.text_nawat),
    pronunciationText: toPronunciationText(item.text_nawat),
    instruction: '¿Qué significa esta palabra?',
    options,
    generated: true,
    verified: false,
  }
}

function buildSentence(phrase, id) {
  const pws = phraseWordsByPhrase.get(phrase.slug) || []
  const correctOrder = pws.map((p) => p.surface_form)
  if (correctOrder.length < 2) return null

  // Banco = exactamente las palabras de la frase, barajadas (sin distractores),
  // para mantener la invariante word_bank ≡ correct_order del contenido artesanal.
  return {
    id,
    type: 'build_sentence',
    nahuat_word: phrase.text_nawat,
    spanish_translation: phrase.text_es,
    pronunciation: toPronunciation(phrase.text_nawat),
    pronunciationText: toPronunciationText(phrase.text_nawat),
    instruction: 'Ordena las palabras para formar la frase.',
    word_bank: shuffle(correctOrder),
    correct_order: correctOrder,
    generated: true,
    verified: false,
  }
}

function buildMatching(pairs, id) {
  const slice = pairs.slice(0, 5)
  if (slice.length < 3) return null
  return {
    id,
    type: 'matching',
    instruction: 'Une cada palabra náhuat con su significado.',
    pairs: slice,
    generated: true,
    verified: false,
  }
}

// ── Generación por unidad ────────────────────────────────────────────────────
async function generate() {
  const artisanalWords = await loadArtisanalWords()
  const sections = []
  const stats = { skippedDuplicate: 0, words: 0, phrases: 0, lessons: 0 }

  for (const unit of corpus.units) {
    const meta = UNIT_META[unit.slug]
    if (!meta) continue

    const unitLessons = corpus.lessons
      .filter((l) => l.unit_slug === unit.slug)
      .sort((a, b) => a.position - b.position)

    // 1) Reúne todos los ejercicios de la unidad en orden, deduplicando las
    //    palabras ya enseñadas a mano.
    const orderedExercises = []
    const sectionWordItems = [] // ítems de palabra DISTINTOS (para el boss)
    const seenWordKeys = new Set()

    for (const lesson of unitLessons) {
      for (const li of lessonItemsByLesson.get(lesson.slug) || []) {
        const item = itemBySlug.get(li.item_slug)
        if (!item) continue
        const idBase = `g-${lesson.slug}-${li.position}`

        if (item.kind === 'word') {
          const wkey = item.text_nawat.toLowerCase().trim()
          if (artisanalWords.has(wkey)) { stats.skippedDuplicate++; continue }
          orderedExercises.push(
            li.is_new
              ? buildFlashcard(item, `${idBase}-fc`)
              : buildMultipleChoice(item, `${idBase}-mc`)
          )
          stats.words++
          if (!seenWordKeys.has(wkey)) {
            seenWordKeys.add(wkey)
            sectionWordItems.push(item)
          }
        } else {
          const ex = buildSentence(item, `${idBase}-bs`)
          if (ex) { orderedExercises.push(ex); stats.phrases++ }
        }
      }
    }

    // Solo se genera la sección si hay vocabulario suficiente para un boss de 8.
    if (sectionWordItems.length < MIN_SECTION_WORDS) continue

    // 2) Trocea en microlecciones (≤ CHUNK ítems-base + 1 emparejamiento = ≤9).
    const lessons = []
    let chunkIdx = 0
    for (let i = 0; i < orderedExercises.length; i += CHUNK) {
      let items = orderedExercises.slice(i, i + CHUNK)

      // Último trozo muy pequeño → se fusiona con la lección anterior.
      if (items.length < MIN_LESSON_ITEMS && lessons.length) {
        lessons[lessons.length - 1].items.push(...items)
        break
      }

      // Refuerzo por recuperación: emparejamiento con palabras del propio trozo.
      const pairs = []
      const seenPair = new Set()
      for (const it of items) {
        if (it.type !== 'flashcard' && it.type !== 'multiple_choice_text') continue
        const k = it.nahuat_word.toLowerCase()
        if (seenPair.has(k)) continue
        seenPair.add(k)
        pairs.push({ nahuat: it.nahuat_word, spanish: it.spanish_translation })
      }
      if (pairs.length >= 4) {
        const m = buildMatching(shuffle(pairs), `g-${unit.slug}-m${chunkIdx}`)
        if (m) items = [...items, m]
      }

      chunkIdx++
      lessons.push({
        id: `g-${unit.slug}-l${chunkIdx}`,
        title: `${unit.title_es} · ${chunkIdx}`,
        icon: meta.icon,
        description: `Vocabulario nuevo de ${unit.title_es.toLowerCase()}`,
        color: meta.color,
        xpReward: Math.max(20, items.length * 6),
        items,
      })
      stats.lessons++
    }

    if (!lessons.length) continue

    // 3) Boss: repaso acumulativo (8 opción múltiple + 1 emparejamiento).
    const bossPool = shuffle(sectionWordItems)
    const bossItems = bossPool.slice(0, 8).map((it, i) => buildMultipleChoice(it, `g-${unit.slug}-boss-${i}`))
    const bossMatch = buildMatching(
      bossPool.slice(8, 13).map((it) => ({ nahuat: it.text_nawat, spanish: it.text_es })),
      `g-${unit.slug}-boss-match`
    )
    if (bossMatch) bossItems.push(bossMatch)

    sections.push({
      id: ARTISANAL_SECTIONS + unit.position,
      title: `${unit.title_es} (ampliación)`,
      description: `Amplía tu vocabulario de ${unit.title_es.toLowerCase()} con el diccionario completo`,
      icon: meta.icon,
      color: meta.color,
      lessons,
      boss: {
        id: `g-${unit.slug}-boss`,
        title: `Repaso: ${unit.title_es}`,
        icon: '👑',
        isBoss: true,
        description: 'Demuestra que dominas el vocabulario nuevo de esta sección',
        color: meta.color,
        xpReward: 120,
        items: bossItems,
      },
    })
  }

  return { sections, stats }
}

// ── Serialización ────────────────────────────────────────────────────────────
function serialize(sections) {
  const header = `/**
 * ARCHIVO GENERADO — no editar a mano.
 * Generado por scripts/generate-lessons/generate.js desde docs/catalogo_extraido.json.
 * Estrategia: ENRIQUECER (deduplicado contra el contenido artesanal de section1-5).
 * Todos los ítems llevan verified:false y requieren revisión de hablantes.
 *
 * Para regenerar:  node scripts/generate-lessons/generate.js
 */

const generatedSections = ${JSON.stringify(sections, null, 2)}

export default generatedSections
`
  return header
}

const { sections, stats } = await generate()
const out = resolve(ROOT, 'src/data/sections/generated.js')
writeFileSync(out, serialize(sections), 'utf8')

const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0)
const totalItems = sections.reduce(
  (a, s) => a + s.lessons.reduce((b, l) => b + l.items.length, 0) + (s.boss?.items.length || 0),
  0
)
console.log('Secciones generadas:', sections.length)
console.log('Lecciones:', totalLessons, '| Ítems (ejercicios):', totalItems)
console.log('Palabras nuevas:', stats.words, '| Frases:', stats.phrases)
console.log('Palabras omitidas por duplicado con lo artesanal:', stats.skippedDuplicate)
console.log('Escrito en:', out)
