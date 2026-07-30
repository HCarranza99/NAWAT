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
/**
 * ¿Se incluye el vocabulario generado en el currículo?
 *
 * APAGADO POR DEFECTO. Se lanza solo con el núcleo artesanal (secciones 1–5:
 * 25 lecciones, 178 ejercicios, ~40 palabras cotejadas a mano contra el
 * diccionario, con cita de página). Las 36 lecciones generadas —281 palabras que
 * ningún hablante ha revisado— quedan fuera hasta que exista esa revisión.
 *
 * No se borran ni se dejan de mantener: siguen generándose, siguen cubiertas por
 * los tests (que importan ./index.js, no este registro) y siguen llevando la
 * marca "en revisión" lista para cuando se vuelvan a mostrar.
 *
 * Para reactivarlas:  VITE_INCLUDE_GENERATED_LESSONS=true
 */
const INCLUDE_GENERATED = import.meta.env.VITE_INCLUDE_GENERATED_LESSONS === 'true'

let currentSections = artisanalSections
let generatedLoaded = false // true solo si cargó con éxito
let generatedSettled = !INCLUDE_GENERATED // apagado ⇒ ya no hay nada que esperar
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
  // Currículo solo-artesanal: nunca se pide el chunk generado (ver INCLUDE_GENERATED).
  if (!INCLUDE_GENERATED) return Promise.resolve(currentSections)
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
