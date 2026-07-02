"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_NAMES = exports.GENRE_LIST = void 0;
exports.getRedirectUri = getRedirectUri;
exports.getKeyName = getKeyName;
exports.getAuthUrl = getAuthUrl;
exports.getTokens = getTokens;
exports.refreshAccessToken = refreshAccessToken;
exports.getUserProfile = getUserProfile;
exports.getTopTracks = getTopTracks;
exports.getTopArtists = getTopArtists;
exports.searchTracks = searchTracks;
exports.searchAlbums = searchAlbums;
exports.searchPublicAlbums = searchPublicAlbums;
exports.searchPublicTracks = searchPublicTracks;
exports.searchPublicArtists = searchPublicArtists;
exports.getPublicTrack = getPublicTrack;
exports.getTrack = getTrack;
exports.getAlbum = getAlbum;
exports.getAlbumTracks = getAlbumTracks;
exports.getPublicAlbum = getPublicAlbum;
exports.getPublicAlbumTracks = getPublicAlbumTracks;
exports.getPublicArtist = getPublicArtist;
exports.getPublicArtistAlbums = getPublicArtistAlbums;
exports.checkSpotifyApiHealth = checkSpotifyApiHealth;
exports.getAudioFeatures = getAudioFeatures;
exports.getRelatedArtists = getRelatedArtists;
exports.getArtistTopTracks = getArtistTopTracks;
exports.findSimilarTracks = findSimilarTracks;
exports.discoverByGenre = discoverByGenre;
exports.createPlaylist = createPlaylist;
exports.addTracksToPlaylist = addTracksToPlaylist;
exports.shuffle = shuffle;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("./config.js");
// Stale
const API = 'https://api.spotify.com/v1';
const ACCOUNTS = 'https://accounts.spotify.com';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-library-read',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
].join(' ');
// Lista gatunkow, bo adres /recommendations/available-genre-seeds zostal usuniety.
// Ta lista zawiera najwazniejsze gatunki Spotify.
exports.GENRE_LIST = [
    'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient',
    'blues', 'bossanova', 'classical', 'club', 'country',
    'dance', 'disco', 'drum-and-bass', 'dubstep', 'edm',
    'electronic', 'folk', 'funk', 'garage', 'gospel',
    'grunge', 'hard-rock', 'hardcore', 'hip-hop', 'house',
    'indie', 'indie-pop', 'jazz', 'k-pop', 'latin',
    'metal', 'minimal-techno', 'mpb', 'new-wave', 'opera',
    'piano', 'pop', 'progressive-house', 'punk', 'punk-rock',
    'r-n-b', 'reggae', 'reggaeton', 'rock', 'ska',
    'soul', 'synth-pop', 'techno', 'trance', 'trip-hop',
];
exports.KEY_NAMES = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F',
    'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B',
];
// Funkcje pomocnicze
function authHeader(token) {
    return { Authorization: `Bearer ${token}` };
}
function basicAuth() {
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!(0, config_js_1.hasUsableEnv)('SPOTIFY_CLIENT_ID') || !(0, config_js_1.hasUsableEnv)('SPOTIFY_CLIENT_SECRET'))
        throw (0, config_js_1.createConfigError)(config_js_1.SPOTIFY_NOT_CONFIGURED_MESSAGE, 'SPOTIFY_NOT_CONFIGURED', 503);
    return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`;
}
function getRedirectUri() {
    const uri = process.env.SPOTIFY_REDIRECT_URI?.trim();
    if (!uri)
        throw new Error('SPOTIFY_REDIRECT_URI not configured');
    return uri;
}
function getKeyName(key, mode) {
    if (key < 0 || key > 11)
        return 'Unknown';
    return `${exports.KEY_NAMES[key]} ${mode === 1 ? 'Major' : 'Minor'}`;
}
function isStatus(err, status) {
    return axios_1.default.isAxiosError(err) && err.response?.status === status;
}
// Logowanie
function getAuthUrl(state) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId)
        throw new Error('SPOTIFY_CLIENT_ID not set');
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: getRedirectUri(),
        scope: SCOPES,
        show_dialog: 'true',
    });
    if (state)
        params.set('state', state);
    return `${ACCOUNTS}/authorize?${params}`;
}
async function getTokens(code) {
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: getRedirectUri(),
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth(),
        },
    });
    return data;
}
async function refreshAccessToken(refreshToken) {
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth(),
        },
    });
    return data;
}
// Dane usera
async function getUserProfile(token) {
    const { data } = await axios_1.default.get(`${API}/me`, {
        headers: authHeader(token),
    });
    return data;
}
async function getTopTracks(token, timeRange = 'medium_term', limit = 20) {
    const { data } = await axios_1.default.get(`${API}/me/top/tracks`, {
        headers: authHeader(token),
        params: { time_range: timeRange },
    });
    return (data.items ?? []).slice(0, limit);
}
async function getTopArtists(token, timeRange = 'medium_term', limit = 20) {
    const { data } = await axios_1.default.get(`${API}/me/top/artists`, {
        headers: authHeader(token),
        params: { time_range: timeRange },
    });
    return (data.items ?? []).slice(0, limit);
}
// Utwory i wyszukiwanie
async function searchTracks(token, query, limit = 20) {
    // Najpierw bez limitu, bo API moglo sie zmienic
    const url = `${API}/search`;
    console.log('[Spotify searchTracks] Trying search for:', query);
    try {
        const { data } = await axios_1.default.get(url, {
            headers: authHeader(token),
            params: { q: query, type: 'track' },
        });
        console.log('[Spotify searchTracks] Success, got', data.tracks?.items?.length, 'tracks');
        return (data.tracks?.items ?? []).slice(0, limit);
    }
    catch (err) {
        console.error('[Spotify searchTracks] FAILED:', err.response?.status, JSON.stringify(err.response?.data));
        console.error('[Spotify searchTracks] Full request URL:', err.config?.url);
        console.error('[Spotify searchTracks] Params:', JSON.stringify(err.config?.params));
        throw err;
    }
}
async function searchAlbums(token, query, limit = 20) {
    const { data } = await axios_1.default.get(`${API}/search`, {
        headers: authHeader(token),
        params: { q: query, type: 'album', limit },
    });
    return (data.albums?.items ?? []).slice(0, limit);
}
let clientCredentialsCache = {
    token: null,
    expiresAt: 0,
};
async function getClientCredentialsToken() {
    const now = Date.now();
    if (clientCredentialsCache.token && clientCredentialsCache.expiresAt > now + 30000) {
        return clientCredentialsCache.token;
    }
    const { data } = await axios_1.default.post(`${ACCOUNTS}/api/token`, new URLSearchParams({
        grant_type: 'client_credentials',
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: basicAuth(),
        },
    });
    clientCredentialsCache = {
        token: data.access_token,
        expiresAt: now + Math.max(0, (data.expires_in || 3600) - 60) * 1000,
    };
    return clientCredentialsCache.token;
}
async function publicGet(path, params = {}) {
    const token = await getClientCredentialsToken();
    const { data } = await axios_1.default.get(`${API}${path}`, {
        headers: authHeader(token),
        params,
    });
    return data;
}
function simplifyArtist(artist) {
    return {
        id: artist.id,
        name: artist.name,
        spotifyUrl: artist.external_urls?.spotify || null,
    };
}
function simplifyAlbum(album) {
    const releaseDate = album.release_date || '';
    return {
        id: album.id,
        name: album.name,
        title: album.name,
        artists: (album.artists || []).map(simplifyArtist),
        releaseYear: releaseDate ? releaseDate.slice(0, 4) : null,
        releaseDate,
        imageUrl: album.images?.[0]?.url || null,
        totalTracks: album.total_tracks || 0,
        albumType: album.album_type || null,
        genres: album.genres || [],
        spotifyUrl: album.external_urls?.spotify || null,
    };
}
function simplifyPublicArtist(artist) {
    return {
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images?.[0]?.url || null,
        genres: artist.genres || [],
        followersTotal: artist.followers?.total ?? null,
        popularity: artist.popularity ?? null,
        spotifyUrl: artist.external_urls?.spotify || null,
    };
}
function simplifyAlbumTrack(track) {
    return {
        id: track.id,
        trackNumber: track.track_number,
        name: track.name,
        title: track.name,
        durationMs: track.duration_ms,
        artists: (track.artists || []).map(simplifyArtist),
        spotifyUrl: track.external_urls?.spotify || null,
    };
}
function simplifyPublicTrack(track) {
    const album = track.album || {};
    const releaseDate = album.release_date || '';
    return {
        id: track.id,
        name: track.name,
        title: track.name,
        artists: (track.artists || []).map(simplifyArtist),
        albumId: album.id || null,
        albumName: album.name || null,
        imageUrl: album.images?.[0]?.url || null,
        durationMs: track.duration_ms,
        releaseDate,
        releaseYear: releaseDate ? releaseDate.slice(0, 4) : null,
        trackNumber: track.track_number,
        discNumber: track.disc_number,
        spotifyUrl: track.external_urls?.spotify || null,
    };
}
async function searchPublicAlbums(query, limit = 4) {
    const data = await publicGet('/search', { q: query, type: 'album', limit });
    return (data.albums?.items || []).map(simplifyAlbum).slice(0, limit);
}
async function searchPublicTracks(query, limit = 4) {
    const data = await publicGet('/search', { q: query, type: 'track', limit });
    return (data.tracks?.items || []).map(simplifyPublicTrack).slice(0, limit);
}
async function searchPublicArtists(query, limit = 4) {
    const data = await publicGet('/search', { q: query, type: 'artist', limit });
    return (data.artists?.items || []).map(simplifyPublicArtist).slice(0, limit);
}
async function getPublicAlbum(albumId) {
    const album = await publicGet(`/albums/${albumId}`);
    return simplifyAlbum(album);
}
async function getPublicAlbumTracks(albumId, maxTracks = 200) {
    const tracks = [];
    let offset = 0;
    const pageSize = 50;
    while (tracks.length < maxTracks) {
        const data = await publicGet(`/albums/${albumId}/tracks`, { limit: pageSize, offset });
        const items = data.items || [];
        tracks.push(...items.map(simplifyAlbumTrack));
        if (!data.next || items.length === 0)
            break;
        offset += items.length;
    }
    return tracks.slice(0, maxTracks);
}
async function getPublicTrack(trackId) {
    const track = await publicGet(`/tracks/${trackId}`);
    return simplifyPublicTrack(track);
}
async function getPublicArtist(artistId) {
    const artist = await publicGet(`/artists/${artistId}`);
    return simplifyPublicArtist(artist);
}
async function getPublicArtistAlbums(artistId, limit = 20) {
    const finalLimit = Math.max(1, Math.min(50, Number.parseInt(String(limit), 10) || 20));
    const albums = [];
    const seen = new Set();
    let offset = 0;
    const pageSize = Math.min(10, finalLimit);
    while (albums.length < finalLimit && offset < 200) {
        const data = await publicGet(`/artists/${artistId}/albums`, {
            include_groups: 'album,single',
            limit: pageSize,
            offset,
        });
        const items = data.items || [];
        for (const album of items) {
            const releaseDate = album.release_date || '';
            const releaseYear = releaseDate ? releaseDate.slice(0, 4) : '';
            const dedupeKey = `${String(album.name || '').toLowerCase().trim()}-${releaseYear}`;
            if (!seen.has(dedupeKey)) {
                seen.add(dedupeKey);
                albums.push(simplifyAlbum(album));
            }
            if (albums.length >= finalLimit) {
                break;
            }
        }
        if (!data.next || items.length === 0) {
            break;
        }
        offset += items.length;
    }
    return albums.slice(0, finalLimit);
}
async function checkSpotifyApiHealth() {
    const configured = (0, config_js_1.hasUsableEnv)('SPOTIFY_CLIENT_ID') && (0, config_js_1.hasUsableEnv)('SPOTIFY_CLIENT_SECRET');
    if (!configured) {
        return {
            ok: false,
            configured: false,
            token: false,
            error: config_js_1.SPOTIFY_NOT_CONFIGURED_MESSAGE,
        };
    }
    try {
        await getClientCredentialsToken();
        return { ok: true, configured: true, token: true };
    }
    catch (error) {
        return {
            ok: false,
            configured: true,
            token: false,
            error: error.response?.data?.error_description || error.response?.data?.error || error.message || 'Spotify token request failed',
        };
    }
}
async function getTrack(token, trackId) {
    const { data } = await axios_1.default.get(`${API}/tracks/${trackId}`, {
        headers: authHeader(token),
    });
    return data;
}
async function getAlbum(token, albumId) {
    const { data } = await axios_1.default.get(`${API}/albums/${albumId}`, {
        headers: authHeader(token),
    });
    return data;
}
async function getAlbumTracks(token, albumId, maxTracks = 200) {
    const tracks = [];
    let offset = 0;
    const pageSize = 50;
    while (tracks.length < maxTracks) {
        const { data } = await axios_1.default.get(`${API}/albums/${albumId}/tracks`, {
            headers: authHeader(token),
            params: { limit: pageSize, offset },
        });
        const items = data.items ?? [];
        tracks.push(...items);
        if (!data.next || items.length === 0)
            break;
        offset += items.length;
    }
    return tracks.slice(0, maxTracks);
}
/**
 * Pobiera cechy audio utworu.
 * Zwraca null, gdy endpoint jest zablokowany (403) albo brak wyniku (404).
 */
async function getAudioFeatures(token, trackId) {
    try {
        const { data } = await axios_1.default.get(`${API}/audio-features/${trackId}`, {
            headers: authHeader(token),
        });
        return data;
    }
    catch (err) {
        if (isStatus(err, 403) || isStatus(err, 404))
            return null;
        throw err;
    }
}
// Odkrywanie muzyki zamiast starego /recommendations
async function getRelatedArtists(token, artistId) {
    const { data } = await axios_1.default.get(`${API}/artists/${artistId}/related-artists`, {
        headers: authHeader(token),
    });
    return data.artists;
}
async function getArtistTopTracks(token, artistId, market = 'US') {
    const { data } = await axios_1.default.get(`${API}/artists/${artistId}/top-tracks`, {
        headers: authHeader(token),
        params: { market },
    });
    return data.tracks;
}
/**
 * Szuka utworow podobnych do podanego utworu.
 *
 * Jak to dziala:
 *   1. Bierze glownego artyste utworu.
 *   2. Pobiera podobnych artystow.
 *   3. Pobiera ich top utwory.
 *   4. Usuwa duplikaty, usuwa seed track i miesza wyniki.
 *
 * Gdy to sie nie uda, robi zwykle wyszukiwanie po nazwie artysty.
 */
async function findSimilarTracks(token, trackId, limit = 20) {
    const track = await getTrack(token, trackId);
    const artistId = track.artists[0]?.id;
    if (!artistId)
        return [];
    let relatedArtists = [];
    try {
        relatedArtists = await getRelatedArtists(token, artistId);
    }
    catch {
        return searchTracks(token, track.artists[0].name, limit);
    }
    if (relatedArtists.length === 0) {
        return searchTracks(token, track.artists[0].name, limit);
    }
    // Wez do 4 losowych podobnych artystow i ich top utwory
    const picked = shuffle(relatedArtists).slice(0, 4);
    const trackLists = await Promise.all(picked.map((a) => getArtistTopTracks(token, a.id).catch(() => [])));
    // Polacz listy, usun duplikaty i utwor startowy, potem wymieszaj
    const seen = new Set([trackId]);
    const pool = [];
    for (const list of trackLists) {
        for (const t of list) {
            if (!seen.has(t.id)) {
                seen.add(t.id);
                pool.push(t);
            }
        }
    }
    return shuffle(pool).slice(0, limit);
}
/**
 * Odkrywa utwory dla gatunku przez wyszukiwarke.
 * Zastepuje stare /recommendations?seed_genres=.
 */
async function discoverByGenre(token, genre, limit = 20) {
    const results = await searchTracks(token, `genre:${genre}`, 50);
    return shuffle(results).slice(0, limit);
}
// Playlisty
async function createPlaylist(token, userId, name, description, isPublic = true) {
    const { data } = await axios_1.default.post(`${API}/users/${userId}/playlists`, { name, description, public: isPublic }, { headers: authHeader(token) });
    return data;
}
async function addTracksToPlaylist(token, playlistId, trackUris) {
    const { data } = await axios_1.default.post(`${API}/playlists/${playlistId}/tracks`, { uris: trackUris }, { headers: authHeader(token) });
    return data;
}
// Narzedzia
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
//# sourceMappingURL=spotify.js.map
