import { describe, it, expect } from 'vitest'
import { buildExercises, correctAnswerFor } from '../lib/exerciseEngine'

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

  it('excluye casi-sinónimos del pool como opción falsa ("Comer" vs "Comer (algo)")', () => {
    const takwaLesson = {
      title: 'Comida',
      items: [
        { id: 'f1', type: 'flashcard', nahuat_word: 'Takwa', spanish_translation: 'Comer', pronunciation: 'ta-kwa' },
      ],
    }
    const sectionWords = [
      { type: 'flashcard', nahuat_word: 'Takwa', spanish_translation: 'Comer' },
      { type: 'flashcard', nahuat_word: 'Kwa', spanish_translation: 'Comer (algo)' },
      { type: 'flashcard', nahuat_word: 'At', spanish_translation: 'Agua' },
      { type: 'flashcard', nahuat_word: 'Kal', spanish_translation: 'Casa' },
      { type: 'flashcard', nahuat_word: 'Pelu', spanish_translation: 'Perro' },
      { type: 'flashcard', nahuat_word: 'Tunal', spanish_translation: 'Sol' },
    ]
    for (let seed = 1; seed <= 40; seed++) {
      for (const e of buildExercises(takwaLesson, { seed, sectionWords })) {
        if (e.type === 'multiple_choice_text') {
          const texts = e.options.map((o) => o.text.toLowerCase())
          expect(texts).not.toContain('comer (algo)')
          // sin glosas repetidas entre opciones
          expect(new Set(texts).size).toBe(texts.length)
        }
        if (e.type === 'true_false' && !e.is_true) {
          expect(e.shown_translation.toLowerCase()).not.toBe('comer (algo)')
        }
      }
    }
  })

  it('correctAnswerFor devuelve la respuesta real de cada tipo', () => {
    // MC de producción (invertida): la respuesta vive en las opciones
    expect(correctAnswerFor({
      type: 'multiple_choice_text',
      nahuat_word: 'Adiós (me voy)',
      spanish_translation: '¿Cómo se dice al partir?',
      options: [{ id: 'a', text: 'Shiawa', correct: false }, { id: 'b', text: 'Niawa', correct: true }],
    })).toBe('Niawa')
    // active_recall: se escribe la palabra náhuat
    expect(correctAnswerFor({
      type: 'active_recall', nahuat_word: 'Nunan', spanish_translation: 'Mi mamá',
    })).toBe('Nunan')
    // build_sentence: el orden correcto
    expect(correctAnswerFor({
      type: 'build_sentence', spanish_translation: '¿Cómo estás?', correct_order: ['Ken', 'tinemi?'],
    })).toBe('Ken tinemi?')
    // true_false y demás: la traducción real
    expect(correctAnswerFor({
      type: 'true_false', spanish_translation: 'Agua', shown_translation: 'Perro',
    })).toBe('Agua')
  })
})
