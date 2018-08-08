const COOKIE_FAVORITE_RESTAURANT_IDS = "fav-restaurants";
const COOKIE_DAYS_TO_EXPIRATION = 365;

class FavoriteRestaurants {
  constructor() {
    this._favoriteRestaurantIds = new Set(this.favoriteRestaurantIdsInCookie);
  }

  get favoriteRestaurantIdsInCookie() {
    let name = COOKIE_FAVORITE_RESTAURANT_IDS + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return JSON.parse(c.substring(name.length, c.length));
      }
    }
    return "";
  }

  isFavorite(restaurantId) {
    return this._favoriteRestaurantIds.has(restaurantId);
  }

  addFavorite(restaurantId) {
    this._favoriteRestaurantIds.add(restaurantId);
    this.saveFavoriteRestaurantIdsInCookie();
  }

  deleteFavorite(restaurantId) {
    this._favoriteRestaurantIds.delete(restaurantId);
    this.saveFavoriteRestaurantIdsInCookie();
  }

  toggleFavorite(restaurantId) {
    if (this.isFavorite(restaurantId)) {
      this.deleteFavorite(restaurantId);
    } else {
      this.addFavorite(restaurantId);
    }
  }

  saveFavoriteRestaurantIdsInCookie() {
    let favoriteRestaurantIds = JSON.stringify(Array.from(this._favoriteRestaurantIds));
    let d = new Date();
    d.setTime(d.getTime() + (COOKIE_DAYS_TO_EXPIRATION * 24 * 60 * 60 * 1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = COOKIE_FAVORITE_RESTAURANT_IDS + "=" + favoriteRestaurantIds + ";" + expires + ";path=/";
    return favoriteRestaurantIds;
  }
}

createFavoriteButton = (restaurantId) => {
  const favoriteButton = document.createElement('button');
  favoriteButton.id = `btn-favorite-${restaurantId}`;
  favoriteButton.className = "btn-favorite";
  favoriteButton.restaurantId = restaurantId;
  favoriteButton.addEventListener('click', toggleFavorite, { capture: false });

  const favoriteButtonIcon = document.createElement('i');
  favoriteButtonIcon.className = "material-icons";
  favoriteButtonIcon.innerText = "star";
  favoriteButtonIcon.restaurantId = restaurantId;
  favoriteButton.append(favoriteButtonIcon);
  changeFavoriteButtonSettings(favoriteButton);

  return favoriteButton;
};

createReviewForm = () => {
  const reviewFormModal = document.createElement('div');
  reviewFormModal.id = 'modal-review';
  reviewFormModal.className = 'modal';
  reviewFormModal.innerHTML = `
    <h3>Add Review</h3>
    <h5>Restaurant Name: <span id="review-restaurant-name"></span></h5>
  `;

  const reviewForm = document.createElement('form');
  reviewForm.id = 'form-review';
  reviewForm.method = 'GET';
  reviewForm.action = '/';
  reviewForm.setAttribute('target', 'temp');

  reviewForm.onsubmit = submitReview;

  const reviewerName = document.createElement('input');
  reviewerName.name = "name";
  reviewerName.setAttribute('placeholder', 'Your name');
  reviewerName.setAttribute('type', 'text');
  reviewerName.required = true;

  const reviewRating = document.createElement('select');
  reviewRating.name = 'rating';
  reviewRating.required = true;
  for (rating = 0; rating <= 5; rating++) {
    const option = document.createElement('option');
    if (rating) {
      option.setAttribute('value', rating);
      option.innerText = rating;
    } else {
      option.setAttribute('value', '');
      option.innerText = 'Please select rating...';
    }

    reviewRating.append(option);
  }

  const reviewText = document.createElement('textarea');
  reviewText.name = 'comments';
  reviewText.setAttribute('placeholder', 'Add you review here...');
  reviewText.setAttribute('rows', 8);

  const submitButton = document.createElement('button');
  submitButton.innerText = 'Submit';
  submitButton.className = 'success';
  submitButton.setAttribute('type', 'submit');

  reviewForm.append(reviewerName);
  reviewForm.append(reviewRating);
  reviewForm.append(reviewText);
  reviewForm.append(submitButton);
  reviewFormModal.append(reviewForm);

  return reviewFormModal;
}

toggleFavorite = (event) => {
  const restaurantId = event.target.restaurantId;
  const favoriteButton = document.querySelector(`#btn-favorite-${restaurantId}`);
  favoriteRestaurants.toggleFavorite(restaurantId);
  changeFavoriteButtonSettings(favoriteButton);
};

changeFavoriteButtonSettings = (favoriteButton) => {
  const restaurantId = favoriteButton.restaurantId;
  if (favoriteRestaurants.isFavorite(restaurantId)) {
    favoriteButton.classList.add("favorite");
    favoriteButton.setAttribute('title', `Remove from favorite`);
  } else {
    favoriteButton.classList.remove("favorite");
    favoriteButton.setAttribute('title', `Add to favorite`);
  }
};

submitReview = (event) => {
  event.preventDefault();
  console.log('todo: submit review');
};