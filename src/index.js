import 'bootstrap/dist/css/bootstrap.min.css';
import init from './init.js';

(() => {
  const rssFormElement = document.getElementById('rss-form');
  const outputElement = document.getElementById('output');
  const previewModalElement = document.getElementById('preview-modal');
  init(rssFormElement, previewModalElement, outputElement);
})();
