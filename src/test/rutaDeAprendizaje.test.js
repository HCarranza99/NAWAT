import { describe, expect, it } from 'vitest'
import secciones from '../data/curriculum/asSections'
import { getLesson, TIPOS_DE_ITEM } from '../data/curriculum'
import { findNextLesson, seccionCompleta, rutaDeLaLeccion } from '../lib/lessonPath'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  La ruta de aprendizaje: el contrato entre el currículo y las pantallas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Reemplaza a sections.test.js, que validaba la forma del contenido viejo
 * (boss obligatorio, ids numéricos correlativos, banco de palabras sin
 * señuelos). Ese contenido se jubiló el 14-ago-2026.
 *
 * Lo que se comprueba ahora es la costura: `curriculumAsSections()` proyecta
 * los módulos a la forma que consumen siete pantallas. Si esa proyección pierde
 * un campo, no se rompe el build ni falla ninguna prueba de contenido — la app
 * simplemente dibuja tarjetas vacías o no navega a ningún lado.
 */

const lecciones = secciones.flatMap((s) => s.lessons)

describe('ruta de aprendizaje — lo que las pantallas necesitan', () => {
  it('hay módulos y todos traen al menos una lección', () => {
    expect(secciones.length).toBeGreaterThan(0)
    for (const s of secciones) {
      expect(s.lessons.length, `${s.id} sin lecciones`).toBeGreaterThan(0)
    }
  })

  it('cada módulo trae lo que la tarjeta dibuja', () => {
    for (const s of secciones) {
      expect(s.id, 'sin id').toBeTruthy()
      expect(s.title, `${s.id} sin título en español`).toBeTruthy()
      expect(s.nawatTitle, `${s.id} sin título en náhuat`).toBeTruthy()
      expect(s.description, `${s.id} sin descripción`).toBeTruthy()
      expect(s.color, `${s.id} sin color`).toMatch(/^#[0-9A-Fa-f]{6}$/)
      // La tarjeta hace <img src={section.image}>. Sin esto sale rota.
      expect(s.image, `${s.id} sin ilustración`).toMatch(/^\/assets\/images\/.+\.(png|jpg|webp)$/)
    }
  })

  it('cada lección trae lo que la fila dibuja y adónde navega', () => {
    for (const l of lecciones) {
      expect(l.id).toBeTruthy()
      expect(l.title, `${l.id} sin título`).toBeTruthy()
      expect(l.description, `${l.id} sin descripción`).toBeTruthy()
      expect(l.xpReward, `${l.id} sin XP`).toBeGreaterThan(0)
      expect(Array.isArray(l.items), `${l.id} sin ejercicios`).toBe(true)
      expect(l.items.length, `${l.id} con ejercicios vacíos`).toBeGreaterThan(0)
    }
  })

  it('los ids no se repiten', () => {
    const idsModulo = secciones.map((s) => s.id)
    expect(new Set(idsModulo).size).toBe(idsModulo.length)
    const idsLeccion = lecciones.map((l) => l.id)
    expect(new Set(idsLeccion).size).toBe(idsLeccion.length)
  })

  /**
   * El id del módulo NO puede ser numérico. El progreso se guarda en
   * `sectionProgress[section.id]`, y quien jugó las secciones viejas tiene ahí
   * claves 1..5 con lecciones marcadas como completas. Si un módulo reusara ese
   * id heredaría ese progreso.
   */
  it('los ids de módulo no chocan con los del contenido viejo', () => {
    for (const s of secciones) {
      expect(String(s.id), `${s.id} parece un id de sección vieja`).not.toMatch(/^\d+$/)
    }
  })

  it('toda lección navega a una ruta que existe de verdad', () => {
    for (const s of secciones) {
      for (const l of s.lessons) {
        const ruta = rutaDeLaLeccion(s, l)
        expect(ruta, `${l.id} no declara ruta`).toBe(`/curriculo/${l.id}`)
        // La ruta es /curriculo/:lessonId y la pantalla resuelve con getLesson.
        expect(getLesson(l.id), `${ruta} no resuelve a ninguna lección`).toBeTruthy()
      }
    }
  })

  it('todo ejercicio es de un tipo que la app sabe dibujar', () => {
    const desconocidos = []
    for (const l of lecciones) {
      for (const item of l.items) {
        if (!TIPOS_DE_ITEM.includes(item.type)) desconocidos.push(`${l.id}: ${item.type}`)
      }
    }
    expect(desconocidos).toEqual([])
  })
})

/**
 * El desbloqueo es lo que más fácil se rompe sin que nadie se entere: no lanza
 * error, simplemente deja la ruta trabada y el usuario no puede avanzar. Pasó
 * al conectar el currículo — las pantallas pedían `bossCompleted` y el currículo
 * no tiene boss, así que nada se abría nunca después del primer módulo.
 */
describe('ruta de aprendizaje — se puede avanzar de punta a punta', () => {
  it('sin progreso, la primera lección del primer módulo está disponible', () => {
    const next = findNextLesson(secciones, {})
    expect(next).not.toBeNull()
    expect(next.section.id).toBe(secciones[0].id)
    expect(next.lesson.id).toBe(secciones[0].lessons[0].id)
  })

  it('un módulo se completa terminando sus lecciones, sin examen final', () => {
    const primero = secciones[0]
    const progreso = {
      [primero.id]: {
        lessonsCompleted: Object.fromEntries(
          primero.lessons.map((l) => [l.id, { completed: true, score: 1, stars: 3 }]),
        ),
        bossCompleted: false,
      },
    }
    expect(seccionCompleta(primero, progreso)).toBe(true)
  })

  /**
   * La prueba que faltaba. Simula a alguien que juega todo el curso y comprueba
   * que en cada paso hay una lección siguiente, hasta que se acaban. Si el
   * desbloqueo se traba, esto se queda pegado en la misma lección y falla.
   */
  it('jugando todo en orden se llega hasta la última lección', () => {
    const progreso = {}
    const vistas = []
    const tope = lecciones.length + 5 // margen: si se traba, corta y falla abajo

    for (let i = 0; i < tope; i++) {
      const next = findNextLesson(secciones, progreso)
      if (!next) break
      const clave = `${next.section.id}/${next.lesson.id}`
      expect(vistas, `se quedó trabada en ${clave}`).not.toContain(clave)
      vistas.push(clave)

      progreso[next.section.id] = progreso[next.section.id] || {
        lessonsCompleted: {},
        bossCompleted: false,
      }
      progreso[next.section.id].lessonsCompleted[next.lesson.id] = {
        completed: true,
        score: 1,
        stars: 3,
      }
    }

    expect(vistas.length, 'no se recorrieron todas las lecciones').toBe(lecciones.length)
    expect(findNextLesson(secciones, progreso), 'quedó una lección pendiente').toBeNull()
    for (const s of secciones) {
      expect(seccionCompleta(s, progreso), `${s.id} no quedó completo`).toBe(true)
    }
  })
})
