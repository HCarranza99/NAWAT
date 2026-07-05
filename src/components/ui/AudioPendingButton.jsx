import { VolumeX } from 'lucide-react'

/**
 * Botón de audio DESHABILITADO para palabras cuyo sonido el TTS no puede
 * reproducir bien (ver isTtsSafe en useTextToSpeech). Comunica que habrá audio
 * real más adelante, en vez de reproducir una pronunciación equivocada.
 */
export default function AudioPendingButton({ light = false, className = 'h-11 w-11', iconClassName = 'h-5 w-5' }) {
  return (
    <button
      type="button"
      disabled
      aria-label="Audio próximamente"
      title="Audio próximamente — este sonido del náhuat aún no tiene grabación"
      className={`inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-md border opacity-50 ${
        light ? 'border-white/20 bg-white/10 text-white' : 'border-[#d8ddd5] bg-[#f4f3ee] text-[#8b938c]'
      } ${className}`}
    >
      <VolumeX className={iconClassName} />
    </button>
  )
}
