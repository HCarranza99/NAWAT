/**
 * Torogoz — mascota del Sistema Náhuat
 * Ave nacional de El Salvador (Eumomota superciliosa)
 *
 * Props:
 *   emotion: 'idle' | 'celebrate' | 'sad'
 *   size:    number (px, default 120)
 */
export default function Torogoz({ emotion = 'idle', size = 120 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 225"
      width={size}
      height={size * (225 / 200)}
      className={`torogoz torogoz-${emotion}`}
      aria-hidden="true"
    >
      {/* ── COLA izquierda ── */}
      <g id="tail-left" className="torogoz-tail-left">
        <ellipse cx="63" cy="207" rx="13" ry="16"
          fill="#2D5F5F" stroke="#1A1A2E" strokeWidth="3"/>
      </g>

      {/* ── COLA derecha ── */}
      <g id="tail-right" className="torogoz-tail-right">
        <ellipse cx="137" cy="207" rx="13" ry="16"
          fill="#2D5F5F" stroke="#1A1A2E" strokeWidth="3"/>
      </g>

      {/* ── PATAS ── */}
      <g id="legs">
        <line x1="83"  y1="168" x2="70"  y2="196"
          stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round"/>
        <line x1="117" y1="168" x2="130" y2="196"
          stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* ── ALA izquierda (detrás del cuerpo) ── */}
      <g id="wing-left" className="torogoz-wing-left">
        <ellipse cx="26" cy="103" rx="24" ry="20"
          fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="3.5"/>
      </g>

      {/* ── ALA derecha ── */}
      <g id="wing-right" className="torogoz-wing-right">
        <ellipse cx="174" cy="103" rx="24" ry="20"
          fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="3.5"/>
      </g>

      {/* ── CUERPO principal ── */}
      <g id="body" className="torogoz-body">
        <circle cx="100" cy="97" r="76"
          fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="3.5"/>
      </g>

      {/* ── VIENTRE ── */}
      <g id="belly">
        <circle cx="100" cy="122" r="43"
          fill="#E8874A" stroke="#1A1A2E" strokeWidth="2.5"/>
      </g>

      {/* ── MÁSCARA ── */}
      <ellipse cx="100" cy="79" rx="55" ry="31" fill="#1A1A2E"/>

      {/* ── OJO izquierdo ── */}
      <g id="eye-left" className="torogoz-eyes">
        <circle cx="78"  cy="77" r="20" fill="white"/>
        <circle cx="78"  cy="79" r="11" fill="#1A1A2E"/>
        <circle cx="73"  cy="73" r="4.5" fill="white"/>
      </g>

      {/* ── OJO derecho ── */}
      <g id="eye-right" className="torogoz-eyes">
        <circle cx="122" cy="77" r="20" fill="white"/>
        <circle cx="122" cy="79" r="11" fill="#1A1A2E"/>
        <circle cx="117" cy="73" r="4.5" fill="white"/>
      </g>

      {/* ── PICO ── */}
      <g id="beak" className="torogoz-beak">
        <ellipse cx="100" cy="108" rx="11" ry="7"
          fill="#F5C842" stroke="#1A1A2E" strokeWidth="2"/>
      </g>
    </svg>
  )
}
