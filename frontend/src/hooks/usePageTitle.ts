import { useEffect } from 'react'

const APP_NAME = 'WaveeRating'

export default function usePageTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME
  }, [title])
}
