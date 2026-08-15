/**
 * Las frases de ejemplo del diccionario tienen que LLEGAR A PANTALLA.
 *
 * Existían en los datos artesanales (12 frases: "Eje, nikneki.", "¡Padiush! —
 * ¡Tesu datka!", "—¿Ken tinemi? —Ninemi yek.") pero nunca se veían: solo estaban
 * en las flashcards, y el motor de ejercicios las consume como materia prima sin
 * volver a emitirlas. Se mostraban en 0 ejercicios.
 *
 * Estas pruebas cubren las dos mitades del arreglo: que el motor arrastre la
 * frase hasta el ejercicio, y que el modal la muestre.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { getLesson, toRunnerItems } from '../data/curriculum'
import { buildExercises } from '../lib/exerciseEngine'
import FeedbackModal from '../components/ui/FeedbackModal'

/**
 * `buildExercises` sigue vivo aunque las lecciones del currículo no pasen por
 * él: lo usa el REPASO (ReviewScreen), que rebaraja los ítems ya vistos. Por eso
 * esta prueba sigue haciendo falta — si el motor pierde la frase de ejemplo, se
 * pierde en el repaso, que es justo donde más sirve volver a verla.
 *
 * Se apoya en la lección de sonidos, que es la que trae `example_sentence` en
 * sus ítems (cada grafía con su palabra: Kw → Kwawit).
 */
describe('exerciseEngine: arrastra la frase de ejemplo', () => {
  const leccionOriginal = getLesson('m0-l1')
  const lesson = { ...leccionOriginal, items: toRunnerItems(leccionOriginal) }

  it('la lección de partida trae frases en sus flashcards', () => {
    const conFrase = lesson.items.filter((it) => it.example_sentence)
    expect(conFrase.length).toBeGreaterThan(0)
  })

  it('los ejercicios construidos conservan la frase de la palabra', () => {
    const vistas = new Set()
    for (let seed = 1; seed <= 40; seed += 1) {
      for (const ex of buildExercises(lesson, { seed, sectionWords: [] })) {
        if (ex.example_sentence) vistas.add(ex.example_sentence)
      }
    }
    // Antes del arreglo esto era 0.
    expect(vistas.size).toBeGreaterThan(0)
    expect([...vistas].some((f) => f.includes('Kwawit'))).toBe(true)
  })

  it('no inventa frases donde la palabra no tenía', () => {
    const originales = new Set(
      lesson.items.filter((it) => it.example_sentence).map((it) => it.example_sentence),
    )
    for (let seed = 1; seed <= 20; seed += 1) {
      for (const ex of buildExercises(lesson, { seed, sectionWords: [] })) {
        if (ex.example_sentence) expect(originales.has(ex.example_sentence)).toBe(true)
      }
    }
  })
})

describe('FeedbackModal: muestra la frase', () => {
  it('la muestra al acertar', () => {
    render(
      <FeedbackModal
        type="correct"
        correctAnswer="Sí"
        onContinue={vi.fn()}
        exampleSentence="Eje, nikneki."
        exampleTranslation="Sí, quiero."
      />,
    )
    expect(screen.getByText('Eje, nikneki.')).toBeInTheDocument()
    expect(screen.getByText('Sí, quiero.')).toBeInTheDocument()
    expect(screen.getByText('Así se usa')).toBeInTheDocument()
  })

  it('también al fallar: es cuando más sirve verla', () => {
    render(
      <FeedbackModal
        type="wrong"
        correctAnswer="Sí"
        onContinue={vi.fn()}
        exampleSentence="Eje, nikneki."
        exampleTranslation="Sí, quiero."
      />,
    )
    expect(screen.getByText('Eje, nikneki.')).toBeInTheDocument()
  })

  it('dice "Ejemplo" y no "Así se usa" cuando es una palabra sola', () => {
    // En la lección de sonidos el ejemplo es una palabra: Kw → "Kwawit".
    render(
      <FeedbackModal
        type="correct"
        correctAnswer="Sonido kw"
        onContinue={vi.fn()}
        exampleSentence="Kwawit"
        exampleTranslation="Árbol / leña"
      />,
    )
    expect(screen.getByText('Ejemplo')).toBeInTheDocument()
    expect(screen.queryByText('Así se usa')).not.toBeInTheDocument()
  })

  it('se calla cuando el usuario se quedó sin vidas', () => {
    render(
      <FeedbackModal
        type="wrong"
        correctAnswer="Sí"
        onContinue={vi.fn()}
        noLives
        exampleSentence="Eje, nikneki."
        exampleTranslation="Sí, quiero."
      />,
    )
    expect(screen.getByText('Sin vidas')).toBeInTheDocument()
    expect(screen.queryByText('Eje, nikneki.')).not.toBeInTheDocument()
  })

  it('no rompe nada cuando la palabra no trae frase', () => {
    render(<FeedbackModal type="correct" correctAnswer="Sí" onContinue={vi.fn()} />)
    expect(screen.getByText('¡Correcto!')).toBeInTheDocument()
    expect(screen.queryByText('Así se usa')).not.toBeInTheDocument()
    expect(screen.queryByText('Ejemplo')).not.toBeInTheDocument()
  })
})
