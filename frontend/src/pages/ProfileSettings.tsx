import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { getMyProfile, updateMyProfile } from '../lib/profilesApi'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileSettings() {
  const { refetchUser } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isProfilePublic, setIsProfilePublic] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMyProfile({
        username: username || null,
        displayName: displayName || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
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

  if (profileQuery.isLoading) {
    return <Loading />
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/instagram/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
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
          <Field label="Username">
            <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder="wavee.user" className={fieldClassName} />
          </Field>
          <Field label="Display name">
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your display name" className={fieldClassName} />
          </Field>
          <Field label="Bio">
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={300} placeholder="A short music bio..." className={fieldClassName} />
          </Field>
          <Field label="Avatar URL">
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." className={fieldClassName} />
          </Field>
          <label className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-200">
            <input type="checkbox" checked={isProfilePublic} onChange={(event) => setIsProfilePublic(event.target.checked)} />
            Public profile
          </label>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-300">{label}</span>
      <div className="mt-2">{children}</div>
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
