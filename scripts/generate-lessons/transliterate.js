/**
 * Transliteración náhuat (ortografía IRIN) → guías de pronunciación.
 *
 * Genera dos campos que la app ya consume:
 *   - pronunciation     → guía silábica VISIBLE para el estudiante.
 *                         Respeta la ortografía (no cambia letras), solo silabea.
 *   - pronunciationText → cadena aproximada para el TTS en español.
 *                         Aplica solo las sustituciones CONSISTENTES observadas
 *                         en el contenido artesanal: kw→ku, w→u, tz→ts, sh→s.
 *
 * Decisión deliberada: NO se intenta una transcripción fonética "correcta"
 * (la pronunciación artesanal de referencia es irregular y el riesgo de
 * enseñar mal una lengua en peligro es alto). Todo lo generado se marca
 * verified:false para revisión humana posterior.
 *
 * Fuente de reglas: cabecera de src/data/sections/section1.js
 * (YULTAJTAKETZALIS — Pérez & Martínez, 2023).
 */

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'])
const DIGRAPHS = ['kw', 'tz', 'ch', 'sh']

const stripAccents = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')

const isVowel = (ch) => VOWELS.has(ch)

/** Parte una palabra en tokens (C o V), tratando los dígrafos como una sola C. */
function tokenize(word) {
  const lower = word.toLowerCase()
  const tokens = []
  let i = 0
  while (i < lower.length) {
    const two = lower.slice(i, i + 2)
    if (DIGRAPHS.includes(two)) {
      tokens.push({ type: 'C', text: two })
      i += 2
      continue
    }
    const ch = lower[i]
    tokens.push({ type: isVowel(ch) ? 'V' : 'C', text: ch })
    i += 1
  }
  return tokens
}

/**
 * Silabea una sola palabra ortográfica.
 * Regla CV: entre dos vocales, la última consonante es ataque de la sílaba
 * siguiente; las demás cierran la sílaba anterior. Hiato V.V se separa.
 */
function syllabifyWord(word) {
  const tokens = tokenize(word)
  const vowelIdx = tokens.map((t, idx) => (t.type === 'V' ? idx : -1)).filter((x) => x >= 0)
  if (vowelIdx.length === 0) return [tokens.map((t) => t.text).join('')]

  const syllables = []
  let start = 0
  for (let k = 0; k < vowelIdx.length; k++) {
    const v = vowelIdx[k]
    const nextV = vowelIdx[k + 1]
    let end
    if (nextV === undefined) {
      end = tokens.length // última sílaba: arrastra toda la coda final
    } else {
      const between = nextV - v - 1 // consonantes entre esta vocal y la siguiente
      // la última consonante del grupo es ataque de la sílaba siguiente
      end = between <= 0 ? v + 1 : nextV - 1
    }
    syllables.push(tokens.slice(start, end).map((t) => t.text).join(''))
    start = end
  }
  return syllables.filter(Boolean)
}

/** Limpia signos y separa una cadena (posiblemente multi-palabra) en palabras. */
function words(text) {
  return text
    .replace(/[¿?¡!.,;:"]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

/** Guía silábica visible: minúsculas, sílabas con guion, palabras con espacio. */
export function toPronunciation(text) {
  return words(text)
    .map((w) => syllabifyWord(w).join('-'))
    .join(' ')
}

/** Cadena para TTS español: sílabas separadas por espacio + sustituciones seguras. */
export function toPronunciationText(text) {
  const ttsWord = (w) => {
    let s = syllabifyWord(w).join(' ')
    s = s.replace(/kw/g, 'ku').replace(/tz/g, 'ts').replace(/sh/g, 's').replace(/w/g, 'u')
    return stripAccents(s)
  }
  return words(text).map(ttsWord).join(' ')
}

export { syllabifyWord }

const isMain = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('transliterate.js')

if (isMain) {
  const cases = [
    ['Tzaput', 'tza-put', 'tsa put'],
    ['Kwawit', 'kwa-wit', 'kua uit'],
    ['Nuteku', 'nu-te-ku', 'nu te ku'],
    ['Nutatanoy', 'nu-ta-ta-noy', 'nu ta ta noy'],
    ['Tesu datka', 'te-su dat-ka', 'te su dat ka'],
    ['Piltzín', 'pil-tzín', 'pil tsin'],
    ['Mistun', 'mis-tun', 'mis tun'],
    ['Pia', 'pi-a', 'pi a'],
  ]
  let ok = 0
  for (const [word, expP, expT] of cases) {
    const p = toPronunciation(word)
    const t = toPronunciationText(word)
    const pass = p === expP && t === expT
    if (pass) ok++
    console.log(`${pass ? 'OK ' : 'XX '} ${word.padEnd(14)} pron="${p}"  tts="${t}"  (esp pron="${expP}" tts="${expT}")`)
  }
  console.log(`\n${ok}/${cases.length} casos de control coinciden con la referencia artesanal.`)
}
