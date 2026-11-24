// Published, indexable pages. Keep routing and sitemap in sync in both adapters.
export const pages = [
  { path: '/', file: 'index.html' },
  { path: '/remote-tech-support', file: 'remote-tech-support.html' },
  { path: '/website-design', file: 'website-design.html' },
  { path: '/website-maintenance', file: 'website-maintenance.html' },
  { path: '/business-solutions', file: 'business-solutions.html' },
  { path: '/portfolio', file: 'portfolio.html' },
  { path: '/about', file: 'about.html' },
  { path: '/contact', file: 'contact.html' },
];

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
  return `<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</gu, '\\u003c')}</script>`;
}
