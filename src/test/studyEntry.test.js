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

// El estudio está CERRADO (STUDY_OPEN=false): terminada la recolección, nadie
// inicia el protocolo y ningún dispositivo queda retenido en él. Estos tests
// documentan ese comportamiento. Para reabrir el estudio se pone STUDY_OPEN=true
// y estos casos volverían a esperar el flujo de consentimiento/inscripción.
describe('Estudio cerrado: todos entran en modo libre', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('el interruptor STUDY_OPEN está cerrado', async () => {
    const { STUDY_OPEN } = await loadStoreAt('/')
    expect(STUDY_OPEN).toBe(false)
  })

  it('en / (sin inscripción previa) arranca en modo libre', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(false)
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  it('/estudio NO inicia el protocolo: entra en modo libre sin inscribir', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(false) // neutralizado por STUDY_OPEN=false
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  it('?estudio=true tampoco inicia el protocolo', async () => {
    const { default: store } = await loadStoreAt('/?estudio=true')
    expect(store.getState().enrolledInStudy).toBe(false)
    expect(store.getState().studyPhase).toBe('free')
  })

  it('resolveStudyEntry sigue detectando /estudio (intacto para reabrir el estudio)', async () => {
    const { resolveStudyEntry } = await loadStoreAt('/')
    expect(resolveStudyEntry({ href: 'https://x.test/estudio' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/?estudio=true' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/estudioso' }).enrollNow).toBe(false)
    expect(resolveStudyEntry({ href: 'https://x.test/' }).enrollNow).toBe(false)
  })

  it('libera a un participante que quedó a mitad del protocolo al entrar por /', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'pretest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    // onRehydrateStorage lo libera a modo libre sin perder sus datos de inscripción.
    expect(s.enrolledInStudy).toBe(true)
    expect(s.studyPhase).toBe('free')
  })

  it('libera a quien quedó atascado en el consentimiento (entró por /estudio, no consintió)', async () => {
    seedPersisted({ enrolledInStudy: true, studyPhase: 'consent' })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    // Escenario reportado: dispositivo que solo abrió el enlace /estudio. Ya no
    // se le pide "seguir el estudio": entra directo a la app.
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

  it('quien ya había completado el estudio mantiene acceso libre', async () => {
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
})
