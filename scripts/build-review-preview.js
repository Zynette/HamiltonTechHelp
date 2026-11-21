import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const source = fileURLToPath(new URL('../public/', import.meta.url));
const output = fileURLToPath(new URL('../review-preview/', import.meta.url));
const sitePages = new Set([
  'remote-tech-support', 'website-design', 'website-maintenance',
  'business-solutions', 'portfolio', 'about', 'contact',
]);

await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true, force: true });

const files = await readdir(output);
for (const name of files.filter((entry) => entry.endsWith('.html'))) {
  const path = join(output, name);
  let html = await readFile(path, 'utf8');

  // The production Worker uses root-relative URLs and extensionless pages.
  // A static review copy needs relative assets and .html page routes.
  html = html.replace(/(\\b(?:href|src)=["'])\\/([^"']*)(["'])/g, (match, start, target, end) => {
    const fragmentAt = target.indexOf('#');
    const pathname = fragmentAt < 0 ? target : target.slice(0, fragmentAt);
    const fragment = fragmentAt < 0 ? '' : target.slice(fragmentAt);
    if (pathname === '') return start + './index.html' + fragment + end;
    if (sitePages.has(pathname)) return start + './' + pathname + '.html' + fragment + end;
    return start + './' + target + end;
  });

  // Never index a code-review mirror or mistake it for the real website.
  html = html.replace('</head>', [
    '  <meta name="robots" content="noindex,nofollow" />',
    '  <link rel="stylesheet" href="./review-preview.css" />',
    '  <script src="./review-preview.js" defer></script>',
    '</head>',
  ].join('\\n'));
  html = html.replace('<body>', [
    '<body>',
    '  <aside class="review-preview-banner" role="note">',
    '    <strong>DESIGN PREVIEW</strong> Not the live website. Forms are disabled.',
    '  </aside>',
  ].join('\\n'));
  await writeFile(path, html);
}

const cssPath = join(output, 'styles.css');
const css = await readFile(cssPath, 'utf8');
await writeFile(cssPath, css.replace(/url\\(\\s*(['"]?)\\/fonts\\//g, 'url($1./fonts/'));

await writeFile(join(output, 'review-preview.css'), `
.review-preview-banner {
  position: fixed;
  z-index: 999999;
  right: 14px;
  bottom: 14px;
  max-width: min(345px, calc(100vw - 28px));
  padding: 12px 16px;
  border: 1px solid #526e60;
  border-radius: 12px;
  background: #fcfff9;
  box-shadow: 0 8px 26px #101f1d2b;
  color: #243e3a;
  font: 12px/1.5 system-ui, sans-serif;
}
.review-preview-banner strong { display: block; font-size: 11px; letter-spacing: 0.10em; }
@media print { .review-preview-banner { display: none; } }
`);

await writeFile(join(output, 'review-preview.js'), `
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
`);

await writeFile(join(output, '.nojekyll'), '');
console.log('Prepared static, non-submitting review preview at review-preview/index.html.');
