import { useState, useRef } from 'react'
import { ArrowRight, BookOpen, CheckCircle2, Crown, Heart, RotateCcw, X } from 'lucide-react'

import { GAME_CONFIG } from '../../data/gameConfig'
import useGameStore from '../../store/useGameStore'
import { playCorrect, playWrong, playComplete } from '../../lib/sounds'
import { logExerciseResponse } from '../../services/analytics'

import ProgressBar from './ProgressBar'
import LivesBar from './LivesBar'
import FeedbackModal from './FeedbackModal'
import Torogoz from './Torogoz'
import Flashcard from '../exercises/Flashcard'
import MultipleChoiceText from '../exercises/MultipleChoiceText'
import Matching from '../exercises/Matching'
import BuildSentence from '../exercises/BuildSentence'
import ActiveRecall from '../exercises/ActiveRecall'
import MultipleChoiceImage from '../exercises/MultipleChoiceImage'

export default function LessonRunner({
  lesson,
  isBoss = false,
  onStart = async () => null,
  onComplete = () => {},
  onExit = () => {},
}) {
  const { lives, loseLife, participantId, currentSessionId } = useGameStore()

  const [phase, setPhase] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, xp: 0 })
  const [feedback, setFeedback] = useState(null)

  const [failedItems, setFailedItems] = useState([])
  const [retryMode, setRetryMode] = useState(false)

  const attemptIdRef = useRef(null)
  const lessonStartRef = useRef(null)
  const exerciseStartRef = useRef(null)

  const items = retryMode ? failedItems : lesson.items
  const current = items[currentIndex]

  const previewWords = lesson.items
    .filter((item) => item.nahuat_word && item.spanish_translation)
    .slice(0, 5)

  const xpForType = (type) => GAME_CONFIG.itemTypes[type]?.xp ?? 10

  const getExerciseGuide = () => {
    switch (current.type) {
      case 'flashcard':
        return {
          emotion: 'reading',
          text: 'Memoriza la palabra y su pronunciación, luego indica si la recordabas.',
        }
      case 'multiple_choice_text':
        return {
          emotion: 'thinking',
          text: 'Elige la traducción correcta al español entre las opciones.',
        }
      case 'matching':
        return {
          emotion: 'explaining',
          text: 'Toca una palabra en náhuat y su par en español para unirlas.',
        }
      case 'build_sentence':
        return {
          emotion: 'thinking',
          text: 'Toca las palabras en orden para construir la frase correcta.',
        }
      case 'active_recall':
        return {
          emotion: 'reading',
          text: 'Escribe la traducción exacta al náhuat en la caja de texto.',
        }
      case 'multiple_choice_image':
        return {
          emotion: 'surprised',
          text: 'Observa la imagen y elige la respuesta que mejor corresponde.',
        }
      default:
        return {
          emotion: 'explaining',
          text: 'Resuelve el ejercicio para continuar con la lección.',
        }
    }
  }

  const recordExerciseResponse = (exercise, isCorrect) => {
    logExerciseResponse(
      participantId,
      currentSessionId,
      attemptIdRef.current,
      exercise,
      isCorrect,
      exerciseStartRef.current
    )
  }

  const hints = Object.fromEntries(
    lesson.items
      .filter((item) => item.nahuat_word && item.spanish_translation)
      .map((item) => [item.nahuat_word, item.spanish_translation])
  )

  if (phase === 'intro') {
    return (
      <div className="screen bg-[#f7f5ef] px-5 py-5">
        <div className="flex justify-end">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#46524a] shadow-sm transition active:scale-95"
            onClick={onExit}
            aria-label="Salir"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <main className="flex flex-1 flex-col justify-between gap-5">
          <section className="pt-4">
            <div className="surface-card-lg overflow-hidden">
              <div className="relative h-40" style={{ background: 'linear-gradient(165deg, #16463a 0%, #102f29 70%)' }}>
                <div
                  className="absolute inset-0 opacity-25"
                  style={{ background: `radial-gradient(circle at 24% 20%, ${lesson.color || '#f4a261'} 0, transparent 40%)` }}
                />
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/10 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/72">
                      {isBoss ? <Crown className="h-4 w-4 text-[#f4a261]" /> : <BookOpen className="h-4 w-4 text-[#9ddfc6]" />}
                      {isBoss ? 'Repaso final' : 'Lección'}
                    </span>
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f4a261] text-[#102f29]">
                      {isBoss ? <Crown className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-black leading-none tracking-normal">{lesson.title}</h1>
                    <p className="mt-2 max-w-[320px] text-sm font-medium leading-snug text-white/68">{lesson.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="grid grid-cols-[1fr_112px] items-center gap-3 rounded-lg border border-[#9ddfc6]/35 bg-[#eef8f2] p-3">
                  <div>
                    <p className="text-[0.64rem] font-black uppercase tracking-[0.14em] text-[#1f7a57]">
                      Tu guía
                    </p>
                    <p className="mt-1 text-sm font-bold leading-snug text-[#102f29]">
                      {isBoss
                        ? 'Respira, revisa con calma y demuestra todo lo que aprendiste.'
                        : 'Te acompaño en esta lección. Lee, escucha y responde a tu ritmo.'}
                    </p>
                  </div>
                  <div className="relative flex h-24 items-end justify-center">
                    <div className="absolute bottom-1 h-9 w-20 rounded-full bg-[#102f29]/10 blur-md" />
                    <Torogoz emotion={isBoss ? 'proud' : 'greeting'} size={108} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-[#e3ded2] bg-[#fbfaf7] p-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">Ejercicios</p>
                    <p className="mt-2 text-2xl font-black leading-none text-[#17211d]">{lesson.items.length}</p>
                  </div>
                  <div className="rounded-md border border-[#e3ded2] bg-[#fbfaf7] p-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">Vidas</p>
                    <p className="mt-2 flex items-center gap-1.5 text-2xl font-black leading-none text-[#17211d]">
                      <Heart className="h-5 w-5 text-[#d94848]" />
                      {lives}
                    </p>
                  </div>
                </div>

                {isBoss && (
                  <div className="rounded-md border border-[#f4d7ad] bg-[#fff8ec] p-3 text-sm font-semibold leading-snug text-[#8a4b12]">
                    Repasa todo lo aprendido en esta sección y confirma que ya dominas las palabras clave.
                  </div>
                )}

                {!isBoss && previewWords.length > 0 && (
                  <div className="rounded-lg border border-[#e3ded2] bg-[#fbfaf7] p-4">
                    <p className="mb-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#6d756e]">
                      Vas a practicar
                    </p>
                    <div className="space-y-2">
                      {previewWords.map((word) => (
                        <div key={`${word.nahuat_word}-${word.spanish_translation}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md bg-white px-3 py-2 text-sm shadow-sm">
                          <span className="truncate font-black text-[#17211d]">{word.nahuat_word}</span>
                          <ArrowRight className="h-4 w-4 text-[#8b938c]" />
                          <span className="truncate text-right font-semibold text-[#6d756e]">{word.spanish_translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <button
            className="btn-3d btn-3d-primary"
            onClick={async () => {
              lessonStartRef.current = Date.now()
              exerciseStartRef.current = Date.now()
              attemptIdRef.current = await onStart()
              setPhase('playing')
            }}
          >
            {isBoss ? 'Comenzar repaso' : 'Empezar lección'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </main>
      </div>
    )
  }

  const goNext = (finalScore) => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= items.length) {
      if (isBoss && !retryMode && failedItems.length > 0) {
        setRetryMode(true)
        setCurrentIndex(0)
        return
      }

      const totalItems = lesson.items.length
      const ratio = totalItems > 0 ? finalScore.correct / totalItems : 0
      playComplete()
      onComplete(ratio, finalScore.xp, attemptIdRef.current, lessonStartRef.current)
    } else {
      exerciseStartRef.current = Date.now()
      setCurrentIndex(nextIndex)
    }
  }

  const handleCorrect = () => {
    playCorrect()
    const xp = xpForType(current.type)
    const updated = { correct: score.correct + 1, xp: score.xp + xp }
    setScore(updated)
    recordExerciseResponse(current, true)
    setFeedback('correct')
  }

  const handleWrong = () => {
    playWrong()
    loseLife()
    recordExerciseResponse(current, false)
    if (isBoss && !retryMode) {
      setFailedItems((prev) => {
        if (prev.find((item) => item.id === current.id)) return prev
        return [...prev, current]
      })
    }
    setFeedback('wrong')
  }

  const handleContinue = () => {
    setFeedback(null)
    if (lives === 0) {
      onExit()
      return
    }
    goNext(score)
  }

  const handleFlashcard = (knew) => {
    if (knew) playCorrect()
    const xp = xpForType('flashcard')
    const updated = knew ? { correct: score.correct + 1, xp: score.xp + xp } : score
    recordExerciseResponse(current, knew)
    setScore(updated)
    goNext(updated)
  }

  const handleMatchingComplete = () => {
    playCorrect()
    const xp = xpForType('matching')
    const updated = { correct: score.correct + 1, xp: score.xp + xp }
    recordExerciseResponse(current, true)
    setScore(updated)
    goNext(updated)
  }

  const renderExercise = () => {
    switch (current.type) {
      case 'flashcard':
        return <Flashcard item={current} onKnew={() => handleFlashcard(true)} onDidntKnow={() => handleFlashcard(false)} />
      case 'multiple_choice_text':
        return <MultipleChoiceText item={current} onCorrect={handleCorrect} onWrong={handleWrong} />
      case 'matching':
        return <Matching item={current} onComplete={handleMatchingComplete} />
      case 'build_sentence':
        return <BuildSentence item={current} hints={hints} onCorrect={handleCorrect} onWrong={handleWrong} />
      case 'active_recall':
        return <ActiveRecall item={current} onCorrect={handleCorrect} onWrong={handleWrong} />
      case 'multiple_choice_image':
        return <MultipleChoiceImage item={current} onCorrect={handleCorrect} onWrong={handleWrong} />
      default:
        return (
          <div className="rounded-lg border border-[#e3ded2] bg-white p-5 text-center text-sm font-semibold text-[#6d756e]">
            Tipo de ejercicio no soportado: {current.type}
          </div>
        )
    }
  }

  const progress = currentIndex / items.length
  const exerciseGuide = getExerciseGuide()

  return (
    <div className={`screen relative bg-[#f7f5ef] ${feedback ? 'pb-44' : 'pb-5'}`}>
      <header className="sticky top-0 z-20 border-b border-[#e3ded2] bg-[#f7f5ef]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#d8ddd5] bg-white text-[#46524a] shadow-sm transition active:scale-95"
            onClick={onExit}
            aria-label="Salir de la lección"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <ProgressBar value={progress} />
            <p className="mt-1.5 text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#6d756e]">
              {currentIndex + 1}/{items.length} ejercicios
            </p>
          </div>
          <LivesBar lives={lives} />
        </div>
      </header>

      {retryMode && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-md border border-[#f4d7ad] bg-[#fff8ec] px-3 py-2 text-sm font-bold text-[#8a4b12]">
          <RotateCcw className="h-4 w-4" />
          Repasando los ejercicios que fallaste
        </div>
      )}

      <main key={`${retryMode ? 'retry' : 'main'}-${currentIndex}`} className="flex flex-1 flex-col px-5 pt-5">
        <div className="mb-4 flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#6d756e]">
          <CheckCircle2 className="h-4 w-4 text-[#1f7a57]" />
          {lesson.title}
        </div>
        {/* Banner de instrucción animada y premium */}
        <div className="mb-4 grid grid-cols-[72px_1fr] items-center gap-3 rounded-xl border border-[#9ddfc6]/35 bg-[#eef8f2]/70 p-3 text-xs font-black leading-relaxed text-[#102f29] shadow-xs animate-practice-hint-fade">
          <div className="relative flex h-16 items-end justify-center">
            <div className="absolute bottom-1 h-8 w-12 rounded-full bg-[#102f29]/10 blur-md" />
            <Torogoz emotion={exerciseGuide.emotion} size={70} />
          </div>
          <p>
            {exerciseGuide.text}
          </p>
        </div>
        {renderExercise()}
      </main>

      {feedback && (
        <FeedbackModal
          type={feedback}
          correctAnswer={current.spanish_translation}
          onContinue={handleContinue}
          noLives={lives === 0}
        />
      )}
    </div>
  )
}
