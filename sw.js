// ================================================================
// sw.js – повноцінний Service Worker для офлайн-роботи
// ================================================================

const CACHE_NAME = 'rubik-3d-v6.1';

// Усі файли, які потрібно закешувати при першому відвідуванні
const STATIC_ASSETS = [
  './',
  './index.html',
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
// 1. ВСТАНОВЛЕННЯ – кешуємо всі статичні ресурси
// ================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Встановлення, кешування ресурсів...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] ✅ Усі ресурси закешовано');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] ❌ Помилка кешування:', error);
      })
  );
});

// ================================================================
// 2. АКТИВАЦІЯ – видаляємо старі кеші та перехоплюємо управління
// ================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] 🚀 Активація, очищення старих кешів...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] 🗑 Видалення старого кешу:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Старі кеші очищено, перехоплюємо управління');
        return self.clients.claim();
      })
  );
});

// ================================================================
// 3. ПЕРЕХОПЛЕННЯ ЗАПИТІВ – стратегії для різних типів
// ================================================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- СТРАТЕГІЯ ДЛЯ НАВІГАЦІЇ (HTML-сторінки) ---
  // Network First – завжди намагаємося отримати свіжу версію з мережі,
  // але якщо немає інтернету – віддаємо з кешу
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Якщо відповідь коректна – оновлюємо кеш
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Якщо мережа недоступна – віддаємо закешовану версію
          return caches.match(event.request)
            .then((cached) => {
              return cached || caches.match('./index.html');
            });
        })
    );
    return;
  }

  // --- СТРАТЕГІЯ ДЛЯ СТАТИЧНИХ РЕСУРСІВ (JS, CSS, JSON, іконки) ---
  // Cache First – спочатку перевіряємо кеш, потім мережу
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Якщо ресурс є в кеші – повертаємо його
        if (cachedResponse) {
          // Для JSON-файлів перевіряємо, чи вони не пошкоджені
          if (event.request.url.endsWith('.json')) {
            return cachedResponse.clone().text().then((text) => {
              try {
                JSON.parse(text);
                return cachedResponse;
              } catch (e) {
                // Якщо JSON пошкоджено – видаляємо з кешу та завантажуємо знову
                console.warn('[SW] ⚠️ Пошкоджений JSON у кеші, завантажуємо знову:', event.request.url);
                caches.delete(event.request);
                return fetchAndCache(event.request);
              }
            }).catch(() => {
              return fetchAndCache(event.request);
            });
          }
          return cachedResponse;
        }

        // Якщо в кеші немає – завантажуємо з мережі та кешуємо
        return fetchAndCache(event.request);
      })
      .catch(() => {
        // Якщо все погано – повертаємо заглушку
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
// 4. ДОПОМІЖНА ФУНКЦІЯ – завантаження з мережі з кешуванням
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
    })
    .catch((error) => {
      console.warn('[SW] ⚠️ Не вдалося завантажити ресурс:', request.url, error);
      throw error;
    });
}

// ================================================================
// 5. ОБРОБКА ПОМИЛОК (опціонально)
// ================================================================
self.addEventListener('error', (event) => {
  console.error('[SW] ❌ Помилка:', event.message);
});

// ================================================================
// КІНЕЦЬ SW
// ================================================================
