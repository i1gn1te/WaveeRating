import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import WaveeHome from './pages/WaveeHome'
import Login from './pages/Login'
import InstagramRate from './pages/InstagramRate'
import InstagramProfile from './pages/InstagramProfile'
import InstagramAlbumReviewDetail from './pages/InstagramAlbumReviewDetail'
import InstagramSongReviewDetail from './pages/InstagramSongReviewDetail'
import InstagramAlbumReviewEdit from './pages/InstagramAlbumReviewEdit'
import InstagramSongReviewEdit from './pages/InstagramSongReviewEdit'
import AlbumSearch from './pages/AlbumSearch'
import AlbumReviewBuilder from './pages/AlbumReviewBuilder'
import ArtistSearch from './pages/ArtistSearch'
import ArtistProfile from './pages/ArtistProfile'
import SongRatingHome from './pages/SongRatingHome'
import SongReviewBuilder from './pages/SongReviewBuilder'
import ProfileSettings from './pages/ProfileSettings'
import PublicProfile from './pages/PublicProfile'
import PublicProfileAlbums from './pages/PublicProfileAlbums'
import PublicProfileSongs from './pages/PublicProfileSongs'
import FollowingFeed from './pages/FollowingFeed'
import PublicAlbumReview from './pages/PublicAlbumReview'
import PublicSongReview from './pages/PublicSongReview'
import ProtectedRoute from './components/ProtectedRoute'

function RedirectTo({ to }: { to: string }) {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />
}

function RedirectWithParam({ base, paramName, suffix = '' }: { base: string; paramName: string; suffix?: string }) {
  const params = useParams()
  const location = useLocation()
  const value = params[paramName]

  return <Navigate to={`${base}/${value || ''}${suffix}${location.search}${location.hash}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<WaveeHome />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RedirectTo to="/login?mode=register" />} />

            <Route path="rate" element={<InstagramRate />} />
            <Route path="albums" element={<AlbumSearch />} />
            <Route path="albums/:id" element={<AlbumReviewBuilder />} />
            <Route path="songs" element={<SongRatingHome />} />
            <Route path="songs/:id" element={<SongReviewBuilder />} />
            <Route path="artists" element={<ArtistSearch />} />
            <Route path="artists/:id" element={<ArtistProfile />} />

            <Route path="library" element={
              <ProtectedRoute><InstagramProfile /></ProtectedRoute>
            } />
            <Route path="library/albums/:id" element={
              <ProtectedRoute><InstagramAlbumReviewDetail /></ProtectedRoute>
            } />
            <Route path="library/albums/:id/edit" element={
              <ProtectedRoute><InstagramAlbumReviewEdit /></ProtectedRoute>
            } />
            <Route path="library/songs/:id" element={
              <ProtectedRoute><InstagramSongReviewDetail /></ProtectedRoute>
            } />
            <Route path="library/songs/:id/edit" element={
              <ProtectedRoute><InstagramSongReviewEdit /></ProtectedRoute>
            } />

            <Route path="profile/library" element={<RedirectTo to="/library" />} />
            <Route path="profile/settings" element={
              <ProtectedRoute><ProfileSettings /></ProtectedRoute>
            } />
            <Route path="feed" element={
              <ProtectedRoute><FollowingFeed /></ProtectedRoute>
            } />

            <Route path="u/:username" element={<PublicProfile />} />
            <Route path="u/:username/albums" element={<PublicProfileAlbums />} />
            <Route path="u/:username/songs" element={<PublicProfileSongs />} />
            <Route path="reviews/albums/:id" element={<PublicAlbumReview />} />
            <Route path="reviews/songs/:id" element={<PublicSongReview />} />

            <Route path="instagram" element={<RedirectTo to="/" />} />
            <Route path="instagram/rate" element={<RedirectTo to="/rate" />} />
            <Route path="instagram/albums" element={<RedirectTo to="/albums" />} />
            <Route path="instagram/albums/:id" element={<RedirectWithParam base="/albums" paramName="id" />} />
            <Route path="instagram/songs" element={<RedirectTo to="/songs" />} />
            <Route path="instagram/songs/:id" element={<RedirectWithParam base="/songs" paramName="id" />} />
            <Route path="instagram/artists" element={<RedirectTo to="/artists" />} />
            <Route path="instagram/artists/:id" element={<RedirectWithParam base="/artists" paramName="id" />} />
            <Route path="instagram/profile" element={<RedirectTo to="/library" />} />
            <Route path="instagram/profile/albums/:id" element={<RedirectWithParam base="/library/albums" paramName="id" />} />
            <Route path="instagram/profile/albums/:id/edit" element={<RedirectWithParam base="/library/albums" paramName="id" suffix="/edit" />} />
            <Route path="instagram/profile/songs/:id" element={<RedirectWithParam base="/library/songs" paramName="id" />} />
            <Route path="instagram/profile/songs/:id/edit" element={<RedirectWithParam base="/library/songs" paramName="id" suffix="/edit" />} />

            <Route path="classic" element={<RedirectTo to="/" />} />
            <Route path="classic/*" element={<RedirectTo to="/" />} />
            <Route path="dashboard" element={<RedirectTo to="/" />} />
            <Route path="search" element={<RedirectTo to="/albums" />} />
            <Route path="track/:trackId" element={<RedirectWithParam base="/songs" paramName="trackId" />} />
            <Route path="reviews" element={<RedirectTo to="/library" />} />
            <Route path="generator" element={<RedirectTo to="/rate" />} />
            <Route path="community" element={<RedirectTo to="/feed" />} />
            <Route path="community/:userId" element={<RedirectTo to="/feed" />} />
            <Route path="profile" element={<RedirectTo to="/profile/settings" />} />

            <Route path="*" element={<RedirectTo to="/" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
