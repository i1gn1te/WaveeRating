"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSpotifyRouteError = handleSpotifyRouteError;
exports.isDemoUser = isDemoUser;
exports.shuffleArray = shuffleArray;
const axios_1 = __importDefault(require("axios"));
function handleSpotifyRouteError(res, error, defaultMessage) {
    if (error?.statusCode) {
        return res.status(error.statusCode).json({
            error: error.message || defaultMessage,
            code: error.code || 'SPOTIFY_ERROR',
        });
    }
    if (axios_1.default.isAxiosError(error)) {
        const status = error.response?.status;
        const spotifyError = error.response?.data?.error;
        const spotifyMessage = (typeof spotifyError === 'object' ? spotifyError?.message : undefined) ||
            error.response?.data?.error_description ||
            (typeof spotifyError === 'string' ? spotifyError : undefined) ||
            defaultMessage;
        console.error(`[Spotify Error] Status: ${status}, Message: ${spotifyMessage}, Raw:`, error.response?.data);
        if (status === 401) {
            return res.status(401).json({ error: 'Spotify token expired. Please log in again.' });
        }
        if (status === 403) {
            return res.status(403).json({ error: spotifyMessage || 'Spotify access denied for this resource' });
        }
        if (status) {
            return res.status(status).json({ error: spotifyMessage });
        }
    }
    console.error(`[Server Error] ${defaultMessage}:`, error);
    return res.status(500).json({ error: defaultMessage });
}
function isDemoUser(req) {
    return req.spotifyAccessToken === 'demo_token';
}
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
//# sourceMappingURL=routeHelpers.js.map
