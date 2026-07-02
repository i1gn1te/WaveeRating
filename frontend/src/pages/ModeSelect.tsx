import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Disc3, Image, Music2, Users } from 'lucide-react'

export default function ModeSelect() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-300">
            <Music2 className="h-4 w-4 text-primary-400" />
            WaveeRating
          </div>
          <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">
            Rate music. Build beautiful reviews. Share them anywhere.
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Rate albums, EPs, and songs, grow your music profile, follow friends, save reviews, and export polished PNG/ZIP slides when you want to share.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/instagram/rate"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-primary-500 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
                <Disc3 className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-primary-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Rate Music</h2>
            <p className="mt-3 text-gray-400">
              Start a review for an album, EP, or single song.
            </p>
          </Link>

          <Link
            to="/instagram/profile"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-pink-400 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/15 text-pink-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Review Library</h2>
            <p className="mt-3 text-gray-400">
              Keep drafts, published reviews, themes, and export-ready slides in one place.
            </p>
          </Link>

          <Link
            to="/feed"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-violet-400 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
                <Users className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-violet-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Friend Feed</h2>
            <p className="mt-3 text-gray-400">
              Follow people and see their public album and song ratings.
            </p>
          </Link>

          <Link
            to="/instagram/albums"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-cyan-300 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-100">
                <Image className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
            </div>
            <h2 className="text-2xl font-bold text-white">Instagram-Ready Export</h2>
            <p className="mt-3 text-gray-400">
              Design review slides and export them as PNG or ZIP files.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
