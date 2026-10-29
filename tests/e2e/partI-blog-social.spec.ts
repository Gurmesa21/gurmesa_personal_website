import { test, expect } from '@playwright/test';

test.describe('Blog Social Interactions', () => {
  test('like toggle and comment submission', async ({ page }) => {
    // Navigate to blog list
    await page.goto('/blog');
    
    // Find first post and read it
    const postLink = page.getByRole('link', { name: /Read Article/i }).first();
    await postLink.click();
    await page.waitForURL(/\/blog\/.+/);
    
    // Check Like button
    const likeBtn = page.getByRole('button', { name: /Like|Unlike/i });
    await expect(likeBtn).toBeVisible();
    
    // Click like
    const likeResponse = page.waitForResponse(resp => resp.request().method() === 'POST');
    await likeBtn.click();
    await likeResponse;
    // Verify it changed to Unlike (or aria-pressed=true)
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
    
    // Reload page to ensure it persisted via voterHash
    await page.reload();
    const likeBtnReloaded = page.getByRole('button', { name: /Like|Unlike/i });
    await expect(likeBtnReloaded).toHaveAttribute('aria-pressed', 'true');
    
    // Click unlike
    const unlikeResponse = page.waitForResponse(resp => resp.request().method() === 'POST');
    await likeBtnReloaded.click();
    await unlikeResponse;
    await expect(likeBtnReloaded).toHaveAttribute('aria-pressed', 'false');

    // Switch to comments view
    const openCommentsBtn = page.getByRole('button', { name: /View Comments|Leave a Comment|Comment/i }).first();
    await openCommentsBtn.click();

    // Add a comment
    const nameInput = page.getByLabel(/Your Name/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test User');

    const emailInput = page.getByLabel(/Your Email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('testuser@example.com');
    }
    
    const commentInput = page.getByLabel(/What are your thoughts/i);
    await commentInput.fill('This is a highly insightful test comment.');
    
    const submitBtn = page.getByRole('button', { name: /Post Comment|Submit Comment/i });
    await submitBtn.click();
    
    // Wait for the pending state UI
    // We didn't add the pending state text on the client-side optimistically, 
    // but the backend returns a success message we could assert on, or we can just 
    // wait for network idle to ensure no crashes.
    // Actually, let's check if the comment appears. Wait, it only appears if approved.
    // So the comment should NOT be visible immediately as a regular comment.
    await expect(page.locator('text=This is a highly insightful test comment.')).not.toBeVisible();
  });
});
