import { motion } from 'motion/react'
import {
  Award, BookOpen, Crown, Flame, Lock, Medal, Sparkles, Star, Trophy, Zap,
} from 'lucide-react'

import useGameStore from '../store/useGameStore'
import { GAME_CONFIG } from '../data/gameConfig'
import TorogozBadge from '../components/ui/TorogozBadge'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { useSections } from '../hooks/useSections'

function buildAchievements({ xp, streak, totalLessons, totalStars, totalSections, level }) {
  return [
    { id: 'first', icon: BookOpen, title: 'Primer paso', desc: 'Completa tu primera lección', unlocked: totalLessons >= 1, tone: 'text-[#1f7a57]', bg: 'bg-[#dff3e7]' },
    { id: 'five', icon: Sparkles, title: 'En marcha', desc: 'Completa 5 lecciones', unlocked: totalLessons >= 5, tone: 'text-[#2f6fb2]', bg: 'bg-[#e1eefb]' },
    { id: 'streak3', icon: Flame, title: 'Constancia', desc: 'Racha de 3 días', unlocked: streak >= 3, tone: 'text-[#c77918]', bg: 'bg-[#ffe8d6]' },
    { id: 'streak7', icon: Flame, title: 'Imparable', desc: 'Racha de 7 días', unlocked: streak >= 7, tone: 'text-[#e65100]', bg: 'bg-[#ffe0cc]' },
    { id: 'xp100', icon: Zap, title: 'Centenario', desc: 'Acumula 100 XP', unlocked: xp >= 100, tone: 'text-[#1f7a57]', bg: 'bg-[#dff3e7]' },
    { id: 'level2', icon: Trophy, title: 'Ascenso', desc: 'Alcanza el nivel 2', unlocked: level >= 2, tone: 'text-[#c77918]', bg: 'bg-[#fff1da]' },
    { id: 'stars10', icon: Star, title: 'Coleccionista', desc: 'Reúne 10 estrellas', unlocked: totalStars >= 10, tone: 'text-[#d89a1d]', bg: 'bg-[#fff6dd]' },
    { id: 'section1', icon: Crown, title: 'Conquistador', desc: 'Completa una sección', unlocked: totalSections >= 1, tone: 'text-[#8d4ac3]', bg: 'bg-[#f1e6fb]' },
  ]
}

function SummaryStat({ icon: Icon, value, label, tone }) {
  return (
    <div className="surface-card flex items-center gap-3 p-3.5">
      <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
      <div className="min-w-0">
        <p className="text-xl font-black leading-none text-[#17211d] tabular-nums">{value}</p>
        <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#6d756e]">{label}</p>
      </div>
    </div>
  )
}

export default function LogrosScreen() {
  const isDesktop = useIsDesktop()
  const sections = useSections()
  const { xp, streak, sectionProgress } = useGameStore()

  const level = Math.floor(xp / GAME_CONFIG.xp.perLevel) + 1
  const totalLessons = sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    return acc + Object.values(prog.lessonsCompleted).filter((l) => l.completed).length
  }, 0)
  const totalStars = sections.reduce((acc, s) => {
    const prog = sectionProgress[s.id]
    if (!prog?.lessonsCompleted) return acc
    const ls = Object.values(prog.lessonsCompleted).reduce((sum, l) => sum + (l.stars || 0), 0)
    return acc + ls + (prog.bossStars || 0)
  }, 0)
  const completedSections = sections.filter((s) => sectionProgress[s.id]?.bossCompleted === true)
  const totalSections = completedSections.length

  const achievements = buildAchievements({ xp, streak, totalLessons, totalStars, totalSections, level })
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="screen bg-[#f7f5ef] pb-28 lg:pb-12">
      {!isDesktop && (
        <header className="brand-header px-5 pb-6 pt-5">
          <div className="relative z-10 flex items-center gap-3">
            <TorogozBadge size={48} />
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#9ddfc6]">Tus trofeos</p>
              <h1 className="mt-1 text-3xl font-black leading-none tracking-normal">Logros</h1>
              <p className="mt-2 text-sm font-medium text-white/65">{unlockedCount} de {achievements.length} desbloqueados</p>
            </div>
          </div>
        </header>
      )}

      <main className="space-y-6 px-5 pt-5 lg:mx-auto lg:max-w-[1000px] lg:px-10 lg:pt-9">
        {isDesktop && (
          <div className="flex items-end justify-between">
            <div>
              <p className="flex items-center gap-2 text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#6d756e]">
                <Sparkles className="h-3.5 w-3.5 text-[#f4a261]" /> Tus trofeos
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17211d]">Logros</h1>
              <p className="mt-1.5 text-sm font-medium text-[#6d756e]">{unlockedCount} de {achievements.length} desbloqueados</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7b076] to-[#f4a261] text-[#102f29] shadow-[0_10px_22px_rgba(244,162,97,0.32)]">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
        )}

        {/* Resumen */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryStat icon={Zap} value={xp} label="XP total" tone="text-[#1f7a57]" />
          <SummaryStat icon={Star} value={totalStars} label="Estrellas" tone="text-[#d89a1d]" />
          <SummaryStat icon={BookOpen} value={totalLessons} label="Lecciones" tone="text-[#2f6fb2]" />
          <SummaryStat icon={Crown} value={totalSections} label="Secciones" tone="text-[#8d4ac3]" />
        </section>

        {/* Insignias por sección */}
        {totalSections > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#1f7a57]" />
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">Insignias</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {completedSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-extrabold text-[#17211d]"
                  style={{ borderColor: `${section.color}55`, backgroundColor: `${section.color}12` }}
                >
                  <Medal className="h-4 w-4" style={{ color: section.color }} />
                  {section.title}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trofeos */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#c77918]" />
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#17211d]">Trofeos</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a, i) => {
              const Icon = a.unlocked ? a.icon : Lock
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`surface-card flex items-center gap-3.5 p-4 ${a.unlocked ? '' : 'opacity-60 saturate-[0.4]'}`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${a.unlocked ? a.bg : 'bg-[#eef0ea]'} ${a.unlocked ? a.tone : 'text-[#9aa39c]'}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black leading-tight text-[#17211d]">{a.title}</p>
                    <p className="mt-0.5 text-xs font-semibold leading-snug text-[#6d756e]">{a.desc}</p>
                  </div>
                  {a.unlocked && <Star className="ml-auto h-4 w-4 shrink-0 fill-[#f4a261] text-[#f4a261]" />}
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
