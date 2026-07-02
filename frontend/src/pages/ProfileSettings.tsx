import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { getMyProfile, updateMyProfile } from '../lib/profilesApi'
import { useAuth } from '../contexts/AuthContext'
import usePageTitle from '../hooks/usePageTitle'

const USERNAME_PATTERN = /^[a-z0-9_.]+$/

function isValidUrl(value: string) {
  if (!value.trim()) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateProfileForm({
  username,
  displayName,
  bio,
  avatarUrl,
  isProfilePublic,
}: {
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  isProfilePublic: boolean
}) {
  const errors: Record<string, string> = {}
  const normalizedUsername = username.trim()

  if (isProfilePublic && !normalizedUsername) {
    errors.username = 'Username is required for a public profile.'
  } else if (normalizedUsername && (normalizedUsername.length < 3 || normalizedUsername.length > 24)) {
    errors.username = 'Username must be 3-24 characters.'
  } else if (normalizedUsername && !USERNAME_PATTERN.test(normalizedUsername)) {
    errors.username = 'Use lowercase letters, numbers, underscore, or dot only.'
  }

  if (displayName.length > 40) {
    errors.displayName = 'Display name must be 40 characters or fewer.'
  }

  if (bio.length > 300) {
    errors.bio = 'Bio must be 300 characters or fewer.'
  }

  if (!isValidUrl(avatarUrl)) {
    errors.avatarUrl = 'Avatar URL must start with http:// or https://.'
  }

  return errors
}

export default function ProfileSettings() {
  const { refetchUser } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isProfilePublic, setIsProfilePublic] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  usePageTitle('Profile Settings')

  const profileQuery = useQuery({
    queryKey: ['my-profile-settings'],
    queryFn: () => getMyProfile().then((res) => res.data),
  })

  useEffect(() => {
    const profile = profileQuery.data
    if (!profile) return
    setUsername(profile.username || '')
    setDisplayName(profile.displayName || '')
    setBio(profile.bio || '')
    setAvatarUrl(profile.avatarUrl || '')
    setIsProfilePublic(profile.isProfilePublic !== false)
  }, [profileQuery.data])

  const fieldErrors = useMemo(
    () => validateProfileForm({ username, displayName, bio, avatarUrl, isProfilePublic }),
    [avatarUrl, bio, displayName, isProfilePublic, username]
  )
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        username: username.trim() || null,
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        isProfilePublic,
      }),
    onSuccess: async () => {
      setMessage('Profile saved.')
      setError(null)
      await refetchUser()
      await profileQuery.refetch()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Failed to save profile.')
      setMessage(null)
    },
  })

  const handleSave = () => {
    setMessage(null)

    if (hasFieldErrors) {
      setError('Fix the highlighted fields before saving.')
      return
    }

    saveMutation.mutate()
  }

  if (profileQuery.isLoading) {
    return <Loading />
  }

  if (profileQuery.isError) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-800 bg-red-950/40 p-8">
          <Link to="/library" className="mb-6 inline-flex items-center gap-2 text-sm text-red-100/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            My Library
          </Link>
          <h1 className="text-2xl font-bold text-red-100">Profile settings cannot load.</h1>
          <p className="mt-3 text-red-100/80">{(profileQuery.error as any)?.response?.data?.error || 'Could not load your profile.'}</p>
          <button
            type="button"
            onClick={() => profileQuery.refetch()}
            className="mt-5 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-bold text-red-100 transition hover:border-red-100 hover:text-white"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/library" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            My Library
          </Link>
          {username && (
            <Link to={`/u/${username}`} className="text-sm text-gray-400 hover:text-white">
              Public Profile
            </Link>
          )}
        </nav>

        <section className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-300">Profile settings</p>
          <h1 className="mt-2 text-3xl font-black">Your music identity</h1>
          <p className="mt-2 text-gray-400">Username powers your public profile URL: /u/username.</p>
        </section>

        <section className="grid gap-5 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <Field label="Username" error={fieldErrors.username} hint="Required for your public profile URL. Use lowercase letters, numbers, underscore, or dot.">
            <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="wavee.user" className={fieldClassName} />
          </Field>
          <Field label="Display name" error={fieldErrors.displayName} hint={`${displayName.length}/40 characters`}>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={41} placeholder="Your display name" className={fieldClassName} />
          </Field>
          <Field label="Bio" error={fieldErrors.bio} hint={`${bio.length}/300 characters`}>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={301} placeholder="A short music bio..." className={fieldClassName} />
          </Field>
          <Field label="Avatar URL" error={fieldErrors.avatarUrl} hint="Optional. Use a full http:// or https:// image URL.">
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." className={fieldClassName} />
          </Field>
          <label className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-200">
            <input type="checkbox" checked={isProfilePublic} onChange={(event) => setIsProfilePublic(event.target.checked)} />
            Public profile
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-400 disabled:opacity-60"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
          {message && <p className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
          {error && <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
        </section>
      </div>
    </main>
  )
}

const fieldClassName = 'w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-pink-400'

function Field({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-2 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-2 block text-sm text-red-200">{error}</span>}
    </label>
  )
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <Loader2 className="h-8 w-8 animate-spin text-pink-300" />
    </main>
  )
}
