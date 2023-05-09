import init from './init.js';

const runApp = () => {
  const rssFormElement = document.getElementById('rss-form');
  const outputElement = document.getElementById('output');
  const previewModalElement = document.getElementById('preview-modal');
  const spinnerElement = document.querySelector('.js_spinner');

  init(rssFormElement, previewModalElement, outputElement, spinnerElement);
};

export default runApp;
