// Published, indexable pages. Keep routing and sitemap in sync in both adapters.
import studioPages from './studio-pages.json' with { type: 'json' };
export const pages = studioPages;

const services = [
  {
    id: 'remote-support',
    name: 'Remote tech support',
    serviceType: 'Remote Windows, Mac, Microsoft 365, email and software setup help',
    path: '/remote-tech-support',
  },
  {
    id: 'website-services',
    name: 'Website design and updates',
    serviceType: 'Small business websites, redesigns, accessibility-minded fixes and updates',
    path: '/website-design',
  },
  {
    id: 'business-solutions',
    name: 'Small business digital setup',
    serviceType: 'Business email, inquiry forms and booking tool configuration by agreed scope',
    path: '/business-solutions',
  },
];

export function getSiteOrigin(siteUrl) {
  try {
    const url = new URL(siteUrl);
    return url.protocol === 'https:' ? url.origin : '';
  } catch {
    return '';
  }
}

export function sitemap(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((page) => `<url><loc>${origin}${page.path}</loc></url>`).join('')}</urlset>`;
}

export function pageMetadata(origin, path) {
  const canonical = `${origin}${path}`;
  const organizationId = `${origin}/#organization`;
  const graph = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Online Technical Help',
      url: `${origin}/`,
      email: 'mailto:techspecialistsupport@gmail.com',
      description:
        'Hamilton, Ontario-based, remote-only tech help, website design and small-business digital setup by written agreement.',
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: 'Online Technical Help',
      inLanguage: 'en-CA',
      publisher: { '@id': organizationId },
    },
    ...services
      .filter((service) => path === '/' || path === service.path)
      .map((service) => ({
        '@type': 'Service',
        '@id': `${origin}/#${service.id}`,
        name: service.name,
        serviceType: service.serviceType,
        provider: { '@id': organizationId },
        url: `${origin}${service.path}`,
      })),
  ];
  const english = path.replace(/^\/fil(?=\/|$)/u, '') || '/';
  const filipino = '/fil' + (english === '/' ? '' : english);
  if (english.startsWith('/journal/'))
    graph.push({
      '@type': 'Article',
      headline: english.split('/').pop().replaceAll('-', ' '),
      datePublished: '2026-11-24',
      inLanguage: path.startsWith('/fil') ? 'fil' : 'en-CA',
      mainEntityOfPage: canonical,
      publisher: { '@id': organizationId },
    });
  return `<link rel="alternate" hreflang="en-CA" href="${origin}${english}"><link rel="alternate" hreflang="fil" href="${origin}${filipino}"><link rel="alternate" hreflang="x-default" href="${origin}${english}"><link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</gu, '\\u003c')}</script>`;
}
