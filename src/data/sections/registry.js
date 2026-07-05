import artisanalSections from './artisanal'
import { composeCurriculum } from './curriculum'

/**
 * Registro reactivo de secciones con carga diferida.
 *
 * Las secciones artesanales (1–5) están disponibles de inmediato. El vocabulario
 * ampliado generado (secciones 6–10, ~1.2 MB) se carga como un chunk aparte, en
 * segundo plano, mediante import() dinámico — así el arranque solo descarga lo
 * imprescindible y el resto lo precachea la PWA para uso offline.
 *
 * Los componentes se suscriben con el hook useSections() (src/hooks/useSections.js),
 * que dispara la carga y vuelve a renderizar cuando lo generado llega.
 */
let currentSections = artisanalSections
let generatedLoaded = false // true solo si cargó con éxito
let generatedSettled = false // true tras resolverse el intento (éxito O fallo)
let loadPromise = null
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

/** Snapshot actual (referencia estable hasta que se cargue lo generado). */
export function getSections() {
  return currentSections
}

/** ¿Se cargó con éxito el vocabulario generado? */
export function isGeneratedLoaded() {
  return generatedLoaded
}

/**
 * ¿Terminó el intento de carga (con éxito o fallo)? Las pantallas que esperan a
 * lo generado usan esto para no quedarse en un loader infinito si la carga falla
 * (degradan con gracia al núcleo artesanal).
 */
export function isGeneratedSettled() {
  return generatedSettled
}

export function subscribeSections(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Carga (una sola vez) las secciones generadas y las fusiona con las artesanales.
 * Si la carga falla, la app sigue funcionando solo con el núcleo artesanal y se
 * permite reintentar en la siguiente navegación.
 */
export function ensureGeneratedSections() {
  if (generatedLoaded) return Promise.resolve(currentSections)
  if (!loadPromise) {
    loadPromise = import('./generated.js')
      .then((mod) => {
        currentSections = composeCurriculum(artisanalSections, mod.default)
        generatedLoaded = true
        generatedSettled = true
        emit()
        return currentSections
      })
      .catch(() => {
        generatedSettled = true
        loadPromise = null // permite reintentar más tarde
        emit()
        return currentSections
      })
  }
  return loadPromise
}
