import { RefObject, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Loader2 } from 'lucide-react'
import { ReviewTheme, SongDraftTrackData } from '../../types/instagramReview'
import { EXPORT_SLIDE_HEIGHT, EXPORT_SLIDE_WIDTH } from './SlidePreviews'

interface SongExportButtonProps {
  track: SongDraftTrackData
  style: ReviewTheme
  targetRef: RefObject<HTMLDivElement>
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function getImageDimensions(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Exported PNG could not be inspected.'))
    image.src = dataUrl
  })
}

function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll('img'))

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve()
            return
          }

          const done = () => resolve()
          image.addEventListener('load', done, { once: true })
          image.addEventListener('error', done, { once: true })
          window.setTimeout(done, 3000)
        })
    )
  )
}

export default function SongExportButton({ track, style, targetRef }: SongExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportSongReview = async () => {
    const node = targetRef.current
    const stalePreviewMessage = 'Could not export: stale song preview. Refresh and try again.'
    const expectedImageUrl = track.imageUrl || ''

    if (!node) {
      throw new Error('Song Review Slide is not ready yet.')
    }

    if (node.dataset.exportType !== 'song-review') {
      throw new Error(stalePreviewMessage)
    }

    if (node.dataset.entityId !== track.id) {
      throw new Error(stalePreviewMessage)
    }

    if ((node.dataset.imageUrl || '') !== expectedImageUrl) {
      if (import.meta.env.DEV) {
        console.warn('[WaveeRating Export] Stale song image before PNG export.', {
          type: 'song-review',
          trackId: track.id,
          expectedImageUrl,
          actualImageUrl: node.dataset.imageUrl || '',
        })
      }

      throw new Error(stalePreviewMessage)
    }

    if (import.meta.env.DEV) {
      console.info('[WaveeRating Export]', {
        type: 'song-review',
        entityId: track.id,
        imageUrl: track.imageUrl || null,
        nodeEntityId: node.dataset.entityId || null,
        nodeImageUrl: node.dataset.imageUrl || null,
      })
    }

    await waitForImages(node)

    const exportStyle = {
      width: `${EXPORT_SLIDE_WIDTH}px`,
      height: `${EXPORT_SLIDE_HEIGHT}px`,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      transform: 'none',
      backgroundColor: style.backgroundColor,
      color: style.textColor,
      borderRadius: `${style.borderRadius}px`,
      '--slide-bg': style.backgroundColor,
      '--slide-card': style.cardColor,
      '--slide-text': style.textColor,
      '--slide-accent': style.accentColor,
      '--slide-cover-frame': style.coverFrameColor,
      '--slide-shadow': String(style.shadowIntensity),
      '--slide-radius': `${style.borderRadius}px`,
    } as Partial<CSSStyleDeclaration> & Record<string, string>

    const dataUrl = await toPng(node, {
      cacheBust: true,
      skipFonts: true,
      pixelRatio: 1,
      width: EXPORT_SLIDE_WIDTH,
      height: EXPORT_SLIDE_HEIGHT,
      canvasWidth: EXPORT_SLIDE_WIDTH,
      canvasHeight: EXPORT_SLIDE_HEIGHT,
      backgroundColor: style.backgroundColor,
      style: exportStyle,
    })

    const dimensions = await getImageDimensions(dataUrl)
    if (dimensions.width !== EXPORT_SLIDE_WIDTH || dimensions.height !== EXPORT_SLIDE_HEIGHT) {
      throw new Error(`Song Review Slide exported at ${dimensions.width}x${dimensions.height}, expected ${EXPORT_SLIDE_WIDTH}x${EXPORT_SLIDE_HEIGHT}.`)
    }

    const artist = slugify(track.artists?.[0]?.name || 'unknown-artist')
    const title = slugify(track.title || track.name || 'song')
    downloadDataUrl(dataUrl, `${artist}-${title}-review.png`)
    return dimensions
  }

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    setError(null)

    try {
      await exportSongReview()
      setMessage('PNG exported.')
    } catch (err) {
      console.error('[Instagram Song Export] Failed:', err)
      setError((err as Error)?.message || 'Could not export PNG. Try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Song Review Export</h2>
          <p className="mt-1 text-sm text-gray-400">Export the current 1080x1350 song review PNG.</p>
        </div>
        {exporting && <Loader2 className="h-5 w-5 animate-spin text-cyan-200" />}
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {exporting ? 'Exporting...' : 'Export Song Review PNG'}
      </button>

      {message && <p className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
      {error && <p className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
    </section>
  )
}
