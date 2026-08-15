/**
 * Registro de entrada — nombre, edad y residencia.
 *
 * Lo que estos tests protegen es la TRAZABILIDAD: los tres datos deben viajar
 * en el mismo insert que crea al participante, porque ese participant_id es lo
 * que ancla sesiones, lecciones y ejercicios. Si el registro se guarda solo en
 * el store y nunca llega a Supabase, la telemetría queda anónima otra vez.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import useGameStore, { PHASES } from '../store/useGameStore'
import {
  RESIDENCIAS, districtCode, distritosDe, isDistritoValido, isEdadValida,
  isPaisValido, isResidenciaValida, paises,
} from '../data/registro'

const createParticipant = vi.fn().mockResolvedValue('nuevo-participante-id')
const saveParticipantRegistration = vi.fn().mockResolvedValue(true)

vi.mock('../services/analytics', () => ({
  createParticipant: (...args) => createParticipant(...args),
  saveParticipantRegistration: (...args) => saveParticipantRegistration(...args),
  startSession: vi.fn().mockResolvedValue('mock-session-id'),
  endSession: vi.fn(),
  markPretestCompleted: vi.fn(),
  markPosttestUnlocked: vi.fn(),
  markPosttestCompleted: vi.fn(),
  logExerciseResponse: vi.fn(),
  startLessonAttempt: vi.fn().mockResolvedValue('mock-attempt-id'),
  completeLessonAttempt: vi.fn(),
}))

vi.mock('../services/auth', () => ({
  onAuthStateChange: (cb) => {
    queueMicrotask(() => cb(null))
    return () => {}
  },
  loadProgressFromCloud: vi.fn().mockResolvedValue(null),
  saveProgressToCloud: vi.fn().mockResolvedValue(undefined),
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('../data/questionnaires', () => ({
  INTERVENTION_MS: 999999999,
  INTERVENTION_MINUTES: 999999999,
  PRETEST_ITEMS: [],
  POSTTEST_ITEMS: [],
  PRACTICE_ITEM: { code: 'practice', item_type: 'likert_5', question_text: 'q', polarity: 'positive', is_required: true, order_index: 0 },
  CONSENT_VERSION: '1.0.0',
  CONSENT_TEXT: '',
  LIKERT_5_LABELS: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
  LIKERT_5_SHORT_LABELS: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
}))

const { default: App } = await import('../App')

/** Dispositivo nuevo: sin participante y sin registro previo. */
function dispositivoNuevo() {
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    enrolledInStudy: false,
    participantId: null,
    participantName: null,
    participantAge: null,
    participantResidence: null,
    participantDistrict: null,
    participantCountry: null,
    registrationCompletedAt: null,
    registrationSkipped: false,
    // Se reinicia aquí porque el store es un singleton entre tests: si uno
    // cierra el aviso, el siguiente heredaría el cierre.
    registrationPromptDismissed: false,
    currentSessionId: null,
  })
}

function llenarFormulario({
  nombre = 'María', edad = '24',
  residencia = 'sonsonate', distrito = 'sonsonate-nahuizalco', pais = null,
} = {}) {
  fireEvent.change(screen.getByLabelText('¿Cómo te llamas?'), { target: { value: nombre } })
  fireEvent.change(screen.getByLabelText('¿Cuántos años tienes?'), { target: { value: edad } })
  fireEvent.change(screen.getByLabelText('¿Dónde vives?'), { target: { value: residencia } })
  if (pais) {
    fireEvent.change(screen.getByLabelText('¿En qué país?'), { target: { value: pais } })
  } else if (distrito) {
    fireEvent.change(screen.getByLabelText('¿De qué distrito?'), { target: { value: distrito } })
  }
}

beforeEach(() => {
  createParticipant.mockClear()
  saveParticipantRegistration.mockClear()
  saveParticipantRegistration.mockResolvedValue(true)
  dispositivoNuevo()
  // BrowserRouter lee la URL de jsdom, que sobrevive entre tests: sin esto, el
  // que navegó a Perfil deja ahí al siguiente.
  window.history.replaceState({}, '', '/')
})

/** Alguien que ya venía usando la app antes de que se pidieran estos datos. */
function participanteViejoSinDatos() {
  useGameStore.setState({
    studyPhase: PHASES.FREE,
    participantId: 'participante-viejo',
    participantName: null,
    participantAge: null,
    participantResidence: null,
    participantDistrict: null,
    participantCountry: null,
    registrationCompletedAt: null,
    registrationPromptDismissed: false,
    // Ya usó la app: el tutorial de la mascota quedó atrás.
    onboardingSeen: true,
  })
}

/** Abre una pestaña de la barra inferior por su etiqueta. */
async function clickNavTab(label) {
  await waitFor(() => {
    expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
  })
  const nav = screen.queryByLabelText('Navegación principal')
  fireEvent.click(within(nav).getByLabelText(label))
}

describe('Registro tardío — quien ya estaba', () => {
  // `participants` no concede UPDATE a la app, así que el envío tardío tiene
  // que ir a la tabla de solo-agregar. Esto es lo que permite que los 463
  // participantes que ya existen puedan dar sus datos.
  it('Perfil ofrece completar los datos a quien no los tiene', async () => {
    participanteViejoSinDatos()
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => {
      expect(screen.getByTestId('completar-registro')).toBeInTheDocument()
    })
    expect(screen.getByText('Cuéntanos quién eres')).toBeInTheDocument()
  })

  it('el envío va a la tabla de solo-agregar, con el participante que ya existía', async () => {
    participanteViejoSinDatos()
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => expect(screen.getByTestId('completar-registro')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('completar-registro'))

    await waitFor(() => expect(screen.getByLabelText('¿Cómo te llamas?')).toBeInTheDocument())
    llenarFormulario({ nombre: 'Rosa', edad: '52', residencia: 'morazan', distrito: 'morazan-guatajiagua' })
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(saveParticipantRegistration).toHaveBeenCalledWith(
        'participante-viejo',
        { name: 'Rosa', age: 52, residence: 'morazan', district: 'morazan-guatajiagua', country: null },
      )
    })
    // No se crea un participante nuevo: se conserva el que ancla su historial.
    expect(createParticipant).not.toHaveBeenCalled()
    const s = useGameStore.getState()
    expect(s.participantId).toBe('participante-viejo')
    expect(s.participantAge).toBe(52)
  })

  it('quien ya dio sus datos los ve y los puede corregir', async () => {
    useGameStore.setState({
      participantId: 'participante-viejo',
      participantName: 'María',
      participantAge: 24,
      participantResidence: 'sonsonate',
      participantDistrict: 'sonsonate-nahuizalco',
      registrationCompletedAt: '2026-08-15T00:00:00.000Z',
      onboardingSeen: true,
    })
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => expect(screen.getByTestId('editar-registro')).toBeInTheDocument())
    expect(screen.getByText('María · 24 años · Nahuizalco')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('editar-registro'))
    await waitFor(() => expect(screen.getByLabelText('¿Cuántos años tienes?')).toBeInTheDocument())
    // El formulario llega con lo que ya había: se corrige, no se rellena de cero.
    expect(screen.getByLabelText('¿Cómo te llamas?')).toHaveValue('María')
    expect(screen.getByLabelText('¿Cuántos años tienes?')).toHaveValue(24)

    fireEvent.change(screen.getByLabelText('¿Cuántos años tienes?'), { target: { value: '25' } })
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(saveParticipantRegistration).toHaveBeenCalledWith(
        'participante-viejo',
        { name: 'María', age: 25, residence: 'sonsonate', district: 'sonsonate-nahuizalco', country: null },
      )
    })
  })

  it('si el envío falla, avisa y no cierra el formulario', async () => {
    saveParticipantRegistration.mockResolvedValue(false)
    participanteViejoSinDatos()
    render(<App />)
    await clickNavTab('Perfil')

    await waitFor(() => expect(screen.getByTestId('completar-registro')).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('completar-registro'))
    await waitFor(() => expect(screen.getByLabelText('¿Cómo te llamas?')).toBeInTheDocument())
    llenarFormulario()
    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos enviarlo/i)
    })
    // Lo local sí quedó: no se le pide que lo escriba otra vez.
    expect(useGameStore.getState().participantAge).toBe(24)
  })

  it('el aviso del inicio aparece y se puede cerrar para siempre', async () => {
    participanteViejoSinDatos()
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('banner-completar-perfil')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Ahora no'))

    await waitFor(() => {
      expect(screen.queryByTestId('banner-completar-perfil')).not.toBeInTheDocument()
    })
    expect(useGameStore.getState().registrationPromptDismissed).toBe(true)
  })

  it('a quien ya dio sus datos no se le muestra el aviso', async () => {
    useGameStore.setState({
      participantId: 'participante-viejo',
      participantName: 'María',
      participantAge: 24,
      participantResidence: 'sonsonate',
      participantDistrict: 'sonsonate-nahuizalco',
      registrationCompletedAt: '2026-08-15T00:00:00.000Z',
      onboardingSeen: true,
    })
    render(<App />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('banner-completar-perfil')).not.toBeInTheDocument()
  })
})

describe('Registro — quien ya tiene cuenta', () => {
  // El caso que rompía todo: `participants` no concede SELECT a la clave
  // anónima, así que la identidad tiene que volver desde user_profiles. Sin
  // esto, iniciar sesión en un teléfono nuevo pedía el registro otra vez y
  // partía la telemetría de una persona en dos participantes.
  it('adopta identidad y participante del perfil de la nube', () => {
    useGameStore.getState().adoptCloudIdentity({
      participantId: 'participante-de-la-cuenta',
      participantName: 'Carlos',
      participantAge: 31,
      participantResidence: 'san_salvador',
      registrationCompletedAt: '2026-08-01T00:00:00.000Z',
      xp: 0,
    })

    const s = useGameStore.getState()
    expect(s.participantId).toBe('participante-de-la-cuenta')
    expect(s.participantName).toBe('Carlos')
    expect(s.participantAge).toBe(31)
    expect(s.participantResidence).toBe('san_salvador')
    expect(s.registrationCompletedAt).toBe('2026-08-01T00:00:00.000Z')
  })

  it('una cuenta vieja sin estos campos igual se salta el registro', () => {
    // Perfiles creados antes de la migración: tener cuenta ya prueba que la
    // persona entró alguna vez.
    useGameStore.getState().adoptCloudIdentity({ xp: 120 })
    expect(useGameStore.getState().registrationCompletedAt).not.toBeNull()
  })

  it('no pisa lo que se acaba de escribir en este dispositivo', () => {
    useGameStore.setState({
      participantId: 'participante-local',
      participantName: 'María',
      participantAge: 24,
      participantResidence: 'sonsonate',
    })

    useGameStore.getState().adoptCloudIdentity({
      participantId: 'participante-viejo',
      participantName: 'Nombre viejo',
      participantAge: 99,
      participantResidence: 'la_union',
    })

    const s = useGameStore.getState()
    expect(s.participantId).toBe('participante-local')
    expect(s.participantName).toBe('María')
    expect(s.participantAge).toBe(24)
    expect(s.participantResidence).toBe('sonsonate')
  })

  it('quien inició sesión entra a la app sin ver el registro', async () => {
    useGameStore.setState({
      authUserId: 'auth-user',
      participantId: 'participante-de-la-cuenta',
      participantName: 'Carlos',
      registrationCompletedAt: '2026-08-01T00:00:00.000Z',
    })

    render(<App />)
    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(screen.queryByText('Antes de empezar')).not.toBeInTheDocument()
  })
})

describe('Registro — cuándo se muestra', () => {
  it('es lo primero que ve un dispositivo nuevo', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Antes de empezar')).toBeInTheDocument()
    })
    // Sin app detrás: nada de navegación hasta terminar el registro.
    expect(screen.queryByLabelText('Navegación principal')).not.toBeInTheDocument()
  })

  it('no se le vuelve a preguntar a quien ya tiene participante', async () => {
    useGameStore.setState({ participantId: 'ya-existe', participantName: 'Tester' })
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
    expect(screen.queryByText('Antes de empezar')).not.toBeInTheDocument()
  })

  it('no se le vuelve a preguntar a quien ya registró en este dispositivo', async () => {
    useGameStore.setState({ registrationCompletedAt: '2026-08-15T00:00:00.000Z' })
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
  })
})

describe('Registro — validación', () => {
  it('no avanza si falta algún dato', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    fireEvent.click(screen.getByText("Continuar →"))

    expect(screen.getByText('Escribe tu nombre o cómo quieres que te llamemos.')).toBeInTheDocument()
    expect(screen.getByText('Elige dónde vives.')).toBeInTheDocument()
    expect(useGameStore.getState().registrationCompletedAt).toBeNull()
  })

  it('rechaza una edad fuera de rango', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ edad: '199' })
    fireEvent.click(screen.getByText("Continuar →"))

    expect(screen.getByText(/Escribe tu edad en números/)).toBeInTheDocument()
    expect(useGameStore.getState().registrationCompletedAt).toBeNull()
  })
})

describe('Registro — trazabilidad', () => {
  it('los tres datos viajan en el insert que crea al participante', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ nombre: 'María', edad: '24', residencia: 'sonsonate' })
    fireEvent.click(screen.getByText("Continuar →"))

    await waitFor(() => {
      expect(createParticipant).toHaveBeenCalledWith(
        'María', null, 'free',
        { age: 24, residence: 'sonsonate', district: 'sonsonate-nahuizalco', country: null },
      )
    })

    // Y el participante creado queda en el store: es el que firma la telemetría.
    await waitFor(() => {
      expect(useGameStore.getState().participantId).toBe('nuevo-participante-id')
    })
    const s = useGameStore.getState()
    expect(s.participantAge).toBe(24)
    expect(s.participantResidence).toBe('sonsonate')
  })

  it('al terminar ofrece guardar el progreso con cuenta', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario()
    fireEvent.click(screen.getByText('Continuar →'))

    await waitFor(() => {
      expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
    })
    expect(screen.getByText('Crear cuenta con correo')).toBeInTheDocument()
    // Sin el postest de por medio, nada de textos del estudio.
    expect(screen.queryByText('¡Gracias por participar!')).not.toBeInTheDocument()
  })

  it('los datos quedan persistidos ANTES de la oferta de cuenta', async () => {
    // Crear cuenta con Google recarga la página: si el registro no estuviera
    // ya guardado, la redirección se lo llevaría.
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ nombre: 'Ana', edad: '19', residencia: 'ahuachapan', distrito: 'ahuachapan-tacuba' })
    fireEvent.click(screen.getByText('Continuar →'))

    await waitFor(() => expect(screen.getByText('Continuar con Google')).toBeInTheDocument())
    const persistido = JSON.parse(localStorage.getItem('nahuat-game-v1')).state
    expect(persistido.participantName).toBe('Ana')
    expect(persistido.participantAge).toBe(19)
    expect(persistido.participantResidence).toBe('ahuachapan')
  })

  it('desde la oferta de cuenta se puede entrar sin cuenta', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario()
    fireEvent.click(screen.getByText('Continuar →'))
    await waitFor(() => expect(screen.getByText('Continuar sin cuenta')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Continuar sin cuenta'))

    await waitFor(() => {
      expect(screen.queryByLabelText('Navegación principal')).toBeInTheDocument()
    })
  })

  it('quien ya tiene cuenta puede iniciar sesión desde el registro', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    fireEvent.click(screen.getByText('¿Ya tienes cuenta? Iniciar sesión'))

    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('omitir crea igual un participante anónimo (no se pierde el usuario)', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Prefiero no decirlo'))

    await waitFor(() => {
      expect(createParticipant).toHaveBeenCalledWith(
        null, null, 'free',
        { age: null, residence: null, district: null, country: null },
      )
    })
    expect(useGameStore.getState().registrationSkipped).toBe(true)
  })

  it('si el insert falla, el registro persiste y se reintenta con los mismos datos', async () => {
    createParticipant.mockResolvedValueOnce(null) // Supabase caído

    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ nombre: 'Carlos', edad: '31', residencia: 'san_salvador', distrito: 'san_salvador-mejicanos' })
    fireEvent.click(screen.getByText("Continuar →"))

    await waitFor(() => expect(createParticipant).toHaveBeenCalledTimes(1))

    // El usuario entra igual (no se queda atorado en el formulario) y los datos
    // quedaron guardados para el reintento de la siguiente carga.
    const s = useGameStore.getState()
    expect(s.participantId).toBeNull()
    expect(s.participantName).toBe('Carlos')
    expect(s.participantAge).toBe(31)
    expect(s.participantResidence).toBe('san_salvador')
    expect(s.registrationCompletedAt).not.toBeNull()
  })
})

describe('Lugar — distrito y país', () => {
  it('el distrito aparece solo cuando ya hay departamento', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    expect(screen.queryByLabelText('¿De qué distrito?')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('¿Dónde vives?'), { target: { value: 'sonsonate' } })
    expect(screen.getByLabelText('¿De qué distrito?')).toBeInTheDocument()
    // La lista es la del departamento elegido, no la de los 262.
    const opciones = [...screen.getByLabelText('¿De qué distrito?').options].map((o) => o.textContent)
    expect(opciones).toContain('Nahuizalco')
    expect(opciones).toContain('Santo Domingo de Guzmán')
    expect(opciones).not.toContain('Guatajiagua')
  })

  it('cambiar de departamento borra el distrito que ya no aplica', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ residencia: 'sonsonate', distrito: 'sonsonate-nahuizalco' })
    // Nahuizalco no existe en Morazán: el campo tiene que quedar vacío.
    fireEvent.change(screen.getByLabelText('¿Dónde vives?'), { target: { value: 'morazan' } })
    expect(screen.getByLabelText('¿De qué distrito?')).toHaveValue('')

    fireEvent.click(screen.getByText('Continuar →'))
    expect(screen.getByText('Elige tu distrito.')).toBeInTheDocument()
    expect(useGameStore.getState().registrationCompletedAt).toBeNull()
  })

  it('vivir fuera pide país en vez de distrito', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Antes de empezar')).toBeInTheDocument())

    llenarFormulario({ nombre: 'Sofía', edad: '30', residencia: 'fuera_de_el_salvador', pais: 'US' })
    expect(screen.queryByLabelText('¿De qué distrito?')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Continuar →'))

    await waitFor(() => {
      expect(createParticipant).toHaveBeenCalledWith(
        'Sofía', null, 'free',
        { age: 30, residence: 'fuera_de_el_salvador', district: null, country: 'US' },
      )
    })
  })

  it('a quien se registró sin distrito se le vuelve a ofrecer', async () => {
    // Los que dieron sus datos antes de que existiera el campo: el lugar quedó
    // a medias y hay que poder terminarlo.
    useGameStore.setState({
      participantId: 'participante-viejo',
      participantName: 'María',
      participantAge: 24,
      participantResidence: 'sonsonate',
      participantDistrict: null,
      participantCountry: null,
      registrationCompletedAt: '2026-08-15T00:00:00.000Z',
      onboardingSeen: true,
    })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('banner-completar-perfil')).toBeInTheDocument()
    })
  })
})

describe('Catálogo de residencias', () => {
  it('tiene los 14 departamentos más la opción de fuera del país', () => {
    expect(RESIDENCIAS).toHaveLength(15)
    expect(isResidenciaValida('sonsonate')).toBe(true)
    expect(isResidenciaValida('fuera_de_el_salvador')).toBe(true)
    expect(isResidenciaValida('Sonsonate')).toBe(false)
  })

  it('los códigos son estables: sin espacios, acentos ni mayúsculas', () => {
    for (const { code } of RESIDENCIAS) {
      expect(code).toMatch(/^[a-z_]+$/)
    }
  })

  // El reparto oficial de los 262 distritos por departamento. Si alguien
  // agrega o borra un nombre por error, esto lo caza.
  it('están los 262 distritos, repartidos como manda el reparto oficial', () => {
    const esperado = {
      ahuachapan: 12, santa_ana: 13, sonsonate: 16, chalatenango: 33,
      la_libertad: 22, san_salvador: 19, cuscatlan: 16, la_paz: 22,
      cabanas: 9, san_vicente: 13, usulutan: 23, san_miguel: 20,
      morazan: 26, la_union: 18,
    }
    const codigos = new Set()
    let total = 0

    for (const [depto, cuantos] of Object.entries(esperado)) {
      const distritos = distritosDe(depto)
      expect(distritos, `distritos de ${depto}`).toHaveLength(cuantos)
      distritos.forEach((d) => codigos.add(d.code))
      total += distritos.length
    }

    expect(total).toBe(262)
    // Los nombres se repiten entre departamentos (El Rosario está en tres), así
    // que el código lleva el departamento adelante y no puede colisionar.
    expect(codigos.size).toBe(262)
  })

  it('el código del distrito no lleva acentos y nombra a su departamento', () => {
    expect(districtCode('sonsonate', 'Santo Domingo de Guzmán')).toBe('sonsonate-santo_domingo_de_guzman')
    expect(districtCode('morazan', 'Yoloaiquín')).toBe('morazan-yoloaiquin')
    expect(isDistritoValido('sonsonate', 'sonsonate-nahuizalco')).toBe(true)
    // El mismo nombre en otro departamento no cuela.
    expect(isDistritoValido('morazan', 'sonsonate-nahuizalco')).toBe(false)
    expect(isDistritoValido('sonsonate', 'sonsonate-guatajiagua')).toBe(false)
  })

  it('los países salen en español y guardan el código ISO', () => {
    const lista = paises()
    expect(lista.length).toBeGreaterThan(180)
    expect(lista.find((p) => p.code === 'US').label).toBe('Estados Unidos')
    expect(isPaisValido('ES')).toBe(true)
    expect(isPaisValido('XX')).toBe(false)
    // El Salvador no está: quien vive aquí elige departamento y distrito.
    expect(isPaisValido('SV')).toBe(false)
    // Orden alfabético en español, no por código.
    expect([...lista].sort((a, b) => a.label.localeCompare(b.label, 'es'))).toEqual(lista)
  })

  it('acepta edades del rango declarado y rechaza el resto', () => {
    expect(isEdadValida(5)).toBe(true)
    expect(isEdadValida(99)).toBe(true)
    expect(isEdadValida(4)).toBe(false)
    expect(isEdadValida(100)).toBe(false)
    expect(isEdadValida(24.5)).toBe(false)
    expect(isEdadValida(Number.NaN)).toBe(false)
  })
})
