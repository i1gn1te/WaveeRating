import { Link } from 'react-router-dom'
import { Loader2, Save } from 'lucide-react'

interface ReviewSaveActionsProps {
  isAuthenticated: boolean
  isSaving: boolean
  message: string | null
  error: string | null
  onSaveDraft: () => void
  onSaveToProfile: () => void
}

export default function ReviewSaveActions({
  isAuthenticated,
  isSaving,
  message,
  error,
  onSaveDraft,
  onSaveToProfile,
}: ReviewSaveActionsProps) {
  const loginError = error?.toLowerCase().includes('log in')
  const visibleError = isAuthenticated || !loginError ? error : null

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Save review</h2>
          <p className="mt-1 text-sm text-gray-400">Drafts are private and editable later. Publishing follows Public or Private visibility.</p>
        </div>
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin text-pink-300" /> : <Save className="h-5 w-5 text-gray-500" />}
      </div>

      {!isAuthenticated && (
        <div className="mt-4 rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-sm text-amber-100">
          Log in to save drafts or publish reviews to your profile.
          <Link to="/login" className="ml-2 font-semibold underline underline-offset-4 hover:text-white">
            Login
          </Link>
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || !isAuthenticated}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-pink-400 hover:text-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save as Draft
          </button>
          <p className="mt-2 text-xs leading-5 text-gray-500">Save an unfinished review privately and continue later.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={onSaveToProfile}
            disabled={isSaving || !isAuthenticated}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publish to Profile
          </button>
          <p className="mt-2 text-xs leading-5 text-gray-500">Save this review to your profile using selected visibility.</p>
        </div>
      </div>

      {message && <p className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
      {visibleError && <p className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{visibleError}</p>}
    </section>
  )
}
