import i18next from 'i18next';

export const onFeedsChanged = ({ currentFeed, feedContainerElement, outputElement }) => {
  const feedContainer = document.createElement('div');
  const feedTitle = document.createElement('b');
  const feedDescription = document.createElement('p');

  feedTitle.textContent = currentFeed.title;
  feedDescription.textContent = currentFeed.description;

  feedContainer.appendChild(feedTitle);
  feedContainer.appendChild(feedDescription);

  feedContainerElement.appendChild(feedContainer);
  outputElement.classList.remove('d-none');
};

export const onPostAdded = ({
  currentPost,
  postsElement,
  openModal,
  readedPosts,
}) => {
  const subscriptionContainer = document.createElement('div');
  subscriptionContainer.classList.add('mb-3', 'd-flex', 'justify-content-between', 'align-items-start');

  const subscriptionLink = document.createElement('a');
  subscriptionLink.href = currentPost.link;
  subscriptionLink.target = '_blank';
  subscriptionLink.textContent = currentPost.title;
  subscriptionLink.classList.add('fw-bold');

  subscriptionLink.addEventListener('click', () => {
    readedPosts.push(currentPost.link);
  });

  const subscriptionButton = document.createElement('button');
  subscriptionButton.textContent = i18next.t('viewPost');
  subscriptionButton.classList.add('btn', 'btn-primary');

  subscriptionButton.addEventListener('click', () => {
    readedPosts.push(currentPost.link);

    openModal(currentPost.title, currentPost.description, currentPost.link);
  });

  subscriptionContainer.appendChild(subscriptionLink);
  subscriptionContainer.appendChild(subscriptionButton);
  postsElement.appendChild(subscriptionContainer);
};

export const onError = ({ feedbackElement, value }) => {
  Object.assign(feedbackElement, { textContent: value });
};

export const onFormFailture = ({ feedbackElement, spinnerElement, urlInputElement }) => {
  spinnerElement.classList.add('d-none');

  urlInputElement.classList.add('is-invalid');

  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('d-none');
  feedbackElement.classList.remove('text-success');
};

export const onFormValidating = ({ feedbackElement, sendFormBtnElement, spinnerElement }) => {
  sendFormBtnElement.setAttribute('disabled', true);
  spinnerElement.classList.remove('d-none');

  feedbackElement.classList.add('d-none');
};

export const onFormPending = ({ feedbackElement, sendFormBtnElement, spinnerElement }) => {
  sendFormBtnElement.removeAttribute('disabled');
  spinnerElement.classList.add('d-none');

  feedbackElement.classList.remove('d-none');
};

export const onPostOpened = ({ openedUrl, postsElement }) => {
  const subscriptionLink = postsElement.querySelector(`a[href="${openedUrl}"]`);
  subscriptionLink.classList.add('fw-normal');
  subscriptionLink.classList.remove('fw-bold');
};

export const onLoadingPending = ({ feedbackElement, sendFormBtnElement, spinnerElement }) => {
  sendFormBtnElement.removeAttribute('disabled');
  spinnerElement.classList.add('d-none');

  feedbackElement.classList.remove('d-none');
};

export const onLoadingSuccess = ({ feedbackElement, spinnerElement, urlInputElement }) => {
  Object.assign(feedbackElement, { textContent: i18next.t('rssAdded') });
  Object.assign(urlInputElement, { value: '' });
  spinnerElement.classList.add('d-none');

  urlInputElement.classList.remove('is-invalid');

  feedbackElement.classList.add('text-success');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.classList.remove('d-none');
};

export const onLodaing = ({ feedbackElement, sendFormBtnElement, spinnerElement }) => {
  sendFormBtnElement.setAttribute('disabled', true);
  spinnerElement.classList.remove('d-none');

  feedbackElement.classList.add('d-none');
};

export const onLoadingFailture = ({ feedbackElement, spinnerElement, urlInputElement }) => {
  spinnerElement.classList.add('d-none');

  urlInputElement.classList.add('is-invalid');

  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('d-none');
  feedbackElement.classList.remove('text-success');
};
