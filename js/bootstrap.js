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
  <a href="./"><strong>Restaurant Reviews - 1.0.2</strong></a> All Rights Reserved.`;
});


// Lazy load images
let lazyImages = [];

window.addEventListener('load', event => {
  // Lazy load images
  // Note: Use Array.prototype.slice.call to convert HTMLCollection to array
  lazyImages = Array.prototype.slice.call(document.getElementsByClassName('restaurant-img'));
  // console.log('[Comment] Found ' + lazyImages.length + ' lazy images');
});

function lazyLoad () {
  lazyImages.forEach(image => {
    if (!isInViewport(image)) return;

    if (image.getAttribute('data-src')) {
      console.log(`[Comment] Lazy loading ${image.getAttribute('data-src')}`);
      image.src = image.getAttribute('data-src');
      image.removeAttribute('data-src');
    }
  });

  cleanLazyImages();
};

function isInViewport (el) {
  var rect = el.getBoundingClientRect();

  return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
   );
};

function cleanLazyImages () {
  lazyImages = lazyImages.filter(image => image.getAttribute('data-src'));
}

window.addEventListener('load', lazyLoad);
window.addEventListener('scroll', lazyLoad);
