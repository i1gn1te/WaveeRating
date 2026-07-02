import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFollowingFeed } from '../lib/profilesApi'
import { Loading, ReviewCard, ReviewGrid, TopNav } from './PublicProfile'

export default function FollowingFeed() {
  const query = useQuery({
    queryKey: ['following-feed'],
    queryFn: () => getFollowingFeed().then((res) => res.data),
  })
  if (query.isLoading) return <Loading />
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
              <Link to="/instagram/profile" className="text-pink-200 underline underline-offset-4">Go to your library</Link>
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
