-- CreateTable
CREATE TABLE "AlbumReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyAlbumId" TEXT NOT NULL,
    "albumTitle" TEXT NOT NULL,
    "albumArtists" JSONB NOT NULL,
    "albumImageUrl" TEXT,
    "releaseDate" TEXT,
    "releaseYear" INTEGER,
    "albumType" TEXT,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "trackAverage" DOUBLE PRECISION,
    "albumCategoryAverage" DOUBLE PRECISION,
    "bestTrackTitle" TEXT,
    "weakestTrackTitle" TEXT,
    "reviewTitle" TEXT,
    "reviewBody" TEXT,
    "finalRecommendation" TEXT,
    "theme" JSONB,
    "ratingData" JSONB NOT NULL,
    "slideData" JSONB,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlbumReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "trackArtists" JSONB NOT NULL,
    "albumId" TEXT,
    "albumTitle" TEXT,
    "imageUrl" TEXT,
    "durationMs" INTEGER,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "reviewTitle" TEXT,
    "reviewBody" TEXT,
    "finalRecommendation" TEXT,
    "theme" JSONB,
    "ratingData" JSONB NOT NULL,
    "slideData" JSONB,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlbumReview_userId_idx" ON "AlbumReview"("userId");

-- CreateIndex
CREATE INDEX "AlbumReview_spotifyAlbumId_idx" ON "AlbumReview"("spotifyAlbumId");

-- CreateIndex
CREATE INDEX "AlbumReview_createdAt_idx" ON "AlbumReview"("createdAt");

-- CreateIndex
CREATE INDEX "SongReview_userId_idx" ON "SongReview"("userId");

-- CreateIndex
CREATE INDEX "SongReview_spotifyTrackId_idx" ON "SongReview"("spotifyTrackId");

-- CreateIndex
CREATE INDEX "SongReview_createdAt_idx" ON "SongReview"("createdAt");

-- AddForeignKey
ALTER TABLE "AlbumReview" ADD CONSTRAINT "AlbumReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongReview" ADD CONSTRAINT "SongReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
