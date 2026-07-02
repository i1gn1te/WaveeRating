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

export const saveAlbumReview = (payload: AlbumReviewPayload) => api.post('/instagram-reviews/albums', payload)
export const getAlbumReviews = (params: ReviewListParams = {}) => api.get('/instagram-reviews/albums', { params })
export const getAlbumReview = (id: string) => api.get(`/instagram-reviews/albums/${id}`)
export const updateAlbumReview = (id: string, payload: Partial<AlbumReviewPayload>) => api.put(`/instagram-reviews/albums/${id}`, payload)
export const deleteAlbumReview = (id: string) => api.delete(`/instagram-reviews/albums/${id}`)

export const saveSongReview = (payload: SongReviewPayload) => api.post('/instagram-reviews/songs', payload)
export const getSongReviews = (params: ReviewListParams = {}) => api.get('/instagram-reviews/songs', { params })
export const getSongReview = (id: string) => api.get(`/instagram-reviews/songs/${id}`)
export const updateSongReview = (id: string, payload: Partial<SongReviewPayload>) => api.put(`/instagram-reviews/songs/${id}`, payload)
export const deleteSongReview = (id: string) => api.delete(`/instagram-reviews/songs/${id}`)
