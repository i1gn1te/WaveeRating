# 🌊 waveeProjectBW

**Your Music Review & Playlist Platform**

System rekomendacji i recenzji muzyki z wykorzystaniem Spotify API.

## ✨ Funkcjonalności

- 🌟 Recenzje Muzyki
- 📊 Analiza Audio
- 🎲 Losuj Utwór
- 🎧 Generator Playlist
- 📈 Dashboard

## 🛠️ Stack

**Frontend:** React, Vite, Tailwind CSS
**Backend:** Node.js, Express.js, PostgreSQL + Prisma
**API:** Spotify Web API

## Local auth/database setup

Backend uses PostgreSQL through Prisma. For local register/login, set a real database URL in `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/waveeProjectBW?schema=public"
JWT_SECRET="replace_with_random_32_byte_hex_secret"
```

Generate `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then run:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run dev
```

Frontend local API URL:

```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Instalacja

### Backend
```bash
cd backend
npm install
npm run dev

### Frontend
```bash
cd frontend
npm install
npm run dev
