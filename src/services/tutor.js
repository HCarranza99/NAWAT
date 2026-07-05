/**
 * tutor.js
 *
 * Cliente del tutor de IA. Llama a la edge function `nawat-tutor` (proxy a Claude,
 * con la API key segura del lado del servidor). El anclaje al corpus es POR LECCIÓN:
 * se envía el vocabulario de la lección actual como contexto para que el modelo solo
 * explique ese material y no invente náhuat.
 */

import { supabase } from '../lib/supabase'

/** Extrae el vocabulario verificado de la lección como contexto para el tutor. */
function buildContext(lesson) {
  const seen = new Set()
  const items = (lesson?.items || [])
    .filter((it) => it?.nahuat_word && it?.spanish_translation)
    .filter((it) => {
      const key = it.nahuat_word.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((it) => ({
      nahuat_word: it.nahuat_word,
      spanish_translation: it.spanish_translation,
      pronunciation: it.pronunciation,
      example_sentence: it.example_sentence,
      example_translation: it.example_translation,
    }))
  return { lessonTitle: lesson?.title ?? null, items }
}

/**
 * Envía el historial de la conversación al tutor y devuelve su respuesta.
 * @param {object} lesson - la lección actual (para el contexto del corpus)
 * @param {Array<{role:'user'|'assistant', content:string}>} messages
 * @returns {Promise<string>} el texto de respuesta del tutor
 * @throws si la función falla (el llamador muestra un mensaje amable)
 */
export async function askTutor(lesson, messages) {
  const { data, error } = await supabase.functions.invoke('nawat-tutor', {
    body: { context: buildContext(lesson), messages },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data?.reply ?? ''
}
