import { CSSProperties } from 'react'
import { scoreColor } from './RatingSlider'

interface ScoreBarProps {
  score: number
  height?: string
  mutedColor?: string
  className?: string
  showValue?: boolean
}

function clampPercent(score: number) {
  return Math.max(0, Math.min(100, score * 10))
}

export default function ScoreBar({ score, height = '0.55rem', mutedColor = 'rgba(255,255,255,0.16)', className = '', showValue = false }: ScoreBarProps) {
  const color = scoreColor(score)
  const style = {
    height,
    backgroundColor: mutedColor,
  } as CSSProperties

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="min-w-0 flex-1 overflow-hidden rounded-full" style={style}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${clampPercent(score)}%`,
            backgroundColor: color,
            boxShadow: `0 0 18px ${color}66`,
          }}
        />
      </div>
      {showValue && (
        <span className="w-10 text-right font-black tabular-nums" style={{ color }}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  )
}
