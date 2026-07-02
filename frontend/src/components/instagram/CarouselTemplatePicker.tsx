import { CarouselStylePreset, SlideTemplate, SlideTemplateId } from '../../types/instagramReview'

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'signature-cover',
    name: 'Signature Cover',
    slideType: 'cover',
    layout: 'signature',
    fontStyle: 'bold',
    coverPosition: 'center',
    scoreStyle: 'badge',
    textBoxStyle: 'solid-card',
    vibe: 'Bold WaveeRating look with a large cover and strong score treatment.',
  },
  {
    id: 'editorial-review',
    name: 'Editorial Review',
    slideType: 'review',
    layout: 'editorial',
    fontStyle: 'editorial',
    coverPosition: 'left',
    scoreStyle: 'minimal',
    textBoxStyle: 'editorial',
    vibe: 'Magazine-like spacing, lighter surfaces, and calmer typography.',
  },
  {
    id: 'poster-score',
    name: 'Poster Score',
    slideType: 'score',
    layout: 'poster',
    fontStyle: 'bold',
    coverPosition: 'background',
    scoreStyle: 'poster',
    textBoxStyle: 'outlined',
    vibe: 'High-contrast poster layout with oversized title and score.',
  },
  {
    id: 'minimal-card',
    name: 'Minimal Card',
    slideType: 'review',
    layout: 'minimal',
    fontStyle: 'clean',
    coverPosition: 'compact',
    scoreStyle: 'bar',
    textBoxStyle: 'solid-card',
    vibe: 'Quiet layout for short captions and compact summaries.',
  },
  {
    id: 'magazine-layout',
    name: 'Magazine Layout',
    slideType: 'review',
    layout: 'magazine',
    fontStyle: 'editorial',
    coverPosition: 'top',
    scoreStyle: 'badge',
    textBoxStyle: 'editorial',
    vibe: 'Editorial hierarchy with cover, columns, and clear review blocks.',
  },
  {
    id: 'compact-summary',
    name: 'Compact Summary',
    slideType: 'summary',
    layout: 'compact',
    fontStyle: 'clean',
    coverPosition: 'compact',
    scoreStyle: 'bar',
    textBoxStyle: 'solid-card',
    vibe: 'Dense layout tuned for track lists and score breakdowns.',
  },
]

export const CAROUSEL_STYLE_PRESETS: CarouselStylePreset[] = [
  {
    id: 'signature-purple',
    name: 'Signature Purple',
    description: 'WaveeRating energy: large cover, strong shadow, big score.',
    templateId: 'signature-cover',
    theme: {
      backgroundColor: '#4c1d95',
      cardColor: '#1f1833',
      textColor: '#ffffff',
      accentColor: '#c4b5fd',
      coverFrameColor: '#ffffff',
      shadowIntensity: 34,
      borderRadius: 28,
    },
    textSettings: {
      titleSize: 'medium',
      bodySize: 'medium',
      uppercaseHeadings: true,
      fontMood: 'bold',
    },
  },
  {
    id: 'minimal-editorial',
    name: 'Minimal Editorial',
    description: 'Bright, spacious, calmer magazine-style slide.',
    templateId: 'editorial-review',
    theme: {
      backgroundColor: '#f5efe1',
      cardColor: '#fffaf0',
      textColor: '#1f2937',
      accentColor: '#b45309',
      coverFrameColor: '#111827',
      shadowIntensity: 18,
      borderRadius: 18,
    },
    textSettings: {
      titleSize: 'medium',
      bodySize: 'large',
      uppercaseHeadings: false,
      fontMood: 'editorial',
    },
  },
  {
    id: 'dark-poster',
    name: 'Dark Poster',
    description: 'Dark, high-contrast poster with oversized title and score.',
    templateId: 'poster-score',
    theme: {
      backgroundColor: '#020617',
      cardColor: '#09090b',
      textColor: '#f8fafc',
      accentColor: '#38bdf8',
      coverFrameColor: '#e5e7eb',
      shadowIntensity: 54,
      borderRadius: 10,
    },
    textSettings: {
      titleSize: 'large',
      bodySize: 'medium',
      uppercaseHeadings: true,
      fontMood: 'bold',
    },
  },
]

export function getTemplate(id: SlideTemplateId) {
  return SLIDE_TEMPLATES.find((template) => template.id === id) || SLIDE_TEMPLATES[0]
}

interface CarouselTemplatePickerProps {
  selectedId: string
  onSelect: (preset: CarouselStylePreset) => void
}

export default function CarouselTemplatePicker({ selectedId, onSelect }: CarouselTemplatePickerProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-300">Slide Style / Template</p>
      <div className="grid gap-3 md:grid-cols-3">
        {CAROUSEL_STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            className={`rounded-lg border p-3 text-left transition ${
              selectedId === preset.id
                ? 'border-pink-300 bg-pink-500/10 text-white'
                : 'border-gray-800 bg-gray-900 text-gray-200 hover:border-pink-300 hover:text-white'
            }`}
          >
            <span className="mb-3 grid h-16 grid-cols-3 overflow-hidden rounded-md border border-white/10">
              <span style={{ backgroundColor: preset.theme.backgroundColor }} />
              <span style={{ backgroundColor: preset.theme.cardColor }} />
              <span style={{ backgroundColor: preset.theme.accentColor }} />
            </span>
            <span className="block font-bold">{preset.name}</span>
            <span className="mt-1 block text-xs leading-5 text-gray-400">{preset.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
