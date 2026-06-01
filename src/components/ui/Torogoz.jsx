import cansado from '../../assets/mascota/webp/CANSADO.webp'
import celebrando from '../../assets/mascota/webp/CELEBRANDO.webp'
import explicando from '../../assets/mascota/webp/EXPLICANDO.webp'
import feliz from '../../assets/mascota/webp/FELIZ.webp'
import idle from '../../assets/mascota/webp/IDLE.webp'
import leyendo from '../../assets/mascota/webp/LEYENDO.webp'
import logo from '../../assets/mascota/webp/LOGO.webp'
import logroDesbloqueado from '../../assets/mascota/webp/LOGRO_DESBLOQUEADO.webp'
import orgulloso from '../../assets/mascota/webp/ORGULLOSO.webp'
import pensando from '../../assets/mascota/webp/PENSANDO.webp'
import saludando from '../../assets/mascota/webp/SALUDANDO.webp'
import sorprendido from '../../assets/mascota/webp/SORPRENDIDO.webp'
import triste from '../../assets/mascota/webp/TRISTE.webp'

const MASCOT_IMAGES = {
  achievement: logroDesbloqueado,
  celebrate: celebrando,
  celebrating: celebrando,
  confused: sorprendido,
  explaining: explicando,
  greeting: saludando,
  happy: feliz,
  idle,
  logo,
  proud: orgulloso,
  reading: leyendo,
  sad: triste,
  surprised: sorprendido,
  thinking: pensando,
  tired: cansado,
}

const ANIMATION_BY_EMOTION = {
  achievement: 'torogoz-achievement',
  celebrate: 'torogoz-celebrate',
  celebrating: 'torogoz-celebrate',
  confused: 'torogoz-surprised',
  explaining: 'torogoz-explaining',
  greeting: 'torogoz-greeting',
  happy: 'torogoz-happy',
  logo: 'torogoz-logo',
  proud: 'torogoz-proud',
  reading: 'torogoz-reading',
  sad: 'torogoz-sad',
  surprised: 'torogoz-surprised',
  thinking: 'torogoz-thinking',
  tired: 'torogoz-tired',
}

export default function Torogoz({ emotion = 'idle', size = 160, className = '' }) {
  const imageSrc = MASCOT_IMAGES[emotion] || MASCOT_IMAGES.idle
  const animationClass = ANIMATION_BY_EMOTION[emotion] || 'torogoz-idle'

  return (
    <img
      src={imageSrc}
      alt="Torogoz, mascota de NAWAT"
      width={size}
      height={size}
      style={{
        display: 'block',
        height: 'auto',
        objectFit: 'contain',
        transformOrigin: 'center bottom',
      }}
      className={`torogoz ${animationClass} ${className}`.trim()}
      aria-hidden="true"
      decoding="async"
      loading="lazy"
    />
  )
}
