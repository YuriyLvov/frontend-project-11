export const getFormElements = (formElement) => ({
  sendFormBtnElement: formElement.querySelector('[data-selector="send-form-btn"]'),
  urlInputElement: formElement.querySelector('[data-selector="url-input"]'),
  feedbackElement: formElement.querySelector('[data-selector="feedback"]'),
});

export const getOutputElements = (outputElement) => ({
  postsElement: outputElement.querySelector('[data-selector="posts"]'),
  feedContainerElement: outputElement.querySelector('[data-selector="feeds"]'),
});
