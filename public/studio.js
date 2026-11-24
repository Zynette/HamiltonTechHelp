import { themes, themeForDate, loadPreferences } from './theme.js';
import { clinicTopics } from './clinic.js';
const fil = document.documentElement.lang === 'fil';
const t = (en, tl) => (fil ? tl : en);
const root = document.documentElement;
let prefs = {};
try {
  prefs = loadPreferences(localStorage);
} catch {}
const themeSelect = document.querySelector('#theme-choice'),
  appearance = document.querySelector('#appearance'),
  calm = document.querySelector('#calm'),
  large = document.querySelector('#large-text');
const system = matchMedia('(prefers-color-scheme: dark)'),
  motion = matchMedia('(prefers-reduced-motion: reduce)');
if (!fil && (navigator.languages || []).some((x) => /^(fil|tl)(-|$)/i.test(x))) {
  const suggestion = document.createElement('p');
  suggestion.className = 'language-suggestion';
  const a = document.createElement('a');
  a.href = document.querySelector('.language').href;
  a.lang = 'fil';
  a.textContent = 'Mas komportable sa Filipino? Basahin ang bersyong Filipino.';
  suggestion.append(a);
  document.querySelector('.utility').after(suggestion);
}
const queryTheme = new URLSearchParams(location.search).get('theme');
if (themes.includes(queryTheme)) prefs.theme = queryTheme;
themeSelect.value = themes.includes(prefs.theme) ? prefs.theme : 'auto';
appearance.value = ['system', 'light', 'dark'].includes(prefs.appearance)
  ? prefs.appearance
  : 'system';
calm.checked = !!prefs.calm;
large.checked = !!prefs.large;
function applyPreferences() {
  const date = themeForDate();
  root.dataset.theme = themeSelect.value === 'auto' ? date.theme : themeSelect.value;
  root.dataset.season = date.season;
  root.dataset.appearance =
    appearance.value === 'system' ? (system.matches ? 'dark' : 'light') : appearance.value;
  root.dataset.calm = String(calm.checked || motion.matches);
  root.classList.toggle('large-text', large.checked);
  const edition = document.querySelector('#edition');
  if (edition)
    edition.textContent =
      t('The studio, in ', 'Ang studio, sa ') +
      themeSelect.options[
        themeSelect.value === 'auto' ? themes.indexOf(date.theme) : themeSelect.selectedIndex
      ].text;
}
for (const control of [themeSelect, appearance, calm, large])
  control.addEventListener('change', () => {
    prefs = {
      theme: themeSelect.value,
      appearance: appearance.value,
      calm: calm.checked,
      large: large.checked,
    };
    try {
      localStorage.setItem('studio-preferences', JSON.stringify(prefs));
    } catch {}
    applyPreferences();
  });
system.addEventListener('change', applyPreferences);
motion.addEventListener('change', applyPreferences);
applyPreferences();
setInterval(applyPreferences, 60000);
const campaign = document.querySelector('#campaign-text');
if (campaign) {
  const m = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', month: 'numeric' }).format(
      new Date(),
    ),
  );
  const en = [
    'A new computer, with familiar files. Ask about setup and organization.',
    'Make everyday email and files easier to manage.',
    'A gentle spring clean for your computer and files.',
    'A gentle spring clean for your computer and files.',
    'A gentle spring clean for your computer and files.',
    'Refresh your business website for the season ahead.',
    'Refresh your business website for the season ahead.',
    'Refresh your business website for the season ahead.',
    'A little preparation for a new school year.',
    'Take a moment to review suspicious-email habits.',
    'Prepare your small business website for holiday inquiries.',
    'A new laptop? Ask about setup and careful file transfers.',
  ];
  const tl = [
    'Bagong computer, pamilyar na files. Magtanong tungkol sa setup at pag-aayos.',
    'Gawing mas madali ang email at files.',
    'Panahon para ayusin ang computer at files.',
    'Panahon para ayusin ang computer at files.',
    'Panahon para ayusin ang computer at files.',
    'I-refresh ang website ng negosyo ngayong season.',
    'I-refresh ang website ng negosyo ngayong season.',
    'I-refresh ang website ng negosyo ngayong season.',
    'Maghanda para sa bagong school year.',
    'Suriin ang nakasanayan sa kahina-hinalang email.',
    'Ihanda ang website para sa holiday inquiries.',
    'Bagong laptop? Magtanong tungkol sa setup at maingat na file transfer.',
  ];
  campaign.textContent = (fil ? tl : en)[m - 1];
}
async function atmosphere() {
  try {
    const r = await fetch('/api/weather', { signal: AbortSignal.timeout(6500) });
    if (!r.ok) return;
    const { weather: w } = await r.json();
    if (!w) return;
    root.dataset.weather = w.kind;
    document.querySelector('#weather').textContent =
      `Hamilton · ${Math.round(w.temperature)}°C · ${t(w.condition, { rain: 'Ulan', snow: 'Niyebe', cloudy: 'Maulap', night: 'Gabi', sunny: 'Maaraw' }[w.kind])}`;
  } catch {}
}
atmosphere();
const slider = document.querySelector('#compare');
if (slider)
  slider.addEventListener('input', () => {
    document.querySelector('.comparison-after').style.clipPath =
      `inset(0 ${100 - Number(slider.value)}% 0 0)`;
    slider.setAttribute('aria-valuetext', slider.value + t('% after', '% pagkatapos'));
  });
const tips = [
  [
    'Windows + L locks a Windows PC. On a Mac, Control + Command + Q locks the screen.',
    'Windows + L para i-lock ang Windows PC. Sa Mac, Control + Command + Q.',
  ],
  [
    'Use Ctrl + F on Windows or Command + F on Mac to find a word on a page.',
    'Gamitin ang Ctrl + F sa Windows o Command + F sa Mac para maghanap ng salita.',
  ],
  [
    'Save a copy before making a large change to an important document.',
    'Mag-save ng kopya bago ang malaking pagbabago sa mahalagang dokumento.',
  ],
];
document.querySelector('#surprise').addEventListener('click', () => {
  const pair = tips[Math.floor(Math.random() * tips.length)];
  document.querySelector('#tip').textContent = t(...pair);
});
const topic = document.querySelector('#clinic-topic');
if (topic) {
  for (const row of clinicTopics) {
    const o = new Option(t(row[1], row[2]), row[0]);
    topic.add(o);
  }
  let context = '';
  document.querySelector('#clinic-show').addEventListener('click', () => {
    const row = clinicTopics.find((x) => x[0] === topic.value),
      danger = document.querySelector('#clinic-danger').checked;
    document.querySelector('#clinic-advice').textContent = danger
      ? t(
          'Remote support may be unsuitable. For damage or a failing drive, stop and seek a qualified local repair or recovery provider. For a complete outage, contact your internet provider.',
          'Maaaring hindi angkop ang remote help. Kung may sira o pumapalyang drive, huminto at humingi ng lokal na repair o recovery provider. Kung walang internet, kontakin ang internet provider.',
        )
      : t(row[4], row[5]);
    context = `Tech Clinic: ${row[1]}. Device: ${document.querySelector('#clinic-device').value}. Started: ${document.querySelector('#clinic-start').value}. Scope: ${document.querySelector('#clinic-scope').value}. Restarted after saving: ${document.querySelector('#clinic-restarted').checked ? 'yes' : 'no'}. ${danger ? 'Physical damage / failing drive / no internet reported.' : ''}`;
    document.querySelector('#clinic-context').textContent = t(
      'For ' +
        document.querySelector('#clinic-device').value +
        ': review the steps that apply to your device.',
      'Para sa ' +
        document.querySelector('#clinic-device').value +
        ': piliin ang angkop na hakbang.',
    );
    document.querySelector('#clinic-help').disabled = danger;
    const result = document.querySelector('#clinic-result');
    result.hidden = false;
    result.focus();
  });
  for (const el of document.querySelectorAll('.clinic-panel select,.clinic-panel input'))
    el.addEventListener('change', () => {
      document.querySelector('#clinic-result').hidden = true;
    });
  document.querySelector('#clinic-help').addEventListener('click', () => {
    const row = clinicTopics.find((x) => x[0] === topic.value);
    try {
      sessionStorage.setItem(
        'clinic-brief',
        JSON.stringify({
          description: context,
          device: document.querySelector('#clinic-device').value,
          category: row[3],
        }),
      );
      location.href = (fil ? '/fil' : '/') + '#ask';
    } catch {
      document.querySelector('#clinic-context').textContent = t(
        'Your browser cannot carry these answers. Please copy the steps you tried into the inquiry on the homepage.',
        'Hindi maililipat ng browser ang sagot. Ilagay sa inquiry sa homepage ang mga nasubukan.',
      );
    }
  });
}
const inquiry = document.querySelector('#inquiry-form');
if (inquiry) {
  try {
    const saved = JSON.parse(sessionStorage.getItem('clinic-brief'));
    if (saved && typeof saved.description === 'string') {
      inquiry.elements.description.value = saved.description.slice(0, 1800);
      if ([...inquiry.elements.device.options].some((x) => x.value === saved.device))
        inquiry.elements.device.value = saved.device;
      inquiry.elements.category.value = clinicTopics.some((x) => x[3] === saved.category)
        ? saved.category
        : 'General computer problem';
      sessionStorage.removeItem('clinic-brief');
    }
  } catch {}
}
const routes = {
  '#website-quote': 'project-dialog',
  '#business-setup': 'project-dialog',
  '#remote-help': 'booking-dialog',
  '#quote-business-email': 'project-dialog',
  '#quote-booking-setup': 'project-dialog',
  '#quote-website-care': 'project-dialog',
  '#privacy': 'privacy-dialog',
  '#terms': 'terms-dialog',
};
function openDialog(id) {
  const d = document.getElementById(id);
  if (d && !d.open) {
    if (id === 'booking-dialog')
      document.querySelector('#booking-date').min = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    d.showModal();
  }
}
function openRoute() {
  const presets = {
    '#business-setup': 'Business email or Microsoft 365 setup',
    '#quote-business-email': 'Business email or Microsoft 365 setup',
    '#quote-booking-setup': 'Booking or inquiry form setup',
    '#quote-website-care': 'Website care or ongoing updates',
  };
  const project = document.querySelector('#project-type');
  if (project && presets[location.hash]) project.value = presets[location.hash];
  openDialog(routes[location.hash]);
}
for (const b of document.querySelectorAll('[data-dialog]'))
  b.addEventListener('click', () => openDialog(b.dataset.dialog));
for (const d of document.querySelectorAll('dialog')) {
  d.querySelector('.close-dialog, .dialog-close').addEventListener('click', () => d.close());
  d.addEventListener('close', () => {
    if (routes[location.hash] === d.id)
      history.replaceState(null, '', location.pathname + location.search);
  });
}
window.addEventListener('hashchange', openRoute);
openRoute();
for (const form of document.querySelectorAll('.request-form')) {
  let sending = false;
  const submit = form.querySelector('[type=submit]');
  submit.disabled = false;
  function error(input, message) {
    const small = document.getElementById(input.id + '-error');
    if (small) small.textContent = message;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', input.id + '-error');
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  form.addEventListener('input', (e) => {
    if (e.target.setCustomValidity) e.target.setCustomValidity('');
    error(e.target, '');
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    let first;
    const status = form.querySelector('.form-status');
    status.textContent = '';
    for (const input of form.querySelectorAll('input:not([type=hidden]),select,textarea')) {
      if (input.name === 'website') continue;
      input.setCustomValidity('');
      if (input.required && input.type !== 'checkbox' && !input.value.trim())
        input.setCustomValidity('required');
      if (input.name === 'description' && input.value.trim().length < 10)
        input.setCustomValidity('detail');
      if (!input.validity.valid) {
        let message =
          input.type === 'checkbox'
            ? t(
                'Please acknowledge the request and terms.',
                'Pakikumpirma ang request at mga tuntunin.',
              )
            : input.validity.typeMismatch
              ? t(
                  'Please enter a valid ' +
                    (input.type === 'email'
                      ? 'email address.'
                      : 'website URL, including https://.'),
                  'Ilagay ang wastong email address o buong website URL.',
                )
              : input.validity.rangeUnderflow
                ? t('Choose today or a later date.', 'Piliin ang ngayon o mas huling petsa.')
                : input.name === 'description'
                  ? t(
                      'Please describe what you need in at least 10 characters.',
                      'Ilarawan ang kailangan gamit ang kahit 10 character.',
                    )
                  : t('Please complete this field.', 'Pakisagutan ang field na ito.');
        error(input, message);
        first ??= input;
      } else error(input, '');
    }
    if (first) {
      first.focus();
      return;
    }
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const data = Object.fromEntries(new FormData(form));
    data.kind = form.dataset.kind;
    data.consent = form.dataset.kind === 'booking' && form.elements.consent.checked;
    try {
      const r = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(18000),
      });
      const result = await r.json();
      if (!r.ok || result.ok !== true) {
        for (const name of Object.keys(result.errors || {})) {
          const input = form.elements.namedItem(name);
          if (input?.id)
            error(input, t(result.errors[name], 'Pakisuri ang sagot sa field na ito.'));
        }
        throw Error('delivery');
      }
      status.dataset.state = 'success';
      status.textContent = t(
        'Your inquiry has been sent. I will review your request and availability before confirming the next step.',
        'Naipadala ang inquiry. Susuriin ko ang request at availability bago kumpirmahin ang susunod na hakbang.',
      );
      form.reset();
    } catch {
      status.dataset.state = 'error';
      status.textContent = t(
        'Delivery could not be confirmed. Your details are still here. Please wait before retrying, or email techspecialistsupport@gmail.com.',
        'Hindi makumpirma ang pagpapadala. Nandito pa ang detalye mo. Maghintay bago subukan muli o mag-email sa techspecialistsupport@gmail.com.',
      );
    } finally {
      sending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
}
