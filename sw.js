// ================================================================
// SERVICE WORKER - LogiXcube
// ================================================================

const CACHE_NAME = 'rubik-3d-v6.3';

// Усі файли, які кешуються при першому відвідуванні
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './privacy.html',
    './guide.html',
    './manifest.json',
    './icon.png',
    './js/three.min.js',
    './js/OrbitControls.js',
    './locales/en.json',
    './locales/uk.json',
    './locales/de.json',
    './locales/fr.json',
    './locales/es.json',
    './locales/it.json',
    './locales/pl.json',
    './locales/pt.json',
    './locales/ja.json',
    './locales/ko.json',
    './icons/facebook.svg',
    './icons/instagram.svg',
    './icons/youtube.svg',
    './icons/telegram.svg',
    './icons/tiktok.svg',
    './icons/x.svg',
    './icons/gmail.svg'
];

// ================================================================
// 1. INSTALL — кешуємо всі статичні ресурси
// ================================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return Promise.all(
                    STATIC_ASSETS.map((url) => {
                        return cache.add(url).catch((err) => {
                            console.warn('[SW] Failed to cache:', url);
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ================================================================
// 2. ACTIVATE — видаляємо старі кеші
// ================================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ================================================================
// 3. FETCH — стратегії кешування
// ================================================================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // --- НАВІГАЦІЯ (HTML) — Network First ---
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const cloned = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, cloned);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then((cached) => cached || caches.match('./index.html'));
                })
        );
        return;
    }

    // Не кешуємо cross-origin запити
    if (url.origin !== self.location.origin) {
        return;
    }

    // --- СТАТИЧНІ РЕСУРСИ — Cache First ---
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetchAndCache(event.request);
            })
            .catch(() => {
                if (event.request.url.endsWith('.json')) {
                    return new Response('{}', {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                return new Response('', { status: 404 });
            })
    );
});

// ================================================================
// 4. ДОПОМІЖНА ФУНКЦІЯ — завантаження з мережі + кешування
// ================================================================
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
                return response;
            }
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, cloned);
            });
            return response;
        });
}

// ================================================================
// END
// ================================================================
