import { useParams, useNavigate, Navigate } from 'react-router-dom'
import sections from '../data/sections'
import useGameStore from '../store/useGameStore'
import LessonRunner from '../components/ui/LessonRunner'
import { startLessonAttempt, completeLessonAttempt } from '../services/analytics'

export default function SectionLessonScreen() {
  const { sectionId, lessonId } = useParams()
  const navigate = useNavigate()
  const isBoss = !lessonId

  const sectionIdNum = parseInt(sectionId, 10)
  const section = !isNaN(sectionIdNum) ? sections.find((s) => s.id === sectionIdNum) : null
  const lessonData = isBoss
    ? section?.boss
    : section?.lessons.find((l) => l.id === lessonId)

  const {
    lives, completeSectionLesson, completeSectionBoss,
    recordPlay, participantId, currentSessionId
  } = useGameStore()

  if (!section || !lessonData || lives === 0) return <Navigate to="/sections" replace />

  return (
    <LessonRunner
      lesson={lessonData}
      isBoss={isBoss}
      onStart={async () => {
        return await startLessonAttempt(participantId, currentSessionId, lessonData)
      }}
      onComplete={(ratio, xpEarned, attemptId, lessonStartMs) => {
        recordPlay()
        const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0
        
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
