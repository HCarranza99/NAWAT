const STEP_LABELS = {
  pretest: 'Fase 1: cuestionario inicial',
  practice: 'Fase 2: uso de la app',
  posttest: 'Fase 3: cuestionario final',
  complete: 'Participacion valida',
}

export default function StudyProgressBanner({ completed = 0, current = 'pretest', className = '' }) {
  const safeCompleted = Math.max(0, Math.min(3, completed))
  const label = STEP_LABELS[current] ?? current

  return (
    <div
      className={`rounded-md border border-[#d8ddd5] bg-white/88 px-3 py-2 text-[#17211d] shadow-sm ${className}`.trim()}
      data-testid="study-progress-banner"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-black uppercase leading-none tracking-[0.14em] text-[#6d756e]">
            Progreso del estudio
          </p>
          <p className="mt-1 truncate text-xs font-extrabold leading-none">
            Has completado {safeCompleted}/3
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-2 w-6 rounded-full ${
                step <= safeCompleted ? 'bg-[#1f7a57]' : 'bg-[#d8ddd5]'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-1 text-[0.68rem] font-semibold leading-snug text-[#6d756e]">
        Ahora: {label}
      </p>
    </div>
  )
}
