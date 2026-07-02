import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Disc3, ExternalLink, Loader2, UserRound } from 'lucide-react'
import { getArtist, getArtistAlbums, getSpotifyImageProxyUrl } from '../lib/api'

interface ArtistProfileData {
  id: string
  name: string
  imageUrl?: string | null
  genres?: string[]
  followersTotal?: number | null
  popularity?: number | null
  spotifyUrl?: string | null
}

interface AlbumArtist {
  id?: string
  name: string
}

interface ArtistAlbum {
  id: string
  name: string
  title?: string
  artists: AlbumArtist[]
  releaseDate?: string
  releaseYear?: string
  imageUrl?: string | null
  totalTracks?: number
  albumType?: string | null
  spotifyUrl?: string | null
}

function formatFollowers(value?: number | null) {
  if (value === null || value === undefined) {
    return null
  }

  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function releaseYear(album: ArtistAlbum) {
  return album.releaseYear || album.releaseDate?.slice(0, 4) || '----'
}

function albumCover(album: ArtistAlbum) {
  return getSpotifyImageProxyUrl(album.imageUrl) || album.imageUrl || null
}

function artistImage(artist?: ArtistProfileData) {
  return getSpotifyImageProxyUrl(artist?.imageUrl) || artist?.imageUrl || null
}

export default function ArtistProfile() {
  const { id } = useParams()
  const artistId = id || ''

  const artistQuery = useQuery<ArtistProfileData>({
    queryKey: ['instagram-artist', artistId],
    queryFn: () => getArtist(artistId).then((res) => res.data),
    enabled: !!artistId,
  })

  const albumsQuery = useQuery<ArtistAlbum[]>({
    queryKey: ['instagram-artist-albums', artistId],
    queryFn: () => getArtistAlbums(artistId).then((res) => res.data),
    enabled: !!artistId,
  })

  const artist = artistQuery.data
  const albums = albumsQuery.data || []
  const isLoading = artistQuery.isLoading || albumsQuery.isLoading
  const isError = artistQuery.isError || albumsQuery.isError
  const errorMessage =
    (artistQuery.error as any)?.response?.data?.error ||
    (albumsQuery.error as any)?.response?.data?.error ||
    'Spotify API is not configured. Add Spotify credentials to backend .env.'
  const followers = formatFollowers(artist?.followersTotal)

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-9 w-9 animate-spin text-cyan-200" />
      </main>
    )
  }

  if (!artist || isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/instagram/artists" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to artists
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Artist profile cannot load.</h1>
          <p className="mt-3 text-red-100/80">{errorMessage}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center justify-between">
          <Link to="/instagram/artists" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Artists
          </Link>
          <Link to="/instagram/albums" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <Disc3 className="h-4 w-4" />
            Search albums
          </Link>
        </nav>

        <section className="mb-10 grid gap-6 rounded-xl border border-gray-800 bg-gray-900 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
          {artistImage(artist) ? (
            <img src={artistImage(artist) || undefined} alt="" className="aspect-square w-full rounded-lg object-cover sm:w-[180px]" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-800 text-gray-500 sm:w-[180px]">
              <UserRound className="h-14 w-14" />
            </div>
          )}

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Artist profile</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">{artist.name}</h1>
            <p className="mt-3 max-w-3xl text-gray-400">
              {artist.genres?.length ? artist.genres.slice(0, 6).join(', ') : 'No genres listed'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-gray-700 px-3 py-1 text-gray-300">Popularity {artist.popularity ?? '-'}</span>
              {followers && <span className="rounded-full border border-gray-700 px-3 py-1 text-gray-300">{followers} followers</span>}
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 px-3 py-1 text-cyan-100 transition hover:border-cyan-200"
                >
                  Spotify
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Albums and EPs</h2>
              <p className="mt-1 text-sm text-gray-400">Pick a release to open the Instagram review builder.</p>
            </div>
            <span className="text-sm text-gray-500">{albums.length} releases</span>
          </div>

          {albums.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/instagram/albums/${album.id}`}
                  className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 text-left transition hover:-translate-y-1 hover:border-cyan-300"
                >
                  {albumCover(album) ? (
                    <img src={albumCover(album) || undefined} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-800 text-gray-500">
                      <Disc3 className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-semibold text-white group-hover:text-cyan-100">
                      {album.title || album.name}
                    </h3>
                    <p className="mt-2 line-clamp-1 text-sm text-gray-400">
                      {album.artists?.map((item) => item.name).join(', ') || artist.name}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>{releaseYear(album)}</span>
                      <span>{album.albumType || 'album'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{album.totalTracks ?? 0} tracks</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center">
              <Disc3 className="mx-auto mb-4 h-10 w-10 text-gray-700" />
              <p className="text-gray-400">This artist has no albums or EPs returned by Spotify.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
