/**
 * privacidad.test.jsx
 *
 * El aviso de privacidad no es copy: es lo que se le promete a la persona antes
 * de que entregue su nombre, su edad y su distrito. Estas pruebas cuidan que la
 * promesa siga estando y siga siendo cierta.
 *
 * Lo que NO se puede probar acá: que el borrado por inactividad ocurra de
 * verdad. Hoy no está automatizado (ver la nota en src/data/privacidad.js).
 * Prometerlo y no cumplirlo es peor que no prometerlo, así que cuando exista la
 * tarea que lo ejecuta, hay que probarla aparte.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import PrivacyNotice from '../components/PrivacyNotice'
import {
  CLAUSULA_CORTA,
  CONTACTO_DATOS,
  MESES_INACTIVIDAD_PARA_BORRADO,
  SECCIONES,
} from '../data/privacidad'

describe('el texto del aviso', () => {
  it('cubre los seis temas que la persona necesita saber', () => {
    expect(SECCIONES.map((s) => s.id)).toEqual([
      'que', 'que_no', 'para_que', 'cuanto', 'derechos', 'menores',
    ])
    // Ninguna sección vacía: una sección con título y sin cuerpo es peor que
    // no tenerla, porque aparenta cubrir algo.
    for (const s of SECCIONES) {
      expect(s.titulo.length).toBeGreaterThan(0)
      expect(s.parrafos.length).toBeGreaterThan(0)
      for (const p of s.parrafos) expect(p.trim().length).toBeGreaterThan(20)
    }
  })

  it('dice el plazo de borrado con el número real, no con una x', () => {
    const cuanto = SECCIONES.find((s) => s.id === 'cuanto').parrafos.join(' ')
    expect(cuanto).toContain(String(MESES_INACTIVIDAD_PARA_BORRADO))
    expect(cuanto.toLowerCase()).not.toMatch(/\bx\s*(meses|años)/)
  })

  it('da un correo real para pedir el borrado', () => {
    expect(CONTACTO_DATOS).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
    const derechos = SECCIONES.find((s) => s.id === 'derechos').parrafos.join(' ')
    expect(derechos).toContain(CONTACTO_DATOS)
  })

  it('nombra la edad mínima en la sección de menores', () => {
    const menores = SECCIONES.find((s) => s.id === 'menores').parrafos.join(' ')
    expect(menores).toContain('10')
  })

  it('la cláusula corta no promete más de lo que el aviso sostiene', () => {
    // Si alguna vez se agrega correo o teléfono al registro, esta prueba
    // obliga a revisar la frase antes de que quede mintiendo.
    expect(CLAUSULA_CORTA).toMatch(/no pedimos correo ni teléfono/i)
    expect(CLAUSULA_CORTA).toMatch(/borremos|borrar/i)
    const queNo = SECCIONES.find((s) => s.id === 'que_no').parrafos.join(' ')
    expect(queNo).toMatch(/no vendemos|no.*vendemos/i)
  })
})

describe('la cláusula dentro del registro', () => {
  it('se ve sin tener que abrir nada', () => {
    render(<PrivacyNotice />)
    expect(screen.getByText(CLAUSULA_CORTA)).toBeInTheDocument()
  })

  it('el aviso completo se abre en el mismo lugar, sin navegar', () => {
    const { container } = render(<PrivacyNotice />)

    // Nada de enlaces: RegistrationScreen se monta fuera del router y un
    // <a href> o un <Link> ahí rompe o saca a la persona del formulario.
    expect(container.querySelector('a')).toBeNull()

    const resumen = screen.getByText('Leer el aviso completo')
    const details = container.querySelector('details')
    expect(details.open).toBe(false)

    fireEvent.click(resumen)
    expect(details.open).toBe(true)

    // Y con el aviso abierto, están los seis títulos.
    for (const s of SECCIONES) {
      expect(screen.getByText(s.titulo)).toBeInTheDocument()
    }
  })
})
