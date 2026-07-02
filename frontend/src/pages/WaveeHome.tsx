import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Disc3, Music2, Rss, Search, Sparkles, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import usePageTitle from '../hooks/usePageTitle'

const productCards = [
  {
    title: 'Rate Album / EP',
    description: 'Rate albums, EPs and songs.',
    href: '/albums',
    icon: Disc3,
    accent: 'text-pink-200 bg-pink-500/15 border-pink-400/40',
  },
  {
    title: 'Rate Song',
    description: 'Create focused single-track reviews with detailed scoring.',
    href: '/songs',
    icon: Music2,
    accent: 'text-cyan-100 bg-cyan-400/15 border-cyan-300/40',
  },
  {
    title: 'Explore Artists',
    description: 'Find artists on Spotify and jump into their albums.',
    href: '/artists',
    icon: Search,
    accent: 'text-emerald-100 bg-emerald-400/15 border-emerald-300/40',
  },
  {
    title: 'My Library',
    description: 'Build your music review library.',
    href: '/library',
    icon: BookOpen,
    accent: 'text-violet-100 bg-violet-400/15 border-violet-300/40',
  },
  {
    title: 'Feed',
    description: 'Follow friends and discover their ratings.',
    href: '/feed',
    icon: Rss,
    accent: 'text-amber-100 bg-amber-400/15 border-amber-300/40',
  },
]

export default function WaveeHome() {
  const { user, isAuthenticated } = useAuth()
  const publicProfileHref = user?.username ? `/u/${user.username}` : '/profile/settings'
  usePageTitle()

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-100">
            <Sparkles className="h-4 w-4" />
            WaveeRating
          </div>
          <h1 className="text-4xl font-black tracking-normal text-white sm:text-6xl">
            Rate music. Build beautiful reviews. Share them anywhere.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-400">
            Save reviews to your profile, export beautiful Instagram-ready slides, and follow friends as they build their own music libraries.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <ActionLink to="/albums">Rate Album</ActionLink>
              <ActionLink to="/songs">Rate Song</ActionLink>
              <ActionLink to="/library">My Library</ActionLink>
              <ActionLink to="/feed">Feed</ActionLink>
              <ActionLink to={publicProfileHref}>Public Profile</ActionLink>
            </>
          ) : (
            <>
              <ActionLink to="/rate">Start rating without account</ActionLink>
              <ActionLink to="/login">Log in to save reviews</ActionLink>
              <ActionLink to="/login?mode=register">Register</ActionLink>
            </>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {productCards.map((card) => {
            const Icon = card.icon

            return (
              <Link
                key={card.title}
                to={card.href}
                className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-pink-300/70 hover:bg-gray-900/80"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${card.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-pink-200" />
                </div>
                <h2 className="text-xl font-black text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{card.description}</p>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-5 md:grid-cols-3">
          <Feature icon={Disc3} label="Rate albums, EPs and songs." />
          <Feature icon={BookOpen} label="Save reviews to your profile." />
          <Feature icon={Users} label="Follow friends and discover their ratings." />
        </div>
      </section>
    </main>
  )
}

function ActionLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-bold text-gray-100 transition hover:border-pink-300 hover:bg-gray-800"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

function Feature({ icon: Icon, label }: { icon: typeof Disc3; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-gray-200">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-pink-200">
        <Icon className="h-4 w-4" />
      </div>
      {label}
    </div>
  )
}
