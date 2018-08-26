let restaurant;
let reviews;
var map;
let favoriteRestaurants = new FavoriteRestaurants();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      document.getElementById('map').setAttribute('role', 'application');
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    Promise.all([
      DBHelper.fetchRestaurantById(id),
      DBHelper.fetchReviewsByRestaurantId(id),
    ])
      .then((results) => {
        self.restaurant = results[0];
        self.restaurant.reviews = results[1];

        fillRestaurantHTML();
        callback(null, self.restaurant)
      })
      .catch((error) => {
        return callback(`fetchRestaurantFromURL failed: ${error}`, null);
      });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const favoriteButton = createFavoriteButton(restaurant.id);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.prepend(favoriteButton);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', `${restaurant.name} in neighborhood ${restaurant.neighborhood}`);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  // Review button
  document.getElementById('restaurant-review').appendChild(createReviewButton());
  document.getElementById('restaurant-review').appendChild(createRefreshReviewsButton());
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  console.log(`[Comment] Clear previous reviews`);
  ul.innerHTML = '';

  // Show newest reviews first
  reviews
    .map((review) => {
      return {
        ...review,
        dateValue: (new Date(review.createdAt)).valueOf(),
      }
    })
    .sort((a, b) => {
      return a.dateValue > b.dateValue;
    })
    .forEach((review, reviewIndex) => {
      ul.prepend(createReviewHTML(reviewIndex, review));
      // ul.appendChild(createReviewHTML(reviewIndex, review));
    });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (reviewIndex, review) => {
  const li = document.createElement('li');

  const header = document.createElement('div');
  header.className = "header";
  header.innerHTML = `<small>#${reviewIndex + 1}.</small> ${review.name}`;
  li.appendChild(header);

  if (review.createdAt) {
    const date = document.createElement('span');
    date.innerHTML = (new Date(review.createdAt)).toDateString();
    date.className = "right";
    header.appendChild(date);
  }


  const body = document.createElement('div');
  li.appendChild(body);

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = `rating-${review.rating}`;
  body.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  body.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
