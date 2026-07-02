import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { BookOpen, Disc3, LogOut, Menu, Music2, Rss, Settings, UserRound, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const publicProfileHref = user?.username ? `/u/${user.username}` : '/profile/settings'

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const authedLinks = [
    { to: '/rate', label: 'Rate', icon: Disc3 },
    { to: '/artists', label: 'Artists', icon: Music2 },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/feed', label: 'Feed', icon: Rss },
    { to: '/profile/settings', label: 'Profile Settings', icon: Settings },
    { to: publicProfileHref, label: 'Public Profile', icon: UserRound },
  ]

  const guestLinks = [
    { to: '/rate', label: 'Rate', icon: Disc3 },
    { to: '/artists', label: 'Artists', icon: Music2 },
  ]

  const links = isAuthenticated ? authedLinks : guestLinks

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-cyan-400">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-normal text-white">WaveeRating</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <ProductNavLink key={link.to} to={link.to} label={link.label} icon={link.icon} />
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-36 truncate text-sm text-gray-400">{user?.displayName || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-400/70 hover:text-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-300 transition hover:text-white">
                  Login
                </Link>
                <Link
                  to="/login?mode=register"
                  className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg border border-gray-800 p-2 text-gray-300 transition hover:text-white md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-800 bg-gray-950 px-4 py-4 md:hidden">
            <div className="space-y-2">
              {links.map((link) => (
                <MobileNavLink key={link.to} to={link.to} label={link.label} onClick={() => setMobileMenuOpen(false)} />
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-200 transition hover:bg-gray-900"
                >
                  Logout
                </button>
              ) : (
                <>
                  <MobileNavLink to="/login" label="Login" onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavLink to="/login?mode=register" label="Register" onClick={() => setMobileMenuOpen(false)} />
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>WaveeRating - Rate music. Build beautiful reviews. Share them anywhere.</p>
          <p className="mt-2">Powered by Spotify Web API</p>
        </div>
      </footer>
    </div>
  )
}

function ProductNavLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Disc3 }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-900"
    >
      {label}
    </Link>
  )
}
