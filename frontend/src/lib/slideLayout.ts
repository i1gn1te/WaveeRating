import { CSSProperties } from 'react'

export function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(10, value))
}

export function getSafeText(value: string | null | undefined, maxLength: number) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

export function getTitleSize(title: string | null | undefined, baseSize = '7.2cqw') {
  const numeric = Number.parseFloat(baseSize)
  const unit = baseSize.match(/[a-z%]+$/i)?.[0] || 'cqw'
  const length = String(title || '').length
  const factor = length > 50 ? 0.58 : length > 35 ? 0.68 : length > 20 ? 0.82 : 1
  const minimum = unit === 'cqw' ? Math.min(4.1, numeric * 0.72) : numeric * 0.58

  return `${Math.max(minimum, numeric * factor).toFixed(2)}${unit}`
}

export function getCoverSize(title: string | null | undefined, subtitle?: string | null, layout: 'hero' | 'poster' | 'editorial' | 'small' | 'track' = 'hero') {
  const textLength = `${title || ''} ${subtitle || ''}`.trim().length

  if (layout === 'small') {
    return textLength > 55 ? '18%' : textLength > 35 ? '20%' : '22%'
  }

  if (layout === 'track') {
    return textLength > 55 ? '27%' : textLength > 35 ? '30%' : '34%'
  }

  if (layout === 'editorial') {
    return textLength > 55 ? '34%' : textLength > 35 ? '39%' : '44%'
  }

  if (layout === 'poster') {
    return textLength > 55 ? '56%' : textLength > 35 ? '62%' : '70%'
  }

  return textLength > 55 ? '58%' : textLength > 35 ? '64%' : textLength > 20 ? '70%' : '76%'
}

export function getReviewBodySize(text: string | null | undefined, baseSize = '3.05cqw') {
  const numeric = Number.parseFloat(baseSize)
  const unit = baseSize.match(/[a-z%]+$/i)?.[0] || 'cqw'
  const length = String(text || '').length
  const factor = length > 1300 ? 0.72 : length > 850 ? 0.82 : length > 500 ? 0.92 : 1
  const minimum = unit === 'cqw' ? 2.15 : numeric * 0.72

  return `${Math.max(minimum, numeric * factor).toFixed(2)}${unit}`
}

export function lineClampStyle(lines: number): CSSProperties {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden',
    paddingTop: '0.08em',
    paddingBottom: '0.16em',
  }
}
