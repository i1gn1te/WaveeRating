"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const jsonValue = zod_1.z.any();
const requiredJsonValue = zod_1.z.any().refine((value) => value !== undefined, 'Required');
const score = zod_1.z.number().min(0).max(10);
const visibilitySchema = zod_1.z.enum(['public', 'private']).optional();
const albumReviewSchema = zod_1.z.object({
    spotifyAlbumId: zod_1.z.string().min(1),
    albumTitle: zod_1.z.string().min(1),
    albumArtists: requiredJsonValue,
    albumImageUrl: zod_1.z.string().nullable().optional(),
    releaseDate: zod_1.z.string().nullable().optional(),
    releaseYear: zod_1.z.number().int().nullable().optional(),
    albumType: zod_1.z.string().nullable().optional(),
    finalScore: score,
    trackAverage: zod_1.z.number().min(0).max(10).nullable().optional(),
    albumCategoryAverage: zod_1.z.number().min(0).max(10).nullable().optional(),
    bestTrackTitle: zod_1.z.string().nullable().optional(),
    weakestTrackTitle: zod_1.z.string().nullable().optional(),
    reviewTitle: zod_1.z.string().nullable().optional(),
    reviewBody: zod_1.z.string().nullable().optional(),
    finalRecommendation: zod_1.z.string().nullable().optional(),
    theme: jsonValue.optional(),
    ratingData: requiredJsonValue,
    slideData: jsonValue.optional(),
    isDraft: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    visibility: visibilitySchema,
});
const songReviewSchema = zod_1.z.object({
    spotifyTrackId: zod_1.z.string().min(1),
    trackTitle: zod_1.z.string().min(1),
    trackArtists: requiredJsonValue,
    albumId: zod_1.z.string().nullable().optional(),
    albumTitle: zod_1.z.string().nullable().optional(),
    imageUrl: zod_1.z.string().nullable().optional(),
    durationMs: zod_1.z.number().int().nullable().optional(),
    finalScore: score,
    reviewTitle: zod_1.z.string().nullable().optional(),
    reviewBody: zod_1.z.string().nullable().optional(),
    finalRecommendation: zod_1.z.string().nullable().optional(),
    theme: jsonValue.optional(),
    ratingData: requiredJsonValue,
    slideData: jsonValue.optional(),
    isDraft: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    visibility: visibilitySchema,
});
const albumReviewUpdateSchema = albumReviewSchema.partial();
const songReviewUpdateSchema = songReviewSchema.partial();
router.use(auth_js_1.authMiddleware);
router.post('/albums', async (req, res) => {
    const validation = albumReviewSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }
    try {
        const userCheck = await ensureDatabaseUser(req.userId);
        if (!userCheck.ok) {
            return res.status(userCheck.status).json({ error: userCheck.error });
        }
        const review = await prisma_js_1.prisma.albumReview.create({
            data: toAlbumCreateData(req.userId, validation.data),
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Create album review error:', error);
        res.status(500).json({ error: 'Failed to save album review' });
    }
});
router.get('/albums', async (req, res) => {
    try {
        const { limit, offset, where } = getListOptions(req.query);
        const reviews = await prisma_js_1.prisma.albumReview.findMany({
            where: { userId: req.userId, ...where },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('[InstagramReviews] List album reviews error:', error);
        res.status(500).json({ error: 'Failed to get album reviews' });
    }
});
router.get('/albums/:id', async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.albumReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!review) {
            return res.status(404).json({ error: 'Album review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Get album review error:', error);
        res.status(500).json({ error: 'Failed to get album review' });
    }
});
router.put('/albums/:id', async (req, res) => {
    const validation = albumReviewUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }
    try {
        const existing = await prisma_js_1.prisma.albumReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Album review not found' });
        }
        const review = await prisma_js_1.prisma.albumReview.update({
            where: { id: req.params.id },
            data: toAlbumUpdateData(validation.data),
        });
        res.json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Update album review error:', error);
        res.status(500).json({ error: 'Failed to update album review' });
    }
});
router.delete('/albums/:id', async (req, res) => {
    try {
        const existing = await prisma_js_1.prisma.albumReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Album review not found' });
        }
        await prisma_js_1.prisma.albumReview.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('[InstagramReviews] Delete album review error:', error);
        res.status(500).json({ error: 'Failed to delete album review' });
    }
});
router.post('/songs', async (req, res) => {
    const validation = songReviewSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }
    try {
        const userCheck = await ensureDatabaseUser(req.userId);
        if (!userCheck.ok) {
            return res.status(userCheck.status).json({ error: userCheck.error });
        }
        const review = await prisma_js_1.prisma.songReview.create({
            data: toSongCreateData(req.userId, validation.data),
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Create song review error:', error);
        res.status(500).json({ error: 'Failed to save song review' });
    }
});
router.get('/songs', async (req, res) => {
    try {
        const { limit, offset, where } = getListOptions(req.query);
        const reviews = await prisma_js_1.prisma.songReview.findMany({
            where: { userId: req.userId, ...where },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('[InstagramReviews] List song reviews error:', error);
        res.status(500).json({ error: 'Failed to get song reviews' });
    }
});
router.get('/songs/:id', async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.songReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!review) {
            return res.status(404).json({ error: 'Song review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Get song review error:', error);
        res.status(500).json({ error: 'Failed to get song review' });
    }
});
router.put('/songs/:id', async (req, res) => {
    const validation = songReviewUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation error', details: validation.error.errors });
    }
    try {
        const existing = await prisma_js_1.prisma.songReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Song review not found' });
        }
        const review = await prisma_js_1.prisma.songReview.update({
            where: { id: req.params.id },
            data: toSongUpdateData(validation.data),
        });
        res.json(review);
    }
    catch (error) {
        console.error('[InstagramReviews] Update song review error:', error);
        res.status(500).json({ error: 'Failed to update song review' });
    }
});
router.delete('/songs/:id', async (req, res) => {
    try {
        const existing = await prisma_js_1.prisma.songReview.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Song review not found' });
        }
        await prisma_js_1.prisma.songReview.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('[InstagramReviews] Delete song review error:', error);
        res.status(500).json({ error: 'Failed to delete song review' });
    }
});
async function ensureDatabaseUser(userId) {
    if (!userId) {
        return { ok: false, status: 401, error: 'Authentication required' };
    }
    const user = await prisma_js_1.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
        return { ok: false, status: 401, error: 'Log in to save this review to your profile.' };
    }
    return { ok: true };
}
function getListOptions(query) {
    const limit = clampInteger(query.limit, 1, 100, 20);
    const offset = clampInteger(query.offset, 0, 100000, 0);
    const drafts = String(query.drafts || '').toLowerCase() === 'true';
    return {
        limit,
        offset,
        where: { isDraft: drafts },
    };
}
function clampInteger(raw, min, max, fallback) {
    const parsed = Number.parseInt(String(raw ?? ''), 10);
    if (Number.isNaN(parsed)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
}
function emptyToNull(value) {
    if (value === undefined) {
        return undefined;
    }
    return typeof value === 'string' && value.trim() === '' ? null : value ?? null;
}
function toAlbumCreateData(userId, data) {
    const visibility = normalizeReviewVisibility(data);
    return {
        ...toAlbumUpdateData(data),
        userId,
        spotifyAlbumId: data.spotifyAlbumId,
        albumTitle: data.albumTitle,
        albumArtists: data.albumArtists,
        finalScore: data.finalScore,
        ratingData: data.ratingData,
        isDraft: data.isDraft ?? false,
        isPublic: visibility !== 'private',
        visibility,
    };
}
function toAlbumUpdateData(data) {
    const visibility = resolveUpdateVisibility(data);
    return stripUndefined({
        spotifyAlbumId: data.spotifyAlbumId,
        albumTitle: data.albumTitle,
        albumArtists: data.albumArtists,
        albumImageUrl: emptyToNull(data.albumImageUrl),
        releaseDate: emptyToNull(data.releaseDate),
        releaseYear: data.releaseYear === undefined ? undefined : data.releaseYear ?? null,
        albumType: emptyToNull(data.albumType),
        finalScore: data.finalScore,
        trackAverage: data.trackAverage === undefined ? undefined : data.trackAverage ?? null,
        albumCategoryAverage: data.albumCategoryAverage === undefined ? undefined : data.albumCategoryAverage ?? null,
        bestTrackTitle: emptyToNull(data.bestTrackTitle),
        weakestTrackTitle: emptyToNull(data.weakestTrackTitle),
        reviewTitle: emptyToNull(data.reviewTitle),
        reviewBody: emptyToNull(data.reviewBody),
        finalRecommendation: emptyToNull(data.finalRecommendation),
        theme: data.theme === undefined ? undefined : data.theme ?? null,
        ratingData: data.ratingData,
        slideData: data.slideData === undefined ? undefined : data.slideData ?? null,
        isDraft: data.isDraft,
        isPublic: visibility === undefined ? undefined : visibility !== 'private',
        visibility,
    });
}
function toSongCreateData(userId, data) {
    const visibility = normalizeReviewVisibility(data);
    return {
        ...toSongUpdateData(data),
        userId,
        spotifyTrackId: data.spotifyTrackId,
        trackTitle: data.trackTitle,
        trackArtists: data.trackArtists,
        finalScore: data.finalScore,
        ratingData: data.ratingData,
        isDraft: data.isDraft ?? false,
        isPublic: visibility !== 'private',
        visibility,
    };
}
function toSongUpdateData(data) {
    const visibility = resolveUpdateVisibility(data);
    return stripUndefined({
        spotifyTrackId: data.spotifyTrackId,
        trackTitle: data.trackTitle,
        trackArtists: data.trackArtists,
        albumId: emptyToNull(data.albumId),
        albumTitle: emptyToNull(data.albumTitle),
        imageUrl: emptyToNull(data.imageUrl),
        durationMs: data.durationMs === undefined ? undefined : data.durationMs ?? null,
        finalScore: data.finalScore,
        reviewTitle: emptyToNull(data.reviewTitle),
        reviewBody: emptyToNull(data.reviewBody),
        finalRecommendation: emptyToNull(data.finalRecommendation),
        theme: data.theme === undefined ? undefined : data.theme ?? null,
        ratingData: data.ratingData,
        slideData: data.slideData === undefined ? undefined : data.slideData ?? null,
        isDraft: data.isDraft,
        isPublic: visibility === undefined ? undefined : visibility !== 'private',
        visibility,
    });
}
function resolveUpdateVisibility(data) {
    if (data.isDraft === true) {
        return 'private';
    }
    if (data.visibility === undefined && data.isPublic === undefined) {
        return undefined;
    }
    return normalizeReviewVisibility(data);
}
function normalizeReviewVisibility(data) {
    if (data.isDraft === true) {
        return 'private';
    }
    if (data.visibility) {
        return data.visibility;
    }
    if (data.isPublic === false) {
        return 'private';
    }
    return 'public';
}
function stripUndefined(data) {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}
exports.default = router;
