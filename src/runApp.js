import init from './init.js';
import { config, i18instance, initLocalization } from './locales/index.js';

const runApp = () => {
  const rssFormElement = document.getElementById('rss-form');
  const outputElement = document.getElementById('output');
  const previewModalElement = document.getElementById('preview-modal');
  const spinnerElement = document.querySelector('.js_spinner');

  i18instance.init(config, (error) => {
    if (error) {
      console.error(error);
      return;
    }
    initLocalization(i18instance);
    init(rssFormElement, previewModalElement, outputElement, spinnerElement);
  });
};

export default runApp;
