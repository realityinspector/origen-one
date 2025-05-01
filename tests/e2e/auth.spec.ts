import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/');
    
    // Check that the login form is displayed
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[placeholder="Username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
  });
  
  test('should show error message with invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill in invalid credentials
    await page.fill('input[placeholder="Username"]', 'invaliduser');
    await page.fill('input[placeholder="Password"]', 'invalidpassword');
    
    // Submit the form
    await page.click('button:has-text("Sign In")');
    
    // Check that error message is displayed
    await expect(page.locator('text=Invalid username or password')).toBeVisible();
  });
});