import { Modal } from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import rssParser from './parser.js';
import { i18instance } from './locales/index.js';
import { getFormElements, getOutputElements } from './elements.js';
import {
  onError,
  onFormFailture,
  onFeedsChanged,
  onFormValidating,
  onFormPending,
  onPostAdded,
  onPostOpened,
  onLodaing,
  onLoadingFailture,
  onLoadingPending,
  onLoadingSuccess,
} from './view.js';

const PROXY_BASE_URL = 'https://allorigins.hexlet.app';
const WATCHER_DELAY = 5000;

const getProxyUrl = (url) => {
  const proxyUrl = new URL('get', PROXY_BASE_URL);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return proxyUrl.toString();
};

const requestRss = (url) => {
  const proxyUrl = getProxyUrl(url);

  return axios.get(proxyUrl)
    .then((response) => {
      try {
        const parsedRss = rssParser(response.data.contents);

        return parsedRss;
      } catch (error) {
        console.error(error);
        throw new Error(i18instance.t('notValid'));
      }
    })
    .catch((error) => {
      if (error.message === i18instance.t('notValid')) {
        throw error;
      }

      if (error?.response?.status < 200 || error?.response?.status > 299) {
        throw new Error(i18instance.t('notValid'));
      }

      throw new Error(i18instance.t('networkError'));
    });
};

const updatePosts = (posts, postState) => posts.forEach((post) => {
  const postAlreadyExists = Array.isArray(postState) && postState.some(
    (itemFromState) => post.link === itemFromState.link,
  );

  if (!postAlreadyExists) {
    postState.push(post);
  }
});

const createPreviewModal = (previewModalElement) => {
  const modal = new Modal(previewModalElement);
  const previewModalTitleElement = previewModalElement.querySelector('[data-selector="preview-modal-title"]');
  const previewModalDescriptionElement = previewModalElement.querySelector('[data-selector="preview-modal-description"]');
  const previewModalReadAllElement = previewModalElement.querySelector('[data-selector="preview-modal-read-completely"]');

  const openModal = (title, description, link) => {
    previewModalTitleElement.textContent = title;
    previewModalDescriptionElement.textContent = description;
    previewModalReadAllElement.href = link;
    previewModalReadAllElement.target = '_blank';

    modal.show();
  };

  return { openModal };
};

const FORM_STATUSES = {
  PENDING: 'pending',
  FAILTURE: 'failture',
  VALIDATING: 'validating',
};

const LOADING_STATUSES = {
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
    readedPosts: [],
    rssInputForm: {
      error: '',
      status: FORM_STATUSES.PENDING,
    },
    loadingState: {
      error: '',
      status: '',
    },
    // eslint-disable-next-line prefer-arrow-callback
  }, function changeState(path, value, prevValue, applyData) {
    if (path === 'feeds') {
      const currentFeed = applyData.args[0];

      onFeedsChanged({ currentFeed, feedContainerElement, outputElement });
    }

    if (path === 'posts' && applyData && applyData.args && applyData.name === 'push') {
      const currentPost = applyData.args[0];

      onPostAdded({
        currentPost,
        postsElement,
        openModal,
        readedPosts: this.readedPosts,
      });
    }

    if (path === 'readedPosts') {
      onPostOpened({ openedUrl: applyData.args[0], postsElement });
    }

    if (path === 'rssInputForm.error' && value) {
      onError({ feedbackElement, value });
    }

    if (path === 'rssInputForm.status' && value === FORM_STATUSES.FAILTURE) {
      onFormFailture({ feedbackElement, spinnerElement, urlInputElement });
    }

    if (path === 'rssInputForm.status' && value === FORM_STATUSES.VALIDATING) {
      onFormValidating({ feedbackElement, sendFormBtnElement, spinnerElement });
    }

    if (path === 'rssInputForm.status' && value === FORM_STATUSES.PENDING) {
      onFormPending({ feedbackElement, sendFormBtnElement, spinnerElement });
    }

    if (path === 'loadingState.error' && value) {
      onError({ feedbackElement, value });
    }

    if (path === 'loadingState.status' && value === LOADING_STATUSES.PENDING) {
      onLoadingPending({ feedbackElement, sendFormBtnElement, spinnerElement });
    }

    if (path === 'loadingState.status' && value === LOADING_STATUSES.LOADING) {
      onLodaing({ feedbackElement, spinnerElement, urlInputElement });
    }

    if (path === 'loadingState.status' && value === LOADING_STATUSES.SUCCESS) {
      onLoadingSuccess({ feedbackElement, spinnerElement, urlInputElement });
    }

    if (path === 'loadingState.status' && value === LOADING_STATUSES.FAILTURE) {
      onLoadingFailture({ feedbackElement, spinnerElement, urlInputElement });
    }
  });

  return state;
};

export default (rssFormElement, previewModalElement, outputElement, spinnerElement) => {
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
      const requestPromises = state.feeds.map(
        ({ url }) => requestRss(url).then(({ items }) => updatePosts(items, state.posts)),
      );
      Promise.all(requestPromises).then(() => {
        runWatcher();
      });
    }, WATCHER_DELAY);
  };

  rssFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    state.rssInputForm.status = FORM_STATUSES.VALIDATING;

    const urlValidator = yup.string()
      .transform((value) => value.replace(/\/$/, ''))
      .url()
      .notOneOf(
        state.feeds.map(({ url }) => url),
        i18instance.t('urlAlredyExist'),
      )
      .required();

    const valudationResult = urlValidator.validate(urlInputElement.value)
      .then((url) => url)
      .catch((error) => {
        state.rssInputForm.error = error.message;
        state.rssInputForm.status = FORM_STATUSES.FAILTURE;

        throw error;
      });

    valudationResult
      .then((url) => requestRss(url))
      .then((parsedRss) => {
        state.feeds.push({ ...parsedRss.feed, url: urlInputElement.value });
        updatePosts(parsedRss.items, state.posts);

        state.loadingState.status = LOADING_STATUSES.SUCCESS;
      })
      .catch((error) => {
        state.loadingState.error = error.message;
        state.loadingState.status = LOADING_STATUSES.FAILTURE;
      })
      .finally(() => {
        state.rssInputForm.status = FORM_STATUSES.PENDING;
      });
  });

  runWatcher();
};
