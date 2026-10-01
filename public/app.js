const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a, button')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);
const bookingDialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
function hamiltonToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
function openBooking(button) {
  closeMenu();
  document.querySelector('#booking-date').min = hamiltonToday();
  if (button.dataset.method) bookingForm.elements.method.value = button.dataset.method;
  if (button.dataset.category) bookingForm.elements.category.value = button.dataset.category;
  bookingDialog.showModal();
  bookingDialog.scrollTop = 0;
}
document
  .querySelectorAll('[data-book]')
  .forEach((button) => button.addEventListener('click', () => openBooking(button)));
document.querySelectorAll('[data-dialog]').forEach((button) =>
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog);
    dialog.showModal();
    dialog.scrollTop = 0;
  }),
);
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  // Escape and focus trapping/return are provided by the native modal dialog.
});
document.querySelectorAll('[data-category]:not([data-book])').forEach((button) =>
  button.addEventListener('click', () => {
    const inquiry = document.querySelector('#inquiry-form');
    inquiry.elements.category.value = button.dataset.category;
    if (button.dataset.category === 'Printer/scanner')
      inquiry.elements.device.value = 'Printer/scanner';
    const description = inquiry.elements.description;
    if (!description.value.trim())
      description.value = `I need help with ${button.dataset.category.toLowerCase()}. `;
    document.querySelector('#ask').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    description.focus({ preventScroll: true });
  }),
);
const observedSections = document.querySelectorAll('#services, #pricing, #how-it-works, #faq');
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navigation
          .querySelectorAll('[aria-current]')
          .forEach((link) => link.removeAttribute('aria-current'));
        navigation
          .querySelector(`a[href="#${entry.target.id}"]`)
          ?.setAttribute('aria-current', 'location');
      }
    }
  },
  { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
);
observedSections.forEach((section) => observer.observe(section));
function setFieldError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  if (!error) return;
  error.textContent = message;
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}
function validateForm(form) {
  let firstInvalid = null;
  for (const input of form.querySelectorAll('input:not([type=hidden]), select, textarea')) {
    if (input.name === 'website') continue;
    input.setCustomValidity('');
    if (input.required && input.type !== 'checkbox' && !input.value.trim())
      input.setCustomValidity('Please complete this field.');
    if (input.name === 'description' && input.value.trim().length < 10)
      input.setCustomValidity('Please add a little more detail (at least 10 characters).');
    if (input.name === 'date' && input.value && input.value < hamiltonToday())
      input.setCustomValidity('Please choose today or a future date.');
    const message = input.validity.valid
      ? ''
      : input.type === 'checkbox'
        ? 'Please acknowledge that the appointment needs confirmation.'
        : input.validity.typeMismatch
          ? 'Please enter a valid email address.'
          : input.validationMessage;
    setFieldError(input, message);
    if (message && !firstInvalid) firstInvalid = input;
  }
  firstInvalid?.focus();
  return !firstInvalid;
}
document.querySelectorAll('.request-form').forEach((form) => {
  let sending = false;
  form.querySelector('[type=submit]').disabled = false;
  form.addEventListener('input', (event) => {
    if (event.target.setCustomValidity) event.target.setCustomValidity('');
    if (event.target.id) setFieldError(event.target, '');
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const status = form.querySelector('.form-status');
    status.textContent = '';
    if (!validateForm(form)) return;
    sending = true;
    const submit = form.querySelector('[type=submit]');
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    const data = Object.fromEntries(new FormData(form));
    data.kind = form.dataset.kind;
    data.consent = form.dataset.kind === 'booking' && form.elements.consent.checked;
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(18000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        if (result.errors) {
          let first = null;
          for (const [name, message] of Object.entries(result.errors)) {
            const input = form.elements.namedItem(name);
            if (input?.id) {
              setFieldError(input, message);
              first ??= input;
            }
          }
          first?.focus();
        }
        throw new Error(
          result.message ||
            'The message could not be sent. Your details are still here; please try again later.',
        );
      }
      status.dataset.state = 'success';
      status.textContent =
        form.dataset.kind === 'booking'
          ? 'Thanks — your appointment request has been received. I’ll confirm the time and pricing with you before the appointment is finalized.'
          : 'Thanks — I got your message. I’ll review the issue and get back to you to let you know whether I can help.';
      form.reset();
      status.focus();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent =
        error.name === 'TimeoutError' || error.name === 'TypeError'
          ? 'I couldn’t verify delivery. Your details are still here. Please wait before trying again, to avoid a duplicate request.'
          : error.message;
      if (!form.querySelector('[aria-invalid=true]')) status.focus();
    } finally {
      sending = false;
      submit.disabled = false;
      submit.innerHTML = original;
      form.removeAttribute('aria-busy');
    }
  });
});
