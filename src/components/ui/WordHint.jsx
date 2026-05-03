import { useState, useEffect } from 'react'

/**
 * Wraps a word making it tappable to reveal its translation.
 * Auto-hides after 2.5 seconds.
 */
export default function WordHint({ word, translation }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 2500)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <span className="relative inline-flex flex-col items-center">
      <span
        className="border-b-2 border-dotted border-primary cursor-pointer pb-0.5 select-none [-webkit-tap-highlight-color:transparent]"
        onClick={(e) => { e.stopPropagation(); setVisible((v) => !v) }}
        role="button"
        aria-label={`Pista: ${translation}`}
      >
        {word}
      </span>
      {visible && (
        <span
          className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-foreground text-card px-3.5 py-[7px] rounded-sm text-[0.9rem] font-semibold whitespace-nowrap z-20 pointer-events-none animate-hint-pop after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-foreground"
          role="tooltip"
        >
          {translation}
        </span>
      )}
    </span>
  )
}
