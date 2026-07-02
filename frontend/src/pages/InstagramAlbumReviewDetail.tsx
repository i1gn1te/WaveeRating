import { useMemo, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Disc3, Edit3, Loader2, Trash2 } from 'lucide-react'
import { deleteAlbumReview, getAlbumReview } from '../lib/instagramReviewsApi'
import { ReviewArtist, ReviewTheme, TrackRating } from '../types/instagramReview'
import {
  AlbumReviewSlidePreview,
  BestTrackSlidePreview,
  CoverSlidePreview,
  ReviewAlbum,
  ReviewTrack,
  WorstTrackSlidePreview,
} from '../components/instagram/SlidePreviews'
import ExportButtons from '../components/instagram/ExportButtons'
import CarouselZipExportButton from '../components/instagram/CarouselZipExportButton'

interface SavedAlbumReviewDetail {
  id: string
  spotifyAlbumId: string
  albumTitle: string
  albumArtists: ReviewArtist[]
  albumImageUrl?: string | null
  releaseDate?: string | null
  releaseYear?: number | null
  finalScore: number
  trackAverage?: number | null
  albumCategoryAverage?: number | null
  bestTrackTitle?: string | null
  weakestTrackTitle?: string | null
  reviewTitle?: string | null
  reviewBody?: string | null
  finalRecommendation?: string | null
  theme?: ReviewTheme | null
  ratingData: any
  slideData?: any
  isDraft: boolean
  createdAt: string
}

const FALLBACK_THEME: ReviewTheme = {
  backgroundColor: '#4c1d95',
  cardColor: '#1f1833',
  textColor: '#ffffff',
  accentColor: '#c4b5fd',
  coverFrameColor: '#ffffff',
  shadowIntensity: 34,
  borderRadius: 28,
}

function artistLine(value: ReviewArtist[] | unknown) {
  if (Array.isArray(value)) {
    return value
      .map((artist) => (artist && typeof artist === 'object' && 'name' in artist ? String(artist.name) : ''))
      .filter(Boolean)
      .join(', ') || 'Unknown artist'
  }

  return 'Unknown artist'
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

function trackTitle(track?: Partial<TrackRating> | ReviewTrack | null) {
  return track?.title || track?.name || 'Select track'
}

function toReviewTrack(track?: TrackRating | null, fallbackTitle = 'Select track'): ReviewTrack | undefined {
  if (!track && !fallbackTitle) {
    return undefined
  }

  return {
    id: track?.spotifyTrackId || fallbackTitle,
    trackNumber: track?.trackNumber,
    name: track?.name || track?.title || fallbackTitle,
    title: track?.title || track?.name || fallbackTitle,
    durationMs: track?.durationMs,
  }
}

export default function InstagramAlbumReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const coverSlideRef = useRef<HTMLDivElement>(null)
  const albumReviewSlideRef = useRef<HTMLDivElement>(null)
  const bestTrackSlideRef = useRef<HTMLDivElement>(null)
  const weakestTrackSlideRef = useRef<HTMLDivElement>(null)
  const reviewQuery = useQuery<SavedAlbumReviewDetail>({
    queryKey: ['instagram-profile-album-detail', id],
    queryFn: () => getAlbumReview(id || '').then((res) => res.data),
    enabled: !!id,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteAlbumReview,
    onSuccess: () => navigate('/instagram/profile'),
  })

  const review = reviewQuery.data
  const style = review?.theme || FALLBACK_THEME
  const trackRatings = useMemo<TrackRating[]>(() => {
    const value = review?.ratingData?.trackRatings
    return Array.isArray(value) ? value : []
  }, [review])
  const albumCategoryRatings = review?.ratingData?.albumCategoryRatings || {}
  const bestTrack = trackRatings.find((track) => track.spotifyTrackId === review?.ratingData?.bestTrackId) || null
  const weakestTrack = trackRatings.find((track) => track.spotifyTrackId === review?.ratingData?.weakestTrackId) || null
  const albumForPreview: ReviewAlbum | null = review
    ? {
        id: review.spotifyAlbumId,
        name: review.albumTitle,
        title: review.albumTitle,
        artists: review.albumArtists || [],
        releaseDate: review.releaseDate || undefined,
        releaseYear: review.releaseYear ? String(review.releaseYear) : undefined,
        imageUrl: review.albumImageUrl || null,
        totalTracks: trackRatings.length || undefined,
      }
    : null

  if (reviewQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-pink-300" />
      </main>
    )
  }

  if (!review || !albumForPreview || reviewQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/instagram/profile" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Album review cannot load.</h1>
          <p className="mt-3 text-red-100/80">{(reviewQuery.error as any)?.response?.data?.error || 'Review not found.'}</p>
        </div>
      </main>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Delete this saved album review?')) {
      deleteMutation.mutate(review.id)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/instagram/profile/albums/${review.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:border-pink-300">
              <Edit3 className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-950 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <div>
                {review.albumImageUrl ? (
                  <img src={review.albumImageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gray-800 text-gray-500">
                    <Disc3 className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">{review.isDraft ? 'Album draft' : 'Album review'}</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">{review.albumTitle}</h1>
                <p className="mt-2 text-gray-400">{artistLine(review.albumArtists)}</p>
                <p className="mt-6 text-6xl font-black text-pink-200">{review.finalScore.toFixed(1)}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Stat label="Release year" value={review.releaseYear || review.releaseDate?.slice(0, 4)} />
                  <Stat label="Track Average" value={review.trackAverage?.toFixed(1)} />
                  <Stat label="Album Category Average" value={review.albumCategoryAverage?.toFixed(1)} />
                  <Stat label="Best Track" value={review.bestTrackTitle} />
                  <Stat label="Weakest Track" value={review.weakestTrackTitle} />
                </div>
              </div>
            </section>

            <TextBlock title={review.reviewTitle || 'Review'} body={review.reviewBody || 'No review body saved.'} />
            <TextBlock title="Final recommendation" body={review.finalRecommendation || 'No recommendation saved.'} />

            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-xl font-bold text-white">Track scores</h2>
              {trackRatings.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {trackRatings.map((track) => (
                    <div key={track.spotifyTrackId} className="flex items-center justify-between gap-4 rounded-lg bg-gray-950 px-4 py-3">
                      <span className="min-w-0 truncate text-gray-200">
                        {track.trackNumber ? `${track.trackNumber}. ` : ''}
                        {trackTitle(track)}
                      </span>
                      <span className="font-black text-pink-200">{track.finalScore?.toFixed?.(1) || '-'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-400">No track rating list saved.</p>
              )}
            </section>

            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-xl font-bold text-white">Album categories</h2>
              {Object.keys(albumCategoryRatings).length > 0 ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.entries(albumCategoryRatings).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between gap-4 rounded-lg bg-gray-950 px-4 py-3">
                      <span className="text-gray-200">{name}</span>
                      <span className="font-black text-pink-200">{Number(value).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-400">No album categories saved.</p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <ExportButtons
              album={albumForPreview}
              style={style}
              targets={{
                coverSlideRef,
                albumReviewSlideRef,
                bestTrackSlideRef,
                worstTrackSlideRef: weakestTrackSlideRef,
              }}
            />
            <CarouselZipExportButton
              zipFilename={`${slugify(review.albumArtists?.[0]?.name || 'unknown-artist')}-${slugify(review.albumTitle)}-instagram-review.zip`}
              style={style}
              targets={[
                { filename: '01-cover.png', label: 'Cover Slide', ref: coverSlideRef },
                { filename: '02-album-review.png', label: 'Album Review Slide', ref: albumReviewSlideRef },
                { filename: '03-best-track.png', label: 'Best Track Slide', ref: bestTrackSlideRef },
                { filename: '04-weakest-track.png', label: 'Weakest Track Slide', ref: weakestTrackSlideRef },
              ]}
            />
            <CoverSlidePreview ref={coverSlideRef} album={albumForPreview} style={style} />
            <AlbumReviewSlidePreview
              ref={albumReviewSlideRef}
              album={albumForPreview}
              style={style}
              finalScore={review.finalScore}
              verdict={review.reviewTitle || ''}
              review={review.reviewBody || ''}
              recommendation={review.finalRecommendation || ''}
            />
            <BestTrackSlidePreview
              ref={bestTrackSlideRef}
              album={albumForPreview}
              style={style}
              track={toReviewTrack(bestTrack, review.bestTrackTitle || 'Best track')}
              score={bestTrack?.finalScore || review.finalScore}
              text={review.slideData?.bestTrackReview || ''}
            />
            <WorstTrackSlidePreview
              ref={weakestTrackSlideRef}
              album={albumForPreview}
              style={style}
              track={toReviewTrack(weakestTrack, review.weakestTrackTitle || 'Weakest track')}
              score={weakestTrack?.finalScore || review.finalScore}
              text={review.slideData?.weakestTrackReview || ''}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value?: number | string | null }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value ?? '-'}</p>
    </div>
  )
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-gray-300">{body}</p>
    </section>
  )
}
