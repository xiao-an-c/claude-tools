const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Mock console.log to capture output
let consoleOutput = [];
const originalLog = console.log;

beforeEach(() => {
  consoleOutput = [];
  console.log = jest.fn((...args) => {
    consoleOutput.push(args.join(' '));
  });
});

afterEach(() => {
  console.log = originalLog;
});

describe('CLI Module', () => {
  let cli;

  beforeEach(() => {
    cli = require('../bin/cli.js');
  });

  describe('getPackageDir', () => {
    test('should return the package directory path', () => {
      const result = cli.getPackageDir();
      expect(result).toBe(path.dirname(path.dirname(__filename)));
    });
  });

  describe('getCategoryDescription', () => {
    test('should return correct description for git category', () => {
      const result = cli.getCategoryDescription('git');
      expect(result).toBe('Git 工作流命令 (feat/fix/hotfix/release)');
    });

    test('should return default description for unknown category', () => {
      const result = cli.getCategoryDescription('unknown');
      expect(result).toBe('unknown 命令');
    });
  });

  describe('loadCategories', () => {
    test('should load categories from commands directory', () => {
      const categories = cli.loadCategories();

      expect(categories).toHaveProperty('git');
      expect(categories.git).toHaveProperty('description');
      expect(categories.git).toHaveProperty('commands');
      expect(Array.isArray(categories.git.commands)).toBe(true);
      expect(categories.git.commands.length).toBeGreaterThan(0);
    });

    test('should only include .md files', () => {
      const categories = cli.loadCategories();
      // All commands should not have .md extension in the name
      categories.git.commands.forEach(cmd => {
        expect(cmd).not.toMatch(/\.md$/);
      });
    });

    test('should return empty object when commands directory does not exist', () => {
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

    test('should return failed when source directory does not exist', () => {
      const result = cli.installCommands(['cmd1'], 'nonexistent-category', tempTargetDir);

      expect(result.installed).toBe(0);
      expect(result.failed).toBe(1);
    });

    test('should copy files to target directory', () => {
      const result = cli.installCommands(['commit'], 'git', tempTargetDir);

      expect(result.installed).toBe(1);
      expect(result.failed.length).toBe(0);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('should create target directory if it does not exist', () => {
      const targetPath = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetPath)).toBe(false);

      cli.installCommands(['commit'], 'git', tempTargetDir);

      expect(fs.existsSync(targetPath)).toBe(true);
    });

    test('should report failed for nonexistent command files', () => {
      const result = cli.installCommands(['commit', 'nonexistent'], 'git', tempTargetDir);

      expect(result.installed).toBe(1);
      expect(result.failed).toContain('nonexistent');
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

    test('should install commands from all categories', () => {
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

    test('should install commands from specified category', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      cli.installCategory('git', tempTargetDir);

      const gitPath = path.join(tempTargetDir, '.claude/commands/git');
      expect(fs.existsSync(gitPath)).toBe(true);

      mockExit.mockRestore();
    });

    test('should return early for invalid category', () => {
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

    test('should parse git:commit format', () => {
      cli.installSpecific('git:commit', tempTargetDir);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('should default to git category for command without prefix', () => {
      cli.installSpecific('commit', tempTargetDir);

      const targetFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      expect(fs.existsSync(targetFile)).toBe(true);
    });

    test('should handle multiple commands', () => {
      cli.installSpecific('commit,sync', tempTargetDir);

      const commitFile = path.join(tempTargetDir, '.claude/commands/git/commit.md');
      const syncFile = path.join(tempTargetDir, '.claude/commands/git/sync.md');

      expect(fs.existsSync(commitFile)).toBe(true);
      expect(fs.existsSync(syncFile)).toBe(true);
    });

    test('should skip unknown categories', () => {
      cli.installSpecific('unknown:cmd', tempTargetDir);

      expect(consoleOutput.some(line => line.includes('跳过未知类别'))).toBe(true);
    });
  });

  describe('showHelp', () => {
    test('should display help information', () => {
      cli.showHelp();

      expect(consoleOutput.some(line => line.includes('Claude Tools'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('--all'))).toBe(true);
      expect(consoleOutput.some(line => line.includes('--help'))).toBe(true);
    });
  });

  describe('listCommands', () => {
    test('should list all available commands', () => {
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

    test('should display category options', () => {
      const mockRl = {
        question: jest.fn((prompt, callback) => callback('1')),
        close: jest.fn()
      };

jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, () => {});

      expect(consoleOutput.some(line => line.includes('可用类别'))).toBe(true);
    });

    test('should call callback with selected category', (done) => {
      const mockRl = {
        question: jest.fn((prompt, callback) => callback('1')),
        close: jest.fn()
      };

jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, (selectedCategories) => {
        expect(selectedCategories).toEqual(['git']);
        done();
      });
    });

    test('should handle invalid selection', () => {
      const mockRl = {
        question: jest.fn((prompt, callback) => callback('999')),
        close: jest.fn()
      };

jest.spyOn(readline, 'createInterface').mockReturnValue(mockRl);

      cli.interactiveSelect(tempTargetDir, () => {});

      expect(consoleOutput.some(line => line.includes('无效选择'))).toBe(true);
    });
  });
});
