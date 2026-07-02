import { CSSProperties, forwardRef, useEffect, useRef, useState } from 'react'
import { getSpotifyImageProxyUrl } from '../../lib/api'
import { ReviewTheme, SlideTemplateId, SlideTextSettings, SongDraftTrackData } from '../../types/instagramReview'
import ScoreBadge from './ScoreBadge'
import { EXPORT_SLIDE_HEIGHT, EXPORT_SLIDE_WIDTH } from './SlidePreviews'

interface SongReviewSlidePreviewProps {
  track: SongDraftTrackData
  style: ReviewTheme
  finalScore: number
  verdict: string
  review: string
  finalNote: string
  moodTags?: string
  templateId?: SlideTemplateId
  textSettings?: SlideTextSettings
}

const DEFAULT_TEXT_SETTINGS: SlideTextSettings = {
  titleSize: 'medium',
  bodySize: 'medium',
  uppercaseHeadings: true,
  fontMood: 'bold',
}

function clampRadius(value: number) {
  return Math.max(0, Math.min(64, value))
}

function lineClamp(lines: number) {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: lines,
    overflow: 'hidden',
  }
}

function artistLine(track: SongDraftTrackData) {
  return track.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'
}

function trackTitle(track: SongDraftTrackData) {
  return track.title || track.name || 'Untitled song'
}

function withDefaults(textSettings?: SlideTextSettings) {
  return textSettings || DEFAULT_TEXT_SETTINGS
}

function fontFamily(textSettings?: SlideTextSettings) {
  const mood = withDefaults(textSettings).fontMood
  if (mood === 'editorial') return 'Georgia, Cambria, "Times New Roman", serif'
  if (mood === 'bold') return 'Inter, ui-sans-serif, system-ui, Arial Black, sans-serif'
  return 'Inter, ui-sans-serif, system-ui, sans-serif'
}

function titleSize(textSettings?: SlideTextSettings) {
  const size = withDefaults(textSettings).titleSize
  if (size === 'small') return '6.1cqw'
  if (size === 'large') return '8.4cqw'
  return '7.2cqw'
}

function bodySize(textSettings?: SlideTextSettings) {
  const size = withDefaults(textSettings).bodySize
  if (size === 'small') return '2.65cqw'
  if (size === 'large') return '3.45cqw'
  return '3.05cqw'
}

function isEditorial(templateId?: SlideTemplateId) {
  return templateId === 'editorial-review' || templateId === 'minimal-card' || templateId === 'magazine-layout'
}

function isPoster(templateId?: SlideTemplateId) {
  return templateId === 'poster-score'
}

const SongReviewSlidePreview = forwardRef<HTMLDivElement, SongReviewSlidePreviewProps>(function SongReviewSlidePreview(
  { track, style, finalScore, verdict, review, finalNote, moodTags, templateId = 'classic-cover', textSettings },
  ref
) {
  const radius = clampRadius(style.borderRadius)
  const text = withDefaults(textSettings)
  const frameRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const coverUrl = getSpotifyImageProxyUrl(track.imageUrl)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) {
      return
    }

    const updateScale = () => {
      setPreviewScale(Math.min(1, frame.clientWidth / EXPORT_SLIDE_WIDTH))
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  const frameStyle = {
    aspectRatio: `${EXPORT_SLIDE_WIDTH} / ${EXPORT_SLIDE_HEIGHT}`,
  } as CSSProperties
  const scaleStyle = {
    width: `${EXPORT_SLIDE_WIDTH}px`,
    height: `${EXPORT_SLIDE_HEIGHT}px`,
    transform: `scale(${previewScale})`,
    transformOrigin: 'top left',
  } as CSSProperties
  const canvasStyle = {
    '--slide-bg': style.backgroundColor,
    '--slide-card': style.cardColor,
    '--slide-text': style.textColor,
    '--slide-accent': style.accentColor,
    '--slide-cover-frame': style.coverFrameColor,
    '--slide-shadow': String(style.shadowIntensity),
    '--slide-radius': `${radius}px`,
    width: `${EXPORT_SLIDE_WIDTH}px`,
    height: `${EXPORT_SLIDE_HEIGHT}px`,
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    borderRadius: radius,
    containerType: 'inline-size',
    fontFamily: fontFamily(textSettings),
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  } as CSSProperties
  const decoration = isPoster(templateId)
    ? `linear-gradient(145deg, ${style.accentColor}28 0%, transparent 46%), radial-gradient(circle at 82% 18%, ${style.coverFrameColor}18 0, transparent 24%)`
    : isEditorial(templateId)
      ? `linear-gradient(180deg, ${style.accentColor}12 0%, transparent 48%)`
      : `radial-gradient(circle at 25% 15%, ${style.accentColor} 0, transparent 30%), radial-gradient(circle at 82% 84%, ${style.coverFrameColor} 0, transparent 22%)`

  return (
    <div ref={frameRef} className="relative w-full overflow-hidden" style={frameStyle}>
      <div className="absolute left-0 top-0" style={scaleStyle} aria-hidden={false}>
        <div ref={ref} data-export-slide="true" className="isolate" style={canvasStyle}>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: decoration, opacity: isEditorial(templateId) ? 0.32 : 0.2 }}
          />

          <div className="relative flex h-full flex-col justify-between p-[6.4%]">
            <header>
              <p
                className="font-black tracking-[0.22em]"
                style={{ color: style.accentColor, fontSize: '2.2cqw', textTransform: text.uppercaseHeadings ? 'uppercase' : 'none' }}
              >
                {text.uppercaseHeadings ? 'SONG REVIEW' : 'Song Review'}
              </p>
              <h3 className="mt-[1.8%] max-h-[2.2em] font-black leading-[0.94]" style={{ fontSize: isPoster(templateId) ? '9.2cqw' : titleSize(textSettings), ...lineClamp(2) }}>
                {trackTitle(track)}
              </h3>
              <p className="mt-[2%] max-h-[1.4em] font-semibold opacity-82" style={{ fontSize: '2.8cqw', ...lineClamp(1) }}>
                {artistLine(track)}
              </p>
            </header>

            <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4.5%] pt-[6%]">
              <div className="flex items-end justify-between gap-[5%]">
                <div
                  className={`${isEditorial(templateId) ? 'w-[26%]' : 'w-[34%]'} shrink-0 p-[2.2%]`}
                  style={{
                    backgroundColor: style.coverFrameColor,
                    borderRadius: radius,
                    boxShadow: `0 28px ${style.shadowIntensity + 18}px rgba(0,0,0,0.46)`,
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="aspect-square w-full object-cover"
                      style={{ borderRadius: Math.max(4, radius - 14) }}
                    />
                  ) : (
                    <div className="aspect-square w-full bg-gray-800" style={{ borderRadius: Math.max(4, radius - 14) }} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-black tracking-[0.18em] opacity-70" style={{ fontSize: '1.9cqw', textTransform: text.uppercaseHeadings ? 'uppercase' : 'none' }}>
                    {track.albumName || 'Single'}
                  </p>
                  <p className="mt-[2%] font-black leading-[0.98]" style={{ fontSize: isPoster(templateId) ? '5.6cqw' : '4.7cqw', ...lineClamp(2) }}>
                    {verdict || 'Short verdict'}
                  </p>
                </div>

                <div className={isPoster(templateId) ? 'w-[28%]' : 'w-[22%]'}>
                  <ScoreBadge score={finalScore} size={isPoster(templateId) ? 'poster' : 'lg'} textColor={`${style.textColor}b8`} mutedColor={`${style.textColor}24`} />
                </div>
              </div>

              <div
                className="min-h-0 p-[5.2%]"
                style={{
                  backgroundColor: style.cardColor,
                  borderRadius: radius,
                  boxShadow: `0 22px ${style.shadowIntensity + 12}px rgba(0,0,0,0.3)`,
                }}
              >
                <p className="font-medium leading-[1.23] opacity-90" style={{ fontSize: bodySize(textSettings), ...lineClamp(10) }}>
                  {review || 'Write a clear song review here. Keep it sharp, visual, and ready for an Instagram carousel.'}
                </p>
              </div>

              <div
                className="p-[4.2%]"
                style={{
                  backgroundColor: style.cardColor,
                  borderRadius: radius,
                  border: `2px solid ${style.accentColor}55`,
                }}
              >
                {moodTags && (
                  <p className="mb-[1.4%] font-black uppercase tracking-[0.18em]" style={{ color: style.accentColor, fontSize: '1.75cqw' }}>
                    {moodTags}
                  </p>
                )}
                <p className="font-bold italic leading-[1.18] opacity-86" style={{ fontSize: '2.7cqw', ...lineClamp(3) }}>
                  {finalNote || 'Final note or recommendation goes here.'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
})

export default SongReviewSlidePreview
