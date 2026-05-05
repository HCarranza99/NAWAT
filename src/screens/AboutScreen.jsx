import { useState } from 'react'
import useGameStore from '../store/useGameStore'

const SLIDES = [
  {
    icon: '🌿',
    title: 'Sobre el náhuat',
    body: 'El náhuat es el idioma ancestral del pueblo Pipil de El Salvador. Hoy lo hablan apenas unos pocos cientos de personas, y se considera en riesgo de desaparecer. Aprender sus palabras es ayudar a mantener viva una cultura milenaria.',
  },
  {
    icon: '🔬',
    title: 'Sobre este estudio',
    body: 'Estamos evaluando si una aplicación interactiva como NAWAT puede despertar el interés de estudiantes universitarios por aprender náhuat. Tus respuestas y tu uso de la app aportan datos para responder esa pregunta de forma rigurosa.',
  },
  {
    icon: '🙏',
    title: 'Tu participación importa',
    body: 'Responde con sinceridad — no hay respuestas correctas ni incorrectas. Lo importante es tu opinión honesta sobre tu experiencia y tu interés. Gracias por ser parte del estudio.',
  },
]

export default function AboutScreen() {
  const [step, setStep] = useState(0)
  const finishAbout = useGameStore((s) => s.finishAbout)

  const isLast = step === SLIDES.length - 1
  const slide = SLIDES[step]

  const handleNext = () => {
    if (isLast) finishAbout()
    else setStep((s) => s + 1)
  }

  return (
    <div className="screen px-7 pt-12 pb-10 justify-between bg-background">
      <div className="onboarding-body-wrap">
        <div className="onboarding-slide">
          <span className="onboarding-icon">{slide.icon}</span>
          <h1 className="onboarding-title">{slide.title}</h1>
          <p className="onboarding-text">{slide.body}</p>
        </div>

        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot ${i === step ? 'dot-active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="btn btn-primary" onClick={handleNext}>
          {isLast ? 'Continuar →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
