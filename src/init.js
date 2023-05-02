import { Modal } from 'bootstrap';
import lodash from 'lodash';
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
      const { feed, items } = rssParser(response.data.contents);

      if (lodash.isPlainObject(feedState) && !feedState[url]) {
        Object.assign(feedState, {
          [url]: feed,
        });
      }

      items.forEach((rssItem) => {
        if (lodash.isPlainObject(postState) && !postState[rssItem.link]) {
          Object.assign(postState, {
            [rssItem.link]: rssItem,
          });
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

  const openModal = (title, description, link) => {
    previewModalTitleElement.textContent = title;
    previewModalDescriptionElement.textContent = description;
    previewModalReadAllElement.onclick = () => {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.target = '_blank';

      anchor.click();
    };
    modal.show();
  };

  return { openModal };
};

const getState = (
  feedContainerElement,
  subscriptionsElement,
  previewModalElement,
  outputElement,
  feedbackElement,
  urlInputElement,
  sendFormBtnElement,
) => {
  const { openModal } = createPreviewModal(previewModalElement);

  const state = onChange({
    feeds: {},
    subscriptions: {},
    rssInputForm: {
      message: '',
      error: '',
      sendInProgress: false,
      inputInProgress: false,
    },
  }, (path, value) => {
    if (path.startsWith('feeds.')) {
      const feedContainer = document.createElement('div');
      const feedTitle = document.createElement('b');
      const feedDescription = document.createElement('p');

      feedTitle.textContent = value.title;
      feedDescription.textContent = value.description;

      feedContainer.appendChild(feedTitle);
      feedContainer.appendChild(feedDescription);

      feedContainerElement.appendChild(feedContainer);
      outputElement.classList.remove('d-none');
    }

    if (path.startsWith('subscriptions.')) {
      const subscriptionContainer = document.createElement('div');
      subscriptionContainer.classList.add('mb-3', 'd-flex', 'justify-content-between', 'align-items-start');

      const subscriptionLink = document.createElement('a');
      subscriptionLink.href = value.link;
      subscriptionLink.target = '_blank';
      subscriptionLink.textContent = value.title;
      subscriptionLink.classList.add('fw-bold');

      subscriptionLink.addEventListener('click', () => {
        subscriptionLink.classList.add('fw-normal');
        subscriptionLink.classList.remove('fw-bold');
      });

      const subscriptionButton = document.createElement('button');
      subscriptionButton.textContent = i18next.t('viewPost');
      subscriptionButton.classList.add('btn', 'btn-primary');

      subscriptionButton.addEventListener('click', () => {
        subscriptionLink.classList.add('fw-normal');
        subscriptionLink.classList.remove('fw-bold');

        openModal(value.title, value.description, value.link);
      });

      subscriptionContainer.appendChild(subscriptionLink);
      subscriptionContainer.appendChild(subscriptionButton);
      subscriptionsElement.appendChild(subscriptionContainer);
    }

    if (path === 'rssInputForm.message' && value) {
      feedbackElement.classList.add('text-success');
      Object.assign(feedbackElement, { textContent: value });
      Object.assign(urlInputElement, { value: '' });
    }

    if (path === 'rssInputForm.error' && value) {
      urlInputElement.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');
      Object.assign(feedbackElement, { textContent: value });
    }

    if (path === 'rssInputForm.sendInProgress') {
      Object.assign(sendFormBtnElement, { disabled: value });
    }

    if (path === 'rssInputForm.inputInProgress' && value) {
      urlInputElement.classList.remove('is-invalid');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.remove('text-success');
    }
  });

  return state;
};

export default (rssFormElement, previewModalElement, outputElement) => {
  initLocalization();

  const {
    sendFormBtnElement,
    urlInputElement,
    feedbackElement,
  } = getFormElements(rssFormElement);

  const {
    subscriptionsElement,
    feedContainerElement,
  } = getOutputElements(outputElement);

  const state = getState(
    feedContainerElement,
    subscriptionsElement,
    previewModalElement,
    outputElement,
    feedbackElement,
    urlInputElement,
    sendFormBtnElement,
  );

  const runWatcher = () => {
    setTimeout(() => {
      const feedUrls = Object.keys(state.feeds);
      const requestPromises = feedUrls.map(
        (url) => requestRss(url, state.feeds, state.subscriptions),
      );
      Promise.all(requestPromises).then(() => {
        runWatcher();
      });
    }, WATCHER_DELAY);
  };

  const urlValidator = yup.string().url().required();

  rssFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    state.rssInputForm.sendInProgress = true;
    state.rssInputForm.inputInProgress = false;

    const url = urlInputElement.value.replace(/\/$/, '');

    urlValidator.validate(url).then(() => {
      const existedUrl = Object.hasOwn(state.feeds, url);
      if (existedUrl) {
        throw new Error(i18next.t('urlAlredyExist'));
      }

      return requestRss(url, state.feeds, state.subscriptions);
    }).then(() => {
      state.rssInputForm.message = i18next.t('rssAdded');
      state.rssInputForm.error = '';
    }).catch((error) => {
      state.rssInputForm.message = '';
      state.rssInputForm.error = error.message;
    })
      .finally(() => {
        state.rssInputForm.sendInProgress = false;
      });
  });

  urlInputElement.addEventListener('input', () => {
    state.rssInputForm.inputInProgress = true;
  });

  runWatcher();
};
