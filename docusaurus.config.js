// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Modern C++ DevOps',
  tagline: 'DevOps Best Practices for Modern C++ Developers',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://moderncppdevops.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        theme: {
          customCss: ['./src/css/custom.css'],
        },
        docs: false, // disable the docs plugin
        blog: {
          routeBasePath: '/', // Serve the blog at the site's root
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-preview.png',
      navbar: {
        title: 'Modern C++ DevOps',
        logo: {
          alt: 'Chris Mc',
          src: 'img/logo.png',
        },
        items: [
          {
            href: 'https://github.com/prince-chrismc/blog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@christophermcarthur',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/prince_chrismc',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/christophermcarthur1996/'
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/prince-chrismc',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Christopher McArthur. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ['hcl', 'json', 'cmake', 'bash'],
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
    }),
};

export default config;
