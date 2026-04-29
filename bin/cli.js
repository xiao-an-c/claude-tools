#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TARGET_BASE = '.claude/commands';
const AGENTS_TARGET_BASE = '.claude/agents';

// 获取包目录
function getPackageDir() {
  return path.dirname(__dirname);
}

// 动态加载命令配置
function loadCategories() {
  const packageDir = getPackageDir();
  const commandsDir = path.join(packageDir, 'commands');
  const categories = {};

  if (!fs.existsSync(commandsDir)) {
    return categories;
  }

  const dirs = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of dirs) {
    const categoryPath = path.join(commandsDir, dir);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    if (files.length > 0) {
      categories[dir] = {
        description: getCategoryDescription(dir),
        commands: files
      };
    }
  }

  return categories;
}

// 类别描述映射
function getCategoryDescription(category) {
  const descriptions = {
    git: 'Git 工作流命令 (feat/fix/hotfix/release)',
    test: '单元测试命令 (generate/review/coverage/snapshot)',
    dev: '开发工作流命令 (多 Agent 协作)'
  };
  return descriptions[category] || `${category} 命令`;
}

// 扫描 agents 目录，返回 agent 列表（扁平结构）
function loadAgents() {
  const packageDir = getPackageDir();
  const agentsDir = path.join(packageDir, 'agents');
  const agents = {};

  if (!fs.existsSync(agentsDir)) {
    return agents;
  }

  const files = fs.readdirSync(agentsDir)
    .filter(file => file.endsWith('.md'));

  for (const file of files) {
    const name = file.replace('.md', '');
    agents[name] = file;
  }

  return agents;
}

// 命令类别到 agents 的依赖关系
const CATEGORY_AGENT_DEPS = {
  dev: ['dev-developer', 'dev-planner', 'dev-recorder', 'dev-tester']
};

// 安装 agents
function installAgents(agents, targetDir) {
  const packageDir = getPackageDir();
  const agentsDir = path.join(packageDir, 'agents');
  const targetPath = path.join(targetDir, AGENTS_TARGET_BASE);

  if (!fs.existsSync(agentsDir)) {
    console.log(`   ❌ agents 源目录不存在: ${agentsDir}`);
    return { installed: 0, failed: agents.length };
  }

  fs.mkdirSync(targetPath, { recursive: true });

  let installed = 0;
  const failed = [];

  agents.forEach(agent => {
    const srcFile = path.join(agentsDir, `${agent}.md`);
    const destFile = path.join(targetPath, `${agent}.md`);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`   ✅ agent:${agent}`);
      installed++;
    } else {
      console.log(`   ❌ agent:${agent} (文件不存在)`);
      failed.push(agent);
    }
  });

  return { installed, failed };
}

// 动态加载分类配置
const CATEGORIES = loadCategories();

// 解析命令行参数
const args = process.argv.slice(2);

// 帮助信息
function showHelp() {
  console.log(`
🔧 Claude Tools - Claude Code 命令集安装器

用法:
  npx github:xiao-an-c/claude-tools [选项] [目标目录]

选项:
  --all, -a            安装所有命令
  --list, -l           列出所有可用命令
  --category, -c <name> 安装指定类别 (git)
  --commands <cmd1,cmd2> 安装指定命令
  --help, -h           显示帮助信息

示例:
  npx github:xiao-an-c/claude-tools --all
  npx github:xiao-an-c/claude-tools -c git
  npx github:xiao-an-c/claude-tools --commands commit,sync
  npx github:xiao-an-c/claude-tools --all /path/to/project

类别:
${Object.entries(CATEGORIES).map(([k, v]) => {
    const deps = CATEGORY_AGENT_DEPS[k];
    const agentsNote = deps ? ` (自动安装 ${deps.length} 个 agents)` : '';
    return `  ${k.padEnd(12)} ${v.description}${agentsNote}`;
  }).join('\n')}
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
    const deps = CATEGORY_AGENT_DEPS[category];
    if (deps && deps.length > 0) {
      console.log(`  🔗 依赖 agents: ${deps.join(', ')}`);
    }
    console.log();
  }
}

// 安装命令（同时安装依赖的 agents）
function installCommands(commands, category, targetDir) {
  const packageDir = getPackageDir();
  const sourcePath = path.join(packageDir, 'commands', category);
  const targetPath = path.join(targetDir, TARGET_BASE, category);

  // 检查源目录是否存在
  if (!fs.existsSync(sourcePath)) {
    console.log(`   ❌ 源目录不存在: ${sourcePath}`);
    return { installed: 0, failed: commands.length, agents: { installed: 0, failed: [] } };
  }

  // 创建目标目录
  fs.mkdirSync(targetPath, { recursive: true });

  let installed = 0;
  const failed = [];

  commands.forEach(cmd => {
    const srcFile = path.join(sourcePath, `${cmd}.md`);
    const destFile = path.join(targetPath, `${cmd}.md`);

    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`   ✅ /${category}:${cmd}`);
      installed++;
    } else {
      console.log(`   ❌ /${category}:${cmd} (文件不存在)`);
      failed.push(cmd);
    }
  });

  // 安装依赖的 agents
  let agentsResult = { installed: 0, failed: [] };
  const deps = CATEGORY_AGENT_DEPS[category];
  if (deps && deps.length > 0) {
    console.log(`\n🔗 安装 [${category}] 依赖的 agents:`);
    agentsResult = installAgents(deps, targetDir);
  }

  return { installed, failed, agents: agentsResult };
}

// 交互式选择
function interactiveSelect(targetDir, callback) {
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

  rl.question('\n请选择要安装的类别 (输入数字): ', (answer) => {
    const selection = parseInt(answer.trim()) - 1;

    if (selection === categories.length) {
      // 选择全部
      callback(categories);
    } else if (selection >= 0 && selection < categories.length) {
      callback([categories[selection]]);
    } else {
      console.log('❌ 无效选择');
    }

    rl.close();
  });
}

// 安装所有
function installAll(targetDir) {
  let totalInstalled = 0;
  let totalAgentsInstalled = 0;

  for (const [category, config] of Object.entries(CATEGORIES)) {
    console.log(`\n📦 安装 [${category}] 类别:`);
    const result = installCommands(config.commands, category, targetDir);
    totalInstalled += result.installed;
    // 收集依赖的 agents（由 installCommands 内部处理安装，这里只做统计）
    if (result.agents) {
      totalAgentsInstalled += result.agents.installed;
    }
  }
  if (totalAgentsInstalled > 0) {
    console.log(`\n✅ 全部安装完成! 共安装 ${totalInstalled} 个命令, ${totalAgentsInstalled} 个 agents\n`);
  } else {
    console.log(`\n✅ 全部安装完成! 共安装 ${totalInstalled} 个命令\n`);
  }
}

// 安装指定类别
function installCategory(category, targetDir) {
  if (!CATEGORIES[category]) {
    console.log(`❌ 未知类别: ${category}`);
    console.log(`可用类别: ${Object.keys(CATEGORIES).join(', ')}`);
    if (require.main === module) {
      process.exit(1);
    }
    return { installed: 0, failed: 0, agents: { installed: 0, failed: [] } };
  }

  console.log(`\n📦 安装 [${category}] 类别:`);
  const result = installCommands(CATEGORIES[category].commands, category, targetDir);
  const agentsInfo = result.agents && result.agents.installed > 0
    ? `, ${result.agents.installed} 个 agents`
    : '';
  console.log(`\n✅ 安装完成! 共安装 ${result.installed} 个命令${agentsInfo}\n`);
  return result;
}

// 安装指定命令
function installSpecific(commandsStr, targetDir) {
  const commands = commandsStr.split(',').map(c => c.trim());

  const byCategory = {};
  commands.forEach(cmd => {
    if (cmd.includes(':')) {
      const [cat, name] = cmd.split(':');
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(name);
    } else {
      if (!byCategory.git) byCategory.git = [];
      byCategory.git.push(cmd);
    }
  });

  let totalInstalled = 0;
  let totalAgentsInstalled = 0;

  for (const [category, cmds] of Object.entries(byCategory)) {
    if (!CATEGORIES[category]) {
      console.log(`⚠️  跳过未知类别: ${category}`);
      continue;
    }
    console.log(`\n📦 安装 [${category}] 命令:`);
    const result = installCommands(cmds, category, targetDir);
    totalInstalled += result.installed;
    if (result.agents) {
      totalAgentsInstalled += result.agents.installed;
    }
  }
  const agentsInfo = totalAgentsInstalled > 0
    ? `, ${totalAgentsInstalled} 个 agents`
    : '';
  console.log(`\n✅ 安装完成! 共安装 ${totalInstalled} 个命令${agentsInfo}\n`);
}

// 主函数
function main(argv) {
  const args = argv || process.argv.slice(2);
  const flagAll = args.includes('--all') || args.includes('-a');
  const flagList = args.includes('--list') || args.includes('-l');
  const flagHelp = args.includes('--help') || args.includes('-h');

  const categoryIndex = args.findIndex(a => a === '--category' || a === '-c');
  const categoryArg = categoryIndex !== -1 ? args[categoryIndex + 1] : null;

  const commandsIndex = args.findIndex(a => a === '--commands');
  const commandsArg = commandsIndex !== -1 ? args[commandsIndex + 1] : null;

  // 目标目录：找第一个不是选项的参数
  const targetDir = args.find(a => !a.startsWith('-') && a !== categoryArg && a !== commandsArg) || process.cwd();

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

  console.log('\n🔧 Claude Tools - 安装器');
  console.log(`📁 目标目录: ${targetDir}`);
  console.log(`📦 包目录: ${getPackageDir()}\n`);

  // 确定要安装的内容
  if (flagAll) {
    installAll(targetDir);
  } else if (categoryArg) {
    installCategory(categoryArg, targetDir);
  } else if (commandsArg) {
    installSpecific(commandsArg, targetDir);
  } else {
    interactiveSelect(targetDir, (selectedCategories) => {
      let totalInstalled = 0;
      let totalAgentsInstalled = 0;
      selectedCategories.forEach(cat => {
        console.log(`\n📦 安装 [${cat}] 类别:`);
        const result = installCommands(CATEGORIES[cat].commands, cat, targetDir);
        totalInstalled += result.installed;
        if (result.agents) {
          totalAgentsInstalled += result.agents.installed;
        }
      });
      const agentsInfo = totalAgentsInstalled > 0
        ? `, ${totalAgentsInstalled} 个 agents`
        : '';
      console.log(`\n✅ 安装完成! 共安装 ${totalInstalled} 个命令${agentsInfo}\n`);
    });
  }
}

// 导出函数供测试使用
module.exports = {
  getPackageDir,
  loadCategories,
  loadAgents,
  getCategoryDescription,
  installCommands,
  installAgents,
  installAll,
  installCategory,
  installSpecific,
  interactiveSelect,
  showHelp,
  listCommands,
  main,
  TARGET_BASE,
  AGENTS_TARGET_BASE,
  CATEGORY_AGENT_DEPS
};

// 只在直接运行时执行 main
if (require.main === module) {
  main();
}
