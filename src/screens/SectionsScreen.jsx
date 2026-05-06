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

import sections from '../data/sections'
import useGameStore from '../store/useGameStore'
import TorogozBadge from '../components/ui/TorogozBadge'

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
  const { sectionProgress, lives } = useGameStore()
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
    <div className="screen bg-[#f7f5ef] pb-28">
      <header className="bg-[#102f29] px-5 pb-5 pt-5 text-white">
        <div className="flex items-center gap-3">
          <TorogozBadge size={48} />
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">Ruta de aprendizaje</p>
            <h1 className="mt-1 text-3xl font-black leading-none tracking-normal">Secciones</h1>
            <p className="mt-2 text-sm font-medium text-white/65">Tu camino para aprender náhuat</p>
          </div>
        </div>
      </header>

      <main className="space-y-3 px-5 pt-5">
        {sections.map((section, sectionIndex) => {
          const unlocked = isSectionUnlocked(sectionIndex)
          const stats = getSectionStats(section)
          const isExpanded = expandedSection === section.id

          return (
            <section
              key={section.id}
              data-testid="section-card"
              className={`overflow-hidden rounded-lg border border-[#e3ded2] bg-white shadow-[0_12px_32px_rgba(37,48,42,0.06)] transition ${
                !unlocked ? 'opacity-55' : ''
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
                <div className="space-y-2 border-t border-[#eee9de] bg-[#fbfaf7] px-3 py-3">
                  {section.lessons.map((lesson, lessonIndex) => {
                    const lessonUnlocked = isLessonUnlocked(section, lessonIndex)
                    const lessonProgress = sectionProgress[section.id]?.lessonsCompleted?.[lesson.id]
                    const lessonCompleted = lessonProgress?.completed === true
                    const disabled = !lessonUnlocked || lives === 0

                    return (
                      <button
                        key={lesson.id}
                        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-[#e7e2d7] bg-white px-3 py-3 text-left shadow-sm transition active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => !disabled && navigate(`/section/${section.id}/lesson/${lesson.id}`)}
                        disabled={disabled}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${lesson.color || section.color}16`, color: lesson.color || section.color }}
                        >
                          {!lessonUnlocked ? <Lock className="h-4 w-4" /> : lessonCompleted ? <Check className="h-5 w-5" /> : <Play className="h-4 w-4 fill-current" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#17211d]">{lesson.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-[#6d756e]">{lesson.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-[0.1em] text-[#6d756e]">+{lesson.xpReward}</span>
                          <ArrowRight className="h-4 w-4 text-[#1f7a57]" />
                        </div>
                      </button>
                    )
                  })}

                  {section.boss && (
                    <button
                      className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-[#f4d7ad] bg-[#fff8ec] px-3 py-3 text-left shadow-sm transition active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => stats.bossAvailable && lives > 0 && navigate(`/section/${section.id}/boss`)}
                      disabled={!stats.bossAvailable || lives === 0}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f4a261]/18 text-[#b95a18]">
                        {!stats.bossAvailable ? <Lock className="h-4 w-4" /> : stats.bossCompleted ? <Check className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#17211d]">{section.boss.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-[#6d756e]">{section.boss.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.1em] text-[#6d756e]">+{section.boss.xpReward}</span>
                        <ArrowRight className="h-4 w-4 text-[#b95a18]" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
