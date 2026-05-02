/**
 * Unit tests — Section data integrity
 *
 * Validates that ALL sections follow the required schema,
 * have unique IDs, correct exercise structures, and valid
 * pronunciationText fields for TTS.
 */
import { describe, it, expect } from 'vitest'
import sections from '../data/sections'

const VALID_TYPES = ['flashcard', 'multiple_choice_text', 'matching', 'build_sentence']

describe('Sections data integrity', () => {

  it('exports a non-empty array', () => {
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBeGreaterThanOrEqual(1)
  })

  it('every section has required top-level fields', () => {
    sections.forEach((s) => {
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('title')
      expect(s).toHaveProperty('description')
      expect(s).toHaveProperty('icon')
      expect(s).toHaveProperty('color')
      expect(s).toHaveProperty('lessons')
      expect(s).toHaveProperty('boss')
      expect(Array.isArray(s.lessons)).toBe(true)
      expect(s.lessons.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('all section IDs are unique and sequential', () => {
    const ids = sections.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id, i) => expect(id).toBe(i + 1))
  })

  it('every lesson has required fields', () => {
    sections.forEach((s) => {
      s.lessons.forEach((l) => {
        expect(l).toHaveProperty('id')
        expect(l).toHaveProperty('title')
        expect(l).toHaveProperty('icon')
        expect(l).toHaveProperty('xpReward')
        expect(l).toHaveProperty('items')
        expect(Array.isArray(l.items)).toBe(true)
        expect(l.items.length).toBeGreaterThanOrEqual(2)
        expect(l.items.length).toBeLessThanOrEqual(10)
      })
    })
  })

  it('all lesson IDs are globally unique', () => {
    const ids = sections.flatMap((s) => s.lessons.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all item IDs are globally unique', () => {
    const ids = sections.flatMap((s) => [
      ...s.lessons.flatMap((l) => l.items.map((it) => it.id)),
      ...s.boss.items.map((it) => it.id),
    ])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every exercise item has a valid type', () => {
    sections.forEach((s) => {
      const allItems = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ]
      allItems.forEach((item) => {
        expect(VALID_TYPES).toContain(item.type)
      })
    })
  })

  it('flashcard items have nahuat_word and spanish_translation', () => {
    sections.forEach((s) => {
      const flashcards = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ].filter((it) => it.type === 'flashcard')

      flashcards.forEach((fc) => {
        expect(fc.nahuat_word).toBeTruthy()
        expect(fc.spanish_translation).toBeTruthy()
      })
    })
  })

  it('multiple_choice items have exactly one correct option', () => {
    sections.forEach((s) => {
      const mcItems = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ].filter((it) => it.type === 'multiple_choice_text')

      mcItems.forEach((mc) => {
        expect(mc.options).toBeDefined()
        expect(mc.options.length).toBeGreaterThanOrEqual(2)
        const correctCount = mc.options.filter((o) => o.correct).length
        expect(correctCount).toBe(1)
      })
    })
  })

  it('matching items have at least 2 pairs', () => {
    sections.forEach((s) => {
      const matchings = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ].filter((it) => it.type === 'matching')

      matchings.forEach((m) => {
        expect(m.pairs).toBeDefined()
        expect(m.pairs.length).toBeGreaterThanOrEqual(2)
        m.pairs.forEach((p) => {
          expect(p.nahuat).toBeTruthy()
          expect(p.spanish).toBeTruthy()
        })
      })
    })
  })

  it('build_sentence items have word_bank and correct_order', () => {
    sections.forEach((s) => {
      const builds = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ].filter((it) => it.type === 'build_sentence')

      builds.forEach((b) => {
        expect(b.word_bank).toBeDefined()
        expect(b.correct_order).toBeDefined()
        expect(b.word_bank.length).toBe(b.correct_order.length)
        // word_bank must contain the same words as correct_order
        const sorted1 = [...b.word_bank].sort()
        const sorted2 = [...b.correct_order].sort()
        expect(sorted1).toEqual(sorted2)
      })
    })
  })

  it('bosses have 8-10 items and isBoss flag', () => {
    sections.forEach((s) => {
      expect(s.boss.isBoss).toBe(true)
      expect(s.boss.items.length).toBeGreaterThanOrEqual(8)
      expect(s.boss.items.length).toBeLessThanOrEqual(10)
      expect(s.boss.xpReward).toBeGreaterThan(0)
    })
  })

  it('TTS: flashcard and MC items have pronunciationText', () => {
    sections.forEach((s) => {
      const ttsItems = [
        ...s.lessons.flatMap((l) => l.items),
        ...s.boss.items,
      ].filter((it) => it.type === 'flashcard' || it.type === 'multiple_choice_text')

      ttsItems.forEach((item) => {
        expect(item.pronunciationText || item.nahuat_word).toBeTruthy()
      })
    })
  })
})
