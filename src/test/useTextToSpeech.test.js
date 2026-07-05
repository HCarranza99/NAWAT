import { describe, expect, it } from 'vitest'
import { toNahuatSpeechText, isTtsSafe } from '../hooks/useTextToSpeech'

describe('toNahuatSpeechText', () => {
  it('applies the Witzapan K rule for Spanish speech synthesis', () => {
    expect(toNahuatSpeechText('Ken Kal Nikuchi')).toBe('gen gal niguchi')
  })

  it('keeps KW as a cu-like sound before other substitutions', () => {
    expect(toNahuatSpeechText('Kwawit takwa nikwa')).toBe('kuauit takua nikua')
  })

  it('approximates the special SH, TZ, W, and Y graphemes', () => {
    expect(toNahuatSpeechText('Shiawa Tzaput Yek')).toBe('shiaua tsaput iek')
  })
})

describe('isTtsSafe', () => {
  it('marks words with tz or tl as unsafe (motor deletrea /ts/, /tɬ/)', () => {
    expect(isTtsSafe('Tzaput')).toBe(false)
    expect(isTtsSafe('Sijsiwapíltzin')).toBe(false)
    expect(isTtsSafe('Tz')).toBe(false)
    expect(isTtsSafe('atl')).toBe(false)
  })

  it('marks Spanish-renderable words as safe', () => {
    expect(isTtsSafe('Kal')).toBe(true)
    expect(isTtsSafe('At')).toBe(true)
    expect(isTtsSafe('Shiwit')).toBe(true) // sh→s es aproximación tolerable
    expect(isTtsSafe('Kwawit')).toBe(true) // kw→cua es aproximación tolerable
  })
})
