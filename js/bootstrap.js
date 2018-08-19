// Register Service Worker
if ('serviceWorker' in navigator) {
  registerServiceWorker();
} else {
  console.log('Browser does not support service worker');
}

function registerServiceWorker() {
  // Service worker script must be in root as it cannot control requests in parent folders
  navigator.serviceWorker.register('./sw.js')
    .then(reg => {
      // console.log(`[Comment] Service worker registered under scope: ${reg.scope}`);
      if (reg.waiting) {
        // console.log(`[Comment] Service worker is waiting`);
      } else {
        // console.log(`[Comment] Service worker is registered`, reg);
      }
    })
    .catch(err => {
      console.log(`Encountered an error registering service worker: ${err}`);
    });
}

// Document.ready
document.addEventListener("DOMContentLoaded", function(event) {
  // Change home page link
  document.querySelector("nav h1 a").setAttribute("href", "./");

  // Change footer info
  document.querySelector("footer").innerHTML = `Copyright (c) ${(new Date).getFullYear()}
  <a href="./"><strong>Restaurant Reviews - 2.0.0</strong></a> All Rights Reserved.`;

  DBHelper.postReviewsInQueue();
});
