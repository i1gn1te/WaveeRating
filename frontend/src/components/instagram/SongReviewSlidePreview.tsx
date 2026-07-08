import { CSSProperties, forwardRef, useEffect, useRef, useState } from 'react'
import { getSpotifyImageProxyUrl } from '../../lib/api'
import { getCoverSize, getReviewBodySize, getSafeText, getTitleSize } from '../../lib/slideLayout'
import { ReviewTheme, SlideTemplateId, SlideTextSettings, SongDraftTrackData } from '../../types/instagramReview'
import { RetroDesktopDecor, RetroScoreBox, RetroWindow, retroPanelStyle } from './RetroDesktopDecor'
import ScoreBadge from './ScoreBadge'
import { EXPORT_SLIDE_HEIGHT, EXPORT_SLIDE_WIDTH } from './SlidePreviews'

interface SongReviewSlidePreviewProps {
  track: SongDraftTrackData
  imageUrl: string | null
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
    paddingTop: '0.08em',
    paddingBottom: '0.16em',
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

function isRetro(templateId?: SlideTemplateId) {
  return templateId === 'retro-desktop'
}

const SongReviewSlidePreview = forwardRef<HTMLDivElement, SongReviewSlidePreviewProps>(function SongReviewSlidePreview(
  { track, imageUrl, style, finalScore, verdict, review, finalNote, moodTags, templateId = 'signature-cover', textSettings },
  ref
) {
  const radius = clampRadius(style.borderRadius)
  const text = withDefaults(textSettings)
  const frameRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)
  const rawImageUrl = imageUrl || null
  const coverUrl = getSpotifyImageProxyUrl(rawImageUrl, `song-${track.id}`) || rawImageUrl
  const currentTrackTitle = trackTitle(track)
  const currentArtistLine = artistLine(track)
  const titleFontSize = getTitleSize(currentTrackTitle, isPoster(templateId) ? '9.2cqw' : titleSize(textSettings))
  const reviewFontSize = getReviewBodySize(review, bodySize(textSettings))
  const coverWidth = getCoverSize(currentTrackTitle, `${currentArtistLine} ${track.albumName || ''}`, isEditorial(templateId) ? 'small' : 'track')

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
    fontFamily: isRetro(templateId) ? 'Tahoma, Verdana, "MS Sans Serif", system-ui, sans-serif' : fontFamily(textSettings),
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  } as CSSProperties
  const decoration = isRetro(templateId)
    ? `linear-gradient(135deg, ${style.coverFrameColor}42 0 12%, transparent 12% 100%), linear-gradient(180deg, ${style.backgroundColor} 0%, #fef3c7 100%)`
    : isPoster(templateId)
      ? `linear-gradient(145deg, ${style.accentColor}28 0%, transparent 46%), radial-gradient(circle at 82% 18%, ${style.coverFrameColor}18 0, transparent 24%)`
      : isEditorial(templateId)
        ? `linear-gradient(180deg, ${style.accentColor}12 0%, transparent 48%)`
        : `radial-gradient(circle at 25% 15%, ${style.accentColor} 0, transparent 30%), radial-gradient(circle at 82% 84%, ${style.coverFrameColor} 0, transparent 22%)`

  if (isRetro(templateId)) {
    return (
      <div ref={frameRef} className="relative w-full overflow-hidden" style={frameStyle}>
        <div className="absolute left-0 top-0" style={scaleStyle} aria-hidden={false}>
          <div
            ref={ref}
            data-export-slide="true"
            data-export-type="song-review"
            data-entity-id={track.id}
            data-image-url={rawImageUrl || ''}
            data-template-id={templateId}
            className="isolate"
            style={canvasStyle}
          >
            <div className="pointer-events-none absolute inset-0" style={{ background: decoration }} />
            <RetroDesktopDecor variant="song" style={style} />

            <div className="relative z-10 flex h-full flex-col justify-between p-[6.4%]">
              <header
                style={{
                  ...retroPanelStyle(style, style.coverFrameColor),
                  borderRadius: 4,
                  padding: '2.4% 3%',
                }}
              >
                <p className="font-black tracking-[0.22em]" style={{ color: style.accentColor, fontSize: '1.9cqw', textTransform: text.uppercaseHeadings ? 'uppercase' : 'none' }}>
                  {text.uppercaseHeadings ? 'SONG REVIEW' : 'Song Review'}
                </p>
                <h3 className="mt-[1.8%] font-black leading-[1.1]" style={{ fontSize: getTitleSize(currentTrackTitle, '5.7cqw'), ...lineClamp(2) }}>
                  {currentTrackTitle}
                </h3>
                <p className="mt-[1.7%] font-bold leading-[1.18] opacity-85" style={{ fontSize: '2.45cqw', ...lineClamp(2) }}>
                  {currentArtistLine}
                </p>
              </header>

              <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[3.8%] pt-[5%]">
                <div className="grid grid-cols-[auto_1fr_auto] items-end gap-[4%]">
                  <div
                    className="shrink-0 p-[2.2%]"
                    style={{
                      width: coverWidth,
                      backgroundColor: style.coverFrameColor,
                      borderRadius: radius,
                      boxShadow: `0 28px ${style.shadowIntensity + 18}px rgba(0,0,0,0.46)`,
                    }}
                  >
                    {coverUrl ? (
                      <img
                        key={`${track.id}-${rawImageUrl || 'no-cover'}`}
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

                  <RetroWindow title="song.info" style={style} contentClassName="px-[4%] py-[3%]">
                    <p className="font-black uppercase tracking-[0.18em]" style={{ color: style.accentColor, fontSize: '1.85cqw' }}>
                      Song
                    </p>
                    <p className="mt-[2.4%] font-black uppercase leading-[1.14] tracking-[0.12em]" style={{ fontSize: '2.55cqw' }}>
                      Review
                    </p>
                  </RetroWindow>

                  <RetroScoreBox score={finalScore} style={style} compact />
                </div>

                <RetroWindow title="review.txt" style={style} className="min-h-0" contentClassName="h-full min-h-0 px-[5%] py-[4.5%]">
                  <p className="font-bold leading-[1.2]" style={{ fontSize: reviewFontSize, ...lineClamp(10) }}>
                    {review || 'Write a clear song review here. Keep it sharp, visual, and ready for a shareable review slide.'}
                  </p>
                </RetroWindow>

                <RetroWindow title="recommendation.sys" style={style} contentClassName="px-[4%] py-[3%]">
                  {moodTags && (
                    <p className="mb-[1.2%] font-black uppercase tracking-[0.18em]" style={{ color: style.accentColor, fontSize: '1.55cqw', ...lineClamp(1) }}>
                      {moodTags}
                    </p>
                  )}
                  <p className="font-black leading-[1.16]" style={{ fontSize: '2.45cqw', ...lineClamp(3) }}>
                    {finalNote || 'Final note or recommendation goes here.'}
                  </p>
                </RetroWindow>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={frameRef} className="relative w-full overflow-hidden" style={frameStyle}>
      <div className="absolute left-0 top-0" style={scaleStyle} aria-hidden={false}>
        <div
          ref={ref}
          data-export-slide="true"
          data-export-type="song-review"
          data-entity-id={track.id}
          data-image-url={rawImageUrl || ''}
          className="isolate"
          style={canvasStyle}
        >
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
              <h3 className="mt-[1.8%] font-black leading-[1.1]" style={{ fontSize: titleFontSize, ...lineClamp(2) }}>
                {currentTrackTitle}
              </h3>
              <p className="mt-[2%] font-semibold leading-[1.18] opacity-82" style={{ fontSize: '2.65cqw', ...lineClamp(2) }}>
                {currentArtistLine}
              </p>
            </header>

            <section className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-[4.5%] pt-[6%]">
              <div className="flex items-end justify-between gap-[5%]">
                <div
                  className="shrink-0 p-[2.2%]"
                  style={{
                    width: coverWidth,
                    backgroundColor: style.coverFrameColor,
                    borderRadius: radius,
                    boxShadow: `0 28px ${style.shadowIntensity + 18}px rgba(0,0,0,0.46)`,
                  }}
                >
                  {coverUrl ? (
                    <img
                      key={`${track.id}-${rawImageUrl || 'no-cover'}`}
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
                  <p className="font-black tracking-[0.18em] opacity-70" style={{ fontSize: '1.9cqw', textTransform: text.uppercaseHeadings ? 'uppercase' : 'none', ...lineClamp(2) }}>
                    {getSafeText(track.albumName || 'Single', 70)}
                  </p>
                  <p className="mt-[2%] font-black leading-[1.12]" style={{ fontSize: getTitleSize(verdict || 'Short verdict', isPoster(templateId) ? '5.6cqw' : '4.7cqw'), ...lineClamp(2) }}>
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
                <p className="font-medium leading-[1.23] opacity-90" style={{ fontSize: reviewFontSize, ...lineClamp(10) }}>
                  {review || 'Write a clear song review here. Keep it sharp, visual, and ready for a shareable review slide.'}
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
