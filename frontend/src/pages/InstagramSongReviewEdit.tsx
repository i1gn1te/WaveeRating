import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { getSongReview, updateSongReview } from '../lib/instagramReviewsApi'
import { ReviewTheme, ReviewVisibility } from '../types/instagramReview'
import ThemePresetPicker from '../components/instagram/ThemePresetPicker'
import { clampRatingScore, scoreColor } from '../components/instagram/RatingSlider'
import usePageTitle from '../hooks/usePageTitle'

interface SavedSongReviewEditData {
  id: string
  trackTitle: string
  trackArtists: unknown
  finalScore: number
  reviewTitle?: string | null
  reviewBody?: string | null
  finalRecommendation?: string | null
  theme?: ReviewTheme | null
  isDraft: boolean
  isPublic?: boolean
  visibility?: ReviewVisibility
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

function artistLine(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((artist) => (artist && typeof artist === 'object' && 'name' in artist ? String(artist.name) : ''))
      .filter(Boolean)
      .join(', ') || 'Unknown artist'
  }

  return 'Unknown artist'
}

export default function InstagramSongReviewEdit() {
  const { id } = useParams()
  const [finalScore, setFinalScore] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [finalRecommendation, setFinalRecommendation] = useState('')
  const [theme, setTheme] = useState<ReviewTheme>(FALLBACK_THEME)
  const [visibility, setVisibility] = useState<ReviewVisibility>('public')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  usePageTitle('Edit Song Review')

  const reviewQuery = useQuery<SavedSongReviewEditData>({
    queryKey: ['instagram-profile-song-edit', id],
    queryFn: () => getSongReview(id || '').then((res) => res.data),
    enabled: !!id,
  })

  useEffect(() => {
    const review = reviewQuery.data
    if (!review) {
      return
    }

    setFinalScore(clampRatingScore(Number(review.finalScore)))
    setReviewTitle(review.reviewTitle || '')
    setReviewBody(review.reviewBody || '')
    setFinalRecommendation(review.finalRecommendation || '')
    setTheme(review.theme || FALLBACK_THEME)
    setVisibility(review.visibility || (review.isPublic === false ? 'private' : 'public'))
  }, [reviewQuery.data])

  const updateMutation = useMutation({
    mutationFn: (isDraft: boolean) =>
      updateSongReview(id || '', {
        finalScore,
        reviewTitle: reviewTitle || null,
        reviewBody: reviewBody || null,
        finalRecommendation: finalRecommendation || null,
        theme,
        isDraft,
        isPublic: visibility !== 'private',
        visibility,
      }),
    onSuccess: (_data, isDraft) => {
      setMessage(isDraft ? 'Draft saved.' : 'Review saved to your profile.')
      setError(null)
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Failed to update song review.')
      setMessage(null)
    },
  })

  if (reviewQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
      </main>
    )
  }

  const review = reviewQuery.data

  if (!review || reviewQuery.isError) {
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

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to={`/library/songs/${review.id}`} className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to song review
          </Link>
          <Link to="/library" className="text-sm text-gray-400 transition hover:text-white">
            Library
          </Link>
        </nav>

        <section className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Edit song review</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">{review.trackTitle}</h1>
          <p className="mt-2 text-gray-400">{artistLine(review.trackArtists)}</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <section className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-5">
            <ScoreInput value={finalScore} onChange={setFinalScore} />
            <TextInput label="Review title / short verdict" value={reviewTitle} onChange={setReviewTitle} />
            <TextArea label="Review body" value={reviewBody} onChange={setReviewBody} rows={8} />
            <TextArea label="Final recommendation" value={finalRecommendation} onChange={setFinalRecommendation} rows={4} />
            <VisibilitySelect value={visibility} onChange={setVisibility} />

            <div className="flex flex-wrap gap-3">
              <SaveButton label="Save Draft" loading={updateMutation.isPending} onClick={() => updateMutation.mutate(true)} />
              <SaveButton label="Save to Profile" loading={updateMutation.isPending} onClick={() => updateMutation.mutate(false)} primary />
            </div>
            {message && <p className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
            {error && <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
          </section>

          <section className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-5">
            <ThemePresetPicker onSelect={(preset) => setTheme(preset)} />
            <ThemeFields theme={theme} onChange={setTheme} />
          </section>
        </div>
      </div>
    </main>
  )
}

function VisibilitySelect({ value, onChange }: { value: ReviewVisibility; onChange: (value: ReviewVisibility) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">Review visibility</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReviewVisibility)}
        className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
      >
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
        <option value="private">Private</option>
      </select>
    </label>
  )
}

function ScoreInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">Final score</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={(event) => onChange(clampRatingScore(Number(event.target.value)))}
          className="w-32 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
        />
        <span className="text-2xl font-black" style={{ color: scoreColor(value) }}>
          {value.toFixed(1)}
        </span>
      </div>
    </label>
  )
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none transition focus:border-cyan-400"
      />
    </label>
  )
}

function SaveButton({ label, loading, onClick, primary = false }: { label: string; loading: boolean; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        primary ? 'bg-cyan-400 text-gray-950 hover:bg-cyan-300' : 'border border-gray-700 text-gray-100 hover:border-cyan-300'
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {label}
    </button>
  )
}

function ThemeFields({ theme, onChange }: { theme: ReviewTheme; onChange: (theme: ReviewTheme) => void }) {
  const update = (key: keyof ReviewTheme, value: string | number) => onChange({ ...theme, [key]: value })

  return (
    <div className="grid gap-4">
      {[
        ['backgroundColor', 'Background color'],
        ['cardColor', 'Card color'],
        ['textColor', 'Text color'],
        ['accentColor', 'Accent color'],
        ['coverFrameColor', 'Cover frame color'],
      ].map(([key, label]) => (
        <label key={key} className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2">
          <span className="text-sm text-gray-300">{label}</span>
          <input type="color" value={String(theme[key as keyof ReviewTheme])} onChange={(event) => update(key as keyof ReviewTheme, event.target.value)} />
        </label>
      ))}
      <label className="block">
        <span className="text-sm font-semibold text-gray-300">Shadow intensity</span>
        <input type="range" min="0" max="80" value={theme.shadowIntensity} onChange={(event) => update('shadowIntensity', Number(event.target.value))} className="mt-2 w-full" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-gray-300">Border radius</span>
        <input type="range" min="0" max="64" value={theme.borderRadius} onChange={(event) => update('borderRadius', Number(event.target.value))} className="mt-2 w-full" />
      </label>
    </div>
  )
}
