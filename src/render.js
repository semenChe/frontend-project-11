const handleError = (elements, error) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  if (error === '') {
    elements.urlInput.classList.remove('is-invalid');
    elements.feedback.textContent = '';
    return;
  }

  elements.urlInput.classList.add('is-invalid');
  elements.feedback.textContent = error;
  elements.urlInput.focus();
};

export default (elements) => (path, value) => {
  switch (path) {
    case 'form.error':
      handleError(elements, value);
      break;

    default:
      break;
  }
};
