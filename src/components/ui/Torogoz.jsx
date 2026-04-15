/**
 * Torogoz — mascota del Sistema Náhuat
 * Ave nacional de El Salvador (Eumomota superciliosa)
 *
 * Props:
 *   emotion : 'idle' | 'celebrate' | 'sad'
 *   size    : ancho en px (alto se calcula automático, default 160)
 */
export default function Torogoz({ emotion = 'idle', size = 160 }) {
  // ViewBox 320 × 195  →  ratio 1.64
  const height = Math.round(size * (195 / 320))

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 195"
      width={size}
      height={height}
      className={`torogoz torogoz-${emotion}`}
      aria-hidden="true"
    >
      {/* ── COLA: hoja trasera ── */}
      <g className="torogoz-tail">
        <ellipse cx="42" cy="126" rx="32" ry="11"
          fill="#2D6A4F" stroke="#1A1A2E" strokeWidth="2.5"
          transform="rotate(-48 42 126)" />

        {/* ── COLA: tallo largo ── */}
        <path
          d="M150 112 Q108 120 80 132 Q60 140 38 148
             L42 158 Q62 150 82 142 Q112 130 154 122 Z"
          fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="2.5"
          strokeLinejoin="round" />

        {/* ── COLA: hoja delantera ── */}
        <ellipse cx="56" cy="150" rx="32" ry="11"
          fill="#2D6A4F" stroke="#1A1A2E" strokeWidth="2.5"
          transform="rotate(-20 56 150)" />
      </g>

      {/* ── CUERPO ── */}
      <g className="torogoz-body">
        <ellipse cx="208" cy="115" rx="68" ry="57"
          fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="3.5" />
      </g>

      {/* ── ALA (líneas sobre el cuerpo) ── */}
      <path
        d="M168 100 Q195 88 228 98 Q212 115 180 118 Z"
        fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="2.5"
        strokeLinejoin="round" />
      {/* Detalle de plumas */}
      <path d="M175 104 Q198 95 222 103" fill="none"
        stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M172 110 Q196 102 220 109" fill="none"
        stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── VIENTRE ── */}
      <ellipse cx="218" cy="132" rx="48" ry="40"
        fill="#E8874A" stroke="#1A1A2E" strokeWidth="2.5" />

      {/* ── CABEZA ── */}
      <circle cx="248" cy="72" r="42"
        fill="#3DBFC0" stroke="#1A1A2E" strokeWidth="3.5" />

      {/* ── MÁSCARA ── */}
      <ellipse cx="260" cy="62" rx="26" ry="19"
        fill="#1A1A2E"
        transform="rotate(-22 260 62)" />

      {/* ── OJO ── */}
      <circle cx="265" cy="57" r="15" fill="white" />
      <circle cx="265" cy="59" r="9"  fill="#1A1A2E" />
      <circle cx="260" cy="53" r="4"  fill="white" />

      {/* ── PICO superior ── */}
      <path
        d="M278 72 Q308 62 312 74 Q296 80 278 76 Z"
        fill="#F5C842" stroke="#1A1A2E" strokeWidth="2.5"
        strokeLinejoin="round" />

      {/* ── PICO inferior ── */}
      <path
        d="M278 77 Q298 80 294 92 Q280 90 278 80 Z"
        fill="#E8874A" stroke="#1A1A2E" strokeWidth="2"
        strokeLinejoin="round" />

      {/* ── PATAS ── */}
      <line x1="215" y1="168" x2="208" y2="183"
        stroke="#E8874A" strokeWidth="4" strokeLinecap="round" />
      <line x1="228" y1="168" x2="228" y2="183"
        stroke="#E8874A" strokeWidth="4" strokeLinecap="round" />
      {/* Dedos pie izquierdo */}
      <line x1="208" y1="183" x2="194" y2="188"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
      <line x1="208" y1="183" x2="208" y2="190"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
      <line x1="208" y1="183" x2="218" y2="188"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
      {/* Dedos pie derecho */}
      <line x1="228" y1="183" x2="217" y2="188"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
      <line x1="228" y1="183" x2="228" y2="190"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
      <line x1="228" y1="183" x2="238" y2="188"
        stroke="#E8874A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
