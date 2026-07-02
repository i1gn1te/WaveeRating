import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Disc3, Loader2, Music2, Search as SearchIcon } from 'lucide-react'
import { searchPublicTracks } from '../lib/api'
import { SongDraftTrackData } from '../types/instagramReview'

function formatDuration(durationMs?: number) {
  if (!durationMs) {
    return '--:--'
  }

  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function artistLine(track: SongDraftTrackData) {
  return track.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'
}

export default function SongRatingHome() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: tracks, isLoading, isFetching, isError, error } = useQuery<SongDraftTrackData[]>({
    queryKey: ['instagram-song-search', searchTerm],
    queryFn: () => searchPublicTracks(searchTerm).then((res) => res.data),
    enabled: searchTerm.length > 0,
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextQuery = query.trim()
    if (nextQuery) {
      setSearchTerm(nextQuery)
    }
  }

  const handleTrackClick = (track: SongDraftTrackData) => {
    console.log('[WaveeRating] selected song ID:', track.id)
    navigate(`/instagram/songs/${track.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/rate" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Rate menu
          </Link>
          <Link to="/instagram/albums" className="text-sm text-gray-400 transition hover:text-white">
            Albums / EPs
          </Link>
        </nav>

        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <Music2 className="h-4 w-4" />
            Rate Song
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">Search Spotify songs</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Pick one track, rate it with quick or detailed scoring, then export a single-song Instagram review slide.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a song, artist, or both..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900 py-4 pl-12 pr-36 text-white placeholder-gray-500 transition focus:border-cyan-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || isFetching}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg bg-cyan-400 px-5 py-2 font-bold text-gray-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
          </div>
        )}

        {tracks && tracks.length > 0 && (
          <div>
            <p className="mb-4 text-gray-400">Found {tracks.length} songs</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleTrackClick(track)}
                  className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 text-left transition hover:-translate-y-1 hover:border-cyan-300"
                >
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
                      <Disc3 className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="line-clamp-2 min-h-[3.5rem] text-base font-semibold text-white group-hover:text-cyan-100">
                      {track.title || track.name}
                    </h2>
                    <p className="mt-2 line-clamp-1 text-sm text-gray-400">{artistLine(track)}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-gray-500">{track.albumName || 'Unknown album'}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>{track.releaseYear || track.releaseDate?.slice(0, 4) || '----'}</span>
                      <span>{formatDuration(track.durationMs)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchTerm && tracks && tracks.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
            No songs found for "{searchTerm}".
          </div>
        )}

        {searchTerm && isError && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-center">
            <p className="font-semibold text-red-200">Could not fetch songs.</p>
            <p className="mt-2 text-sm text-red-200/70">
              {(error as any)?.response?.data?.error || 'Spotify API is not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend .env.'}
            </p>
          </div>
        )}

        {!searchTerm && (
          <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
            <SearchIcon className="mx-auto mb-4 h-10 w-10 text-gray-700" />
            <p className="text-gray-400">Search for a song to start a single-track review.</p>
          </div>
        )}
      </div>
    </main>
  )
}
