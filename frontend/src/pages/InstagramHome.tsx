import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Image, ListChecks, Search, Sparkles, UserRound } from 'lucide-react'

export default function InstagramHome() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            WaveeRating
          </Link>
          <Link to="/classic" className="text-sm text-gray-400 transition hover:text-white">
            Music tools
          </Link>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <Link to="/feed" className="transition hover:text-white">Feed</Link>
            <Link to="/profile/settings" className="transition hover:text-white">Profile</Link>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
              <Image className="h-4 w-4" />
              WaveeRating
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-white sm:text-5xl">
              Rate music. Build beautiful reviews. Share them anywhere.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-400">
              Search Spotify, save reviews to your library, publish your music profile, follow friends, and export Instagram-ready PNG/ZIP slides.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/instagram/rate"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-5 py-3 font-semibold text-white transition hover:bg-pink-400"
              >
                <ListChecks className="h-5 w-5" />
                Rate music
              </Link>
              <Link
                to="/instagram/albums"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-5 py-3 font-semibold text-gray-200 transition hover:border-pink-400 hover:bg-gray-900"
              >
                <Search className="h-5 w-5" />
                Szukaj albumu
              </Link>
              <Link
                to="/instagram/artists"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 px-5 py-3 font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-500/10"
              >
                <UserRound className="h-5 w-5" />
                Szukaj artysty
              </Link>
              <Link
                to="/instagram/profile"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 px-5 py-3 font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-500/10"
              >
                <BookOpen className="h-5 w-5" />
                Library
              </Link>
              <Link
                to="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/40 px-5 py-3 font-semibold text-violet-100 transition hover:border-violet-200 hover:bg-violet-500/10"
              >
                Feed
              </Link>
              <Link
                to="/classic/search"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-5 py-3 font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-900"
              >
                Spotify tools
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/15 text-pink-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">WaveeRating</p>
                <p className="text-sm text-gray-400">Ratings, profiles, exports</p>
              </div>
            </div>
            <div className="grid gap-3">
              {['Rate Album / EP', 'Rate Song', 'Publish review profile'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/70 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-sm text-gray-300">
                    {index + 1}
                  </span>
                  <span className="text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
