let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {

  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) return console.error('[Error DBHelper.fetchNeighborhoods] ' + error);

    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  updateRestaurants();

  // Avoid blocking critical path to improve performance score
  window.setTimeout(() => {
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };

    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });

    document.getElementById('map').setAttribute('role', 'application');
  }, 2500);
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      lazyLoadImages();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = "col-md-6 col-lg-4";

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
  image.setAttribute('alt', `${restaurant.name} in neighborhood ${restaurant.neighborhood}`);
  li.append(image);
  // console.log(`[Comment] Image appended: ${image.getAttribute('alt')}`);

  const info = document.createElement('div');
  info.className = "restaurant-info";
  li.append(info);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  info.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  info.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  info.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  info.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

// Lazy load images
lazyLoadImages = () => {
  // Note: Use Array.prototype.slice.call to convert HTMLCollection to array
  let lazyImages = Array.prototype.slice.call(document.getElementsByClassName('restaurant-img'));
  console.log('[Comment] Found ' + lazyImages.length + ' lazy images');

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
  window.addEventListener('resize', lazyLoad);
  lazyLoad();
}