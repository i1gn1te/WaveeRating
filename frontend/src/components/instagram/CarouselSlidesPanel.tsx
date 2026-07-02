import { ArrowDown, ArrowUp } from 'lucide-react'
import { CarouselSlideConfig } from '../../types/instagramReview'

interface CarouselSlidesPanelProps<T extends string> {
  slides: CarouselSlideConfig<T>[]
  onToggle: (id: T) => void
  onMove: (id: T, direction: -1 | 1) => void
}

export default function CarouselSlidesPanel<T extends string>({ slides, onToggle, onMove }: CarouselSlidesPanelProps<T>) {
  const enabledCount = slides.filter((slide) => slide.enabled).length

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <h2 className="text-xl font-bold text-white">Carousel Slides</h2>
      <p className="mt-1 text-sm text-gray-400">Toggle slides and move them up or down before exporting.</p>

      <div className="mt-4 grid gap-2">
        {slides.map((slide, index) => (
          <div key={slide.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-3">
            <label className="flex min-w-0 items-center gap-3">
              <input
                type="checkbox"
                checked={slide.enabled}
                onChange={() => onToggle(slide.id)}
                disabled={slide.enabled && enabledCount <= 1}
              />
              <span className="min-w-0 truncate text-sm font-semibold text-gray-100">{slide.label}</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMove(slide.id, -1)}
                disabled={index === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-700 text-gray-300 transition hover:border-pink-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                title="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMove(slide.id, 1)}
                disabled={index === slides.length - 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-700 text-gray-300 transition hover:border-pink-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                title="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
