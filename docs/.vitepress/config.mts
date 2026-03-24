import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Claude Tools",
  description: "可扩展的 Claude Code 命令集",
  lang: 'zh-CN',

  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
  ],

  themeConfig: {
    siteTitle: 'Claude Tools',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '命令', link: '/commands/' },
      { text: '规范', link: '/specs/git-branch-spec' },
      {
        text: 'v1.0.0',
        items: [
          { text: 'GitHub', link: 'https://github.com/xiao-an-c/claude-tools' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装详解', link: '/guide/installation' },
            { text: '扩展新类别', link: '/guide/extending' }
          ]
        }
      ],
      '/commands/': [
        {
          text: '命令概览',
          items: [
            { text: '所有命令', link: '/commands/' }
          ]
        },
        {
          text: 'Git 命令',
          collapsed: false,
          items: [
            { text: '概览', link: '/commands/git/' },
            { text: '/git:init', link: '/commands/git/init' },
            { text: '/git:commit', link: '/commands/git/commit' },
            { text: '/git:start-feat', link: '/commands/git/start-feat' },
            { text: '/git:start-fix', link: '/commands/git/start-fix' },
            { text: '/git:start-hotfix', link: '/commands/git/start-hotfix' },
            { text: '/git:start-refactor', link: '/commands/git/start-refactor' },
            { text: '/git:start-release', link: '/commands/git/start-release' },
            { text: '/git:sync', link: '/commands/git/sync' },
            { text: '/git:wip', link: '/commands/git/wip' },
            { text: '/git:status', link: '/commands/git/status' },
            { text: '/git:finish', link: '/commands/git/finish' },
            { text: '/git:publish', link: '/commands/git/publish' },
            { text: '/git:abort', link: '/commands/git/abort' }
          ]
        }
      ],
      '/specs/': [
        {
          text: '规范文档',
          items: [
            { text: 'Git 分支规范', link: '/specs/git-branch-spec' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xiao-an-c/claude-tools' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright (c) 2024-present xiao-an-c'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/xiao-an-c/claude-tools/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdatedText: '最后更新',

    outline: {
      level: [2, 3]
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
})
