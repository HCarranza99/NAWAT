import { Progress } from './progress'

export default function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)))
  return (
    <Progress
      value={pct}
      className="h-2.5 flex-1 bg-border"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}
