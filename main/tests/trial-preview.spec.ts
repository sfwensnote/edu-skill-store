import { test, expect } from '@playwright/test';
import { initialMine } from '../src/data/platform';

test('教师从试用记录和报告打开学生视角 Demo，可发送示例并返回来源页', async ({ page }) => {
  const assistant = { ...initialMine[0], id: 'trial-preview-fixture', status: 'TRIAL' as const,
    isPublic: false, activity: '一元一次方程练习' };
  await page.addInitScript((seed) => {
    localStorage.setItem('teaching-assistant.frontend-demo.v2', JSON.stringify([seed]));
  }, assistant);
  const apiRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/')) apiRequests.push(request.url()); });

  await page.goto('/#/assistant/trial-preview-fixture/logs');
  await page.getByRole('button', { name: '打开学生端' }).click();
  await expect(page).toHaveURL(/student-preview\?from=logs$/);
  await expect(page.getByText('教师试用 · 学生视角演示')).toBeVisible();
  await expect(page.getByText(/不连接学生账号或真实模型/)).toBeVisible();
  await page.getByRole('button', { name: '我把左边的 6 移到右边，算成了 12 + 6。' }).click();
  await expect(page.getByLabel('以学生身份输入')).toHaveValue('我把左边的 6 移到右边，算成了 12 + 6。');
  await page.getByRole('button', { name: '发送学生问题' }).click();
  await expect(page.getByText(/为了消去左边的 \+6/)).toBeVisible();
  await page.getByRole('button', { name: '重新开始' }).click();
  await expect(page.getByText(/为了消去左边的 \+6/)).toHaveCount(0);
  await page.getByRole('button', { name: '返回试用记录' }).click();
  await expect(page).toHaveURL(/\/logs$/);

  await page.getByRole('button', { name: '查看试用报告' }).first().click();
  await page.getByRole('button', { name: '打开学生端' }).click();
  await expect(page).toHaveURL(/student-preview\?from=report$/);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '返回试用报告' }).click();
  await expect(page).toHaveURL(/\/report$/);
  expect(apiRequests).toEqual([]);
});
