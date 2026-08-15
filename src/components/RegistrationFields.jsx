/**
 * RegistrationFields.jsx
 *
 * Los tres campos del registro — nombre, edad y residencia — con su
 * validación. Vive aparte porque se piden en dos momentos y tienen que ser
 * idénticos en ambos, o los datos no serían comparables:
 *   • RegistrationScreen — al abrir la app por primera vez.
 *   • ProfileScreen      — envío tardío o corrección de quien ya estaba.
 */
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  RESIDENCIAS,
  RESIDENCIA_EXTERIOR,
  EDAD_MIN,
  EDAD_MAX,
  NOMBRE_MIN,
  NOMBRE_MAX,
  distritosDe,
  isEdadValida,
  isResidenciaValida,
  isDistritoValido,
  isPaisValido,
  paises,
} from '../data/registro'

export default function RegistrationFields({
  initial = {},
  submitLabel = 'Guardar',
  loading = false,
  onSubmit,
  children,
  secondaryAction = null,
}) {
  const [nombre, setNombre] = useState(initial.nombre ?? '')
  const [edad, setEdad] = useState(initial.edad != null ? String(initial.edad) : '')
  const [residencia, setResidencia] = useState(initial.residencia ?? '')
  const [distrito, setDistrito] = useState(initial.distrito ?? '')
  const [pais, setPais] = useState(initial.pais ?? '')
  const [touched, setTouched] = useState(false)

  const nombreLimpio = nombre.trim()
  const edadNum = Number.parseInt(edad, 10)
  const viveFuera = residencia === RESIDENCIA_EXTERIOR
  const departamentoElegido = isResidenciaValida(residencia) && !viveFuera

  const errores = {
    nombre: nombreLimpio.length < NOMBRE_MIN ? 'Escribe tu nombre o cómo quieres que te llamemos.' : null,
    edad: !isEdadValida(edadNum) ? `Escribe tu edad en números (de ${EDAD_MIN} a ${EDAD_MAX}).` : null,
    residencia: !isResidenciaValida(residencia) ? 'Elige dónde vives.' : null,
    distrito: departamentoElegido && !isDistritoValido(residencia, distrito) ? 'Elige tu distrito.' : null,
    pais: viveFuera && !isPaisValido(pais) ? 'Elige el país donde vives.' : null,
  }
  const valido = !Object.values(errores).some(Boolean)

  /** Solo mostramos errores después del primer intento de envío. */
  const errorDe = (campo) => (touched ? errores[campo] : null)

  /**
   * Cambiar de departamento invalida el distrito elegido — «Nahuizalco» no
   * existe en Morazán —, así que se limpia. Lo mismo entre país y distrito:
   * los dos campos son excluyentes.
   */
  const cambiarResidencia = (code) => {
    setResidencia(code)
    setDistrito('')
    if (code !== RESIDENCIA_EXTERIOR) setPais('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!valido || loading) return
    onSubmit({
      name: nombreLimpio,
      age: edadNum,
      residence: residencia,
      district: viveFuera ? null : distrito,
      country: viveFuera ? pais : null,
    })
  }

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <Campo id="reg-nombre" label="¿Cómo te llamas?" error={errorDe('nombre')}>
        <input
          id="reg-nombre"
          className="profile-input w-full"
          type="text"
          placeholder="Ej. María"
          value={nombre}
          maxLength={NOMBRE_MAX}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="given-name"
          disabled={loading}
          aria-invalid={Boolean(errorDe('nombre'))}
          aria-describedby={errorDe('nombre') ? 'reg-nombre-error' : undefined}
        />
      </Campo>

      <Campo id="reg-edad" label="¿Cuántos años tienes?" error={errorDe('edad')}>
        <input
          id="reg-edad"
          className="profile-input w-full"
          type="number"
          /* inputMode numérico: en el teléfono abre el teclado de números */
          inputMode="numeric"
          placeholder="Ej. 24"
          value={edad}
          min={EDAD_MIN}
          max={EDAD_MAX}
          onChange={(e) => setEdad(e.target.value)}
          disabled={loading}
          aria-invalid={Boolean(errorDe('edad'))}
          aria-describedby={errorDe('edad') ? 'reg-edad-error' : undefined}
        />
      </Campo>

      <Campo id="reg-residencia" label="¿Dónde vives?" error={errorDe('residencia')}>
        {/* Lista cerrada, no texto libre: "Sonsonate", "sonsonate" y "Sonso"
            serían tres grupos distintos en el análisis. */}
        <Selector
          id="reg-residencia"
          value={residencia}
          onChange={cambiarResidencia}
          disabled={loading}
          invalid={Boolean(errorDe('residencia'))}
          placeholder="Elige tu departamento"
          options={RESIDENCIAS}
        />
      </Campo>

      {/* El distrito es lo que de verdad ubica a alguien: Sonsonate mezcla
          Nahuizalco con la cabecera departamental. Aparece solo cuando ya hay
          departamento, para no mostrar una lista vacía. */}
      {departamentoElegido && (
        <Campo id="reg-distrito" label="¿De qué distrito?" error={errorDe('distrito')}>
          <Selector
            id="reg-distrito"
            value={distrito}
            onChange={setDistrito}
            disabled={loading}
            invalid={Boolean(errorDe('distrito'))}
            placeholder="Elige tu distrito"
            options={distritosDe(residencia)}
          />
        </Campo>
      )}

      {viveFuera && (
        <Campo id="reg-pais" label="¿En qué país?" error={errorDe('pais')}>
          <Selector
            id="reg-pais"
            value={pais}
            onChange={setPais}
            disabled={loading}
            invalid={Boolean(errorDe('pais'))}
            placeholder="Elige el país"
            options={paises()}
          />
        </Campo>
      )}

      {children}

      <div className="mt-auto flex flex-col items-center gap-3 pt-4">
        <button type="submit" className="btn-3d btn-3d-primary" disabled={loading}>
          {loading ? 'Guardando…' : submitLabel}
        </button>
        {secondaryAction}
      </div>
    </form>
  )
}

/* ── Selector con flecha ────────────────────────────────────────── */
function Selector({ id, value, onChange, disabled, invalid, placeholder, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        className="profile-input w-full appearance-none bg-card pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>{o.label}</option>
        ))}
      </select>
      {/* Sin la flecha, el select se ve idéntico a un campo de texto y nadie
          lo toca. */}
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
}

/* ── Campo con etiqueta y error ─────────────────────────────────── */
function Campo({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[0.82rem] font-bold uppercase tracking-[0.5px] text-muted-foreground"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[0.8rem] font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
