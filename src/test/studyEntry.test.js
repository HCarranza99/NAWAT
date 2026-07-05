import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const STORE_KEY = 'nahuat-game-v1'

function seedPersisted(state, version = 2) {
  localStorage.setItem(STORE_KEY, JSON.stringify({ state, version }))
}

async function loadStoreAt(url) {
  window.history.replaceState({}, '', url)
  vi.resetModules()
  const mod = await import('../store/useGameStore')
  return mod
}

describe('Resolución de entrada: libre vs /estudio', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('en / (sin inscripción previa) arranca en modo libre', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(false)
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  it('en /estudio inscribe, arranca el consentimiento y normaliza la URL a /', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(true)
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('consent')
    expect(window.location.pathname).toBe('/')
  })

  it('soporta el enlace ?estudio=true apuntando a la raíz', async () => {
    const { default: store } = await loadStoreAt('/?estudio=true')
    expect(store.getState().enrolledInStudy).toBe(true)
    expect(store.getState().studyPhase).toBe('consent')
    expect(window.location.search).toBe('')
  })

  it('no confunde rutas parecidas (/estudioso) con el enlace del estudio', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/estudioso')
    expect(STUDY_LINK_ENTRY).toBe(false)
    expect(store.getState().enrolledInStudy).toBe(false)
  })

  it('libera a un participante en curso (recolección cerrada) al entrar por /', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'pretest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    // Terminada la recolección (migración v3): se le da acceso libre a la app en
    // vez de retenerlo en la fase del protocolo, sin perder sus datos de inscripción.
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('free')
  })

  it('un usuario libre que abre /estudio se inscribe y empieza el protocolo', async () => {
    seedPersisted({ enrolledInStudy: false, studyPhase: 'free' })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('consent')
  })

  it('quien ya completó el estudio y vuelve por /estudio ve el aviso y mantiene acceso libre', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'free',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      posttestCompletedAt: '2026-01-01T01:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(s.studyThanks).toBe(true)
    expect(s.studyPhase).toBe('free')
    expect(s.enrolledInStudy).toBe(true)
  })

  it('migra usuarios previos (v1 con consentimiento): inscritos y liberados a libre', async () => {
    seedPersisted(
      { studyPhase: 'pretest', consentAcceptedAt: '2026-01-01T00:00:00.000Z' },
      1,
    )
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('free')
  })

  it('libera a quien quedó atascado en el postest sin completarlo', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'posttest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      pretestCompletedAt: '2026-01-01T00:10:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    // Antes: pantalla de postest para siempre (no podía entrar a la app).
    expect(s.studyPhase).toBe('free')
    expect(s.enrolledInStudy).toBe(true)
  })
})
