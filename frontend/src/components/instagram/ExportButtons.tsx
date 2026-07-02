import { RefObject, useMemo, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Image, Loader2 } from 'lucide-react'
import { EXPORT_SLIDE_HEIGHT, EXPORT_SLIDE_WIDTH, ReviewAlbum, SlideStyle } from './SlidePreviews'

type ExportKey = string

interface ExportTargets {
  coverSlideRef: RefObject<HTMLDivElement>
  albumReviewSlideRef: RefObject<HTMLDivElement>
  trackRatingsSlideRef?: RefObject<HTMLDivElement>
  bestTrackSlideRef: RefObject<HTMLDivElement>
  worstTrackSlideRef: RefObject<HTMLDivElement>
}

interface ExportButtonsProps {
  album: ReviewAlbum
  style: SlideStyle
  targets: ExportTargets
  orderedTargets?: AlbumExportTarget[]
}

export interface AlbumExportTarget {
  key: ExportKey
  label: string
  filename: string
  ref: RefObject<HTMLDivElement>
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

export default function ExportButtons({ album, style, targets, orderedTargets }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<ExportKey | 'all' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportTargets = useMemo<AlbumExportTarget[]>(() => {
    if (orderedTargets) {
      return orderedTargets
    }

    const artist = slugify(album.artists?.[0]?.name || 'unknown-artist')
    const title = slugify(album.title || album.name || 'album')
    const base = `${artist}-${title}`

    return [
      { key: 'cover', label: 'Cover Slide', filename: `${base}-cover.png`, ref: targets.coverSlideRef },
      { key: 'review', label: 'Album Review Slide', filename: `${base}-review.png`, ref: targets.albumReviewSlideRef },
      { key: 'best', label: 'Best Track Slide', filename: `${base}-best-track.png`, ref: targets.bestTrackSlideRef },
      { key: 'worst', label: 'Worst Track Slide', filename: `${base}-worst-track.png`, ref: targets.worstTrackSlideRef },
    ]
  }, [album, orderedTargets, targets])

  const exportSlide = async (target: AlbumExportTarget) => {
    const node = target.ref.current
    if (!node) {
      throw new Error(`${target.label} is not ready yet.`)
    }

    if (import.meta.env.DEV) {
      console.info('[WaveeRating Export]', {
        type: target.key,
        entityId: album.id,
        imageUrl: album.imageUrl || null,
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
      throw new Error(`${target.label} exported at ${dimensions.width}x${dimensions.height}, expected ${EXPORT_SLIDE_WIDTH}x${EXPORT_SLIDE_HEIGHT}.`)
    }

    downloadDataUrl(dataUrl, target.filename)
    return dimensions
  }

  const handleExport = async (target: AlbumExportTarget) => {
    setExporting(target.key)
    setMessage(null)
    setError(null)

    try {
      await exportSlide(target)
      setMessage('PNG exported.')
    } catch (err) {
      console.error('[Instagram Export] Failed:', err)
      setError('Could not export PNG. Try again.')
    } finally {
      setExporting(null)
    }
  }

  const handleExportAll = async () => {
    setExporting('all')
    setMessage(null)
    setError(null)

    try {
      if (exportTargets.length === 0) {
        throw new Error('No active slides selected.')
      }

      for (const target of exportTargets) {
        await exportSlide(target)
      }
      setMessage('PNG exported.')
    } catch (err) {
      console.error('[Instagram Export] Export all failed:', err)
      setError('Could not export PNG. Try again.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Export PNG</h2>
          <p className="mt-1 text-sm text-gray-400">1080x1350 Instagram-ready slides.</p>
        </div>
        {exporting && <Loader2 className="h-5 w-5 animate-spin text-pink-300" />}
      </div>

      <div className="mt-4 grid gap-2">
        {exportTargets.map((target) => (
          <button
            key={target.key}
            type="button"
            onClick={() => handleExport(target)}
            disabled={!!exporting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-pink-400 hover:text-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting === target.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting === target.key ? 'Exporting...' : target.label}
          </button>
        ))}

        <button
          type="button"
          onClick={handleExportAll}
          disabled={!!exporting || exportTargets.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting === 'all' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          {exporting === 'all' ? 'Exporting...' : 'Download all slides'}
        </button>
      </div>

      {message && <p className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
      {error && <p className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
    </section>
  )
}
