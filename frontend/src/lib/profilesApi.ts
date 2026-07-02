import api from './api'

export interface ProfileUpdatePayload {
  username?: string | null
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  profileTheme?: unknown
  isProfilePublic?: boolean
}

export const getMyProfile = () => api.get('/profiles/me')
export const updateMyProfile = (payload: ProfileUpdatePayload) => api.put('/profiles/me', payload)
export const getPublicProfile = (username: string) => api.get(`/profiles/${username}`)
export const getPublicProfileAlbums = (username: string) => api.get(`/profiles/${username}/reviews/albums`)
export const getPublicProfileSongs = (username: string) => api.get(`/profiles/${username}/reviews/songs`)
export const followUser = (username: string) => api.post(`/profiles/${username}/follow`)
export const unfollowUser = (username: string) => api.delete(`/profiles/${username}/follow`)
export const getFollowers = (username: string) => api.get(`/profiles/${username}/followers`)
export const getFollowing = (username: string) => api.get(`/profiles/${username}/following`)
export const getFollowingFeed = () => api.get('/profiles/me/following-feed')
