import { describe, it, expect } from 'vitest'
import {
  defaultCard, gradeCard, recallProbability, isDue,
  srsKeyForItem, buildItemsByKey, buildReviewQueue, reviewStats, DAY_MS,
} from '../lib/srs'

const now = 1_000_000_000_000

describe('gradeCard', () => {
  it('crece la vida media con aciertos consecutivos', () => {
    const c1 = gradeCard(defaultCard(), true, now)
    expect(c1.halfLife).toBe(1)
    expect(c1.reps).toBe(1)
    const c2 = gradeCard(c1, true, now)
    expect(c2.halfLife).toBeGreaterThan(c1.halfLife)
    expect(c2.lapses).toBe(0)
  })

  it('un fallo desploma la vida media y cuenta el lapso', () => {
    const strong = { halfLife: 30, last: now, reps: 5, lapses: 0 }
    const after = gradeCard(strong, false, now)
    expect(after.halfLife).toBeLessThan(0.1)
    expect(after.lapses).toBe(1)
  })
})

describe('recallProbability', () => {
  it('una tarjeta nunca vista tiene probabilidad 0 (vencida)', () => {
    expect(recallProbability(defaultCard(), now)).toBe(0)
    expect(isDue(defaultCard(), now)).toBe(true)
  })

  it('cae a 0.5 tras una vida media', () => {
    const card = { halfLife: 2, last: now, reps: 1, lapses: 0 }
    const p = recallProbability(card, now + 2 * DAY_MS)
    expect(p).toBeCloseTo(0.5, 5)
  })
})

describe('srsKeyForItem', () => {
  it('prioriza srsKey y normaliza la palabra náhuat', () => {
    expect(srsKeyForItem({ srsKey: 'VOC_0001', nahuat_word: 'Se' })).toBe('k:voc_0001')
    expect(srsKeyForItem({ nahuat_word: '¿Ken tinemi?' })).toBe('k:ken tinemi')
    expect(srsKeyForItem({ type: 'matching', pairs: [] })).toBeNull()
  })
})

describe('buildReviewQueue', () => {
  const sections = [{
    id: 1,
    lessons: [{
      id: 'l1',
      items: [
        { id: 'a', type: 'flashcard', nahuat_word: 'At' },
        { id: 'b', type: 'multiple_choice_text', nahuat_word: 'At', options: [] },
        { id: 'c', type: 'flashcard', nahuat_word: 'Kal' },
      ],
    }],
    boss: { items: [] },
  }]

  it('elige el ejercicio de mayor recuperación por concepto', () => {
    const byKey = buildItemsByKey(sections)
    expect(byKey.get('k:at').type).toBe('multiple_choice_text')
  })

  it('está vacía si no hay nada visto', () => {
    const byKey = buildItemsByKey(sections)
    expect(buildReviewQueue(byKey, {}, { now })).toHaveLength(0)
  })

  it('prioriza lo más urgente y da ids únicos', () => {
    const byKey = buildItemsByKey(sections)
    const srs = {
      'k:at': { halfLife: 0.01, last: now - DAY_MS, reps: 1, lapses: 1 }, // muy vencida
      'k:kal': { halfLife: 100, last: now, reps: 3, lapses: 0 }, // fresca
    }
    const q = buildReviewQueue(byKey, srs, { size: 5, now })
    expect(q.length).toBe(2)
    expect(q[0].nahuat_word).toBe('At') // la más urgente primero
    const ids = new Set(q.map((x) => x.id))
    expect(ids.size).toBe(2)
  })

  it('reviewStats cuenta vistas y vencidas', () => {
    const byKey = buildItemsByKey(sections)
    const srs = {
      'k:at': { halfLife: 0.01, last: now - DAY_MS, reps: 1, lapses: 1 },
      'k:kal': { halfLife: 100, last: now, reps: 3, lapses: 0 },
    }
    const stats = reviewStats(byKey, srs, now)
    expect(stats.seen).toBe(2)
    expect(stats.due).toBe(1)
  })
})
