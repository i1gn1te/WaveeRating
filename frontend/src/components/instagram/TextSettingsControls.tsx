import { SlideTextSettings } from '../../types/instagramReview'

interface TextSettingsControlsProps {
  value: SlideTextSettings
  onChange: (value: SlideTextSettings) => void
}

export default function TextSettingsControls({ value, onChange }: TextSettingsControlsProps) {
  const update = <K extends keyof SlideTextSettings>(key: K, nextValue: SlideTextSettings[K]) => {
    onChange({ ...value, [key]: nextValue })
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-300">Text controls</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
          Title size
          <select
            value={value.titleSize}
            onChange={(event) => update('titleSize', event.target.value as SlideTextSettings['titleSize'])}
            className="mt-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
          Body size
          <select
            value={value.bodySize}
            onChange={(event) => update('bodySize', event.target.value as SlideTextSettings['bodySize'])}
            className="mt-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
          Font mood
          <select
            value={value.fontMood}
            onChange={(event) => update('fontMood', event.target.value as SlideTextSettings['fontMood'])}
            className="mt-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-white outline-none"
          >
            <option value="clean">Clean</option>
            <option value="editorial">Editorial</option>
            <option value="bold">Bold</option>
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={value.uppercaseHeadings}
            onChange={(event) => update('uppercaseHeadings', event.target.checked)}
          />
          Uppercase headings
        </label>
      </div>
    </div>
  )
}
