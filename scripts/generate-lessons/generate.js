/**
 * Generador de lecciones — capa curricular (MERGE POR TEMA).
 *
 * Transforma el corpus (docs/catalogo_extraido.json) en lecciones con el MISMO
 * formato que la app renderiza. Estrategia:
 *   - Núcleo artesanal (secciones 1–5) INTACTO; se deduplica contra él.
 *   - El vocabulario del catálogo se reparte por TEMA (topic) hacia la sección
 *     artesanal que le corresponde, como lecciones adicionales con TÍTULOS REALES.
 *   - Compacto: se exponen ~GEN_LESSONS_CAP lecciones generadas por sección; el
 *     resto del corpus queda sin usar (para agregar en el futuro).
 *   - Los temas de tiempo/espacio/números forman una sección 6 nueva.
 *   - Cada ítem generado lleva generated:true y verified:false (revisión humana).
 *
 * Salida: src/data/sections/generated.js  →  export default { bySection, extra }
 *   bySection[id] = lecciones a AÑADIR a la sección artesanal `id` (1–5)
 *   extra         = secciones nuevas completas (6: tiempo/espacio/números)
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

// ── Configuración curricular ─────────────────────────────────────────────────
const CHUNK = 8               // ítems (palabras) por microlección, antes del matching
const GEN_LESSONS_CAP = 6     // lecciones generadas máx. por sección artesanal (1–5)
const SECTION6_LESSONS_CAP = 8 // lecciones de la sección nueva (tiempo/espacio/números)

// Un topic del corpus define a qué sección va la palabra, con qué etiqueta se
// titula la lección, y un emoji. `place`/`numbers`/`time` alimentan la sección 6.
const TOPIC_MAP = {
  greetings: { section: 1, label: 'Saludos',           icon: '👋' },
  family:    { section: 2, label: 'La familia',        icon: '👨‍👩‍👧' },
  home:      { section: 2, label: 'En casa',           icon: '🏠' },
  food:      { section: 3, label: 'Comida y bebida',   icon: '🍲' },
  nature:    { section: 4, label: 'La naturaleza',     icon: '🌿' },
  animals:   { section: 4, label: 'Animales',          icon: '🐾' },
  actions:   { section: 5, label: 'Verbos y acciones', icon: '🏃' },
  numbers:   { section: 6, label: 'Números',           icon: '🔢' },
  time:      { section: 6, label: 'El tiempo',         icon: '🕒' },
  place:     { section: 6, label: 'Lugares',           icon: '📍' },
}
// Al elegir el tema de una palabra con varios topics, prioriza el MÁS específico
// (así una palabra [nature, actions] cae en Naturaleza, no en el cajón de Acciones).
const TOPIC_PRECEDENCE = ['numbers', 'time', 'food', 'family', 'home', 'animals', 'nature', 'greetings', 'place', 'actions']

const SECTION6 = { id: 6, title: 'Tiempo, espacio y números', icon: '🕒', color: '#4361EE', description: 'Cuenta, ubícate y habla del tiempo en náhuat' }

// ── Carga del contenido artesanal (dedupe + colores por sección) ──────────────
async function loadArtisanal() {
  const mods = await Promise.all(
    [1, 2, 3, 4, 5].map((i) => import(pathToFileURL(resolve(ROOT, `src/data/sections/section${i}.js`)).href))
  )
  const words = new Set()
  const meta = {}
  mods.forEach((mod) => {
    const sec = mod.default
    meta[sec.id] = { color: sec.color, icon: sec.icon }
    const items = [
      ...(sec.lessons || []).flatMap((l) => l.items || []),
      ...((sec.boss && sec.boss.items) || []),
    ]
    for (const it of items) if (it.nahuat_word) words.add(it.nahuat_word.toLowerCase().trim())
  })
  meta[6] = { color: SECTION6.color, icon: SECTION6.icon }
  return { words, meta }
}

// ── Índices del corpus (para ejemplos y distractores) ─────────────────────────
const itemBySlug = new Map(corpus.items.map((it) => [it.slug, it]))

const phraseWordsByPhrase = new Map()
for (const pw of corpus.phrase_words) {
  if (!phraseWordsByPhrase.has(pw.phrase_slug)) phraseWordsByPhrase.set(pw.phrase_slug, [])
  phraseWordsByPhrase.get(pw.phrase_slug).push(pw)
}
const exampleByWord = new Map()
for (const [phraseSlug, pws] of phraseWordsByPhrase) {
  const phrase = itemBySlug.get(phraseSlug)
  if (!phrase) continue
  for (const pw of pws) {
    const prev = exampleByWord.get(pw.word_slug)
    if (!prev || phrase.text_nawat.length < prev.text_nawat.length) exampleByWord.set(pw.word_slug, phrase)
  }
}

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

// ── Utilidades deterministas ──────────────────────────────────────────────────
let seed = 1337
const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const uniq = (arr) => [...new Set(arr)]
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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
    id, type: 'flashcard',
    nahuat_word: item.text_nawat, spanish_translation: item.text_es,
    pronunciation: toPronunciation(item.text_nawat), pronunciationText: toPronunciationText(item.text_nawat),
    generated: true, verified: false,
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
  if (distractors.length < 2) return buildFlashcard(item, id)
  const options = shuffle([
    { text: item.text_es, correct: true },
    ...distractors.map((t) => ({ text: t, correct: false })),
  ]).map((o, i) => ({ id: `o${i + 1}`, text: o.text, correct: o.correct }))
  return {
    id, type: 'multiple_choice_text',
    nahuat_word: item.text_nawat, spanish_translation: item.text_es,
    pronunciation: toPronunciation(item.text_nawat), pronunciationText: toPronunciationText(item.text_nawat),
    instruction: '¿Qué significa esta palabra?', options,
    generated: true, verified: false,
  }
}

function buildMatching(pairs, id) {
  const slice = pairs.slice(0, 5)
  if (slice.length < 3) return null
  return { id, type: 'matching', instruction: 'Une cada palabra náhuat con su significado.', pairs: slice, generated: true, verified: false }
}

/** Arma los ítems de una microlección: alterna flashcard/opción múltiple + un emparejamiento. */
function buildLessonItems(words, idPrefix) {
  const items = words.map((it, i) =>
    i % 2 === 0 ? buildFlashcard(it, `${idPrefix}-${i}-fc`) : buildMultipleChoice(it, `${idPrefix}-${i}-mc`)
  )
  const pairs = words
    .filter((it) => it.text_nawat && it.text_es)
    .map((it) => ({ nahuat: it.text_nawat, spanish: it.text_es }))
  if (pairs.length >= 4) {
    const m = buildMatching(shuffle(pairs), `${idPrefix}-m`)
    if (m) items.push(m)
  }
  return items
}

// ── Generación por tema ────────────────────────────────────────────────────────
async function generate() {
  const { words: artisanalWords, meta } = await loadArtisanal()
  const stats = { assigned: 0, skippedDuplicate: 0, skippedNoTopic: 0, lessons: 0 }

  // 1) Asigna cada palabra del corpus a (sección, tema), deduplicando.
  //    Estructura: byTheme[sectionId][topic] = [items...]
  const byTheme = {}
  const seenWord = new Set()
  for (const it of wordItems) {
    const wkey = (it.text_nawat || '').toLowerCase().trim()
    if (!wkey) continue
    if (artisanalWords.has(wkey)) { stats.skippedDuplicate++; continue }
    if (seenWord.has(wkey)) continue
    const topic = TOPIC_PRECEDENCE.find((t) => (it.topics || []).includes(t) && TOPIC_MAP[t])
    if (!topic) { stats.skippedNoTopic++; continue }
    seenWord.add(wkey)
    const { section } = TOPIC_MAP[topic]
    byTheme[section] ??= {}
    byTheme[section][topic] ??= []
    byTheme[section][topic].push(it)
    stats.assigned++
  }

  // 2) Convierte cada sección en lecciones tituladas por tema (fáciles primero),
  //    capando el total por sección.
  const buildSectionLessons = (sectionId, cap) => {
    const themes = byTheme[sectionId] || {}
    const color = meta[sectionId]?.color || '#1f7a57'
    // Prepara lecciones-candidatas por tema (fáciles primero, ≥2 ítems por lección).
    const perTopic = Object.keys(themes)
      .sort((a, b) => themes[b].length - themes[a].length)
      .map((topic) => {
        const { label, icon } = TOPIC_MAP[topic]
        const words = [...themes[topic]].sort((a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99))
        const chunks = []
        for (let i = 0; i < words.length; i += CHUNK) {
          const c = words.slice(i, i + CHUNK)
          if (c.length >= 2) chunks.push(c)
        }
        return { topic, label, icon, chunks }
      })
      .filter((t) => t.chunks.length)

    // Round-robin entre temas: cada tema aporta una lección por ronda, para que la
    // sección muestre variedad ("La familia", "En casa", …) en vez de un solo tema.
    const lessons = []
    for (let round = 0; lessons.length < cap && perTopic.some((t) => t.chunks.length > round); round++) {
      for (const t of perTopic) {
        if (lessons.length >= cap) break
        const chunk = t.chunks[round]
        if (!chunk) continue
        const title = t.chunks.length > 1 ? `${t.label} · ${round + 1}` : t.label
        const idBase = `g-s${sectionId}-${slugify(t.topic)}-${round + 1}`
        lessons.push({
          id: idBase, title: title, icon: t.icon,
          description: `Vocabulario nuevo: ${t.label.toLowerCase()}`,
          color,
          xpReward: Math.max(20, chunk.length * 6),
          items: buildLessonItems(chunk, idBase),
        })
        stats.lessons++
      }
    }
    return lessons
  }

  const bySection = {}
  for (const id of [1, 2, 3, 4, 5]) {
    const lessons = buildSectionLessons(id, GEN_LESSONS_CAP)
    if (lessons.length) bySection[id] = lessons
  }

  // 3) Sección 6 (nueva): tiempo/espacio/números, con su propio boss.
  const s6Lessons = buildSectionLessons(6, SECTION6_LESSONS_CAP)
  const extra = []
  if (s6Lessons.length) {
    const s6Words = Object.values(byTheme[6] || {}).flat()
    const bossPool = shuffle(s6Words)
    const bossItems = bossPool.slice(0, 8).map((it, i) => buildMultipleChoice(it, `g-s6-boss-${i}`))
    const bossMatch = buildMatching(bossPool.slice(8, 13).map((it) => ({ nahuat: it.text_nawat, spanish: it.text_es })), 'g-s6-boss-m')
    if (bossMatch) bossItems.push(bossMatch)
    extra.push({
      ...SECTION6,
      lessons: s6Lessons,
      boss: { id: 'g-s6-boss', title: `Repaso: ${SECTION6.title}`, icon: '👑', isBoss: true, description: 'Demuestra que dominas números, lugares y tiempo', color: SECTION6.color, xpReward: 120, items: bossItems },
    })
  }

  return { output: { bySection, extra }, stats }
}

// ── Serialización ──────────────────────────────────────────────────────────────
function serialize(output) {
  return `/**
 * ARCHIVO GENERADO — no editar a mano.
 * Generado por scripts/generate-lessons/generate.js desde docs/catalogo_extraido.json.
 * Estrategia: MERGE POR TEMA. \`bySection[id]\` = lecciones a añadir a la sección
 * artesanal \`id\`; \`extra\` = secciones nuevas completas. Todos los ítems llevan
 * verified:false y requieren revisión de hablantes.
 *
 * Para regenerar:  node scripts/generate-lessons/generate.js
 */

const generated = ${JSON.stringify(output, null, 2)}

export default generated
`
}

const { output, stats } = await generate()
writeFileSync(resolve(ROOT, 'src/data/sections/generated.js'), serialize(output), 'utf8')

const foldedLessons = Object.values(output.bySection).reduce((a, l) => a + l.length, 0)
const extraLessons = output.extra.reduce((a, s) => a + s.lessons.length, 0)
console.log('Palabras asignadas:', stats.assigned, '| duplicadas (omitidas):', stats.skippedDuplicate, '| sin topic:', stats.skippedNoTopic)
console.log('Lecciones generadas (dentro del cap):', stats.lessons)
console.log('  · añadidas a secciones 1–5:', foldedLessons)
console.log('  · sección 6 nueva:', extraLessons, '(+ boss)')
for (const [id, lessons] of Object.entries(output.bySection)) {
  console.log(`  sección ${id}: ${lessons.map((l) => `"${l.title}"`).join(', ')}`)
}
for (const s of output.extra) {
  console.log(`  sección ${s.id} "${s.title}": ${s.lessons.map((l) => `"${l.title}"`).join(', ')}`)
}
