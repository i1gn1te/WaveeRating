import { RefObject, useState } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { Archive, Loader2 } from 'lucide-react'
import { ReviewTheme } from '../../types/instagramReview'
import { EXPORT_SLIDE_HEIGHT, EXPORT_SLIDE_WIDTH } from './SlidePreviews'

export interface ZipSlideTarget {
  filename: string
  label: string
  ref: RefObject<HTMLDivElement>
}

interface CarouselZipExportButtonProps {
  label?: string
  zipFilename: string
  style: ReviewTheme
  targets: ZipSlideTarget[]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function dataUrlToBase64(dataUrl: string) {
  return dataUrl.split(',')[1] || ''
}

async function exportSlide(ref: RefObject<HTMLDivElement>, style: ReviewTheme) {
  if (!ref.current) {
    throw new Error('One of the slides is not ready yet.')
  }

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

  return toPng(ref.current, {
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
}

export default function CarouselZipExportButton({ label = 'Export Carousel ZIP', zipFilename, style, targets }: CarouselZipExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    setError(null)

    try {
      if (targets.length === 0) {
        throw new Error('No active slides selected.')
      }

      const zip = new JSZip()

      for (const target of targets) {
        const dataUrl = await exportSlide(target.ref, style)
        zip.file(target.filename, dataUrlToBase64(dataUrl), { base64: true })
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, zipFilename)
      setMessage(`ZIP exported (${targets.length} slide${targets.length === 1 ? '' : 's'}).`)
    } catch (err) {
      console.error('[Instagram ZIP Export] Failed:', err)
      setError((err as Error)?.message || 'ZIP export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Export ZIP</h2>
          <p className="mt-1 text-sm text-gray-400">Pack carousel PNGs into one file.</p>
        </div>
        {exporting && <Loader2 className="h-5 w-5 animate-spin text-pink-300" />}
      </div>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting || targets.length === 0}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:border-pink-400 hover:text-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
        {exporting ? 'Exporting ZIP...' : label}
      </button>

      {message && <p className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">{message}</p>}
      {error && <p className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
    </section>
  )
}
