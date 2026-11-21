
document.addEventListener('submit', (event) => {
  if (!event.target.matches('.request-form')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const status = event.target.querySelector('.form-status');
  if (status) {
    status.dataset.state = 'error';
    status.textContent =
      'This is a design-only preview. No message has been sent. Please do not enter personal information here.';
    status.focus();
  }
}, true);
