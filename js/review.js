const REVIEW_MODAL_ID = 'modal-review';
const MODAL_OVERLAY_ID = 'modal-overlay';

createReviewButton = () => {
  const reviewButton = document.createElement('button');
  reviewButton.innerText = "Add Review";
  reviewButton.addEventListener('click', openReviewForm);

  return reviewButton;
}

createRefreshReviewsButton = () => {
  const refreshReviewsButton = document.createElement('button');
  refreshReviewsButton.innerText = "Refresh Reviews";
  refreshReviewsButton.addEventListener('click', () => {
    const id = getParameterByName('id');
    console.log(`[Comment] Retrieving reviews for restaurant #${id} at ` + new Date().toLocaleTimeString());
    DBHelper.fetchReviewsByRestaurantId(id)
      .then((reviews) => {
        console.log(`[Comment] New list of reviews:`, reviews);
        self.restaurant.reviews = reviews;
        fillReviewsHTML();
      });
  });

  return refreshReviewsButton;
}

createModalOverlay = () => {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = MODAL_OVERLAY_ID;
  modalOverlay.setAttribute('style', `
    position: fixed;
    left: 0px;
    top: 0px;
    height: 100vh;
    width: 100%;
    background: black;
    opacity: 0.4;
    display: none;
    z-index: 5;
  `);
  modalOverlay.addEventListener('click', closeReviewForm);

  return modalOverlay;
}

createReviewForm = () => {
  const reviewFormModal = document.createElement('div');
  reviewFormModal.id = REVIEW_MODAL_ID;
  reviewFormModal.className = 'modal';
  reviewFormModal.setAttribute('style', `
    display: none;
  `);
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

  const restaurantId = document.createElement('input');
  restaurantId.name = "restaurant_id";
  restaurantId.value = getParameterByName('id');
  restaurantId.setAttribute('type', 'hidden');

  const reviewerName = document.createElement('input');
  reviewerName.name = "name";
  reviewerName.setAttribute('placeholder', 'Your name');
  reviewerName.setAttribute('type', 'text');
  reviewerName.required = true;

  const reviewRating = document.createElement('select');
  const maxRating = 5;
  const minRating = 1;
  reviewRating.name = 'rating';
  reviewRating.required = true;
  for (rating = maxRating + 1; rating >= minRating; rating--) {
    const option = document.createElement('option');
    if (rating <= maxRating) {
      option.setAttribute('value', rating);
      option.innerText = rating;
      if (rating === maxRating) {
        option.innerText += ' (Highest)'
      } else if (rating === minRating) {
        option.innerText += ' (Lowest)'
      }
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

  const cancelButton = document.createElement('button');
  cancelButton.innerText = 'Cancel';
  cancelButton.setAttribute('type', 'button');
  cancelButton.addEventListener('click', closeReviewForm);

  reviewForm.append(restaurantId);
  reviewForm.append(reviewerName);
  reviewForm.append(reviewRating);
  reviewForm.append(reviewText);
  reviewForm.append(cancelButton);
  reviewForm.append(submitButton);
  reviewFormModal.append(reviewForm);

  return reviewFormModal;
}

openReviewForm = () => {
  let modalOverlay = document.querySelector(`#${MODAL_OVERLAY_ID}`);
  if (!modalOverlay) {
    modalOverlay = createModalOverlay();
    document.body.append(modalOverlay);
  }

  let reviewFormModal = document.querySelector(`#${REVIEW_MODAL_ID}`);
  if (!reviewFormModal) {
    reviewFormModal = createReviewForm();
    document.body.append(reviewFormModal);
  }

  showElement(modalOverlay);
  showElement(reviewFormModal);
};

closeReviewForm = () => {
  let modalOverlay = document.querySelector(`#${MODAL_OVERLAY_ID}`);
  let reviewFormModal = document.querySelector(`#${REVIEW_MODAL_ID}`);

  if (reviewFormModal) {
    hideElement(reviewFormModal);
  }

  if (modalOverlay) {
    hideElement(modalOverlay);
  }
}

submitReview = (event) => {
  event.preventDefault();

  const url = `http://localhost:1337/reviews/`;
  const restaurantIdField = document.querySelector('input[name=restaurant_id]');
  const nameField = document.querySelector('input[name=name]');
  const ratingField = document.querySelector('select[name=rating]');
  const commentField = document.querySelector('textarea[name=comments]');

  const postData = {
    "restaurant_id": restaurantIdField.value * 1,
    "name": nameField.value,
    "rating": ratingField.value * 1,
    "comments": commentField.value ? commentField.value : '',
  };
  const fetchOptions = {
    method: 'POST',
    body: JSON.stringify(postData),
  };
  // console.info('[Comment] Form data to be posted', postData, fetchOptions);

  fetch(url, fetchOptions)
    .then((response) => {
      // console.info('[Comment] Response from review submission', response);
      if (response.status === 201 && response.statusText === 'Created') {
        console.log('Positive response from server at ' + new Date().toLocaleTimeString());
        alert('Review has been submitted successfully');
      }
    })
    .catch((error) => {
      // Add pending review to database
      DBHelper.addReviewToQueue(postData);
    })
    .finally(() => {
      nameField.value = '';
      ratingField.value ='';
      commentField.value = '';
      closeReviewForm();
    });
};

showElement = (element) => {
  element.style.display = 'block';
}

hideElement = (element) => {
  element.style.display = 'none';
}
