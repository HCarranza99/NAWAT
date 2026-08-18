/**
 * ofertaDeCuenta.test.js
 *
 * La regla de CUÁNDO ofrecer la cuenta. Se prueba aparte de las pantallas
 * porque es una decisión de producto, y porque el número que la gobierna
 * —cuántas lecciones hacen "módulo de peso"— es exactamente el tipo de cosa
 * que alguien cambia sin darse cuenta de lo que implica.
 */
import { describe, it, expect } from 'vitest'
import {
  debeOfrecerCuenta, moduloCompleto, MIN_LECCIONES_PARA_OFRECER,
} from '../lib/ofertaDeCuenta'

/** Un módulo de juguete con n lecciones. */
const modulo = (id, n) => ({
  id,
  lessons: Array.from({ length: n }, (_, i) => ({ id: `${id}-l${i + 1}` })),
})

/** Progreso con las primeras `hechas` lecciones del módulo completadas. */
const progreso = (id, n, hechas) => ({
  [id]: {
    lessonsCompleted: Object.fromEntries(
      Array.from({ length: n }, (_, i) => [`${id}-l${i + 1}`, { completed: i < hechas }]),
    ),
  },
})

// El currículo real: m0 tiene UNA lección, m1 tiene cinco.
const SECCIONES = [modulo('m0', 1), modulo('m1', 5), modulo('m2', 4)]

describe('moduloCompleto', () => {
  it('es falso si falta una sola lección', () => {
    expect(moduloCompleto(SECCIONES[1], progreso('m1', 5, 4))).toBe(false)
  })

  it('es verdadero cuando están todas', () => {
    expect(moduloCompleto(SECCIONES[1], progreso('m1', 5, 5))).toBe(true)
  })

  it('un módulo sin lecciones no cuenta como completo', () => {
    expect(moduloCompleto({ id: 'vacio', lessons: [] }, {})).toBe(false)
  })

  it('sin progreso guardado no revienta', () => {
    expect(moduloCompleto(SECCIONES[1], undefined)).toBe(false)
    expect(moduloCompleto(undefined, {})).toBe(false)
  })
})

describe('cuándo se ofrece la cuenta', () => {
  it('NO al terminar m0: una sola lección no es inversión que proteger', () => {
    // Este es el caso que motiva toda la regla. m0 son cuatro ejercicios de
    // sonidos: unos tres minutos. Además ahí se interpone la encuesta de
    // entrada, y dos cortes seguidos ahuyentan.
    expect(debeOfrecerCuenta(SECCIONES, { sectionProgress: progreso('m0', 1, 1) })).toBe(false)
  })

  it('SÍ al terminar m1, el primer módulo con peso', () => {
    expect(debeOfrecerCuenta(SECCIONES, { sectionProgress: progreso('m1', 5, 5) })).toBe(true)
  })

  it('no a mitad de camino', () => {
    expect(debeOfrecerCuenta(SECCIONES, { sectionProgress: progreso('m1', 5, 3) })).toBe(false)
  })

  it('no si ya tiene cuenta: su progreso ya viaja', () => {
    expect(debeOfrecerCuenta(SECCIONES, {
      sectionProgress: progreso('m1', 5, 5),
      authUserId: 'user-1',
    })).toBe(false)
  })

  it('no se insiste: una vez mostrada, no vuelve', () => {
    expect(debeOfrecerCuenta(SECCIONES, {
      sectionProgress: progreso('m1', 5, 5),
      accountPromptDismissed: true,
    })).toBe(false)
  })

  it('sin progreso, no', () => {
    expect(debeOfrecerCuenta(SECCIONES, {})).toBe(false)
    expect(debeOfrecerCuenta([], {})).toBe(false)
  })

  /**
   * La regla se escribió por TAMAÑO y no como 'm1' a propósito: si mañana m0
   * crece o se reordenan los módulos, tiene que seguir valiendo sola.
   */
  it('si m0 creciera a dos lecciones, ahí ya se ofrecería', () => {
    const secciones = [modulo('m0', 2), modulo('m1', 5)]
    expect(debeOfrecerCuenta(secciones, { sectionProgress: progreso('m0', 2, 2) })).toBe(true)
  })

  it('el mínimo es 2 — bajarlo a 1 deshace el arreglo', () => {
    expect(MIN_LECCIONES_PARA_OFRECER).toBe(2)
  })
})
