import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const tokenBase =
  'rounded-md border px-3.5 py-2.5 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

function BankToken({ token, hint, onAdd }) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="relative flex items-center gap-1">
      {showHint && hint && (
        <span className="absolute bottom-[calc(100%+8px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#102f29] px-3 py-2 text-xs font-bold text-white shadow-lg pointer-events-none animate-hint-pop after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-[#102f29] after:content-['']">
          {hint}
        </span>
      )}
      <button
        className={`${tokenBase} border-[#e3ded2] bg-white text-[#17211d] shadow-sm hover:border-[#1f7a57]/35 hover:bg-[#fbfaf7]`}
        onClick={() => onAdd(token)}
      >
        {token.w}
      </button>
      {hint && (
        <button
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#d8ddd5] bg-[#fbfaf7] text-[#1f7a57] transition active:scale-95"
          onClick={() => setShowHint((value) => !value)}
          aria-label={`Pista: ${hint}`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default function BuildSentence({ item, hints = {}, onCorrect, onWrong }) {
  const [bank, setBank] = useState(() =>
    shuffle(item.word_bank.map((word, index) => ({ w: word, key: `bank-${index}` })))
  )
  const [sentence, setSentence] = useState([])
  const [verified, setVerified] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)

  const addWord = (token) => {
    if (verified) return
    setSentence((current) => [...current, token])
    setBank((current) => current.filter((item) => item.key !== token.key))
  }

  const removeWord = (token) => {
    if (verified) return
    setBank((current) => [...current, token])
    setSentence((current) => current.filter((item) => item.key !== token.key))
  }

  const verify = () => {
    const built = sentence.map((token) => token.w).join(' ')
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
    ? 'border-[#e3ded2] bg-white'
    : isCorrect
      ? 'animate-bounce-in border-[#52b788] bg-[#f0fbf4]'
      : 'animate-shake border-[#e63946] bg-[#fff0f1]'

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div>
        <p className="exercise-instruction">{item.instruction}</p>
        <p className="mt-3 rounded-lg border border-[#e3ded2] bg-white px-4 py-3 text-center text-base font-bold italic text-[#46524a] shadow-sm">
          "{item.spanish_translation}"
        </p>
      </div>

      <div
        className={`min-h-[106px] rounded-lg border border-dashed p-3 transition-colors ${areaTone}`}
      >
        {sentence.length === 0 ? (
          <span className="flex h-full min-h-[78px] items-center justify-center text-center text-sm font-semibold text-[#8b938c]">
            Toca las palabras para ordenarlas
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sentence.map((token) => (
              <button
                key={token.key}
                className={`${tokenBase} border-[#1f7a57] bg-[#eef8f2] text-[#1f7a57] shadow-sm`}
                onClick={() => removeWord(token)}
              >
                {token.w}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[#e3ded2] bg-[#fbfaf7] p-3">
        <p className="mb-3 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">Banco de palabras</p>
        <div className="flex min-h-[52px] flex-wrap gap-2">
          {bank.map((token) => (
            <BankToken
              key={token.key}
              token={token}
              hint={hints[token.w]}
              onAdd={addWord}
            />
          ))}
        </div>
      </div>

      <button
        className="mt-auto rounded-lg bg-[#1f7a57] px-5 py-4 text-base font-black text-white shadow-[0_10px_22px_rgba(31,122,87,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#b8c3bc] disabled:shadow-none"
        onClick={verify}
        disabled={sentence.length === 0 || verified}
      >
        Verificar
      </button>
    </div>
  )
}
