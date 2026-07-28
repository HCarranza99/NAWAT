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

// El estudio está CERRADO (STUDY_OPEN=false): la app es de acceso libre para
// todos. `/estudio` ya no inscribe a nadie, y `onRehydrateStorage` libera en
// CADA carga a cualquier dispositivo que quedara retenido en una fase del
// protocolo (p. ej. atascado en consentimiento o postest). Los datos de
// inscripción (enrolledInStudy y marcas de tiempo) se conservan por si el
// estudio se reabre poniendo STUDY_OPEN=true.
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

  it('/estudio ya NO inicia el protocolo: entra en modo libre sin inscribir', async () => {
    const { default: store, STUDY_LINK_ENTRY } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(STUDY_LINK_ENTRY).toBe(false)
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  it('?estudio=true tampoco inicia el protocolo', async () => {
    const { default: store } = await loadStoreAt('/?estudio=true')
    const s = store.getState()
    expect(s.enrolledInStudy).toBe(false)
    expect(s.studyPhase).toBe('free')
  })

  // resolveStudyEntry sigue reconociendo el patrón de la URL; lo que anula la
  // inscripción es STUDY_OPEN, no el parser (ver `studyEntry` en el store).
  it('resolveStudyEntry sigue detectando /estudio y ?estudio=true', async () => {
    const { resolveStudyEntry } = await loadStoreAt('/')
    expect(resolveStudyEntry({ href: 'https://x.test/estudio' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/?estudio=true' }).enrollNow).toBe(true)
    expect(resolveStudyEntry({ href: 'https://x.test/estudioso' }).enrollNow).toBe(false)
    expect(resolveStudyEntry({ href: 'https://x.test/' }).enrollNow).toBe(false)
  })

  it('libera a un participante que había quedado a mitad del protocolo', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'pretest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
    // Se conserva el historial de inscripción por si el estudio se reabre.
    expect(s.enrolledInStudy).toBe(true)
    expect(s.consentAcceptedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('libera a quien quedó atascado en el consentimiento, incluso entrando por /estudio', async () => {
    seedPersisted({ enrolledInStudy: true, studyPhase: 'consent' })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
  })

  it('libera a quien no había completado el postest', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'posttest',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      pretestCompletedAt: '2026-01-01T00:10:00.000Z',
    })
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
    expect(s.pretestCompletedAt).toBe('2026-01-01T00:10:00.000Z')
  })

  it('quien ya completó el estudio sigue libre y no se le vuelve a agradecer', async () => {
    seedPersisted({
      enrolledInStudy: true,
      studyPhase: 'free',
      consentAcceptedAt: '2026-01-01T00:00:00.000Z',
      posttestCompletedAt: '2026-01-01T01:00:00.000Z',
    })
    const { default: store } = await loadStoreAt('/estudio')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
    // Sin inscripción activa no se dispara el agradecimiento del protocolo.
    expect(s.studyThanks).toBe(false)
  })

  it('migra usuarios previos (v1 con consentimiento) directo a modo libre', async () => {
    seedPersisted(
      { studyPhase: 'pretest', consentAcceptedAt: '2026-01-01T00:00:00.000Z' },
      1,
    )
    const { default: store } = await loadStoreAt('/')
    const s = store.getState()
    expect(s.studyPhase).toBe('free')
    // La migración los marca como inscritos (tenían consentimiento), pero el
    // estudio cerrado los libera igual.
    expect(s.enrolledInStudy).toBe(true)
  })
})
