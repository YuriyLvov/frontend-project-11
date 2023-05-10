import { Modal } from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import rssParser from './parser.js';
import { initLocalization } from './locales/index.js';
import { getFormElements, getOutputElements } from './elements.js';

const PROXY_BASE_URL = 'https://allorigins.hexlet.app';
const WATCHER_DELAY = 5000;

const getProxyUrl = (url) => {
  const proxyUrl = new URL('get', PROXY_BASE_URL);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return proxyUrl.toString();
};

const requestRss = (url, feedState, postState) => {
  const proxyUrl = getProxyUrl(url);

  return axios.get(proxyUrl).then((response) => {
    try {
      const { feed, items } = rssParser(response.data.contents, url);
      const feedAlreadyExists = Array.isArray(feedState) && feedState.some(
        (feedFromState) => feedFromState.url === url,
      );

      if (!feedAlreadyExists) {
        feedState.push(feed);
      }

      items.forEach((rssItem) => {
        const itemAlreadyExists = Array.isArray(postState) && postState.some(
          (itemFromState) => rssItem.link === itemFromState.link,
        );

        if (!itemAlreadyExists) {
          postState.push(rssItem);
        }
      });
    } catch (error) {
      console.error(error);
      throw new Error(i18next.t('notValid'));
    }
  }).catch((error) => {
    if (error.message === i18next.t('notValid')) {
      throw error;
    }

    if (error?.response?.status < 200 || error?.response?.status > 299) {
      throw new Error(i18next.t('notValid'));
    }

    throw new Error(i18next.t('networkError'));
  });
};

const createPreviewModal = (previewModalElement) => {
  const modal = new Modal(previewModalElement);
  const previewModalTitleElement = previewModalElement.querySelector('.js_preview-modal-title');
  const previewModalDescriptionElement = previewModalElement.querySelector('.js_preview-modal-description');
  const previewModalReadAllElement = previewModalElement.querySelector('.js_preview-modal-read-all');
  const previewModalReadAllLinkElement = previewModalElement.querySelector('.js_preview-modal-read-all-link');

  previewModalReadAllElement.addEventListener('click', () => {
    previewModalReadAllLinkElement.click();
  });

  const openModal = (title, description, link) => {
    previewModalTitleElement.textContent = title;
    previewModalDescriptionElement.textContent = description;
    previewModalReadAllLinkElement.href = link;
    previewModalReadAllLinkElement.target = '_blank';

    modal.show();
  };

  return { openModal };
};

const STATUSES = {
  PENDING: 'pending',
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILTURE: 'failture',
};

const getState = ({
  feedContainerElement,
  postsElement,
  previewModalElement,
  outputElement,
  feedbackElement,
  urlInputElement,
  sendFormBtnElement,
  spinnerElement,
}) => {
  const { openModal } = createPreviewModal(previewModalElement);

  const state = onChange({
    feeds: [],
    posts: [],
    rssInputForm: {
      message: '',
      status: STATUSES.PENDING,
    },
    // eslint-disable-next-line prefer-arrow-callback
  }, function changeState(path, value, prevValue, applyData) {
    if (path === 'feeds') {
      const currentFeed = applyData.args[0];
      const feedContainer = document.createElement('div');
      const feedTitle = document.createElement('b');
      const feedDescription = document.createElement('p');

      feedTitle.textContent = currentFeed.title;
      feedDescription.textContent = currentFeed.description;

      feedContainer.appendChild(feedTitle);
      feedContainer.appendChild(feedDescription);

      feedContainerElement.appendChild(feedContainer);
      outputElement.classList.remove('d-none');
    }

    if (path === 'posts' && applyData && applyData.args && applyData.name === 'push') {
      const currentPost = applyData.args[0];
      const subscriptionContainer = document.createElement('div');
      subscriptionContainer.classList.add('mb-3', 'd-flex', 'justify-content-between', 'align-items-start');

      const subscriptionLink = document.createElement('a');
      subscriptionLink.href = currentPost.link;
      subscriptionLink.target = '_blank';
      subscriptionLink.textContent = currentPost.title;
      subscriptionLink.classList.add('fw-bold');

      subscriptionLink.addEventListener('click', () => {
        subscriptionLink.classList.add('fw-normal');
        subscriptionLink.classList.remove('fw-bold');
      });

      const subscriptionButton = document.createElement('button');
      subscriptionButton.textContent = i18next.t('viewPost');
      subscriptionButton.classList.add('btn', 'btn-primary');

      subscriptionButton.addEventListener('click', () => {
        this.posts = this.posts.map((post) => {
          if (post.link === currentPost.link) {
            return { ...post, opened: true };
          }

          return post;
        });

        openModal(currentPost.title, currentPost.description, currentPost.link);
      });

      subscriptionContainer.appendChild(subscriptionLink);
      subscriptionContainer.appendChild(subscriptionButton);
      postsElement.appendChild(subscriptionContainer);
    }

    if (path === 'posts' && !applyData) {
      const changedPost = value.find((post) => (
        prevValue.find((prevPost) => post.opened !== prevPost.opened)
      ));

      const subscriptionLink = postsElement.querySelector(`a[href="${changedPost.link}"]`);
      subscriptionLink.classList.add('fw-normal');
      subscriptionLink.classList.remove('fw-bold');
    }

    if (path === 'rssInputForm.message' && value) {
      Object.assign(feedbackElement, { textContent: value });
    }

    if (path === 'rssInputForm.status' && value === STATUSES.SUCCESS) {
      Object.assign(urlInputElement, { value: '' });
      spinnerElement.classList.add('d-none');

      urlInputElement.classList.remove('is-invalid');

      feedbackElement.classList.add('text-success');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.remove('d-none');
    }

    if (path === 'rssInputForm.status' && value === STATUSES.FAILTURE) {
      spinnerElement.classList.add('d-none');

      urlInputElement.classList.add('is-invalid');

      feedbackElement.classList.add('text-danger');
      feedbackElement.classList.remove('d-none');
      feedbackElement.classList.remove('text-success');
    }

    if (path === 'rssInputForm.status' && value === STATUSES.LOADING) {
      Object.assign(sendFormBtnElement, { disabled: true });
      spinnerElement.classList.remove('d-none');

      feedbackElement.classList.add('d-none');
    }

    if (path === 'rssInputForm.status' && value === STATUSES.PENDING) {
      Object.assign(sendFormBtnElement, { disabled: false });
      spinnerElement.classList.add('d-none');

      feedbackElement.classList.remove('d-none');
    }
  });

  return state;
};

export default (rssFormElement, previewModalElement, outputElement, spinnerElement) => {
  initLocalization();

  const {
    sendFormBtnElement,
    urlInputElement,
    feedbackElement,
  } = getFormElements(rssFormElement);

  const {
    postsElement,
    feedContainerElement,
  } = getOutputElements(outputElement);

  const state = getState({
    feedContainerElement,
    postsElement,
    previewModalElement,
    outputElement,
    feedbackElement,
    urlInputElement,
    sendFormBtnElement,
    spinnerElement,
  });

  const runWatcher = () => {
    setTimeout(() => {
      const feedUrls = state.feeds.map(({ url }) => url);
      const requestPromises = feedUrls.map(
        (url) => requestRss(url, state.feeds, state.posts),
      );
      Promise.all(requestPromises).then(() => {
        runWatcher();
      });
    }, WATCHER_DELAY);
  };

  const urlValidator = yup.string().url().required();

  rssFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    state.rssInputForm.status = STATUSES.LOADING;

    const url = urlInputElement.value.replace(/\/$/, '');

    urlValidator.validate(url).then(() => {
      const existedUrl = state.feeds.some((feed) => feed.url === url);
      if (existedUrl) {
        throw new Error(i18next.t('urlAlredyExist'));
      }

      return requestRss(url, state.feeds, state.posts);
    }).then(() => {
      state.rssInputForm.message = i18next.t('rssAdded');
      state.rssInputForm.status = STATUSES.SUCCESS;
    }).catch((error) => {
      state.rssInputForm.message = error.message;
      state.rssInputForm.status = STATUSES.FAILTURE;
    })
      .finally(() => {
        state.rssInputForm.status = STATUSES.PENDING;
      });
  });

  runWatcher();
};
