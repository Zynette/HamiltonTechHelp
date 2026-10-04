import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export async function releaseIssues(env = process.env) {
  const issues = [];
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  if (/\[YOUR [A-Z ]+\]/u.test(html))
    issues.push('Replace the public name and email placeholders before launch.');
  try {
    const url = new URL(env.SITE_URL);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      /[<>"'&]/u.test(url.origin)
    )
      throw new Error();
  } catch {
    issues.push('Set SITE_URL to the exact public HTTPS origin.');
  }
  if (!/^[a-zA-Z0-9]{4,40}$/u.test(env.FORMSPREE_FORM_ID || ''))
    issues.push('Connect a verified Formspree form using FORMSPREE_FORM_ID.');
  return issues;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = await releaseIssues();
  if (issues.length) {
    console.error(issues.join('\n'));
    process.exitCode = 1;
  } else
    console.log('Release configuration checks passed. Verify inbox delivery before public launch.');
}
