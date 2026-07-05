/**
 * SRS — repaso espaciado adaptativo.
 *
 * Modelo tipo "half-life" (vida media), inspirado en el HLR de Duolingo pero
 * simplificado: cada tarjeta guarda una vida media (en días) que crece con cada
 * acierto y se desploma con cada fallo, de modo que lo que cuesta vuelve pronto
 * y lo dominado se espacia. La probabilidad de recordar decae con el tiempo:
 *
 *     p(recuerdo) = 2 ^ ( -díasTranscurridos / vidaMedia )
 *
 * Una tarjeta está "para repasar" cuando p < DUE_THRESHOLD. Es independiente del
 * tipo de ejercicio: se identifica por el concepto (palabra/frase), así una misma
 * palabra vista como flashcard, opción múltiple o dentro de una frase comparte
 * memoria. Esto es lo que conecta las microlecciones entre sí.
 */

export const DAY_MS = 86_400_000
export const DUE_THRESHOLD = 0.5

const INITIAL_HALF_LIFE = 1 // días, al primer acierto
const GROWTH = 2.2 // multiplicador de la vida media por acierto consecutivo
const MAX_HALF_LIFE = 365 // tope (1 año)
const LAPSE_HALF_LIFE = 0.007 // ~10 min: un fallo hace que vuelva casi enseguida

export function defaultCard() {
  return { halfLife: 0, last: null, reps: 0, lapses: 0 }
}

/** Aplica una respuesta (acierto/fallo) y devuelve el nuevo estado de la tarjeta. */
export function gradeCard(card, correct, now = Date.now()) {
  const c = card || defaultCard()
  if (correct) {
    const next = c.halfLife > 0 ? c.halfLife * GROWTH : INITIAL_HALF_LIFE
    return { halfLife: Math.min(MAX_HALF_LIFE, next), last: now, reps: c.reps + 1, lapses: c.lapses }
  }
  return { halfLife: LAPSE_HALF_LIFE, last: now, reps: c.reps + 1, lapses: c.lapses + 1 }
}

/** Probabilidad estimada de recordar ahora (0–1). Una tarjeta nunca vista → 0. */
export function recallProbability(card, now = Date.now()) {
  if (!card || !card.last || card.halfLife <= 0) return 0
  const elapsedDays = (now - card.last) / DAY_MS
  return Math.pow(2, -elapsedDays / card.halfLife)
}

export function isDue(card, now = Date.now()) {
  return recallProbability(card, now) < DUE_THRESHOLD
}

/**
 * Clave estable por concepto. Prioriza el slug del catálogo (srsKey) y cae a la
 * palabra náhuat normalizada para el contenido artesanal. Devuelve null si el
 * ítem no representa un concepto único (p. ej. emparejamientos).
 */
export function srsKeyForItem(item) {
  const raw = item?.srsKey || item?.nahuat_word
  if (!raw) return null
  return 'k:' + raw.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[¿?¡!.,;:"]/g, '')
}

const RETRIEVAL_PRIORITY = { multiple_choice_text: 3, build_sentence: 2, flashcard: 1 }

/**
 * Construye un mapa clave→ítem representativo a partir de las secciones, eligiendo
 * el ejercicio con mayor valor de recuperación (opción múltiple > frase > tarjeta).
 */
export function buildItemsByKey(sections) {
  const map = new Map()
  for (const sec of sections) {
    const all = [
      ...sec.lessons.flatMap((l) => l.items || []),
      ...((sec.boss && sec.boss.items) || []),
    ]
    for (const it of all) {
      if (it.type === 'matching') continue
      const key = srsKeyForItem(it)
      if (!key) continue
      const cur = map.get(key)
      if (!cur || (RETRIEVAL_PRIORITY[it.type] || 0) > (RETRIEVAL_PRIORITY[cur.type] || 0)) {
        map.set(key, it)
      }
    }
  }
  return map
}

/** Resumen para la UI: cuántas tarjetas vistas y cuántas tocan repasar. */
export function reviewStats(itemsByKey, srs, now = Date.now()) {
  let seen = 0
  let due = 0
  for (const key of Object.keys(srs || {})) {
    if (!itemsByKey.has(key)) continue
    seen++
    if (recallProbability(srs[key], now) < DUE_THRESHOLD) due++
  }
  return { seen, due }
}

/**
 * Cola de repaso interleaved. Prioriza lo más urgente (menor probabilidad de
 * recuerdo). Si no hay suficientes tarjetas vencidas, completa con las próximas
 * para que la sesión nunca quede vacía (sin esperas largas). Devuelve clones de
 * los ítems con id único.
 */
export function buildReviewQueue(itemsByKey, srs, { size = 12, now = Date.now() } = {}) {
  const seen = Object.keys(srs || {}).filter((k) => itemsByKey.has(k))
  if (!seen.length) return []

  const scored = seen
    .map((k) => ({ k, p: recallProbability(srs[k], now) }))
    .sort((a, b) => a.p - b.p)

  const due = scored.filter((s) => s.p < DUE_THRESHOLD)
  const chosen = (due.length >= size ? due : scored).slice(0, size)

  return chosen.map(({ k }, i) => {
    const base = itemsByKey.get(k)
    return { ...base, id: `rev-${i}-${base.id}` }
  })
}
