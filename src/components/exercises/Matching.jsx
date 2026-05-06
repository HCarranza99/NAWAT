import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const matchBase =
  'min-h-[56px] w-full rounded-md border px-3 py-3 text-center text-sm font-black leading-snug transition active:scale-[0.99] disabled:cursor-not-allowed'

export default function Matching({ item, onComplete }) {
  const [nahuatWords] = useState(() => shuffle(item.pairs.map((pair) => pair.nahuat)))
  const [spanishWords] = useState(() => shuffle(item.pairs.map((pair) => pair.spanish)))

  const [selNahuat, setSelNahuat] = useState(null)
  const [selSpanish, setSelSpanish] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrongFlash, setWrongFlash] = useState(false)

  useEffect(() => {
    if (!selNahuat || !selSpanish) return

    const pair = item.pairs.find((p) => p.nahuat === selNahuat)
    if (pair?.spanish === selSpanish) {
      setMatched((current) => [...current, selNahuat])
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
  }, [selNahuat, selSpanish, item.pairs])

  useEffect(() => {
    if (matched.length === item.pairs.length) {
      setTimeout(onComplete, 500)
    }
  }, [matched, item.pairs.length, onComplete])

  const isMatchedNahuat = (word) => matched.includes(word)
  const isMatchedSpanish = (word) =>
    matched.some((m) => item.pairs.find((pair) => pair.nahuat === m)?.spanish === word)

  const tone = (selected, done, wrong) => {
    if (done) {
      return 'border-[#52b788] bg-[#f0fbf4] text-[#1f7a57] opacity-75 shadow-sm'
    }
    if (wrong) {
      return 'animate-shake border-[#e63946] bg-[#fff0f1] text-[#b91c1c] shadow-sm'
    }
    if (selected) {
      return 'border-[#1f7a57] bg-[#eef8f2] text-[#1f7a57] shadow-sm'
    }
    return 'border-[#e3ded2] bg-white text-[#17211d] shadow-sm hover:border-[#1f7a57]/35 hover:bg-[#fbfaf7]'
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <p className="exercise-instruction">{item.instruction}</p>
        <p className="mt-1 text-sm font-medium text-[#6d756e]">Selecciona una palabra de cada columna para formar pares.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2.5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">Náhuat</p>
          {nahuatWords.map((word) => (
            <button
              key={word}
              className={`${matchBase} ${tone(
                selNahuat === word,
                isMatchedNahuat(word),
                wrongFlash && selNahuat === word,
              )}`}
              onClick={() => !isMatchedNahuat(word) && !wrongFlash && setSelNahuat(word)}
              disabled={isMatchedNahuat(word)}
            >
              {word}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">Español</p>
          {spanishWords.map((word) => (
            <button
              key={word}
              className={`${matchBase} ${tone(
                selSpanish === word,
                isMatchedSpanish(word),
                wrongFlash && selSpanish === word,
              )}`}
              onClick={() => !isMatchedSpanish(word) && !wrongFlash && setSelSpanish(word)}
              disabled={isMatchedSpanish(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between rounded-lg border border-[#e3ded2] bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#1f7a57]" />
          <p className="text-sm font-black text-[#17211d]">{matched.length}/{item.pairs.length} pares encontrados</p>
        </div>
        <div className="h-2 w-20 overflow-hidden rounded-full bg-[#e8ece6]">
          <div
            className="h-full rounded-full bg-[#1f7a57] transition-[width] duration-300"
            style={{ width: `${(matched.length / item.pairs.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
