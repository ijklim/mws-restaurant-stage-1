let CACHE_NAME = 'mws-restaurant-v1';

self.addEventListener('fetch', function(event) {
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
            cache.put(event.request.url, response.clone());
            return response;
          })
          .catch(error => {
            return new Response('Network is down');
          });
      })
      .catch(error => {
        return new Response(`Cache match has encountered an error: ${error}`);
      });
  }));
});