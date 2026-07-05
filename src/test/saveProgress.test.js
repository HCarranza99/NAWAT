/**
 * Unit test — saveProgressToCloud (resiliencia ante FK huérfana).
 *
 * Verifica que si el participant_id persistido no existe en `participants`
 * (Postgres 23503), el guardado reintenta sin el enlace en vez de perder el
 * progreso del usuario. Ver src/services/auth.js.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const upsert = vi.fn()
const getUser = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: (...a) => getUser(...a) },
    from: () => ({ upsert: (...a) => upsert(...a) }),
  },
}))
vi.mock('../lib/logger', () => ({ logError: vi.fn() }))

import { saveProgressToCloud } from '../services/auth'

beforeEach(() => {
  upsert.mockReset()
  getUser.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'auth-1' } }, error: null })
})

describe('saveProgressToCloud', () => {
  it('reintenta con participant_id null cuando el upsert falla con FK 23503', async () => {
    upsert
      .mockResolvedValueOnce({ error: { code: '23503' } }) // participant_id huérfano
      .mockResolvedValueOnce({ error: null })              // reintento sin enlace

    await saveProgressToCloud({ participantId: 'orphan-uuid', xp: 42 })

    expect(upsert).toHaveBeenCalledTimes(2)
    expect(upsert.mock.calls[0][0].participant_id).toBe('orphan-uuid')
    expect(upsert.mock.calls[1][0].participant_id).toBe(null)
    // el progreso se conserva en el reintento
    expect(upsert.mock.calls[1][0].xp).toBe(42)
  })

  it('no reintenta cuando el primer upsert tiene éxito', async () => {
    upsert.mockResolvedValueOnce({ error: null })

    await saveProgressToCloud({ participantId: 'valido', xp: 10 })

    expect(upsert).toHaveBeenCalledTimes(1)
  })

  it('no hace nada si no hay usuario autenticado', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })

    await saveProgressToCloud({ participantId: 'x', xp: 1 })

    expect(upsert).not.toHaveBeenCalled()
  })
})
