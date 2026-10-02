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
export const methods = ['Remote'];
export const projectTypes = [
  'New informational website or landing page',
  'Website content updates',
  'Mobile layout or website troubleshooting',
  'Domain, contact form or basic search setup',
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
  choice('kind', ['inquiry', 'booking', 'project']);
  text('name', 80, 1);
  const email = text('email', 254, 3);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
    errors.email = 'Please enter a valid email address.';
  text('description', 2000, 10);
  if (body.kind === 'project') {
    choice('projectType', projectTypes);
    const siteUrl = text('siteUrl', 500);
    if (siteUrl) {
      try {
        const parsed = new URL(siteUrl);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password)
          errors.siteUrl = 'Use a public http or https website URL without login credentials.';
      } catch {
        errors.siteUrl = 'Please enter a complete website URL, including https://.';
      }
    }
    text('timeframe', 120);
  } else {
    choice('device', devices);
    choice('category', categories);
  }
  if (body.website !== undefined && body.website !== '')
    errors.website = 'The request could not be accepted.';
  if (body.kind === 'booking') {
    choice('method', methods);
    text('window', 80, 1);
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
      errors.consent = 'Please acknowledge the appointment request and terms for support.';
    else clean.consent = true;
  }
  return { errors, data: clean };
}
