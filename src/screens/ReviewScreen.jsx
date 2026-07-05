import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'

import useGameStore from '../store/useGameStore'
import { buildItemsByKey, buildReviewQueue } from '../lib/srs'
import { computeStars } from '../data/gameConfig'
import { useSectionsReady } from '../hooks/useSections'
import LessonRunner from '../components/ui/LessonRunner'

const REVIEW_SIZE = 12

export default function ReviewScreen() {
  const navigate = useNavigate()
  const { sections, ready } = useSectionsReady()

  // Esperamos a que cargue el vocabulario generado para que el repaso cubra
  // TODAS las palabras vistas (no solo las artesanales).
  if (!ready) {
    return (
      <div className="screen items-center justify-center bg-[#f7f5ef]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f7a57]" />
      </div>
    )
  }

  return <ReviewSession sections={sections} navigate={navigate} />
}

function ReviewSession({ sections, navigate }) {
  const { srs, addXP, recordPlay } = useGameStore()

  const itemsByKey = useMemo(() => buildItemsByKey(sections), [sections])
  // La cola se fija al montar para que no cambie mientras el SRS se actualiza.
  const [queue] = useState(() => buildReviewQueue(itemsByKey, srs, { size: REVIEW_SIZE }))

  if (queue.length === 0) {
    return (
      <div className="screen items-center justify-center gap-4 bg-[#f7f5ef] px-8 text-center lg:mx-auto lg:w-full lg:max-w-[560px]">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef8f2] text-[#1f7a57]">
          <Sparkles className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-black text-[#17211d]">Nada que repasar todavía</h1>
        <p className="max-w-[320px] text-sm font-medium leading-snug text-[#6d756e]">
          Completa algunas lecciones y aquí aparecerán las palabras que conviene reforzar en el momento justo.
        </p>
        <button className="btn-3d btn-3d-primary mt-2" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  const lesson = {
    id: 'review',
    title: 'Repaso',
    icon: '🔁',
    description: 'Refuerza lo que ya viste, justo antes de olvidarlo',
    color: '#1f7a57',
    xpReward: queue.length * 5,
    items: queue,
  }

  return (
    <LessonRunner
      lesson={lesson}
      isBoss={false}
      onStart={async () => null}
      onComplete={(ratio, xpEarned) => {
        recordPlay()
        addXP(xpEarned)
        navigate('/result', {
          state: {
            lessonId: 'review',
            lessonTitle: 'Repaso',
            lessonIcon: '🔁',
            score: ratio,
            stars: computeStars(ratio),
            xpEarned,
            totalItems: queue.length,
            isBoss: false,
            returnTo: '/',
            review: true,
          },
        })
      }}
      onExit={() => navigate('/')}
    />
  )
}
