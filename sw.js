const CACHE_NAME = 'rubik-v2'; // ← змініть версію, щоб оновити кеш
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
];

// Встановлення – кешуємо ресурси
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⏳ Кешування ресурсів...');
      return cache.addAll(ASSETS).catch(err => {
        console.error('❌ Помилка кешування:', err);
      });
    })
  );
  // Активуємо SW одразу після встановлення
  self.skipWaiting();
});

// Активація – видаляємо старі кеші
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
  // Захоплюємо клієнти одразу
  return self.clients.claim();
});

// Перехоплення запитів – відповідаємо з кешу або з мережі
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => {
        // Якщо немає кешу і немає мережі – повертаємо заглушку
        return new Response('', { status: 404 });
      });
    })
  );
});
