import { CSSProperties } from 'react'
import { scoreColor } from './RatingSlider'
import ScoreBar from './ScoreBar'

interface ScoreBadgeProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg' | 'poster'
  align?: 'left' | 'right' | 'center'
  textColor?: string
  mutedColor?: string
  showBar?: boolean
}

const sizeStyles = {
  sm: { score: '2.2rem', suffix: '0.8rem' },
  md: { score: '3.6rem', suffix: '1rem' },
  lg: { score: '5.8rem', suffix: '1.4rem' },
  poster: { score: '8.2rem', suffix: '1.7rem' },
}

export default function ScoreBadge({
  score,
  label,
  size = 'md',
  align = 'right',
  textColor = 'rgba(255,255,255,0.72)',
  mutedColor,
  showBar = true,
}: ScoreBadgeProps) {
  const color = scoreColor(score)
  const settings = sizeStyles[size]
  const wrapperStyle = {
    textAlign: align,
  } as CSSProperties

  return (
    <div style={wrapperStyle}>
      {label && (
        <p className="mb-1 font-black uppercase tracking-[0.18em]" style={{ color: textColor, fontSize: size === 'poster' ? '1rem' : '0.78rem' }}>
          {label}
        </p>
      )}
      <div className="leading-none">
        <span className="font-black tabular-nums" style={{ color, fontSize: settings.score }}>
          {score.toFixed(1)}
        </span>
        <span className="ml-1 font-black" style={{ color: textColor, fontSize: settings.suffix }}>
          /10
        </span>
      </div>
      {showBar && <ScoreBar score={score} height={size === 'poster' ? '0.7rem' : '0.5rem'} mutedColor={mutedColor} className="mt-3" />}
    </div>
  )
}
