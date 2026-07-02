# WaveeRating - dokumentacja techniczna

## 1. Zakres dokumentu
Niniejszy dokument opisuje dzialanie aplikacji WaveeRating na poziomie technicznym.
Opis obejmuje:
- architekture systemu,
- backend i route API,
- modele danych Prisma,
- frontend i przeplyw danych,
- sposob uruchomienia programu.

## 2. Architektura systemu
Aplikacja dziala w ukladzie klient-serwer:
- frontend: React + Vite + Tailwind,
- backend: Node.js + Express,
- baza danych: PostgreSQL przez Prisma,
- integracja zewnetrzna: Spotify Web API.

Przeplyw danych:
1. Frontend wysyla zapytanie HTTP pod /api.
2. Backend wykonuje walidacje i autoryzacje.
3. Backend pobiera dane z PostgreSQL i/lub Spotify API.
4. Backend zwraca odpowiedz JSON.
5. Frontend renderuje wynik.

## 3. Backend

### 3.1 Plik backend/src/index.js
Plik realizuje start serwera oraz konfiguracje middleware.
Konfigurowane elementy:
- CORS,
- parser JSON,
- cookie parser,
- podpiete route API,
- endpoint health check,
- globalny handler bledow.

Przyklad:
```js
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/playlists', playlistsRoutes)
app.use('/api/recommendations', recommendationsRoutes)
```

### 3.2 Plik backend/src/middleware/auth.js
Middleware realizuje autoryzacje JWT.
Zakres pracy middleware:
- odczyt tokenu z cookie lub naglowka,
- weryfikacja tokenu przez JWT_SECRET,
- przypisanie userId i spotifyAccessToken do req,
- odswiezenie tokenu po wygaœniêciu, jezeli dostepny jest refresh token.

### 3.3 Pliki backend/src/lib
- prisma.js: singleton klienta Prisma,
- spotify.js: obsluga Spotify OAuth oraz endpointow danych muzycznych,
- routeHelpers.js: ujednolicenie obslugi bledow i helpery dla tras,
- mockData.js: dane demonstracyjne dla danych demo.

## 4. API

### 4.1 Auth
Plik: backend/src/routes/auth.js
- POST /api/auth/register
- POST /api/auth/local-login
- GET /api/auth/login
- POST /api/auth/demo-login
- GET /api/auth/callback
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/logout

### 4.2 Spotify
Plik: backend/src/routes/spotify.js
- GET /api/spotify/search
- GET /api/spotify/track/:trackId
- GET /api/spotify/audio-features/:trackId
- GET /api/spotify/top/tracks
- GET /api/spotify/top/artists
- GET /api/spotify/genres

### 4.3 Reviews
Plik: backend/src/routes/reviews.js
- POST /api/reviews
- GET /api/reviews/my
- GET /api/reviews/track/:trackId
- GET /api/reviews/:reviewId
- DELETE /api/reviews/:reviewId
- GET /api/reviews

### 4.4 Playlists
Plik: backend/src/routes/playlists.js
- POST /api/playlists
- GET /api/playlists/my
- GET /api/playlists/:playlistId
- POST /api/playlists/:playlistId/tracks
- DELETE /api/playlists/:playlistId/tracks/:trackId
- POST /api/playlists/:playlistId/sync
- DELETE /api/playlists/:playlistId

### 4.5 Recommendations
Plik: backend/src/routes/recommendations.js
- GET /api/recommendations/similar/:trackId
- GET /api/recommendations/discover/:genre

## 5. Baza danych
Plik: backend/prisma/schema.prisma

Modele:
- User
- Review
- Playlist
- PlaylistTrack
- LikedTrack

Kluczowe ograniczenia:
- @@unique([userId, trackId]) w Review,
- @@unique([playlistId, trackId]) w PlaylistTrack,
- relacje z onDelete: Cascade.

## 6. Frontend

### 6.1 Plik frontend/src/main.tsx
- inicjalizacja QueryClient,
- uruchomienie aplikacji React,
- podpiecie QueryClientProvider.

### 6.2 Plik frontend/src/App.tsx
- definicja tras publicznych i chronionych,
- osadzenie komponentu Layout,
- ochrona tras przez ProtectedRoute.

### 6.3 Plik frontend/src/lib/api.ts
- wspolny klient axios,
- withCredentials: true,
- interceptor 401,
- automatyczne odswiezanie sesji.

### 6.4 Strony frontend
- Home, Login,
- Dashboard,
- Search,
- Track,
- Reviews,
- PlaylistGenerator,
- Profile,
- Community.

## 7. Uruchomienie programu
Backend:
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Przyklad backend .env:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASS@localhost:5432/waveeRating
JWT_SECRET=sekret
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/auth/callback
```

## 8. Podsumowanie techniczne
Aplikacja realizuje spojny przeplyw danych klient-serwer.
Warstwa backend zapewnia autoryzacje, walidacje i dostep do danych.
Warstwa frontend zapewnia interfejs oraz obsluge sesji i cache.
Demo pozwala uruchomic i testowac pelny przeplyw funkcjonalny bez aktywnej integracji Spotify.

## 9. Podpis autorow dokumentacji
Aleksander Baran
Franciszek Wawrzeñ
Data: 17.03.2026