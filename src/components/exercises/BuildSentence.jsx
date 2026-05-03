import { useState } from 'react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const tokenBase =
  'py-2 px-3.5 rounded-lg text-[0.9rem] font-semibold border-2 transition-all active:translate-y-0.5 active:shadow-none'

function BankToken({ token, hint, onAdd }) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="relative flex flex-col items-center">
      {showHint && hint && (
        <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-foreground text-card px-2.5 py-[5px] rounded-lg text-[0.8rem] font-semibold whitespace-nowrap z-20 pointer-events-none animate-hint-pop after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-foreground">
          {hint}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        <button
          className={`${tokenBase} bg-card text-foreground border-border shadow-[0_2px_0_var(--border)]`}
          onClick={() => onAdd(token)}
        >
          {token.w}
        </button>
        {hint && (
          <button
            className="w-[18px] h-[18px] rounded-full border-[1.5px] border-primary bg-transparent text-primary text-[0.65rem] font-extrabold leading-none cursor-pointer shrink-0 flex items-center justify-center [-webkit-tap-highlight-color:transparent]"
            onClick={() => setShowHint((v) => !v)}
            aria-label={`Pista: ${hint}`}
          >
            ?
          </button>
        )}
      </div>
    </div>
  )
}

export default function BuildSentence({ item, hints = {}, onCorrect, onWrong }) {
  const [bank, setBank] = useState(() =>
    shuffle(item.word_bank.map((w, i) => ({ w, key: `bank-${i}` })))
  )
  const [sentence, setSentence] = useState([])
  const [verified, setVerified] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)

  const addWord = (token) => {
    if (verified) return
    setSentence((s) => [...s, token])
    setBank((b) => b.filter((t) => t.key !== token.key))
  }

  const removeWord = (token) => {
    if (verified) return
    setBank((b) => [...b, token])
    setSentence((s) => s.filter((t) => t.key !== token.key))
  }

  const verify = () => {
    const built = sentence.map((t) => t.w).join(' ')
    const target = item.correct_order.join(' ')
    const correct = built === target
    setIsCorrect(correct)
    setVerified(true)
    if (correct) {
      onCorrect()
    } else {
      onWrong()
    }
  }

  const areaTone = !verified
    ? 'border-border bg-card'
    : isCorrect
      ? 'border-nahuat-correct bg-nahuat-correct-bg animate-bounce-in'
      : 'border-destructive bg-nahuat-wrong-bg animate-shake'

  return (
    <div className="flex flex-col gap-[18px]">
      <p className="exercise-instruction">{item.instruction}</p>
      <p className="text-center text-base text-muted-foreground italic">"{item.spanish_translation}"</p>

      <div
        className={`min-h-[72px] border-2 border-dashed rounded-sm p-3 flex flex-wrap gap-2 items-center transition-colors ${areaTone}`}
      >
        {sentence.length === 0 ? (
          <span className="text-muted-foreground text-[0.85rem] w-full text-center">
            Toca las palabras para ordenarlas
          </span>
        ) : (
          sentence.map((token) => (
            <button
              key={token.key}
              className={`${tokenBase} bg-secondary text-primary border-primary shadow-[0_2px_0_var(--primary)]`}
              onClick={() => removeWord(token)}
            >
              {token.w}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[48px]">
        {bank.map((token) => (
          <BankToken
            key={token.key}
            token={token}
            hint={hints[token.w]}
            onAdd={addWord}
          />
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={verify}
        disabled={sentence.length === 0 || verified}
      >
        Verificar
      </button>
    </div>
  )
}
