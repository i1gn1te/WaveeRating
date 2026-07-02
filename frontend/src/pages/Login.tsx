import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { API_BASE_URL, getLoginUrl, localLogin, register } from '../lib/api'
import { Loader2, Music } from 'lucide-react'
import { queryClient } from '../main'

export default function Login() {
  const { isAuthenticated, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        auth_failed: 'Spotify login failed. Try again.',
        no_code: 'Missing Spotify authorization code. Try again.',
        code_reused: 'Spotify authorization code was already used. Start login again.',
      }
      setError(errorMessages[errorParam] || `Login error: ${errorParam}`)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/classic/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSpotifyLogin = async () => {
    setError(null)
    try {
      const { data } = await getLoginUrl()

      if (data.demoMode) {
        setError(data.message || 'Spotify API is not configured. Use demo mode or configure backend env.')
        return
      }

      if (!data.url) {
        setError('Cannot start Spotify login.')
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Failed to get login URL:', error)
      setError((error as any)?.response?.data?.error || 'Cannot start Spotify login.')
    }
  }

  const handleLocalAuth = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLocalLoading(true)

    try {
      queryClient.clear()
      if (authMode === 'register') {
        await register({ email, password, displayName: displayName.trim() || undefined })
      } else {
        await localLogin({ email, password })
      }
      await refetchUser()
      navigate('/classic/dashboard')
    } catch (error) {
      setError((error as any)?.response?.data?.error || 'Authentication failed. Check credentials and backend configuration.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError(null)
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
        navigate('/classic/dashboard')
      } else {
        const body = await response.json()
        setError(body.error || 'Demo login failed.')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setError('Demo login failed. Check backend health.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
            <Music className="h-10 w-10 text-primary-400" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">Log in to WaveeBW</h1>
        <p className="mb-6 text-gray-400">Use Spotify, local account, or demo mode.</p>

        {error && (
          <div className="mb-5 rounded-lg border border-red-700 bg-red-950/60 p-4 text-left">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        <form onSubmit={handleLocalAuth} className="mb-5 space-y-3 text-left">
          <div className="grid grid-cols-2 rounded-lg bg-gray-950 p-1">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`rounded-md py-2 text-sm font-semibold transition ${authMode === 'login' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`rounded-md py-2 text-sm font-semibold transition ${authMode === 'register' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {authMode === 'register' && (
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-500"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            minLength={6}
            className="w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-primary-500"
            required
          />
          <button
            type="submit"
            disabled={localLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {localLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {authMode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>

        <button
          onClick={handleSpotifyLogin}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-[#1DB954] py-3 font-semibold text-white transition hover:bg-[#1aa34a]"
        >
          Continue with Spotify
        </button>

        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-800 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {demoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5 text-gray-400" />}
          {demoLoading ? 'Logging in...' : 'Demo mode'}
        </button>

        <p className="mt-5 text-sm text-gray-500">Demo mode does not require Spotify or database setup.</p>
      </div>
    </div>
  )
}
