export const SONG_RATING_CATEGORIES = [
  'Production / Sound',
  'Composition / Writing',
  'Performance',
  'Emotion / Atmosphere',
  'Memorability',
  'Replay Value',
] as const

export const ALBUM_RATING_CATEGORIES = [
  'Production / Sound',
  'Composition / Writing',
  'Performance',
  'Atmosphere',
  'Cohesion',
  'Replay Value',
] as const

export type RatingCategory = string
export type AlbumCategoryRatings = Record<(typeof ALBUM_RATING_CATEGORIES)[number], number>
export type SongCategoryRatings = Record<(typeof SONG_RATING_CATEGORIES)[number], number>
export type ReviewVisibility = 'public' | 'private'

export type SlideTemplateId =
  | 'signature-cover'
  | 'editorial-review'
  | 'poster-score'
  | 'minimal-card'
  | 'magazine-layout'
  | 'compact-summary'
  | 'retro-desktop'

export type SlideLayoutMode = 'signature' | 'editorial' | 'poster' | 'minimal' | 'magazine' | 'compact' | 'retro'
export type SlideTextSize = 'small' | 'medium' | 'large'
export type SlideFontMood = 'clean' | 'editorial' | 'bold'

export interface SlideTextSettings {
  titleSize: SlideTextSize
  bodySize: SlideTextSize
  uppercaseHeadings: boolean
  fontMood: SlideFontMood
}

export interface SlideTemplate {
  id: SlideTemplateId
  name: string
  slideType: 'cover' | 'review' | 'score' | 'summary' | 'track' | 'song'
  layout: SlideLayoutMode
  fontStyle: SlideFontMood
  coverPosition: 'center' | 'left' | 'top' | 'background' | 'compact'
  scoreStyle: 'badge' | 'poster' | 'bar' | 'minimal'
  textBoxStyle: 'solid-card' | 'outlined' | 'editorial' | 'none'
  vibe: string
}

export interface CarouselStylePreset {
  id: 'signature-purple' | 'minimal-editorial' | 'dark-poster' | 'retro-desktop'
  name: string
  description: string
  theme: ReviewTheme
  templateId: SlideTemplateId
}

export interface CarouselSlideConfig<T extends string = string> {
  id: T
  label: string
  filenameSlug: string
  enabled: boolean
}

export interface ReviewArtist {
  id?: string
  name: string
}

export interface ReviewTheme {
  backgroundColor: string
  cardColor: string
  textColor: string
  accentColor: string
  coverFrameColor: string
  shadowIntensity: number
  borderRadius: number
}

export interface AlbumDraftData {
  id: string
  name: string
  title?: string
  artists: ReviewArtist[]
  releaseYear?: string
  releaseDate?: string
  imageUrl?: string | null
  totalTracks?: number
}

export interface TrackRating {
  spotifyTrackId: string
  trackNumber?: number
  title: string
  name: string
  durationMs?: number
  quickRating: number
  useDetailedRating: boolean
  categoryRatings: SongCategoryRatings
  overrideScoreEnabled: boolean
  overrideScore: number
  finalScore: number
  note: string
}

export interface SongDraftTrackData {
  id: string
  name: string
  title?: string
  artists: ReviewArtist[]
  albumId?: string | null
  albumName?: string | null
  imageUrl?: string | null
  durationMs?: number
  releaseDate?: string | null
  releaseYear?: string | null
  trackNumber?: number
  discNumber?: number
  spotifyUrl?: string | null
}

export interface AlbumReviewDraft {
  album: AlbumDraftData
  trackRatings: TrackRating[]
  albumCategoryRatings: AlbumCategoryRatings
  overrideAlbumScoreEnabled: boolean
  overrideAlbumScore: number
  calculatedTrackAverage: number
  calculatedAlbumCategoryAverage: number
  finalAlbumScore: number
  bestTrackId: string
  weakestTrackId: string
  albumReviewTitle: string
  albumReviewBody: string
  finalRecommendation: string
  theme: ReviewTheme
  visibility?: ReviewVisibility
  templateId?: SlideTemplateId
  textSettings?: SlideTextSettings
  slideOrder?: CarouselSlideConfig[]
}

export interface SongReviewDraft {
  spotifyTrackId: string
  title: string
  artists: ReviewArtist[]
  albumId?: string | null
  albumName?: string | null
  imageUrl?: string | null
  durationMs?: number
  quickRating: number
  useDetailedRating: boolean
  categoryRatings: SongCategoryRatings
  overrideScoreEnabled: boolean
  overrideScore: number
  finalScore: number
  reviewTitle: string
  reviewBody: string
  finalNote: string
  moodTags: string
  theme: ReviewTheme
  visibility?: ReviewVisibility
  templateId?: SlideTemplateId
  textSettings?: SlideTextSettings
  slideOrder?: CarouselSlideConfig[]
}
