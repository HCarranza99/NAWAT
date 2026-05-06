import Torogoz from './Torogoz'

/**
 * Torogoz en versión circular compacta — diseñado para usarse como logo
 * dentro del header del HomeScreen (u otras pantallas).
 *
 * Encaja el SVG del Torogoz (viewBox 320×195) dentro de un círculo blanco,
 * escalando para que se vea centrado. La animación idle del Torogoz se
 * preserva.
 */
export default function TorogozBadge({ size = 56 }) {
  return (
    <div
      className="flex items-center justify-center bg-background rounded-full overflow-hidden shrink-0 shadow-[0_3px_10px_rgba(0,0,0,0.18),inset_0_0_0_3px_rgba(255,255,255,0.35)] [&_.torogoz]:w-full [&_.torogoz]:h-auto [&_.torogoz]:translate-x-[-4%] [&_.torogoz]:translate-y-[6%] [&_.torogoz]:scale-110"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Torogoz emotion="idle" size={size * 1.4} />
    </div>
  )
}
