const getElements = () => ({
  rssFormElement: document.getElementById('rss-form'),
  sendFormBtnElement: document.getElementById('send-form-btn'),
  urlInputElement: document.getElementById('url-input'),
  feedbackElement: document.getElementById('feedback'),
  outputElement: document.getElementById('output'),
  subscriptionsElement: document.getElementById('subscriptions'),
  feedContainerElement: document.getElementById('feed'),
  previewModalElement: document.getElementById('previewModal'),
  previewModalTitleElement: document.getElementById('previewModalTitle'),
  previewModalDescriptionElement: document.getElementById('previewModalDescription'),
  previewModalReadAllElement: document.getElementById('previewModalReadAll'),
});

export default getElements;
