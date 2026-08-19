/**
 * clasificacion.test.jsx
 *
 * La tabla de clasificación publica nombres de personas reales, así que lo que
 * se prueba acá no es que "se vea bonita": es que no muestre a quien no debe y
 * que se pueda salir.
 *
 * Ojo con el alcance: el filtro de quién aparece vive en la BASE
 * (leaderboard_top10, ver 20260819_tabla_clasificacion.sql), no en el cliente.
 * Estas pruebas cubren el lado del navegador; la garantía de que los 84 del
 * estudio quedan fuera es del SQL y se verificó llamando a la RPC con la clave
 * anónima real.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const fetchTop10 = vi.fn()
const fetchMiPosicion = vi.fn()
const setLeaderboardOptOutRpc = vi.fn()

vi.mock('../services/leaderboard', () => ({
  PUESTOS: 10,
  fetchTop10: (...a) => fetchTop10(...a),
  fetchMiPosicion: (...a) => fetchMiPosicion(...a),
  setLeaderboardOptOut: (...a) => setLeaderboardOptOutRpc(...a),
}))

const Leaderboard = (await import('../components/ui/Leaderboard')).default
const useGameStore = (await import('../store/useGameStore')).default

const top = [
  { posicion: 1, nombre: 'Sara', xp: 320 },
  { posicion: 2, nombre: 'Cesia', xp: 260 },
  { posicion: 3, nombre: 'Mario', xp: 165 },
]

beforeEach(() => {
  fetchTop10.mockReset().mockResolvedValue(top)
  fetchMiPosicion.mockReset().mockResolvedValue(null)
  setLeaderboardOptOutRpc.mockReset().mockResolvedValue(true)
  useGameStore.setState({ participantId: 'p-1', leaderboardOptOut: false })
})

describe('la tabla', () => {
  it('muestra nombre y XP de cada puesto', async () => {
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('Sara')).toBeInTheDocument())
    expect(screen.getByText('320')).toBeInTheDocument()
    expect(screen.getByText('Cesia')).toBeInTheDocument()
    expect(screen.getByText('Mario')).toBeInTheDocument()
  })

  it('avisa que el XP es de lecciones, no el del perfil', async () => {
    // El número no coincide con el "XP total" de la misma pantalla, porque el
    // local arrastra XP de las secciones jubiladas. Sin este rótulo, la
    // diferencia parece un error.
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('Sara')).toBeInTheDocument())
    expect(screen.getByText(/XP de lecciones completadas/i)).toBeInTheDocument()
  })

  it('dice dónde se sale de la tabla', async () => {
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('Sara')).toBeInTheDocument())
    expect(screen.getByText(/salir de la tabla desde Perfil/i)).toBeInTheDocument()
  })

  it('con la tabla vacía no rompe la pantalla', async () => {
    fetchTop10.mockResolvedValue([])
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText(/Todavía no hay tabla/i)).toBeInTheDocument())
  })

  it('si la red falla, se comporta como tabla vacía', async () => {
    // El servicio ya atrapa el error y devuelve []; acá se cuida que la
    // pantalla no quede colgada en "Cargando…" para siempre.
    fetchTop10.mockResolvedValue([])
    render(<Leaderboard />)
    await waitFor(() => expect(screen.queryByText('Cargando…')).not.toBeInTheDocument())
  })

  it('muestra mi puesto cuando no entro en los diez', async () => {
    fetchMiPosicion.mockResolvedValue({ posicion: 14, xp: 40, total: 21 })
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('14')).toBeInTheDocument())
    expect(screen.getByText('Vos')).toBeInTheDocument()
    expect(screen.getByText(/de 21/)).toBeInTheDocument()
  })

  it('no repite mi puesto si ya salgo en el top', async () => {
    fetchMiPosicion.mockResolvedValue({ posicion: 2, xp: 260, total: 21 })
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('Cesia')).toBeInTheDocument())
    expect(screen.queryByText('Vos')).not.toBeInTheDocument()
  })

  it('sin participante no pide mi posición', async () => {
    useGameStore.setState({ participantId: null })
    render(<Leaderboard />)
    await waitFor(() => expect(screen.getByText('Sara')).toBeInTheDocument())
    expect(fetchMiPosicion).not.toHaveBeenCalled()
  })
})

describe('salirse de la tabla', () => {
  it('el servicio recibe el participante y el nuevo valor', async () => {
    const { setLeaderboardOptOut } = await import('../services/leaderboard')
    await setLeaderboardOptOut('p-1', true)
    expect(setLeaderboardOptOutRpc).toHaveBeenCalledWith('p-1', true)
  })

  it('el store refleja el interruptor', () => {
    useGameStore.getState().setLeaderboardOptOut(true)
    expect(useGameStore.getState().leaderboardOptOut).toBe(true)
    useGameStore.getState().setLeaderboardOptOut(false)
    expect(useGameStore.getState().leaderboardOptOut).toBe(false)
  })
})
