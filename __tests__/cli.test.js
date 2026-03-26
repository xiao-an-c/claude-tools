const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Mock console.log to capture output
let consoleOutput = [];
const originalLog = console.log;

beforeEach(() => {
  jest.clearAllMocks();
  consoleOutput = [];
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});

afterEach(() => {
  console.log = originalLog;
  jest.restoreAllMocks();
});

describe('CLI 模块', () => {
  let cli;

  beforeEach(() => {
    cli = require('../bin/cli.js');
  });

  describe('getPackageDir', () => {
    test('应返回包目录路径', () => {
      const result = cli.getPackageDir();
      expect(result).toBe(path.dirname(path.dirname(__filename)));
    });
  });

  describe('getCategoryDescription', () => {
    test('应返回 git 类别的正确描述', () => {
      // Arrange
      const category = 'git';
      const expected = 'Git 工作流命令 (feat/fix/hotfix/release)';

      // Act
      const result = cli.getCategoryDescription(category);

      // Assert
      expect(result).toBe(expected);
    });

    test('应返回未知类别的默认描述', () => {
      // Arrange
      const category = 'unknown';

      // Act
      const result = cli.getCategoryDescription(category);

      // Assert
      expect(result).toBe('unknown 命令');
    });

    // 边界条件测试
    test('当 category 为 null 时应返回默认描述', () => {
      // Arrange & Act
      const result = cli.getCategoryDescription(null);

      // Assert
      expect(result).toBe('null 命令');
    });

    test('当 category 为 undefined 时应返回默认描述', () => {
      // Arrange & Act
      const result = cli.getCategoryDescription(undefined);

      // Assert
      expect(result).toBe('undefined 命令');
    });

    test('当 category 为空字符串时应返回默认描述', () => {
      // Arrange & Act
      const result = cli.getCategoryDescription('');

      // Assert
      expect(result).toBe(' 命令');
    });
  });

  describe('loadCategories', () => {
    test('应从 commands 目录加载类别', () => {
      const categories = cli.loadCategories();

      expect(categories).toHaveProperty('git');
      expect(categories.git).toHaveProperty('description');
      expect(categories.git).toHaveProperty('commands');
      expect(Array.isArray(categories.git.commands)).toBe(true);
      expect(categories.git.commands.length).toBeGreaterThan(0);
    });

    test('应去除命令名称的 .md 扩展名', () => {
      // Arrange & Act
      const categories = cli.loadCategories();

      // Assert
      const commandsWithMd = categories.git.commands.filter(cmd => /\.md$/.test(cmd));
      expect(commandsWithMd).toEqual([]);
    });

    test('当 commands 目录不存在时应返回空对象', () => {
      // Use jest.isolateModules to avoid polluting other tests
      return jest.isolateModulesAsync(async () => {
        // Mock fs to simulate non-existent directory
        jest.doMock('fs', () => ({
          ...jest.requireActual('fs'),
          existsSync: jest.fn().mockReturnValue(false)
        }));

        const cliWithMockedFs = require('../bin/cli.js');
        const categories = cliWithMockedFs.loadCategories();
        expect(categories).toEqual({});
      });
    });
  });

  describe('installCommands', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
    });

    afterEach(() => {
      // Clean up temp directory
      fs.rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('当源目录不存在时应返回失败', () => {
      const result = cli.installCommands(['cmd1'], 'nonexistent-category', tempTargetDir);

      expect(result.installed).toBe(0);
      expect(result.failed).toBe(1);
    });

    test('应将文件复制到目标目录', () => {
      const result = cli.installCommands(['commit'], 'git', tempTargetDir);

      expect(result.installed).toBe(1);
      expect(result.failed.length).toBe(0);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('当目标目录不存在时应自动创建', () => {
      const targetPath = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetPath)).toBe(false);

      cli.installCommands(['commit'], 'git', tempTargetDir);

      expect(fs.existsSync(targetPath)).toBe(true);
    });

    test('当命令文件不存在时应报告失败', () => {
      // Arrange
      const commands = ['commit', 'nonexistent'];

      // Act
      const result = cli.installCommands(commands, 'git', tempTargetDir);

      // Assert
      expect(result.installed).toBe(1);
      expect(result.failed).toContain('nonexistent');
    });

    // 边界条件测试
    test('当命令数组为空时应返回零安装数', () => {
      // Arrange & Act
      const result = cli.installCommands([], 'git', tempTargetDir);

      // Assert
      expect(result.installed).toBe(0);
      expect(result.failed.length).toBe(0);
    });

    test('当命令数组为 null 时应抛出 TypeError', () => {
      // Arrange & Act & Assert
      expect(() => cli.installCommands(null, 'git', tempTargetDir)).toThrow(TypeError);
    });
  });

  describe('installAll', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('应安装所有类别的命令', () => {
      cli.installAll(tempTargetDir);

      // Check that git commands were installed
      const gitPath = path.join(tempTargetDir, '.claude/commands/git');
      expect(fs.existsSync(gitPath)).toBe(true);

      const files = fs.readdirSync(gitPath);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('installCategory', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('应安装指定类别的命令', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      cli.installCategory('git', tempTargetDir);

      const gitPath = path.join(tempTargetDir, '.claude/commands/git');
      expect(fs.existsSync(gitPath)).toBe(true);

      mockExit.mockRestore();
    });

    test('当类别无效时应提前返回', () => {
      const result = cli.installCategory('invalid', tempTargetDir);

      expect(result.installed).toBe(0);
      expect(consoleOutput.some(line => line.includes('未知类别'))).toBe(true);
    });
  });

  describe('installSpecific', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('应解析 git:commit 格式', () => {
      cli.installSpecific('git:commit', tempTargetDir);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('当命令无前缀时应默认为 git 类别', () => {
      cli.installSpecific('commit', tempTargetDir);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('应处理多个命令', () => {
      cli.installSpecific('commit,sync', tempTargetDir);

      const commitFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      const syncFile = path.join(tempTargetDir, '.claude/commands/git/sync.md');

      expect(fs.existsSync(commitFile)).toBe(true);
      expect(fs.existsSync(syncFile)).toBe(true);
    });

    test('应跳过未知类别', () => {
      cli.installSpecific('unknown:cmd', tempTargetDir);

      expect(consoleOutput.some(line => line.includes('跳过未知类别'))).toBe(true);
    });

    // 边界条件测试
    test('当命令字符串为空时应默认为 git 类别', () => {
      // Arrange & Act
      cli.installSpecific('', tempTargetDir);

      // Assert - empty string defaults to git category, command is empty string (fails to find file)
      expect(consoleOutput.some(line => line.includes('安装完成'))).toBe(true);
    });

    test('当命令列表尾部有逗号时应只安装有效命令', () => {
      // Arrange & Act
      cli.installSpecific('commit,', tempTargetDir);

      // Assert
      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('当目标目录为 null 时应抛出错误', () => {
      // Arrange & Act & Assert
      expect(() => cli.installSpecific('commit', null)).toThrow();
    });
  });

  describe('showHelp', () => {
    test('应显示帮助信息', () => {
      cli.showHelp();

      expect(consoleOutput.some(line => line.includes('Claude Tools'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('--all'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('--help'))).toBe(true);
    });
  });

  describe('listCommands', () => {
    test('应列出所有可用命令', () => {
      cli.listCommands();

      expect(consoleOutput.some(line => line.includes('可用命令列表'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('[git]'))).toBe(true);
    });
  });

  describe('interactiveSelect', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-tools-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('应显示类别选项', () => {
      const mockRl = {
        question: jest.fn((_, callback) => callback('1')),
        close: jest.fn()
      };

      jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, () => {});

      expect(consoleOutput.some(line => line.includes('可用类别'))).toBe(true);
    });

    test('选择类别后应调用回调函数', (done) => {
      const mockRl = {
        question: jest.fn((_, callback) => callback('1')),
        close: jest.fn()
      };

      jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, (selectedCategories) => {
        expect(selectedCategories).toEqual(['git']);
        done();
      });
    });

    test('应处理无效选择', () => {
      const mockRl = {
        question: jest.fn((_, callback) => callback('999')),
        close: jest.fn()
      };

      jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, () => {});

      expect(consoleOutput.some(line => line.includes('无效选择'))).toBe(true);
    });

    test('选择"全部"选项时应调用回调函数传入所有类别', (done) => {
      // Arrange
      const categories = Object.keys(cli.loadCategories());
      const allOption = String(categories.length + 1);
      const mockRl = {
        question: jest.fn((_, callback) => callback(allOption)),
        close: jest.fn()
      };
      jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      // Act & Assert
      cli.interactiveSelect(tempTargetDir, (selectedCategories) => {
        expect(selectedCategories).toEqual(categories);
        done();
      });
    });
  });

  describe('main', () => {
    let tempTargetDir;

    beforeEach(() => {
      tempTargetDir = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), 'claude-tools-main-test-'));
    });

    afterEach(() => {
      require('fs').rmSync(tempTargetDir, { recursive: true, force: true });
    });

    test('提供 --help 参数时应显示帮助', () => {
      // Act
      cli.main(['--help']);

      // Assert
      expect(consoleOutput.some(line => line.includes('--all'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('--help'))).toBe(true);
    });

    test('提供 -h 参数时应显示帮助', () => {
      // Act
      cli.main(['-h']);

      // Assert
      expect(consoleOutput.some(line => line.includes('--all'))).toBe(true);
    });

    test('提供 --list 参数时应列出命令', () => {
      // Act
      cli.main(['--list']);

      // Assert
      expect(consoleOutput.some(line => line.includes('可用命令列表'))).toBe(true);
    });

    test('提供 -l 参数时应列出命令', () => {
      // Act
      cli.main(['-l']);

      // Assert
      expect(consoleOutput.some(line => line.includes('可用命令列表'))).toBe(true);
    });

    test('提供 --all 参数时应安装所有命令', () => {
      // Act
      cli.main(['--all', tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('全部安装完成'))).toBe(true);
    });

    test('提供 -a 参数时应安装所有命令', () => {
      // Act
      cli.main(['-a', tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('全部安装完成'))).toBe(true);
    });

    test('提供 --category 参数时应安装指定类别', () => {
      // Act
      cli.main(['--category', 'git', tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('安装 [git] 类别'))).toBe(true);
    });

    test('提供 -c 参数时应安装指定类别', () => {
      // Act
      cli.main(['-c', 'git', tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('安装 [git] 类别'))).toBe(true);
    });

    test('提供 --commands 参数时应安装指定命令', () => {
      // Act
      cli.main(['--commands', 'git:commit', tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('安装完成'))).toBe(true);
    });

    test('未提供安装参数时应调用交互式选择', () => {
      // Arrange — mock readline to avoid blocking on stdin
      const mockRl = {
        question: jest.fn((_, callback) => callback('1')),
        close: jest.fn()
      };
      jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      // Act
      cli.main([tempTargetDir]);

      // Assert
      expect(consoleOutput.some(line => line.includes('可用类别'))).toBe(true);
    });

    test('应将位置参数作为目标目录', () => {
      // Act
      cli.main(['--all', tempTargetDir]);

      // Assert — output should reference the temp dir
      expect(consoleOutput.some(line => line.includes(tempTargetDir))).toBe(true);
    });
  });
});
