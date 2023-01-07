const handleError = (elements, error, i18nInstance) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  if (error === '') {
    elements.urlInput.classList.remove('is-invalid');
    elements.feedback.textContent = '';
    return;
  }

  elements.urlInput.classList.add('is-invalid');
  elements.feedback.textContent = i18nInstance.t(`errors.${error}`);
  elements.urlInput.focus();
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.error':
      handleError(elements, value, i18nInstance);
      break;

    default:
      break;
  }
};
