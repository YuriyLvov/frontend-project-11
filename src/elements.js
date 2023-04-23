export const getFormElements = (formElement) => ({
  sendFormBtnElement: formElement.querySelector('.js_send-form-btn'),
  urlInputElement: formElement.querySelector('.js_url-input'),
  feedbackElement: formElement.querySelector('.js_feedback'),
});

export const getOutputElements = (outputElement) => ({
  subscriptionsElement: outputElement.querySelector('.js_subscriptions'),
  feedContainerElement: outputElement.querySelector('.js_feed'),
});
