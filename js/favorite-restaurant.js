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
