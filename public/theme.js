export const themes = [
  'auto',
  'spring',
  'summer',
  'autumn',
  'winter',
  'christmas',
  'new-year',
  'valentine',
  'easter',
  'canada-day',
  'halloween',
  'thanksgiving',
];
export function torontoDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function easterDay(year) {
  const a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(year, month - 1, day);
}
export function themeForDate(date = new Date()) {
  const [year, month, day] = torontoDate(date).split('-').map(Number);
  const season =
    month >= 3 && month <= 5
      ? 'spring'
      : month >= 6 && month <= 8
        ? 'summer'
        : month >= 9 && month <= 11
          ? 'autumn'
          : 'winter';
  const today = Date.UTC(year, month - 1, day),
    easter = easterDay(year);
  const octoberFirst = new Date(Date.UTC(year, 9, 1)).getUTCDay();
  const thanksgiving = 1 + ((8 - octoberFirst) % 7) + 7;
  let holiday = '';
  if ((month === 11 && day >= 25) || (month === 12 && day <= 26)) holiday = 'christmas';
  else if ((month === 12 && day >= 27) || (month === 1 && day <= 5)) holiday = 'new-year';
  else if (month === 2 && day >= 7 && day <= 14) holiday = 'valentine';
  else if (today >= easter - 2 * 86400000 && today <= easter + 86400000) holiday = 'easter';
  else if ((month === 6 && day >= 25) || (month === 7 && day === 1)) holiday = 'canada-day';
  else if (month === 10 && day >= 15) holiday = 'halloween';
  else if (month === 10 && day >= thanksgiving - 3 && day <= thanksgiving) holiday = 'thanksgiving';
  return { season, holiday, theme: holiday || season };
}
export function loadPreferences(storage) {
  try {
    const value = JSON.parse(storage.getItem('studio-preferences'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
