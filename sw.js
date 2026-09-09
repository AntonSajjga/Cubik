// sw.js — LogixCube 3D PRO
const CACHE_NAME = 'logixcube-v2.1.0';

// Усі критичні файли, які мають працювати офлайн
const ASSETS = [
  '/',
  '/index.html',
  '/js/three.min.js',
  '/js/OrbitControls.js',
  '/icon.png',
  '/manifest.json',

  // Локалізації
  '/locales/en.json',
  '/locales/uk.json',
  '/locales/de.json',
  '/locales/fr.json',
  '/locales/es.json',
  '/locales/it.json',
  '/locales/pl.json',
  '/locales/pt.json',
  '/locales/ja.json',
  '/locales/ko.json',

  // Іконки
  '/icons/facebook.svg',
  '/icons/instagram.svg',
  '/icons/youtube.svg',
  '/icons/telegram.svg',
  '/icons/tiktok.svg',
  '/icons/x.svg',
  '/icons/gmail.svg'
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching all assets');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())   // одразу активуємо нову версію
      .catch((err) => {
        console.error('[SW] Failed to cache assets:', err);
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Не чіпаємо API LemonSqueezy (потрібен інтернет для активації)
  if (url.includes('api.lemonsqueezy.com') || url.includes('lemonsqueezy.com')) {
    return;
  }

  // Стратегія: Cache First → Network → Offline fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Повертаємо з кешу (швидко і офлайн)
        return cachedResponse;
      }

      // Немає в кеші — йдемо в мережу
      return fetch(event.request)
        .then((networkResponse) => {
          // Кешуємо тільки успішні відповіді
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Повністю офлайн і немає в кеші
          if (event.request.mode === 'navigate') {
            // Для навігації повертаємо головну сторінку
            return caches.match('/index.html') || caches.match('/');
          }

          // Для інших ресурсів
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});
