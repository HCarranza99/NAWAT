import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import LessonRunner from '../components/ui/LessonRunner'
import useGameStore from '../store/useGameStore'
import { getLesson, toRunnerItems } from '../data/curriculum'
import { buildResultState } from '../lib/resultState'

/**
 * Pantalla de lección. Desde el 14-ago-2026 es la ÚNICA: las secciones 1–5 y su
 * pantalla se jubilaron cuando el currículo v2 quedó completo y validado.
 *
 * Lo propio de acá es que NO se llama al motor de ejercicios: el orden de una
 * lección v2 es parte del contenido, no algo que se baraje.
 *
 * El progreso se guarda con `completeSectionLesson(moduleId, lessonId, …)`, la
 * misma función de siempre. La clave es el id del módulo ('m0'…'m5'), que no
 * choca con las claves numéricas del contenido viejo: quien ya jugó las
 * secciones conserva aquel progreso guardado, pero no le adelanta nada acá.
 */
export default function CurriculumLessonScreen() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { recordPlay, completeSectionLesson } = useGameStore()

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
        // Suma el XP y marca la lección: `completeSectionLesson` hace las dos
        // cosas. Antes acá se llamaba a addXP por separado y no se guardaba nada
        // más, porque el currículo vivía suelto detrás de una URL.
        completeSectionLesson(lesson.moduleId, lesson.id, ratio, xpEarned)
        navigate('/result', { state: buildResultState(lesson, items, ratio, xpEarned) })
      }}
      onExit={() => navigate('/sections')}
    />
  )
}
