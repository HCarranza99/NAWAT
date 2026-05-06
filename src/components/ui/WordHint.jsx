import { useState, useEffect } from 'react'

export default function WordHint({ word, translation }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(timeout)
  }, [visible])

  return (
    <span className="relative inline-flex flex-col items-center">
      <span
        className="cursor-pointer select-none border-b-2 border-dotted border-[#1f7a57] pb-0.5 [-webkit-tap-highlight-color:transparent]"
        onClick={(event) => { event.stopPropagation(); setVisible((value) => !value) }}
        role="button"
        aria-label={`Pista: ${translation}`}
      >
        {word}
      </span>
      {visible && (
        <span
          className="absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#102f29] px-3 py-2 text-sm font-bold text-white shadow-lg pointer-events-none animate-hint-pop after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-[#102f29] after:content-['']"
          role="tooltip"
        >
          {translation}
        </span>
      )}
    </span>
  )
}
