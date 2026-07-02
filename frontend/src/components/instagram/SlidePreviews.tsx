import { CSSProperties, ForwardedRef, forwardRef, ReactNode, useEffect, useRef, useState } from 'react'
import { getSpotifyImageProxyUrl } from '../../lib/api'
import { ReviewTheme, SlideTemplateId, SlideTextSettings, TrackRating } from '../../types/instagramReview'
import CategoryBreakdown from './CategoryBreakdown'
import ScoreBadge from './ScoreBadge'
import ScoreBar from './ScoreBar'

export const EXPORT_SLIDE_WIDTH = 1080
export const EXPORT_SLIDE_HEIGHT = 1350

export interface ReviewAlbum {
  id: string
  name: string
  title?: string
  artists: Array<{ id?: string; name: string }>
  releaseYear?: string
  releaseDate?: string
  imageUrl?: string | null
  totalTracks?: number
}

export interface ReviewTrack {
  id: string
  trackNumber?: number
  name: string
  title?: string
  durationMs?: number
  artists?: Array<{ id?: string; name: string }>
}

export type SlideStyle = ReviewTheme

export const DEFAULT_TEXT_SETTINGS: SlideTextSettings = {
  titleSize: 'medium',
  bodySize: 'medium',
  uppercaseHeadings: true,
  fontMood: 'bold',
}

interface SlideProps {
  album: ReviewAlbum
  style: SlideStyle
  templateId?: SlideTemplateId
  textSettings?: SlideTextSettings
}

interface ReviewSlideProps extends SlideProps {
  finalScore: number
  verdict: string
  review: string
  recommendation: string
  categoryRatings?: Record<string, number>
}

interface TrackSlideProps extends SlideProps {
  label?: string
  track?: ReviewTrack
  score: number
  text: string
}

interface TrackRatingsSummarySlideProps extends SlideProps {
  finalScore: number
  trackRatings: TrackRating[]
}

function artistLine(album: ReviewAlbum) {
  return album.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'
}

function trackTitle(track?: ReviewTrack | TrackRating) {
  return track?.title || track?.name || 'Select a track'
}

function releaseYear(album: ReviewAlbum) {
  return album.releaseYear || album.releaseDate?.slice(0, 4) || ''
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

function withDefaults(textSettings?: SlideTextSettings) {
  return textSettings || DEFAULT_TEXT_SETTINGS
}

function fontFamily(textSettings?: SlideTextSettings) {
  const mood = withDefaults(textSettings).fontMood

  if (mood === 'editorial') {
    return 'Georgia, Cambria, "Times New Roman", serif'
  }

  if (mood === 'bold') {
    return 'Inter, ui-sans-serif, system-ui, Arial Black, sans-serif'
  }

  return 'Inter, ui-sans-serif, system-ui, sans-serif'
}

function titleSize(textSettings?: SlideTextSettings, base = '6.8cqw') {
  const size = withDefaults(textSettings).titleSize
  if (size === 'small') return '5.6cqw'
  if (size === 'large') return '8.2cqw'
  return base
}

function bodySize(textSettings?: SlideTextSettings, base = '3.05cqw') {
  const size = withDefaults(textSettings).bodySize
  if (size === 'small') return '2.55cqw'
  if (size === 'large') return '3.45cqw'
  return base
}

function heading(text: string, textSettings?: SlideTextSettings) {
  return withDefaults(textSettings).uppercaseHeadings ? text.toUpperCase() : text
}

function isEditorial(templateId?: SlideTemplateId) {
  return templateId === 'editorial-review' || templateId === 'minimal-card' || templateId === 'magazine-layout'
}

function isPoster(templateId?: SlideTemplateId) {
  return templateId === 'poster-score'
}

function SlideShell({
  album,
  style,
  children,
  refValue,
  eyebrow = 'WaveeRating Review',
  templateId = 'classic-cover',
  textSettings,
}: SlideProps & { children: ReactNode; refValue: ForwardedRef<HTMLDivElement>; eyebrow?: string }) {
  const radius = clampRadius(style.borderRadius)
  const text = withDefaults(textSettings)
  const frameRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)

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
    fontFamily: fontFamily(text),
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  } as CSSProperties
  const decoration =
    isPoster(templateId)
      ? `linear-gradient(145deg, ${style.accentColor}26 0%, transparent 42%), radial-gradient(circle at 18% 12%, ${style.coverFrameColor}18 0, transparent 28%)`
      : isEditorial(templateId)
        ? `linear-gradient(180deg, ${style.accentColor}12 0%, transparent 45%)`
        : `radial-gradient(circle at 25% 15%, ${style.accentColor} 0, transparent 30%), radial-gradient(circle at 80% 85%, ${style.coverFrameColor} 0, transparent 24%)`

  return (
    <div ref={frameRef} className="relative w-full overflow-hidden" style={frameStyle}>
      <div className="absolute left-0 top-0" style={scaleStyle} aria-hidden={false}>
        <div ref={refValue} data-export-slide="true" className="isolate bg-gray-950" style={canvasStyle}>
          <div className="pointer-events-none absolute inset-0" style={{ background: decoration, opacity: isEditorial(templateId) ? 0.32 : 0.2 }} />
          <div className="relative flex h-full flex-col justify-between p-[6.4%]">
            <header className="min-h-0">
              <p
                className="font-black tracking-[0.22em]"
                style={{
                  color: style.accentColor,
                  fontSize: isPoster(templateId) ? '2.5cqw' : '2.25cqw',
                  textTransform: text.uppercaseHeadings ? 'uppercase' : 'none',
                }}
              >
                {heading(eyebrow, text)}
              </p>
              <h3 className="mt-[1.8%] max-h-[2.25em] font-black leading-[0.96]" style={{ fontSize: titleSize(text), ...lineClamp(2) }}>
                {album.title || album.name}
              </h3>
              <p className="mt-[2%] max-h-[1.4em] font-semibold opacity-80" style={{ fontSize: '2.8cqw', ...lineClamp(1) }}>
                {artistLine(album)}
              </p>
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function CoverImage({
  album,
  style,
  size = 'large',
}: SlideProps & { size?: 'large' | 'small' | 'track' | 'editorial' }) {
  const radius = clampRadius(style.borderRadius)
  const proxiedCover = getSpotifyImageProxyUrl(album.imageUrl)
  const width = size === 'large' ? '78%' : size === 'track' ? '34%' : size === 'editorial' ? '44%' : '22%'

  return (
    <div
      className="shrink-0 p-[2.2%]"
      style={{
        width,
        backgroundColor: style.coverFrameColor,
        borderRadius: radius,
        boxShadow: `0 ${size === 'large' ? 34 : 22}px ${style.shadowIntensity + 20}px rgba(0,0,0,0.48)`,
      }}
    >
      {proxiedCover ? (
        <img
          src={proxiedCover}
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
  )
}

export const CoverSlidePreview = forwardRef<HTMLDivElement, SlideProps>(function CoverSlidePreview(
  { album, style, templateId = 'classic-cover', textSettings },
  ref
) {
  if (isEditorial(templateId)) {
    return (
      <SlideShell album={album} style={style} refValue={ref} eyebrow="Instagram Review" templateId={templateId} textSettings={textSettings}>
        <section className="flex flex-1 items-center gap-[6%] py-[4%]">
          <CoverImage album={album} style={style} size="editorial" />
          <div className="min-w-0 flex-1">
            <p className="font-black leading-[0.98]" style={{ fontSize: titleSize(textSettings, '7.4cqw'), ...lineClamp(3) }}>
              {album.title || album.name}
            </p>
            <p className="mt-[4%] font-semibold opacity-75" style={{ fontSize: '3.2cqw', ...lineClamp(2) }}>
              {artistLine(album)}
            </p>
            {releaseYear(album) && (
              <p className="mt-[5%] font-black tracking-[0.16em]" style={{ color: style.accentColor, fontSize: '2.1cqw' }}>
                {releaseYear(album)}
              </p>
            )}
          </div>
        </section>
      </SlideShell>
    )
  }

  if (isPoster(templateId)) {
    return (
      <SlideShell album={album} style={style} refValue={ref} eyebrow="Instagram Review" templateId={templateId} textSettings={textSettings}>
        <section className="flex flex-1 flex-col justify-end gap-[5%] py-[3%]">
          <CoverImage album={album} style={style} size="large" />
          <div>
            <p className="font-black uppercase leading-[0.86]" style={{ fontSize: '10.2cqw', ...lineClamp(3) }}>
              {album.title || album.name}
            </p>
            <p className="mt-[3%] font-black tracking-[0.16em]" style={{ color: style.accentColor, fontSize: '3cqw', ...lineClamp(1) }}>
              {artistLine(album)}
            </p>
          </div>
        </section>
      </SlideShell>
    )
  }

  return (
    <SlideShell album={album} style={style} refValue={ref} eyebrow="Instagram Review" templateId={templateId} textSettings={textSettings}>
      <section className="flex flex-1 flex-col items-center justify-center gap-[7%] py-[3%] text-center">
        <CoverImage album={album} style={style} />
        <div className="w-full">
          <p className="font-black leading-[0.95]" style={{ fontSize: titleSize(textSettings, '8.2cqw'), ...lineClamp(2) }}>
            {album.title || album.name}
          </p>
          <p className="mt-[3%] font-bold opacity-82" style={{ fontSize: '3.7cqw', ...lineClamp(1) }}>
            {artistLine(album)}
          </p>
          {releaseYear(album) && (
            <p className="mt-[2%] font-black uppercase tracking-[0.26em]" style={{ color: style.accentColor, fontSize: '2.25cqw' }}>
              {releaseYear(album)}
            </p>
          )}
        </div>
      </section>
    </SlideShell>
  )
})

export const AlbumReviewSlidePreview = forwardRef<HTMLDivElement, ReviewSlideProps>(function AlbumReviewSlidePreview(
  { album, style, finalScore, verdict, review, recommendation, categoryRatings, templateId = 'classic-cover', textSettings },
  ref
) {
  const radius = clampRadius(style.borderRadius)

  if (isPoster(templateId)) {
    return (
      <SlideShell album={album} style={style} refValue={ref} eyebrow="Album Review" templateId={templateId} textSettings={textSettings}>
        <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4%] pt-[4%]">
          <div className="grid grid-cols-[1fr_auto] items-end gap-[5%]">
            <h4 className="font-black uppercase leading-[0.86]" style={{ fontSize: '8.8cqw', ...lineClamp(3) }}>
              {verdict || 'Album verdict'}
            </h4>
            <ScoreBadge score={finalScore} size="poster" textColor={`${style.textColor}bb`} mutedColor={`${style.textColor}24`} />
          </div>
          <div
            className="min-h-0 border p-[5.2%]"
            style={{ borderColor: `${style.accentColor}88`, borderRadius: radius, backgroundColor: `${style.cardColor}dd` }}
          >
            <p className="font-semibold leading-[1.16] opacity-90" style={{ fontSize: bodySize(textSettings, '3.15cqw'), ...lineClamp(11) }}>
              {review || 'Write a clear album review here. Keep it sharp, visual, and ready for an Instagram carousel.'}
            </p>
          </div>
          <p className="font-bold italic leading-[1.15] opacity-85" style={{ fontSize: '2.75cqw', ...lineClamp(3) }}>
            {recommendation || 'Final recommendation goes here.'}
          </p>
        </section>
      </SlideShell>
    )
  }

  if (isEditorial(templateId)) {
    return (
      <SlideShell album={album} style={style} refValue={ref} eyebrow="Album Review" templateId={templateId} textSettings={textSettings}>
        <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4%] pt-[5%]">
          <div className="flex items-end gap-[5%]">
            <CoverImage album={album} style={style} size="small" />
            <div className="min-w-0 flex-1">
              <p className="font-black leading-[1.02]" style={{ fontSize: titleSize(textSettings, '5.8cqw'), ...lineClamp(2) }}>
                {verdict || 'Album verdict'}
              </p>
            </div>
            <ScoreBadge score={finalScore} size="md" textColor={`${style.textColor}b8`} mutedColor={`${style.textColor}22`} />
          </div>
          <div className="min-h-0 p-[5.2%]" style={{ backgroundColor: style.cardColor, borderRadius: radius }}>
            <p className="font-medium leading-[1.28] opacity-90" style={{ fontSize: bodySize(textSettings, '3.15cqw'), ...lineClamp(9) }}>
              {review || 'Write a clear album review here. Keep it sharp, visual, and ready for an Instagram carousel.'}
            </p>
          </div>
          {categoryRatings ? (
            <CategoryBreakdown categories={categoryRatings} textColor={style.textColor} accentColor={style.accentColor} mutedColor={`${style.textColor}22`} compact />
          ) : (
            <p className="font-bold italic leading-[1.18] opacity-85" style={{ fontSize: '2.7cqw', ...lineClamp(3) }}>
              {recommendation || 'Final recommendation goes here.'}
            </p>
          )}
        </section>
      </SlideShell>
    )
  }

  return (
    <SlideShell album={album} style={style} refValue={ref} templateId={templateId} textSettings={textSettings}>
      <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4.5%] pt-[5%]">
        <div className="flex items-end gap-[4%]">
          <CoverImage album={album} style={style} size="small" />
          <div className="min-w-0 flex-1">
            <p className="font-black uppercase tracking-[0.18em] opacity-70" style={{ fontSize: '2cqw' }}>
              {heading('Album Review', textSettings)}
            </p>
            <p className="mt-[1%] font-black leading-[0.96]" style={{ fontSize: titleSize(textSettings, '5cqw'), ...lineClamp(2) }}>
              {verdict || 'Album verdict'}
            </p>
          </div>
          <ScoreBadge score={finalScore} size="lg" textColor={`${style.textColor}b8`} mutedColor={`${style.textColor}24`} />
        </div>

        <div
          className="min-h-0 p-[5.2%]"
          style={{
            backgroundColor: style.cardColor,
            borderRadius: radius,
            boxShadow: `0 22px ${style.shadowIntensity + 12}px rgba(0,0,0,0.3)`,
          }}
        >
          <p className="font-medium leading-[1.24] opacity-90" style={{ fontSize: bodySize(textSettings), ...lineClamp(10) }}>
            {review || 'Write a clear album review here. Keep it sharp, visual, and ready for an Instagram carousel.'}
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
          <p className="font-black uppercase tracking-[0.18em]" style={{ color: style.accentColor, fontSize: '1.95cqw' }}>
            {heading('Recommendation', textSettings)}
          </p>
          <p className="mt-[1.6%] font-bold italic leading-[1.18] opacity-85" style={{ fontSize: '2.7cqw', ...lineClamp(3) }}>
            {recommendation || 'Final recommendation goes here.'}
          </p>
        </div>
      </section>
    </SlideShell>
  )
})

export const TrackRatingsSummarySlidePreview = forwardRef<HTMLDivElement, TrackRatingsSummarySlideProps>(function TrackRatingsSummarySlidePreview(
  { album, style, finalScore, trackRatings, templateId = 'compact-summary', textSettings },
  ref
) {
  const radius = clampRadius(style.borderRadius)
  const visibleTracks = trackRatings.slice(0, 18)
  const hiddenCount = Math.max(0, trackRatings.length - visibleTracks.length)
  const useTwoColumns = visibleTracks.length > 9

  return (
    <SlideShell album={album} style={style} refValue={ref} eyebrow="Track Ratings" templateId={templateId} textSettings={textSettings}>
      <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4%] pt-[5%]">
        <div className="flex items-end justify-between gap-[5%]">
          <div className="min-w-0 flex-1">
            <p className="font-black tracking-[0.18em]" style={{ color: style.accentColor, fontSize: '2cqw' }}>
              {heading('Track Ratings Summary', textSettings)}
            </p>
            <p className="mt-[2%] font-black leading-[0.96]" style={{ fontSize: titleSize(textSettings, '5.5cqw'), ...lineClamp(2) }}>
              {album.title || album.name}
            </p>
          </div>
          <ScoreBadge score={finalScore} size={isPoster(templateId) ? 'lg' : 'md'} textColor={`${style.textColor}b8`} mutedColor={`${style.textColor}24`} />
        </div>

        <div
          className={`min-h-0 grid gap-[2.2%] p-[4.2%] ${useTwoColumns ? 'grid-cols-2' : 'grid-cols-1'}`}
          style={{
            backgroundColor: style.cardColor,
            borderRadius: radius,
            boxShadow: `0 22px ${style.shadowIntensity + 10}px rgba(0,0,0,0.28)`,
          }}
        >
          {visibleTracks.map((track) => (
            <div key={track.spotifyTrackId} className="min-w-0">
              <div className="mb-[1%] flex items-center justify-between gap-[3%]">
                <p className="min-w-0 truncate font-bold" style={{ fontSize: useTwoColumns ? '1.75cqw' : '2.15cqw' }}>
                  {track.trackNumber ? `${track.trackNumber}. ` : ''}
                  {trackTitle(track)}
                </p>
                <p className="font-black tabular-nums" style={{ color: style.accentColor, fontSize: useTwoColumns ? '1.8cqw' : '2.2cqw' }}>
                  {track.finalScore.toFixed(1)}
                </p>
              </div>
              <ScoreBar score={track.finalScore} height={useTwoColumns ? '0.42rem' : '0.55rem'} mutedColor={`${style.textColor}22`} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-[4%]">
          <p className="font-semibold opacity-72" style={{ fontSize: '2.2cqw' }}>
            {trackRatings.length} track{trackRatings.length === 1 ? '' : 's'} rated
          </p>
          {hiddenCount > 0 && (
            <p className="font-black" style={{ color: style.accentColor, fontSize: '2.2cqw' }}>
              + {hiddenCount} more tracks
            </p>
          )}
        </div>
      </section>
    </SlideShell>
  )
})

export const BestTrackSlidePreview = forwardRef<HTMLDivElement, TrackSlideProps>(function BestTrackSlidePreview(
  { album, style, track, score, text, templateId = 'classic-cover', textSettings },
  ref
) {
  return (
    <TrackSlidePreview
      album={album}
      style={style}
      track={track}
      score={score}
      text={text}
      label="BEST TRACK"
      refValue={ref}
      templateId={templateId}
      textSettings={textSettings}
    />
  )
})

export const WorstTrackSlidePreview = forwardRef<HTMLDivElement, TrackSlideProps>(function WorstTrackSlidePreview(
  { album, style, track, score, text, templateId = 'classic-cover', textSettings },
  ref
) {
  return (
    <TrackSlidePreview
      album={album}
      style={style}
      track={track}
      score={score}
      text={text}
      label="WEAKEST TRACK"
      refValue={ref}
      templateId={templateId}
      textSettings={textSettings}
    />
  )
})

function TrackSlidePreview({
  album,
  style,
  track,
  score,
  text,
  label,
  refValue,
  templateId = 'classic-cover',
  textSettings,
}: TrackSlideProps & { label: string; refValue: ForwardedRef<HTMLDivElement> }) {
  const radius = clampRadius(style.borderRadius)

  return (
    <SlideShell album={album} style={style} refValue={refValue} eyebrow={label} templateId={templateId} textSettings={textSettings}>
      <section className="flex min-h-0 flex-1 flex-col justify-end gap-[5%] pt-[5%]">
        <div className="flex items-end justify-between gap-[4%]">
          <CoverImage album={album} style={style} size={isEditorial(templateId) ? 'small' : 'track'} />
          <ScoreBadge score={score} size={isPoster(templateId) ? 'poster' : 'lg'} textColor={`${style.textColor}b8`} mutedColor={`${style.textColor}24`} />
        </div>

        <div
          className="p-[5.3%]"
          style={{
            backgroundColor: style.cardColor,
            borderRadius: radius,
            boxShadow: `0 24px ${style.shadowIntensity + 16}px rgba(0,0,0,0.34)`,
          }}
        >
          <p className="font-black tracking-[0.2em]" style={{ color: style.accentColor, fontSize: '2.2cqw', textTransform: withDefaults(textSettings).uppercaseHeadings ? 'uppercase' : 'none' }}>
            {heading(label, textSettings)}
          </p>
          <h4 className="mt-[3%] font-black leading-[0.92]" style={{ fontSize: titleSize(textSettings, '8.5cqw'), ...lineClamp(2) }}>
            {trackTitle(track)}
          </h4>
          <p className="mt-[5%] font-medium leading-[1.2] opacity-88" style={{ fontSize: bodySize(textSettings, '3cqw'), ...lineClamp(6) }}>
            {text || 'Short track review goes here.'}
          </p>
        </div>
      </section>
    </SlideShell>
  )
}
