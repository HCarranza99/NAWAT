import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Award, BookOpen, Heart, Sparkles, X } from 'lucide-react'
import Torogoz from './Torogoz'

export default function MascotTutorial({ onClose }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: '¡Yek peykan! (¡Bienvenido!)',
      text: 'Soy tu guía en este hermoso viaje de aprendizaje. Juntos rescataremos y mantendremos viva la lengua Náhuat de nuestros ancestros pipiles de El Salvador.',
      highlightClass: '', // no highlight, just intro
      emotion: 'greeting',
      icon: Sparkles,
      iconColor: 'text-[#f4a261]',
    },
    {
      title: 'Tus Vidas y Práctica',
      text: 'Comienzas con 5 vidas. Si te equivocas en un ejercicio, perderás una. ¡Pero no te preocupes! Si te quedas sin vidas, podrás tomar una Práctica Correctiva Rápida para recuperar vidas de inmediato sin esperar horas.',
      highlightClass: 'highlight-lives',
      emotion: 'explaining',
      icon: Heart,
      iconColor: 'text-[#d94848]',
    },
    {
      title: 'Nivel y Progreso',
      text: 'Aquí verás tu nivel actual y tu XP (puntos de experiencia) acumulados. Responde correctamente para acumular XP y desbloquear insignias y estrellas de honor.',
      highlightClass: 'highlight-xp',
      emotion: 'achievement',
      icon: Award,
      iconColor: 'text-[#f4a261]',
    },
    {
      title: 'Tu Próxima Lección',
      text: '¡Esta es tu meta de hoy! Toca la lección activa para iniciar tu aprendizaje con flashcards, audios nativos y retos interactivos. ¡Disfruta el proceso!',
      highlightClass: 'highlight-next-lesson',
      emotion: 'happy',
      icon: BookOpen,
      iconColor: 'text-[#1f7a57]',
    },
  ]

  const currentStep = steps[step]
  const Icon = currentStep.icon

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end bg-black/60 p-5 backdrop-blur-xs">
      {/* Círculos de Luces Guía (Highlight overlays) */}
      <AnimatePresence mode="wait">
        {currentStep.highlightClass === 'highlight-lives' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[215px] left-5 w-[calc(50%-15px)] h-[54px] rounded-lg border-2 border-[#ff8b8b] bg-white/10 ring-[9999px] ring-black/60 pointer-events-none z-10"
          />
        )}
        {currentStep.highlightClass === 'highlight-xp' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[16px] right-5 w-[76px] h-[52px] rounded-lg border-2 border-[#f4a261] bg-white/10 ring-[9999px] ring-black/60 pointer-events-none z-10"
          />
        )}
        {currentStep.highlightClass === 'highlight-next-lesson' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[324px] left-5 w-[calc(100%-40px)] h-[110px] rounded-lg border-2 border-[#1f7a57] bg-white/10 ring-[9999px] ring-black/60 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Tarjeta del Diálogo del Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-20 w-full max-w-[440px] rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-md"
      >
        {/* Botón de cerrar */}
        <button
          className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e3ded2] bg-white text-[#6d756e] shadow-sm transition active:scale-90"
          onClick={onClose}
          aria-label="Cerrar tutorial"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Contenedor del Avatar y Título */}
        <div className="flex flex-col items-center">
          <div className="relative -mt-20 mb-3 flex justify-center">
            <div className="absolute inset-0 -z-10 h-36 w-36 scale-110 rounded-full bg-gradient-to-tr from-[#102f29]/10 to-[#9ddfc6]/40 blur-lg animate-pulse" />
            <Torogoz emotion={currentStep.emotion} size={150} />
          </div>

          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${currentStep.iconColor}`} />
            <h2 className="text-xl font-black text-[#102f29]">{currentStep.title}</h2>
          </div>

          <p className="mt-3.5 text-center text-sm font-semibold leading-relaxed text-[#5f6b63] min-h-[72px]">
            {currentStep.text}
          </p>
        </div>

        {/* Indicadores de progreso (dots) y botón de avanzar */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === step ? 'w-6 bg-[#1f7a57]' : 'w-2.5 bg-[#e3ded2]'
                }`}
              />
            ))}
          </div>

          <button
            className="flex items-center justify-center rounded-full bg-[#1f7a57] px-6 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(31,122,87,0.22)] transition active:scale-95 hover:bg-[#1a6649]"
            onClick={handleNext}
          >
            {step === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
