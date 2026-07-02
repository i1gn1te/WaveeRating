import { ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Disc3, Loader2, Music2, Search, Trash2 } from 'lucide-react'
import {
  deleteAlbumReview,
  deleteSongReview,
  getAlbumReviews,
  getSongReviews,
} from '../lib/instagramReviewsApi'
import { ReviewVisibility } from '../types/instagramReview'

type LibraryTab = 'albums' | 'songs' | 'drafts' | 'themes'
type SortMode = 'newest' | 'oldest' | 'highest' | 'lowest'

interface SavedAlbumReview {
  id: string
  albumTitle: string
  albumArtists: unknown
  albumImageUrl?: string | null
  finalScore: number
  isDraft: boolean
  isPublic?: boolean
  visibility?: ReviewVisibility
  createdAt: string
}

interface SavedSongReview {
  id: string
  trackTitle: string
  trackArtists: unknown
  albumTitle?: string | null
  imageUrl?: string | null
  finalScore: number
  isDraft: boolean
  isPublic?: boolean
  visibility?: ReviewVisibility
  createdAt: string
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function matchesSearch(value: string, searchTerm: string) {
  return value.toLowerCase().includes(searchTerm.trim().toLowerCase())
}

function sortByMode<T extends { createdAt: string; finalScore: number }>(items: T[], sortMode: SortMode) {
  return [...items].sort((a, b) => {
    if (sortMode === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sortMode === 'highest') return b.finalScore - a.finalScore
    if (sortMode === 'lowest') return a.finalScore - b.finalScore
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

function filterAlbums(items: SavedAlbumReview[], searchTerm: string, sortMode: SortMode) {
  const filtered = searchTerm.trim()
    ? items.filter((review) => matchesSearch(`${review.albumTitle} ${artistLine(review.albumArtists)}`, searchTerm))
    : items

  return sortByMode(filtered, sortMode)
}

function filterSongs(items: SavedSongReview[], searchTerm: string, sortMode: SortMode) {
  const filtered = searchTerm.trim()
    ? items.filter((review) => matchesSearch(`${review.trackTitle} ${review.albumTitle || ''} ${artistLine(review.trackArtists)}`, searchTerm))
    : items

  return sortByMode(filtered, sortMode)
}

export default function InstagramProfile() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('albums')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const albumReviews = useQuery<SavedAlbumReview[]>({
    queryKey: ['instagram-profile-albums'],
    queryFn: () => getAlbumReviews().then((res) => res.data),
  })
  const songReviews = useQuery<SavedSongReview[]>({
    queryKey: ['instagram-profile-songs'],
    queryFn: () => getSongReviews().then((res) => res.data),
  })
  const albumDrafts = useQuery<SavedAlbumReview[]>({
    queryKey: ['instagram-profile-album-drafts'],
    queryFn: () => getAlbumReviews({ drafts: true }).then((res) => res.data),
  })
  const songDrafts = useQuery<SavedSongReview[]>({
    queryKey: ['instagram-profile-song-drafts'],
    queryFn: () => getSongReviews({ drafts: true }).then((res) => res.data),
  })

  const deleteAlbumMutation = useMutation({
    mutationFn: deleteAlbumReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-profile-albums'] })
      queryClient.invalidateQueries({ queryKey: ['instagram-profile-album-drafts'] })
    },
  })
  const deleteSongMutation = useMutation({
    mutationFn: deleteSongReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-profile-songs'] })
      queryClient.invalidateQueries({ queryKey: ['instagram-profile-song-drafts'] })
    },
  })

  const visibleAlbums = useMemo(() => filterAlbums(albumReviews.data || [], searchTerm, sortMode), [albumReviews.data, searchTerm, sortMode])
  const visibleSongs = useMemo(() => filterSongs(songReviews.data || [], searchTerm, sortMode), [songReviews.data, searchTerm, sortMode])
  const visibleAlbumDrafts = useMemo(() => filterAlbums(albumDrafts.data || [], searchTerm, sortMode), [albumDrafts.data, searchTerm, sortMode])
  const visibleSongDrafts = useMemo(() => filterSongs(songDrafts.data || [], searchTerm, sortMode), [songDrafts.data, searchTerm, sortMode])

  const isLoading = albumReviews.isLoading || songReviews.isLoading || albumDrafts.isLoading || songDrafts.isLoading
  const error =
    (albumReviews.error as any)?.response?.data?.error ||
    (songReviews.error as any)?.response?.data?.error ||
    (albumDrafts.error as any)?.response?.data?.error ||
    (songDrafts.error as any)?.response?.data?.error ||
    null

  const confirmDelete = (kind: 'album' | 'song', id: string) => {
    if (!window.confirm('Delete this saved review? This cannot be undone.')) {
      return
    }

    if (kind === 'album') {
      deleteAlbumMutation.mutate(id)
    } else {
      deleteSongMutation.mutate(id)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/rate" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Rate menu
          </Link>
          <Link to="/instagram" className="text-sm text-gray-400 transition hover:text-white">
            WaveeRating
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <Link to="/feed" className="transition hover:text-white">Feed</Link>
            <Link to="/profile/settings" className="transition hover:text-white">Profile Settings</Link>
          </div>
        </nav>

        <section className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Profile library</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">Your Music Review Library</h1>
          <p className="mt-3 max-w-2xl text-gray-400">Saved album, EP, song, and draft reviews from WaveeRating.</p>
        </section>

        <section className="mb-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search saved reviews by title or artist..."
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-pink-400"
            />
          </label>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none transition focus:border-pink-400"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </section>

        <div className="mb-6 grid gap-2 rounded-xl border border-gray-800 bg-gray-950 p-2 sm:grid-cols-4">
          {[
            ['albums', 'Albums / EPs'],
            ['songs', 'Songs'],
            ['drafts', 'Drafts'],
            ['themes', 'Themes / Templates'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as LibraryTab)}
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                activeTab === key ? 'bg-pink-500 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-100">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-pink-300" />
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'albums' && (
              <ReviewGrid emptyText="No saved album reviews match this view." hasItems={visibleAlbums.length > 0}>
                {visibleAlbums.map((review) => (
                  <AlbumReviewCard
                    key={review.id}
                    review={review}
                    onDelete={() => confirmDelete('album', review.id)}
                    deleting={deleteAlbumMutation.isPending}
                  />
                ))}
              </ReviewGrid>
            )}

            {activeTab === 'songs' && (
              <ReviewGrid emptyText="No saved song reviews match this view." hasItems={visibleSongs.length > 0}>
                {visibleSongs.map((review) => (
                  <SongReviewCard
                    key={review.id}
                    review={review}
                    onDelete={() => confirmDelete('song', review.id)}
                    deleting={deleteSongMutation.isPending}
                  />
                ))}
              </ReviewGrid>
            )}

            {activeTab === 'drafts' && (
              <>
                <section>
                  <h2 className="mb-4 text-xl font-bold">Album / EP drafts</h2>
                  <ReviewGrid emptyText="No album drafts match this view." hasItems={visibleAlbumDrafts.length > 0}>
                    {visibleAlbumDrafts.map((review) => (
                      <AlbumReviewCard
                        key={review.id}
                        review={review}
                        onDelete={() => confirmDelete('album', review.id)}
                        deleting={deleteAlbumMutation.isPending}
                      />
                    ))}
                  </ReviewGrid>
                </section>
                <section>
                  <h2 className="mb-4 text-xl font-bold">Song drafts</h2>
                  <ReviewGrid emptyText="No song drafts match this view." hasItems={visibleSongDrafts.length > 0}>
                    {visibleSongDrafts.map((review) => (
                      <SongReviewCard
                        key={review.id}
                        review={review}
                        onDelete={() => confirmDelete('song', review.id)}
                        deleting={deleteSongMutation.isPending}
                      />
                    ))}
                  </ReviewGrid>
                </section>
              </>
            )}

            {activeTab === 'themes' && (
              <section className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
                <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-700" />
                <h2 className="text-xl font-bold text-white">Themes / Templates</h2>
                <p className="mt-2 text-gray-400">Saved theme templates will live here. For now, use the preset picker inside album and song builders.</p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function ReviewGrid({ children, emptyText, hasItems }: { children: ReactNode; emptyText: string; hasItems: boolean }) {
  if (!hasItems) {
    return <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center text-gray-400">{emptyText}</div>
  }

  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function StatusBadge({ isDraft }: { isDraft: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isDraft ? 'bg-amber-500/15 text-amber-100' : 'bg-emerald-500/15 text-emerald-100'}`}>
      {isDraft ? 'Draft' : 'Published'}
    </span>
  )
}

function VisibilityBadge({ visibility, isPublic }: { visibility?: ReviewVisibility; isPublic?: boolean }) {
  const resolvedVisibility: ReviewVisibility = visibility || (isPublic === false ? 'private' : 'public')
  const styles = {
    public: 'bg-sky-500/15 text-sky-100',
    unlisted: 'bg-violet-500/15 text-violet-100',
    private: 'bg-gray-700 text-gray-100',
  }
  const labels = {
    public: 'Public',
    unlisted: 'Unlisted',
    private: 'Private',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[resolvedVisibility]}`}>
      {labels[resolvedVisibility]}
    </span>
  )
}

function AlbumReviewCard({ review, onDelete, deleting }: { review: SavedAlbumReview; onDelete: () => void; deleting: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      {review.albumImageUrl ? (
        <img src={review.albumImageUrl} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
          <Disc3 className="h-10 w-10" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge isDraft={review.isDraft} />
            <VisibilityBadge visibility={review.visibility} isPublic={review.isPublic} />
          </div>
          <span className="text-2xl font-black text-pink-200">{review.finalScore.toFixed(1)}</span>
        </div>
        <h3 className="line-clamp-2 font-bold text-white">{review.albumTitle}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-gray-400">{artistLine(review.albumArtists)}</p>
        <p className="mt-3 text-sm text-gray-500">{formatDate(review.createdAt)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/instagram/profile/albums/${review.id}`} className="rounded-lg bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-gray-700">
            Open
          </Link>
          <Link to={`/instagram/profile/albums/${review.id}/edit`} className="rounded-lg border border-gray-700 px-3 py-2 text-center text-sm font-semibold text-gray-100 transition hover:border-pink-300">
            Edit
          </Link>
          <Link to={`/instagram/profile/albums/${review.id}`} className="rounded-lg border border-pink-700 px-3 py-2 text-center text-sm font-semibold text-pink-100 transition hover:bg-pink-950">
            Export
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

function SongReviewCard({ review, onDelete, deleting }: { review: SavedSongReview; onDelete: () => void; deleting: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      {review.imageUrl ? (
        <img src={review.imageUrl} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
          <Music2 className="h-10 w-10" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <StatusBadge isDraft={review.isDraft} />
            <VisibilityBadge visibility={review.visibility} isPublic={review.isPublic} />
          </div>
          <span className="text-2xl font-black text-cyan-200">{review.finalScore.toFixed(1)}</span>
        </div>
        <h3 className="line-clamp-2 font-bold text-white">{review.trackTitle}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-gray-400">{artistLine(review.trackArtists)}</p>
        <p className="mt-1 line-clamp-1 text-sm text-gray-500">{review.albumTitle || 'Unknown album'}</p>
        <p className="mt-3 text-sm text-gray-500">{formatDate(review.createdAt)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/instagram/profile/songs/${review.id}`} className="rounded-lg bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-gray-700">
            Open
          </Link>
          <Link to={`/instagram/profile/songs/${review.id}/edit`} className="rounded-lg border border-gray-700 px-3 py-2 text-center text-sm font-semibold text-gray-100 transition hover:border-cyan-300">
            Edit
          </Link>
          <Link to={`/instagram/profile/songs/${review.id}`} className="rounded-lg border border-cyan-700 px-3 py-2 text-center text-sm font-semibold text-cyan-100 transition hover:bg-cyan-950">
            Export
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
