import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Props} from '@theme/DocBreadcrumbs/StructuredData';
import {absoluteUrl} from '@site/src/seo/absoluteUrl';

/**
 * Replaces the theme's BreadcrumbList JSON-LD, which builds every entry as
 * `siteConfig.url + breadcrumb.href` and so ignores `trailingSlash`. On this
 * site the unslashed form only ever 301s — the same mismatch that kept the
 * docs out of Google's index — so the breadcrumb schema has to name the URL
 * the canonical names.
 *
 * Mirrors upstream otherwise, including dropping breadcrumbs without a link:
 * those are not valid BreadcrumbList entries.
 * See https://github.com/facebook/docusaurus/issues/9319
 */
export default function DocBreadcrumbsStructuredData(props: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {url: siteUrl, trailingSlash} = siteConfig;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: props.breadcrumbs
      .filter((breadcrumb) => breadcrumb.href)
      .map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.label,
        item: absoluteUrl(siteUrl, breadcrumb.href!, trailingSlash),
      })),
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Head>
  );
}
