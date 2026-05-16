/**
 * Unit tests — Questionnaire schema integrity
 *
 * The pretest/posttest items must align column-by-column with the
 * Supabase seed (supabase/migrations/001_questionnaires.sql) so the
 * dataset export view (v_dataset_wide) cuadra correctamente.
 *
 * These tests catch:
 *   - duplicate codes (collision in DB unique constraint)
 *   - duplicate order_index (data export ambiguity)
 *   - missing required fields per item_type
 *   - SUS polarity must alternate (positive on odd, negative on even)
 *     because that's what the SUS scoring formula assumes.
 */
import { describe, it, expect } from 'vitest'
import {
  PRETEST_ITEMS,
  POSTTEST_ITEMS,
  PRACTICE_ITEM,
  LIKERT_5_LABELS,
  LIKERT_5_SHORT_LABELS,
  CONSENT_VERSION,
  INTERVENTION_MS,
  INTERVENTION_MINUTES,
} from '../data/questionnaires'

const ALL_ITEMS = [...PRETEST_ITEMS, ...POSTTEST_ITEMS]

describe('Questionnaires — global integrity', () => {

  it('has the expected number of items after the instrument cotejo', () => {
    expect(PRETEST_ITEMS.length).toBe(35)
    expect(POSTTEST_ITEMS.length).toBe(17)
    expect(ALL_ITEMS.length).toBe(52)
  })

  it('every item code is globally unique across pretest+posttest', () => {
    const codes = ALL_ITEMS.map((it) => it.code)
    const dup = codes.filter((c, i) => codes.indexOf(c) !== i)
    expect(dup).toEqual([])
  })

  it('every item has a strictly positive order_index', () => {
    ALL_ITEMS.forEach((it) => {
      expect(typeof it.order_index).toBe('number')
      expect(it.order_index).toBeGreaterThan(0)
    })
  })

  it('order_index values are globally unique', () => {
    const idx = ALL_ITEMS.map((it) => it.order_index)
    expect(new Set(idx).size).toBe(idx.length)
  })

  it('phase is "pretest" or "posttest" for every item', () => {
    PRETEST_ITEMS.forEach((it) => expect(it.phase).toBe('pretest'))
    POSTTEST_ITEMS.forEach((it) => expect(it.phase).toBe('posttest'))
  })

  it('every item has a valid item_type', () => {
    const VALID = ['single_choice', 'likert_5', 'short_text', 'long_text']
    ALL_ITEMS.forEach((it) => {
      expect(VALID).toContain(it.item_type)
    })
  })

  it('single_choice items have at least 2 options with unique values', () => {
    ALL_ITEMS.filter((it) => it.item_type === 'single_choice').forEach((it) => {
      expect(Array.isArray(it.options)).toBe(true)
      expect(it.options.length).toBeGreaterThanOrEqual(2)
      const values = it.options.map((o) => o.value)
      expect(new Set(values).size).toBe(values.length)
    })
  })

  it('likert_5 items declare polarity (positive | negative)', () => {
    ALL_ITEMS.filter((it) => it.item_type === 'likert_5').forEach((it) => {
      expect(['positive', 'negative']).toContain(it.polarity)
    })
  })

  it('every required item has question_text', () => {
    ALL_ITEMS.forEach((it) => {
      expect(it.question_text).toBeTruthy()
      expect(typeof it.question_text).toBe('string')
    })
  })
})

describe('Questionnaires — instrument text cotejo', () => {
  it('includes the complete pretest section G items', () => {
    expect(PRETEST_ITEMS.filter((it) => it.section === 'G').map((it) => it.question_text)).toEqual([
      'Me identifico como descendiente o portador de la herencia pipil/náhuat.',
      'Me siento orgulloso(a) de las raíces indígenas de mi país o comunidad.',
      'Siento una conexión emocional con la historia y la cultura del pueblo náhuat.',
      'Considero que aprender el náhuat contribuye a preservar nuestra identidad cultural.',
    ])
  })

  it('shows posttest document codes instead of internal storage codes', () => {
    expect(POSTTEST_ITEMS.map((it) => it.display_code ?? it.code)).toEqual([
      'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10',
      'C1', 'C2', 'C3', 'C4', 'C5',
      'D1', 'D2',
    ])
  })

  it('keeps posttest traceability and comparison notes in the visible item text', () => {
    expect(POSTTEST_ITEMS.find((it) => it.display_code === 'C1')?.question_text)
      .toBe('Después de usar NAWAT, mi interés por aprender nociones básicas de náhuat ha aumentado. (Compara con D1 del pretest)')
    expect(POSTTEST_ITEMS.find((it) => it.display_code === 'C5')?.question_text)
      .toBe('Tras conocer la herramienta, ¿cuánto tiempo estarías dispuesto/a a dedicar por semana para seguir aprendiendo náhuat? (Compara con E3 del pretest para medir cambio de actitud real)')
  })
})

describe('Questionnaires — SUS (System Usability Scale)', () => {
  // SUS standard: items 1, 3, 5, 7, 9 are positive; 2, 4, 6, 8, 10 are negative.
  const SUS = POSTTEST_ITEMS.filter((it) => /^sus_b\d+$/.test(it.code))

  it('exactly 10 SUS items in posttest', () => {
    expect(SUS.length).toBe(10)
  })

  it('SUS items follow alternating polarity (1,3,5,7,9=positive — 2,4,6,8,10=negative)', () => {
    // sus_b1..sus_b10 in declaration order
    SUS.sort((a, b) => a.order_index - b.order_index)
    SUS.forEach((it, i) => {
      const isOdd = (i + 1) % 2 === 1 // 1-based item number
      expect(it.polarity).toBe(isOdd ? 'positive' : 'negative')
    })
  })

  it('all SUS items are required', () => {
    SUS.forEach((it) => expect(it.is_required).toBe(true))
  })
})

describe('Questionnaires — Likert labels', () => {

  it('exposes 5 long labels and 5 short labels', () => {
    expect(Object.keys(LIKERT_5_LABELS).length).toBe(5)
    expect(Object.keys(LIKERT_5_SHORT_LABELS).length).toBe(5)
  })

  it('label keys are 1..5', () => {
    [1, 2, 3, 4, 5].forEach((k) => {
      expect(LIKERT_5_LABELS[k]).toBeTruthy()
      expect(LIKERT_5_SHORT_LABELS[k]).toBeTruthy()
    })
  })
})

describe('Questionnaires — practice item', () => {

  it('PRACTICE_ITEM is a likert_5 with positive polarity', () => {
    expect(PRACTICE_ITEM.item_type).toBe('likert_5')
    expect(PRACTICE_ITEM.polarity).toBe('positive')
  })
})

describe('Intervention duration', () => {

  it('INTERVENTION_MS = INTERVENTION_MINUTES * 60_000', () => {
    expect(INTERVENTION_MS).toBe(INTERVENTION_MINUTES * 60_000)
  })

  // Sanity check: la intervención del estudio NAWAT está pensada como 15 min.
  // Si este test falla, alguien dejó un valor de debug en el archivo.
  it('intervention duration should be at least 10 minutes for a real study session', () => {
    expect(INTERVENTION_MINUTES).toBeGreaterThanOrEqual(10)
  })
})

describe('Consent', () => {
  it('exposes a non-empty CONSENT_VERSION', () => {
    expect(CONSENT_VERSION).toBeTruthy()
    expect(typeof CONSENT_VERSION).toBe('string')
  })
})
