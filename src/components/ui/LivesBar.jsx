import { Heart } from 'lucide-react'

export default function LivesBar({ lives, max = 3 }) {
  return (
    <div
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#e3ded2] bg-white px-3 py-2 shadow-sm"
      aria-label={`${lives} vidas restantes`}
    >
      {Array.from({ length: max }, (_, index) => (
        <Heart
          key={index}
          className={`h-4 w-4 ${index < lives ? 'fill-[#d94848] text-[#d94848]' : 'text-[#d8ddd5]'}`}
        />
      ))}
    </div>
  )
}
