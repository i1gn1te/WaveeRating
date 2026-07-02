"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios = require("axios");
const net = require("net");
const auth_js_1 = require("../middleware/auth.js");
const spotify_js_1 = require("../lib/spotify.js");
const mockData_js_1 = require("../lib/mockData.js");
const routeHelpers_js_1 = require("../lib/routeHelpers.js");
const router = (0, express_1.Router)();
const ALLOWED_SPOTIFY_IMAGE_HOSTS = new Set([
    'i.scdn.co',
    'image-cdn-ak.spotifycdn.com',
]);

router.get('/health', async (_req, res) => {
    const health = await (0, spotify_js_1.checkSpotifyApiHealth)();
    res.status(health.ok ? 200 : 503).json(health);
});
router.get('/image-proxy', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Image URL required' });
        }
        const parsed = parseSafeSpotifyImageUrl(url);
        const response = await axios.get(parsed.toString(), {
            responseType: 'arraybuffer',
            timeout: 10000,
            maxContentLength: 8 * 1024 * 1024,
            validateStatus: (status) => status >= 200 && status < 300,
        });
        const contentType = String(response.headers['content-type'] || '').toLowerCase();
        if (!contentType.startsWith('image/')) {
            return res.status(415).json({ error: 'URL did not return an image' });
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(Buffer.from(response.data));
    }
    catch (error) {
        const status = error.statusCode || error.response?.status || 400;
        return res.status(status >= 500 ? 502 : status).json({
            error: error.message || 'Failed to proxy Spotify image',
        });
    }
});
router.get('/search-albums', async (req, res) => {
    try {
        const { q } = req.query;
        const rawLimit = req.query.limit;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Album search query required' });
        }
        const finalLimit = parseAlbumSearchLimit(rawLimit);
        const albums = await (0, spotify_js_1.searchPublicAlbums)(q, finalLimit);
        res.json(albums);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Album search failed');
    }
});
router.get('/search-artists', async (req, res) => {
    try {
        const { q } = req.query;
        const rawLimit = req.query.limit;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Artist search query required' });
        }
        const finalLimit = parseAlbumSearchLimit(rawLimit);
        const artists = await (0, spotify_js_1.searchPublicArtists)(q, finalLimit);
        res.json(artists);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Artist search failed');
    }
});
router.get('/search-tracks', async (req, res) => {
    try {
        const { q } = req.query;
        const rawLimit = req.query.limit;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Track search query required' });
        }
        const finalLimit = parseAlbumSearchLimit(rawLimit);
        const tracks = await (0, spotify_js_1.searchPublicTracks)(q, finalLimit);
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Track search failed');
    }
});
router.get('/albums/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const album = await (0, spotify_js_1.getPublicAlbum)(id);
        res.json(album);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get album');
    }
});
router.get('/albums/:id/tracks', async (req, res) => {
    try {
        const { id } = req.params;
        const tracks = await (0, spotify_js_1.getPublicAlbumTracks)(id);
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get album tracks');
    }
});
router.get('/tracks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const track = await (0, spotify_js_1.getPublicTrack)(id);
        res.json(track);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get track');
    }
});
router.get('/artists/:id/albums', async (req, res) => {
    try {
        const { id } = req.params;
        const limit = clampLimit(req.query.limit, 1, 50, 20);
        const albums = await (0, spotify_js_1.getPublicArtistAlbums)(id, limit);
        res.json(albums);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get artist albums');
    }
});
router.get('/artists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await (0, spotify_js_1.getPublicArtist)(id);
        res.json(artist);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get artist');
    }
});

// Wyszukiwanie

router.get('/search', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { q, limit } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }
        const parsedLimit = clampLimit(limit);
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const query = q.toLowerCase();
            const results = mockData_js_1.mockTracks.filter((t) => t.name.toLowerCase().includes(query) ||
                t.artists.some((a) => a.name.toLowerCase().includes(query)));
            return res.json(results.length > 0 ? results : mockData_js_1.mockTracks);
        }
        if (!req.spotifyAccessToken) {
            return res.status(401).json({ error: 'No Spotify access token. Please log in again.' });
        }
        console.log(`[Search] q="${q}", limit=${parsedLimit}, tokenPrefix=${req.spotifyAccessToken.substring(0, 10)}...`);
        const tracks = await (0, spotify_js_1.searchTracks)(req.spotifyAccessToken, q, parsedLimit);
        res.json(tracks);
    }
    catch (error) {
        console.error('[Search] Spotify API error:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
        });
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Search failed');
    }
});

// Szczegoly utworu (+ cechy audio)

router.get('/track/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { trackId } = req.params;
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const track = mockData_js_1.mockTracks.find((t) => t.id === trackId) || mockData_js_1.mockTracks[0];
            const af = mockData_js_1.mockAudioFeatures[trackId] || mockData_js_1.mockAudioFeatures['1'];
            return res.json({
                ...track,
                audioFeatures: { ...af, keyName: (0, mockData_js_1.getKeyName)(af.key, af.mode) },
            });
        }
        const track = await (0, spotify_js_1.getTrack)(req.spotifyAccessToken, trackId);
        // Cechy audio moga byc null (ograniczony adres API)
        const af = await (0, spotify_js_1.getAudioFeatures)(req.spotifyAccessToken, trackId);
        res.json({
            ...track,
            audioFeatures: af ? { ...af, keyName: (0, spotify_js_1.getKeyName)(af.key, af.mode) } : null,
        });
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get track');
    }
});
// Same cechy audio

router.get('/audio-features/:trackId', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const { trackId } = req.params;
        if ((0, routeHelpers_js_1.isDemoUser)(req)) {
            const af = mockData_js_1.mockAudioFeatures[trackId] || mockData_js_1.mockAudioFeatures['1'];
            return res.json({ ...af, keyName: (0, mockData_js_1.getKeyName)(af.key, af.mode) });
        }
        const af = await (0, spotify_js_1.getAudioFeatures)(req.spotifyAccessToken, trackId);
        res.json(af ? { ...af, keyName: (0, spotify_js_1.getKeyName)(af.key, af.mode) } : null);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get audio features');
    }
});

// Najlepsze utwory i artysci

router.get('/top/tracks', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req))
            return res.json(mockData_js_1.mockTracks);
        const { timeRange = 'medium_term', limit } = req.query;
        const tracks = await (0, spotify_js_1.getTopTracks)(req.spotifyAccessToken, timeRange, clampLimit(limit));
        res.json(tracks);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get top tracks');
    }
});
router.get('/top/artists', auth_js_1.authMiddleware, async (req, res) => {
    try {
        if ((0, routeHelpers_js_1.isDemoUser)(req))
            return res.json(mockData_js_1.mockArtists);
        const { timeRange = 'medium_term', limit } = req.query;
        const artists = await (0, spotify_js_1.getTopArtists)(req.spotifyAccessToken, timeRange, clampLimit(limit));
        res.json(artists);
    }
    catch (error) {
        return (0, routeHelpers_js_1.handleSpotifyRouteError)(res, error, 'Failed to get top artists');
    }
});

// Gatunki

router.get('/genres', auth_js_1.authMiddleware, async (_req, res) => {
    res.json(spotify_js_1.GENRE_LIST);
});

// Pomocnicze funkcje

function clampLimit(raw, min = 1, max = 50, fallback = 20) {
    if (!raw)
        return fallback;
    const n = parseInt(String(raw), 10);
    if (isNaN(n))
        return fallback;
    return Math.max(min, Math.min(max, n));
}
function parseAlbumSearchLimit(rawLimit) {
    const parsedLimit = Number.parseInt(rawLimit, 10);
    if (Number.isNaN(parsedLimit)) {
        return 4;
    }
    if (parsedLimit < 1) {
        return 1;
    }
    if (parsedLimit > 4) {
        return 4;
    }
    return parsedLimit;
}
function parseSafeSpotifyImageUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    }
    catch {
        throw createImageProxyError('Invalid image URL', 400);
    }
    if (parsed.protocol !== 'https:') {
        throw createImageProxyError('Only HTTPS image URLs are allowed', 400);
    }
    if (parsed.username || parsed.password) {
        throw createImageProxyError('Image URL credentials are not allowed', 400);
    }
    const hostname = parsed.hostname.toLowerCase();
    if (isBlockedHostname(hostname) || !ALLOWED_SPOTIFY_IMAGE_HOSTS.has(hostname)) {
        throw createImageProxyError('Image host is not allowed', 403);
    }
    parsed.hash = '';
    return parsed;
}
function createImageProxyError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function isBlockedHostname(hostname) {
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        return true;
    }
    const ipVersion = net.isIP(hostname);
    if (ipVersion === 4) {
        const parts = hostname.split('.').map((part) => Number(part));
        return parts[0] === 0 ||
            parts[0] === 10 ||
            parts[0] === 127 ||
            (parts[0] === 169 && parts[1] === 254) ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168);
    }
    if (ipVersion === 6) {
        const compact = hostname.toLowerCase();
        return compact === '::1' || compact.startsWith('fc') || compact.startsWith('fd') || compact.startsWith('fe80');
    }
    return false;
}
exports.default = router;


