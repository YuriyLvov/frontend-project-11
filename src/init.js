import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        urlNotValid: 'Ссылка должна быть валидным URL',
        rssAdded: 'RSS успешно загружен',
        urlAlredyExist: 'RSS уже существует',
      },
    },
  },
});

yup.setLocale({
  string: {
    url: i18next.t('urlNotValid'),
  },
});

const sendFormBtnElement = document.getElementById('send-form-btn');
const urlInputElement = document.getElementById('url-input');
const feedbackElement = document.getElementById('feedback');
const subscriptionsElement = document.getElementById('subscriptions');

const urlValidator = yup.string().url().required();

const rssUrls = [];

const subscriptionUrls = new Set();
const watchedSubscriptionUrls = onChange(
  subscriptionUrls,
  (path, value, previousValue, applyData) => {
    const newUrl = applyData.args[0];
    if (!previousValue.has(newUrl)) {
      const subscriptionUrlElement = document.createElement('div');
      subscriptionUrlElement.textContent = newUrl;
      subscriptionsElement.appendChild(subscriptionUrlElement);
    }
  },
);

export default () => {
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

      return new Promise((resolve) => {
        resolve(['a', 'b', 'c']);
      });
    }).then((response) => {
      response.forEach((subscriptionUrl) => {
        if (!watchedSubscriptionUrls.has(subscriptionUrl)) {
          watchedSubscriptionUrls.add(subscriptionUrl);
        }
      });
    }).catch((error) => {
      urlInputElement.classList.add('is-invalid');
      feedbackElement.classList.add('text-danger');

      feedbackElement.textContent = error.message;
    });
  });
};

urlInputElement.addEventListener('input', () => {
  urlInputElement.classList.remove('is-invalid');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.classList.remove('text-success');
});
// Ссылка должна быть валидным URL
// is-invalid
// RSS успешно загружен
// RSS уже существует
// text-success
// text-danger
