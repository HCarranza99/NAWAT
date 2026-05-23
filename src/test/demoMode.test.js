import { afterEach, describe, expect, it, vi } from 'vitest'

describe('demo link detection', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it.each([
    ['/demo', true, '/demo'],
    ['/demo/sections', true, '/demo/sections'],
    ['/Demo/profile', true, '/demo/profile'],
    ['/?demo=true', true, '/demo'],
    ['/sections?demo=true', true, '/demo/sections'],
    ['/demografia', false, '/demografia'],
    ['/', false, '/'],
  ])('resolves %s as demo=%s and keeps route %s', async (entryUrl, expectedDemo, expectedUrl) => {
    window.history.replaceState({}, '', entryUrl)
    vi.resetModules()

    const { DEMO_MODE } = await import('../store/useGameStore')

    expect(DEMO_MODE).toBe(expectedDemo)
    expect(`${window.location.pathname}${window.location.search}`).toBe(expectedUrl)
  })
})
