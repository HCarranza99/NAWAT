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

// El estudio está ABIERTO (STUDY_OPEN=true): entrar por /estudio inicia el
// protocolo en consentimiento y marca al dispositivo como participante; la fase
// de protocolo persistida se respeta entre cargas (el participante reanuda donde
// quedó). Para cerrar el estudio se pone STUDY_OPEN=false y estos casos volverían
// a esperar que todos entren en modo libre (liberación en onRehydrateStorage).
describe('Estudio abierto: /estudio inicia el protocolo', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('el interruptor STUDY_OPEN está abierto', async () => {
    const { STUDY_OPEN } = await loadStoreAt('/')
    expect(STUDY_OPEN).toBe(true)
  })

  it('en / (sin inscripción previa) arranca en modo libre', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(false)
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  it('/estudio inicia el protocolo: inscribe y arranca en consentimiento', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(true)
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('consent')
  })

  it('?estudio=true también inicia el protocolo', async () => {
    const { default: store } = await loadStoreAt('/?estudio=true')
    const s = store.getState()
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('consent')
  })

  it('resolveStudyEntry detecta /estudio y ?estudio=true', async () => {
    const { resolveStudyEntry } = await loadStoreAt('/')
    expect(resolveStudyEntry({ href: 'https://x.test/estudio' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/?estudio=true' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/estudioso' }).enrollNow).toBe(false)
    expect(resolveStudyEntry({ href: 'https://x.test/' }).enrollNow).toBe(false)
  })

  it('reanuda a un participante a mitad del protocolo al entrar por /', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'pretest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    // Con el estudio abierto NO se libera: reanuda donde quedó.
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('pretest')
  })

  it('reanuda en consentimiento a quien entró por /estudio y aún no consintió', async () => {
    seedPersisted({ enrolledInStudy: true, studyPhase: 'consent' })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    // Ya inscrito → enrollInStudy conserva la fase actual (no reinicia).
    expect(s.studyPhase).toBe('consent')
    expect(s.enrolledInStudy).toBe(true)
  })

  it('reanuda en el postest a quien no lo había completado', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'posttest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      pretestCompletedAt: '2026-01-01T00:10:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.studyPhase).toBe('posttest')
    expect(s.enrolledInStudy).toBe(true)
  })

  it('quien ya completó el estudio no lo repite: queda libre y se le agradece', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'free',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      posttestCompletedAt: '2026-01-01T01:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyThanks).toBe(true)
  })

  it('migra usuarios previos (v1 con consentimiento): inscritos y reanudan su fase', async () => {
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
