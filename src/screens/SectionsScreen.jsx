import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sections from '../data/sections'
import useGameStore from '../store/useGameStore'
import TorogozBadge from '../components/ui/TorogozBadge'

export default function SectionsScreen() {
  const navigate = useNavigate()
  const { sectionProgress, lives } = useGameStore()
  const [expandedSection, setExpandedSection] = useState(null)

  const isSectionUnlocked = (sectionIndex) => {
    if (sectionIndex === 0) return true
    const prevSection = sections[sectionIndex - 1]
    const prevProg = sectionProgress[prevSection.id]
    return prevProg?.bossCompleted === true
  }

  const getSectionStats = (section) => {
    const prog = sectionProgress[section.id] || { lessonsCompleted: {}, bossCompleted: false }
    const totalLessons = section.lessons.length
    const completedLessons = Object.values(prog.lessonsCompleted || {}).filter((l) => l.completed).length
    const allLessonsDone = completedLessons >= totalLessons
    const bossAvailable = allLessonsDone
    const bossCompleted = prog.bossCompleted === true
    const sectionCompleted = allLessonsDone && bossCompleted
    const progressPct = totalLessons > 0
      ? Math.round(((completedLessons + (bossCompleted ? 1 : 0)) / (totalLessons + 1)) * 100)
      : 0

    return { totalLessons, completedLessons, allLessonsDone, bossAvailable, bossCompleted, sectionCompleted, progressPct }
  }

  const isLessonUnlocked = (section, lessonIndex) => {
    if (lessonIndex === 0) return true
    const prevLesson = section.lessons[lessonIndex - 1]
    const prog = sectionProgress[section.id]
    return prog?.lessonsCompleted?.[prevLesson.id]?.completed === true
  }

  return (
    <div className="screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1f4f3b] via-primary to-[#3a8461] text-white px-5 pt-6 pb-7 rounded-b-[24px] shadow-[0_6px_20px_rgba(29,73,54,0.25)]">
        <div className="flex items-center gap-3.5">
          <TorogozBadge size={42} />
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-[-0.5px]">Secciones</h1>
            <p className="text-[0.78rem] text-white/75 mt-0.5">Tu camino para aprender náhuat</p>
          </div>
        </div>
      </header>

      {/* Section List */}
      <main className="px-4 pt-5 pb-3 flex flex-col gap-3.5">
        {sections.map((section, sIndex) => {
          const unlocked = isSectionUnlocked(sIndex)
          const stats = getSectionStats(section)
          const isExpanded = expandedSection === section.id

          return (
            <div
              key={section.id}
              data-testid="section-card"
              className={`bg-card rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.08)] border-l-4 overflow-hidden transition-shadow ${
                !unlocked ? 'opacity-55' : ''
              } ${!unlocked ? '' : 'hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)]'}`}
              style={{ borderLeftColor: section.color }}
            >
              {/* Section Header - clickable to expand */}
              <button
                className={`flex items-center gap-3.5 px-4 py-4 w-full text-left bg-transparent border-none ${
                  unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                onClick={() => {
                  if (!unlocked) return
                  setExpandedSection(isExpanded ? null : section.id)
                }}
                disabled={!unlocked}
              >
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ background: section.color + '22' }}
                >
                  <span className="text-2xl">{section.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-foreground mb-0.5">{section.title}</h2>
                  <p className="text-[0.78rem] text-muted-foreground leading-[1.3]">{section.description}</p>
                  {/* Progress bar */}
                  {unlocked && (
                    <div className="w-full h-1.5 rounded bg-border mt-2 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-nahuat-green-light to-primary transition-[width] duration-400 ease-out"
                        style={{ width: `${stats.progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center justify-center w-8">
                  {!unlocked ? (
                    <span className="text-[1.2rem]">🔒</span>
                  ) : stats.sectionCompleted ? (
                    <span className="text-[1.2rem] font-extrabold text-nahuat-correct bg-nahuat-correct-bg w-8 h-8 rounded-full flex items-center justify-center">✓</span>
                  ) : (
                    <span className="text-[0.75rem] text-muted-foreground transition-transform">{isExpanded ? '▲' : '▼'}</span>
                  )}
                </div>
              </button>

              {/* Expanded lessons list */}
              {isExpanded && unlocked && (
                <div className="px-3 pb-4 flex flex-col gap-2 mt-4 animate-in slide-in-from-top-2 duration-250">
                  {section.lessons.map((lesson, lIndex) => {
                    const lessonUnlocked = isLessonUnlocked(section, lIndex)
                    const lessonProg = sectionProgress[section.id]?.lessonsCompleted?.[lesson.id]
                    const lessonCompleted = lessonProg?.completed === true
                    const disabled = !lessonUnlocked || lives === 0

                    return (
                      <button
                        key={lesson.id}
                        className="flex items-stretch bg-card rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all text-left border border-black/[0.03] w-full active:enabled:scale-[0.98] active:enabled:shadow-[0_2px_8px_rgba(0,0,0,0.05)] disabled:opacity-65 disabled:cursor-not-allowed disabled:grayscale-50"
                        style={{ '--card-color': lesson.color || section.color }}
                        onClick={() => !disabled && navigate(`/section/${section.id}/lesson/${lesson.id}`)}
                        disabled={disabled}
                      >
                        <div className="w-2 shrink-0" style={{ background: `var(--card-color, var(--nahuat-green))` }} />
                        <div className="w-[90px] flex items-center justify-center p-3 bg-[#f8f9fa] shrink-0 relative overflow-hidden">
                           <img src={`/assets/images/section${section.id}.png`} alt="" className="w-full h-auto rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] object-cover aspect-square" />
                        </div>
                        <div className="flex-1 px-4 py-4 flex items-center justify-between gap-3">
                          <div className="flex-1 flex flex-col">
                            <span className="text-base font-bold text-foreground mb-1 leading-[1.2]">{lesson.title}</span>
                            <span className="text-[0.75rem] text-muted-foreground leading-[1.4]">{lesson.description}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1 min-w-[50px]">
                            {!lessonUnlocked ? (
                              <>
                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-base">🔒</div>
                                <span className="text-[0.65rem] font-semibold text-muted-foreground">Bloqueado</span>
                              </>
                            ) : lessonCompleted ? (
                               <div className="text-[1.1rem] font-extrabold text-nahuat-correct">✓</div>
                            ) : (
                              <>
                                <span className="text-[1.1rem] font-extrabold text-primary">+{lesson.xpReward}</span>
                                <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">XP</span>
                                <span className="text-[1.2rem] text-primary font-extrabold">›</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {/* Boss button */}
                  {section.boss && (
                    <button
                      className="flex items-stretch bg-gradient-to-br from-[#fffcf5] to-[#fff6e0] rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all text-left border border-[#ffe0b2] w-full active:enabled:scale-[0.98] active:enabled:shadow-[0_2px_8px_rgba(0,0,0,0.05)] disabled:opacity-65 disabled:cursor-not-allowed disabled:grayscale-50"
                      onClick={() => stats.bossAvailable && lives > 0 && navigate(`/section/${section.id}/boss`)}
                      disabled={!stats.bossAvailable || lives === 0}
                    >
                      <div className="w-2 shrink-0 bg-nahuat-gold" />
                      <div className="w-[90px] flex items-center justify-center p-3 bg-[#f8f9fa] shrink-0 relative overflow-hidden">
                         <img src={`/assets/images/section${section.id}.png`} alt="" className="w-full h-auto rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] object-cover aspect-square" />
                      </div>
                      <div className="flex-1 px-4 py-4 flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col">
                          <span className="text-base font-bold text-foreground mb-1 leading-[1.2]">{section.boss.title}</span>
                          <span className="text-[0.75rem] text-muted-foreground leading-[1.4]">{section.boss.description}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 min-w-[50px]">
                          {!stats.bossAvailable ? (
                            <>
                              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-base">🔒</div>
                              <span className="text-[0.65rem] font-semibold text-muted-foreground">Bloqueado</span>
                            </>
                          ) : stats.bossCompleted ? (
                             <div className="text-[1.1rem] font-extrabold text-nahuat-correct">✓</div>
                          ) : (
                            <>
                              <span className="text-[1.1rem] font-extrabold text-primary">+{section.boss.xpReward}</span>
                              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">XP</span>
                              <span className="text-[1.2rem] text-primary font-extrabold">›</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-[90px] shrink-0" />
    </div>
  )
}
