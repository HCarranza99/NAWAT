import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock,
  Map,
  Play,
  Sprout,
} from 'lucide-react'

import useGameStore from '../store/useGameStore'
import TorogozBadge from '../components/ui/TorogozBadge'
import Torogoz from '../components/ui/Torogoz'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { useSections } from '../hooks/useSections'

function SectionGlyph({ sectionId, color }) {
  const icons = [Sprout, Map, Play, Crown, Check]
  const Icon = icons[(sectionId - 1) % icons.length]

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border"
      style={{ color, backgroundColor: `${color}14`, borderColor: `${color}30` }}
    >
      <Icon className="h-5 w-5" strokeWidth={2.4} />
    </div>
  )
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e8ece6]">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function SectionsScreen() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const sections = useSections()
  const { sectionProgress } = useGameStore()
  const [expandedSection, setExpandedSection] = useState(() => sections[0]?.id ?? null)

  const isSectionUnlocked = (sectionIndex) => {
    if (sectionIndex === 0) return true
    const prevSection = sections[sectionIndex - 1]
    const prevProg = sectionProgress[prevSection.id]
    return prevProg?.bossCompleted === true
  }

  const getSectionStats = (section) => {
    const prog = sectionProgress[section.id] || { lessonsCompleted: {}, bossCompleted: false }
    const totalLessons = section.lessons.length
    const completedLessons = Object.values(prog.lessonsCompleted || {}).filter((lesson) => lesson.completed).length
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
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      {!isDesktop && (
      <header className="brand-header px-5 pb-6 pt-5">
        <div className="relative z-10 flex items-center gap-3">
          <TorogozBadge size={48} />
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">Ruta de aprendizaje</p>
            <h1 className="mt-1 text-3xl font-black leading-none tracking-normal">Secciones</h1>
            <p className="mt-2 text-sm font-medium text-white/65">Tu camino para aprender náhuat</p>
          </div>
        </div>
      </header>
      )}
      <main className="space-y-3 px-5 pt-5 lg:mx-auto lg:max-w-[820px] lg:px-8 lg:pt-9">
        {isDesktop && (
        <div className="mb-3">
          <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">Ruta de aprendizaje</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">Secciones</h1>
          <p className="mt-1.5 text-sm font-medium text-[#6d756e]">Tu camino para aprender el idioma</p>
        </div>
        )}
        {sections.map((section, sectionIndex) => {
          const unlocked = isSectionUnlocked(sectionIndex)
          const stats = getSectionStats(section)
          const isExpanded = expandedSection === section.id

          return (
            <section
              key={section.id}
              data-testid="section-card"
              className={`overflow-hidden rounded-lg border border-[#e3ded2] bg-white shadow-[0_12px_32px_rgba(37,48,42,0.06)] transition-all duration-300 ${
                !unlocked ? 'opacity-35 saturate-[0.25] scale-[0.98]' : ''
              }`}
            >
              <button
                className="grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 px-3 py-3 text-left disabled:cursor-not-allowed"
                onClick={() => {
                  if (!unlocked) return
                  setExpandedSection(isExpanded ? null : section.id)
                }}
                disabled={!unlocked}
              >
                <div className="h-16 w-16 overflow-hidden rounded-md bg-[#f0ede5]">
                  <img
                    src={`/assets/images/section${section.id}.png`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <SectionGlyph sectionId={section.id} color={section.color} />
                    <div className="min-w-0">
                      <p className="truncate text-base font-black leading-tight text-[#17211d]">{section.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#6d756e]">{section.description}</p>
                    </div>
                  </div>
                  {unlocked && (
                    <div className="mt-3">
                      <ProgressBar value={stats.progressPct} color={section.color} />
                      <p className="mt-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">
                        {stats.completedLessons}/{stats.totalLessons} lecciones
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f7f5ef] text-[#46524a]">
                  {!unlocked ? (
                    <Lock className="h-4 w-4" />
                  ) : stats.sectionCompleted ? (
                    <Check className="h-5 w-5 text-[#1f7a57]" />
                  ) : isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>
              {isExpanded && unlocked && (
                <div className="space-y-3 border-t border-[#eee9de] bg-[#fbfaf7] px-3 py-4">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const lessonUnlocked = isLessonUnlocked(section, lessonIndex)
                    const lessonProgress = sectionProgress[section.id]?.lessonsCompleted?.[lesson.id]
                    const lessonCompleted = lessonProgress?.completed === true
                    const isActive = lessonUnlocked && !lessonCompleted
                    const disabled = !lessonUnlocked

                    // Clases dinámicas de alto contraste para las lecciones
                    const getLessonCardClass = () => {
                      if (isActive) {
                        return "relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border-2 border-[#1f7a57] bg-gradient-to-r from-white to-[#f4fbf8] px-3.5 py-4 text-left shadow-[0_12px_28px_rgba(31,122,87,0.18),0_0_20px_rgba(31,122,87,0.1)] transition active:scale-[0.99] scale-[1.01] z-10"
                      }
                      if (lessonCompleted) {
                        return "grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[#52b788]/20 bg-[#f4fbf7] px-3.5 py-3.5 text-left transition active:scale-[0.99] opacity-80"
                      }
                      return "grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[#d8ddd5]/60 bg-[#f4f3ee]/40 px-3.5 py-3 text-left opacity-35 cursor-not-allowed"
                    }

                    const getLessonIconClass = () => {
                      if (isActive) {
                        return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f7a57] text-white shadow-[0_6px_14px_rgba(31,122,87,0.25)] animate-pulse"
                      }
                      if (lessonCompleted) {
                        return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#d8f3dc] text-[#1f7a57] border border-[#52b788]/20"
                      }
                      return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8ece6] text-[#8b938c]"
                    }

                    return (
                      <button
                        key={lesson.id}
                        className={getLessonCardClass()}
                        onClick={() => !disabled && navigate(`/section/${section.id}/lesson/${lesson.id}`)}
                        disabled={disabled}
                      >
                        <div className={getLessonIconClass()}>
                          {!lessonUnlocked ? (
                            <Lock className="h-4.5 w-4.5" />
                          ) : lessonCompleted ? (
                            <Check className="h-5.5 w-5.5" strokeWidth={3} />
                          ) : (
                            <Play className="h-4.5 w-4.5 fill-current" />
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`truncate text-sm font-black ${isActive ? 'text-[#102f29]' : 'text-[#17211d]'}`}>
                              {lesson.title}
                            </p>
                            {isActive && (
                              <span className="rounded-full bg-[#f4a261] px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.12em] text-[#102f29] shadow-xs">
                                JUGAR
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs font-semibold leading-relaxed text-[#6d756e]">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-[0.1em] ${isActive ? 'text-[#1f7a57]' : 'text-[#6d756e]'}`}>
                            +{lesson.xpReward}
                          </span>
                          <ArrowRight className={`h-4.5 w-4.5 ${isActive ? 'text-[#1f7a57] translate-x-0.5' : 'text-[#8b938c]'}`} />
                        </div>

                        {/* Mini-Torogoz 3D Guía flotando sobre la lección activa */}
                        {isActive && (
                          <div className="absolute -top-3.5 -right-2.5 z-20 pointer-events-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)] animate-bounce" style={{ animationDuration: '3s' }}>
                            <Torogoz emotion="explaining" size={42} />
                          </div>
                        )}
                      </button>
                    )
                  })}

                  {/* Rediseño del Boss/Reto Final con contraste radical */}
                  {section.boss && (() => {
                    const bossAvailable = stats.bossAvailable
                    const bossCompleted = stats.bossCompleted
                    const isBossActive = bossAvailable && !bossCompleted
                    const disabled = !bossAvailable

                    const getBossCardClass = () => {
                      if (isBossActive) {
                        return "relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border-2 border-[#c77918] bg-gradient-to-r from-white to-[#fffbf4] px-3.5 py-4 text-left shadow-[0_12px_28px_rgba(199,121,24,0.2),0_0_20px_rgba(199,121,24,0.12)] transition active:scale-[0.99] scale-[1.01] z-10"
                      }
                      if (bossCompleted) {
                        return "grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[#52b788]/20 bg-[#f4fbf7] px-3.5 py-3.5 text-left transition active:scale-[0.99] opacity-80"
                      }
                      return "grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[#e3ded2]/60 bg-[#f4f3ee]/40 px-3.5 py-3 text-left opacity-35 cursor-not-allowed"
                    }

                    const getBossIconClass = () => {
                      if (isBossActive) {
                        return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#c77918] text-white shadow-[0_6px_14px_rgba(199,121,24,0.25)] animate-bounce"
                      }
                      if (bossCompleted) {
                        return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#d8f3dc] text-[#1f7a57] border border-[#52b788]/20"
                      }
                      return "flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0ede5] text-[#8b938c]"
                    }

                    return (
                      <button
                        className={getBossCardClass()}
                        onClick={() => stats.bossAvailable && navigate(`/section/${section.id}/boss`)}
                        disabled={disabled}
                      >
                        <div className={getBossIconClass()}>
                          {!bossAvailable ? (
                            <Lock className="h-4.5 w-4.5" />
                          ) : bossCompleted ? (
                            <Check className="h-5.5 w-5.5" strokeWidth={3} />
                          ) : (
                            <Crown className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black text-[#17211d]">{section.boss.title}</p>
                            {isBossActive && (
                              <span className="rounded-full bg-[#e65100] px-2 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.12em] text-white shadow-xs animate-pulse">
                                RETO FINAL
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs font-semibold leading-relaxed text-[#6d756e]">
                            {section.boss.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-[0.1em] ${isBossActive ? 'text-[#b95a18]' : 'text-[#6d756e]'}`}>
                            +{section.boss.xpReward}
                          </span>
                          <ArrowRight className={`h-4.5 w-4.5 ${isBossActive ? 'text-[#b95a18] translate-x-0.5' : 'text-[#8b938c]'}`} />
                        </div>

                        {/* Mini-Torogoz 3D Guía flotando sobre el boss activo */}
                        {isBossActive && (
                          <div className="absolute -top-3.5 -right-2.5 z-20 pointer-events-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)] animate-bounce" style={{ animationDuration: '3.0s' }}>
                            <Torogoz emotion="achievement" size={42} />
                          </div>
                        )}
                      </button>
                    )
                  })()}
                </div>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
