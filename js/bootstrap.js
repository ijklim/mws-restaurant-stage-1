// Register Service Worker
if ('serviceWorker' in navigator) {
  registerServiceWorker();
} else {
  console.log('Browser does not support service worker');
}

function registerServiceWorker() {
  // Service worker script must be in root as it cannot control requests in parent folders
  navigator.serviceWorker.register('/sw.js', {scope: '/'})
    .then(reg => {
      // console.log(`[Comment] Service worker registered under scope: ${reg.scope}`);
    })
    .catch(err => {
      console.log(`Encountered an error registering service worker: ${err}`);
    });
}

// Document.ready
document.addEventListener("DOMContentLoaded", function(event) {
});
