/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */

  static get DATABASE_NAME() {
    return `mws-idb-v10`;
  }

  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants(callback) {
    const storeNameRestaurant = 'mws-restaurant';
    const url = `http://localhost:1337/restaurants`;
    const restaurantStorage = localforage.createInstance({
      name: DBHelper.DATABASE_NAME,
      driver: localforage.INDEXEDDB,
      version: 1.0,
      storeName: storeNameRestaurant,
    });

    const tableName = 'restaurants';

    restaurantStorage.getItem(tableName)
      .then(result => {
        if (!result) {
          return fetch(url)
            .then(response => response.json())
            .then(json => {
              console.log(`[Comment] Successfully fetched restaurant data`);

              restaurantStorage.setItem(tableName, json);
              return callback(null, json);
            })
            .catch(error => {
              return callback(`Fetch restaurants request failed: ${error}`, null);
            });
        }

        return callback(null, result);
      })
      .catch(error => {
        return callback(`LocalForage getItem ${tableName} failed: ${error}`, null);
      });
  }

  /**
   * Fetch review for a restaurant.
   */
  static fetchReviewsByRestaurantId(restaurantId) {
    const storeNameReview = 'mws-review';
    const url = `http://localhost:1337/reviews/?restaurant_id=${restaurantId}`;
    const reviewStorage = localforage.createInstance({
      name: DBHelper.DATABASE_NAME,
      driver: localforage.INDEXEDDB,
      version: 1.0,
      storeName: storeNameReview,
    });

    const tableName = `reviews__${restaurantId}`;

    return new Promise((resolve, reject) => {
      reviewStorage.getItem(tableName)
        .then((result) => {
          if (!result) {
            // console.log(`[Comment] ${tableName} not found in cache`);
            fetchAndUpdateCache()
              .then(resolve)
              .catch(reject);
          } else {
            // console.log(`[Comment] Successfully fetched review data from cache for restaurant ${restaurantId}`);
            fetchAndUpdateCache();  // Update cache if possible, status not important
            resolve(result);
          }
        })
        .catch((error) => {
          reject(`LocalForage getItem ${tableName} failed: ${error}`);
        });
    });

    async function fetchAndUpdateCache() {
      try {
        const response = await fetch(url);
        const json = await response.json();
        reviewStorage.setItem(tableName, json);
        // console.log(`[Comment] Successfully fetched review data for restaurant ${restaurantId} and updated cache`);
        return json;
      }
      catch(error) {
        Promise.reject(`Error encountered in fetchAndUpdateCache(): ${error}`);
      }
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          reject(error);
        } else {
          const restaurant = restaurants.find(r => r.id == id);
          if (restaurant) { // Got the restaurant
            resolve(restaurant);
          } else { // Restaurant does not exist in the database
            reject('Restaurant does not exist', null);
          }
        }
      });
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

  static addReviewToQueue(review) {
    const storeNameReviewQueue = 'mws-review-queue';
    const reviewQueueStorage = localforage.createInstance({
      name: DBHelper.DATABASE_NAME,
      driver: localforage.INDEXEDDB,
      version: 1.0,
      storeName: storeNameReviewQueue,
    });
    const tableName = 'reviews';

    // Retrieve existing queue
    reviewQueueStorage.getItem(tableName)
      .then((result) => {
        const currentQueue = result ? result : [];
        currentQueue.push(review);
        reviewQueueStorage.setItem(tableName, currentQueue);
        console.info('[Comment] Review added to queue');
      })
      .catch((error) => {
        console.error(`Could not add review to queue`, error);
      });
  }

  static async postReviewsInQueue() {
    if (!navigator.onLine) {
      return;
    }

    console.log('DBHelper: Checking whether there is any review in queue waiting to be posted');
    const storeNameReviewQueue = 'mws-review-queue';
    const reviewQueueStorage = localforage.createInstance({
      name: DBHelper.DATABASE_NAME,
      driver: localforage.INDEXEDDB,
      version: 1.0,
      storeName: storeNameReviewQueue,
    });
    const tableName = 'reviews';

    const reviews = await reviewQueueStorage.getItem(tableName);
    if (!reviews || reviews.length === 0) return;

    console.log('Found review(s) in queue', reviews);
    const url = `http://localhost:1337/reviews/`;
    const fetchOptions = {
      method: 'POST',
    };
    let response;
    const reviewsSubmittedSuccessfully = [];
    for (const reviewIndex in reviews) {
      fetchOptions.body = JSON.stringify(reviews[reviewIndex]);
      response = await fetch(url, fetchOptions);
      if (response.status === 201 && response.statusText === 'Created') {
        console.log(`Review #${reviewIndex} has been resubmitted successfully`);
        reviewsSubmittedSuccessfully.push(reviewIndex * 1);
      }
    };

    const reviewsToBeSubmittedAgain = reviews.filter((_, index) => {
      return !reviewsSubmittedSuccessfully.includes(index);
    });

    console.log('remove reviewsToBeSubmittedAgain/reviewsSubmittedSuccessfully', reviewsToBeSubmittedAgain, reviewsSubmittedSuccessfully);
    reviewQueueStorage.setItem(tableName, reviewsToBeSubmittedAgain);
  }
}
