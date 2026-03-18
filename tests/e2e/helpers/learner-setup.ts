/**
 * Shared setup helpers for learner persona E2E tests.
 *
 * Provides registration, child creation, lesson generation, and API utilities
 * so each spec file stays focused on its persona journey.
 *
 * Supports two call patterns:
 *   - setupLearnerSession(page, 'prefix')   -- simple string prefix
 *   - setupLearnerSession(page, { prefix, childGrade }) -- options object
 */
import { Page, expect } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/e2e/screenshots/workflows';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface SessionContext {
  parent: TestUser;
  authToken: string;
  learnerId: number;
  childName: string;
}

// Keep backward compat
export type SetupResult = SessionContext;

/**
 * Generate unique test credentials.
 * Exported as both createTestUser and generateTestUser for backward compat.
 */
export function createTestUser(prefix: string): TestUser {
  const ts = Date.now();
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPassword123!',
    name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User`,
  };
}

/**
 * Register a parent via API, return auth token.
 */
export async function registerParent(page: Page, user: TestUser): Promise<string> {
  const result = await page.evaluate(async (userData) => {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: 'PARENT' }),
    });
    const data = await res.json();
    return { token: data.token, status: res.status };
  }, user);

  if (!result.token) throw new Error(`Registration failed: ${JSON.stringify(result)}`);
  return result.token;
}

/**
 * Login via API, return auth token.
 */
export async function loginParent(page: Page, user: TestUser): Promise<string> {
  const result = await page.evaluate(async (creds) => {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    const data = await res.json();
    return { token: data.token, status: res.status };
  }, { username: user.username, password: user.password });

  if (!result.token) throw new Error(`Login failed: ${JSON.stringify(result)}`);
  return result.token;
}

/**
 * Full session setup: register parent, login via UI, create child.
 *
 * Overload 1: setupLearnerSession(page, 'prefix') -- string prefix
 * Overload 2: setupLearnerSession(page, { prefix, childGrade }) -- options object
 */
export async function setupLearnerSession(
  page: Page,
  optionsOrPrefix?: string | { prefix?: string; childGrade?: number }
): Promise<SessionContext> {
  const prefix = typeof optionsOrPrefix === 'string'
    ? optionsOrPrefix
    : optionsOrPrefix?.prefix || 'e2etest';
  const childGrade = typeof optionsOrPrefix === 'object'
    ? optionsOrPrefix?.childGrade || 5
    : 5;
  const ts = Date.now();
  const childName = `Child_${prefix}_${ts}`;

  const parent = createTestUser(prefix);

  // Navigate to auth page and wait for it to fully render
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  // Wait for auth initialization to complete (SPA may show blank page initially)
  await page.waitForFunction(() => {
    return !document.body.textContent?.includes('Initializing authentication');
  }, { timeout: 15000 }).catch(() => {});
  await dismissModal(page);

  // Wait for the auth form to render (username input is the signal)
  await page.locator('input[placeholder="Enter your username"]')
    .waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => {});

  // Register via API
  const authToken = await registerParent(page, parent);

  // Set token in localStorage
  await page.evaluate((t) => localStorage.setItem('AUTH_TOKEN', t), authToken);

  // Login through UI to establish proper SPA auth state
  const loginTab = page.getByText('Login', { exact: true }).first();
  if (await loginTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginTab.click();
    await page.waitForTimeout(500);
  }
  await page.locator('input[placeholder="Enter your username"]').fill(parent.username);
  await page.locator('input[placeholder="Enter your password"]').fill(parent.password);

  const disclaimer = page.getByText(/I confirm I am at least 18 years old/);
  if (await disclaimer.isVisible({ timeout: 2000 }).catch(() => false)) {
    await disclaimer.click();
  }

  await page.getByText('Login', { exact: true }).last().click();
  await page.waitForURL(/\/(dashboard|learner)/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Create child via API
  const childResult = await apiCall(page, 'POST', '/api/learners', {
    name: childName,
    gradeLevel: childGrade,
  });

  const learnerId = childResult.data?.id;
  if (!learnerId) throw new Error(`Failed to create child: ${JSON.stringify(childResult)}`);

  // Store learnerId in localStorage for specs that read it
  await page.evaluate((id) => localStorage.setItem('selectedLearnerId', String(id)), learnerId);

  // Reload the dashboard so the SPA picks up the newly-created child
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  return { parent, authToken, learnerId, childName };
}

/**
 * Generate a lesson and wait for it to be ready (poll API).
 *
 * Overload 1: generateAndWaitForLesson(page) -- uses learnerId from localStorage
 * Overload 2: generateAndWaitForLesson(page, 'subject') -- string subject
 * Overload 3: generateAndWaitForLesson(page, learnerId, options) -- full options
 */
export async function generateAndWaitForLesson(
  page: Page,
  learnerIdOrSubject?: number | string,
  options?: { subject?: string; gradeLevel?: number; waitForImages?: boolean; timeoutMs?: number }
): Promise<string> {
  let learnerId: number;
  let subject: string;
  let gradeLevel: number;
  let waitForImages: boolean;
  let timeoutMs: number;

  if (typeof learnerIdOrSubject === 'string') {
    subject = learnerIdOrSubject;
    gradeLevel = 5;
    waitForImages = false;
    timeoutMs = 120000;
    learnerId = await page.evaluate(() => Number(localStorage.getItem('selectedLearnerId')));
  } else if (typeof learnerIdOrSubject === 'number') {
    learnerId = learnerIdOrSubject;
    subject = options?.subject || 'Science';
    gradeLevel = options?.gradeLevel || 5;
    waitForImages = options?.waitForImages ?? false;
    timeoutMs = options?.timeoutMs || 120000;
  } else {
    learnerId = await page.evaluate(() => Number(localStorage.getItem('selectedLearnerId')));
    subject = 'Science';
    gradeLevel = 5;
    waitForImages = false;
    timeoutMs = 120000;
  }

  // Retry with exponential backoff — lesson creation can be slow due to AI generation
  const maxRetries = 5;
  let lastResult: any = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Don't retry on billing/auth errors — they won't resolve with retries
      if (lastResult?.status === 402 || lastResult?.status === 401 || lastResult?.status === 403) {
        console.log(`Lesson create failed with ${lastResult.status} (non-retryable): ${JSON.stringify(lastResult.data).slice(0, 200)}`);
        break;
      }
      const delay = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
      console.log(`Lesson create attempt ${attempt + 1}/${maxRetries} -- waiting ${delay}ms before retry`);
      await page.waitForTimeout(delay);
    }
    lastResult = await apiCall(page, 'POST', '/api/lessons/create', {
      learnerId,
      subject,
      gradeLevel,
    });
    if (lastResult.status === 200 || lastResult.status === 201) break;
    console.log(`Lesson create attempt ${attempt + 1} failed: status=${lastResult.status}, data=${JSON.stringify(lastResult.data).slice(0, 200)}`);
  }

  const createResult = lastResult;
  if (createResult.status !== 200 && createResult.status !== 201) {
    throw new Error(`Failed to create lesson after retries: status=${createResult.status}, ${JSON.stringify(createResult.data).slice(0, 300)}`);
  }

  const lessonId = createResult.data.id;

  if (waitForImages) {
    const pollInterval = 5000;
    const maxPolls = Math.ceil(timeoutMs / pollInterval);
    for (let i = 0; i < maxPolls; i++) {
      await page.waitForTimeout(pollInterval);
      const lessonResult = await apiCall(page, 'GET', `/api/lessons/${lessonId}`);
      if (lessonResult.status === 200 && lessonResult.data?.spec) {
        const images = lessonResult.data.spec.images || [];
        const realImages = images.filter((img: any) => img.svgData || img.base64Data || img.path);
        if (realImages.length > 0) break;
      }
    }
  }

  return lessonId;
}

/**
 * Create a reward goal as the parent.
 */
export async function createRewardGoal(
  page: Page,
  title: string,
  pointCost: number
): Promise<string | null> {
  const learnerId = await page.evaluate(() =>
    localStorage.getItem('selectedLearnerId')
  );

  const result = await apiCall(page, 'POST', '/api/rewards', {
    title,
    tokenCost: pointCost,
    learnerId: Number(learnerId),
  });

  if (result.status === 200 || result.status === 201) {
    return result.data?.id || result.data?.rewardId || null;
  }

  console.log(`createRewardGoal failed: ${JSON.stringify(result)}`);
  return null;
}

/**
 * Complete one lesson by generating it and submitting quiz answers.
 *
 * Overload 1: completeOneLesson(page) -- uses localStorage state
 * Overload 2: completeOneLesson(page, ctx, options) -- explicit context
 */
export async function completeOneLesson(
  page: Page,
  ctxOrSubject?: SessionContext | string,
  options?: { subject?: string }
): Promise<{ lessonId: string; score?: string }> {
  let subject: string;
  let learnerId: number;

  if (ctxOrSubject && typeof ctxOrSubject === 'object' && 'authToken' in ctxOrSubject) {
    subject = options?.subject || 'Science';
    learnerId = ctxOrSubject.learnerId;
  } else {
    subject = typeof ctxOrSubject === 'string' ? ctxOrSubject : 'Science';
    learnerId = await page.evaluate(() => Number(localStorage.getItem('selectedLearnerId')));
  }

  const lessonId = await generateAndWaitForLesson(page, learnerId, { subject });

  // Submit quiz via API
  const lessonResult = await apiCall(page, 'GET', `/api/lessons/${lessonId}`);
  const questions = lessonResult.data?.spec?.questions || [];

  const answers = questions.map((q: any, i: number) => ({
    questionIndex: i,
    selectedIndex: q.correctIndex ?? 0,
  }));

  const quizResult = await apiCall(page, 'POST', `/api/lessons/${lessonId}/answer`, {
    answers,
    learnerId,
  });

  const score = quizResult.data?.score || undefined;

  return { lessonId, score };
}

/**
 * Dismiss the cookie/info modal if present.
 */
export async function dismissModal(page: Page): Promise<void> {
  const gotIt = page.getByText('Got it, thanks!');
  if (await gotIt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await gotIt.click();
  }
}

/**
 * Dismiss the dashboard welcome card if present.
 */
export async function dismissDashboardWelcome(page: Page): Promise<void> {
  const gotItDash = page.getByText('GOT IT!');
  if (await gotItDash.isVisible({ timeout: 3000 }).catch(() => false)) {
    await gotItDash.click();
  }
}

/**
 * Navigate within the SPA without full page reload (preserves auth state).
 *
 * NOTE: pushState/popstate does not trigger routing in the Sunschool SPA.
 * Use page.goto() for reliable navigation instead.
 */
export async function spaNavigate(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

/**
 * Enter the learner context from the parent dashboard.
 *
 * After setupLearnerSession, the page shows the parent dashboard with a
 * "START LEARNING AS [child]" button. This helper clicks it to enter the
 * learner home view, or falls back to page.goto('/learner').
 */
export async function enterLearnerContext(page: Page, _childName?: string): Promise<void> {
  // Reload to pick up the child card
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click "START LEARNING AS [child]" button
  const startBtn = page.getByText(/START LEARNING AS/i).first();
  const startVisible = await startBtn.isVisible({ timeout: 10000 }).catch(() => false);
  if (startVisible) {
    await startBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  } else {
    // Fallback: navigate directly to /learner
    await page.goto('/learner');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }
}

/**
 * Set auth token in localStorage and navigate.
 *
 * Always uses page.goto() for reliable navigation.
 */
export async function setAuthAndNavigate(page: Page, token: string, path: string): Promise<void> {
  const currentUrl = page.url();
  if (!currentUrl.includes('sunschool.xyz') && !currentUrl.includes('localhost') && !currentUrl.includes('railway.app')) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  }
  await page.evaluate((t) => localStorage.setItem('AUTH_TOKEN', t), token);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    return !document.body.textContent?.includes('Initializing authentication');
  }, { timeout: 15000 }).catch(() => {});
}

/**
 * Authenticated API call from browser context.
 */
export async function apiCall(page: Page, method: string, url: string, body?: any): Promise<any> {
  try {
    return await page.evaluate(async ({ method, url, body }) => {
      const token = localStorage.getItem('AUTH_TOKEN') || '';
      const controller = new AbortController();
      const isLessonCreate = url.includes('/api/lessons/create');
      const timeoutId = setTimeout(() => controller.abort(), isLessonCreate ? 120000 : 15000);
      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        clearTimeout(timeoutId);
        const text = await res.text();
        try { return { status: res.status, data: JSON.parse(text) }; }
        catch { return { status: res.status, data: text }; }
      } catch (err: any) {
        clearTimeout(timeoutId);
        return { status: 0, data: `fetch error: ${err.message}` };
      }
    }, { method, url, body });
  } catch (err: any) {
    return { status: 0, data: `evaluate error: ${err.message}` };
  }
}

/**
 * Take a labeled screenshot.
 */
export async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: false });
}

/**
 * Wait for loading indicators to disappear.
 */
export async function waitForLessonLoaded(page: Page): Promise<void> {
  const loadingIndicator = page.getByText(/loading|generating/i).first();
  if (await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 120000 }).catch(() => {});
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Poll for visible text on page with optional reload between polls.
 */
export async function pollForVisibleText(
  page: Page,
  textPattern: RegExp | string,
  options: { timeout?: number; reloadBetweenPolls?: boolean } = {}
): Promise<boolean> {
  const { timeout = 300_000, reloadBetweenPolls = true } = options;
  let found = false;

  await expect
    .poll(
      async () => {
        const locator = page.getByText(textPattern);
        const visible = await locator.first().isVisible({ timeout: 2_000 }).catch(() => false);
        if (visible) {
          found = true;
          return true;
        }
        if (reloadBetweenPolls) {
          await page.reload();
          await page.waitForLoadState('networkidle');
        }
        return false;
      },
      { timeout, intervals: [5_000] }
    )
    .toBe(true)
    .catch(() => {});

  return found;
}

// -- Backward-compatible aliases --
/** Alias for createTestUser */
export const generateTestUser = createTestUser;
/** Alias for registerParent */
export const registerParentViaAPI = registerParent;
/** Alias for loginParent */
export const loginViaAPI = loginParent;

/**
 * Create a child learner via API and return the learner ID.
 */
export async function createChildViaAPI(
  page: Page,
  childName: string,
  grade: number = 3
): Promise<number> {
  const result = await apiCall(page, 'POST', '/api/learners', {
    name: childName,
    gradeLevel: grade,
  });
  if (!result.data?.id) {
    throw new Error(`Failed to create child: ${JSON.stringify(result)}`);
  }
  return result.data.id;
}
