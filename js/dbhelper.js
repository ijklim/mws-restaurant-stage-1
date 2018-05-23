/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    // return `./data/restaurants.json`;
    return `http://localhost:1337/restaurants`;
  }

  static get DATABASE_NAME() {
    return `mws-idb-restaurants-v3`;
  }

  static get STORE_NAME() {
    return `restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants(callback) {
    // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
    let db;
    let request = window.indexedDB.open(DBHelper.DATABASE_NAME, 1);

    request.onupgradeneeded = async function(event) {
      // First time access, create schema here
      db = event.target.result;
      // Create store/table without data
      let objectStore = db.createObjectStore(DBHelper.STORE_NAME, { keyPath: "id" });

      await fetch(DBHelper.DATABASE_URL)
        .then(response => response.json())
        .then(json => {
          objectStore.transaction.oncomplete = function(event) {
            // Populate restaurants store
            let restaurantObjectStore = db.transaction(DBHelper.STORE_NAME, "readwrite").objectStore(DBHelper.STORE_NAME);
            json.forEach(function(restaurant) {
              console.log(`[Comment] Adding restaurant: ${restaurant.id}`);
              restaurantObjectStore.add(restaurant);
            });
          };
        })
        .catch(error => {
          return callback(`Fetch request failed: ${error}`, null);
        });
    }

    request.onsuccess = function(event) {
      // Store exists
      db = event.target.result;
      let restaurants = [];

      let restaurantObjectStore = db.transaction(DBHelper.STORE_NAME, "readonly").objectStore(DBHelper.STORE_NAME);
      restaurantObjectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
          restaurants.push(cursor.value);
          cursor.continue();
        } else {
          callback(null, restaurants);
        }
      }

      // Generic error handler
      db.onerror = function(event) {
        return callback(`IndexedDB Error: ${event.target.errorCode}`, null);
      }
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
