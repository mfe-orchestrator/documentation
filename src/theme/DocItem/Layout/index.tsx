import type {ReactNode} from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type Props = WrapperProps<typeof LayoutType>;

/**
 * Wraps the doc page layout to emit per-page metadata the classic theme does
 * not: TechArticle structured data, og:type and an explicit robots directive.
 * The theme already emits BreadcrumbList JSON-LD, which this complements.
 */
export default function LayoutWrapper(props: Props): ReactNode {
  const {metadata, frontMatter} = useDoc();
  const {siteConfig} = useDocusaurusContext();
  const {url: siteUrl, baseUrl, title: siteTitle, themeConfig} = siteConfig;

  const siteHome = siteUrl + baseUrl;
  const pageUrl = siteUrl + metadata.permalink;
  const socialCard = siteHome + (themeConfig.image as string);
  const keywords = frontMatter.keywords ?? [];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: metadata.title,
    name: metadata.title,
    description: metadata.description,
    url: pageUrl,
    image: socialCard,
    inLanguage: 'en',
    ...(keywords.length > 0 ? {keywords: keywords.join(', ')} : {}),
    ...(metadata.lastUpdatedAt
      ? {dateModified: new Date(metadata.lastUpdatedAt * 1000).toISOString()}
      : {}),
    isPartOf: {
      '@type': 'WebSite',
      name: siteTitle,
      url: siteHome,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MFE Orchestrator',
      url: siteUrl,
    },
  };

  return (
    <>
      <Head>
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <Layout {...props} />
    </>
  );
}
