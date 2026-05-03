export default function LivesBar({ lives, max = 3 }) {
  return (
    <div className="flex gap-0.5 shrink-0" aria-label={`${lives} vidas restantes`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className="text-base">
          {i < lives ? '❤️' : '🩶'}
        </span>
      ))}
    </div>
  )
}
