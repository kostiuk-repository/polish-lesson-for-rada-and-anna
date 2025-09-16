const CACHE_NAME = 'polish-learning-hub-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/index.css',
  '/js/app.js',
  '/js/core/router.js',
  '/js/core/api.js',
  '/js/core/util.js',
  '/js/components/catalog.js',
  '/js/components/lesson.js',
  '/js/components/modal.js',
  '/js/components/tabs.js',
  '/js/components/exercises.js',
  '/js/services/dictionary.js',
  '/js/services/speech.js',
  '/js/services/storage.js',
  '/js/ui/clickable-words.js',
  '/js/ui/dialog-lines.js',
  '/js/ui/tabs.js',
  '/js/ui/word-details.js',
  '/data/catalog.json',
  '/data/dictionary/index.json',
  '/data/dictionary/verbs/basic.json',
  '/data/dictionary/verbs/restaurant.json',
  '/data/dictionary/verbs/shop.json',
  '/data/dictionary/nouns/basic.json',
  '/data/dictionary/nouns/restaurant.json',
  '/data/dictionary/nouns/shop.json',
  '/data/dictionary/adjectives/basic.json',
  '/data/dictionary/adjectives/descriptive.json',
  '/data/lessons/restaurant_dialogue_1.json',
  '/data/lessons/restaurant_review_1.json',
  '/data/lessons/shop_dialogue_1.json',
  '/data/rules/phonetic.json',
  '/data/rules/grammar.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
