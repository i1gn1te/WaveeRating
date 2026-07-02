import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Music, Search, Star, ListMusic, User, LogOut, Menu, X, Users } from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  basePath?: string
}

export default function Layout({ basePath = '' }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathTo = (path = '') => `${basePath}${path}` || '/'

  const handleLogout = async () => {
    await logout()
    navigate(pathTo(''))
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nawigacja */}
      <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <Link to={pathTo('')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WaveeRating</span>
            </Link>

            {/* Nawigacja desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link to={pathTo('/dashboard')} className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to={pathTo('/search')} className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Szukaj
                </Link>
                <Link to={pathTo('/reviews')} className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Recenzje
                </Link>
                <Link to={pathTo('/generator')} className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  Generator
                </Link>
                <Link to={pathTo('/community')} className="text-gray-300 hover:text-white transition flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Społeczność
                </Link>
              </div>
            )}

            {/* Menu usera */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to={pathTo('/profile')} className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="text-sm">{user?.displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  
                  {/* Przycisk menu mobile */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-gray-300"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </>
              ) : (
                <Link
                  to={pathTo('/login')}
                  className="px-4 py-2 bg-spotify-green text-white rounded-full text-sm font-medium hover:bg-green-500 transition"
                >
                  Zaloguj przez Spotify
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <Link to={pathTo('/dashboard')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to={pathTo('/search')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Szukaj
              </Link>
              <Link to={pathTo('/reviews')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Recenzje
              </Link>
              <Link to={pathTo('/generator')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Generator
              </Link>
              <Link to={pathTo('/community')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Społeczność
              </Link>
              <Link to={pathTo('/profile')} className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Profil
              </Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                Wyloguj
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Glowna tresc */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Stopka */}
      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>WaveeRating - Rate music. Build beautiful reviews. Share them anywhere.</p>
          <p className="mt-2">Powered by Spotify Web API</p>
        </div>
      </footer>
    </div>
  )
}

