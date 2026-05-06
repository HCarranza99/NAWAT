import { useState, useCallback, useEffect } from 'react'

const VOWELS = 'aeiouáéíóú'
const KW_MARK = '§'

function isVowel(char = '') {
  return char.length === 1 && VOWELS.includes(char)
}

function applyKRule(word) {
  return [...word].map((char, index, chars) => {
    if (char !== 'k') return char

    const prev = chars[index - 1] || ''
    const next = chars[index + 1] || ''
    const soundsLikeG =
      index === 0 ||
      prev === 'n' ||
      (isVowel(prev) && isVowel(next))

    return soundsLikeG ? 'g' : 'k'
  }).join('')
}

function toSpeechWord(word) {
  const lower = word.toLowerCase().replace(/[’']/g, '')
  const withProtectedKw = lower.replace(/kw/g, KW_MARK)
  const withKRule = applyKRule(withProtectedKw)

  return withKRule
    .replaceAll(KW_MARK, 'ku')
    .replace(/tz/g, 'ts')
    .replace(/w/g, 'u')
    .replace(/y/g, 'i')
}

export function toNahuatSpeechText(text = '') {
  return String(text)
    .normalize('NFC')
    .replace(/[A-Za-zÁÉÍÓÚáéíóúÑñÜü’']+/g, toSpeechWord)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * useTextToSpeech(text)
 *
 * Wraps the Web Speech API (SpeechSynthesis) to pronounce a given text.
 * Uses a Spanish voice as a phonetic approximation for Náhuat words
 * while real audio recordings are not available.
 *
 * Returns { speak, isSpeaking, isSupported }
 */
export function useTextToSpeech(text) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Pick the best available Spanish voice.
  const getSpanishVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find((v) => v.lang === 'es-SV') ||
      voices.find((v) => v.lang === 'es-MX') ||
      voices.find((v) => v.lang === 'es-US') ||
      voices.find((v) => v.lang === 'es-ES') ||
      voices.find((v) => v.lang.startsWith('es')) ||
      null
    )
  }

  const speak = useCallback(() => {
    if (!isSupported || !text) return

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(toNahuatSpeechText(text))
    utterance.lang  = 'es-SV'
    utterance.rate  = 0.78
    utterance.pitch = 1.0

    // Assign voice if already loaded; voices may load async on first call
    const voice = getSpanishVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [text, isSupported])

  // Cancel speech if the component using this hook unmounts mid-speech
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
    }
  }, [isSupported])

  return { speak, isSpeaking, isSupported }
}
