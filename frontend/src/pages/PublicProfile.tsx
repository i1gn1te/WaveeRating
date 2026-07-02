import { ReactNode, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Copy, Loader2, UserPlus, UserMinus } from 'lucide-react'
import { followUser, getPublicProfile, unfollowUser } from '../lib/profilesApi'
import { useAuth } from '../contexts/AuthContext'
import { copyTextToClipboard } from '../lib/clipboard'
import usePageTitle from '../hooks/usePageTitle'

export default function PublicProfile() {
  const { username = '' } = useParams()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const profileQuery = useQuery({
    queryKey: ['public-profile', username],
    queryFn: () => getPublicProfile(username).then((res) => res.data),
    enabled: !!username,
    retry: false,
  })
  const profile = profileQuery.data
  usePageTitle(profile ? `${profile.displayName || profile.username}` : username ? `@${username}` : 'Public Profile')
  const isOwnProfile = profile?.isOwnProfile || user?.username === username
  const followMutation = useMutation({
    mutationFn: () => (profile?.isFollowing ? unfollowUser(username) : followUser(username)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-profile', username] }),
  })
  const recent = useMemo(() => {
    const albums = (profile?.latestAlbumReviews || []).map((review: any) => ({ ...review, type: 'album' }))
    const songs = (profile?.latestSongReviews || []).map((review: any) => ({ ...review, type: 'song' }))
    return [...albums, ...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [profile])

  const handleCopyProfileLink = async () => {
    setCopyMessage(null)
    setCopyError(null)

    try {
      await copyTextToClipboard(window.location.href)
      setCopyMessage('Link copied.')
    } catch (err) {
      setCopyError((err as Error)?.message || 'Copy failed. Copy the URL from your browser address bar.')
    }
  }

  if (profileQuery.isLoading) return <Loading />
  if (!profile || profileQuery.isError) {
    return <ErrorState message={(profileQuery.error as any)?.response?.data?.error || 'Profile not found.'} onRetry={() => profileQuery.refetch()} />
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TopNav />
        <section className="grid gap-6 rounded-xl border border-gray-800 bg-gray-900 p-6 md:grid-cols-[120px_1fr_auto]">
          <Avatar src={profile.avatarUrl} name={profile.displayName || profile.username} />
          <div>
            <h1 className="text-3xl font-black">{profile.displayName || profile.username}</h1>
            <p className="mt-1 text-gray-400">@{profile.username}</p>
            {profile.bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-gray-300">{profile.bio}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Albums / EPs" value={profile.counts?.albumReviews || 0} />
              <Stat label="Songs" value={profile.counts?.songReviews || 0} />
              <Stat label="Followers" value={profile.counts?.followers || 0} />
              <Stat label="Following" value={profile.counts?.following || 0} />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-center text-sm font-bold text-gray-100 hover:border-cyan-300"
            >
              <Copy className="h-4 w-4" />
              Copy profile link
            </button>
            {isOwnProfile ? (
              <Link to="/profile/settings" className="rounded-lg border border-gray-700 px-4 py-2 text-center text-sm font-bold text-gray-100 hover:border-pink-300">
                Edit profile
              </Link>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-400 disabled:opacity-60"
              >
                {profile.isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            ) : (
              <Link to="/login" className="rounded-lg border border-gray-700 px-4 py-2 text-center text-sm font-bold text-gray-100 hover:border-pink-300">
                Login to follow
              </Link>
            )}
            {copyMessage && <p className="text-sm text-emerald-200">{copyMessage}</p>}
            {copyError && <p className="text-sm text-red-200">{copyError}</p>}
          </div>
        </section>

        <div className="mt-6 grid gap-2 rounded-xl border border-gray-800 bg-gray-950 p-2 sm:grid-cols-3">
          <Link className="rounded-lg bg-pink-500 px-4 py-3 text-center text-sm font-bold text-white" to={`/u/${username}`}>
            Recent
          </Link>
          <Link className="rounded-lg px-4 py-3 text-center text-sm font-bold text-gray-400 hover:bg-gray-900 hover:text-white" to={`/u/${username}/albums`}>
            Albums / EPs
          </Link>
          <Link className="rounded-lg px-4 py-3 text-center text-sm font-bold text-gray-400 hover:bg-gray-900 hover:text-white" to={`/u/${username}/songs`}>
            Songs
          </Link>
        </div>

        <ReviewGrid emptyText="No public reviews yet.">
          {recent.map((review: any) => <ReviewCard key={`${review.type}-${review.id}`} review={review} type={review.type} />)}
        </ReviewGrid>
      </div>
    </main>
  )
}

export function TopNav() {
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <Link to="/rate" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Rate
      </Link>
      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
        <Link to="/library" className="hover:text-white">My Library</Link>
        <Link to="/feed" className="hover:text-white">Feed</Link>
        <Link to="/profile/settings" className="hover:text-white">Profile Settings</Link>
      </div>
    </nav>
  )
}

export function Avatar({ src, name }: { src?: string | null; name: string }) {
  return src ? (
    <img src={src} alt="" className="h-28 w-28 rounded-xl object-cover" />
  ) : (
    <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-800 text-3xl font-black text-gray-400">
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  )
}

export function ReviewGrid({ children, emptyText }: { children: ReactNode; emptyText: string }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children
  if (Array.isArray(items) && items.length === 0) {
    return <div className="mt-8 rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center text-gray-400">{emptyText}</div>
  }
  return <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function ReviewCard({ review, type }: { review: any; type: 'album' | 'song' }) {
  const title = type === 'album' ? review.albumTitle : review.trackTitle
  const image = type === 'album' ? review.albumImageUrl : review.imageUrl
  const subtitle = type === 'album' ? artistLine(review.albumArtists) : `${artistLine(review.trackArtists)}${review.albumTitle ? ` - ${review.albumTitle}` : ''}`
  return (
    <Link to={`/reviews/${type === 'album' ? 'albums' : 'songs'}/${review.id}`} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-pink-300">
      {image ? <img src={image} alt="" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-gray-800" />}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-gray-800 px-2.5 py-1 text-xs font-bold uppercase text-gray-300">{type}</span>
          <span className="text-2xl font-black text-pink-200">{Number(review.finalScore).toFixed(1)}</span>
        </div>
        <h3 className="line-clamp-2 font-bold text-white">{title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-gray-400">{subtitle}</p>
        {review.user?.username && (
          <p className="mt-2 text-xs font-semibold text-gray-500">
            by @{review.user.username}
          </p>
        )}
      </div>
    </Link>
  )
}

export function artistLine(value: unknown) {
  if (!Array.isArray(value)) return 'Unknown artist'
  return value.map((artist) => (artist && typeof artist === 'object' && 'name' in artist ? String(artist.name) : '')).filter(Boolean).join(', ') || 'Unknown artist'
}

export function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <Loader2 className="h-8 w-8 animate-spin text-pink-300" />
    </main>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
        <TopNav />
        <h1 className="text-2xl font-bold text-red-100">Could not load this page.</h1>
        <p className="mt-3 text-red-100/80">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-bold text-red-100 transition hover:border-red-100 hover:text-white"
          >
            Retry
          </button>
        )}
      </div>
    </main>
  )
}
