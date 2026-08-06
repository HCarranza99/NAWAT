import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import LessonRunner from '../components/ui/LessonRunner'
import useGameStore from '../store/useGameStore'
import { getLesson, toRunnerItems } from '../data/curriculum'
import { buildResultState } from '../lib/resultState'

/**
 * Pantalla del currículo v2 (situaciones).
 *
 * Corre en paralelo a SectionLessonScreen, que sigue sirviendo las secciones
 * 1–5. Se mantienen las dos hasta que un hablante valide el módulo nuevo: recién
 * ahí se decide qué se jubila. Mientras tanto nadie pierde su progreso.
 *
 * La diferencia con la pantalla vieja es que acá NO se llama al motor de
 * ejercicios: el orden de una lección v2 es parte del contenido, no algo que se
 * baraje.
 */
export default function CurriculumLessonScreen() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { recordPlay, addXP } = useGameStore()

  const lesson = getLesson(lessonId)
  const items = useMemo(() => toRunnerItems(lesson), [lesson])

  if (!lesson) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-[#f7f5ef] px-6 text-center">
        <p className="text-sm font-bold text-[#46524a]">No encontramos esa lección.</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg bg-[#1f7a57] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <LessonRunner
      lesson={{ ...lesson, title: lesson.title.es, items }}
      orderedItems={items}
      onComplete={(ratio, xpEarned) => {
        recordPlay()
        addXP(xpEarned)
        navigate('/result', { state: buildResultState(lesson, items, ratio, xpEarned) })
      }}
      onExit={() => navigate('/')}
    />
  )
}
