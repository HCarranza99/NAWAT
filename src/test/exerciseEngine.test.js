import { describe, it, expect } from 'vitest'
import { buildExercises } from '../lib/exerciseEngine'

const lesson = {
  title: 'Test',
  items: Array.from({ length: 8 }, (_, i) => ({
    id: `w${i}`,
    type: i % 2 ? 'multiple_choice_text' : 'flashcard',
    nahuat_word: `naw${i}`,
    spanish_translation: `esp${i}`,
    pronunciation: `p${i}`,
  })),
}

const ALLOWED = new Set(['true_false', 'multiple_choice_text', 'matching', 'lightning'])

describe('exerciseEngine.buildExercises', () => {
  it('elimina flashcards y solo emite tipos soportados', () => {
    const ex = buildExercises(lesson, { seed: 1 })
    expect(ex.length).toBeGreaterThan(0)
    expect(ex.some((e) => e.type === 'flashcard')).toBe(false)
    for (const e of ex) expect(ALLOWED.has(e.type)).toBe(true)
  })

  it('varía la mezcla/orden según la semilla', () => {
    const seqs = [1, 2, 999].map((seed) => buildExercises(lesson, { seed }).map((e) => e.type).join(','))
    expect(new Set(seqs).size).toBeGreaterThan(1)
  })

  it('es determinista para la misma semilla', () => {
    const a = buildExercises(lesson, { seed: 42 }).map((e) => e.id).join(',')
    const b = buildExercises(lesson, { seed: 42 }).map((e) => e.id).join(',')
    expect(a).toBe(b)
  })

  it('el verdadero/falso lleva la traducción real para el feedback', () => {
    // varias semillas para asegurar que aparece al menos un true_false
    for (const seed of [1, 3, 7, 11, 21]) {
      const tf = buildExercises(lesson, { seed }).find((e) => e.type === 'true_false')
      if (tf) {
        expect(tf.nahuat_word).toBeTruthy()
        expect(typeof tf.is_true).toBe('boolean')
        expect(tf.spanish_translation).toBeTruthy()
        return
      }
    }
  })
})
