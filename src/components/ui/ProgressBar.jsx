import { Progress } from './progress'

export default function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)))
  return (
    <Progress
      value={pct}
      className="h-2.5 flex-1 bg-[#e0e5dd] [&_[data-slot=progress-indicator]]:bg-[#1f7a57]"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}
