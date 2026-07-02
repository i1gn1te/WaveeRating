"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPOTIFY_NOT_CONFIGURED_MESSAGE = void 0;
exports.hasUsableEnv = hasUsableEnv;
exports.getEnvValue = getEnvValue;
exports.getDatabaseConfigIssue = getDatabaseConfigIssue;
exports.isDatabaseConfigured = isDatabaseConfigured;
exports.isJwtConfigured = isJwtConfigured;
exports.getJwtSecret = getJwtSecret;
exports.getClientUrls = getClientUrls;
exports.getCookieOptions = getCookieOptions;
exports.getClearCookieOptions = getClearCookieOptions;
exports.getEnvDiagnostics = getEnvDiagnostics;
exports.createConfigError = createConfigError;
exports.SPOTIFY_NOT_CONFIGURED_MESSAGE = 'Spotify API is not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to backend .env.';
const PLACEHOLDER_PARTS = [
    'your_',
    'username:password',
    'generate_a_long_random_secret',
    'replace_with_random_32_byte_hex_secret',
    'change_this',
    '...',
];
function getEnvValue(name) {
    return (process.env[name] || '').trim().replace(/^"|"$/g, '');
}
function hasUsableEnv(name) {
    const value = getEnvValue(name);
    if (!value) {
        return false;
    }
    const lowered = value.toLowerCase();
    return !PLACEHOLDER_PARTS.some((part) => lowered.includes(part));
}
function getDatabaseConfigIssue() {
    const value = getEnvValue('DATABASE_URL');
    if (!value) {
        return 'DATABASE_URL is not set';
    }
    if (value.toLowerCase().includes('username:password')) {
        return 'DATABASE_URL still contains placeholder credentials';
    }
    if (!hasUsableEnv('DATABASE_URL')) {
        return 'DATABASE_URL still contains placeholder values';
    }
    return null;
}
function isDatabaseConfigured() {
    return getDatabaseConfigIssue() === null;
}
function isJwtConfigured() {
    const value = getEnvValue('JWT_SECRET');
    return hasUsableEnv('JWT_SECRET') && value.length >= 32;
}
function getJwtSecret() {
    if (!isJwtConfigured()) {
        throw createConfigError('JWT_SECRET is not configured. Set JWT_SECRET to a random 32-byte hex secret.', 'JWT_NOT_CONFIGURED', 503);
    }
    return getEnvValue('JWT_SECRET');
}
function splitUrls(value) {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
function getClientUrls() {
    const urls = [
        ...splitUrls(getEnvValue('FRONTEND_URL')),
        ...splitUrls(getEnvValue('CLIENT_URL')),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];
    return Array.from(new Set(urls));
}
function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    };
}
function getClearCookieOptions() {
    const { maxAge, ...options } = getCookieOptions();
    return options;
}
function getEnvDiagnostics() {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const optionalSpotify = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
    const databaseIssue = getDatabaseConfigIssue();
    const jwtConfigured = isJwtConfigured();
    return {
        ok: !databaseIssue && jwtConfigured,
        nodeEnv: process.env.NODE_ENV || 'development',
        port: Number(process.env.PORT) || 3001,
        frontendUrls: getClientUrls(),
        databaseConfigured: !databaseIssue,
        databaseIssue,
        jwtConfigured,
        spotifyConfigured: optionalSpotify.every(hasUsableEnv),
        missing: [
            ...(databaseIssue ? ['DATABASE_URL'] : []),
            ...(!jwtConfigured ? ['JWT_SECRET'] : []),
            ...optionalSpotify.filter((name) => !hasUsableEnv(name)),
        ],
    };
}
function createConfigError(message, code = 'CONFIGURATION_ERROR', statusCode = 503) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    return error;
}
