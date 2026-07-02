import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ModeSelect from './pages/ModeSelect'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Track from './pages/Track'
import Reviews from './pages/Reviews'
import PlaylistGenerator from './pages/PlaylistGenerator'
import Profile from './pages/Profile'
import Community from './pages/Community'
import InstagramHome from './pages/InstagramHome'
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

function LegacyClassicRedirect() {
  const location = useLocation()

  return <Navigate to={`/classic${location.pathname}${location.search}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<ModeSelect />} />

          <Route path="/instagram" element={<InstagramHome />} />
          <Route path="/instagram/rate" element={<InstagramRate />} />
          <Route path="/instagram/profile" element={
            <ProtectedRoute><InstagramProfile /></ProtectedRoute>
          } />
          <Route path="/instagram/profile/albums/:id" element={
            <ProtectedRoute><InstagramAlbumReviewDetail /></ProtectedRoute>
          } />
          <Route path="/instagram/profile/albums/:id/edit" element={
            <ProtectedRoute><InstagramAlbumReviewEdit /></ProtectedRoute>
          } />
          <Route path="/instagram/profile/songs/:id" element={
            <ProtectedRoute><InstagramSongReviewDetail /></ProtectedRoute>
          } />
          <Route path="/instagram/profile/songs/:id/edit" element={
            <ProtectedRoute><InstagramSongReviewEdit /></ProtectedRoute>
          } />
          <Route path="/instagram/albums" element={<AlbumSearch />} />
          <Route path="/instagram/albums/:id" element={<AlbumReviewBuilder />} />
          <Route path="/instagram/artists" element={<ArtistSearch />} />
          <Route path="/instagram/artists/:id" element={<ArtistProfile />} />
          <Route path="/instagram/songs" element={<SongRatingHome />} />
          <Route path="/instagram/songs/:id" element={<SongReviewBuilder />} />

          <Route path="/profile/settings" element={
            <ProtectedRoute><ProfileSettings /></ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute><FollowingFeed /></ProtectedRoute>
          } />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="/u/:username/albums" element={<PublicProfileAlbums />} />
          <Route path="/u/:username/songs" element={<PublicProfileSongs />} />
          <Route path="/reviews/albums/:id" element={<PublicAlbumReview />} />
          <Route path="/reviews/songs/:id" element={<PublicSongReview />} />

          <Route path="/classic" element={<Layout basePath="/classic" />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute><Search /></ProtectedRoute>
            } />
            <Route path="track/:trackId" element={
              <ProtectedRoute><Track /></ProtectedRoute>
            } />
            <Route path="reviews" element={
              <ProtectedRoute><Reviews /></ProtectedRoute>
            } />
            <Route path="generator" element={
              <ProtectedRoute><PlaylistGenerator /></ProtectedRoute>
            } />
            <Route path="community" element={
              <ProtectedRoute><Community /></ProtectedRoute>
            } />
            <Route path="community/:userId" element={
              <ProtectedRoute><Community /></ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Route>

          <Route path="/login" element={<LegacyClassicRedirect />} />
          <Route path="/dashboard" element={<LegacyClassicRedirect />} />
          <Route path="/search" element={<LegacyClassicRedirect />} />
          <Route path="/track/:trackId" element={<LegacyClassicRedirect />} />
          <Route path="/reviews" element={<LegacyClassicRedirect />} />
          <Route path="/generator" element={<LegacyClassicRedirect />} />
          <Route path="/community" element={<LegacyClassicRedirect />} />
          <Route path="/community/:userId" element={<LegacyClassicRedirect />} />
          <Route path="/profile" element={<LegacyClassicRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
