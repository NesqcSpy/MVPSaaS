import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dataclean.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: '',          priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about',    priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/security', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pricing',  priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/changelog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/privacy',  priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms',    priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/login',    priority: 0.4, changeFrequency: 'yearly' as const },
    { path: '/register', priority: 0.6, changeFrequency: 'yearly' as const },
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
