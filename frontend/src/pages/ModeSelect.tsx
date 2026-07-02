import { Link } from 'react-router-dom'
import { ArrowRight, Disc3, Image, Music2 } from 'lucide-react'

export default function ModeSelect() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-300">
            <Music2 className="h-4 w-4 text-primary-400" />
            WaveeBW
          </div>
          <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">
            Wybierz tryb pracy
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Classic zostawia dotychczasowa aplikacje, a Instagram Review Generator otwiera nowy modul do tworzenia muzycznych slajdow.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Link
            to="/classic"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-primary-500 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
                <Disc3 className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-primary-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">WaveeBW Classic</h2>
            <p className="mt-3 text-gray-400">
              Obecna wersja aplikacji: dashboard, wyszukiwarka utworow, recenzje, playlisty i profil.
            </p>
          </Link>

          <Link
            to="/instagram"
            className="group rounded-xl border border-gray-800 bg-gray-900 p-7 transition hover:border-pink-400 hover:bg-gray-900/80"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/15 text-pink-300">
                <Image className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-pink-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Instagram Review Generator</h2>
            <p className="mt-3 text-gray-400">
              Nowa sekcja do przygotowywania albumowych recenzji i slajdow pod format Instagrama.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
