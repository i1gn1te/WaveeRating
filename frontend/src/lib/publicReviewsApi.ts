import api from './api'

export const getPublicAlbumReview = (id: string) => api.get(`/public/reviews/albums/${id}`)
export const getPublicSongReview = (id: string) => api.get(`/public/reviews/songs/${id}`)
