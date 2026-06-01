import Torogoz from './Torogoz'

export default function TorogozBadge({ size = 56 }) {
  return (
    <div
      className="flex items-center justify-center bg-background rounded-full overflow-hidden shrink-0 shadow-[0_3px_10px_rgba(0,0,0,0.18),inset_0_0_0_3px_rgba(255,255,255,0.35)] [&_.torogoz]:w-full [&_.torogoz]:h-full"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Torogoz emotion="logo" size={size} />
    </div>
  )
}
