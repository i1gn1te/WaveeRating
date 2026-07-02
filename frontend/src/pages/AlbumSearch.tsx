import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Disc3, Loader2, Search as SearchIcon, UserRound } from 'lucide-react'
import { searchAlbums } from '../lib/api'
import usePageTitle from '../hooks/usePageTitle'

interface AlbumArtist {
  id: string
  name: string
}

interface AlbumResult {
  id: string
  name: string
  title?: string
  artists: AlbumArtist[]
  releaseYear?: string
  releaseDate?: string
  imageUrl?: string | null
  totalTracks?: number
  spotifyUrl?: string | null
}

function getReleaseYear(album: AlbumResult) {
  return album.releaseYear || album.releaseDate?.slice(0, 4) || '----'
}

function getCover(album: AlbumResult) {
  return album.imageUrl
}

export default function AlbumSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  usePageTitle('Rate Album')

  const { data: albums, isLoading, isFetching, isError, error, refetch } = useQuery<AlbumResult[]>({
    queryKey: ['instagram-album-search', searchTerm],
    queryFn: () => searchAlbums(searchTerm).then((res) => res.data),
    enabled: searchTerm.length > 0,
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextQuery = query.trim()
    if (nextQuery) {
      setSearchTerm(nextQuery)
    }
  }

  const handleAlbumClick = (album: AlbumResult) => {
    console.log('[WaveeRating] selected album ID:', album.id)
    navigate(`/albums/${album.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            WaveeRating
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/artists" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <UserRound className="h-4 w-4" />
              Search by artist
            </Link>
            <Link to="/" className="text-sm text-gray-400 transition hover:text-white">
              Home
            </Link>
          </div>
        </nav>

        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
            <Disc3 className="h-4 w-4" />
            Album picker
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">Search Spotify albums</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Pick an album or EP, write a review, and export Instagram-ready slides.
          </p>
          <Link to="/artists" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
            <UserRound className="h-4 w-4" />
            Search by artist
          </Link>
        </section>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type an album, EP, artist, or both..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900 py-4 pl-12 pr-36 text-white placeholder-gray-500 transition focus:border-pink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || isFetching}
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg bg-pink-500 px-5 py-2 font-medium text-white transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-14">
            <Loader2 className="h-8 w-8 animate-spin text-pink-300" />
          </div>
        )}

        {albums && albums.length > 0 && (
          <div>
            <p className="mb-4 text-gray-400">Found {albums.length} albums</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {albums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => handleAlbumClick(album)}
                  className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 text-left transition hover:-translate-y-1 hover:border-pink-400"
                >
                  {getCover(album) ? (
                    <img src={getCover(album) || undefined} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
                      <Disc3 className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="line-clamp-2 min-h-[3.5rem] text-base font-semibold text-white group-hover:text-pink-200">
                      {album.title || album.name}
                    </h2>
                    <p className="mt-2 line-clamp-1 text-sm text-gray-400">
                      {album.artists?.map((artist) => artist.name).join(', ') || 'Unknown artist'}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>{getReleaseYear(album)}</span>
                      <span>{album.totalTracks ?? 0} tracks</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchTerm && !isError && albums && albums.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center text-gray-400">
            No albums found.
          </div>
        )}

        {searchTerm && isError && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-center">
            <p className="font-semibold text-red-200">Could not fetch albums.</p>
            <p className="mt-2 text-sm text-red-200/70">
              {(error as any)?.response?.data?.error || 'Spotify API is not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend .env.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-bold text-red-100 transition hover:border-red-100 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!searchTerm && (
          <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
            <SearchIcon className="mx-auto mb-4 h-10 w-10 text-gray-700" />
            <p className="text-gray-400">Search for an album or EP to start your review.</p>
          </div>
        )}
      </div>
    </main>
  )
}
