import { Modal } from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import {
  feedbackElement, rssFormElement,
  subscriptionsElement, urlInputElement,
  feedContainerElement, previewModalElement,
  previewModalTitleElement, previewModalDescriptionElement,
  previewModalReadAllElement, outputElement,
} from './elements.js';
import initLocalization from './localization.js';
import rssParser from './parser.js';

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
    window.open(link);
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

const requestRss = (url) => (
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`).then((response) => {
    const parsedRss = rssParser(response.data.contents);

    return parsedRss;
  }).then((rssFeed) => {
    outputElement.classList.remove('d-none');
    if (!watchedFeeds[url]) {
      watchedFeeds[url] = {
        title: rssFeed.title,
        description: rssFeed.description,
      };
    }

    rssFeed.items.forEach((rssItem) => {
      if (!watchedSubscriptionUrls[rssItem.link]) {
        watchedSubscriptionUrls[rssItem.link] = rssItem;
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
  })
);

const runWatcher = () => {
  setTimeout(() => {
    rssUrls.forEach((url) => requestRss(url));
    runWatcher();
  }, 5000);
};

export default () => {
  initLocalization();

  const urlValidator = yup.string().url().required();

  rssFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = urlInputElement.value;

    urlValidator.validate(url).then(() => {
      const existedUrl = rssUrls.find((rssUrl) => rssUrl === url);
      if (existedUrl) {
        throw new Error(i18next.t('urlAlredyExist'));
      }

      return requestRss(url);
    }).then(() => {
      rssUrls.push(url);

      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('rssAdded');
      urlInputElement.value = '';
    }).catch((error) => {
      urlInputElement.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');

      feedbackElement.textContent = error.message;
    });
  });

  urlInputElement.addEventListener('input', () => {
    urlInputElement.classList.remove('is-invalid');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.remove('text-success');
  });

  runWatcher();
};
