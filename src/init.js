import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import {
  feedbackElement, sendFormBtnElement,
  subscriptionsElement, urlInputElement,
  feedContainerElement,
} from './elements.js';
import initLocalization from './localization.js';
import rssParser from './parser.js';

const urlValidator = yup.string().url().required();

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

const subscriptionUrls = {};
const watchedSubscriptionUrls = onChange(
  subscriptionUrls,
  (path, value) => {
    const subscriptionContainer = document.createElement('div');
    const subscriptionLink = document.createElement('a');

    subscriptionLink.href = value.link;
    subscriptionLink.target = '_blank';
    subscriptionLink.textContent = value.title;

    subscriptionContainer.appendChild(subscriptionLink);
    subscriptionsElement.appendChild(subscriptionContainer);
  },
);

export default () => {
  initLocalization();

  sendFormBtnElement.addEventListener('click', (event) => {
    event.preventDefault();
    const url = urlInputElement.value;

    urlValidator.validate(url).then(() => {
      const existedUrl = rssUrls.find((rssUrl) => rssUrl === url);
      if (existedUrl) {
        throw new Error(i18next.t('urlAlredyExist'));
      }

      rssUrls.push(url);

      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('rssAdded');
      urlInputElement.value = '';

      const response = axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`);

      return response;
    }).then((response) => {
      if (response.status < 200 || response.status > 299) {
        throw new Error(i18next.t('notValid'));
      }

      const parsedRss = rssParser(response.data.contents);

      return parsedRss;
    }).then((rssFeed) => {
      if (!watchedFeeds[rssFeed.link]) {
        watchedFeeds[rssFeed.link] = {
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
};
