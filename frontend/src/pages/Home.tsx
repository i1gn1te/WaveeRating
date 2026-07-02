import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Music, Star, Sparkles, ListMusic, TrendingUp } from 'lucide-react'
import { queryClient } from '../main'
import { API_BASE_URL } from '../lib/api'

export default function Home() {
  const { isAuthenticated, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      queryClient.clear()

      const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await refetchUser()
        navigate('/dashboard')
      } else {
        const error = await response.json()
        alert(`Błąd: ${error.error || 'Demo login nie powiódł się'}`)
      }
    } catch (error) {
      console.error('Demo login error:', error)
      alert('Błąd podczas logowania demo')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="space-y-16">
      {/* Sekcja glowna */}
      <section className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Odkryj swoją <span className="text-primary-400">muzyczną tożsamość</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            WaveeRating helps you rate music, build beautiful reviews, and share them anywhere.
            Review albums, EPs, and songs while building your music profile.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col items-center gap-3">
              <Link
                to="/classic/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-spotify-green text-white rounded-full text-lg font-semibold hover:bg-green-500 transition-all hover:scale-105"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Zaloguj przez Spotify
              </Link>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-full text-base font-semibold hover:bg-gray-700 transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {demoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                {demoLoading ? 'Logowanie...' : 'Zaloguj w trybie demo'}
              </button>
            </div>
          )}
          {isAuthenticated && (
            <Link
              to="/classic/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-full text-lg font-semibold hover:bg-primary-600 transition-all hover:scale-105"
            >
              Przejdź do Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Funkcje */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-primary-500/50 transition">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Recenzuj muzykę</h3>
          <p className="text-gray-400 text-sm">
            Oceniaj albumy, EP i piosenki, zapisuj recenzje i pokazuj swoje muzyczne wybory.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-primary-500/50 transition">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Personalne rekomendacje</h3>
          <p className="text-gray-400 text-sm">
            Odkrywaj nowe utwory na podstawie Twojego gustu i wysoko ocenionych piosenek.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-primary-500/50 transition">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Analiza utworów</h3>
          <p className="text-gray-400 text-sm">
            Poznaj tempo, tonację, energię i inne cechy każdego utworu.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-primary-500/50 transition">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <ListMusic className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Twórz playlisty</h3>
          <p className="text-gray-400 text-sm">
            Buduj playlisty i synchronizuj je bezpośrednio ze Spotify.
          </p>
        </div>
      </section>

      {/* Jak to dziala */}
      <section className="bg-gray-900/30 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Jak to działa?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Połącz ze Spotify</h3>
            <p className="text-gray-400 text-sm">
              Zaloguj się przez swoje konto Spotify, aby uzyskać dostęp do swojej biblioteki muzycznej.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Recenzuj i odkrywaj</h3>
            <p className="text-gray-400 text-sm">
              Oceniaj swoje ulubione utwory i przeglądaj szczegółową analizę każdej piosenki.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Otrzymuj rekomendacje</h3>
            <p className="text-gray-400 text-sm">
              Na podstawie Twoich recenzji otrzymujesz spersonalizowane propozycje nowych utworów.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

