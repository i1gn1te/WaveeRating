import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Disc3, Music2 } from 'lucide-react'

export default function InstagramRate() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-10 flex items-center justify-between">
          <Link to="/instagram" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Instagram Review Generator
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/instagram/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
              <BookOpen className="h-4 w-4" />
              Library
            </Link>
            <Link to="/feed" className="text-sm text-gray-400 transition hover:text-white">
              Feed
            </Link>
            <Link to="/profile/settings" className="text-sm text-gray-400 transition hover:text-white">
              Profile
            </Link>
            <Link to="/" className="text-sm text-gray-400 transition hover:text-white">
              Tryby
            </Link>
          </div>
        </nav>

        <section className="flex flex-1 flex-col justify-center">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Choose rating mode</p>
            <h1 className="mt-3 text-4xl font-black tracking-normal text-white sm:text-5xl">What do you want to rate?</h1>
            <p className="mt-4 text-lg text-gray-400">
              Start with a full album or EP, or prepare a single-song review draft.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/instagram/albums"
              className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-pink-400"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/15 text-pink-200">
                <Disc3 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-white group-hover:text-pink-100">Rate Album / EP</h2>
              <p className="mt-3 text-gray-400">
                Search Spotify albums, rate every track, set album categories, and export Instagram slides.
              </p>
            </Link>

            <Link
              to="/instagram/songs"
              className="group rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-cyan-300"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-100">
                <Music2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-white group-hover:text-cyan-100">Rate Song</h2>
              <p className="mt-3 text-gray-400">
                Search Spotify tracks, score categories, and export a single-song Instagram review slide.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
