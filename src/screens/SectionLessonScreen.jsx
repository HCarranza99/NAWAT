import { useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import LessonRunner from '../components/ui/LessonRunner'
import { computeStars } from '../data/gameConfig'
import { useSectionsReady } from '../hooks/useSections'
import { startLessonAttempt, completeLessonAttempt } from '../services/analytics'

export default function SectionLessonScreen() {
  const { sectionId, lessonId } = useParams()
  const navigate = useNavigate()
  const isBoss = !lessonId

  const { sections, ready } = useSectionsReady()
  const sectionIdNum = parseInt(sectionId, 10)
  const section = !isNaN(sectionIdNum) ? sections.find((s) => s.id === sectionIdNum) : null
  const lessonData = isBoss
    ? section?.boss
    : section?.lessons.find((l) => l.id === lessonId)

  const {
    completeSectionLesson, completeSectionBoss,
    recordPlay, participantId, currentSessionId
  } = useGameStore()

  // Vocabulario de toda la sección: alimenta los distractores del motor de
  // ejercicios (opciones falsas, verdadero/falso) y, más adelante, "clasifica por tema".
  const sectionWords = useMemo(() => {
    const seen = new Set()
    const words = []
    for (const l of section?.lessons || []) {
      for (const it of l.items || []) {
        if (it.nahuat_word && it.spanish_translation) {
          const k = it.nahuat_word.toLowerCase().trim()
          if (!seen.has(k)) { seen.add(k); words.push(it) }
        }
      }
    }
    return words
  }, [section])

  if (!section || !lessonData) {
    // El vocabulario ampliado (secciones 6+) puede estar cargándose todavía.
    if (!ready) {
      return (
        <div className="screen items-center justify-center bg-[#f7f5ef]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1f7a57]" />
        </div>
      )
    }
    return <Navigate to="/sections" replace />
  }

  return (
    <LessonRunner
      lesson={lessonData}
      isBoss={isBoss}
      sectionWords={sectionWords}
      onStart={async () => {
        return await startLessonAttempt(participantId, currentSessionId, lessonData)
      }}
      onComplete={(ratio, xpEarned, attemptId, lessonStartMs) => {
        recordPlay()
        const stars = computeStars(ratio)
        
        if (isBoss) {
          completeSectionBoss(section.id, ratio, xpEarned)
        } else {
          completeSectionLesson(section.id, lessonData.id, ratio, xpEarned)
        }

        if (attemptId) {
          completeLessonAttempt(attemptId, lessonStartMs, ratio, stars, xpEarned)
        }

        navigate('/result', {
          state: {
            lessonId: lessonData.id,
            lessonTitle: lessonData.title,
            lessonIcon: lessonData.icon,
            score: ratio,
            xpEarned,
            totalItems: lessonData.items.length,
            isBoss,
            sectionId: section.id,
            returnTo: '/sections',
          },
        })
      }}
      onExit={() => navigate('/sections')}
    />
  )
}
