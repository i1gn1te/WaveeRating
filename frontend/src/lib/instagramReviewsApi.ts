import api from './api'
import { ReviewArtist, ReviewTheme, ReviewVisibility } from '../types/instagramReview'
export type { ReviewVisibility }

export interface AlbumReviewPayload {
  spotifyAlbumId: string
  albumTitle: string
  albumArtists: ReviewArtist[]
  albumImageUrl?: string | null
  releaseDate?: string | null
  releaseYear?: number | null
  albumType?: string | null
  finalScore: number
  trackAverage?: number | null
  albumCategoryAverage?: number | null
  bestTrackTitle?: string | null
  weakestTrackTitle?: string | null
  reviewTitle?: string | null
  reviewBody?: string | null
  finalRecommendation?: string | null
  theme?: ReviewTheme | null
  ratingData: unknown
  slideData?: unknown
  isDraft?: boolean
  isPublic?: boolean
  visibility?: ReviewVisibility
}

export interface SongReviewPayload {
  spotifyTrackId: string
  trackTitle: string
  trackArtists: ReviewArtist[]
  albumId?: string | null
  albumTitle?: string | null
  imageUrl?: string | null
  durationMs?: number | null
  finalScore: number
  reviewTitle?: string | null
  reviewBody?: string | null
  finalRecommendation?: string | null
  theme?: ReviewTheme | null
  ratingData: unknown
  slideData?: unknown
  isDraft?: boolean
  isPublic?: boolean
  visibility?: ReviewVisibility
}

export interface ReviewListParams {
  drafts?: boolean
  limit?: number
  offset?: number
}

export const saveAlbumReview = (payload: AlbumReviewPayload) => api.post('/-reviews/albums', payload)
export const getAlbumReviews = (params: ReviewListParams = {}) => api.get('/-reviews/albums', { params })
export const getAlbumReview = (id: string) => api.get(`/-reviews/albums/${id}`)
export const updateAlbumReview = (id: string, payload: Partial<AlbumReviewPayload>) => api.put(`/-reviews/albums/${id}`, payload)
export const deleteAlbumReview = (id: string) => api.delete(`/-reviews/albums/${id}`)

export const saveSongReview = (payload: SongReviewPayload) => api.post('/-reviews/songs', payload)
export const getSongReviews = (params: ReviewListParams = {}) => api.get('/-reviews/songs', { params })
export const getSongReview = (id: string) => api.get(`/-reviews/songs/${id}`)
export const updateSongReview = (id: string, payload: Partial<SongReviewPayload>) => api.put(`/-reviews/songs/${id}`, payload)
export const deleteSongReview = (id: string) => api.delete(`/-reviews/songs/${id}`)
