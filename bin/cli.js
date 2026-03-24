#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 命令分类配置
const CATEGORIES = {
  git: {
    description: 'Git 工作流命令 (feat/fix/hotfix/release)',
    commands: [
      'start-feat', 'start-fix', 'start-refactor', 'start-hotfix', 'start-release',
      'commit', 'sync', 'wip', 'status', 'finish', 'publish', 'abort'
    ]
  }
  // 未来可扩展其他类别：
  // workflow: { description: '...', commands: [...] }
};

const TARGET_BASE = '.claude/commands';

// 解析命令行参数
const args = process.argv.slice(2);
const targetDir = args.find(a => !a.startsWith('--')) || process.cwd();

// 帮助信息
function showHelp() {
  console.log(`
🔧 Claude Tools - Claude Code 命令集安装器

用法:
  npx claude-tools [选项] [目标目录]

选项:
  --list, -l           列出所有可用命令
  --all, -a            安装所有命令
  --category, -c <name> 安装指定类别的命令 (git, workflow...)
  --commands <cmd1,cmd2> 安装指定的命令
  --help, -h           显示帮助信息

示例:
  npx claude-tools                          # 交互式选择安装
  npx claude-tools --all                    # 安装所有命令
  npx claude-tools -c git                   # 安装 git 类别
  npx claude-tools --commands commit,sync   # 安装指定命令
  npx claude-tools /path/to/project --all   # 安装到指定项目

类别:
${Object.entries(CATEGORIES).map(([k, v]) => `  ${k.padEnd(12)} ${v.description}`).join('\n')}
`);
}

// 列出所有命令
function listCommands() {
  console.log('\n📋 可用命令列表:\n');
  for (const [category, config] of Object.entries(CATEGORIES)) {
    console.log(`[${category}] ${config.description}`);
    config.commands.forEach(cmd => {
      console.log(`  /${category}:${cmd}`);
    });
    console.log();
  }
}

// 获取包目录
function getPackageDir() {
  return path.dirname(__dirname);
}

// 安装命令
function installCommands(commands, category) {
  const packageDir = getPackageDir();
  const targetPath = path.join(targetDir, TARGET_BASE, category);

  // 创建目标目录
  fs.mkdirSync(targetPath, { recursive: true });

  let installed = 0;
  const failed = [];

  commands.forEach(cmd => {
    const srcFile = path.join(packageDir, 'commands', category, `${cmd}.md`);
    const destFile = path.join(targetPath, `${cmd}.md`);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`   ✅ /${category}:${cmd}`);
      installed++;
    } else {
      console.log(`   ❌ /${category}:${cmd} (不存在)`);
      failed.push(cmd);
    }
  });

  return { installed, failed };
}

// 交互式选择（简化版 - 使用 readline）
function interactiveSelect(callback) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n📋 可用类别:\n');
  const categories = Object.keys(CATEGORIES);
  categories.forEach((cat, i) => {
    console.log(`  ${i + 1}. ${cat} - ${CATEGORIES[cat].description}`);
  });
  console.log(`  ${categories.length + 1}. 全部安装`);

  rl.question('\n请选择要安装的类别 (输入数字，多个用逗号分隔): ', (answer) => {
    const selections = answer.split(',').map(s => parseInt(s.trim()) - 1);

    const selectedCategories = selections
      .filter(i => i >= 0 && i < categories.length)
      .map(i => categories[i]);

    if (selections.includes(categories.length)) {
      // 选择全部
      callback(categories);
    } else if (selectedCategories.length > 0) {
      callback(selectedCategories);
    } else {
      console.log('❌ 无效选择');
      rl.close();
      process.exit(1);
    }

    rl.close();
  });
}

// 主函数
function main() {
  const flagAll = args.includes('--all') || args.includes('-a');
  const flagList = args.includes('--list') || args.includes('-l');
  const flagHelp = args.includes('--help') || args.includes('-h');

  const categoryIndex = args.findIndex(a => a === '--category' || a === '-c');
  const categoryArg = categoryIndex !== -1 ? args[categoryIndex + 1] : null;

  const commandsIndex = args.findIndex(a => a === '--commands');
  const commandsArg = commandsIndex !== -1 ? args[commandsIndex + 1] : null;

  // 显示帮助
  if (flagHelp) {
    showHelp();
    return;
  }

  // 列出命令
  if (flagList) {
    listCommands();
    return;
  }

  console.log('\n🔧 Claude Tools - 安装器\n');
  console.log(`📁 目标目录: ${targetDir}\n`);

  // 确定要安装的内容
  if (flagAll) {
    // 安装所有
    installAll();
  } else if (categoryArg) {
    // 安装指定类别
    installCategory(categoryArg);
  } else if (commandsArg) {
    // 安装指定命令
    installSpecific(commandsArg);
  } else {
    // 交互式选择
    interactiveSelect((selectedCategories) => {
      selectedCategories.forEach(cat => {
        console.log(`\n📦 安装 [${cat}] 类别:`);
        installCommands(CATEGORIES[cat].commands, cat);
      });
      console.log('\n✅ 安装完成!\n');
    });
  }
}

function installAll() {
  for (const [category, config] of Object.entries(CATEGORIES)) {
    console.log(`\n📦 安装 [${category}] 类别:`);
    installCommands(config.commands, category);
  }
  console.log('\n✅ 全部安装完成!\n');
}

function installCategory(category) {
  if (!CATEGORIES[category]) {
    console.log(`❌ 未知类别: ${category}`);
    console.log(`可用类别: ${Object.keys(CATEGORIES).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n📦 安装 [${category}] 类别:`);
  installCommands(CATEGORIES[category].commands, category);
  console.log('\n✅ 安装完成!\n');
}

function installSpecific(commandsStr) {
  // 假设命令格式为 category:cmd 或纯 cmd（默认 git）
  const commands = commandsStr.split(',').map(c => c.trim());

  // 按类别分组
  const byCategory = {};
  commands.forEach(cmd => {
    if (cmd.includes(':')) {
      const [cat, name] = cmd.split(':');
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(name);
    } else {
      // 默认 git 类别
      if (!byCategory.git) byCategory.git = [];
      byCategory.git.push(cmd);
    }
  });

  for (const [category, cmds] of Object.entries(byCategory)) {
    if (!CATEGORIES[category]) {
      console.log(`⚠️  跳过未知类别: ${category}`);
      continue;
    }
    console.log(`\n📦 安装 [${category}] 命令:`);
    installCommands(cmds, category);
  }
  console.log('\n✅ 安装完成!\n');
}

main();
