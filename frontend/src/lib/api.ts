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

// Uzytkownik
export const getUserProfile = () => api.get('/user/profile')
export const updateGenres = (genres: string[]) => api.put('/user/genres', { genres })
export const updateProfile = (data: { bio?: string; displayName?: string; favoriteGenres?: string[] }) => 
  api.put('/user/profile', data)
export const getUserStats = () => api.get('/user/stats')
export const searchUsers = (query: string) => api.get('/user/search', { params: { q: query } })
export const getPublicUser = (userId: string) => api.get(`/user/${userId}`)

// Spotify
export const searchTracks = (query: string) => api.get('/spotify/search', { params: { q: query } })
export const getTrackDetails = (trackId: string) => api.get(`/spotify/track/${trackId}`)
export const getAudioFeatures = (trackId: string) => api.get(`/spotify/audio-features/${trackId}`)
export const getTopTracks = (timeRange = 'medium_term') => api.get('/spotify/top/tracks', { params: { timeRange } })
export const getTopArtists = (timeRange = 'medium_term') => api.get('/spotify/top/artists', { params: { timeRange } })
export const getAvailableGenres = () => api.get('/spotify/genres')
export const searchAlbums = (query: string) => api.get('/spotify/search-albums', { params: { q: query, limit: 4 } })
export const getAlbum = (albumId: string) => api.get(`/spotify/albums/${albumId}`)
export const getAlbumTracks = (albumId: string) => api.get(`/spotify/albums/${albumId}/tracks`)
export const searchArtists = (query: string) => api.get('/spotify/search-artists', { params: { q: query, limit: 4 } })
export const getArtist = (artistId: string) => api.get(`/spotify/artists/${artistId}`)
export const getArtistAlbums = (artistId: string) => api.get(`/spotify/artists/${artistId}/albums`, { params: { limit: 20 } })
export const searchPublicTracks = (query: string) => api.get('/spotify/search-tracks', { params: { q: query, limit: 4 } })
export const getPublicTrack = (trackId: string) => api.get(`/spotify/tracks/${trackId}`)
export const getSpotifyImageProxyUrl = (url?: string | null) =>
  url ? `${API_BASE_URL}/spotify/image-proxy?url=${encodeURIComponent(url)}` : null

// Recenzje
export const createReview = (data: { trackId: string; rating: number; content?: string }) => 
  api.post('/reviews', data)
export const getMyReviews = (page = 1) => api.get('/reviews/my', { params: { page } })
export const getTrackReviews = (trackId: string) => api.get(`/reviews/track/${trackId}`)
export const deleteReview = (reviewId: string) => api.delete(`/reviews/${reviewId}`)
export const getRecentReviews = () => api.get('/reviews')

// Playlisty
export const createPlaylist = (data: { name: string; description?: string }) => 
  api.post('/playlists', data)
export const getMyPlaylists = () => api.get('/playlists/my')
export const getPlaylist = (playlistId: string) => api.get(`/playlists/${playlistId}`)
export const addTrackToPlaylist = (playlistId: string, track: any) => 
  api.post(`/playlists/${playlistId}/tracks`, track)
export const syncPlaylistToSpotify = (playlistId: string) => 
  api.post(`/playlists/${playlistId}/sync`)

// Generator list odtwarzania
export const getSimilarTracks = (trackId: string) => 
  api.get(`/recommendations/similar/${trackId}`)
export const discoverGenre = (genre: string) => 
  api.get(`/recommendations/discover/${genre}`)

export default api

