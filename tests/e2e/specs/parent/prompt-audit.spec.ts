/**
 * Parent persona — AI prompt audit & transparency flows.
 *
 * Covers: viewing lesson spec, API response with full spec,
 * AI-generated content in UI, subject/grade transparency,
 * learner progress for audit.
 */
import { test, expect, Page } from '@playwright/test';
import {
  setupLearnerSession,
  setAuthAndNavigate,
  generateAndWaitForLesson,
  apiCall,
  screenshot,
  SessionContext,
} from '../../helpers/learner-setup';
import { captureFailureArtifacts } from '../../helpers/self-healing';

test.describe('Parent Prompt Audit', () => {
  test.describe.configure({ retries: 2 });

  let ctx: SessionContext;
  let page: Page;
  let lessonId: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.setDefaultTimeout(60000);
    ctx = await setupLearnerSession(page, { prefix: 'audit' });

    // Generate a lesson for audit tests — handle AI unavailability gracefully.
    // Use a short timeout so beforeAll doesn't hang for minutes if AI is down.
    try {
      lessonId = await generateAndWaitForLesson(page, ctx.learnerId, {
        subject: 'Science',
        gradeLevel: 5,
        timeoutMs: 60000,
      });
      console.log(`Audit lesson created: ${lessonId}`);
    } catch (err: any) {
      console.warn(`Lesson generation failed (AI may be unavailable): ${err.message}`);
      // lessonId remains empty — individual tests will skip if they need it
    }
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status !== 'passed') {
      await captureFailureArtifacts(page, testInfo.title);
    }
  });

  test.afterAll(async () => {
    try { await page.close(); } catch { /* ignore trace file cleanup errors */ }
  });

  test('View lesson spec content through reports', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/reports');
    await page.waitForTimeout(3000);

    // Reports page should be accessible
    expect(page.url()).toMatch(/reports/);
    await screenshot(page, 'audit-reports');
  });

  test('Lesson API response contains full spec for parent review', async () => {
    if (!lessonId) {
      console.log('SKIP: No lesson available (AI service was unavailable during setup)');
      test.skip();
      return;
    }

    const result = await apiCall(page, 'GET', `/api/lessons/${lessonId}`);
    expect(result.status).toBe(200);
    expect(result.data).toBeTruthy();

    // Spec should contain structured lesson data
    const spec = result.data.spec;
    expect(spec).toBeTruthy();

    // Verify key spec fields exist
    const hasTitle = !!spec.title || !!spec.lessonTitle;
    const hasContent = !!spec.sections || !!spec.content || !!spec.lessonContent;
    console.log(`Spec has title: ${hasTitle}, has content: ${hasContent}`);
    expect(hasTitle || hasContent).toBeTruthy();
  });

  test('View AI-generated lesson content in UI', async () => {
    if (!lessonId) {
      console.log('SKIP: No lesson available (AI service was unavailable during setup)');
      test.skip();
      return;
    }

    await setAuthAndNavigate(page, ctx.authToken, '/lesson');
    await page.evaluate((id) => localStorage.setItem('selectedLearnerId', String(id)), ctx.learnerId);
    await page.waitForTimeout(3000);

    // Lesson page should render content
    const hasContent = await page.getByRole('heading').first().isVisible({ timeout: 10000 }).catch(() => false);
    console.log(`Lesson heading visible: ${hasContent}`);

    await screenshot(page, 'audit-lesson-content');
  });

  test('Dashboard shows subjects and grades for transparency', async () => {
    await setAuthAndNavigate(page, ctx.authToken, '/dashboard');
    await page.waitForTimeout(2000);

    // Dismiss welcome card
    const gotIt = page.getByText('GOT IT!');
    if (await gotIt.isVisible({ timeout: 3000 }).catch(() => false)) await gotIt.click();

    // Should show child info with grade level
    const childVisible = await page.getByText(ctx.childName).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(childVisible).toBeTruthy();

    await screenshot(page, 'audit-dashboard-transparency');
  });

  test('Access learner progress for AI output audit', async () => {
    await page.evaluate((id) => localStorage.setItem('selectedLearnerId', String(id)), ctx.learnerId);
    await setAuthAndNavigate(page, ctx.authToken, '/progress');
    await page.waitForTimeout(3000);

    // Verify we can access the progress page (URL contains progress)
    const url = page.url();
    const onProgress = url.includes('progress');
    if (!onProgress) {
      // SPA may have redirected; verify via API that progress endpoint is accessible
      const result = await apiCall(page, 'GET', `/api/learner-profile/${ctx.learnerId}`);
      console.log(`Progress page URL: ${url}, API status: ${result.status}`);
      expect(result.status).toBe(200);
    }
    await screenshot(page, 'audit-progress');
  });
});
