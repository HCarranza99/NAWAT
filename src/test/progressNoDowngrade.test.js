import { describe, it, expect, beforeEach } from 'vitest'
import useGameStore from '../store/useGameStore'

beforeEach(() => {
  useGameStore.setState({ xp: 0, sectionProgress: {}, lessonProgress: {} })
})

describe('Progreso: repetir y fallar no degrada lo ya aprobado', () => {
  it('completeSectionLesson conserva completed/estrellas/score al fallar', () => {
    const { completeSectionLesson } = useGameStore.getState()
    completeSectionLesson(1, 'l1', 0.9, 10) // aprueba (2 estrellas)
    completeSectionLesson(1, 'l1', 0.3, 10) // reintenta y falla
    const p = useGameStore.getState().sectionProgress[1].lessonsCompleted['l1']
    expect(p.completed).toBe(true)
    expect(p.stars).toBe(2)
    expect(p.score).toBe(0.9)
  })

  it('completeSectionBoss no se desbloquea al fallar tras aprobar', () => {
    const { completeSectionBoss } = useGameStore.getState()
    completeSectionBoss(1, 0.9, 50)
    completeSectionBoss(1, 0.3, 50)
    expect(useGameStore.getState().sectionProgress[1].bossCompleted).toBe(true)
  })

  it('completeLesson (legacy) tampoco se degrada', () => {
    const { completeLesson } = useGameStore.getState()
    completeLesson('x', 0.95, 10) // 3 estrellas
    completeLesson('x', 0.2, 10)
    const p = useGameStore.getState().lessonProgress['x']
    expect(p.completed).toBe(true)
    expect(p.stars).toBe(3)
  })
})
