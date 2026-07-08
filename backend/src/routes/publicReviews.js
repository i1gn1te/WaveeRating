"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = require("../lib/prisma.js");
const router = (0, express_1.Router)();
const authorSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    isProfilePublic: true,
};
router.get('/albums/:id', async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.albumReview.findUnique({
            where: { id: req.params.id },
            include: { user: { select: authorSelect } },
        });
        if (!isPubliclyReadable(review)) {
            return res.status(404).json({ error: 'Album review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('[PublicReviews] Album detail error:', error);
        res.status(500).json({ error: 'Failed to get album review' });
    }
});
router.get('/songs/:id', async (req, res) => {
    try {
        const review = await prisma_js_1.prisma.songReview.findUnique({
            where: { id: req.params.id },
            include: { user: { select: authorSelect } },
        });
        if (!isPubliclyReadable(review)) {
            return res.status(404).json({ error: 'Song review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('[PublicReviews] Song detail error:', error);
        res.status(500).json({ error: 'Failed to get song review' });
    }
});
function isPubliclyReadable(review) {
    if (!review || review.isDraft || review.visibility === 'private') {
        return false;
    }
    return review.visibility === 'public';
}
exports.default = router;
