"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const config_js_1 = require("../lib/config.js");
const router = (0, express_1.Router)();
const usernameSchema = zod_1.z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be at most 24 characters')
    .regex(/^[a-z0-9_.]+$/, 'Username can only use lowercase letters, numbers, underscore, and dot');
const profileUpdateSchema = zod_1.z.object({
    username: usernameSchema.nullable().optional(),
    displayName: zod_1.z.string().trim().max(40, 'Display name must be at most 40 characters').nullable().optional(),
    bio: zod_1.z.string().trim().max(300, 'Bio must be at most 300 characters').nullable().optional(),
    avatarUrl: zod_1.z.union([zod_1.z.string().url('Avatar URL must be a valid URL'), zod_1.z.literal('')]).nullable().optional(),
    profileTheme: zod_1.z.any().optional(),
    isProfilePublic: zod_1.z.boolean().optional(),
});
const userSelect = {
    id: true,
    email: true,
    username: true,
    displayName: true,
    bio: true,
    avatarUrl: true,
    profileTheme: true,
    isProfilePublic: true,
    createdAt: true,
    updatedAt: true,
};
const publicUserSelect = {
    id: true,
    username: true,
    displayName: true,
    bio: true,
    avatarUrl: true,
    profileTheme: true,
    isProfilePublic: true,
    createdAt: true,
};
const publicAlbumSelect = {
    id: true,
    albumTitle: true,
    albumArtists: true,
    albumImageUrl: true,
    releaseDate: true,
    releaseYear: true,
    finalScore: true,
    reviewTitle: true,
    reviewBody: true,
    finalRecommendation: true,
    bestTrackTitle: true,
    weakestTrackTitle: true,
    trackAverage: true,
    albumCategoryAverage: true,
    visibility: true,
    isPublic: true,
    createdAt: true,
    updatedAt: true,
};
const publicSongSelect = {
    id: true,
    trackTitle: true,
    trackArtists: true,
    albumTitle: true,
    imageUrl: true,
    durationMs: true,
    finalScore: true,
    reviewTitle: true,
    reviewBody: true,
    finalRecommendation: true,
    visibility: true,
    isPublic: true,
    createdAt: true,
    updatedAt: true,
};
router.get('/me', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: userSelect,
        });
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ ...user, counts: await getCounts(user.id, false) });
    }
    catch (error) {
        console.error('[Profiles] Get me error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});
router.put('/me', auth_js_1.authMiddleware, async (req, res) => {
    const validation = profileUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0]?.message || 'Validation error', details: validation.error.issues });
    }
    try {
        const data = validation.data;
        if (data.username) {
            const existing = await prisma_js_1.prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT: { id: req.userId },
                },
                select: { id: true },
            });
            if (existing) {
                return res.status(409).json({ error: 'Username is already taken' });
            }
        }
        const user = await prisma_js_1.prisma.user.update({
            where: { id: req.userId },
            data: stripUndefined({
                username: data.username === undefined ? undefined : data.username || null,
                displayName: emptyToNull(data.displayName),
                bio: emptyToNull(data.bio),
                avatarUrl: emptyToNull(data.avatarUrl),
                profileTheme: data.profileTheme === undefined ? undefined : data.profileTheme ?? null,
                isProfilePublic: data.isProfilePublic,
            }),
            select: userSelect,
        });
        res.json({ ...user, counts: await getCounts(user.id, false) });
    }
    catch (error) {
        console.error('[Profiles] Update me error:', error);
        if (error?.code === 'P2002') {
            return res.status(409).json({ error: 'Username is already taken' });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
router.get('/me/following-feed', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const follows = await prisma_js_1.prisma.follow.findMany({
            where: { followerId: req.userId },
            select: { followingId: true },
        });
        const followingIds = follows.map((follow) => follow.followingId);
        if (followingIds.length === 0) {
            return res.json([]);
        }
        const [albumReviews, songReviews] = await Promise.all([
            prisma_js_1.prisma.albumReview.findMany({
                where: publicReviewWhere({ userId: { in: followingIds } }),
                select: {
                    ...publicAlbumSelect,
                    user: { select: publicUserSelect },
                },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
            prisma_js_1.prisma.songReview.findMany({
                where: publicReviewWhere({ userId: { in: followingIds } }),
                select: {
                    ...publicSongSelect,
                    user: { select: publicUserSelect },
                },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
        ]);
        const feed = [
            ...albumReviews.map((review) => ({ type: 'album', ...review })),
            ...songReviews.map((review) => ({ type: 'song', ...review })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 40);
        res.json(feed);
    }
    catch (error) {
        console.error('[Profiles] Following feed error:', error);
        res.status(500).json({ error: 'Failed to get feed' });
    }
});
router.post('/:username/follow', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const target = await findUserByUsername(req.params.username);
        if (!target) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        if (target.id === req.userId) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }
        await prisma_js_1.prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: req.userId,
                    followingId: target.id,
                },
            },
            update: {},
            create: {
                followerId: req.userId,
                followingId: target.id,
            },
        });
        res.json({ success: true, following: true });
    }
    catch (error) {
        console.error('[Profiles] Follow error:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
});
router.delete('/:username/follow', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const target = await findUserByUsername(req.params.username);
        if (!target) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        await prisma_js_1.prisma.follow.deleteMany({
            where: {
                followerId: req.userId,
                followingId: target.id,
            },
        });
        res.json({ success: true, following: false });
    }
    catch (error) {
        console.error('[Profiles] Unfollow error:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});
router.get('/:username/followers', async (req, res) => {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const followers = await prisma_js_1.prisma.follow.findMany({
            where: { followingId: user.id },
            include: { follower: { select: publicUserSelect } },
            orderBy: { createdAt: 'desc' },
            take: clampInteger(req.query.limit, 1, 100, 50),
        });
        res.json(followers.map((follow) => follow.follower));
    }
    catch (error) {
        console.error('[Profiles] Followers error:', error);
        res.status(500).json({ error: 'Failed to get followers' });
    }
});
router.get('/:username/following', async (req, res) => {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const following = await prisma_js_1.prisma.follow.findMany({
            where: { followerId: user.id },
            include: { following: { select: publicUserSelect } },
            orderBy: { createdAt: 'desc' },
            take: clampInteger(req.query.limit, 1, 100, 50),
        });
        res.json(following.map((follow) => follow.following));
    }
    catch (error) {
        console.error('[Profiles] Following error:', error);
        res.status(500).json({ error: 'Failed to get following' });
    }
});
router.get('/:username/reviews/albums', async (req, res) => {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        if (!user.isProfilePublic) {
            return res.status(403).json({ error: 'This profile is private' });
        }
        const reviews = await prisma_js_1.prisma.albumReview.findMany({
            where: publicReviewWhere({ userId: user.id }),
            select: publicAlbumSelect,
            orderBy: { createdAt: 'desc' },
            take: clampInteger(req.query.limit, 1, 100, 50),
            skip: clampInteger(req.query.offset, 0, 100000, 0),
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('[Profiles] Public album reviews error:', error);
        res.status(500).json({ error: 'Failed to get public album reviews' });
    }
});
router.get('/:username/reviews/songs', async (req, res) => {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        if (!user.isProfilePublic) {
            return res.status(403).json({ error: 'This profile is private' });
        }
        const reviews = await prisma_js_1.prisma.songReview.findMany({
            where: publicReviewWhere({ userId: user.id }),
            select: publicSongSelect,
            orderBy: { createdAt: 'desc' },
            take: clampInteger(req.query.limit, 1, 100, 50),
            skip: clampInteger(req.query.offset, 0, 100000, 0),
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('[Profiles] Public song reviews error:', error);
        res.status(500).json({ error: 'Failed to get public song reviews' });
    }
});
router.get('/:username', async (req, res) => {
    try {
        const viewerId = getOptionalUserId(req);
        const user = await findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const counts = await getCounts(user.id, true);
        const isOwnProfile = viewerId === user.id;
        const isFollowing = viewerId && !isOwnProfile
            ? Boolean(await prisma_js_1.prisma.follow.findUnique({
                where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
                select: { id: true },
            }))
            : false;
        if (!user.isProfilePublic && !isOwnProfile) {
            return res.status(403).json({
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                isProfilePublic: false,
                counts,
                isFollowing,
                isOwnProfile,
                error: 'This profile is private',
            });
        }
        const [latestAlbumReviews, latestSongReviews] = await Promise.all([
            prisma_js_1.prisma.albumReview.findMany({
                where: publicReviewWhere({ userId: user.id }),
                select: publicAlbumSelect,
                orderBy: { createdAt: 'desc' },
                take: 6,
            }),
            prisma_js_1.prisma.songReview.findMany({
                where: publicReviewWhere({ userId: user.id }),
                select: publicSongSelect,
                orderBy: { createdAt: 'desc' },
                take: 6,
            }),
        ]);
        res.json({
            ...toPublicUser(user),
            counts,
            isFollowing,
            isOwnProfile,
            latestAlbumReviews,
            latestSongReviews,
        });
    }
    catch (error) {
        console.error('[Profiles] Public profile error:', error);
        res.status(500).json({ error: 'Failed to get public profile' });
    }
});
async function findUserByUsername(username) {
    return prisma_js_1.prisma.user.findUnique({
        where: { username: String(username || '').toLowerCase() },
        select: publicUserSelect,
    });
}
function toPublicUser(user) {
    return {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        profileTheme: user.profileTheme,
        isProfilePublic: user.isProfilePublic,
        createdAt: user.createdAt,
    };
}
async function getCounts(userId, publicOnly) {
    const reviewFilter = publicOnly ? publicReviewWhere({ userId }) : { userId };
    const [albumReviews, songReviews, followers, following] = await Promise.all([
        prisma_js_1.prisma.albumReview.count({ where: reviewFilter }),
        prisma_js_1.prisma.songReview.count({ where: reviewFilter }),
        prisma_js_1.prisma.follow.count({ where: { followingId: userId } }),
        prisma_js_1.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { albumReviews, songReviews, followers, following };
}
function publicReviewWhere(extra = {}) {
    return {
        ...extra,
        isDraft: false,
        isPublic: true,
        visibility: 'public',
    };
}
function getOptionalUserId(req) {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return null;
    }
    try {
        const decoded = jsonwebtoken_1.verify(token, (0, config_js_1.getJwtSecret)());
        return decoded.userId || null;
    }
    catch {
        return null;
    }
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
function stripUndefined(data) {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}
exports.default = router;
