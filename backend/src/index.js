"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config_js_1 = require("./lib/config.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const user_js_1 = __importDefault(require("./routes/user.js"));
const reviews_js_1 = __importDefault(require("./routes/reviews.js"));
const instagramReviews_js_1 = __importDefault(require("./routes/instagramReviews.js"));
const profiles_js_1 = __importDefault(require("./routes/profiles.js"));
const publicReviews_js_1 = __importDefault(require("./routes/publicReviews.js"));
const spotify_js_1 = __importDefault(require("./routes/spotify.js"));
const playlists_js_1 = __importDefault(require("./routes/playlists.js"));
const recommendations_js_1 = __importDefault(require("./routes/recommendations.js"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
// Srodkowa warstwa aplikacji
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Pozwalaj na wybrane adresy
        const allowed = (0, config_js_1.getClientUrls)();
        // W trybie dev pozwalaj tez na lokalne IP
        const isLocalNetwork = origin && (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/.test(origin) ||
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/.test(origin));
        if (!origin || allowed.includes(origin) || isLocalNetwork) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Trasy API
app.use('/api/auth', auth_js_1.default);
app.use('/api/user', user_js_1.default);
app.use('/api/reviews', reviews_js_1.default);
app.use('/api/instagram-reviews', instagramReviews_js_1.default);
app.use('/api/profiles', profiles_js_1.default);
app.use('/api/public/reviews', publicReviews_js_1.default);
app.use('/api/spotify', spotify_js_1.default);
app.use('/api/playlists', playlists_js_1.default);
app.use('/api/recommendations', recommendations_js_1.default);
// Sprawdzenie czy API dziala
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'waveeProjectBW API is running',
        env: (0, config_js_1.getEnvDiagnostics)(),
    });
});
// Prosta obsluga bledow
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, '0.0.0.0', () => {
    const diagnostics = (0, config_js_1.getEnvDiagnostics)();
    console.log(`waveeProjectBW server running on http://localhost:${PORT}`);
    if (diagnostics.missing.length > 0) {
        console.warn('[Config] Missing or placeholder env:', diagnostics.missing.join(', '));
    }
    if (diagnostics.databaseIssue) {
        console.error(diagnostics.databaseIssue);
    }
    if (!diagnostics.jwtConfigured) {
        console.warn('[Config] JWT_SECRET is missing, too short, or still a placeholder');
    }
});
//# sourceMappingURL=index.js.map


