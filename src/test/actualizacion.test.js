/**
 * actualizacion.test.js
 *
 * La decisión de recargar es la única de este módulo con consecuencias: hacerlo
 * en el momento equivocado le borra a alguien la lección que lleva a medias.
 *
 * El resto —registrar el service worker, los temporizadores— depende de APIs
 * del navegador y se verifica desplegando, no acá.
 */
import { describe, it, expect } from 'vitest'
import { debeRecargar, INTERVALO_MS } from '../lib/actualizacion'

const base = { hayActualizacion: true, yaRecargue: false, ruta: '/', visible: true }

describe('cuándo recargar', () => {
  it('recarga cuando hay versión nueva y el momento es seguro', () => {
    expect(debeRecargar(base)).toBe(true)
  })

  it('no recarga si no hay nada nuevo', () => {
    expect(debeRecargar({ ...base, hayActualizacion: false })).toBe(false)
  })

  it('no recarga dos veces — evita el bucle', () => {
    // `controllerchange` puede dispararse más de una vez. Sin este freno, cada
    // recarga vuelve a dispararlo y el navegador queda en un ciclo.
    expect(debeRecargar({ ...base, yaRecargue: true })).toBe(false)
  })

  it('no recarga con la pestaña en segundo plano', () => {
    expect(debeRecargar({ ...base, visible: false })).toBe(false)
  })
})

describe('nunca en medio de algo', () => {
  // Estas son las rutas donde una recarga destruye trabajo de la persona.
  const intocables = [
    '/curriculo/m0-l1',
    '/curriculo/m3-l2',
    '/result',
    '/encuesta',
    '/review',
    '/section/1/lesson/2',
  ]

  for (const ruta of intocables) {
    it(`espera si está en ${ruta}`, () => {
      expect(debeRecargar({ ...base, ruta })).toBe(false)
    })
  }

  // Y estas son seguras: son pantallas de navegación, no de trabajo.
  const seguras = ['/', '/sections', '/logros', '/profile', '/privacidad', '/creditos']

  for (const ruta of seguras) {
    it(`recarga sin problema en ${ruta}`, () => {
      expect(debeRecargar({ ...base, ruta })).toBe(true)
    })
  }
})

describe('el intervalo', () => {
  it('pregunta una vez por hora, no cada minuto', () => {
    // Preguntar más seguido gasta datos de gente que paga por megabyte, y una
    // hora es de sobra: el disparo que de verdad importa es volver al frente.
    expect(INTERVALO_MS).toBe(3600000)
  })
})
