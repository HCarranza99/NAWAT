import { useEffect, useState } from 'react'

/**
 * Suscribe a una media query y devuelve si coincide actualmente.
 * Robusto en entornos sin matchMedia (SSR/tests): devuelve `false`.
 */
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false

  const [matches, setMatches] = useState(getMatch)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const handler = (event) => setMatches(event.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Verdadero en viewports de escritorio (>= breakpoint lg de Tailwind = 1024px). */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
