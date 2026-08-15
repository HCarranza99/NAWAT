import { describe, expect, it } from 'vitest'
import { esModoEnfocado } from '../lib/modoEnfocado'
import secciones from '../data/curriculum/asSections'
import { rutaDeLaLeccion } from '../lib/lessonPath'

/**
 * Regresión — la barra de navegación tapando la lección.
 *
 * En móvil la barra flota fija abajo. Dentro de una lección tiene que
 * esconderse, porque si no queda encima del botón de "Empezar lección" y no se
 * puede tocar.
 *
 * Pasó el 14-ago-2026 al mudar las lecciones a `/curriculo/:lessonId`: la lista
 * de rutas que activan el modo enfocado estaba COPIADA en tres archivos
 * (`AppChrome`, `DemoBanner`, `BottomNav`) y los tres quedaron obsoletos a la
 * vez. No hubo error ni prueba roja — simplemente la barra dejó de esconderse.
 *
 * Por eso esto no comprueba una lista de rutas escrita a mano: recorre las
 * rutas REALES de las 22 lecciones. Si mañana cambia el esquema de URLs, esta
 * prueba se entera sola.
 */

const rutasDeLeccion = secciones.flatMap((s) => s.lessons.map((l) => rutaDeLaLeccion(s, l)))

describe('modo enfocado — qué esconde el chrome', () => {
  it('hay lecciones que comprobar', () => {
    expect(rutasDeLeccion.length).toBeGreaterThan(0)
  })

  it('TODA lección del currículo esconde la barra', () => {
    const queNoEsconden = rutasDeLeccion.filter((ruta) => !esModoEnfocado(ruta))
    expect(queNoEsconden).toEqual([])
  })

  it('el resultado y el repaso también', () => {
    expect(esModoEnfocado('/result')).toBe(true)
    expect(esModoEnfocado('/review')).toBe(true)
  })

  // La encuesta de entrada son cuatro preguntas seguidas: con la barra visible,
  // un toque distraído en "Inicio" la abandona a media pregunta y no se vuelve
  // a ofrecer.
  it('la encuesta de entrada también', () => {
    expect(esModoEnfocado('/encuesta')).toBe(true)
  })

  /**
   * Las rutas del contenido viejo hoy redirigen, pero durante el instante
   * previo a la redirección la ruta todavía es esa. Sin esto, el chrome
   * parpadea al abrir un enlace guardado en marcadores.
   */
  it('las rutas viejas siguen escondiéndola mientras redirigen', () => {
    expect(esModoEnfocado('/section/2/lesson/s2-l1')).toBe(true)
    expect(esModoEnfocado('/lesson/l1')).toBe(true)
  })

  it('las pantallas de navegación SÍ muestran la barra', () => {
    for (const ruta of ['/', '/sections', '/logros', '/profile', '/donar', '/creditos']) {
      expect(esModoEnfocado(ruta), `${ruta} no debería esconder la barra`).toBe(false)
    }
  })

  it('no se confunde con una ruta que solo empieza parecido', () => {
    // '/resultados' no es '/result'; la comprobación es exacta, no por prefijo.
    expect(esModoEnfocado('/resultados')).toBe(false)
    expect(esModoEnfocado('/reviewer')).toBe(false)
  })
})
