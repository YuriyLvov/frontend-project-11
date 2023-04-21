import { Modal } from 'bootstrap';
import lodash from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import getElements from './elements.js';
import rssParser from './parser.js';
import { initLocalization } from './locales/index.js';
import { PROXY_BASE_URL, WATCHER_DELAY } from './constansts.js';

const requestRss = (url, feedState, postState) => {
  const proxyUrl = new URL('get', PROXY_BASE_URL);
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);

  return axios.get(proxyUrl).then((response) => {
    const parsedRss = rssParser(response.data.contents);

    return parsedRss;
  }).then((rssFeed) => {
    if (lodash.isPlainObject(feedState) && !feedState[url]) {
      Object.assign(feedState, {
        [url]: {
          title: rssFeed.title,
          description: rssFeed.description,
        },
      });
    }

    rssFeed.items.forEach((rssItem) => {
      if (lodash.isPlainObject(postState) && !postState[rssItem.link]) {
        Object.assign(postState, {
          [rssItem.link]: rssItem,
        });
      }
    });
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

export default () => {
  initLocalization();

  const {
    feedbackElement, rssFormElement,
    subscriptionsElement, urlInputElement,
    feedContainerElement, previewModalElement,
    previewModalTitleElement, previewModalDescriptionElement,
    previewModalReadAllElement, outputElement,
    sendFormBtnElement,
  } = getElements();

  const modal = new Modal(previewModalElement);
  const rssUrls = [];

  const feeds = {};
  const watchedFeeds = onChange(
    feeds,
    (path, value) => {
      const feedContainer = document.createElement('div');
      const feedTitle = document.createElement('b');
      const feedDescription = document.createElement('p');

      feedTitle.textContent = value.title;
      feedDescription.textContent = value.description;

      feedContainer.appendChild(feedTitle);
      feedContainer.appendChild(feedDescription);

      feedContainerElement.appendChild(feedContainer);
    },
  );

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

  const subscriptionUrls = {};
  const watchedSubscriptionUrls = onChange(
    subscriptionUrls,
    (path, value) => {
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
    },
  );

  const runWatcher = () => {
    setTimeout(() => {
      rssUrls.forEach((url) => requestRss(url, watchedFeeds, watchedSubscriptionUrls));
      runWatcher();
    }, WATCHER_DELAY);
  };

  const urlValidator = yup.string().url().required();

  rssFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    sendFormBtnElement.disabled = true;

    const url = urlInputElement.value;

    urlValidator.validate(url).then(() => {
      const existedUrl = rssUrls.find((rssUrl) => rssUrl === url);
      if (existedUrl) {
        throw new Error(i18next.t('urlAlredyExist'));
      }

      return requestRss(url, watchedFeeds, watchedSubscriptionUrls);
    }).then(() => {
      rssUrls.push(url);

      outputElement.classList.remove('d-none');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('rssAdded');
      urlInputElement.value = '';
    }).catch((error) => {
      urlInputElement.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');

      feedbackElement.textContent = error.message;
    })
      .finally(() => {
        sendFormBtnElement.disabled = false;
      });
  });

  urlInputElement.addEventListener('input', () => {
    urlInputElement.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.remove('text-success');
  });

  runWatcher();
};
