import { ReviewTheme } from '../../types/instagramReview'

export interface ThemePreset {
  name: string
  theme: ReviewTheme
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Purple Night',
    theme: {
      backgroundColor: '#4c1d95',
      cardColor: '#1f1833',
      textColor: '#ffffff',
      accentColor: '#c4b5fd',
      coverFrameColor: '#ffffff',
      shadowIntensity: 34,
      borderRadius: 28,
    },
  },
  {
    name: 'Soft Green',
    theme: {
      backgroundColor: '#14532d',
      cardColor: '#102a1d',
      textColor: '#f0fdf4',
      accentColor: '#86efac',
      coverFrameColor: '#dcfce7',
      shadowIntensity: 28,
      borderRadius: 24,
    },
  },
  {
    name: 'Cherry Red',
    theme: {
      backgroundColor: '#7f1d1d',
      cardColor: '#2f1111',
      textColor: '#fff1f2',
      accentColor: '#fda4af',
      coverFrameColor: '#ffe4e6',
      shadowIntensity: 36,
      borderRadius: 22,
    },
  },
  {
    name: 'Cream Paper',
    theme: {
      backgroundColor: '#f5efe1',
      cardColor: '#fffaf0',
      textColor: '#1f2937',
      accentColor: '#b45309',
      coverFrameColor: '#111827',
      shadowIntensity: 22,
      borderRadius: 18,
    },
  },
  {
    name: 'Black Metal',
    theme: {
      backgroundColor: '#020617',
      cardColor: '#09090b',
      textColor: '#f8fafc',
      accentColor: '#e5e7eb',
      coverFrameColor: '#52525b',
      shadowIntensity: 52,
      borderRadius: 8,
    },
  },
  {
    name: 'Pastel Pink',
    theme: {
      backgroundColor: '#fbcfe8',
      cardColor: '#fff1f2',
      textColor: '#3f1231',
      accentColor: '#db2777',
      coverFrameColor: '#ffffff',
      shadowIntensity: 20,
      borderRadius: 30,
    },
  },
]

export default function ThemePresetPicker({ onSelect }: { onSelect: (theme: ReviewTheme) => void }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-300">Theme presets</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset.theme)}
            className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-3 text-left text-sm font-semibold text-gray-200 transition hover:border-pink-300 hover:text-white"
          >
            <span className="flex shrink-0 gap-1">
              <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: preset.theme.backgroundColor }} />
              <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: preset.theme.cardColor }} />
              <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: preset.theme.accentColor }} />
            </span>
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  )
}
