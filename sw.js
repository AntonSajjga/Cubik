const CACHE_NAME = 'rubik-3d-v4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './js/three.min.js',
  './js/OrbitControls.js'
];

// Встановлення
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⏳ Кешування ресурсів...');
      return cache.addAll(ASSETS).catch(err => {
        console.error('❌ Помилка кешування:', err);
      });
    })
  );
  self.skipWaiting();
});

// Активація
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑 Видалення старого кешу:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Головна сторінка — Network First
  if (
    e.request.mode === 'navigate' ||
    url.pathname.endsWith('index.html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/Cubik/') ||
    url.pathname.endsWith('/Cubik')
  ) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(e.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Все інше — Cache First
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(e.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return new Response('', { status: 404 });
        });
    })
  );
});
