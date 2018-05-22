let CACHE_NAME = 'mws-restaurant-v7';

self.addEventListener('fetch', function(event) {
  // console.log(`[Comment] fetch event listener: ${event.request.url}`);
  event.respondWith(caches.open(CACHE_NAME).then(cache => {
    return cache.match(event.request)
      .then(response => {
        if (response) {
          // console.log(`[Comment] Found in cache: ${event.request.url}`);
          return response;
        }

        // console.log(`[Comment] Fetching from server: ${event.request.url}`);
        return fetch(event.request.url, { mode: 'no-cors' })
          .then(response => {
            // console.log(`[Comment] fetch returned: ${response.headers.}`);
            cache.put(event.request.url, response.clone());
            return response;
          })
          .catch(error => {
            return new Response(`Network is down, failed to fetch ${event.request.url}`);
          });
      })
      .catch(error => {
        return new Response(`Cache match has encountered an error: ${error}`);
      });
  }));
});

// Life Cycle: install
self.addEventListener('install', function(event) {
  // console.log(`[Comment] Life cycle event 'install' triggered`);

  // Delete obsolete caches
  caches.keys()
    .then(keys => {
      keys.forEach(key => {
        if (CACHE_NAME === key) return;

        console.log(`Deleting old cache '${key}'`);
        caches.delete(key);
      });
    });
});
