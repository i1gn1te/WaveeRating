UPDATE "AlbumReview"
SET "visibility" = 'private',
    "isPublic" = false
WHERE "visibility" = 'unlisted';

UPDATE "SongReview"
SET "visibility" = 'private',
    "isPublic" = false
WHERE "visibility" = 'unlisted';
