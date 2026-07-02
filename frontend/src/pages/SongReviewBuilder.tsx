import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Loader2, ListChecks, Music2 } from 'lucide-react'
import { getPublicTrack } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { saveSongReview } from '../lib/instagramReviewsApi'
import RatingSlider, { clampRatingScore, scoreColor } from '../components/instagram/RatingSlider'
import ReviewSaveActions from '../components/instagram/ReviewSaveActions'
import CarouselZipExportButton from '../components/instagram/CarouselZipExportButton'
import SongExportButton from '../components/instagram/SongExportButton'
import SongReviewSlidePreview from '../components/instagram/SongReviewSlidePreview'
import ThemePresetPicker from '../components/instagram/ThemePresetPicker'
import CarouselTemplatePicker from '../components/instagram/CarouselTemplatePicker'
import CarouselSlidesPanel from '../components/instagram/CarouselSlidesPanel'
import TextSettingsControls from '../components/instagram/TextSettingsControls'
import {
  CarouselSlideConfig,
  CarouselStylePreset,
  ReviewVisibility,
  ReviewTheme,
  SlideTemplateId,
  SlideTextSettings,
  SONG_RATING_CATEGORIES,
  SongCategoryRatings,
  SongDraftTrackData,
  SongReviewDraft,
} from '../types/instagramReview'

type SongCarouselSlideId = 'song-review'

const DEFAULT_SONG_SLIDES: CarouselSlideConfig<SongCarouselSlideId>[] = [
  { id: 'song-review', label: 'Song Review Slide', filenameSlug: 'song-review', enabled: true },
]

const DEFAULT_TEXT_SETTINGS: SlideTextSettings = {
  titleSize: 'medium',
  bodySize: 'medium',
  uppercaseHeadings: true,
  fontMood: 'bold',
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function createCategoryRatings<T extends readonly string[]>(categories: T, value = 7) {
  return Object.fromEntries(categories.map((name) => [name, value])) as Record<T[number], number>
}

function formatDuration(durationMs?: number) {
  if (!durationMs) {
    return '--:--'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function artistLine(track?: SongDraftTrackData) {
  return track?.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'
}

function trackTitle(track?: SongDraftTrackData) {
  return track?.title || track?.name || 'Untitled song'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function calculateSongScore({
  quickRating,
  useDetailedRating,
  categoryRatings,
  overrideScoreEnabled,
  overrideScore,
}: {
  quickRating: number
  useDetailedRating: boolean
  categoryRatings: SongCategoryRatings
  overrideScoreEnabled: boolean
  overrideScore: number
}) {
  if (overrideScoreEnabled) {
    return clampRatingScore(overrideScore)
  }

  if (useDetailedRating) {
    return clampRatingScore(average(SONG_RATING_CATEGORIES.map((name) => categoryRatings[name] ?? 7)))
  }

  return clampRatingScore(quickRating)
}

function ScoreNumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const color = scoreColor(value)
  const handleInput = (rawValue: string) => onChange(clampRatingScore(Number(rawValue)))

  return (
    <label className="block rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-2xl font-black" style={{ color }}>
          {value.toFixed(1)}/10
        </span>
      </div>
      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={value.toFixed(1)}
        onInput={(event) => handleInput(event.currentTarget.value)}
        onChange={(event) => handleInput(event.currentTarget.value)}
        className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-lg font-bold text-white outline-none transition focus:border-cyan-300"
      />
    </label>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const handleInput = (rawValue: string) => onChange(rawValue)

  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        onInput={(event) => handleInput(event.currentTarget.value)}
        onChange={(event) => handleInput(event.currentTarget.value)}
        className="h-9 w-12 rounded border-0 bg-transparent"
      />
    </label>
  )
}

export default function SongReviewBuilder() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const trackId = id || ''
  const songSlideRef = useRef<HTMLDivElement>(null)

  const trackQuery = useQuery<SongDraftTrackData>({
    queryKey: ['instagram-song', trackId],
    queryFn: () => getPublicTrack(trackId).then((res) => res.data),
    enabled: !!trackId,
  })

  const track = trackQuery.data
  const [quickRating, setQuickRating] = useState(7)
  const [useDetailedRating, setUseDetailedRating] = useState(false)
  const [categoryRatings, setCategoryRatings] = useState<SongCategoryRatings>(
    createCategoryRatings(SONG_RATING_CATEGORIES) as SongCategoryRatings
  )
  const [overrideScoreEnabled, setOverrideScoreEnabled] = useState(false)
  const [overrideScore, setOverrideScore] = useState(7)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [finalNote, setFinalNote] = useState('')
  const [moodTags, setMoodTags] = useState('')
  const [visibility, setVisibility] = useState<ReviewVisibility>('public')
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [carouselPresetId, setCarouselPresetId] = useState('classic-purple')
  const [templateId, setTemplateId] = useState<SlideTemplateId>('classic-cover')
  const [textSettings, setTextSettings] = useState<SlideTextSettings>(DEFAULT_TEXT_SETTINGS)
  const [songSlides, setSongSlides] = useState<CarouselSlideConfig<SongCarouselSlideId>[]>(DEFAULT_SONG_SLIDES)
  const [slideStyle, setSlideStyle] = useState<ReviewTheme>({
    backgroundColor: '#083344',
    cardColor: '#10232f',
    textColor: '#ffffff',
    accentColor: '#67e8f9',
    coverFrameColor: '#ffffff',
    shadowIntensity: 34,
    borderRadius: 28,
  })

  const categoryAverage = useMemo(
    () => average(SONG_RATING_CATEGORIES.map((name) => categoryRatings[name] ?? 7)),
    [categoryRatings]
  )
  const finalScore = calculateSongScore({
    quickRating,
    useDetailedRating,
    categoryRatings,
    overrideScoreEnabled,
    overrideScore,
  })

  const songReviewDraft = useMemo<SongReviewDraft | null>(() => {
    if (!track) {
      return null
    }

    return {
      spotifyTrackId: track.id,
      title: track.title || track.name,
      artists: track.artists,
      albumId: track.albumId,
      albumName: track.albumName,
      imageUrl: track.imageUrl,
      durationMs: track.durationMs,
      quickRating,
      useDetailedRating,
      categoryRatings,
      overrideScoreEnabled,
      overrideScore,
      finalScore,
      reviewTitle,
      reviewBody,
      finalNote,
      moodTags,
      theme: slideStyle,
      visibility,
      templateId,
      textSettings,
      slideOrder: songSlides,
    }
  }, [
    categoryRatings,
    finalNote,
    finalScore,
    moodTags,
    overrideScore,
    overrideScoreEnabled,
    quickRating,
    reviewBody,
    reviewTitle,
    slideStyle,
    songSlides,
    templateId,
    textSettings,
    track,
    useDetailedRating,
    visibility,
  ])

  const updateStyle = (key: keyof ReviewTheme, value: string | number) => {
    setSlideStyle((current) => ({ ...current, [key]: value }))
  }

  const toggleSongSlide = (slideId: SongCarouselSlideId) => {
    setSongSlides((current) => {
      const enabledCount = current.filter((slide) => slide.enabled).length

      return current.map((slide) => {
        if (slide.id !== slideId) {
          return slide
        }

        if (slide.enabled && enabledCount <= 1) {
          return slide
        }

        return { ...slide, enabled: !slide.enabled }
      })
    })
  }

  const moveSongSlide = (slideId: SongCarouselSlideId, direction: -1 | 1) => {
    setSongSlides((current) => {
      const index = current.findIndex((slide) => slide.id === slideId)
      const nextIndex = index + direction

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current
      }

      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return next
    })
  }

  const applyCarouselPreset = (preset: CarouselStylePreset) => {
    setCarouselPresetId(preset.id)
    setSlideStyle(preset.theme)
    setTemplateId(preset.templateId)
    setTextSettings(preset.textSettings)
  }

  const activeSongExportTargets = useMemo(
    () =>
      songSlides
        .filter((slide) => slide.enabled)
        .map((slide, index) => ({
          filename: `${String(index + 1).padStart(2, '0')}-${slide.filenameSlug}.png`,
          label: slide.label,
          ref: songSlideRef,
        })),
    [songSlides]
  )

  const handleSaveReview = async (isDraft: boolean) => {
    setSaveMessage(null)
    setSaveError(null)

    if (!isAuthenticated) {
      setSaveError('Log in to save this review to your profile.')
      return
    }

    if (!track || !songReviewDraft) {
      setSaveError('Song review is not ready yet.')
      return
    }

    setIsSavingReview(true)

    try {
      await saveSongReview({
        spotifyTrackId: track.id,
        trackTitle: track.title || track.name,
        trackArtists: track.artists || [],
        albumId: track.albumId || null,
        albumTitle: track.albumName || null,
        imageUrl: track.imageUrl || null,
        durationMs: track.durationMs || null,
        finalScore,
        reviewTitle: reviewTitle || null,
        reviewBody: reviewBody || null,
        finalRecommendation: finalNote || null,
        theme: slideStyle,
        ratingData: songReviewDraft,
        slideData: {
          moodTags,
          templateId,
          textSettings,
          slideOrder: songSlides,
        },
        isDraft,
        isPublic: visibility !== 'private',
        visibility,
      })
      setSaveMessage(isDraft ? 'Draft saved to your profile.' : 'Saved to your profile.')
    } catch (error) {
      setSaveError((error as any)?.response?.data?.error || 'Failed to save review.')
    } finally {
      setIsSavingReview(false)
    }
  }

  if (trackQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-9 w-9 animate-spin text-cyan-200" />
      </main>
    )
  }

  if (!track || trackQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/instagram/songs" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to songs
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Song builder cannot load.</h1>
          <p className="mt-3 text-red-100/80">
            {(trackQuery.error as any)?.response?.data?.error || 'Spotify API is not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend .env.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white" data-draft-ready={songReviewDraft ? 'true' : 'false'}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/songs" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Songs
          </Link>
          <Link to="/instagram/rate" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ListChecks className="h-4 w-4" />
            Rate menu
          </Link>
          <Link to="/instagram/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <BookOpen className="h-4 w-4" />
            Library
          </Link>
        </nav>

        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <Music2 className="h-4 w-4" />
              Song Review Builder
            </div>
            <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{trackTitle(track)}</h1>
            <p className="mt-2 text-gray-400">
              {artistLine(track)} {track.albumName ? `- ${track.albumName}` : ''} {track.durationMs ? `- ${formatDuration(track.durationMs)}` : ''}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-4 text-right">
            <p className="text-sm text-gray-400">Final song score</p>
            <p className="text-5xl font-black" style={{ color: scoreColor(finalScore) }}>
              {finalScore.toFixed(1)}
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Song score</h2>
                  <p className="text-sm text-gray-400">Use quick scoring, detailed categories, or manual override.</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Final score</p>
                  <p className="text-3xl font-black" style={{ color: scoreColor(finalScore) }}>
                    {finalScore.toFixed(1)}/10
                  </p>
                </div>
              </div>

              <RatingSlider label="Quick Rating" value={quickRating} onChange={setQuickRating} />

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={useDetailedRating}
                    onChange={(event) => setUseDetailedRating(event.target.checked)}
                  />
                  Detailed Rating
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={overrideScoreEnabled}
                    onChange={(event) => setOverrideScoreEnabled(event.target.checked)}
                  />
                  Override score
                </label>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {SONG_RATING_CATEGORIES.map((category) => (
                  <RatingSlider
                    key={category}
                    label={category}
                    value={categoryRatings[category] ?? 7}
                    disabled={!useDetailedRating}
                    onChange={(value) => setCategoryRatings((current) => ({ ...current, [category]: value }))}
                    compact
                  />
                ))}
              </div>

              {overrideScoreEnabled ? (
                <div className="mt-5">
                  <ScoreNumberInput label="Manual song score" value={overrideScore} onChange={setOverrideScore} />
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                  {useDetailedRating
                    ? `Detailed score uses category average ${categoryAverage.toFixed(1)}.`
                    : `Quick score is ${quickRating.toFixed(1)}.`}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
              <h2 className="text-xl font-bold">Song review text</h2>
              <div className="mt-5 grid gap-4">
                <input
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                  placeholder="Review title / short verdict..."
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                />
                <textarea
                  value={reviewBody}
                  onChange={(event) => setReviewBody(event.target.value)}
                  placeholder="Song review body..."
                  rows={6}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                />
                <textarea
                  value={finalNote}
                  onChange={(event) => setFinalNote(event.target.value)}
                  placeholder="Final note / recommendation..."
                  rows={3}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                />
                <input
                  value={moodTags}
                  onChange={(event) => setMoodTags(event.target.value)}
                  placeholder="Mood / tags, e.g. dreamy, tense, replayable..."
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
                />
              </div>
            </section>

            <VisibilitySelect value={visibility} onChange={setVisibility} />

            <CarouselSlidesPanel slides={songSlides} onToggle={toggleSongSlide} onMove={moveSongSlide} />

            <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
              <h2 className="text-xl font-bold">Style customization</h2>
              <div className="mt-5">
                <CarouselTemplatePicker selectedId={carouselPresetId} onSelect={applyCarouselPreset} />
              </div>
              <div className="mt-5">
                <TextSettingsControls value={textSettings} onChange={setTextSettings} />
              </div>
              <div className="mt-5">
                <ThemePresetPicker onSelect={(theme) => setSlideStyle(theme)} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ColorInput label="Background" value={slideStyle.backgroundColor} onChange={(value) => updateStyle('backgroundColor', value)} />
                <ColorInput label="Card" value={slideStyle.cardColor} onChange={(value) => updateStyle('cardColor', value)} />
                <ColorInput label="Text" value={slideStyle.textColor} onChange={(value) => updateStyle('textColor', value)} />
                <ColorInput label="Accent" value={slideStyle.accentColor} onChange={(value) => updateStyle('accentColor', value)} />
                <ColorInput label="Cover frame" value={slideStyle.coverFrameColor} onChange={(value) => updateStyle('coverFrameColor', value)} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
                  Shadow intensity: {slideStyle.shadowIntensity}
                  <input
                    type="range"
                    min="0"
                    max="70"
                    value={slideStyle.shadowIntensity}
                    onInput={(event) => updateStyle('shadowIntensity', Number(event.currentTarget.value))}
                    onChange={(event) => updateStyle('shadowIntensity', Number(event.currentTarget.value))}
                    className="mt-3 w-full"
                  />
                </label>
                <label className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
                  Border radius: {slideStyle.borderRadius}
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={slideStyle.borderRadius}
                    onInput={(event) => updateStyle('borderRadius', Number(event.currentTarget.value))}
                    onChange={(event) => updateStyle('borderRadius', Number(event.currentTarget.value))}
                    className="mt-3 w-full"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <ReviewSaveActions
              isAuthenticated={isAuthenticated}
              isSaving={isSavingReview}
              message={saveMessage}
              error={saveError}
              onSaveDraft={() => handleSaveReview(true)}
              onSaveToProfile={() => handleSaveReview(false)}
            />
            <SongExportButton track={track} style={slideStyle} targetRef={songSlideRef} />
            <CarouselZipExportButton
              zipFilename={`${slugify(track.artists?.[0]?.name || 'unknown-artist')}-${slugify(track.title || track.name || 'song')}-instagram-review.zip`}
              style={slideStyle}
              targets={activeSongExportTargets}
            />
            <SongReviewSlidePreview
              ref={songSlideRef}
              track={track}
              style={slideStyle}
              finalScore={finalScore}
              verdict={reviewTitle}
              review={reviewBody}
              finalNote={finalNote}
              moodTags={moodTags}
              templateId={templateId}
              textSettings={textSettings}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

function VisibilitySelect({ value, onChange }: { value: ReviewVisibility; onChange: (value: ReviewVisibility) => void }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <h2 className="text-xl font-bold">Review visibility</h2>
      <p className="mt-1 text-sm text-gray-400">Public reviews appear on your profile and feed. Unlisted reviews only open by direct link.</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReviewVisibility)}
        className="mt-5 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>
    </section>
  )
}
