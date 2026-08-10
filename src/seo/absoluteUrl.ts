/**
 * Builds the absolute URL for a Docusaurus route, honouring `trailingSlash`.
 *
 * Permalinks and sidebar hrefs never carry the trailing slash, but the site is
 * built with `trailingSlash: true`, so canonicals, og:url and the sitemap all
 * use the slashed form. Structured data has to agree with them: a schema `url`
 * pointing at the unslashed variant names a URL that only ever 301s, which is
 * what kept these pages out of the index in the first place.
 *
 * `undefined` mirrors Docusaurus' own semantics — leave the path untouched.
 */
export function absoluteUrl(
  siteUrl: string,
  pathname: string,
  trailingSlash: boolean | undefined,
): string {
  if (trailingSlash && !pathname.endsWith('/')) {
    return `${siteUrl}${pathname}/`;
  }
  return siteUrl + pathname;
}
