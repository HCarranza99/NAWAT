import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, X } from 'lucide-react'

import Torogoz from './Torogoz'
import { askTutor } from '../../services/tutor'

/**
 * Panel de chat del tutor de IA, anclado a la lección actual.
 * Se abre desde la lección (LessonRunner). Mantiene su propio historial mientras
 * está montado; el contexto del corpus se toma de `lesson`.
 */
export default function TutorChat({ lesson, open, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll al último mensaje.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Foco en el input al abrir.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) return null

  const send = async (text) => {
    const content = text.trim()
    if (!content || loading) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await askTutor(
        lesson,
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
      )
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || 'No tengo una respuesta para eso ahora.' }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ups, no pude conectarme. Revisa tu internet e inténtalo de nuevo.', isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    '¿Cómo se pronuncia esta palabra?',
    'Explícame el significado',
    'Dame un ejemplo',
  ]

  return (
    <div className="fixed inset-0 z-[400] flex flex-col justify-end bg-black/40 backdrop-blur-sm sm:items-center sm:justify-center">
      {/* Backdrop cierra al tocar fuera */}
      <button
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Cerrar tutor"
      />

      <section className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl border border-hairline bg-surface-cream shadow-[0_-8px_40px_rgba(16,47,41,0.28)] sm:h-[560px] sm:max-w-[440px] sm:rounded-3xl">
        {/* Encabezado */}
        <header className="flex items-center gap-3 border-b border-hairline bg-white px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dff3e7]">
            <Torogoz emotion="greeting" size={40} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-black text-[#17211d]">
              Tutor Nawat <Sparkles className="h-3.5 w-3.5 text-[#f4a261]" />
            </p>
            <p className="truncate text-[0.7rem] font-semibold text-[#6d756e]">
              {lesson?.title || 'Pregúntame sobre esta lección'}
            </p>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#46524a] transition active:scale-95"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="mt-2 rounded-2xl border border-[#9ddfc6]/40 bg-[#eef8f2] p-4 text-sm font-semibold leading-snug text-[#102f29]">
              <p className="mb-1 font-black">¡Hola! Soy tu tutor. 🌿</p>
              <p className="text-[#2d4d44]">
                Puedo ayudarte con las palabras de esta lección: su significado, pronunciación y ejemplos.
                Solo explico lo que estás aprendiendo aquí.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm font-medium leading-snug shadow-sm ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-[#1f7a57] text-white'
                    : m.isError
                      ? 'rounded-bl-md border border-[#e63946]/30 bg-[#fff0f1] text-[#b91c1c]'
                      : 'rounded-bl-md border border-hairline bg-white text-[#17211d]'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-hairline bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa39c] [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa39c] [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa39c]" />
              </div>
            </div>
          )}
        </div>

        {/* Sugerencias (solo al inicio) */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-[#1f7a57]/25 bg-[#eef8f2] px-3 py-1.5 text-[0.72rem] font-bold text-[#1f7a57] transition active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Entrada */}
        <form
          className="flex items-center gap-2 border-t border-hairline bg-white px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta…"
            disabled={loading}
            className="min-w-0 flex-1 rounded-full border border-[#d8ddd5] bg-[#f7f5ef] px-4 py-2.5 text-sm font-medium text-[#17211d] outline-none focus:border-[#1f7a57] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f7a57] text-white shadow-sm transition active:scale-95 disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </section>
    </div>
  )
}
