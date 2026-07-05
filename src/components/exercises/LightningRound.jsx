import { useState, useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'

/**
 * Ronda relámpago: varias preguntas de opción múltiple contrarreloj.
 * item: { seconds, questions: [{ id, nahuat_word, spanish_translation, options }] }
 * onComplete(passed, results) — results: [{ nahuat_word, correct }] para el SRS.
 * Se aprueba con ≥60% de aciertos. No cuesta vidas (es un reto de ritmo).
 */
export default function LightningRound({ item, onComplete }) {
  const questions = item.questions || []
  const total = questions.length
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([]) // drive el display
  const [timeLeft, setTimeLeft] = useState(item.seconds || 30)
  const [flash, setFlash] = useState(null) // 'right' | 'wrong'
  const resultsRef = useRef([]) // espejo para el cierre del cronómetro
  const doneRef = useRef(false)

  const finish = (finalResults = resultsRef.current) => {
    if (doneRef.current) return
    doneRef.current = true
    const correct = finalResults.filter((r) => r.correct).length
    onComplete(correct >= Math.ceil(total * 0.6), finalResults)
  }

  // Cronómetro global.
  useEffect(() => {
    if (timeLeft <= 0) { finish(); return }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (option) => {
    if (doneRef.current || flash) return
    const q = questions[index]
    const next = [...resultsRef.current, { nahuat_word: q.nahuat_word, correct: !!option.correct }]
    resultsRef.current = next
    setResults(next)
    setFlash(option.correct ? 'right' : 'wrong')
    setTimeout(() => {
      setFlash(null)
      if (index + 1 >= total) finish(next)
      else setIndex((i) => i + 1)
    }, 220)
  }

  const q = questions[index]
  if (!q) return null
  const pct = Math.max(0, Math.round((timeLeft / (item.seconds || 30)) * 100))
  const correctCount = results.filter((r) => r.correct).length

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-[#f4a261]" />
        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#c77918]">Ronda relámpago</p>
        <span className="ml-auto text-sm font-black tabular-nums text-[#17211d]">{timeLeft}s</span>
      </div>

      {/* Barra de tiempo */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0ea]">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${pct < 25 ? 'bg-[#e63946]' : 'bg-[#f4a261]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#6d756e]">
        {index + 1}/{total} · {correctCount} ✓
      </p>

      <section className={`my-4 rounded-lg border bg-white p-6 text-center shadow-sm transition ${
        flash === 'right' ? 'border-[#52b788] bg-[#f0fbf4]' : flash === 'wrong' ? 'border-[#e63946] bg-[#fff0f1]' : 'border-[#e3ded2]'
      }`}>
        <h2 className="word-nahuat text-[#17211d]">{q.nahuat_word}</h2>
        {q.pronunciation && <span className="word-pronunciation">/{q.pronunciation}/</span>}
      </section>

      <div className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {q.options.map((option) => (
          <button
            key={option.id}
            onClick={() => answer(option)}
            disabled={!!flash}
            className="min-h-[60px] rounded-lg border border-[#e3ded2] bg-white px-4 py-3 text-left text-sm font-black text-[#17211d] shadow-sm transition hover:border-[#1f7a57]/35 hover:bg-[#fbfaf7] active:scale-[0.99] disabled:opacity-70"
          >
            {option.text}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-[#9aa39c]">Responde rápido — no cuesta vidas</p>
    </div>
  )
}
