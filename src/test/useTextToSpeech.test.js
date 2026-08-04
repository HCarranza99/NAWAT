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

  // El español no tiene /ʃ/ y el sintetizador lo resuelve como /s/. La lección 1
  // enseña la SH como uno de los tres sonidos que distinguen al náhuat, así que
  // reproducirla como /s/ destruye el contraste que se está enseñando.
  it('marks words with sh as unsafe (el español no produce /ʃ/)', () => {
    expect(isTtsSafe('Sh')).toBe(false)
    expect(isTtsSafe('Shiwit')).toBe(false)
    expect(isTtsSafe('Shiawa')).toBe(false)
    expect(isTtsSafe('Padiush')).toBe(false)
  })

  it('marks Spanish-renderable words as safe', () => {
    expect(isTtsSafe('Kal')).toBe(true)
    expect(isTtsSafe('At')).toBe(true)
    expect(isTtsSafe('Kwawit')).toBe(true) // kw→cua es fiel a la grafía #10
    expect(isTtsSafe('Nikuni')).toBe(true)
  })
})

/**
 * Regresión: el dígrafo KW debe llegar INTACTO desde los datos.
 *
 * toSpeechWord() protege "kw" antes de aplicar la regla K→G. Si un
 * pronunciationText llega pre-convertido a "ku", la protección no encuentra nada,
 * la regla ve una "k" inicial y la convierte en "g": la tarjeta que enseña el
 * sonido KW terminaba diciendo "gua" en lugar de "cua".
 */
describe('dígrafo KW en el contenido', () => {
  it('"kwa" se sintetiza como "kua", no como "gua"', () => {
    expect(toNahuatSpeechText('kwa')).toBe('kua')
    expect(toNahuatSpeechText('kwa uit')).toBe('kua uit')
  })

  it('la regla K→G sigue aplicándose donde corresponde', () => {
    expect(toNahuatSpeechText('kal')).toBe('gal')
    expect(toNahuatSpeechText('ken')).toBe('gen')
  })

  it('ningún pronunciationText del contenido artesanal empieza con "ku" de KW', async () => {
    const secs = await Promise.all(
      [1, 2, 3, 4, 5].map((n) => import(`../data/sections/section${n}.js`).then((m) => m.default)),
    )
    const sospechosos = []
    for (const s of secs) {
      for (const l of [...s.lessons, ...(s.boss ? [s.boss] : [])]) {
        for (const it of l.items || []) {
          if (!it.pronunciationText || !it.nahuat_word) continue
          // Si la palabra lleva KW, su cadena de voz debe conservar "kw".
          if (/kw/i.test(it.nahuat_word) && /\bku/i.test(it.pronunciationText)) {
            sospechosos.push(`${it.id}: ${it.nahuat_word} → "${it.pronunciationText}"`)
          }
        }
      }
    }
    expect(sospechosos).toEqual([])
  })
})
