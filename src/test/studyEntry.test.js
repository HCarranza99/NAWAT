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

  it('reconoce al participante en curso al entrar por el enlace normal /', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'pretest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    // No lo deja escapar al modo libre: reanuda donde iba.
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('pretest')
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

  it('migra usuarios previos (v1 con consentimiento) a inscritos en el estudio', async () => {
    seedPersisted(
      { studyPhase: 'pretest', consentAcceptedAt: '2026-01-01T00:00:00.000Z' },
      1,
    )
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('pretest')
  })
})
