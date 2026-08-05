const CACHE_NAME = 'rubik-3d-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './js/three.min.js',
  './js/OrbitControls.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⏳ Кешування ресурсів...');
      return cache.addAll(ASSETS).catch(err => console.error('❌ Помилка кешування:', err));
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => {
        return new Response('', { status: 404 });
      });
    })
  );
});
