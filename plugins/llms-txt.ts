import fs from 'fs/promises';
import path from 'path';
import type {LoadContext, Plugin} from '@docusaurus/types';

/**
 * Emits the llmstxt.org files at build time, so language models can consume the
 * documentation without scraping the rendered HTML:
 *
 *   /llms.txt        an index: one line per page, with its description
 *   /llms-full.txt   every page's markdown, concatenated in sidebar order
 *   /docs/<id>.md    each page's markdown on its own, next to its HTML
 *
 * Ordering follows the sidebar: `sidebar_position` for pages, `position` in
 * _category_.json for sections. Everything is derived from the markdown
 * sources, so the files cannot drift from the docs.
 */

type Page = {
  kind: 'page';
  order: number;
  id: string;
  url: string;
  title: string;
  description: string;
  body: string;
  file: string;
};

type Section = {
  kind: 'section';
  order: number;
  title: string;
  description: string;
  children: Node[];
};

type Node = Page | Section;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

/** Reads the few frontmatter keys we need. Not a general YAML parser. */
function readFrontmatter(source: string): {
  data: Record<string, string>;
  body: string;
} {
  const match = FRONTMATTER.exec(source);
  if (!match) {
    return {data: {}, body: source};
  }
  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(line);
    if (kv) {
      data[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, '$1');
    }
  }
  return {data, body: source.slice(match[0].length)};
}

/** Splits on fenced code blocks so prose-only rewrites leave code alone. */
function mapProse(markdown: string, fn: (prose: string) => string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((chunk) => (chunk.startsWith('```') ? chunk : fn(chunk)))
    .join('');
}

const TAG = /<\/?[A-Za-z][^>]*>/g;

/**
 * Strips JSX/HTML tags but keeps their text content. Done line by line: a line
 * that contained tags is also dedented, because JSX nesting indentation would
 * otherwise read as a markdown code block. Lines with no tags keep their
 * indentation, so real nested lists survive.
 */
function stripTags(prose: string): string {
  return prose
    // A tag whose attributes wrap across lines is folded onto one line first,
    // so the per-line pass below sees it whole.
    .replace(TAG, (tag) => tag.replace(/\s*\n\s*/g, ' '))
    .split('\n')
    .map((line) => {
      const stripped = line.replace(TAG, '');
      return stripped === line ? line : stripped.trim();
    })
    .join('\n');
}

function cleanBody(body: string, docUrl: (relative: string) => string): string {
  let out = body.replace(/^import\s.+?from\s.+?;?\s*$/gm, '');
  out = mapProse(out, (prose) =>
    stripTags(
      prose
        // Relative links between docs become absolute, so they resolve for a
        // reader that only has this file.
        .replace(
          /\]\(([^)\s]+?)\.mdx?(#[^)]*)?\)/g,
          (_all, target: string, hash = '') => `](${docUrl(target)}${hash})`,
        )
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, ''),
    ),
  );
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

async function readJson(file: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return {};
  }
}

export default function llmsTxtPlugin(context: LoadContext): Plugin<void> {
  const {siteDir, siteConfig} = context;
  const docsDir = path.join(siteDir, 'docs');
  const site = siteConfig.url + siteConfig.baseUrl;
  const docBase = `${site}docs/`;

  const urlForId = (id: string) => docBase + id;

  async function collect(dir: string, idPrefix: string): Promise<Node[]> {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    const nodes: Node[] = [];

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const children = await collect(full, `${idPrefix}${entry.name}/`);
        if (children.length === 0) {
          continue;
        }
        const category = await readJson(path.join(full, '_category_.json'));
        const link = (category.link ?? {}) as Record<string, string>;
        nodes.push({
          kind: 'section',
          order: Number(category.position ?? 999),
          title: link.title ?? (category.label as string) ?? entry.name,
          description: link.description ?? '',
          children,
        });
        continue;
      }

      if (!/\.mdx?$/.test(entry.name)) {
        continue;
      }

      const source = await fs.readFile(full, 'utf8');
      const {data, body} = readFrontmatter(source);
      const id = idPrefix + entry.name.replace(/\.mdx?$/, '');
      const heading = /^#\s+(.+)$/m.exec(body);
      const relativeUrl = (target: string) =>
        urlForId(
          path
            .normalize(path.join(path.dirname(id), target))
            .split(path.sep)
            .join('/'),
        );

      nodes.push({
        kind: 'page',
        order: Number(data.sidebar_position ?? 999),
        id,
        url: urlForId(id),
        title: data.title ?? heading?.[1] ?? id,
        description: data.description ?? '',
        body: cleanBody(body, relativeUrl),
        file: full,
      });
    }

    return nodes.sort((a, b) => a.order - b.order);
  }

  function flatten(nodes: Node[]): Page[] {
    return nodes.flatMap((node) =>
      node.kind === 'page' ? [node] : flatten(node.children),
    );
  }

  return {
    name: 'llms-txt',

    async postBuild({outDir}) {
      const tree = await collect(docsDir, '');
      const pages = flatten(tree);

      // --- llms.txt: the index -------------------------------------------
      const index = [
        `# ${siteConfig.title}`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        'MFE Orchestrator manages the versions, environments, deployments and',
        'rollbacks of a microfrontend architecture, and generates the Module',
        'Federation configuration a host application needs. It runs as a hosted',
        'console or self-hosted. This file indexes the documentation; every page',
        'is also available as markdown at the same URL with a `.md` suffix.',
        '',
        `Full text of every page: ${site}llms-full.txt`,
        '',
      ];

      const line = (page: Page) =>
        `- [${page.title}](${page.url}.md)` +
        (page.description ? `: ${page.description}` : '');

      // Pages that sit at the docs root have no category of their own.
      const rootPages = tree.filter((n): n is Page => n.kind === 'page');
      if (rootPages.length > 0) {
        index.push('## Getting started', '', ...rootPages.map(line), '');
      }

      for (const section of tree.filter(
        (n): n is Section => n.kind === 'section',
      )) {
        index.push(`## ${section.title}`, '');
        if (section.description) {
          index.push(section.description, '');
        }
        index.push(...flatten(section.children).map(line), '');
      }

      await fs.writeFile(
        path.join(outDir, 'llms.txt'),
        `${index.join('\n').trimEnd()}\n`,
        'utf8',
      );

      // --- llms-full.txt: everything, in reading order --------------------
      const full = [
        `# ${siteConfig.title} — full documentation`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        `Source: ${site}`,
        '',
      ];
      for (const page of pages) {
        full.push(
          '---',
          '',
          `<!-- ${page.url} -->`,
          '',
          page.body.startsWith('#') ? page.body : `# ${page.title}\n\n${page.body}`,
          '',
        );
      }
      await fs.writeFile(
        path.join(outDir, 'llms-full.txt'),
        `${full.join('\n').trimEnd()}\n`,
        'utf8',
      );

      // --- one .md per page, alongside its HTML --------------------------
      for (const page of pages) {
        const target = path.join(outDir, 'docs', `${page.id}.md`);
        await fs.mkdir(path.dirname(target), {recursive: true});
        const heading = page.body.startsWith('#')
          ? page.body
          : `# ${page.title}\n\n${page.body}`;
        await fs.writeFile(target, `<!-- ${page.url} -->\n\n${heading}\n`, 'utf8');
      }

      console.log(
        `[llms-txt] wrote llms.txt, llms-full.txt and ${pages.length} .md files`,
      );
    },
  };
}
