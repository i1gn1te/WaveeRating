import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFollowingFeed } from '../lib/profilesApi'
import { Loading, ReviewCard, ReviewGrid, TopNav } from './PublicProfile'
import usePageTitle from '../hooks/usePageTitle'

export default function FollowingFeed() {
  usePageTitle('Feed')
  const query = useQuery({
    queryKey: ['following-feed'],
    queryFn: () => getFollowingFeed().then((res) => res.data),
  })
  if (query.isLoading) return <Loading />
  if (query.isError) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <TopNav />
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-red-100">
            <h1 className="text-2xl font-bold">Feed cannot load.</h1>
            <p className="mt-3 text-red-100/80">{(query.error as any)?.response?.data?.error || 'Could not load following activity.'}</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-5 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-bold text-red-100 transition hover:border-red-100 hover:text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }
  const items = query.data || []
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TopNav />
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Feed</p>
          <h1 className="mt-2 text-3xl font-black">Following activity</h1>
        </section>
        {items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-10 text-center text-gray-400">
            Follow people to build your music feed.
            <div className="mt-4">
              <Link to="/artists" className="inline-flex items-center justify-center rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400">
                Search artists
              </Link>
            </div>
          </div>
        ) : (
          <ReviewGrid emptyText="Follow people to build your music feed.">
            {items.map((item: any) => <ReviewCard key={`${item.type}-${item.id}`} review={item} type={item.type} />)}
          </ReviewGrid>
        )}
      </div>
    </main>
  )
}
