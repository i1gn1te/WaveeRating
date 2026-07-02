import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Disc3, Loader2, Search as SearchIcon, UserRound } from 'lucide-react'
import { getSpotifyImageProxyUrl, searchArtists } from '../lib/api'

interface ArtistResult {
  id: string
  name: string
  imageUrl?: string | null
  genres?: string[]
  followersTotal?: number | null
  popularity?: number | null
  spotifyUrl?: string | null
}

function formatFollowers(value?: number | null) {
  if (value === null || value === undefined) {
    return null
  }

  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function artistImage(artist: ArtistResult) {
  return getSpotifyImageProxyUrl(artist.imageUrl) || artist.imageUrl || null
}

export default function ArtistSearch() {
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: artists, isLoading, isFetching, isError, error } = useQuery<ArtistResult[]>({
    queryKey: ['instagram-artist-search', searchTerm],
    queryFn: () => searchArtists(searchTerm).then((res) => res.data),
    enabled: searchTerm.length > 0,
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextQuery = query.trim()
    if (nextQuery) {
      setSearchTerm(nextQuery)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center justify-between">
          <Link to="/instagram" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Instagram Review Generator
          </Link>
          <Link to="/instagram/albums" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <Disc3 className="h-4 w-4" />
            Search albums
          </Link>
        </nav>

        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
            <UserRound className="h-4 w-4" />
            Artist profiles
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">Search Spotify artists</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Find an artist first, then pick one of their albums or EPs for the review builder.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type artist name..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900 py-4 pl-12 pr-36 text-white placeholder-gray-500 transition focus:border-cyan-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || isFetching}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg bg-cyan-500 px-5 py-2 font-medium text-gray-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
          </div>
        )}

        {artists && artists.length > 0 && (
          <div>
            <p className="mb-4 text-gray-400">Found {artists.length} artists</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {artists.map((artist) => {
                const followers = formatFollowers(artist.followersTotal)

                return (
                  <Link
                    key={artist.id}
                    to={`/instagram/artists/${artist.id}`}
                    className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 text-left transition hover:-translate-y-1 hover:border-cyan-300"
                  >
                    {artistImage(artist) ? (
                      <img src={artistImage(artist) || undefined} alt="" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
                        <UserRound className="h-12 w-12" />
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="line-clamp-2 min-h-[3.5rem] text-base font-semibold text-white group-hover:text-cyan-100">
                        {artist.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-gray-400">
                        {artist.genres?.length ? artist.genres.slice(0, 3).join(', ') : 'No genres listed'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Popularity {artist.popularity ?? '-'}</span>
                        {followers && <span>{followers} followers</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {searchTerm && artists && artists.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
            No artists found for "{searchTerm}".
          </div>
        )}

        {searchTerm && isError && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-center">
            <p className="font-semibold text-red-200">Could not load artists.</p>
            <p className="mt-2 text-sm text-red-200/70">
              {(error as any)?.response?.data?.error || 'Spotify API is not configured. Add Spotify credentials to backend .env.'}
            </p>
          </div>
        )}

        {!searchTerm && (
          <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
            <SearchIcon className="mx-auto mb-4 h-10 w-10 text-gray-700" />
            <p className="text-gray-400">Type an artist name to browse artist profiles.</p>
          </div>
        )}
      </div>
    </main>
  )
}
