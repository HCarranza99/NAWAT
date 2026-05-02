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
    <div className="screen sections-screen">
      {/* Header */}
      <header className="sections-header">
        <div className="sections-header-inner">
          <TorogozBadge size={42} />
          <div>
            <h1 className="sections-title">Secciones</h1>
            <p className="sections-subtitle">Tu camino para aprender náhuat</p>
          </div>
        </div>
      </header>

      {/* Section List */}
      <main className="sections-list">
        {sections.map((section, sIndex) => {
          const unlocked = isSectionUnlocked(sIndex)
          const stats = getSectionStats(section)
          const isExpanded = expandedSection === section.id

          return (
            <div
              key={section.id}
              className={`section-card ${!unlocked ? 'section-locked' : ''} ${stats.sectionCompleted ? 'section-done' : ''}`}
              style={{ '--section-color': section.color }}
            >
              {/* Section Header - clickable to expand */}
              <button
                className="section-card-header"
                onClick={() => {
                  if (!unlocked) return
                  setExpandedSection(isExpanded ? null : section.id)
                }}
                disabled={!unlocked}
              >
                <div
                  className="section-icon-wrap"
                  style={{ background: section.color + '22' }}
                >
                  <span className="section-icon">{section.icon}</span>
                </div>
                <div className="section-info">
                  <h2 className="section-name">{section.title}</h2>
                  <p className="section-desc">{section.description}</p>
                  {/* Progress bar */}
                  {unlocked && (
                    <div className="section-progress-track">
                      <div
                        className="section-progress-fill"
                        style={{ width: `${stats.progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="section-right">
                  {!unlocked ? (
                    <span className="section-lock-icon">🔒</span>
                  ) : stats.sectionCompleted ? (
                    <span className="section-complete-badge">✓</span>
                  ) : (
                    <span className="section-chevron">{isExpanded ? '▲' : '▼'}</span>
                  )}
                </div>
              </button>

              {/* Expanded lessons list */}
              {isExpanded && unlocked && (
                <div className="section-lessons organic-lessons-list" style={{ marginTop: '16px' }}>
                  {section.lessons.map((lesson, lIndex) => {
                    const lessonUnlocked = isLessonUnlocked(section, lIndex)
                    const lessonProg = sectionProgress[section.id]?.lessonsCompleted?.[lesson.id]
                    const lessonCompleted = lessonProg?.completed === true
                    const disabled = !lessonUnlocked || lives === 0

                    return (
                      <button
                        key={lesson.id}
                        className="organic-lesson-card"
                        style={{ '--card-color': lesson.color || section.color }}
                        onClick={() => !disabled && navigate(`/section/${section.id}/lesson/${lesson.id}`)}
                        disabled={disabled}
                      >
                        <div className="organic-card-strip" />
                        <div className="organic-card-img-wrap">
                           <img src={`/assets/images/section${section.id}.png`} alt="" className="organic-card-img" />
                        </div>
                        <div className="organic-card-content">
                          <div className="organic-card-info">
                            <span className="organic-card-title">{lesson.title}</span>
                            <span className="organic-card-desc">{lesson.description}</span>
                          </div>
                          <div className="organic-card-action">
                            {!lessonUnlocked ? (
                              <>
                                <div className="organic-card-lock">🔒</div>
                                <span className="organic-card-lock-label">Bloqueado</span>
                              </>
                            ) : lessonCompleted ? (
                               <div className="organic-card-xp" style={{ color: 'var(--correct)' }}>✓</div>
                            ) : (
                              <>
                                <span className="organic-card-xp">+{lesson.xpReward}</span>
                                <span className="organic-card-xp-label">XP</span>
                                <span className="organic-card-arrow">›</span>
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
                      className="organic-lesson-card organic-boss-card"
                      onClick={() => stats.bossAvailable && lives > 0 && navigate(`/section/${section.id}/boss`)}
                      disabled={!stats.bossAvailable || lives === 0}
                    >
                      <div className="organic-card-strip" />
                      <div className="organic-card-img-wrap">
                         <img src={`/assets/images/section${section.id}.png`} alt="" className="organic-card-img" />
                      </div>
                      <div className="organic-card-content">
                        <div className="organic-card-info">
                          <span className="organic-card-title">{section.boss.title}</span>
                          <span className="organic-card-desc">{section.boss.description}</span>
                        </div>
                        <div className="organic-card-action">
                          {!stats.bossAvailable ? (
                            <>
                              <div className="organic-card-lock">🔒</div>
                              <span className="organic-card-lock-label">Bloqueado</span>
                            </>
                          ) : stats.bossCompleted ? (
                             <div className="organic-card-xp" style={{ color: 'var(--correct)' }}>✓</div>
                          ) : (
                            <>
                              <span className="organic-card-xp">+{section.boss.xpReward}</span>
                              <span className="organic-card-xp-label">XP</span>
                              <span className="organic-card-arrow">›</span>
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
      <div className="bottom-nav-spacer" />
    </div>
  )
}
