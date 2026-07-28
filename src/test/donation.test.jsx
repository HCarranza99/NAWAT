/**
 * Donación directa — configuración y pantalla.
 *
 * Lo que importa proteger:
 *  1. La URL apunta al botón alojado de PayPal y no filtra nada más.
 *  2. La UI nunca promete un monto que PayPal no va a respetar
 *     (la página nueva ignora el parámetro `amount`).
 *  3. La donación se abre en pestaña nueva, no dentro de la PWA.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import {
  DONATION_AMOUNTS,
  DONATION_ENABLED,
  PAYPAL_BUTTON_ID,
  buildDonationUrl,
} from '../data/donation'
import DonateScreen from '../screens/DonateScreen'
import ThanksScreen from '../screens/ThanksScreen'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('configuración de donación', () => {
  it('la donación viene habilitada con un botón alojado', () => {
    expect(DONATION_ENABLED).toBe(true)
    expect(PAYPAL_BUTTON_ID).toBeTruthy()
  })

  it('construye la URL de PayPal con el botón alojado y en español', () => {
    const url = new URL(buildDonationUrl())

    expect(url.origin + url.pathname).toBe('https://www.paypal.com/donate/')
    expect(url.searchParams.get('hosted_button_id')).toBe(PAYPAL_BUTTON_ID)
    expect(url.searchParams.get('locale.x')).toBe('es_XC')
  })

  it('no manda un monto: la página alojada de PayPal lo ignora', () => {
    const url = new URL(buildDonationUrl())
    expect(url.searchParams.has('amount')).toBe(false)
  })

  it('acepta otro botón (p. ej. sandbox) sin tocar código', () => {
    const url = new URL(buildDonationUrl('TESTBUTTON123'))
    expect(url.searchParams.get('hosted_button_id')).toBe('TESTBUTTON123')
  })

  it('devuelve null si no hay botón configurado', () => {
    expect(buildDonationUrl('')).toBeNull()
  })
})

describe('DonateScreen', () => {
  const renderScreen = () =>
    render(
      <MemoryRouter initialEntries={['/donar']}>
        <DonateScreen />
      </MemoryRouter>
    )

  it('muestra los montos que PayPal realmente ofrece', () => {
    renderScreen()
    for (const amount of DONATION_AMOUNTS) {
      expect(screen.getByText(`$${amount}`)).toBeInTheDocument()
    }
    expect(screen.getByText('Otro')).toBeInTheDocument()
  })

  it('aclara que el monto se elige en PayPal', () => {
    renderScreen()
    expect(screen.getByText(/el monto lo elegís en paypal/i)).toBeInTheDocument()
  })

  it('en navegador abre PayPal en una pestaña nueva y aislada', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderScreen()

    fireEvent.click(screen.getByRole('button', { name: /donar con paypal/i }))

    expect(open).toHaveBeenCalledWith(
      buildDonationUrl(),
      '_blank',
      'noopener,noreferrer'
    )
  })

  // En la PWA instalada, '_blank' salta al navegador externo y el donante no
  // regresa a la app: la URL de retorno abriría una pestaña suelta.
  it('en la PWA instalada navega en la misma vista para poder volver', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }))

    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /donar con paypal/i }))

    expect(open).toHaveBeenCalledWith(
      buildDonationUrl(),
      '_self',
      'noopener,noreferrer'
    )
  })
})

describe('ThanksScreen', () => {
  it('agradece sin afirmar que el pago se confirmó', () => {
    render(
      <MemoryRouter initialEntries={['/gracias']}>
        <ThanksScreen />
      </MemoryRouter>
    )

    expect(screen.getByText(/gracias por tu apoyo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /seguir aprendiendo/i })).toBeInTheDocument()
  })
})
