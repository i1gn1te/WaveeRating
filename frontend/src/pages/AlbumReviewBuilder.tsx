import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Loader2, ListChecks, UserRound } from 'lucide-react'
import { getAlbum, getAlbumTracks } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { saveAlbumReview } from '../lib/instagramReviewsApi'
import RatingSlider, { clampRatingScore, scoreColor } from '../components/instagram/RatingSlider'
import {
  AlbumReviewSlidePreview,
  BestTrackSlidePreview,
  CoverSlidePreview,
  DEFAULT_TEXT_SETTINGS,
  ReviewAlbum,
  ReviewTrack,
  SlideStyle,
  TrackRatingsSummarySlidePreview,
  WorstTrackSlidePreview,
} from '../components/instagram/SlidePreviews'
import ExportButtons, { AlbumExportTarget } from '../components/instagram/ExportButtons'
import ReviewSaveActions from '../components/instagram/ReviewSaveActions'
import CarouselZipExportButton from '../components/instagram/CarouselZipExportButton'
import ThemePresetPicker from '../components/instagram/ThemePresetPicker'
import CarouselTemplatePicker from '../components/instagram/CarouselTemplatePicker'
import CarouselSlidesPanel from '../components/instagram/CarouselSlidesPanel'
import TextSettingsControls from '../components/instagram/TextSettingsControls'
import {
  ALBUM_RATING_CATEGORIES,
  AlbumCategoryRatings,
  AlbumReviewDraft,
  CarouselStylePreset,
  CarouselSlideConfig,
  ReviewVisibility,
  SlideTemplateId,
  SlideTextSettings,
  SONG_RATING_CATEGORIES,
  SongCategoryRatings,
  TrackRating,
} from '../types/instagramReview'

type AlbumCarouselSlideId = 'cover' | 'review' | 'track-ratings' | 'best' | 'weakest'

const DEFAULT_ALBUM_SLIDES: CarouselSlideConfig<AlbumCarouselSlideId>[] = [
  { id: 'cover', label: 'Cover Slide', filenameSlug: 'cover', enabled: true },
  { id: 'review', label: 'Album Review Slide', filenameSlug: 'album-review', enabled: true },
  { id: 'track-ratings', label: 'Track Ratings Summary Slide', filenameSlug: 'track-ratings', enabled: true },
  { id: 'best', label: 'Best Track Slide', filenameSlug: 'best-track', enabled: true },
  { id: 'weakest', label: 'Weakest Track Slide', filenameSlug: 'weakest-track', enabled: true },
]

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getTrackTitle(track?: ReviewTrack) {
  return track?.title || track?.name || 'Select track'
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

function parseReleaseYear(value?: string | null) {
  const parsed = Number.parseInt(String(value || '').slice(0, 4), 10)
  return Number.isNaN(parsed) ? null : parsed
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

function createCategoryRatings<T extends readonly string[]>(categories: T, value = 7) {
  return Object.fromEntries(categories.map((name) => [name, value])) as Record<T[number], number>
}

function calculateTrackFinalScore(rating: TrackRating) {
  if (rating.overrideScoreEnabled) {
    return clampRatingScore(rating.overrideScore)
  }

  if (rating.useDetailedRating) {
    return clampRatingScore(average(SONG_RATING_CATEGORIES.map((name) => rating.categoryRatings[name] ?? 7)))
  }

  return clampRatingScore(rating.quickRating)
}

function createTrackRating(track: ReviewTrack): TrackRating {
  const title = getTrackTitle(track)

  return {
    spotifyTrackId: track.id,
    trackNumber: track.trackNumber,
    title,
    name: title,
    durationMs: track.durationMs,
    quickRating: 7,
    useDetailedRating: false,
    categoryRatings: createCategoryRatings(SONG_RATING_CATEGORIES) as SongCategoryRatings,
    overrideScoreEnabled: false,
    overrideScore: 7,
    finalScore: 7,
    note: '',
  }
}

function normalizeTrackRating(track: ReviewTrack, rating?: TrackRating): TrackRating {
  const base = rating || createTrackRating(track)
  const title = getTrackTitle(track)
  const categoryRatings = createCategoryRatings(SONG_RATING_CATEGORIES) as SongCategoryRatings

  for (const category of SONG_RATING_CATEGORIES) {
    categoryRatings[category] = clampRatingScore(base.categoryRatings?.[category] ?? 7)
  }

  const normalized: TrackRating = {
    ...base,
    spotifyTrackId: track.id,
    trackNumber: track.trackNumber,
    title,
    name: title,
    durationMs: track.durationMs,
    quickRating: clampRatingScore(base.quickRating ?? 7),
    useDetailedRating: Boolean(base.useDetailedRating),
    categoryRatings,
    overrideScoreEnabled: Boolean(base.overrideScoreEnabled),
    overrideScore: clampRatingScore(base.overrideScore ?? 7),
    note: base.note ?? '',
    finalScore: 7,
  }

  return {
    ...normalized,
    finalScore: calculateTrackFinalScore(normalized),
  }
}

function getSuggestedTrackId(trackRatings: TrackRating[], mode: 'best' | 'weakest') {
  if (trackRatings.length === 0) {
    return ''
  }

  return trackRatings.reduce((selected, track) => {
    if (mode === 'best') {
      return track.finalScore > selected.finalScore ? track : selected
    }

    return track.finalScore <= selected.finalScore ? track : selected
  }, trackRatings[0]).spotifyTrackId
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
        className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-lg font-bold text-white outline-none transition focus:border-pink-400"
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

export default function AlbumReviewBuilder() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const albumId = id || ''
  const coverSlideRef = useRef<HTMLDivElement>(null)
  const albumReviewSlideRef = useRef<HTMLDivElement>(null)
  const trackRatingsSlideRef = useRef<HTMLDivElement>(null)
  const bestTrackSlideRef = useRef<HTMLDivElement>(null)
  const worstTrackSlideRef = useRef<HTMLDivElement>(null)

  const albumQuery = useQuery<ReviewAlbum>({
    queryKey: ['instagram-album', albumId],
    queryFn: () => getAlbum(albumId).then((res) => res.data),
    enabled: !!albumId,
  })

  const tracksQuery = useQuery<ReviewTrack[]>({
    queryKey: ['instagram-album-tracks', albumId],
    queryFn: () => getAlbumTracks(albumId).then((res) => res.data),
    enabled: !!albumId,
  })

  const album = albumQuery.data
  const tracks = tracksQuery.data || []

  const [trackRatings, setTrackRatings] = useState<Record<string, TrackRating>>({})
  const [expandedTrackIds, setExpandedTrackIds] = useState<Record<string, boolean>>({})
  const [albumCategoryRatings, setAlbumCategoryRatings] = useState<AlbumCategoryRatings>(
    createCategoryRatings(ALBUM_RATING_CATEGORIES) as AlbumCategoryRatings
  )
  const [overrideAlbumScoreEnabled, setOverrideAlbumScoreEnabled] = useState(false)
  const [overrideAlbumScore, setOverrideAlbumScore] = useState(7)
  const [bestTrackId, setBestTrackId] = useState('')
  const [bestTrackReview, setBestTrackReview] = useState('')
  const [weakestTrackId, setWeakestTrackId] = useState('')
  const [weakestTrackReview, setWeakestTrackReview] = useState('')
  const [bestTrackManual, setBestTrackManual] = useState(false)
  const [weakestTrackManual, setWeakestTrackManual] = useState(false)
  const [verdict, setVerdict] = useState('')
  const [albumReview, setAlbumReview] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [visibility, setVisibility] = useState<ReviewVisibility>('public')
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [carouselPresetId, setCarouselPresetId] = useState('classic-purple')
  const [templateId, setTemplateId] = useState<SlideTemplateId>('classic-cover')
  const [textSettings, setTextSettings] = useState<SlideTextSettings>(DEFAULT_TEXT_SETTINGS)
  const [albumSlides, setAlbumSlides] = useState<CarouselSlideConfig<AlbumCarouselSlideId>[]>(DEFAULT_ALBUM_SLIDES)
  const [slideStyle, setSlideStyle] = useState<SlideStyle>({
    backgroundColor: '#4c1d95',
    cardColor: '#1f1833',
    textColor: '#ffffff',
    accentColor: '#c4b5fd',
    coverFrameColor: '#ffffff',
    shadowIntensity: 34,
    borderRadius: 28,
  })

  useEffect(() => {
    if (tracks.length === 0) {
      return
    }

    setTrackRatings((current) => {
      const next = { ...current }

      for (const track of tracks) {
        next[track.id] = normalizeTrackRating(track, next[track.id])
      }

      return next
    })
  }, [tracks])

  const trackRatingList = useMemo(
    () => tracks.map((track) => normalizeTrackRating(track, trackRatings[track.id])),
    [tracks, trackRatings]
  )
  const trackRatingById = useMemo(
    () => Object.fromEntries(trackRatingList.map((rating) => [rating.spotifyTrackId, rating])) as Record<string, TrackRating>,
    [trackRatingList]
  )
  const trackAverage = useMemo(() => average(trackRatingList.map((rating) => rating.finalScore)), [trackRatingList])
  const albumCategoryAverage = useMemo(
    () => average(ALBUM_RATING_CATEGORIES.map((name) => albumCategoryRatings[name] ?? 7)),
    [albumCategoryRatings]
  )
  const calculatedAlbumScore = trackAverage * 0.6 + albumCategoryAverage * 0.4
  const finalAlbumScore = overrideAlbumScoreEnabled ? overrideAlbumScore : calculatedAlbumScore
  const suggestedBestTrackId = useMemo(() => getSuggestedTrackId(trackRatingList, 'best'), [trackRatingList])
  const suggestedWeakestTrackId = useMemo(() => getSuggestedTrackId(trackRatingList, 'weakest'), [trackRatingList])

  useEffect(() => {
    if (!bestTrackManual) {
      setBestTrackId(suggestedBestTrackId)
    }
  }, [bestTrackManual, suggestedBestTrackId])

  useEffect(() => {
    if (!weakestTrackManual) {
      setWeakestTrackId(suggestedWeakestTrackId)
    }
  }, [weakestTrackManual, suggestedWeakestTrackId])

  const bestTrack = tracks.find((track) => track.id === bestTrackId)
  const weakestTrack = tracks.find((track) => track.id === weakestTrackId)
  const bestTrackScore = bestTrack ? trackRatingById[bestTrack.id]?.finalScore ?? 0 : 0
  const weakestTrackScore = weakestTrack ? trackRatingById[weakestTrack.id]?.finalScore ?? 0 : 0
  const activeAlbumExportTargets = useMemo<AlbumExportTarget[]>(() => {
    const getRef = (slideId: AlbumCarouselSlideId) => {
      if (slideId === 'cover') return coverSlideRef
      if (slideId === 'review') return albumReviewSlideRef
      if (slideId === 'track-ratings') return trackRatingsSlideRef
      if (slideId === 'best') return bestTrackSlideRef
      return worstTrackSlideRef
    }

    return albumSlides
      .filter((slide) => slide.enabled)
      .map((slide, index) => ({
        key: slide.id,
        label: slide.label,
        filename: `${String(index + 1).padStart(2, '0')}-${slide.filenameSlug}.png`,
        ref: getRef(slide.id),
      }))
  }, [albumSlides])
  const albumReviewDraft = useMemo<AlbumReviewDraft | null>(() => {
    if (!album) {
      return null
    }

    return {
      album: {
        id: album.id,
        name: album.name,
        title: album.title,
        artists: album.artists,
        releaseYear: album.releaseYear,
        releaseDate: album.releaseDate,
        imageUrl: album.imageUrl,
        totalTracks: album.totalTracks,
      },
      trackRatings: trackRatingList,
      albumCategoryRatings,
      overrideAlbumScoreEnabled,
      overrideAlbumScore,
      calculatedTrackAverage: trackAverage,
      calculatedAlbumCategoryAverage: albumCategoryAverage,
      finalAlbumScore,
      bestTrackId,
      weakestTrackId,
      albumReviewTitle: verdict,
      albumReviewBody: albumReview,
      finalRecommendation: recommendation,
      theme: slideStyle,
      visibility,
      templateId,
      textSettings,
      slideOrder: albumSlides,
    }
  }, [
    album,
    albumCategoryAverage,
    albumCategoryRatings,
    albumReview,
    bestTrackId,
    finalAlbumScore,
    overrideAlbumScore,
    overrideAlbumScoreEnabled,
    recommendation,
    albumSlides,
    slideStyle,
    templateId,
    textSettings,
    trackAverage,
    trackRatingList,
    verdict,
    visibility,
    weakestTrackId,
  ])
  const isLoading = albumQuery.isLoading || tracksQuery.isLoading
  const errorMessage =
    (albumQuery.error as any)?.response?.data?.error ||
    (tracksQuery.error as any)?.response?.data?.error ||
    'Spotify API is not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend .env.'

  const updateStyle = (key: keyof SlideStyle, value: string | number) => {
    setSlideStyle((current) => ({ ...current, [key]: value }))
  }

  const toggleAlbumSlide = (slideId: AlbumCarouselSlideId) => {
    setAlbumSlides((current) => {
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

  const moveAlbumSlide = (slideId: AlbumCarouselSlideId, direction: -1 | 1) => {
    setAlbumSlides((current) => {
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

  const updateTrackRating = (track: ReviewTrack, updater: (current: TrackRating) => TrackRating) => {
    setTrackRatings((current) => {
      const updated = normalizeTrackRating(track, updater(normalizeTrackRating(track, current[track.id])))
      return { ...current, [track.id]: updated }
    })
  }

  const toggleExpandedTrack = (trackId: string) => {
    setExpandedTrackIds((current) => ({ ...current, [trackId]: !current[trackId] }))
  }

  const handleSaveReview = async (isDraft: boolean) => {
    setSaveMessage(null)
    setSaveError(null)

    if (!isAuthenticated) {
      setSaveError('Log in to save this review to your profile.')
      return
    }

    if (!album || !albumReviewDraft) {
      setSaveError('Album review is not ready yet.')
      return
    }

    setIsSavingReview(true)

    try {
      await saveAlbumReview({
        spotifyAlbumId: album.id,
        albumTitle: album.title || album.name,
        albumArtists: album.artists || [],
        albumImageUrl: album.imageUrl || null,
        releaseDate: album.releaseDate || null,
        releaseYear: parseReleaseYear(album.releaseYear || album.releaseDate),
        albumType: (album as ReviewAlbum & { albumType?: string }).albumType || null,
        finalScore: finalAlbumScore,
        trackAverage,
        albumCategoryAverage,
        bestTrackTitle: bestTrack ? getTrackTitle(bestTrack) : null,
        weakestTrackTitle: weakestTrack ? getTrackTitle(weakestTrack) : null,
        reviewTitle: verdict || null,
        reviewBody: albumReview || null,
        finalRecommendation: recommendation || null,
        theme: slideStyle,
        ratingData: albumReviewDraft,
        slideData: {
          bestTrackReview,
          weakestTrackReview,
          templateId,
          textSettings,
          slideOrder: albumSlides,
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-9 w-9 animate-spin text-pink-300" />
      </main>
    )
  }

  if (!album || albumQuery.isError || tracksQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/instagram/albums" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to albums
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Album builder cannot load.</h1>
          <p className="mt-3 text-red-100/80">{errorMessage}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white" data-draft-ready={albumReviewDraft ? 'true' : 'false'}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/albums" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Albums
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/instagram/rate" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <ListChecks className="h-4 w-4" />
              Rate menu
            </Link>
            <Link to="/instagram/artists" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <UserRound className="h-4 w-4" />
              Artists
            </Link>
            <Link to="/instagram/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <BookOpen className="h-4 w-4" />
              Library
            </Link>
            <Link to="/" className="text-sm text-gray-400 transition hover:text-white">
              Home
            </Link>
          </div>
        </nav>

        <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Review Builder</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">{album.title || album.name}</h1>
            <p className="mt-2 text-gray-400">{album.artists?.map((artist) => artist.name).join(', ')}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-4 text-right">
            <p className="text-sm text-gray-400">Final album score</p>
            <p className="text-5xl font-black" style={{ color: scoreColor(finalAlbumScore) }}>
              {finalAlbumScore.toFixed(1)}
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <section className="rounded-xl border border-gray-800 bg-gray-950">
              <div className="border-b border-gray-800 p-5">
                <h2 className="text-xl font-bold">Track ratings</h2>
                <p className="mt-1 text-sm text-gray-400">Each song has quick, detailed, and optional manual scoring.</p>
              </div>
              <div className="grid gap-3 p-5">
                {tracks.map((track) => {
                  const rating = trackRatingById[track.id] || createTrackRating(track)
                  const expanded = Boolean(expandedTrackIds[track.id])
                  const color = scoreColor(rating.finalScore)

                  return (
                    <article key={track.id} className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-sm font-black text-gray-300">
                              {track.trackNumber || '-'}
                            </span>
                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-white">{getTrackTitle(track)}</h3>
                              <p className="text-sm text-gray-500">{formatDuration(track.durationMs)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Song score</p>
                          <p className="text-3xl font-black" style={{ color }}>
                            {rating.finalScore.toFixed(1)}/10
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                        <RatingSlider
                          label="Quick Rating"
                          value={rating.quickRating}
                          onChange={(value) => updateTrackRating(track, (current) => ({ ...current, quickRating: value }))}
                          compact
                        />
                        <button
                          type="button"
                          onClick={() => toggleExpandedTrack(track.id)}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 text-sm font-semibold text-gray-200 transition hover:border-pink-300 hover:text-white"
                        >
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {expanded ? 'Hide details' : 'Expand details'}
                        </button>
                      </div>

                      {expanded && (
                        <div className="mt-4 border-t border-gray-800 pt-4">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
                              <input
                                type="checkbox"
                                checked={rating.useDetailedRating}
                                onChange={(event) =>
                                  updateTrackRating(track, (current) => ({ ...current, useDetailedRating: event.target.checked }))
                                }
                              />
                              Detailed Rating
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
                              <input
                                type="checkbox"
                                checked={rating.overrideScoreEnabled}
                                onChange={(event) =>
                                  updateTrackRating(track, (current) => ({ ...current, overrideScoreEnabled: event.target.checked }))
                                }
                              />
                              Override song score
                            </label>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {SONG_RATING_CATEGORIES.map((category) => (
                              <RatingSlider
                                key={category}
                                label={category}
                                value={rating.categoryRatings[category] ?? 7}
                                disabled={!rating.useDetailedRating}
                                onChange={(value) =>
                                  updateTrackRating(track, (current) => ({
                                    ...current,
                                    categoryRatings: { ...current.categoryRatings, [category]: value },
                                  }))
                                }
                                compact
                              />
                            ))}
                          </div>

                          {rating.overrideScoreEnabled && (
                            <div className="mt-4">
                              <ScoreNumberInput
                                label="Manual song score"
                                value={rating.overrideScore}
                                onChange={(value) => updateTrackRating(track, (current) => ({ ...current, overrideScore: value }))}
                              />
                            </div>
                          )}

                          <textarea
                            value={rating.note}
                            onChange={(event) => updateTrackRating(track, (current) => ({ ...current, note: event.target.value }))}
                            placeholder="Track note..."
                            rows={3}
                            className="mt-4 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-pink-400"
                          />
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-950">
              <div className="border-b border-gray-800 p-5">
                <h2 className="text-xl font-bold">Album categories</h2>
                <p className="mt-1 text-sm text-gray-400">Album categories make up 40% of the automatic score.</p>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-2">
                {ALBUM_RATING_CATEGORIES.map((name) => (
                  <RatingSlider
                    key={name}
                    label={name}
                    value={albumCategoryRatings[name] ?? 7}
                    onChange={(value) => setAlbumCategoryRatings((current) => ({ ...current, [name]: value }))}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Final album score</h2>
                  <p className="text-sm text-gray-400">Track Average x 60% + Album Category Average x 40%.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={overrideAlbumScoreEnabled}
                    onChange={(event) => setOverrideAlbumScoreEnabled(event.target.checked)}
                  />
                  Override final album score
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <ScoreStat label="Track Average" value={trackAverage} />
                <ScoreStat label="Album Category Average" value={albumCategoryAverage} />
                <ScoreStat label="Final Album Score" value={finalAlbumScore} strong />
              </div>
              {overrideAlbumScoreEnabled ? (
                <div className="mt-4">
                  <ScoreNumberInput label="Manual final album score" value={overrideAlbumScore} onChange={setOverrideAlbumScore} />
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-300">
                  Track average {trackAverage.toFixed(1)} x 60% + album category average {albumCategoryAverage.toFixed(1)} x 40%.
                </div>
              )}
            </section>

            <section className="grid gap-5 md:grid-cols-2">
              <TrackSpotlightEditor
                title="Best Track"
                tracks={tracks}
                trackRatingById={trackRatingById}
                selectedId={bestTrackId}
                text={bestTrackReview}
                selectedScore={bestTrackScore}
                onTrackChange={(value) => {
                  setBestTrackManual(true)
                  setBestTrackId(value)
                }}
                onTextChange={setBestTrackReview}
              />
              <TrackSpotlightEditor
                title="Weakest Track"
                tracks={tracks}
                trackRatingById={trackRatingById}
                selectedId={weakestTrackId}
                text={weakestTrackReview}
                selectedScore={weakestTrackScore}
                onTrackChange={(value) => {
                  setWeakestTrackManual(true)
                  setWeakestTrackId(value)
                }}
                onTextChange={setWeakestTrackReview}
              />
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
              <h2 className="text-xl font-bold">Album Review</h2>
              <div className="mt-5 grid gap-4">
                <input
                  value={verdict}
                  onChange={(event) => setVerdict(event.target.value)}
                  placeholder="Short verdict/title..."
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
                />
                <textarea
                  value={albumReview}
                  onChange={(event) => setAlbumReview(event.target.value)}
                  placeholder="Full album review..."
                  rows={6}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
                />
                <textarea
                  value={recommendation}
                  onChange={(event) => setRecommendation(event.target.value)}
                  placeholder="Italic-style final recommendation..."
                  rows={3}
                  className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
                />
              </div>
            </section>

            <VisibilitySelect value={visibility} onChange={setVisibility} />

            <CarouselSlidesPanel slides={albumSlides} onToggle={toggleAlbumSlide} onMove={moveAlbumSlide} />

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
            <ExportButtons
              album={album}
              style={slideStyle}
              targets={{
                coverSlideRef,
                albumReviewSlideRef,
                trackRatingsSlideRef,
                bestTrackSlideRef,
                worstTrackSlideRef,
              }}
              orderedTargets={activeAlbumExportTargets}
            />
            <CarouselZipExportButton
              zipFilename={`${slugify(album.artists?.[0]?.name || 'unknown-artist')}-${slugify(album.title || album.name || 'album')}-instagram-review.zip`}
              style={slideStyle}
              targets={activeAlbumExportTargets.map((target) => ({ filename: target.filename, label: target.label, ref: target.ref }))}
            />
            {albumSlides.filter((slide) => slide.enabled).map((slide) => {
              if (slide.id === 'cover') {
                return <CoverSlidePreview key={slide.id} ref={coverSlideRef} album={album} style={slideStyle} templateId={templateId} textSettings={textSettings} />
              }

              if (slide.id === 'review') {
                return (
                  <AlbumReviewSlidePreview
                    key={slide.id}
                    ref={albumReviewSlideRef}
                    album={album}
                    style={slideStyle}
                    finalScore={finalAlbumScore}
                    verdict={verdict}
                    review={albumReview}
                    recommendation={recommendation}
                    categoryRatings={albumCategoryRatings}
                    templateId={templateId}
                    textSettings={textSettings}
                  />
                )
              }

              if (slide.id === 'track-ratings') {
                return (
                  <TrackRatingsSummarySlidePreview
                    key={slide.id}
                    ref={trackRatingsSlideRef}
                    album={album}
                    style={slideStyle}
                    finalScore={finalAlbumScore}
                    trackRatings={trackRatingList}
                    templateId={templateId}
                    textSettings={textSettings}
                  />
                )
              }

              if (slide.id === 'best') {
                return (
                  <BestTrackSlidePreview
                    key={slide.id}
                    ref={bestTrackSlideRef}
                    album={album}
                    style={slideStyle}
                    track={bestTrack}
                    score={bestTrackScore}
                    text={bestTrackReview}
                    templateId={templateId}
                    textSettings={textSettings}
                  />
                )
              }

              return (
                <WorstTrackSlidePreview
                  key={slide.id}
                  ref={worstTrackSlideRef}
                  album={album}
                  style={slideStyle}
                  track={weakestTrack}
                  score={weakestTrackScore}
                  text={weakestTrackReview}
                  templateId={templateId}
                  textSettings={textSettings}
                />
              )
            })}
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
        className="mt-5 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>
    </section>
  )
}

function ScoreStat({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className={strong ? 'mt-2 text-4xl font-black' : 'mt-2 text-3xl font-black'} style={{ color: scoreColor(value) }}>
        {value.toFixed(1)}
      </p>
    </div>
  )
}

function TrackSpotlightEditor({
  title,
  tracks,
  trackRatingById,
  selectedId,
  selectedScore,
  text,
  onTrackChange,
  onTextChange,
}: {
  title: string
  tracks: ReviewTrack[]
  trackRatingById: Record<string, TrackRating>
  selectedId: string
  selectedScore: number
  text: string
  onTrackChange: (value: string) => void
  onTextChange: (value: string) => void
}) {
  const color = scoreColor(selectedScore)

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-2xl font-black" style={{ color }}>
          {selectedScore.toFixed(1)}/10
        </span>
      </div>
      <div className="mt-5 grid gap-4">
        <select
          value={selectedId}
          onChange={(event) => onTrackChange(event.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
        >
          {tracks.map((track) => {
            const score = trackRatingById[track.id]?.finalScore ?? 7

            return (
              <option key={track.id} value={track.id}>
                {track.trackNumber ? `${track.trackNumber}. ` : ''}
                {getTrackTitle(track)} - {score.toFixed(1)}/10
              </option>
            )
          })}
        </select>
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder={`Short ${title.toLowerCase()} review...`}
          rows={4}
          className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
        />
      </div>
    </section>
  )
}
