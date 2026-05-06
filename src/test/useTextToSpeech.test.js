import { describe, expect, it } from 'vitest'
import { toNahuatSpeechText } from '../hooks/useTextToSpeech'

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
