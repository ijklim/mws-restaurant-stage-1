let CACHE_NAME = 'mws-restaurant-v88';

self.addEventListener('fetch', function(event) {
  // console.log(`[Comment] fetch event listener: ${event.request.url}`);
  // console.log(`>> mode: ${event.request.mode}`);
  // console.log(`>> method: ${event.request.method}`);

  // Should not retrieve POST response from cache
  if (event.request.method === 'POST') {
    // console.log(`>> event.request:`, event.request);
    return fetch(event.request.url);
  }

  event.respondWith(caches.open(CACHE_NAME).then(cache => {
    return cache.match(event.request)
      .then(response => {
        if (response) {
          // console.log(`[Comment] Found in cache: ${event.request.url}`);
          fetchAndCacheUrl(event.request.url, cache);   // Fetch and cache newest data, status not important
          return response;
        }

        return fetchAndCacheUrl(event.request.url, cache);
      })
      .catch(error => {
        return new Response(`Cache match has encountered an error: ${error}`);
      });
  }));
});

async function fetchAndCacheUrl(url, cache) {
  try {
    const { hostname } = new URL(url);
    const fetchOptions = {};
    const hostsThatAllowCors = ['fonts.gstatic.com', 'gstatic.com', 'localhost'];

    if (!hostsThatAllowCors.includes(hostname)) {
      fetchOptions.mode = "no-cors";
    }
    // console.info(`[Comment] fetchAndCacheUrl: ${url}`);
    const response = await fetch(url, fetchOptions);
    cache.put(url, response.clone());
    return response;
  }
  catch(error) {
    Promise.reject(`Error encountered in fetchAndCacheUrl(): ${error}`);
  }

};

// Life Cycle: install
self.addEventListener('install', function(event) {
  console.log(`[Comment] Current cache '${CACHE_NAME}`);
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
