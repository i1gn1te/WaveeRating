import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit3, Loader2, Music2, Trash2 } from 'lucide-react'
import { deleteSongReview, getSongReview } from '../lib/instagramReviewsApi'
import { ReviewArtist, ReviewTheme, SONG_RATING_CATEGORIES, SongDraftTrackData } from '../types/instagramReview'
import SongExportButton from '../components/instagram/SongExportButton'
import SongReviewSlidePreview from '../components/instagram/SongReviewSlidePreview'
import CarouselZipExportButton from '../components/instagram/CarouselZipExportButton'
import usePageTitle from '../hooks/usePageTitle'

interface SavedSongReviewDetail {
  id: string
  spotifyTrackId: string
  trackTitle: string
  trackArtists: ReviewArtist[]
  albumId?: string | null
  albumTitle?: string | null
  imageUrl?: string | null
  durationMs?: number | null
  finalScore: number
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
  backgroundColor: '#020617',
  cardColor: '#09090b',
  textColor: '#f8fafc',
  accentColor: '#67e8f9',
  coverFrameColor: '#e0f2fe',
  shadowIntensity: 34,
  borderRadius: 24,
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
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)

  return slug || 'review'
}

function formatDuration(durationMs?: number | null) {
  if (!durationMs) {
    return '--:--'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function InstagramSongReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const songSlideRef = useRef<HTMLDivElement>(null)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const reviewQuery = useQuery<SavedSongReviewDetail>({
    queryKey: ['instagram-profile-song-detail', id],
    queryFn: () => getSongReview(id || '').then((res) => res.data),
    enabled: !!id,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteSongReview,
    onSuccess: () => {
      setDeleteMessage('Review deleted.')
      window.setTimeout(() => navigate('/library'), 500)
    },
  })

  const review = reviewQuery.data
  usePageTitle(review ? `${review.trackTitle} Review` : 'Saved Song Review')
  const style = review?.theme || FALLBACK_THEME
  const categoryRatings = review?.ratingData?.categoryRatings || {}
  const trackForPreview = useMemo<SongDraftTrackData | null>(() => {
    if (!review) {
      return null
    }

    return {
      id: review.spotifyTrackId,
      name: review.trackTitle,
      title: review.trackTitle,
      artists: review.trackArtists || [],
      albumId: review.albumId || null,
      albumName: review.albumTitle || null,
      imageUrl: review.imageUrl || null,
      durationMs: review.durationMs || undefined,
    }
  }, [review])

  if (reviewQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
      </main>
    )
  }

  if (!review || !trackForPreview || reviewQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/library" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Song review cannot load.</h1>
          <p className="mt-3 text-red-100/80">{(reviewQuery.error as any)?.response?.data?.error || 'Review not found.'}</p>
          <button
            type="button"
            onClick={() => reviewQuery.refetch()}
            className="mt-5 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-bold text-red-100 transition hover:border-red-100 hover:text-white"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Delete this saved song review?')) {
      deleteMutation.mutate(review.id)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/library" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/library/songs/${review.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:border-cyan-300">
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
        {deleteMessage && <p className="mb-6 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{deleteMessage}</p>}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-8">
            <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
              <div>
                {review.imageUrl ? (
                  <img src={review.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-gray-800 text-gray-500">
                    <Music2 className="h-12 w-12" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">{review.isDraft ? 'Song draft' : 'Song review'}</p>
                <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">{review.trackTitle}</h1>
                <p className="mt-2 text-gray-400">{artistLine(review.trackArtists)}</p>
                <p className="mt-6 text-6xl font-black text-cyan-200">{review.finalScore.toFixed(1)}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Stat label="Album" value={review.albumTitle || 'Unknown album'} />
                  <Stat label="Duration" value={formatDuration(review.durationMs)} />
                  <Stat label="Quick Rating" value={review.ratingData?.quickRating?.toFixed?.(1)} />
                  <Stat label="Detailed Rating" value={review.ratingData?.useDetailedRating ? 'Enabled' : 'Disabled'} />
                  <Stat label="Override" value={review.ratingData?.overrideScoreEnabled ? 'Enabled' : 'Disabled'} />
                </div>
              </div>
            </section>

            <TextBlock title={review.reviewTitle || 'Review'} body={review.reviewBody || 'No review body saved.'} />
            <TextBlock title="Final recommendation" body={review.finalRecommendation || 'No recommendation saved.'} />

            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-xl font-bold text-white">Song categories</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SONG_RATING_CATEGORIES.map((name) => (
                  <div key={name} className="flex items-center justify-between gap-4 rounded-lg bg-gray-950 px-4 py-3">
                    <span className="text-gray-200">{name}</span>
                    <span className="font-black text-cyan-200">{Number(categoryRatings[name] ?? 0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            <RatingData value={review.ratingData} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <SongExportButton track={trackForPreview} style={style} targetRef={songSlideRef} />
            <CarouselZipExportButton
              zipFilename={`${slugify(review.trackArtists?.[0]?.name || 'unknown-artist')}-${slugify(review.trackTitle)}-instagram-review.zip`}
              style={style}
              targets={[{ filename: '01-song-review.png', label: 'Song Review Slide', ref: songSlideRef }]}
            />
            <SongReviewSlidePreview
              ref={songSlideRef}
              track={trackForPreview}
              style={style}
              finalScore={review.finalScore}
              verdict={review.reviewTitle || ''}
              review={review.reviewBody || ''}
              finalNote={review.finalRecommendation || ''}
              moodTags={review.slideData?.moodTags || review.ratingData?.moodTags || ''}
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

function RatingData({ value }: { value: unknown }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-xl font-bold text-white">Rating data</h2>
      <pre className="mt-4 max-h-[520px] overflow-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  )
}
