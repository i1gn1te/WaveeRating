"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const spotify_js_1 = require("../lib/spotify.js");
const config_js_1 = require("../lib/config.js");
async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    let jwtSecret;
    try {
        jwtSecret = (0, config_js_1.getJwtSecret)();
    }
    catch (error) {
        return res.status(error.statusCode || 503).json({
            error: error.message || 'Server configuration error: JWT_SECRET not set',
            code: error.code || 'JWT_NOT_CONFIGURED',
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.userId = decoded.userId;
        req.spotifyAccessToken = decoded.spotifyAccessToken;
        req.authUser = decoded.user || null;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, jwtSecret, { ignoreExpiration: true });
                if (!decoded.spotifyRefreshToken) {
                    return res.status(401).json({ error: 'Session expired. Please log in again.' });
                }
                if (decoded.spotifyRefreshToken === 'demo_refresh') {
                    const newToken = jsonwebtoken_1.default.sign({
                        userId: decoded.userId,
                        spotifyAccessToken: decoded.spotifyAccessToken || 'demo_token',
                        spotifyRefreshToken: decoded.spotifyRefreshToken,
                        user: decoded.user,
                    }, jwtSecret, { expiresIn: '7d' });
                    res.cookie('token', newToken, (0, config_js_1.getCookieOptions)());
                    req.userId = decoded.userId;
                    req.spotifyAccessToken = decoded.spotifyAccessToken || 'demo_token';
                    req.authUser = decoded.user || null;
                    return next();
                }
                const refreshed = await (0, spotify_js_1.refreshAccessToken)(decoded.spotifyRefreshToken);
                const nextRefreshToken = refreshed.refresh_token || decoded.spotifyRefreshToken;
                const newToken = jsonwebtoken_1.default.sign({
                    userId: decoded.userId,
                    spotifyAccessToken: refreshed.access_token,
                    spotifyRefreshToken: nextRefreshToken,
                    user: decoded.user,
                }, jwtSecret, { expiresIn: '7d' });
                res.cookie('token', newToken, (0, config_js_1.getCookieOptions)());
                req.userId = decoded.userId;
                req.spotifyAccessToken = refreshed.access_token;
                req.authUser = decoded.user || null;
                return next();
            }
            catch (refreshError) {
                console.error('[Auth] Token refresh failed:', refreshError);
                return res.status(401).json({ error: 'Session expired. Please log in again.' });
            }
        }
        console.error('[Auth] Token verification failed:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map
