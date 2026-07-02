# WaveeRating

**Rate music. Build beautiful reviews. Share them anywhere.**

WaveeRating is a music rating platform for albums, EPs and songs. Users can write reviews, build a public music profile, follow friends, save reviews to a library, and export Instagram-ready PNG/ZIP slides.

## Features

- Rate albums, EPs and individual songs from Spotify.
- Score tracks and review categories from 0-10.
- Save drafts or publish reviews to a profile.
- Choose public, unlisted, or private review visibility.
- Browse public profiles and a following feed.
- Export polished 1080x1350 PNG slides and carousel ZIP files.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL or Neon
- Music data: Spotify Web API

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/waveeRating?schema=public"
JWT_SECRET="replace_with_random_32_byte_hex_secret"
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
SPOTIFY_REDIRECT_URI="http://127.0.0.1:3001/api/auth/callback"
FRONTEND_URL="http://localhost:5173"
CLIENT_URL="http://localhost:5173"
PORT=3001
NODE_ENV=development
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Prepare Prisma and run the backend:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

For production-style migrations use:

```bash
npx prisma migrate deploy
```

## Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Run the frontend:

```bash
npm run dev
```

## Health Checks

Backend:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/spotify/health
```

Frontend flows to test:

- Open `/`, `/rate`, `/albums`, `/songs`, `/artists`.
- Search albums and songs through Spotify.
- Build an album review and export PNG/ZIP.
- Build a song review and export PNG/ZIP.
- Register or log in, save a draft, save a public review, and open `/library`.
- Open a public profile at `/u/:username`.
- Confirm public reviews appear on profiles and private/unlisted reviews do not.
- Confirm unlisted review pages open only by direct `/reviews/.../:id` link.

## Required Environment Variables

Backend:

- `DATABASE_URL`
- `JWT_SECRET`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `FRONTEND_URL`
- `CLIENT_URL`
- `PORT`
- `NODE_ENV`

Frontend:

- `VITE_API_URL`

## Security Notes

Do not commit `.env` files or secrets. Spotify client secret, `DATABASE_URL`, and `JWT_SECRET` must stay in the backend environment only. The frontend should only receive `VITE_API_URL`.
