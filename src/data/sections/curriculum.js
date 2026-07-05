/**
 * Composición del currículo (MERGE POR TEMA).
 *
 * Fusiona el contenido generado dentro de las secciones artesanales conservando
 * sus IDs — así el vocabulario ampliado aparece como lecciones adicionales del
 * mismo tema y NO se pierde el progreso de las lecciones artesanales — y agrega
 * las secciones nuevas (p. ej. Tiempo, espacio y números).
 *
 * `generated` viene de ./generated.js (archivo generado):
 *   { bySection: { [id]: Leccion[] }, extra: Seccion[] }
 * Ver scripts/generate-lessons/generate.js.
 */
export function composeCurriculum(artisanalSections, generated) {
  const bySection = generated?.bySection || {}
  const extra = generated?.extra || []
  const merged = artisanalSections.map((section) => {
    const add = bySection[section.id]
    return add?.length ? { ...section, lessons: [...section.lessons, ...add] } : section
  })
  return [...merged, ...extra]
}
