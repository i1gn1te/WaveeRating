import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPublicProfileAlbums } from '../lib/profilesApi'
import { ErrorState, Loading, ReviewCard, ReviewGrid, TopNav } from './PublicProfile'

export default function PublicProfileAlbums() {
  const { username = '' } = useParams()
  const query = useQuery({
    queryKey: ['public-profile-albums', username],
    queryFn: () => getPublicProfileAlbums(username).then((res) => res.data),
    enabled: !!username,
  })
  if (query.isLoading) return <Loading />
  if (query.isError) return <ErrorState message={(query.error as any)?.response?.data?.error || 'Album reviews not found.'} />
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TopNav />
        <h1 className="text-3xl font-black">@{username} album reviews</h1>
        <Link to={`/u/${username}`} className="mt-2 inline-block text-sm text-gray-400 hover:text-white">Back to profile</Link>
        <ReviewGrid emptyText="No public album reviews.">
          {(query.data || []).map((review: any) => <ReviewCard key={review.id} review={review} type="album" />)}
        </ReviewGrid>
      </div>
    </main>
  )
}
