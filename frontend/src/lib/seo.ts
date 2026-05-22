import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dataclean.io';
export const SITE_NAME = 'DataClean';
export const SITE_TAGLINE = 'Operational Data Automation';
export const SITE_DESCRIPTION =
  'DataClean turns documents into validated, structured records and routes them into your systems — with full observability. From OCR to ETL in one pipeline.';

interface PageMetaInput {
  title: string;
  description?: string;
  path?: string;
}

/**
 * One-stop metadata builder. Use it from every route so OG / Twitter /
 * canonical URLs stay consistent.
 */
export function pageMeta({ title, description, path = '/' }: PageMetaInput): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;
  const canonical = `${SITE_URL}${path}`;
  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      creator: '@dataclean',
    },
  };
}

/**
 * JSON-LD structured data for the SoftwareApplication schema — what search
 * engines and AI overviews look for to render a knowledge card.
 */
export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '799',
      offerCount: 3,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '54',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  } as const;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    sameAs: [
      'https://x.com/dataclean',
      'https://www.linkedin.com/company/dataclean',
      'https://github.com/dataclean',
    ],
  } as const;
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  } as const;
}
