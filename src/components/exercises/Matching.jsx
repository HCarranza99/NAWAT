import { useState, useEffect } from 'react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const matchBase =
  'py-3.5 px-2.5 rounded-sm text-[0.9rem] font-semibold border-2 transition-all text-center min-h-[52px] active:translate-y-px active:shadow-none'

export default function Matching({ item, onComplete }) {
  const [nahuatWords] = useState(() => shuffle(item.pairs.map((p) => p.nahuat)))
  const [spanishWords] = useState(() => shuffle(item.pairs.map((p) => p.spanish)))

  const [selNahuat, setSelNahuat] = useState(null)
  const [selSpanish, setSelSpanish] = useState(null)
  const [matched, setMatched] = useState([])   // matched nahuat words
  const [wrongFlash, setWrongFlash] = useState(false)

  // Check pair when both sides are selected
  useEffect(() => {
    if (!selNahuat || !selSpanish) return

    const pair = item.pairs.find((p) => p.nahuat === selNahuat)
    if (pair?.spanish === selSpanish) {
      setMatched((m) => [...m, selNahuat])
      setSelNahuat(null)
      setSelSpanish(null)
    } else {
      setWrongFlash(true)
      setTimeout(() => {
        setWrongFlash(false)
        setSelNahuat(null)
        setSelSpanish(null)
      }, 750)
    }
  }, [selNahuat, selSpanish])

  // Complete when all pairs matched
  useEffect(() => {
    if (matched.length === item.pairs.length) {
      setTimeout(onComplete, 500)
    }
  }, [matched])

  const isMatchedNahuat = (w) => matched.includes(w)
  const isMatchedSpanish = (w) =>
    matched.some((m) => item.pairs.find((p) => p.nahuat === m)?.spanish === w)

  const tone = (selected, done, wrong) => {
    if (done) {
      return 'border-nahuat-correct bg-nahuat-correct-bg text-primary opacity-70 pointer-events-none shadow-[0_2px_0_var(--nahuat-correct)]'
    }
    if (wrong) {
      return 'border-destructive bg-nahuat-wrong-bg text-destructive shadow-[0_2px_0_var(--destructive)] animate-shake'
    }
    if (selected) {
      return 'border-primary bg-secondary text-primary shadow-[0_2px_0_var(--primary)]'
    }
    return 'border-border bg-card text-foreground shadow-[0_2px_0_var(--border)]'
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="exercise-instruction">{item.instruction}</p>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-2.5">
          {nahuatWords.map((w) => (
            <button
              key={w}
              className={`${matchBase} ${tone(
                selNahuat === w,
                isMatchedNahuat(w),
                wrongFlash && selNahuat === w,
              )}`}
              onClick={() => !isMatchedNahuat(w) && !wrongFlash && setSelNahuat(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {spanishWords.map((w) => (
            <button
              key={w}
              className={`${matchBase} ${tone(
                selSpanish === w,
                isMatchedSpanish(w),
                wrongFlash && selSpanish === w,
              )}`}
              onClick={() => !isMatchedSpanish(w) && !wrongFlash && setSelSpanish(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-[0.8rem] text-muted-foreground font-semibold">
        {matched.length}/{item.pairs.length} pares encontrados
      </p>
    </div>
  )
}
