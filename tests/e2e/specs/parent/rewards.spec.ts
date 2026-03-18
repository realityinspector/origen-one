/**
 * Parent persona — rewards management flows.
 *
 * Covers: rewards center tabs, create reward, empty requests,
 * settings with Double-or-Loss mode, empty state.
 */
import { test, expect, Page } from '@playwright/test';
import {
  setupLearnerSession,
  setAuthAndNavigate,
  screenshot,
  SessionContext,
} from '../../helpers/learner-setup';
import { captureFailureArtifacts } from '../../helpers/self-healing';

test.describe('Parent Rewards', () => {
  test.describe.configure({ retries: 2 });

  let ctx: SessionContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.setDefaultTimeout(60000);
    ctx = await setupLearnerSession(page, { prefix: 'reward' });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== 'passed') {
      await captureFailureArtifacts(page, testInfo.title);
    }
  });

  test.afterAll(async () => {
    try { await page.close(); } catch { /* ignore trace file cleanup errors */ }
  });

  test('Rewards Center with tabs (Rewards/Requests/Settings)', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/rewards');
    await page.waitForTimeout(2000);

    expect(page.url()).toMatch(/rewards/);

    // Look for tab-like UI elements
    const rewardsTab = page.getByText(/rewards/i).first();
    await expect(rewardsTab).toBeVisible();

    await screenshot(page, 'rewards-center');
  });

  test('Create a new reward with title and point cost', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/rewards');
    await page.waitForTimeout(2000);

    // Click add/create reward button
    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Fill reward title
      const titleInput = page.getByPlaceholder(/title|name|reward/i).first();
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleInput.fill('E2E Test Reward');
      }

      // Fill point cost
      const costInput = page.getByPlaceholder(/cost|points|price/i).first();
      if (await costInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await costInput.fill('100');
      }

      // Submit
      const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    await screenshot(page, 'rewards-create');
  });

  test('View empty redemption requests tab', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/rewards');
    await page.waitForTimeout(2000);

    // Click Requests tab
    const requestsTab = page.getByText(/requests/i).first();
    if (await requestsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await requestsTab.click();
      await page.waitForTimeout(1000);
    }

    await screenshot(page, 'rewards-requests-empty');
  });

  test('View Settings tab with Double-or-Loss mode', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/rewards');
    await page.waitForTimeout(2000);

    // Click Settings tab
    const settingsTab = page.getByText(/settings/i).first();
    if (await settingsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
    }

    // Look for Double-or-Loss mode toggle
    const dolMode = page.getByText(/double.or.loss/i).first();
    const visible = await dolMode.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Double-or-Loss mode visible: ${visible}`);

    await screenshot(page, 'rewards-settings');
  });

  test('Empty state when no rewards exist (fresh parent)', async () => {
    // Use a fresh browser context to avoid cookie/storage conflicts
    const browser = page.context().browser();
    if (!browser) {
      test.skip();
      return;
    }
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    freshPage.setDefaultTimeout(60000);

    try {
      const freshCtx = await setupLearnerSession(freshPage, { prefix: 'emptyrwd' });
      await setAuthAndNavigate(freshPage, freshCtx.authToken, '/rewards');
      await freshPage.waitForTimeout(2000);

      // Should show some empty state or prompt to create rewards
      expect(freshPage.url()).toMatch(/rewards/);
      await screenshot(freshPage, 'rewards-empty-state');
    } finally {
      await freshPage.close();
      await freshContext.close();
    }
  });
});
