import ScoreBar from './ScoreBar'

interface CategoryBreakdownProps {
  categories: Record<string, number>
  textColor?: string
  mutedColor?: string
  accentColor?: string
  compact?: boolean
}

export default function CategoryBreakdown({
  categories,
  textColor = '#ffffff',
  mutedColor = 'rgba(255,255,255,0.16)',
  accentColor = '#ffffff',
  compact = false,
}: CategoryBreakdownProps) {
  const entries = Object.entries(categories)

  if (entries.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'grid gap-2' : 'grid gap-3'}>
      {entries.map(([name, score]) => (
        <div key={name}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate font-bold" style={{ color: textColor, fontSize: compact ? '1.45cqw' : '1.8cqw' }}>
              {name}
            </span>
            <span className="font-black tabular-nums" style={{ color: accentColor, fontSize: compact ? '1.55cqw' : '1.9cqw' }}>
              {Number(score).toFixed(1)}
            </span>
          </div>
          <ScoreBar score={Number(score)} height={compact ? '0.42rem' : '0.55rem'} mutedColor={mutedColor} />
        </div>
      ))}
    </div>
  )
}
