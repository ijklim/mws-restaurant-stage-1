const REVIEW_MODAL_ID = 'modal-review';
const MODAL_OVERLAY_ID = 'modal-overlay';

createReviewButton = () => {
  const reviewButton = document.createElement('button');
  reviewButton.innerText = "Add Review";
  reviewButton.addEventListener('click', openReviewForm);

  return reviewButton;
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

  const cancelButton = document.createElement('button');
  cancelButton.innerText = 'Cancel';
  cancelButton.setAttribute('type', 'button');
  cancelButton.addEventListener('click', closeReviewForm);

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
  console.log('todo: submit review');
};

showElement = (element) => {
  element.style.display = 'block';
  // if (element.className.indexOf('d-none') >= 0) {
  //   element.className = element.className.replace('d-none', '').trim();
  // }
}

hideElement = (element) => {
  element.style.display = 'none';
  // element.className += ' d-none';
}