/**
 * Component tests — Exercise components
 *
 * Render each exercise type, simulate clicks, assert callbacks.
 * No store/auth dependencies — these are pure props-in / events-out.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import Flashcard from '../components/exercises/Flashcard'
import MultipleChoiceText from '../components/exercises/MultipleChoiceText'
import BuildSentence from '../components/exercises/BuildSentence'
import Matching from '../components/exercises/Matching'

// ──────────────────────────────────────────────────────────────
// Flashcard
// ──────────────────────────────────────────────────────────────
describe('Flashcard', () => {
  const item = {
    id: 'fc-1',
    type: 'flashcard',
    nahuat_word: 'kaltsin',
    spanish_translation: 'casita',
    pronunciation: 'kal-tsin',
  }

  it('renders the nahuat word (front + back share the term)', () => {
    render(<Flashcard item={item} onKnew={() => {}} onDidntKnow={() => {}} />)
    // The 3D-flip card renders both faces; the term appears twice.
    expect(screen.getAllByText('kaltsin').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText(/Lo sabía/)).not.toBeInTheDocument()
  })

  it('flips and reveals action buttons when tapped', () => {
    render(<Flashcard item={item} onKnew={() => {}} onDidntKnow={() => {}} />)
    const card = screen.getByLabelText(/Toca para voltear/)
    fireEvent.click(card)

    // back face shows spanish translation
    expect(screen.getByText('casita')).toBeInTheDocument()
    expect(screen.getByText(/Lo sabía/)).toBeInTheDocument()
    expect(screen.getByText(/No lo sabía/)).toBeInTheDocument()
  })

  it('fires onKnew when "Lo sabía" is clicked', () => {
    const onKnew = vi.fn()
    render(<Flashcard item={item} onKnew={onKnew} onDidntKnow={() => {}} />)
    fireEvent.click(screen.getByLabelText(/Toca para voltear/))
    fireEvent.click(screen.getByText(/Lo sabía/))
    expect(onKnew).toHaveBeenCalledTimes(1)
  })

  it('fires onDidntKnow when "No lo sabía" is clicked', () => {
    const onDidntKnow = vi.fn()
    render(<Flashcard item={item} onKnew={() => {}} onDidntKnow={onDidntKnow} />)
    fireEvent.click(screen.getByLabelText(/Toca para voltear/))
    fireEvent.click(screen.getByText(/No lo sabía/))
    expect(onDidntKnow).toHaveBeenCalledTimes(1)
  })
})

// ──────────────────────────────────────────────────────────────
// MultipleChoiceText
// ──────────────────────────────────────────────────────────────
describe('MultipleChoiceText', () => {
  const item = {
    id: 'mc-1',
    type: 'multiple_choice_text',
    nahuat_word: 'siwat',
    spanish_translation: 'mujer',
    instruction: '¿Qué significa siwat?',
    options: [
      { id: 'a', text: 'mujer', correct: true },
      { id: 'b', text: 'hombre', correct: false },
      { id: 'c', text: 'niño', correct: false },
      { id: 'd', text: 'casa', correct: false },
    ],
  }

  it('renders all 4 options', () => {
    render(<MultipleChoiceText item={item} onCorrect={() => {}} onWrong={() => {}} />)
    item.options.forEach((opt) => {
      expect(screen.getByText(opt.text)).toBeInTheDocument()
    })
  })

  it('fires onCorrect when correct option is selected', () => {
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    render(<MultipleChoiceText item={item} onCorrect={onCorrect} onWrong={onWrong} />)
    fireEvent.click(screen.getByText('mujer'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
    expect(onWrong).not.toHaveBeenCalled()
  })

  it('fires onWrong when wrong option is selected', () => {
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    render(<MultipleChoiceText item={item} onCorrect={onCorrect} onWrong={onWrong} />)
    fireEvent.click(screen.getByText('hombre'))
    expect(onWrong).toHaveBeenCalledTimes(1)
    expect(onCorrect).not.toHaveBeenCalled()
  })

  it('locks input after first selection (no double-fire)', () => {
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    render(<MultipleChoiceText item={item} onCorrect={onCorrect} onWrong={onWrong} />)
    fireEvent.click(screen.getByText('hombre'))
    fireEvent.click(screen.getByText('mujer'))
    fireEvent.click(screen.getByText('niño'))
    expect(onCorrect).toHaveBeenCalledTimes(0)
    expect(onWrong).toHaveBeenCalledTimes(1)
  })
})

// ──────────────────────────────────────────────────────────────
// BuildSentence
// ──────────────────────────────────────────────────────────────
describe('BuildSentence', () => {
  const item = {
    id: 'bs-1',
    type: 'build_sentence',
    instruction: 'Construye la oración',
    spanish_translation: 'yo soy mujer',
    word_bank: ['naha', 'ni', 'siwat'],
    correct_order: ['naha', 'ni', 'siwat'],
  }

  it('renders verify button disabled when sentence is empty', () => {
    render(<BuildSentence item={item} onCorrect={() => {}} onWrong={() => {}} />)
    expect(screen.getByText('Verificar')).toBeDisabled()
  })

  it('fires onCorrect for the right order', () => {
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    render(<BuildSentence item={item} onCorrect={onCorrect} onWrong={onWrong} />)

    // The bank tokens have unique keys but same text — pick by text
    fireEvent.click(screen.getByText('naha'))
    fireEvent.click(screen.getByText('ni'))
    fireEvent.click(screen.getByText('siwat'))

    fireEvent.click(screen.getByText('Verificar'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
    expect(onWrong).not.toHaveBeenCalled()
  })

  it('fires onWrong when order is wrong', () => {
    const onCorrect = vi.fn()
    const onWrong = vi.fn()
    render(<BuildSentence item={item} onCorrect={onCorrect} onWrong={onWrong} />)

    // Wrong order: siwat, ni, naha
    fireEvent.click(screen.getByText('siwat'))
    fireEvent.click(screen.getByText('ni'))
    fireEvent.click(screen.getByText('naha'))

    fireEvent.click(screen.getByText('Verificar'))
    expect(onWrong).toHaveBeenCalledTimes(1)
    expect(onCorrect).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────────────────────
// Matching
// ──────────────────────────────────────────────────────────────
describe('Matching', () => {
  const item = {
    id: 'mt-1',
    type: 'matching',
    instruction: 'Une los pares',
    pairs: [
      { nahuat: 'kal', spanish: 'casa' },
      { nahuat: 'at', spanish: 'agua' },
      { nahuat: 'tunal', spanish: 'sol' },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all words from both columns', () => {
    render(<Matching item={item} onComplete={() => {}} />)
    expect(screen.getByText('kal')).toBeInTheDocument()
    expect(screen.getByText('casa')).toBeInTheDocument()
    expect(screen.getByText('at')).toBeInTheDocument()
    expect(screen.getByText('agua')).toBeInTheDocument()
  })

  it('shows progress counter', () => {
    render(<Matching item={item} onComplete={() => {}} />)
    expect(screen.getByText(/0\/3 pares/)).toBeInTheDocument()
  })

  it('calls onComplete after matching all pairs', () => {
    const onComplete = vi.fn()
    render(<Matching item={item} onComplete={onComplete} />)

    // Match each pair
    item.pairs.forEach((p) => {
      fireEvent.click(screen.getByText(p.nahuat))
      fireEvent.click(screen.getByText(p.spanish))
    })

    // The completion fires after a 500ms timer
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onComplete on a wrong pair', () => {
    const onComplete = vi.fn()
    render(<Matching item={item} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('kal'))
    fireEvent.click(screen.getByText('agua')) // wrong pair

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onComplete).not.toHaveBeenCalled()
    // Counter should still read 0/3
    expect(screen.getByText(/0\/3 pares/)).toBeInTheDocument()
  })
})
