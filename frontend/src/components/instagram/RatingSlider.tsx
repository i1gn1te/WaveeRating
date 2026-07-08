import { CSSProperties } from 'react'

export function clampRatingScore(value: number) {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.min(10, value))
}

export function scoreColor(score: number) {
  if (score <= 3) return '#ef4444'
  if (score <= 5) return '#f97316'
  if (score <= 7) return '#eab308'
  if (score < 8.5) return '#22c55e'
  return '#8b5cf6'
}

interface RatingSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  compact?: boolean
}

export default function RatingSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.1,
  disabled = false,
  compact = false,
}: RatingSliderProps) {
  const color = scoreColor(value)
  const fill = `${((value - min) / (max - min)) * 100}%`
  const handleInput = (rawValue: string) => onChange(clampRatingScore(Number(rawValue)))
  const sliderStyle = {
    '--score-color': color,
    '--score-fill': fill,
    accentColor: color,
    boxShadow: value >= 8.5 ? `0 0 22px ${color}44` : undefined,
  } as CSSProperties

  return (
    <label className={`block min-w-0 rounded-lg border border-gray-800 bg-gray-900 ${compact ? 'p-3' : 'p-4'} ${disabled ? 'opacity-60' : ''}`}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="min-w-0 text-sm font-medium leading-5 text-gray-200">{label}</span>
        <span className={`shrink-0 ${compact ? 'text-xl font-black' : 'text-2xl font-black'}`} style={{ color }}>
          {value.toFixed(1)}/10
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onInput={(event) => handleInput(event.currentTarget.value)}
        onChange={(event) => handleInput(event.currentTarget.value)}
        className="rating-slider w-full disabled:cursor-not-allowed"
        style={sliderStyle}
      />
    </label>
  )
}
