import { useState, useRef } from 'react'
import { GAME_CONFIG } from '../../data/gameConfig'
import useGameStore from '../../store/useGameStore'
import { playCorrect, playWrong, playComplete } from '../../lib/sounds'
import { logExerciseResponse } from '../../services/analytics'

import ProgressBar from './ProgressBar'
import LivesBar from './LivesBar'
import FeedbackModal from './FeedbackModal'
import Flashcard from '../exercises/Flashcard'
import MultipleChoiceText from '../exercises/MultipleChoiceText'
import Matching from '../exercises/Matching'
import BuildSentence from '../exercises/BuildSentence'

export default function LessonRunner({
  lesson,
  isBoss = false,
  onStart = async () => null,
  onComplete = () => {},
  onExit = () => {},
}) {
  const { lives, loseLife, participantId, currentSessionId } = useGameStore()

  const [phase, setPhase] = useState('intro') // 'intro' | 'playing'
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
    .filter((it) => it.nahuat_word && it.spanish_translation)
    .slice(0, 5)

  const xpForType = (type) => GAME_CONFIG.itemTypes[type]?.xp ?? 10

  const hints = Object.fromEntries(
    lesson.items
      .filter((it) => it.nahuat_word && it.spanish_translation)
      .map((it) => [it.nahuat_word, it.spanish_translation])
  )

  if (phase === 'intro') {
    return (
      <div className="screen lesson-intro-screen">
        <button className="close-btn lesson-intro-close" onClick={onExit} aria-label="Salir">✕</button>
        <div className="lesson-intro-content">
          <div
            className={`lesson-intro-badge ${isBoss ? 'boss-intro-badge' : ''}`}
            style={{ background: lesson.color + '22', border: `2px solid ${lesson.color}44` }}
          >
            <span className="lesson-intro-icon">{lesson.icon}</span>
          </div>

          <h1 className="lesson-intro-title">{lesson.title}</h1>
          <p className="lesson-intro-desc">{lesson.description}</p>

          {isBoss && (
            <div className="boss-intro-warning">
              <span>⚔️</span>
              <p>Este es un repaso de todo lo aprendido en esta sección. ¡Demuestra lo que sabes!</p>
            </div>
          )}

          {!isBoss && previewWords.length > 0 && (
            <div className="lesson-intro-vocab">
              <p className="vocab-label">En esta lección aprenderás</p>
              {previewWords.map((w, i) => (
                <div key={i} className="vocab-row">
                  <span className="vocab-nahuat">{w.nahuat_word}</span>
                  <span className="vocab-arrow">→</span>
                  <span className="vocab-spanish">{w.spanish_translation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary lesson-intro-btn"
          onClick={async () => {
            lessonStartRef.current = Date.now()
            exerciseStartRef.current = Date.now()
            attemptIdRef.current = await onStart()
            setPhase('playing')
          }}
        >
          {isBoss ? '¡Comenzar repaso!' : 'Empezar lección'}
        </button>
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
    if (attemptIdRef.current) {
      logExerciseResponse(participantId, currentSessionId, attemptIdRef.current, current, true, exerciseStartRef.current)
    }
    setFeedback('correct')
  }

  const handleWrong = () => {
    playWrong()
    loseLife()
    if (attemptIdRef.current) {
      logExerciseResponse(participantId, currentSessionId, attemptIdRef.current, current, false, exerciseStartRef.current)
    }
    if (isBoss && !retryMode) {
      setFailedItems((prev) => {
        if (prev.find((it) => it.id === current.id)) return prev
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
    if (attemptIdRef.current) {
      logExerciseResponse(participantId, currentSessionId, attemptIdRef.current, current, knew, exerciseStartRef.current)
    }
    setScore(updated)
    goNext(updated)
  }

  const handleMatchingComplete = () => {
    playCorrect()
    const xp = xpForType('matching')
    const updated = { correct: score.correct + 1, xp: score.xp + xp }
    if (attemptIdRef.current) {
      logExerciseResponse(participantId, currentSessionId, attemptIdRef.current, current, true, exerciseStartRef.current)
    }
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
      default:
        return <p style={{ padding: '2rem', textAlign: 'center' }}>Tipo de ejercicio no soportado: {current.type}</p>
    }
  }

  const progress = currentIndex / items.length

  return (
    <div className={`screen lesson-screen ${feedback ? 'has-feedback' : ''}`}>
      <div className="lesson-top-bar">
        <button className="close-btn" onClick={onExit} aria-label="Salir de la lección">✕</button>
        <ProgressBar value={progress} />
        <LivesBar lives={lives} />
      </div>

      {retryMode && (
        <div className="retry-banner">
          <span>🔄</span> Repasando los ejercicios que fallaste
        </div>
      )}

      <div key={`${retryMode ? 'retry' : 'main'}-${currentIndex}`} className="exercise-wrapper">
        {renderExercise()}
      </div>

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
