import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'MFE Orchestrator',
  tagline: 'The control plane for your microfrontends',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mfe-orchestrator.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/documentation',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mfe-orchestrator', // Usually your GitHub org/user name.
  projectName: 'Microfrontend Orchestrator', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  // The documentation is written in English only. Adding a locale here without
  // translations under i18n/<locale>/ publishes a duplicate of the English
  // pages under /<locale>/, which search engines treat as duplicate content.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-JS73D8WDB9',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mfe-orchestrator/documentation/blob/main',
        },
        // No blog: nothing links to it and it only carried the Docusaurus
        // sample posts, which were indexable. Set this back to an options
        // object when there is something to publish.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          // Let crawlers prioritise pages that actually changed.
          lastmod: 'date',
          changefreq: null,
          priority: null,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Rendered from static/img/social-card.source.html at 1200x630.
    image: 'img/social-card.png',
    navbar: {
      title: 'MFE Orchestrator',
      logo: { 
        alt: 'MFE Orchestrator Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/intro',
          label: 'Get started',
          position: 'left',
        },
        {
          to: '/docs/self-hosting/docker',
          label: 'Self-hosting',
          position: 'left',
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/mfe-orchestrator',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://console.mfe-orchestrator.dev',
          label: 'Open the console',
          position: 'right',
          className: 'navbar__cta',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Product',
          items: [
            {
              label: 'Get started',
              to: '/docs/intro',
            },
            {
              label: 'Core concepts',
              to: '/docs/core-concepts',
            },
            {
              label: 'Templates library',
              to: '/docs/templates/templates-library',
            },
            {
              label: 'Open the console',
              href: 'https://console.mfe-orchestrator.dev',
            },
          ],
        },
        {
          title: 'Platform',
          items: [
            {
              label: 'Microfrontends',
              to: '/docs/microfrontends/overview',
            },
            {
              label: 'Environments',
              to: '/docs/environments/overview',
            },
            {
              label: 'Deployments',
              to: '/docs/deployments/overview',
            },
            {
              label: 'Integration',
              to: '/docs/integration/overview',
            },
          ],
        },
        {
          title: 'Run it yourself',
          items: [
            {
              label: 'Docker',
              to: '/docs/self-hosting/docker',
            },
            {
              label: 'Terraform',
              to: '/docs/self-hosting/terraform',
            },
            {
              label: 'CI/CD',
              to: '/docs/ci-cd/api-keys',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/mfe-orchestrator',
            },
          ],
        },
        /*{
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },*/
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MFE Orchestrator, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
