import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import QuestionnaireRunner from '../components/questionnaire/QuestionnaireRunner'
import { POSTTEST_ITEMS } from '../data/questionnaires'
import useGameStore from '../store/useGameStore'

vi.mock('../services/analytics', () => ({
  saveQuestionnaireResponse: vi.fn().mockResolvedValue(undefined),
}))

describe('QuestionnaireRunner - SUS guidance', () => {
  beforeEach(() => {
    useGameStore.setState({
      participantId: 'test-participant',
      currentSessionId: 'test-session',
    })
  })

  it('shows an instruction screen before SUS and then renders SUS options vertically', () => {
    const susItem = POSTTEST_ITEMS.find((item) => item.code === 'sus_c1')
    render(
      <QuestionnaireRunner
        items={[susItem]}
        phase="posttest"
        onComplete={vi.fn()}
      />
    )

    expect(screen.getByTestId('sus-instruction')).toBeInTheDocument()
    expect(screen.getByText(/No todas las preguntas deben responderse igual/)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('questionnaire-next'))

    expect(screen.queryByTestId('sus-instruction')).not.toBeInTheDocument()
    expect(screen.getByText('Me gustaría usar esta aplicación con frecuencia.')).toBeInTheDocument()

    const radioGroup = screen.getByRole('radiogroup')
    const radios = within(radioGroup).getAllByRole('radio')

    expect(radios).toHaveLength(5)
    expect(radios[0]).toHaveTextContent('1')
    expect(radios[0]).toHaveTextContent('Totalmente en desacuerdo')
    expect(radios[4]).toHaveTextContent('5')
    expect(radios[4]).toHaveTextContent('Totalmente de acuerdo')
  })
})
