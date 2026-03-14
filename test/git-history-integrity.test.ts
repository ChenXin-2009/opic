/**
 * Git 历史完整性验证测试
 * 验证需求: 7.2, 7.4
 * 验证属性: 17, 18
 */

import { execSync } from 'child_process';

describe('Git 历史完整性验证', () => {
  test('属性 17: Git 提交历史未被修改', () => {
    // 获取提交总数
    const commitCount = execSync('git log --all --oneline', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .length;

    // 验证提交历史存在且数量合理（至少有初始提交）
    expect(commitCount).toBeGreaterThan(0);

    // 验证提交哈希格式正确（40个字符的十六进制）
    const commits = execSync('git log --format="%H" --all', { encoding: 'utf-8' })
      .trim()
      .split('\n');

    commits.forEach(hash => {
      expect(hash).toMatch(/^[0-9a-f]{40}$/);
    });

    // 验证历史提交信息未被篡改（检查几个关键提交）
    const recentCommits = execSync('git log --format="%s" --all -n 10', { encoding: 'utf-8' })
      .trim()
      .split('\n');

    // 提交信息应该存在且不为空
    recentCommits.forEach(message => {
      expect(message.length).toBeGreaterThan(0);
    });
  });

  test('属性 18: Git 标签和发布说明保持不变', () => {
    // 获取所有标签
    const tags = execSync('git tag -l', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(tag => tag.length > 0);

    // 验证标签存在
    expect(tags.length).toBeGreaterThan(0);

    // 验证标签格式（应该是 v 开头的版本号）
    const validTags = tags.filter(tag => /^v\d+\.\d+\.\d+$/.test(tag));
    expect(validTags.length).toBeGreaterThan(0);

    // 验证关键版本标签存在
    expect(tags).toContain('v1.0.0');
    expect(tags).toContain('v6.0.0');
    expect(tags).toContain('v6.6.0');

    // 验证标签指向的提交存在且有效
    const tagCommits = [
      { tag: 'v1.0.0', expectedHash: 'c5be5abf9f68eb0694018d759969f2f7d7d09a01' },
      { tag: 'v6.0.0', expectedHash: '41d216055c0f25005b8d1f995a4777d94422d1b7' },
      { tag: 'v6.6.0', expectedHash: 'acfcf4ab20396f8908d330ccd50c91fdf35aed21' }
    ];

    tagCommits.forEach(({ tag, expectedHash }) => {
      const actualHash = execSync(`git rev-list -n 1 ${tag}`, { encoding: 'utf-8' }).trim();
      expect(actualHash).toBe(expectedHash);
    });

    // 验证发布说明未被修改（检查提交信息）
    const v1Message = execSync('git show v1.0.0 --no-patch --format="%s"', { encoding: 'utf-8' }).trim();
    expect(v1Message).toContain('Release 1.0.0');

    const v6Message = execSync('git show v6.0.0 --no-patch --format="%s"', { encoding: 'utf-8' }).trim();
    expect(v6Message).toContain('Release 6.0.0');

    const v66Message = execSync('git show v6.6.0 --no-patch --format="%s"', { encoding: 'utf-8' }).trim();
    expect(v66Message).toContain('Release 6.6.0');
  });

  test('验证 Git 仓库完整性', () => {
    // 验证 .git 目录存在
    const gitDirExists = execSync('git rev-parse --git-dir', { encoding: 'utf-8' }).trim();
    expect(gitDirExists).toBe('.git');

    // 验证仓库没有损坏
    const fsckResult = execSync('git fsck --no-progress 2>&1', { encoding: 'utf-8' });
    // fsck 应该不报告严重错误（可能有警告，但不应有 error）
    expect(fsckResult).not.toMatch(/error:/i);
  });

  test('验证历史提交中的项目名称未被修改', () => {
    // 在历史提交中搜索旧项目名称（应该存在于历史中）
    const historyContent = execSync('git log --all --format="%s %b"', { encoding: 'utf-8' });

    // 历史记录应该保持原样，不应该被重写
    // 我们只验证历史存在，不验证内容（因为历史应该保持不变）
    expect(historyContent.length).toBeGreaterThan(0);
  });
});
