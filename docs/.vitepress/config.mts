import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Claude Tools",
  description: "可扩展的 Claude Code 技能集",
  lang: 'zh-CN',

  // GitHub Pages 部署配置
  base: '/claude-tools/',

  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
  ],

  markdown: {
    config: (md) => {
      // 自定义 mermaid 代码块渲染 - 使用 Vue 组件
      const defaultRender = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token.info.trim() === 'mermaid') {
          const code = token.content.trim()
          // 转义代码并传递给 Mermaid 组件
          const escapedCode = md.utils.escapeHtml(code)
          return `<Mermaid code="${escapedCode}" />`
        }
        return defaultRender(tokens, idx, options, env, self)
      }
    }
  },

  themeConfig: {
    siteTitle: 'Claude Tools',

    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'git-flow', link: '/commands/git/' },
      { text: 'dev-flow', link: '/commands/dev/' },
      { text: '规范', link: '/specs/git-branch-spec' },
      { text: 'FAQ', link: '/guide/faq' },
      {
        text: 'v0.8.0',
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
            { text: '常见问题', link: '/guide/faq' },
            { text: '扩展新类别', link: '/guide/extending' },
            { text: '部署文档', link: '/guide/deployment' }
          ]
        }
      ],
      '/commands/': [
        {
          text: '技能概览',
          items: [
            { text: '所有技能', link: '/commands/' }
          ]
        },
        {
          text: 'Git 技能',
          collapsed: false,
          items: [
            { text: '概览', link: '/commands/git/' },
            { text: 'git-flow init', link: '/commands/git/init' },
            { text: 'git-flow commit', link: '/commands/git/commit' },
            { text: 'git-flow start-feat', link: '/commands/git/start-feat' },
            { text: 'git-flow start-fix', link: '/commands/git/start-fix' },
            { text: 'git-flow start-hotfix', link: '/commands/git/start-hotfix' },
            { text: 'git-flow start-refactor', link: '/commands/git/start-refactor' },
            { text: 'git-flow start-release', link: '/commands/git/start-release' },
            { text: 'git-flow start-task', link: '/commands/git/start-task' },
            { text: 'git-flow sync', link: '/commands/git/sync' },
            { text: 'git-flow wip', link: '/commands/git/wip' },
            { text: 'git-flow status', link: '/commands/git/status' },
            { text: 'git-flow finish', link: '/commands/git/finish' },
            { text: 'git-flow publish', link: '/commands/git/publish' },
            { text: 'git-flow abort', link: '/commands/git/abort' }
          ]
        },
        {
          text: 'Dev 技能',
          collapsed: false,
          items: [
            { text: '概览', link: '/commands/dev/' },
            { text: 'dev-flow run', link: '/commands/dev/run' },
            { text: 'dev-flow status', link: '/commands/dev/status' },
            { text: 'dev-flow resume', link: '/commands/dev/resume' },
            { text: '工作流: patch', link: '/commands/dev/patch' },
            { text: '工作流: fix', link: '/commands/dev/fix' },
            { text: '工作流: feat', link: '/commands/dev/feat' },
            { text: '工作流: refactor', link: '/commands/dev/refactor' },
            { text: '工作流: hotfix', link: '/commands/dev/hotfix' },
            { text: '工作流: auto', link: '/commands/dev/auto' },
            { text: 'dev-flow review', link: '/commands/dev/review' },
            { text: 'dev-flow discuss', link: '/commands/dev/discuss' },
            { text: 'dev-flow investigate', link: '/commands/dev/investigate' }
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
