import axios from 'axios'

function getApiBaseURL() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

  if (!configuredUrl) {
    return '/api'
  }

  return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`
}

export const API_BASE_URL = getApiBaseURL()

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const requestUrl: string = originalRequest?.url || ''

    const shouldSkipRefresh =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/me') ||
      requestUrl.includes('/auth/demo-login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout')

    if (!originalRequest || status !== 401 || originalRequest._retry || shouldSkipRefresh) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh').then(() => undefined).finally(() => {
          refreshPromise = null
        })
      }

      await refreshPromise
      return api(originalRequest)
    } catch {
      return Promise.reject(error)
    }
  }
)

// Logowanie
export const getLoginUrl = () => api.get<{ url: string | null; demoMode?: boolean; message?: string }>('/auth/login')
export const getCurrentUser = () => api.get('/auth/me')
export const localLogin = (data: { email: string; password: string }) => api.post('/auth/local-login', data)
export const register = (data: { email: string; password: string; displayName?: string }) => api.post('/auth/register', data)
export const logout = () => api.post('/auth/logout')

// Spotify
export const searchAlbums = (query: string) => api.get('/spotify/search-albums', { params: { q: query, limit: 4 } })
export const getAlbum = (albumId: string) => api.get(`/spotify/albums/${albumId}`)
export const getAlbumTracks = (albumId: string) => api.get(`/spotify/albums/${albumId}/tracks`)
export const searchArtists = (query: string) => api.get('/spotify/search-artists', { params: { q: query, limit: 4 } })
export const getArtist = (artistId: string) => api.get(`/spotify/artists/${artistId}`)
export const getArtistAlbums = (artistId: string) => api.get(`/spotify/artists/${artistId}/albums`, { params: { limit: 20 } })
export const searchPublicTracks = (query: string) => api.get('/spotify/search-tracks', { params: { q: query, limit: 4 } })
export const getPublicTrack = (trackId: string) => api.get(`/spotify/tracks/${trackId}`)
export const getSpotifyImageProxyUrl = (url?: string | null, cacheKey?: string | null) => {
  if (!url) {
    return null
  }

  const params = new URLSearchParams({ url })

  if (cacheKey) {
    params.set('cacheKey', cacheKey)
  }

  return `${API_BASE_URL}/spotify/image-proxy?${params.toString()}`
}

export default api

