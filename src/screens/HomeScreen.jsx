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
    <div className="screen bg-background">
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 pt-6 pb-12 bg-gradient-to-br from-[#1f4f3b] via-primary to-[#3a8461] text-white rounded-b-[32px] shadow-[0_8px_30px_rgba(29,73,54,0.3)] relative overflow-hidden before:content-[''] before:absolute before:-top-5 before:-right-[30px] before:w-[200px] before:h-[200px] before:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_60%)] before:rounded-full before:pointer-events-none after:content-[''] after:absolute after:-bottom-10 after:-left-5 after:w-[150px] after:h-[150px] after:bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_60%)] after:rounded-full after:pointer-events-none">
        <div className="flex items-center gap-3.5">
          <TorogozBadge size={52} />
          <div>
            <h1 className="text-[1.6rem] font-extrabold text-white tracking-[-0.5px] leading-[1.05]">Náhuat</h1>
            <p className="text-[0.76rem] text-white/80 mt-0.5">Idioma del pueblo Pipil</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-[3px] text-[1.1rem] leading-none">
            {Array.from({ length: GAME_CONFIG.lives.max }, (_, i) => (
              <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {msLeft != null && (
              <div className="flex items-center gap-1.5 bg-white/20 border-[1.5px] border-white/35 rounded-[20px] px-3 py-1.5 tabular-nums" aria-label="Tiempo restante del estudio">
                <span className="text-base">⏱</span>
                <span className="font-bold text-base text-white">{formatClock(msLeft)}</span>
              </div>
            )}
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-white/20 border-[1.5px] border-white/35 rounded-[20px] px-3 py-1.5 text-[0.9rem]">
                <span>🔥</span>
                <span className="font-bold text-base text-white">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LEVEL CARD */}
      <div className="relative -mt-8 mx-4 bg-card rounded-[24px] px-5 py-5 shadow-[0_12px_35px_rgba(0,0,0,0.06)] flex flex-col gap-4 z-[2]">
        <div className="flex justify-between items-stretch">
          <div className="flex flex-col justify-between gap-3">
            <div className="flex flex-col items-center gap-1 px-3 py-3 bg-[#fff8f5] rounded-[18px] min-w-[80px]">
              <span className="text-[2rem] leading-none">🔥</span>
              <span className="text-[1.4rem] font-extrabold text-foreground leading-none">{streak}</span>
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.5px] text-nahuat-terra">racha</span>
              <span className="text-[0.65rem] text-muted-foreground">¡Sigue así!</span>
            </div>
          </div>
          
          <div className="w-[1.5px] bg-border mx-4" />
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.6px] text-muted-foreground">XP total</p>
              <p className="text-[1.8rem] font-extrabold text-primary tracking-[-0.5px] leading-none tabular-nums">{xp}</p>
            </div>
            <div className="w-full h-2.5 rounded-md bg-border overflow-hidden mt-2">
              <div className="h-full bg-primary rounded-md transition-[width] duration-400 ease-out" style={{ width: `${levelPct}%` }} />
            </div>
            <p className="text-[0.78rem] font-semibold text-muted-foreground mt-1.5">
              <span className="font-extrabold">{xpToNext} XP</span> para tu siguiente nivel
            </p>
          </div>
        </div>
        
        {/* Torogoz Decoration */}
        <div className="absolute right-4 top-4 w-[80px] pointer-events-none flex justify-end">
           <Torogoz emotion="idle" size={90} />
        </div>
      </div>

      <main className="flex-1 px-4 pt-6 pb-4 flex flex-col gap-4">
        {/* NO LIVES BANNER */}
        {lives === 0 && (
          <div className="flex items-center justify-between gap-3 bg-nahuat-wrong-bg border-[1.5px] border-nahuat-wrong rounded-lg px-5 py-3.5 shadow-[0_4px_12px_rgba(220,38,38,0.1)] mb-2">
            <p className="text-[0.88rem] font-semibold text-nahuat-wrong">
              {timeLeftStr
                ? `Sin vidas — recarga en ${timeLeftStr}`
                : 'Sin vidas — recuperando...'}
            </p>
            <button className="shrink-0 px-3.5 py-2 bg-nahuat-wrong text-white rounded-sm text-[0.82rem] font-bold whitespace-nowrap" onClick={resetLives}>
              Recuperar
            </button>
          </div>
        )}

        {nextLesson ? (
          <>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h2 className="text-[1.4rem] font-extrabold text-primary leading-[1.2] tracking-[-0.3px] mb-1">¡Hola{firstName ? ` ${firstName}` : ''}! ¿Qué vamos a aprender hoy?</h2>
                <p className="text-[0.85rem] text-muted-foreground">Sigue tu camino, una palabra a la vez.</p>
              </div>
              <div className="text-[2.5rem] leading-none animate-[float-slow_4s_ease-in-out_infinite]">☀️</div>
            </div>

            <button
              className="btn btn-primary w-full mb-2 py-4 text-[1.1rem] rounded-lg shadow-[0_4px_12px_rgba(45,106,79,0.3)]"
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

            <p className="text-[0.75rem] font-extrabold uppercase tracking-[1px] text-primary mt-2 -mb-1">SECCIÓN: {nextLesson.section.title}</p>
            
            <div className="flex flex-col">
              {lessonsToShow.map((lesson) => {
                const lessonIndex = nextLesson.section.lessons.findIndex(l => l.id === lesson.id)
                const prog = sectionProgress[nextLesson.section.id]?.lessonsCompleted?.[lesson.id];
                const completed = prog?.completed === true;
                const unlocked = lessonIndex === 0 || sectionProgress[nextLesson.section.id]?.lessonsCompleted?.[nextLesson.section.lessons[lessonIndex - 1].id]?.completed === true;
                
                return (
                  <button
                    key={lesson.id}
                    className="flex items-stretch bg-card rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all text-left border border-black/[0.03] mb-2 w-full active:enabled:scale-[0.98] active:enabled:shadow-[0_2px_8px_rgba(0,0,0,0.05)] disabled:opacity-65 disabled:cursor-not-allowed disabled:grayscale-50"
                    style={{ '--card-color': lesson.color || nextLesson.section.color }}
                    disabled={!unlocked || lives === 0}
                    onClick={() => navigate(`/section/${nextLesson.section.id}/lesson/${lesson.id}`)}
                  >
                    <div className="w-2 shrink-0" style={{ background: `var(--card-color, var(--nahuat-green))` }} />
                    <div className="w-[90px] flex items-center justify-center p-3 bg-[#f8f9fa] shrink-0 relative overflow-hidden">
                       <img src={`/assets/images/section${nextLesson.section.id}.png`} alt="" className="w-full h-auto rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] object-cover aspect-square" />
                    </div>
                    <div className="flex-1 px-3 py-4 pr-4 flex items-center justify-between gap-3">
                      <div className="flex-1 flex flex-col">
                        <span className="text-base font-bold text-foreground mb-1 leading-[1.2]">{lesson.title}</span>
                        <span className="text-[0.75rem] text-muted-foreground leading-[1.4]">{lesson.description}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 min-w-[50px]">
                        {!unlocked ? (
                          <>
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-base">🔒</div>
                            <span className="text-[0.65rem] font-semibold text-muted-foreground">Bloqueado</span>
                          </>
                        ) : completed ? (
                           <div className="text-[1.1rem] font-extrabold text-nahuat-correct">✓</div>
                        ) : (
                          <>
                            <span className="text-[1.1rem] font-extrabold text-primary">+{lesson.xpReward}</span>
                            <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">XP</span>
                          </>
                        )}
                        {unlocked && !completed && <span className="text-[1.2rem] text-primary font-extrabold">›</span>}
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
                      className="flex items-stretch bg-gradient-to-br from-[#fffcf5] to-[#fff6e0] rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all text-left border border-[#ffe0b2] mb-2 w-full active:enabled:scale-[0.98] active:enabled:shadow-[0_2px_8px_rgba(0,0,0,0.05)] disabled:opacity-65 disabled:cursor-not-allowed disabled:grayscale-50"
                      disabled={!allLessonsDone || lives === 0}
                      onClick={() => navigate(`/section/${nextLesson.section.id}/boss`)}
                    >
                      <div className="w-2 shrink-0 bg-nahuat-gold" />
                      <div className="w-[90px] flex items-center justify-center p-3 bg-[#f8f9fa] shrink-0 relative overflow-hidden">
                         <img src={`/assets/images/section${nextLesson.section.id}.png`} alt="" className="w-full h-auto rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] object-cover aspect-square" />
                      </div>
                      <div className="flex-1 px-3 py-4 pr-4 flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col">
                          <span className="text-base font-bold text-foreground mb-1 leading-[1.2]">{nextLesson.section.boss.title}</span>
                          <span className="text-[0.75rem] text-muted-foreground leading-[1.4]">{nextLesson.section.boss.description}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 min-w-[50px]">
                          {!allLessonsDone ? (
                            <>
                              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-base">🔒</div>
                              <span className="text-[0.65rem] font-semibold text-muted-foreground">Bloqueado</span>
                            </>
                          ) : bossDone ? (
                             <div className="text-[1.1rem] font-extrabold text-nahuat-correct">✓</div>
                          ) : (
                            <>
                              <span className="text-[1.1rem] font-extrabold text-primary">+{nextLesson.section.boss.xpReward}</span>
                              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">XP</span>
                              <span className="text-[1.2rem] text-primary font-extrabold">›</span>
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
          <div className="text-center px-5 py-10 flex flex-col items-center gap-2">
            <span className="text-5xl">🎉</span>
            <h2 className="text-[1.3rem] font-extrabold text-foreground">¡Felicidades!</h2>
            <p className="text-[0.9rem] text-muted-foreground">Has completado todas las lecciones disponibles.</p>
          </div>
        )}

        <button
          className="bg-gradient-to-r from-primary to-[#1f4f3b] text-white px-5 py-4 rounded-[20px] flex items-center justify-between mt-3 shadow-[0_4px_16px_rgba(29,73,54,0.2)] transition-transform active:scale-[0.98] w-full"
          onClick={() => navigate('/sections')}
        >
          <div className="flex items-center gap-3">
             <span className="text-2xl">📚</span>
             <span className="text-base font-bold">Ver todas las secciones</span>
          </div>
          <span className="text-[1.2rem] font-extrabold">→</span>
        </button>
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-[90px] shrink-0" />
    </div>
  )
}
