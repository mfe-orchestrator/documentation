import type {ReactNode} from 'react';
import DocCategoryGeneratedIndexPage from '@theme-original/DocCategoryGeneratedIndexPage';
import type DocCategoryGeneratedIndexPageType from '@theme/DocCategoryGeneratedIndexPage';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

type Props = WrapperProps<typeof DocCategoryGeneratedIndexPageType>;

/**
 * Category index pages list the section's pages, so they are described as a
 * CollectionPage whose hasPart enumerates those links.
 */
export default function DocCategoryGeneratedIndexPageWrapper(
  props: Props,
): ReactNode {
  const {categoryGeneratedIndex} = props;
  const category = useCurrentSidebarCategory();
  const {siteConfig} = useDocusaurusContext();
  const {url: siteUrl, baseUrl, title: siteTitle} = siteConfig;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryGeneratedIndex.title,
    description: categoryGeneratedIndex.description,
    url: siteUrl + categoryGeneratedIndex.permalink,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: siteTitle,
      url: siteUrl + baseUrl,
    },
    // Raw HTML sidebar items have no label or link, so they are skipped.
    hasPart: category.items.flatMap((item) =>
      item.type === 'html' || !('href' in item) || !item.href
        ? []
        : [{'@type': 'WebPage', name: item.label, url: siteUrl + item.href}],
    ),
  };

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <DocCategoryGeneratedIndexPage {...props} />
    </>
  );
}
