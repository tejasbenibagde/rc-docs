import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'RC Docs',
  tagline: 'Just some docs for internal use',
  favicon: 'img/favicon.ico',

  // ⬇️ ADD MERMAID TO THEMES ⬇️
  themes: ['@docusaurus/theme-mermaid'],

  // ⬇️ ENABLE MERMAID HERE (TOP LEVEL) ⬇️
  markdown: {
    mermaid: true,
  },

  future: {
    v4: true,
  },

  url: 'https://your-site.com',
  baseUrl: '/',

  organizationName: 'your-github-username',
  projectName: 'your-repo-name',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // ⬇️ ADD SEARCH PLUGIN SEPARATELY ⬇️
  plugins: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexPages: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            // xsft: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',

    // ⬇️ MERMAID THEME CONFIG (OPTIONAL) ⬇️
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
      options: {
        fontFamily: 'inherit',
        securityLevel: 'loose',
      },
    },

    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
      disableSwitch: false,
    },

    navbar: {
      title: 'RC Docs',
      logo: {
        alt: 'RC Docs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/tags',
          label: 'Tags',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', to: '/blog' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RC Docs. By Tejas Benibagde`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;