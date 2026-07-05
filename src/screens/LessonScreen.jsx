import { useParams, useNavigate, Navigate } from 'react-router-dom'
import lessons from '../data/lessons'
import useGameStore from '../store/useGameStore'
import { startLessonAttempt, completeLessonAttempt } from '../services/analytics'
import { computeStars } from '../data/gameConfig'
import LessonRunner from '../components/ui/LessonRunner'

export default function LessonScreen() {
  const { id } = useParams()
  const navigate = useNavigate()

  const lessonIdNum = parseInt(id, 10)
  const lesson = !isNaN(lessonIdNum) ? lessons.find((l) => l.id === lessonIdNum) : null

  const { completeLesson, recordPlay, participantId, currentSessionId } = useGameStore()

  if (!lesson) return <Navigate to="/" replace />

  return (
    <LessonRunner
      lesson={lesson}
      isBoss={false}
      onStart={async () => {
        return await startLessonAttempt(participantId, currentSessionId, lesson)
      }}
      onComplete={(ratio, xpEarned, attemptId, lessonStartMs) => {
        const stars = computeStars(ratio)
        recordPlay()
        completeLesson(lesson.id, ratio, xpEarned)
        if (attemptId) {
          completeLessonAttempt(attemptId, lessonStartMs, ratio, stars, xpEarned)
        }
        navigate('/result', {
          state: {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonIcon: lesson.icon,
            score: ratio,
            xpEarned,
            totalItems: lesson.items.length,
          },
        })
      }}
      onExit={() => navigate('/')}
    />
  )
}
