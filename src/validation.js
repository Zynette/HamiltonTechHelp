export const categories = [
  'General computer problem',
  'Printer/scanner',
  'Outlook/email',
  'Microsoft 365/OneDrive',
  'New computer setup',
  'File transfer',
  'Wi-Fi/connectivity',
  'Something else',
];
export const devices = [
  'Windows laptop',
  'Windows desktop',
  'Apple Mac',
  'iPhone or iPad',
  'Printer/scanner',
  'Other',
];
export const methods = ['Remote', 'In person — Hamilton', 'Not sure'];
export const windows = [
  'Morning (9 am–12 pm)',
  'Afternoon (12–5 pm)',
  'Evening (5–8 pm)',
  'Flexible',
];
export function validateRequest(body, now = new Date()) {
  const errors = {};
  const clean = {};
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { errors: { form: 'Please submit a valid form.' } };
  const text = (name, max, min = 0) => {
    const raw = body[name] ?? '';
    if (typeof raw !== 'string') {
      errors[name] = 'Please use text for this field.';
      return '';
    }
    const value = raw.trim();
    if (
      value.length < min ||
      value.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
    )
      errors[name] = `Use ${min}–${max} characters for this field.`;
    clean[name] = value;
    return value;
  };
  const choice = (name, allowed) => {
    if (!allowed.includes(body[name])) errors[name] = 'Please choose one of the listed options.';
    else clean[name] = body[name];
  };
  choice('kind', ['inquiry', 'booking']);
  text('name', 80, 1);
  const email = text('email', 254, 3);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
    errors.email = 'Please enter a valid email address.';
  text('description', 2000, 10);
  choice('device', devices);
  choice('category', categories);
  if (body.website !== undefined && body.website !== '')
    errors.website = 'The request could not be accepted.';
  if (body.kind === 'booking') {
    choice('method', methods);
    choice('window', windows);
    const date = text('date', 10, 10);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const parsed = new Date(`${date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/u.test(date) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date ||
      date < today
    )
      errors.date = 'Please choose a valid date, today or later.';
    text('phone', 30);
    if (body.consent !== true)
      errors.consent = 'Please acknowledge that the appointment needs confirmation.';
    else clean.consent = true;
  }
  return { errors, data: clean };
}
