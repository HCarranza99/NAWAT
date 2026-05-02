import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sections from '../data/sections'
import useGameStore, { PHASES } from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import { INTERVENTION_MS } from '../data/questionnaires'
import { useLivesRecharge } from '../hooks/useLivesRecharge'
import TorogozBadge from '../components/ui/TorogozBadge'
import Torogoz from '../components/ui/Torogoz'

function formatClock(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { xp, lives, streak, sectionProgress, resetLives, participantName } = useGameStore()
  const { timeLeftStr } = useLivesRecharge()
  
  const firstName = participantName ? participantName.split(' ')[0] : ''

  // ── Timer for study phase ──
  const studyPhase = useGameStore((s) => s.studyPhase)
  const pretestCompletedAt = useGameStore((s) => s.pretestCompletedAt)

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (studyPhase !== PHASES.PLAYING) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [studyPhase])

  const msLeft =
    studyPhase === PHASES.PLAYING && pretestCompletedAt
      ? Math.max(0, INTERVENTION_MS - (now - Date.parse(pretestCompletedAt)))
      : null

  // ── Level calculations ──
  const xpPerLevel = GAME_CONFIG.xp.perLevel
  const xpInLevel = xp % xpPerLevel
  const xpToNext = xpPerLevel - xpInLevel
  const levelPct = Math.round((xpInLevel / xpPerLevel) * 100)

  // ── Find current section and next lesson ──
  const findNextLesson = () => {
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx]
      // Check if section is unlocked
      if (sIdx > 0) {
        const prevSection = sections[sIdx - 1]
        const prevProg = sectionProgress[prevSection.id]
        if (!prevProg?.bossCompleted) continue
      }

      const prog = sectionProgress[section.id] || { lessonsCompleted: {}, bossCompleted: false }

      // Find first incomplete lesson
      for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
        const lesson = section.lessons[lIdx]
        // Check if lesson is unlocked
        if (lIdx > 0) {
          const prevLesson = section.lessons[lIdx - 1]
          if (!prog.lessonsCompleted?.[prevLesson.id]?.completed) break
        }
        if (!prog.lessonsCompleted?.[lesson.id]?.completed) {
          return { section, lesson, isBoss: false, activeIndex: lIdx }
        }
      }

      // All lessons done, check boss
      const allLessonsDone = section.lessons.every(
        (l) => prog.lessonsCompleted?.[l.id]?.completed
      )
      if (allLessonsDone && !prog.bossCompleted && section.boss) {
        return { section, lesson: section.boss, isBoss: true, activeIndex: section.lessons.length }
      }
    }
    return null
  }

  const nextLesson = findNextLesson()

  // Overall progress

  // Calculate which 3 lessons to show
  let lessonsToShow = []
  let showBoss = false
  if (nextLesson) {
    let startIdx = 0
    if (nextLesson.activeIndex > 1) {
      startIdx = Math.min(nextLesson.activeIndex - 1, Math.max(0, nextLesson.section.lessons.length - 3))
    }
    lessonsToShow = nextLesson.section.lessons.slice(startIdx, startIdx + 3)
    
    // Si la lista a mostrar llega hasta el final, o si el boss es la lección activa
    if (startIdx + 3 >= nextLesson.section.lessons.length && nextLesson.section.boss) {
      showBoss = true
    }
  }

  return (
    <div className="screen home-screen">
      {/* HEADER */}
      <header className="home-header">
        <div className="home-logo">
          <TorogozBadge size={52} />
          <div>
            <h1 className="logo-title">Náhuat</h1>
            <p className="logo-sub">Idioma del pueblo Pipil</p>
          </div>
        </div>

        <div className="home-header-right">
          <div className="home-lives">
            {Array.from({ length: GAME_CONFIG.lives.max }, (_, i) => (
              <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </div>
          <div className="home-badges">
            {msLeft != null && (
              <div className="timer-badge" aria-label="Tiempo restante del estudio">
                <span className="xp-icon">⏱</span>
                <span className="xp-count">{formatClock(msLeft)}</span>
              </div>
            )}
            {streak > 0 && (
              <div className="streak-badge">
                <span>🔥</span>
                <span className="streak-count">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LEVEL CARD */}
      <div className="level-card">
        <div className="level-card-top">
          <div className="level-card-left">
            <div className="streak-card-mini">
              <span className="streak-card-mini-icon">🔥</span>
              <span className="streak-card-mini-val">{streak}</span>
              <span className="streak-card-mini-label">racha</span>
              <span className="streak-card-mini-sub">¡Sigue así!</span>
            </div>
          </div>
          
          <div className="level-card-divider" />
          
          <div className="level-card-right">
            <div className="level-card-info">
              <p className="level-card-label">XP total</p>
              <p className="level-card-xp">{xp}</p>
            </div>
            <div className="level-progress" style={{ marginTop: '8px' }}>
              <div className="level-progress-fill" style={{ width: `${levelPct}%` }} />
            </div>
            <p className="level-card-next" style={{ marginTop: '6px' }}>
              <span style={{ fontWeight: 800 }}>{xpToNext} XP</span> para tu siguiente nivel
            </p>
          </div>
        </div>
        
        {/* Torogoz Decoration */}
        <div style={{ position: 'absolute', right: '16px', top: '16px', width: '80px', pointerEvents: 'none', display: 'flex', justifyContent: 'flex-end' }}>
           <Torogoz emotion="idle" size={90} />
        </div>
      </div>

      <main className="home-main">
        {/* NO LIVES BANNER */}
        {lives === 0 && (
          <div className="no-lives-banner-card">
            <p className="no-lives-text">
              {timeLeftStr
                ? `Sin vidas — recarga en ${timeLeftStr}`
                : 'Sin vidas — recuperando...'}
            </p>
            <button className="btn-recover" onClick={resetLives}>
              Recuperar
            </button>
          </div>
        )}

        {nextLesson ? (
          <>
            <div className="home-greeting">
              <div className="home-greeting-text">
                <h2 className="home-greeting-title">¡Hola{firstName ? ` ${firstName}` : ''}! ¿Qué vamos a aprender hoy?</h2>
                <p className="home-greeting-sub">Sigue tu camino, una palabra a la vez.</p>
              </div>
              <div className="home-greeting-icon">☀️</div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '8px', padding: '16px', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(45,106,79,0.3)' }}
              onClick={() => {
                if (lives === 0) return
                if (nextLesson.isBoss) {
                  navigate(`/section/${nextLesson.section.id}/boss`)
                } else {
                  navigate(`/section/${nextLesson.section.id}/lesson/${nextLesson.lesson.id}`)
                }
              }}
              disabled={lives === 0}
            >
              🚀 Iniciar Lección
            </button>

            <p className="home-section-title">SECCIÓN: {nextLesson.section.title}</p>
            
            <div className="organic-lessons-list">
              {lessonsToShow.map((lesson) => {
                const lessonIndex = nextLesson.section.lessons.findIndex(l => l.id === lesson.id)
                const prog = sectionProgress[nextLesson.section.id]?.lessonsCompleted?.[lesson.id];
                const completed = prog?.completed === true;
                const unlocked = lessonIndex === 0 || sectionProgress[nextLesson.section.id]?.lessonsCompleted?.[nextLesson.section.lessons[lessonIndex - 1].id]?.completed === true;
                
                return (
                  <button
                    key={lesson.id}
                    className="organic-lesson-card"
                    style={{ '--card-color': lesson.color || nextLesson.section.color }}
                    disabled={!unlocked || lives === 0}
                    onClick={() => navigate(`/section/${nextLesson.section.id}/lesson/${lesson.id}`)}
                  >
                    <div className="organic-card-strip" />
                    <div className="organic-card-img-wrap">
                       <img src={`/assets/images/section${nextLesson.section.id}.png`} alt="" className="organic-card-img" />
                    </div>
                    <div className="organic-card-content">
                      <div className="organic-card-info">
                        <span className="organic-card-title">{lesson.title}</span>
                        <span className="organic-card-desc">{lesson.description}</span>
                      </div>
                      <div className="organic-card-action">
                        {!unlocked ? (
                          <>
                            <div className="organic-card-lock">🔒</div>
                            <span className="organic-card-lock-label">Bloqueado</span>
                          </>
                        ) : completed ? (
                           <div className="organic-card-xp" style={{ color: 'var(--correct)' }}>✓</div>
                        ) : (
                          <>
                            <span className="organic-card-xp">+{lesson.xpReward}</span>
                            <span className="organic-card-xp-label">XP</span>
                          </>
                        )}
                        {unlocked && !completed && <span className="organic-card-arrow">›</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
              
              {/* Boss card */}
              {showBoss && (() => {
                 const allLessonsDone = nextLesson.section.lessons.every(l => sectionProgress[nextLesson.section.id]?.lessonsCompleted?.[l.id]?.completed);
                 const bossDone = sectionProgress[nextLesson.section.id]?.bossCompleted;
                 return (
                    <button
                      className="organic-lesson-card organic-boss-card"
                      disabled={!allLessonsDone || lives === 0}
                      onClick={() => navigate(`/section/${nextLesson.section.id}/boss`)}
                    >
                      <div className="organic-card-strip" />
                      <div className="organic-card-img-wrap">
                         <img src={`/assets/images/section${nextLesson.section.id}.png`} alt="" className="organic-card-img" />
                      </div>
                      <div className="organic-card-content">
                        <div className="organic-card-info">
                          <span className="organic-card-title">{nextLesson.section.boss.title}</span>
                          <span className="organic-card-desc">{nextLesson.section.boss.description}</span>
                        </div>
                        <div className="organic-card-action">
                          {!allLessonsDone ? (
                            <>
                              <div className="organic-card-lock">🔒</div>
                              <span className="organic-card-lock-label">Bloqueado</span>
                            </>
                          ) : bossDone ? (
                             <div className="organic-card-xp" style={{ color: 'var(--correct)' }}>✓</div>
                          ) : (
                            <>
                              <span className="organic-card-xp">+{nextLesson.section.boss.xpReward}</span>
                              <span className="organic-card-xp-label">XP</span>
                              <span className="organic-card-arrow">›</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                 )
              })()}
            </div>
          </>
        ) : (
          <div className="home-all-done">
            <span className="home-all-done-icon">🎉</span>
            <h2>¡Felicidades!</h2>
            <p>Has completado todas las lecciones disponibles.</p>
          </div>
        )}

        <button
          className="home-all-sections-banner"
          onClick={() => navigate('/sections')}
        >
          <div className="banner-content">
             <span className="banner-icon">📚</span>
             <span className="banner-text">Ver todas las secciones</span>
          </div>
          <span className="banner-arrow">→</span>
        </button>
      </main>

      {/* Spacer for bottom nav */}
      <div className="bottom-nav-spacer" />
    </div>
  )
}
